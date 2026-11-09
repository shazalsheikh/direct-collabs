/**
 * THE offer. Prices, plans, bump, upgrade, pay-in-2, guarantee, anchor, chapters.
 * Edit this file only. Everything on the site reads from here.
 */

/**
 * The second offer: 1-on-1 coaching and a full setup. Sold through the normal checkout (Rs 50,000 by screenshot upload).
 * The Rs 100,000 is a success fee, agreed and collected by hand on WhatsApp: due only if brand deals that came through the system pay the client
 * `revenueTarget` or more inside `windowMonths` of the first ad going live. Edit numbers here only.
 */
export const COACHING = {
  name: "1-on-1 Coaching and Setup",
  upfront: 50000,
  successFee: 100000,
  revenueTarget: 500000,
  windowMonths: 2,
  calls: 3,
  callsWithinDays: 10,
  includes: [
    "3 live 1-on-1 Zoom calls in your first 10 days",
    "I build your ad, lead form and funnel with you, on your page",
    "A place in the community WhatsApp group",
  ],
};

export type PlanId = "basic" | "pro" | "coaching";

export const CURRENCY = "PKR";

export const PLANS = {
  // Not sold any more (see SELLABLE_PLANS). Kept so the type, old orders and the DB check still work.
  basic: {
    id: "basic" as const,
    name: "Basic",
    price: 4900,
    tagline: "The lecture and the two templates.",
    includes: [
      "2-hour recorded course, Roman Urdu",
      "Instagram lead form template",
      "Ad setup checklist",
    ],
    recommended: false,
  },
  // The one course people can buy. Internal id stays "pro" so orders, access and the DB need no migration.
  pro: {
    id: "pro" as const,
    name: "The Course",
    price: 15000,
    tagline: "Recorded lectures, templates and scripts. You set it up yourself.",
    includes: [
      "2-hour recorded course, Roman Urdu",
      "Instagram lead form template",
      "Ad setup checklist",
      "5 ready-to-shoot ad scripts in Roman Urdu",
      "20 DM reply scripts",
      "Rate card and quote sheet",
      "Barter Pitch Pack: 20 pitch DMs, media kit template, follow-up sequence",
    ],
    recommended: false,
  },
  // The second offer. Paid through the same checkout. No course access comes with it (see lib/access.ts).
  coaching: {
    id: "coaching" as const,
    name: COACHING.name,
    price: COACHING.upfront,
    tagline: "Live calls and a full setup, built with you on your own page.",
    includes: COACHING.includes,
    recommended: false,
  },
} satisfies Record<PlanId, unknown>;

/** Plans a visitor can actually buy. The server refuses anything else. */
export const SELLABLE_PLANS: PlanId[] = ["pro", "coaching"];

/** Which plan is preselected on the landing page CTA and checkout. */
export const DEFAULT_PLAN: PlanId = "pro";

/** Order bump shown on checkout only. Off: the Barter Pitch Pack is now included in the course. */
export const BUMP = {
  enabled: false,
  id: "barter-pitch-pack",
  name: "Barter Pitch Pack",
  price: 1200,
  hook: "For the 3 to 7 days while your ad warms up.",
  includes: ["20 pitch DMs", "Media kit template", "Follow-up sequence"],
};

/** Basic to Pro upgrade offered on the thank-you page. Linked order, same payment flow. */
export const UPGRADE = {
  price: PLANS.pro.price - PLANS.basic.price, // 3000
  from: "basic" as const,
  to: "pro" as const,
};

/**
 * Pay-in-2 for Pro. First A/B test for thin budgets.
 * Flag lives in env so Netlify can flip it without a deploy of code.
 */
export const PAY_IN_2 = {
  enabled: process.env.NEXT_PUBLIC_PAY_IN_2 === "true",
  plan: "pro" as const,
  first: 7500,
  second: 7500,
  daysBetween: 7,
  // Access unlocks after the first part clears.
  unlockAfterFirst: true,
};

/** Required ad budget, repeated plainly on both plans. */
export const AD_BUDGET = {
  minPerDay: 700,
  maxPerDay: 1000,
  perMonthAtMin: 21000, // 30 days at Rs 700
  daysToWarmUp: "3 to 7 days",
};

/** Anchor used next to the price. */
export const ANCHOR = {
  dealValue: 35000,
  agencyCutPct: 30,
  // "Agency keeps Rs 10,500 of a Rs 35,000 deal. The course costs less than two agency cuts."
  get agencyKeeps() {
    return Math.round((this.dealValue * this.agencyCutPct) / 100);
  },
};

export type GuaranteeType = "performance" | "standard";

