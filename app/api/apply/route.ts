import { NextResponse } from "next/server";
import { saveApplication } from "@/lib/applications";
import { DbUnavailable } from "@/lib/orders";
import { FOLLOWER_RANGES, RATE_RANGES, PAID_STATUS, NOTE_MAX, type ApplyErrors } from "@/lib/apply.config";
import { normalizePkPhone, cleanHandle } from "@/lib/format";

const oneOf = (list: readonly string[], v: unknown): v is string => typeof v === "string" && list.includes(v);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * POST /api/apply
 * A creator's application from the landing page. Validates every field against lib/apply.config.ts,
 * saves it, and returns { ok: true }. The owner follows up on WhatsApp from /admin.
 */
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Honeypot: a hidden field real people never fill. Bots get a normal-looking success and nothing is saved.
  if (str(b.website, 200)) return NextResponse.json({ ok: true });

  const errors: ApplyErrors = {};
  const name = str(b.name, 80);
  if (name.length < 2) errors.name = "Your name, at least 2 letters.";
  const whatsapp = normalizePkPhone(str(b.whatsapp, 30));
  if (!whatsapp) errors.whatsapp = "Pakistani number like 03XX XXXXXXX.";
  const instagram = cleanHandle(str(b.instagram, 60));
  if (instagram.length < 2) errors.instagram = "Your Instagram handle.";
  if (!oneOf(FOLLOWER_RANGES, b.followers)) errors.followers = "Pick your follower range.";
  if (!oneOf(RATE_RANGES, b.rate)) errors.rate = "Pick what you charge for one reel.";
  if (!oneOf(PAID_STATUS, b.paid_status)) errors.paid_status = "Pick one.";
  if (Object.keys(errors).length) return NextResponse.json({ error: "invalid", fields: errors }, { status: 400 });

  const attr = (b.attribution ?? {}) as Record<string, unknown>;
  const utmRaw = (attr.utm ?? {}) as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const [k, v] of Object.entries(utmRaw).slice(0, 10)) if (typeof v === "string") utm[k.slice(0, 40)] = v.slice(0, 200);
  const short = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 500) : null);

  try {
    await saveApplication({
      name,
      whatsapp: whatsapp as string,
      instagram,
      followers: b.followers as string,
      rate: b.rate as string,
      paid_status: b.paid_status as string,
      note: str(b.note, NOTE_MAX) || null,
      utm,
      fbp: short(attr.fbp),
      fbc: short(attr.fbc),
      fbclid: short(attr.fbclid),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
