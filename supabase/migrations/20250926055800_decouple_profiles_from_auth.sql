-- Step 1: Drop the foreign key constraint linking profiles to auth.users
-- alter table public.profiles drop constraint profiles_id_fkey;

-- Step 2: Add the is_registered column to track user status
alter table public.profiles add column is_registered boolean not null default false;