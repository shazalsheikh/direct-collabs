-- Coaching becomes a second product sold through the same checkout (screenshot upload).
-- Widens the plan check to allow 'coaching'. Safe to run more than once.
alter table public.orders drop constraint if exists orders_plan_check;
alter table public.orders add constraint orders_plan_check check (plan in ('basic', 'pro', 'coaching'));
