# DirectCollabs

Funnel for the DirectCollabs course. A recorded 2-hour Roman Urdu course that teaches Pakistani creators to run one Meta ad from their own page, with an Instagram lead form, so brand owners apply to them directly.

Stack: Next.js 16 (App Router, TypeScript, Tailwind v4), Supabase (Postgres, private storage, Edge Function), Resend, Netlify. One runtime dependency besides Next and React: `@supabase/supabase-js`.

Before ads run, go through [LAUNCH_BLOCKERS.md](LAUNCH_BLOCKERS.md). Nothing is live until every box in it is ticked.

## Current mode: application page

The landing page takes creator applications instead of payments. Form options live in `lib/apply.config.ts`,
the form posts to `/api/apply`, rows are stored in the `applications` table (`supabase/migrations/0003_applications.sql`),
and `/admin` lists them with a WhatsApp button and a status. The page copy never names prices or the method.
The old checkout, thank-you and access code is still in the repo behind `SITE.flags.checkoutOpen` (false).

## Quick start

```bash
npm install
cp .env.example .env.local     # fill what you have, everything degrades gracefully
npm run dev
```

With no env at all the landing page, legal pages and checkout form render. Payments, status and admin data need Supabase. `/admin?demo=1` shows fake data in dev only, to check layout.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests for the receipt decision logic |
| `npm run seed` | Insert dummy orders (needs Supabase env) |
| `npm run setup:supabase` | One-command Supabase setup, see below |
| `npm run setup:netlify` | Imports `.env.netlify` into your Netlify site |
| `npm run build:downloads` | Build the six paid PDFs from `content/downloads/src` |
| `npm run upload:downloads` | Upload the PDFs to the private `downloads` bucket |

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page. Static. |
| `/?a=1`, `/?a=2`, `/?a=3` or `utm_content=1..3` | Hero headline variant. See "Hero A/B". |
| `/checkout` | No-nav checkout. `?plan=basic\|pro`, `?upgrade=DC-XXXX`, `?second=DC-XXXX` |
| `/thank-you?order=DC-XXXX` | Status timeline, polls every 20 seconds |
| `/access/[token]` | Gated course page |
| `/admin` | Password protected dashboard |
| `/refund-policy`, `/terms`, `/privacy` | Required for Meta ads |

## Where to edit things

| What | File |
|---|---|
| Prices, plans, bump, upgrade, pay-in-2, guarantee, chapters, downloads | `lib/offer.config.ts` |
| Proof numbers, Laraib screenshot slots, testimonials | `lib/proof.config.ts` |
| Brand, owner, WhatsApp, feature flags | `lib/site.config.ts` |
| Hero headline sets | `lib/heroes.ts` |
| Easypaisa and JazzCash details (shared with the Edge Function) | `supabase/functions/_shared/bank.config.ts` |
| Design tokens | `app/globals.css` |

### Change a price

Edit `PLANS`, `BUMP` or `PAY_IN_2` in `lib/offer.config.ts` and redeploy. The landing page, checkout, thank-you page, legal text and the amount the receipt must match all read from it. An order stores its own amount when it is created, so changing a price never breaks an order already in flight.

### Change or add proof

`lib/proof.config.ts`. A stat with `value: null` is hidden. A stat with `verified: false` shows a `~` in front of the number. Screenshot slots hide when `src` is empty. Drop WebP files in `public/proof/` and fill `src`, `alt`, `caption`. `TESTIMONIALS` is empty by design. Only add real, consented ones.

### Switch the guarantee

`GUARANTEE.type` in `lib/offer.config.ts` is `"performance"` (10 forms in 7 days at Rs 700/day, refund within 48 hours) or `"standard"` (7 day money back). The landing page, FAQ and `/refund-policy` follow it.

## Paid documents (downloads)

The six files buyers receive (lead form template, ad setup checklist, 5 ad scripts, 20 DM reply scripts, rate card and quote sheet, Barter Pitch Pack) live in `content/downloads/src/*.html` and build to PDF with headless Chrome.

- **`content/` is git-ignored on purpose.** The GitHub repository is public and these files are the product. If you make the repository private you can remove `content/` from `.gitignore` and version them.
- **Delivery is gated.** `/access/[token]/download/[id]` checks the buyer's token and plan (Pro-id files need the course plan; the Barter pack is now part of the course and the add-on is switched off), then redirects to a 60 second signed link from the private `downloads` bucket. Nothing is ever public.
- **To change a document:** edit the HTML in `content/downloads/src/`, run `npm run build:downloads`, then `npm run upload:downloads`. Buyers get the new version on their next click.
- **They are drafts.** Read every document before launch. The Roman Urdu is written the way people type it, but you should change anything that does not sound like you.

## Supabase setup

