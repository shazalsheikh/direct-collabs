import { NextResponse } from "next/server";
import { getOrderByRef, DbUnavailable } from "@/lib/orders";

/** GET /api/order/DC-XXXX/status. Polled by /thank-you every 20s. */
export async function GET(_req: Request, ctx: RouteContext<"/api/order/[ref]/status">) {
  const { ref } = await ctx.params;
  if (!/^DC-[A-Z0-9]{4}$/.test(ref)) return NextResponse.json({ error: "bad ref" }, { status: 400 });
  try {
    const o = await getOrderByRef(ref);
    if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(
      {
        ref: o.ref,
        status: o.status,
        plan: o.plan,
        kind: o.kind,
        bump: o.bump,
        amount: o.amount,
        pay_in_2: o.pay_in_2,
        event_id: o.event_id,
        // True when this site can send access emails (Resend configured). Lets the page promise email only when it is real.
        email_on: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM),
        access_token: o.status === "Approved" ? o.access_token : null,
        status_at: o.status_at,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
