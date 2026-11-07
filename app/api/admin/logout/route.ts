import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  // Relative redirect, see the note in the login route.
  const res = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
