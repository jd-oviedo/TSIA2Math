import Link from 'next/link';
import { WS, microLabel, panelStyle, ctaStyle } from './worksheet-theme';

// What a metered teacher sees, on both surfaces that can start a worksheet.
//
// ONE COMPONENT FOR TWO PAGES, because the index and the builder are two places
// a teacher can be told the same thing and two places the copy could drift into
// disagreeing about what the number means.
//
// SHOWN FOR ONE PLAN. Teacher Core is the only capped tier (capabilities.ts
// WORKSHEET_QUOTA), so every other plan renders nothing at all rather than an
// "Unlimited" badge. The absence is the message: putting a quota word in front
// of somebody who has no quota invents a limit in their head that they did not
// have.
//
// "CREATED", NOT "USED" OR "SAVED", and the word is load-bearing. Deleting a
// worksheet does not give the credit back, because the counter meters creation
// events in a period rather than live rows. A teacher who reads "15 saved",
// deletes three, and still sees 15 has been misled by the label rather than by
// the meter. "Created this month" is exactly what the number is.
//
// NO RESET DATE, DELIBERATELY, AND THE REDESIGN DID NOT CHANGE THIS. Naming a
// date here would mean computing a month boundary in TypeScript, which is the
// second implementation of "this month" that sql/worksheet_quota.sql exists to
// prevent. The design import's board 07 reads "Your count resets on September
// 1"; that line is not here and must not arrive. "The start of next month" says
// the true thing without reimplementing the rule that decides it.
//
// PALETTE, REDONE 2026-08-25. These were on the retired navy/amber DASH tokens
// because everything around them was. They now read from worksheet-theme.ts
// like the rest of the restyled chrome. The one rule held throughout is that
// orange is never a text colour: WS.marker appears as a 3px inset rule, WS.cta
// as a button fill and a meter fill, and every word in the panel is WS.ink or
// WS.muted.
//
// CONTRAST NOTE. WS.missed #B0452F measures 4.89 on the band the meter renders
// on and 5.53 on the panel the notice renders on. It measures 4.28 on the page
// ground, so neither of these may be moved onto bare page without re-measuring.

/** The Stripe payment link route, which already handles sign-in and matching. */
const UPGRADE_HREF = '/upgrade?plan=teacher-pro-monthly';

/**
 * The running count, for a capped plan.
 *
 * `used` comes from worksheet_quota_used, the same period rule the enforcing
 * function applies, so this cannot disagree with what the server will do. The
 * bar is a second reading of that one number and never a second source for it.
 */
export function QuotaMeter({ used, cap }: { used: number; cap: number }) {
  const spent = used >= cap;
  // Clamped so a counter that has run past its cap draws a full bar rather than
  // one that overflows its track.
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      <span
        style={{
          ...microLabel,
          letterSpacing: '0.08em',
          color: spent ? WS.missed : WS.muted,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {used} / {cap} this month
      </span>
      <div
        style={{ width: 136, maxWidth: '100%', height: 3, background: WS.track }}
        role="img"
        aria-label={`${used} of ${cap} worksheets created this month`}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: spent ? WS.missed : WS.trackFill }} />
      </div>
    </div>
  );
}

/**
 * The cap-reached panel.
 *
 * Reads as "here is more room on Pro", not "you have run out". The teacher has
 * not done anything wrong: they used a feature they paid for, as much as the
 * plan includes. So the panel leads with what Core includes, states the reset
 * plainly, and offers Pro as the next size up rather than as a rescue.
 *
 * TEACHER PRO, NOT "PRO PLUS". The board names a Teacher Pro Plus tier with
 * version C and D and class specific difficulty. No such tier exists, so the
 * copy and the link both stay pointed at the plan a teacher can actually buy.
 */
export function QuotaCapNotice({ cap }: { cap: number }) {
  return (
    <div
      style={{
        ...panelStyle,
        boxShadow: `inset 3px 0 0 ${WS.marker}`,
        padding: '24px 26px',
        marginBottom: 18,
      }}
      role="status"
    >
      <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, color: WS.ink, letterSpacing: '-0.01em' }}>
        You have used all {cap} worksheets this month
      </h2>
      <p style={{ margin: '9px 0 0', fontSize: 13.5, color: WS.muted, lineHeight: 1.6, maxWidth: 560 }}>
        Teacher Core includes {cap} a month, and your next {cap} arrive at the start
        of next month. Everything you have already built stays available to open,
        print and reprint as often as you like, and a reprint never counts against
        the cap.
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 13.5, color: WS.muted, lineHeight: 1.6, maxWidth: 560 }}>
        Teacher Pro includes unlimited worksheets and class data exports.
      </p>
      <Link
        href={UPGRADE_HREF}
        className="ws-cta ws-tap"
        style={{
          ...ctaStyle,
          display: 'inline-block',
          marginTop: 16,
          padding: '12px 22px',
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        See Teacher Pro
      </Link>
    </div>
  );
}
