'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DASH, DASH_FLAT, flatPanelStyle } from '../../components/dashboard-theme';
import { CTA, CTA_INK, INK_2 } from '../dashboard-chrome';
import { FONT_BODY, FONT_HEADING } from '../../components/fonts';
import { LetterChip, type SerializedLetter } from './grade-ui';

// The full roster, with a grade column.
//
// TWO FETCHES, IN PARALLEL, AND NEITHER RECOMPUTES THE OTHER'S NUMBERS.
// /api/teacher/roster owns the diagnostic-score half of a roster row and has
// since Build 1; /api/teacher/grades owns the letter. Joining them here by
// student_id is the only thing this component does that either route does not,
// and it means the letter beside a name is the same value, from the same
// rollupLetter call, as the one on the grid and on the student's own gradebook.
//
// A LETTER MAY BE MISSING WITHOUT THE ROW BEING WRONG. If the grades fetch
// fails while the roster succeeds, the column renders "—" with no subtitle and
// the rest of the row is still useful. That is deliberately the same dash the
// withheld state uses, because to a teacher both mean "no grade here yet" and
// neither is actionable; the console carries the difference.

type RosterRow = {
  student_id: string;
  name: string;
  email: string;
  initials: string;
  attempt_count: number;
  latest_session: { final_score: number | null; completed_at: string } | null;
};

type GradesRow = { student_id: string; letter: SerializedLetter };

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  return `${Math.floor(days / 7)}w ago`;
}

function useIsMobile() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w < 640;
}

