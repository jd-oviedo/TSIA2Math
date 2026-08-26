import { C, EYEBROW } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';

// The handful of shapes every dashboard page repeats. Server components, no
// state: the pages that need interactivity import their own client pieces.
//
// Every colour here is a --umd-* variable rather than a literal. That is what
// makes these shapes theme-aware at all: a server component cannot ask which
// theme is on, but it can defer the question to CSS.
//
// THE TWO DASHBOARDS NO LONGER SHARE A PANEL SHAPE, AND THIS FILE IS WHERE
// THAT SPLIT IS MADE. Card used to spread cardStyle() and override three of
// its four properties, leaving the radius as the one thing the student shell
// still took from the teacher dashboard's constructor. The student shell is
// flat now and the teacher dashboard is not, so there is nothing left to
// share -- and Card no longer imports cardStyle() at all. That is deliberate:
// it makes "flattening the student panel cannot reach /teacher" a fact about
// the import graph rather than a claim in a comment. See Card below.

// ─── The shell's spacing scale ───────────────────────────────────────────────
//
// Five values, and only one of them is new. Before this existed, the five shell
// pages stacked their panels at five DIFFERENT gaps -- 16 on Home, 18 on Grades,
// 12 on Announcements, 12 on Modules, 22 on Assignments -- with four panel
// paddings and three within-panel gaps between them. None of that disagreement
// meant anything; it was five files written at five times.
//
// GROUP IS THE ONE NEW VALUE, AND IT IS THE ONLY THING CARRYING THE HIERARCHY.
// Making every gap equal would have produced parity and no structure: eight
// identical white cards on Home, evenly spaced, is exactly the flatness this
// pass exists to fix. So there are two tiers -- panels inside a group sit at
// STACK, groups sit at GROUP -- and the seam between two groups is whitespace
// and nothing else. No band, no fill, no rule, no second accent. If a future
// change wants a group to read as more distinct than 28px of air makes it, the
// answer is the header tier below, not a background.
//
// Scoped to the dashboard shell, like dashboard-theme.ts and for the same
// reason: the curriculum tree has its own rhythm and must not be dragged onto
// this one by an import.
export const SPACING = {
  /** Gap between panels that belong to the same group. */
  STACK: 16,
  /** Gap between groups. STACK + 12, and deliberately the largest step here. */
  GROUP: 28,
  /** Card and panel padding. Was also 26/28, 20/22 and 16/24 across the shell. */
  PANEL_PAD: '22px 24px',
  /** Gap between blocks inside one panel. Was 14, 13, 12 and 9. */
  BLOCK: 14,
  /** A section header to the content directly under it. */
  HEAD_GAP: 10,
} as const;

/**
 * A page's top-level column: groups, separated by GROUP.
 *
 * PAINTS NOTHING. It has no background, no border and no padding, and it must
 * not acquire any -- the whole point is that the grouping is legible from the
 * spacing alone. scripts/verify_shell_spacing.mjs asserts its computed
 * background stays transparent in both themes, so a decorative fill added here
 * reddens rather than shipping.
 */
export function PageStack({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="um-page-stack"
      style={{ display: 'flex', flexDirection: 'column', gap: SPACING.GROUP }}
    >
      {children}
    </div>
  );
}

/** One group of related panels, separated by STACK. Paints nothing; see PageStack. */
export function SectionGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="um-section-group"
      style={{ display: 'flex', flexDirection: 'column', gap: SPACING.STACK }}
    >
      {children}
    </div>
  );
}

export function PageHeading({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 26 }}>
      <h1
        style={{
          margin: 0,
          font: `600 29px ${FONT_HEADING}`,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: V.heading,
        }}
      >
        {title}
      </h1>
      {blurb && (
        <p style={{ margin: 0, font: `400 14.5px ${FONT_BODY}`, lineHeight: 1.6, color: V.muted }}>
          {blurb}
        </p>
      )}
    </header>
  );
}

