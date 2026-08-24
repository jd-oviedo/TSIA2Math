'use client';

import { useEffect, useState } from 'react';
import { V } from '@/app/components/dashboard-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { C } from '@/app/components/curriculum-theme';
import { formatDue, isOverdue } from '@/app/lib/assignments';
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
  // THE CARD STILL PAINTS IMMEDIATELY. Which assignments appear and in what
  // order was decided on the server by nextDue(), which needs no clock, so the
  // topic and the unit are there on the first frame and only the due chip
  // arrives a frame later.
  //
  // THE DUE CHIP NOW WAITS FOR THIS, and that is a fix rather than a cost. It
  // used to render during SSR, where toLocaleDateString resolves in the SERVER's
  // timezone -- UTC -- so Home printed "Aug 29" for an assignment the
  // Assignments page printed as "Aug 28". See formatDue in app/lib/assignments.ts
  // for the full mechanism, including why suppressHydrationWarning made it
  // permanent rather than a one-frame flicker.
  //
  // So the rule this card now follows is the one the full list already followed:
  // a day string is produced by the browser or it is not produced at all.
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
              {/* NO suppressHydrationWarning, DELIBERATELY, and this is the
                  load-bearing half of the fix.

                  The attribute was here, and what it suppressed was the only
                  signal that this span was rendering a UTC day to a student in
                  Texas. With the `now` gate below, server and client both render
                  an empty span and there is nothing left to suppress -- so if
                  somebody removes the gate, React says so instead of the bug
                  silently coming back the way it came the first time. */}
              <span
                style={{
                  font: `${overdue ? 600 : 400} 12px ${FONT_BODY}`,
                  color: overdue ? V.noticeWarn : V.dim,
                }}
              >
                {a.due_at === null
                  ? // Timezone-free, so it needs no clock and paints at once.
                    'No due date'
                  : now === null
                    ? null
                    : `${overdue ? 'Overdue · ' : 'Due '}${formatDue(a.due_at)}`}
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
