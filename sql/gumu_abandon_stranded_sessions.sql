-- Close the two GUMU sessions that were left open with nothing to close them.
--
-- FOR REVIEW. Juan runs this manually in the Supabase SQL editor. Idempotent:
-- both statements are guarded on id AND status = 'active', so re-running them
-- changes nothing and neither can overwrite a real ending that arrives first.
--
--
-- WHY THESE TWO ROWS EXIST
--
-- 'abandoned' has been in gumu_sessions_status_check since the table was created
-- and nothing has ever written it. Every other path out of 'active' requires the
-- student to do one more thing: send a third message, click the escape hatch, or
-- answer the item correctly. Walking away is the absence of an action, and
-- nothing in the system observed absences. So a student who opened GUMU and
-- closed the tab left a row active permanently.
--
--   e352e991  student a8e53e73  QR.1.3  practice   item 4  2026-08-10
--   0978cf66  student cd039844  GR.4.3  mini_quiz  item 3  2026-08-18
--
-- The first ran for 37 seconds: five messages, two student turns of three used,
-- ending on a GUMU question the student never answered. They asked a real
-- question ("what does lowest terms mean") and were being scaffolded when they
-- left. They have not returned to that item, and have recorded no attempts at
-- all since that day.
--
-- The second is turn_count 0. The panel was opened and nothing was ever said.
--
--
-- WHAT WAS ACTUALLY AT STAKE, since the first reading of this was wrong
--
-- Not a lockout. gumu_sessions_one_active_per_item blocks a second session on
-- the same item, but the route catches that collision and RESUMES the existing
-- session rather than erroring. So the real consequence was that returning to
-- that item would replay a nine-day-old conversation mid-flow, and (before
-- commit ead7441) would also have told the student they had three exchanges left
-- when they had one, losing the session on their next message.
--
--
-- WHY 'abandoned' IS THE RIGHT CLOSE
--
-- It is what the value was reserved for, and it is inert. The worked-solution
-- release in app/lib/attempt-sets.ts requires status = 'resolved_flagged' AND
-- resolution = 'student_gave_up'; an 'abandoned' row matches neither, so nothing
-- is disclosed to anyone as a side effect of this. resolution stays null, which
-- is what sql/gumu_sessions_resolution.sql requires of every status that is not
-- 'resolved_flagged'.
--
-- It is also better for the students than leaving them. With these rows closed,
-- returning to the item opens a FRESH session with three real turns instead of
-- resurrecting a stale one.
--
--
-- STRICTLY OPTIONAL, AND WHY IT IS STILL WORTH RUNNING
--
-- Commit bd3ce12 makes the route close a stale session automatically when a
-- student next starts one on that item, so both rows would self-heal on contact.
-- But that requires the student to come back, and one of them has not opened the
-- app in nine days. Running this makes the table correct now rather than
-- eventually, and leaves no rows whose state depends on someone returning.
--
-- Nothing here is required for the crisis screen or for the ended_support
-- status. This is cleanup.


-- ---------------------------------------------------------------------------
-- 1. Before
-- ---------------------------------------------------------------------------

-- Expect exactly the two rows named above, both 'active', both resolution null.
select id, student_id, course_id, topic_id, section, item_number,
       status, resolution, turn_count, created_at, resolved_at
  from public.gumu_sessions
 where status = 'active'
 order by created_at;


-- ---------------------------------------------------------------------------
-- 2. Close them
--
-- One statement per row rather than `where status = 'active'` across the board.
-- A blanket update would also close any session a student happens to have open
-- at the moment this runs, mid-conversation, which is exactly the mistake the
-- 30 minute threshold in the route exists to avoid. Naming the ids means this
-- can only ever affect the two rows that were reviewed.
-- ---------------------------------------------------------------------------

-- QR.1.3 practice item 4, open since 2026-08-10.
update public.gumu_sessions
   set status      = 'abandoned',
       resolved_at = now()
 where id = 'e352e991-4a27-4330-a000-f6c1813d12e4'
   and status = 'active';

-- GR.4.3 mini_quiz item 3, open since 2026-08-18. NOT the crisis-screen
-- verification row: that was 18ad9d1f, GR.4.3 mini_quiz item 2, and it is
-- already 'ended_support'.
update public.gumu_sessions
   set status      = 'abandoned',
       resolved_at = now()
 where id = '0978cf66-d019-448f-ab3b-e7c5076bbbf0'
   and status = 'active';


-- ---------------------------------------------------------------------------
-- 3. Verification
-- ---------------------------------------------------------------------------

-- 3a. No sessions left open. Expect zero rows, unless someone is genuinely
-- mid-conversation right now, in which case expect only that one and leave it.
select id, topic_id, section, item_number, status, turn_count, created_at
  from public.gumu_sessions
 where status = 'active';

-- 3b. The two rows closed correctly, with resolution still null.
select id, topic_id, item_number, status, resolution, resolved_at
  from public.gumu_sessions
 where id in ('e352e991-4a27-4330-a000-f6c1813d12e4',
              '0978cf66-d019-448f-ab3b-e7c5076bbbf0');

-- 3c. The whole table. Expect 20 rows: 16 resolved_flagged/turn_cap from the
-- backfill, 1 resolved_retry_success, 1 ended_support, and now 2 abandoned.
select status, resolution, count(*)
  from public.gumu_sessions
 group by status, resolution
 order by status, resolution nulls first;

-- 3d. Closing these must not have released a worked solution to anyone. The
-- predicate is the one in app/lib/attempt-sets.ts revealedItemsInSection. Expect
-- the same rows as before this ran, and neither of the two ids in the result.
select id, student_id, topic_id, section, item_number
  from public.gumu_sessions
 where status = 'resolved_flagged'
   and resolution = 'student_gave_up';
