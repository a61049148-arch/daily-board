-- Daily Board schema. Run once in Supabase → SQL Editor (or via the Supabase connector).
-- Single-owner app: every row belongs to a user; row level security keeps it private.

create or replace function public.db_owner() returns uuid
language sql stable security definer set search_path = public, auth as $$
  select coalesce(auth.uid(), (select id from auth.users order by created_at limit 1))
$$;
-- Only signed-in users (and the Supabase connector) may call it; stops anonymous lookups of the owner id.
revoke execute on function public.db_owner() from public, anon;
grant execute on function public.db_owner() to authenticated, service_role;

create or replace function public.db_now_ms() returns bigint
language sql stable as $$ select (extract(epoch from clock_timestamp()) * 1000)::bigint $$;

create or replace function public.db_new_id(prefix text) returns text
language sql volatile as $$ select prefix || substr(md5(random()::text || clock_timestamp()::text), 1, 12) $$;

-- Tasks
create table if not exists public.tasks (
  id          text primary key default public.db_new_id('t'),
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  title       text not null,
  area        text not null default 'personal' check (area in ('baselab','dg','truenorth','personal')),
  due         date,
  done        boolean not null default false,
  done_on     date,
  sort_order  bigint not null default public.db_now_ms(),
  person      text not null default '',
  note        text not null default '',
  source      text not null default '',
  created     timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists tasks_user_open on public.tasks (user_id, done, due);

-- People (clients, leads, contacts)
create table if not exists public.people (
  id            text primary key default public.db_new_id('p'),
  user_id       uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  name          text not null,
  org           text not null default '',
  area          text not null default 'personal' check (area in ('baselab','dg','truenorth','personal')),
  contact       text not null default '',
  follow_up     date,
  last_contact  date,
  note          text not null default '',
  updated_at    timestamptz not null default now()
);

-- One running notes page per area (id = area id)
create table if not exists public.notes (
  id          text not null,
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  text        text not null default '',
  updated     timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- Day plans from "Plan my day" (id = YYYY-MM-DD)
create table if not exists public.plans (
  id          text not null,
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  brief       text not null default '',
  blocks      jsonb not null default '[]'::jsonb,
  created     timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- Keep updated_at fresh
create or replace function public.db_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['tasks','people','notes','plans'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.db_touch()', t, t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner only" on public.%I', t);
    execute format('create policy "owner only" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('alter table public.%I replica identity full', t);
  end loop;
end $$;

-- Live updates across devices
do $$ declare t text; begin
  foreach t in array array['tasks','people','notes','plans'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- v1.1: times, reminders, repeats, phone notifications ----------
-- Safe to run more than once.
alter table public.tasks add column if not exists at_time      text    not null default '';   -- 'HH:MM' local time, '' = no time
alter table public.tasks add column if not exists remind_min   integer;                         -- minutes before at_time; null = no reminder
alter table public.tasks add column if not exists alarm        boolean not null default false;  -- also set an iPhone alarm (via the Shortcut)
alter table public.tasks add column if not exists repeat       text    not null default '';   -- '', daily, weekdays, weekly, monthly
alter table public.tasks add column if not exists reminded_key text    not null default '';   -- server: which due|time|remind was last notified
create index if not exists tasks_user_timed on public.tasks (user_id, due) where not done and at_time <> '';

-- One row per device that turned on notifications. Written by the server only.
create table if not exists public.push_subs (
  endpoint      text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  p256dh        text not null,
  auth          text not null,
  tz            text not null default 'America/Los_Angeles',
  morning       text not null default '08:00',  -- morning summary time, '' = off
  morning_sent  date,
  created       timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "owner only" on public.push_subs;
create policy "owner only" on public.push_subs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists push_subs_touch on public.push_subs;
create trigger push_subs_touch before update on public.push_subs for each row execute function public.db_touch();

-- ---------- v1.2: Health section logs ----------
-- One row per entry: weight (w-<day>), waist (z-<day>), sets (s-<day>-<exercise>), meal (m-<day>-<meal>), session (t-<day>), boxing (b-<day>).
-- Safe to run more than once.
create table if not exists public.health_logs (
  id          text not null,
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  day         date not null,
  kind        text not null check (kind in ('weight','waist','sets','meal','session','boxing')),
  key         text not null default '',
  data        jsonb not null default '{}'::jsonb,
  created     timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists health_logs_user_day on public.health_logs (user_id, day);
alter table public.health_logs enable row level security;
drop policy if exists "owner only" on public.health_logs;
create policy "owner only" on public.health_logs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
alter table public.health_logs replica identity full;
drop trigger if exists health_logs_touch on public.health_logs;
create trigger health_logs_touch before update on public.health_logs for each row execute function public.db_touch();
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'health_logs') then
    alter publication supabase_realtime add table public.health_logs;
  end if;
end $$;
