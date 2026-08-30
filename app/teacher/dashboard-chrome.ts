import { DASH, DASH_FLAT } from '../components/dashboard-theme';

// The teacher dashboard restyle's palette and its one stylesheet, in a plain
// module.
//
// SPLIT OUT OF TeacherDashboardClient.tsx FOR THE REASON teacher-shell-css.ts
// records, plus one more.
//
//   The shell's reason: a harness has to be able to measure these exact rules,
//   and Node strips types from a .ts file but will not parse JSX, so nothing
//   can import a .tsx directly.
//
//   The new one: NewAssignment MOUNTS OUTSIDE THE DASHBOARD. It is the teacher
//   panel /um-verify/shell renders as its control (see ../um-verify/
//   TeacherPanelControl.tsx), on a route that has never loaded a line of
//   dashboard CSS. A button styled `className="um-tdash-cta"` with its fill
//   living only in TeacherDashboardClient's <style> block paints TRANSPARENT
//   there -- no error, no warning, just an invisible button on the one route
//   whose whole job is to notice when a teacher panel changes. So the rules
//   live here and both call sites emit them.
//
// Emitting the same stylesheet twice is harmless: the rules are identical and
// idempotent, and the second copy resolves to the same values as the first.

/**
 * Sunset Orange, and the three non-text roles it is allowed to hold on this
 * screen: a button fill, a bar fill, a badge fill. It is NEVER an ink.
 *
 * #111111 on it measures 9.00, which is why every label sitting on this fill
 * is dark rather than inverted. White would be 2.10 and fail.
 */
export const CTA = '#F0A33E';

/** The only ink allowed on top of CTA. 9.00 on the fill. */
export const CTA_INK = '#111111';

/** Dashboard Navy: the secondary action's outline, and the rail's ground. */
export const NAVY = '#0F1E35';

/**
 * Secondary text, one step up from DASH.dim.
 *
 * 6.96 on the white panel, 6.37 on the page ground, 5.95 on the Warm Sand
 * FOCUS card. Clears AA on all three grounds a dashboard label sits on, which
 * DASH.muted's 5.42/4.96 pair did only just.
 */
export const INK_2 = '#5A5A52';

// ─── Hover, through a custom property ────────────────────────────────────────
//
// EVERY HOVER ON THIS SCREEN REASSIGNS A VARIABLE, never a property. The base
// rule paints from var(--umt-*) once, and :hover changes only what that
// variable resolves to. Two consequences, and both are the point:
//
//   A hover state cannot silently take a property the base rule was relying
//   on, because it never names one.
//
//   Adding a second hovered property later means adding a second variable
//   rather than duplicating a declaration that then has to stay in step.
//
// It also retires the pattern the untouched parts of TopBar still use --
// onMouseEnter writing into element.style -- which strands the hover state
// whenever the pointer leaves during a re-render, and which cost MiscCard a
// useState and two renders per pointer pass to change one property.
//
// AN INLINE background PROP BEATS THESE RULES. Anything that sets its own
// background inline (the disabled Post button, for one) opts out of the
// variable and keeps whatever it declared, which is what those call sites
// want. A control that wants the hover must leave background unset.
//
// FLAT, so the vocabulary is deliberately short: opacity, colour and
// background, plus one 2px translate on a link arrow. No shadow, no gradient,
// no scale on a box.
export const DASH_HOVER_CSS = `
.um-tdash-cta {
  --umt-cta-bg: ${CTA};
  background: var(--umt-cta-bg);
  transition: background 0.14s ease;
}
.um-tdash-cta:hover { --umt-cta-bg: #F5B15A; }
.um-tdash-cta:active { --umt-cta-bg: #E39528; }

.um-tdash-ghost {
  --umt-ghost-bg: transparent;
  --umt-ghost-ink: ${NAVY};
  background: var(--umt-ghost-bg);
  color: var(--umt-ghost-ink);
  transition: background 0.14s ease;
}
.um-tdash-ghost:hover { --umt-ghost-bg: rgba(15,30,53,0.06); }

/* The panel edge itself. The hairline darkens rather than the box lifting,
   which is the flat system's substitute for a shadow on a hoverable card. */
.um-tdash-panel {
  --umt-panel-edge: ${DASH_FLAT.panelHairline};
  border-color: var(--umt-panel-edge);
  transition: border-color 0.15s ease;
}
.um-tdash-panel:hover { --umt-panel-edge: #D6D0C2; }

/* Roster rows. A background swap and nothing else. */
.um-tdash-row {
  --umt-row-bg: transparent;
  background: var(--umt-row-bg);
  transition: background 0.1s ease;
}
.um-tdash-row:hover { --umt-row-bg: ${DASH.rowHoverBg}; }

/* The roster's per-student link. Colour plus a 2px nudge on the arrow, which
   is the largest translate anything on this screen is allowed. */
.um-tdash-view {
  --umt-view-ink: ${DASH.link};
  color: var(--umt-view-ink);
}
.um-tdash-view:hover { --umt-view-ink: ${DASH.linkHover}; }
.um-tdash-view > span { display: inline-block; transition: transform 0.14s ease; }
.um-tdash-view:hover > span { transform: translateX(2px); }

/* The Collapse control's chevron. Rotation only, no box change. */
.um-tdash-chev { transition: transform 0.16s ease; }

@media (prefers-reduced-motion: reduce) {
  .um-tdash-cta,
  .um-tdash-ghost,
  .um-tdash-panel,
  .um-tdash-row,
  .um-tdash-view > span,
  .um-tdash-chev { transition: none; }
}
`;
