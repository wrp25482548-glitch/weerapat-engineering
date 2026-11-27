begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lesson-files', 'lesson-files', false, 4194304, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "Administrators manage lesson files" on storage.objects;
create policy "Administrators manage lesson files" on storage.objects
for all to authenticated
using (bucket_id = 'lesson-files' and exists (
  select 1 from public.profiles where id = auth.uid() and role = 'admin'
))
with check (bucket_id = 'lesson-files' and exists (
  select 1 from public.profiles where id = auth.uid() and role = 'admin'
));

drop policy if exists "Enrolled learners read lesson files" on storage.objects;
create policy "Enrolled learners read lesson files" on storage.objects
for select to authenticated
using (bucket_id = 'lesson-files' and exists (
  select 1 from public.lessons l
  join public.topics t on t.id = l.topic_id
  join public.programs p on p.id = t.program_id
  join public.enrollments e on e.program_id = p.id
  where l.id::text = (storage.foldername(name))[1]
    and l.status = 'published' and t.status = 'published' and p.status = 'published'
    and e.user_id = auth.uid() and e.status = 'active'
    and (l.access_type = 'free' or exists (
      select 1 from public.entitlements g
      where g.lesson_id = l.id and g.user_id = auth.uid() and g.can_view = true
    ))
));

commit;