/**
 * A page head that carries a block beside its title.
 *
 * ONE CALLER TODAY -- Home, whose "Join a class" panel moved out of the bottom
 * of the last group and up to the top right. It is a primitive rather than a
 * div in page.tsx for a reason that is about proof, not about reuse: Home is an
 * async server component that calls getProfile() and reads Supabase, so it
 * cannot be mounted in the DB-free lane (app/um-verify/shell/page.tsx:85-92).
 * A row composed inline there could only ever be source-checked, and a lane
 * that hand-copied its markup would measure a replica. Prop-driven and
 * exported, the row the lane measures is the row that ships.
 *
 * PageHeading IS UNTOUCHED AND TAKES NO NEW PROP. It is a closed <header> with
 * six consumers, five of which want nothing to do with this; giving it an
 * `aside` slot would have made every one of them a caller of a feature only
 * Home uses. The composition happens here instead, and PageHeading renders
 * byte-identically on all six pages.
 *
 * ─── THE 26 IS PageHeading's OWN, MOVED RATHER THAN INVENTED ────────────────
 *
 * PageHeading carries marginBottom: 26 and that is the distance the whole shell
 * reads as "title to content". Beside a taller panel it is the WRONG distance
 * to leave doing the job alone: the row's height is set by the aside, so a
 * stack placed after it would sit flush against the join panel while the header
 * kept its 26 to itself, uselessly, in the middle of the row.
 *
 * So both columns carry it. The left column is a flex item and therefore its
 * own BFC, so the header's bottom margin does not collapse out of it and the
 * column measures header + 26; the right column is given the same 26
 * explicitly. A flex line's cross size is the largest of its items' MARGIN
 * boxes, so the row ends exactly 26px below whichever column is taller -- which
 * is the aside -- and PageStack begins there. Stacked at <=900 the same two
 * margins do the same two jobs in sequence: the header's separates the title
 * from the panel, the aside's separates the panel from the stack.
 *
 * The horizontal seam is SPACING.GROUP, an existing value. No new spacing
 * constant enters the scale for this.
 *
 * ─── THE REFLOW IS TWO MECHANISMS AND BOTH ARE LOAD-BEARING ─────────────────
 *
 * The shell's content width is NOT monotonic in the viewport, because the rail
 * is 208px wide until it disappears at 900 (border-box, per dashboard-css.ts:21):
 *
 *     1280 -> 872 (capped)   1024 -> 748   901 -> 625   900 -> 868   720 -> 688
 *
 * The narrowest the column ever gets is 625px at 901 -- JUST ABOVE the
 * breakpoint, where a max-width:900 rule does not fire. A media query alone
 * therefore leaves the title squeezed at exactly the width that squeezes it
 * hardest, and wrapping alone leaves the head a row at 720 (688 content, above
 * the 320+28+320 wrap threshold) where the contract says it must stack.
 *
 * flexWrap here covers 901-944, where the content box is under that 668px
 * threshold. The media query in dashboard-css.ts covers <=900. The two regimes
 * are disjoint, which is what lets each be falsified on its own -- see
 * scripts/verify_home_head_row.mjs, which reads 950 and 920 on either side of
 * the wrap threshold for exactly that reason.
 */
export function PageHeadRow({
  heading,
  aside,
}: {
  heading: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div
      className="um-head-row"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        columnGap: SPACING.GROUP,
      }}
    >
      {/* minWidth 0 so a long blurb wraps inside the column instead of setting
          a min-content floor that pushes the aside off the line. */}
      <div style={{ flex: '1 1 320px', minWidth: 0 }}>{heading}</div>
      <div style={{ flex: '0 1 320px', marginBottom: 26 }}>{aside}</div>
    </div>
  );
}

/**
 * The panel. One fill, one hairline, no radius and no shadow.
 *
 * FLAT AS OF 2026-08-26, matching the worksheet generator's panelStyle
 * (worksheet-theme.ts:195-200), which is the treatment the rest of the product
 * moved to. Radius 12 -> 0 and V.cardShadow -> none; the border steps from
 * cardBorder to panelEdge because with the shadow gone the line is the ONLY
 * thing separating a panel from its ground, and cardBorder at 0.07 measures
 * 1.15 doing that job. The full measurement is on panelEdge in
 * dashboard-theme.ts; nothing here changed colour, only shape.
 *
 * THE FOUR PROPERTIES ARE DECLARED HERE RATHER THAN SPREAD FROM cardStyle().
 * This used to open with `...cardStyle()` and then override three of its four
 * properties, so the radius was the single thing the student shell still took
 * from the teacher dashboard's constructor. At radius 0 that spread contributes
 * nothing, and keeping it would leave a live import from a flat surface into a
 * rounded one for a value neither of them reads. cardStyle() is unchanged and
 * still carries /teacher's 12 and its shadow -- this file simply no longer
 * points at it.
 *
 * `as` EXISTS FOR SEMANTICS, NOT FOR STYLE, and it is the only reason a caller
 * ever passes it. A panel is a <section> by default and every caller that does
 * not ask for otherwise still renders one. Announcements asks for <article>,
 * because each post is a self-contained item a screen reader should be able to
 * navigate as a discrete article -- a role a <section> with no accessible name
 * does not expose at all. The alternative was leaving that page hand-rolling
 * its own box to keep its element, which is how it ended up with a radius of 16
 * and a light-only shadow literal in the first place.
 *
 * It cannot be used to change how a panel LOOKS: every visual property below is
 * fixed and none of them is a prop.
 */
