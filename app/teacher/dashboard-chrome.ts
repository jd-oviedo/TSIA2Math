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

/* ─── The collapsible body ───────────────────────────────────────────────────

   GRID ROWS, NOT display OR height. The four collapsible sections used the
   hidden ATTRIBUTE, which is display:none, and display is not animatable at
   all -- so the panel vanished between one frame and the next.

   (No backticks anywhere in this block: it is a template literal, and one in a
   CSS comment ends the string and stops the file parsing as TypeScript.)

   height is animatable but needs a NUMBER, and none of these bodies has one: a
   roster is as tall as its rows and a rollup is as tall as its unit strip.
   Animating to height:auto does nothing in every engine that matters.

   grid-template-rows: 1fr -> 0fr is the technique that does work. The parent is
   a one-row grid, the row is sized as a fraction, and a fraction interpolates.
   The child carries overflow:hidden so the content is clipped rather than
   spilling as the row closes, and min-height:0 because a grid item's default
   min-height:auto refuses to shrink below its content and would freeze the
   whole animation at full height.

   VISIBILITY IS SWITCHED, NOT JUST CLIPPED, and the delay is the entire reason
   it is a separate declaration. A clipped-but-visible subtree still holds
   focusable children, so a collapsed section would swallow tab stops into a
   zero-height box. visibility:hidden fixes that, but applied immediately it
   would blank the content on frame one and animate an empty box. So: collapsing
   waits the full duration (transition-delay 0.24s on a 0s property, which is
   how you schedule a discrete change), expanding applies visible at once. */
.um-tdash-collapse {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.24s ease;
}
.um-tdash-collapse > * {
  overflow: hidden;
  min-height: 0;
  visibility: visible;
}
.um-tdash-collapse[data-collapsed="true"] { grid-template-rows: 0fr; }
.um-tdash-collapse[data-collapsed="true"] > * {
  visibility: hidden;
  transition: visibility 0s linear 0.24s;
}

/* ITS OWN GUARD, CO-LOCATED, NOT FOLDED INTO THE ONE ABOVE.
   The block above covers this module's hover transitions; this covers its one
   layout transition. They are kept apart because they answer to different
   things: a hover is decoration and a collapse is a state change that must
   still END in the right place. Under reduce the collapse is instant, which is
   correct -- the section still opens and closes, it just does not travel.
   visibility keeps its delay:0 so a reduced-motion collapse hides its content
   on the same frame rather than 240ms later. */
@media (prefers-reduced-motion: reduce) {
  .um-tdash-collapse { transition: none; }
  .um-tdash-collapse[data-collapsed="true"] > * { transition: none; }
}

/* ─── The misconception carousel ─────────────────────────────────────────────

   Native overflow-x plus scroll-snap, which is the whole mechanism. Dragging,
   wheel, touch, and the keyboard all come from the browser rather than from a
   listener, so there is no drag maths here to get wrong and nothing to undo on
   unmount. Autoplay is the only scripted part, and it is one scrollBy.

   The static variant is a GUARD, not a style choice: with two cards or fewer a
   carousel has nothing to carousel and would scroll a single item back and
   forth forever. See the note at the call site.

   ─── NO NEGATIVE-MARGIN FULL BLEED, AND THAT IS MEASURED ──────────────────

   The strip lives inside a section panel that carries 22px of horizontal
   padding, so the obvious worry is that the padding boxes the scroll in and
   the rail needs pulling out to the panel's border with negative margins.

   It does not. Measured in a browser at 1280 with six cards inside the real
   panel and the real collapse wrapper: scrollWidth 3068 against clientWidth
   1170, the rail reaches its own end exactly, snap stays "x mandatory", and
   the inset from the panel border is a symmetric 23px (22 padding + 1 border).
   Nothing is clipped and nothing is short.

   Negative margins would also be WRONG here rather than merely unnecessary.
   The rail sits inside .um-tdash-collapse, whose child carries overflow:hidden
   so the collapse can clip as it closes. A rail pulled out past the content
   box would be cut off at exactly that boundary, so the trick would buy a
   clipped strip instead of a full-bleed one.

   scroll-padding is gone with it. It was 1px, which offset every snap position
   by a pixel for no reason; cards snap to the scrollport start, and the
   scrollport start is the panel's inner edge. */
.um-tdash-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}
.um-tdash-carousel > * {
  scroll-snap-align: start;
  flex: 0 0 clamp(280px, 46%, 460px);
  min-width: 0;
}
.um-tdash-carousel--static {
  overflow-x: visible;
  scroll-snap-type: none;
  padding-bottom: 0;
}
.um-tdash-carousel--static > * { flex: 1 1 0; }
`;
