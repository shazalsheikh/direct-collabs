/**
 * Admin session: httpOnly cookie carrying HMAC(ADMIN_PASSWORD, "dc-admin-v1").
 * Web Crypto only, so proxy.ts (edge) and route handlers (node) share it.
 */
export const ADMIN_COOKIE = "dc_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function hmac(key: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function adminToken(password = process.env.ADMIN_PASSWORD): Promise<string | null> {
  if (!password || password.length < 8) return null;
  return hmac(password, "dc-admin-v1");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function isValidAdminCookie(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const t = await adminToken();
  return !!t && safeEqual(t, value);
}

export async function passwordMatches(input: string): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 8) return false;
  // Compare HMACs so length leaks nothing useful.
  return safeEqual(await hmac(pw, "pw"), await hmac(input, "pw"));
}
