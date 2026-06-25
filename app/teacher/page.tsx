'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

interface StrandAcc { QR: number; AR: number; GR: number; PR: number; }

interface StudentRaw {
  name: string;
  email: string;
  score: number;
  band: 'College ready' | 'Approaching' | 'Below college ready';
  acc: StrandAcc;
  tests: number;
  active: string;
}

interface Student extends StudentRaw {
  initials: string;
  bandBg: string; bandText: string; bandDot: string;
  wQR: number; wAR: number; wGR: number; wPR: number;
  weakCode: string; weakColor: string; weakPct: number; weakLabel: string;
}

interface MiscBar { h: number; }
interface Misconception {
  rank: number; strand: string; topic: string; freq: number;
  students: number; text: string; trend: number[];
  color: string; bars: MiscBar[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STR: Record<string, { code: string; name: string; color: string }> = {
  QR: { code: 'QR', name: 'Quantitative Reasoning', color: '#B5D4F4' },
  AR: { code: 'AR', name: 'Algebraic Reasoning', color: '#9FE1CB' },
  GR: { code: 'GR', name: 'Geometric & Spatial', color: '#FAC775' },
  PR: { code: 'PR', name: 'Probabilistic & Statistical', color: '#CECBF6' },
};
const ORDER = ['QR', 'AR', 'GR', 'PR'] as const;

function bandStyle(b: string) {
  if (b === 'College ready') return { bg: '#EAF3DE', text: '#356B1B', dot: '#4F9A2E' };
  if (b === 'Approaching')   return { bg: '#FAEEDA', text: '#8A5712', dot: '#C68A2F' };
  return { bg: '#FCEBEB', text: '#9A2A2A', dot: '#C2402F' };
}

const RAW_STUDENTS: StudentRaw[] = [
  { name: 'Maria A.',   email: 'maria.alvarez@lincolnhs.edu',    score: 962, band: 'College ready',       acc: { QR: 88, AR: 82, GR: 58, PR: 79 }, tests: 4, active: '1d ago' },
  { name: 'Jose R.',    email: 'jose.ramirez@lincolnhs.edu',     score: 938, band: 'Approaching',          acc: { QR: 71, AR: 29, GR: 64, PR: 68 }, tests: 3, active: '2d ago' },
  { name: 'Tanya P.',   email: 'tanya.pham@lincolnhs.edu',       score: 921, band: 'Below college ready',  acc: { QR: 52, AR: 14, GR: 48, PR: 55 }, tests: 2, active: '5d ago' },
  { name: 'David L.',   email: 'david.lee@lincolnhs.edu',        score: 955, band: 'College ready',       acc: { QR: 84, AR: 80, GR: 77, PR: 43 }, tests: 5, active: '1d ago' },
  { name: 'Sofia K.',   email: 'sofia.kowalski@lincolnhs.edu',   score: 947, band: 'Approaching',          acc: { QR: 57, AR: 73, GR: 70, PR: 75 }, tests: 3, active: '3d ago' },
  { name: 'Marcus T.',  email: 'marcus.turner@lincolnhs.edu',    score: 929, band: 'Below college ready',  acc: { QR: 55, AR: 14, GR: 50, PR: 58 }, tests: 2, active: '6d ago' },
  { name: 'Priya N.',   email: 'priya.nair@lincolnhs.edu',       score: 958, band: 'College ready',       acc: { QR: 86, AR: 82, GR: 43, PR: 80 }, tests: 4, active: '2d ago' },
  { name: 'Aaliyah W.', email: 'aaliyah.williams@lincolnhs.edu', score: 933, band: 'Approaching',          acc: { QR: 68, AR: 70, GR: 66, PR: 29 }, tests: 3, active: '4d ago' },
];

const MISC_RAW = [
  { rank: 1, strand: 'AR', topic: 'AR.2.3', freq: 18, students: 7, text: 'Student stops one step too early, treating an intermediate result as the final answer.', trend: [2, 3, 3, 4, 3, 3] },
  { rank: 2, strand: 'AR', topic: 'AR.1.2', freq: 14, students: 6, text: 'Student confuses slope with y-intercept when reading a linear equation in slope-intercept form.', trend: [1, 2, 2, 3, 3, 3] },
  { rank: 3, strand: 'QR', topic: 'QR.1.4', freq: 11, students: 5, text: 'Student adds when the inverse operation requires subtraction.', trend: [2, 2, 1, 2, 2, 2] },
  { rank: 4, strand: 'GR', topic: 'GR.2.7', freq: 9,  students: 4, text: 'Student omits the 1/3 factor from the pyramid volume formula entirely.', trend: [1, 1, 2, 2, 1, 2] },
  { rank: 5, strand: 'PR', topic: 'PR.1.5', freq: 7,  students: 4, text: 'Student reasons that there are only two possible outcomes and a finite count is involved, confusing a binary categorical variable with a discrete numerical variable.', trend: [1, 1, 1, 2, 1, 1] },
  { rank: 6, strand: 'QR', topic: 'QR.2.4', freq: 6,  students: 3, text: 'Student applies another 20% increase instead of reversing the operation to find the original value.', trend: [1, 0, 1, 1, 2, 1] },
];

// ─── Data transforms ────────────────────────────────────────────────────────

function processStudents(raw: StudentRaw[], sortBy: string): Student[] {
  const students: Student[] = raw.map(r => {
    const sum = ORDER.reduce((a, k) => a + r.acc[k], 0);
    const w: Record<string, number> = {};
    ORDER.forEach(k => { w[k] = Math.round(r.acc[k] / sum * 1000) / 10; });
    let wk: string = ORDER[0];
    ORDER.forEach(k => { if (r.acc[k] < r.acc[wk as keyof StrandAcc]) wk = k; });
    const bs = bandStyle(r.band);
    const initials = r.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
    return {
      ...r, initials,
      bandBg: bs.bg, bandText: bs.text, bandDot: bs.dot,
      wQR: w.QR, wAR: w.AR, wGR: w.GR, wPR: w.PR,
      weakCode: wk, weakColor: STR[wk].color, weakPct: r.acc[wk as keyof StrandAcc],
      weakLabel: `${wk} ${r.acc[wk as keyof StrandAcc]}%`,
    };
  });
  if (sortBy === 'score') students.sort((a, b) => b.score - a.score);
  else if (sortBy === 'name') students.sort((a, b) => a.name.localeCompare(b.name));
  else students.sort((a, b) => a.weakPct - b.weakPct);
  return students;
}

function processMisc(): Misconception[] {
  return MISC_RAW.map(m => {
    const mx = Math.max(...m.trend, 1);
    return { ...m, color: STR[m.strand].color, bars: m.trend.map(v => ({ h: Math.max(14, Math.round(v / mx * 100)) })) };
  });
}

function computeStats(raw: StudentRaw[]) {
  const avg = (k: keyof StrandAcc) => Math.round(raw.reduce((a, r) => a + r.acc[k], 0) / raw.length);
  const strandPct = { QR: avg('QR'), AR: avg('AR'), GR: avg('GR'), PR: avg('PR') };
  const avgScore = Math.round(raw.reduce((a, r) => a + r.score, 0) / raw.length);
  const crCount = raw.filter(r => r.band === 'College ready').length;
  const crPct = Math.round(crCount / raw.length * 100);
  let ws: string = ORDER[0];
  ORDER.forEach(k => { if (strandPct[k] < strandPct[ws as keyof typeof strandPct]) ws = k; });
  const weakStrand = { code: ws, name: STR[ws].name, color: STR[ws].color, pct: strandPct[ws as keyof typeof strandPct] };
  const totalAttempts = raw.reduce((a, r) => a + r.tests, 0);
  return { strandPct, avgScore, crCount, crPct, weakStrand, totalAttempts };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" strokeLinecap="round">
      <path d="M6 8 V17 a10 10 0 0 0 20 0 V8" stroke="#C68A2F" strokeWidth="3.4" />
      <path d="M12 8 V16 a4 4 0 0 0 8 0 V8" stroke="#B5D4F4" strokeWidth="3.2" />
    </svg>
  );
}

function Sidebar({ activeNav, teacherName, teacherEmail }: {
  activeNav: string;
  teacherName: string;
  teacherEmail: string;
}) {
  const initials = teacherName.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const navItems = [
    { label: 'Dashboard', href: '/teacher', icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.2"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.2"/>
        <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.2"/><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.2"/>
      </svg>
    )},
    { label: 'Misconceptions', href: '/teacher/misconceptions', icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2.4 L16.2 15 H1.8 Z"/><line x1="9" y1="7" x2="9" y2="10.5"/>
        <circle cx="9" cy="12.8" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    )},
    { label: 'Students', href: '/teacher/students', icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.3" cy="6" r="2.4"/><circle cx="12.4" cy="6.6" r="2"/>
        <path d="M2 15 a4.3 4.3 0 0 1 8.6 0"/><path d="M10.4 14.6 a3.6 3.6 0 0 1 5.6 0"/>
      </svg>
    )},
    { label: 'Take a practice test', href: '/', icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.2" y="2" width="11.6" height="14" rx="1.6"/>
        <line x1="6" y1="6" x2="12" y2="6"/><line x1="6" y1="9" x2="12" y2="9"/><line x1="6" y1="12" x2="9.6" y2="12"/>
      </svg>
    )},
    { label: 'Student view', href: '/dashboard', icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.4 9 C4.2 4.2 13.8 4.2 16.6 9 C13.8 13.8 4.2 13.8 1.4 9 Z"/>
        <circle cx="9" cy="9" r="2.3"/>
      </svg>
    )},
  ];

  return (
    <aside style={{ width: 200, flex: '0 0 200px', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}>
            <LogoMark />
          </div>
          <span style={{ fontFamily: "'Kodchasan', sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: -0.2, color: '#fff' }}>UnpackMath</span>
        </div>
        <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(198,138,47,0.45)', color: '#E7BE7B', fontSize: 9, fontWeight: 700, letterSpacing: 1.4, padding: '3px 8px', borderRadius: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C68A2F' }} />
          TEACHER · PRO
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const isActive = item.label === activeNav;
          return (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 11px', borderRadius: 8, fontSize: 13,
                fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                color: isActive ? '#E7BE7B' : 'rgba(255,255,255,0.64)',
                background: isActive ? 'rgba(198,138,47,0.14)' : 'transparent',
                boxShadow: isActive ? 'inset 3px 0 0 #C68A2F' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Teacher chip */}
      <div style={{ marginTop: 'auto', padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1C3052', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 32px' }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherName}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teacherEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ className, joinCode, onInviteClick, onNewClassClick }: {
  className: string; joinCode: string;
  onInviteClick: () => void; onNewClassClick: () => void;
}) {
  const [copied, setCopied] = useState(false);
  function copyCode() {
    navigator.clipboard.writeText(joinCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header style={{ height: 60, flex: '0 0 60px', background: '#fff', borderBottom: '1px solid rgba(15,30,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 5 }}>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{className}</span>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#5F5E5A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6 L8 10 L12 6"/></svg>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Join code */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#F5F5F3', border: '1px solid #E2E0D8', borderRadius: 9, padding: '6px 10px 6px 12px' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8A8983' }}>Join code</span>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13.5, fontWeight: 700, color: '#0F1E35', letterSpacing: 0.5 }}>{joinCode}</span>
          <span style={{ width: 1, height: 16, background: '#D3D1C7' }} />
          <button onClick={copyCode} title="Copy" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: copied ? '#4F9A2E' : '#5F5E5A' }}>
            {copied ? (
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 9 7 13 15 5"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.6"/><path d="M11 5 V3.5 a1.5 1.5 0 0 0 -1.5 -1.5 H4 a1.5 1.5 0 0 0 -1.5 1.5 V11 a1.5 1.5 0 0 0 1.5 1.5 H5.5"/></svg>
            )}
          </button>
        </div>
        <button onClick={onInviteClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#0F1E35' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5F5F3'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="8" y1="3.5" x2="8" y2="12.5"/><line x1="3.5" y1="8" x2="12.5" y2="8"/></svg>
          Invite
        </button>
        <button onClick={onNewClassClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C68A2F', border: 'none', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B27C29'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C68A2F'; }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="3.5" x2="8" y2="12.5"/><line x1="3.5" y1="8" x2="12.5" y2="8"/></svg>
          New class
        </button>
      </div>
    </header>
  );
}

function SummaryCards({ enrolled, crCount, crPct, weakStrand, avgScore }: {
  enrolled: number; crCount: number; crPct: number;
  weakStrand: { code: string; name: string; color: string; pct: number };
  avgScore: number;
}) {
  const card = { background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '18px 18px 16px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#8A8983' }}>Students enrolled</div>
        <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{enrolled}</div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>+2 enrolled this week</div>
      </div>
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#8A8983' }}>College ready</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{crCount}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#4F9A2E' }}>{crPct}%</span>
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>Scored ≥ 950 on TSIA2</div>
      </div>
      {/* Weakest strand - amber highlight */}
      <div style={{ background: '#FBF4E6', border: '1px solid rgba(198,138,47,0.35)', borderTop: '3px solid #C68A2F', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 2px rgba(198,138,47,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A6A1F' }}>Weakest strand</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, color: '#fff', background: '#C68A2F', padding: '2px 6px', borderRadius: 4 }}>FOCUS</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#0F1E35', lineHeight: 1.05 }}>{weakStrand.name}</span>
        </div>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#7A5B2A' }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: weakStrand.color, display: 'inline-block' }} />
          <span>{weakStrand.code} · {weakStrand.pct}% class accuracy</span>
        </div>
      </div>
      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#8A8983' }}>Average score</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{avgScore}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#8A8983' }}>/ 990</span>
        </div>
        <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>Passing 950 · scale 910–990</div>
      </div>
    </div>
  );
}

function StrandPanel({ strandPct, totalAttempts }: { strandPct: StrandAcc; totalAttempts: number }) {
  const bars = [
    { code: 'QR', label: 'Quantitative', color: '#B5D4F4', pct: strandPct.QR },
    { code: 'AR', label: 'Algebraic', color: '#9FE1CB', pct: strandPct.AR },
    { code: 'GR', label: 'Geometric & Spatial', color: '#FAC775', pct: strandPct.GR },
    { code: 'PR', label: 'Probabilistic', color: '#CECBF6', pct: strandPct.PR },
  ];
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '20px 22px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)', marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "'Kodchasan', sans-serif", fontWeight: 600, fontSize: 16, color: '#0F1E35' }}>Class strand mastery</h2>
          <div style={{ marginTop: 3, fontSize: 12, color: '#5F5E5A' }}>Average accuracy by TSIA2 reasoning strand</div>
        </div>
        <div style={{ fontSize: 11, color: '#8A8983', fontWeight: 600 }}>{totalAttempts} attempts this period</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, alignItems: 'end' }}>
        {bars.map(b => (
          <div key={b.code}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{ position: 'relative', width: 46, height: 118, background: '#F2F1EC', borderRadius: 7, overflow: 'hidden', flex: '0 0 46px' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: b.color, height: `${b.pct}%`, borderRadius: '7px 7px 0 0' }} />
              </div>
              <div style={{ paddingBottom: 4 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#0F1E35', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {b.pct}<span style={{ fontSize: 13, color: '#8A8983' }}>%</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#0F1E35' }}>{b.code}</div>
                <div style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.3 }}>{b.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RosterTable({ students, enrolled, sortBy, onSortChange, onViewStudent }: {
  students: Student[]; enrolled: number; sortBy: string;
  onSortChange: (s: string) => void; onViewStudent: (s: Student) => void;
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: "'Kodchasan', sans-serif", fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Class roster</h2>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8A8983', background: '#EDEBE4', padding: '2px 8px', borderRadius: 20 }}>{enrolled}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#8A8983' }}>Sort by</span>
          {['risk', 'score', 'name'].map(opt => (
            <button key={opt} onClick={() => onSortChange(opt)}
              style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid', borderColor: sortBy === opt ? '#C68A2F' : '#D3D1C7', background: sortBy === opt ? '#FBF4E6' : '#fff', color: sortBy === opt ? '#9A6A1F' : '#5F5E5A', textTransform: 'capitalize' }}>
              {opt === 'risk' ? 'Need help' : opt}
            </button>
          ))}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '7px 11px', width: 200, color: '#9A9990' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
            <span style={{ fontSize: 13 }}>Search students</span>
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, boxShadow: '0 1px 2px rgba(15,30,53,0.04)', overflow: 'hidden', marginBottom: 34 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FBFBF9', borderBottom: '1px solid #E7E5DD' }}>
              {['Student', 'Score', 'Placement', 'Strand profile', 'Tests', 'Last active', ''].map(h => (
                <th key={h} style={{ textAlign: h === 'Tests' ? 'center' : 'left', padding: h === '' || h === 'Student' ? '11px 20px' : '11px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#8A8983' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.email} style={{ borderBottom: i < students.length - 1 ? '1px solid #F0EEE7' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
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
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums' }}>{s.score}</span>
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bandBg, color: s.bandText, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.bandDot }} />{s.band}
                  </span>
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <div style={{ width: 150, height: 9, borderRadius: 20, overflow: 'hidden', display: 'flex', gap: 1.5, background: '#F0EEE7' }}>
                    <div style={{ width: `${s.wQR}%`, background: '#B5D4F4' }} />
                    <div style={{ width: `${s.wAR}%`, background: '#9FE1CB' }} />
                    <div style={{ width: `${s.wGR}%`, background: '#FAC775' }} />
                    <div style={{ width: `${s.wPR}%`, background: '#CECBF6' }} />
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8A8983' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: s.weakColor, display: 'inline-block' }} />
                    <span>Weakest · <span style={{ fontWeight: 600, color: '#5F5E5A' }}>{s.weakLabel}</span></span>
                  </div>
                </td>
                <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#5F5E5A', fontVariantNumeric: 'tabular-nums' }}>{s.tests}</span>
                </td>
                <td style={{ padding: '13px 14px' }}>
                  <span style={{ fontSize: 12.5, color: '#8A8983' }}>{s.active}</span>
                </td>
                <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                  <button onClick={() => onViewStudent(s)}
                    style={{ fontSize: 13, fontWeight: 700, color: '#C68A2F', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: 0, fontFamily: 'inherit' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9A6A1F'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C68A2F'; }}>
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MiscCard({ m }: { m: Misconception }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: 18, boxShadow: hovered ? '0 4px 16px rgba(15,30,53,0.07)' : '0 1px 2px rgba(15,30,53,0.04)', display: 'flex', flexDirection: 'column', minHeight: 182, transition: 'box-shadow 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0F1E35', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 28px' }}>{m.rank}</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0F1E35' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: m.color, display: 'inline-block' }} />
            {m.strand}
          </span>
        </div>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#5F5E5A', background: '#F4F3EE', padding: '3px 7px', borderRadius: 5 }}>{m.topic}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#26262A', flex: '1 1 auto', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.text}</p>
      <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid #F0EEE7', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: '#5F5E5A' }}>
          <span style={{ fontWeight: 700, color: '#1A1A1A' }}>Selected {m.freq}×</span>
          <span style={{ color: '#C9C7BE', margin: '0 6px' }}>·</span>
          <span>{m.students} students</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 26 }}>
            {m.bars.map((b, i) => (
              <div key={i} style={{ width: 5, borderRadius: '1.5px 1.5px 0 0', background: 'rgba(15,30,53,0.28)', height: `${b.h}%` }} />
            ))}
          </div>
          <span style={{ fontSize: 9.5, letterSpacing: 0.4, color: '#A8A69D', textTransform: 'uppercase' }}>Last 6 sessions</span>
        </div>
      </div>
    </div>
  );
}

// ─── Invite Modal ────────────────────────────────────────────────────────────

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,30,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(15,30,53,0.18)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "'Kodchasan', sans-serif", fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Invite by email</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8983', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="4" x2="14" y2="14"/><line x1="14" y1="4" x2="4" y2="14"/></svg>
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#356B1B', fontWeight: 600 }}>{message}</p>
            <button onClick={onClose} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#C68A2F', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#5F5E5A', lineHeight: 1.5 }}>
              Enter a student email. If they already have an account they'll be enrolled immediately. Otherwise they'll receive an invite link.
            </p>
            <input
              value={email}
              onChange={e => { setEmail(e.target.value); setStatus('idle'); setMessage(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="student@school.edu"
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
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const [sortBy, setSortBy] = useState('risk');
  const [showInvite, setShowInvite] = useState(false);

  const students = processStudents(RAW_STUDENTS, sortBy);
  const misc = processMisc();
  const { strandPct, avgScore, crCount, crPct, weakStrand, totalAttempts } = computeStats(RAW_STUDENTS);

  const [activeClass, setActiveClass] = useState<{ id: string; name: string; joinCode: string } | null>(null);

useEffect(() => {
  supabase
    .from('classes')
    .select('id, name, join_code')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
    .then(({ data }) => {
      if (data) setActiveClass({ id: data.id, name: data.name, joinCode: data.join_code });
    });
}, []);

const className = activeClass?.name ?? 'Loading...';
const joinCode = activeClass?.joinCode ?? '—';

  function handleViewStudent(s: Student) {
    // Navigate to student detail page
    window.location.href = `/teacher/student/${encodeURIComponent(s.email)}`;
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F5F5F3; -webkit-font-smoothing: antialiased; }
        @import url('https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', minWidth: 1280, fontFamily: 'Arial, Helvetica, sans-serif', color: '#1A1A1A' }}>
        <Sidebar
          activeNav="Dashboard"
          teacherName="Ms. Elena Rivera"
          teacherEmail="e.rivera@lincolnhs.edu"
        />

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F5F5F3' }}>
          <TopBar
            className={className}
            joinCode={joinCode}
            onInviteClick={() => setShowInvite(true)}
            onNewClassClick={() => {}}
          />

          <div style={{ padding: '26px 32px 52px 32px' }}>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <h1 style={{ margin: 0, fontFamily: "'Kodchasan', sans-serif", fontWeight: 600, fontSize: 27, letterSpacing: -0.4, color: '#0F1E35' }}>{className}</h1>
                <div style={{ marginTop: 6, fontSize: 13, color: '#5F5E5A' }}>{RAW_STUDENTS.length} students · Spring 2026 · Last synced today</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#0F1E35' }}>
                  Spring 2026
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#5F5E5A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6 L8 10 L12 6"/></svg>
                </button>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#0F1E35' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2 V10"/><path d="M5 7 L8 10 L11 7"/><path d="M3 12.5 H13"/></svg>
                  Export report
                </button>
              </div>
            </div>

            <SummaryCards enrolled={RAW_STUDENTS.length} crCount={crCount} crPct={crPct} weakStrand={weakStrand} avgScore={avgScore} />
            <StrandPanel strandPct={strandPct} totalAttempts={totalAttempts} />
            <RosterTable students={students} enrolled={RAW_STUDENTS.length} sortBy={sortBy} onSortChange={setSortBy} onViewStudent={handleViewStudent} />

            {/* Misconceptions */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
                <h2 style={{ margin: 0, fontFamily: "'Kodchasan', sans-serif", fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Top misconceptions</h2>
                <span style={{ fontSize: 13, color: '#5F5E5A' }}>Ranked by frequency across {totalAttempts} attempts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#8A8983' }}>
                {ORDER.map(k => (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: STR[k].color, display: 'inline-block' }} />{k}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {misc.map(m => <MiscCard key={m.rank} m={m} />)}
            </div>
          </div>
        </main>
      </div>

      {showInvite && activeClass && (
  <InviteModal classId={activeClass.id} onClose={() => setShowInvite(false)} />
)}
    </>
  );
}