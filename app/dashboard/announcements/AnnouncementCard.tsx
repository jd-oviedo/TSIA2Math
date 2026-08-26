import { Card, CardTitle, SPACING, formatDate } from '../ui';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import type { Announcement } from '../data';

// One posted announcement, as a panel.
//
// WAS THE SHELL'S LAST HAND-ROLLED CARD, inline in page.tsx: a radius of 16
// against the Card primitive's 12, and a boxShadow written as the literal
// '0 1px 3px rgba(14,14,17,.05)'. That literal is the whole reason this file
// exists. It was tuned against a white card and did not move when the theme
// did, so in dark it painted a 5%-alpha near-black onto a #202024 panel -- a
// shadow that computes as present and reads as nothing. The same light-only
// literal defect #207 and #212 were clearing, and the last one on a panel
// surface in app/dashboard.
//
// Both are Card's now, and both moved again on 2026-08-26 when the shell went
// flat: the radius is 0 and there is no shadow at all, with a panelEdge
// hairline carrying the separation the shadow used to. This file did not have
// to change for that, which is the point -- it sets no background, no border,
// no radius and no shadow of its own, so it followed the primitive without
// being touched. This component styles CONTENT and the panel styles the panel.
//
// The paragraph above is kept as written because it is the record of what was
// wrong, not a description of the current values.
//
// IT IS A SEPARATE FILE SO THE VERIFIER CAN MOUNT THE REAL THING. The page is
// an async server component that calls getProfile() and reads Supabase, so it
// cannot be mounted in the DB-free lane; a verifier that hand-copied this
// markup into the lane would prove only that the markup can be typed twice.
// Prop-driven and DB-free, it mounts for real at app/um-verify/shell and
// scripts/verify_announcements_card.mjs measures the box it actually ships.
//
// `as="article"` IS LOAD-BEARING. Each post is a self-contained item and screen
// readers navigate <article> as a discrete one; a <section> with no accessible
// name exposes no role at all. Card defaults to <section> and this is the one
// caller that asks for otherwise. Home's compact announcement items
// (app/dashboard/page.tsx:278) are <article> for the same reason.
export default function AnnouncementCard({
  item,
  classLabel,
}: {
  item: Announcement;
  /** The enrolled class this was posted to, already resolved. Null hides the chip. */
  classLabel?: string | null;
}) {
  return (
    <Card as="article">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Was 600 17px inline -- the one 17 in a shell whose every other panel
            title is 16. */}
        <CardTitle>{item.title}</CardTitle>
        <span style={{ font: `400 12.5px ${FONT_BODY}`, color: V.dim }}>
          {formatDate(item.created_at)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.BLOCK }}>
        {classLabel && (
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '3px 10px',
              borderRadius: 999,
              background: V.subtleBg,
              font: `500 11.5px ${FONT_BODY}`,
              color: V.muted,
            }}
          >
            {classLabel}
          </span>
        )}

        {/* Plain text, rendered as text. Teacher-authored copy is not run
            through the markdown pipeline, so nothing here can inject markup
            into another student's page. */}
        <p
          style={{
            margin: 0,
            font: `400 14.5px ${FONT_BODY}`,
            lineHeight: 1.7,
            color: V.ink,
            whiteSpace: 'pre-wrap',
          }}
        >
          {item.body}
        </p>
      </div>
    </Card>
  );
}
