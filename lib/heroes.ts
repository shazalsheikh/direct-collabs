/**
 * Three swappable hero headline sets.
 * Selected by ?a=1|2|3 or utm_content=1|2|3. Default 2 (method).
 * The copy says what the creator gets, never how the system works behind the scenes.
 */

export type HeroVariant = {
  id: 1 | 2 | 3;
  key: "pain" | "method" | "proof";
  eyebrow: string;
  h1: string;
  sub: string;
};

const EYEBROW = "FOR PAKISTANI CONTENT CREATORS";
const SUB =
  "We help content creators get direct brand deals. Brand owners reach out to you with what they need and their budget. You pick who to work with. No agency, no cut.";

export const HEROES: Record<1 | 2 | 3, HeroVariant> = {
  1: { id: 1, key: "pain", eyebrow: EYEBROW, h1: "Tired of DMing brands and getting left on seen?", sub: SUB },
  2: { id: 2, key: "method", eyebrow: EYEBROW, h1: "Stop chasing brands. Let them come to you.", sub: SUB },
  3: { id: 3, key: "proof", eyebrow: EYEBROW, h1: "Brand owners reach out to you directly. You close the deal.", sub: SUB },
};

export const DEFAULT_HERO: 1 | 2 | 3 = 2;

/** Shown under every hero variant. The rate is the creator's call, not the agency's. */
export const RATE_LINE = "You set your rate. Not the agency.";

export function pickHero(a?: string | null, utmContent?: string | null): HeroVariant {
  const raw = a ?? utmContent ?? "";
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return HEROES[n];
  return HEROES[DEFAULT_HERO];
}
