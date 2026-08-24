'use client';

import { useEffect, useState } from 'react';
import { V } from '@/app/components/dashboard-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { C } from '@/app/components/curriculum-theme';
import { isOverdue } from '@/app/lib/assignments';
import type { StudentAssignment } from './data';

// The compact assignments surface on Home: the next one or two pieces of work
// still to do, and when they are due.
//
// A CLIENT COMPONENT FOR THE CLOCK ONLY, exactly as the full list is. The
// selection -- which two, in what order -- is made on the server by nextDue(),
// because it depends on due dates and completion rather than on the current
// time. Only the overdue chip needs to know what time it is now.
//
// WHAT THIS CARD DOES NOT DO: it never renders when there is nothing still to
// do. The caller decides that by passing an empty array, and the card returns
// null rather than an empty state. A student with no assignments should see no
// assignments card on Home -- an empty card on the busiest page in the product
// is a permanent reminder of nothing.

function formatDue(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AssignmentsHomeCard({
  assignments,
  total,
}: {
  /** Already narrowed to the next 1-2 INCOMPLETE items, in order, by the server. */
  assignments: StudentAssignment[];
  /** How many are still to do in total, so the link can say what is behind it. */
  total: number;
}) {
  // Null until after mount, because the clock may not be read during render on
  // either side -- see AssignmentsList's header for the rule and the proof.
  //
  // THIS CARD DOES NOT WAIT FOR IT, and does not have to. The clock affects only
  // the overdue STYLING here; which assignments appear and in what order was
  // decided on the server by nextDue(), which needs no clock. So the card paints
  // immediately with its due dates and upgrades an overdue one in place a frame
  // later. The full list cannot do this because its clock decides structure.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  if (assignments.length === 0) return null;

  const more = total - assignments.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ margin: '0 0 4px', font: `600 16px ${FONT_HEADING}`, color: V.heading }}>
          {assignments.length === 1 ? 'Your next assignment' : 'Your next assignments'}
        </h2>
        <a
          href="/dashboard/assignments"
          style={{ font: `600 13px ${FONT_BODY}`, color: V.heading, textDecoration: 'underline' }}
        >
          {more > 0 ? `See all ${total}` : 'See all'}
        </a>
      </div>

      {assignments.map((a) => {
        // The n=1 case of the same rule the teacher panel uses. Everything on
        // this card is incomplete by construction, so `notDone` is true -- passed
        // explicitly rather than hardcoded inside the helper, because the helper
        // is shared and the teacher's caller means something different by it.
        const overdue = isOverdue(a.due_at, now, true);
        return (
          <a
            key={a.id}
            href={a.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              paddingLeft: 13,
              // The announcements card directly above uses this exact left-rule
              // treatment for its items. Matching it is what keeps two compact
              // teacher-pushed surfaces reading as one column rather than two
              // competing designs.
              borderLeft: `3px solid ${overdue ? V.noticeWarn : C.sky}`,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ font: `600 15px ${FONT_HEADING}`, color: V.heading }}>
                {a.topic_name}
              </div>
              {/* suppressHydrationWarning: the day string resolves in the
                  renderer's timezone and the server is UTC. Same note as the
                  full list. */}
              <span
                suppressHydrationWarning
                style={{
                  font: `${overdue ? 600 : 400} 12px ${FONT_BODY}`,
                  color: overdue ? V.noticeWarn : V.dim,
                }}
              >
                {a.due_at
                  ? `${overdue ? 'Overdue · ' : 'Due '}${formatDue(a.due_at)}`
                  : 'No due date'}
              </span>
            </div>
            <div style={{ font: `400 12.5px ${FONT_BODY}`, color: V.muted }}>
              Unit {a.unit_number} · {a.topic_id}
              {a.status === 'in_progress' ? ' · In progress' : ''}
            </div>
          </a>
        );
      })}
    </div>
  );
}
