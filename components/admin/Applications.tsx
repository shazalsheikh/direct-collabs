"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Application } from "@/lib/applications";
import { APP_STATUSES, type AppStatus } from "@/lib/apply.config";
import { SITE } from "@/lib/site.config";

function ago(iso: string) {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

type Filter = "open" | "all";

/**
 * Creator applications from the landing page form, newest first.
 * "Open" = New or Contacted or Qualified: the ones still waiting on a follow-up or a decision.
 */
export function Applications({ apps }: { apps: Application[] | null }) {
  const [filter, setFilter] = useState<Filter>("open");
  if (apps === null) {
    return (
      <div className="mt-5 rounded-card border border-coral/60 bg-ink-2 p-4 text-sm">
        <p className="text-coral">Applications are not available.</p>
        <p className="mt-1 text-bone-2">Run supabase/migrations/0003_applications.sql in the Supabase SQL editor, then reload.</p>
      </div>
    );
  }
  const open = apps.filter((a) => a.status === "New" || a.status === "Contacted" || a.status === "Qualified");
  const fresh = apps.filter((a) => a.status === "New").length;
  const list = filter === "open" ? open : apps;

  return (
    <section className="mt-5">
      <div className="rounded-card border border-lime bg-ink-2 p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Applications waiting for your first message</p>
        <p className={`display tnum mt-1 text-5xl ${fresh > 0 ? "text-lime" : ""}`}>{fresh}</p>
        <p className="mt-1 text-sm text-bone-2">
          {open.length} open, {apps.length} in total. Message new ones fast: a reply within minutes closes far more often than one a day later.
        </p>
      </div>

      <div className="mt-3 flex gap-1 rounded-pill border border-ink-4 p-1 text-sm font-semibold">
        {(
          [
            ["open", "Open", open.length],
            ["all", "All", apps.length],
          ] as [Filter, string, number][]
        ).map(([f, t, c]) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-pill px-2 ${filter === f ? "bg-bone text-ink" : "text-bone-2"}`}>
            {t}
            <span className={`tnum rounded-pill px-1.5 text-[11px] ${filter === f ? "bg-ink/10" : "bg-ink-3"}`}>{c}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {list.length === 0 && <li className="rounded-card border border-dashed border-ink-4 p-6 text-center text-sm text-bone-3">No applications here yet.</li>}
        {list.map((a) => (
          <AppRow key={a.id} a={a} />
        ))}
      </ul>
    </section>
  );
}

function AppRow({ a }: { a: Application }) {
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus>(a.status);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const first = a.name.split(" ")[0];
  const wa = `https://wa.me/${a.whatsapp}?text=${encodeURIComponent(`Hi ${first}, this is ${SITE.owner.name} from ${SITE.name}. Thanks for applying. I had a look at @${a.instagram}.`)}`;

  async function change(next: AppStatus) {
    const prev = status;
    setStatus(next);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/application/${a.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!res.ok) throw new Error(String(res.status));
      start(() => router.refresh());
    } catch {
      setStatus(prev);
      setErr("Could not save. Try again.");
    }
  }

  return (
    <li className={`rounded-card border bg-ink-2 p-4 ${status === "New" ? "border-lime" : "border-ink-4"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{a.name}</p>
          <a href={`https://instagram.com/${a.instagram}`} target="_blank" rel="noopener" className="text-sm text-bone-2 underline underline-offset-4 hover:text-bone">
            @{a.instagram}
          </a>
        </div>
        <span className="shrink-0 text-[12px] text-bone-3">{ago(a.created_at)} ago</span>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-[13px] sm:grid-cols-3">
        <div>
          <dt className="inline text-bone-3">Followers: </dt>
          <dd className="inline text-bone">{a.followers}</dd>
        </div>
        <div>
          <dt className="inline text-bone-3">Per reel: </dt>
          <dd className="inline text-bone">{a.rate}</dd>
        </div>
        <div>
          <dt className="inline text-bone-3">Paid today: </dt>
          <dd className="inline text-bone">{a.paid_status}</dd>
        </div>
      </dl>
      {a.note && <p className="mt-2 rounded-xl bg-ink p-3 text-[13px] text-bone-2">{a.note}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a href={wa} target="_blank" rel="noopener" className="inline-flex min-h-10 items-center rounded-pill bg-lime px-4 text-sm font-semibold text-ink">
          WhatsApp {first}
        </a>
        <label className="inline-flex items-center gap-2 text-[13px] text-bone-3">
          Status
          <select
            value={status}
            disabled={pending}
            onChange={(e) => change(e.target.value as AppStatus)}
            className="min-h-10 rounded-pill border border-ink-4 bg-ink px-3 text-sm text-bone focus:border-lime focus:outline-none"
          >
            {APP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {err && <span className="text-[13px] text-coral">{err}</span>}
      </div>
    </li>
  );
}
