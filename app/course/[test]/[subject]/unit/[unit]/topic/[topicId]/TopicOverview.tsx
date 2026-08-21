import { EYEBROW } from '@/app/components/curriculum-theme';
import { T } from '../../../../../../../components/curriculum-surface';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// The topic doorway: what the three parts are, where this student stands in
// each, and one action that carries on from wherever they stopped.
//
// WHAT THIS SURFACE IS FOR
// ------------------------
// The gates already exist. A student discovers them today by hitting one: they
// work through practice, press Next, and are told they need 7 of 10. This page
// says so before they start rather than after, which is the whole point of it.
//
// It therefore states the rule that is really enforced and nothing more. In
// particular there is NO "locked until practice is done" state here, because
// there is no such rule: nothing in the topic tree gates a route. lesson,
// practice and quiz each read their own section's threshold and none of them
// checks a previous part, so a student can open the quiz whenever they like.
// Drawing a padlock would be inventing a lock that does not exist.
//
// What IS gated is the Next control at the foot of each part, via TopicNav, and
// that is what the "needs N of M" line describes.

export type PartState = {
  kind: 'lesson' | 'practice' | 'quiz';
  title: string;
  href: string;
  // The quiet line under the title: size, and how far this student has got.
  detail: string;
  status: 'complete' | 'in_progress' | 'not_started' | 'ungated';
  // Only set where a threshold actually applies.
  requirement?: string;
};

const STATUS_LABEL: Record<PartState['status'], string> = {
  complete: 'Complete',
  in_progress: 'In progress',
  not_started: 'Not started',
  // QR.1.1's written practice. There is nothing to grade, so there is no gate
  // and "not started" would be misleading about a section a student can only
  // read.
  ungated: 'Nothing to grade',
};

// The colour of the RIGHT-HAND STATE LABEL, which is text.
//
// "In progress" is NOT orange, and that is the settled rule rather than a
// preference. Orange survives on this surface as a fill and a rule: the step
// badge beside the in-progress part is ringed in T.cta, and the primary button
// is filled with it. As text it cannot be read. Measured on the reading ground:
// #F0A33E is 1.99 on the band and 1.74 on the page, against a 4.5 target, and
// there is no approved orange that clears text contrast anywhere on the cream
// ladder (the darkened #A8631F reaches 4.62 on paper and fails the other six).
//
// Caught by looking at the light screenshot after a mechanical C.sunset -> T.cta
// conversion carried the old value straight through. The conversion was right
// about the token and wrong about the role.
function statusColor(status: PartState['status']): string {
  if (status === 'complete') return T.correct;
  // in_progress deliberately falls through to muted with the other states. The
  // badge to the left is what marks it, in orange, where orange works.
  return T.muted;
}

// The step number badge. Filled once the part is done, ringed while it is the
// one in progress, hairline otherwise, so the sequence reads at a glance
// without relying on the text beside it.
function StepMark({ n, status }: { n: number; status: PartState['status'] }) {
  const done = status === 'complete';
  const active = status === 'in_progress';
  return (
    <span
      aria-hidden="true"
      style={{
        width: 26,
        height: 26,
        flex: 'none',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `600 12px ${FONT_BODY}`,
        background: done ? T.correct : 'transparent',
        color: done ? T.panel : T.muted,
        boxShadow: done
          ? 'none'
          : `inset 0 0 0 ${active ? 2 : 1}px ${active ? T.cta : T.hairline}`,
      }}
    >
      {n}
    </span>
  );
}

export default function TopicOverview({
  parts,
  primary,
  estimatedMinutes,
}: {
  parts: PartState[];
  // Where "carry on" goes, and what to call it. Derived from the same gate
  // state the rows below are, so the button can never disagree with them.
  primary: { href: string; label: string };
  estimatedMinutes: number | null;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ ...EYEBROW, color: T.muted }}>In this topic</div>
        <p
          style={{
            margin: 0,
            maxWidth: 620,
            font: `400 14.5px ${FONT_BODY}`,
            lineHeight: 1.6,
            color: T.ink2,
          }}
        >
          Three parts, in order.
          {estimatedMinutes ? ` About ${estimatedMinutes} minutes for the whole topic.` : ''}{' '}
          You can move around freely, and each part tells you what it needs before the next
          one opens up.
        </p>
      </div>

      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {parts.map((part, i) => (
          <li key={part.kind}>
            <a
              className="um-part-row"
              href={part.href}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 14,
                background: T.panel,
                boxShadow: `inset 0 0 0 1px ${T.hairline}`,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <StepMark n={i + 1} status={part.status} />

              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: `600 16px ${FONT_HEADING}`, color: T.ink }}>
                  {part.title}
                </span>
                <span style={{ font: `400 13px ${FONT_BODY}`, lineHeight: 1.5, color: T.muted }}>
                  {part.detail}
                </span>
                {part.requirement && (
                  <span style={{ font: `400 12.5px ${FONT_BODY}`, lineHeight: 1.5, color: T.muted }}>
                    {part.requirement}
                  </span>
                )}
              </span>

              <span
                style={{
                  flex: 'none',
                  font: `500 12.5px ${FONT_BODY}`,
                  color: statusColor(part.status),
                }}
              >
                {STATUS_LABEL[part.status]}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <a
          className="um-primary"
          href={primary.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            padding: '12px 24px',
            borderRadius: 12,
            background: T.cta,
            boxShadow: `0 2px 0 ${T.ctaShadow}`,
            font: `600 15px ${FONT_HEADING}`,
            color: T.ink,
            textDecoration: 'none',
          }}
        >
          {primary.label}
        </a>
        <a
          href="/dashboard/modules"
          style={{
            font: `500 13.5px ${FONT_BODY}`,
            color: T.muted,
          }}
        >
          Back to modules
        </a>
      </div>
    </section>
  );
}
