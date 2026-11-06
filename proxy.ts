import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";
import { pickHero, DEFAULT_HERO } from "@/lib/heroes";

/**
 * 1. "/" with ?a= or utm_content -> rewrite to the prerendered /v/N page (URL unchanged,
 *    so UTMs and fbclid stay in the address bar for tracking). Plain "/" never touches this.
 * 2. /admin and /api/admin behind the admin cookie. Login routes stay open.
 */
export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/") {
    const hero = pickHero(searchParams.get("a"), searchParams.get("utm_content"));
    if (hero.id === DEFAULT_HERO) return NextResponse.next();
    return NextResponse.rewrite(new URL(`/v/${hero.id}`, req.url));
  }

  const open = pathname === "/admin/login" || pathname === "/api/admin/login";
  if (open) return NextResponse.next();

  const ok = await isValidAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    { source: "/", has: [{ type: "query", key: "a" }] },
    { source: "/", has: [{ type: "query", key: "utm_content" }] },
  ],
};
