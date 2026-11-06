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
    id: "cpf",
    label: "per form",
    value: 77, // TODO: verify, Meta shows about Rs 77
    prefix: "Rs ",
    verified: false,
    note: "Average cost per form across the run.",
  },
  {
    id: "spend",
    label: "total ad spend",
    value: 80000, // TODO: verify, about Rs 80k
    prefix: "Rs ",
    verified: false,
  },
  {
    id: "deals",
    label: "paid deals",
    value: 15, // TODO: verify with Laraib, about 15
    verified: false,
    note: "Paid, not barter.",
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
