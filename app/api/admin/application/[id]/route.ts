import { NextResponse } from "next/server";
import { setApplicationStatus } from "@/lib/applications";
import { DbUnavailable } from "@/lib/orders";
import { APP_STATUSES, type AppStatus } from "@/lib/apply.config";

/**
 * POST /api/admin/application/<uuid>  { status }
 * Moves an application along the follow-up pipeline. Behind the admin cookie (proxy.ts).
 */
export async function POST(req: Request, ctx: RouteContext<"/api/admin/application/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  if (!body.status || !(APP_STATUSES as readonly string[]).includes(body.status)) return NextResponse.json({ error: "bad status" }, { status: 400 });
  try {
    const ok = await setApplicationStatus(id, body.status as AppStatus);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, status: body.status });
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