export function Card({
  children,
  padding = SPACING.PANEL_PAD,
  as: Tag = 'section',
}: {
  children: React.ReactNode;
  padding?: string;
  as?: 'section' | 'article';
}) {
  return (
    <Tag
      style={{
        background: V.cardBg,
        border: `1px solid ${V.panelEdge}`,
        borderRadius: 0,
        boxShadow: 'none',
        padding,
      }}
    >
      {children}
    </Tag>
  );
}

// ─── The three header tiers ──────────────────────────────────────────────────
//
// T1 PageHeading, T2 SectionLabel, T3 CardTitle. Every one of them is built
// from ink this file already had -- V.heading and V.dim -- because a header
// tier is a TYPE distinction, and reaching for a colour to say "this is a
// different level" is how a palette grows a fifth blue.
//
// WHAT WAS HERE BEFORE. Twelve header treatments across five pages, three of
// them copy-paste divergences of CardTitle carrying three different margins
// (16px/600 at mb 4, at mb 4, and at mb 3), plus a 17px one on Announcements, a
// 15px <div> in two places, and TWO Home panels with no header at all -- the
// resume card, the largest on the page, opened with an 11px uppercase eyebrow.
// Groups could not read as distinct because their headings did not agree on
// what a heading was.
//
// T2 IS SMALLER THAN T3 ON PURPOSE. A group label is a dim, letterspaced 13px
// body label; a panel title is 16px heading ink. The outline reads correctly
// because the two differ in weight of VOICE rather than in size -- which is how
// the Assignments buckets have always read, and that treatment is the one
// promoted here rather than a new one invented alongside it.

/**
 * T3. One per panel, exactly once.
 *
 * The margin IS the header-to-content distance, which is why it is HEAD_GAP and
 * why callers must not put this inside the panel's BLOCK-gapped column: nested
 * that way the real distance becomes margin + gap, which is how the shell ended
 * up with 18px on Grades, 18px on Home's announcements card and 17px on the
 * resume card while every one of them "said" 4.
 */
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: `0 0 ${SPACING.HEAD_GAP}px`,
        font: `600 16px ${FONT_HEADING}`,
        color: V.heading,
      }}
    >
      {children}
    </h2>
  );
}

/**
 * T2. The label over a group of panels.
 *
 * `color` exists for the one caller that needs it -- the overdue assignments
 * bucket, which has taken V.noticeWarn since it was written. That is an
 * existing role on an existing token, not a new accent, and it is the same
 * escape hatch Eyebrow below already offers.
 */
export function SectionLabel({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <h2
      style={{
        margin: `0 0 ${SPACING.HEAD_GAP}px`,
        font: `600 13px ${FONT_BODY}`,
        letterSpacing: 0.3,
        color: color ?? V.dim,
      }}
    >
      {children}
    </h2>
  );
}

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  return <div style={{ ...EYEBROW, color: color ?? V.dim }}>{children}</div>;
}

export function Muted({ children, size = 14 }: { children: React.ReactNode; size?: number }) {
  return (
    <p style={{ margin: 0, font: `400 ${size}px ${FONT_BODY}`, lineHeight: 1.6, color: V.muted }}>
      {children}
    </p>
  );
}

// Deliberately plain. An empty dashboard is the normal first-run state, not a
// failure, and it should not be dressed up as one.
export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card padding="34px 26px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
        <div style={{ font: `600 15px ${FONT_HEADING}`, color: V.heading }}>{title}</div>
        <Muted size={13.5}>{detail}</Muted>
      </div>
    </Card>
  );
}

// One progress bar shape, used for the course total and for each unit.
export function ProgressBar({
  value,
  total,
  height = 10,
}: {
  value: number;
  total: number;
  height?: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct} percent complete`}
      style={{
        width: '100%',
        height,
        borderRadius: height / 2,
        background: V.trackBg,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height / 2,
          background: C.sunset,
        }}
      />
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
