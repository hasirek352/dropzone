-- DROPZONE starter schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create type public.drop_rarity as enum ('common','rare','epic','legendary');
create type public.battle_status as enum ('waiting','active','completed','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  credits bigint not null default 2500 check (credits >= 0),
  created_at timestamptz not null default now()
);

create table public.cases (
  id text primary key,
  name text not null,
  description text not null default '',
  price bigint not null check (price > 0),
  emoji text not null default '📦',
  accent text not null default '#72f2d0',
  category text not null default 'FEATURED',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.drops (
  id uuid primary key default gen_random_uuid(),
  case_id text not null references public.cases(id) on delete cascade,
  name text not null,
  emoji text not null default '✨',
  value bigint not null check (value >= 0),
  rarity public.drop_rarity not null default 'common',
  weight integer not null default 1 check (weight > 0),
  created_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  drop_id uuid not null references public.drops(id),
  source text not null default 'case_open',
  created_at timestamptz not null default now()
);

create table public.case_openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  case_id text not null references public.cases(id),
  quantity integer not null check (quantity between 1 and 5),
  total_cost bigint not null check (total_cost >= 0),
  created_at timestamptz not null default now()
);

create table public.case_opening_items (
  id uuid primary key default gen_random_uuid(),
  opening_id uuid not null references public.case_openings(id) on delete cascade,
  drop_id uuid not null references public.drops(id),
  inventory_id uuid references public.inventory(id),
  created_at timestamptz not null default now()
);

create table public.battles (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id),
  status public.battle_status not null default 'waiting',
  max_players integer not null default 2 check (max_players between 2 and 4),
  entry_cost bigint not null default 0 check (entry_cost >= 0),
  case_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table public.battle_participants (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  score bigint not null default 0,
  unique (battle_id, user_id)
);

create index inventory_user_created_idx on public.inventory(user_id, created_at desc);
create index battles_status_created_idx on public.battles(status, created_at desc);
create index battle_participants_battle_idx on public.battle_participants(battle_id);

-- Create a profile automatically when a user registers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'player_' || substr(new.id::text, 1, 8))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.drops enable row level security;
alter table public.inventory enable row level security;
alter table public.case_openings enable row level security;
alter table public.case_opening_items enable row level security;
alter table public.battles enable row level security;
alter table public.battle_participants enable row level security;

create policy "Profiles readable by authenticated users" on public.profiles
  for select to authenticated using (true);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Active cases are public" on public.cases
  for select to anon, authenticated using (active = true);
create policy "Drops for active cases are public" on public.drops
  for select to anon, authenticated using (
    exists (select 1 from public.cases c where c.id = case_id and c.active = true)
  );
create policy "Users read own inventory" on public.inventory
  for select to authenticated using (auth.uid() = user_id);
create policy "Users read own openings" on public.case_openings
  for select to authenticated using (auth.uid() = user_id);
create policy "Users read own opening items" on public.case_opening_items
  for select to authenticated using (
    exists (select 1 from public.case_openings o where o.id = opening_id and o.user_id = auth.uid())
  );
create policy "Battles visible to everyone" on public.battles
  for select to authenticated using (true);
create policy "Participants visible to authenticated users" on public.battle_participants
  for select to authenticated using (true);

-- Seed starter case metadata. Seed drops separately or use the app's admin seed script.
insert into public.cases (id,name,description,price,emoji,accent,category) values
('neon','NEON SYNDICATE','Światło miasta. Drop bez kompromisów.',250,'📦','#54ead6','FEATURED'),
('arctic','ARCTIC PROTOCOL','Zimna precyzja. Rzadkie znaleziska.',420,'🧊','#76bfff','ELITE'),
('gold','AUREATE','Złoty rozdział dla odważnych.',650,'👑','#ffc96a','ELITE'),
('pixel','PIXEL RIOT','Retro energia, nowoczesny loot.',120,'👾','#b8ff78','STARTER'),
('void','VOID WALKER','Ciemna materia. Najwyższa liga.',900,'🌑','#bd8cff','ELITE'),
('inferno','INFERNO LAB','Podkręć temperaturę i sprawdź drop.',300,'🔥','#ff826a','FEATURED')
on conflict (id) do nothing;
