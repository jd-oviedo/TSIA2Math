'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { LogoutButton } from '../components/LogoutButton';
import { FONT_BODY } from '../components/fonts';
import { DASH } from '../components/dashboard-theme';
import { HoverLabel, HOVER_LABEL_CSS, useHoverLabel } from '../components/HoverLabel';
import SupportModal from '../components/SupportModal';
import { teacherTierLabel } from '../lib/capabilities';
import { CHROME_CLASS, SHELL_CLASS, SHELL_CHROME_CSS } from './teacher-shell-css';

// The teacher navigation shell, lifted out of TeacherDashboardClient so a page
// that is not the dashboard can render the same rail.
//
// WHAT MOVED, AND WHAT DID NOT. Everything below down to menuItemStyle is the
// dashboard's own code, moved character for character. The diff against the
// original is seven edits and they are all listed here, because "the dashboard
// renders identically" is the merge gate for this change and a reader should be
// able to check the claim rather than take it:
//
//   1. useViewport is exported (the dashboard still uses it in five other
//      places and now imports it from here).
//   2. SidebarInner takes `activeLabel`, defaulting to 'Dashboard'. The line it
//      replaces was `item.label === 'Dashboard'`, hardcoded, so the default
//      reproduces it exactly.
//   3. SidebarInner takes `tourEnabled`, defaulting to true. It gates the two
//      nav data-tour keys, the profile chip's data-tour and the "Take a Tour"
//      menu item. Defaulting to true reproduces the dashboard exactly; a route
//      with no tour targets passes false and renders no tour hooks at all.
//   4. onStartTour became optional, because a route with tourEnabled={false}
//      has no tour to start.
//   5-7. The three attribute sites the two flags above reach.
//
// Nothing else changed. No style value, no string, no element.
//
// THE STATE THE RAIL NEEDS NOW LIVES HERE. `collapsed` and `menuOpen` used to be
// useState in TeacherDashboardClient, and `menuOpen` was set by the hamburger
// inside TopBar -- a different component in the same file, handed an onMenu
// prop. Both belong to the shell now. TopBar reaches the opener through
// useTeacherShell() rather than a prop, which is what lets the shell own the
// state without the dashboard threading it back down.
//
// TWO VARIANTS, AND THE DIFFERENCE IS NOT COSMETIC:
//
//   'dashboard'  -- what /teacher renders. The shell is the flex row and the two
//                   rails and nothing else: no content wrapper, no compact
//                   menu bar, no injected stylesheet, no SupportModal, and the
//                   tour hooks present. The DOM is what it was before the
//                   extraction, node for node.
//   'standalone' -- a teacher page that is not the dashboard. The shell also
//                   wraps the content column, renders a compact menu bar under
//                   1024px (the dashboard's TopBar is where that hamburger
//                   normally lives, and these pages have no TopBar), owns its
//                   own SupportModal, injects the stylesheet the dashboard's
//                   own <style> block would otherwise have provided, and drops
//                   every piece of chrome under print.
//
// PRINT. The dashboard's rail prints today, and this change does not touch
// that: the no-print rule is emitted for the standalone variant only. The
// worksheet routes carry a chrome-hiding contract from PR #200 -- a stray
// Ctrl+P drops the rail, the toolbar and the config rail and prints the sheet
// -- and a shell that arrived without one would have regressed it.

// Viewport hook. Defaults to desktop for SSR / first paint (no hydration
// mismatch), then corrects on mount. Breakpoints: <640 mobile, <1024 tablet.
export function useViewport() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { w, isMobile: w < 640, isCompact: w < 1024 };
}

// ─── Logo ──────────────────────────────────────────────────────────────────────

