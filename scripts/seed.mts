/**
 * Seed dummy rows so /admin has something to show.
 * Run: npm run seed
 * Needs SUPABASE_URL and SUPABASE_SERVICE_KEY. Safe to run twice (refs are random).
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY (use --env-file=.env.local)");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ref = () => "DC-" + Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

type Row = {
  plan: "basic" | "pro";
  bump: boolean;
  name: string;
  whatsapp: string;
  email: string;
  instagram: string;
  events: Array<{ status: string; method?: string; reason?: string; txn_id?: string; at: string }>;
  created: string;
};

const rows: Row[] = [
  { plan: "pro", bump: true, name: "Areeba K", whatsapp: "923001112233", email: "areeba@example.com", instagram: "areeba.k", created: daysAgo(1, 2),
    events: [{ status: "Lead", at: daysAgo(1, 2) }, { status: "Submitted", at: daysAgo(1, 1) }, { status: "Approved", method: "auto", txn_id: "TX1001", at: daysAgo(1, 1) }] },
  { plan: "pro", bump: false, name: "Hamza R", whatsapp: "923211234567", email: "hamza@example.com", instagram: "hamza.reels", created: daysAgo(2),
    events: [{ status: "Lead", at: daysAgo(2) }, { status: "Submitted", at: daysAgo(2) }, { status: "Needs review", method: "auto", reason: "Amount mismatch: receipt Rs 7,000, order Rs 7,900", at: daysAgo(2) }] },
  { plan: "basic", bump: false, name: "Mahnoor S", whatsapp: "923331234567", email: "mahnoor@example.com", instagram: "mahnoor.s", created: daysAgo(3),
    events: [{ status: "Lead", at: daysAgo(3) }] },
  { plan: "pro", bump: false, name: "Bilal A", whatsapp: "923451234567", email: "bilal@example.com", instagram: "bilal.vlogs", created: daysAgo(4),
    events: [{ status: "Lead", at: daysAgo(4) }, { status: "Submitted", at: daysAgo(4) }, { status: "Needs review", method: "auto", reason: "Unreadable receipt", at: daysAgo(4) }, { status: "Approved", method: "manual", at: daysAgo(3) }] },
  { plan: "basic", bump: true, name: "Zara M", whatsapp: "923121234567", email: "zara@example.com", instagram: "zara.makes", created: daysAgo(6),
    events: [{ status: "Lead", at: daysAgo(6) }, { status: "Submitted", at: daysAgo(6) }, { status: "Approved", method: "auto", txn_id: "TX1002", at: daysAgo(6) }] },
  { plan: "pro", bump: false, name: "Usman T", whatsapp: "923041234567", email: "usman@example.com", instagram: "usman.t", created: daysAgo(9),
    events: [{ status: "Lead", at: daysAgo(9) }] },
  { plan: "pro", bump: true, name: "Fatima N", whatsapp: "923151234567", email: "fatima@example.com", instagram: "fatima.n", created: daysAgo(12),
    events: [{ status: "Lead", at: daysAgo(12) }, { status: "Submitted", at: daysAgo(12) }, { status: "Approved", method: "auto", txn_id: "TX1003", at: daysAgo(12) }] },
];

const prices = { basic: 4900, pro: 15000 };

for (const r of rows) {
  const amount = prices[r.plan] + (r.bump ? 1200 : 0);
  const { data: order, error } = await db
    .from("orders")
    .insert({ ref: ref(), plan: r.plan, bump: r.bump, amount, name: r.name, whatsapp: r.whatsapp, email: r.email, instagram: r.instagram, utm: { utm_source: "seed" }, created_at: r.created })
    .select("id, ref")
    .single();
  if (error) { console.error(error); process.exit(1); }
  for (const e of r.events) {
    const { error: e2 } = await db.from("order_events").insert({ order_id: order.id, status: e.status, method: e.method ?? null, reason: e.reason ?? null, txn_id: e.txn_id ?? null, created_at: e.at });
    if (e2) { console.error(e2); process.exit(1); }
  }
  console.log("seeded", order.ref, r.plan, r.events.at(-1)?.status);
}
console.log("done");
