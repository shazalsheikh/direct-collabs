import { Suspense } from "react";
import { Section, Eyebrow, LinkButton, HonestLine } from "@/components/ui";
import { PLANS, AD_BUDGET, FOUNDING, PAY_IN_2, COACHING, COACHING_TOTAL } from "@/lib/offer.config";
import { rs } from "@/lib/format";
import { countVerifiedSales } from "@/lib/db";

/**
 * Two offers, nothing else.
 * 1. The Course: recorded lectures, you do it yourself. Buys through /checkout.
 * 2. Coaching: live 1-on-1 and a full setup. Same checkout, same screenshot upload, Rs 50,000 to start.
 * Every number comes from lib/offer.config.ts.
 */
export function Plans() {
  const budget = `Needs ${rs(AD_BUDGET.minPerDay)} to ${rs(AD_BUDGET.maxPerDay).replace("Rs ", "")} a day for ads.`;
  return (
    <Section id="plans" wide>
      <Eyebrow>Two ways in</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">Do it yourself, or do it with me.</h2>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        {/* The course */}
        <div className="flex flex-col rounded-card border-2 border-lime bg-ink-2 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-pill bg-lime px-3 py-1 text-xs font-semibold text-ink">Start tonight</span>
            <span className="text-xs text-bone-3">Access after payment check</span>
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
          <div className="mt-auto pt-7">
            <LinkButton href="/checkout?plan=pro" className="w-full">
              Get the course · {rs(PLANS.pro.price)}
            </LinkButton>
            <p className="mt-3 text-[13px] text-bone-2">{budget}</p>
          </div>
        </div>

        {/* Coaching */}
        <div className="flex flex-col rounded-card border border-ink-4 bg-ink-2 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-pill border border-bone-3 px-3 py-1 text-xs font-semibold text-bone">Done with you</span>
            <span className="text-xs text-bone-3">Live, 1-on-1</span>
          </div>
          <h3 className="display mt-5 text-3xl">{COACHING.name}</h3>
          <p className="mt-2 text-sm text-bone-2">
            Full price <span className="tnum font-semibold text-bone">{rs(COACHING_TOTAL)}</span>
          </p>
          <p className="display tnum text-5xl">
            {rs(COACHING.upfront)} <span className="text-2xl text-lime">today</span>
          </p>
          <p className="mt-1 text-sm text-bone-2">
            The other {rs(COACHING.successFee)} only after you earn {rs(COACHING.revenueTarget)} or more.
          </p>
          <p className="mt-3 text-bone-2">I sit with you on live Zoom and build the whole system on your own page.</p>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {COACHING.includes.map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check />
                {x}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-ink-4 bg-ink p-4 text-[14px] leading-relaxed text-bone-2">
            <p className="font-semibold text-bone">How the {rs(COACHING.successFee)} works</p>
            <p className="mt-1">
              You pay it only if brand deals that came through your system pay you {rs(COACHING.revenueTarget)} or more within {COACHING.windowMonths} months of your
              first ad going live. You show me the payment screenshots. If the total stays below that, you owe nothing more.
            </p>
          </div>

          <div className="mt-auto pt-7">
            <LinkButton href="/checkout?plan=coaching" className="w-full">
              Start coaching · Pay {rs(COACHING.upfront)} today
            </LinkButton>
            <p className="mt-3 text-[13px] text-bone-2">
              {budget} After you pay, I message you on WhatsApp to confirm the terms and book your first call. No result is promised.
            </p>
          </div>
        </div>
      </div>
      <HonestLine className="mt-6" />
    </Section>
  );
}

/** Founding price counter. Real verified count only. Hidden until FOUNDING.showAt. */
async function Founding() {
  if (!FOUNDING.enabled) return null;
  const sold = await countVerifiedSales("pro");
  if (sold === null || sold < FOUNDING.showAt || sold >= FOUNDING.limit) return null;
  return (
    <p className="mt-2 text-sm text-bone-2">
      Founding price. <span className="tnum font-semibold text-bone">{FOUNDING.limit - sold}</span> of{" "}
      {FOUNDING.limit} spots left at {rs(PLANS.pro.price)}. After that it is {rs(FOUNDING.priceAfter)}.
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
