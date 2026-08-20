'use client';

import { useState, useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import MathText from '../components/MathText';
import { LogoutButton } from '../components/LogoutButton';
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from '../components/fonts';
import { DASH, cardStyle } from '../components/dashboard-theme';
import { HoverLabel, HOVER_LABEL_CSS, useHoverLabel } from '../components/HoverLabel';
import NewAnnouncement from './NewAnnouncement';
import SupportModal from '../components/SupportModal';
import ModalShell from '../components/ModalShell';
import ExportModal from './ExportModal';
import TeacherTour, { TOUR_STORAGE_KEY } from './TeacherTour';
import { teacherTierLabel } from "../lib/capabilities";
import {
  PASSING,
  STRAND_ORDER as ORDER,
  placementBand,
  strandPcts,
  type Strand,
  type StrandBreakdown,
} from "../lib/placement";

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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STR: Record<Strand, { code: string; name: string; short: string; color: string }> = {
  QR: { code: 'QR', name: 'Quantitative Reasoning', short: 'Quantitative Reasoning', color: '#B5D4F4' },
  AR: { code: 'AR', name: 'Algebraic Reasoning', short: 'Algebraic Reasoning', color: '#9FE1CB' },
  GR: { code: 'GR', name: 'Geometric & Spatial', short: 'Geometric and Spatial Reasoning', color: '#FAC775' },
  PR: { code: 'PR', name: 'Probabilistic & Statistical', short: 'Probabilistic and Statistical Reasoning', color: '#CECBF6' },
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
  };
}

// Viewport hook. Defaults to desktop for SSR / first paint (no hydration
// mismatch), then corrects on mount. Breakpoints: <640 mobile, <1024 tablet.
function useViewport() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { w, isMobile: w < 640, isCompact: w < 1024 };
}

// ─── Logo ──────────────────────────────────────────────────────────────────────

// Wordmark is 2000x485, so setting width alone keeps the aspect ratio intact.
// 152px fits the 200px sidebar minus its 18px side padding.
//
// Collapsed, the full wordmark is replaced by the standalone mu mark, which is
// square and centres in the narrow rail.
function Brand({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    // The mu mark only inks about 50% x 61% of its own 1080px canvas; the rest
    // is transparent padding. Rendered at a nominal icon size the glyph came
    // out around 15px in a 64px rail, which read as an empty logo slot. Sizing
    // the box to 44px puts the visible mark at roughly 22x27, matching the
    // weight of the nav icons below it.
    return (
      <img
        src="/unpackmath-logo.png"
        alt="UnpackMath"
        width={1080}
        height={1080}
        style={{ width: 44, height: 44, display: 'block', margin: '0 auto' }}
      />
    );
  }
  return (
    <img
      src="/unpackmath-wordmark.png"
      alt="UnpackMath"
      width={2000}
      height={485}
      style={{ width: 152, maxWidth: '100%', height: 'auto', display: 'block' }}
    />
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

// `tour` is the data-tour key TeacherTour targets. Only the two items the tour
// stops at carry one; the rest are undefined and render no attribute.
const NAV_ITEMS: { label: string; href: string; tour?: string }[] = [
  { label: 'Dashboard', href: '/teacher' },
  { label: 'Misconceptions', href: '/teacher#misconceptions', tour: 'nav-misconceptions' },
  { label: 'Students', href: '/teacher#roster' },
  { label: 'Take a practice test', href: '/adaptive-test', tour: 'nav-practice' },
  { label: 'Student view', href: '/dashboard' },
];

function navIcon(label: string) {
  switch (label) {
    case 'Dashboard':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="5.5" height="5.5" rx="1.2" /><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.2" /><rect x="2" y="10.5" width="5.5" height="5.5" rx="1.2" /><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.2" /></svg>;
    case 'Misconceptions':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2.4 L16.2 15 H1.8 Z" /><line x1="9" y1="7" x2="9" y2="10.5" /><circle cx="9" cy="12.8" r="0.5" fill="currentColor" stroke="none" /></svg>;
    case 'Students':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.3" cy="6" r="2.4" /><circle cx="12.4" cy="6.6" r="2" /><path d="M2 15 a4.3 4.3 0 0 1 8.6 0" /><path d="M10.4 14.6 a3.6 3.6 0 0 1 5.6 0" /></svg>;
    case 'Take a practice test':
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.2" y="2" width="11.6" height="14" rx="1.6" /><line x1="6" y1="6" x2="12" y2="6" /><line x1="6" y1="9" x2="12" y2="9" /><line x1="6" y1="12" x2="9.6" y2="12" /></svg>;
    default:
      return <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1.4 9 C4.2 4.2 13.8 4.2 16.6 9 C13.8 13.8 4.2 13.8 1.4 9 Z" /><circle cx="9" cy="9" r="2.3" /></svg>;
  }
}

// Founder badge. Gold star plus FOUNDER in a rounded amber outline pill,
// sitting under the name in the sidebar profile card, per the reference.
// Driven by profiles.is_founder, so adding a founder is a column update rather
// than a code change.
function FounderPill() {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        marginTop: 4, padding: '2px 9px 2px 7px',
        border: '1px solid #C68A2F', borderRadius: 999,
        color: '#E7BE7B', fontSize: 9, fontWeight: 700, letterSpacing: 1.1,
      }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="#E7BE7B" aria-hidden="true">
        <path d="M6 0.6l1.62 3.34 3.68.52-2.66 2.58.63 3.66L6 8.97 2.73 10.7l.63-3.66L.7 4.46l3.68-.52z" />
      </svg>
      FOUNDER
    </span>
  );
}

