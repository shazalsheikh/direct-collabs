-- Creator applications from the landing page form. One row per application.
-- The site no longer sells through checkout: a creator applies, the owner follows up on WhatsApp.
-- Safe to run more than once.

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  whatsapp     text not null,                       -- 92XXXXXXXXXX digits
  instagram    text not null,
  followers    text not null,                       -- range label, see lib/apply.config.ts
  rate         text not null,                       -- what they charge for one reel, range label
  paid_status  text not null,                       -- do brands pay them today
  note         text,
  utm          jsonb not null default '{}'::jsonb,
  fbp          text,
  fbc          text,
  fbclid       text,
  status       text not null default 'New' check (status in ('New','Contacted','Qualified','Won','Not a fit')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists applications_created_idx  on public.applications (created_at desc);
create index if not exists applications_whatsapp_idx on public.applications (whatsapp);

-- RLS on with no policies: only the server (service role) can read or write.
alter table public.applications enable row level security;
revoke all on table public.applications from anon, authenticated;
grant all on table public.applications to service_role;
