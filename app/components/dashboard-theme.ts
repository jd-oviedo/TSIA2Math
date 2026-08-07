// The dashboard content surface, shared by /teacher and /dashboard.
//
// These values are not new. They are the literals the teacher dashboard has
// always carried inline, lifted out verbatim so the student dashboard can point
// at the same constants instead of copying them. The point is the guarantee:
// change the card border here and both dashboards move together, rather than
// drifting the next time one of them is touched.
//
// Deliberately not the --ec theme variables. Those carry the marketing site and
// the CAT engine, and their palette (cool navy-blue ink, #F0EDE8 paper) is a
// different system from the dashboards' warm grey. Keeping the two apart is why
// the teacher dashboard hardcoded these in the first place.
//
// LIGHT is the authority for both dashboards. DARK exists because the student
// dashboard is wired to the app's theme toggle; the teacher dashboard is not
// yet, so it reads LIGHT directly and is unaffected by the toggle.

export interface DashSurface {
  /** Page background behind the cards. */
  pageBg: string;
  /** Card and panel fill. */
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  /** Raised card, on hover. */
  cardShadowHover: string;
  /** Display and heading ink. */
  heading: string;
  /** Default body ink. */
  ink: string;
  /** Secondary copy: blurbs, table values. */
  muted: string;
  /** Tertiary copy: labels, timestamps, units. */
  dim: string;
  /** Hairline between rows inside a card. */
  hairline: string;
  /** Heavier line: table head, control borders. */
  line: string;
  /** Zebra/table header fill, and row hover. */
  subtleBg: string;
  rowHoverBg: string;
  /** Neutral chip, e.g. the roster count. */
  chipBg: string;
  /** Inset well: progress tracks, empty bars. */
  trackBg: string;
}

export const LIGHT: DashSurface = {
  pageBg: '#F5F5F3',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(15,30,53,0.07)',
  cardShadow: '0 1px 2px rgba(15,30,53,0.04)',
  cardShadowHover: '0 4px 16px rgba(15,30,53,0.07)',
  heading: '#0F1E35',
  ink: '#1A1A1A',
  muted: '#5F5E5A',
  dim: '#8A8983',
  hairline: '#F0EEE7',
  line: '#E7E5DD',
  subtleBg: '#FBFBF9',
  rowHoverBg: '#FAFAF7',
  chipBg: '#EDEBE4',
  trackBg: '#F2F1EC',
};

// The same surface after dark. Warm greys go to warm-neutral darks rather than
// the --ec system's blue-blacks, so a student switching between the dashboard
// and the CAT engine does not cross two different dark palettes -- they are
// distinct surfaces either way, and this one stays a sibling of LIGHT.
export const DARK: DashSurface = {
  pageBg: '#17171A',
  cardBg: '#202024',
  cardBorder: 'rgba(255,255,255,0.09)',
  cardShadow: '0 1px 2px rgba(0,0,0,0.34)',
  cardShadowHover: '0 4px 16px rgba(0,0,0,0.42)',
  heading: '#F2F1EC',
  ink: '#EDECE7',
  muted: 'rgba(242,241,236,0.66)',
  // 0.46 would mirror LIGHT.dim's weight but lands at 4.1:1 on the dark card.
  // Nudged up to clear AA rather than matching the light side's miss.
  dim: 'rgba(242,241,236,0.52)',
  hairline: 'rgba(255,255,255,0.07)',
  line: 'rgba(255,255,255,0.12)',
  subtleBg: '#26262B',
  rowHoverBg: '#26262B',
  chipBg: 'rgba(255,255,255,0.09)',
  trackBg: 'rgba(255,255,255,0.08)',
};

// The teacher dashboard is light-only, so it imports this rather than branching.
export const DASH = LIGHT;

// One card shape, so "same white card treatment" is a fact rather than a
// convention. Callers spread it and add their own padding.
export function cardStyle(s: DashSurface = LIGHT): React.CSSProperties {
  return {
    background: s.cardBg,
    border: `1px solid ${s.cardBorder}`,
    borderRadius: 12,
    boxShadow: s.cardShadow,
  };
}

// ─── The student rail ────────────────────────────────────────────────────────
//
// The one surface the two dashboards deliberately do NOT share: the teacher
// rail is Deep Navy, the student rail is Mercury Cream. Kept as plain objects
// rather than CSS variables because StudentNav also renders inside the /course
// tree, which never loads DASHBOARD_CSS and so has no --umd-* to read.