// The floating hover label the collapsed rail leans on now lives in
// app/components/HoverLabel, shared with the student rail.

function SidebarInner({
  teacherName,
  teacherEmail,
  isFounder,
  plan,
  collapsed = false,
  onNavigate,
  onOpenSupport,
  onStartTour,
}: {
  teacherName: string;
  teacherEmail: string;
  isFounder: boolean;
  /** The profiles.plan value. The band below names the tier from it. */
  plan: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
  onOpenSupport: () => void;
  /** Launches the tour. Passed by both rails -- the desktop aside and the
   *  compact slide-over -- so the entry point does not vanish at 1024px the way
   *  the rail itself does. */
  onStartTour: () => void;
}) {
  const initials = teacherName.split(/[\s._-]+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'T';
  const { tip, hovered, showTip, hideTip } = useHoverLabel();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      {/* Collapsed side padding is tighter so the 44px mark clears the 64px
          rail without being squeezed. */}
      <div style={{ padding: collapsed ? '18px 8px 12px' : '22px 18px 14px' }}>
        <Brand collapsed={collapsed} />
      </div>

      {/* The tier band. A full-bleed band across the sidebar rather than an
          inset pill. Keeps the amber border/ink treatment, drops the dot, and
          centres the text; side borders are omitted so it reads as a band that
          meets both edges instead of a boxed-in chip.

          THE TEXT USED TO BE THE LITERAL 'TEACHER · PRO', for everyone. No
          Teacher Pro has ever sold, so every teacher who has ever seen this
          sidebar has been shown the name of a product nobody owns, and the
          first paying Teacher Core customer saw it too. It is derived from the
          plan now. Falls back to plain TEACHER rather than to a tier name: the
          page gate above guarantees a teacher plan, and if that ever stops
          being true this should go quiet, not guess. */}
      <div
        style={{
          borderTop: '1px solid rgba(198,138,47,0.45)',
          borderBottom: '1px solid rgba(198,138,47,0.45)',
          color: '#E7BE7B',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.4,
          padding: '6px 4px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {collapsed
          ? teacherTierLabel(plan) ?? 'TEACHER'
          : `TEACHER${teacherTierLabel(plan) ? ` · ${teacherTierLabel(plan)}` : ''}`}
      </div>

      <nav style={{ padding: collapsed ? '10px 8px' : '10px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowX: 'hidden' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === 'Dashboard';
          const isHovered = hovered === item.label;
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              aria-label={item.label}
              data-tour={item.tour}
              onMouseEnter={showTip(item.label)}
              onMouseLeave={hideTip}
              style={{
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 11,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '9px 0' : '9px 11px', borderRadius: 8, fontSize: 13,
                fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                color: isActive ? '#E7BE7B' : 'rgba(255,255,255,0.64)',
                background: isActive
                  ? 'rgba(198,138,47,0.14)'
                  : isHovered ? 'rgba(255,255,255,0.06)' : 'transparent',
                transition: 'background 0.12s',
              }}
            >
              <span style={{ flex: '0 0 17px', display: 'flex', alignItems: 'center' }}>{navIcon(item.label)}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: collapsed ? '14px 8px' : 14, borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
        {/* Account menu. Anchored above the avatar because the avatar sits at
            the bottom of the rail. */}
        {accountOpen && (
          <>
            <div onClick={() => setAccountOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 310 }} />
            <div
              role="menu"
              style={{
                position: 'absolute', bottom: 'calc(100% - 4px)', left: collapsed ? 8 : 14,
                minWidth: 178, zIndex: 320,
                background: '#fff', borderRadius: 11, padding: 5,
                border: '1px solid rgba(15,30,53,0.08)',
                boxShadow: '0 12px 34px rgba(15,30,53,0.24)',
              }}
            >
              <a
                role="menuitem"
                href="/teacher/settings"
                onClick={() => setAccountOpen(false)}
                style={menuItemStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.4" /><path d="M14.6 11.1a1.3 1.3 0 0 0 .26 1.43l.05.05a1.55 1.55 0 1 1-2.2 2.2l-.04-.05a1.3 1.3 0 0 0-1.43-.26 1.3 1.3 0 0 0-.79 1.19v.13a1.55 1.55 0 1 1-3.1 0v-.07a1.3 1.3 0 0 0-.85-1.19 1.3 1.3 0 0 0-1.43.26l-.05.05a1.55 1.55 0 1 1-2.2-2.2l.05-.05a1.3 1.3 0 0 0 .26-1.43 1.3 1.3 0 0 0-1.19-.79h-.13a1.55 1.55 0 1 1 0-3.1h.07a1.3 1.3 0 0 0 1.19-.85 1.3 1.3 0 0 0-.26-1.43l-.05-.05a1.55 1.55 0 1 1 2.2-2.2l.05.05a1.3 1.3 0 0 0 1.43.26h.06a1.3 1.3 0 0 0 .79-1.19v-.13a1.55 1.55 0 1 1 3.1 0v.07a1.3 1.3 0 0 0 .79 1.19 1.3 1.3 0 0 0 1.43-.26l.05-.05a1.55 1.55 0 1 1 2.2 2.2l-.05.05a1.3 1.3 0 0 0-.26 1.43v.06a1.3 1.3 0 0 0 1.19.79h.13a1.55 1.55 0 1 1 0 3.1h-.07a1.3 1.3 0 0 0-1.19.79z" /></svg>
                Account Settings
              </a>
              <button
                role="menuitem"
                onClick={() => { setAccountOpen(false); onStartTour(); }}
                style={{ ...menuItemStyle, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M11.9 6.1 L7.9 7.9 L6.1 11.9 L10.1 10.1 Z" /></svg>
                Take a Tour
              </button>
              <button
                role="menuitem"
                onClick={() => { setAccountOpen(false); onOpenSupport(); }}
                style={{ ...menuItemStyle, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M6.9 6.8a2.15 2.15 0 0 1 4.18.72c0 1.43-2.15 2.15-2.15 2.15" /><circle cx="9" cy="13" r="0.55" fill="currentColor" stroke="none" /></svg>
                Help
              </button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start', flexDirection: collapsed ? 'column' : 'row' }}>
          <button
            type="button"
            aria-label="Profile"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            data-tour="profile"
            onClick={() => setAccountOpen((v) => !v)}
            onMouseEnter={showTip('Profile')}
            onMouseLeave={hideTip}
            style={{
              width: 32, height: 32, borderRadius: '50%', background: '#1C3052', color: '#E7BE7B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flex: '0 0 32px',
              border: hovered === 'Profile' || accountOpen ? '1px solid rgba(231,190,123,0.55)' : '1px solid transparent',
              cursor: 'pointer', padding: 0, fontFamily: 'inherit',
            }}
          >
            {initials}
          </button>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherName}</div>
              {isFounder ? (
                <FounderPill />
              ) : (
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherEmail}</div>
              )}
            </div>
          )}

          {/* Logout keeps its own hover label, and stays present when
              collapsed -- stacked under the avatar rather than dropped, so the
              narrow rail is still a way out of the app. */}
          <span
            onMouseEnter={showTip('Logout')}
            onMouseLeave={hideTip}
            style={{ display: 'flex', flexShrink: 0 }}
          >
            <LogoutButton variant="dark" size={30} title={null} />
          </span>
        </div>
      </div>

      {tip && <HoverLabel tip={tip} />}
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '9px 11px', borderRadius: 8,
  fontSize: 13, fontWeight: 600, color: DASH.heading,
  textDecoration: 'none', fontFamily: 'inherit',
  transition: 'background 0.12s',
};

// ─── Summary cards ───────────────────────────────────────────────────────────

function SummaryCards({ enrolled, notTested, crCount, crPct, weakStrand, avgScore, cols }: {
  enrolled: number; notTested: number; crCount: number; crPct: number | null;
  weakStrand: { code: string; name: string; color: string; pct: number } | null;
  avgScore: number | null; cols: number;
}) {
  const card = { ...cardStyle(), padding: '18px 18px 16px' };
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase' as const, color: DASH.dim };
  return (
    <div data-tour="summary" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16, marginBottom: 16 }}>
      <div style={card}>
        <div style={labelStyle}>Students enrolled</div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{enrolled}</div>
        <div style={{ marginTop: 9, fontSize: 12, color: DASH.muted }}>{notTested > 0 ? `${notTested} not yet tested` : 'All students tested'}</div>
      </div>
      <div style={card}>
        <div style={labelStyle}>College ready</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: DASH.heading, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{crCount}</span>
          {crPct !== null && <span style={{ fontSize: 15, fontWeight: 600, color: '#4F9A2E' }}>{crPct}%</span>}
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: DASH.muted }}>Scored ≥ 950 on TSIA2</div>
      </div>
      {/* Weakest strand — amber highlight */}
      <div style={{ background: '#FBF4E6', border: '1px solid rgba(198,138,47,0.35)', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 2px rgba(198,138,47,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A6A1F' }}>Weakest strand</span>
          {weakStrand && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, color: '#fff', background: '#C68A2F', padding: '2px 6px', borderRadius: 4 }}>FOCUS</span>}
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: DASH.heading, lineHeight: 1.05 }}>{weakStrand ? weakStrand.name : '—'}</span>
        </div>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#7A5B2A' }}>
          {weakStrand ? (
            <>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: weakStrand.color, display: 'inline-block' }} />
              <span>{weakStrand.code} · {weakStrand.pct}% class accuracy</span>
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
        <div style={{ marginTop: 9, fontSize: 12, color: DASH.muted }}>Passing 950 · scale 910–990</div>
      </div>
    </div>
  );
}

// ─── Strand mastery panel ─────────────────────────────────────────────────────

function StrandPanel({ strandPct, totalAttempts, cols }: { strandPct: Record<Strand, number>; totalAttempts: number; cols: number }) {
  return (
    <div data-tour="strand" style={{ ...cardStyle(), padding: '20px 22px', marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: DASH.heading }}>Class strand mastery</h2>
          <div style={{ marginTop: 3, fontSize: 12, color: DASH.muted }}>Average accuracy by TSIA2 reasoning strand</div>
        </div>
        <div style={{ fontSize: 11, color: DASH.dim, fontWeight: 600 }}>{totalAttempts} attempts this class</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 18, alignItems: 'end' }}>
        {ORDER.map((code) => (
          <div key={code} style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ position: 'relative', width: 46, height: 118, background: DASH.trackBg, borderRadius: 7, overflow: 'hidden', flex: '0 0 46px' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: STR[code].color, height: `${strandPct[code]}%`, borderRadius: '7px 7px 0 0' }} />
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: DASH.heading, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{strandPct[code]}<span style={{ fontSize: 13, color: DASH.dim }}>%</span></div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: DASH.heading }}>{code}</div>
              <div style={{ fontSize: 11, color: DASH.muted, lineHeight: 1.3 }}>{STR[code].short}</div>
            </div>
          </div>
        ))}
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
        <div style={{ width: `${s.wQR}%`, background: '#B5D4F4' }} />
        <div style={{ width: `${s.wAR}%`, background: '#9FE1CB' }} />
        <div style={{ width: `${s.wGR}%`, background: '#FAC775' }} />
        <div style={{ width: `${s.wPR}%`, background: '#CECBF6' }} />
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
  const [hovered, setHovered] = useState(false);
  const strandColor = STR[(m.primary_strand as Strand)]?.color ?? '#D3D1C7';
  const reach = testedCount > 0 ? Math.min(100, Math.round((m.affected_students / testedCount) * 100)) : 0;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...cardStyle(), padding: 18, boxShadow: hovered ? DASH.cardShadowHover : DASH.cardShadow, display: 'flex', flexDirection: 'column', minHeight: 182, transition: 'box-shadow 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0F1E35', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 28px' }}>{m.rank}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: DASH.heading }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: strandColor, display: 'inline-block' }} />
            {m.primary_strand}
          </span>
        </div>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: DASH.muted, background: '#F4F3EE', padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap' }}>
          {m.topic_id}{m.topic_count > 1 ? ` +${m.topic_count - 1}` : ''}
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#26262A', flex: '1 1 auto', maxHeight: 88, overflow: 'hidden' }}>
        <MathText text={m.distractor_text} />
      </div>
      {/* One representative example, labelled as such once the same
          misconception shows up on more than one item. Without this the card
          reads as if the prose were the definition of the misconception. */}
      <div style={{ fontSize: 11, color: DASH.muted, marginTop: 8 }}>
        {m.item_count > 1
          ? `Example of ${m.item_count} items where this appeared`
          : 'Seen on 1 item'}
      </div>
      <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${DASH.hairline}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 12, color: DASH.muted }}>
          <span style={{ fontWeight: 700, color: DASH.ink }}>Selected {m.frequency}×</span>
          <span style={{ color: '#C9C7BE', margin: '0 6px' }}>·</span>
          <span>{m.affected_students} {m.affected_students === 1 ? 'student' : 'students'}</span>
        </div>
        {/* Honest reach indicator: share of tested students who hit this misconception. */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div style={{ width: 84, height: 7, borderRadius: 20, background: '#F0EEE7', overflow: 'hidden' }}>
            <div style={{ width: `${reach}%`, height: '100%', background: strandColor }} />
          </div>
          <span style={{ fontSize: 9.5, letterSpacing: 0.4, color: '#A8A69D', textTransform: 'uppercase' }}>{reach}% of class</span>
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
          <button onClick={onClose} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#C68A2F', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}>Done</button>
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: DASH.muted, lineHeight: 1.5 }}>
            Enter a student email. If they already have an account they&apos;ll be enrolled immediately. Otherwise they&apos;ll receive an invite link.
          </p>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setMessage(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="student@school.edu"
            type="email"
            style={{ width: '100%', border: `1px solid ${status === 'error' ? '#C2402F' : '#D3D1C7'}`, borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', color: DASH.ink, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
          />
          {status === 'error' && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#C2402F' }}>{message}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 9, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: DASH.muted }}>Cancel</button>
            <button onClick={handleSubmit} disabled={status === 'loading' || !email}
              style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 9, background: status === 'loading' ? '#D4A55A' : '#C68A2F', cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}>
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
      <p style={{ margin: '0 0 16px', fontSize: 13, color: DASH.muted, lineHeight: 1.5 }}>
        Give your class a name. A join code is generated automatically so students can enroll.
      </p>
      <input
        value={name}
        onChange={(e) => { setName(e.target.value); setStatus('idle'); setMessage(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="e.g. TSIA2 Prep — Period 2"
        autoFocus
        style={{ width: '100%', border: `1px solid ${status === 'error' ? '#C2402F' : '#D3D1C7'}`, borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', color: DASH.ink, outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
      />
      {status === 'error' && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#C2402F' }}>{message}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 9, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: DASH.muted }}>Cancel</button>
        <button onClick={handleSubmit} disabled={status === 'loading' || !name.trim()}
          style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 9, background: status === 'loading' ? '#D4A55A' : '#C68A2F', cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}>
          {status === 'loading' ? 'Creating…' : 'Create class'}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────────

function TopBar({ classes, selectedClassId, onSelectClass, joinCode, onInvite, onNewClass, onMenu, isMobile, isCompact }: {
  classes: ClassRow[]; selectedClassId: string; onSelectClass: (id: string) => void;
  joinCode: string | null; onInvite: () => void; onNewClass: () => void; onMenu: () => void;
  isMobile: boolean; isCompact: boolean;
}) {
  const [copied, setCopied] = useState(false);
  function copyCode() {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid rgba(15,30,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: isMobile ? '10px 16px' : '0 28px', minHeight: 60, flexWrap: isMobile ? 'wrap' : 'nowrap', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {isCompact && (
          <button onClick={onMenu} aria-label="Open menu" data-tour="menu-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 9, border: '1px solid #D3D1C7', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0F1E35" strokeWidth="1.8" strokeLinecap="round"><line x1="2.5" y1="5" x2="15.5" y2="5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><line x1="2.5" y1="13" x2="15.5" y2="13" /></svg>
          </button>
        )}
        {classes.length > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '4px 8px 4px 12px', minWidth: 0 }}>
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
          <div data-tour="join-code" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#F5F5F3', border: '1px solid #E2E0D8', borderRadius: 9, padding: '6px 10px 6px 12px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: DASH.dim }}>Join code</span>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13.5, fontWeight: 700, color: DASH.heading, letterSpacing: 0.5 }}>{joinCode}</span>
            <span style={{ width: 1, height: 16, background: '#D3D1C7' }} />
            <button onClick={copyCode} title="Copy join code" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: copied ? '#4F9A2E' : '#5F5E5A' }}>
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 7 13 15 5" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.6" /><path d="M11 5 V3.5 a1.5 1.5 0 0 0 -1.5 -1.5 H4 a1.5 1.5 0 0 0 -1.5 1.5 V11 a1.5 1.5 0 0 0 1.5 1.5 H5.5" /></svg>
              )}
            </button>
          </div>
        )}
        {classes.length > 0 && (
          <button onClick={onInvite} data-tour="invite" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: DASH.heading }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="8" y1="3.5" x2="8" y2="12.5" /><line x1="3.5" y1="8" x2="12.5" y2="8" /></svg>
            Invite
          </button>
        )}
        <button onClick={onNewClass} data-tour="new-class" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C68A2F', border: 'none', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#B27C29'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#C68A2F'; }}>
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
    <div style={{ ...cardStyle(), padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0F1E35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
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
      <div style={{ marginTop: 12 }}>
        <StrandProfileBar s={s} />
      </div>
      <a href={`/teacher/student/${s.student_id}?class_id=${classId}`} style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: '#C68A2F', textDecoration: 'none' }}>View profile →</a>
    </div>
  );
}

function Roster({ students, enrolled, sortBy, onSortChange, classId, isMobile, onExport }: {
  students: DisplayStudent[]; enrolled: number; sortBy: string; onSortChange: (s: string) => void; classId: string; isMobile: boolean;
  onExport: () => void;
}) {
  return (
    <div id="roster" data-tour="roster">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>Class roster</h2>
          <span style={{ fontSize: 12, fontWeight: 600, color: DASH.dim, background: DASH.chipBg, padding: '2px 8px', borderRadius: 20 }}>{enrolled}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: DASH.dim }}>Sort by</span>
          {['risk', 'score', 'name'].map((opt) => (
            <button key={opt} onClick={() => onSortChange(opt)}
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid', borderColor: sortBy === opt ? '#C68A2F' : '#D3D1C7', background: sortBy === opt ? '#FBF4E6' : '#fff', color: sortBy === opt ? '#9A6A1F' : '#5F5E5A', textTransform: 'capitalize' }}>
              {opt === 'risk' ? 'Need help' : opt}
            </button>
          ))}
          <button
            onClick={onExport}
            data-tour="export"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid #D3D1C7', background: '#fff', color: '#5F5E5A', fontFamily: 'inherit' }}
          >
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 2v9" /><path d="M5 8l4 4 4-4" /><path d="M3 14v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div style={{ ...cardStyle(), boxShadow: 'none', padding: '40px 24px', textAlign: 'center', marginBottom: 34 }}>
          <p style={{ fontSize: 14, color: DASH.muted, margin: '0 0 6px' }}>No students enrolled yet.</p>
          <p style={{ fontSize: 13, color: DASH.dim, margin: 0 }}>Share the join code above or invite students by email.</p>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 34 }}>
          {students.map((s) => <RosterCard key={s.student_id} s={s} classId={classId} />)}
        </div>
      ) : (
        <div style={{ ...cardStyle(), overflowX: 'auto', marginBottom: 34 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: DASH.subtleBg, borderBottom: `1px solid ${DASH.line}` }}>
                {['Student', 'Score', 'Placement', 'Strand profile', 'Tests', 'Last active', ''].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Tests' ? 'center' : 'left', padding: h === '' || h === 'Student' ? '11px 20px' : '11px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: DASH.dim, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.student_id} style={{ borderBottom: i < students.length - 1 ? `1px solid ${DASH.hairline}` : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = DASH.rowHoverBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0F1E35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
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
                      style={{ fontSize: 13, fontWeight: 700, color: '#C68A2F', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      View →
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
      <div style={{ width: 30, height: 30, border: '3px solid #E7E5DD', borderTopColor: '#C68A2F', borderRadius: '50%', margin: '0 auto', animation: 'umspin 0.8s linear infinite' }} />
      <style>{`@keyframes umspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

// Sidebar rail widths. The gap between them is what the width transition
// animates across.
const SIDEBAR_W = 200;
const SIDEBAR_W_COLLAPSED = 64;

export default function TeacherDashboardClient({ initialClasses, teacherName, teacherEmail, isFounder, plan, tourState }: {
  initialClasses: ClassRow[]; teacherName: string; teacherEmail: string; isFounder: boolean;
  plan: string | null;
  tourState: 'done' | 'pending' | 'unavailable';
}) {
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClasses[0]?.id ?? '');
  const [roster, setRoster] = useState<RosterRow[] | null>(null);
  const [misconceptions, setMisconceptions] = useState<Misconception[] | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('risk');
  const [showInvite, setShowInvite] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showNewClass, setShowNewClass] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;

  const loadClassData = useCallback(async (classId: string) => {
    if (!classId) { setRoster([]); setMisconceptions([]); return; }
    setRoster(null);
    setMisconceptions(null);
    setRosterError(null);
    const [rosterRes, mcRes] = await Promise.all([
      fetch(`/api/teacher/roster?class_id=${classId}`),
      fetch(`/api/teacher/misconceptions?class_id=${classId}`),
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
        body { margin: 0; background: ${DASH.pageBg}; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
        ${HOVER_LABEL_CSS}
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT_BODY, color: DASH.ink }}>

        {/* Desktop sidebar. Width animates between the two rail widths; the
            z-index keeps the collapse handle and the hover labels above the
            sticky top bar. */}
        {!isCompact && (
          <aside
            // Marks the rail as a keep-out region for the tour card, which must
            // not be laid over it. Not a data-tour key: this is geometry the
            // tour reads, never a step target.
            data-tour-rail=""
            style={{
              width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
              flex: `0 0 ${collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W}px`,
              background: '#0F1E35', color: '#fff',
              display: 'flex', flexDirection: 'column',
              position: 'sticky', top: 0, height: '100vh', zIndex: 30,
              transition: 'width 220ms ease, flex-basis 220ms ease',
            }}
          >
            <SidebarInner
              teacherName={teacherName}
              teacherEmail={teacherEmail}
              isFounder={isFounder}
              plan={plan}
              collapsed={collapsed}
              onOpenSupport={() => setShowSupport(true)}
              onStartTour={() => setTourManual(true)}
            />

            {/* Collapse handle, sat on the seam where the navy rail meets the
                white top bar. */}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                position: 'absolute', top: 46, right: -13, zIndex: 40,
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', border: '1px solid rgba(15,30,53,0.12)',
                boxShadow: '0 2px 8px rgba(15,30,53,0.18)',
                color: DASH.heading, cursor: 'pointer', padding: 0,
              }}
            >
              {/* Chevron flips to point the way the next click will move it. */}
              <svg
                width="13" height="13" viewBox="0 0 18 18" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease' }}
              >
                <polyline points="11 4 6 9 11 14" />
              </svg>
            </button>
          </aside>
        )}

        {/* Mobile/tablet slide-over sidebar. Always full width: the collapse
            handle is a desktop affordance, the slide-over already closes. */}
        {isCompact && menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,30,53,0.5)' }} />
            <aside style={{ position: 'relative', width: 240, maxWidth: '82vw', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
              <SidebarInner
                teacherName={teacherName}
                teacherEmail={teacherEmail}
                isFounder={isFounder}
                plan={plan}
                onNavigate={() => setMenuOpen(false)}
                onOpenSupport={() => { setMenuOpen(false); setShowSupport(true); }}
                // Closing the slide-over first matters: it is a fixed, full
                // height panel, and leaving it up would cover the very targets
                // the first steps point at.
                onStartTour={() => { setMenuOpen(false); setTourManual(true); }}
              />
            </aside>
          </div>
        )}

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: DASH.pageBg }}>
          <TopBar
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={setSelectedClassId}
            joinCode={selectedClass?.join_code ?? null}
            onInvite={() => setShowInvite(true)}
            onNewClass={() => setShowNewClass(true)}
            onMenu={() => setMenuOpen(true)}
            isMobile={isMobile}
            isCompact={isCompact}
          />

          <div style={{ padding: isMobile ? '18px 16px 48px' : '26px 32px 52px' }}>
            {/* Page header */}
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: isMobile ? 22 : 27, letterSpacing: -0.4, color: DASH.heading }}>{selectedClass?.name ?? 'Your classes'}</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: DASH.muted }}>
                {classes.length === 0
                  ? 'Create your first class to get started.'
                  : `${rosterRows.length} ${rosterRows.length === 1 ? 'student' : 'students'} · ${totalAttempts} ${totalAttempts === 1 ? 'attempt' : 'attempts'}`}
              </div>
            </div>

            {classes.length === 0 ? (
              <div style={{ ...cardStyle(), padding: '48px 28px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: DASH.heading, margin: '0 0 8px' }}>Create your first class</p>
                <p style={{ fontSize: 13.5, color: DASH.muted, margin: '0 0 20px', lineHeight: 1.6 }}>Set up a class to get a join code, invite students, and start seeing<br />class-wide misconception patterns.</p>
                <button onClick={() => setShowNewClass(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C68A2F', border: 'none', borderRadius: 9, padding: '11px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff' }}>+ New class</button>
              </div>
            ) : loading ? (
              <Spinner />
            ) : rosterError ? (
              <p style={{ color: '#C2402F', fontSize: 14 }}>{rosterError}</p>
            ) : (
              <>
                <SummaryCards enrolled={rosterRows.length} notTested={notTested} crCount={collegeReady} crPct={crPct} weakStrand={weakStrand} avgScore={avgScore} cols={summaryCols} />
                <NewAnnouncement classes={classes} selectedClassId={selectedClassId} />
                <StrandPanel strandPct={strandPct} totalAttempts={totalAttempts} cols={strandCols} />
                <Roster students={sortedStudents} enrolled={rosterRows.length} sortBy={sortBy} onSortChange={setSortBy} classId={selectedClassId} isMobile={isMobile} onExport={() => setShowExport(true)} />

                {/* Misconceptions */}
                <div id="misconceptions" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
                    <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>Top misconceptions</h2>
                    <span style={{ fontSize: 13, color: DASH.muted }}>Class-wide, most recent test per student</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: DASH.dim }}>
                    {ORDER.map((k) => (
                      <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: STR[k].color, display: 'inline-block' }} />{k}
                      </span>
                    ))}
                  </div>
                </div>
                {misconceptions === null ? (
                  <Spinner />
                ) : misconceptions.length === 0 ? (
                  <div style={{ ...cardStyle(), boxShadow: 'none', padding: '32px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: DASH.muted, margin: 0 }}>No misconception data yet. Students need to complete at least one test.</p>
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
      </div>

      {showInvite && selectedClass && <InviteModal classId={selectedClass.id} onClose={() => setShowInvite(false)} />}
      {showExport && <ExportModal classes={classes} selectedClassId={selectedClassId} onClose={() => setShowExport(false)} />}
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
