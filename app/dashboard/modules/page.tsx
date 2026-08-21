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
} from '../data';
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

function statusOf(p: TopicProgress | undefined): RowStatus {
  if (!p || p.total === 0) return 'not_started';
  if (p.correct >= p.total) return 'complete';
  if (p.attempted > 0) return 'in_progress';
  return 'not_started';
}

// The string that tells a student a unit is not finished being written.
//
// PENDING JUAN'S APPROVAL of the exact wording. The shape is fixed -- one line,
// at the foot of the unit, only when the count is non-zero -- and only the words
// are open. Singular is handled because a unit could be one topic short.
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

  const [{ topics, shapes }, attempts, headerList, access, placeholders] = await Promise.all([
    getTopics(),
    getAttempts(profile.id),
    headers(),
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
          <CourseBand topicCount={topics.length} unitCount={units.size} />

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
              const unitTotal = unitTopics.reduce(
                (sum, t) => sum + gradableTotal(shapes.get(`${t.course_id}:${t.topic_id}`)),
                0
              );
              const unitDone = unitTopics.reduce(
                (sum, t) => sum + (progress.get(`${t.course_id}:${t.topic_id}`)?.correct ?? 0),
                0
              );

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
                        status={reachable ? statusOf(p) : 'gated'}
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
