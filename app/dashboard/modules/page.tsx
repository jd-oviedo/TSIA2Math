import { headers } from 'next/headers';
import { getProfile } from '../../lib/auth';
import { resolveCourseAccess } from '../../lib/course-access';
import { allowsTopic } from '../../lib/capabilities';
import { getPlaceholderCounts } from '../../lib/curriculum-progress';
import {
  getTopics,
  getAttempts,
  progressByTopic,
  gradableTotal,
  type TopicRow,
  type TopicProgress,
  type TopicShape,
} from '../data';
import { getCompletions, isTopicComplete, type CompletionRow } from '../../lib/curriculum-progress';
import { Card, EmptyState, Eyebrow, Muted, PageHeading } from '../ui';
// Two of the three aliased imports that once sat here -- curriculum-theme, fonts
// and dashboard-theme -- came back when this file grew markup of its own again:
// the unwritten-topics line needs a face and a colour. They are relative, not
// aliased, matching the note the original removal left: no `@/` alias in this
// repo was rewritten, and anything new is written relative.
import { V } from '../../components/dashboard-theme';
import { FONT_BODY } from '../../components/fonts';
import { unitTitle } from '../../lib/units';
import UnitSection from './UnitSection';
import CourseBand from './CourseBand';
import ResumeCard from './ResumeCard';
import TopicListRow, { type RowStatus } from './TopicListRow';
import { unitFromParam, unitFromReferer } from './referer';
import { mostRecentTopic } from '../../lib/curriculum-progress';
import { loadTopicGates } from '../../course/[test]/[subject]/unit/[unit]/topic/[topicId]/topic-data';
import { resumeStep } from '../../lib/topic-parts';

// Modules. The curriculum browse surface: units, the topics inside them, and
// how far this student has got in each. The tree is read from curriculum_topics
// rather than hardcoded, so a newly uploaded topic appears here without a code
// change.

function topicHref(topic: TopicRow) {
  const [test, subject] = topic.course_id.split('-');
  return `/course/${test}/${subject}/unit/${topic.unit_number}/topic/${topic.topic_id}`;
}

// DEFINITION A. Settled 2026-08-22; the full argument is in
// curriculum-progress.ts above getCompletions.
//
// This used to be definition B: complete when correct >= total across every
// gradable item, with the lesson never consulted. B was the only completion
// state a student ever saw, and it disagreed with the record the database keeps
// and with the gates the product enforces. A student who read the notes, cleared
// the 70% practice gate and scored 3 of 4 on the quiz was told they had
// completed nothing.
//
// `attempted` still drives in_progress, because "started" is a fact about the
// attempt log rather than about the snapshot, and a student who has answered one
// question has started whatever the snapshot says.
function statusOf(
  p: TopicProgress | undefined,
  snapshot: CompletionRow | undefined,
  shape: TopicShape | undefined
): RowStatus {
  if (isTopicComplete(snapshot, p, shape)) return 'complete';
  if (snapshot?.lesson_completed_at) return 'in_progress';
  if (p && p.attempted > 0) return 'in_progress';
  return 'not_started';
}

