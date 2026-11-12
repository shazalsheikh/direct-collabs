"use client";

import { useState } from "react";
import { FOLLOWER_RANGES, RATE_RANGES, PAID_STATUS, NOTE_MAX, type ApplyErrors } from "@/lib/apply.config";
import { whatsappLink } from "@/lib/site.config";
import { normalizePkPhone, cleanHandle } from "@/lib/format";
import { readAttribution } from "@/lib/attribution";
import { track } from "@/lib/track";

const inputCls =
  "w-full min-h-12 rounded-xl border border-ink-4 bg-ink px-4 text-base text-bone placeholder:text-bone-3 focus:border-lime focus:outline-none";

/**
 * The application form. Posts to /api/apply, then shows a confirmation with a WhatsApp shortcut.
 * Validation here mirrors the server so errors show before the round trip; the server is the authority.
 */
export function ApplyForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [followers, setFollowers] = useState("");
  const [rate, setRate] = useState("");
  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, stays empty for real people
  const [errors, setErrors] = useState<ApplyErrors>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): ApplyErrors {
    const e: ApplyErrors = {};
    if (name.trim().length < 2) e.name = "Your name, at least 2 letters.";
    if (!normalizePkPhone(whatsapp)) e.whatsapp = "Pakistani number like 03XX XXXXXXX.";
    if (cleanHandle(instagram).length < 2) e.instagram = "Your Instagram handle.";
    if (!followers) e.followers = "Pick your follower range.";
    if (!rate) e.rate = "Pick what you charge for one reel.";
    if (!paid) e.paid_status = "Pick one.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setTopError(null);
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`a-${first}`)?.scrollIntoView({ block: "center" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), whatsapp, instagram: cleanHandle(instagram), followers, rate, paid_status: paid, note: note.trim(), website, attribution: readAttribution() }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; fields?: ApplyErrors };
      if (res.ok && j.ok) {
        track("Lead", { once: true });
        setDone(true);
        document.getElementById("apply")?.scrollIntoView({ block: "start" });
        return;
      }
      if (j.fields) setErrors(j.fields);
      setTopError(j.fields ? "Please check the fields marked below." : "Could not send your application. Try again, or message us on WhatsApp.");
    } catch {
      setTopError("Network dropped. Try again, or message us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  const handle = cleanHandle(instagram);
  const wa = whatsappLink(`Hi, I just applied on DirectCollabs.${handle ? ` My Instagram is @${handle}.` : ""}`);

  if (done) {
    return (
      <div className="rounded-card border-2 border-lime bg-ink-2 p-6 sm:p-8" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">Application received</p>
        <p className="display mt-3 text-3xl sm:text-4xl">Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}.</p>
        <p className="mt-3 text-bone-2">We will look at your page and message you on WhatsApp, usually within a day or two.</p>
        {wa && (
          <a href={wa} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink">
            Message us on WhatsApp now
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-card border border-ink-4 bg-ink-2 p-5 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="a-name" label="Your name" error={errors.name}>
          <input id="a-name-input" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field id="a-whatsapp" label="WhatsApp number" error={errors.whatsapp}>
          <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" />
        </Field>
        <Field id="a-instagram" label="Instagram handle" error={errors.instagram} className="sm:col-span-2">
          <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" autoCapitalize="none" autoCorrect="off" />
        </Field>
      </div>

      <Pills id="a-followers" label="How many followers do you have?" options={FOLLOWER_RANGES} value={followers} onChange={setFollowers} error={errors.followers} />
      <Pills id="a-paid_status" label="Do brands pay you for collabs today?" options={PAID_STATUS} value={paid} onChange={setPaid} error={errors.paid_status} />
      <Pills id="a-rate" label="What do you charge a brand for one reel?" options={RATE_RANGES} value={rate} onChange={setRate} error={errors.rate} />

      <Field id="a-note" label="Anything we should know? (optional)" className="mt-6">
        <textarea className={`${inputCls} min-h-24 py-3`} value={note} onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))} rows={3} />
      </Field>

      {/* Honeypot. Hidden from people and screen readers; bots tend to fill every input. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {topError && (
        <div role="alert" className="mt-5 rounded-card border border-coral/60 bg-ink p-4 text-sm">
          <p className="text-coral">{topError}</p>
          {wa && (
            <a href={wa} className="mt-2 inline-flex min-h-10 items-center font-semibold underline underline-offset-4">
              Message us on WhatsApp
            </a>
          )}
        </div>
      )}

      <button type="submit" disabled={busy} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-pill bg-lime text-base font-semibold text-ink disabled:opacity-60">
        {busy ? "Sending…" : "Send my application"}
      </button>
      <p className="mt-3 text-center text-[13px] text-bone-3">No payment here. We only use your details to contact you about this.</p>
    </form>
  );
}

function Field({ id, label, error, className = "", children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label id={id} className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-coral">{error}</span>}
    </label>
  );
}

/** Single-choice pill group. Bigger tap targets than a dropdown on a phone. */
function Pills({ id, label, options, value, onChange, error }: { id: string; label: string; options: readonly string[]; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <fieldset id={id} className="mt-6">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o)}
              className={`min-h-11 rounded-pill border px-4 text-sm transition-colors ${on ? "border-lime bg-lime font-semibold text-ink" : "border-ink-4 bg-ink text-bone-2 hover:border-bone-3"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-sm text-coral">{error}</p>}
    </fieldset>
  );
}
