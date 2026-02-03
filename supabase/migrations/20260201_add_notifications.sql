-- Notifications table for in-app alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  studio_id uuid null,
  type text not null,
  title text not null,
  body text null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  read_at timestamp with time zone null,
  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
  constraint notifications_studio_id_fkey foreign key (studio_id) references studios (id) on delete cascade
);

create index IF not exists idx_notifications_user_unread on public.notifications using btree (user_id, read_at);
create index IF not exists idx_notifications_studio_created on public.notifications using btree (studio_id, created_at desc);

alter table public.notifications enable row level security;

-- Users can read their own notifications
create policy "Users can read own notifications"
  on public.notifications
  for select
  using (user_id = auth.uid());

-- Users can update (mark read) their own notifications
create policy "Users can update own notifications"
  on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
