-- =========================================================
-- Barbershop MVP — Supabase / PostgreSQL schema
-- Run in the Supabase SQL editor (or via the CLI).
-- Tables: profiles, services, appointments
-- Includes: enums, indexes, RLS, overlap-prevention trigger,
-- and an availability RPC for the public booking wizard.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------------------------------------
do $$ begin
  create type user_role as enum ('owner', 'barber');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES -------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'barber',
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'barber')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- SERVICES -------------------------------------
create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  duration_minutes  integer not null check (duration_minutes > 0),
  price             numeric(10,2) not null check (price >= 0),
  description       text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ---------- APPOINTMENTS ---------------------------------
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null,
  client_phone  text not null,
  client_email  text,
  barber_id     uuid not null references public.profiles(id) on delete restrict,
  service_id    uuid not null references public.services(id) on delete restrict,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  status        appointment_status not null default 'pending',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint appointments_time_check check (end_time > start_time)
);

create index if not exists appointments_barber_time_idx
  on public.appointments(barber_id, start_time);
create index if not exists appointments_status_idx
  on public.appointments(status);

-- Auto-set end_time from service duration if not supplied.
create or replace function public.set_appointment_end_time()
returns trigger
language plpgsql
as $$
declare
  svc_duration int;
begin
  if new.end_time is null then
    select duration_minutes into svc_duration
    from public.services where id = new.service_id;
    if svc_duration is null then
      raise exception 'Unknown service_id %', new.service_id;
    end if;
    new.end_time := new.start_time + make_interval(mins => svc_duration);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_appointment_end_time on public.appointments;
create trigger trg_set_appointment_end_time
  before insert or update on public.appointments
  for each row execute function public.set_appointment_end_time();

-- ---------- OVERLAP PREVENTION ---------------------------
-- A barber cannot have two active (non-cancelled) appointments
-- whose [start_time, end_time) ranges overlap.
create or replace function public.prevent_appointment_overlap()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'cancelled' then
    return new;
  end if;

  if exists (
    select 1
    from public.appointments a
    where a.barber_id = new.barber_id
      and a.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and a.status <> 'cancelled'
      and tstzrange(a.start_time, a.end_time, '[)')
          && tstzrange(new.start_time, new.end_time, '[)')
  ) then
    raise exception 'Time slot conflict: barber already booked for this interval'
      using errcode = '23P01';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_appointment_overlap on public.appointments;
create trigger trg_prevent_appointment_overlap
  before insert or update on public.appointments
  for each row execute function public.prevent_appointment_overlap();

-- ---------- AVAILABILITY RPC -----------------------------
-- Public-callable: returns ISO start times for free slots
-- on a given day for a barber + service combo.
create or replace function public.get_available_slots(
  p_barber_id    uuid,
  p_service_id   uuid,
  p_day          date,
  p_open_hour    int default 10,
  p_close_hour   int default 20,
  p_step_minutes int default 30
)
returns table(slot_start timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  svc_duration int;
  cursor_ts    timestamptz;
  end_of_day   timestamptz;
begin
  select duration_minutes into svc_duration
  from public.services where id = p_service_id and is_active = true;
  if svc_duration is null then
    return;
  end if;

  cursor_ts  := (p_day::timestamp + make_interval(hours => p_open_hour))
                at time zone 'UTC';
  end_of_day := (p_day::timestamp + make_interval(hours => p_close_hour))
                at time zone 'UTC';

  while cursor_ts + make_interval(mins => svc_duration) <= end_of_day loop
    if not exists (
      select 1 from public.appointments a
      where a.barber_id = p_barber_id
        and a.status <> 'cancelled'
        and tstzrange(a.start_time, a.end_time, '[)')
            && tstzrange(cursor_ts, cursor_ts + make_interval(mins => svc_duration), '[)')
    ) then
      slot_start := cursor_ts;
      return next;
    end if;
    cursor_ts := cursor_ts + make_interval(mins => p_step_minutes);
  end loop;
end;
$$;

grant execute on function public.get_available_slots(uuid, uuid, date, int, int, int) to anon, authenticated;

-- ---------- ROW LEVEL SECURITY ---------------------------
alter table public.profiles     enable row level security;
alter table public.services     enable row level security;
alter table public.appointments enable row level security;

-- Helper: is the current auth user an owner?
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- ----- profiles policies -----
drop policy if exists profiles_select_public  on public.profiles;
drop policy if exists profiles_update_self    on public.profiles;
drop policy if exists profiles_owner_all      on public.profiles;

create policy profiles_select_public on public.profiles
  for select using (true);

create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy profiles_owner_all on public.profiles
  for all using (public.is_owner()) with check (public.is_owner());

-- ----- services policies -----
drop policy if exists services_select_public on public.services;
drop policy if exists services_owner_write   on public.services;

create policy services_select_public on public.services
  for select using (is_active = true or public.is_owner());

create policy services_owner_write on public.services
  for all using (public.is_owner()) with check (public.is_owner());

-- ----- appointments policies -----
drop policy if exists appointments_insert_public      on public.appointments;
drop policy if exists appointments_select_barber_own  on public.appointments;
drop policy if exists appointments_update_barber_own  on public.appointments;
drop policy if exists appointments_owner_all          on public.appointments;

-- Anonymous booking: anyone can create a pending appointment.
create policy appointments_insert_public on public.appointments
  for insert with check (status = 'pending');

-- Barbers can read their own appointments.
create policy appointments_select_barber_own on public.appointments
  for select using (auth.uid() = barber_id);

-- Barbers can update the status of their own appointments.
create policy appointments_update_barber_own on public.appointments
  for update using (auth.uid() = barber_id) with check (auth.uid() = barber_id);

-- Owner can do anything.
create policy appointments_owner_all on public.appointments
  for all using (public.is_owner()) with check (public.is_owner());

-- ---------- SEED (optional) ------------------------------
insert into public.services (name, duration_minutes, price, description)
values
  ('Classic Haircut',  30, 100.00, 'Precision cut, wash and styling.'),
  ('Beard Trim',       20,  60.00, 'Sculpted beard with hot towel finish.'),
  ('Cut + Beard',      50, 150.00, 'Full grooming package.'),
  ('Hot Towel Shave',  40, 120.00, 'Traditional straight-razor shave.'),
  ('Kids Cut',         25,  80.00, 'Patient, friendly cut for under-12s.')
on conflict do nothing;
