import { Section, Eyebrow } from "@/components/ui";
import { AD_BUDGET, GUARANTEE, PLANS, COACHING, COACHING_TOTAL } from "@/lib/offer.config";
import { SITE } from "@/lib/site.config";
import { rs } from "@/lib/format";

export function FAQ() {
  const g = GUARANTEE[GUARANTEE.type];
  const items: [string, string][] = [
    [
      "Do I need a big following?",
      `No. Creators with 5k and 10k followers use this too, and it is built to help smaller pages get their first paid collabs. The ad costs about ${rs(AD_BUDGET.perMonthAtMin)} a month, so at a smaller rate you need a few deals to cover it. Use the calculator above before you buy.`,
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
    ["Language?", `${SITE.course.language}. Recorded the way people actually talk.`],
    [
      "How do I pay, and when do I get access?",
      "Easypaisa or JazzCash. Upload the receipt on the checkout page. We check every receipt, usually within a few hours and often faster. Your access unlocks on the page you land on after paying, and we send the link on WhatsApp too.",
    ],
    [
      "Course or 1-on-1 coaching?",
      `The course is for you if you are happy to set up the ad yourself from recorded lectures. Coaching is for you if you want me on live Zoom building the setup with you. You pay at checkout like the course, and I message you on WhatsApp to book your first call.`,
    ],
    [
      `Why is the ${rs(COACHING.successFee)} only after ${rs(COACHING.revenueTarget)}?`,
      `The full coaching price is ${rs(COACHING_TOTAL)}, and you pay ${rs(COACHING.upfront)} today. The other ${rs(COACHING.successFee)} is due only if brand deals that came through your system have paid you ${rs(COACHING.revenueTarget)} or more within ${COACHING.windowMonths} months of your first ad going live. You show the payment screenshots. Below that you owe nothing more. I cannot promise you will reach it.`,
    ],
    [
      "Is this a guaranteed income?",
      `No. ${PLANS.pro.name} and the coaching teach you to get brand owners to apply. Who you say yes to, what you charge, and how fast you reply are on you.`,
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
