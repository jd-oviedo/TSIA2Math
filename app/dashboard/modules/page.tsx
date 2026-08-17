import { headers } from 'next/headers';
import { getProfile } from '../../lib/auth';
import {
  getTopics,
  getAttempts,
  progressByTopic,
  gradableTotal,
  type TopicRow,
  type TopicProgress,
} from '../data';
import { Card, EmptyState, Eyebrow, Muted, PageHeading } from '../ui';
// The three aliased imports that used to sit here -- curriculum-theme, fonts and
// dashboard-theme -- are gone because nothing in this file references them any
// more: the colours and faces they carried moved into CourseBand, ResumeCard and
// TopicListRow along with the markup that used them. They are removed as dead
// code, NOT normalised: no `@/` alias in this repo was rewritten to a relative
// path, and the new imports below are relative because they are new.
import UnitSection from './UnitSection';
import CourseBand from './CourseBand';
import ResumeCard from './ResumeCard';
import TopicListRow, { type RowStatus } from './TopicListRow';
import { unitFromReferer } from './referer';
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

export default async function ModulesPage() {
  const profile = await getProfile();
  if (!profile) return null;

  const [{ topics, shapes }, attempts, headerList] = await Promise.all([
    getTopics(),
    getAttempts(profile.id),
    headers(),
  ]);
  const openUnit = unitFromReferer(headerList.get('referer'));
  const progress = progressByTopic(attempts, shapes);

  const units = new Map<number, TopicRow[]>();
  for (const topic of topics) {
    if (!units.has(topic.unit_number)) units.set(topic.unit_number, []);
    units.get(topic.unit_number)!.push(topic);
  }

  // Course totals, read rather than written down: 97 topics and 1,348 gradable
  // questions today, both derived, so authoring moves them without a code change.
  const courseTotal = topics.reduce(
    (sum, t) => sum + gradableTotal(shapes.get(`${t.course_id}:${t.topic_id}`)),
    0
  );
  const courseDone = [...progress.values()].reduce((sum, p) => sum + p.correct, 0);

  // Where to carry on. The topic comes from the attempt log, and the PART comes
  // from resumeStep(), the same function the topic overview uses, so the two
  // surfaces cannot disagree about where "carry on" goes.
  //
  // One extra single-row read, and only when the student has attempted
  // something: loadTopicGates resolves its shape from getTopicShape rather than
  // pulling practice_items for all 97 topics.
  const recent = mostRecentTopic(attempts);
  const recentTopic = recent
    ? topics.find((t) => t.course_id === recent.course_id && t.topic_id === recent.topic_id)
    : undefined;

  let resume: { topic: TopicRow; href: string; label: string } | null = null;
  if (recentTopic) {
    const gates = await loadTopicGates(profile.id, recentTopic.course_id, recentTopic.topic_id);
    const shape = shapes.get(`${recentTopic.course_id}:${recentTopic.topic_id}`);
    const step = resumeStep({
      lessonDone: gates.lessonDone,
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
          <CourseBand
            topicCount={topics.length}
            unitCount={units.size}
            done={courseDone}
            total={courseTotal}
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
                  topicCount={unitTopics.length}
                  done={unitDone}
                  total={unitTotal}
                  defaultOpen={unitNumber === openUnit}
                >
                  {unitTopics.map((topic, i) => {
                    const p = progress.get(`${topic.course_id}:${topic.topic_id}`);
                    return (
                      <TopicListRow
                        key={topic.topic_id}
                        topicId={topic.topic_id}
                        topicName={topic.topic_name}
                        href={topicHref(topic)}
                        status={statusOf(p)}
                        estimatedMinutes={topic.estimated_time_minutes}
                        correct={p?.correct ?? 0}
                        total={p?.total ?? 0}
                        first={i === 0}
                      />
                    );
                  })}
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
              missed still moves the bar. Written practice is not counted, since nothing grades it.
            </Muted>
          </div>
        </Card>
      </div>
    </>
  );
}
