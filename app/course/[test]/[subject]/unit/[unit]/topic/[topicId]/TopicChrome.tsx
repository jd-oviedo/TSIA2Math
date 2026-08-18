'use client';

import { useState } from 'react';
import { C, ink, INK_MUTED, RADIUS, hairline } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import type { TopicPart } from '@/app/lib/topic-part-route';
import SupportModal from '@/app/components/SupportModal';
import { StudentNavDrawer, StudentNavTrigger } from '@/app/components/StudentNav';

// The course bar at the top of every topic page, with the nav menu in the
// top-left corner.
//
// Collapsed by default at every width, unlike the dashboard where the same nav
// is a permanent rail. A fixed 208px panel beside a practice problem competes
// with the maths for attention, and these pages are meant to be the quiet ones.
// The drawer itself is the shared component, so both trees stay in step.
//
// IT IS A POSITION DISPLAY, NOT A CONTROL
// ---------------------------------------
// The three part segments carry no state: no completion, no lock, no counts.
// The doorway at /topic/{id} owns all of that and says it better, which is why
// the indicator is not rendered there at all.
//
// All three are live links, and that adds no capability. Nothing in the topic
// tree gates a route -- lesson, practice and quiz each read their own section's
// threshold and none checks a prior part -- so every one is already reachable,
// and the doorway already links to all three. A segment rendered disabled would
// be a control that lies about a route the student can simply type.

const PARTS: readonly { kind: TopicPart; label: string }[] = [
  { kind: 'lesson', label: 'Lesson' },
  { kind: 'practice', label: 'Practice' },
  { kind: 'quiz', label: 'Quiz' },
];

export default function TopicChrome({
  name,
  role,
  test,
  subject,
  subjectLabel,
  unit,
  topicId,
  part,
}: {
  name: string;
  role: 'student' | 'teacher';
  test: string;
  subject: string;
  subjectLabel: string;
  unit: string;
  topicId: string;
  // Null on the doorway, and null when x-pathname could not be read. Both render
  // no indicator, which is the chrome exactly as it was before this existed.
  part: TopicPart | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const topicBase = `/course/${test}/${subject}/unit/${unit}/topic/${topicId}`;

  return (
    <>
      <div
        className="um-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 22px',
          background: C.paper,
          borderBottom: `1px solid ${ink(0.09)}`,
        }}
      >
        <StudentNavTrigger onClick={() => setMenuOpen(true)} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/unpackmath-wordmark.png"
          alt="UnpackMath"
          style={{ height: '22px', width: 'auto', display: 'block' }}
        />
        <div style={{ width: '1px', height: '20px', background: ink(0.12) }} />
        <div
          className="um-bar-trail"
          style={{ font: `400 13px ${FONT_BODY}`, color: ink(0.6), lineHeight: 1.3 }}
        >
          <a href={`/course/${test}/${subject}`} style={{ color: 'inherit' }}>
            {test.toUpperCase()} ·{' '}
            <span style={{ textTransform: 'capitalize' }}>{subjectLabel}</span>
          </a>
          <span style={{ color: ink(0.3), padding: '0 6px' }}>/</span>
          <a href={`/course/${test}/${subject}/unit/${unit}`} style={{ color: 'inherit' }}>
            Unit {unit}
          </a>
          {/* Not a link. This is where the student already is, and the doorway
              it would point at is one click away in the segments below. */}
          <span className="um-bar-topic">
            <span style={{ color: ink(0.3), padding: '0 6px' }}>/</span>
            <span style={{ font: `500 12px ui-monospace, Menlo, monospace`, color: C.midnight }}>
              {topicId}
            </span>
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {part && (
          <>
            {/* Desktop: three joined segments. A nav landmark because it is a
                list of where else in this topic you can go. */}
            <nav
              className="um-bar-parts"
              aria-label="Topic parts"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {PARTS.map(({ kind, label }, i) => {
                const current = kind === part;
                return (
                  <a
                    key={kind}
                    href={`${topicBase}/${kind}`}
                    aria-current={current ? 'page' : undefined}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      // 44px, because these are links and a thumb has to hit one.
                      minHeight: 44,
                      padding: '0 16px',
                      // Rounded on the outside only, so the three read as one
                      // control rather than three buttons.
                      borderTopLeftRadius: i === 0 ? RADIUS : 0,
                      borderBottomLeftRadius: i === 0 ? RADIUS : 0,
                      borderTopRightRadius: i === PARTS.length - 1 ? RADIUS : 0,
                      borderBottomRightRadius: i === PARTS.length - 1 ? RADIUS : 0,
                      background: current ? C.cream : 'transparent',
                      boxShadow: hairline(ink(0.12)),
                      font: `${current ? 600 : 400} 12.5px ${FONT_BODY}`,
                      color: current ? C.midnight : INK_MUTED,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>

            {/* Phone: the three segments do not fit beside the trigger, the
                wordmark and the breadcrumb, so what survives is the one piece of
                information they were carrying. The design does the same at 390. */}
            <span
              className="um-bar-part-now"
              style={{
                display: 'none',
                font: `500 12px ${FONT_BODY}`,
                color: ink(0.7),
                whiteSpace: 'nowrap',
              }}
            >
              {PARTS.find((p) => p.kind === part)?.label}
            </span>
          </>
        )}
      </div>

      <StudentNavDrawer
        open={menuOpen}
        name={name}
        role={role}
        onClose={() => setMenuOpen(false)}
        onOpenSupport={() => setShowSupport(true)}
        /* These pages are light-only by design, so the drawer stays light here
           even for a student who has dark mode on elsewhere. */
        mode="light"
      />

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </>
  );
}
