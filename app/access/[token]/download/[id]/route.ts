import { NextResponse } from "next/server";
import { resolveAccess, canDownload } from "@/lib/access";
import { DbUnavailable } from "@/lib/orders";
import { db } from "@/lib/db";
import { DOWNLOADS } from "@/lib/offer.config";

/**
 * GET /access/[token]/download/[id]
 * Checks the buyer's token and plan, then redirects to a 60 second signed link
 * from the PRIVATE "downloads" bucket. The files are never public and never in git.
 */
export async function GET(_req: Request, ctx: RouteContext<"/access/[token]/download/[id]">) {
  const { token, id } = await ctx.params;
  const d = DOWNLOADS.find((x) => x.id === id);
  if (!d || !d.file) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const access = await resolveAccess(token);
    if (!access) return NextResponse.json({ error: "invalid link" }, { status: 401 });
    if (!canDownload(d, access)) return NextResponse.json({ error: "not included in your plan" }, { status: 403 });

    const client = db();
    if (!client) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    const { data, error } = await client.storage.from("downloads").createSignedUrl(d.file, 60, { download: d.filename });
    if (error || !data?.signedUrl) return NextResponse.json({ error: "file not uploaded yet, message us on WhatsApp" }, { status: 404 });

    const res = NextResponse.redirect(data.signedUrl, 302);
    res.headers.set("cache-control", "no-store");
    return res;
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    console.error(err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
