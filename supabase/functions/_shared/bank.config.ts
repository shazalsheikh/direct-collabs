/**
 * ONE source of truth for where money goes.
 * Used by the checkout page (what to show) and the verify-receipt
 * Edge Function (what the receipt must match).
 *
 * Pure TypeScript, no imports, so Deno and Next can both load it.
 *
 * Wallets only (Easypaisa and JazzCash), no bank account.
 */

export const BANK = {
  isDummy: false, // set true to bring back the "replace dummy details" banner and SAMPLE tag
  // Digits only, so the Copy button pastes cleanly into a wallet app. Shown as 0300 0132773.
  // One mobile number that receives on both Easypaisa and JazzCash.
  wallet: {
    title: "Shazal Ahmed Ali",
    number: "03000132773",
    label: "Easypaisa or JazzCash",
  },
  /** Receipt must be dated within this window to auto-approve. */
  receiptMaxAgeHours: 48,
  /** Amount tolerance in rupees. Wallet fees sometimes shave a few rupees. */
  amountToleranceRs: 0,
} as const;

/** Numbers the OCR receiver field may match (digits compared without spaces, dashes or +). */
export function acceptedReceivers() {
  return [BANK.wallet.number].map(normalizeAccount);
}

export function normalizeAccount(s: string) {
  return s.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

/** 03000132773 -> "0300 0132773" for display. Anything else is shown as is. */
export function formatPkNumber(n: string) {
  return n.replace(/^(\d{4})(\d{7})$/, "$1 $2");
}

/** Order reference, DC-XXXX, from a random 4-char base32 chunk. */
export function makeOrderRef(random: () => number = Math.random) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(random() * alphabet.length)];
  return `DC-${out}`;
}
