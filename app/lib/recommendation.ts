import { createAdminClient } from './supabase-admin';
import { topicHref } from './curriculum-progress';
import type { Strand } from '../adaptive-test/type';

// Diagnostic result -> "start here" curriculum topic.
//
// A student finishes the free 20-item CAT and, until now, landed nowhere: the
// results screen offered a sign-in link and the dashboard offered topics[0],
// the first topic in the course, the same one for everybody. This module is the
// missing step between the two.
//
// The whole decision is: which strand did they do worst in, and what is the
// first topic in that strand. It is a lookup. No model call, no scoring
// heuristic beyond an argmin, no new dependency.
//
// v1 is strand-accuracy only. Routing on misconception tags is the intended
// follow-up and is deliberately not here -- CAT-sourced misconception evidence
// only started accumulating behind the two-session confidence gate on
// 2026-08-12 (sql/student_misconceptions_session_gate.sql), so there is not yet
// enough of it to route on.

// The only course in curriculum_courses. Held as a constant rather than read
// from the table because every caller here has a session, not a course: a CAT
// result is not scoped to a course, and picking one by querying "the only row"
// would be a lookup that starts returning the wrong answer, silently, on the
// day a second course is added. When that day comes this becomes a parameter
// and the type error points at every call site.
export const DEFAULT_COURSE_ID = 'tsia2-math';

// Fixed order, used only as the last tie-break in weakestStrand. Matches the
// order the strands are presented in throughout the teacher dashboard.
const STRAND_ORDER: Strand[] = ['QR', 'AR', 'GR', 'PR'];

// The shape stored in sessions.strand_breakdown, written by
// app/api/sessions/route.ts. Every field is optional because this is jsonb --
// the column has no schema, rows written by older code are still in the table,
// and one row in production (an abandoned run from 2026-06-30) holds a single
// strand. Typing it as complete would be a claim the database does not enforce.
export type StrandStats = {
  total?: number | null;
  correct?: number | null;
  pct?: number | null;
};

export type StrandBreakdown = Partial<Record<Strand, StrandStats>>;

export type WeakestStrand = {
  strand: Strand;
  pct: number;
  // How many items of this strand the student actually saw. Carried through so
  // a caller can say "3 of 7 correct" rather than only a percentage, and so the
  // tie-break below is inspectable.
  attempted: number;
};

export type RecommendedTopic = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  // True when this is a content-free row standing in for a strand that has no
  // curriculum yet. The topic page renders a coming-soon state for these; a
  // caller that wants to soften its copy can read it too.
  is_placeholder: boolean;
  href: string;
};

export type Recommendation =
  | { status: 'ok'; strand: Strand; pct: number; attempted: number; topic: RecommendedTopic }
  // No strand had a single attempted item -- no diagnostic, or a breakdown that
  // is empty or malformed. There is nothing to recommend from, and callers
  // should fall back to whatever they showed before this existed.
  | { status: 'no_evidence' }
  // A weakest strand was found and no topic could be resolved for it -- the
  // course has no row in that strand at all, not even a placeholder, or the
  // lookup itself failed. Unreachable in the first sense once
  // sql/curriculum_placeholder_topics.sql has been applied, and kept as a
  // distinct state anyway so that deleting a placeholder without replacing it
  // produces a handled outcome instead of a null topic_id in a URL.
  //
  // The two senses are not separated because no caller distinguishes them:
  // both mean "we cannot name a topic", both fall back to the generic path,
  // and neither may claim to a student that content does not exist -- a
  // transient query failure is not evidence about the curriculum. The
  // coming-soon message belongs to a placeholder topic, which arrives as 'ok'.
  | { status: 'no_topic'; strand: Strand; pct: number; attempted: number };

// ─── Weakest strand ──────────────────────────────────────────────────────────

// The lowest-accuracy strand among the ones the student actually attempted.
//
// "Actually attempted" is the whole of the difficulty. The three existing
// weakest-strand implementations in the teacher dashboard
// (TeacherDashboardClient.tsx:116 and :1028, teacher/student/[id]/page.tsx:165)
// all seed a { QR: 0, AR: 0, GR: 0, PR: 0 } map, fill in what the breakdown
// has, and take the minimum -- so a strand the student never saw reads 0% and
// wins. One of them carries a comment claiming it does the opposite. That is
// survivable on a dashboard tile; it is not survivable here, where the answer
// decides which topic a student is sent to. A strand with no items is not a
// weak strand, it is an unmeasured one.
//
// Accuracy is recomputed from correct/total rather than read from the stored
// pct. The two agree today -- the same route writes both -- but correct and
// total are the primitive facts and pct is a rounding of them, and there is no
// reason for this to be the code that trusts the derived copy.
export function weakestStrand(breakdown: StrandBreakdown | null | undefined): WeakestStrand | null {
  if (!breakdown) return null;

  const attempted: WeakestStrand[] = [];
  for (const strand of STRAND_ORDER) {
    const stats = breakdown[strand];
    const total = typeof stats?.total === 'number' ? stats.total : 0;
    if (total <= 0) continue;
    const correct = typeof stats?.correct === 'number' ? stats.correct : 0;
    attempted.push({
      strand,
      pct: Math.round((correct / total) * 100),
      attempted: total,
    });
  }

  if (attempted.length === 0) return null;

  // Three rules, in order, and the second one is the one worth explaining.
  //
  // Ties are common: the blueprint gives GR only 3 items, so GR accuracy can
  // only ever be 0, 33, 67 or 100, and it collides with the other strands
  // constantly. When two strands tie, the one measured over more items is the
  // better-evidenced weakness -- 50% across AR's 7 items is a firmer claim than
  // 50% across GR's 3. Sending the student to the strand we know more about
  // beats sending them to the one that tied by having fewer questions.
  //
  // The third rule never affects which strand is truly weakest; it exists so
  // that a genuine dead heat returns the same answer every time rather than
  // depending on object key order.
  return attempted.reduce((best, candidate) => {
    if (candidate.pct !== best.pct) return candidate.pct < best.pct ? candidate : best;
    if (candidate.attempted !== best.attempted) {
      return candidate.attempted > best.attempted ? candidate : best;
    }
    return STRAND_ORDER.indexOf(candidate.strand) < STRAND_ORDER.indexOf(best.strand)
      ? candidate
      : best;
  });
}

