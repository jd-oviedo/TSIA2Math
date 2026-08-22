'use client';

import { useEffect, useRef, useState } from 'react';
import TopicNav from './TopicNav';
import LessonHandoff from './LessonHandoff';
import { EYEBROW, RADIUS, hairline, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
import { T } from '@/app/components/curriculum-surface';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import type { LessonSection } from '@/lib/curriculum-utils';
import type { NavStep } from './topic-data';

// Guided notes, plus the scroll-to-bottom gate.
//
// Completion is detected with an IntersectionObserver on a sentinel at the end
// of the content, not by comparing scrollTop against scrollHeight. The sentinel
// fires however the student got there -- wheel, Page Down, End, a screen reader
// moving focus, or a short page that never scrolls at all -- where scroll maths
// only ever recognises one of those and would strand everyone else.
//
// WHAT THE SECTION SPLIT DID NOT CHANGE
// -------------------------------------
// The notes used to be one card holding one 50-minute blob. They are now one card
// per authored section, with an outline beside them. The sentinel is in exactly
// the same place relative to the content: last thing after the last card, before
// the handoff. It is keyed on its position in the DOM, not on the content above
// it, so it fires on precisely the condition it fired on before -- the student
// reached the end of ALL the notes, not the end of the first section.
//
// That is the regression risk in this change and scripts/verify_lesson_outline.mjs
// asserts it directly: at the bottom of section one the gate is still shut.
//
// This holds because every section is on one scroll. Under paged sections -- the
// variant the design keeps available -- the sentinel would sit inside a page the
// student may never open, and the gate would strand them. If paging ever comes
// back, the sentinel is the first thing to redesign.
//
// WHAT THE OUTLINE DELIBERATELY IS NOT
// ------------------------------------
// A static list. No ids, no anchors, no IntersectionObserver over the sections,
// no current-section marker, no progress fill, no checkmarks, no time remaining,
// no jump links. Every one of those is a function of where the reader currently
// is, which needs scroll observation, and the persisted half of it needs a column
// next to lesson_completed_at that does not exist. Both were deferred on purpose.

const RAIL_WIDTH = 264;
// The design caps the MEASURE at 788px with the rail beside it, and accepts the
// band running on past it rather than centring the pair. The band itself fills
// the width; only the line length is capped.
const COLUMN_WIDTH = 788;

export default function LessonBody({
  sections,
  html,
  initialDone,
  courseId,
  topicId,
  canRecord,
  previous,
  next,
  practiceHref,
  practiceCount,
  practiceInteractive,
}: {
  // One entry per authored h5. Empty when the notes could not be split, and the
  // page renders `html` as a single card exactly as it did before sections
  // existed. No topic in the course reaches that today.
  sections: LessonSection[];
  html: string;
  initialDone: boolean;
  courseId: string;
  topicId: string;
  // False for a signed-out visitor: the gate still works in the page, there is
  // just nowhere to persist it.
  canRecord: boolean;
  previous: NavStep;
  next: NavStep;
  // Where the handoff card sends the student, and what to call the section it
  // is sending them to. All already loaded by the lesson page; no new read.
  practiceHref: string;
  practiceCount: number;
  practiceInteractive: boolean;
}) {
  const [done, setDone] = useState(initialDone);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const recorded = useRef(initialDone);

  useEffect(() => {
    if (done) return;
    const node = sentinel.current;
    if (!node) return;

    // Without IntersectionObserver (very old browsers, some test runners) the
    // gate would never open, so it fails open rather than trapping the student.
    // Deferred rather than set inline, so this is not a synchronous setState
    // inside an effect body.
    if (typeof IntersectionObserver === 'undefined') {
      const timer = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setDone(true);
          observer.disconnect();
        }
      },
      // A little slack at the bottom: the sentinel counts as reached when it is
      // near the viewport, not only when it is fully inside it.
      { rootMargin: '0px 0px -40px 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [done]);

  useEffect(() => {
    if (!done || recorded.current || !canRecord) return;
    recorded.current = true;
    void fetch('/api/curriculum/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lesson_complete', course_id: courseId, topic_id: topicId }),
    }).catch(() => {
      // The gate is already open in the page. Losing the record is worth a
      // retry on the next visit, not an error in the student's face.
      recorded.current = false;
    });
  }, [done, canRecord, courseId, topicId]);

  const count = sections.length;
  const sectionLabel = `${count} ${count === 1 ? 'section' : 'sections'}`;

  const card = {
    background: T.panel,
    borderRadius: RADIUS,
    boxShadow: hairline(T.hairline),
    color: T.ink2,
    font: `400 16px ${FONT_BODY}`,
    lineHeight: MATH_LINE_HEIGHT,
  } as const;

  return (
    <div className="um-lesson-layout" style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
      {/* THE OUTLINE.

          A nav landmark because it is a list of what the page contains, but its
          entries are not links: there is nothing to link to without ids, and ids
          are the first half of section-level resume, which is deferred. So it
          reads as a contents list and behaves as one.

          Removed outright below 760px rather than collapsed into a drawer. The
          design's mobile treatment routes the outline through an Outline button
          whose panel it never drew, and every remaining part of its mobile strip
          -- the progress fill, the current-section counter -- needs the observer
          this change does not add. What survives at phone width is the one honest
          piece of that strip: the section count, rendered inline above the notes.

          Not rendered at all when the split fell back to one blob: an outline of
          one unnamed section describes nothing. */}
      {count > 0 && (
        <nav
          className="um-lesson-rail"
          aria-label="Lesson outline"
          style={{
            width: RAIL_WIDTH,
            // globals.css deliberately does not apply a Preflight box-sizing
            // reset, so without this the padding is added to the 264 and the
            // rail is 308px wide.
            boxSizing: 'border-box',
            flex: 'none',
            position: 'sticky',
            top: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '20px 22px',
            borderRadius: RADIUS,
            // The rail is its own rung on the surface ladder, a shade below the
            // paper cards it sits beside, so the reading column stays the
            // brightest thing on the page.
            background: T.rail,
            boxShadow: hairline(T.hairline),
          }}
        >
          <div style={{ ...EYEBROW, color: T.muted }}>On this page</div>
          <div style={{ font: `600 13px ${FONT_BODY}`, color: T.ink }}>{sectionLabel}</div>
          <ol
            style={{
              margin: '6px 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sections.map((section, i) => (
              <li
                key={i}
                title={section.title}
                style={{
                  padding: '9px 0',
                  boxShadow: `inset 0 -1px 0 ${T.hairline}`,
                  font: `400 13px ${FONT_BODY}`,
                  lineHeight: 1.45,
                  color: T.ink2,
                }}
              >
                {/* The design's own fallback for a long heading: wrap to two
                    lines, keep the whole thing in the title. 80 of the course's
                    781 headings run past 40 characters and the longest is 59, so
                    this fires often rather than being a corner case. The
                    alternative it replaces -- authoring a short outline label on
                    every section -- was not taken.

                    The clamp is on this span rather than on the li because
                    -webkit-line-clamp needs display:-webkit-box, and setting that
                    on a list item does not survive: the used display comes back
                    flow-root and the text runs to as many lines as it likes. */}
                <span
                  className="um-clamp"
                  dangerouslySetInnerHTML={{ __html: section.heading_html }}
                />
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* TWO ELEMENTS, TWO JOBS. The band paints and fills the width left over
          beside the rail; the measure inside it caps the line length.
          
          They were one element, which is why the band could not be applied
          before: painting a background on the thing that also carries
          maxWidth: 788 produces a 788px STRIPE with page cream to its right,
          not a band. Splitting them is the whole of this change; every child
          below moved down one level and none changed order.
          
          THE BAND MUST NOT BECOME A SCROLL CONTAINER. The completion sentinel is
          observed against the viewport with no root, so if the notes scroll
          INSIDE this element the sentinel can be scrolled past without the
          viewport ever seeing it, and the gate never opens.
          
          Measured, because the precise condition matters: `overflow: hidden`
          ALONE does not do it. With no height constraint the element grows to
          fit, nothing scrolls inside, and the gate is unharmed. What breaks it is
          overflow TOGETHER WITH a height -- and that is exactly the pair the
          design's mockup carries, where this element is flex:1 inside a fixed
          1060px column with overflow:hidden. Copying it faithfully brings both.
          
          So: no overflow, no height, no contain, no transform. Fault-proved in
          scripts/verify_reading_band.mjs, which asserts the declaration as a
          cheap early guard AND that the page still scrolls at the document. */}
      <div
        className="um-lesson-column"
        style={{
          flex: 1,
          // Without this a wide table or a long equation inside a flex child
          // sets the column's floor width and pushes the rail off the page.
          minWidth: 0,
          background: T.band,
          borderRadius: RADIUS,
          padding: '22px 24px',
        }}
      >
        <div
          className="um-lesson-measure"
          style={{
            maxWidth: COLUMN_WIDTH,
            // Moved down with the flex container it belongs to: a wide table or
            // a long equation would otherwise set this element's floor width and
            // push it out past the band.
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
        {/* What is left of the design's mobile strip once everything needing an
            observer is taken out of it. Hidden above 760px, where the rail says
            the same thing. */}
        {count > 0 && (
          <div className="um-lesson-strip" style={{ ...EYEBROW, color: T.muted, display: 'none' }}>
            {sectionLabel}
          </div>
        )}

        {count > 0 ? (
          sections.map((section, i) => (
            <section key={i} className="um-prose-card" style={{ ...card, padding: '26px 28px' }}>
              <div style={{ ...EYEBROW, color: T.muted }}>
                Section {i + 1} of {count}
              </div>
              <h3
                style={{
                  margin: '10px 0 16px',
                  font: `600 20px ${FONT_HEADING}`,
                  lineHeight: 1.3,
                  color: T.ink,
                }}
                dangerouslySetInnerHTML={{ __html: section.heading_html }}
              />
              <div className="um-prose" dangerouslySetInnerHTML={{ __html: section.html }} />
            </section>
          ))
        ) : (
          <div
            className="um-prose um-prose-card"
            style={{ ...card, padding: '26px 28px' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {/* The sentinel. Sits after the LAST card, so it is only reached once all
            the notes above it have been -- the same condition as when there was
            one card, and the reason the gate is unchanged by the split. */}
        <div ref={sentinel} aria-hidden="true" style={{ height: 1 }} />

        {/* The handoff replaces Next once the sentinel has fired.

            While `done` is false this renders nothing and `next` is passed through
            untouched, so the grey disabled button, the requirement line and its
            aria-describedby all behave exactly as they did before this card
            existed. That is asserted directly in scripts/verify_lesson_handoff.mjs.

            Once done, `next` becomes null. TopicNav already treats a null next as
            nothing to go to, so it needed no change: it drops the button and keeps
            Previous, and the card below carries the single primary. */}
        {done && (
          <LessonHandoff
            href={practiceHref}
            practiceCount={practiceCount}
            practiceInteractive={practiceInteractive}
          />
        )}

        {/* Rendered only when it has something to show.

            QR.1.5 is the first topic in the course, so it has no Previous. Once
            the card takes Next away, TopicNav there would be an empty landmark on
            the very first lesson a new student opens. Measured: it is the only one
            of the 97 in that position, every other topic keeps
            "Previous / Mini quiz". Suppressing the empty case is done here rather
            than in TopicNav, which practice and quiz also use and which is
            unchanged by this PR. */}
        {(previous || (!done && next)) && (
          <TopicNav
            previous={previous}
            next={done ? null : next}
            unlocked={done}
            requirement="Read to the end of the notes to carry on."
          />
        )}
        </div>
      </div>
    </div>
  );
}
