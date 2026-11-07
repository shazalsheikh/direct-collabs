# Launch blockers

Things only you can supply. The site builds and runs without them, but do not run ads until every box is ticked.

- [x] **Easypaisa and JazzCash details** are set in `supabase/functions/_shared/bank.config.ts` (one number, 03000132773, Shazal Ahmed Ali, shown as "Easypaisa or JazzCash"). Confirm the number and title are right and that both wallets are active on it.
- [ ] **WhatsApp number.** `NEXT_PUBLIC_WHATSAPP_NUMBER` in Netlify env (digits only, country code first).
- [ ] **Final prices** in `lib/offer.config.ts` (Basic, Pro, bump, upgrade, pay-in-2 split, founding price after 100).
- [ ] **Refund window and guarantee type** in `lib/offer.config.ts` (`GUARANTEE.type`). `/refund-policy` follows it.
- [ ] **Netlify URL / custom domain.** `NEXT_PUBLIC_SITE_URL`. Needed for OG tags, email links and the Meta pixel domain verification.
- [ ] **Your photo** (WebP, square, under 60 KB) at `public/owner.webp`, then set `SITE.owner.photo` in `lib/site.config.ts`.
- [ ] **A short clip of you** for the About block or ad creative (not embedded on the page by default).
- [ ] **Tracking IDs.** `NEXT_PUBLIC_PIXEL_ID`, `META_CAPI_TOKEN`, `NEXT_PUBLIC_GA4_ID`, Google Ads IDs. All no-ops until set.
- [ ] **Laraib's written consent** to use her name and screenshots, then the actual screenshots in `public/proof/` and `lib/proof.config.ts`.
- [ ] **Reconcile the proof numbers.** 960 forms at Rs 77 is about Rs 74,000, but the page says about Rs 80,000. Check Meta and fix whichever is off, or a sharp reader will multiply it.
- [ ] **Confirm the story is exactly true.** The Laraib section now says only what your brief supports: 100k followers, no paid collabs before, one ad with a lead form, about 960 forms, about 15 paid deals, cost per form rising after three weeks. Add detail only if you can prove it.
- [ ] **Verify the four proof numbers** against Meta (forms, cost per form, spend, deals). They are marked `verified: false` and render with "~" until confirmed.
- [ ] **Real student feedback.** `TESTIMONIALS` in `lib/proof.config.ts` is empty by design. Only add with consent.
- [ ] **Who watches the Needs review queue.** One named person, with the admin password and WhatsApp, checking `/admin` at least twice a day.
- [ ] **Founding counter decision.** `FOUNDING.enabled` is off. If you turn it on you must raise `PLANS.pro.price` yourself at 100 sales (admin warns you).
- [ ] **Re-measure speed on Netlify** with a real CDN (Lighthouse mobile, LCP target under 2 s).
- [ ] **Course video URL.** `COURSE_VIDEO_URL` (unlisted YouTube, Vimeo or Bunny embed).
- [ ] **Read all six documents** in `content/downloads/src/` and fix anything that does not sound like you. They are drafts. Then `npm run build:downloads` and `npm run upload:downloads`.
- [ ] **Decide on the public repository.** The paid documents are git-ignored, so they are safe. Real contact details and your code are still public. Make it private in GitHub if you prefer.
- [ ] **A working support mailbox.** `SITE.supportEmail` (`hello@directcollabs.pk`) is on the legal pages. Set up forwarding for the real domain in Namecheap and update it.
- [ ] **Supabase project** created, then `npm run setup:supabase` (creates tables and private buckets, deploys the function and its secrets, uploads the PDFs, writes `.env.netlify`).
- [ ] **Import `.env.netlify` into Netlify** and redeploy. Save the `ADMIN_PASSWORD` from that file in a password manager.
- [ ] **A Rs 100 test purchase** end to end, then put the Pro price back.
- [ ] **Resend domain verified** (add its DNS records in Namecheap) and `RESEND_API_KEY` set.
- [ ] **Anthropic API key** for receipt OCR.
- [ ] **Legal pages reviewed** (`/terms`, `/privacy`, `/refund-policy`) and the business name in `SITE.legal`.
