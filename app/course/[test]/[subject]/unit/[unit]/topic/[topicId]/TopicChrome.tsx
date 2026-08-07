'use client';

import { useState } from 'react';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import SupportModal from '@/app/components/SupportModal';
import { StudentNavDrawer, StudentNavTrigger } from '@/app/components/StudentNav';

// The course bar at the top of every topic page, with the nav menu in the
// top-left corner.
//
// Collapsed by default at every width, unlike the dashboard where the same nav
// is a permanent rail. A fixed 208px panel beside a practice problem competes
// with the maths for attention, and these pages are meant to be the quiet ones.
// The drawer itself is the shared component, so both trees stay in step.

export default function TopicChrome({
  name,
  role,
  test,
  subject,
  subjectLabel,
  unit,
}: {
  name: string;
  role: 'student' | 'teacher';
  test: string;
  subject: string;
  subjectLabel: string;
  unit: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      <div
        className="um-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 22px',
          background: C.paper,
          borderBottom: `1px solid ${ink(0.09)}`,
        }}
      >
        <StudentNavTrigger onClick={() => setMenuOpen(true)} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/unpackmath-wordmark.png"
          alt="UnpackMath"
          style={{ height: '22px', width: 'auto', display: 'block' }}
        />
        <div style={{ width: '1px', height: '20px', background: ink(0.12) }} />
        <div
          className="um-bar-trail"
          style={{ font: `400 13px ${FONT_BODY}`, color: ink(0.6), lineHeight: 1.3 }}
        >
          <a href={`/course/${test}/${subject}`} style={{ color: 'inherit' }}>
            {test.toUpperCase()} ·{' '}
            <span style={{ textTransform: 'capitalize' }}>{subjectLabel}</span>
          </a>
          <span style={{ color: ink(0.3), padding: '0 6px' }}>/</span>
          <a href={`/course/${test}/${subject}/unit/${unit}`} style={{ color: 'inherit' }}>
            Unit {unit}
          </a>
        </div>
      </div>

      <StudentNavDrawer
        open={menuOpen}
        name={name}
        role={role}
        onClose={() => setMenuOpen(false)}
        onOpenSupport={() => setShowSupport(true)}
        /* These pages are light-only by design, so the drawer stays light here
           even for a student who has dark mode on elsewhere. */
        mode="light"
      />

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </>
  );
}
