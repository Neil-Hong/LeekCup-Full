delete from public.auction_users
where username = 'show';

alter table public.auction_users
  drop constraint if exists auction_users_role_check;

alter table public.auction_users
  add constraint auction_users_role_check
  check (role in ('admin', 'bidder'));
