import { NextResponse } from "next/server";
import { getOrderByRef, appendEvent, DbUnavailable } from "@/lib/orders";
import { approveManually } from "@/lib/approve";

/**
 * POST /api/admin/order/DC-XXXX  { action: "approve" | "back_to_leads" }
 * approve: appends Approved (manual), sends access, fires Meta Purchase. Never skipped.
 * back_to_leads: appends Lead so the order shows in the follow-up bucket again.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/admin/order/[ref]">) {
  const { ref } = await ctx.params;
  if (!/^DC-[A-Z0-9]{4}$/.test(ref)) return NextResponse.json({ error: "bad ref" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  try {
    const order = await getOrderByRef(ref);
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (body.action === "approve") {
      if (order.status === "Approved") return NextResponse.json({ error: "already approved" }, { status: 400 });
      const r = await approveManually(order);
      return NextResponse.json({ ok: true, status: "Approved", accessUrl: r.accessUrl, email: r.email, capi: { sent: r.capi.sent, status: r.capi.status } });
    }
    if (body.action === "back_to_leads") {
      if (order.status === "Approved") return NextResponse.json({ error: "approved orders stay approved" }, { status: 400 });
      await appendEvent(order.id, { status: "Lead", method: "manual", reason: "Back to leads by admin" });
      return NextResponse.json({ ok: true, status: "Lead" });
    }
    return NextResponse.json({ error: "bad action" }, { status: 400 });
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
