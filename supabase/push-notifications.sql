create table if not exists public.legacy_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null check (user_id in ('knut', 'ingrid')),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists legacy_push_subscriptions_user_id_idx
  on public.legacy_push_subscriptions (user_id);

alter table public.legacy_push_subscriptions enable row level security;

create table if not exists public.legacy_push_notification_log (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null,
  item_type text not null check (item_type in ('task', 'calendar')),
  item_id uuid not null,
  log_key text not null unique,
  sent_at timestamptz not null default now()
);

create index if not exists legacy_push_notification_log_item_idx
  on public.legacy_push_notification_log (item_type, item_id);

alter table public.legacy_push_notification_log enable row level security;
