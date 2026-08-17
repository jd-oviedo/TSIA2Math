import { C, INK_MUTED } from '@/app/components/curriculum-theme';
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
      <h2 style={{ margin: 0, font: `600 19px ${FONT_HEADING}`, color: C.midnight }}>{title}</h2>
      {chip && (
        <span
          style={{
            padding: '5px 11px',
            borderRadius: '20px',
            background: '#DFE9F2',
            font: `500 11.5px ${FONT_BODY}`,
            color: '#3F6B94',
          }}
        >
          {chip}
        </span>
      )}
      <span style={{ font: `400 13px ${FONT_BODY}`, color: INK_MUTED }}>{blurb}</span>
    </div>
  );
}
