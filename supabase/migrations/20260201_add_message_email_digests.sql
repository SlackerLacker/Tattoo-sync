-- Queue for batching message email notifications
create table if not exists public.message_email_digests (
  user_id uuid not null,
  studio_id uuid null,
  conversation_id uuid not null,
  last_message_at timestamp with time zone not null default timezone('utc'::text, now()),
  last_message_preview text null,
  pending_count integer not null default 0,
  next_send_at timestamp with time zone null,
  last_sent_at timestamp with time zone null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint message_email_digests_pkey primary key (user_id, conversation_id),
  constraint message_email_digests_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
  constraint message_email_digests_conversation_id_fkey foreign key (conversation_id) references conversations (id) on delete cascade,
  constraint message_email_digests_studio_id_fkey foreign key (studio_id) references studios (id) on delete cascade
);

create index IF not exists idx_message_email_digests_next_send on public.message_email_digests (next_send_at);
create index IF not exists idx_message_email_digests_user on public.message_email_digests (user_id);

alter table public.message_email_digests enable row level security;

-- Service-only access recommended; no client policies needed.

create or replace function public.set_message_email_digests_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_message_email_digests_updated_at on public.message_email_digests;
create trigger trg_message_email_digests_updated_at
before update on public.message_email_digests
for each row execute function public.set_message_email_digests_updated_at();
