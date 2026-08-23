-- ============================================================
-- Bright Academy — Supabase schema (run once in SQL Editor)
-- ============================================================

-- 1) Profiles: one row per real auth user
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text default '',
  role text default 'parent' check (role in ('parent','student','teacher','admin')),
  data jsonb default '{}'::jsonb,          -- timezone, phone, avatar, teacherId, bio, prefs…
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Records: every other entity, one generic collection table
create table if not exists public.records (
  id text primary key,
  collection text not null,
  data jsonb not null default '{}'::jsonb,
  owner uuid default auth.uid(),
  participants text[] not null default '{}',  -- auth uids, 'public', or 'teacher:<teacherId>' sentinels
  updated_at timestamptz default now()
);
create index if not exists records_collection_idx on public.records (collection);
create index if not exists records_participants_idx on public.records using gin (participants);

-- 3) updated_at maintenance
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before update on public.records for each row execute function public.touch_updated_at();
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- 4) Auto-create a profile when someone signs up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role, data)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'name',''),
          coalesce(new.raw_user_meta_data->>'role','parent'),
          coalesce(new.raw_user_meta_data->'data','{}'::jsonb))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Row Level Security
alter table public.profiles enable row level security;
alter table public.records  enable row level security;

-- Profiles: any signed-in user can read (needed for names/avatars/messaging); you edit only yours
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());

-- Helper: does the current user match a 'teacher:<id>' sentinel?
create or replace function public.is_participant(p text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select
    (auth.uid() is not null and auth.uid()::text = any(p))
    or 'public' = any(p)
    or exists (
      select 1 from public.profiles pr
      where pr.id = auth.uid()
        and (pr.data->>'teacherId') is not null
        and ('teacher:' || (pr.data->>'teacherId')) = any(p)
    )
$$;

-- Records: read if participant/owner/public
drop policy if exists records_read on public.records;
create policy records_read on public.records for select
  using (public.is_participant(participants) or owner = auth.uid());

-- Records: signed-in users insert rows they own; anon may submit marketing forms & trial bookings
drop policy if exists records_insert_auth on public.records;
create policy records_insert_auth on public.records for insert to authenticated
  with check (owner = auth.uid() or owner is null);
drop policy if exists records_insert_anon on public.records;
create policy records_insert_anon on public.records for insert to anon
  with check (collection in ('leads','applications','customPlanRequests','trials'));

-- Records: update/delete if participant or owner
drop policy if exists records_update on public.records;
create policy records_update on public.records for update to authenticated
  using (public.is_participant(participants) or owner = auth.uid());
drop policy if exists records_delete on public.records;
create policy records_delete on public.records for delete to authenticated
  using (public.is_participant(participants) or owner = auth.uid());

-- 6) Realtime
do $$ begin
  alter publication supabase_realtime add table public.records;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; end $$;

-- Done. Next: disable "Confirm email" (Auth → Sign In / Providers → Email) for a frictionless demo,
-- then run `node scripts/seed-cloud.mjs` locally to create demo accounts + sample data.
