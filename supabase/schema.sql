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
  kind        text not null check (kind in ('weight','waist','sets','meal','session','boxing','step')),
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

-- ---------- v1.3: build log, daily recaps, vault sync ----------
-- Safe to run more than once.
-- One row per finished piece of work, written by the build-log skill (log_build) or the board.
create table if not exists public.builds (
  id          text primary key default public.db_new_id('b'),
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  area        text not null default 'personal' check (area in ('baselab','dg','truenorth','personal')),
  size        text not null default 'big' check (size in ('big','small')),
  title       text not null,
  summary     text not null default '',
  points      jsonb not null default '[]'::jsonb,   -- short bullet strings
  open_items  text not null default '',             -- what is still open
  live        boolean not null default false,
  link        text not null default '',             -- file, repo path or URL
  day         date not null default (now() at time zone 'America/Los_Angeles')::date,
  at_time     text not null default '',             -- 'HH:MM' local
  created     timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists builds_user_day on public.builds (user_id, day desc);

-- One recap per day (id = YYYY-MM-DD). Written by /api/push/tick after 9 PM local.
create table if not exists public.recaps (
  id          text not null,
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  text        text not null default '',              -- overall recap, markdown
  areas       jsonb not null default '{}'::jsonb,    -- {truenorth: "...", dg: "..."}
  build_count integer not null default 0,
  created     timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);

do $$ declare t text; begin
  foreach t in array array['builds','recaps'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.db_touch()', t, t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner only" on public.%I', t);
    execute format('create policy "owner only" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('alter table public.%I replica identity full', t);
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Access tokens for tools outside the app (build-log skill, Obsidian plugin). Only the hash is stored.
-- No policies: nobody can read this table through the API; only the functions below use it.
create table if not exists public.api_tokens (
  token_hash  text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null default '',
  created     timestamptz not null default now()
);
alter table public.api_tokens enable row level security;

create or replace function public.token_owner(tok text) returns uuid
language sql stable security definer set search_path = public, extensions as $$
  select user_id from public.api_tokens where token_hash = encode(extensions.digest(coalesce(tok, ''), 'sha256'), 'hex')
$$;
revoke execute on function public.token_owner(text) from public, anon, authenticated;

-- Called by the build-log skill: log_build(token, {area,size,title,summary,points,openItems,live,link,day,time,id?})
create or replace function public.log_build(tok text, entry jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := public.token_owner(tok); bid text;
begin
  if uid is null then raise exception 'bad token' using errcode = '28000'; end if;
  if coalesce(entry->>'title', '') = '' then raise exception 'title required'; end if;
  bid := coalesce(nullif(entry->>'id', ''), public.db_new_id('b'));
  insert into public.builds (id, user_id, area, size, title, summary, points, open_items, live, link, day, at_time)
  values (bid, uid,
    case when entry->>'area' in ('baselab','dg','truenorth','personal') then entry->>'area' else 'personal' end,
    case when entry->>'size' = 'small' then 'small' else 'big' end,
    left(entry->>'title', 200), left(coalesce(entry->>'summary', ''), 2000),
    case when jsonb_typeof(entry->'points') = 'array' then entry->'points' else '[]'::jsonb end,
    left(coalesce(entry->>'openItems', ''), 1000), coalesce((entry->>'live')::boolean, false),
    left(coalesce(entry->>'link', ''), 500),
    coalesce(nullif(entry->>'day', '')::date, (now() at time zone 'America/Los_Angeles')::date),
    coalesce(nullif(entry->>'time', ''), to_char(now() at time zone 'America/Los_Angeles', 'HH24:MI')))
  on conflict (id) do update set area = excluded.area, size = excluded.size, title = excluded.title, summary = excluded.summary,
    points = excluded.points, open_items = excluded.open_items, live = excluded.live, link = excluded.link
    where public.builds.user_id = uid;
  return bid;
end $$;

-- Called by the Obsidian plugin: entries and recaps on or after a day, optionally for one area.
create or replace function public.vault_feed(tok text, since date, only_area text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := public.token_owner(tok);
begin
  if uid is null then raise exception 'bad token' using errcode = '28000'; end if;
  return jsonb_build_object(
    'builds', coalesce((select jsonb_agg(to_jsonb(b) - 'user_id' order by b.day desc, b.at_time desc) from public.builds b
                where b.user_id = uid and b.day >= since and (only_area is null or b.area = only_area)), '[]'::jsonb),
    'recaps', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'text', r.text, 'areas', r.areas, 'updated_at', r.updated_at) order by r.id desc)
                from public.recaps r where r.user_id = uid and r.id >= since::text), '[]'::jsonb));
end $$;

