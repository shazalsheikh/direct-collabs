import { Section, Eyebrow } from "@/components/ui";
import { AD_BUDGET, GUARANTEE, PLANS } from "@/lib/offer.config";
import { SITE } from "@/lib/site.config";
import { rs } from "@/lib/format";

export function FAQ() {
  const g = GUARANTEE[GUARANTEE.type];
  const items: [string, string][] = [
    [
      "Big following needed?",
      `No. Smaller creators run this too. But the ad costs about ${rs(AD_BUDGET.perMonthAtMin)} a month, so your rate decides whether it pays. Use the calculator above before you buy.`,
    ],
    [`${rs(AD_BUDGET.minPerDay)} a day, really?`, "Yes. That is the budget the whole course is built around. You can go higher later, you never need to."],
    ["What if I get no forms?", g.headline + " " + g.body],
    [
      "Only paid, no barter?",
      "The form asks the brand to pick paid or barter and a budget range before they submit. You decide what to reply to. Barter requests land in a separate bucket.",
    ],
    [
      "Camera shy?",
      "It is a 40-second video, not a vlog. Chapter 1 gives you the script word for word. Record it on your phone in one take.",
    ],
    ["Language?", `${SITE.course.language}. Recorded the way people in Lahore actually talk.`],
    [
      "How do I pay, and when do I get access?",
      "Easypaisa or JazzCash. Upload the receipt on the checkout page. Most receipts verify automatically in a few minutes and the access link lands in your email and WhatsApp. If it needs a manual check, usually within a few hours.",
    ],
    [
      "Is this a guaranteed income?",
      `No. ${PLANS.pro.name} teaches you to get brand owners to apply. Who you say yes to, what you charge, and how fast you reply are on you.`,
    ],
  ];

  return (
    <Section tone="ink-2" wide>
      <Eyebrow>Questions</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">Before you ask.</h2>
      <div className="mt-8 divide-y divide-ink-4 rounded-card border border-ink-4 bg-ink">
        {items.map(([q, a]) => (
          <details key={q} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              {q}
              <span className="text-bone-3 transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-bone-2">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
