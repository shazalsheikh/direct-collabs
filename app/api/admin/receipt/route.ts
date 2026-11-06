import { NextResponse } from "next/server";
import { signedReceiptUrl, DbUnavailable } from "@/lib/orders";

/** GET /api/admin/receipt?path=DC-XXXX/abc.jpg -> 302 to a 10-minute signed URL. Proxy gates this. */
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get("path") ?? "";
  if (!/^DC-[A-Z0-9]{4}\/[a-f0-9]{16}\.(jpg|png|webp|pdf)$/.test(path)) return NextResponse.json({ error: "bad path" }, { status: 400 });
  try {
    const url = await signedReceiptUrl(path, 600);
    if (!url) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.redirect(url, 302);
  } catch (err) {
    if (err instanceof DbUnavailable) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
