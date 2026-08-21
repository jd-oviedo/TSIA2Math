'use client';

import { useState, type ReactNode } from 'react';
import { V } from '../../components/dashboard-theme';
import { C } from '../../components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

// One collapsible unit on the Modules page.
//
// The page is a server component and stays one: only the toggle is a client
// concern, so the topic rows arrive as `children`, already rendered on the
// server with their progress read from the database. Nothing about a topic row
// ships as client JavaScript.
//
// COLLAPSED TOPICS ARE NOT RENDERED, rather than rendered and hidden, and that
// is a testing decision as much as a DOM one. Measured on a closed <details>:
//
//   querySelectorAll("a").length  3      <- hidden children are still counted
//   locator("a").count()          3
//   isVisible()                   false
//   click()                       times out
//
// So a presence-based check passes on an element a student can never reach,
// which is the false-green shape this codebase has been bitten by repeatedly.
// Leaving collapsed topics out of the DOM makes a count fail loudly instead of
// quietly. The cost is that browser find-in-page cannot reach a collapsed unit,
// which is the same trade every disclosure makes.
//
// SEMANTICS. The whole header row is one real <button> carrying aria-expanded
// and aria-controls, wrapped in the <h2> that used to carry the unit name, so
// the heading outline is unchanged and a screen reader still lists every unit.
// The button's contents are all phrasing content: a <div> or <p> inside a
// <button> is not conformant, which is why the progress bar here is built from
// spans and marked aria-hidden rather than reusing <ProgressBar>, and why the
// progress is also stated in words for anyone who cannot see the bar.
export default function UnitSection({
  unitNumber,
  unitTitle,
  topicCount,
  done,
  total,
  defaultOpen,
  children,
}: {
  unitNumber: number;
  /**
   * The unit's name. Null when none is known, in which case the header renders
   * the number alone exactly as it did before titles existed.
   *
   * Comes from app/lib/units.ts, a constant rather than a column: production
   * carries no unit-name column and no units table (measured 2026-08-21).
   */
  unitTitle: string | null;
  topicCount: number;
  done: number;
  total: number;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `um-unit-panel-${unitNumber}`;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: open ? 11 : 0 }}>
      <h2 style={{ margin: 0 }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          data-unit={unitNumber}
          style={{
            // Full-width row, so the target is the header and not a chevron.
            // 52px clears the 44px minimum on a phone with room to spare.
            width: '100%',
            minHeight: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            padding: '10px 14px',
            borderRadius: 13,
            border: 'none',
            background: V.cardBg,
            boxShadow: `inset 0 0 0 1px ${V.cardBorder}`,
            color: 'inherit',
            font: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: 'none',
              width: 12,
              display: 'inline-block',
              color: V.dim,
              transform: open ? 'rotate(90deg)' : 'none',
              transition: 'transform 120ms ease',
            }}
          >
            &#9656;
          </span>

          {/* THE TITLE WRAPS, AND THAT BREAKS A PROBE. READ BEFORE CHANGING.
              ================================================================
              The requirement is that unit titles are visible to EVERY user on
              this page. Two layouts were measured against that, with
              verify_modules_density at 360x780:

                one line, ellipsis   last header bottom 621px   FITS
                                     but "Number Sense and Quantitative
                                     Foundations" clips to "Num..." at 390px,
                                     which is not a visible title

                wrapped, two lines   last header bottom 836px   OVERFLOWS by 56px
                                     every title readable in full at every width

              This is the wrapped one. The title is the requirement; the fold is
              a design goal PR #117 set when unit headers were a number and a
              count and nothing else. Six wrapped headers now need 56px more than
              a 780px phone has, so the page scrolls a little to reach unit 5.

              NOT resolved by quietly tightening the spacing PR #117 tuned, and
              NOT resolved by shipping a title nobody can read.

              SETTLED 2026-08-21: Juan chose the wrap and moved the fold, because
              clipping cuts exactly the words that distinguish one unit from
              another. verify_modules_density now measures against a stated
              880px budget instead of the viewport height, and its header block
              carries both measurements and the reason it moved. The budget has
              less headroom than one more unit header, so this stays honest. */}
          <span
            style={{
              font: `600 18px ${FONT_HEADING}`,
              color: V.heading,
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
            }}
          >
            <span style={{ flex: 'none' }}>Unit {unitNumber}</span>
            {unitTitle ? (
              <span
                title={unitTitle}
                style={{
                  font: `400 15px ${FONT_BODY}`,
                  color: V.muted,
                  minWidth: 0,
                }}
              >
                {unitTitle}
              </span>
            ) : null}
          </span>

          <span style={{ font: `400 13px ${FONT_BODY}`, color: V.muted }}>
            {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
          </span>

          {/* Decorative. The same information is in the sentence below it, so a
              screen reader hears it once rather than twice. */}
          <span
            aria-hidden="true"
            style={{
              flex: 1,
              minWidth: 90,
              maxWidth: 180,
              height: 6,
              borderRadius: 3,
              background: V.trackBg,
              overflow: 'hidden',
              display: 'inline-block',
            }}
          >
            <span
              style={{
                display: 'block',
                width: `${pct}%`,
                height: '100%',
                background: C.sunset,
              }}
            />
          </span>

          <span className="um-visually-hidden">
            {total > 0 ? `${done} of ${total} questions correct` : 'no graded questions yet'}
          </span>
        </button>
      </h2>

      {open ? (
        <div id={panelId} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