**Fastest way:** create a project on supabase.com (free plan is fine to test), then run `npm run setup:supabase`. The first run creates `.env.supabase` for you to fill in (project reference, database password, Anthropic key, Resend key and sender, site address, WhatsApp number). The Anthropic and Resend keys are optional: with them empty you launch **lean**, where every receipt waits in Needs review and you tap Mark as paid in `/admin` (the buyer's page unlocks by itself and you can send the link on WhatsApp from `/admin`). Add the keys later and run the command again to switch on automatic checking and emails. Run it again and it logs you in, creates the tables and private buckets, deploys the receipt checker with its secrets, uploads the PDFs, and writes `.env.netlify` with every variable Netlify needs. It is safe to re-run. `DRY_RUN=1 npm run setup:supabase` shows each step without touching anything online.

**By hand** (what the script does):

1. Create a project. Copy the URL and the service role key into `.env.local` and Netlify.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor. It creates `orders`, the append-only `order_events` (a trigger blocks update and delete), the `orders_current` view, RLS with no policies (only the service key can touch data), and the private `receipts` bucket.
3. Deploy the function and set its secrets:

```bash
supabase functions deploy verify-receipt --no-verify-jwt
supabase secrets set \
  ANTHROPIC_API_KEY=... \
  RESEND_API_KEY=... RESEND_FROM="DirectCollabs <access@directcollabs.pk>" \
  VERIFY_FUNCTION_SECRET=... \
  SITE_URL=https://directcollabs.pk \
  PIXEL_ID=... META_CAPI_TOKEN=... \
  WHATSAPP_NUMBER=923XXXXXXXXX
```

`VERIFY_FUNCTION_SECRET` must match the same variable in Netlify. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase.

4. Optional: `npm run seed` for dummy rows.

## Environment

| Variable | Where | Needed for |
|---|---|---|
| `NODE_VERSION` | Netlify | Set to `22` |
| `ADMIN_PASSWORD` | Netlify | `/admin` (8+ characters) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Netlify | Orders, receipts, status, admin |
| `VERIFY_FUNCTION_SECRET` | Netlify and Supabase | Calls from the site to the function |
| `ANTHROPIC_API_KEY` | Supabase | Receipt OCR (set as a function secret) |
| `RESEND_API_KEY`, `RESEND_FROM` | Netlify and Supabase | Access emails |
| `NEXT_PUBLIC_SITE_URL` | Netlify | OG tags, links in emails |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Netlify | All WhatsApp buttons. Digits only, country code first |
| `NEXT_PUBLIC_PAY_IN_2` | Netlify | `true` turns on pay-in-2 for Pro |
| `NEXT_PUBLIC_PIXEL_ID`, `META_CAPI_TOKEN` | Netlify | Meta Pixel and server events |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GADS_ID`, `NEXT_PUBLIC_GADS_CONVERSION_LABEL` | Netlify | GA4 and Google Ads stubs |
| `COURSE_VIDEO_URL` | Netlify | Embedded player on `/access` |
| `COURSE_INVITE_URL` | Netlify | External course link (for example Thinkific). The course page shows an Open the course button and no video |

`NEXT_PUBLIC_*` values are baked in at build time. Changing one needs a redeploy.

## How a payment flows

1. Name and WhatsApp blur on checkout inserts the order with a `Lead` event, so abandoned checkouts can be followed up from `/admin`.
2. The buyer pays by Easypaisa or JazzCash with the `DC-XXXX` reference, uploads the receipt.
3. The site hashes the file (sha256, duplicates are refused), stores it in the private bucket, appends `Submitted`, then calls the `verify-receipt` function after the redirect.
4. The function reads the receipt with a vision model and approves only if all of these hold: confidence 0.5 or more, amount equals the order (or the pay-in-2 part due), receiver matches the configured accounts, a transaction id is present and unseen, the file hash is unseen, the date is within 48 hours, status is success.
5. Approve appends `Approved`, creates the access token, emails the link and sends Meta `Purchase` from the server. Anything else appends `Needs review` with the reason and what the OCR read.
6. Any error in the function also lands in `Needs review`. It never approves on a failure. If the function cannot be reached at all, the site parks the order in `Needs review` itself.

`order_events` is append-only. Current status is the latest row.

### Admin

Three buckets: Leads (WhatsApp follow-up), Needs review (reason, OCR read, receipt viewer by signed URL, ask for the real receipt, Mark as paid, Back to leads, each needing a second tap), Sales (tagged `auto` or `manual by admin`). Mark as paid sends the access email and fires the Meta `Purchase`, same as an auto approval.

## Tracking

`lib/track.ts`. The Pixel and gtag load after the page has finished loading and the main thread is idle, so tracking never touches LCP. Everything is a no-op while its env var is empty.

PageView, ViewContent (landing), InitiateCheckout, AddPaymentInfo (receipt submit) fire in the browser and again from `/api/track` through the Conversions API with the same `event_id`, so Meta dedups. Purchase is sent by the server on approval. The thank-you page also fires the browser Purchase with the same `event_id`, again for dedup. UTMs, `fbclid`, `_fbp` and `_fbc` are saved per session on every route and stored on the order.

## Hero A/B

Three headline sets in `lib/heroes.ts`: 1 pain, 2 method (default), 3 proof. Put `?a=1|2|3` or `utm_content=1|2|3` on the ad URL. `proxy.ts` rewrites those requests to prerendered pages `/v/1`, `/v/2`, `/v/3`, so every variant is static, the headline is in the first HTML (no flash, no swap after hydration), and the address bar keeps the UTMs. Variant pages are `noindex` with the canonical set to `/`. The `a` value is saved on the order in `utm.a`.

## Performance

Measured with Lighthouse 12, mobile profile, on the production build (`next build && next start`, localhost, so no CDN).

| Measure | Real slow-4G throttling applied | Lighthouse simulated |
|---|---|---|
| Performance score | 95 | 96 |
| Accessibility, best practices, SEO | n/a | 100, 100, 100 |
| First contentful paint | 1.0 s | 0.8 s |
| Largest contentful paint | 1.0 s | 2.7 s |
| Layout shift | 0 | 0 |
| Page weight | 285 KiB | 285 KiB |

The simulated LCP is Lighthouse's model, not a measurement. With throttling actually applied the page paints its headline at 1.0 s. The model projects 2.7 s because it pulls the JavaScript download into the LCP path. Treat the applied number as the real one, and re-measure on Netlify with a real CDN before launch. The variant page scores 66 on SEO only because it is deliberately `noindex`.

Checked at 360 and 390 px on every page: no horizontal scroll, tap targets at least 44 px (inline prose links excepted).

## Assumptions

Decisions made without asking. Change any of them in the file named.

- **Founding counter is off by default** (`FOUNDING.enabled` in `lib/offer.config.ts`). The site does not raise the price by itself, so a counter promising "then Rs 9,900" would be fake scarcity unless you change the price yourself. If you turn it on, `/admin` shows a red banner at 100 verified Pro sales telling you to raise `PLANS.pro.price`.
- **Pay-in-2 flag** is `NEXT_PUBLIC_PAY_IN_2` so it can be flipped per Netlify deploy context. It only applies to Pro. The Barter Pitch Pack rides on the first payment. Access unlocks after the first part. Part two is a linked order (`?second=`), with no automatic reminders or access pause. That is a manual WhatsApp follow-up from `/admin`.
- **Basic to Pro upgrade** is a linked order (`kind = upgrade`) at Rs 3,000. When approved the parent order becomes Pro, so the same access link unlocks the Pro files.
- **Receipt model** is `claude-opus-5-5` with the server-side refusal fallback enabled. Receipts are read with structured JSON output. Cost is one vision call per submitted receipt.
- **Amount tolerance** is Rs 0 and **receipt age limit** is 48 hours (`bank.config.ts`). Wallet fees that shave rupees off will land in Needs review.
- **Receiver matching** compares the last 8 characters of the receiver account to the configured accounts, because wallet apps often mask digits.
- **Chapter lengths** (22, 18, 28, 20, 16, 16 minutes) are placeholders that add to 2 hours. Edit `CHAPTERS`.
- **Download files** are drafts written for you (see Paid documents). The lead form has 3 required questions plus an optional fourth, "What do you want from me?", which is where the sample cards' "Video content of the dress" comes from.
- **Proof numbers** are the ones you gave (960 forms, Rs 77, Rs 80,000, 15 deals, Rs 70 to Rs 100). All are marked unverified and show with a `~`.
- **About copy** ("Spent years on the brand side watching creators get underpaid by the middle man") is drafted from your brief. Check it is true before launch.
- **Legal pages** are plain-language drafts, not legal advice. Have them reviewed. The governing law is stated as Pakistan.
- **Support email** `hello@directcollabs.pk` is a placeholder (`SITE.supportEmail`).
- **No cookie banner.** Pakistan has no general consent-banner requirement. Add one if you target regions that do.
- **Admin sessions** last 30 days and are a single shared password. The cookie is an HMAC of the password, so changing `ADMIN_PASSWORD` signs everyone out.
- **Hosting** relies on Netlify auto-detecting Next.js. `netlify.toml` only sets headers and the build command. If a deploy fails, check Netlify's Next.js runtime settings first.
- **Inline CSS** is on (`experimental.inlineCss`). It removes one render-blocking request for first-time visitors and costs repeat visitors a re-download of about 8 KB of CSS.
