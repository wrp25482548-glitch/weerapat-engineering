-- Run once in Supabase Dashboard > SQL Editor.
-- Gives the API roles access to the tables; RLS policies still decide which rows/actions are allowed.

grant usage on schema public to anon, authenticated;

grant select on table
  public.programs,
  public.topics,
  public.lessons
to anon, authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.enrollments,
  public.entitlements
to authenticated;

grant insert, update, delete on table
  public.programs,
  public.topics,
  public.lessons
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Create/fix the owner's profile and make it an administrator.
insert into public.profiles (id, email, display_name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'display_name', email),
  'admin'
from auth.users
where lower(email) = lower('wrp25482548@gmail.com')
on conflict (id) do update
set email = excluded.email,
    display_name = excluded.display_name,
    role = 'admin';

-- Apply sensible grants automatically to tables/sequences created later.
alter default privileges in schema public
grant select on tables to anon, authenticated;

alter default privileges in schema public
grant insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated;
