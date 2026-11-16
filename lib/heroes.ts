/**
 * Swappable hero headline sets. 1 to 3 are the originals. 4 to 7 test the visibility hooks.
 * Selected by ?a=N or utm_content=N (proxy.ts rewrites to /v/N). Default 2 (method).
 * The copy says what the creator gets, never how the system works behind the scenes.
 * Never promise income or brand deals. "Brands can find you" is the claim.
 */

export type VariantId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type HeroVariant = {
  id: VariantId;
  key: "pain" | "method" | "proof" | "need" | "followers" | "agency" | "looking";
  eyebrow: string;
  h1: string;
  sub: string;
};

const EYEBROW = "FOR PAKISTANI CONTENT CREATORS";
const SUB =
  "We help content creators get direct brand deals. Brand owners reach out to you with what they need and their budget. You pick who to work with. No agency, no cut.";

export const HEROES: Record<VariantId, HeroVariant> = {
  1: { id: 1, key: "pain", eyebrow: EYEBROW, h1: "Tired of DMing brands and getting left on seen?", sub: SUB },
  2: { id: 2, key: "method", eyebrow: EYEBROW, h1: "Stop chasing brands. Let them come to you.", sub: SUB },
  3: { id: 3, key: "proof", eyebrow: EYEBROW, h1: "Brand owners reach out to you directly. You close the deal.", sub: SUB },
  // Visibility hooks, for testing against each other and against 1 to 3.
  4: { id: 4, key: "need", eyebrow: EYEBROW, h1: "Brands need content every day. They just don't know you exist.", sub: SUB },
  5: { id: 5, key: "followers", eyebrow: EYEBROW, h1: "Most creators don't have a follower problem. Brands have never seen their profile.", sub: SUB },
  6: { id: 6, key: "agency", eyebrow: EYEBROW, h1: "Brands see the agencies. They never see you. Fix that.", sub: SUB },
  7: { id: 7, key: "looking", eyebrow: EYEBROW, h1: "Brands are looking for creators like you right now. They can't find you.", sub: SUB },
};

export const DEFAULT_HERO: VariantId = 2;

/** Shown under every hero variant. The rate is the creator's call, not the agency's. */
export const RATE_LINE = "You set your rate. Not the agency.";

export function pickHero(a?: string | null, utmContent?: string | null): HeroVariant {
  const raw = a ?? utmContent ?? "";
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1 && n <= 7) return HEROES[n as VariantId];
  return HEROES[DEFAULT_HERO];
}
