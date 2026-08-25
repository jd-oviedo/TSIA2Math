// The curriculum tree's surface: /course/[test]/[subject]/unit/[unit]/topic/*.
//
// Lesson, practice, quiz and the topic doorway all render inside the .um-topic
// wrapper, and this is what paints it. Scoped custom properties on that wrapper,
// flipped by one data-theme attribute, exactly like app/components/dashboard-theme.ts
// does for .um-dash and app/login/login-theme.ts does for .um-login. Named
// --umt-* so they cannot collide with either of those or with the global --ec-*.
//
// ─── THIS SURFACE IS NO LONGER LIGHT ONLY ────────────────────────────────────
//
// SUPERSEDED 2026-08-21, at Juan's direction.
//
// curriculum-theme.ts:1-5 recorded that "these pages commit to one warm light
// surface so a cream card never has to hold light-on-light math", and
// topic/[topicId]/layout.tsx hardcoded C.cream and C.midnight to enforce it.
// That decision is overridden. Dark mode on lessons, practice and quizzes was an
// explicit standing instruction; the light-only recommendation was accepted in a
// later conversation and should not have been, because an accepted recommendation
// does not retire a standing instruction. The old text is left in place in both
// files rather than deleted, with this override recorded beside it, so the
// history reads.
//
// The concern in that decision was real and is answered rather than dismissed:
// the reason a cream page could not go dark was that the math was painted from
// --ec-ink, which inverts, while the page did not. Both halves move together
// now. See the .katex note at the foot of this file, which is the single
// highest-risk line in the change.
//
// ─── THE SPLIT THIS IMPLEMENTS ───────────────────────────────────────────────
//
// Two visual systems, divided by altitude, decided 2026-08-21 after Phase 1
// found that the two sources of truth disagree on ground, border, ink and all
// three typefaces. Recorded in full in phase-1-curriculum-visual-redesign.md
// section 0 and phase-2-curriculum-visual-redesign.md part 3.
//
//   CHROME comes from the marketing system shipped on login in PR #174: white
//   bar, hard 1px #111111 border, squared corners, mono eyebrows, orange CTA.
//   A student moving from sign-in to a lesson stays in one product.
//
//   THE READING SURFACE comes from the course design import: the warm cream
//   ladder, hairlines between content blocks, tinted callout and answer fills.
//   Long-form reading on white is worse and the design is right about that.
//
// ─── WHY DARK IS WARM ON BOTH HALVES ─────────────────────────────────────────
//
// The login system's dark is a blue-black (#0C1120 ground, #161E30 bar). Measured
// against the reading surface's warm dark: #161E30 on #201F1C is 1.01:1 and
// #0C1120 on #17171A is 1.05:1. Same brightness, different hue, with no luminance
// step for the eye to read as a boundary. It renders as a colour fault rather
// than as structure.
//
// So dark keeps the login system's STRUCTURE and drops its HUE. The hard border,
// the graph paper, the mono, the squared geometry and the orange CTA are what
// carry that identity, and none of them is blue. The blue-black existed because
// the login screens had no warm surface to sit against; this tree does.
//
// The cost, accepted knowingly: the dark login screen and the dark lesson page do
// not share a ground colour. That is a smaller inconsistency than two colour
// temperatures on one page.

// ─── CONVERTING A SURFACE ONTO THESE TOKENS: READ THIS FIRST ─────────────────
//
// A token swap preserves a ROLE error silently, and that has already happened
// once in this migration. It will happen again, because the remaining surfaces
// are converted the same way.
//
// The failure: C.sunset was mapped mechanically to T.cta across four files. That
// is the correct token for every FILL and RULE it was used on, and wrong for the
// one place it was used as TEXT, where TopicOverview painted the "In progress"
// state label. Orange as text measures 1.99 on the reading band. The swap was
// right about the token and wrong about the role, tsc passed, eslint passed, and
// nothing caught it until the light screenshot was looked at.
//
// So, when converting:
//
//   1. Split every colour by ROLE before mapping it, not by name. Fill, rule,
//      border, and text are four different questions, and only text has to clear
//      4.5:1. Orange and the two state colours are the ones that differ by role.
//   2. Grep the result for `color: T.cta` and `return T.cta`. There should be
//      none. Orange is a fill, a rule and the CTA on this surface, never a label.
//   3. Screenshot both themes before believing it. The type checker cannot see a
//      contrast failure, and neither can a token name.
//
// The same trap applies to T.correct, T.missed and T.answerKey, which are all
// legitimate as text AND as fills, so their light and dark values were chosen to
// clear text contrast on the reading ladder rather than merely to look right.

