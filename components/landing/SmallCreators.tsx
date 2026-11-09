import { Section, Eyebrow, Card } from "@/components/ui";
import { AD_BUDGET } from "@/lib/offer.config";
import { rs } from "@/lib/format";

/**
 * Says out loud that this is not only for big accounts. Placed right after the pain section.
 * No income claims here: it describes how the method works for a smaller page.
 */
const POINTS = [
  {
    title: "Stop waiting to be noticed.",
    body: "Your own ad puts your page in front of brand owners. No manager, no agency, no cold DMs left on seen.",
  },
  {
    title: "Your size, your rate.",
    body: "A smaller page means a smaller rate, and that is fine. You set it, and brands see your budget range in the form before they apply.",
  },
  {
    title: "Each collab helps the next.",
    body: "Every paid collab is new content and new proof on your page. The next brand finds it easier to say yes.",
  },
];

export function SmallCreators() {
  return (
    <Section wide>
      <Eyebrow>Not only for big accounts</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        5k followers? 10k? <span className="text-lime">This is for you.</span>
      </h2>
      <p className="mt-3 max-w-2xl text-bone-2">
        You do not need a huge following to get paid. Small and mid-size pages are the creators most local brands can actually afford, and this system is built to help
        them land their first paid collabs and grow from there.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {POINTS.map((p) => (
          <Card key={p.title}>
            <p className="display text-2xl">{p.title}</p>
            <p className="mt-2 text-[15px] text-bone-2">{p.body}</p>
          </Card>
        ))}
      </div>
      <p className="mt-6 max-w-2xl text-sm text-bone-3">
        Be honest with the math: the ad costs about {rs(AD_BUDGET.perMonthAtMin)} a month, so a smaller rate means a few more deals to cover it. The calculator below shows exactly how many.
      </p>
    </Section>
  );
}
