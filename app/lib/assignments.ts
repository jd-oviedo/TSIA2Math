// The two rules both sides of an assignment have to agree on.
//
// Build 4b. This module exists because the teacher surface and the student
// surface ask OPPOSITE questions about the same rows:
//
//   teacher (4a)  "who does this assignment target?"   forward,  1 -> N
//   student (4b)  "which assignments target me?"       reverse,  1 -> N
//
// Two directions of one relation, and nothing but convention was going to keep
// them describing the same relation. A drift between them is not a crash: it is
// a student seeing work the teacher's tracker does not count, or -- worse,
// because it is silent -- a student NOT seeing work the tracker says they were
// given. Both look exactly like "no assignments yet".
//
// So the rule is written once, here, in the reverse direction, and it is written
// as the mirror of resolveTargets() in app/api/teacher/assignments/route.ts:130
// line for line. The correspondence is spelled out over targetsStudent() below
// rather than left for a reader to reconstruct.
//
// PURE, AND DELIBERATELY IMPORT-FREE. Same reasoning as app/lib/topic-key.ts:
// nothing here reaches for the Supabase client, so this module can be loaded by
// a plain `node --test` and its two rules can be exercised without a database.
// The reads that feed it live in app/dashboard/data.ts.

// ─── Overdue ─────────────────────────────────────────────────────────────────

/**
 * Past its due date, and not finished. Both halves, always.
 *
 * EXTRACTED FROM app/teacher/AssignmentsPanel.tsx (4a), where it was an inline
 * expression, and that panel now calls this instead. It was extracted rather
 * than copied because the student surface needs the SAME rule at a different
 * cardinality, and a copy is how the two come to disagree about what "overdue"
 * means the first time either is touched.
 *
 * `notDone` is the parameter that absorbs the cardinality difference, and it is
 * the only thing that differs between the two callers:
 *
 *   teacher   a.complete < a.target_count    "not everyone is done"
 *   student   status !== 'complete'          "I am not done"      (the n=1 case)
 *
 * A COMPLETED-PAST-DUE ASSIGNMENT IS NOT OVERDUE. It is just complete. That is
 * what the third argument is for, and it is required rather than defaulted: a
 * default would let a caller omit it and silently get "everything past its date
 * is overdue", which is the one wrong answer this function exists to prevent.
 *
 * `now` is nullable because BOTH callers read the clock in an effect rather than
 * during render -- see the note on loadedAt in AssignmentsPanel. Null means the
 * clock has not been read yet, and the honest answer then is "not overdue"
 * rather than a guess.
 */
export function isOverdue(dueAt: string | null, now: number | null, notDone: boolean): boolean {
  return dueAt !== null && now !== null && Date.parse(dueAt) < now && notDone;
}

// ─── The reverse target resolver ─────────────────────────────────────────────

/** The columns of an assignment row this rule actually reads. */
export type AssignmentTarget = {
  id: string;
  class_id: string;
  target_type: 'student' | 'class';
};

/**
 * Does this assignment target this student, right now?
 *
 * THE MIRROR OF resolveTargets(), CLAUSE BY CLAUSE. The forward function reads:
 *
 *   if (row.target_type === "class") return activeIds;
 *   const active = new Set(activeIds);
 *   return storedIds.filter((id) => active.has(id));
 *
 * which says: a class-target reaches the ACTIVE ROSTER; a student-target reaches
 * the STORED IDS INTERSECTED WITH the active roster. Inverted for one student,
 * those two clauses are exactly the two branches below --
 *
 *   class-target    reached iff this student is ACTIVELY enrolled in the class
 *   student-target  reached iff this student is NAMED *and* actively enrolled
 *
 * -- and the active-membership test appears in both, because it appears on both
 * sides of the forward function too. A removed student drops out of the student
 * surface exactly as they drop out of the teacher's tracker, for the same
 * reason and by the same test.
 *
 * THE TARGET_TYPE TEST IS INSIDE EACH BRANCH, NOT AROUND THEM, matching
 * assignments_select_targeted in sql/assignments.sql A7 and matching the forward
 * resolver. That is what makes the two shapes disjoint: a class-target row can
 * never be admitted by a stray assignment_students row, and -- the one that
 * matters -- a student-target row can NEVER be admitted by class enrolment
 * alone.
 *
 * THERE IS NO FALLBACK TO THE ROSTER AND THERE MUST NEVER BE ONE. In the forward
 * direction the catastrophic edit is `|| activeIds` on a student-target with no
 * stored rows, which turns one student's work into the whole class's. In THIS
 * direction the identical mistake is a `return true` reached when `namedIds` is
 * empty -- for example collapsing the two branches into a single membership
 * test. The branch below returns namedIds.has(studentId) and nothing else, so an
 * assignment that names nobody reaches nobody.
 *
 * `activeClassIds` must be built from status = 'active' exactly, NOT from
 * `status !== 'removed'`. Both readings exist in this codebase and they
 * disagree; activeStudentIds (app/lib/teacher-scope.ts:89-98) -- which is what
 * computes the teacher's tracker -- uses the strict form, so this does too. See
 * the note over activeUnarchivedClassIds in app/dashboard/data.ts.
 */
