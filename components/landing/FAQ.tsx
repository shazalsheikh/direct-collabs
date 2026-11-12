import { Section, Eyebrow } from "@/components/ui";

/** Answers the questions a creator asks before applying. No prices and no method details here. */
const ITEMS: [string, string][] = [
  [
    "How do brands reach out to me?",
    "Brand owners contact you directly, with what they need and their budget. We set up and run the system that makes that happen, and we walk you through it when we talk.",
  ],
  [
    "Do I need a big following?",
    "There is no fixed number. It works best for creators who already post consistently and want to charge for their work. Apply, and we will tell you honestly whether it fits your page.",
  ],
  [
    "What does it cost?",
    "It depends on your page and what you need. We share the plan and the price on WhatsApp after we review your application. No payment is taken on this website.",
  ],
  [
    "Are you an agency?",
    "No. An agency sits between you and the brand and keeps a cut. We do not. Brand owners deal with you directly, and you keep your full fee.",
  ],
  ["Paid or barter?", "You see what each brand is offering before you reply. You decide which ones to answer."],
  [
    "Is income guaranteed?",
    "No. We bring brand owners to you. Who you say yes to, what you charge and how fast you reply are on you.",
  ],
  ["What happens after I apply?", "We review your page and message you on WhatsApp, usually within a day or two."],
];

export function FAQ() {
  return (
    <Section tone="ink-2" wide>
      <Eyebrow>Questions</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">Before you ask.</h2>
      <div className="mt-8 divide-y divide-ink-4 rounded-card border border-ink-4 bg-ink">
        {ITEMS.map(([q, a]) => (
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
