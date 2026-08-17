import { C } from '../../components/curriculum-theme';
import { V } from '../../components/dashboard-theme';
import { FONT_BODY } from '../../components/fonts';

// One topic inside a unit.
//
// WHY THIS IS A ROW AND NOT A CARD
// --------------------------------
// Every topic used to be a rounded panel with its own ring, which gave 97 items
// of very different states the same visual weight and made a unit read as a pile
// rather than a sequence. Rows separated by a hairline carry the same
// information at a fraction of the ink, and the state that matters -- where the
// student is -- is the only thing allowed to be loud.
//
// The row keeps a real link with a 44px minimum height, so the change is
// entirely presentational: nothing about what is clickable moves.
//
// Presentational and prop-driven so the probe route can render it.

export type RowStatus = 'complete' | 'in_progress' | 'not_started';

const LABEL: Record<RowStatus, string> = {
  complete: 'Complete',
  in_progress: 'In progress',
  not_started: 'Not started',
};

function statusColor(status: RowStatus): string {
  if (status === 'complete') return C.green;
  if (status === 'in_progress') return C.sunset;
  return V.dim;
}

export default function TopicListRow({
  topicId,
  topicName,
  href,
  status,
  estimatedMinutes,
  correct,
  total,
  first,
  probeAttr,
}: {
  topicId: string;
  topicName: string;
  href: string;
  status: RowStatus;
  estimatedMinutes: number | null;
  correct: number;
  total: number;
  // The first row in a unit carries no top rule, so the hairlines read as
  // separators between rows rather than as a box around the list.
  first: boolean;
  // Only set by the probe route, so the browser check can address rows without
  // depending on copy. Undefined in the real page.
  probeAttr?: string;
}) {
  const color = statusColor(status);

  return (
    <a
      className="um-topic-row"
      href={href}
      data-probe-topic={probeAttr}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        padding: '11px 6px',
        borderTop: first ? 'none' : `1px solid ${V.hairline}`,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      {/* Status mark. Filled when complete, ringed while in progress, hairline
          when untouched, so the state is legible before the label is read. */}
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: status === 'complete' ? color : 'transparent',
          boxShadow: status === 'complete' ? 'none' : `inset 0 0 0 2px ${color}`,
        }}
      />

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: `500 14.5px ${FONT_BODY}`, color: V.heading }}>{topicName}</span>
        <span
          style={{
            font: `400 12px ui-monospace, Menlo, monospace`,
            fontVariantNumeric: 'tabular-nums',
            color: V.dim,
          }}
        >
          {topicId}
          {estimatedMinutes ? ` · ${estimatedMinutes} min` : ''}
          {total > 0 ? ` · ${correct}/${total}` : ''}
        </span>
      </span>

      <span
        style={{
          flex: 'none',
          font: `500 12px ${FONT_BODY}`,
          color,
        }}
      >
        {LABEL[status]}
      </span>
    </a>
  );
}
