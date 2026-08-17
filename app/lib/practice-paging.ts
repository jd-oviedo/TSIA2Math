// Moving between practice problems, one at a time.
//
// The movement itself is trivial. What is not trivial, and what this exists to
// make testable, is that turning the page has to RELEASE THE GUMU GATE for the
// problem being left behind.
//
// Why: GumuChat reports its session up through onSessionChange, and the provider
// counts open sessions by key. It calls onSessionChange(false) only on explicit
// endings -- the session finishing, or the answer being revealed -- and has no
// unmount cleanup. Paging unmounts it. So a student who opens GUMU on problem 3
// and moves to problem 4 leaves the gate held forever: `solutionsPaused` stays
// true for the rest of the page load and every worked-solution link stays struck
// through, with nothing on screen left to close.
//
// PracticeQuiz.retry() already guards the same failure for its own trigger, and
// says so in a comment. Paging needs the same guard.
//
// The gate is released for the item being LEFT, not the one being arrived at.
// Getting that backwards is the obvious slip, it leaves the original session
// counted, and it looks identical in every screenshot -- which is why the
// decision is a pure function with a test rather than a line inside a handler.
//
// Imports nothing, same reason as attempt-sets.ts.

export type PageTurn = {
  /** The index actually landed on, clamped to the available items. */
  index: number;
  /**
   * The gate key to release, or null when the turn is a no-op. Shaped exactly
   * as PracticeQuiz builds it for GumuChat: `${section}-${itemNumber}`.
   */
  releaseKey: string | null;
};

export function pageTurn(
  itemNumbers: number[],
  from: number,
  to: number,
  section: 'practice' | 'mini_quiz'
): PageTurn {
  // Out of range is a no-op rather than a clamp-and-release. Nothing was left,
  // so nothing should be released: releasing here would drop a live session for
  // a student who pressed Next on the last problem.
  if (to < 0 || to >= itemNumbers.length || from === to) {
    return { index: from, releaseKey: null };
  }

  const leaving = itemNumbers[from];
  return {
    index: to,
    releaseKey: leaving === undefined ? null : `${section}-${leaving}`,
  };
}

export type SegmentState = 'current' | 'correct' | 'missed' | 'untouched';

// What one segment of the progress strip is showing.
//
// `current` wins over everything else, per the design: the segment for the
// problem in view is the tall orange one whatever its answer state, because the
// card below is already saying how that one went.
//
// `solvedBefore` seeds correctness from earlier visits. It carries only items
// answered CORRECTLY before -- gates.practiceSolved is a set of solved item
// numbers and there is no equivalent for items previously missed, so a problem
// got wrong last week reads as untouched rather than as missed. Deliberate: the
// alternative needs a new field on GateState, and a strip that under-reports is
// better than one that invents a state it cannot know.
export function segmentState(
  itemNumber: number,
  current: number,
  index: number,
  answered: { correct: boolean } | undefined,
  solvedBefore: ReadonlySet<number>
): SegmentState {
  if (index === current) return 'current';
  if (answered) return answered.correct ? 'correct' : 'missed';
  if (solvedBefore.has(itemNumber)) return 'correct';
  return 'untouched';
}
