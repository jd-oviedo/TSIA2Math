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

// Deep Midnight at an opacity, for the tiers of secondary text and hairlines the
// design leans on instead of extra greys.
export function ink(alpha: number): string {
  return `rgba(14, 14, 17, ${alpha})`;
}

// Cream at an opacity, for text on the dark GUMU cards.
export function onDark(alpha: number): string {
  return `rgba(242, 237, 223, ${alpha})`;
}

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
