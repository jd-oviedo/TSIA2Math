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

  // ─── Topic status, and the third orange ────────────────────────────────────
  //
  // ADDED 2026-08-21, and this is the record of why a third orange exists in a
  // product whose standing rule is that Sunset Orange #F0A33E and Cipher Gold
  // #C8A96E are the only two. Written in the style of curriculum-theme.ts:24-34
  // because the next person to reach for an orange will read one of these two
  // files, and this is the one that has to explain the exception.
  //
  // WHAT WAS WRONG. /dashboard/modules is theme-aware (--umd-*, data-theme on
  // .um-dash) but TopicListRow painted its status labels from the LIGHT-ONLY
  // curriculum palette. Measured on the surface those labels actually render on,
  // V.cardBg, at 12px weight 500, so the target is 4.5:1:
  //
  //                                    light #FFFFFF   dark #202024
  //   "Complete"      C.green #4E8A5B       4.11 FAIL      3.95 FAIL
  //   "In progress"   C.sunset #F0A33E      2.10 FAIL      7.74 ok
  //   "Not started"   V.dim   #8A8983       3.51 FAIL      4.88 ok
  //
  // That V.dim row is the value as it stood on 2026-08-21. The token was fixed
  // on 2026-08-22 and now reads #6B6A65 at 5.42 light; the failure it records is
  // history, not the current state.
  //
  // "In progress" at 2.10 was orange-as-TEXT, which is the exact role
  // curriculum-theme.ts:30-33 retired on 2026-08-17. The decision was recorded
  // in the palette file and this component was never brought into line with it.
  //
  // WHY NO SINGLE HEX FIXES IT. One constant has to clear 4.5:1 against both
  // #FFFFFF and #202024, and across a white-to-near-black flip a mid-tone orange
  // cannot. Every candidate passes exactly one theme:
  //
  //   #B5763A (C.amber)  3.74 light / 4.34 dark
  //   #A8631F            4.70 light / 3.46 dark
  //   #9E6512            4.86 light / 3.34 dark
  //   #8A5A10            5.91 light / 2.74 dark
  //
  // Neither approved orange can hold a text role on white at any tier either:
  // C.sunset is 2.10 and C.gold #C8A96E is 2.24. So the fix is structural, not
  // chromatic: these become theme-aware tokens like every other colour here.
  //
  // #A8631F IS A DARKENED TEXT-ONLY VARIANT OF SUNSET, NOT A COMPETING ORANGE,
  // and that is the whole basis on which it was approved. It is paired with
  // C.sunset's exact hex in dark, where that already passes at 7.74. One orange
  // doing two jobs across two themes. It must not be used as a fill.
  //
  // WIDENED 2026-08-22, deliberately and once. The original sentence here read
  // "nothing outside a status label should reach for it". noticeWarn below now
  // holds the same pair, because error copy on a dashboard card is the same job
  // on the same ground as a status label -- quiet coloured text on this surface,
  // measured at the same 4.70 light and 7.74 dark. What the rule was protecting
  // is intact: still text, still never a fill, still no third orange in the
  // system. If a THIRD role wants this hex, that is the point to stop and ask
  // whether the value has quietly become a general-purpose orange after all.
  //
  // statusComplete's light value #3F7150 is the imported design's green. It is
  // the one value from that sheet adopted after the 2026-08-17 wholesale
  // rejection, because live is measurably failing here and the design's is not:
  // 5.69 against 4.11. That rule is about a palette rejected for drifting by a
  // few points, not a guarantee that live beats the design when live fails.
  /** Status label: topic finished. */
  statusComplete: string;
  /** Status label: topic started, not finished. Text only, never a fill. */
  statusProgress: string;
  /** Status label: topic untouched. Also the metadata line on every topic row. */
  statusIdle: string;
  // ─── Notices ───────────────────────────────────────────────────────────────
  //
  // ADDED 2026-08-22. Error, warning and confirmation copy on the dashboard was
  // painted straight from the curriculum palette, which is LIGHT-ONLY and was
  // never measured against this surface. Every one of them failed, in BOTH
  // themes, which is why these are pairs rather than constants:
  //
  //                                     light #FFFFFF   dark #202024
  //   error copy      C.amber #B5763A       3.74 FAIL      4.34 FAIL
  //   success copy    C.green #4E8A5B       4.11 FAIL      3.95 FAIL
  //
  // The hexes below introduce NO new colour. They are statusProgress's and
  // statusComplete's pairs exactly, which were measured and approved on this
  // same surface on 2026-08-21. A notice and a status label are the same job on
  // the same ground: quiet coloured text on a card.
  //
  // THE COST, STATED RATHER THAN HIDDEN. Raising a notice against the CARD moves
  // it toward the ink end, which necessarily moves it toward body ink too. The
  // step from V.ink narrows:
  //
  //                        light            dark
  //   warning   4.66 -> 3.70:1     3.16 -> 1.77:1
  //   success   4.24 -> 3.06:1     3.47 -> 1.93:1
  //
  // Light still reads as clearly marked. Dark is thin, and there is no value
  // that is far from the card AND far from body ink at once -- the two grounds
  // pull opposite ways. Hue carries what luminance no longer does, which is why
  // both notice sites sit in a role="status" region and say what they are in
  // words. Warning against success is unchanged and never was a luminance
  // distinction: 1.10:1 before, 1.21:1 light and 1.09:1 dark after.
  /** Error and warning copy. Text only, never a fill. */
  noticeWarn: string;
  /** Confirmation copy. Text only, never a fill. */
  noticeOk: string;
  /**
   * Tinted chip fills, and the one place the settled orange rule is applied
   * literally rather than argued about: the fill stays coloured, and the label
   * inside it takes V.ink.
   *
   * That is what fixes these without a darkened amber. The chip tint is DARKER
   * than the white card, so it binds, and no amber clears it: #A8631F reaches
   * 4.18 and lightening the tint to let it through drives the tint to 1.02
   * against its own container, i.e. invisible. Ink on the tint measures 15.47.
   * Nothing is lost, because the chip says "Open" or "Resolved" in words.
   */
  noticeWarnBg: string;
  noticeOkBg: string;

  /**
   * Fill for a topic row the viewer's plan does not reach. Nothing else.
   *
   * The light value is the imported design's "inset, quiet row" #F6F2E8, spec'd
   * there for locked rows. It is admitted on the same test that let band, rail
   * and quietBox in on 2026-08-17: it names a role the brand system has no value
   * for. It is a PAIR rather than a bare constant because this surface flips to
   * a near-black card, where a cream row would read as a highlight rather than
   * as a quiet one.
   */
  gatedRowBg: string;
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
  // 4.96 on pageBg, 5.23 on subtleBg, 5.42 on cardBg -- the three grounds V.dim
  // actually renders on, all clearing 4.5:1. Was #8A8983 at 3.21 / 3.39 / 3.51,
  // failing all three.
  //
  // WHY THIS HEX. pageBg #F5F5F3 is the darkest of the three, so it binds: clear
  // 4.5 there and the other two follow. Every candidate that clears it collapses
  // the step from muted #5F5E5A to something nobody can see -- 1.35:1 at
  // #73726C, 1.29:1 at #706F69, 1.2:1 here -- which is the same collapse
  // curriculum-theme.ts:168-175 already measured and accepted, on the same
  // ground: where muted and dim meet on this surface the quieter one is an
  // eyebrow or a meta line, separated by size, weight, case and family rather
  // than by colour. Since no passing value keeps the tier visible, there is no
  // reason to mint a new grey, and this is the one this file already approved
  // for exactly this job below.
  dim: '#6B6A65',
  hairline: '#F0EEE7',
  line: '#E7E5DD',
  subtleBg: '#FBFBF9',
  rowHoverBg: '#FAFAF7',
  chipBg: '#EDEBE4',
  trackBg: '#F2F1EC',
  statusComplete: '#3F7150', // 5.69 on cardBg
  statusProgress: '#A8631F', // 4.70 on cardBg
  // 5.42 on cardBg. Identical to dim above, in this theme and in dark, because
  // the 2026-08-21 pass darkened this one role and the 2026-08-22 pass brought
  // the token itself to the same value. Kept as its own key rather than aliased:
  // it names a status, and a status colour that later needs to diverge from
  // tertiary copy should not have to be extracted from it first.
  statusIdle: '#6B6A65',
  noticeWarn: '#A8631F', // 4.70 on cardBg. statusProgress's hex, same job.
  noticeOk: '#3F7150', // 5.69 on cardBg. statusComplete's hex, same job.
  noticeWarnBg: '#FBF0E2', // V.ink on it: 15.47
  noticeOkBg: '#EDF3EA', // V.ink on it: 15.42
  gatedRowBg: '#F6F2E8',
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
  statusComplete: '#7FB894', // 7.10 on cardBg
  // C.sunset's exact hex, kept because it already clears 4.5:1 here at 7.74.
  // The brand orange survives where it works and is replaced only where it cannot.
  statusProgress: '#F0A33E',
  // Unchanged from DARK.dim, which already passes at 4.88. Only the light side
  // of this pair was failing.
  statusIdle: 'rgba(242,241,236,0.52)',
  // The dark side of the pair: the theme's own inset fill, so a gated row reads
  // as recessed here exactly as #F6F2E8 does in light.
  noticeWarn: '#F0A33E', // 7.74 on cardBg
  noticeOk: '#7FB894', // 7.10 on cardBg
  // The light chips were hardcoded cream, so in dark they rendered as bright
  // cream pills carrying 3.32:1 text. These are the theme's own warm tints:
  // V.ink measures 11.17 and 11.40 on them, and each stays visible against the
  // #26262B box it sits in (1.14 and 1.12).
  noticeWarnBg: '#3A2E1E',
  noticeOkBg: '#22322A',
  gatedRowBg: '#26262B',
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
  statusComplete: '--umd-status-complete',
  statusProgress: '--umd-status-progress',
  statusIdle: '--umd-status-idle',
  noticeWarn: '--umd-notice-warn',
  noticeOk: '--umd-notice-ok',
  noticeWarnBg: '--umd-notice-warn-bg',
  noticeOkBg: '--umd-notice-ok-bg',
  gatedRowBg: '--umd-gated-row-bg',
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
`;

/* THE BODY GROUND IS NOT SET HERE, AND MUST NOT BE MOVED BACK.
   ===========================================================
   Two rules used to sit at this spot:

     body:has(.um-dash) { background: <pageBg>; }
     body:has(.um-dash[data-theme="dark"]) { background: <pageBg dark>; }

   They never painted on any browser -- app/layout.tsx sets the body background
   from an inline style prop, which outranks any stylesheet rule that is not
   !important -- and :has() is Selectors Level 4, so they also dropped entirely
   on Safari below 15.4.

   Adding !important would fix the first problem but not the second, and a flat
   `body` selector cannot fix either properly: the theme marker is data-theme on
   .um-dash, a DESCENDANT, and ThemeProvider stamps no attribute on <html>, so a
   body rule cannot read theme state and would paint one colour behind both
   themes. body:has(descendant) was the only selector that could express this,
   and it is the one older Safari drops.

   So StudentShell writes it as a theme-aware inline style through
   useBodyBackground, which is theme-correct on every browser. See
   app/components/useBodyBackground.ts for the full reasoning. */
