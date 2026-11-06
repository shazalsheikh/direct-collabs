import {
  Nav,
  Hero,
  ProofBar,
  Pain,
  Mechanism,
  Calculator,
  Compare,
  LaraibStory,
  Inside,
  Plans,
  Guarantee,
  About,
  FAQ,
  FinalCTA,
  Footer,
  StickyCTA,
} from "@/components/landing";
import { TrackOnMount } from "@/components/Tracking";

export default function Home() {
  return (
    <>
      <TrackOnMount event="ViewContent" contentName="landing" />
      <Nav />
      <main className="flex-1">
        <Hero />
        <ProofBar />
        <Pain />
        <Mechanism />
        <Calculator />
        <Compare />
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
