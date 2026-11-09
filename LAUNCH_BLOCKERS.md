# Launch blockers

Things only you can supply. The site builds and runs without them, but do not run ads until every box is ticked.

- [x] **Easypaisa and JazzCash details** are set in `supabase/functions/_shared/bank.config.ts` (one number, 03000132773, Shazal Ahmed Ali, shown as "Easypaisa or JazzCash"). Confirm the number and title are right and that both wallets are active on it.
- [ ] **WhatsApp number.** `NEXT_PUBLIC_WHATSAPP_NUMBER` in Netlify env (digits only, country code first).
- [ ] **Final prices** in `lib/offer.config.ts`. The site now sells two offers: The Course (Rs 15,000, internal plan id `pro`) and 1-on-1 Coaching (`COACHING`: Rs 50,000 to start, Rs 100,000 only after Rs 5 lakh of brand-deal revenue within 2 months). Basic, the order bump and the upgrade are switched off (`SELLABLE_PLANS`, `BUMP.enabled`).
- [ ] **Coaching is sold by WhatsApp application, not checkout.** Agree the terms in writing on WhatsApp before taking the Rs 50,000 (a Rs 50,000 payment probably needs bank transfer, so check wallet receiving limits). Read the 1-on-1 coaching paragraph in `/terms` and make sure it says exactly what you agree with each client.
- [ ] **Check the course guarantee still fits Rs 15,000.** The refund guarantee is 10 brand forms in 7 days at Rs 700 a day. The refund exposure is now larger.
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
- [ ] **Course link.** Your Thinkific link as `COURSE_INVITE_URL` in `.env.supabase` (the course page then shows an Open the course button). Or `COURSE_VIDEO_URL` for an embedded video. Make the Thinkific course private and enroll each buyer by email, or the link can be forwarded.
- [ ] **Read all six documents** in `content/downloads/src/` and fix anything that does not sound like you. They are drafts. Then `npm run build:downloads` and `npm run upload:downloads`.
- [ ] **Decide on the public repository.** The paid documents are git-ignored, so they are safe. Real contact details and your code are still public. Make it private in GitHub if you prefer.
- [ ] **A working support mailbox.** `SITE.supportEmail` (`hello@directcollabs.pk`) is on the legal pages. Set up forwarding for the real domain in Namecheap and update it.
- [ ] **Supabase project** created, then `npm run setup:supabase` (creates tables and private buckets, deploys the function and its secrets, uploads the PDFs, writes `.env.netlify`).
- [ ] **Import `.env.netlify` into Netlify** and redeploy. Save the `ADMIN_PASSWORD` from that file in a password manager.
- [ ] **A Rs 100 test purchase** end to end, then put the Pro price back.
- [ ] **Resend domain verified** (add its DNS records in Namecheap), `RESEND_API_KEY` and `RESEND_FROM` set. Needed for the full system: the access email is sent automatically.
- [ ] **WhatsApp is manual.** The system emails the link by itself, but sending it on WhatsApp is a button you press in `/admin` (Sales tab). Automatic WhatsApp needs the WhatsApp Business API (Meta approval, costs money).
- [ ] **Anthropic API key** for automatic receipt checking. Needed for the full system. Put it in `.env.supabase` and run `npm run setup:supabase` again.
- [ ] **Legal pages reviewed** (`/terms`, `/privacy`, `/refund-policy`) and the business name in `SITE.legal`.
