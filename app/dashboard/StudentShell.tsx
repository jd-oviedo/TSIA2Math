'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { C, ink, onDark } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// The persistent shell for the student dashboard: a fixed sidebar on desktop,
// a slide-over on narrow screens, with the four routes rendering inside it.
//
// Structurally this is the teacher dashboard's sidebar -- 200px sticky aside,
// nav list, mobile slide-over behind a hamburger. The colours are not: that one
// runs on Deep Navy from the old --ec system, and this tree is on the
// curriculum palette, so the same pattern is rebuilt in Deep Midnight rather
// than imported and recoloured in place.

const NAV = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Announcements', href: '/dashboard/announcements' },
  { label: 'Grades', href: '/dashboard/grades' },
  { label: 'Modules', href: '/dashboard/modules' },
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

function SidebarInner({
  name,
  role,
  onNavigate,
}: {
  name: string;
  role: 'student' | 'teacher';
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const initials =
    name
      .split(/[\s._@-]+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'S';

  return (
    <>
      <div style={{ padding: '22px 18px 16px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/unpackmath-wordmark.png"
          alt="UnpackMath"
          width={2000}
          height={485}
          style={{ width: 148, maxWidth: '100%', height: 'auto', display: 'block' }}
        />
        {role === 'teacher' && (
          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 5,
              boxShadow: `inset 0 0 0 1px ${C.gold}66`,
              font: `700 9px ${FONT_BODY}`,
              letterSpacing: '0.14em',
              color: C.gold,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold }} />
            TEACHER PREVIEW
          </div>
        )}
      </div>

      <nav style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className="um-nav-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 12px',
                borderRadius: 9,
                textDecoration: 'none',
                font: `${active ? 600 : 400} 13.5px ${FONT_BODY}`,
                color: active ? C.midnight : onDark(0.62),
                background: active ? C.sunset : 'transparent',
              }}
            >
              {navIcon(item.label)}
              {item.label}
            </a>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: '16px 18px',
          borderTop: `1px solid ${onDark(0.12)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            flex: 'none',
            borderRadius: '50%',
            background: C.sky,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: `600 12px ${FONT_HEADING}`,
            color: C.midnight,
          }}
        >
          {initials}
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            font: `400 12px ${FONT_BODY}`,
            color: onDark(0.55),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </span>
      </div>
    </>
  );
}

export default function StudentShell({
  name,
  role,
  children,
}: {
  name: string;
  role: 'student' | 'teacher';
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="um-dash"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        background: C.cream,
        color: C.midnight,
        fontFamily: FONT_BODY,
      }}
    >
      <aside
        className="um-sidebar"
        style={{
          width: 208,
          flex: '0 0 208px',
          background: C.midnight,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100dvh',
        }}
      >
        <SidebarInner name={name} role={role} />
      </aside>

      {menuOpen && (
        <div
          className="um-scrim"
          role="presentation"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(14,14,17,.45)',
            display: 'flex',
          }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 244,
              maxWidth: '82vw',
              background: C.midnight,
              display: 'flex',
              flexDirection: 'column',
              height: '100dvh',
              boxShadow: '4px 0 24px rgba(0,0,0,.3)',
            }}
          >
            <SidebarInner name={name} role={role} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          className="um-topbar"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: C.paper,
            borderBottom: `1px solid ${ink(0.09)}`,
          }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: 'none',
              background: C.sand,
              color: C.midnight,
              cursor: 'pointer',
              font: '16px system-ui',
            }}
          >
            ☰
          </button>
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
    </div>
  );
}
