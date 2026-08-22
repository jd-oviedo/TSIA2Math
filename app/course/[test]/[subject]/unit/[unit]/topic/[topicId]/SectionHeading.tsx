import { T } from '@/app/components/curriculum-surface';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// The heading each topic sub-page opens with. Extracted from the old
// single-page layout, where all three sections shared it.

export default function SectionHeading({
  title,
  blurb,
  chip,
}: {
  title: string;
  blurb: string;
  chip?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
      <h2 style={{ margin: 0, font: `600 19px ${FONT_HEADING}`, color: T.ink }}>{title}</h2>
      {chip && (
        <span
          style={{
            padding: '5px 11px',
            borderRadius: '20px',
            background: T.insetRow,
            font: `500 11.5px ${FONT_BODY}`,
            color: T.ink2,
          }}
        >
          {chip}
        </span>
      )}
      <span style={{ font: `400 13px ${FONT_BODY}`, color: T.muted }}>{blurb}</span>
    </div>
  );
}
