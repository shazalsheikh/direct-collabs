import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import {
  createLead,
  updateOrder,
  getOrderByRef,
  appendEvent,
  receiptHashSeen,
  sha256,
  uploadReceipt,
  invokeVerify,
  linkedContext,
  DbUnavailable,
} from "@/lib/orders";
import { parseDetails, amountsFor, payIn2Record, parseLinked, ALLOWED_RECEIPT_TYPES, MAX_RECEIPT_BYTES } from "@/lib/validate";
import { UPGRADE, PAY_IN_2 } from "@/lib/offer.config";

/**
 * POST /api/checkout/submit (multipart)
 * Validates details, hashes + uploads the receipt, appends "Submitted",
 * then kicks the verify-receipt Edge Function after the response is sent.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Bad form" }, { status: 400 });
  }
  const raw: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") raw[k] = v;

  const parsed = parseDetails(raw, { requireAll: true });
  const errors = parsed.ok ? {} : { ...parsed.errors };

  const file = form.get("receipt");
  if (!(file instanceof File) || file.size === 0) errors.receipt = "Upload your payment receipt.";
  else if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) errors.receipt = "JPG, PNG, WebP or PDF only.";
  else if (file.size > MAX_RECEIPT_BYTES) errors.receipt = "Under 5 MB please.";

  const senderName = String(raw.senderName ?? "").trim();
  if (senderName.length < 2) errors.senderName = "Name on the sending account.";

  if (!parsed.ok || Object.keys(errors).length) {
    return NextResponse.json({ error: "invalid", fields: errors }, { status: 400 });
  }
  const d = parsed.d;
  const linked = parseLinked(raw);
  const { total } = amountsFor(d, linked?.kind);
  let attr: Record<string, unknown> = {};
  try {
    attr = JSON.parse(String(raw.attribution ?? "{}"));
  } catch {}

  try {
    let parentId: string | null = null;
    if (linked) {
      const ctx = await linkedContext(linked.kind, linked.parentRef, { upgrade: UPGRADE.price, second: PAY_IN_2.second });
      if ("error" in ctx) return NextResponse.json({ error: "linked", fields: { receipt: ctx.error } }, { status: 400 });
      parentId = ctx.parent.id;
    }

    const buf = await (file as File).arrayBuffer();
    const hash = sha256(buf);
    if (await receiptHashSeen(hash)) {
      return NextResponse.json({ error: "duplicate", fields: { receipt: "This receipt was already uploaded. Need help? WhatsApp us." } }, { status: 409 });
    }

    const patch = {
      plan: linked ? ("pro" as const) : d.plan,
      kind: linked?.kind ?? ("purchase" as const),
      parent_order_id: parentId,
      bump: linked ? false : d.bump,
      amount: total,
      name: d.name,
      whatsapp: d.whatsapp,
      email: d.email,
      instagram: d.instagram,
      utm: (attr.utm as Record<string, string>) ?? {},
      fbp: (attr.fbp as string) ?? null,
      fbc: (attr.fbc as string) ?? null,
      fbclid: (attr.fbclid as string) ?? null,
      pay_in_2: linked ? null : payIn2Record(d),
      event_id: randomUUID(),
    };

    let ref = typeof raw.ref === "string" ? raw.ref : "";
    const existing = ref ? await getOrderByRef(ref) : null;
    if (existing && existing.status !== "Lead") {
      return NextResponse.json({ error: "locked", fields: { receipt: "This order already has a receipt. Check your thank-you page." } }, { status: 409 });
    }
    if (existing) {
      await updateOrder(ref, patch);
    } else {
      const created = await createLead(patch);
      ref = created.ref;
    }
    const order = await getOrderByRef(ref);
    if (!order) throw new Error("order vanished");

    const path = await uploadReceipt(ref, hash, file as File);
    await appendEvent(order.id, { status: "Submitted", receipt_path: path, receipt_hash: hash, reason: `Sender: ${senderName}` });

    after(() => invokeVerify(ref));
    return NextResponse.json({ ref });
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