// ─── First topic in a strand ─────────────────────────────────────────────────

// Where a student starts in a strand.
//
// Reads curriculum_topics directly rather than going through getTopics(), which
// filters placeholders out on purpose -- they are invisible to the course
// sequence and visible to exactly this query.
//
// The sort key is (is_placeholder, unit_number, sequence_in_unit, topic_id),
// and the first column is what makes replacing a placeholder a content task
// rather than a code task. false sorts before true in Postgres, so the moment
// any real topic exists in a strand it outranks that strand's placeholder,
// whatever unit or sequence number it carries. Uploading AR content through
// curriculum/migrations/upload_curriculum.py is therefore the entire migration:
// the new row arrives with is_placeholder false (the column default, and the
// script never sets it), this query starts returning it on the next request,
// and nothing in this file changes. Deleting the stale placeholder afterwards
// is housekeeping, not a correctness step.
//
// topic_id is the final tie-break because (unit_number, sequence_in_unit) has
// no unique constraint. sequence_in_unit is also nullable, and Postgres sorts
// nulls last on ASC, so a topic uploaded without one falls behind the topics
// that have one -- the right end of the order for a row missing its position.
export async function firstTopicInStrand(
  strand: Strand,
  courseId: string = DEFAULT_COURSE_ID
): Promise<RecommendedTopic | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('curriculum_topics')
    .select('course_id, topic_id, topic_name, unit_number, is_placeholder')
    .eq('course_id', courseId)
    .eq('related_strand', strand)
    .order('is_placeholder')
    .order('unit_number')
    .order('sequence_in_unit')
    .order('topic_id')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`[recommendation] firstTopicInStrand(${strand}) failed:`, error.message);
    return null;
  }
  if (!data) return null;

  return {
    course_id: data.course_id,
    topic_id: data.topic_id,
    topic_name: data.topic_name,
    unit_number: data.unit_number,
    is_placeholder: data.is_placeholder,
    href: topicHref(data),
  };
}

// ─── The recommendation ──────────────────────────────────────────────────────

// From a breakdown alone, which is what makes this work for anonymous
// test-takers: 41 of the 105 sessions in production have no user_id, and they
// are the majority of the marketing-site funnel. The results screen has the
// breakdown of the run the visitor just finished and needs no account to turn
// it into a recommendation.
export async function recommendFromBreakdown(
  breakdown: StrandBreakdown | null | undefined,
  courseId: string = DEFAULT_COURSE_ID
): Promise<Recommendation> {
  const weakest = weakestStrand(breakdown);
  if (!weakest) return { status: 'no_evidence' };

  const topic = await firstTopicInStrand(weakest.strand, courseId);
  if (!topic) {
    return {
      status: 'no_topic',
      strand: weakest.strand,
      pct: weakest.pct,
      attempted: weakest.attempted,
    };
  }

  return {
    status: 'ok',
    strand: weakest.strand,
    pct: weakest.pct,
    attempted: weakest.attempted,
    topic,
  };
}

// This student's diagnostic, or null if they have never finished one.
//
// Earliest first, not latest. The flag is written once per student by
// app/api/sessions/route.ts, but that write races with itself -- two
// submissions landing together both see no prior session -- and
// sql/sessions_session_type.sql deliberately declines to add the unique index
// that would prevent it, because the index prevents it by throwing away a
// student's completed test. Taking the earliest makes a duplicate flag a
// non-event: it resolves to the same row either way.
export async function firstDiagnosticSession(
  studentId: string
): Promise<{ id: string; strand_breakdown: StrandBreakdown | null } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('sessions')
    .select('id, strand_breakdown')
    .eq('user_id', studentId)
    .eq('session_type', 'diagnostic')
    .order('created_at')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[recommendation] firstDiagnosticSession failed:', error.message);
    return null;
  }
  return data ?? null;
}

// The signed-in path: the dashboard asking where to send this student.
export async function recommendForStudent(
  studentId: string,
  courseId: string = DEFAULT_COURSE_ID
): Promise<Recommendation> {
  const session = await firstDiagnosticSession(studentId);
  if (!session) return { status: 'no_evidence' };
  return recommendFromBreakdown(session.strand_breakdown, courseId);
}
