"use client";

import { useSearchParams } from "next/navigation";
import { pickHero, type HeroVariant } from "@/lib/heroes";
import { Eyebrow } from "@/components/ui";

/** Pure render of a headline set. Used as the Suspense fallback too. */
export function Headline({ hero }: { hero: HeroVariant }) {
  return (
    <>
      <Eyebrow lime>{hero.eyebrow}</Eyebrow>
      <h1 className="display mt-4 text-[2.6rem] leading-[0.98] sm:text-6xl lg:text-[4.25rem]">
        {hero.h1}
      </h1>
      <p className="mt-5 max-w-md text-[17px] leading-relaxed text-bone-2">{hero.sub}</p>
    </>
  );
}

/** Reads ?a= or utm_content on the client. Static shell renders the default. */
export function HeroHeadline() {
  const sp = useSearchParams();
  const hero = pickHero(sp.get("a"), sp.get("utm_content"));
  return <Headline hero={hero} />;
}
