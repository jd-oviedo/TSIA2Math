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
// The row keeps a 44px minimum height. It is a real link in three of its four
// states; a gated row is deliberately not one, for the reason given at Tag below.
//
// Presentational and prop-driven so the probe route can render it.

// 'gated' is the fourth state and the newest. It means the topic exists and the
// viewer's plan does not reach it, which until now had no representation at all:
// the page rendered a working link to every topic regardless of plan. See the
// gate in page.tsx and issue #176.
export type RowStatus = 'complete' | 'in_progress' | 'not_started' | 'gated';

const LABEL: Record<RowStatus, string> = {
  complete: 'Complete',
  in_progress: 'In progress',
  not_started: 'Not started',
  gated: 'Not available',
};

// Theme-aware, which is the whole point of this function changing.
//
// These used to be C.green and C.sunset, from the LIGHT-ONLY curriculum palette,
// on a surface that flips to a near-black card in dark mode. All three failed
// 4.5:1 in light and two of them failed in dark; "In progress" was orange-as-text
// at 2.10:1, the role curriculum-theme.ts:30-33 retired. The measurements and the
// reason a single hex cannot fix it are recorded in dashboard-theme.ts.
function statusColor(status: RowStatus): string {
  if (status === 'complete') return V.statusComplete;
  if (status === 'in_progress') return V.statusProgress;
  // Gated rows take the muted ink rather than the disabled ink: INK_DISABLED is
  // 2.55 on cream and its own docstring says it is not for text, and a student
  // has to be able to READ that a topic is unavailable.
  //
  // V.muted, NOT the curriculum palette's INK_MUTED, and this line was wrong
  // until 2026-08-21. That constant is rgba(14,14,17,.6) from the LIGHT-ONLY
  // palette, and this row paints it on V.gatedRowBg, which is #26262B after
  // dark. Measured on the rendered pixels: 4.88:1 light, 1.18:1 dark -- near
  // black text on a near-black row, for the topic name and this label both, on
  // 96 of 97 rows, seen by exactly the free-tier and Practice Pass students the
  // gate was built for.
  //
  // It was the same defect this function was rewritten to fix, surviving in the
  // one branch still pointing at a light-only constant. V.muted is the
  // theme-aware token for this role and measures 5.81 light / 6.64 dark. No new
  // colour: the readability argument above is unchanged, only the palette it is
  // served from. verify_modules_states.mjs asserts both numbers now.
  if (status === 'gated') return V.muted;
  return V.statusIdle;
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
  const gated = status === 'gated';

  // A GATED ROW IS NOT A LINK, and this is the load-bearing half of the fix.
  //
  // Rendering an <a> and styling it to look unavailable would still ship a
  // working href: the row stays keyboard-focusable, it still appears in the tab
  // order, middle-click and "open in new tab" still reach the topic, and the
  // /course gate would then bounce the student to /dashboard/upgrade. The
  // element type is what carries the state, not the colour.
  //
  // The decision to render it is server-side, in page.tsx, from
  // resolveCourseAccess(). Nothing here decides anything; it is handed a status.
  const Tag = gated ? 'div' : 'a';

  return (
    <Tag
      className="um-topic-row"
      // Undefined rather than empty on a gated row, so no href attribute is
      // emitted at all.
      href={gated ? undefined : href}
      data-probe-topic={probeAttr}
      data-gated={gated ? 'true' : undefined}
      // Announced as unavailable rather than merely looking it.
      aria-disabled={gated ? true : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
        padding: '11px 6px',
        borderTop: first ? 'none' : `1px solid ${V.hairline}`,
        color: 'inherit',
        textDecoration: 'none',
        // #F6F2E8 in light, the theme's inset fill in dark. The pair and the
        // reason it is a pair are recorded in dashboard-theme.ts.
        background: gated ? V.gatedRowBg : undefined,
        cursor: gated ? 'default' : undefined,
      }}
    >
      {/* Status mark. Filled when complete, ringed while in progress, hairline
          when untouched, dashed when the plan does not reach it, so the state is
          legible before the label is read. */}
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: status === 'complete' ? color : 'transparent',
          boxShadow: status === 'complete' ? 'none' : `inset 0 0 0 2px ${color}`,
          opacity: gated ? 0.7 : 1,
        }}
      />

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            font: `500 14.5px ${FONT_BODY}`,
            // V.muted for the same reason as statusColor's gated branch above.
            color: gated ? V.muted : V.heading,
          }}
        >
          {topicName}
        </span>
        <span
          style={{
            font: `400 12px ui-monospace, Menlo, monospace`,
            fontVariantNumeric: 'tabular-nums',
            // V.statusIdle, not V.dim. This line renders on EVERY row, and V.dim
            // measures 3.51:1 on the light card. The token is fixed here only;
            // V.dim's other 20 call sites are a separate pass, priced in the PR.
            color: V.statusIdle,
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
    </Tag>
  );
}
