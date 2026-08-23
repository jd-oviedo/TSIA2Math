import Link from 'next/link';
import { DASH, cardStyle } from '../../components/dashboard-theme';

// What a metered teacher sees, on both surfaces that can start a worksheet.
//
// ONE COMPONENT FOR TWO PAGES, because the index and the builder are two places
// a teacher can be told the same thing and two places the copy could drift into
// disagreeing about what the number means.
//
// SHOWN FOR ONE PLAN. Teacher Core is the only capped tier, so every other plan
// renders nothing at all rather than an "Unlimited" badge. The absence is the
// message: putting a quota word in front of somebody who has no quota invents a
// limit in their head that they did not have.
//
// "CREATED", NOT "USED" OR "SAVED", and the word is load-bearing. Deleting a
// worksheet does not give the credit back, because the counter meters creation
// events in a period rather than live rows. A teacher who reads "15 saved",
// deletes three, and still sees 15 has been misled by the label rather than by
// the meter. "Created this month" is exactly what the number is.
//
// NO RESET DATE, DELIBERATELY. Naming a date here would mean computing a month
// boundary in TypeScript, which is the second implementation of "this month"
// that sql/worksheet_quota.sql exists to prevent. "The start of next month" says
// the true thing without reimplementing the rule that decides it.
//
// PALETTE. The teacher dashboard is on the retired navy/amber tokens, so these
// use DASH like everything around them rather than being the only
// current-palette elements on a legacy page. The one rule held regardless is
// that orange is never a text colour: DASH.noticeWarn appears as a border rule,
// and every word in the panel is DASH.ink or DASH.muted.

/** The Stripe payment link route, which already handles sign-in and matching. */
const UPGRADE_HREF = '/upgrade?plan=teacher-pro-monthly';

/**
 * The running count, for a capped plan.
 *
 * `used` comes from worksheet_quota_used, the same period rule the enforcing
 * function applies, so this cannot disagree with what the server will do.
 */
export function QuotaMeter({ used, cap }: { used: number; cap: number }) {
  const spent = used >= cap;
  return (
    <p
      style={{
        margin: 0,
        fontSize: 12.5,
        color: DASH.muted,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <strong style={{ color: spent ? DASH.ink : DASH.heading, fontWeight: 700 }}>
        {used} of {cap}
      </strong>{' '}
      worksheets created this month
    </p>
  );
}

/**
 * The cap-reached panel.
 *
 * Reads as "here is more room on Pro", not "you have run out". The teacher has
 * not done anything wrong: they used a feature they paid for, as much as the
 * plan includes. So the panel leads with what Core includes, states the reset
 * plainly, and offers Pro as the next size up rather than as a rescue.
 */
export function QuotaCapNotice({ cap }: { cap: number }) {
  return (
    <div
      style={{
        ...cardStyle(DASH),
        background: DASH.noticeWarnBg,
        borderLeft: `4px solid ${DASH.noticeWarn}`,
        padding: '16px 18px',
        marginBottom: 18,
      }}
      role="status"
    >
      <p style={{ margin: 0, fontSize: 14, color: DASH.ink, lineHeight: 1.5 }}>
        <strong>Teacher Core includes {cap} worksheets a month,</strong> and you have
        created all {cap} of them. Your next {cap} arrive at the start of next month.
      </p>
      <p style={{ margin: '8px 0 0', fontSize: 13.5, color: DASH.muted, lineHeight: 1.5 }}>
        Everything you have already built stays available to open, print and reprint
        as often as you like. Teacher Pro includes unlimited worksheets and class
        data exports.
      </p>
      <Link
        href={UPGRADE_HREF}
        style={{
          display: 'inline-block',
          marginTop: 13,
          background: DASH.heading,
          color: '#FFF',
          padding: '9px 16px',
          borderRadius: 9,
          fontSize: 13.5,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        See Teacher Pro
      </Link>
    </div>
  );
}
