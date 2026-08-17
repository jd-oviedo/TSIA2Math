import { RADIUS, hairline } from '../../components/curriculum-theme';
import { C } from '../../components/curriculum-theme';
import { V } from '../../components/dashboard-theme';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

// The course band at the head of Modules: how big the course is, and how far
// this student has got through it.
//
// Every number here is read from the database at render time, not written down.
// The course is 97 topics and 1,348 gradable questions today, and both come from
// getTopics()/gradableTotal rather than a constant, so a topic added or an item
// re-authored moves this without a code change. Nothing from the design mockup,
// which invented its own counts.
//
// Presentational and prop-driven so the probe route can render it. No data
// access here.

export default function CourseBand({
  topicCount,
  unitCount,
  done,
  total,
}: {
  topicCount: number;
  unitCount: number;
  // Questions answered correctly, and gradable questions in the course.
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
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
        <span style={{ flex: 1 }} />
        {/* Tabular figures so the count does not shuffle as it climbs, and so it
            reads as data rather than as body copy. */}
        <span
          style={{
            font: `600 13px ${FONT_BODY}`,
            fontVariantNumeric: 'tabular-nums',
            color: V.heading,
          }}
        >
          {done} / {total}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct} percent of the course complete`}
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: V.trackBg,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: C.sunset }} />
      </div>

      <div style={{ font: `400 12.5px ${FONT_BODY}`, color: V.dim }}>
        {total > 0
          ? `${pct}% of the graded questions in the course`
          : 'No graded questions in the course yet'}
      </div>
    </section>
  );
}
