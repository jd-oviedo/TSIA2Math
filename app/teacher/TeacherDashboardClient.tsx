'use client';

import { useState, useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import MathText from '../components/MathText';
import { FONT_HEADING, FONT_BASE_CSS } from '../components/fonts';
import { DASH, flatPanelStyle, DASH_FLAT } from '../components/dashboard-theme';
import { CTA, CTA_INK, NAVY, INK_2, DASH_HOVER_CSS } from './dashboard-chrome';
import { HOVER_LABEL_CSS } from '../components/HoverLabel';
import { useBodyBackground } from '../components/useBodyBackground';
import TeacherShell, { useViewport, useTeacherShell } from './TeacherShell';
import NewAnnouncement from './NewAnnouncement';
import NewAssignment, { type AssignTopic } from './NewAssignment';
import AssignmentsPanel from './AssignmentsPanel';
import SupportModal from '../components/SupportModal';
import ModalShell from '../components/ModalShell';
import ExportModal from './ExportModal';
import TeacherTour, { TOUR_STORAGE_KEY } from './TeacherTour';
import { OFFICIAL_LEVELS, type OfficialLevel } from "../lib/official-scores";
import {
  PASSING,
  STRAND_ORDER as ORDER,
  placementBand,
  strandPcts,
  type Strand,
  type StrandBreakdown,
} from "../lib/placement";
import { STRAND_TINT } from "../lib/strands";
import { SPIN_CSS } from '../motion';

// ─── Types (match the API route response shapes) ─────────────────────────────

export interface ClassRow {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
}

// Strand and StrandBreakdown now live in app/lib/placement.ts, shared with the
// CSV exports so the file and the screen cannot disagree.

interface RosterRow {
  student_id: string;
  email: string;
  name: string;
  initials: string;
  enrolled_via: string;
  enrolled_at: string;
  attempt_count: number;
  latest_session: {
    id: string;
    final_score: number | null;
    strand_breakdown: StrandBreakdown | null;
    completed_at: string;
  } | null;
  // Most recent official sitting only. Decision 5. The full history and the
  // delta live on the student detail page; no delta is returned here at all,
  // because a field present in the response is a field a later edit renders.
  official_score: {
    official_crc_score: number;
    test_date: string;
    level_qr: OfficialLevel | null;
    level_ar: OfficialLevel | null;
    level_gr: OfficialLevel | null;
    level_pr: OfficialLevel | null;
  } | null;
}

interface Misconception {
  rank: number;
  // Taxonomy slug. Grouping key — one card per slug, across every item.
  misconception_tag: string;
  // Prose from one representative item, not a definition of the slug. Paired
  // with item_count so the card reads as an example rather than the whole
  // misconception.
  distractor_text: string;
  example_item_id: string;
  example_selected_answer: string;
  item_count: number;
  primary_strand: string;
  topic_id: string;
  topic_count: number;
  frequency: number;
  affected_students: number;
}

// A roster row reshaped for display.
interface DisplayStudent {
  student_id: string;
  name: string;
  email: string;
  initials: string;
  score: number | null;
  band: string;
  bandBg: string;
  bandText: string;
  bandDot: string;
  tested: boolean;
  wQR: number; wAR: number; wGR: number; wPR: number;
  weakColor: string;
  weakLabel: string;
  weakPct: number;
  tests: number;
  active: string;
  // NO DELTA HERE, deliberately. Decision 6 keeps the official-minus-practice
  // number on the student detail page and in the export, never in a roster cell:
  // a delta needs its interval named beside it to mean anything, and a roster
  // cell has no room to name one.
  officialScore: number | null;
  officialDate: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STR: Record<Strand, { code: string; name: string; short: string; color: string }> = {
  QR: { code: 'QR', name: 'Quantitative Reasoning', short: 'Quantitative Reasoning', color: STRAND_TINT.QR },
  AR: { code: 'AR', name: 'Algebraic Reasoning', short: 'Algebraic Reasoning', color: STRAND_TINT.AR },
  GR: { code: 'GR', name: 'Geometric & Spatial', short: 'Geometric and Spatial Reasoning', color: STRAND_TINT.GR },
  PR: { code: 'PR', name: 'Probabilistic & Statistical', short: 'Probabilistic and Statistical Reasoning', color: STRAND_TINT.PR },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  return `${Math.floor(days / 7)}w ago`;
}

function toDisplayStudent(r: RosterRow): DisplayStudent {
  const score = r.latest_session?.final_score ?? null;
  const band = placementBand(score);
  const acc = strandPcts(r.latest_session?.strand_breakdown ?? null);
  const sum = ORDER.reduce((a, k) => a + acc[k], 0);
  const width = (k: Strand) => (sum > 0 ? Math.round((acc[k] / sum) * 1000) / 10 : 25);
  // Weakest strand = lowest accuracy among strands the student actually attempted.
  let wk: Strand = ORDER[0];
  ORDER.forEach((k) => { if (acc[k] < acc[wk]) wk = k; });
  const tested = r.latest_session !== null && r.attempt_count > 0;
  return {
    student_id: r.student_id,
    name: r.name,
    email: r.email,
    initials: r.initials,
    score,
    band: band.label,
    bandBg: band.bg,
    bandText: band.text,
    bandDot: band.dot,
    tested,
    wQR: width('QR'), wAR: width('AR'), wGR: width('GR'), wPR: width('PR'),
    weakColor: STR[wk].color,
    weakPct: acc[wk],
    weakLabel: tested ? `${wk} ${acc[wk]}%` : '—',
    tests: r.attempt_count,
    active: r.latest_session ? timeAgo(r.latest_session.completed_at) : '—',
    officialScore: r.official_score?.official_crc_score ?? null,
    officialDate: r.official_score?.test_date ?? null,
  };
}

/**
 * The official score cell.
 *
 * A SCORE AND A DATE, AND NOTHING ELSE. No delta (decision 6), no band chip, no
 * strand detail. The roster answers "did this student sit it and what did they
 * get"; everything that needs an interval named beside it is on the detail page.
 *
 * An em-dash-free "Not recorded" rather than a bare dash, because a blank cell
 * on a roster reads as a loading failure and this state is neither an error nor
 * unusual: most students will have no official result for most of the year.
 */
function OfficialScoreCell({ s }: { s: DisplayStudent }) {
  if (s.officialScore === null) {
    return <span style={{ fontSize: 12.5, color: DASH.dim }}>Not recorded</span>;
  }
  return (
    <div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: DASH.heading,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {s.officialScore}
      </div>
      {s.officialDate && (
        <div style={{ fontSize: 11.5, color: DASH.dim, marginTop: 2 }}>
          {new Date(`${s.officialDate.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </div>
      )}
    </div>
  );
}

/**
 * The class rollup, matching ClassRollup in app/lib/curriculum-rollup.ts.
 *
 * Every field is a count of students or of topics. There is no score anywhere in
 * this shape and no completed_at stamp: the route strips both server-side, so
 * this type is the full extent of what the dashboard could render even if a
 * future edit tried to.
 */
interface CurriculumRollup {
  enrolled: number;
  workedThisWeek: number;
  started: number;
  notStarted: number;
  completeTotal: number;
  completeMedian: number;
  topicsTotal: number;
  furthestUnit: { unit: number; students: number }[];
}

// ─── Summary cards ───────────────────────────────────────────────────────────

function SummaryCards({ enrolled, notTested, crCount, crPct, weakStrand, avgScore, cols }: {
  enrolled: number; notTested: number; crCount: number; crPct: number | null;
  weakStrand: { code: string; name: string; color: string; pct: number } | null;
  avgScore: number | null; cols: number;
}) {
  const card = { ...flatPanelStyle(), padding: '18px 18px 16px' };
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase' as const, color: DASH.dim };
  return (
    <div data-tour="summary" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16, marginBottom: 16 }}>
      <div style={card}>
        <div style={labelStyle}>Students enrolled</div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{enrolled}</div>
        <div style={{ marginTop: 9, fontSize: 12, color: INK_2 }}>{notTested > 0 ? `${notTested} not yet tested` : 'All students tested'}</div>
      </div>
      <div style={card}>
        <div style={labelStyle}>College ready</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{crCount}</span>
          {crPct !== null && <span style={{ fontSize: 15, fontWeight: 600, color: '#4F9A2E' }}>{crPct}%</span>}
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: INK_2 }}>Scored ≥ 950 on TSIA2</div>
      </div>

      {/* THE FOCUS CARD, AND THE ONLY WARM SAND ON THE SCREEN.
          ================================================================
          #F2EDDF appears exactly once in the dashboard tree, here. That is
          the whole reason it works: on a page of white panels a single sand
          fill is a place to look, and a second one anywhere would spend it.
          If a later card wants to feel important, it does not get this fill.

          The old version was a THREE-COLOUR amber card -- #FBF4E6 fill, a
          gold-tinted border, an amber shadow, an amber eyebrow at #9A6A1F,
          amber body text at #7A5B2A, and a gold FOCUS chip. Five values
          doing one job. It is now the flat panel's own hairline, ordinary
          ink, and one orange badge.

          THE STRAND NAME IS DARK INK, NOT GOLD. It is the answer the card
          exists to give, so it reads at 16.48 like any other headline.

          AND NO CIPHER GOLD ANYWHERE ON THIS CARD, on the measurement.
          #C8A96E on #F2EDDF is 1.92:1 -- gold and sand are the same hue at
          two lightnesses, so gold ink on a sand fill is close to invisible
          whatever it is labelling. Gold keeps its one job on this surface,
          the FOUNDER pill on the navy rail, where it measures 7.44. */}
      <div style={{ ...flatPanelStyle(), background: DASH_FLAT.focusFill, padding: '18px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...labelStyle, color: INK_2 }}>Weakest strand</span>
          {/* Orange as a BADGE FILL with dark ink on it at 9.00. */}
          {weakStrand && (
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.7, color: CTA_INK, background: CTA, padding: '2px 6px' }}>FOCUS</span>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: DASH.heading, lineHeight: 1.05 }}>{weakStrand ? weakStrand.name : 'No focus yet'}</span>
        </div>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: INK_2 }}>
          {weakStrand ? (
            <>
              <span style={{ width: 9, height: 9, background: weakStrand.color, display: 'inline-block' }} />
              <span>{weakStrand.code} · <span style={{ fontWeight: 700, color: DASH.heading }}>{weakStrand.pct}%</span> class accuracy</span>
            </>
          ) : <span>No test data yet</span>}
        </div>
      </div>

      <div style={card}>
        <div style={labelStyle}>Average score</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{avgScore ?? '—'}</span>
          {avgScore !== null && <span style={{ fontSize: 14, fontWeight: 600, color: DASH.dim }}>/ 990</span>}
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: INK_2 }}>Passing 950 · scale 910 to 990</div>
      </div>
    </div>
  );
}

// ─── Strand mastery panel ─────────────────────────────────────────────────────

// COMPACT HORIZONTAL ROW, replacing four 118px columns.
//
// The old panel spent 118px of height per strand on a vertical bar whose only
// job was to encode one percentage that was already printed beside it at 24px.
// The bar is now a 4px horizontal rule under the label, which encodes the same
// number in a tenth of the space, and the whole panel drops from roughly 200px
// to roughly 120px. That height is what buys the Announcements and Assignments
// row above it.
//
// LABELS IN THE STRAND COLOUR, per the restyle -- but the CODE only, and never
// the percentage. STRAND_TINT is a FILL SET: all four are pale enough to carry
// Deep Midnight at 12+ and none of them is legible as ink on white (QR #B5D4F4
// measures 1.72). So the code sits on a filled chip and takes the dark ink the
// tint was designed for, which is the same move the printed sheet and the
// worksheet chrome make with the identical four hexes.
function StrandPanel({ strandPct, totalAttempts, cols }: { strandPct: Record<Strand, number>; totalAttempts: number; cols: number }) {
  return (
    <div data-tour="strand" style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: DASH.heading }}>Class strand mastery</h2>
          <div style={{ marginTop: 3, fontSize: 12, color: INK_2 }}>Average accuracy by TSIA2 reasoning strand</div>
        </div>
        <div style={{ fontSize: 11, color: DASH.dim, fontWeight: 600 }}>{totalAttempts} attempts this class</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 20 }}>
        {ORDER.map((code) => (
          <div key={code}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: CTA_INK, background: STR[code].color, padding: '2px 7px' }}>{code}</span>
              <span style={{ fontSize: 19, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {strandPct[code]}<span style={{ fontSize: 11, color: DASH.dim, fontWeight: 600 }}>%</span>
              </span>
            </div>
            {/* The indicator. A 4px well with a tinted fill, and no radius, so
                a strand at 3% still reads as a sliver rather than as a dot. */}
            <div style={{ marginTop: 9, height: 4, background: DASH.trackBg, overflow: 'hidden' }}>
              <div style={{ width: `${strandPct[code]}%`, height: '100%', background: STR[code].color }} />
            </div>
            <div style={{ marginTop: 7, fontSize: 11, color: INK_2, lineHeight: 1.35 }}>{STR[code].short}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Curriculum rollup panel ─────────────────────────────────────────────────
//
// How far this class is through the 97-topic course, beside StrandPanel's
// picture of how they perform on the practice test. Two different questions --
// coursework done, and accuracy when tested -- and a teacher needs both.
//
// STATUS ONLY, NO GRADES, and no per-student rows. The roster below already owns
// per-student rows and the student detail page owns the per-topic list; this
// panel is the aggregate and stays the aggregate.
//
// THE HEADLINE IS ACTIVITY, NOT COMPLETION, and that was decided on the data.
// Measured in production 2026-08-24: zero completed topics exist anywhere in
// Sample Class 1, so a completion headline renders 0 and tells a teacher nothing
// they can act on. "Worked this week" is the number that actually moves between
// one Monday and the next. Completion is still shown -- honestly, as whatever it
// is -- in the cells underneath.

function CurriculumRollupPanel({ rollup, cols }: { rollup: CurriculumRollup | null; cols: number }) {
  // THE ONE NEW CONTROL IN THIS RESTYLE. Everything else on the screen is an
  // existing element wearing new values; this is a piece of behaviour that did
  // not exist before.
  //
  // OPEN BY DEFAULT, AND UNPERSISTED, deliberately. This is the tallest panel
  // on the page and the collapse exists so a teacher who has read it can get
  // the roster above the fold, not so the product can decide it is unimportant.
  // Storing the choice would mean a teacher who collapsed it once in September
  // never seeing curriculum progress again, which is a worse failure than
  // re-collapsing it on each visit. If it should persist, it belongs with the
  // other per-teacher flags in profiles, not in localStorage.
  //
  // The headline stays visible when collapsed: the whole point of collapsing is
  // to keep the number and drop the detail.
  const [collapsed, setCollapsed] = useState(false);
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase' as const, color: DASH.dim };
  const subCard = { ...flatPanelStyle(), background: DASH.subtleBg, padding: '16px 18px' };

  if (!rollup) return null;

  const { enrolled, workedThisWeek, started, notStarted, completeTotal, completeMedian, topicsTotal, furthestUnit } = rollup;

  // The tallest cell sets the bar height. An all-zero distribution divides by 1
  // rather than by 0, so every bar is flat instead of NaN-tall.
  const peak = Math.max(1, ...furthestUnit.map((u) => u.students));

  return (
    <div style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: DASH.heading }}>Curriculum progress</h2>
          <div style={{ marginTop: 3, fontSize: 12, color: INK_2 }}>Course status across {topicsTotal} topics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: DASH.dim, fontWeight: 600 }}>Status only · no scores</span>
          {/* Dashboard Navy outline, the secondary treatment. Not orange: the
              page already spends its one primary on New class in the top bar,
              and a collapse is the least consequential control here. */}
          <button
            type="button"
            className="um-tdash-ghost"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-controls="curriculum-rollup-detail"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: `1px solid ${NAVY}`, borderRadius: 0, padding: '5px 10px',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            }}
          >
            <svg
              className="um-tdash-chev"
              width="11" height="11" viewBox="0 0 12 12" fill="none"
              stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
              style={{ transform: collapsed ? 'rotate(-90deg)' : 'none' }}
            >
              <polyline points="2.5 4.5 6 8 9.5 4.5" />
            </svg>
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {/* The headline. Survives the collapse. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{workedThisWeek}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: INK_2 }}>of {enrolled} {enrolled === 1 ? 'student' : 'students'} worked on the course this week</span>
      </div>
      <div style={{ fontSize: 12, color: INK_2, marginBottom: collapsed ? 0 : 18 }}>Any topic opened in the last 7 days</div>

      {/* `hidden` rather than an unmount, so aria-controls above always points
          at an element that exists and the three cards do not re-mount on every
          toggle. */}
      <div id="curriculum-rollup-detail" hidden={collapsed}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16, marginBottom: 20 }}>
          {/* Not started. The card that names people to chase, and the reason it is
              a card and not the headline: it is a standing fact about a class,
              where the headline is the thing that changed.
              WARN-TONED ONLY WHEN THERE IS SOMETHING TO WARN ABOUT. A zero in an
              amber alarm card, over the words "every student has opened a topic",
              is good news wearing a warning's clothes -- and a teacher who learns
              that this card is amber when nothing is wrong stops reading it when
              something is. */}
          <div style={notStarted > 0
            ? { ...flatPanelStyle(), background: DASH.noticeWarnBg, borderColor: 'rgba(168,99,31,0.28)', padding: '16px 18px' }
            : subCard}>
            <div style={{ ...labelStyle, color: notStarted > 0 ? DASH.noticeWarn : DASH.dim }}>Not started</div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{notStarted}</div>
            <div style={{ marginTop: 9, fontSize: 12, color: notStarted > 0 ? DASH.ink : INK_2 }}>{notStarted === 0 ? 'Every student has opened a topic' : `${started} of ${enrolled} have opened a topic`}</div>
          </div>

          <div style={subCard}>
            <div style={labelStyle}>Topics complete</div>
            <div style={{ marginTop: 10, fontSize: 26, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{completeTotal}</div>
            <div style={{ marginTop: 9, fontSize: 12, color: INK_2 }}>Across the whole class</div>
          </div>

          <div style={subCard}>
            <div style={labelStyle}>Median per student</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{completeMedian}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: DASH.dim }}>/ {topicsTotal}</span>
            </div>
            {/* Median, not mean, and it says so: one keen student must not be able
                to speak for the class. */}
            <div style={{ marginTop: 9, fontSize: 12, color: INK_2 }}>Middle student, not the average</div>
          </div>
        </div>

        {/* Furthest unit reached.

            COLUMN COUNT COMES OFF furthestUnit.length, NOT A LITERAL SIX. The
            rollup builds one cell per unit present in curriculum_topics
            (app/lib/curriculum-rollup.ts:199), so a seventh unit appears here
            the day it is authored. It renders six today because there are six.

            ORANGE FILL, replacing DASH.statusProgress #A8631F. The bar is a
            FILL and carries no text, which is the role the palette keeps
            Sunset Orange for. Its height is still proportional to the tallest
            cell and nothing about the computation moved. */}
        <div style={{ borderTop: `1px solid ${DASH_FLAT.panelHairline}`, paddingTop: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>Furthest unit reached</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${furthestUnit.length},1fr)`, gap: 10, alignItems: 'end' }}>
            {furthestUnit.map((cell) => (
              <div key={cell.unit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: cell.students > 0 ? DASH.heading : DASH.dim, fontVariantNumeric: 'tabular-nums' }}>{cell.students}</div>
                <div style={{ width: '100%', height: 56, background: DASH.trackBg, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: `${(cell.students / peak) * 100}%`, background: CTA }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: DASH.heading }}>Unit {cell.unit}</div>
              </div>
            ))}
          </div>
          {/* Students who have started nothing sit in no cell at all. Said out
              loud, because a strip whose numbers do not add to the roster looks
              like a bug otherwise. */}
          <div style={{ marginTop: 11, fontSize: 11.5, color: DASH.dim }}>
            {notStarted > 0
              ? `${notStarted} ${notStarted === 1 ? 'student is' : 'students are'} not counted here, because they have not opened a topic`
              : 'Every enrolled student appears in one column'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Strand profile bar (proportional) ───────────────────────────────────────

function StrandProfileBar({ s }: { s: DisplayStudent }) {
  if (!s.tested) {
    return <div style={{ fontSize: 11.5, color: '#A8A69D' }}>No test data</div>;
  }
  return (
    <>
      <div style={{ width: '100%', maxWidth: 180, height: 9, borderRadius: 20, overflow: 'hidden', display: 'flex', gap: 1.5, background: '#F0EEE7' }}>
        <div style={{ width: `${s.wQR}%`, background: STRAND_TINT.QR }} />
        <div style={{ width: `${s.wAR}%`, background: STRAND_TINT.AR }} />
        <div style={{ width: `${s.wGR}%`, background: STRAND_TINT.GR }} />
        <div style={{ width: `${s.wPR}%`, background: STRAND_TINT.PR }} />
      </div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: DASH.dim }}>
        <span style={{ width: 7, height: 7, borderRadius: 2, background: s.weakColor, display: 'inline-block' }} />
        <span>Weakest · <span style={{ fontWeight: 600, color: DASH.muted }}>{s.weakLabel}</span></span>
      </div>
    </>
  );
}

// ─── Misconception card ───────────────────────────────────────────────────────

function MiscCard({ m, testedCount }: { m: Misconception; testedCount: number }) {
  const strandColor = STR[(m.primary_strand as Strand)]?.color ?? '#D3D1C7';
  const reach = testedCount > 0 ? Math.min(100, Math.round((m.affected_students / testedCount) * 100)) : 0;
  return (
    // The hover was a shadow swap (cardShadow to cardShadowHover) held in React
    // state. Flat has no shadow to swap, so the edge darkens instead, through
    // .um-tdash-panel's --umt-panel-edge. That also retires the useState: the
    // old pair of handlers re-rendered the whole card twice per pointer pass to
    // change one property CSS can change on its own.
    <div
      className="um-tdash-panel"
      style={{ ...flatPanelStyle(), padding: 18, display: 'flex', flexDirection: 'column', minHeight: 182 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, background: NAVY, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 28px' }}>{m.rank}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: DASH.heading }}>
            <span style={{ width: 9, height: 9, background: strandColor, display: 'inline-block' }} />
            {m.primary_strand}
          </span>
        </div>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: INK_2, background: DASH.trackBg, padding: '3px 7px', whiteSpace: 'nowrap' }}>
          {m.topic_id}{m.topic_count > 1 ? ` +${m.topic_count - 1}` : ''}
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#26262A', flex: '1 1 auto', maxHeight: 88, overflow: 'hidden' }}>
        <MathText text={m.distractor_text} />
      </div>
      {/* One representative example, labelled as such once the same
          misconception shows up on more than one item. Without this the card
          reads as if the prose were the definition of the misconception. */}
      <div style={{ fontSize: 11, color: INK_2, marginTop: 8 }}>
        {m.item_count > 1
          ? `Example of ${m.item_count} items where this appeared`
          : 'Seen on 1 item'}
      </div>
      <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${DASH_FLAT.panelHairline}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 12, color: INK_2 }}>
          <span style={{ fontWeight: 700, color: DASH.ink }}>Selected {m.frequency}×</span>
          <span style={{ color: '#C9C7BE', margin: '0 6px' }}>·</span>
          <span>{m.affected_students} {m.affected_students === 1 ? 'student' : 'students'}</span>
        </div>
        {/* Honest reach indicator: share of tested students who hit this misconception. */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div style={{ width: 84, height: 6, background: DASH.trackBg, overflow: 'hidden' }}>
            <div style={{ width: `${reach}%`, height: '100%', background: strandColor }} />
          </div>
          <span style={{ fontSize: 9.5, letterSpacing: 0.4, color: DASH.dim, textTransform: 'uppercase' }}>{reach}% of class</span>
        </div>
      </div>
    </div>
  );
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ classId, onClose }: { classId: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/teacher/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, class_id: classId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      } else {
        setStatus('success');
        setMessage(data.status === 'enrolled' ? `${email} was already a user — enrolled directly.` : `Invite sent to ${email}.`);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  }

  return (
    <ModalShell title="Invite by email" onClose={onClose}>
      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <div style={{ fontSize: 32, marginBottom: 10, color: '#4F9A2E' }}>✓</div>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#356B1B', fontWeight: 600 }}>{message}</p>
          <button onClick={onClose} className="um-tdash-cta" style={{ padding: '10px 24px', border: 'none', borderRadius: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: CTA_INK }}>Done</button>
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: INK_2, lineHeight: 1.5 }}>
            Enter a student email. If they already have an account they&apos;ll be enrolled immediately. Otherwise they&apos;ll receive an invite link.
          </p>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setMessage(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="student@school.edu"
            type="email"
            style={{ width: '100%', border: `1px solid ${status === 'error' ? '#C2402F' : DASH_FLAT.panelHairline}`, borderRadius: 0, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', color: DASH.ink, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
          />
          {status === 'error' && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#C2402F' }}>{message}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={onClose} className="um-tdash-ghost" style={{ flex: 1, padding: '10px 0', border: `1px solid ${NAVY}`, borderRadius: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={status === 'loading' || !email}
              className="um-tdash-cta"
              style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 0, background: status === 'loading' ? '#F6D3A0' : undefined, cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: CTA_INK }}>
              {status === 'loading' ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

// ─── New class modal ──────────────────────────────────────────────────────────

function NewClassModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: ClassRow) => void }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      } else {
        onCreated(data.class);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  }

  return (
    <ModalShell title="Create a class" onClose={onClose}>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: INK_2, lineHeight: 1.5 }}>
        Give your class a name. A join code is generated automatically so students can enroll.
      </p>
      <input
        value={name}
        onChange={(e) => { setName(e.target.value); setStatus('idle'); setMessage(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="e.g. TSIA2 Prep, Period 2"
        autoFocus
        style={{ width: '100%', border: `1px solid ${status === 'error' ? '#C2402F' : DASH_FLAT.panelHairline}`, borderRadius: 0, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', color: DASH.ink, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
      />
      {status === 'error' && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#C2402F' }}>{message}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onClose} className="um-tdash-ghost" style={{ flex: 1, padding: '10px 0', border: `1px solid ${NAVY}`, borderRadius: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>Cancel</button>
        <button onClick={handleSubmit} disabled={status === 'loading' || !name.trim()}
          className="um-tdash-cta"
          style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 0, background: status === 'loading' ? '#F6D3A0' : undefined, cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: CTA_INK }}>
          {status === 'loading' ? 'Creating…' : 'Create class'}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────

function TopBar({ classes, selectedClassId, onSelectClass, joinCode, onInvite, onNewClass, isMobile, isCompact }: {
  classes: ClassRow[]; selectedClassId: string; onSelectClass: (id: string) => void;
  joinCode: string | null; onInvite: () => void; onNewClass: () => void;
  isMobile: boolean; isCompact: boolean;
}) {
  const [copied, setCopied] = useState(false);
  // The slide-over this opens belongs to TeacherShell now, so the opener comes
  // up from the shell rather than down from the dashboard. Same button, same
  // attributes; only where the callback comes from changed.
  const { openMenu } = useTeacherShell();
  function copyCode() {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header style={{ background: DASH.cardBg, borderBottom: `1px solid ${DASH_FLAT.panelHairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: isMobile ? '10px 16px' : '0 28px', minHeight: 60, flexWrap: isMobile ? 'wrap' : 'nowrap', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {isCompact && (
          <button onClick={openMenu} aria-label="Open menu" data-tour="menu-button" className="um-tdash-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 0, border: `1px solid ${NAVY}`, cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"><line x1="2.5" y1="5" x2="15.5" y2="5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><line x1="2.5" y1="13" x2="15.5" y2="13" /></svg>
          </button>
        )}
        {classes.length > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DASH.cardBg, border: `1px solid ${DASH_FLAT.panelHairline}`, borderRadius: 0, padding: '4px 8px 4px 12px', minWidth: 0 }}>
            <select
              value={selectedClassId}
              onChange={(e) => onSelectClass(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: DASH.ink, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', maxWidth: isMobile ? 180 : 280, textOverflow: 'ellipsis' }}
            >
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: DASH.ink }}>No classes yet</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {joinCode && (
          <div data-tour="join-code" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: DASH.pageBg, border: `1px solid ${DASH_FLAT.panelHairline}`, borderRadius: 0, padding: '6px 10px 6px 12px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: DASH.dim }}>Join code</span>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13.5, fontWeight: 700, color: DASH.heading, letterSpacing: 0.5 }}>{joinCode}</span>
            <span style={{ width: 1, height: 16, background: DASH_FLAT.panelHairline }} />
            <button onClick={copyCode} title="Copy join code" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: copied ? '#4F9A2E' : INK_2 }}>
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 7 13 15 5" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.6" /><path d="M11 5 V3.5 a1.5 1.5 0 0 0 -1.5 -1.5 H4 a1.5 1.5 0 0 0 -1.5 1.5 V11 a1.5 1.5 0 0 0 1.5 1.5 H5.5" /></svg>
              )}
            </button>
          </div>
        )}
        {/* Secondary: Dashboard Navy outline. Hover moves --umt-ghost-bg,
            not the background property, so the two states cannot fight. */}
        {classes.length > 0 && (
          <button onClick={onInvite} data-tour="invite" className="um-tdash-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${NAVY}`, borderRadius: 0, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="8" y1="3.5" x2="8" y2="12.5" /><line x1="3.5" y1="8" x2="12.5" y2="8" /></svg>
            Invite
          </button>
        )}
        {/* THE PRIMARY, and the only Sunset Orange BUTTON in the page chrome.
            Dark ink on the fill at 9.00, never white: see the CTA note above. */}
        <button onClick={onNewClass} data-tour="new-class" className="um-tdash-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 0, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: CTA_INK }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="3.5" x2="8" y2="12.5" /><line x1="3.5" y1="8" x2="12.5" y2="8" /></svg>
          New class
        </button>
      </div>
    </header>
  );
}

// ─── Official strand grid ─────────────────────────────────────────────────────

/**
 * Where the class stands on the official strand diagnostics.
 *
 * READ ONLY IN v1 (decision 3). Nothing here is clickable, sortable or
 * filterable, and it writes nothing. Counts come from the most recent official
 * row per student, which is the same row the roster cell renders.
 *
 * FOUR STRANDS, THREE LEVELS, AND A COUNT. Deliberately minimal: no percentages,
 * no bars scaled against a total, no "weakest strand" verdict. The practice-side
 * StrandPanel above already does the interpretive work on data the product
 * generated. This is transcribed from an external document and a small cohort,
 * so a percentage would put two significant figures on four students.
 *
 * STUDENTS WHO MET THE STANDARD ARE COUNTED SEPARATELY, not as zeroes and not as
 * a fourth level. Their report carries no strand detail at all, so folding them
 * into the grid would read as "no strand data" when the truth is "no strand data
 * because they passed".
 */
function OfficialStrandGrid({ rows, cols }: { rows: RosterRow[]; cols: number }) {
  const withOfficial = rows.filter((r) => r.official_score !== null);
  const strands = [
    { code: 'QR', key: 'level_qr' },
    { code: 'AR', key: 'level_ar' },
    { code: 'GR', key: 'level_gr' },
    { code: 'PR', key: 'level_pr' },
  ] as const;

  // A student whose row carries no level on ANY strand met the standard. Counted
  // once, not once per strand.
  const metStandard = withOfficial.filter(
    (r) => strands.every((st) => r.official_score![st.key] === null)
  ).length;

  if (withOfficial.length === 0) {
    return (
      <div data-tour="official-strand" style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
        <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: DASH.heading }}>
          Official strand diagnostics
        </h2>
        <div style={{ marginTop: 3, fontSize: 12, color: INK_2 }}>
          From College Board score reports, recorded on each student profile
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 13.5, color: INK_2 }}>
          No official results recorded for this class yet.
        </p>
      </div>
    );
  }

  return (
    <div data-tour="official-strand" style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: DASH.heading }}>
            Official strand diagnostics
          </h2>
          <div style={{ marginTop: 3, fontSize: 12, color: INK_2 }}>
            Students at each level, from their most recent official result
          </div>
        </div>
        <span style={{ fontSize: 12, color: DASH.dim }}>
          {withOfficial.length} of {rows.length} recorded
        </span>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {strands.map((st) => (
          <div key={st.code} style={{ ...flatPanelStyle(), background: DASH.subtleBg, padding: '12px 13px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: DASH.dim, textTransform: 'uppercase' }}>
              {st.code}
            </div>
            <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {OFFICIAL_LEVELS.map((level) => {
                const n = withOfficial.filter(
                  (r) => r.official_score![st.key] === (level as OfficialLevel)
                ).length;
                return (
                  <div key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: INK_2 }}>{level}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: n === 0 ? DASH.dim : DASH.heading, fontVariantNumeric: 'tabular-nums' }}>
                      {n}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p style={{ margin: '14px 0 0', fontSize: 12.5, color: INK_2, lineHeight: 1.5 }}>
        {metStandard === 0
          ? 'No student in this class met the standard on their most recent sitting.'
          : `${metStandard} ${metStandard === 1 ? 'student' : 'students'} met the standard, so their ${metStandard === 1 ? 'report carries' : 'reports carry'} no strand detail. They are not counted above.`}
      </p>
    </div>
  );
}

// ─── Roster ───────────────────────────────────────────────────────────────────

function RosterCard({ s, classId }: { s: DisplayStudent; classId: string }) {
  return (
    <div style={{ ...flatPanelStyle(), padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: CTA, color: CTA_INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: DASH.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: DASH.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
          </div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{s.score ?? '—'}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bandBg, color: s.bandText, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.bandDot }} />{s.band}
        </span>
        <span style={{ fontSize: 12, color: DASH.dim }}>{s.tests} {s.tests === 1 ? 'test' : 'tests'} · {s.active}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: DASH.dim }}>Official TSIA2</span>
        <OfficialScoreCell s={s} />
      </div>
      <div style={{ marginTop: 12 }}>
        <StrandProfileBar s={s} />
      </div>
      <a href={`/teacher/student/${s.student_id}?class_id=${classId}`} className="um-tdash-view" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>View profile <span aria-hidden="true">&rarr;</span></a>
    </div>
  );
}

function Roster({ students, enrolled, sortBy, onSortChange, classId, isMobile, onExport, canExport }: {
  students: DisplayStudent[]; enrolled: number; sortBy: string; onSortChange: (s: string) => void; classId: string; isMobile: boolean;
  onExport: () => void;
  /** Teacher Pro only. Hiding this is presentation; the routes do the refusing. */
  canExport: boolean;
}) {
  return (
    <div id="roster" data-tour="roster">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>Class roster</h2>
          <span style={{ fontSize: 12, fontWeight: 600, color: INK_2, background: DASH.trackBg, padding: '2px 8px' }}>{enrolled}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: DASH.dim }}>Sort by</span>
          {['risk', 'score', 'name'].map((opt) => (
            <button key={opt} onClick={() => onSortChange(opt)}
              className={sortBy === opt ? undefined : 'um-tdash-ghost'}
              aria-pressed={sortBy === opt}
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 0, cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', borderColor: NAVY, background: sortBy === opt ? NAVY : undefined, color: sortBy === opt ? '#FFFFFF' : undefined, textTransform: 'capitalize' }}>
              {opt === 'risk' ? 'Need help' : opt}
            </button>
          ))}
          {canExport && <button
            onClick={onExport}
            data-tour="export"
            className="um-tdash-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 0, cursor: 'pointer', border: `1px solid ${NAVY}`, fontFamily: 'inherit' }}
          >
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 2v9" /><path d="M5 8l4 4 4-4" /><path d="M3 14v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
            </svg>
            Export
          </button>}
        </div>
      </div>

      {students.length === 0 ? (
        <div style={{ ...flatPanelStyle(), padding: '40px 24px', textAlign: 'center', marginBottom: 34 }}>
          <p style={{ fontSize: 14, color: INK_2, margin: '0 0 6px' }}>No students enrolled yet.</p>
          <p style={{ fontSize: 13, color: DASH.dim, margin: 0 }}>Share the join code above or invite students by email.</p>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 34 }}>
          {students.map((s) => <RosterCard key={s.student_id} s={s} classId={classId} />)}
        </div>
      ) : (
        <div style={{ ...flatPanelStyle(), overflowX: 'auto', marginBottom: 34 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: DASH.subtleBg, borderBottom: `1px solid ${DASH_FLAT.panelHairline}` }}>
                {['Student', 'Score', 'Placement', 'Official', 'Strand profile', 'Tests', 'Last active', ''].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Tests' ? 'center' : 'left', padding: h === '' || h === 'Student' ? '11px 20px' : '11px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: DASH.dim, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.student_id} className="um-tdash-row" style={{ borderBottom: i < students.length - 1 ? `1px solid ${DASH_FLAT.panelHairline}` : 'none' }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: CTA, color: CTA_INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: DASH.ink }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: DASH.dim }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums' }}>{s.score ?? '—'}</span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bandBg, color: s.bandText, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.bandDot }} />{s.band}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <OfficialScoreCell s={s} />
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <StrandProfileBar s={s} />
                  </td>
                  <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: DASH.muted, fontVariantNumeric: 'tabular-nums' }}>{s.tests}</span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ fontSize: 12.5, color: DASH.dim }}>{s.active}</span>
                  </td>
                  <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                    <a href={`/teacher/student/${s.student_id}?class_id=${classId}`}
                      className="um-tdash-view"
                      style={{ fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      View <span aria-hidden="true">&rarr;</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ width: 30, height: 30, border: `3px solid ${DASH_FLAT.panelHairline}`, borderTopColor: CTA, borderRadius: '50%', margin: '0 auto', animation: 'um-spin 0.8s linear infinite' }} />
      {/* SPIN_CSS, not MOTION_CSS. The bare keyframe and nothing else: this file
          is the teacher dashboard and the entrance system does not reach it.
          See app/motion.ts for why the two are separate exports. */}
      <style>{SPIN_CSS}</style>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function TeacherDashboardClient({ canExport, assignTopics, initialClasses, teacherName, teacherEmail, isFounder, plan, tourState }: {
  /** Teacher Pro only. Cosmetic: the export routes enforce this themselves. */
  canExport: boolean;
  /** Non-placeholder topics, for the assignment picker. Loaded in page.tsx. */
  assignTopics: AssignTopic[];
  initialClasses: ClassRow[]; teacherName: string; teacherEmail: string; isFounder: boolean;
  plan: string | null;
  tourState: 'done' | 'pending' | 'unavailable';
}) {
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClasses[0]?.id ?? '');
  const [roster, setRoster] = useState<RosterRow[] | null>(null);
  const [misconceptions, setMisconceptions] = useState<Misconception[] | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumRollup | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('risk');
  const [showInvite, setShowInvite] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showNewClass, setShowNewClass] = useState(false);
  // Bumped when an assignment is created, so the tracker below refetches. The
  // two components do not talk to each other: the panel owns its own read and
  // this is the only thing that tells it the answer has changed.
  const [assignmentsKey, setAssignmentsKey] = useState(0);
  // menuOpen and collapsed moved to TeacherShell, which owns the rail now.
  const [showSupport, setShowSupport] = useState(false);
  // Starts false so the tour never renders on the server or the first paint,
  // and is decided on mount once localStorage is readable. Set back to false
  // when the teacher finishes or skips.
  const [tourAllowed, setTourAllowed] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  // Set by "Take a Tour" in the account menu. Kept separate from tourAllowed so
  // an explicit request is not subject to the once-only gates: a teacher asking
  // for the walkthrough should get it however many times they ask.
  const [tourManual, setTourManual] = useState(false);

  const { isMobile, isCompact } = useViewport();

  // The page ground, written onto the body itself. The <style> block below used
  // to state this as `body { background: ... }` and it never painted: the root
  // layout sets the body background from an INLINE prop, which outranks any
  // stylesheet rule that is not !important. See app/components/useBodyBackground.ts.
  useBodyBackground(DASH.pageBg);

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;

  const loadClassData = useCallback(async (classId: string) => {
    if (!classId) { setRoster([]); setMisconceptions([]); return; }
    setRoster(null);
    setMisconceptions(null);
    setCurriculum(null);
    setRosterError(null);
    const [rosterRes, mcRes, curriculumRes] = await Promise.all([
      fetch(`/api/teacher/roster?class_id=${classId}`),
      fetch(`/api/teacher/misconceptions?class_id=${classId}`),
      fetch(`/api/teacher/curriculum-progress?class_id=${classId}`),
    ]);
    if (!rosterRes.ok) { setRosterError('Failed to load roster.'); setRoster([]); return; }
    const rosterData = await rosterRes.json();
    setRoster(rosterData.roster ?? []);
    if (mcRes.ok) {
      const mcData = await mcRes.json();
      setMisconceptions(mcData.misconceptions ?? []);
    } else {
      setMisconceptions([]);
    }
    // A failed rollup costs one panel, not the dashboard. The panel renders
    // nothing at all on null rather than a zeroed-out version of itself: a class
    // reported as "0 of 0 students worked this week" because a fetch failed is
    // worse than a class reported as nothing.
    if (curriculumRes.ok) {
      const curriculumData = await curriculumRes.json();
      setCurriculum(curriculumData.rollup ?? null);
    } else {
      setCurriculum(null);
    }
  }, []);

  useEffect(() => { posthog.capture('dashboard_viewed', { dashboard_type: 'teacher' }); }, []);
  useEffect(() => { loadClassData(selectedClassId); }, [selectedClassId, loadClassData]);

  // Tour eligibility, part one: has this teacher already seen it?
  //
  // The server flag wins when it exists. 'unavailable' means
  // sql/teacher_tour_flag.sql has not been run, so there is no per-account
  // record and the browser's own is the best available answer.
  useEffect(() => {
    if (tourState === 'done') return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(TOUR_STORAGE_KEY) === '1';
    } catch {
      // Blocked store. Fall through and show it; a tour that runs twice is a
      // smaller failure than one that can never run.
    }
    if (!seen) setTourAllowed(true);
  }, [tourState]);

  // ─── Derived stats ───
  const rosterRows = roster ?? [];
  const displayStudents = rosterRows.map(toDisplayStudent);
  const tested = displayStudents.filter((s) => s.tested);
  const notTested = displayStudents.length - tested.length;
  const collegeReady = tested.filter((s) => (s.score ?? 0) >= PASSING).length;
  const crPct = tested.length > 0 ? Math.round((collegeReady / tested.length) * 100) : null;
  const avgScore = tested.length > 0 ? Math.round(tested.reduce((a, s) => a + (s.score ?? 0), 0) / tested.length) : null;
  const totalAttempts = rosterRows.reduce((a, r) => a + r.attempt_count, 0);

  const strandPct: Record<Strand, number> = { QR: 0, AR: 0, GR: 0, PR: 0 };
  for (const k of ORDER) {
    const vals = rosterRows
      .map((r) => r.latest_session?.strand_breakdown?.[k]?.pct)
      .filter((v): v is number => typeof v === 'number');
    strandPct[k] = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }
  const weakestCode = tested.length > 0 ? ORDER.reduce((a, b) => (strandPct[a] <= strandPct[b] ? a : b)) : null;
  const weakStrand = weakestCode ? { code: weakestCode, name: STR[weakestCode].name, color: STR[weakestCode].color, pct: strandPct[weakestCode] } : null;

  // Sort
  const sortedStudents = [...displayStudents].sort((a, b) => {
    if (sortBy === 'score') return (b.score ?? -1) - (a.score ?? -1);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // risk: untested last, then lowest weakest-strand accuracy first
    if (a.tested !== b.tested) return a.tested ? -1 : 1;
    return a.weakPct - b.weakPct;
  });

  const summaryCols = isMobile ? 1 : isCompact ? 2 : 4;
  const strandCols = isMobile ? 2 : 4;
  const miscCols = isCompact ? 1 : 2;

  function handleClassCreated(c: ClassRow) {
    setClasses((prev) => [...prev, c]);
    setSelectedClassId(c.id);
    setShowNewClass(false);
  }

  const loading = roster === null;

  // Tour eligibility, part two: is there anything to point at?
  //
  //   classes  — with no classes the page renders only the empty-state card;
  //              the join code, Invite, summary, strand panel, roster and
  //              misconceptions are all unrendered, and 7 of 10 steps would
  //              highlight nothing.
  //   loading  — same problem for one render pass while the roster fetches.
  const tourHasTargets = !loading && !rosterError && classes.length > 0;

  // Once it is running, only a dismissal or a shrink past 1024px takes it down.
  // Without the latch a roster refetch would flip `loading` back to true and
  // unmount the tour mid-step, losing the teacher's place.
  const autoTour = tourAllowed && (tourStarted || tourHasTargets);

  // The manual launch skips tourHasTargets on purpose. A teacher with no class
  // yet is exactly who benefits from step 1, and a step whose target is missing
  // degrades to a centred card carrying the same text rather than breaking.
  //
  // It also skips isCompact, which the auto-run still honours. Those are two
  // different questions: whether to interrupt someone unprompted on a narrow
  // screen (no), and whether to refuse someone who explicitly asked (no).
  // Below 1024px the rail is not in the DOM, so steps 8-10 retarget onto the
  // menu button holding those items -- see compactTarget in TeacherTour.
  const showTour = tourManual || (!isCompact && autoTour);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
        ${HOVER_LABEL_CSS}
        ${DASH_HOVER_CSS}
      `}</style>

      {/* The rail, the slide-over and the flex row they sit in all moved to
          TeacherShell. What is passed here is what the rail always read; the
          two callbacks are the two things the dashboard still owns, and
          SupportModal stays rendered below rather than by the shell so no node
          in this tree moves. */}
      <TeacherShell
        teacherName={teacherName}
        teacherEmail={teacherEmail}
        isFounder={isFounder}
        plan={plan}
        onOpenSupport={() => setShowSupport(true)}
        onStartTour={() => setTourManual(true)}
      >
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: DASH.pageBg }}>
          <TopBar
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
            joinCode={selectedClass?.join_code ?? null}
            onInvite={() => setShowInvite(true)}
            onNewClass={() => setShowNewClass(true)}
            isMobile={isMobile}
            isCompact={isCompact}
          />

          <div style={{ padding: isMobile ? '18px 16px 48px' : '26px 32px 52px' }}>
            {/* Page header */}
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: isMobile ? 22 : 27, letterSpacing: -0.4, color: DASH.heading }}>{selectedClass?.name ?? 'Your classes'}</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: INK_2 }}>
                {classes.length === 0
                  ? 'Create your first class to get started.'
                  : `${rosterRows.length} ${rosterRows.length === 1 ? 'student' : 'students'} · ${totalAttempts} ${totalAttempts === 1 ? 'attempt' : 'attempts'}`}
              </div>
            </div>

            {classes.length === 0 ? (
              /* FIRST RUN. The last step of onboarding, and the only thing on
                 screen when a teacher has no classes yet.

                 It reads as one instruction with its consequence rather than a
                 description of the product, because a teacher who has just paid
                 does not need to be sold to again. The three lines below the copy
                 are a STATIC PREVIEW of what happens next, not a checklist:
                 nothing is persisted, nothing ticks, and there is no state to go
                 stale. A real checklist needs somewhere to store progress and is
                 its own piece of work.

                 STAYS IN THE DASHBOARD'S OWN SYSTEM, which as of 2026-08-30
                 is the FLAT one. The note this replaces said the opposite --
                 "a rounded card like every other card here", the onboarding
                 flow's flat panels stopping at /teacher's door -- and that was
                 true right up until the dashboard tree went flat too. The door
                 is still there; it is the student shell's Card primitive and
                 its --umd-* variables that do not cross it. What crossed is
                 the shape, deliberately, in one pass. */
              <div style={{ ...flatPanelStyle(), padding: '40px 28px', textAlign: 'center' }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: DASH.dim, margin: '0 0 10px' }}>Last step</p>
                <p style={{ fontFamily: FONT_HEADING, fontSize: 21, fontWeight: 600, color: DASH.heading, margin: '0 0 10px', letterSpacing: -0.3 }}>Create your first class</p>
                <p style={{ fontSize: 13.5, color: INK_2, margin: '0 auto 22px', lineHeight: 1.65, maxWidth: 380 }}>Name it, and we generate a join code on the spot. Once your students are in, their diagnostic results fill this dashboard automatically.</p>

                {/* Static preview of the next three moments. Not persisted, not
                    interactive, and deliberately not numbered as tasks to tick
                    off. */}
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 9, textAlign: 'left', margin: '0 0 24px' }}>
                  {['Name your class', 'Share the join code with students', 'Watch the roster and misconceptions fill in'].map((line, i) => (
                    <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: INK_2 }}>
                      <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, flexShrink: 0, borderRadius: '50%', border: `1px solid ${DASH_FLAT.panelHairline}`, fontSize: 11, fontWeight: 700, color: DASH.dim }}>{i + 1}</span>
                      {line}
                    </div>
                  ))}
                </div>

                <div>
                  {/* Sunset Orange fill with near-black type at 9.00:1. White
                      on this orange is 2.10 and would fail, so the label is
                      dark rather than inverted.

                      THIS BUTTON USED TO BE THE ONLY ONE IN THE FILE ON THIS
                      TREATMENT, and the note here said so. It is now the
                      house CTA: the same fill, the same ink and the same
                      hover variable as New class in the top bar, reached
                      through .um-tdash-cta rather than restated. The two are
                      never on screen together -- this one renders only when
                      the teacher has no classes -- so the one-primary rule
                      holds in both states. */}
                  <button onClick={() => setShowNewClass(true)} className="um-tdash-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 0, padding: '12px 22px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: CTA_INK }}>+ New class</button>
                </div>

                <p style={{ fontSize: 12, color: DASH.dim, margin: '14px 0 0' }}>Takes about a minute.</p>
              </div>
            ) : loading ? (
              <Spinner />
            ) : rosterError ? (
              <p style={{ color: '#C2402F', fontSize: 14 }}>{rosterError}</p>
            ) : (
              <>
                <SummaryCards enrolled={rosterRows.length} notTested={notTested} crCount={collegeReady} crPct={crPct} weakStrand={weakStrand} avgScore={avgScore} cols={summaryCols} />

                {/* THE TWO THINGS A TEACHER WRITES, SIDE BY SIDE.
                    ========================================================
                    These were two full-width cards stacked, which gave a
                    compose form the same width as the roster table and pushed
                    everything a teacher READS below the fold. They are the
                    same two components with the same props; only the box they
                    sit in is new.

                    THE GRID LIVES HERE, NOT IN EITHER CHILD. Each of them
                    still owns its own padding and its own button, so neither
                    knows it has a neighbour -- which is what lets the mobile
                    branch drop to one column by changing this line alone.

                    ONE COLUMN UNDER isCompact, not just isMobile. Both cards
                    hold a form with labelled fields; at two-up on a 900px
                    viewport the fields are narrower than the text people type
                    into them. The stat cards above go two-up at that width and
                    these do not, deliberately.

                    The tracker for assignments is NOT here. It stays further
                    down beside the other progress reads, because setting work
                    and checking work are different visits. */}
                <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 16, alignItems: 'start', marginBottom: 22 }}>
                  <NewAnnouncement classes={classes} selectedClassId={selectedClassId} />
                  <NewAssignment
                    classId={selectedClassId}
                    topics={assignTopics}
                    students={rosterRows.map((r) => ({ student_id: r.student_id, name: r.name }))}
                    onCreated={() => setAssignmentsKey((k) => k + 1)}
                  />
                </div>
                <StrandPanel strandPct={strandPct} totalAttempts={totalAttempts} cols={strandCols} />
                {/* Coursework, between practice mastery and the state's report.
                    The three panels read as: what they have worked through, how
                    they perform when tested, what the state said. */}
                <CurriculumRollupPanel rollup={curriculum} cols={summaryCols} />
                {/* Directly after the rollup: how far the class has got overall,
                    then what was specifically set and how that is going. Both
                    read the same live computation, so they cannot disagree. */}
                <AssignmentsPanel classId={selectedClassId} reloadKey={assignmentsKey} isMobile={isMobile} />
                {/* Beside the practice strand panel, not instead of it. One is
                    what the product measured, the other is what the state
                    reported; a teacher needs to be able to see them disagree. */}
                <OfficialStrandGrid rows={rosterRows} cols={strandCols} />
                <Roster students={sortedStudents} enrolled={rosterRows.length} sortBy={sortBy} onSortChange={setSortBy} classId={selectedClassId} isMobile={isMobile} onExport={() => setShowExport(true)} canExport={canExport} />

                {/* Misconceptions */}
                <div id="misconceptions" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
                    <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>Top misconceptions</h2>
                    <span style={{ fontSize: 13, color: INK_2 }}>Class-wide, most recent test per student</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: DASH.dim }}>
                    {ORDER.map((k) => (
                      <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 9, height: 9, background: STR[k].color, display: 'inline-block' }} />{k}
                      </span>
                    ))}
                  </div>
                </div>
                {misconceptions === null ? (
                  <Spinner />
                ) : misconceptions.length === 0 ? (
                  <div style={{ ...flatPanelStyle(), padding: '32px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: INK_2, margin: 0 }}>No misconception data yet. Students need to complete at least one test.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${miscCols},1fr)`, gap: 16 }}>
                    {misconceptions.map((m) => <MiscCard key={m.misconception_tag} m={m} testedCount={tested.length} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </TeacherShell>

      {showInvite && selectedClass && <InviteModal classId={selectedClass.id} onClose={() => setShowInvite(false)} />}
      {showExport && canExport && <ExportModal classes={classes} selectedClassId={selectedClassId} onClose={() => setShowExport(false)} />}
      {showNewClass && <NewClassModal onClose={() => setShowNewClass(false)} onCreated={handleClassCreated} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showTour && (
        <TeacherTour
          compact={isCompact}
          onStarted={() => setTourStarted(true)}
          onClose={() => { setTourAllowed(false); setTourManual(false); }}
        />
      )}
    </>
  );
}
