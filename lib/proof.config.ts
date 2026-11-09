/**
 * Every proof number on the site lives here.
 * value: null hides the element. verified: false renders the number with "~"
 * and is listed as a TODO in README. Nothing here is invented.
 */

export type Stat = {
  id: string;
  label: string;
  value: number | null;
  prefix?: string; // "Rs "
  suffix?: string;
  verified: boolean;
  note?: string;
};

/** Laraib: 100k followers, zero paid collabs before, then one ad. */
export const PROOF_STATS: Stat[] = [
  {
    id: "forms",
    label: "brand forms",
    value: 960, // TODO: verify exact count in Meta Lead Center
    verified: false,
    note: "Instagram lead form submissions, one campaign.",
  },
  {
    id: "spend",
    label: "total ad spend",
    value: 80000, // owner: "around 80k". TODO: confirm exact figure in Ads Manager
    prefix: "Rs ",
    verified: false,
  },
  {
    id: "revenue",
    label: "paid by brands",
    value: 500000, // owner: "revenue of 5 lac". TODO: confirm with Laraib's payment screenshots
    prefix: "Rs ",
    verified: false,
    note: "Paid brand deals, not barter.",
  },
  {
    id: "deals",
    label: "paid deals",
    value: 15, // TODO: verify with Laraib, about 15
    verified: false,
    note: "Paid, not barter.",
  },
  {
    // Hidden on purpose: Rs 77 x 960 forms is about Rs 74k, which does not match the ~Rs 80k spend
    // (Rs 80k / 960 is about Rs 83). Turn back on only with the exact figure from Meta.
    id: "cpf",
    label: "per form",
    value: null,
    prefix: "Rs ",
    verified: false,
    note: "Average cost per form across the run.",
  },
];

/** Creative fatigue curve, taught in Chapter 6. */
export const CPF_CURVE = {
  weekOne: 70, // TODO: verify
  weekThree: 100, // TODO: verify
  verified: false,
};

export type Screenshot = {
  src: string; // "" hides the slot
  alt: string;
  caption: string;
  width?: number;
  height?: number;
};

/**
 * Laraib story media. All empty until real, consented screenshots exist.
 * Drop WebP files in public/proof/ and fill src. Each element hides when src is "".
 */
export const LARAIB = {
  name: "Laraib",
  followers: "100k",
  // TODO: get written consent from Laraib to use name + screenshots.
  consented: false,
  payments: [
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
  ] as Screenshot[],
  chats: [
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
  ] as Screenshot[],
  adsManager: [
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
  ] as Screenshot[],
};

/**
 * Huda: second run, the cleanest proof. Numbers were given by the owner directly.
 * consented: false  -> the page says "A 70k creator" and shows no screenshots.
 * consented: true   -> the page uses her name. Only flip it after her written OK.
 * Screenshot slots hide while src is "".
 */
export const HUDA = {
  name: "Huda",
  followers: "70k",
  consented: false,
  spend: 4000, // Rs, total
  days: 4,
  leads: 40,
  dealValue: 35000, // Rs, one brand
  dealWhat: "2 jacket reels",
  payments: [
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
  ] as Screenshot[],
  chats: [
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
  ] as Screenshot[],
  adsManager: [
    { src: "", alt: "", caption: "" },
    { src: "", alt: "", caption: "" },
  ] as Screenshot[],
};

/**
 * Testimonials. Zero by design until real ones exist.
 * Each needs name (or handle), text, and consent. Hidden when empty.
 */
export type Testimonial = {
  name: string;
  handle?: string;
  text: string;
  result?: string;
  consented: boolean;
};
export const TESTIMONIALS: Testimonial[] = [];

/** Helpers */
export const visibleStats = () => PROOF_STATS.filter((s) => s.value !== null);
export const hasMedia = (list: Screenshot[]) => list.some((s) => s.src);
export const visibleMedia = (list: Screenshot[]) => list.filter((s) => s.src);