// Wordmark is 2000x485, so setting width alone keeps the aspect ratio intact.
// 152px fits the 200px sidebar minus its 18px side padding.
//
// Collapsed, the full wordmark is replaced by the standalone mu mark, which is
// square and centres in the narrow rail.
function Brand({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    // The mu mark only inks about 50% x 61% of its own 1080px canvas; the rest
    // is transparent padding. Rendered at a nominal icon size the glyph came
    // out around 15px in a 64px rail, which read as an empty logo slot. Sizing
    // the box to 44px puts the visible mark at roughly 22x27, matching the
    // weight of the nav icons below it.
    return (
      <img
        src="/unpackmath-logo.png"
        alt="UnpackMath"
        width={1080}
        height={1080}
        style={{ width: 44, height: 44, display: 'block', margin: '0 auto' }}
      />
    );
  }
  return (
    <img
      src="/unpackmath-wordmark.png"
      alt="UnpackMath"
      width={2000}
      height={485}
      style={{ width: 152, maxWidth: '100%', height: 'auto', display: 'block' }}
    />
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

// `tour` is the data-tour key TeacherTour targets. Only the two items the tour
// stops at carry one; the rest are undefined and render no attribute.
// `badge` is a quiet suffix rendered beside the label, currently "(Beta)" on
// Worksheets. It is a SEPARATE field rather than part of the label string, and
// that is not tidiness: `label` is also the key navIcon switches on, the key the
// hover state compares, and the React key. Folding "(Beta)" into it would drop
// the icon through to the generic eye, which is the exact fallthrough the case
// below was added to prevent.
const NAV_ITEMS: { label: string; href: string; tour?: string; badge?: string }[] = [
  { label: 'Dashboard', href: '/teacher' },
  { label: 'Misconceptions', href: '/teacher#misconceptions', tour: 'nav-misconceptions' },
  // The worksheet generator has been live and teacher-facing for weeks with no
  // way to reach it from the dashboard: /teacher/worksheets was findable only by
  // typing the URL. Nothing new is exposed by linking it -- the page runs
  // requireWorksheetTeacher(), which is requireTeacher() plus the worksheets
  // capability, and every teacher who can see this rail has already cleared the
  // first half.
  { label: 'Worksheets', href: '/teacher/worksheets', badge: '(Beta)' },
  // Build 3: was '/teacher#roster', a same-page anchor into the roster section
  // below. It now leads to the fuller roster, which carries a grade column and a
  // way through to the gradebook.
  //
  // THE ANCHOR AND THE SECTION IT POINTED AT ARE UNTOUCHED. `id="roster"` and
  // `data-tour="roster"` both remain (see the Roster component), because
  // data-tour="roster" is step 6 of TeacherTour and moving the section would
  // break onboarding for every new teacher. Only this href changed.
  //
  // NO class_id, DELIBERATELY. The dashboard's selected class is unpersisted
  // React state that this rail has no access to, and threading it through for
  // one link would be worse than the destination resolving its own default --
  // which is what /teacher/worksheets already does.
  { label: 'Students', href: '/teacher/students' },
  { label: 'Take a practice test', href: '/adaptive-test', tour: 'nav-practice' },
  { label: 'Student view', href: '/dashboard' },
];

function navIcon(label: string) {
  switch (label) {
    case 'Dashboard':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="5.5" height="5.5" rx="1.2" /><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.2" /><rect x="2" y="10.5" width="5.5" height="5.5" rx="1.2" /><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.2" /></svg>;
    case 'Misconceptions':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2.4 L16.2 15 H1.8 Z" /><line x1="9" y1="7" x2="9" y2="10.5" /><circle cx="9" cy="12.8" r="0.5" fill="currentColor" stroke="none" /></svg>;
    // A sheet with a folded corner and three ruled lines. Its own case rather
    // than the default: navIcon switches on the LABEL, so an item with no case
    // silently takes the generic eye below and looks like a mistake nobody
    // notices, because the eye is a perfectly plausible icon.
    case 'Worksheets':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 1.8 h6.2 L14.4 6 v10.2 H4 Z" /><path d="M10.2 1.8 V6 h4.2" /><line x1="6.4" y1="9.4" x2="12" y2="9.4" /><line x1="6.4" y1="12.2" x2="12" y2="12.2" /></svg>;
    case 'Students':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.3" cy="6" r="2.4" /><circle cx="12.4" cy="6.6" r="2" /><path d="M2 15 a4.3 4.3 0 0 1 8.6 0" /><path d="M10.4 14.6 a3.6 3.6 0 0 1 5.6 0" /></svg>;
    case 'Take a practice test':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.2" y="2" width="11.6" height="14" rx="1.6" /><line x1="6" y1="6" x2="12" y2="6" /><line x1="6" y1="9" x2="12" y2="9" /><line x1="6" y1="12" x2="9.6" y2="12" /></svg>;
    default:
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1.4 9 C4.2 4.2 13.8 4.2 16.6 9 C13.8 13.8 4.2 13.8 1.4 9 Z" /><circle cx="9" cy="9" r="2.3" /></svg>;
  }
}

// Founder badge. Gold star plus FOUNDER in a rounded amber outline pill,
// sitting under the name in the sidebar profile card, per the reference.
// Driven by profiles.is_founder, so adding a founder is a column update rather
// than a code change.
function FounderPill() {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        marginTop: 4, padding: '2px 9px 2px 7px',
        border: '1px solid #C68A2F', borderRadius: 999,
        color: '#E7BE7B', fontSize: 9, fontWeight: 700, letterSpacing: 1.1,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="#E7BE7B" aria-hidden="true">
        <path d="M6 0.6l1.62 3.34 3.68.52-2.66 2.58.63 3.66L6 8.97 2.73 10.7l.63-3.66L.7 4.46l3.68-.52z" />
      </svg>
      FOUNDER
    </span>
  );
}

// The floating hover label the collapsed rail leans on now lives in
// app/components/HoverLabel, shared with the student rail.

function SidebarInner({
  teacherName,
  teacherEmail,
  isFounder,
  plan,
  activeLabel = 'Dashboard',
  tourEnabled = true,
  collapsed = false,
  onNavigate,
  onOpenSupport,
  onStartTour,
}: {
  teacherName: string;
  teacherEmail: string;
  isFounder: boolean;
  /** The profiles.plan value. The band below names the tier from it. */
  plan: string | null;
  /** Which NAV_ITEMS label renders as the current page. Defaults to the value
   *  the dashboard had hardcoded, so /teacher is unchanged. */
  activeLabel?: string;
  /** Whether this page has tour targets. False renders no data-tour keys and
   *  no "Take a Tour" item, rather than pointing a walkthrough at a page whose
   *  steps are not on it. */
  tourEnabled?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
  onOpenSupport: () => void;
  /** Launches the tour. Passed by both rails -- the desktop aside and the
   *  compact slide-over -- so the entry point does not vanish at 1024px the way
   *  the rail itself does. */
  onStartTour?: () => void;
}) {
  const initials = teacherName.split(/[\s._-]+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'T';
  const { tip, hovered, showTip, hideTip } = useHoverLabel();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      {/* Collapsed side padding is tighter so the 44px mark clears the 64px
          rail without being squeezed. */}
      <div style={{ padding: collapsed ? '18px 8px 12px' : '22px 18px 14px' }}>
        <Brand collapsed={collapsed} />
      </div>

      {/* The tier band. A full-bleed band across the sidebar rather than an
          inset pill. Keeps the amber border/ink treatment, drops the dot, and
          centres the text; side borders are omitted so it reads as a band that
          meets both edges instead of a boxed-in chip.

          THE TEXT USED TO BE THE LITERAL 'TEACHER · PRO', for everyone. No
          Teacher Pro has ever sold, so every teacher who has ever seen this
          sidebar has been shown the name of a product nobody owns, and the
          first paying Teacher Core customer saw it too. It is derived from the
          plan now. Falls back to plain TEACHER rather than to a tier name: the
          page gate above guarantees a teacher plan, and if that ever stops
          being true this should go quiet, not guess. */}
      <div
        style={{
          borderTop: '1px solid rgba(198,138,47,0.45)',
          borderBottom: '1px solid rgba(198,138,47,0.45)',
          color: '#E7BE7B',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.4,
          padding: '6px 4px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {collapsed
          ? teacherTierLabel(plan) ?? 'TEACHER'
          : `TEACHER${teacherTierLabel(plan) ? ` · ${teacherTierLabel(plan)}` : ''}`}
      </div>

      <nav style={{ padding: collapsed ? '10px 8px' : '10px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowX: 'hidden' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === activeLabel;
          // The badge belongs to the NAME, not just to the sighted layout. It is
          // what a screen reader announces and what the collapsed rail's hover
          // label shows, because on that rail the tooltip is the only text there
          // is -- a teacher on the narrow rail would otherwise never learn the
          // feature is in beta. The hover comparison uses the same string so the
          // two cannot drift.
          const fullLabel = item.badge ? `${item.label} ${item.badge}` : item.label;
          const isHovered = hovered === fullLabel;
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-label={fullLabel}
              data-tour={tourEnabled ? item.tour : undefined}
              onMouseEnter={showTip(fullLabel)}
              onMouseLeave={hideTip}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 11,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '9px 11px', borderRadius: 8, fontSize: 13,
                fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                color: isActive ? '#E7BE7B' : 'rgba(255,255,255,0.64)',
                background: isActive
                  ? 'rgba(198,138,47,0.14)'
                  : isHovered ? 'rgba(255,255,255,0.06)' : 'transparent',
                transition: 'background 0.12s',
              }}
            >
              {/* navIcon still takes item.label, never fullLabel. */}
              <span style={{ flex: '0 0 17px', display: 'flex', alignItems: 'center' }}>{navIcon(item.label)}</span>
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                  {/* A real space, not just the margin below. The margin spaces
                      it on screen but leaves textContent reading
                      "Worksheets(Beta)", which is what a copy-paste and any
                      text-level assertion see. */}
                  {item.badge && ' '}
                  {item.badge && (
                    /* Quieter than the label it follows, so it reads as a note
                       about the item rather than as part of its name. aria-hidden
                       because aria-label above already carries it; without that
                       a screen reader says "Beta" twice. */
                    <span
                      aria-hidden="true"
                      style={{
                        marginLeft: 1,
                        fontSize: 10.5,
                        fontWeight: 500,
                        letterSpacing: 0.2,
                        color: isActive ? 'rgba(231,190,123,0.72)' : 'rgba(255,255,255,0.42)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: collapsed ? '14px 8px' : 14, borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
        {/* Account menu. Anchored above the avatar because the avatar sits at
            the bottom of the rail. */}
        {accountOpen && (
          <>
            <div onClick={() => setAccountOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 310 }} />
            <div
              role="menu"
              style={{
                position: 'absolute', bottom: 'calc(100% - 4px)', left: collapsed ? 8 : 14,
                minWidth: 178, zIndex: 320,
                background: '#fff', borderRadius: 11, padding: 5,
                border: '1px solid rgba(15,30,53,0.08)',
                boxShadow: '0 12px 34px rgba(15,30,53,0.24)',
              }}
            >
              <a
                role="menuitem"
                href="/teacher/settings"
                onClick={() => setAccountOpen(false)}
                style={menuItemStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.4" /><path d="M14.6 11.1a1.3 1.3 0 0 0 .26 1.43l.05.05a1.55 1.55 0 1 1-2.2 2.2l-.04-.05a1.3 1.3 0 0 0-1.43-.26 1.3 1.3 0 0 0-.79 1.19v.13a1.55 1.55 0 1 1-3.1 0v-.07a1.3 1.3 0 0 0-.85-1.19 1.3 1.3 0 0 0-1.43.26l-.05.05a1.55 1.55 0 1 1-2.2-2.2l.05-.05a1.3 1.3 0 0 0 .26-1.43 1.3 1.3 0 0 0-1.19-.79h-.13a1.55 1.55 0 1 1 0-3.1h.07a1.3 1.3 0 0 0 1.19-.85 1.3 1.3 0 0 0-.26-1.43l-.05-.05a1.55 1.55 0 1 1 2.2-2.2l.05.05a1.3 1.3 0 0 0 1.43.26h.06a1.3 1.3 0 0 0 .79-1.19v-.13a1.55 1.55 0 1 1 3.1 0v.07a1.3 1.3 0 0 0 .79 1.19 1.3 1.3 0 0 0 1.43-.26l.05-.05a1.55 1.55 0 1 1 2.2 2.2l-.05.05a1.3 1.3 0 0 0-.26 1.43v.06a1.3 1.3 0 0 0 1.19.79h.13a1.55 1.55 0 1 1 0 3.1h-.07a1.3 1.3 0 0 0-1.19.79z" /></svg>
                Account Settings
              </a>
              {tourEnabled && onStartTour && (
                <button
                  role="menuitem"
                  onClick={() => { setAccountOpen(false); onStartTour(); }}
                  style={{ ...menuItemStyle, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M11.9 6.1 L7.9 7.9 L6.1 11.9 L10.1 10.1 Z" /></svg>
                  Take a Tour
                </button>
              )}
              <button
                role="menuitem"
                onClick={() => { setAccountOpen(false); onOpenSupport(); }}
                style={{ ...menuItemStyle, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M6.9 6.8a2.15 2.15 0 0 1 4.18.72c0 1.43-2.15 2.15-2.15 2.15" /><circle cx="9" cy="13" r="0.55" fill="currentColor" stroke="none" /></svg>
                Help
              </button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start', flexDirection: collapsed ? 'column' : 'row' }}>
          <button
            type="button"
            aria-label="Profile"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            data-tour={tourEnabled ? 'profile' : undefined}
            onClick={() => setAccountOpen((v) => !v)}
            onMouseEnter={showTip('Profile')}
            onMouseLeave={hideTip}
            style={{
              width: 32, height: 32, borderRadius: '50%', background: '#1C3052', color: '#E7BE7B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flex: '0 0 32px',
              border: hovered === 'Profile' || accountOpen ? '1px solid rgba(231,190,123,0.55)' : '1px solid transparent',
              cursor: 'pointer', padding: 0, fontFamily: 'inherit',
            }}
          >
            {initials}
          </button>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherName}</div>
              {isFounder ? (
                <FounderPill />
              ) : (
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherEmail}</div>
              )}
            </div>
          )}

          {/* Logout keeps its own hover label, and stays present when
              collapsed -- stacked under the avatar rather than dropped, so the
              narrow rail is still a way out of the app. */}
          <span
            onMouseEnter={showTip('Logout')}
            onMouseLeave={hideTip}
            style={{ display: 'flex', flexShrink: 0 }}
          >
            <LogoutButton variant="dark" size={30} title={null} />
          </span>
        </div>
      </div>

      {tip && <HoverLabel tip={tip} />}
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '9px 11px', borderRadius: 8,
  fontSize: 13, fontWeight: 600, color: DASH.heading,
  textDecoration: 'none', fontFamily: 'inherit',
  transition: 'background 0.12s',
};

// ─── The shell ───────────────────────────────────────────────────────────────

// Sidebar rail widths. The gap between them is what the width transition
// animates across.
const SIDEBAR_W = 200;
const SIDEBAR_W_COLLAPSED = 64;

// The class every piece of shell chrome carries on the standalone variant, and
// nothing carries on the dashboard. It does two jobs, and both of them are
// about not changing pages that already work:
//
//   box-sizing. The dashboard's own <style> block opens with
//   `* { box-sizing: border-box }`. Nothing sets it globally -- globals.css
//   deliberately does not -- so on a page that is not the dashboard the rail
//   would land in content-box and the 32px profile chip would measure 34 and
//   the 26px collapse handle 28, throwing the handle a pixel off the seam it
//   is centred on. Scoped to the chrome rather than declared globally, because
//   the worksheet routes were laid out WITHOUT a global border-box and
//   switching it under them is a PR #200 regression waiting to happen.
//
//   print. See the note at the top of the file.
// CHROME_CLASS and the rules it carries now live in ./teacher-shell-css, a
// plain .ts module, so a harness can import the real stylesheet instead of
// keeping a second copy of the print rule. The hover keyframe is concatenated
// here rather than moved, because it comes from a .tsx module.
const STANDALONE_CSS = `
${HOVER_LABEL_CSS}
${SHELL_CHROME_CSS}
`;

// What the shell hands down to whatever it wraps.
//
// One entry, and it exists because of where the hamburger lives. On the
// dashboard the button that opens the slide-over is inside TopBar, which the
// shell renders no part of -- it arrives as children. The shell owns menuOpen,
// so TopBar has to be able to reach the opener from below rather than be handed
// it from above.
const TeacherShellContext = createContext<{ openMenu: () => void } | null>(null);

/** The shell's controls, for anything rendered inside it. */
export function useTeacherShell() {
  const ctx = useContext(TeacherShellContext);
  // Deliberately a throw and not a no-op default. A silently dead hamburger is
  // the kind of defect that ships: the button is there, it looks enabled, and
  // nothing happens. This fails on the first render instead.
  if (!ctx) throw new Error('useTeacherShell must be used inside <TeacherShell>');
  return ctx;
}

export default function TeacherShell({
  teacherName,
  teacherEmail,
  isFounder,
  plan,
  activeLabel,
  variant = 'dashboard',
  onOpenSupport,
  onStartTour,
  children,
}: {
  teacherName: string;
  teacherEmail: string;
  isFounder: boolean;
  plan: string | null;
  /** Which nav item reads as the current page. See SidebarInner. */
  activeLabel?: string;
  /** See the two-variants note at the top of the file. */
  variant?: 'dashboard' | 'standalone';
  /** Dashboard only. When passed, the shell calls it and renders no modal of
   *  its own, because TeacherDashboardClient already renders a SupportModal and
   *  moving it would move a node in the dashboard's tree. Omit it and the shell
   *  owns the state and the modal itself, which is what a standalone page
   *  wants: Help is role-agnostic and posts to the same /api/support either
   *  way, so there is no reason for it to be dead outside /teacher. */
  onOpenSupport?: () => void;
  /** Dashboard only. Omitted on standalone, where tourEnabled is false and the
   *  item is not rendered at all. */
  onStartTour?: () => void;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { isCompact } = useViewport();

  const standalone = variant === 'standalone';
  const chromeClass = standalone ? CHROME_CLASS : undefined;
  // Delegated when the caller passed a handler, owned when it did not.
  const openSupport = onOpenSupport ?? (() => setShowSupport(true));

  return (
    <TeacherShellContext.Provider value={{ openMenu: () => setMenuOpen(true) }}>
      {standalone && <style>{STANDALONE_CSS}</style>}

      {/* className only on the standalone variant, so the dashboard's outer
          element is the bare div it has always been. */}
      <div className={standalone ? SHELL_CLASS : undefined} style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT_BODY, color: DASH.ink }}>

        {/* Desktop sidebar. Width animates between the two rail widths; the
            z-index keeps the collapse handle and the hover labels above the
            sticky top bar. */}
        {!isCompact && (
          <aside
            className={chromeClass}
            // Marks the rail as a keep-out region for the tour card, which must
            // not be laid over it. Not a data-tour key: this is geometry the
            // tour reads, never a step target. Omitted where the tour does not
            // run, so a page with no steps carries no tour hooks either.
            data-tour-rail={standalone ? undefined : ''}
            style={{
              width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
              flex: `0 0 ${collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W}px`,
              background: '#0F1E35', color: '#fff',
              display: 'flex', flexDirection: 'column',
              position: 'sticky', top: 0, height: '100vh', zIndex: 30,
              transition: 'width 220ms ease, flex-basis 220ms ease',
            }}
          >
            <SidebarInner
              teacherName={teacherName}
              teacherEmail={teacherEmail}
              isFounder={isFounder}
              plan={plan}
              activeLabel={activeLabel}
              tourEnabled={!standalone}
              collapsed={collapsed}
              onOpenSupport={openSupport}
              onStartTour={onStartTour}
            />

            {/* Collapse handle, sat on the seam where the navy rail meets the
                white top bar. */}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                position: 'absolute', top: 46, right: -13, zIndex: 40,
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', border: '1px solid rgba(15,30,53,0.12)',
                boxShadow: '0 2px 8px rgba(15,30,53,0.18)',
                color: DASH.heading, cursor: 'pointer', padding: 0,
              }}
            >
              {/* Chevron flips to point the way the next click will move it. */}
              <svg
                width="13" height="13" viewBox="0 0 18 18" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease' }}
              >
                <polyline points="11 4 6 9 11 14" />
              </svg>
            </button>
          </aside>
        )}

        {/* Mobile/tablet slide-over sidebar. Always full width: the collapse
            handle is a desktop affordance, the slide-over already closes. */}
        {isCompact && menuOpen && (
          <div className={chromeClass} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,30,53,0.5)' }} />
            <aside style={{ position: 'relative', width: 240, maxWidth: '82vw', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
              <SidebarInner
                teacherName={teacherName}
                teacherEmail={teacherEmail}
                isFounder={isFounder}
                plan={plan}
                activeLabel={activeLabel}
                tourEnabled={!standalone}
                onNavigate={() => setMenuOpen(false)}
                onOpenSupport={() => { setMenuOpen(false); openSupport(); }}
                // Closing the slide-over first matters: it is a fixed, full
                // height panel, and leaving it up would cover the very targets
                // the first steps point at.
                onStartTour={onStartTour ? () => { setMenuOpen(false); onStartTour(); } : undefined}
              />
            </aside>
          </div>
        )}

        {/* The content column. The dashboard brings its own -- a <main> that
            already carries flex:1 and its own background -- so the shell must
            not add a second one there, or every node inside /teacher moves a
            level deeper. A standalone page gets one from the shell. */}
        {standalone ? (
          <div className="um-teacher-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* The compact opener. Below 1024px the rail above is not in the
                DOM at all, and on the dashboard the button that opens the
                slide-over lives in TopBar -- which a standalone page does not
                have. Without this the rail would simply be unreachable on a
                tablet. Styled as TopBar's own header and button so it reads as
                the same bar with everything else taken out of it. */}
            {isCompact && (
              <div
                className={CHROME_CLASS}
                style={{
                  background: '#fff', borderBottom: '1px solid rgba(15,30,53,0.08)',
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  position: 'sticky', top: 0, zIndex: 20,
                }}
              >
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 9, border: '1px solid #D3D1C7', background: '#fff', cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0F1E35" strokeWidth="1.8" strokeLinecap="round"><line x1="2.5" y1="5" x2="15.5" y2="5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><line x1="2.5" y1="13" x2="15.5" y2="13" /></svg>
                </button>
              </div>
            )}
            {children}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Only ever rendered when the caller did not pass onOpenSupport. */}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </TeacherShellContext.Provider>
  );
}
