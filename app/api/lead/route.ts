import { NextResponse } from "next/server";
import { createLead, updateOrder, getOrderByRef, linkedContext, DbUnavailable } from "@/lib/orders";
import { parseDetails, amountsFor, payIn2Record, parseLinked } from "@/lib/validate";
import { UPGRADE, PAY_IN_2 } from "@/lib/offer.config";

/**
 * POST /api/lead
 * Called on blur of name + WhatsApp. Creates the order row with a "Lead" event,
 * or updates an existing one by ref. Abandoned checkouts become WhatsApp follow-ups.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const parsed = parseDetails(body, { requireAll: false });
  if (!parsed.ok) return NextResponse.json({ error: "invalid", fields: parsed.errors }, { status: 400 });
  const d = parsed.d;
  const linked = parseLinked(body);
  const { total } = amountsFor(d, linked?.kind);
  const attr = (body.attribution ?? {}) as Record<string, unknown>;

  let parentId: string | null = null;
  if (linked) {
    try {
      const ctx = await linkedContext(linked.kind, linked.parentRef, { upgrade: UPGRADE.price, second: PAY_IN_2.second });
      if ("error" in ctx) return NextResponse.json({ error: "linked", message: ctx.error }, { status: 400 });
      parentId = ctx.parent.id;
    } catch (err) {
      if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      throw err;
    }
  }

  const patch = {
    plan: linked ? ("pro" as const) : d.plan,
    kind: linked?.kind ?? ("purchase" as const),
    parent_order_id: parentId,
    bump: linked ? false : d.bump,
    amount: total,
    name: d.name,
    whatsapp: d.whatsapp,
    email: d.email || null,
    instagram: d.instagram || null,
    utm: (attr.utm as Record<string, string>) ?? {},
    fbp: (attr.fbp as string) ?? null,
    fbc: (attr.fbc as string) ?? null,
    fbclid: (attr.fbclid as string) ?? null,
    pay_in_2: linked ? null : payIn2Record(d),
  };

  try {
    const ref = typeof body.ref === "string" ? body.ref : null;
    if (ref) {
      const existing = await getOrderByRef(ref);
      // Only leads are editable from the client. Anything past Submitted is locked.
      if (existing && existing.status === "Lead") {
        await updateOrder(ref, patch);
        return NextResponse.json({ ref });
      }
      if (existing) return NextResponse.json({ ref, locked: true });
    }
    const created = await createLead(patch);
    return NextResponse.json({ ref: created.ref });
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
