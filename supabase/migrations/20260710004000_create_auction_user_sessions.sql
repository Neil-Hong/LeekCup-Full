create table if not exists public.auction_user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.auction_users(id) on delete cascade,
  session_token_hash text not null,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists auction_user_sessions_user_active_idx
  on public.auction_user_sessions(user_id, created_at desc)
  where revoked_at is null;

create index if not exists auction_user_sessions_expires_idx
  on public.auction_user_sessions(expires_at);

alter table public.auction_user_sessions enable row level security;
