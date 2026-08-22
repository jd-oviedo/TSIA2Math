import { C } from '../../components/curriculum-theme';
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
// ─── Progress is back, and the old objection is answered rather than ignored ─
//
// SUPERSEDES the 2026-08-21 removal, at Juan's direction 2026-08-22.
//
// WHAT WAS REMOVED AND WHY. This band used to carry "3 / 1,348" and "0% of the
// graded questions in the course". Both were correct. The problem was that a
// denominator of every graded QUESTION in the course produces a number that
// never visibly moves, which reads to a student as having accomplished nothing.
//
// WHY THAT REASONING DOES NOT CARRY OVER. The unit changed. The denominator is
// now TOPICS, 97 of them, so one finished topic is a full percentage point and
// the bar moves on a scale a student can see. The old 1,348-question
// denominator moved 0.07% per question. Same band, different quantity, and the
// objection was to the quantity.
//
// It also became computable. Topic completion had no agreed definition until
// definition A was settled on 2026-08-22 (curriculum-progress.ts, above
// getCompletions), so a topic counter could not have been built honestly before
// then whatever the denominator.
//
// A future teacher-assignment feature will supply a narrower denominator still;
// that is its own project and nothing about it is stubbed here.
//
// Presentational and prop-driven so the probe route can render it. No data
// access here.

export default function CourseBand({
  topicCount,
  unitCount,
  completedTopics,
}: {
  topicCount: number;
  unitCount: number;
  /** Topics complete under definition A. Derived, never a constant. */
  completedTopics: number;
}) {
  // Guarded rather than assumed: topicCount is 0 for the moment between an
  // empty read and a populated one, and a bar of width NaN renders as a full
  // bar, which would tell a student they had finished the course.
  const pct = topicCount > 0 ? Math.round((completedTopics / topicCount) * 100) : 0;
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        // NO CARD. The panel fill and its hairline ring are gone: this sits
        // directly on the page ground with a rule under it. See
        // curriculum-theme.ts RADIUS for why the card system came out.
        padding: '4px 0 18px',
        borderBottom: `1px solid ${V.line}`,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <div
          style={{ flex: 1, height: 6, background: V.trackBg, overflow: 'hidden' }}
          role="progressbar"
          aria-valuenow={completedTopics}
          aria-valuemin={0}
          aria-valuemax={topicCount}
          aria-label={`Course progress: ${completedTopics} of ${topicCount} topics complete`}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: C.sunset }} />
        </div>
        <span
          style={{
            flex: 'none',
            font: `500 12px ui-monospace, Menlo, monospace`,
            color: V.muted,
          }}
        >
          {completedTopics} / {topicCount}
        </span>
      </div>
    </section>
  );
}
