// The student-facing curriculum palette, from the UnpackMath Curriculum design
// import. This is the new brand system and it is deliberately not the --ec
// theme variables the teacher dashboard runs on: those carry a dark mode, and
// these pages commit to one warm light surface so a cream card never has to
// hold light-on-light math.
//
// Sunset Orange is rationed. It marks GUMU and the single primary action on a
// screen, nothing else. Sky Blue means "you are in a conversation", Gemini Blue
// is quiet UI, Cipher Gold labels editorial asides, and Cancer Violet appears
// only on the answer key.

export const C = {
  sunset: '#F0A33E',
  // The 2px lip under a primary button, so it reads as pressable without a blur.
  sunsetShadow: '#D98C2C',
  sunsetHover: '#F5B15A',
  sky: '#87CEEB',
  cream: '#E8E0CF',
  sand: '#F2EDDF',
  // Cards and bubbles sit a shade above Warm Sand.
  paper: '#FFFDF8',
  // GUMU's own surface: sand warmed further, so his half of a card is legible
  // as his without a border.
  gumuSurface: '#F7F1E4',
  // ─── The three surfaces from the recoloured course-experience design ───────
  //
  // Adopted 2026-08-17, and the only three values taken from that recolour. They
  // are the one part of it that was a real addition rather than a near-miss of a
  // brand colour: they name roles the brand system has no value for, so nothing
  // live had to lose to make room for them. Everything else in that sheet
  // diverged from the brand system by a few points and live won, and #C07F22 was
  // dropped outright -- there is no orange-as-text role in this product, and the
  // brand orange is worse as text than the value proposed (1.60:1 on cream
  // against 2.54:1), so the role itself was the problem rather than the hex.
  //
  // Read as a ladder, darkest page to lightest box:
  //   cream #E8E0CF  ->  rail #EDE8DA  ->  band #F3EFE3  ->  paper #FFFDF8
  //
  // Contrast, measured rather than assumed: the live ink() ramp clears 4.5:1 on
  // all three at ink(0.65) and above (5.57 to 10.35). ink(0.45) does NOT clear it
  // on any of them, at 2.97 to 3.00 -- but it does not clear it on cream (2.91)
  // or paper (3.09) either, so that is standing contrast debt this palette
  // neither caused nor fixes. It is recorded as its own issue, not chased here.

  // The lesson reading column's background. NOT APPLIED YET: the column is
  // currently capped at 788px, so painting it would draw a stripe rather than a
  // band, and reaching the design needs a full-width band with the measure capped
  // inside it. That restructure is its own unit of work.
  band: '#F3EFE3',
  // The lesson outline rail. Applied.
  rail: '#EDE8DA',
  // A quiet box sitting ON the band, where paper would not read as inset.
  //
  // STILL UNCONSUMED, and now deliberately so rather than pending. It was named
  // for the design's "Check yourself" callout, and that construct DOES NOT EXIST
  // in this curriculum -- grep across all 97 source files returns nothing. It is
  // the design's own sample content.
  //
  // The nearest real construct is a prose blockquote (topic-page-css.ts:113,
  // Cipher Gold left border). Considered and rejected: two topics of 97 use one
  // in their guided notes, and a token applied to two instances is not a system.
  //
  // Kept because it is the third rung of a real four-surface ladder and the
  // ladder is incomplete without it. If a callout construct is ever authored,
  // this is the colour it takes.
  quietBox: '#EDE7D6',
  midnight: '#0E0E11',
  // Deep Navy, the pre-July-2026 brand colour. It survives on exactly one
  // surface: the dark GUMU banner strips, at Juan's explicit direction after
  // the conflict with the rest of this palette was raised. Everything else dark
  // in the curriculum tree is Deep Midnight above, and the teacher dashboard
  // uses this colour throughout because it has not been migrated yet.
  gumuBanner: '#0F1E35',
  gemini: '#6E9DC8',
  gold: '#C8A96E',
  violet: '#A86EC8',
  // Wrong answers are amber-brown rather than red: the student is mid-conversation
  // with GUMU, not being alarmed. Correct is a green mixed toward the warm page.
  amber: '#B5763A',
  amberBg: '#FBF0E2',
  amberLine: '#E5B98A',
  green: '#4E8A5B',
  greenBg: '#EDF3EA',
  greenLine: '#A9C6AE',
} as const;

