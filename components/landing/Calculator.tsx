"use client";

import { useId, useState } from "react";
import { Section, Eyebrow } from "@/components/ui";
import { ANCHOR, AD_BUDGET } from "@/lib/offer.config";
import { rs } from "@/lib/format";

const MIN = 1000;
const MAX = 50000;
const STEP = 500;
const CUTS = [20, 30, 40] as const;

/** Second surprise: "Do the math". Pure client state, no deps. */
export function Calculator() {
  const [rate, setRate] = useState(8000);
  const [cut, setCut] = useState<number>(ANCHOR.agencyCutPct);
  const id = useId();

  const agencyKeeps = Math.round((rate * cut) / 100);
  const adsPerMonth = AD_BUDGET.perMonthAtMin;
  const dealsToCover = Math.max(1, Math.ceil(adsPerMonth / rate));
  const pct = ((rate - MIN) / (MAX - MIN)) * 100;

  return (
    <Section wide>
      <Eyebrow>Do the math</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">Ap ka rate. Ap ki ads. Ap ka hisaab.</h2>
      <p className="mt-3 max-w-xl text-bone-2">Ap brand se jitna charge kro, wahi ap ka rate hai. Slider hilao, hisaab khud badal jata hai.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-ink-4 bg-ink-2 p-5 sm:p-6">
          <label htmlFor={id} className="block">
            <span className="block text-sm text-bone-2">What you charge a brand, per video</span>
            <span className="display tnum mt-1 block text-4xl text-lime">{rs(rate)}</span>
          </label>
          <input
            id={id}
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="range mt-5 w-full"
            style={{ ["--pct" as string]: `${pct}%` }}
            aria-valuetext={rs(rate)}
          />
          <div className="mt-2 flex justify-between text-[12px] text-bone-3">
            <span>{rs(MIN)}</span>
            <span>{rs(MAX)}</span>
          </div>

          <div className="mt-5 border-t border-ink-4 pt-4">
            <p className="text-sm text-bone-2">What an agency keeps from your fee</p>
            <div className="mt-2 flex gap-2" role="group" aria-label="Agency cut">
              {CUTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cut === c}
                  onClick={() => setCut(c)}
                  className={`min-h-11 flex-1 rounded-pill border text-sm font-semibold ${cut === c ? "border-bone bg-bone text-ink" : "border-ink-4 text-bone-2 hover:border-bone-3"}`}
                >
                  {c}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <dl className="grid gap-3">
          <Row label={`Agency keeps at ${cut}%`} value={rs(agencyKeeps)} note="per deal" warn big />
          <Row label={`Ad spend per month at ${rs(AD_BUDGET.minPerDay)}/day`} value={rs(adsPerMonth)} note="30 days" />
          <Row
            label="Deals needed to cover the ads"
            value={String(dealsToCover)}
            note={dealsToCover === 1 ? "deal a month" : "deals a month"}
            lime
          />
        </dl>
      </div>

      <p className="mt-8 text-lg text-bone-2">
        Rate kam hai? <span className="text-bone">Chapter 5 is only about that.</span>
      </p>

      <style>{`
        .range{appearance:none;-webkit-appearance:none;height:44px;background:transparent;cursor:pointer}
        .range::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(to right,#C8FF2E var(--pct),#2a2a2a var(--pct))}
        .range::-moz-range-track{height:6px;border-radius:999px;background:#2a2a2a}
        .range::-moz-range-progress{height:6px;border-radius:999px;background:#C8FF2E}
        .range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:999px;background:#F4F1EA;border:4px solid #0A0A0A;margin-top:-11px;box-shadow:0 0 0 1px #2a2a2a}
        .range::-moz-range-thumb{width:28px;height:28px;border-radius:999px;background:#F4F1EA;border:4px solid #0A0A0A;box-shadow:0 0 0 1px #2a2a2a}
      `}</style>
    </Section>
  );
}

function Row({
  label,
  value,
  note,
  lime,
  warn,
  big,
}: {
  label: string;
  value: string;
  note: string;
  lime?: boolean;
  warn?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-ink-4 bg-ink-2 px-5 py-4">
      <dt className="min-w-0 text-sm text-bone-2">{label}</dt>
      <dd className="shrink-0 text-right">
        <span className={`display tnum whitespace-nowrap ${big ? "text-3xl" : "text-2xl"} ${lime ? "text-lime" : warn ? "text-coral" : ""}`}>{value}</span>
        <span className="block text-[11px] text-bone-3">{note}</span>
      </dd>
    </div>
  );
}