import type { ThemeName } from '../theme/themes';

export interface CurriculumSurface {
  // ─── Chrome: the top bar and its controls ──────────────────────────────────
  /** The course bar behind the breadcrumb and the part tabs. */
  barBg: string;
  /** The hard rule under the bar and around its controls. */
  barLine: string;
  barInk: string;
  barInk2: string;
  /** Fill of the current Lesson/Practice/Quiz tab. */
  tabActiveBg: string;

  // ─── The reading ladder, darkest ground to lightest panel ─────────────────
  /** Page ground behind everything. */
  page: string;
  /** The lesson outline column. */
  rail: string;
  /** The fill actually painted on that column. Light only; see LIGHT.railFill. */
  railFill: string;
  /** The band the reading column sits on. */
  band: string;
  /** A row the viewer's plan or the authoring queue does not reach. */
  insetRow: string;
  /** Cards, problem frames, display-math blocks. */
  panel: string;
  /** A quiet box sitting on the band, and the answer-choice fill. */
  quietBox: string;

  // ─── Ink ──────────────────────────────────────────────────────────────────
  ink: string;
  /** Secondary copy inside the reading column. */
  ink2: string;
  /** Mono metadata, eyebrows, state labels. Everything small. */
  muted: string;

  // ─── Lines ────────────────────────────────────────────────────────────────
  /** Between entries INSIDE a block. Decorative, exempt from 1.4.11. */
  hairline: string;
  /** The structural rule BETWEEN blocks. Decorative, exempt. See LIGHT.rule. */
  rule: string;
  /** Around a control, where 1.4.11 applies at 3:1. Answer choices. */
  controlBorder: string;

  // ─── State ────────────────────────────────────────────────────────────────
  statusComplete: string;
  statusIdle: string;
  correct: string;
  correctTint: string;
  missed: string;
  missedTint: string;
  /**
   * A SYSTEM failure, not a wrong answer. Named 2026-08-22, discrepancy D7.
   *
   * These are two different messages and they were sharing one colour. "Your
   * request failed, try again" and "you got this wrong" mean opposite things to
   * a student: one is the product's fault and one is theirs. GumuChat's
   * ErrorLine was borrowing C.amber, the retired missed-answer value, so a
   * network error and a missed question arrived in the same ink.
   *
   * Deliberately NOT --umt-missed. If they shared a token, ratifying red for
   * missed answers would have silently repainted every error message too.
   */
  error: string;

  // ─── Indicators and actions ───────────────────────────────────────────────
  track: string;
  trackFill: string;
  cta: string;
  ctaInk: string;
  /** The primary button on hover. Lighter, not darker, matching C.sunsetHover. */
  ctaHover: string;
  focus: string;
  link: string;
  linkHover: string;
  /** Disabled controls only. Deliberately below 4.5:1, see curriculum-theme.ts. */
  disabled: string;
  /** The 2px lip under the primary button, so it reads as pressable. */
  ctaShadow: string;
  /** The answer key, teacher-only. Cancer Violet's role, nothing else. */
  answerKey: string;
  /** "You are in a conversation": the tutor's own accent, on tutor surfaces. */
  tutorAccent: string;

  // ─── The tutor card ───────────────────────────────────────────────────────
  /** Does not invert. See the note on the DARK block. */
  tutorSurface: string;
  tutorBorder: string;
  tutorInk: string;
  tutorInk2: string;
}

