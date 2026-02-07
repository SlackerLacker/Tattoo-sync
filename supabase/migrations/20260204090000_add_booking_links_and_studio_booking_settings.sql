-- Booking links and studio booking settings

alter table if exists public.studios
  add column if not exists allow_online_booking boolean default true,
  add column if not exists require_deposit boolean default false,
  add column if not exists deposit_amount numeric default 0,
  add column if not exists deposit_percentage boolean default false;

create table if not exists public.booking_links (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  booking_slug text not null,
  label text,
  source text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (studio_id, booking_slug)
);

create index if not exists idx_booking_links_studio_id on public.booking_links using btree (studio_id);
create index if not exists idx_booking_links_slug on public.booking_links using btree (booking_slug);

alter table if exists public.artists
  add column if not exists status text not null default 'active';

create index if not exists idx_artists_status on public.artists using btree (status);

alter table if exists public.appointments
  add column if not exists payment_status text,
  add column if not exists payment_method text;

create index if not exists idx_appointments_payment_status on public.appointments using btree (payment_status);