// The string that tells a student a unit is not finished being written.
//
// Wording approved by Juan 2026-08-21, as written. One line, at the foot of the
// unit, only when the count is non-zero. Singular is handled because a unit
// could be one topic short; today the only non-zero count is unit 1's three.
//
// verify_modules_states.mjs asserts the plural string renders, so changing these
// words is a two-file change on purpose -- this is student-facing copy that was
// signed off, not an incidental label.
function unwrittenLine(count: number): string {
  return count === 1
    ? '1 more topic in this unit is being written.'
    : `${count} more topics in this unit are being written.`;
}

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) return null;

  const { unit: unitParam } = await searchParams;

  const [{ topics, shapes }, attempts, headerList, completions, access, placeholders] =
    await Promise.all([
    getTopics(),
    getAttempts(profile.id),
    headers(),
    // Definition A's one extra read. It joins this existing Promise.all, so it
    // costs one round trip and no added latency, and it is served by the unique
    // index on (user_id, course_id, topic_id) that curriculum_completion
    // already carries.
    getCompletions(profile.id),
    // THE GATE THIS PAGE SHIPPED WITHOUT.
    //
    // This surface rendered the whole course tree as working links to every
    // signed-in visitor, whatever their plan, between 2026-08-19 (when plan-based
    // curriculum access was introduced) and this fix. A free-tier or Practice Pass
    // student browsed all 97 topics and found out only by clicking, and Practice
    // Pass is a paid plan whose documented boundary is that it never reaches a
    // /course URL (capabilities.ts:13-15). Logged for attorney review as a
    // misrepresentation item in unpackmath-home's legal-audit-2026-08.md; see
    // also #176.
    //
    // resolveCourseAccess is the resolver the other three surfaces already use
    // (dashboard/page.tsx:67, api/curriculum/practice:77, course/layout.tsx:60).
    // It is called rather than reimplemented so this page and the /course gate
    // cannot disagree about who gets in. It is cache()d per request, and nothing
    // else on this page calls it, so this pays for one profile read.
    resolveCourseAccess(),
    getPlaceholderCounts(),
  ]);
  // Explicit parameter first, referer as the fallback. See referer.ts.
  const openUnit = unitFromParam(unitParam) ?? unitFromReferer(headerList.get('referer'));
  const progress = progressByTopic(attempts, shapes);

  // Course progress, definition A. One pass over topics already in memory.
  const courseDone = topics.reduce((sum, t) => {
    const key = `${t.course_id}:${t.topic_id}`;
    return sum + (isTopicComplete(completions.get(key), progress.get(key), shapes.get(key)) ? 1 : 0);
  }, 0);

  const units = new Map<number, TopicRow[]>();
  for (const topic of topics) {
    if (!units.has(topic.unit_number)) units.set(topic.unit_number, []);
    units.get(topic.unit_number)!.push(topic);
  }

  // Where to carry on. The topic comes from the attempt log, and the PART comes
  // from resumeStep(), the same function the topic overview uses, so the two
  // surfaces cannot disagree about where "carry on" goes.
  //
  // One extra single-row read, and only when the student has attempted
  // something: loadTopicGates resolves its shape from getTopicShape rather than
  // pulling practice_items for all 97 topics.
  const recent = mostRecentTopic(attempts);
  const recentCandidate = recent
    ? topics.find((t) => t.course_id === recent.course_id && t.topic_id === recent.topic_id)
    : undefined;

  // THE SAME GATE THE ROWS GET, and it is not redundant.
  //
  // The attempt log outlives entitlement: a student who worked through topics on
  // a Full Course plan that has since lapsed, or whose teacher's class went
  // inactive, still has rows in curriculum_attempts. Without this check the
  // resume card would offer them a "Continue" button pointing at a topic the
  // /course gate now refuses, which is the same defect the rows carried, in the
  // one control on this page most likely to be clicked first.
  const recentTopic =
    recentCandidate &&
    allowsTopic(access, 'curriculum', recentCandidate.course_id, recentCandidate.topic_id)
      ? recentCandidate
      : undefined;

  let resume: { topic: TopicRow; href: string; label: string } | null = null;
  if (recentTopic) {
    const gates = await loadTopicGates(profile.id, recentTopic.course_id, recentTopic.topic_id);
    const shape = shapes.get(`${recentTopic.course_id}:${recentTopic.topic_id}`);
    const step = resumeStep({
      lessonDone: gates.lessonDone,
      practiceAttempted: gates.practiceAttempted,
      quizAttempted: gates.quizAttempted,
      practiceGated: gates.practiceGated,
      practiceCount: shape?.practice.gradable ?? 0,
      practiceCorrect: gates.practiceCorrect,
      practiceRequired: gates.practiceRequired,
      quizGated: gates.quizGated,
      quizCount: shape?.mini_quiz.gradable ?? 0,
      quizCorrect: gates.quizCorrect,
      quizRequired: gates.quizRequired,
    });
    resume = {
      topic: recentTopic,
      href: `${topicHref(recentTopic)}/${step.kind}`,
      label: step.label,
    };
  }

  return (
    <>
      <PageHeading
        title="Modules"
        blurb="Every unit in your course, and how far you have got in each topic."
      />

      {units.size === 0 ? (
        <EmptyState
          title="No modules yet"
          detail="Your course has no published curriculum topics."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* No course-level progress. A denominator of the whole course produces
              a number that never visibly moves -- 3 of 1,348 rounds to 0% -- which
              reads to a student as having accomplished nothing. The per-unit bars
              stay, because those move. Nothing replaces it and the space is not
              repurposed. */}
          {/* topics.length is the derived 97: getTopics filters
              is_placeholder=false, so unwritten topics are counted by the line
              at the foot of their unit instead and never enter this
              denominator. Nothing here hardcodes 97. */}
          <CourseBand
            topicCount={topics.length}
            unitCount={units.size}
            completedTopics={courseDone}
          />

          {resume && (
            <ResumeCard
              topicId={resume.topic.topic_id}
              topicName={resume.topic.topic_name}
              unitNumber={resume.topic.unit_number}
              href={resume.href}
              label={resume.label}
            />
          )}

          {[...units.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([unitNumber, unitTopics]) => {
              // TOPICS, NOT QUESTIONS. This bar counted correct answers against
              // gradable items, so a unit read "84 / 190" -- a number no student
              // has a use for, and one that moves when a topic is re-authored.
              // It counts completed topics against topics now, which is what
              // "5/14" means on the syllabus and what a student is actually
              // walking through. Both numbers are derived; nothing is hardcoded.
              const unitTotal = unitTopics.length;
              const unitDone = unitTopics.reduce((sum, t) => {
                const key = `${t.course_id}:${t.topic_id}`;
                return (
                  sum +
                  (isTopicComplete(completions.get(key), progress.get(key), shapes.get(key))
                    ? 1
                    : 0)
                );
              }, 0);

              return (
                <UnitSection
                  key={unitNumber}
                  unitNumber={unitNumber}
                  unitTitle={unitTitle(unitNumber)}
                  topicCount={unitTopics.length}
                  done={unitDone}
                  total={unitTotal}
                  defaultOpen={unitNumber === openUnit}
                >
                  {unitTopics.map((topic, i) => {
                    const p = progress.get(`${topic.course_id}:${topic.topic_id}`);
                    // Per topic, not per page, because the free sample is a
                    // single-topic exemption: AR.1.4 stays open while the rest of
                    // the tree is gated. allowsTopic is the same predicate the
                    // /course gate applies, so a row that renders as a link and a
                    // route that admits the visitor cannot come apart.
                    const reachable = allowsTopic(
                      access,
                      'curriculum',
                      topic.course_id,
                      topic.topic_id
                    );
                    return (
                      <TopicListRow
                        key={topic.topic_id}
                        topicId={topic.topic_id}
                        topicName={topic.topic_name}
                        href={topicHref(topic)}
                        status={
                          reachable
                            ? statusOf(
                                p,
                                completions.get(`${topic.course_id}:${topic.topic_id}`),
                                shapes.get(`${topic.course_id}:${topic.topic_id}`)
                              )
                            : 'gated'
                        }
                        estimatedMinutes={topic.estimated_time_minutes}
                        correct={p?.correct ?? 0}
                        total={p?.total ?? 0}
                        first={i === 0}
                      />
                    );
                  })}
                  {(placeholders.get(unitNumber) ?? 0) > 0 && (
                    <p
                      style={{
                        margin: 0,
                        padding: '10px 6px 2px',
                        font: `400 12.5px ${FONT_BODY}`,
                        color: V.statusIdle,
                      }}
                    >
                      {unwrittenLine(placeholders.get(unitNumber) ?? 0)}
                    </p>
                  )}
                </UnitSection>
              );
            })}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <Card padding="16px 20px">
          <Eyebrow>How progress is counted</Eyebrow>
          <div style={{ marginTop: 6 }}>
            <Muted size={13}>
              A question counts once you have answered it correctly, so coming back to one you
              missed still moves your unit progress. Written practice is not counted, since
              nothing grades it.
            </Muted>
          </div>
        </Card>
      </div>
    </>
  );
}
