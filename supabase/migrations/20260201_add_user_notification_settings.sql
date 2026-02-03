-- Per-user notification preferences
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  user_id uuid not null,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default true,
  in_app_enabled boolean not null default true,
  new_bookings boolean not null default true,
  cancellations boolean not null default true,
  payments boolean not null default true,
  reviews boolean not null default true,
  reminders boolean not null default true,
  reminder_time integer not null default 24,
  notify_new_conversation boolean not null default true,
  notify_new_message boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint user_notification_settings_pkey primary key (user_id),
  constraint user_notification_settings_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade
);

create index IF not exists idx_user_notification_settings_user on public.user_notification_settings (user_id);

alter table public.user_notification_settings enable row level security;

create policy "Users can read own notification settings"
  on public.user_notification_settings
  for select
  using (user_id = auth.uid());

create policy "Users can update own notification settings"
  on public.user_notification_settings
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can insert own notification settings"
  on public.user_notification_settings
  for insert
  with check (user_id = auth.uid());

-- Keep updated_at current
create or replace function public.set_user_notification_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_notification_settings_updated_at on public.user_notification_settings;
create trigger trg_user_notification_settings_updated_at
before update on public.user_notification_settings
for each row execute function public.set_user_notification_settings_updated_at();
