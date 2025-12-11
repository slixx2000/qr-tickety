-- tickets
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  metadata jsonb,
  created_at timestamptz default now(),
  used boolean default false,
  used_at timestamptz,
  used_by text
);

-- scans log
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete set null,
  scanned_at timestamptz default now(),
  scanner text,
  success boolean,
  note text
);

-- profiles table to track admin users
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade,
  email text,
  is_admin boolean default false,
  primary key (id)
);

-- Redeem function (atomic)
create or replace function redeem_ticket(p_code text, p_scanner text)
returns table(id uuid, code text, used boolean, used_at timestamptz) as $$
begin
  return query
  update tickets
  set used = true, used_at = now(), used_by = p_scanner
  where code = p_code and used = false
  returning id, code, used, used_at;
end;
$$ language plpgsql security definer;
