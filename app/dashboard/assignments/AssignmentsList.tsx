'use client';

import { useEffect, useState } from 'react';
import { V, cardStyle } from '@/app/components/dashboard-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { bucketAssignments, isOverdue } from '@/app/lib/assignments';
import { unitLabel } from '@/app/lib/units';
import type { StudentAssignment } from '../data';

// The grouped list. A client component for ONE reason: the four buckets are
// time-relative, and deciding which one a row falls in means reading a clock.
//
// WHY THE CLOCK IS NOT READ DURING RENDER. Date.now() inline in a render body is
// an impure call -- the same tree for the same props would produce two different
// answers, which React is free to notice. app/teacher/AssignmentsPanel.tsx:76-99
// argues this at length and solves it by reading the clock when the data loads.
// This page has no load event (the data arrives from a server component), so the
// equivalent is the effect below.
//
// THE SERVER MAY NOT READ THE CLOCK EITHER, and this was proved rather than
// assumed. The first version of this file took a server-rendered `initialNow`
// timestamp so the first paint could be correct; `npm run lint` refused it with
// react-hooks/purity, "Cannot call impure function during render", pointing at
// the Date.now() in the server component's own render body. The rule is not
// client-only, and it is right: a server component that reads the clock while
// rendering is impure in exactly the way the teacher panel's note describes.
//
// So the clock is read in ONE place, after mount, and the list renders nothing
// until it has been. That is one frame on an authenticated page whose heading
// and empty state are both server-rendered -- the same trade the teacher panel
// already makes, arrived at the same way.

const STATUS_LABEL: Record<StudentAssignment['status'], string> = {
  complete: 'Complete',
  in_progress: 'In progress',
  not_started: 'Not started',
};

const STATUS_COLOR: Record<StudentAssignment['status'], string> = {
  complete: V.statusComplete,
  in_progress: V.statusProgress,
  not_started: V.statusIdle,
};

function formatDue(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Row({ a, now, first }: { a: StudentAssignment; now: number | null; first: boolean }) {
  const done = a.status === 'complete';
  // ONE SOURCE FOR OVERDUE, the shared helper, with `notDone` as the n=1 case of
  // the same argument the teacher panel passes. A completed-past-due assignment
  // is not overdue, so this chip and the bucket this row was sorted into cannot
  // disagree -- both come from the same call.
  const overdue = isOverdue(a.due_at, now, !done);

  return (
    <a
      href={a.href}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        padding: '14px 18px',
        borderTop: first ? 'none' : `1px solid ${V.hairline}`,
        textDecoration: 'none',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ font: `600 15px ${FONT_HEADING}`, color: V.heading }}>{a.topic_name}</span>
          <span style={{ font: `400 12px ${FONT_BODY}`, color: V.dim }}>{a.topic_id}</span>
          {a.due_at && (
            // suppressHydrationWarning because toLocaleDateString resolves in the
            // renderer's timezone: the server is UTC and the student is not, so
            // the same instant can be two different day strings. The client's
            // rendering is the correct one and wins on hydration. The bucket
            // maths is unaffected -- it compares epoch milliseconds, which carry
            // no timezone at all.
            <span
              suppressHydrationWarning
              style={{
                font: `600 11.5px ${FONT_BODY}`,
                padding: '2px 7px',
                borderRadius: 5,
                background: overdue ? V.noticeWarnBg : V.chipBg,
                color: overdue ? V.noticeWarn : V.muted,
              }}
            >
              {overdue ? 'Overdue ' : 'Due '}
              {formatDue(a.due_at)}
            </span>
          )}
        </div>
        {/* The full label, title and all, because this page groups by DUE DATE
            and so gives a row no unit context to be read in -- unlike Modules,
            where the unit is the heading the row already sits under. unitLabel
            is the existing composer; "Unit 0" alone is accurate (unit 0 is
            Foundations) but tells a student nothing. */}
        <div style={{ marginTop: 4, font: `400 12.5px ${FONT_BODY}`, color: V.muted }}>
          {unitLabel(a.unit_number)}
        </div>
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          flex: '0 0 auto',
          font: `600 12.5px ${FONT_BODY}`,
          color: STATUS_COLOR[a.status],
        }}
      >
        {done && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3.5 9.5 7 13 14.5 5" />
          </svg>
        )}
        {STATUS_LABEL[a.status]}
      </span>
    </a>
  );
}

export default function AssignmentsList({ assignments }: { assignments: StudentAssignment[] }) {
  const [now, setNow] = useState<number | null>(null);

  // The viewer's own clock, read once after mount.
  //
  // INSIDE A CALLBACK, NOT SYNCHRONOUSLY IN THE EFFECT BODY. A setState called
  // straight from an effect is a cascading render, which react-hooks/
  // set-state-in-effect refuses; AssignmentsPanel avoids it by reading its clock
  // inside the async loader, and this is the same move with no loader to hide
  // in. One frame later is soon enough for a deadline measured in days.
  useEffect(() => {
    const id = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  // Nothing to group against yet. See the header: the honest answer before the
  // clock is read is no answer, not a guess made on the server.
  if (now === null) return null;

  // COMPLETE ASSIGNMENTS ARE NOT FILTERED OUT HERE. They stay on this page, in
  // their due bucket, carrying the done treatment -- a student should be able to
  // see what they have finished. What they are excluded from is Overdue, and
  // that exclusion lives in isOverdue rather than in a filter here, which is why
  // it cannot be forgotten: `notDone` is a required argument.
  const groups = bucketAssignments(assignments, now, (a) => a.status !== 'complete');
  const nonEmpty = groups.filter((g) => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {nonEmpty.map((group) => (
        <section key={group.bucket}>
          <h2
            style={{
              margin: '0 0 9px',
              font: `600 13px ${FONT_BODY}`,
              letterSpacing: 0.3,
              color: group.bucket === 'overdue' ? V.noticeWarn : V.dim,
            }}
          >
            {group.label}
            <span style={{ marginLeft: 7, fontWeight: 400, color: V.dim }}>
              {group.items.length}
            </span>
          </h2>
          <div style={{ ...cardStyle(), background: V.cardBg, border: `1px solid ${V.cardBorder}`, boxShadow: V.cardShadow, overflow: 'hidden' }}>
            {group.items.map((a, i) => (
              <Row key={a.id} a={a} now={now} first={i === 0} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
