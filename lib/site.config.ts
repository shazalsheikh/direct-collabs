/**
 * Site-wide identity, contact and feature flags.
 * Everything that is not an offer or proof number lives here.
 */

export const SITE = {
  name: "DirectCollabs",
  domain: "directcollabs.pk",
  // TODO: replace with the final Netlify / custom domain URL before launch.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://directcollabs.pk",
  description:
    "We help content creators in Pakistan get direct brand deals. Brand owners reach out to you, you pick who to work with, and you keep your full fee. No agency, no cut.",
  owner: {
    name: "Sheikh Shazal",
    instagram: "sh.shazal",
    instagramUrl: "https://instagram.com/sh.shazal",
    agency: "Revzo",
    // Toggle the "Sajawal.School, 67,000+ students" line in the About block.
    showSchoolLine: false,
    schoolLine: "Also behind Sajawal.School, 67,000+ students.",
    // Photo slot. Drop a WebP at public/owner.webp and set to "/owner.webp".
    // Hidden when empty.
    photo: "" as string,
  },
  // Digits only, country code first. Read from env so it never lands in git.
  // TODO: set NEXT_PUBLIC_WHATSAPP_NUMBER in Netlify before launch.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  supportEmail: "", // TODO: set a real mailbox on your own domain. Empty hides the email line on the legal pages.
  course: {
    language: "Roman Urdu",
    durationLabel: "about 2 hours",
  },
  flags: {
    // The site takes applications now, not payments. false closes /checkout and the checkout APIs
    // (they redirect or return 410). Past orders, /thank-you and /access links keep working.
    checkoutOpen: false,
    // Thank-you page "Want it done for you?" card.
    showDoneForYou: false,
    // When true, /access shows an external invite link instead of the embedded player.
    // Set COURSE_INVITE_URL in Netlify (for example your Thinkific course link) and the course page shows
    // an "Open the course" button to it instead of an embedded video.
    externalInvite: Boolean(process.env.COURSE_INVITE_URL),
    externalInviteUrl: process.env.COURSE_INVITE_URL ?? "",
  },
  legal: {
    entity: "DirectCollabs", // TODO: registered business name if any
    city: "Islamabad, Pakistan",
    lastUpdated: "2026-11-13",
  },
} as const;

/** Build a wa.me link with a prefilled message. Returns "" when no number is set. */
export function whatsappLink(message: string, number = SITE.whatsappNumber) {
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
