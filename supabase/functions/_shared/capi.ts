/**
 * Meta Conversions API, server side. Pure fetch + Web Crypto so it runs in
 * Next (Node) and in the Supabase Edge Function (Deno). No-op without env.
 */

export type PurchaseInput = {
  pixelId: string | undefined;
  token: string | undefined;
  eventId: string;
  value: number;
  currency?: string;
  email?: string | null;
  phone?: string | null; // digits with country code
  fbp?: string | null;
  fbc?: string | null;
  sourceUrl?: string;
  clientIp?: string | null;
  userAgent?: string | null;
  testEventCode?: string;
  eventName?: "Purchase" | "InitiateCheckout" | "AddPaymentInfo" | "ViewContent";
};

async function sha256(s: string): Promise<string> {
  const data = new TextEncoder().encode(s.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sendCapiEvent(i: PurchaseInput): Promise<{ sent: boolean; status?: number; body?: string }> {
  if (!i.pixelId || !i.token) return { sent: false };
  const user_data: Record<string, unknown> = {};
  if (i.email) user_data.em = [await sha256(i.email)];
  if (i.phone) user_data.ph = [await sha256(i.phone.replace(/\D/g, ""))];
  if (i.fbp) user_data.fbp = i.fbp;
  if (i.fbc) user_data.fbc = i.fbc;
  if (i.clientIp) user_data.client_ip_address = i.clientIp;
  if (i.userAgent) user_data.client_user_agent = i.userAgent;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: i.eventName ?? "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: i.eventId,
        action_source: "website",
        event_source_url: i.sourceUrl,
        user_data,
        custom_data: { value: i.value, currency: i.currency ?? "PKR" },
      },
    ],
  };
  if (i.testEventCode) body.test_event_code = i.testEventCode;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${i.pixelId}/events?access_token=${encodeURIComponent(i.token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { sent: res.ok, status: res.status, body: res.ok ? undefined : await res.text() };
  } catch (err) {
    return { sent: false, body: String(err) };
  }
}
