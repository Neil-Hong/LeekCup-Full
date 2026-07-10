create table if not exists public.auction_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_salt text not null,
  password_hash text not null,
  display_name text not null,
  team_sname text references public.teams(sname),
  role text not null check (role in ('admin', 'bidder')),
  budget bigint not null default 100000000 check (budget >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auction_players (
  auction_order integer primary key check (auction_order > 0),
  player_key text not null unique references public.test_player(player_key),
  status text not null default 'pending' check (status in ('pending', 'active', 'sold', 'unsold')),
  sold_to_user_id uuid references public.auction_users(id),
  sold_to_team_sname text references public.teams(sname),
  sold_price bigint,
  auction_mode text not null default 'public' check (auction_mode in ('public', 'sealed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auction_sessions (
  id uuid primary key default gen_random_uuid(),
  current_order integer references public.auction_players(auction_order),
  current_player_key text references public.test_player(player_key),
  mode text not null default 'public' check (mode in ('public', 'sealed')),
  status text not null default 'idle' check (status in ('idle', 'running', 'revealing', 'finished')),
  started_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.auction_sessions(id) on delete cascade,
  player_key text not null references public.test_player(player_key),
  user_id uuid not null references public.auction_users(id),
  team_sname text not null references public.teams(sname),
  amount bigint not null check (amount >= 0),
  mode text not null check (mode in ('public', 'sealed')),
  is_winning boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists auction_bids_sealed_one_per_user
  on public.auction_bids(player_key, user_id)
  where mode = 'sealed';

create index if not exists auction_bids_player_amount_idx
  on public.auction_bids(player_key, amount desc, created_at asc);

create table if not exists public.auction_results (
  player_key text primary key references public.test_player(player_key),
  winner_user_id uuid references public.auction_users(id),
  winner_team_sname text references public.teams(sname),
  final_price bigint,
  mode text not null check (mode in ('public', 'sealed')),
  created_at timestamptz not null default now()
);

alter table public.auction_users enable row level security;
alter table public.auction_players enable row level security;
alter table public.auction_sessions enable row level security;
alter table public.auction_bids enable row level security;
alter table public.auction_results enable row level security;

insert into public.auction_players (auction_order, player_key)
select row_number() over (order by overall_rating desc, name asc, player_key asc)::integer as auction_order,
       player_key
from public.test_player
on conflict (auction_order) do nothing;

insert into public.auction_sessions (current_order, current_player_key, mode, status)
select auction_order, player_key, 'public', 'idle'
from public.auction_players
where not exists (select 1 from public.auction_sessions)
order by auction_order asc
limit 1;
