'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { C } from './curriculum-theme';
import { FONT_HEADING, FONT_BODY } from './fonts';
import { LogoutButton } from './LogoutButton';
import { HoverLabel, useHoverLabel } from './HoverLabel';
import { RAIL_LIGHT, RAIL_DARK, V, type RailSurface } from './dashboard-theme';
import { useTheme } from '../theme/useTheme';
import { ThemeModeButton } from './ThemeModeButton';
import { teacherTierLabel } from '../lib/capabilities';

// Drawer motion. Enter decelerates so the panel settles; exit accelerates and is
// shorter, which is the conventional asymmetry and reads as more responsive.
// Both are suppressed under prefers-reduced-motion by the rule in DRAWER_CSS.
const ENTER_MS = 200;
const EXIT_MS = 160;

// Inline styles cannot express a media query, so the reduced-motion guard lives
// here. It zeroes the durations rather than removing the transform, so the panel
// still arrives in the right place, instantly. The unmount timer is a setTimeout
// rather than a transitionend listener precisely because this rule means
// transitionend may never fire.
const DRAWER_CSS = `
@media (prefers-reduced-motion: reduce) {
  .um-nav-drawer, .um-nav-scrim { transition-duration: 0ms !important; }
}`;

// The student navigation, shared by the /dashboard tree and the /course tree.
//
// One component, two presentations. The dashboard renders it as a permanent
// rail on desktop — collapsible down to an icon strip — and a slide-over on
// narrow screens. Curriculum pages render the slide-over at every width: a
// fixed rail beside a practice problem competes with the maths for attention,
// and those pages are meant to be the quiet ones.
//
// Structurally this mirrors the teacher sidebar: brand, role band, nav, then a
// profile button at the foot that opens an account menu, with logout and the
// dark-mode toggle beside it. It borrows the teacher rail's collapsed hover
// labels wholesale, from app/components/HoverLabel.
//
// The colours are not shared. The teacher rail is Deep Navy from the old --ec
// system and light-only; this one is Mercury Cream, and follows the app theme.
// Its two palettes live in dashboard-theme as RAIL_LIGHT / RAIL_DARK, kept as
// plain objects rather than the --umd-* variables the content area uses,
// because this component also renders inside the /course tree where the
// dashboard stylesheet is never loaded.

export const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Announcements', href: '/dashboard/announcements' },
  // Between the teacher's voice and the self-directed tree, because that is
  // what it is: work somebody else set, which Modules onward is not.
  { label: 'Assignments', href: '/dashboard/assignments' },
  { label: 'Modules', href: '/dashboard/modules' },
  { label: 'Grades', href: '/dashboard/grades' },
  // The only destination here that leaves the /dashboard tree. It is in this
  // list rather than beside it because from a student's side of the screen it
  // is simply another place to go, and splitting it out would say otherwise.
  { label: 'Take a Practice Test', href: '/adaptive-test' },
];

