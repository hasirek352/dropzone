-- DROPZONE stage 2: atomic virtual-credit operations.
-- Run AFTER supabase/schema.sql in the Supabase SQL Editor.
-- These functions run in one PostgreSQL transaction each. They use virtual credits only.

create or replace function public.open_case_atomic(
  p_user_id uuid,
  p_case_id text,
  p_quantity integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_case public.cases%rowtype;
  v_credits bigint;
  v_total_cost bigint;
  v_opening_id uuid;
  v_drop public.drops%rowtype;
  v_total_weight bigint;
  v_roll bigint;
  v_inventory_id uuid;
  v_results jsonb := '[]'::jsonb;
  v_i integer;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 5 then
    raise exception 'QUANTITY_INVALID' using errcode = '22023';
  end if;

  select * into v_case
  from public.cases
  where id = p_case_id and active = true
  for share;

  if not found then
    raise exception 'CASE_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- Serialize balance changes for this account.
  select credits into v_credits
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;

  v_total_cost := v_case.price * p_quantity;
  if v_credits < v_total_cost then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.drops where case_id = p_case_id) then
    raise exception 'NO_DROPS' using errcode = 'P0002';
  end if;

  update public.profiles
  set credits = credits - v_total_cost
  where id = p_user_id
  returning credits into v_credits;

  insert into public.case_openings(user_id, case_id, quantity, total_cost)
  values (p_user_id, p_case_id, p_quantity, v_total_cost)
  returning id into v_opening_id;

  for v_i in 1..p_quantity loop
    select sum(weight)::bigint into v_total_weight
    from public.drops where case_id = p_case_id;

    v_roll := floor(random() * v_total_weight)::bigint;
    select * into v_drop
    from (
      select d.*, sum(d.weight) over (order by d.id) as cumulative_weight
      from public.drops d where d.case_id = p_case_id
    ) weighted
    where cumulative_weight > v_roll
    order by cumulative_weight
    limit 1;

    insert into public.inventory(user_id, drop_id, source)
    values (p_user_id, v_drop.id, 'case_open')
    returning id into v_inventory_id;

    insert into public.case_opening_items(opening_id, drop_id, inventory_id)
    values (v_opening_id, v_drop.id, v_inventory_id);

    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'id', v_drop.id,
      'name', v_drop.name,
      'emoji', v_drop.emoji,
      'value', v_drop.value,
      'rarity', v_drop.rarity,
      'inventoryId', v_inventory_id
    ));
  end loop;

  return jsonb_build_object(
    'openingId', v_opening_id,
    'credits', v_credits,
    'totalCost', v_total_cost,
    'drops', v_results
  );
end;
$$;

create or replace function public.create_battle_atomic(
  p_user_id uuid,
  p_case_ids text[],
  p_max_players integer default 2
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cost bigint;
  v_case_count integer;
  v_battle_id uuid;
  v_credits bigint;
  v_id text;
begin
  if p_case_ids is null or cardinality(p_case_ids) < 1 or cardinality(p_case_ids) > 5 then
    raise exception 'CASE_LIST_INVALID' using errcode = '22023';
  end if;
  if p_max_players not in (2,3,4) then
    raise exception 'PLAYER_COUNT_INVALID' using errcode = '22023';
  end if;

  -- Reject duplicates; otherwise the same case could be counted inconsistently.
  if (select count(*) from unnest(p_case_ids)) <> (select count(distinct x) from unnest(p_case_ids) as t(x)) then
    raise exception 'DUPLICATE_CASES' using errcode = '22023';
  end if;

  select count(*), coalesce(sum(c.price), 0)
  into v_case_count, v_cost
  from public.cases c
  where c.id = any(p_case_ids) and c.active = true;
  if v_case_count <> cardinality(p_case_ids) then
    raise exception 'CASE_NOT_FOUND' using errcode = 'P0002';
  end if;

  select credits into v_credits from public.profiles where id = p_user_id for update;
  if not found then raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_credits < v_cost then raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001'; end if;

  update public.profiles set credits = credits - v_cost where id = p_user_id;

  insert into public.battles(host_id, max_players, entry_cost, case_ids)
  values (p_user_id, p_max_players, v_cost, p_case_ids)
  returning id into v_battle_id;

  insert into public.battle_participants(battle_id, user_id)
  values (v_battle_id, p_user_id);

  return jsonb_build_object(
    'battleId', v_battle_id,
    'entryCost', v_cost,
    'credits', v_credits - v_cost
  );
end;
$$;

create or replace function public.join_battle_atomic(
  p_user_id uuid,
  p_battle_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_battle public.battles%rowtype;
  v_count integer;
  v_credits bigint;
begin
  select * into v_battle
  from public.battles
  where id = p_battle_id
  for update;

  if not found or v_battle.status <> 'waiting' then
    raise exception 'BATTLE_UNAVAILABLE' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.battle_participants
    where battle_id = p_battle_id and user_id = p_user_id
  ) then
    raise exception 'ALREADY_JOINED' using errcode = '23505';
  end if;

  select count(*) into v_count
  from public.battle_participants where battle_id = p_battle_id;
  if v_count >= v_battle.max_players then
    raise exception 'BATTLE_FULL' using errcode = 'P0001';
  end if;

  select credits into v_credits from public.profiles where id = p_user_id for update;
  if not found then raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_credits < v_battle.entry_cost then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;

  update public.profiles set credits = credits - v_battle.entry_cost where id = p_user_id;
  insert into public.battle_participants(battle_id, user_id)
  values (p_battle_id, p_user_id);

  select credits into v_credits from public.profiles where id = p_user_id;
  return jsonb_build_object('joined', true, 'credits', v_credits);
end;
$$;

-- These RPCs are intended to be called by the trusted server using the service-role key.
revoke all on function public.open_case_atomic(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.create_battle_atomic(uuid, text[], integer) from public, anon, authenticated;
revoke all on function public.join_battle_atomic(uuid, uuid) from public, anon, authenticated;
grant execute on function public.open_case_atomic(uuid, text, integer) to service_role;
grant execute on function public.create_battle_atomic(uuid, text[], integer) to service_role;
grant execute on function public.join_battle_atomic(uuid, uuid) to service_role;
