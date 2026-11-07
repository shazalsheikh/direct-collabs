"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSnapshot } from "@/lib/admin-data";
import type { OrderCurrent } from "@/lib/orders";
import { PLANS, FOUNDING } from "@/lib/offer.config";
import { SITE } from "@/lib/site.config";
import { rs, num } from "@/lib/format";
import { Chart } from "./Chart";

type Bucket = "leads" | "review" | "sales";

const label = (o: OrderCurrent) => (o.kind === "upgrade" ? "Upgrade" : o.kind === "second" ? "Part 2" : PLANS[o.plan].name) + (o.bump ? " +Bump" : "");

function ago(iso: string) {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

const fmtRs = (n: number) => rs(n);
const fmtN = (n: number) => num(n);

export function AdminDashboard({ snap, foundingHit = false }: { snap: AdminSnapshot; foundingHit?: boolean }) {
  const [bucket, setBucket] = useState<Bucket>("review");
  const leads = snap.orders.filter((o) => o.status === "Lead");
  const review = snap.orders.filter((o) => o.status === "Needs review" || o.status === "Submitted" || o.status === "Rejected");
  const sales = snap.orders.filter((o) => o.status === "Approved");
  const list = bucket === "leads" ? leads : bucket === "review" ? review : sales;
  const k = snap.kpi;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-5 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <p className="display text-lg">
          Direct<span className="text-lime">Collabs</span> <span className="text-bone-3">admin</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="flex rounded-pill border border-ink-4 p-0.5 text-xs font-semibold">
            {([7, 30] as const).map((r) => (
              <Link key={r} href={`/admin?range=${r}`} className={`min-h-8 rounded-pill px-3 inline-flex items-center ${snap.range === r ? "bg-bone text-ink" : "text-bone-2"}`}>
                {r}d
              </Link>
            ))}
          </div>
          <form method="post" action="/api/admin/logout">
            <button className="min-h-8 rounded-pill px-3 text-xs text-bone-3 hover:text-bone">Out</button>
          </form>
        </div>
      </header>

      {foundingHit && (
        <div role="alert" className="mt-5 rounded-card border-2 border-coral bg-ink-2 p-4 text-sm">
          <p className="font-semibold text-coral">Founding limit reached.</p>
          <p className="mt-1 text-bone-2">
            {FOUNDING.limit} verified Pro sales. The page still sells Pro at {rs(PLANS.pro.price)}. Change PLANS.pro.price to {rs(FOUNDING.priceAfter)} in lib/offer.config.ts
            and redeploy, or set FOUNDING.enabled to false.
          </p>
        </div>
      )}

      {!snap.configured && (
        <div className="mt-5 rounded-card border border-coral/60 bg-ink-2 p-4 text-sm">
          <p className="text-coral">Database not configured.</p>
          <p className="mt-1 text-bone-2">Set SUPABASE_URL and SUPABASE_SERVICE_KEY, run the SQL in supabase/migrations, then seed with scripts/seed.ts.</p>
        </div>
      )}

      {/* KPI */}
      <div className="mt-5 rounded-card border border-lime bg-ink-2 p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Revenue · last {snap.range} days</p>
        <p className="display tnum mt-1 text-5xl">{rs(k.revenue)}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Orders" value={num(k.orders)} />
        <Tile label="Avg order" value={rs(k.aov)} sub={`${Math.round(k.proShare * 100)}% Pro`} />
        <Tile label="Checkout to sale" value={`${Math.round(k.checkoutToSale * 100)}%`} />
        <Tile label="Unpaid leads" value={num(k.unpaidLeads)} warn={k.unpaidLeads > 0} />
      </div>

      {/* Charts */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Chart days={snap.days} field="leads" label="Leads per day" format={fmtN} />
        <Chart days={snap.days} field="revenue" label="Revenue per day" format={fmtRs} />
      </div>

      {/* Buckets */}
      <div className="mt-6 flex gap-1 rounded-pill border border-ink-4 p-1 text-sm font-semibold">
        {(
          [
            ["leads", "Leads", leads.length],
            ["review", "Needs review", review.length],
            ["sales", "Sales", sales.length],
          ] as [Bucket, string, number][]
        ).map(([b, t, c]) => (
          <button key={b} type="button" onClick={() => setBucket(b)} className={`flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill px-2 ${b === "review" ? "flex-[1.6]" : "flex-1"} ${bucket === b ? "bg-bone text-ink" : "text-bone-2"}`}>
            {t}
            <span className={`tnum rounded-pill px-1.5 text-[11px] ${bucket === b ? "bg-ink/10" : "bg-ink-3"} ${b === "review" && c > 0 && bucket !== b ? "text-coral" : ""}`}>{c}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {list.length === 0 && <li className="rounded-card border border-dashed border-ink-4 p-6 text-center text-sm text-bone-3">Nothing here.</li>}
        {list.map((o) => (
          <Row key={o.id} o={o} bucket={bucket} />
        ))}
      </ul>
    </div>
  );
}

function Tile({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className="rounded-card border border-ink-4 bg-ink-2 p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">{label}</p>
      <p className={`display tnum mt-1 text-2xl ${warn ? "text-coral" : ""}`}>{value}</p>
      {sub && <p className="text-[12px] text-bone-3">{sub}</p>}
    </div>
  );
}

function Row({ o, bucket }: { o: OrderCurrent; bucket: Bucket }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<"approve" | "back_to_leads" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const phone = o.whatsapp ?? "";
  const first = (o.name ?? "").split(" ")[0] || "there";
  const accessUrl = o.access_token ? `${SITE.url.replace(/\/$/, "")}/access/${o.access_token}` : "";
  const waText =
    bucket === "leads"
      ? `Hi ${first}, Sheikh here from DirectCollabs. Ap ne ${label(o)} choose kia tha par receipt upload nhi hui. Koi masla? Order ${o.ref}.`
      : bucket === "review"
        ? `Hi ${first}, DirectCollabs. Order ${o.ref}: receipt clear nhi aayi. Easypaisa ya JazzCash app ka original receipt screenshot bhej dein, access turant unlock kr dete hn.`
        : `Hi ${first}, DirectCollabs. Payment verified, order ${o.ref}. Your course link: ${accessUrl}`;
  const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(waText)}` : "";

  function act(action: "approve" | "back_to_leads") {
    if (confirm !== action) {
      setConfirm(action);
      setTimeout(() => setConfirm((c) => (c === action ? null : c)), 4000);
      return;
    }
    setConfirm(null);
    start(async () => {
      const res = await fetch(`/api/admin/order/${o.ref}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; email?: { sent: boolean }; capi?: { sent: boolean } };
      if (!res.ok) setMsg(j.error ?? "Failed");
      else if (action === "approve") setMsg(`Approved. Email ${j.email?.sent ? "sent" : "not sent"}, Meta ${j.capi?.sent ? "sent" : "not sent"}.`);
      else setMsg("Back to leads.");
      router.refresh();
    });
  }

  const ocr = (o.ocr ?? null) as null | { amount?: number | null; receiver_account?: string | null; txn_id?: string | null; date?: string | null; confidence?: number; status?: string };

  return (
    <li className="rounded-card border border-ink-4 bg-ink-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{o.name ?? "No name"}</p>
            {phone && (
              <>
                <a href={`tel:+${phone}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-4 text-[12px]" aria-label="Call">
                  ☎
                </a>
                <a href={wa} target="_blank" rel="noopener" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-ink text-[12px] font-bold" aria-label="WhatsApp">
                  W
                </a>
              </>
            )}
          </div>
          <p className="mt-1 text-[12px] text-bone-3">
            {o.ref} · {label(o)} · {rs(o.amount)} · {ago(o.created_at)}
            {o.instagram ? ` · @${o.instagram}` : ""}
            {o.status === "Approved" && o.method ? ` · ${o.method === "auto" ? "auto" : "manual by admin"}` : ""}
            {o.status === "Submitted" ? " · verifying" : ""}
            {o.status === "Rejected" ? " · rejected" : ""}
          </p>
        </div>
        {o.utm?.utm_source && <span className="shrink-0 rounded-md bg-ink-3 px-1.5 py-0.5 text-[10px] text-bone-3">{o.utm.utm_source}</span>}
      </div>

      {bucket === "review" && (
        <div className="mt-3 space-y-2 text-[13px]">
          {o.reason && <p className="text-coral">{o.reason}</p>}
          {ocr && (
            <p className="text-bone-2">
              OCR read: {ocr.amount != null ? rs(ocr.amount) : "no amount"} · to {ocr.receiver_account ?? "?"} · txn {ocr.txn_id ?? "?"} · {ocr.date ?? "no date"} · {ocr.status ?? ""}
              {typeof ocr.confidence === "number" ? ` · conf ${ocr.confidence.toFixed(2)}` : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {o.receipt_path && (
              <a href={`/api/admin/receipt?path=${encodeURIComponent(o.receipt_path)}`} target="_blank" rel="noopener" className="min-h-10 inline-flex items-center rounded-pill border border-bone-3 px-3 text-xs font-semibold">
                View receipt
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className="min-h-10 inline-flex items-center rounded-pill border border-ink-4 px-3 text-xs font-semibold">
                Ask for real receipt
              </a>
            )}
            <button type="button" disabled={pending} onClick={() => act("approve")} className={`min-h-10 rounded-pill px-3 text-xs font-semibold ${confirm === "approve" ? "bg-coral text-ink" : "bg-lime text-ink"}`}>
              {confirm === "approve" ? "Tap again to confirm" : "Mark as paid"}
            </button>
            <button type="button" disabled={pending} onClick={() => act("back_to_leads")} className={`min-h-10 rounded-pill px-3 text-xs font-semibold ${confirm === "back_to_leads" ? "bg-coral text-ink" : "border border-ink-4 text-bone-2"}`}>
              {confirm === "back_to_leads" ? "Tap again to confirm" : "Back to leads"}
            </button>
          </div>
        </div>
      )}

      {bucket === "sales" && accessUrl && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={accessUrl} target="_blank" rel="noopener" className="min-h-10 inline-flex items-center rounded-pill border border-ink-4 px-3 text-xs font-semibold">
            Open access
          </a>
          {wa && (
            <a href={wa} target="_blank" rel="noopener" className="min-h-10 inline-flex items-center rounded-pill border border-bone-3 px-3 text-xs font-semibold">
              Send link on WhatsApp
            </a>
          )}
        </div>
      )}

      {msg && <p className="mt-2 text-[12px] text-bone-2">{msg}</p>}
    </li>
  );
}
