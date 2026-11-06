import "server-only";
import { db } from "./db";
import type { OrderCurrent } from "./orders";

export type Range = 7 | 30;

export type DayPoint = { day: string; leads: number; revenue: number; sales: number };

export type AdminSnapshot = {
  configured: boolean;
  range: Range;
  orders: OrderCurrent[];
  kpi: {
    revenue: number;
    orders: number;
    aov: number;
    proShare: number; // 0..1
    checkoutToSale: number; // 0..1
    unpaidLeads: number;
  };
  days: DayPoint[];
};

const dayKey = (iso: string) => iso.slice(0, 10);

export async function loadAdminSnapshot(range: Range): Promise<AdminSnapshot> {
  const client = db();
  const days: DayPoint[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    days.push({ day: d.toISOString().slice(0, 10), leads: 0, revenue: 0, sales: 0 });
  }
  const empty: AdminSnapshot = {
    configured: !!client,
    range,
    orders: [],
    kpi: { revenue: 0, orders: 0, aov: 0, proShare: 0, checkoutToSale: 0, unpaidLeads: 0 },
    days,
  };
  if (!client) return empty;

  const since = new Date(Date.now() - range * 864e5);
  since.setHours(0, 0, 0, 0);

  // Everything in range, plus every open Lead / Needs review regardless of age (they need follow-up).
  const [{ data: inRange, error: e1 }, { data: open, error: e2 }] = await Promise.all([
    client.from("orders_current").select("*").gte("created_at", since.toISOString()).order("created_at", { ascending: false }),
    client.from("orders_current").select("*").in("status", ["Lead", "Needs review", "Submitted"]).order("created_at", { ascending: false }).limit(500),
  ]);
  if (e1 || e2) {
    console.error(e1 ?? e2);
    return empty;
  }
  const map = new Map<string, OrderCurrent>();
  for (const o of [...(inRange ?? []), ...(open ?? [])] as OrderCurrent[]) map.set(o.id, o);
  const orders = Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const ranged = orders.filter((o) => o.created_at >= since.toISOString());
  const sales = ranged.filter((o) => o.status === "Approved");
  const revenue = sales.reduce((s, o) => s + (o.pay_in_2?.enabled && !o.pay_in_2.second_paid ? o.pay_in_2.first : o.amount), 0);
  const proSales = sales.filter((o) => o.plan === "pro" || o.kind === "upgrade").length;
  const unpaidLeads = orders.filter((o) => o.status === "Lead").length;

  const byDay = new Map(days.map((d) => [d.day, d]));
  for (const o of ranged) {
    const p = byDay.get(dayKey(o.created_at));
    if (!p) continue;
    p.leads += 1;
    if (o.status === "Approved") {
      p.sales += 1;
      p.revenue += o.pay_in_2?.enabled && !o.pay_in_2.second_paid ? o.pay_in_2.first : o.amount;
    }
  }

  return {
    configured: true,
    range,
    orders,
    kpi: {
      revenue,
      orders: sales.length,
      aov: sales.length ? Math.round(revenue / sales.length) : 0,
      proShare: sales.length ? proSales / sales.length : 0,
      checkoutToSale: ranged.length ? sales.length / ranged.length : 0,
      unpaidLeads,
    },
    days,
  };
}
