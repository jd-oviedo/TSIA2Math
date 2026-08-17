'use client';

import { useEffect, useRef, useState } from 'react';
import TopicNav from './TopicNav';
import LessonHandoff from './LessonHandoff';
import { C, ink, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import type { NavStep } from './topic-data';

// Guided notes, plus the scroll-to-bottom gate.
//
// Completion is detected with an IntersectionObserver on a sentinel at the end
// of the content, not by comparing scrollTop against scrollHeight. The sentinel
// fires however the student got there -- wheel, Page Down, End, a screen reader
// moving focus, or a short page that never scrolls at all -- where scroll maths
// only ever recognises one of those and would strand everyone else.

export default function LessonBody({
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

  return (
    <>
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div
          className="um-prose um-prose-card"
          style={{
            background: C.paper,
            border: `1px solid ${ink(0.09)}`,
            borderRadius: '16px',
            padding: '26px 28px',
            boxShadow: '0 1px 3px rgba(14,14,17,.05)',
            color: ink(0.82),
            font: `400 16px ${FONT_BODY}`,
            lineHeight: MATH_LINE_HEIGHT,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {/* The sentinel. Sits after the card so it is only reached once the
            notes above it have been. */}
        <div ref={sentinel} aria-hidden="true" style={{ height: 1 }} />
      </section>

      {/* The handoff replaces Next once the sentinel has fired.
          
          While `done` is false this renders nothing and `next` is passed through
          untouched, so the grey disabled button, the requirement line and its
          aria-describedby all behave exactly as they did before this card
          existed. That is the regression risk in this change and it is asserted
          directly in scripts/verify_lesson_handoff.mjs.
          
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
    </>
  );
}
