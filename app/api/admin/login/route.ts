import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminToken, passwordMatches } from "@/lib/admin-auth";

/**
 * Relative redirect on purpose. On Netlify, req.url is an internal deploy address, so an absolute
 * redirect built from it sends the browser to a different host than the one that set the login cookie,
 * and the cookie is lost (a login loop). A relative Location always stays on the current host.
 */
function redirectTo(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const pw = String(form?.get("password") ?? "");
  if (!(await passwordMatches(pw))) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 600));
    return redirectTo("/admin/login?e=1");
  }
  const token = await adminToken();
  const res = redirectTo("/admin");
  res.cookies.set(ADMIN_COOKIE, token as string, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
