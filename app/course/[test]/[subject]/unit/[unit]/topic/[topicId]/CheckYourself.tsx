import { EYEBROW } from '@/app/components/curriculum-theme';
import { T } from '@/app/components/curriculum-surface';
import { FONT_BODY } from '@/app/components/fonts';

// The CHECK YOURSELF callout.
//
// ─── NOTHING RENDERS THIS, AND THAT IS THE POINT ─────────────────────────────
//
// The construct does not exist in the authored curriculum. Grepped across all 97
// source files in curriculum/source/tsia2-math: zero occurrences, in any casing.
// It is the design import's own sample content, invented to show what a callout
// would look like rather than drawn from a topic anyone wrote.
//
// So this ships as a component with no call site, deliberately, on Juan's
// instruction 2026-08-22: build the token and the component, apply it to
// nothing, and do NOT invent content to fill it. Inventing a "check yourself"
// block for a topic would put words in front of students that no author wrote
// and no reviewer read.
//
// The nearest real construct is a prose blockquote, used by two topics out of
// 97, which was considered and rejected as too rare to be a system.
//
// THE CONTENT GAP IS TRACKED SEPARATELY, as an authoring finding rather than a
// styling one: the pipeline has never had a way to author this, which is worth
// knowing while the remaining curriculum is still being written. See the issue
// opened against curriculum authoring. It is not a defect in this PR.
//
// WHEN A TOPIC FINALLY AUTHORS ONE, this is what it renders as, and
// C.quietBox finally gets the consumer it was named for in 2026-08-17 and
// left unused.

export default function CheckYourself({ children }: { children: React.ReactNode }) {
  return (
    <aside
      // A step darker than the paper the worked example sits on. The two blocks
      // are separated by SURFACE rather than by border: a worked example is the
      // brightest thing in the column because it is what is being studied, and
      // this is quieter because it is an aside.
      style={{
        background: T.quietBox,
        border: `1px solid ${T.hairline}`,
        borderRadius: 0,
        padding: '14px 18px 16px',
      }}
    >
      <div style={{ ...EYEBROW, color: T.muted, marginBottom: 8 }}>Check yourself</div>
      <div
        className="um-prose"
        style={{ color: T.ink2, font: `400 15px ${FONT_BODY}`, lineHeight: 1.7 }}
      >
        {children}
      </div>
    </aside>
  );
}
