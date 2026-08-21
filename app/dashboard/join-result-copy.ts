// What each join outcome says to the student, as a pure function.
//
// Split out of JoinResultBanner.tsx so it can be tested. The component is a
// server component returning JSX, which `node --test` cannot load; this can be
// loaded directly, and the property that matters -- that EVERY outcome, and
// anything unrecognised, produces a sentence rather than silence -- is exactly
// the kind of thing worth a check.

export type Tone = 'good' | 'warn' | 'bad';

export function messageFor(outcome: string, className: string | null): { tone: Tone; text: string } {
  const named = className ? `“${className}”` : 'your class';
  switch (outcome) {
    case 'enrolled':
      return { tone: 'good', text: `You're in. Welcome to ${named}.` };
    case 'reactivated':
      return { tone: 'good', text: `You're back in ${named}.` };
    case 'already-enrolled':
      return { tone: 'good', text: `You were already in ${named}, so nothing changed.` };
    case 'class-gone':
      return {
        tone: 'warn',
        text: 'That class is no longer taking students. Ask your teacher for a new code, then use the join box below.',
      };
    case 'own-class':
      return {
        tone: 'warn',
        text: "That was your own class code. Teachers can't enrol as students, so open your teacher dashboard to see the class instead.",
      };
    case 'expired':
      return {
        tone: 'warn',
        text: 'Your class code expired while you were signing in. You are signed in, so enter it again in the join box below.',
      };
    default:
      // 'failed', 'invalid', and anything unrecognised. Never silence.
      return {
        tone: 'bad',
        text: `You're signed in, but we couldn't add you to ${named}. Try the join box below.`,
      };
  }
}
