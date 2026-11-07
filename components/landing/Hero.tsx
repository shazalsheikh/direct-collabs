import { Container, LinkButton, HonestLine } from "@/components/ui";
import { PLANS, GUARANTEE } from "@/lib/offer.config";
import { LARAIB } from "@/lib/proof.config";
import type { HeroVariant } from "@/lib/heroes";
import { rs } from "@/lib/format";
import { Headline } from "./HeroHeadline";
import { PhoneLeads } from "./PhoneLeads";

export function Hero({ hero }: { hero: HeroVariant }) {
  const g = GUARANTEE[GUARANTEE.type];
  return (
    <section className="pt-10 pb-14 sm:pt-16 sm:pb-20">
      <Container wide>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Headline hero={hero} />

            <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
              <LinkButton href="/checkout?plan=pro" className="w-full">
                Get the system · {rs(PLANS.pro.price)}
              </LinkButton>
              <a
                href="/checkout?plan=basic"
                className="min-h-11 inline-flex items-center justify-center text-sm text-bone-3 underline-offset-4 hover:text-bone hover:underline"
              >
                or Basic, {rs(PLANS.basic.price)}
              </a>
            </div>

            {/* Trust strip */}
            <ul className="mt-7 grid grid-cols-1 gap-2 text-[13px] text-bone-2 sm:grid-cols-3 sm:gap-4">
              <li className="flex items-start gap-2">
                <Dot />
                Run on a {LARAIB.followers} creator&apos;s page first
              </li>
              <li className="flex items-start gap-2">
                <Dot />
                Easypaisa and JazzCash
              </li>
              <li className="flex items-start gap-2">
                <Dot />
                {g.headline}
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