function navIcon(label: string) {
  const common = {
    width: 17,
    height: 17,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (label) {
    case 'Home':
      return (
        <svg {...common}>
          <path d="M2.4 7.4 L9 2.2 L15.6 7.4 V15 a1 1 0 0 1 -1 1 H3.4 a1 1 0 0 1 -1 -1 Z" />
          <path d="M7 16 v-5 h4 v5" />
        </svg>
      );
    case 'Announcements':
      return (
        <svg {...common}>
          <path d="M3 7 h3 l6 -3.4 v11 L6 11 H3 a1 1 0 0 1 -1 -1 V8 a1 1 0 0 1 1 -1 Z" />
          <path d="M14.4 6.6 a3.4 3.4 0 0 1 0 4.8" />
        </svg>
      );
    // A clipboard: work handed to you. It needs its own case for the reason the
    // Take-a-Practice-Test comment below records -- without one it would fall
    // through to `default` and inherit the Modules stack, so the rail would
    // carry two identical glyphs and this would read as a second Modules link.
    //
    // The clip at the top is what distinguishes it at 17px. It is deliberately
    // NOT a checked sheet: that is Take a Practice Test, three rows down.
    case 'Assignments':
      return (
        <svg {...common}>
          <path d="M6 3.6 H4.6 a1 1 0 0 0 -1 1 V15 a1 1 0 0 0 1 1 h8.8 a1 1 0 0 0 1 -1 V4.6 a1 1 0 0 0 -1 -1 H12" />
          <rect x="6" y="2" width="6" height="3.1" rx="1" />
          <line x1="6.4" y1="9.2" x2="11.6" y2="9.2" />
          <line x1="6.4" y1="12.2" x2="9.8" y2="12.2" />
        </svg>
      );
    // A checked circle: a result that has been marked. It shares a check with
    // Take a Practice Test three rows down, so the two are separated by their
    // containers -- a circle here, a portrait sheet there -- and by the check
    // itself, which is drawn larger, lower and further right than the sheet's.
    // Outline like the other five: `common` sets fill="none", so this is never
    // a filled disc.
    case 'Grades':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="6.6" />
          <polyline points="6 9.3 8.2 11.5 12.3 6.8" />
        </svg>
      );
    // A checked sheet. Distinct from Grades, whose check sits in a circle and
    // is drawn at a different scale and offset, and from the Modules stack --
    // without its own case this would silently inherit the stack from `default`
    // and read as a second Modules link.
    case 'Take a Practice Test':
      return (
        <svg {...common}>
          <path d="M4.6 2.4 h8.8 a1 1 0 0 1 1 1 v11.2 a1 1 0 0 1 -1 1 H4.6 a1 1 0 0 1 -1 -1 V3.4 a1 1 0 0 1 1 -1 Z" />
          <polyline points="6.4 9 8.1 10.7 11.6 6.6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="2.4" y="2.6" width="13.2" height="3.6" rx="1.1" />
          <rect x="2.4" y="7.6" width="13.2" height="3.6" rx="1.1" />
          <rect x="2.4" y="12.6" width="13.2" height="3.2" rx="1.1" />
        </svg>
      );
  }
}

function isActive(pathname: string, href: string) {
  // /dashboard would otherwise match every child route.
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}

