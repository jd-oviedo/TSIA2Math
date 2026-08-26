import { RADIUS, C, EYEBROW } from '../../components/curriculum-theme';
import { V } from '../../components/dashboard-theme';
import { FONT_HEADING } from '../../components/fonts';

// "Pick up where you left off", at the head of Modules.
//
// The label and the destination come from resumeStep() in app/lib/topic-parts.ts,
// the same function the topic overview uses, so the two surfaces cannot disagree
// about where "carry on" goes. This component is told the answer; it does not
// work it out.
//
// Presentational and prop-driven so the probe route can render it.

export default function ResumeCard({
  topicId,
  topicName,
  unitNumber,
  href,
  label,
}: {
  topicId: string;
  topicName: string;
  unitNumber: number;
  href: string;
  label: string;
}) {
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
        // NO CARD. The panel fill and its hairline ring are gone: this sits
        // directly on the page ground with a rule under it. See
        // curriculum-theme.ts RADIUS for why the card system came out.
        padding: '16px 0',
        borderBottom: `1px solid ${V.line}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* The shared EYEBROW, not a copy of it. This was 600 11px body font
            at 0.06em -- the same role as every other eyebrow in the product,
            drifted in BOTH family and letter-spacing from the constant that
            defines it (mono, 0.08em). No colour changed; V.dim is still the
            eyebrow ink and is still supplied here. */}
        <div style={{ ...EYEBROW, color: V.dim }}>Pick up where you left off</div>
        <div style={{ font: `600 15px ${FONT_HEADING}`, color: V.heading }}>{topicName}</div>
        <div
          style={{
            font: `400 12.5px ui-monospace, Menlo, monospace`,
            color: V.dim,
          }}
        >
          {topicId} · Unit {unitNumber}
        </div>
      </div>

      <a
        className="um-resume-action"
        href={href}
        style={{
          flex: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 44,
          padding: '11px 20px',
          borderRadius: RADIUS,
          background: C.sunset,
          // NO PRESSABLE LIP. See curriculum-theme.ts RADIUS.
          font: `600 14px ${FONT_HEADING}`,
          color: C.midnight,
          textDecoration: 'none',
        }}
      >
        {label}
      </a>
    </section>
  );
}