// Ratios below are WCAG 2.1, alpha composited over the stated ground, computed
// rather than estimated. The full table is in
// phase-2-curriculum-visual-redesign.md part 3.
const LIGHT: CurriculumSurface = {
  barBg: '#FFFFFF',
  // The marketing system's hard rule, 18.88 on the bar and 14.38 on cream.
  barLine: '#111111',
  barInk: '#111111',
  barInk2: 'rgba(0,0,0,0.55)',
  tabActiveBg: '#E8E0CF',

  page: '#E8E0CF',
  rail: '#EDE8DA',
  // The rail is PAINTED now, at the same rung it already names.
  //
  // SUPERSEDES the "a plain column, not a panel" note in LessonBody, which is
  // left in place there with this override recorded beside it. That note was
  // right about a PANEL and this is not one: #EDE8DA is a 1.07:1 step off the
  // #E8E0CF ground, which is a change of rung and not an object on the page.
  // With the cards gone the rail had no fill and no ladder position at all, so
  // the outline and the prose were the same surface with a 1.13 line between
  // them.
  //
  // Text on it IMPROVES rather than survives: the rail's eyebrows measure 4.62
  // on the ground and 4.74 here.
  railFill: '#EDE8DA',
  band: '#F3EFE3',
  insetRow: '#F6F2E8',
  panel: '#FFFDF8',
  quietBox: '#EDE7D6',

  ink: '#0E0E11', // 14.68 on page, 18.96 on panel
  ink2: 'rgba(14,14,17,0.75)', // 7.56 to 8.73 across the ladder
  // INK_MUTED, and NOT the design's #8A8474.
  //
  // The import uses #8A8474 for every mono metadata line, eyebrow, topic ID and
  // state label, which is most of the small text in the system. Measured on the
  // seven surfaces this tree uses it lands at 2.84 to 3.67 and fails AA on all
  // seven. INK_MUTED was chosen against these exact surfaces and clears them at
  // 4.62 to 5.03.
  //
  // The cost, recorded because it is visible: INK_MUTED composites about 40
  // units darker per channel and less yellow (#65625D on cream against the
  // design's warm #8A8474), so mono lines read heavier and less sandy than the
  // mockup. On a unit expanded to fifteen rows that is a real increase in ink
  // density. Accepted at Juan's direction 2026-08-21.
  muted: 'rgba(14,14,17,0.6)',

  hairline: '#DCD3BE', // 1.46 on panel. Decorative, exempt.
  // THE STRUCTURAL RULE. Cipher Gold, and a SEPARATE token from hairline rather
  // than a change to it.
  //
  // WHY IT EXISTS. Taking the cards out of the content column in #185 was the
  // right move and its contrast gain is measured, but it left every structural
  // edge in the tree painted with one token at 1.13:1 on the ground: the section
  // dividers, the rail's outer edge and the top bar's rule, plus the practice
  // and quiz problem frame at 1.46 on panel. Measured before anything was
  // changed. The reading surface had no structure left to read.
  //
  // #C8A96E is C.gold, already in the palette. Measured after the swap: 1.71 on
  // the ground against hairline's 1.13, 1.83 on the rail fill against 1.22, and
  // 2.21 on panel against 1.46. All are decorative rules that carry no text and
  // mark no control, so neither 1.4.3 nor 1.4.11 applies to them.
  //
  // SPLIT FROM hairline RATHER THAN REPLACING IT, because the two roles are not
  // the same one. hairline still divides entries INSIDE a block -- the rail's
  // own entry dividers, the inset shadow under each outline row -- where a gold
  // rule at every level would read as decoration instead of as structure. Four
  // call sites moved; the within-block ones deliberately did not.
  rule: '#C8A96E',
  // #8A8474 survives here, in the one role it is good at.
  //
  // The import borders answer choices with #E2DAC6, which is 1.19 against the
  // choice fill. That is the only thing marking a choice as a control, so WCAG
  // 1.4.11 applies at 3:1 and 1.19 is a real failure rather than an exempt
  // decoration. #8A8474 measures 3.19 there. The token the design got wrong as
  // text is exactly right as a border.
  controlBorder: '#8A8474',

  statusComplete: '#3F7150', // 5.60 on panel
  statusIdle: '#6B6A65', // 5.42 on panel
  correct: '#3F7150', // 5.13 on correctTint
  correctTint: '#F1F4EF',
  // RED, NOT THE AMBER-BROWN, and this overrides a recorded decision.
  //
  // curriculum-theme.ts:C.amber records that "wrong answers are amber-brown
  // rather than red: the student is mid-conversation with GUMU, not being
  // alarmed". The tone argument stands on its own and is not what was wrong with
  // it. The value is: C.amber #B5763A measures 3.68 on panel and 3.30 on this
  // tint, failing AA on the surfaces it actually renders on, while the import's
  // #B0452F measures 5.53 and 4.95 and passes.
  //
  // Overridden by Juan 2026-08-21 on the ground that a tone preference does not
  // get to override a contrast failure. Recorded here in the same style as the
  // third-orange decision in dashboard-theme.ts, and for the same reason: the
  // next person to reach for the amber-brown should find out why it is not here.
  missed: '#B0452F',
  missedTint: '#F7EFEC',
  // C.amber #B5763A darkened until it passes. Juan's call: the ErrorLine stays
  // AMBER, it just stops borrowing a token that means something else.
  //
  // The borrowed value failed AA on all seven cream surfaces, 2.85 to 3.68, so
  // "amber" was never really shipping as readable text. Measured here: 4.70 on
  // page, 5.04 rail, 5.37 band, 6.07 panel, 5.00 quietBox, 5.52 insetRow, 5.28
  // choice. Still reads as brown rather than as the brand orange, which is the
  // property that made amber the right tone for this message in the first place.
  //
  // #B84A40 was tried first, reusing --uml-error from login-theme.ts:131, and
  // REJECTED on measurement: 3.91 on page, 4.19 rail, 4.16 quietBox, 4.39
  // choice. It was measured against a white card there and does not survive the
  // move onto cream.
  error: '#8A5520',

  track: '#DCD3BE', // 1.30 on band. Paired with a label, exempt.
  // #F0A33E Sunset, not the import's #E89B3C, which is retired.
  trackFill: '#F0A33E',
  // Unified on Sunset 2026-08-21. The login CTA shipped #E8A33D and the stated
  // brand orange is #F0A33E; both clear their label at 8.76 and 9.00 with
  // #111111 ink, no curriculum surface used either yet, so this was the cheap
  // moment to collapse two near-identical oranges into the brand one.
  cta: '#F0A33E',
  ctaInk: '#111111', // 9.00 on the CTA
  ctaHover: '#F5B15A', // C.sunsetHover, unchanged
  focus: '#0F69BA', // 5.28 on the ground, and the login theme's own focus

  // A DARKENED GEMINI BLUE, and this is a defect fix rather than a restyle.
  //
  // topic-page-css.ts painted every link in the curriculum tree C.gemini
  // #6E9DC8, which measures 2.19 on the cream page, 2.50 on the band and 2.82 on
  // paper. Every prose link in every lesson has been failing AA since the tree
  // shipped. Found while building this module, not looked for.
  //
  // #2F6091 is Gemini darkened until it clears 4.5:1 on all seven surfaces
  // (4.99 to 6.45). Same relationship, and the same justification, as #A8631F to
  // Sunset in dashboard-theme.ts: a text-only variant of a brand colour, used
  // where the brand value cannot hold a text role.
  link: '#2F6091',
  linkHover: '#A8631F',
  // INK_DISABLED, unchanged, and it must keep failing 4.5:1. WCAG 1.4.3 exempts
  // inactive controls, and a disabled button rendered at muted ink reads as
  // enabled, which loses a student more than a dim grey does.
  disabled: 'rgba(14,14,17,0.4)',
  ctaShadow: '#D98C2C', // C.sunsetShadow, the 2px pressable lip
  // A DARKENED CANCER VIOLET, and a second defect fix of the same kind as the
  // link above. C.violet #A86EC8 is used as TEXT on the answer key and measures
  // 2.79 on cream, 3.19 on the band, 3.61 on paper and 2.97 on the quiet box:
  // failing on all four. #7F4A9E is the same hue darkened until it clears
  // (4.74 to 6.12). Teacher-facing rather than student-facing, which is why it
  // outlived the student-side sweep, not a reason to leave it.
  answerKey: '#7F4A9E',
  tutorAccent: '#87CEEB', // C.sky. A fill and a ring, never text.

  // Deep Midnight, not the import's #12253F. That value is a third navy, neither
  // Deep Navy #0F1E35 nor Deep Midnight, and it does not enter the codebase.
  tutorSurface: '#0E0E11',
  // The import's #3C5679 measures 2.57 here and fails 3:1, and it is the only
  // thing marking "Talk it through" as a control. onDark(0.42) gives 3.66.
  // The same alpha login-theme.ts landed on for its dark border by the same
  // test, where it measures 3.53 to 3.67. Two files reaching one number by one
  // method.
  tutorBorder: 'rgba(242,237,223,0.42)',
  tutorInk: '#FFFDF8', // 18.96
  tutorInk2: '#F2EDDF', // 16.48
};

