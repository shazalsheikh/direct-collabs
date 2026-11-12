import type { HeroVariant } from "@/lib/heroes";
import { TrackOnMount } from "@/components/Tracking";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Pain } from "./Pain";
import { WhatWeDo } from "./WhatWeDo";
import { Compare } from "./Compare";
import { Results } from "./Results";
import { Fit } from "./Fit";
import { About } from "./About";
import { FAQ } from "./FAQ";
import { Apply } from "./Apply";
import { Footer } from "./Footer";
import { StickyCTA } from "./StickyCTA";

/**
 * One job: get a creator to apply. No prices, no checkout, and no description of the method.
 * Order: promise, pain, what we do, why not an agency, proof, fit, who, questions, form.
 */
export function Landing({ hero }: { hero: HeroVariant }) {
  return (
    <>
      <TrackOnMount event="ViewContent" contentName={`landing-${hero.key}`} />
      <Nav />
      <main className="flex-1">
        <Hero hero={hero} />
        <Pain />
        <WhatWeDo />
        <Results />
        <Compare />
        <Fit />
        <About />
        <FAQ />
        <Apply />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
