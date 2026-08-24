'use client';

import { DASH } from '../../components/dashboard-theme';
import { FONT_BODY, FONT_HEADING } from '../../components/fonts';

// The pieces every Build 3 surface renders a grade with.
//
// ONE COMPONENT PER IDEA, SHARED BY ALL THREE PAGES, because the roster, the
// grid and the gradebook must not merely agree about a student's letter -- they
// must agree about how a letter LOOKS, and in particular about what a withheld
// one looks like. Three hand-rolled dashes is three chances for one of them to
// render a 0 or an F instead.
//
// ON DASH TOKENS, not new hexes. app/teacher/student/[id]/page.tsx is 375 lines
// of hardcoded colour and the way to stop that spreading is to not add to it --
// the same argument OfficialScorePanel and CurriculumProgressPanel already make.

/** The wire shape of LetterResult. Both arms; the caller must handle both. */
export type SerializedLetter =
  | { kind: 'letter'; letter: string; percent: number; graded_topics: number; graded_items: number }
  | {
      kind: 'withheld';
      reason: string;
      display: string;
      subtitle: string;
      graded_topics: number;
      graded_items: number;
    };

export type Score = { correct: number; total: number } | null;

/**
 * Letter colour. Deliberately NOT a red-to-green ramp.
 *
 * A and B read as the "on track" token the whole dashboard already uses for
 * complete; C and D as the in-progress amber; F as the warning colour. That is
 * three colours for five letters, because the thing a teacher needs at a glance
 * is which students need attention, not a rainbow rank.
 */
function letterTone(letter: string): { fg: string; bg: string } {
  if (letter === 'A' || letter === 'B') return { fg: DASH.statusComplete, bg: DASH.noticeOkBg };
  if (letter === 'C' || letter === 'D') return { fg: DASH.statusProgress, bg: DASH.noticeWarnBg };
  return { fg: '#9A2A2A', bg: '#FCEBEB' };
}

/**
 * A student's overall grade.
 *
 * THE WITHHELD STATE IS NOT AN ERROR STATE AND MUST NOT LOOK LIKE ONE. It is
 * the common case -- six students in the whole product have ever taken a quiz --
 * so it renders as a calm dash with the honest count beneath it, in the same
 * chip geometry as a real letter. A greyed-out box or an exclamation mark would
 * tell a teacher something is broken when what is actually true is "not yet".
 *
 * `subtitle` is always rendered when present, because "—" alone is exactly the
 * ambiguity this build exists to remove: it does not distinguish "no graded work
 * yet" from "failed to load".
 */
export function LetterChip({
  letter,
  size = 'md',
  showSubtitle = true,
}: {
  letter: SerializedLetter;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}) {
  const dims =
    size === 'lg'
      ? { box: 46, font: 24, sub: 11.5 }
      : size === 'sm'
        ? { box: 28, font: 14, sub: 10.5 }
        : { box: 36, font: 18, sub: 11 };

  const withheld = letter.kind === 'withheld';
  const tone = withheld ? { fg: DASH.dim, bg: DASH.chipBg } : letterTone(letter.letter);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: dims.box,
          height: dims.box,
          padding: '0 8px',
          borderRadius: 9,
          background: tone.bg,
          color: tone.fg,
          font: `700 ${dims.font}px ${FONT_HEADING}`,
          lineHeight: 1,
        }}
      >
        {withheld ? letter.display : letter.letter}
      </span>
      <span className="um-visually-hidden">
        {withheld ? `No grade yet. ${letter.subtitle}.` : `Grade ${letter.letter}, ${letter.percent} percent.`}
      </span>
      {showSubtitle && (
        <span style={{ font: `400 ${dims.sub}px ${FONT_BODY}`, color: DASH.dim, whiteSpace: 'nowrap' }}>
          {withheld ? letter.subtitle : `${letter.percent}%`}
        </span>
      )}
    </div>
  );
}

