/**
 * Resend transactional email. Pure fetch so Node and Deno both run it. No-op without key.
 */

export type AccessEmail = {
  apiKey: string | undefined;
  from: string | undefined;
  to: string;
  name: string;
  plan: string;
  ref: string;
  accessUrl: string;
  whatsappUrl?: string;
};

export async function sendAccessEmail(e: AccessEmail): Promise<{ sent: boolean; id?: string; error?: string }> {
  if (!e.apiKey || !e.from) return { sent: false, error: "resend not configured" };
  const first = e.name.split(" ")[0] || "there";
  const text = [
    `Hi ${first},`,
    ``,
    `Your payment for DirectCollabs ${e.plan} is verified. Order ${e.ref}.`,
    ``,
    `Watch the course here (keep this link, it is yours only):`,
    e.accessUrl,
    ``,
    `Before your ad: switch to a professional account, link your Facebook Page, add a payment method in Ads Manager, keep Rs 500 a day aside, and give yourself 40 seconds of camera time.`,
    ``,
    `Questions, reply to this email${e.whatsappUrl ? ` or WhatsApp: ${e.whatsappUrl}` : ""}.`,
    ``,
    `Sheikh Sajawal`,
    `DirectCollabs`,
  ].join("\n");

  const html = text
    .split("\n")
    .map((l) => (l.startsWith("http") ? `<p><a href="${l}" style="color:#0a0a0a;font-weight:600">${l}</a></p>` : l ? `<p>${l}</p>` : "<br/>"))
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${e.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: e.from,
        to: [e.to],
        subject: `Your DirectCollabs access · ${e.ref}`,
        text,
        html: `<div style="font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.5;color:#0a0a0a">${html}</div>`,
      }),
    });
    if (!res.ok) return { sent: false, error: `${res.status} ${await res.text()}` };
    const j = (await res.json()) as { id?: string };
    return { sent: true, id: j.id };
  } catch (err) {
    return { sent: false, error: String(err) };
  }
}
