// Pure reductions over what a student has done on a topic: the attempt log,
// and now the GUMU session log too. No database, no imports.
//
// Split out of curriculum-progress.ts so it can be loaded directly by
// `node --test` and by scripts/faultproof_earned_solutions.mjs. That file
// imports the admin Supabase client extensionlessly, which Node's ESM resolver
// cannot follow, so anything importing it is unreachable outside Next's
// bundler -- and these are exactly the functions worth testing in isolation.
// Same reason app/dashboard/modules/referer.ts exists.
//
// curriculum-progress.ts re-exports both, so no caller had to change.

export type AttemptRow = {
  course_id: string;
  topic_id: string;
  section: string;
  item_number: number;
  is_correct: boolean;
  created_at: string;
};

// WHICH distinct items in a section this student has ever got right.
//
// Distinct on item_number, and "ever" rather than "most recently": the attempt
// log is append-only and a retry adds a row rather than replacing one, so a
// student who gets an item right and later fumbles a re-attempt has still
// demonstrated it. Mastery counts up, never down.
//
// The set was already being built and thrown away; only its size was ever
// returned. It is kept now because worked solutions are released per item, and
// "which items" is the question that gate asks.
export function correctItemsInSection(
  attempts: AttemptRow[],
  courseId: string,
  topicId: string,
  section: 'practice' | 'mini_quiz'
): Set<number> {
  const items = new Set<number>();
  for (const a of attempts) {
    if (a.course_id === courseId && a.topic_id === topicId && a.section === section && a.is_correct) {
      items.add(a.item_number);
    }
  }
  return items;
}

// How many distinct items in a section this student has ever got right.
export function correctInSection(
  attempts: AttemptRow[],
  courseId: string,
  topicId: string,
  section: 'practice' | 'mini_quiz'
): number {
  return correctItemsInSection(attempts, courseId, topicId, section).size;
}

// ─── The GUMU session log ────────────────────────────────────────────────────

// One gumu_sessions row, narrowed to what the release rule reads.
export type SessionRow = {
  section: string;
  item_number: number;
  status: string;
  resolution: string | null;
};

// WHICH items in a section this student has already been SHOWN the answer to.
//
// The escape hatch hands over item.correct_answer outright, so once it has been
// used the answer is disclosed and a worked solution adds explanation without
// adding disclosure. That is the whole basis on which solutions are released to
// a student who missed; see issue #141 for the two shapes rejected in favour of
// it.
//
// THE PREDICATE IS DELIBERATELY NARROW, and every part of it is load-bearing:
//
//   status === 'resolved_flagged'    the only status either flagged ending writes
//   resolution === 'student_gave_up' the hatch, NOT the turn cap
//
// 'turn_cap' is the other flagged ending and must never release: that student
// spent their turns and was never shown an answer, so a worked solution would
// disclose something they did not have. Null must never release either -- it
// means the session did not end flagged at all, and after the backfill in
// sql/gumu_sessions_resolution.sql no flagged row is null. An 'active' session
// is a conversation still in progress with nothing disclosed yet.
//
// So: null, 'turn_cap', and every status that is not 'resolved_flagged' release
// nothing. Only the one combination does.
export function revealedItemsInSection(
  sessions: SessionRow[],
  section: 'practice' | 'mini_quiz'
): Set<number> {
  const items = new Set<number>();
  for (const s of sessions) {
    if (
      s.section === section &&
      s.status === 'resolved_flagged' &&
      s.resolution === 'student_gave_up'
    ) {
      items.add(s.item_number);
    }
  }
  return items;
}

// Everything a student may see the worked solution for: what they got right,
// plus what they were shown.
//
// A separate function rather than an inline union so the harness can compute the
// expected set independently and compare, rather than reading the answer back
// out of the code under test.
export function releasableItems(
  solved: ReadonlySet<number>,
  revealed: ReadonlySet<number>
): Set<number> {
  return new Set([...solved, ...revealed]);
}
