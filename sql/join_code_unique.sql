-- Global uniqueness for class join codes.
--
-- A join code is the only thing a student types to enroll. There is no teacher
-- context in that flow, so if two classes ever shared a code the student would
-- land in whichever row the lookup happened to return first. The constraint has
-- to be global across the whole table, not per teacher.
--
-- Generation moved into app/api/teacher/classes/route.ts, which retries on
-- 23505. This index is what makes that retry meaningful.

-- 1. Check for existing duplicates first. The index cannot be created while any
--    exist, and this reports them rather than failing with a bare error.
--    Expected: zero rows.
select join_code, count(*) as copies, array_agg(id) as class_ids
from public.classes
group by join_code
having count(*) > 1;

-- 2. Create the constraint. Safe to re-run.
create unique index if not exists classes_join_code_key
  on public.classes (join_code);

-- 3. Verify.
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'classes'
  and indexname = 'classes_join_code_key';
