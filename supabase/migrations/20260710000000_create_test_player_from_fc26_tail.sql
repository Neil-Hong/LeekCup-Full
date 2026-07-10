drop table if exists public.test_player;

create table public.test_player (
  like public.fc26_players including all
);

insert into public.test_player
select *
from (
  select *
  from public.fc26_players
  order by created_at desc, player_key desc
  limit 100
) recent_players;

alter table public.test_player enable row level security;
