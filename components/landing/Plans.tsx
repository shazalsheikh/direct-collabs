import { Suspense } from "react";
import { Section, Eyebrow, LinkButton, HonestLine } from "@/components/ui";
import { PLANS, UPGRADE, AD_BUDGET, FOUNDING, PAY_IN_2 } from "@/lib/offer.config";
import { rs } from "@/lib/format";
import { countVerifiedSales } from "@/lib/db";

export function Plans() {
  const budget = `Needs ${rs(AD_BUDGET.minPerDay)} to ${rs(AD_BUDGET.maxPerDay).replace("Rs ", "")} a day for ads.`;
  return (
    <Section id="plans" wide>
      <Eyebrow>Pick one</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">Start tonight.</h2>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        {/* Pro */}
        <div className="rounded-card border-2 border-lime bg-ink-2 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-pill bg-lime px-3 py-1 text-xs font-semibold text-ink">Recommended</span>
            <span className="text-xs text-bone-3">Only {rs(UPGRADE.price)} more</span>
          </div>
          <h3 className="display mt-5 text-3xl">{PLANS.pro.name}</h3>
          <p className="display tnum mt-1 text-5xl">{rs(PLANS.pro.price)}</p>
          <Suspense fallback={null}>
            <Founding />
          </Suspense>
          {PAY_IN_2.enabled && (
            <p className="mt-2 text-sm text-bone-2">
              Or {rs(PAY_IN_2.first)} now, {rs(PAY_IN_2.second)} in {PAY_IN_2.daysBetween} days.
            </p>
          )}
          <p className="mt-3 text-bone-2">{PLANS.pro.tagline}</p>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {PLANS.pro.includes.map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check />
                {x}
              </li>
            ))}
          </ul>
          <LinkButton href="/checkout?plan=pro" className="mt-7 w-full">
            Get Pro · {rs(PLANS.pro.price)}
          </LinkButton>
          <p className="mt-3 text-[13px] text-bone-2">{budget}</p>
        </div>

        {/* Basic */}
        <div className="rounded-card border border-ink-4 bg-ink-2 p-6">
          <h3 className="display text-2xl">{PLANS.basic.name}</h3>
          <p className="display tnum mt-1 text-4xl">{rs(PLANS.basic.price)}</p>
          <p className="mt-3 text-sm text-bone-2">{PLANS.basic.tagline}</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {PLANS.basic.includes.map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check muted />
                {x}
              </li>
            ))}
          </ul>
          <LinkButton href="/checkout?plan=basic" variant="outline" className="mt-7 w-full">
            Get Basic · {rs(PLANS.basic.price)}
          </LinkButton>
          <p className="mt-3 text-[13px] text-bone-2">{budget}</p>
        </div>
      </div>
      <HonestLine className="mt-6" />
    </Section>
  );
}

/** Founding price counter. Real verified count only. Hidden until FOUNDING.showAt. */
async function Founding() {
  const sold = await countVerifiedSales("pro");
  if (sold === null || sold < FOUNDING.showAt || sold >= FOUNDING.limit) return null;
  return (
    <p className="mt-2 text-sm text-bone-2">
      Founding price. <span className="tnum font-semibold text-bone">{FOUNDING.limit - sold}</span> of{" "}
      {FOUNDING.limit} left at this price, then {rs(FOUNDING.priceAfter)}.
    </p>
  );
}

function Check({ muted = false }: { muted?: boolean }) {
  return (
    <svg className={`mt-1 h-4 w-4 shrink-0 ${muted ? "text-bone-3" : "text-lime"}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
