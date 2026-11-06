/**
 * verify-receipt (Supabase Edge Function, Deno)
 *
 * POST { ref } with Authorization: Bearer <service role key> (+ x-verify-secret).
 * Reads the latest Submitted receipt, OCRs it with a vision model, and either
 * appends "Approved" (token, email, Meta Purchase) or "Needs review" with the reason.
 *
 * Fail safe: ANY error -> "Needs review". Never auto-approve on a throw.
 * Append-only: never updates order_events.
 *
 * Secrets (supabase secrets set ...):
 *   ANTHROPIC_API_KEY, RESEND_API_KEY, RESEND_FROM, VERIFY_FUNCTION_SECRET,
 *   SITE_URL, PIXEL_ID, META_CAPI_TOKEN, WHATSAPP_NUMBER (optional)
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { BANK, acceptedReceivers } from "../_shared/bank.config.ts";
import { decide, OCR_SCHEMA, type Ocr } from "../_shared/decide.ts";
import { sendAccessEmail } from "../_shared/email.ts";
import { sendCapiEvent } from "../_shared/capi.ts";

const env = (k: string) => Deno.env.get(k) ?? undefined;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function base64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // ---- Auth ----
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("authorization") ?? "";
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) return json({ error: "unauthorized" }, 401);
  const secret = env("VERIFY_FUNCTION_SECRET");
  if (secret && req.headers.get("x-verify-secret") !== secret) return json({ error: "unauthorized" }, 401);

  let ref = "";
  try {
    ref = String((await req.json()).ref ?? "");
  } catch {
    return json({ error: "bad json" }, 400);
  }
  if (!/^DC-[A-Z0-9]{4}$/.test(ref)) return json({ error: "bad ref" }, 400);

  const db = createClient(env("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } });

  // ---- Load order (current status) ----
  const { data: order, error: oErr } = await db.from("orders_current").select("*").eq("ref", ref).maybeSingle();
  if (oErr) return json({ error: oErr.message }, 500);
  if (!order) return json({ error: "not found" }, 404);
  if (order.status !== "Submitted") return json({ error: `status is ${order.status}, expected Submitted` }, 400);

  const needsReview = async (reason: string, ocr: unknown = null) => {
    await db.from("order_events").insert({ order_id: order.id, status: "Needs review", method: "auto", reason, ocr, receipt_path: order.receipt_path, receipt_hash: order.receipt_hash });
    return json({ ref, result: "needs_review", reason });
  };

  try {
    if (!order.receipt_path) return await needsReview("No receipt on file");

    // ---- Download receipt from private bucket ----
    const { data: blob, error: dErr } = await db.storage.from("receipts").download(order.receipt_path);
    if (dErr || !blob) return await needsReview(`Could not download receipt: ${dErr?.message ?? "empty"}`);
    const mediaType = blob.type || (order.receipt_path.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
    const b64 = toBase64(await blob.arrayBuffer());

    // ---- OCR with vision ----
    const apiKey = env("ANTHROPIC_API_KEY");
    if (!apiKey) return await needsReview("OCR not configured (ANTHROPIC_API_KEY missing)");
    const client = new Anthropic({ apiKey });

    const expected = expectedAmounts(order);
    const prompt =
      `This is a payment receipt uploaded by a customer in Pakistan (bank app, Easypaisa or JazzCash). ` +
      `Extract the fields exactly as printed. Expected amount is one of: ${expected.join(", ")} PKR. ` +
      `Our receiving accounts: bank ${BANK.bank.account} (IBAN ${BANK.bank.iban}), Easypaisa ${BANK.easypaisa.number}, JazzCash ${BANK.jazzcash.number}. ` +
      `Do not guess. If a field is not visible, return null. If the image looks edited, say so in notes and lower confidence.`;

    const content: Anthropic.Messages.ContentBlockParam[] = [
      mediaType === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }
        : { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp", data: b64 } },
      { type: "text", text: prompt },
    ];

    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2048,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { format: { type: "json_schema", schema: OCR_SCHEMA } },
      messages: [{ role: "user", content }],
    });

    if (res.stop_reason === "refusal") return await needsReview("OCR declined to read the receipt");
    const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
    let ocr: Ocr;
    try {
      ocr = JSON.parse(text) as Ocr;
    } catch {
      return await needsReview("OCR returned non-JSON", { raw: text.slice(0, 2000) });
    }

    // ---- Duplicate checks ----
    const [{ count: txnCount }, { count: hashCount }] = await Promise.all([
      ocr.txn_id
        ? db.from("order_events").select("id", { count: "exact", head: true }).eq("txn_id", ocr.txn_id)
        : Promise.resolve({ count: 0 }),
      order.receipt_hash
        ? db.from("order_events").select("id", { count: "exact", head: true }).eq("receipt_hash", order.receipt_hash).neq("order_id", order.id)
        : Promise.resolve({ count: 0 }),
    ]);

    const decision = decide({
      ocr,
      expectedAmounts: expected,
      acceptedReceivers: acceptedReceivers(),
      txnSeen: (txnCount ?? 0) > 0,
      hashSeenElsewhere: (hashCount ?? 0) > 0,
      now: new Date(),
      maxAgeHours: BANK.receiptMaxAgeHours,
      toleranceRs: BANK.amountToleranceRs,
    });

    if (!decision.approve) return await needsReview(decision.reason, ocr);

    // ---- Approve ----
    const token = order.access_token ?? base64url(crypto.getRandomValues(new Uint8Array(24)));
    const patch: Record<string, unknown> = { access_token: token };
    if (order.pay_in_2?.enabled && !order.pay_in_2.first_paid) patch.pay_in_2 = { ...order.pay_in_2, first_paid: true };
    const { error: uErr } = await db.from("orders").update(patch).eq("id", order.id);
    if (uErr) return await needsReview(`Could not store access token: ${uErr.message}`, ocr);

    const { error: eErr } = await db.from("order_events").insert({
      order_id: order.id,
      status: "Approved",
      method: "auto",
      reason: `Matched Rs ${decision.matchedAmount}`,
      ocr,
      txn_id: ocr.txn_id,
      receipt_path: order.receipt_path,
      receipt_hash: order.receipt_hash,
    });
    if (eErr) return json({ error: eErr.message }, 500);

    const siteUrl = (env("SITE_URL") ?? "https://directcollabs.pk").replace(/\/$/, "");
    const accessUrl = `${siteUrl}/access/${token}`;
    const wa = env("WHATSAPP_NUMBER");

    const [email, capi] = await Promise.all([
      order.email
        ? sendAccessEmail({ apiKey: env("RESEND_API_KEY"), from: env("RESEND_FROM"), to: order.email, name: order.name ?? "", plan: order.plan === "pro" ? "Pro" : "Basic", ref, accessUrl, whatsappUrl: wa ? `https://wa.me/${wa}` : undefined })
        : Promise.resolve({ sent: false, error: "no email" }),
      sendCapiEvent({
        pixelId: env("PIXEL_ID"),
        token: env("META_CAPI_TOKEN"),
        eventId: order.event_id ?? `purchase-${order.id}`,
        value: decision.matchedAmount,
        email: order.email,
        phone: order.whatsapp,
        fbp: order.fbp,
        fbc: order.fbc,
        sourceUrl: `${siteUrl}/checkout`,
      }),
    ]);

    return json({ ref, result: "approved", email, capi: { sent: capi.sent, status: capi.status } });
  } catch (err) {
    console.error("verify-receipt error", err);
    return await needsReview(`Error: ${String(err).slice(0, 300)}`);
  }
});

/** Full total, or the pay-in-2 part that is due. */
function expectedAmounts(order: { amount: number; bump: boolean; pay_in_2: { enabled: boolean; first: number; second: number; first_paid: boolean } | null }): number[] {
  const p = order.pay_in_2;
  if (p?.enabled) {
    const bumpPart = order.amount - p.first - p.second; // bump rides on the first payment
    return p.first_paid ? [p.second] : [p.first + Math.max(0, bumpPart)];
  }
  return [order.amount];
}
