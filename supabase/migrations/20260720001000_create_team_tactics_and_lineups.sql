create table if not exists public.team_tactics (
  team_sname text primary key references public.teams(sname) on update cascade on delete cascade,
  formation text not null default '4-3-3-holding',
  tactics jsonb not null default '{"defensiveStyle":"balanced","buildUpStyle":"balanced","width":50,"lineHeight":50}'::jsonb,
  updated_by uuid references public.auction_users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_lineup_slots (
  team_sname text not null references public.teams(sname) on update cascade on delete cascade,
  slot_id text not null,
  player_key text not null,
  role text not null default 'balanced',
  primary key (team_sname, slot_id),
  unique (team_sname, player_key)
);

create index if not exists team_lineup_slots_team_sname_idx
  on public.team_lineup_slots(team_sname);

alter table public.team_tactics enable row level security;
alter table public.team_lineup_slots enable row level security;