// The same surface after dark.
//
// Warm throughout, for the reason in the header: a blue-black chrome above a
// warm reading column measures 1.01:1 and reads as a fault. The ladder inverts
// rung for rung, darkest ground to lightest panel, so the light and dark
// surfaces are siblings rather than two designs.
const DARK: CurriculumSurface = {
  barBg: '#1B1A18', // ink 14.87
  barLine: 'rgba(242,237,223,0.42)', // 3.65 on the bar
  barInk: '#F2EDDF',
  barInk2: 'rgba(242,237,223,0.70)', // 7.82
  tabActiveBg: '#2B2A25',

  page: '#17171A', // ink 15.29
  rail: '#1E1D1A', // ink 14.41
  // DARK IS OUT OF SCOPE for this change and must not move, so this is the
  // ground rather than the rail rung: painted on the page it is invisible, which
  // is exactly what the rail did before. walk_curriculum.mjs pins it at 1:1
  // against its own ground, which is what "invisible" means numerically.
  railFill: '#17171A',
  band: '#201F1C', // ink 14.09
  insetRow: '#232220', // ink 13.59
  panel: '#262521', // ink 13.12
  quietBox: '#2B2A25', // ink 12.29

  ink: '#F2EDDF',
  ink2: 'rgba(242,237,223,0.70)', // 6.82 to 7.97 across the ladder
  muted: 'rgba(242,237,223,0.55)', // 4.82 to 5.38, clears on every rung

  hairline: 'rgba(242,237,223,0.14)', // 1.50, the mirror of the light hairline
  // IDENTICAL TO hairline ON PURPOSE. Dark was explicitly out of scope, so the
  // four call sites that moved to T.rule must render in dark exactly as they did
  // before. Kept as its own entry rather than aliased so that giving dark a real
  // structural rule later is a one-line change here.
  rule: 'rgba(242,237,223,0.14)',
  controlBorder: 'rgba(242,237,223,0.42)', // 3.44 on the choice fill

  statusComplete: '#7FB894', // 6.71 on panel. Reused from dashboard-theme DARK.
  statusIdle: 'rgba(242,237,223,0.52)', // 4.62 on panel
  correct: '#7FB894', // 6.52 on correctTint
  correctTint: '#1E2A22',
  // Reused from login-theme DARK, which took it from --ec-red dark. The import's
  // #B0452F measures 2.73 on this ladder and cannot be used here.
  missed: '#E07B72', // 5.14 on missedTint
  missedTint: '#2A1E1C',
  // A warm tan, not an amber, and NOT the obvious --ec-orange dark #F2A541.
  //
  // #F2A541 was the first candidate and it fails a different test than contrast:
  // it sits 4 units of RGB distance from the CTA #F0A33E, so an error message in
  // dark would have arrived in what a student reads as the brand orange. That
  // also reintroduces orange-as-text, which is the exact role the palette
  // retired on 2026-08-17 and re-confirmed on 2026-08-21.
  //
  // #DDB892 measures 7.77 at its worst on the dark ladder and sits 89 from the
  // CTA and 69 from missed #E07B72, so it is confusable with neither.
  error: '#DDB892',

  track: 'rgba(242,237,223,0.14)',
  // Sunset survives in dark: 5.27 on the track, 7.31 on panel as text.
  trackFill: '#F0A33E',
  // The CTA does not invert, for the reason login-theme.ts gives about its own:
  // the label's contrast is against the fill, so 9.00 holds in both themes, and
  // an orange button is what a returning student recognises before reading.
  cta: '#F0A33E',
  ctaInk: '#111111',
  ctaHover: '#F5B15A',
  focus: '#5AAAEE', // 7.17 on the page. Reused from --ec-accent dark.

  // Gemini Blue itself, unmodified. It measures 5.01 to 6.24 on this ladder and
  // needed no darkening; only the light side was failing. Same shape as the
  // status orange in dashboard-theme.ts, where the brand value survives in dark
  // and is replaced only where it cannot hold.
  link: '#6E9DC8',
  linkHover: '#F0A33E',
  disabled: 'rgba(242,237,223,0.38)',
  ctaShadow: '#B87422',
  // Violet and sky are lightened rather than inverted: the roles are "answer
  // key" and "in conversation", and both should read as the same colour family
  // in either theme. 7.22 and 10.66 on the band.
  answerKey: '#C79BE0',
  tutorAccent: '#9BD9F0',

  // Does not invert. The tutor card is a dark panel in both themes, which is
  // what it already was, and its ink contrast is against its own fill.
  tutorSurface: '#0E0E11',
  tutorBorder: 'rgba(242,237,223,0.42)', // 3.66
  tutorInk: '#FFFDF8',
  tutorInk2: '#F2EDDF',
};

