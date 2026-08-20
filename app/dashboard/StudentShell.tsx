'use client';

import { useEffect, useState } from 'react';
import { FONT_BODY } from '@/app/components/fonts';
import SupportModal from '@/app/components/SupportModal';
import { V, RAIL_LIGHT, RAIL_DARK } from '@/app/components/dashboard-theme';
import { useTheme } from '@/app/theme/useTheme';
import {
  StudentNavPanel,
  StudentNavDrawer,
  StudentNavTrigger,
} from '@/app/components/StudentNav';

// The persistent shell for the student dashboard: a collapsible rail on
// desktop, the shared slide-over on narrow screens, with the five routes
// rendering inside.
//
// The nav itself lives in app/components/StudentNav so the curriculum tree can
// render the same destinations without a second implementation.
//
// The content area is the teacher dashboard's, exactly: same background, same
// card treatment, off the shared tokens in app/components/dashboard-theme so
// the two cannot drift. Only the rail differs — Mercury Cream where the teacher
// rail is Deep Navy.
//
// Unlike the teacher dashboard this tree follows the app's light/dark theme.
// The pages under it are server components and cannot read it, so the surface
// arrives as --umd-* custom properties and this component only has to say which
// set applies, via data-theme.

const RAIL_W = 208;
const RAIL_W_COLLAPSED = 64;

// Every page under /dashboard is a server render reached by a full navigation,
// so the collapsed state would reset on each click if it lived only in React.
// It is read back on mount rather than during the first render: the server has
// no way to know it, and reading it inline would hydrate mismatched.
const COLLAPSE_KEY = 'um-student-rail-collapsed';

export default function StudentShell({
  name,
  role,
  entitledTeacher,
  plan,
  children,
}: {
  name: string;
  role: 'student' | 'teacher';
  entitledTeacher?: boolean;
  /** Passed straight through to the rail, which names the tier from it. */
  plan?: string | null;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { theme } = useTheme();
  const rail = theme === 'dark' ? RAIL_DARK : RAIL_LIGHT;

  useEffect(() => {
    try {
      if (window.localStorage.getItem(COLLAPSE_KEY) === '1') setCollapsed(true);
    } catch {
      // Private-mode storage denial is not worth surfacing; the rail just
      // starts expanded.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* see above */
      }
      return next;
    });
  }

  return (
    <div
      className="um-dash"
      data-theme={theme}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        background: V.pageBg,
        color: V.ink,
        fontFamily: FONT_BODY,
      }}
    >
      <aside
        className="um-sidebar"
        aria-label="Student navigation"
        style={{
          width: collapsed ? RAIL_W_COLLAPSED : RAIL_W,
          flex: `0 0 ${collapsed ? RAIL_W_COLLAPSED : RAIL_W}px`,
          background: rail.bg,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          zIndex: 30,
          transition: 'width 220ms ease, flex-basis 220ms ease',
        }}
      >
        <StudentNavPanel
          name={name}
          role={role}
          entitledTeacher={entitledTeacher}
          plan={plan}
          collapsed={collapsed}
          onOpenSupport={() => setShowSupport(true)}
        />

        {/* Collapse handle, sat on the seam where the rail meets the page. */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute',
            top: 46,
            right: -13,
            zIndex: 40,
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: V.cardBg,
            border: `1px solid ${V.cardBorder}`,
            boxShadow: V.cardShadowHover,
            color: V.heading,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {/* Chevron points the way the next click will move the rail. */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease' }}
          >
            <polyline points="11 4 6 9 11 14" />
          </svg>
        </button>
      </aside>

      <StudentNavDrawer
        open={menuOpen}
        name={name}
        role={role}
        entitledTeacher={entitledTeacher}
        plan={plan}
        onClose={() => setMenuOpen(false)}
        onOpenSupport={() => setShowSupport(true)}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          className="um-topbar"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: V.cardBg,
            borderBottom: `1px solid ${V.cardBorder}`,
          }}
        >
          <StudentNavTrigger onClick={() => setMenuOpen(true)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/unpackmath-wordmark.png"
            alt="UnpackMath"
            style={{ height: 20, width: 'auto', display: 'block' }}
          />
        </div>

        <main
          className="um-dash-main"
          style={{ flex: 1, width: '100%', maxWidth: 940, margin: '0 auto', padding: '34px 34px 72px' }}
        >
          {children}
        </main>
      </div>

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </div>
  );
}
