alter table public.team_lineup_slots
  add column if not exists player_role text,
  add column if not exists focus text;

create table if not exists public.team_set_piece_assignments (
  team_sname text not null references public.teams(sname) on update cascade on delete cascade,
  assignment_key text not null,
  player_key text not null,
  updated_at timestamptz not null default now(),
  primary key (team_sname, assignment_key)
);

create index if not exists team_set_piece_assignments_team_sname_idx
  on public.team_set_piece_assignments(team_sname);

alter table public.team_set_piece_assignments enable row level security;
