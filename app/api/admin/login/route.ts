import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminToken, passwordMatches } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const pw = String(form?.get("password") ?? "");
  const back = new URL("/admin/login?e=1", req.url);
  if (!(await passwordMatches(pw))) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.redirect(back, 303);
  }
  const token = await adminToken();
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, token as string, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
