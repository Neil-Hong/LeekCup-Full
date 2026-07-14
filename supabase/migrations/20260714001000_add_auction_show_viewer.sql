alter table public.auction_users
  drop constraint if exists auction_users_role_check;

alter table public.auction_users
  add constraint auction_users_role_check
  check (role in ('admin', 'bidder', 'viewer'));

insert into public.auction_users (
  username,
  password_salt,
  password_hash,
  display_name,
  team_sname,
  role,
  budget
)
values (
  'show',
  'auction-show',
  encode(sha256('auction-show:show123'::bytea), 'hex'),
  'show',
  null,
  'viewer',
  0
)
on conflict (username) do update set
  password_salt = excluded.password_salt,
  password_hash = excluded.password_hash,
  display_name = excluded.display_name,
  team_sname = excluded.team_sname,
  role = excluded.role,
  budget = excluded.budget,
  updated_at = now();
