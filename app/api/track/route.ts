import { NextResponse } from "next/server";
import { sendCapiEvent } from "@/lib/capi";
import { SITE } from "@/lib/site.config";

const ALLOWED = new Set(["PageView", "ViewContent", "InitiateCheckout", "AddPaymentInfo"]);

function cookie(header: string | null, name: string) {
  const m = header?.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * POST /api/track. Server half of a browser event, same event_id so Meta dedups.
 * No-op (204) until NEXT_PUBLIC_PIXEL_ID and META_CAPI_TOKEN are set.
 */
export async function POST(req: Request) {
  const pixelId = process.env.NEXT_PUBLIC_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return new NextResponse(null, { status: 204 });

  let b: { event?: string; event_id?: string; value?: number; url?: string; attribution?: { fbp?: string | null; fbc?: string | null } };
  try {
    b = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!b.event || !ALLOWED.has(b.event) || typeof b.event_id !== "string" || b.event_id.length > 64) {
    return NextResponse.json({ error: "bad event" }, { status: 400 });
  }
  const ck = req.headers.get("cookie");
  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  // Only accept URLs on our own host as the event source.
  let sourceUrl = SITE.url;
  try {
    const u = new URL(b.url ?? "");
    if (u.host === new URL(SITE.url).host || u.hostname === "localhost") sourceUrl = u.toString();
  } catch {}

  await sendCapiEvent({
    pixelId,
    token,
    eventName: b.event as "PageView",
    eventId: b.event_id,
    value: typeof b.value === "number" && Number.isFinite(b.value) ? b.value : undefined,
    fbp: cookie(ck, "_fbp") ?? b.attribution?.fbp ?? null,
    fbc: cookie(ck, "_fbc") ?? b.attribution?.fbc ?? null,
    sourceUrl,
    clientIp: ip,
    userAgent: req.headers.get("user-agent"),
  });
  return new NextResponse(null, { status: 204 });
}