export interface RailSurface {
  bg: string;
  /** Nav labels and icons at rest. */
  text: string;
  /** Nav label on hover, and the profile initials. */
  textStrong: string;
  /** The STUDENT / TEACHER band. */
  badge: string;
  badgeLine: string;
  divider: string;
  hoverBg: string;
  /** Account name under the avatar. */
  meta: string;
  avatarRing: string;
  menuBg: string;
  menuBorder: string;
  menuText: string;
  menuHoverBg: string;
  menuShadow: string;
  /** Which LogoutButton ink suits this rail. */
  logoutVariant: 'cream' | 'dark';
}

export const RAIL_LIGHT: RailSurface = {
  bg: '#E8E0CF',
  text: 'rgba(14,14,17,0.68)',
  textStrong: '#0E0E11',
  badge: 'rgba(14,14,17,0.72)',
  badgeLine: 'rgba(14,14,17,0.18)',
  divider: 'rgba(14,14,17,0.12)',
  hoverBg: 'rgba(14,14,17,0.06)',
  meta: 'rgba(14,14,17,0.62)',
  avatarRing: 'rgba(14,14,17,0.42)',
  menuBg: '#FFFDF8',
  menuBorder: 'rgba(14,14,17,0.09)',
  menuText: '#0E0E11',
  menuHoverBg: '#F2EDDF',
  menuShadow: '0 12px 34px rgba(14,14,17,0.22)',
  logoutVariant: 'cream',
};

// Mercury Cream's own dark: the warmth is kept in the hue so the rail still
// reads as a sibling of the light one, rather than jumping to a blue-black.
export const RAIL_DARK: RailSurface = {
  bg: '#23211D',
  text: 'rgba(242,237,223,0.70)',
  textStrong: '#F2EDDF',
  badge: 'rgba(242,237,223,0.74)',
  badgeLine: 'rgba(242,237,223,0.22)',
  divider: 'rgba(242,237,223,0.14)',
  hoverBg: 'rgba(242,237,223,0.08)',
  meta: 'rgba(242,237,223,0.62)',
  avatarRing: 'rgba(242,237,223,0.45)',
  menuBg: '#2E2B26',
  menuBorder: 'rgba(242,237,223,0.12)',
  menuText: '#F2EDDF',
  menuHoverBg: '#3A362F',
  menuShadow: '0 12px 34px rgba(0,0,0,0.46)',
  logoutVariant: 'dark',
};

// ─── The student dashboard's variable bridge ─────────────────────────────────
//
// /dashboard renders most of its content from server components, which cannot
// call useTheme(). So the surface is published as CSS custom properties on the
// .um-dash wrapper and the server tree reads them with var(); flipping the
// theme is then one data-theme attribute on that wrapper, set by the one client
// component that does know the theme.
//
// Named --umd-* rather than --ec-* on purpose: these are scoped to the
// dashboard and must not collide with the global theme's variables, which are
// set on :root and still drive the CAT engine underneath.

const VAR_NAMES: Record<keyof DashSurface, string> = {
  pageBg: '--umd-page-bg',
  cardBg: '--umd-card-bg',
  cardBorder: '--umd-card-border',
  cardShadow: '--umd-card-shadow',
  cardShadowHover: '--umd-card-shadow-hover',
  heading: '--umd-heading',
  ink: '--umd-ink',
  muted: '--umd-muted',
  dim: '--umd-dim',
  hairline: '--umd-hairline',
  line: '--umd-line',
  subtleBg: '--umd-subtle-bg',
  rowHoverBg: '--umd-row-hover-bg',
  chipBg: '--umd-chip-bg',
  trackBg: '--umd-track-bg',
};

function declarations(s: DashSurface): string {
  return (Object.keys(VAR_NAMES) as (keyof DashSurface)[])
    .map((k) => `  ${VAR_NAMES[k]}: ${s[k]};`)
    .join('\n');
}

/** The var() reference for a token, for use in inline styles. */
export const V: Record<keyof DashSurface, string> = Object.fromEntries(
  (Object.keys(VAR_NAMES) as (keyof DashSurface)[]).map((k) => [k, `var(${VAR_NAMES[k]})`])
) as Record<keyof DashSurface, string>;

/** Light by default, dark under [data-theme="dark"]. Dropped into DASHBOARD_CSS. */
export const DASH_VARS_CSS = `
.um-dash {
${declarations(LIGHT)}
}
.um-dash[data-theme="dark"] {
${declarations(DARK)}
}

/* The body behind the shell still carries the global theme's --ec-bg, which is
   a blue-black in dark mode and would flash at the edges on overscroll. Custom
   properties inherit downward only, so the value cannot be read back off
   .um-dash here -- it is written from the same constants instead. */
body:has(.um-dash) { background: ${LIGHT.pageBg}; }
body:has(.um-dash[data-theme="dark"]) { background: ${DARK.pageBg}; }
`;
