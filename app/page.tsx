import { Container, Eyebrow } from "@/components/ui";
import { HEROES, DEFAULT_HERO } from "@/lib/heroes";

// Phase 1 placeholder. Phase 2 replaces this with the full landing page.
export default function Home() {
  const hero = HEROES[DEFAULT_HERO];
  return (
    <main className="flex-1">
      <Container className="py-24">
        <Eyebrow lime>{hero.eyebrow}</Eyebrow>
        <h1 className="display mt-4 text-5xl sm:text-7xl">{hero.h1}</h1>
        <p className="mt-6 text-lg text-bone-2">{hero.sub}</p>
      </Container>
    </main>
  );
}