export const SURFACES: Record<ThemeName, CurriculumSurface> = { light: LIGHT, dark: DARK };

const VAR_NAMES: Record<keyof CurriculumSurface, string> = {
  barBg: '--umt-bar-bg',
  barLine: '--umt-bar-line',
  barInk: '--umt-bar-ink',
  barInk2: '--umt-bar-ink-2',
  tabActiveBg: '--umt-tab-active-bg',
  page: '--umt-page',
  rail: '--umt-rail',
  band: '--umt-band',
  insetRow: '--umt-inset-row',
  panel: '--umt-panel',
  quietBox: '--umt-quiet-box',
  railFill: '--umt-rail-fill',
  ink: '--umt-ink',
  ink2: '--umt-ink-2',
  muted: '--umt-muted',
  hairline: '--umt-hairline',
  rule: '--umt-rule',
  controlBorder: '--umt-control-border',
  statusComplete: '--umt-status-complete',
  statusIdle: '--umt-status-idle',
  correct: '--umt-correct',
  correctTint: '--umt-correct-tint',
  missed: '--umt-missed',
  missedTint: '--umt-missed-tint',
  error: '--umt-error',
  track: '--umt-track',
  trackFill: '--umt-track-fill',
  cta: '--umt-cta',
  ctaInk: '--umt-cta-ink',
  ctaHover: '--umt-cta-hover',
  focus: '--umt-focus',
  link: '--umt-link',
  linkHover: '--umt-link-hover',
  disabled: '--umt-disabled',
  ctaShadow: '--umt-cta-shadow',
  answerKey: '--umt-answer-key',
  tutorAccent: '--umt-tutor-accent',
  tutorSurface: '--umt-tutor-surface',
  tutorBorder: '--umt-tutor-border',
  tutorInk: '--umt-tutor-ink',
  tutorInk2: '--umt-tutor-ink-2',
};