/**
 * ONE topic's quiz score, in BOTH definitions, each labelled.
 *
 * THE DISAGREEMENT IS THE PRODUCT, NOT A DEFECT TO HIDE. Latest-attempt is what
 * the student sees on their own Grades page; mastery is what the completion
 * gates enforce. For vics8388 on GR.4.3 they read 1/3 and 2/4, and a teacher who
 * saw only one of them would be confidently wrong in a conversation with either
 * the student or the syllabus.
 *
 * RENDERED AS FRACTIONS, NEVER AS BARE PERCENTAGES, because the two definitions
 * do not share a denominator: 1/3 and 2/4 are 33% and 50%, and two percentages
 * side by side invite a comparison that the denominators do not support.
 *
 * A null score is a section never attempted. It renders as a dash -- ABSENT IS
 * NOT ZERO, the rule this whole build turns on.
 */
export function ScorePair({ latest, mastery, compact = false }: { latest: Score; mastery: Score; compact?: boolean }) {
  if (!latest && !mastery) {
    return <span style={{ font: `400 12.5px ${FONT_BODY}`, color: DASH.dim }}>—</span>;
  }

  const row = (label: string, s: Score, strong: boolean) => (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ font: `600 9.5px ${FONT_BODY}`, letterSpacing: 0.5, textTransform: 'uppercase', color: DASH.dim }}>
        {label}
      </span>
      <span
        style={{
          font: `${strong ? 700 : 600} ${compact ? 12.5 : 13.5}px ${FONT_HEADING}`,
          color: s ? DASH.heading : DASH.dim,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {s ? `${s.correct}/${s.total}` : '—'}
      </span>
    </span>
  );

  return (
    <span style={{ display: 'inline-flex', flexDirection: compact ? 'column' : 'row', gap: compact ? 2 : 12, alignItems: compact ? 'flex-start' : 'baseline' }}>
      {/* Mastery first: it is the definition the letter commits to, so it is
          the one a teacher's eye should land on. Latest is the reconciliation
          with what the student is looking at. */}
      {row('Mastery', mastery, true)}
      {row('Latest', latest, false)}
    </span>
  );
}

/**
 * The OTHER axis. Lesson + practice + quiz, out of three.
 *
 * PRACTICE COUNTS HERE AND DOES NOT COUNT TOWARD THE GRADE, deliberately, and
 * the two are rendered side by side on purpose so the difference is visible
 * rather than merely documented: a student can read 2/3 complete on a topic that
 * contributes nothing to their letter, because they worked the practice and
 * never opened the quiz. See the two-axis note in app/lib/grades.ts.
 *
 * Null is an untouched topic and renders "—", never "0/3": a nought is a claim
 * about work attempted, and there was none.
 */
export function CompletionPill({ completion }: { completion: { done: number; total: number } | null }) {
  if (!completion) {
    return (
      <span style={{ font: `400 12px ${FONT_BODY}`, color: DASH.dim }} title="Not started">
        —
      </span>
    );
  }
  const full = completion.done >= completion.total;
  return (
    <span
      title={`${completion.done} of ${completion.total} sections: lesson, practice, quiz`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        font: `600 11.5px ${FONT_BODY}`,
        color: full ? DASH.statusComplete : DASH.statusProgress,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          width: 34,
          height: 5,
          borderRadius: 3,
          background: DASH.trackBg,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            width: `${(completion.done / completion.total) * 100}%`,
            background: full ? DASH.statusComplete : DASH.statusProgress,
          }}
        />
      </span>
      {completion.done}/{completion.total}
    </span>
  );
}

/** Practice, shown as context. Never a grade, and labelled so. */
export function PracticeContext({ latest, mastery }: { latest: Score; mastery: Score }) {
  const s = mastery ?? latest;
  if (!s) return <span style={{ font: `400 12px ${FONT_BODY}`, color: DASH.dim }}>—</span>;
  return (
    <span style={{ font: `400 12.5px ${FONT_BODY}`, color: DASH.muted, whiteSpace: 'nowrap' }}>
      {s.correct}/{s.total} practice
    </span>
  );
}
