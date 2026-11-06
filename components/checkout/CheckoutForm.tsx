"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PLANS, BUMP, UPGRADE, PAY_IN_2, AD_BUDGET, type PlanId } from "@/lib/offer.config";
import { BANK } from "@/lib/bank.config";
import { SITE, whatsappLink } from "@/lib/site.config";
import { rs } from "@/lib/format";
import { normalizePkPhone, isEmail, cleanHandle } from "@/lib/format";
import { amountsFor, ALLOWED_RECEIPT_TYPES, MAX_RECEIPT_BYTES, type FieldErrors } from "@/lib/validate";
import { captureAttribution, readAttribution } from "@/lib/attribution";
import { HonestLine, SampleTag } from "@/components/ui";
import { CopyButton } from "./CopyButton";

type Props = { initialPlan: PlanId | null };

/** Order ref survives a reload via sessionStorage. Tiny external store so React can subscribe. */
const refStore = (() => {
  const KEY = "dc_ref";
  const subs = new Set<() => void>();
  return {
    get: () => {
      try {
        return sessionStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    set: (v: string | null) => {
      try {
        if (v) sessionStorage.setItem(KEY, v);
        else sessionStorage.removeItem(KEY);
      } catch {}
      subs.forEach((f) => f());
    },
    subscribe: (f: () => void) => {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
})();

/** Reads ?plan= on the client. Static shell renders the Pro default. */
export function CheckoutWithParams() {
  const sp = useSearchParams();
  const p = sp.get("plan");
  return <CheckoutForm initialPlan={p === "basic" ? "basic" : "pro"} />;
}

export function CheckoutForm({ initialPlan }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>(initialPlan ?? "pro");
  const [bump, setBump] = useState(false);
  const [payIn2, setPayIn2] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [senderName, setSenderName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const ref = useSyncExternalStore(refStore.subscribe, refStore.get, () => null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const leadBusy = useRef(false);

  const payIn2Allowed = PAY_IN_2.enabled && plan === PAY_IN_2.plan;
  const effectivePayIn2 = payIn2Allowed && payIn2;
  const { total, dueNow } = useMemo(() => amountsFor({ plan, bump, payIn2: effectivePayIn2 }), [plan, bump, effectivePayIn2]);

  useEffect(() => {
    captureAttribution();
  }, []);

  /** Insert/update the lead row once name + WhatsApp are valid. */
  async function saveLead(over: Partial<{ plan: PlanId; bump: boolean; payIn2: boolean; email: string; instagram: string }> = {}) {
    const n = name.trim();
    const w = normalizePkPhone(whatsapp);
    if (n.length < 2 || !w || leadBusy.current) return;
    leadBusy.current = true;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ref,
          plan: over.plan ?? plan,
          bump: over.bump ?? bump,
          payIn2: over.payIn2 ?? effectivePayIn2,
          name: n,
          whatsapp: w,
          email: over.email ?? email,
          instagram: over.instagram ?? instagram,
          attribution: readAttribution(),
        }),
      });
      if (res.ok) {
        const j = (await res.json()) as { ref?: string };
        if (j.ref) refStore.set(j.ref);
      }
    } catch {
      /* lead save is best effort */
    } finally {
      leadBusy.current = false;
    }
  }

  function choosePlan(p: PlanId) {
    setPlan(p);
    void saveLead({ plan: p });
  }
  function toggleBump(v: boolean) {
    setBump(v);
    void saveLead({ bump: v });
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setErrors((x) => ({ ...x, receipt: undefined }));
    if (!f) return setFile(null);
    if (!ALLOWED_RECEIPT_TYPES.includes(f.type)) return setErrors((x) => ({ ...x, receipt: "JPG, PNG, WebP or PDF only." }));
    if (f.size > MAX_RECEIPT_BYTES) return setErrors((x) => ({ ...x, receipt: "Under 5 MB please." }));
    setFile(f);
  }

  function validateLocal(): FieldErrors {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = "Your name, at least 2 letters.";
    if (!normalizePkPhone(whatsapp)) e.whatsapp = "Pakistani number like 03XX XXXXXXX.";
    if (!isEmail(email)) e.email = "A real email. Your access link goes here.";
    if (cleanHandle(instagram).length < 2) e.instagram = "Your Instagram handle.";
    if (senderName.trim().length < 2) e.senderName = "Name on the sending account.";
    if (!file) e.receipt = "Upload your payment receipt.";
    return e;
  }

  async function submit() {
    setTopError(null);
    const e = validateLocal();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.scrollIntoView({ block: "center" });
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    if (ref) fd.set("ref", ref);
    fd.set("plan", plan);
    fd.set("bump", bump ? "1" : "0");
    fd.set("payIn2", effectivePayIn2 ? "1" : "0");
    fd.set("name", name.trim());
    fd.set("whatsapp", whatsapp);
    fd.set("email", email.trim());
    fd.set("instagram", cleanHandle(instagram));
    fd.set("senderName", senderName.trim());
    fd.set("attribution", JSON.stringify(readAttribution()));
    fd.set("receipt", file as File);
    try {
      const res = await fetch("/api/checkout/submit", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as { ref?: string; error?: string; fields?: FieldErrors };
      if (res.ok && j.ref) {
        refStore.set(null);
        router.push(`/thank-you?order=${j.ref}`);
        return;
      }
      if (j.fields) setErrors(j.fields);
      setTopError(
        j.error === "db_unavailable"
          ? "Payments are not switched on yet. WhatsApp us your receipt and we will sort it by hand."
          : j.error === "duplicate" || j.error === "locked"
            ? (j.fields?.receipt ?? "Already submitted.")
            : "Could not submit. Check the fields, or WhatsApp us the receipt.",
      );
    } catch {
      setTopError("Network dropped. Try again, or WhatsApp us the receipt.");
    } finally {
      setSubmitting(false);
    }
  }

  const wa = whatsappLink(`Hi, order ${ref ?? ""} ${PLANS[plan].name}, I paid ${rs(dueNow)} and need help with the receipt.`);
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="pb-28 lg:pb-16">
      {/* Dev-only loud banner */}
      {isDev && BANK.isDummy && (
        <div className="bg-coral px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-ink">
          Replace dummy bank details before launch
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
        <Link href="/" className="display text-lg">
          Direct<span className="text-lime">Collabs</span>
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-8">
            {/* 1. Plan */}
            <Step n={1} title="Plan">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Plan">
                {(["pro", "basic"] as PlanId[]).map((p) => {
                  const P = PLANS[p];
                  const on = plan === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => choosePlan(p)}
                      className={`rounded-card border-2 p-4 text-left transition-colors ${on ? "border-lime bg-ink-2" : "border-ink-4 bg-ink-2 hover:border-bone-3"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="display text-xl">{P.name}</span>
                        {P.recommended && <span className="rounded-pill bg-lime px-2 py-0.5 text-[11px] font-semibold text-ink">Recommended</span>}
                      </div>
                      <p className="display tnum mt-1 text-2xl">{rs(P.price)}</p>
                      <ul className="mt-2 space-y-1 text-[13px] text-bone-2">
                        {P.includes.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[12px] text-bone-3">
                        Needs {rs(AD_BUDGET.minPerDay)} to {AD_BUDGET.maxPerDay.toLocaleString()} a day for ads.
                      </p>
                    </button>
                  );
                })}
              </div>

              {plan === "basic" && (
                <div className="mt-3 flex flex-col gap-3 rounded-card border border-lime/40 bg-ink-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-bone-2">
                    <span className="font-semibold text-bone">Only {rs(UPGRADE.price)} more</span> gets you the 5 ad scripts, 20 DM replies and the
                    rate card. Most people need them on day one.
                  </p>
                  <button type="button" onClick={() => choosePlan("pro")} className="min-h-11 shrink-0 rounded-pill bg-lime px-4 text-sm font-semibold text-ink">
                    Switch to Pro
                  </button>
                </div>
              )}

              {payIn2Allowed && (
                <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-card border border-ink-4 bg-ink-2 p-4">
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-lime" checked={payIn2} onChange={(e) => { setPayIn2(e.target.checked); void saveLead({ payIn2: e.target.checked }); }} />
                  <span className="text-sm">
                    <span className="font-semibold">Pay in 2.</span>{" "}
                    <span className="text-bone-2">
                      {rs(PAY_IN_2.first)} now, {rs(PAY_IN_2.second)} in {PAY_IN_2.daysBetween} days. Access unlocks after the first part.
                    </span>
                  </span>
                </label>
              )}
            </Step>

            {/* 2. Details */}
            <Step n={2} title="Your details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="f-name" label="Name" error={errors.name}>
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveLead()} autoComplete="name" />
                </Field>
                <Field id="f-whatsapp" label="WhatsApp number" error={errors.whatsapp} hint="03XX XXXXXXX">
                  <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} onBlur={() => saveLead()} inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" />
                </Field>
                <Field id="f-email" label="Email" error={errors.email} hint="Access link goes here">
                  <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => saveLead({ email })} inputMode="email" autoComplete="email" type="email" />
                </Field>
                <Field id="f-instagram" label="Instagram handle" error={errors.instagram}>
                  <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} onBlur={() => saveLead({ instagram })} placeholder="@yourhandle" autoCapitalize="none" />
                </Field>
              </div>
            </Step>

            {/* 3. Bump */}
            <Step n={3} title="Add on">
              <label className={`flex cursor-pointer items-start gap-3 rounded-card border-2 p-4 ${bump ? "border-lime bg-ink-2" : "border-ink-4 bg-ink-2"}`}>
                <input type="checkbox" className="mt-1 h-5 w-5 accent-lime" checked={bump} onChange={(e) => toggleBump(e.target.checked)} />
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="display text-lg">{BUMP.name}</span>
                    <span className="display tnum text-lg">+{rs(BUMP.price)}</span>
                  </span>
                  <span className="mt-1 block text-sm text-bone-2">{BUMP.hook}</span>
                  <span className="mt-2 block text-[13px] text-bone-3">{BUMP.includes.join(" · ")}</span>
                </span>
              </label>
            </Step>

            {/* 4. Payment */}
            <Step n={4} title="Pay">
              <div className="rounded-card border border-ink-4 bg-ink-2 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-bone-2">Send exactly</p>
                  {BANK.isDummy && <SampleTag />}
                </div>
                <p className="display tnum text-4xl text-lime">{rs(dueNow)}</p>
                {effectivePayIn2 && <p className="mt-1 text-[13px] text-bone-3">Second part {rs(PAY_IN_2.second)} due in {PAY_IN_2.daysBetween} days.</p>}

                <div className="mt-4 rounded-xl border border-dashed border-bone-3 p-3">
                  <p className="text-[12px] text-bone-3">Put this in the transfer note or reference</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="display tnum text-2xl">{ref ?? "DC-····"}</span>
                    {ref ? <CopyButton value={ref} label="reference" /> : <span className="text-[12px] text-bone-3">Fill name + WhatsApp first</span>}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <PayRow label={`${BANK.bank.name} · ${BANK.bank.title}`} value={BANK.bank.account} sub={`IBAN ${BANK.bank.iban}`} />
                  <PayRow label={`Easypaisa · ${BANK.easypaisa.title}`} value={BANK.easypaisa.number} />
                  <PayRow label={`JazzCash · ${BANK.jazzcash.title}`} value={BANK.jazzcash.number} />
                </div>
              </div>
            </Step>

            {/* 5. Receipt */}
            <Step n={5} title="Receipt">
              <div className="grid gap-4">
                <Field id="f-receipt" label="Screenshot or PDF of the payment" error={errors.receipt} hint="JPG, PNG, WebP or PDF. Under 5 MB.">
                  <label className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-4 text-center ${file ? "border-lime" : "border-ink-4 hover:border-bone-3"}`}>
                    <input type="file" accept={ALLOWED_RECEIPT_TYPES.join(",")} onChange={onFile} className="sr-only" />
                    {file ? (
                      <>
                        <span className="text-sm font-semibold">{file.name}</span>
                        <span className="mt-1 text-[12px] text-bone-3">{(file.size / 1024).toFixed(0)} KB · tap to change</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold">Tap to upload</span>
                        <span className="mt-1 text-[12px] text-bone-3">The receipt screen from your bank or wallet app</span>
                      </>
                    )}
                  </label>
                </Field>
                <Field id="f-senderName" label="Name on the account you paid from" error={errors.senderName}>
                  <input className={inputCls} value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                </Field>
              </div>
            </Step>

            <HonestLine className="lg:hidden" />

            {topError && (
              <div role="alert" className="rounded-card border border-coral/60 bg-ink-2 p-4 text-sm">
                <p className="text-coral">{topError}</p>
                {wa && (
                  <a href={wa} className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold underline underline-offset-4">
                    WhatsApp the receipt instead
                  </a>
                )}
              </div>
            )}

            <div className="hidden lg:block">
              <SubmitButton onClick={submit} busy={submitting} dueNow={dueNow} />
              <HonestLine className="mt-3" />
            </div>
          </div>

          {/* Sticky summary (desktop) */}
          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <Summary plan={plan} bump={bump} total={total} dueNow={dueNow} payIn2={effectivePayIn2} />
          </aside>
        </div>
      </div>

      {/* Sticky summary + submit (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-4 bg-ink/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mb-2 flex items-center justify-between text-[13px]">
          <span className="text-bone-2">
            {PLANS[plan].name}
            {bump ? ` + ${BUMP.name}` : ""}
          </span>
          <span className="display tnum text-lg">{rs(dueNow)}</span>
        </div>
        <SubmitButton onClick={submit} busy={submitting} dueNow={dueNow} compact />
      </div>
    </div>
  );
}

const inputCls =
  "w-full min-h-12 rounded-xl border border-ink-4 bg-ink-2 px-4 text-base text-bone placeholder:text-bone-3 focus:border-lime focus:outline-none";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display mb-3 flex items-center gap-3 text-2xl">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-3 text-sm">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div id={id}>
      <label className="block text-sm text-bone-2">
        {label}
        <div className="mt-1.5">{children}</div>
      </label>
      {error ? <p className="mt-1.5 text-[13px] text-coral">{error}</p> : hint ? <p className="mt-1.5 text-[12px] text-bone-3">{hint}</p> : null}
    </div>
  );
}

function PayRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-ink p-3">
      <div className="min-w-0">
        <p className="truncate text-[12px] text-bone-3">{label}</p>
        <p className="tnum text-base font-semibold">{value}</p>
        {sub && <p className="tnum text-[12px] text-bone-3">{sub}</p>}
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

function Summary({ plan, bump, total, dueNow, payIn2 }: { plan: PlanId; bump: boolean; total: number; dueNow: number; payIn2: boolean }) {
  return (
    <div className="rounded-card border border-ink-4 bg-ink-2 p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Summary</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>{PLANS[plan].name}</dt>
          <dd className="tnum">{rs(PLANS[plan].price)}</dd>
        </div>
        {bump && (
          <div className="flex justify-between">
            <dt>{BUMP.name}</dt>
            <dd className="tnum">{rs(BUMP.price)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-ink-4 pt-2 font-semibold">
          <dt>Total</dt>
          <dd className="tnum">{rs(total)}</dd>
        </div>
        {payIn2 && (
          <div className="flex justify-between text-lime">
            <dt>Due now</dt>
            <dd className="tnum">{rs(dueNow)}</dd>
          </div>
        )}
      </dl>
      <p className="mt-4 text-[12px] text-bone-3">Access by email and WhatsApp once the receipt is verified. Usually minutes.</p>
      <p className="mt-2 text-[12px] text-bone-3">Questions? @{SITE.owner.instagram}</p>
    </div>
  );
}

function SubmitButton({ onClick, busy, dueNow, compact }: { onClick: () => void; busy: boolean; dueNow: number; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex w-full items-center justify-center rounded-pill bg-lime font-semibold text-ink disabled:opacity-60 ${compact ? "min-h-13 text-base" : "min-h-14 text-base"}`}
    >
      {busy ? "Uploading…" : `I have paid ${rs(dueNow)}, verify`}
    </button>
  );
}
