begin;

create policy "Learners enroll in published courses"
on public.enrollments for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.programs p
    where p.id = enrollments.program_id
      and p.status = 'published'
      and (
        (p.price_thb = 0 and enrollments.status = 'active')
        or (p.price_thb > 0 and enrollments.status = 'pending')
      )
  )
);

commit;
