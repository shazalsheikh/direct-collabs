import { Section, Eyebrow, Card, HonestLine, LinkButton } from "@/components/ui";
import { rs } from "@/lib/format";
import { whatsappLink } from "@/lib/site.config";
import { PROGRAM, SERVICE, AD_SPEND_NOTE } from "@/lib/program.config";

/**
 * Two ways in. The program is the self-serve option (checkout or WhatsApp).
 * The service is the monthly application. The application stays the main CTA on the page.
 */
export function Program() {
  const waHref = whatsappLink(`Assalam o Alaikum, I want ${PROGRAM.name}.`);
  const programHref = PROGRAM.checkoutUrl || waHref || "#apply";
  const programExternal = programHref !== "#apply";

  return (
    <Section id="program" tone="ink-2" wide className="scroll-mt-4">
      <Eyebrow lime>Two ways in</Eyebrow>
      <h2 className="display mt-3 text-4xl sm:text-5xl">
        Brands come to you. <span className="text-lime">Build it yourself, or let us run it.</span>
      </h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Option 1: the self-serve program */}
        <Card lime className="flex flex-col p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-lime uppercase">Do it yourself</p>
          <h3 className="display mt-2 text-3xl">{PROGRAM.name}</h3>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="display tnum text-4xl whitespace-nowrap text-lime sm:text-5xl">{rs(PROGRAM.price)}</span>
            <span className="text-bone-3">one-time · lifetime access</span>
          </p>
          <p className="mt-3 text-bone-2">
            A {PROGRAM.lectureHours}-hour recorded lecture in {PROGRAM.modules.length} modules. Follow it step by step and build
            the system on your own page.
          </p>

          <ol className="mt-5 space-y-2 text-[15px] text-bone-2">
            {PROGRAM.modules.map((m, i) => (
              <li key={m} className="flex gap-3">
                <span className="display tnum w-6 shrink-0 text-lime">{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>

          {/* Ad spend, highlighted */}
          <div className="mt-6 rounded-card border border-lime bg-ink p-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-lime uppercase">Ad spend, paid to Meta</p>
            <p className="mt-2 text-[15px] text-bone">
              At least <span className="font-semibold text-lime">Rs {AD_SPEND_NOTE.minPerDay} a day</span>, paid to Meta
              directly. It never comes to us. The program fee and the ad budget are two separate costs.
            </p>
          </div>

          {/* Guarantee, highlighted */}
          <div className="mt-4 rounded-card border border-ink-4 bg-ink p-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-lime uppercase">Our guarantee</p>
            <p className="display mt-2 text-xl text-bone">{PROGRAM.guarantee.headline}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-bone-3">
              {PROGRAM.guarantee.conditions.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-bone-3" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[15px] text-bone-2">{PROGRAM.support}</p>

          <div className="mt-6 flex flex-col gap-2">
            {programExternal ? (
              <a
                href={programHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 w-full items-center justify-center rounded-pill bg-lime px-6 text-base font-semibold text-ink transition-[transform,background-color] duration-150 hover:bg-[#d6ff5c] active:scale-[0.98]"
              >
                Get the program · {rs(PROGRAM.price)}
              </a>
            ) : (
              <LinkButton href={programHref} className="w-full">
                Get the program · {rs(PROGRAM.price)}
              </LinkButton>
            )}
          </div>
        </Card>

        {/* Option 2: the monthly service */}
        <Card className="flex flex-col p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-bone-3 uppercase">We run it for you</p>
          <h3 className="display mt-2 text-3xl">{SERVICE.name}</h3>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="display tnum text-5xl">{rs(SERVICE.monthly)}</span>
            <span className="text-bone-3">per month</span>
          </p>
          <p className="mt-3 text-bone-2">We build and run the system on your page, with you in the loop every day.</p>

          <ul className="mt-5 space-y-2 text-[15px] text-bone-2">
            {SERVICE.includes.map((i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                {i}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-card border border-ink-4 bg-ink p-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-lime uppercase">Ad spend, paid to Meta</p>
            <p className="mt-2 text-[15px] text-bone">
              At least <span className="font-semibold text-lime">Rs {AD_SPEND_NOTE.minPerDay} a day</span>, paid to Meta
              directly. Your ad budget is separate from our fee.
            </p>
          </div>

          <div className="mt-6">
            <LinkButton href="#apply" variant="outline" className="w-full">
              Apply for the monthly plan
            </LinkButton>
          </div>
        </Card>
      </div>

      <HonestLine className="mt-8 max-w-2xl" />
    </Section>
  );
}