const KEYS = Object.keys(VAR_NAMES) as (keyof CurriculumSurface)[];

function declarations(s: CurriculumSurface): string {
  return KEYS.map((k) => `  ${VAR_NAMES[k]}: ${s[k]};`).join('\n');
}

/** The var() reference for a token, for use in inline styles. */
export const T: Record<keyof CurriculumSurface, string> = Object.fromEntries(
  KEYS.map((k) => [k, `var(${VAR_NAMES[k]})`])
) as Record<keyof CurriculumSurface, string>;

// The graph paper does NOT come down here.
//
// Per the split, graph paper stays on /dashboard and /dashboard/modules and does
// not run behind lesson prose. The boundary is a route boundary rather than one
// inside a page, so a student sees the two grounds only across a navigation,
// which is the condition under which this kind of split reads as deliberate
// rather than as an inconsistency. The topic doorway is the one /course route
// that behaves like a syllabus page and is the place to check that claim first.

/** Light by default, dark under [data-theme="dark"]. Dropped into TOPIC_PAGE_CSS. */
export const CURRICULUM_VARS_CSS = `
.um-topic {
${declarations(LIGHT)}
}
.um-topic[data-theme="dark"] {
${declarations(DARK)}
}
`;

/* The body behind the tree is painted by TopicSurface, not from here.
   There were two body:has(.um-topic) rules at this spot. They never painted on
   any browser -- app/layout.tsx sets the body background from an inline style
   prop, which outranks any stylesheet rule -- and :has() is Selectors Level 4,
   so they also failed to parse on Safari below 15.4. Both problems are gone:
   TopicSurface calls useBodyBackground with the resolved page colour for the
   current theme. See app/components/useBodyBackground.ts for why this is not CSS.
   login-theme.ts still carries the original shape and is untouched here. */
