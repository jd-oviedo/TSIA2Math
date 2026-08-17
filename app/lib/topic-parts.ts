// Turns one topic's gate state into the three rows the overview renders, and
// the single action that carries on from wherever the student stopped.
//
// Pure, and imports nothing, so `node --test` can load it without the admin
// Supabase client. Same reason as attempt-sets.ts and lesson-sections.ts.
//
// TWO THINGS THIS DELIBERATELY DOES NOT DO
// ----------------------------------------
// 1. No locked state. Nothing in the topic tree gates a route: lesson, practice
//    and quiz each read their own section's threshold and none checks a prior
//    part, so every part is reachable at any time. What is gated is the Next
//    control at the foot of each part. `requirement` says what that control
//    needs; it never claims a part is shut.
//
// 2. Resume is part-level only. `lessonDone` is a single timestamp and the
//    lesson page watches one sentinel at the very end of the notes, so "you
//    stopped in section 3" is not derivable from anything stored today and is
//    not guessed at here. A lesson is either read to the end or it is not.

export type PartStatus = 'complete' | 'in_progress' | 'not_started' | 'ungated';

export type PartInput = {
  lessonDone: boolean;
  practiceGated: boolean;
  practiceCount: number;
  practiceCorrect: number;
  practiceRequired: number;
  quizGated: boolean;
  quizCount: number;
  quizCorrect: number;
  quizRequired: number;
  sectionCount: number;
};

export type Part = {
  kind: 'lesson' | 'practice' | 'quiz';
  title: string;
  detail: string;
  status: PartStatus;
  requirement?: string;
};

export type TopicPlan = {
  parts: Part[];
  // Which part the primary action points at, and what to call it.
  resume: { kind: 'lesson' | 'practice' | 'quiz'; label: string };
};

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// A gradable section's state. `gated` false means the section has nothing that
// can be graded at all, which is QR.1.1's written practice: 12 items, no
// PracticeQuiz, so no attempt row can ever exist for them. sectionShape already
// resolves that case to gradable 0 and the page skips the gate; this mirrors
// that rather than showing a student a bar they cannot move.
function sectionStatus(gated: boolean, correct: number, required: number): PartStatus {
  if (!gated) return 'ungated';
  if (correct >= required) return 'complete';
  if (correct > 0) return 'in_progress';
  return 'not_started';
}

function requirementLine(
  status: PartStatus,
  correct: number,
  required: number,
  count: number,
  noun: string
): string | undefined {
  if (status === 'complete' || status === 'ungated') return undefined;
  return `Get ${required} of ${plural(count, noun, `${noun}s`)} right to open the next part. You have ${correct}.`;
}

export function topicPlan(input: PartInput): TopicPlan {
  const practiceStatus = sectionStatus(
    input.practiceGated,
    input.practiceCorrect,
    input.practiceRequired
  );
  const quizStatus = sectionStatus(input.quizGated, input.quizCorrect, input.quizRequired);

  const parts: Part[] = [
    {
      kind: 'lesson',
      title: 'Guided notes',
      detail: input.sectionCount
        ? `${plural(input.sectionCount, 'section', 'sections')} to read`
        : 'The notes for this topic',
      // Binary by construction, see the note at the top of this file.
      status: input.lessonDone ? 'complete' : 'not_started',
      requirement: input.lessonDone ? undefined : 'Read to the end to open the next part.',
    },
    {
      kind: 'practice',
      title: 'Practice',
      detail:
        practiceStatus === 'ungated'
          ? 'Written work, nothing to submit'
          : `${plural(input.practiceCount, 'problem', 'problems')}, work at your own pace`,
      status: practiceStatus,
      requirement: requirementLine(
        practiceStatus,
        input.practiceCorrect,
        input.practiceRequired,
        input.practiceCount,
        'problem'
      ),
    },
    {
      kind: 'quiz',
      title: 'Mini quiz',
      detail:
        quizStatus === 'ungated'
          ? 'Written work, nothing to submit'
          : `${plural(input.quizCount, 'question', 'questions')}, closes out the topic`,
      status: quizStatus,
      requirement: requirementLine(
        quizStatus,
        input.quizCorrect,
        input.quizRequired,
        input.quizCount,
        'question'
      ),
    },
  ];

  return { parts, resume: resumeStep(input) };
}

// Which part a student carries on from, and what to call the button.
//
// Exported on its own because the Modules page needs the same answer for the
// topic a student was last working on, and it holds gate state without needing
// the three rows the overview renders. Sharing this rather than restating the
// rule is the point: two surfaces disagreeing about where "carry on" goes is
// exactly the kind of drift that is invisible until a student hits it.
//
// Takes the same input as topicPlan but ignores sectionCount, which only ever
// affected a row's wording.
export function resumeStep(input: Omit<PartInput, 'sectionCount'>): TopicPlan['resume'] {
  const practiceStatus = sectionStatus(
    input.practiceGated,
    input.practiceCorrect,
    input.practiceRequired
  );
  const quizStatus = sectionStatus(input.quizGated, input.quizCorrect, input.quizRequired);

  // An ungated section counts as finished here: there is nothing in it a
  // student could complete, and stopping there would strand them.
  const done = (s: PartStatus) => s === 'complete' || s === 'ungated';

  if (!input.lessonDone) return { kind: 'lesson', label: 'Start the guided notes' };
  if (!done(practiceStatus)) {
    return {
      kind: 'practice',
      label: practiceStatus === 'in_progress' ? 'Carry on with practice' : 'Start practice',
    };
  }
  if (!done(quizStatus)) {
    return {
      kind: 'quiz',
      label: quizStatus === 'in_progress' ? 'Carry on with the quiz' : 'Start the mini quiz',
    };
  }
  return { kind: 'lesson', label: 'Read the notes again' };
}
