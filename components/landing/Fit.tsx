import { Section, Eyebrow } from "@/components/ui";

/** Sets expectations before the form, since no price is shown on the page. */
const YES = [
  "You post content consistently",
  "You want paid brand deals, not free products",
  "You are ready to treat your page like a business and invest in it",
  "You can reply to brand owners quickly",
];
const NO = [
  "You have just started and do not post regularly yet",
  "You want guaranteed income without doing the work",
  "You would rather hand everything to an agency and let them keep a cut",
];

export function Fit() {
  return (
    <Section wide>
      <Eyebrow>Is this for you?</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">We do not take everyone.</h2>
      <p className="mt-3 max-w-2xl text-bone-2">We review every application, because this only works when the creator is serious.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border-2 border-lime bg-ink-2 p-6">
          <p className="display text-2xl">A good fit</p>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {YES.map((x) => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-card border border-ink-4 bg-ink-2 p-6">
          <p className="display text-2xl text-bone-2">Not a fit</p>
          <ul className="mt-4 space-y-2.5 text-[15px] text-bone-2">
            {NO.map((x) => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-bone-3" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
