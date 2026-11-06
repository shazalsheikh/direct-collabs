# DirectCollabs

Funnel for the DirectCollabs course: a recorded 2-hour Roman Urdu course that teaches Pakistani creators to run one Meta ad from their own page so brand owners apply to them directly.

Stack: Next.js 16 (App Router, TypeScript, Tailwind v4), Supabase (Postgres, private storage, Edge Functions), Resend, Netlify.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill what you have, everything degrades gracefully
npm run dev
```

## Where things live

| What | File |
|---|---|
| Prices, plans, bump, upgrade, pay-in-2, guarantee, chapters | `lib/offer.config.ts` |
| Proof numbers, Laraib media slots, testimonials | `lib/proof.config.ts` |
| Brand, owner, WhatsApp, feature flags | `lib/site.config.ts` |
| Hero headline variants (`?a=1|2|3`) | `lib/heroes.ts` |
| Bank / wallet details (shared with the Edge Function) | `supabase/functions/_shared/bank.config.ts` |
| Design tokens | `app/globals.css` |

## Assumptions

Decisions made without asking. Change any of them in the file named.

- Founding-price counter counts orders with a latest status of `Approved` on the Pro plan (`lib/offer.config.ts` FOUNDING).
- Pay-in-2 flag is `NEXT_PUBLIC_PAY_IN_2` in env so it can be flipped per deploy context on Netlify.
- Proof numbers render with a "~" prefix while `verified: false`.
- Supabase Edge Function imports the bank config from `supabase/functions/_shared/`; `lib/bank.config.ts` re-exports it so there is one file.

(More added per phase.)
