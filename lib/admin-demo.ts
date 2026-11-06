import type { AdminSnapshot, DayPoint, Range } from "./admin-data";
import type { OrderCurrent } from "./orders";

/**
 * DEV ONLY. Fake numbers so the dashboard layout can be checked without a database.
 * Only reachable at /admin?demo=1 when NODE_ENV !== "production" and Supabase is not configured.
 */
export function demoSnapshot(range: Range): AdminSnapshot {
  const days: DayPoint[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5);
    const leads = 3 + ((i * 7) % 9);
    const sales = Math.floor(leads / 3);
    days.push({ day: d.toISOString().slice(0, 10), leads, sales, revenue: sales * 7900 + (i % 3 === 0 ? 1200 : 0) });
  }
  const mk = (n: number, o: Partial<OrderCurrent>): OrderCurrent =>
    ({
      id: `demo-${n}`, ref: `DC-DEM${n}`, plan: "pro", kind: "purchase", bump: false, amount: 7900, name: "Demo Person", whatsapp: "923001234567",
      email: "demo@example.com", instagram: "demo.handle", utm: { utm_source: "demo" }, fbp: null, fbc: null, fbclid: null, event_id: null,
      parent_order_id: null, pay_in_2: null, access_token: null, created_at: new Date(Date.now() - n * 36e5 * 5).toISOString(),
      status: "Lead", method: null, reason: null, receipt_path: null, receipt_hash: null, txn_id: null, ocr: null, status_at: new Date().toISOString(),
      ...o,
    }) as OrderCurrent;
  const orders = [
    mk(1, { name: "Hamza R (demo)", status: "Needs review", method: "auto", reason: "Amount mismatch: receipt Rs 7000, expected Rs 7900", ocr: { amount: 7000, receiver_account: "PK00DUMM0000000000000000", txn_id: "TX9", date: new Date().toISOString(), status: "success", confidence: 0.9 } }),
    mk(2, { name: "Mahnoor S (demo)", plan: "basic", amount: 4900, status: "Lead" }),
    mk(3, { name: "Areeba K (demo)", bump: true, amount: 9100, status: "Approved", method: "auto", access_token: "demotokendemotokendemotoken" }),
    mk(4, { name: "Bilal A (demo)", status: "Approved", method: "manual", access_token: "demotokendemotokendemotoken" }),
  ];
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const sales = days.reduce((s, d) => s + d.sales, 0);
  const leads = days.reduce((s, d) => s + d.leads, 0);
  return {
    configured: false, range, orders, days,
    kpi: { revenue, orders: sales, aov: sales ? Math.round(revenue / sales) : 0, proShare: 0.7, checkoutToSale: leads ? sales / leads : 0, unpaidLeads: 1 },
  };
}
