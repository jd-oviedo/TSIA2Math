'use client';

import { useState } from 'react';
import PracticeQuiz, { type PublicPracticeItem } from './PracticeQuiz';
import TopicNav from './TopicNav';
import type { NavStep } from './topic-data';

// Wraps a practice or mini quiz section together with its Previous/Next
// footer, so the gate opens the moment the student clears the threshold rather
// than on the next page load.
//
// The server-rendered count is the floor: it carries what they had already
// cleared on an earlier visit. Live answers only ever push it up, matching the
// server rule that mastery counts up and never down.

export default function GatedQuiz({
  courseId,
  topicId,
  section,
  items,
  heading,
  blurb,
  solutions,
  initialCorrect,
  required,
  previous,
  next,
}: {
  courseId: string;
  topicId: string;
  section: 'practice' | 'mini_quiz';
  items: PublicPracticeItem[];
  heading: string;
  blurb: string;
  solutions?: Record<number, string>;
  initialCorrect: number;
  required: number;
  previous: NavStep;
  next: NavStep;
}) {
  const [liveCorrect, setLiveCorrect] = useState(0);
  const correct = Math.max(initialCorrect, liveCorrect);
  const unlocked = correct >= required;
  const remaining = Math.max(0, required - correct);

  return (
    <>
      <section>
        <PracticeQuiz
          courseId={courseId}
          topicId={topicId}
          section={section}
          items={items}
          heading={heading}
          blurb={blurb}
          solutions={solutions}
          onMasteredCountChange={setLiveCorrect}
        />
      </section>

      <TopicNav
        previous={previous}
        next={next}
        unlocked={unlocked}
        requirement={
          remaining === 1
            ? `Get 1 more right to carry on. You need ${required} of ${items.length}, and you have ${correct}.`
            : `Get ${remaining} more right to carry on. You need ${required} of ${items.length}, and you have ${correct}.`
        }
      />
    </>
  );
}