-- Builds from the last two weeks, for "what did I build" without the vault.
create or replace function public.recent_builds(tok text, days integer default 14) returns jsonb
language sql stable security definer set search_path = public as $$
  select public.vault_feed(tok, ((now() at time zone 'America/Los_Angeles')::date - least(greatest(days, 1), 90)), null)
$$;

grant execute on function public.log_build(text, jsonb) to anon, authenticated;
grant execute on function public.vault_feed(text, date, text) to anon, authenticated;
grant execute on function public.recent_builds(text, integer) to anon, authenticated;

-- v1.3 Health HQ steps: allow 'step' logs (routine items like phone away / lights out).
alter table public.health_logs drop constraint if exists health_logs_kind_check;
alter table public.health_logs add constraint health_logs_kind_check check (kind in ('weight','waist','sets','meal','session','boxing','step'));

-- ---------- v1.4: editable areas ----------
-- One row per area the owner changed or added (id = 'baselab', 'dg', 'truenorth', 'personal' or a new slug).
-- The board falls back to its built-in four when a row is missing. Safe to run more than once.
create table if not exists public.areas (
  id          text not null,
  user_id     uuid not null default public.db_owner() references auth.users(id) on delete cascade,
  name        text not null default '',
  short       text not null default '',
  color       text not null default '',        -- '#rrggbb', or '' for the built-in color
  icon        text not null default '',        -- glyph name, or 'letter'
  logo        text not null default '',        -- 'builtin', a small PNG data URL, or ''
  about       text not null default '',        -- what the area covers; used by Plan my day and Brain dump
  sort_order  bigint not null default public.db_now_ms(),
  archived    boolean not null default false,
  updated     timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.areas enable row level security;
drop policy if exists "owner only" on public.areas;
create policy "owner only" on public.areas for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
alter table public.areas replica identity full;
drop trigger if exists areas_touch on public.areas;
create trigger areas_touch before update on public.areas for each row execute function public.db_touch();
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'areas') then
    alter publication supabase_realtime add table public.areas;
  end if;
end $$;

-- Tasks, people and build log entries can now belong to any area, not only the first four.
alter table public.tasks drop constraint if exists tasks_area_check;
alter table public.people drop constraint if exists people_area_check;
alter table public.builds drop constraint if exists builds_area_check;

-- log_build accepts any of the owner's areas (built-in or added).
create or replace function public.log_build(tok text, entry jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := public.token_owner(tok); bid text; a text := lower(coalesce(entry->>'area', ''));
begin
  if uid is null then raise exception 'bad token' using errcode = '28000'; end if;
  if coalesce(entry->>'title', '') = '' then raise exception 'title required'; end if;
  if not (a in ('baselab','dg','truenorth','personal') or exists (select 1 from public.areas r where r.user_id = uid and r.id = a)) then a := 'personal'; end if;
  bid := coalesce(nullif(entry->>'id', ''), public.db_new_id('b'));
  insert into public.builds (id, user_id, area, size, title, summary, points, open_items, live, link, day, at_time)
  values (bid, uid, a,
    case when entry->>'size' = 'small' then 'small' else 'big' end,
    left(entry->>'title', 200), left(coalesce(entry->>'summary', ''), 2000),
    case when jsonb_typeof(entry->'points') = 'array' then entry->'points' else '[]'::jsonb end,
    left(coalesce(entry->>'openItems', ''), 1000), coalesce((entry->>'live')::boolean, false),
    left(coalesce(entry->>'link', ''), 500),
    coalesce(nullif(entry->>'day', '')::date, (now() at time zone 'America/Los_Angeles')::date),
    coalesce(nullif(entry->>'time', ''), to_char(now() at time zone 'America/Los_Angeles', 'HH24:MI')))
  on conflict (id) do update set area = excluded.area, size = excluded.size, title = excluded.title, summary = excluded.summary,
    points = excluded.points, open_items = excluded.open_items, live = excluded.live, link = excluded.link
    where public.builds.user_id = uid;
  return bid;
end $$;
grant execute on function public.log_build(text, jsonb) to anon, authenticated;

-- ---------- Task priority and who can do it ----------
-- priority: '', high, medium, low. claude: '' (not set), yes (Claude can do it), help (Claude helps, needs you), you (needs you).
alter table public.tasks add column if not exists priority text not null default '';
alter table public.tasks add column if not exists claude   text not null default '';
alter table public.tasks drop constraint if exists tasks_priority_check;
alter table public.tasks add constraint tasks_priority_check check (priority in ('', 'high', 'medium', 'low'));
alter table public.tasks drop constraint if exists tasks_claude_check;
alter table public.tasks add constraint tasks_claude_check check (claude in ('', 'yes', 'help', 'you'));
