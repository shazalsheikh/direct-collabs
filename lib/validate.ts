import { normalizePkPhone, isEmail, cleanHandle } from "./format";
import { PLANS, BUMP, PAY_IN_2, orderTotal, type PlanId } from "./offer.config";
import type { PayIn2 } from "./orders";

export type Details = {
  plan: PlanId;
  bump: boolean;
  payIn2: boolean;
  name: string;
  whatsapp: string; // normalized 92...
  email: string;
  instagram: string;
};

export type FieldErrors = Partial<Record<keyof Details | "receipt" | "senderName", string>>;

export function parseDetails(raw: Record<string, unknown>, opts: { requireAll: boolean }): { ok: true; d: Details } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const plan = raw.plan === "basic" ? "basic" : "pro";
  const bump = raw.bump === true || raw.bump === "1" || raw.bump === "true";
  const payIn2 = PAY_IN_2.enabled && plan === PAY_IN_2.plan && (raw.payIn2 === true || raw.payIn2 === "1" || raw.payIn2 === "true");

  const name = String(raw.name ?? "").trim();
  if (name.length < 2) errors.name = "Your name, at least 2 letters.";

  const whatsapp = normalizePkPhone(String(raw.whatsapp ?? ""));
  if (!whatsapp) errors.whatsapp = "Pakistani number like 03XX XXXXXXX.";

  const emailRaw = String(raw.email ?? "").trim();
  if (opts.requireAll && !isEmail(emailRaw)) errors.email = "A real email. Your access link goes here.";

  const instagram = cleanHandle(String(raw.instagram ?? ""));
  if (opts.requireAll && instagram.length < 2) errors.instagram = "Your Instagram handle.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, d: { plan, bump, payIn2, name, whatsapp: whatsapp as string, email: emailRaw, instagram } };
}

export function amountsFor(d: Pick<Details, "plan" | "bump" | "payIn2">) {
  const total = orderTotal(d.plan, d.bump);
  const dueNow = d.payIn2 ? PAY_IN_2.first + (d.bump ? BUMP.price : 0) : total;
  return { total, dueNow };
}

export function payIn2Record(d: Pick<Details, "plan" | "bump" | "payIn2">): PayIn2 | null {
  if (!d.payIn2) return null;
  const due = new Date(Date.now() + PAY_IN_2.daysBetween * 864e5).toISOString();
  return { enabled: true, first: PAY_IN_2.first, second: PAY_IN_2.second, due_at: due, first_paid: false };
}

export const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export { PLANS };
