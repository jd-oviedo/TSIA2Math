import { RADIUS, hairline } from '../../components/curriculum-theme';
import { V } from '../../components/dashboard-theme';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

// The course band at the head of Modules: what the course is, and how big it is.
//
// Both numbers are read from the database at render time, not written down: they
// come from getTopics() rather than a constant, so a topic added or a placeholder
// authored moves them without a code change. The count is the VISIBLE one, 97
// today against 100 rows, and it will climb as unit 1's three unwritten topics
// land. Nothing from the design mockup, which invented its own counts.
//
// ─── There is deliberately no progress here ──────────────────────────────────
//
// This band used to carry "3 / 1,348" and "0% of the graded questions in the
// course". Both were correct -- one denominator, one numerator, and 0% was honest
// rounding of 3/1348 rather than a second disagreeing calculation. That was the
// problem: a denominator of the entire course produces a number that never
// visibly moves, which reads to a student as having accomplished nothing.
//
// Removed 2026-08-21 at Juan's direction, with nothing put in its place and the
// space not repurposed. The per-unit bars stay, because those move. A future
// teacher-assignment feature will supply a real denominator; that is its own
// project and nothing about it is stubbed here.
//
// Presentational and prop-driven so the probe route can render it. No data
// access here.

export default function CourseBand({
  topicCount,
  unitCount,
}: {
  topicCount: number;
  unitCount: number;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '14px 16px',
        borderRadius: RADIUS,
        background: V.cardBg,
        boxShadow: hairline(V.cardBorder),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, font: `600 16px ${FONT_HEADING}`, color: V.heading }}>
          TSIA2 Math
        </h2>
        <span style={{ font: `400 13px ${FONT_BODY}`, color: V.muted }}>
          {unitCount} units, {topicCount} topics
        </span>
      </div>
    </section>
  );
}
