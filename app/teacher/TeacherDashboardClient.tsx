'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import posthog from 'posthog-js';
import MathText from '../components/MathText';
import { FONT_HEADING, FONT_BASE_CSS } from '../components/fonts';
import { DASH, flatPanelStyle, DASH_FLAT } from '../components/dashboard-theme';
import { CTA, CTA_INK, NAVY, INK_2, DASH_HOVER_CSS } from './dashboard-chrome';
import { CollapseButton, CollapseBody } from './collapse';
import { HOVER_LABEL_CSS } from '../components/HoverLabel';
import { useBodyBackground } from '../components/useBodyBackground';
import TeacherShell, { useViewport, useTeacherShell } from './TeacherShell';
import NewAnnouncement from './NewAnnouncement';
import { type AssignTopic } from './NewAssignment';
import AssignmentsPanel from './AssignmentsPanel';
import SupportModal from '../components/SupportModal';
import ModalShell from '../components/ModalShell';
import ExportModal from './ExportModal';
import TeacherTour, { TOUR_STORAGE_KEY } from './TeacherTour';
import { type OfficialLevel } from "../lib/official-scores";
import {
  PASSING,
  STRAND_ORDER as ORDER,
  placementBand,
  strandPcts,
  type Strand,
  type StrandBreakdown,
} from "../lib/placement";
import { STRAND_TINT } from "../lib/strands";
import { SPIN_CSS, MOTION_CSS } from '../motion';

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
          {/* The shared control now. This section shipped the first collapse
              on the dashboard as inline JSX; three more followed, so the button
              and the animatable body moved to ./collapse. */}
          <CollapseButton
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            controls="curriculum-rollup-detail"
            section="curriculum progress"
          />
        </div>
      </div>

      {/* The headline. Survives the collapse. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{workedThisWeek}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: INK_2 }}>of {enrolled} {enrolled === 1 ? 'student' : 'students'} worked on the course this week</span>
      </div>
      <div style={{ fontSize: 12, color: INK_2, marginBottom: collapsed ? 0 : 18 }}>Any topic opened in the last 7 days</div>

      {/* NOT AN UNMOUNT, so aria-controls above always points at an element
          that exists and the three cards do not re-mount on every toggle.

          AND NOT THE `hidden` ATTRIBUTE ANY MORE, which is what this was: hidden
          is display:none and display cannot be animated, so the panel used to
          vanish between one frame and the next. See dashboard-chrome.ts for why
          the replacement animates grid rows rather than height. */}
      <CollapseBody id="curriculum-rollup-detail" collapsed={collapsed}>
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
      </CollapseBody>
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

// ─── Misconceptions: the section, the carousel and its autoplay ──────────────
//
// SIX CARDS, SLICED AT RENDER. The API already caps its own aggregation at 10
// (app/api/teacher/misconceptions/route.ts passes the limit to
// aggregateMisconceptions, which sorts, slices, and only then assigns
// rank: i + 1). So `rank` is decided before anything here sees the list, and
// taking six off the front is a display decision that cannot disturb the
// ranking, the query, or the aggregation. Nothing server-side changed.
//
// A CAROUSEL RATHER THAN A SIX-CARD GRID because six of these at two columns is
// three rows of dense prose sitting under the roster, which is where a teacher
// stops scrolling. One row that moves is read; three rows that do not are not.
//
// THE MECHANISM IS THE BROWSER'S. overflow-x plus scroll-snap gives dragging,
// wheel, trackpad, touch, and keyboard arrows for free, all of it with the
// platform's own momentum and accessibility. The only scripted part is the
// autoplay, which is one scrollBy on an interval. There is no drag handler here
// and no transform to unwind.

const CAROUSEL_MIN = 3;
const AUTOPLAY_MS = 5200;