export const GUARANTEE: {
  type: GuaranteeType;
  performance: {
    forms: number;
    days: number;
    spendPerDay: number;
    refundHours: number;
    headline: string;
    body: string;
    conditions: string[];
  };
  standard: { days: number; headline: string; body: string; conditions: string[] };
} = {
  // Switch here: "performance" | "standard". /refund-policy follows it.
  type: "performance",
  performance: {
    forms: 10,
    days: 7,
    spendPerDay: 700,
    refundHours: 48,
    headline: "10 brand forms in 7 days, or your money back.",
    body: "Run the ad as taught, Rs 700 a day, approved and delivering for 7 days. If fewer than 10 brand owners fill your form, show us the Ads Manager screen and we refund within 48 hours.",
    conditions: [
      "The ad must be approved by Meta and delivering for the full 7 days.",
      "Daily budget of at least Rs 700 for those 7 days.",
      "The lead form must be the one from the course, with the three questions intact.",
      "Refund request within 14 days of purchase with Ads Manager and Lead Center screenshots.",
      "One refund per person.",
    ],
  },
  standard: {
    days: 7,
    headline: "7 day money back.",
    body: "Watch the course. If it is not for you, message us within 7 days and we refund in full.",
    conditions: [
      "Request within 7 days of purchase.",
      "One refund per person.",
    ],
  },
};

/**
 * Founding price counter. Reads the REAL verified Pro sales count, hidden until showAt.
 *
 * enabled is false by default on purpose: the counter promises the price rises after `limit`
 * sales, and the site does NOT raise it automatically (every price is a static number in this
 * file). Turn it on only if you will change PLANS.pro.price to priceAfter yourself when the
 * limit is hit. /admin shows a red banner the moment that happens. No fake scarcity.
 */
export const FOUNDING = {
  enabled: false,
  limit: 100,
  priceAfter: 19900,
  showAt: 10,
};

/** The honest line. Shown near every CTA group. Do not soften it. */
export const HONEST_LINE =
  "Results depend on your followers, your rate and how fast you reply. Nothing here is a guarantee.";

/** The six chapters. Shown on landing and inside /access. */
export const CHAPTERS = [
  {
    n: 1,
    title: "The Apply Ad",
    blurb: "40-sec hook, proof, ask. The one video that does the work.",
    minutes: 22,
    pro: false,
  },
  {
    n: 2,
    title: "Your lead form",
    blurb: "3 questions and the paid-vs-barter budget filter.",
    minutes: 18,
    pro: false,
  },
  {
    n: 3,
    title: "Setting up on your own page",
    blurb: "Step by step. Ads Manager, placements, Rs 700/day.",
    minutes: 28,
    pro: false,
  },
  {
    n: 4,
    title: "Replying in 5 minutes",
    blurb: "Quoting, saying no to barter, closing in the DM.",
    minutes: 20,
    pro: false,
  },
  {
    n: 5,
    title: "Setting your rate",
    blurb: "What to charge a brand and how to quote it. Rate kam hai? This chapter is only about that.",
    minutes: 16,
    pro: false,
  },
  {
    n: 6,
    title: "Keeping it alive",
    blurb: "Cost per form rises around week 3. How to refresh the creative.",
    minutes: 16,
    pro: false,
  },
] as const;

/** Downloads inside /access. Pro-only items locked for Basic. */
/**
 * Downloads. `file` is the key in the PRIVATE Supabase bucket "downloads"
 * (upload with `npm run upload:downloads`). Files are never public: /access/[token]/download/[id]
 * checks the buyer's plan and hands out a 60 second link. Empty `file` shows "Coming soon".
 */
export const DOWNLOADS = [
  { id: "lead-form", name: "Instagram lead form template", pro: false, file: "lead-form.pdf", filename: "DirectCollabs - Lead form template.pdf" },
  { id: "checklist", name: "Ad setup checklist", pro: false, file: "ad-setup-checklist.pdf", filename: "DirectCollabs - Ad setup checklist.pdf" },
  { id: "scripts", name: "5 ad scripts (Roman Urdu)", pro: true, file: "ad-scripts.pdf", filename: "DirectCollabs - 5 ad scripts.pdf" },
  { id: "dm-scripts", name: "20 DM reply scripts", pro: true, file: "dm-reply-scripts.pdf", filename: "DirectCollabs - 20 DM reply scripts.pdf" },
  { id: "rate-card", name: "Rate card and quote sheet", pro: true, file: "rate-card-and-quote-sheet.pdf", filename: "DirectCollabs - Rate card and quote sheet.pdf" },
  { id: "barter-pack", name: "Barter Pitch Pack", pro: true, bump: false, file: "barter-pitch-pack.pdf", filename: "DirectCollabs - Barter Pitch Pack.pdf" },
] as const;

/** Total for an order. Pure, used on client, server and in the edge function. */
export function orderTotal(plan: PlanId, bump: boolean) {
  return PLANS[plan].price + (bump && BUMP.enabled ? BUMP.price : 0);
}
