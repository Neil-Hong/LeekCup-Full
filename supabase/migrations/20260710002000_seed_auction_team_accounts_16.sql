insert into public.auction_users (
  username,
  password_salt,
  password_hash,
  display_name,
  team_sname,
  role,
  budget
)
values
  ('team1', 'auction-team1', encode(sha256('auction-team1:123456'::bytea), 'hex'), 'team1', 'AC', 'bidder', 100000000),
  ('team2', 'auction-team2', encode(sha256('auction-team2:123456'::bytea), 'hex'), 'team2', 'MC', 'bidder', 100000000),
  ('team3', 'auction-team3', encode(sha256('auction-team3:123456'::bytea), 'hex'), 'team3', 'Chelsea', 'bidder', 100000000),
  ('team4', 'auction-team4', encode(sha256('auction-team4:123456'::bytea), 'hex'), 'team4', 'PSG', 'bidder', 100000000),
  ('team5', 'auction-team5', encode(sha256('auction-team5:123456'::bytea), 'hex'), 'team5', 'Barcelona', 'bidder', 100000000),
  ('team6', 'auction-team6', encode(sha256('auction-team6:123456'::bytea), 'hex'), 'team6', 'Liverpool', 'bidder', 100000000),
  ('team7', 'auction-team7', encode(sha256('auction-team7:123456'::bytea), 'hex'), 'team7', 'Crystal', 'bidder', 100000000),
  ('team8', 'auction-team8', encode(sha256('auction-team8:123456'::bytea), 'hex'), 'team8', 'Sunderland', 'bidder', 100000000),
  ('team9', 'auction-team9', encode(sha256('auction-team9:123456'::bytea), 'hex'), 'team9', 'MU', 'bidder', 100000000),
  ('team10', 'auction-team10', encode(sha256('auction-team10:123456'::bytea), 'hex'), 'team10', 'Bayern', 'bidder', 100000000),
  ('team11', 'auction-team11', encode(sha256('auction-team11:123456'::bytea), 'hex'), 'team11', 'RealMadrid', 'bidder', 100000000),
  ('team12', 'auction-team12', encode(sha256('auction-team12:123456'::bytea), 'hex'), 'team12', 'Arsenal', 'bidder', 100000000),
  ('team13', 'auction-team13', encode(sha256('auction-team13:123456'::bytea), 'hex'), 'team13', 'Birmingham', 'bidder', 100000000),
  ('team14', 'auction-team14', encode(sha256('auction-team14:123456'::bytea), 'hex'), 'team14', 'Frankfurt', 'bidder', 100000000),
  ('team15', 'auction-team15', encode(sha256('auction-team15:123456'::bytea), 'hex'), 'team15', 'SB29', 'bidder', 100000000),
  ('team16', 'auction-team16', encode(sha256('auction-team16:123456'::bytea), 'hex'), 'team16', 'Villarreal', 'bidder', 100000000)
on conflict (username) do update set
  password_salt = excluded.password_salt,
  password_hash = excluded.password_hash,
  display_name = excluded.display_name,
  team_sname = excluded.team_sname,
  role = excluded.role,
  budget = excluded.budget,
  updated_at = now();
