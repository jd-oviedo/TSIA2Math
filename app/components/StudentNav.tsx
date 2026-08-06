'use client';

import { usePathname } from 'next/navigation';
import { C, onDark } from './curriculum-theme';
import { FONT_HEADING, FONT_BODY } from './fonts';

// The student navigation, shared by the /dashboard tree and the /course tree.
//
// One component, two presentations. The dashboard renders it as a permanent
// 208px rail on desktop and a slide-over on narrow screens. Curriculum pages
// render the slide-over at every width: a fixed rail beside a practice problem
// competes with the maths for attention, and those pages are meant to be the
// quiet ones.

export const NAV_ITEMS = [
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

export function StudentNavPanel({
  name,
  role,
  subscriptionStatus,
  onNavigate,
}: {
  name: string;
  role: 'student' | 'teacher';
  subscriptionStatus?: 'active' | 'inactive';
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isProTeacher = role === 'teacher' && subscriptionStatus === 'active';
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
            {isProTeacher ? 'TEACHER PRO' : 'TEACHER PREVIEW'}
          </div>
        )}
      </div>

      <nav style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
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

      {role === 'teacher' && (
        <div style={{ padding: '10px 12px 4px', borderTop: `1px solid ${onDark(0.12)}` }}>
          <a
            href="/teacher"
            onClick={onNavigate}
            className="um-nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 12px',
              borderRadius: 9,
              textDecoration: 'none',
              font: `600 13.5px ${FONT_BODY}`,
              color: C.gold,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 2.5 15.5 7 11 11.5" />
              <path d="M15.2 7 H4.5 a2 2 0 0 0 -2 2 V15" />
            </svg>
            Teacher Dashboard
          </a>
        </div>
      )}

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

// The slide-over. Both trees use this; the dashboard only on narrow screens,
// curriculum pages at every width.
export function StudentNavDrawer({
  open,
  name,
  role,
  subscriptionStatus,
  onClose,
}: {
  open: boolean;
  name: string;
  role: 'student' | 'teacher';
  subscriptionStatus?: 'active' | 'inactive';
  onClose: () => void;
}) {
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
          background: C.midnight,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          boxShadow: '4px 0 24px rgba(0,0,0,.3)',
        }}
      >
        <StudentNavPanel
          name={name}
          role={role}
          subscriptionStatus={subscriptionStatus}
          onNavigate={onClose}
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
        background: C.sand,
        color: C.midnight,
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
