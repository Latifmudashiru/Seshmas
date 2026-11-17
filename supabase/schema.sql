-- Seshmas schema. Paste this whole script into the Supabase SQL editor and run it.

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  created_at timestamptz default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  snapchat text,
  instagram text,
  tiktok text,
  team_id uuid references teams(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  points int not null,
  note text,
  created_at timestamptz default now()
);

-- Row Level Security.
-- DRAFT ONLY: these policies let anyone with the anon key read and write everything.
-- They will be tightened later (e.g. only admins can write scores / delete).
alter table teams enable row level security;
alter table players enable row level security;
alter table scores enable row level security;

create policy "draft anon select" on teams   for select to anon using (true);
create policy "draft anon insert" on teams   for insert to anon with check (true);
create policy "draft anon update" on teams   for update to anon using (true) with check (true);
create policy "draft anon delete" on teams   for delete to anon using (true);

create policy "draft anon select" on players for select to anon using (true);
create policy "draft anon insert" on players for insert to anon with check (true);
create policy "draft anon update" on players for update to anon using (true) with check (true);
create policy "draft anon delete" on players for delete to anon using (true);

create policy "draft anon select" on scores  for select to anon using (true);
create policy "draft anon insert" on scores  for insert to anon with check (true);
create policy "draft anon update" on scores  for update to anon using (true) with check (true);
create policy "draft anon delete" on scores  for delete to anon using (true);

-- Realtime: broadcast changes on all three tables.
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table scores;


-- =====================================================================================
-- PART 2: DIRECT MESSAGES (1-to-1 chat)
-- Run THIS BLOCK ON ITS OWN if you already ran the script above.
-- It is safe to run more than once. Select from here down to the end of the file.
-- =====================================================================================

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references players(id) on delete cascade,
  recipient_id uuid not null references players(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz default now()
);

create index if not exists messages_pair_idx on messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx on messages (recipient_id, created_at);

-- DRAFT ONLY: same wide-open anon policies as the other tables (tighten later, e.g. only
-- let a user read messages they sent or received once real auth exists).
alter table messages enable row level security;

drop policy if exists "draft anon select" on messages;
drop policy if exists "draft anon insert" on messages;
drop policy if exists "draft anon update" on messages;
drop policy if exists "draft anon delete" on messages;

create policy "draft anon select" on messages for select to anon using (true);
create policy "draft anon insert" on messages for insert to anon with check (true);
create policy "draft anon update" on messages for update to anon using (true) with check (true);
create policy "draft anon delete" on messages for delete to anon using (true);

-- Realtime: broadcast changes on messages (does nothing if it was already added).
do $$
begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null;
end $$;
