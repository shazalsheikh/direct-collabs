import { Container, LinkButton, HonestLine } from "@/components/ui";
import type { HeroVariant } from "@/lib/heroes";
import { Headline } from "./HeroHeadline";
import { PhoneLeads } from "./PhoneLeads";

export function Hero({ hero }: { hero: HeroVariant }) {
  return (
    <section className="pt-10 pb-14 sm:pt-16 sm:pb-20">
      <Container wide>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Headline hero={hero} />

            <div className="mt-8 flex flex-col gap-2 sm:max-w-sm">
              <LinkButton href="#apply" className="w-full">
                Apply to work with us
              </LinkButton>
              <p className="text-center text-sm text-bone-3">Takes one minute. We reply on WhatsApp.</p>
            </div>

            {/* Trust strip */}
            <ul className="mt-7 grid grid-cols-1 gap-2 text-[13px] text-bone-2 sm:grid-cols-3 sm:gap-4">
              <li className="flex items-start gap-2">
                <Dot />
                Brand owners reach out to you directly
              </li>
              <li className="flex items-start gap-2">
                <Dot />
                Your rate, your payment, no cut
              </li>
              <li className="flex items-start gap-2">
                <Dot />
                By application only
              </li>
            </ul>
            <HonestLine className="mt-4 max-w-md" />
          </div>

          <div className="relative">
            <PhoneLeads />
          </div>
        </div>
      </Container>
      {/* Sentinel for the sticky CTA */}
      <div id="hero-end" aria-hidden="true" />
    </section>
  );
}

function Dot() {
  return <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />;
}
