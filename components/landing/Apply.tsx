import { Section, Eyebrow } from "@/components/ui";
import { ApplyForm } from "./ApplyForm";

/** The one call to action on the page. Everything above it links here (#apply). */
export function Apply() {
  return (
    <Section id="apply" wide className="scroll-mt-4">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <Eyebrow lime>Apply</Eyebrow>
          <h2 className="display mt-3 text-4xl sm:text-5xl">
            Brands ko apne paas aane do. <span className="text-lime">Apply kro.</span>
          </h2>
          <p className="mt-4 text-bone-2">Tell us about your page. We review every application and reply on WhatsApp.</p>
          <ol className="mt-6 space-y-3 text-[15px] text-bone-2">
            <li className="flex gap-3">
              <span className="display tnum text-lime">1</span> You send this application. One minute.
            </li>
            <li className="flex gap-3">
              <span className="display tnum text-lime">2</span> We look at your page and message you on WhatsApp.
            </li>
            <li className="flex gap-3">
              <span className="display tnum text-lime">3</span> If it is a fit, we explain the plan and you decide.
            </li>
          </ol>
        </div>
        <ApplyForm />
      </div>
    </Section>
  );
}