// Wordmark expanded, the standalone mu mark collapsed. Same reasoning as the
// teacher rail: the mark only inks about half its own canvas, so it is sized
// well above nominal icon size to carry the same weight as the nav glyphs.
function Brand({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/unpackmath-wordmark.png"
      alt="UnpackMath"
      width={2000}
      height={485}
      style={{ width: 148, maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
    />
  );
}


export function StudentNavPanel({
  name,
  role,
  entitledTeacher,
  plan,
  preview = false,
  collapsed = false,
  mode,
  onNavigate,
  onOpenSupport,
}: {
  name: string;
  role: 'student' | 'teacher';
  entitledTeacher?: boolean;
  /** The profiles.plan value. The tier NAME comes from here and only here. */
  plan?: string | null;
  /** True when this viewer reached the student surface through the teacher
      second door (course-access.ts:162), i.e. Student View. Suppresses the tier
      name so the band reads PREVIEW. See the note on `tier` below. */
  preview?: boolean;
  collapsed?: boolean;
  /** Pin the rail to one palette. /course pages pass 'light'; the dashboard
      omits it and follows the app theme. */
  mode?: 'light' | 'dark';
  onNavigate?: () => void;
  onOpenSupport?: () => void;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const R: RailSurface = (mode ?? theme) === 'dark' ? RAIL_DARK : RAIL_LIGHT;

  // Collapsed, the rail is icons only, so it borrows the teacher sidebar's
  // floating hover label rather than leaning on native title tooltips.
  const { tip, hovered, showTip, hideTip } = useHoverLabel();
  const [accountOpen, setAccountOpen] = useState(false);

  // Cosmetic only, and split in two on purpose.
  //
  // entitledTeacher answers "should a tier be named at all", which is the
  // question the layout already decided and which the badge must not re-derive
  // from a payment column. teacherTierLabel answers "which tier", which is a
  // property of the PLAN.
  //
  // Those were one boolean until 2026-08-20, and it read
  // `role === 'teacher' && entitledTeacher`, which means entitled, not Pro. Every
  // Teacher Core teacher was shown TEACHER · PRO.
  //
  // AND A THIRD INPUT AS OF THIS CHANGE. `preview` answers "is this viewer here
  // as a teacher rather than as a learner", which neither of the other two can:
  // an entitled Teacher Core in Student View satisfies both of them and was shown
  // TEACHER · CORE, the name of the thing they bought, on a surface where they
  // own nothing and nothing they do is saved. Suppressing the tier is all that is
  // needed, because the badge below already falls back to PREVIEW when no tier is
  // named, which is the case this band was written for in the first place.
  const tier =
    role === 'teacher' && entitledTeacher && !preview ? teacherTierLabel(plan) : null;
  const initials =
    name
      .split(/[\s._@-]+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'S';

  // A teacher reaching this tree is here through "Student view", so the band
  // keeps saying teacher rather than mislabelling them.
  // PREVIEW when no tier is named, which is a teacher without a live teacher
  // entitlement: the "Student view" case the band exists for. Never a product
  // name by default.
  const badge =
    role === 'teacher'
      ? collapsed
        ? tier ?? 'PREVIEW'
        : `TEACHER · ${tier ?? 'PREVIEW'}`
      : 'STUDENT';

  return (
    <>
      <div style={{ padding: collapsed ? '18px 8px 12px' : '22px 18px 14px' }}>
        <Brand collapsed={collapsed} />
      </div>

      {/* Role band. Full-bleed between two hairlines rather than an inset pill,
          matching the teacher rail's tier band treatment. Ink is a rail
          token rather than Cipher Gold: the teacher band's gold reads on navy
          and vanishes on cream. */}
      <div
        style={{
          borderTop: `1px solid ${R.badgeLine}`,
          borderBottom: `1px solid ${R.badgeLine}`,
          color: R.badge,
          font: `700 9px ${FONT_BODY}`,
          letterSpacing: 1.4,
          padding: '6px 4px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {badge}
      </div>

      <nav
        style={{
          padding: collapsed ? '10px 8px' : '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const isHovered = hovered === item.label;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              onMouseEnter={showTip(item.label)}
              onMouseLeave={hideTip}
              className="um-nav-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 11,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius: 9,
                textDecoration: 'none',
                font: `${active ? 600 : 400} 13.5px ${FONT_BODY}`,
                color: active ? C.midnight : isHovered ? R.textStrong : R.text,
                background: active ? C.sunset : isHovered ? R.hoverBg : 'transparent',
                transition: 'background 0.12s',
              }}
            >
              <span style={{ flex: '0 0 17px', display: 'flex', alignItems: 'center' }}>
                {navIcon(item.label)}
              </span>
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {role === 'teacher' && (
        <div style={{ padding: collapsed ? '10px 8px 4px' : '10px 12px 4px', borderTop: `1px solid ${R.divider}` }}>
          <a
            href="/teacher"
            onClick={onNavigate}
            aria-label="Teacher Dashboard"
            onMouseEnter={showTip('Teacher Dashboard')}
            onMouseLeave={hideTip}
            className="um-nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 11,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '10px 12px',
              borderRadius: 9,
              textDecoration: 'none',
              font: `600 13.5px ${FONT_BODY}`,
              // Cipher Gold marked this out when the rail was black. On cream
              // it lands at 2.8:1, so the divider above and the heavier weight
              // carry the distinction instead of colour.
              color: R.text,
              background: hovered === 'Teacher Dashboard' ? R.hoverBg : 'transparent',
              transition: 'background 0.12s',
            }}
          >
            <span style={{ flex: '0 0 17px', display: 'flex', alignItems: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2.5 15.5 7 11 11.5" />
                <path d="M15.2 7 H4.5 a2 2 0 0 0 -2 2 V15" />
              </svg>
            </span>
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Teacher Dashboard</span>}
          </a>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: collapsed ? '14px 8px' : 14,
          borderTop: `1px solid ${R.divider}`,
          position: 'relative',
        }}
      >
        {/* Account menu, anchored above the avatar because the avatar sits at
            the foot of the rail. The transparent sheet behind it closes on any
            outside click. */}
        {accountOpen && (
          <>
            <div onClick={() => setAccountOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 310 }} />
            <div
              role="menu"
              style={{
                position: 'absolute',
                bottom: 'calc(100% - 4px)',
                left: collapsed ? 8 : 14,
                minWidth: 178,
                zIndex: 320,
                background: R.menuBg,
                borderRadius: 11,
                padding: 5,
                border: `1px solid ${R.menuBorder}`,
                boxShadow: R.menuShadow,
              }}
            >
              <a
                role="menuitem"
                href="/dashboard/settings"
                onClick={() => {
                  setAccountOpen(false);
                  onNavigate?.();
                }}
                style={{ ...menuItemStyle, color: R.menuText }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = R.menuHoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.4" /><path d="M14.6 11.1a1.3 1.3 0 0 0 .26 1.43l.05.05a1.55 1.55 0 1 1-2.2 2.2l-.04-.05a1.3 1.3 0 0 0-1.43-.26 1.3 1.3 0 0 0-.79 1.19v.13a1.55 1.55 0 1 1-3.1 0v-.07a1.3 1.3 0 0 0-.85-1.19 1.3 1.3 0 0 0-1.43.26l-.05.05a1.55 1.55 0 1 1-2.2-2.2l.05-.05a1.3 1.3 0 0 0 .26-1.43 1.3 1.3 0 0 0-1.19-.79h-.13a1.55 1.55 0 1 1 0-3.1h.07a1.3 1.3 0 0 0 1.19-.85 1.3 1.3 0 0 0-.26-1.43l-.05-.05a1.55 1.55 0 1 1 2.2-2.2l.05.05a1.3 1.3 0 0 0 1.43.26h.06a1.3 1.3 0 0 0 .79-1.19v-.13a1.55 1.55 0 1 1 3.1 0v.07a1.3 1.3 0 0 0 .79 1.19 1.3 1.3 0 0 0 1.43-.26l.05-.05a1.55 1.55 0 1 1 2.2 2.2l-.05.05a1.3 1.3 0 0 0-.26 1.43v.06a1.3 1.3 0 0 0 1.19.79h.13a1.55 1.55 0 1 1 0 3.1h-.07a1.3 1.3 0 0 0-1.19.79z" /></svg>
                Account Settings
              </a>
              <button
                role="menuitem"
                type="button"
                onClick={() => { setAccountOpen(false); onOpenSupport?.(); }}
                style={{ ...menuItemStyle, color: R.menuText, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = R.menuHoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M6.9 6.8a2.15 2.15 0 0 1 4.18.72c0 1.43-2.15 2.15-2.15 2.15" /><circle cx="9" cy="13" r="0.55" fill="currentColor" stroke="none" /></svg>
                Help
              </button>
            </div>
          </>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            flexDirection: collapsed ? 'column' : 'row',
          }}
        >
          <button
            type="button"
            aria-label="Profile"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((v) => !v)}
            onMouseEnter={showTip('Profile')}
            onMouseLeave={hideTip}
            style={{
              width: 32,
              height: 32,
              flex: '0 0 32px',
              borderRadius: '50%',
              background: C.sky,
              color: C.midnight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: `600 12px ${FONT_HEADING}`,
              border:
                hovered === 'Profile' || accountOpen
                  ? `1px solid ${R.avatarRing}`
                  : '1px solid transparent',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {initials}
          </button>

          {!collapsed && (
            <span
              style={{
                flex: 1,
                minWidth: 0,
                font: `400 12px ${FONT_BODY}`,
                color: R.meta,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          )}

          {/* Dark mode and logout both stay present when collapsed, stacked
              under the avatar rather than dropped: the narrow rail should still
              be a way to change the theme and a way out of the app. */}
          <span onMouseEnter={showTip('Dark mode')} onMouseLeave={hideTip} style={{ display: 'flex', flexShrink: 0 }}>
            <ThemeModeButton
              size={30}
              bg="transparent"
              hoverBg={R.hoverBg}
              border={R.divider}
              color={R.meta}
            />
          </span>

          <span onMouseEnter={showTip('Logout')} onMouseLeave={hideTip} style={{ display: 'flex', flexShrink: 0 }}>
            <LogoutButton variant={R.logoutVariant} size={30} title={null} />
          </span>
        </div>
      </div>

      {tip && <HoverLabel tip={tip} />}
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '9px 11px',
  borderRadius: 8,
  font: `600 13px ${FONT_BODY}`,
  textDecoration: 'none',
  transition: 'background 0.12s',
};

// The slide-over. Both trees use this; the dashboard only on narrow screens,
// curriculum pages at every width. Never collapsed: the collapse handle is a
// desktop-rail affordance, and the slide-over already closes.
export function StudentNavDrawer({
  open,
  name,
  role,
  entitledTeacher,
  plan,
  preview,
  mode,
  onClose,
  onOpenSupport,
}: {
  open: boolean;
  name: string;
  role: 'student' | 'teacher';
  entitledTeacher?: boolean;
  plan?: string | null;
  /** True when this viewer reached the student surface through the teacher
      second door (course-access.ts:162), i.e. Student View. Suppresses the tier
      name so the band reads PREVIEW. See the note on `tier` below. */
  preview?: boolean;
  mode?: 'light' | 'dark';
  onClose: () => void;
  onOpenSupport?: () => void;
}) {
  return <DrawerBody open={open} name={name} role={role} entitledTeacher={entitledTeacher} plan={plan} preview={preview} mode={mode} onClose={onClose} onOpenSupport={onOpenSupport} />;
}

// Split out so the hook below is never called conditionally.
function DrawerBody({
  open,
  name,
  role,
  entitledTeacher,
  plan,
  preview,
  mode,
  onClose,
  onOpenSupport,
}: {
  open: boolean;
  name: string;
  role: 'student' | 'teacher';
  entitledTeacher?: boolean;
  plan?: string | null;
  /** True when this viewer reached the student surface through the teacher
      second door (course-access.ts:162), i.e. Student View. Suppresses the tier
      name so the band reads PREVIEW. See the note on `tier` below. */
  preview?: boolean;
  mode?: 'light' | 'dark';
  onClose: () => void;
  onOpenSupport?: () => void;
}) {
  const { theme } = useTheme();
  const R: RailSurface = (mode ?? theme) === 'dark' ? RAIL_DARK : RAIL_LIGHT;

  // ─── Why this is mounted-but-hidden rather than unmounted ────────────────────
  //
  // This was `if (!open) return null`, which is why the drawer had no motion in
  // either direction: it appeared and vanished instantly. An enter animation
  // could have been added to that structure; an EXIT animation cannot, because a
  // node that has already unmounted has nothing left to animate.
  //
  // So the node stays mounted and slides. `rendered` keeps it in the tree for one
  // exit transition after `open` goes false, then drops it, so a drawer that has
  // never been opened costs nothing and a closed one is not left holding a
  // fixed-position overlay over the page.
  const frame = useRef(0);
  const [rendered, setRendered] = useState(open);
  // Separate from `rendered` on purpose. The panel has to be in the DOM at
  // translateX(-100%) for one frame BEFORE it moves, or the browser has no
  // starting value to interpolate from and the transition is skipped entirely.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      // Two frames, not one. A single rAF still lands in the same style
      // recalculation as the mount on some engines, and the transition is
      // dropped; the second frame guarantees the initial transform has been
      // committed.
      const a = requestAnimationFrame(() => {
        const b = requestAnimationFrame(() => setShown(true));
        frame.current = b;
      });
      frame.current = a;
      return () => cancelAnimationFrame(frame.current);
    }
    setShown(false);
    // Unmount after the exit finishes. A timer rather than transitionend
    // because transitionend does not fire when the motion is suppressed under
    // prefers-reduced-motion, which would leave the overlay mounted forever.
    const t = setTimeout(() => setRendered(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  // The Escape key. The overlay is click-to-close and always was; a drawer that
  // traps a keyboard user with no way out is the version of that which nobody
  // notices until someone cannot use it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <>
      <style>{DRAWER_CSS}</style>
    <div
      role="presentation"
      className="um-nav-scrim"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(14,14,17,.45)',
        display: 'flex',
        // The scrim fades with the panel rather than snapping in ahead of it.
        opacity: shown ? 1 : 0,
        transition: `opacity ${shown ? ENTER_MS : EXIT_MS}ms linear`,
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        aria-label="Student navigation"
        className="um-nav-drawer"
        style={{
          width: 244,
          maxWidth: '82vw',
          background: R.bg,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          // Left to right on the way in, right to left on the way out. Exits are
          // faster than entrances and accelerate out; entrances decelerate so the
          // panel arrives and settles rather than stopping dead.
          transform: shown ? 'translateX(0)' : 'translateX(-100%)',
          transition: shown
            ? `transform ${ENTER_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
            : `transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1)`,
          // The 24px blurred shadow this carried was decoration on a panel already
          // separated from the page by a full-screen scrim, which is the "shadow
          // used as decoration" the redesign rules out. Gone.
        }}
      >
        <StudentNavPanel
          name={name}
          role={role}
          entitledTeacher={entitledTeacher}
          plan={plan}
          preview={preview}
          mode={mode}
          onNavigate={onClose}
          onOpenSupport={onOpenSupport}
        />
      </aside>
    </div>
    </>
  );
}

// The button that opens the drawer. Top-left on curriculum pages.
export function StudentNavTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation"
      aria-haspopup="dialog"
      style={{
        width: 38,
        height: 38,
        flex: 'none',
        borderRadius: 10,
        border: 'none',
        // THE FALLBACK IS LOAD-BEARING, AND THIS BUTTON RENDERS IN TWO SCOPES.
        // --umd-* is declared on .um-dash only (dashboard-theme.ts:469-476), and
        // this trigger also mounts inside .um-topic, where it is declared
        // nowhere. background-color does not inherit, so an unresolvable var()
        // is invalid at computed-value time and falls to `transparent` -- the
        // chip simply vanished on every curriculum page, in both themes.
        //
        // WHY --umt-quiet-box AND NOT --umt-inset-row. The chip sits on the bar,
        // which is V.cardBg on the dashboard and T.panel here, and it has to
        // read as the same object on both. quietBox holds the dashboard chip's
        // DIRECTION in both themes -- darker than its ground in light (1.13 vs
        // the dashboard's 1.04), lighter in dark (1.07 vs 1.08). insetRow does
        // not: it is darker than panel in dark too (#232220 under #262521), so
        // it would read as a hole where the dashboard reads as a raised tile.
        //
        // On .um-dash the first var resolves and the fallback is never reached,
        // so the dashboard chip is byte-identical to what it was.
        background: 'var(--umd-subtle-bg, var(--umt-quiet-box))',
        color: V.heading,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="17" height="17" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <line x1="2.5" y1="4.5" x2="15.5" y2="4.5" />
        <line x1="2.5" y1="9" x2="15.5" y2="9" />
        <line x1="2.5" y1="13.5" x2="15.5" y2="13.5" />
      </svg>
    </button>
  );
}
