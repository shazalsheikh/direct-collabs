# Launch blockers

Things only Sheikh can supply. The site builds and runs without them, but do not run ads until every box is ticked.

- [ ] **Real bank, Easypaisa and JazzCash details.** Edit `supabase/functions/_shared/bank.config.ts`, set `isDummy: false`. The checkout shows a loud banner until this is done.
- [ ] **WhatsApp number.** `NEXT_PUBLIC_WHATSAPP_NUMBER` in Netlify env (digits only, country code first).
- [ ] **Final prices** in `lib/offer.config.ts` (Basic, Pro, bump, upgrade, pay-in-2 split, founding price after 100).
- [ ] **Refund window and guarantee type** in `lib/offer.config.ts` (`GUARANTEE.type`). `/refund-policy` follows it.
- [ ] **Netlify URL / custom domain.** `NEXT_PUBLIC_SITE_URL`. Needed for OG tags, email links and the Meta pixel domain verification.
- [ ] **Sheikh's photo** (WebP, square, under 60 KB) at `public/sajawal.webp`, then set `SITE.owner.photo` in `lib/site.config.ts`.
- [ ] **A short clip of Sheikh** for the About block or ad creative (not embedded on the page by default).
- [ ] **Tracking IDs.** `NEXT_PUBLIC_PIXEL_ID`, `META_CAPI_TOKEN`, `NEXT_PUBLIC_GA4_ID`, Google Ads IDs. All no-ops until set.
- [ ] **Laraib's written consent** to use her name and screenshots, then the actual screenshots in `public/proof/` and `lib/proof.config.ts`.
- [ ] **Verify the four proof numbers** against Meta (forms, cost per form, spend, deals). They are marked `verified: false` and render with "~" until confirmed.
- [ ] **Real student feedback.** `TESTIMONIALS` in `lib/proof.config.ts` is empty by design. Only add with consent.
- [ ] **Who watches the Needs review queue.** One named person, with the admin password and WhatsApp, checking `/admin` at least twice a day.
- [ ] **Founding counter decision.** `FOUNDING.enabled` is off. If you turn it on you must raise `PLANS.pro.price` yourself at 100 sales (admin warns you).
- [ ] **Re-measure speed on Netlify** with a real CDN (Lighthouse mobile, LCP target under 2 s).
- [ ] **Course video URL.** `COURSE_VIDEO_URL` (unlisted YouTube, Vimeo or Bunny embed).
- [ ] **Download files** (PDFs for templates, scripts, rate card) uploaded and their paths set in `DOWNLOADS` in `lib/offer.config.ts`.
- [ ] **Supabase project** created, SQL from `supabase/migrations/` run, storage bucket `receipts` (private) created, Edge Function deployed with its secrets.
- [ ] **Resend domain verified** for `directcollabs.pk` and `RESEND_API_KEY` set.
- [ ] **Anthropic API key** for receipt OCR.
- [ ] **Legal pages reviewed** (`/terms`, `/privacy`, `/refund-policy`) and the business name in `SITE.legal`.
