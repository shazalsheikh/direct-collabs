import type { HeroVariant } from "@/lib/heroes";
import { Eyebrow } from "@/components/ui";

/**
 * Server-rendered hero copy. The variant is chosen BEFORE render (proxy rewrites
 * ?a= / utm_content to a prerendered /v/N page), so the H1 is in the first HTML
 * and never swaps after hydration. That keeps LCP at first paint.
 */
export function Headline({ hero }: { hero: HeroVariant }) {
  return (
    <>
      <Eyebrow lime>{hero.eyebrow}</Eyebrow>
      <h1 className="display mt-4 text-[2.6rem] leading-[0.98] sm:text-6xl lg:text-[4.25rem]">{hero.h1}</h1>
      <p className="mt-5 max-w-md text-[17px] leading-relaxed text-bone-2">{hero.sub}</p>
    </>
  );
}
