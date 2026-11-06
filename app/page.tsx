import { Landing } from "@/components/landing/Landing";
import { HEROES, DEFAULT_HERO } from "@/lib/heroes";

// Default headline set (lib/heroes.ts DEFAULT_HERO). ?a= / utm_content variants are
// rewritten by proxy.ts to the prerendered /v/N pages, so every variant is static.
export default function Home() {
  return <Landing hero={HEROES[DEFAULT_HERO]} />;
}
