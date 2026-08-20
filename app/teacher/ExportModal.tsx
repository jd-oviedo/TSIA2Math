'use client';

import { useState } from 'react';
import ModalShell from '../components/ModalShell';
import { DASH } from '../components/dashboard-theme';
import type { ClassRow } from './TeacherDashboardClient';

// The download control on the teacher dashboard.
//
// Navigates to the route rather than fetching and assembling a Blob. The
// response already carries Content-Disposition: attachment, so the browser
// saves it and never leaves the page; doing it with fetch would mean holding the
// whole file in memory, minting an object URL and cleaning it up, for no gain.
// It also means the download works with JavaScript doing nothing more than
// setting location, which is the simplest thing that can be correct.
//
// Two files here. Misconceptions lands in the second PR, scoped by what the
// Phase 1 audit found about where that data actually comes from.

type ExportKind = { key: string; label: string; blurb: string };

const EXPORTS: ExportKind[] = [
  {
    key: 'roster',
    label: 'Roster',
    blurb: 'One row per student. Latest score, band, and strand accuracy.',
  },
  {
    key: 'scores',
    label: 'Score history',
    blurb: 'One row per test session, ready to pivot. Every attempt, not just the latest.',
  },
];

export default function ExportModal({
  classes,
  selectedClassId,
  onClose,
}: {
  classes: ClassRow[];
  selectedClassId: string;
  onClose: () => void;
}) {
  // Opens on whatever class the dashboard is showing, which is almost always
  // the one being looked at. "All classes" is an explicit choice, never a
  // default, so a teacher cannot export the whole school by accident.
  const [allClasses, setAllClasses] = useState(false);
  const [picked, setPicked] = useState<string[]>(
    selectedClassId ? [selectedClassId] : []
  );
  const [includeEmail, setIncludeEmail] = useState(false);

  const effective = allClasses ? classes.map((c) => c.id) : picked;
  const canDownload = allClasses || picked.length > 0;

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function download(kind: string) {
    if (!canDownload) return;
    const params = new URLSearchParams({
      classes: allClasses ? 'all' : picked.join(','),
      email: includeEmail ? '1' : '0',
    });
    window.location.assign(`/api/teacher/export/${kind}?${params.toString()}`);
  }

  return (
    <ModalShell title="Export class data" onClose={onClose} maxWidth={520}>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: DASH.muted, lineHeight: 1.5 }}>
        Downloads a CSV you can open in Excel or Google Sheets.
      </p>

      {/* ─── Classes ─── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DASH.heading, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9 }}>
          Classes
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: `1px solid ${allClasses ? '#C68A2F' : DASH.line}`, borderRadius: 9, cursor: 'pointer', marginBottom: 8, background: allClasses ? '#FDF8F0' : '#fff' }}>
          <input
            type="checkbox"
            checked={allClasses}
            onChange={(e) => setAllClasses(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: '#C68A2F', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: DASH.ink }}>
            All classes
          </span>
          <span style={{ fontSize: 12, color: DASH.dim }}>
            ({classes.length})
          </span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: allClasses ? 0.45 : 1 }}>
          {classes.map((c) => (
            <label
              key={c.id}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', border: `1px solid ${DASH.line}`, borderRadius: 9, cursor: allClasses ? 'default' : 'pointer', background: !allClasses && picked.includes(c.id) ? DASH.subtleBg : '#fff' }}
            >
              <input
                type="checkbox"
                disabled={allClasses}
                checked={allClasses || picked.includes(c.id)}
                onChange={() => toggle(c.id)}
                style={{ width: 15, height: 15, accentColor: '#C68A2F', cursor: allClasses ? 'default' : 'pointer' }}
              />
              <span style={{ fontSize: 13.5, color: DASH.ink }}>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ─── Student email ─── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DASH.heading, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9 }}>
          Student email
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 12px', border: `1px solid ${DASH.line}`, borderRadius: 9, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeEmail}
            onChange={(e) => setIncludeEmail(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: '#C68A2F', cursor: 'pointer', marginTop: 2 }}
          />
          <span>
            <span style={{ display: 'block', fontSize: 13.5, color: DASH.ink, fontWeight: 600 }}>
              Include student email addresses
            </span>
            <span style={{ display: 'block', fontSize: 12, color: DASH.muted, marginTop: 2, lineHeight: 1.45 }}>
              Off by default. Leave it off unless the file needs to identify students outside your class list.
            </span>
          </span>
        </label>
      </div>

      {/* ─── Files ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {EXPORTS.map((x) => (
          <button
            key={x.key}
            onClick={() => download(x.key)}
            disabled={!canDownload}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left', padding: '12px 14px', border: `1px solid ${DASH.line}`, borderRadius: 10, background: canDownload ? '#fff' : DASH.subtleBg, cursor: canDownload ? 'pointer' : 'default', fontFamily: 'inherit', opacity: canDownload ? 1 : 0.55 }}
          >
            <span>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: DASH.heading }}>{x.label}</span>
              <span style={{ display: 'block', fontSize: 12, color: DASH.muted, marginTop: 2, lineHeight: 1.45 }}>{x.blurb}</span>
            </span>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="#C68A2F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
              <path d="M9 2v9" /><path d="M5 8l4 4 4-4" /><path d="M3 14v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
            </svg>
          </button>
        ))}
      </div>

      {!canDownload && (
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#9A2A2A' }}>
          Pick at least one class.
        </p>
      )}

      <p style={{ margin: '16px 0 0', fontSize: 11.5, color: DASH.dim, lineHeight: 1.5 }}>
        {effective.length === 1
          ? 'Exporting 1 class.'
          : `Exporting ${effective.length} classes.`}
        {' '}Exports are logged.
      </p>
    </ModalShell>
  );
}
