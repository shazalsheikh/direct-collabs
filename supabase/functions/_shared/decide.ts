/**
 * Pure decision logic for receipt verification. No I/O, so it is unit-testable
 * and identical in the Edge Function and anywhere else.
 */

export type Ocr = {
  amount: number | null;
  currency: string | null;
  receiver_account: string | null;
  receiver_name: string | null;
  sender_name: string | null;
  txn_id: string | null;
  date: string | null; // ISO or null
  status: "success" | "pending" | "failed" | "unknown";
  confidence: number; // 0..1
  notes: string | null;
};

export type DecisionInput = {
  ocr: Ocr;
  expectedAmounts: number[]; // full total, or accepted partials
  acceptedReceivers: string[]; // normalized
  txnSeen: boolean;
  hashSeenElsewhere: boolean;
  now: Date;
  maxAgeHours: number;
  toleranceRs: number;
};

export type Decision = { approve: true; matchedAmount: number } | { approve: false; reason: string };

export function normalizeAccount(s: string) {
  return s.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function decide(i: DecisionInput): Decision {
  const o = i.ocr;
  if (o.confidence < 0.5) return { approve: false, reason: `Unreadable receipt (confidence ${o.confidence.toFixed(2)})` };
  if (o.status === "failed") return { approve: false, reason: "Receipt shows a failed transaction" };
  if (o.status === "pending") return { approve: false, reason: "Receipt shows a pending transaction" };
  if (o.amount == null) return { approve: false, reason: "Could not read the amount" };

  const matched = i.expectedAmounts.find((a) => Math.abs(a - (o.amount as number)) <= i.toleranceRs);
  if (matched == null) {
    return { approve: false, reason: `Amount mismatch: receipt Rs ${o.amount}, expected Rs ${i.expectedAmounts.join(" or ")}` };
  }

  const recv = o.receiver_account ? normalizeAccount(o.receiver_account) : "";
  const receiverOk = recv.length >= 6 && i.acceptedReceivers.some((a) => a.endsWith(recv.slice(-8)) || recv.endsWith(a.slice(-8)) || a === recv);
  if (!receiverOk) return { approve: false, reason: `Receiver does not match our accounts (read: ${o.receiver_account ?? "none"})` };

  if (!o.txn_id) return { approve: false, reason: "No transaction id on the receipt" };
  if (i.txnSeen) return { approve: false, reason: `Duplicate transaction id ${o.txn_id}` };
  if (i.hashSeenElsewhere) return { approve: false, reason: "Duplicate receipt file" };

  if (!o.date) return { approve: false, reason: "Could not read the date" };
  const t = Date.parse(o.date);
  if (Number.isNaN(t)) return { approve: false, reason: `Unparseable date ${o.date}` };
  const ageH = (i.now.getTime() - t) / 36e5;
  if (ageH > i.maxAgeHours) return { approve: false, reason: `Receipt older than ${i.maxAgeHours}h (${Math.round(ageH)}h)` };
  if (ageH < -24) return { approve: false, reason: `Receipt dated in the future (${o.date})` };

  return { approve: true, matchedAmount: matched };
}

export const OCR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["amount", "currency", "receiver_account", "receiver_name", "sender_name", "txn_id", "date", "status", "confidence", "notes"],
  properties: {
    amount: { type: ["number", "null"], description: "Amount transferred, numeric, no currency symbol" },
    currency: { type: ["string", "null"] },
    receiver_account: { type: ["string", "null"], description: "Receiver account number, IBAN or wallet number exactly as printed" },
    receiver_name: { type: ["string", "null"] },
    sender_name: { type: ["string", "null"] },
    txn_id: { type: ["string", "null"], description: "Transaction / reference / TID exactly as printed" },
    date: { type: ["string", "null"], description: "Transaction date and time as ISO 8601 with timezone +05:00 when the receipt has it" },
    status: { type: "string", enum: ["success", "pending", "failed", "unknown"] },
    confidence: { type: "number", description: "0 to 1, how confident you are this is a genuine, legible payment receipt and the fields are right" },
    notes: { type: ["string", "null"], description: "Anything odd: edited pixels, mismatched fonts, cropped fields" },
  },
} as const;
