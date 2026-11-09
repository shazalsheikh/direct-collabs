"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PLANS, BUMP, UPGRADE, PAY_IN_2, AD_BUDGET, SELLABLE_PLANS, COACHING, type PlanId } from "@/lib/offer.config";
import { BANK, formatPkNumber } from "@/lib/bank.config";
import { SITE, whatsappLink } from "@/lib/site.config";
import { rs } from "@/lib/format";
import { normalizePkPhone, isEmail, cleanHandle } from "@/lib/format";
import { amountsFor, ALLOWED_RECEIPT_TYPES, MAX_RECEIPT_BYTES, type FieldErrors } from "@/lib/validate";
import { captureAttribution, readAttribution } from "@/lib/attribution";
import { track, whenIdle } from "@/lib/track";
import { HonestLine, SampleTag } from "@/components/ui";
import { CopyButton } from "./CopyButton";

type Linked = { kind: "upgrade" | "second"; parentRef: string } | null;
type Props = { initialPlan: PlanId | null; linked?: Linked };

const DETAILS_KEY = "dc_details";
function savedDetails(): { name?: string; whatsapp?: string; email?: string; instagram?: string } {
  try {
    return JSON.parse(sessionStorage.getItem(DETAILS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

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
  const up = sp.get("upgrade");
  const second = sp.get("second");
  const okRef = (r: string | null) => (r && /^DC-[A-Z0-9]{4}$/.test(r) ? r : null);
  const linked: Linked = okRef(up) ? { kind: "upgrade", parentRef: okRef(up) as string } : okRef(second) ? { kind: "second", parentRef: okRef(second) as string } : null;
  return <CheckoutForm initialPlan={p && (SELLABLE_PLANS as string[]).includes(p) ? (p as PlanId) : "pro"} linked={linked} />;
}

export function CheckoutForm({ initialPlan, linked = null }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>(initialPlan ?? "pro");
  const [bump, setBump] = useState(false);
  const [payIn2, setPayIn2] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const ref = useSyncExternalStore(refStore.subscribe, refStore.get, () => null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const leadBusy = useRef(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [continuing, setContinuing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const coaching = plan === "coaching" && !linked;

  const payIn2Allowed = !linked && PAY_IN_2.enabled && plan === PAY_IN_2.plan;
  const effectivePayIn2 = payIn2Allowed && payIn2;
  const { total, dueNow } = useMemo(() => amountsFor({ plan, bump, payIn2: effectivePayIn2 }, linked?.kind), [plan, bump, effectivePayIn2, linked]);

  useEffect(() => {
    captureAttribution();
    // Linked orders prefill from the same device's last checkout.
    if (linked) {
      const d = savedDetails();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (d.name) setName(d.name);
      if (d.whatsapp) setWhatsapp(d.whatsapp);
      if (d.email) setEmail(d.email);
      if (d.instagram) setInstagram(d.instagram);
    }
    whenIdle(() => track("InitiateCheckout", { value: dueNow, once: true }));
  }, [linked, dueNow]);

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
          kind: linked?.kind,
          parentRef: linked?.parentRef,
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
    if (!file) e.receipt = "Upload your payment receipt.";
    return e;
  }

  const STEP_ONE_FIELDS = ["name", "whatsapp", "email", "instagram"];

  function goTo(next: 1 | 2) {
    setStep(next);
    setTopError(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  /** Step 1 -> 2. Validates plan details, saves the lead so the DC reference exists, then shows payment. */
  async function continueToPayment() {
    setTopError(null);
    const v = validateLocal();
    const e: FieldErrors = {};
    for (const k of STEP_ONE_FIELDS as ("name" | "whatsapp" | "email" | "instagram")[]) if (v[k]) e[k] = v[k];
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.scrollIntoView({ block: "center" });
      return;
    }
    if (coaching && !agreed) {
      setTermsError(true);
      document.getElementById("f-terms")?.scrollIntoView({ block: "center" });
      return;
    }
    setContinuing(true);
    await saveLead({ email, instagram });
    setContinuing(false);
    goTo(2);
  }

  async function submit() {
    setTopError(null);
    const e = validateLocal();
    setErrors(e);
    if (Object.keys(e).some((k) => STEP_ONE_FIELDS.includes(k))) {
      goTo(1);
      return;
    }
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.scrollIntoView({ block: "center" });
      return;
    }
    track("AddPaymentInfo", { value: dueNow });
    setSubmitting(true);
    const fd = new FormData();
    if (ref) fd.set("ref", ref);
    if (linked) {
      fd.set("kind", linked.kind);
      fd.set("parentRef", linked.parentRef);
    }
    try {
      sessionStorage.setItem(DETAILS_KEY, JSON.stringify({ name: name.trim(), whatsapp, email: email.trim(), instagram: cleanHandle(instagram) }));
    } catch {}
    fd.set("plan", plan);
    fd.set("bump", bump ? "1" : "0");
    fd.set("payIn2", effectivePayIn2 ? "1" : "0");
    fd.set("name", name.trim());
    fd.set("whatsapp", whatsapp);
    fd.set("email", email.trim());
    fd.set("instagram", cleanHandle(instagram));
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
      if (j.fields) {
        setErrors(j.fields);
        if (Object.keys(j.fields).some((k) => STEP_ONE_FIELDS.includes(k))) goTo(1);
      }
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
          Replace dummy payment details before launch
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
        <Link href="/" className="display inline-flex min-h-11 items-center text-lg">
          Direct<span className="text-lime">Collabs</span>
        </Link>
        <Stepper step={step} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-8">
            {step === 1 ? (
              <>
                {/* Plan */}
                <Step title={linked ? (linked.kind === "upgrade" ? "Upgrade" : "Second payment") : (SELLABLE_PLANS.length > 1 ? "Choose your offer" : "Your order")}>
                  {linked && (
                    <div className="rounded-card border-2 border-lime bg-ink-2 p-4">
                      <div className="flex items-center justify-between">
                        <span className="display text-xl">{linked.kind === "upgrade" ? "Basic to Pro" : "Pay-in-2, part 2"}</span>
                        <span className="text-xs text-bone-3">for order {linked.parentRef}</span>
                      </div>
                      <p className="display tnum mt-1 text-2xl">{rs(total)}</p>
                      <p className="mt-2 text-[13px] text-bone-2">
                        {linked.kind === "upgrade"
                          ? "Unlocks the 5 ad scripts, 20 DM replies and the rate card on your existing access link."
                          : `Second half of your ${PLANS.pro.name} plan. Your access stays open.`}
                      </p>
                    </div>
                  )}
                  <div className={`grid gap-3 ${SELLABLE_PLANS.length > 1 ? "sm:grid-cols-2" : ""} ${linked ? "hidden" : ""}`} role="radiogroup" aria-label="Plan">
                    {SELLABLE_PLANS.map((p) => {
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
                          {p === "coaching" && (
                            <p className="mt-2 text-[13px] text-bone-2">
                              Then {rs(COACHING.successFee)} only after you earn {rs(COACHING.revenueTarget)} or more.
                            </p>
                          )}
                          <p className="mt-2 text-[12px] text-bone-3">
                            Needs {rs(AD_BUDGET.minPerDay)} to {AD_BUDGET.maxPerDay.toLocaleString()} a day for ads.
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {!linked && plan === "basic" && (
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

                {/* Details */}
                <Step title="Your details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="f-name" label="Name" error={errors.name}>
                      <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveLead()} autoComplete="name" />
                    </Field>
                    <Field id="f-whatsapp" label="WhatsApp number" error={errors.whatsapp} hint="03XX XXXXXXX">
                      <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} onBlur={() => saveLead()} inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" />
                    </Field>
                    <Field id="f-email" label="Email" error={errors.email} hint="For your order updates">
                      <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => saveLead({ email })} inputMode="email" autoComplete="email" type="email" />
                    </Field>
                    <Field id="f-instagram" label="Instagram handle" error={errors.instagram}>
                      <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} onBlur={() => saveLead({ instagram })} placeholder="@yourhandle" autoCapitalize="none" />
                    </Field>
                  </div>
                </Step>

                {/* Coaching terms */}
                {coaching && (
                  <Step title="How the coaching fee works">
                    <div id="f-terms" className={`rounded-card border-2 bg-ink-2 p-4 ${termsError ? "border-coral" : "border-ink-4"}`}>
                      <p className="text-[15px] leading-relaxed text-bone-2">
                        You pay {rs(COACHING.upfront)} now. A further {rs(COACHING.successFee)} is due only if brand deals that came through your system pay you{" "}
                        {rs(COACHING.revenueTarget)} or more within {COACHING.windowMonths} months of your first ad going live. You show the payment screenshots. If the total stays
                        below that, you owe nothing more. No result is promised. I confirm these terms with you on WhatsApp and book your first call.
                      </p>
                      <label className="mt-4 flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-5 w-5 accent-lime"
                          checked={agreed}
                          onChange={(e) => {
                            setAgreed(e.target.checked);
                            if (e.target.checked) setTermsError(false);
                          }}
                        />
                        <span className="text-sm font-semibold">I have read and agree to this.</span>
                      </label>
                      {termsError && <p className="mt-2 text-sm text-coral">Tick the box to continue.</p>}
                    </div>
                  </Step>
                )}

                {/* Bump */}
                {!linked && BUMP.enabled && (
                  <Step title="Add on">
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
                )}

                <HonestLine className="lg:hidden" />
                <div className="hidden lg:block">
                  <PrimaryButton onClick={continueToPayment} busy={continuing} label={`Continue to payment · ${rs(dueNow)}`} busyLabel="One sec…" />
                  <HonestLine className="mt-3" />
                </div>
              </>
            ) : (
              <>
                <button type="button" onClick={() => goTo(1)} className="-mb-3 inline-flex min-h-11 items-center gap-2 text-sm text-bone-2 hover:text-bone">
                  <span aria-hidden="true">←</span> Back to details
                </button>

                {/* Pay */}
                <section>
                  <h2 className="display text-3xl sm:text-4xl">Pay {rs(dueNow)}</h2>
                  <p className="mt-2 text-bone-2">Send it from Easypaisa or JazzCash. It takes under a minute.</p>

                  <div className="mt-5 rounded-card border border-ink-4 bg-ink-2 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">You transfer exactly</p>
                      {BANK.isDummy && <SampleTag />}
                    </div>
                    <p className="display tnum mt-1 text-4xl text-lime">{rs(dueNow)}</p>
                    {effectivePayIn2 && (
                      <p className="mt-1 text-[13px] text-bone-3">
                        Second part {rs(PAY_IN_2.second)} due in {PAY_IN_2.daysBetween} days.
                      </p>
                    )}
                  </div>

                  <div className="mt-3 rounded-card border border-ink-4 bg-ink-2">
                    <div className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">{BANK.wallet.label} number</p>
                        <p className="tnum mt-1 text-2xl font-semibold">{formatPkNumber(BANK.wallet.number)}</p>
                      </div>
                      <CopyButton value={BANK.wallet.number} label="number" />
                    </div>
                    <div className="border-t border-ink-4 p-5">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Account title</p>
                      <p className="mt-1 text-lg font-semibold">{BANK.wallet.title}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[15px] leading-relaxed text-bone-2">
                    Open Easypaisa or JazzCash, choose Send Money to a mobile account, paste the number and enter the exact amount.
                  </p>

                  {ref && (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-bone-3 p-3">
                      <p className="text-[13px] text-bone-2">
                        If your app has a note field, add <span className="display tnum text-base text-bone">{ref}</span>. Optional, it only helps us find your payment.
                      </p>
                      <CopyButton value={ref} label="reference" />
                    </div>
                  )}
                </section>

                {/* Receipt */}
                <Step title="Upload your payment screenshot">
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
                            <span className="mt-1 text-[12px] text-bone-3">The receipt screen from your Easypaisa or JazzCash app</span>
                          </>
                        )}
                      </label>
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
                  <PrimaryButton onClick={submit} busy={submitting} label={coaching ? "Verify and start coaching" : "Verify and get the access"} busyLabel="Verifying…" />
                  <HonestLine className="mt-3" />
                </div>
              </>
            )}
          </div>

          {/* Sticky summary (desktop) */}
          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <Summary plan={plan} bump={bump} total={total} dueNow={dueNow} payIn2={effectivePayIn2} linked={linked} />
          </aside>
        </div>
      </div>

      {/* Sticky summary + action (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-4 bg-ink/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mb-2 flex items-center justify-between text-[13px]">
          <span className="text-bone-2">
            {linked ? (linked.kind === "upgrade" ? "Upgrade to Pro" : "Second payment") : PLANS[plan].name}
            {!linked && bump ? ` + ${BUMP.name}` : ""}
          </span>
          <span className="display tnum text-lg">{rs(dueNow)}</span>
        </div>
        {step === 1 ? (
          <PrimaryButton onClick={continueToPayment} busy={continuing} label="Continue to payment" busyLabel="One sec…" compact />
        ) : (
          <PrimaryButton onClick={submit} busy={submitting} label={coaching ? "Verify and start coaching" : "Verify and get the access"} busyLabel="Verifying…" compact />
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full min-h-12 rounded-xl border border-ink-4 bg-ink-2 px-4 text-base text-bone placeholder:text-bone-3 focus:border-lime focus:outline-none";

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display mb-3 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

/** Two steps: "Plan and details", then "Payment". */
function Stepper({ step }: { step: 1 | 2 }) {
  const dot = "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold";
  return (
    <ol className="mt-3 flex items-center gap-3 text-sm" aria-label="Checkout steps">
      <li className="flex items-center gap-2" aria-current={step === 1 ? "step" : undefined}>
        <span className={`${dot} ${step > 1 ? "bg-lime text-ink" : "bg-bone text-ink"}`}>{step > 1 ? "✓" : "1"}</span>
        <span className={step === 1 ? "font-semibold" : "text-bone-3"}>Plan and details</span>
      </li>
      <li className="h-px w-8 bg-ink-4" aria-hidden="true" />
      <li className="flex items-center gap-2" aria-current={step === 2 ? "step" : undefined}>
        <span className={`${dot} ${step === 2 ? "bg-bone text-ink" : "border border-ink-4 text-bone-3"}`}>2</span>
        <span className={step === 2 ? "font-semibold" : "text-bone-3"}>Payment</span>
      </li>
    </ol>
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

function Summary({ plan, bump, total, dueNow, payIn2, linked }: { plan: PlanId; bump: boolean; total: number; dueNow: number; payIn2: boolean; linked: Linked }) {
  return (
    <div className="rounded-card border border-ink-4 bg-ink-2 p-5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-bone-3">Summary</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>{linked ? (linked.kind === "upgrade" ? "Upgrade to Pro" : "Second payment") : PLANS[plan].name}</dt>
          <dd className="tnum">{rs(linked ? total : PLANS[plan].price)}</dd>
        </div>
        {!linked && bump && (
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
      <p className="mt-4 text-[12px] text-bone-3">
        {plan === "coaching" && !linked
          ? "Once we verify the receipt, I message you on WhatsApp to confirm the terms and book your first call."
          : "Your access unlocks once we verify the receipt, usually within a few hours and often faster. We also send the link on WhatsApp."}
      </p>
      <p className="mt-2 text-[12px] text-bone-3">Questions? @{SITE.owner.instagram}</p>
    </div>
  );
}

function PrimaryButton({ onClick, busy, label, busyLabel, compact }: { onClick: () => void; busy: boolean; label: string; busyLabel: string; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex w-full items-center justify-center rounded-pill bg-lime font-semibold text-ink disabled:opacity-60 ${compact ? "min-h-13 text-base" : "min-h-14 text-base"}`}
    >
      {busy ? busyLabel : label}
    </button>
  );
}