function Misconceptions({ misconceptions, testedCount }: { misconceptions: Misconception[] | null; testedCount: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paused, setPaused] = useState(false);
  // Read from the media query rather than assumed, and RE-READ on change: the
  // setting can be flipped mid-session from the OS, and a value captured once
  // on mount would leave autoplay running for someone who just asked it to
  // stop. CSS cannot help here because the motion is a scroll position, not a
  // property, which is why this is the one JS guard in the change.
  const [reduced, setReduced] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // SIX, and then the guard reads the length that actually rendered.
  const shown = (misconceptions ?? []).slice(0, 6);
  // WITH TWO CARDS OR FEWER THERE IS NOTHING TO CAROUSEL. Autoplay on a rail
  // that does not overflow scrolls to the same pixel forever, which reads as a
  // broken animation rather than as a still one; and a single card sliding
  // under its own heading is worse than a single card sitting there. So the
  // rail renders as a plain row with no snapping, no scrolling and no timer.
  const isCarousel = shown.length >= CAROUSEL_MIN;
  const autoplay = isCarousel && !paused && !reduced && !collapsed;

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => {
      const el = railRef.current;
      if (!el) return;
      // One card-width step, then back to the start once the last card is
      // flush right. The 4px slack absorbs sub-pixel widths, which otherwise
      // leave the rail one pixel short of the end and stall there.
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + el.clientWidth * 0.5, behavior: 'smooth' });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay]);

  return (
    // CurriculumRollupPanel's padding and marginBottom. The header sits inside
    // and survives the collapse; only the body below it animates.
    <div style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
      <div id="misconceptions" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>Top misconceptions</h2>
          <span style={{ fontSize: 13, color: INK_2 }}>
            {shown.length > 0 ? `Top ${shown.length} class-wide, most recent test per student` : 'Class-wide, most recent test per student'}
          </span>
        </div>
        {/* The strand legend collapses with the body: it is a key to the chips
            on the cards, and a key to nothing is clutter. */}
        <CollapseButton
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          controls="misconceptions-body"
          section="top misconceptions"
        />
      </div>

      <CollapseBody id="misconceptions-body" collapsed={collapsed}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, fontSize: 11, color: DASH.dim, marginBottom: 11 }}>
          {ORDER.map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, background: STR[k].color, display: 'inline-block' }} />{k}
            </span>
          ))}
        </div>

        {misconceptions === null ? (
          <Spinner />
        ) : misconceptions.length === 0 ? (
          <div style={{ padding: '24px 0 6px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: INK_2, margin: 0 }}>No misconception data yet. Students need to complete at least one test.</p>
          </div>
        ) : (
          <div
            ref={railRef}
            className={isCarousel ? 'um-tdash-carousel' : 'um-tdash-carousel um-tdash-carousel--static'}
            // PAUSE ON HOVER AND ON FOCUS. focus-within is the half people
            // forget: a keyboard user tabbing into a card cannot chase a rail
            // that keeps moving under them, and they never generate a
            // mouseenter. Both are handlers rather than CSS because what they
            // gate is a JS timer.
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            // A scrollable region needs to be reachable and announced. Only
            // when it actually scrolls: a static row is not a region.
            {...(isCarousel
              ? { tabIndex: 0, role: 'region' as const, 'aria-label': 'Top misconceptions, scrollable' }
              : {})}
          >
            {shown.map((m) => (
              <MiscCard key={m.misconception_tag} m={m} testedCount={testedCount} />
            ))}
          </div>
        )}
      </CollapseBody>
    </div>
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
  const [collapsed, setCollapsed] = useState(false);
  return (
    // CurriculumRollupPanel's padding and marginBottom, read off it rather than
    // picked. Only the body inside collapses; this panel never does, so a
    // collapsed roster is a normal card showing its header.
    <div id="roster" data-tour="roster" style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
      {/* Title, count and chevron stay up; the sort controls and the Export
          button go down with the body, because they act on a table nobody can
          see while it is closed. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>Class roster</h2>
          <span style={{ fontSize: 12, fontWeight: 600, color: INK_2, background: DASH.trackBg, padding: '2px 8px' }}>{enrolled}</span>
        </div>
        <CollapseButton
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          controls="roster-body"
          section="the class roster"
        />
      </div>

      <CollapseBody id="roster-body" collapsed={collapsed}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 13, gap: 10, flexWrap: 'wrap' }}>
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

      {students.length === 0 ? (
        <div style={{ padding: '28px 0 8px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: INK_2, margin: '0 0 6px' }}>No students enrolled yet.</p>
          <p style={{ fontSize: 13, color: DASH.dim, margin: 0 }}>Share the join code above or invite students by email.</p>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {students.map((s) => <RosterCard key={s.student_id} s={s} classId={classId} />)}
        </div>
      ) : (
        // No border and no bottom margin of its own: the section panel supplies
        // both now. overflowX stays, because the table is wider than the column
        // on a narrow window and always was.
        <div style={{ overflowX: 'auto' }}>
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
      </CollapseBody>
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
  // assignmentsKey WAS HERE and is gone. It was an integer bumped on every
  // create, purely so the tracker further down would refetch: the compose form
  // and the list were two components that could not talk, so the message went
  // up to this scope and back down as a changed prop. They are one panel now
  // (AssignmentsPanel renders the form itself) and it reloads directly.

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
        ${MOTION_CSS}
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
        {/* LOCK 1 of the shared motion system. Every rule in MOTION_CSS is
            written as a strict descendant of .um-motion, so this class is what
            opts the dashboard in. It goes on <main> rather than on the shell:
            the rail is chrome that is identical on every teacher route and has
            no business fading in when the content under it changes.

            NO template.tsx TO GO WITH IT, deliberately. The rail's nav items are
            plain <a href> (TeacherShell), so every move between teacher routes
            is a full document load and the entrance runs on mount for free. A
            template would buy nothing here and would cost something real on
            /teacher/students, whose breadcrumbs and class chips ARE next/link:
            it would remount StudentsClient and GradesGridClient on every
            class switch, refetching and flashing a spinner where today there is
            neither. */}
        <main className="um-motion" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: DASH.pageBg }}>
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

          {/* LOCK 2. The content block rises once, as one piece. NOT a stagger
              over the sections: the dashboard's own bar growth and the
              carousel are already in motion, and a sequenced page arrival on
              top of them reads as the page struggling rather than settling.

              NO BASE opacity:0 ANYWHERE, which is the load-bearing safety
              property of motion.ts: the hidden state lives only in the
              keyframe's `from` with fill-mode both, so the reduced-motion guard
              (which works by REMOVING the animation) leaves a fully painted
              page rather than an invisible one. */}
          <div className="um-fade-up" style={{ padding: isMobile ? '18px 16px 48px' : '26px 32px 52px' }}>
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

                {/* ANNOUNCEMENTS, FULL WIDTH AND ALONE.
                    ========================================================
                    It had a neighbour for one release: NewAssignment sat beside
                    it in a two-up row. That row is gone, because the assignment
                    form belonged with the list of assignments rather than with
                    the announcement box -- a teacher who sets work wants to see
                    the work they just set, not scroll past a strand panel and a
                    curriculum rollup to find it.

                    The trigger and the form now live in the Assigned work
                    header further down. Nothing about the form moved house; the
                    same component renders there with chrome={false}. */}
                <NewAnnouncement classes={classes} selectedClassId={selectedClassId} />
                <StrandPanel strandPct={strandPct} totalAttempts={totalAttempts} cols={strandCols} />
                {/* Coursework, between practice mastery and the state's report.
                    The three panels read as: what they have worked through, how
                    they perform when tested, what the state said. */}
                <CurriculumRollupPanel rollup={curriculum} cols={summaryCols} />
                {/* Directly after the rollup: how far the class has got overall,
                    then what was specifically set and how that is going. Both
                    read the same live computation, so they cannot disagree. */}
                <AssignmentsPanel
                  classId={selectedClassId}
                  topics={assignTopics}
                  students={rosterRows.map((r) => ({ student_id: r.student_id, name: r.name }))}
                  isMobile={isMobile}
                />
                {/* OFFICIAL STRAND DIAGNOSTICS WAS HERE AND IS GONE.
                    The per-strand level grid is removed; the official SCORE is
                    not. OfficialScoreCell still renders the Official column in
                    the roster below, and the student detail page still owns the
                    full sitting history and the entry form. What went is one
                    aggregate panel, not the feature. */}
                <Roster students={sortedStudents} enrolled={rosterRows.length} sortBy={sortBy} onSortChange={setSortBy} classId={selectedClassId} isMobile={isMobile} onExport={() => setShowExport(true)} canExport={canExport} />

                {/* Misconceptions. The anchor id stays on this header: the rail's
                    "Misconceptions" nav item is href="/teacher#misconceptions"
                    and TeacherTour step 8 points at that nav item. */}
                <Misconceptions misconceptions={misconceptions} testedCount={tested.length} />
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
