import type { HeroVariant } from "@/lib/heroes";
import { TrackOnMount } from "@/components/Tracking";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { ProofBar } from "./ProofBar";
import { Pain } from "./Pain";
import { Mechanism } from "./Mechanism";
import { Calculator } from "./Calculator";
import { Compare } from "./Compare";
import { LaraibStory } from "./LaraibStory";
import { HudaStory } from "./HudaStory";
import { SmallCreators } from "./SmallCreators";
import { Inside } from "./Inside";
import { Plans } from "./Plans";
import { Guarantee } from "./Guarantee";
import { About } from "./About";
import { FAQ } from "./FAQ";
import { FinalCTA, Footer } from "./FinalCTA";
import { StickyCTA } from "./StickyCTA";

export function Landing({ hero }: { hero: HeroVariant }) {
  return (
    <>
      <TrackOnMount event="ViewContent" contentName={`landing-${hero.key}`} />
      <Nav />
      <main className="flex-1">
        <Hero hero={hero} />
        <ProofBar />
        <Pain />
        <SmallCreators />
        <Mechanism />
        <Calculator />
        <Compare />
        <HudaStory />
        <LaraibStory />
        <Inside />
        <Plans />
        <Guarantee />
        <About />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
