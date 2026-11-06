import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { db } from "./db";
import { makeOrderRef } from "./bank.config";
import type { PlanId } from "./offer.config";

export type OrderStatus = "Lead" | "Submitted" | "Approved" | "Needs review" | "Rejected";

export type Order = {
  id: string;
  ref: string;
  plan: PlanId;
  bump: boolean;
  amount: number;
  name: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  utm: Record<string, string>;
  fbp: string | null;
  fbc: string | null;
  fbclid: string | null;
  event_id: string | null;
  parent_order_id: string | null;
  pay_in_2: PayIn2 | null;
  access_token: string | null;
  created_at: string;
};

export type PayIn2 = {
  enabled: boolean;
  first: number;
  second: number;
  due_at: string;
  first_paid: boolean;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  status: OrderStatus;
  method: "auto" | "manual" | null;
  reason: string | null;
  ocr: Record<string, unknown> | null;
  receipt_path: string | null;
  receipt_hash: string | null;
  txn_id: string | null;
  created_at: string;
};

export type OrderCurrent = Order & {
  status: OrderStatus;
  method: "auto" | "manual" | null;
  reason: string | null;
  receipt_path: string | null;
  receipt_hash: string | null;
  txn_id: string | null;
  ocr: Record<string, unknown> | null;
  status_at: string;
};

export class DbUnavailable extends Error {
  constructor() {
    super("Database not configured");
  }
}

function must() {
  const c = db();
  if (!c) throw new DbUnavailable();
  return c;
}

/** Unique DC-XXXX. Retries on collision. */
async function uniqueRef() {
  const c = must();
  for (let i = 0; i < 6; i++) {
    const ref = makeOrderRef();
    const { data } = await c.from("orders").select("id").eq("ref", ref).maybeSingle();
    if (!data) return ref;
  }
  throw new Error("Could not allocate order ref");
}

export type LeadInput = {
  plan: PlanId;
  bump: boolean;
  amount: number;
  name: string;
  whatsapp: string;
  email?: string | null;
  instagram?: string | null;
  utm?: Record<string, string>;
  fbp?: string | null;
  fbc?: string | null;
  fbclid?: string | null;
  pay_in_2?: PayIn2 | null;
  parent_order_id?: string | null;
};

/** Create the order row with a Lead event. Returns the ref. */
export async function createLead(input: LeadInput): Promise<{ id: string; ref: string }> {
  const c = must();
  const ref = await uniqueRef();
  const { data, error } = await c
    .from("orders")
    .insert({ ...input, ref, utm: input.utm ?? {} })
    .select("id, ref")
    .single();
  if (error) throw error;
  await appendEvent(data.id, { status: "Lead" });
  return data;
}

/** Update editable order fields (details, plan, bump, amount). Never touches events. */
export async function updateOrder(ref: string, patch: Partial<LeadInput> & { event_id?: string; access_token?: string }) {
  const c = must();
  const { error } = await c.from("orders").update(patch).eq("ref", ref);
  if (error) throw error;
}

export async function appendEvent(
  orderId: string,
  e: Partial<Pick<OrderEvent, "method" | "reason" | "ocr" | "receipt_path" | "receipt_hash" | "txn_id">> & { status: OrderStatus },
) {
  const c = must();
  const { error } = await c.from("order_events").insert({ order_id: orderId, ...e });
  if (error) throw error;
}

export async function getOrderByRef(ref: string): Promise<OrderCurrent | null> {
  const c = must();
  const { data, error } = await c.from("orders_current").select("*").eq("ref", ref).maybeSingle();
  if (error) throw error;
  return (data as OrderCurrent) ?? null;
}

export async function getOrderByToken(token: string): Promise<OrderCurrent | null> {
  const c = must();
  const { data, error } = await c.from("orders_current").select("*").eq("access_token", token).maybeSingle();
  if (error) throw error;
  return (data as OrderCurrent) ?? null;
}

export async function receiptHashSeen(hash: string): Promise<boolean> {
  const c = must();
  const { count } = await c.from("order_events").select("id", { count: "exact", head: true }).eq("receipt_hash", hash);
  return (count ?? 0) > 0;
}

export function sha256(buf: ArrayBuffer | Buffer) {
  return createHash("sha256").update(Buffer.from(buf as ArrayBuffer)).digest("hex");
}

export function newAccessToken() {
  return randomBytes(24).toString("base64url");
}

export async function uploadReceipt(ref: string, hash: string, file: File): Promise<string> {
  const c = must();
  const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${ref}/${hash.slice(0, 16)}.${ext}`;
  const { error } = await c.storage.from("receipts").upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return path;
}

export async function signedReceiptUrl(path: string, seconds = 600): Promise<string | null> {
  const c = must();
  const { data } = await c.storage.from("receipts").createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}

/** Fire the verify-receipt Edge Function. Never throws; failures land in Needs review via the function's own fail-safe. */
export async function invokeVerify(ref: string): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const secret = process.env.VERIFY_FUNCTION_SECRET;
  if (!url || !key) return;
  try {
    const res = await fetch(`${url}/functions/v1/verify-receipt`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        ...(secret ? { "x-verify-secret": secret } : {}),
      },
      body: JSON.stringify({ ref }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) console.error("verify-receipt", res.status, await res.text());
  } catch (err) {
    console.error("verify-receipt call failed", err);
    // Fail safe: park it for a human.
    try {
      const o = await getOrderByRef(ref);
      if (o && o.status === "Submitted") await appendEvent(o.id, { status: "Needs review", method: "auto", reason: "Verification function unreachable" });
    } catch {}
  }
}
