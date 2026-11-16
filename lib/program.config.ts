/**
 * The two offers on the landing page: the self-serve program and the monthly service.
 * Edit this file only. The Program section reads from here.
 *
 * Not the same as lib/offer.config.ts (the old course and coaching). Those power /checkout,
 * which is still closed (flags.checkoutOpen = false).
 */

import { AD_BUDGET, PLANS } from "@/lib/offer.config";

export const PROGRAM = {
  name: PLANS.program.name,
  price: PLANS.program.price, // the checkout charges this, from offer.config
  currency: "PKR",
  lectureHours: 3,
  // DRAFT titles. Replace with the exact titles from the recorded lecture.
  modules: [
    "Your brand-ready profile",
    "The hook and the script",
    "Your lead form",
    "Setting up the ad",
    "Brand-owner targeting",
    "Replying within 5 minutes",
    "Setting your rate",
    "Keeping the ad alive",
  ],
  // Payment link for the program. Set NEXT_PUBLIC_PROGRAM_CHECKOUT_URL in Netlify.
  // Empty = the CTA falls back to WhatsApp, then to the application form.
  checkoutUrl: process.env.NEXT_PUBLIC_PROGRAM_CHECKOUT_URL ?? "",
  support: "24/7 WhatsApp support while you build.",
  guarantee: {
    headline: "10 brand reach-outs in 7 days, or your money back.",
    reachOuts: 10,
    days: 7,
    refundDays: 14,
    conditions: [
      "Complete all 8 modules before you launch.",
      `Run the ad at least Rs ${AD_BUDGET.minPerDay} a day for the 7 days after it goes live.`,
      "WhatsApp support, 24/7, if you get stuck anywhere.",
      "One refund per person.",
    ],
  },
};

export const SERVICE = {
  name: "Done for you",
  monthly: 30000,
  currency: "PKR",
  includes: [
    "Algorithm-built video script: hook, flow and call-to-action",
    "Brand-owner targeting: shown only to business owners and page admins",
    "Daily optimization: budget, audience and ad tuned every day",
    "Reply handling: we help you answer every brand that reaches out",
  ],
};

/** Ad spend is paid to Meta, not to us. Shown on both options. */
export const AD_SPEND_NOTE = {
  minPerDay: AD_BUDGET.minPerDay,
  // Meta charges the card on file every day. Monthly is 30 days at the minimum.
  monthlyAtMin: AD_BUDGET.minPerDay * 30,
  line: `Ad spend: at least Rs ${AD_BUDGET.minPerDay} a day, paid to Meta directly. It never comes to us.`,
};
