/** Rs 7,900 style. No decimals. */
export function rs(n: number) {
  return `Rs ${Math.round(n).toLocaleString("en-PK")}`;
}

/** Rs 500000 -> "Rs 5 lakh". Whole or half lakhs read cleanly; anything else falls back to rs(). */
export function lakh(n: number) {
  const l = n / 100000;
  return Number.isInteger(l * 2) ? `Rs ${l} lakh` : rs(n);
}

export function num(n: number) {
  return Math.round(n).toLocaleString("en-PK");
}

/** Pakistan mobile: 03XXXXXXXXX or +923XXXXXXXXX or 923XXXXXXXXX */
export function normalizePkPhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (/^03\d{9}$/.test(d)) return `92${d.slice(1)}`;
  if (/^923\d{9}$/.test(d)) return d;
  if (/^3\d{9}$/.test(d)) return `92${d}`;
  return null;
}

export function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

export function cleanHandle(s: string) {
  return s.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "");
}
