alter table public.auction_sessions
  add column if not exists tie_round integer not null default 0,
  add column if not exists tie_team_snames text[] not null default '{}';

notify pgrst, 'reload schema';