export function targetsStudent(
  row: AssignmentTarget,
  studentId: string,
  /** student_ids named by THIS assignment in assignment_students. */
  namedIds: ReadonlySet<string>,
  /** Classes this student is ACTIVELY enrolled in, archived ones already removed. */
  activeClassIds: ReadonlySet<string>
): boolean {
  if (row.target_type === 'class') {
    return activeClassIds.has(row.class_id);
  }
  return namedIds.has(studentId) && activeClassIds.has(row.class_id);
}

// ─── Due-date bucketing ──────────────────────────────────────────────────────

/**
 * The four buckets the assignments page groups by, in render order.
 *
 * ORDER IS PART OF THE CONTRACT, not a detail of the page: Overdue first
 * because it is the only one carrying a consequence, then the near horizon,
 * then everything else, then the undated work that has no horizon at all.
 */
export const BUCKET_ORDER = ['overdue', 'this_week', 'later', 'no_due_date'] as const;
export type Bucket = (typeof BUCKET_ORDER)[number];

export const BUCKET_LABELS: Record<Bucket, string> = {
  overdue: 'Overdue',
  this_week: 'This week',
  later: 'Later',
  no_due_date: 'No due date',
};

/** Seven days. "This week" is a rolling horizon, not a calendar week. */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Which bucket one assignment falls in.
 *
 * OVERDUE IS DECIDED BY isOverdue AND NOTHING ELSE, so the bucket and the chip
 * on the row cannot disagree -- a completed-past-due assignment falls through to
 * its date bucket and is never sorted under Overdue, which is the whole point of
 * passing `notDone` in rather than testing the date alone.
 */
export function bucketFor(dueAt: string | null, now: number, notDone: boolean): Bucket {
  if (dueAt === null) return 'no_due_date';
  if (isOverdue(dueAt, now, notDone)) return 'overdue';

  const due = Date.parse(dueAt);
  // An unparseable date is not silently treated as due now. It has no usable
  // horizon, so it goes where the other horizon-less work goes.
  if (Number.isNaN(due)) return 'no_due_date';

  return due - now <= WEEK_MS ? 'this_week' : 'later';
}

/**
 * Group assignments into the four buckets, sorted within each.
 *
 * DATED BUCKETS SORT SOONEST FIRST -- the next thing due is the next thing to
 * do, including inside Overdue, where soonest-first means longest-overdue first.
 * The undated bucket has no due date to sort on and sorts NEWEST FIRST instead,
 * because the most recently set work is the most likely to be what a student
 * came looking for.
 *
 * Generic over the row type so the page can pass its own shape without this
 * module having to know about topic names or hrefs.
 */
export function bucketAssignments<T extends { due_at: string | null; created_at: string }>(
  rows: readonly T[],
  now: number,
  notDone: (row: T) => boolean
): { bucket: Bucket; label: string; items: T[] }[] {
  const groups = new Map<Bucket, T[]>(BUCKET_ORDER.map((b) => [b, []]));
  for (const row of rows) {
    groups.get(bucketFor(row.due_at, now, notDone(row)))!.push(row);
  }

  for (const [bucket, items] of groups) {
    items.sort((a, b) =>
      bucket === 'no_due_date'
        ? Date.parse(b.created_at) - Date.parse(a.created_at)
        : Date.parse(a.due_at!) - Date.parse(b.due_at!)
    );
  }

  return BUCKET_ORDER.map((bucket) => ({
    bucket,
    label: BUCKET_LABELS[bucket],
    items: groups.get(bucket)!,
  }));
}

/**
 * The next 1-2 INCOMPLETE assignments, for the compact card on Home.
 *
 * COMPLETED WORK IS EXCLUDED HERE RATHER THAN AT THE CALL SITE, so the one rule
 * ("Home shows what is still to do") lives with the sort it depends on.
 *
 * Undated work sorts LAST but is not dropped. A student whose only assignment
 * carries no due date still has work, and an empty Home card would be a lie
 * about that -- it just has nothing to be next AFTER anything dated.
 */
export function nextDue<T extends { due_at: string | null; created_at: string }>(
  rows: readonly T[],
  notDone: (row: T) => boolean,
  limit = 2
): T[] {
  return rows
    .filter(notDone)
    .slice()
    .sort((a, b) => {
      if (a.due_at === null && b.due_at === null) {
        return Date.parse(b.created_at) - Date.parse(a.created_at);
      }
      if (a.due_at === null) return 1;
      if (b.due_at === null) return -1;
      return Date.parse(a.due_at) - Date.parse(b.due_at);
    })
    .slice(0, limit);
}
