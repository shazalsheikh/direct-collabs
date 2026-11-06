/**
 * ONE source of truth for where money goes.
 * Used by the checkout page (what to show) and the verify-receipt
 * Edge Function (what the receipt must match).
 *
 * Pure TypeScript, no imports, so Deno and Next can both load it.
 *
 * !!! DUMMY VALUES. REPLACE BEFORE LAUNCH. See LAUNCH_BLOCKERS.md !!!
 */

export const BANK = {
  isDummy: true, // flip to false when real details are in
  bank: {
    name: "Dummy Bank Ltd",
    title: "DirectCollabs Dummy",
    account: "0000-0000000000",
    iban: "PK00DUMM0000000000000000",
  },
  easypaisa: {
    title: "DirectCollabs Dummy",
    number: "03XX-XXXXXXX",
  },
  jazzcash: {
    title: "DirectCollabs Dummy",
    number: "03XX-XXXXXXX",
  },
  /** Receipt must be dated within this window to auto-approve. */
  receiptMaxAgeHours: 48,
  /** Amount tolerance in rupees. Bank fees sometimes shave a few rupees. */
  amountToleranceRs: 0,
} as const;

/** Strings the OCR receiver field may match (digits compared without dashes/spaces). */
export function acceptedReceivers() {
  return [
    BANK.bank.account,
    BANK.bank.iban,
    BANK.easypaisa.number,
    BANK.jazzcash.number,
  ].map(normalizeAccount);
}

export function normalizeAccount(s: string) {
  return s.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

/** Order reference, DC-XXXX, from a random 4-char base32 chunk. */
export function makeOrderRef(random: () => number = Math.random) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(random() * alphabet.length)];
  return `DC-${out}`;
}
