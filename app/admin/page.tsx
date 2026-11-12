import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidAdminCookie } from "@/lib/admin-auth";
import { loadAdminSnapshot, type Range } from "@/lib/admin-data";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { demoSnapshot } from "@/lib/admin-demo";
import { countVerifiedSales } from "@/lib/db";
import { FOUNDING } from "@/lib/offer.config";
import { listApplications } from "@/lib/applications";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage(props: PageProps<"/admin">) {
  return (
    <main className="flex-1">
      <Suspense fallback={<p className="p-4 text-sm text-bone-3">Loading…</p>}>
        <AdminData searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function AdminData({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  // Proxy already gates this; belt and braces.
  const ok = await isValidAdminCookie((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
  const sp = await searchParams;
  const range: Range = sp.range === "7" ? 7 : 30;
  let snap = await loadAdminSnapshot(range);
  if (!snap.configured && process.env.NODE_ENV !== "production" && sp.demo === "1") snap = demoSnapshot(range);
  const proSold = FOUNDING.enabled ? await countVerifiedSales("pro") : null;
  const foundingHit = proSold !== null && proSold >= FOUNDING.limit;
  const apps = await listApplications();
  return <AdminDashboard snap={snap} foundingHit={foundingHit} apps={apps} />;
}
