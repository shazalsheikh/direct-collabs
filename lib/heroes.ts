/**
 * Three swappable hero headline sets.
 * Selected by ?a=1|2|3 or utm_content=1|2|3. Default 2 (method).
 */

export type HeroVariant = {
  id: 1 | 2 | 3;
  key: "pain" | "method" | "proof";
  eyebrow: string;
  h1: string;
  sub: string;
};

export const HEROES: Record<1 | 2 | 3, HeroVariant> = {
  1: {
    id: 1,
    key: "pain",
    eyebrow: "FOR PAKISTANI CREATORS",
    h1: "Followers hain, collab nahi?",
    sub: "Ek ad apni profile se. Brand owner form bhrta hai: category, budget, handle. Ap choose krte ho kis ke saath kaam krna hai. Na agency, na 30% cut.",
  },
  2: {
    id: 2,
    key: "method",
    eyebrow: "FOR PAKISTANI CREATORS",
    h1: "Brands ko dhoondna chhoro. Brands ko apply krne do.",
    sub: "Ek ad apni profile se. Brand owner form bhrta hai: category, budget, handle. Ap choose krte ho kis ke saath kaam krna hai. Na agency, na 30% cut.",
  },
  3: {
    id: 3,
    key: "proof",
    eyebrow: "FOR PAKISTANI CREATORS",
    h1: "1 ad. 960 brand forms. Laraib ke account pe.",
    sub: "Ek ad apni profile se. Brand owner form bhrta hai: category, budget, handle. Ap choose krte ho kis ke saath kaam krna hai. Na agency, na 30% cut.",
  },
};

export const DEFAULT_HERO: 1 | 2 | 3 = 2;

export function pickHero(a?: string | null, utmContent?: string | null): HeroVariant {
  const raw = a ?? utmContent ?? "";
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return HEROES[n];
  return HEROES[DEFAULT_HERO];
}
