'use client';

import React from 'react';
import { FONT_HEADING } from './fonts';
import { DASH } from './dashboard-theme';

// The teacher dashboard's modal chrome, lifted out of TeacherDashboardClient so
// the export dialog can use it without either file importing the other.
//
// Verbatim apart from `maxWidth`, which the invite and new-class modals leave at
// the 420 they have always used, and the export dialog widens for a class list.

export default function ModalShell({
  title,
  onClose,
  children,
  maxWidth = 420,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,30,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(15,30,53,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: DASH.dim, padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
