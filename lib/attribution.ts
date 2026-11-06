/**
 * Client-side attribution capture. Persists UTMs + fbclid in sessionStorage
 * so they survive landing -> checkout, and reads Meta's _fbp/_fbc cookies.
 */
export type Attribution = {
  utm: Record<string, string>;
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
  landing: string | null;
};

const KEY = "dc_attr";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "a"];

function cookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Call on every page load. Merges new URL params over stored ones. */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return { utm: {}, fbclid: null, fbp: null, fbc: null, landing: null };
  let stored: Partial<Attribution> = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {}
  const sp = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = { ...(stored.utm ?? {}) };
  for (const k of UTM_KEYS) {
    const v = sp.get(k);
    if (v) utm[k] = v;
  }
  const fbclid = sp.get("fbclid") ?? stored.fbclid ?? null;
  const fbp = cookie("_fbp") ?? stored.fbp ?? null;
  // Meta's _fbc format: fb.1.<timestamp>.<fbclid>
  const fbc = cookie("_fbc") ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : (stored.fbc ?? null));
  const landing = stored.landing ?? window.location.pathname + window.location.search;
  const attr: Attribution = { utm, fbclid, fbp, fbc, landing };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {}
  return attr;
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return { utm: {}, fbclid: null, fbp: null, fbc: null, landing: null };
  try {
    return { utm: {}, fbclid: null, fbp: null, fbc: null, landing: null, ...JSON.parse(sessionStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { utm: {}, fbclid: null, fbp: null, fbc: null, landing: null };
  }
}
