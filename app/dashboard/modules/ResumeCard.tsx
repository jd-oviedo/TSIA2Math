import { RADIUS, SHADOW_PRESSABLE, hairline, C } from '../../components/curriculum-theme';
import { V } from '../../components/dashboard-theme';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';

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
        padding: '14px 16px',
        borderRadius: RADIUS,
        background: V.cardBg,
        boxShadow: hairline(V.cardBorder),
      }}
    >
      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div
          style={{
            font: `600 11px ${FONT_BODY}`,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: V.dim,
          }}
        >
          Pick up where you left off
        </div>
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
          boxShadow: SHADOW_PRESSABLE,
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