export default function StudentsClient({ classId }: { classId: string }) {
  const [roster, setRoster] = useState<RosterRow[] | null>(null);
  const [letters, setLetters] = useState<Map<string, SerializedLetter>>(new Map());
  const [failed, setFailed] = useState(false);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setFailed(false);
    setRoster(null);
    const [rosterRes, gradesRes] = await Promise.all([
      fetch(`/api/teacher/roster?class_id=${classId}`),
      fetch(`/api/teacher/grades?class_id=${classId}`),
    ]);

    if (!rosterRes.ok) {
      setFailed(true);
      setRoster([]);
      return;
    }
    const rosterBody = await rosterRes.json();
    setRoster(rosterBody.roster ?? []);

    // The grades half is allowed to fail on its own. See the header.
    if (gradesRes.ok) {
      const gradesBody = await gradesRes.json();
      setLetters(new Map((gradesBody.students ?? []).map((s: GradesRow) => [s.student_id, s.letter])));
    } else {
      console.error('[teacher/students] grades fetch failed:', gradesRes.status);
      setLetters(new Map());
    }
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  if (roster === null) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div
          style={{
            width: 30,
            height: 30,
            // The dashboard's own spinner, exactly: a DASH_FLAT.panelHairline
            // #E8E4DA ring with a Sunset Orange #F0A33E leading edge.
            // TeacherDashboardClient's Spinner. Retires #C68A2F.
            border: `3px solid ${DASH_FLAT.panelHairline}`,
            borderTopColor: CTA,
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'um-spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (failed) {
    return (
      <div style={card()}>
        <p style={{ margin: 0, font: `400 14px ${FONT_BODY}`, color: '#9A2A2A' }}>Could not load this class.</p>
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div style={{ ...card(), textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: INK_2 }}>No students enrolled yet.</p>
        <p style={{ margin: 0, font: `400 13px ${FONT_BODY}`, color: DASH.dim }}>
          Share the join code from the dashboard, or invite students by email.
        </p>
      </div>
    );
  }

  const gradebookHref = (id: string) => `/teacher/students/grades/${id}?class_id=${classId}`;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {roster.map((s) => (
          <div key={s.student_id} style={{ ...card(), padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <Avatar initials={s.initials} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: `600 13.5px ${FONT_BODY}`, color: DASH.ink }}>{s.name}</div>
                  <div style={{ font: `400 11.5px ${FONT_BODY}`, color: DASH.dim }}>{s.email}</div>
                </div>
              </div>
              <LetterChip letter={letters.get(s.student_id) ?? MISSING} size="sm" showSubtitle={false} />
            </div>
            <div style={{ marginTop: 10, font: `400 11.5px ${FONT_BODY}`, color: DASH.dim }}>
              {subtitleOf(letters.get(s.student_id))}
            </div>
            {/* THE ROSTER ENTRY POINT. Same route, same page, as the grid cell
                and the student-detail banner button. */}
            <Link href={gradebookHref(s.student_id)} className="um-tdash-view" style={linkStyle({ marginTop: 12, display: 'inline-block' })}>
              View gradebook <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ ...card(), overflowX: 'auto', padding: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
        <caption className="um-visually-hidden">
          Every student in this class, with their overall grade
        </caption>
        <thead>
          <tr style={{ background: DASH.subtleBg, borderBottom: `1px solid ${DASH_FLAT.panelHairline}` }}>
            {['Student', 'Grade', 'Practice test', 'Tests', 'Last active', ''].map((h) => (
              <th
                key={h}
                scope="col"
                style={{
                  textAlign: h === 'Tests' ? 'center' : 'left',
                  padding: h === '' || h === 'Student' ? '11px 20px' : '11px 14px',
                  font: `700 11px ${FONT_BODY}`,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: DASH.dim,
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roster.map((s, i) => (
            <tr key={s.student_id} className="um-tdash-row" style={{ borderBottom: i < roster.length - 1 ? `1px solid ${DASH_FLAT.panelHairline}` : 'none' }}>
              <td style={{ padding: '13px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Avatar initials={s.initials} />
                  <div>
                    <div style={{ font: `600 13.5px ${FONT_BODY}`, color: DASH.ink }}>{s.name}</div>
                    <div style={{ font: `400 11.5px ${FONT_BODY}`, color: DASH.dim }}>{s.email}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '13px 14px' }}>
                <LetterChip letter={letters.get(s.student_id) ?? MISSING} />
              </td>
              <td style={{ padding: '13px 14px' }}>
                <span style={{ font: `700 15px ${FONT_HEADING}`, color: DASH.heading, fontVariantNumeric: 'tabular-nums' }}>
                  {s.latest_session?.final_score ?? '—'}
                </span>
              </td>
              <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                <span style={{ font: `600 13.5px ${FONT_BODY}`, color: INK_2, fontVariantNumeric: 'tabular-nums' }}>
                  {s.attempt_count}
                </span>
              </td>
              <td style={{ padding: '13px 14px' }}>
                <span style={{ font: `400 12.5px ${FONT_BODY}`, color: DASH.dim }}>
                  {s.latest_session ? timeAgo(s.latest_session.completed_at) : '—'}
                </span>
              </td>
              <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                <Link href={gradebookHref(s.student_id)} className="um-tdash-view" style={linkStyle({ whiteSpace: 'nowrap' })}>
                  Gradebook <span aria-hidden="true">&rarr;</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * What the column shows when the grades fetch itself failed.
 *
 * A withheld-shaped value rather than a null branch, so the cell renders through
 * the SAME component as every other dash. The empty subtitle is what
 * distinguishes it on screen: no honest count, because there is no count.
 */
const MISSING: SerializedLetter = {
  kind: 'withheld',
  reason: 'unavailable',
  display: '—',
  subtitle: '',
  graded_topics: 0,
  graded_items: 0,
};

function subtitleOf(letter: SerializedLetter | undefined): string {
  if (!letter) return '';
  return letter.kind === 'withheld' ? letter.subtitle : `${letter.percent}% overall`;
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        // The dashboard roster avatar, mirrored exactly: 34px, round, Sunset
        // Orange fill with #111111 on it at 9.00. It was Deep Navy with white,
        // which is now the rail's ground rather than an avatar's.
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: CTA,
        color: CTA_INK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `700 12px ${FONT_BODY}`,
        flex: '0 0 34px',
      }}
    >
      {initials}
    </div>
  );
}

// BYTE-IDENTICAL TO THE DASHBOARD'S PANEL, through the same function.
//
// This was one of three private copies of the same rounded-with-shadow object
// (here, GradesGridClient, GradebookClient), which is how the three of them
// stayed in step by luck rather than by construction. They now all spread
// flatPanelStyle() and the luck is no longer load-bearing. The padding is the
// one thing that stays local, because it is the only value the three copies
// were ever going to want to differ on.
function card(): React.CSSProperties {
  return { ...flatPanelStyle(), padding: '16px 18px' };
}

// The dashboard's roster link, and the class that carries it does the colour:
// --umt-view-ink resolves to DASH.link #2F6091 and hovers to DASH.linkHover
// #0F69BA, with the arrow nudging 2px. No `color` here at all, so the variable
// is not overridden by an inline prop. Retires #C68A2F as an ink.
function linkStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return { font: `700 13px ${FONT_BODY}`, textDecoration: 'none', ...extra };
}