// ─── Shape ───────────────────────────────────────────────────────────────────
//
// One radius and two shadows, so surfaces stop drifting apart a component at a
// time. Chosen by counting what is already in the tree rather than by picking a
// number: across app/course and app/dashboard the radii in use were 16 (11
// uses), 11 (11), 12 (9), 14 (4), 13 (3), plus pill values.
//
// RADIUS IS 0. THE CURRICULUM TREE IS SQUARE. Changed 2026-08-22.
//
// It was 12, chosen from the clusters above because it moved nothing by more
// than 4px. That reasoning was about picking one rounded value out of five, and
// it is superseded by a decision about whether to be rounded at all.
//
// WHY. The redesign removes the card system from the content column: content
// sits on the ground with hairline rules between sections, rather than in cream
// panels floating on it. A radius is a property of a floating panel. With the
// panels gone there is nothing whose corner needs softening, and a rounded edge
// on a full-bleed section reads as a leftover rather than as a choice.
//
// It also carried a contrast cost that was invisible in light. Rounded cream
// panels on a near-black ground are maximum-contrast chrome, so in dark the eye
// reads the container edge before it reads the content. Squaring the corners
// and dropping the fills removes the edge rather than restyling it.
//
// SCOPE. Only the curriculum tree and Modules import this. app/teacher declares
// its own RING_RADIUS and is untouched, as is the student nav sidebar. Circles
// (borderRadius: '50%') are a different shape and stay: a status dot is not a
// panel corner.
export const RADIUS = 0;

// Pills are a different shape, not a rounded rectangle, and they stay: the
// sidebar's active-state pill and the small status chips read as pills on
// purpose. RADIUS does not apply to them.
export const RADIUS_PILL = 999;

// Every container edge. An inset ring rather than a border so it costs no
// layout, which matters where these sit inside flex rows.
export function hairline(color: string): string {
  return `inset 0 0 0 1px ${color}`;
}

// The ONLY drop shadow. It is an affordance, not decoration: the 2px lip is
// what makes the single primary action on a screen read as pressable.
//
// The decorative `0 1px 3px rgba(14,14,17,.05)` that six surfaces carry is
// retired by this rule. It sits under panels that are already separated from
// the page by a hairline and a fill, so it adds no information, and it is the
// "shadow used as decoration" the redesign specifically rules out.
export const SHADOW_PRESSABLE = `0 2px 0 ${C.sunsetShadow}`;

// Deep Midnight at an opacity, for the tiers of secondary text and hairlines the
// design leans on instead of extra greys.
export function ink(alpha: number): string {
  return `rgba(14, 14, 17, ${alpha})`;
}

// Cream at an opacity, for text on the dark GUMU cards.
export function onDark(alpha: number): string {
  return `rgba(242, 237, 223, ${alpha})`;
}

// ─── The two quiet greys, and why they are two ───────────────────────────────
//
// These were one undifferentiated cluster -- ink(0.4), ink(0.45), ink(0.5) --
// spelling two jobs the same way, so the value was chosen by eye each time and
// text kept landing on a grey that could not be read. Naming them is most of the
// fix: the next person who wants "a quiet grey" now has to say which kind.
//
// The audience reads on Chromebooks at school and low-end Android phones, often
// at low brightness, so this is not a theoretical standard to clear.

// Quiet TEXT. Eyebrows, blurbs, captions, status labels -- anything a student is
// expected to read but that should not compete with the thing beside it.
//
// 0.6 is the smallest round value clearing WCAG AA 4.5:1 on EVERY surface this
// text lands on. Measured, not chosen: the binding constraint is cream, which
// needs 0.593, and the seven surfaces run 4.62 (cream) to 5.02 (paper). It
// replaces ink(0.45), which scored 2.91 to 3.09 and failed on all seven.
// tests/curriculum-contrast.test.ts holds the pair against every one of them.
//
// WHAT THIS COST, recorded because it is not recoverable by picking better: the
// tier above is ink(0.65), and 0.6 against 0.65 is a 1.18:1 step, which nobody
// can see. There is no value that clears 4.5:1 AND stays visibly quieter than
// 0.65, because the floor (0.593) sits directly under it. Muted and secondary
// have collapsed into one another. That is survivable only because colour was
// never carrying the distinction where the two actually meet: in all four
// components holding both, the muted one is an EYEBROW or an inline sub-label,
// separated by size, weight, case and family. The seven non-eyebrow uses sit
// below C.midnight, not below 0.65, and that step is still 3.17:1.
export const INK_MUTED = ink(0.6);

// NOT text. Disabled controls and decoration only.
//
// Deliberately still fails 4.5:1, and must keep failing. WCAG 1.4.3 exempts
// "inactive user interface components", and a disabled button rendered at
// INK_MUTED reads as enabled -- which loses a student more than a dim grey does.
// The three uses are the locked Next, the un-armed Check answer, and the
// un-armed Join.
//
// If you are reaching for this for something a student has to READ, you want
// INK_MUTED. That sentence is the whole reason the two tokens exist.
export const INK_DISABLED = ink(0.4);

// The uppercase monospace eyebrow that labels every section and card in the
// design. Kept as one object because it is repeated a dozen times.
export const EYEBROW = {
  font: '600 11px ui-monospace, Menlo, monospace',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
} as const;

// Math sets taller than prose, so every surface that can hold KaTeX gets loose
// leading and a min-height rather than being sized to a single line of text.
export const MATH_LINE_HEIGHT = 2.05;
