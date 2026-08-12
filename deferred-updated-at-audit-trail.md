# Deferred: `updated_at` is not maintained, so the write trail is not trustworthy

Opened 2026-08-12, found while trying to answer "did the upload change the six
existing QR topics?" after the first AR/GR/PR content push. A schema and
audit-trail issue, deliberately kept separate from `content-fixes-needed.md`,
which tracks item defects. Nothing here is a content error.

---

## What is wrong

`curriculum_topics.updated_at` never changes. It is set once when a row is
inserted and then stays at that value forever, no matter how many times the row
is written.

Two independent reasons, and both have to be fixed for the column to mean
anything:

1. **No trigger.** There is no `BEFORE UPDATE` trigger setting
   `updated_at = now()`, so Postgres has no reason to touch it.
2. **The uploader never sets it.** `curriculum/migrations/upload_curriculum.py`
   builds its `record` dict without `updated_at`, so the column is not in the
   `ON CONFLICT DO UPDATE SET` list and retains its previous value by design.

Demonstrated on production. After the 2026-08-12 upload rewrote all six QR rows,
every one still read:

```
QR.1.1  created_at 2026-07-16T15:40:10  updated_at 2026-07-16T15:40:10
QR.1.2  created_at 2026-07-16T16:43:39  updated_at 2026-07-16T16:43:39
QR.1.3  created_at 2026-07-16T17:10:52  updated_at 2026-07-16T17:10:52
QR.1.4  created_at 2026-07-16T17:19:07  updated_at 2026-07-16T17:19:07
QR.2.1  created_at 2026-07-16T17:27:42  updated_at 2026-07-16T17:27:42
QR.3.5  created_at 2026-08-06T04:50:32  updated_at 2026-08-06T04:50:32
```

Identical to `created_at` in every case, on rows that had just been upserted.

## Why it matters

The column looks like an audit trail and is not one. Anyone reasoning about when
a topic last changed, whether during an incident, a content review, or a
"why does this lesson look different" question, will read `updated_at`, get a
date that predates the actual write, and conclude nothing happened.

That is worse than the column not existing. An absent column prompts a question;
a stale one answers it wrongly.

It also silently weakens any future cache invalidation or "recently updated"
surface built on it.

## What is already mitigated

`upload_curriculum.py` now writes a before/after JSON snapshot of every row it
touches and prints a per-column diff (see the same PR as this file). That closes
the practical gap: a content push leaves behind real evidence of what it changed
rather than an inference chain.

The snapshots are a workaround, not a fix. They live outside the database, only
cover writes made through that one script, and are gitignored local files. Any
write from the Supabase dashboard, a migration, or a future script leaves no
trace at all.

## What closing it would take

A trigger is the durable fix, since it catches every writer rather than only the
ones that remember:

```sql
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger curriculum_topics_touch_updated_at
  before update on public.curriculum_topics
  for each row execute function public.touch_updated_at();
```

Before running it, decide the questions below, because the trigger changes what
existing data means.

## Open questions

1. **Which tables?** `curriculum_topics` is where this was found, but the same
   check should run across `questions`, `curriculum_item_templates`,
   `curriculum_item_instances` and anything else carrying an `updated_at`. It is
   likely the same everywhere, since the pattern came from one place.
2. **Backfill or leave?** Existing rows carry an `updated_at` that is really a
   created date. Once a trigger is live, old rows and new rows mean different
   things until something is written. Leaving them is defensible if it is
   documented; backfilling to `created_at` is a lie of a different shape.
3. **Should the uploader also set it explicitly?** Belt and braces, and it keeps
   the intent visible in the script rather than only in the schema. The argument
   against is that two mechanisms setting one column is how they drift.
4. **Is a real write log wanted instead?** A trigger records only the most recent
   write. If the actual need is "what changed, when, and by which run", that is
   an audit table, and the snapshot files are a hint that it might be.

## Where to run it

Supabase SQL editor, as with every other file in `sql/`. Not run yet, and not
run by anything automatically. If it is applied, it should land as `sql/`
alongside a note in the same style as the existing migration files.
