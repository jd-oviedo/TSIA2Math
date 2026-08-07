'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { C } from './curriculum-theme';
import { FONT_HEADING, FONT_BODY } from './fonts';
import { LogoutButton } from './LogoutButton';
import { HoverLabel, useHoverLabel } from './HoverLabel';
import { RAIL_LIGHT, RAIL_DARK, V, type RailSurface } from './dashboard-theme';
import { useTheme } from '../theme/useTheme';
import { ThemeModeButton } from './ThemeModeButton';

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
  { label: 'Modules', href: '/dashboard/modules' },
  { label: 'Grades', href: '/dashboard/grades' },
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
    case 'Grades':
      return (
        <svg {...common}>
          <line x1="3" y1="15.2" x2="15" y2="15.2" />
          <rect x="4.2" y="8.4" width="2.8" height="5" rx="0.8" />
          <rect x="8.6" y="5.2" width="2.8" height="8.2" rx="0.8" />
          <rect x="13" y="10.4" width="2.8" height="3" rx="0.8" />
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
      style={{ width: 148, maxWidth: '100%', height: 'auto', display: 'block' }}
    />
  );
}


export function StudentNavPanel({
  name,
  role,
  subscriptionStatus,
  collapsed = false,
  mode,
  onNavigate,
  onOpenSupport,
}: {
  name: string;
  role: 'student' | 'teacher';
  subscriptionStatus?: 'active' | 'inactive';
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

  const isProTeacher = role === 'teacher' && subscriptionStatus === 'active';
  const initials =
    name
      .split(/[\s._@-]+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'S';

  // A teacher reaching this tree is here through "Student view", so the band
  // keeps saying teacher rather than mislabelling them.
  const badge =
    role === 'teacher'
      ? collapsed
        ? isProTeacher ? 'PRO' : 'PREVIEW'
        : isProTeacher ? 'TEACHER · PRO' : 'TEACHER · PREVIEW'
      : 'STUDENT';

  return (
    <>
      <div style={{ padding: collapsed ? '18px 8px 12px' : '22px 18px 14px' }}>
        <Brand collapsed={collapsed} />
      </div>

      {/* Role band. Full-bleed between two hairlines rather than an inset pill,
          matching the teacher rail's TEACHER · PRO treatment. Ink is a rail
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
  subscriptionStatus,
  mode,
  onClose,
  onOpenSupport,
}: {
  open: boolean;
  name: string;
  role: 'student' | 'teacher';
  subscriptionStatus?: 'active' | 'inactive';
  mode?: 'light' | 'dark';
  onClose: () => void;
  onOpenSupport?: () => void;
}) {
  return <DrawerBody open={open} name={name} role={role} subscriptionStatus={subscriptionStatus} mode={mode} onClose={onClose} onOpenSupport={onOpenSupport} />;
}

// Split out so the hook below is never called conditionally.
function DrawerBody({
  open,
  name,
  role,
  subscriptionStatus,
  mode,
  onClose,
  onOpenSupport,
}: {
  open: boolean;
  name: string;
  role: 'student' | 'teacher';
  subscriptionStatus?: 'active' | 'inactive';
  mode?: 'light' | 'dark';
  onClose: () => void;
  onOpenSupport?: () => void;
}) {
  const { theme } = useTheme();
  const R: RailSurface = (mode ?? theme) === 'dark' ? RAIL_DARK : RAIL_LIGHT;

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(14,14,17,.45)',
        display: 'flex',
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        aria-label="Student navigation"
        style={{
          width: 244,
          maxWidth: '82vw',
          background: R.bg,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          boxShadow: '4px 0 24px rgba(14,14,17,.28)',
        }}
      >
        <StudentNavPanel
          name={name}
          role={role}
          subscriptionStatus={subscriptionStatus}
          mode={mode}
          onNavigate={onClose}
          onOpenSupport={onOpenSupport}
        />
      </aside>
    </div>
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
        background: V.subtleBg,
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
