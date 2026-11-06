-- DirectCollabs schema. Run in the Supabase SQL editor or `supabase db push`.
-- orders: one row per checkout (editable for details).
-- order_events: APPEND ONLY. Every status decision is a new row. Current status = latest row.

create extension if not exists pgcrypto;

create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  ref             text unique not null,                       -- DC-XXXX
  plan            text not null check (plan in ('basic','pro')),
  bump            boolean not null default false,
  amount          integer not null default 0,                 -- total due, PKR
  name            text,
  whatsapp        text,                                       -- 92XXXXXXXXXX digits
  email           text,
  instagram       text,
  utm             jsonb not null default '{}'::jsonb,
  fbp             text,
  fbc             text,
  fbclid          text,
  event_id        text,                                       -- Meta dedup id for Purchase
  parent_order_id uuid references orders(id),                 -- upgrade orders point at the Basic order
  pay_in_2        jsonb,                                      -- {enabled, first, second, due_at, first_paid}
  access_token    text unique,                                -- set on approval
  created_at      timestamptz not null default now()
);

create table if not exists order_events (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  status        text not null check (status in ('Lead','Submitted','Approved','Needs review','Rejected')),
  method        text check (method in ('auto','manual')),
  reason        text,
  ocr           jsonb,
  receipt_path  text,
  receipt_hash  text,
  txn_id        text,
  created_at    timestamptz not null default now()
);

create index if not exists order_events_order_idx on order_events (order_id, created_at desc);
create index if not exists order_events_hash_idx  on order_events (receipt_hash) where receipt_hash is not null;
create index if not exists order_events_txn_idx   on order_events (txn_id) where txn_id is not null;
create index if not exists orders_created_idx     on orders (created_at desc);

-- Append-only guard. Nothing edits or deletes an event, not even the service key.
create or replace function order_events_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'order_events is append-only';
end $$;

drop trigger if exists order_events_no_change on order_events;
create trigger order_events_no_change
  before update or delete on order_events
  for each row execute function order_events_append_only();

-- Current status per order = latest event.
create or replace view orders_current as
select
  o.*,
  e.status,
  e.method,
  e.reason,
  e.receipt_path,
  e.receipt_hash,
  e.txn_id,
  e.ocr,
  e.created_at as status_at
from orders o
join lateral (
  select * from order_events
  where order_id = o.id
  order by created_at desc
  limit 1
) e on true;

-- RLS on. No policies = nobody but the service role can read or write.
alter table orders enable row level security;
alter table order_events enable row level security;

-- Private bucket for receipts. Signed URLs only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
