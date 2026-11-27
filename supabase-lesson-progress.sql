create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  last_page integer not null default 1 check (last_page > 0),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;
revoke all on public.lesson_progress from anon;
grant select, insert, update on public.lesson_progress to authenticated;
drop policy if exists lesson_progress_owner on public.lesson_progress;
create policy lesson_progress_owner on public.lesson_progress
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
