'use client';

import { useState, useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import MathText from '../components/MathText';
import { LogoutButton } from '../components/LogoutButton';
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from '../components/fonts';

// ─── Types (match the API route response shapes) ─────────────────────────────

export interface ClassRow {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
}

type Strand = 'QR' | 'AR' | 'GR' | 'PR';

interface StrandBreakdown {
  QR?: { pct: number; total: number; correct: number };
  AR?: { pct: number; total: number; correct: number };
  GR?: { pct: number; total: number; correct: number };
  PR?: { pct: number; total: number; correct: number };
}

interface RosterRow {
  student_id: string;
  email: string;
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
  item_id: string;
  selected_answer: string;
  distractor_text: string;
  primary_strand: string;
  topic_id: string;
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

const PASSING = 950;

const STR: Record<Strand, { code: string; name: string; short: string; color: string }> = {
  QR: { code: 'QR', name: 'Quantitative Reasoning', short: 'Quantitative Reasoning', color: '#B5D4F4' },
  AR: { code: 'AR', name: 'Algebraic Reasoning', short: 'Algebraic Reasoning', color: '#9FE1CB' },
  GR: { code: 'GR', name: 'Geometric & Spatial', short: 'Geometric and Spatial Reasoning', color: '#FAC775' },
  PR: { code: 'PR', name: 'Probabilistic & Statistical', short: 'Probabilistic and Statistical Reasoning', color: '#CECBF6' },
};
const ORDER: Strand[] = ['QR', 'AR', 'GR', 'PR'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function placementBand(score: number | null) {
  if (score === null) return { label: 'No test yet', bg: '#F0EEE7', text: '#5F5E5A', dot: '#B4B2A8' };
  if (score >= PASSING) return { label: 'College ready', bg: '#EAF3DE', text: '#356B1B', dot: '#4F9A2E' };
  if (score >= 935) return { label: 'Approaching', bg: '#FAEEDA', text: '#8A5712', dot: '#C68A2F' };
  return { label: 'Below college ready', bg: '#FCEBEB', text: '#9A2A2A', dot: '#C2402F' };
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 14) return '1w ago';
  return `${Math.floor(days / 7)}w ago`;
}

function strandPcts(bd: StrandBreakdown | null): Record<Strand, number> {
  return {
    QR: bd?.QR?.pct ?? 0,
    AR: bd?.AR?.pct ?? 0,
    GR: bd?.GR?.pct ?? 0,
    PR: bd?.PR?.pct ?? 0,
  };
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
    name: r.email.split('@')[0],
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
function Brand() {
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

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/teacher' },
  { label: 'Misconceptions', href: '/teacher#misconceptions' },
  { label: 'Students', href: '/teacher#roster' },
  { label: 'Take a practice test', href: '/adaptive-test' },
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

function SidebarInner({ teacherName, teacherEmail, onNavigate }: { teacherName: string; teacherEmail: string; onNavigate?: () => void }) {
  const initials = teacherName.split(/[\s._-]+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'T';
  return (
    <>
      <div style={{ padding: '22px 18px 18px' }}>
        <Brand />
        <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(198,138,47,0.45)', color: '#E7BE7B', fontSize: 9, fontWeight: 700, letterSpacing: 1.4, padding: '3px 8px', borderRadius: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C68A2F' }} />
          TEACHER · PRO
        </div>
      </div>
      <nav style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === 'Dashboard';
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 11px', borderRadius: 8, fontSize: 13,
                fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                color: isActive ? '#E7BE7B' : 'rgba(255,255,255,0.64)',
                background: isActive ? 'rgba(198,138,47,0.14)' : 'transparent',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {navIcon(item.label)}
              {item.label}
            </a>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1C3052', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 32px' }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherName}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherEmail}</div>
          </div>
          <LogoutButton variant="dark" size={30} />
        </div>
      </div>
    </>
  );
}

// ─── Summary cards ───────────────────────────────────────────────────────────

function SummaryCards({ enrolled, notTested, crCount, crPct, weakStrand, avgScore, cols }: {
  enrolled: number; notTested: number; crCount: number; crPct: number | null;
  weakStrand: { code: string; name: string; color: string; pct: number } | null;
  avgScore: number | null; cols: number;
}) {
  const card = { background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '18px 18px 16px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)' };
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase' as const, color: '#8A8983' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16, marginBottom: 16 }}>
      <div style={card}>
        <div style={labelStyle}>Students enrolled</div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{enrolled}</div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>{notTested > 0 ? `${notTested} not yet tested` : 'All students tested'}</div>
      </div>
      <div style={card}>
        <div style={labelStyle}>College ready</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{crCount}</span>
          {crPct !== null && <span style={{ fontSize: 15, fontWeight: 600, color: '#4F9A2E' }}>{crPct}%</span>}
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>Scored ≥ 950 on TSIA2</div>
      </div>
      {/* Weakest strand — amber highlight */}
      <div style={{ background: '#FBF4E6', border: '1px solid rgba(198,138,47,0.35)', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 2px rgba(198,138,47,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A6A1F' }}>Weakest strand</span>
          {weakStrand && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, color: '#fff', background: '#C68A2F', padding: '2px 6px', borderRadius: 4 }}>FOCUS</span>}
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#0F1E35', lineHeight: 1.05 }}>{weakStrand ? weakStrand.name : '—'}</span>
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
          <span style={{ fontSize: 32, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{avgScore ?? '—'}</span>
          {avgScore !== null && <span style={{ fontSize: 14, fontWeight: 600, color: '#8A8983' }}>/ 990</span>}
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>Passing 950 · scale 910–990</div>
      </div>
    </div>
  );
}

// ─── Strand mastery panel ─────────────────────────────────────────────────────

function StrandPanel({ strandPct, totalAttempts, cols }: { strandPct: Record<Strand, number>; totalAttempts: number; cols: number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '20px 22px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)', marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: '#0F1E35' }}>Class strand mastery</h2>
          <div style={{ marginTop: 3, fontSize: 12, color: '#5F5E5A' }}>Average accuracy by TSIA2 reasoning strand</div>
        </div>
        <div style={{ fontSize: 11, color: '#8A8983', fontWeight: 600 }}>{totalAttempts} attempts this class</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 18, alignItems: 'end' }}>
        {ORDER.map((code) => (
          <div key={code} style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ position: 'relative', width: 46, height: 118, background: '#F2F1EC', borderRadius: 7, overflow: 'hidden', flex: '0 0 46px' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: STR[code].color, height: `${strandPct[code]}%`, borderRadius: '7px 7px 0 0' }} />
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0F1E35', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{strandPct[code]}<span style={{ fontSize: 13, color: '#8A8983' }}>%</span></div>
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#0F1E35' }}>{code}</div>
              <div style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.3 }}>{STR[code].short}</div>
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
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8A8983' }}>
        <span style={{ width: 7, height: 7, borderRadius: 2, background: s.weakColor, display: 'inline-block' }} />
        <span>Weakest · <span style={{ fontWeight: 600, color: '#5F5E5A' }}>{s.weakLabel}</span></span>
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
      style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: 18, boxShadow: hovered ? '0 4px 16px rgba(15,30,53,0.07)' : '0 1px 2px rgba(15,30,53,0.04)', display: 'flex', flexDirection: 'column', minHeight: 182, transition: 'box-shadow 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0F1E35', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 28px' }}>{m.rank}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0F1E35' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: strandColor, display: 'inline-block' }} />
            {m.primary_strand}
          </span>
        </div>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#5F5E5A', background: '#F4F3EE', padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap' }}>{m.topic_id}</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#26262A', flex: '1 1 auto', maxHeight: 88, overflow: 'hidden' }}>
        <MathText text={m.distractor_text} />
      </div>
      <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid #F0EEE7', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 12, color: '#5F5E5A' }}>
          <span style={{ fontWeight: 700, color: '#1A1A1A' }}>Selected {m.frequency}×</span>
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
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#5F5E5A', lineHeight: 1.5 }}>
            Enter a student email. If they already have an account they&apos;ll be enrolled immediately. Otherwise they&apos;ll receive an invite link.
          </p>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setMessage(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="student@school.edu"
            type="email"
            style={{ width: '100%', border: `1px solid ${status === 'error' ? '#C2402F' : '#D3D1C7'}`, borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
          />
          {status === 'error' && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#C2402F' }}>{message}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 9, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#5F5E5A' }}>Cancel</button>
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
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#5F5E5A', lineHeight: 1.5 }}>
        Give your class a name. A join code is generated automatically so students can enroll.
      </p>
      <input
        value={name}
        onChange={(e) => { setName(e.target.value); setStatus('idle'); setMessage(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="e.g. TSIA2 Prep — Period 2"
        autoFocus
        style={{ width: '100%', border: `1px solid ${status === 'error' ? '#C2402F' : '#D3D1C7'}`, borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', color: '#1A1A1A', outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
      />
      {status === 'error' && <p style={{ margin: '0 0 10px', fontSize: 12, color: '#C2402F' }}>{message}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 9, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#5F5E5A' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={status === 'loading' || !name.trim()}
          style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 9, background: status === 'loading' ? '#D4A55A' : '#C68A2F', cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}>
          {status === 'loading' ? 'Creating…' : 'Create class'}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,30,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(15,30,53,0.18)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8983', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
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
          <button onClick={onMenu} aria-label="Open menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 9, border: '1px solid #D3D1C7', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0F1E35" strokeWidth="1.8" strokeLinecap="round"><line x1="2.5" y1="5" x2="15.5" y2="5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><line x1="2.5" y1="13" x2="15.5" y2="13" /></svg>
          </button>
        )}
        {classes.length > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '4px 8px 4px 12px', minWidth: 0 }}>
            <select
              value={selectedClassId}
              onChange={(e) => onSelectClass(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#1A1A1A', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', maxWidth: isMobile ? 180 : 280, textOverflow: 'ellipsis' }}
            >
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>No classes yet</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {joinCode && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#F5F5F3', border: '1px solid #E2E0D8', borderRadius: 9, padding: '6px 10px 6px 12px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8A8983' }}>Join code</span>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13.5, fontWeight: 700, color: '#0F1E35', letterSpacing: 0.5 }}>{joinCode}</span>
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
          <button onClick={onInvite} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#0F1E35' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="8" y1="3.5" x2="8" y2="12.5" /><line x1="3.5" y1="8" x2="12.5" y2="8" /></svg>
            Invite
          </button>
        )}
        <button onClick={onNewClass} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C68A2F', border: 'none', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}
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
    <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(15,30,53,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0F1E35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: '#8A8983', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
          </div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{s.score ?? '—'}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bandBg, color: s.bandText, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.bandDot }} />{s.band}
        </span>
        <span style={{ fontSize: 12, color: '#8A8983' }}>{s.tests} {s.tests === 1 ? 'test' : 'tests'} · {s.active}</span>
      </div>
      <div style={{ marginTop: 12 }}>
        <StrandProfileBar s={s} />
      </div>
      <a href={`/teacher/student/${s.student_id}?class_id=${classId}`} style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 700, color: '#C68A2F', textDecoration: 'none' }}>View profile →</a>
    </div>
  );
}

function Roster({ students, enrolled, sortBy, onSortChange, classId, isMobile }: {
  students: DisplayStudent[]; enrolled: number; sortBy: string; onSortChange: (s: string) => void; classId: string; isMobile: boolean;
}) {
  return (
    <div id="roster">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Class roster</h2>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8A8983', background: '#EDEBE4', padding: '2px 8px', borderRadius: 20 }}>{enrolled}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#8A8983' }}>Sort by</span>
          {['risk', 'score', 'name'].map((opt) => (
            <button key={opt} onClick={() => onSortChange(opt)}
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid', borderColor: sortBy === opt ? '#C68A2F' : '#D3D1C7', background: sortBy === opt ? '#FBF4E6' : '#fff', color: sortBy === opt ? '#9A6A1F' : '#5F5E5A', textTransform: 'capitalize' }}>
              {opt === 'risk' ? 'Need help' : opt}
            </button>
          ))}
        </div>
      </div>

      {students.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '40px 24px', textAlign: 'center', marginBottom: 34 }}>
          <p style={{ fontSize: 14, color: '#5F5E5A', margin: '0 0 6px' }}>No students enrolled yet.</p>
          <p style={{ fontSize: 13, color: '#8A8983', margin: 0 }}>Share the join code above or invite students by email.</p>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 34 }}>
          {students.map((s) => <RosterCard key={s.student_id} s={s} classId={classId} />)}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, boxShadow: '0 1px 2px rgba(15,30,53,0.04)', overflowX: 'auto', marginBottom: 34 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#FBFBF9', borderBottom: '1px solid #E7E5DD' }}>
                {['Student', 'Score', 'Placement', 'Strand profile', 'Tests', 'Last active', ''].map((h) => (
                  <th key={h} style={{ textAlign: h === 'Tests' ? 'center' : 'left', padding: h === '' || h === 'Student' ? '11px 20px' : '11px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#8A8983', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.student_id} style={{ borderBottom: i < students.length - 1 ? '1px solid #F0EEE7' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAFAF7'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0F1E35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A' }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: '#8A8983' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums' }}>{s.score ?? '—'}</span>
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
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#5F5E5A', fontVariantNumeric: 'tabular-nums' }}>{s.tests}</span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ fontSize: 12.5, color: '#8A8983' }}>{s.active}</span>
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

export default function TeacherDashboardClient({ initialClasses, teacherName, teacherEmail }: {
  initialClasses: ClassRow[]; teacherName: string; teacherEmail: string;
}) {
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClasses[0]?.id ?? '');
  const [roster, setRoster] = useState<RosterRow[] | null>(null);
  const [misconceptions, setMisconceptions] = useState<Misconception[] | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('risk');
  const [showInvite, setShowInvite] = useState(false);
  const [showNewClass, setShowNewClass] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F5F5F3; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT_BODY, color: '#1A1A1A' }}>

        {/* Desktop sidebar */}
        {!isCompact && (
          <aside style={{ width: 200, flex: '0 0 200px', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
            <SidebarInner teacherName={teacherName} teacherEmail={teacherEmail} />
          </aside>
        )}

        {/* Mobile/tablet slide-over sidebar */}
        {isCompact && menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,30,53,0.5)' }} />
            <aside style={{ position: 'relative', width: 240, maxWidth: '82vw', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
              <SidebarInner teacherName={teacherName} teacherEmail={teacherEmail} onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F5F5F3' }}>
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
              <h1 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: isMobile ? 22 : 27, letterSpacing: -0.4, color: '#0F1E35' }}>{selectedClass?.name ?? 'Your classes'}</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: '#5F5E5A' }}>
                {classes.length === 0
                  ? 'Create your first class to get started.'
                  : `${rosterRows.length} ${rosterRows.length === 1 ? 'student' : 'students'} · ${totalAttempts} ${totalAttempts === 1 ? 'attempt' : 'attempts'}`}
              </div>
            </div>

            {classes.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '48px 28px', textAlign: 'center', boxShadow: '0 1px 2px rgba(15,30,53,0.04)' }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#0F1E35', margin: '0 0 8px' }}>Create your first class</p>
                <p style={{ fontSize: 13.5, color: '#5F5E5A', margin: '0 0 20px', lineHeight: 1.6 }}>Set up a class to get a join code, invite students, and start seeing<br />class-wide misconception patterns.</p>
                <button onClick={() => setShowNewClass(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C68A2F', border: 'none', borderRadius: 9, padding: '11px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#fff' }}>+ New class</button>
              </div>
            ) : loading ? (
              <Spinner />
            ) : rosterError ? (
              <p style={{ color: '#C2402F', fontSize: 14 }}>{rosterError}</p>
            ) : (
              <>
                <SummaryCards enrolled={rosterRows.length} notTested={notTested} crCount={collegeReady} crPct={crPct} weakStrand={weakStrand} avgScore={avgScore} cols={summaryCols} />
                <StrandPanel strandPct={strandPct} totalAttempts={totalAttempts} cols={strandCols} />
                <Roster students={sortedStudents} enrolled={rosterRows.length} sortBy={sortBy} onSortChange={setSortBy} classId={selectedClassId} isMobile={isMobile} />

                {/* Misconceptions */}
                <div id="misconceptions" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
                    <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Top misconceptions</h2>
                    <span style={{ fontSize: 13, color: '#5F5E5A' }}>Class-wide, most recent test per student</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#8A8983' }}>
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
                  <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 14, color: '#5F5E5A', margin: 0 }}>No misconception data yet. Students need to complete at least one test.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${miscCols},1fr)`, gap: 16 }}>
                    {misconceptions.map((m) => <MiscCard key={`${m.item_id}-${m.selected_answer}`} m={m} testedCount={tested.length} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {showInvite && selectedClass && <InviteModal classId={selectedClass.id} onClose={() => setShowInvite(false)} />}
      {showNewClass && <NewClassModal onClose={() => setShowNewClass(false)} onCreated={handleClassCreated} />}
    </>
  );
}
