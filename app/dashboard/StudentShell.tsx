'use client';

import { useState } from 'react';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import {
  StudentNavPanel,
  StudentNavDrawer,
  StudentNavTrigger,
} from '@/app/components/StudentNav';

// The persistent shell for the student dashboard: a fixed rail on desktop, the
// shared slide-over on narrow screens, with the four routes rendering inside.
//
// The nav itself lives in app/components/StudentNav so the curriculum tree can
// render the same four destinations without a second implementation.
//
// Structurally this is the teacher dashboard's sidebar. The colours are not:
// that one runs on Deep Navy from the old --ec system, and this tree is on the
// curriculum palette.

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
        aria-label="Student navigation"
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
        <StudentNavPanel name={name} role={role} />
      </aside>

      <StudentNavDrawer
        open={menuOpen}
        name={name}
        role={role}
        onClose={() => setMenuOpen(false)}
      />

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
    </div>
  );
}
