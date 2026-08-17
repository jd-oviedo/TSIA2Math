// Pure reductions over the attempt log. No database, no imports.
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
