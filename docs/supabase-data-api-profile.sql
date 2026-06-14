-- Optional Supabase Data API profile table for APEX.
-- Run this in the Supabase SQL Editor for project oibwkknjgtkyxntyuybb.
-- It lets the Vite frontend upsert the logged-in user's profile through
-- https://oibwkknjgtkyxntyuybb.supabase.co/rest/v1/apex_user_profiles

create table if not exists public.apex_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  nickname text,
  apex_user_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apex_user_profiles
  add column if not exists phone text;

alter table public.apex_user_profiles
  alter column email drop not null;

alter table public.apex_user_profiles enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update on table public.apex_user_profiles to authenticated;

drop policy if exists "Users can read own APEX profile" on public.apex_user_profiles;
create policy "Users can read own APEX profile"
  on public.apex_user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own APEX profile" on public.apex_user_profiles;
create policy "Users can insert own APEX profile"
  on public.apex_user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own APEX profile" on public.apex_user_profiles;
create policy "Users can update own APEX profile"
  on public.apex_user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
