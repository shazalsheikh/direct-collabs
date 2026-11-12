/**
 * Browser tracking: Meta Pixel + server CAPI (shared event_id for dedup), GA4, Google Ads.
 * Everything is a no-op while the matching NEXT_PUBLIC_* id is empty.
 *
 * Ladder: PageView, ViewContent (landing), Lead (application sent), InitiateCheckout, AddPaymentInfo (receipt submit),
 * Purchase (server-side CAPI on approval; the thank-you page also fires the browser Purchase
 * with the SAME event_id so Meta dedups).
 */
import { readAttribution } from "./attribution";

export type MetaEvent = "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "AddPaymentInfo";

type Fbq = ((...a: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: (...a: unknown[]) => void; push?: unknown; version?: string };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    gtag?: (...a: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const PIXEL = process.env.NEXT_PUBLIC_PIXEL_ID ?? "";
const GA4 = process.env.NEXT_PUBLIC_GA4_ID ?? "";
const GADS = process.env.NEXT_PUBLIC_GADS_ID ?? "";
const GADS_LABEL = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL ?? "";

export const trackingEnabled = () => Boolean(PIXEL || GA4 || GADS);

let pixelLoaded = false;
function loadPixel() {
  if (!PIXEL || pixelLoaded || typeof window === "undefined") return;
  pixelLoaded = true;
  if (!window.fbq) {
    // Standard Meta loader, installed lazily so it never blocks first paint.
    const n: Fbq = function (...a: unknown[]) {
      if (n.callMethod) n.callMethod(...a);
      else (n.queue as unknown[]).push(a);
    } as Fbq;
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }
  window.fbq?.("init", PIXEL);
}

let gtagLoaded = false;
function loadGtag() {
  if ((!GA4 && !GADS) || gtagLoaded || typeof window === "undefined") return;
  gtagLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...a: unknown[]) {
    window.dataLayer!.push(a);
  };
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4 || GADS}`;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  if (GA4) window.gtag("config", GA4, { send_page_view: false });
  if (GADS) window.gtag("config", GADS);
}

const GA_NAME: Record<MetaEvent, string> = {
  PageView: "page_view",
  ViewContent: "view_item",
  Lead: "generate_lead",
  InitiateCheckout: "begin_checkout",
  AddPaymentInfo: "add_payment_info",
};

function once(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch {}
  return true;
}

export type TrackOpts = { value?: number; contentName?: string; once?: boolean; eventId?: string };

/** Fire a ladder event on the browser Pixel, GA4 and (via /api/track) the server CAPI, one shared event_id. */
export function track(name: MetaEvent, opts: TrackOpts = {}): string | null {
  if (typeof window === "undefined" || !trackingEnabled()) return null;
  if (opts.once && !once(`dc_t_${name}`)) return null;
  const eventId = opts.eventId ?? crypto.randomUUID();
  const custom: Record<string, unknown> = {};
  if (opts.value !== undefined) {
    custom.value = opts.value;
    custom.currency = "PKR";
  }
  if (opts.contentName) custom.content_name = opts.contentName;

  if (PIXEL) {
    loadPixel();
    window.fbq?.("track", name, custom, { eventID: eventId });
    // Server copy, same id. sendBeacon survives navigation (submit -> redirect).
    const body = JSON.stringify({ event: name, event_id: eventId, value: opts.value, url: location.href, attribution: readAttribution() });
    try {
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) throw new Error("beacon");
    } catch {
      void fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  }
  if (GA4 || GADS) {
    loadGtag();
    window.gtag?.("event", GA_NAME[name], { ...custom, ...(opts.contentName ? { item_name: opts.contentName } : {}) });
  }
  return eventId;
}

/**
 * Browser half of Purchase, fired once per order on /thank-you after approval.
 * The server already sent Purchase with this event_id; Meta dedups the pair.
 * Also the Google Ads conversion + GA4 purchase stubs.
 */
export function trackPurchaseClient(o: { ref: string; value: number; eventId?: string | null }) {
  if (typeof window === "undefined" || !trackingEnabled()) return;
  try {
    const k = `dc_purchase_${o.ref}`;
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, "1");
  } catch {}
  if (PIXEL && o.eventId) {
    loadPixel();
    window.fbq?.("track", "Purchase", { value: o.value, currency: "PKR" }, { eventID: o.eventId });
  }
  if (GA4 || GADS) {
    loadGtag();
    if (GA4) window.gtag?.("event", "purchase", { transaction_id: o.ref, value: o.value, currency: "PKR" });
    // Google Ads conversion stub: needs NEXT_PUBLIC_GADS_ID + NEXT_PUBLIC_GADS_CONVERSION_LABEL.
    if (GADS && GADS_LABEL) window.gtag?.("event", "conversion", { send_to: `${GADS}/${GADS_LABEL}`, value: o.value, currency: "PKR", transaction_id: o.ref });
  }
}

/** Run after the page has finished loading and the main thread is idle, so tracking never touches LCP. */
export function whenIdle(fn: () => void) {
  if (typeof window === "undefined") return;
  const run = () => ("requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200));
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}
