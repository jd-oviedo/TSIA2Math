'use client';

import { useState, useEffect } from 'react';
import MathText from '../components/MathText';

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

// Sample roster — verbatim from the design handoff. Not real student data.
const RAW = [
  { name: 'Maria A.',   email: 'maria.a@demo.edu',   score: 962, band: 'College ready',      acc: { QR: 88, AR: 82, GR: 58, PR: 79 }, tests: 4, active: '1d ago' },
  { name: 'Jose R.',    email: 'jose.r@demo.edu',    score: 938, band: 'Approaching',         acc: { QR: 71, AR: 29, GR: 64, PR: 68 }, tests: 3, active: '2d ago' },
  { name: 'Tanya P.',   email: 'tanya.p@demo.edu',   score: 921, band: 'Below college ready', acc: { QR: 52, AR: 14, GR: 48, PR: 55 }, tests: 2, active: '5d ago' },
  { name: 'David L.',   email: 'david.l@demo.edu',   score: 955, band: 'College ready',      acc: { QR: 84, AR: 80, GR: 77, PR: 43 }, tests: 5, active: '1d ago' },
  { name: 'Sofia K.',   email: 'sofia.k@demo.edu',   score: 947, band: 'Approaching',         acc: { QR: 57, AR: 73, GR: 70, PR: 75 }, tests: 3, active: '3d ago' },
  { name: 'Marcus T.',  email: 'marcus.t@demo.edu',  score: 929, band: 'Below college ready', acc: { QR: 55, AR: 14, GR: 50, PR: 58 }, tests: 2, active: '6d ago' },
  { name: 'Priya N.',   email: 'priya.n@demo.edu',   score: 958, band: 'College ready',      acc: { QR: 86, AR: 82, GR: 43, PR: 80 }, tests: 4, active: '2d ago' },
  { name: 'Aaliyah W.', email: 'aaliyah.w@demo.edu', score: 933, band: 'Approaching',         acc: { QR: 68, AR: 70, GR: 66, PR: 29 }, tests: 3, active: '4d ago' },
] as const;

// Sample misconceptions — verbatim distractor texts from the item bank.
const MISC = [
  { rank: 1, strand: 'AR', topic: 'AR.2.3', freq: 18, students: 7, text: 'Student stops one step too early, treating an intermediate result as the final answer.', trend: [2,3,3,4,3,3] },
  { rank: 2, strand: 'AR', topic: 'AR.1.2', freq: 14, students: 6, text: 'Student confuses slope with y-intercept when reading a linear equation in slope-intercept form.', trend: [1,2,2,3,3,3] },
  { rank: 3, strand: 'QR', topic: 'QR.1.4', freq: 11, students: 5, text: 'Student adds when the inverse operation requires subtraction.', trend: [2,2,1,2,2,2] },
  { rank: 4, strand: 'GR', topic: 'GR.2.7', freq: 9,  students: 4, text: 'Student omits the 1/3 factor from the pyramid volume formula entirely.', trend: [1,1,2,2,1,2] },
  { rank: 5, strand: 'PR', topic: 'PR.1.5', freq: 7,  students: 4, text: 'Student reasons that there are only two possible outcomes and a finite count is involved, confusing a binary categorical variable with a discrete numerical variable.', trend: [1,1,1,2,1,1] },
  { rank: 6, strand: 'QR', topic: 'QR.2.4', freq: 6,  students: 3, text: 'Student applies another 20% increase instead of reversing the operation to find the original value.', trend: [1,0,1,1,2,1] },
];

function useViewport() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return { isMobile: w < 640, isCompact: w < 1024 };
}

const NAV = ['Dashboard', 'Misconceptions', 'Students', 'Take a practice test', 'Student view'];

function SidebarInner() {
  return (
    <>
      <div style={{ padding: '22px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/unpackmath-logo.png" alt="UnpackMath" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Kodchasan',sans-serif", fontWeight: 600, fontSize: 17, color: '#fff' }}>UnpackMath</span>
        </div>
        <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(198,138,47,0.45)', color: '#E7BE7B', fontSize: 9, fontWeight: 700, letterSpacing: 1.4, padding: '3px 8px', borderRadius: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C68A2F' }} />TEACHER · PRO
        </div>
      </div>
      <nav style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 8, fontSize: 13, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? '#E7BE7B' : 'rgba(255,255,255,0.64)', background: i === 0 ? 'rgba(198,138,47,0.14)' : 'transparent', boxShadow: i === 0 ? 'inset 3px 0 0 #C68A2F' : 'none' }}>
            {label}
          </div>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1C3052', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>JT</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Ms. J. Teacher</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>demo@unpackmath.com</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DemoPage() {
  const [sortBy, setSortBy] = useState('risk');
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile, isCompact } = useViewport();

  // Computed stats
  const avg = (k: 'QR'|'AR'|'GR'|'PR') => Math.round(RAW.reduce((a,r) => a + r.acc[k], 0) / RAW.length);
  const strandPct = { QR: avg('QR'), AR: avg('AR'), GR: avg('GR'), PR: avg('PR') };
  const avgScore = Math.round(RAW.reduce((a,r) => a + r.score, 0) / RAW.length);
  const crCount = RAW.filter(r => r.band === 'College ready').length;
  const crPct = Math.round(crCount / RAW.length * 100);
  const totalAttempts = RAW.reduce((a,r) => a + r.tests, 0);
  let ws: 'QR'|'AR'|'GR'|'PR' = ORDER[0];
  ORDER.forEach(k => { if (strandPct[k] < strandPct[ws]) ws = k; });
  const weakStrand = { code: ws, name: STR[ws].name, color: STR[ws].color, pct: strandPct[ws] };

  // Students
  const students = RAW.map(r => {
    const sum = ORDER.reduce((a,k) => a + r.acc[k], 0);
    const w: Record<string,number> = {};
    ORDER.forEach(k => { w[k] = Math.round(r.acc[k] / sum * 1000) / 10; });
    let wk = ORDER[0] as string;
    ORDER.forEach(k => { if (r.acc[k] < r.acc[wk as keyof typeof r.acc]) wk = k; });
    const bs = bandStyle(r.band);
    return { ...r, initials: r.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),
      bandBg: bs.bg, bandText: bs.text, bandDot: bs.dot,
      wQR: w.QR, wAR: w.AR, wGR: w.GR, wPR: w.PR,
      weakColor: STR[wk].color, weakPct: r.acc[wk as keyof typeof r.acc],
      weakLabel: `${wk} ${r.acc[wk as keyof typeof r.acc]}%` };
  }).sort((a,b) => sortBy === 'score' ? b.score - a.score : sortBy === 'name' ? a.name.localeCompare(b.name) : a.weakPct - b.weakPct);

  const misc = MISC.map(m => {
    const mx = Math.max(...m.trend, 1);
    return { ...m, color: STR[m.strand].color, bars: m.trend.map(v => ({ h: Math.max(14, Math.round(v/mx*100)) })) };
  });

  const summaryCols = isMobile ? 1 : isCompact ? 2 : 4;
  const strandCols = isMobile ? 2 : 4;
  const miscCols = isCompact ? 1 : 2;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F5F5F3; -webkit-font-smoothing: antialiased; }
        @import url('https://fonts.googleapis.com/css2?family=Kodchasan:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Persistent, non-dismissible demo banner */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0F1E35', color: '#fff', padding: isMobile ? '10px 16px' : '11px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, flexWrap: 'wrap' }}>
        <span style={{ lineHeight: 1.4 }}>This is a live demo with sample data. Sign in as a teacher to see your real class data.</span>
        <a href="/login?role=teacher" style={{ background: '#C68A2F', color: '#fff', padding: '7px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>Get started →</a>
      </div>

      {/* Mobile/tablet slide-over sidebar */}
      {isCompact && menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15,30,53,0.5)' }} />
          <aside style={{ position: 'relative', width: 240, maxWidth: '82vw', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
            <SidebarInner />
          </aside>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', color: '#1A1A1A' }}>

        {/* Desktop sidebar */}
        {!isCompact && (
          <aside style={{ width: 200, flex: '0 0 200px', background: '#0F1E35', color: '#fff', display: 'flex', flexDirection: 'column', position: 'sticky', top: 44, height: 'calc(100vh - 44px)' }}>
            <SidebarInner />
          </aside>
        )}

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F5F5F3' }}>

          {/* Top bar */}
          <header style={{ minHeight: 60, background: '#fff', borderBottom: '1px solid rgba(15,30,53,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: isMobile ? '10px 16px' : '0 28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              {isCompact && (
                <button onClick={() => setMenuOpen(true)} aria-label="Open menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 9, border: '1px solid #D3D1C7', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#0F1E35" strokeWidth="1.8" strokeLinecap="round"><line x1="2.5" y1="5" x2="15.5" y2="5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><line x1="2.5" y1="13" x2="15.5" y2="13" /></svg>
                </button>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 9, padding: '8px 12px' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>TSIA2 Prep — Period 2</span>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#5F5E5A" strokeWidth="1.6" strokeLinecap="round"><path d="M4 6 L8 10 L12 6"/></svg>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#F5F5F3', border: '1px solid #E2E0D8', borderRadius: 9, padding: '6px 12px' }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#8A8983' }}>Join code</span>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 13.5, fontWeight: 700, color: '#0F1E35' }}>MX7-42K</span>
              </div>
              <a href="/login?role=teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#C68A2F', border: 'none', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
                Get started →
              </a>
            </div>
          </header>

          <div style={{ padding: isMobile ? '18px 16px 48px' : '26px 32px 52px 32px' }}>

            {/* Page header */}
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ margin: 0, fontFamily: "'Kodchasan',sans-serif", fontWeight: 600, fontSize: isMobile ? 22 : 27, letterSpacing: -0.4, color: '#0F1E35' }}>TSIA2 Prep — Period 2</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: '#5F5E5A' }}>8 students · Spring 2026 · Sample data</div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${summaryCols},1fr)`, gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Students enrolled', value: RAW.length, sub: '+2 enrolled this week' },
                { label: 'College ready', value: `${crCount}`, pct: `${crPct}%`, sub: 'Scored ≥ 950 on TSIA2' },
                null,
                { label: 'Average score', value: avgScore, sub2: '/ 990', sub: 'Passing 950 · scale 910–990' },
              ].map((c, i) => {
                if (i === 2) return (
                  <div key="weak" style={{ background: '#FBF4E6', border: '1px solid rgba(198,138,47,0.35)', borderTop: '3px solid #C68A2F', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 2px rgba(198,138,47,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#9A6A1F' }}>Weakest strand</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#C68A2F', padding: '2px 6px', borderRadius: 4 }}>FOCUS</span>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 24, fontWeight: 700, color: '#0F1E35', lineHeight: 1.05 }}>{weakStrand.name}</div>
                    <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#7A5B2A' }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: weakStrand.color, display: 'inline-block' }} />
                      {weakStrand.code} · {weakStrand.pct}% class accuracy
                    </div>
                  </div>
                );
                if (!c) return null;
                return (
                  <div key={i} style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '18px 18px 16px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: '#8A8983' }}>{c.label}</div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 32, fontWeight: 700, color: '#0F1E35', lineHeight: 1 }}>{c.value}</span>
                      {c.pct && <span style={{ fontSize: 15, fontWeight: 600, color: '#4F9A2E' }}>{c.pct}</span>}
                      {c.sub2 && <span style={{ fontSize: 14, fontWeight: 600, color: '#8A8983' }}>{c.sub2}</span>}
                    </div>
                    <div style={{ marginTop: 9, fontSize: 12, color: '#5F5E5A' }}>{c.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Strand bars */}
            <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '20px 22px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)', marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "'Kodchasan',sans-serif", fontWeight: 600, fontSize: 16, color: '#0F1E35' }}>Class strand mastery</h2>
                  <div style={{ marginTop: 3, fontSize: 12, color: '#5F5E5A' }}>Average accuracy by TSIA2 reasoning strand</div>
                </div>
                <div style={{ fontSize: 11, color: '#8A8983', fontWeight: 600 }}>{totalAttempts} attempts this period</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${strandCols},1fr)`, gap: 18, alignItems: 'end' }}>
                {([['QR','Quantitative','#B5D4F4'], ['AR','Algebraic','#9FE1CB'], ['GR','Geometric & Spatial','#FAC775'], ['PR','Probabilistic','#CECBF6']] as const).map(([code, label, color]) => (
                  <div key={code} style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ position: 'relative', width: 46, height: 118, background: '#F2F1EC', borderRadius: 7, overflow: 'hidden', flex: '0 0 46px' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: color, height: `${strandPct[code]}%`, borderRadius: '7px 7px 0 0' }} />
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#0F1E35', lineHeight: 1 }}>{strandPct[code]}<span style={{ fontSize: 13, color: '#8A8983' }}>%</span></div>
                      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#0F1E35' }}>{code}</div>
                      <div style={{ fontSize: 11, color: '#5F5E5A', lineHeight: 1.3 }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roster */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <h2 style={{ margin: 0, fontFamily: "'Kodchasan',sans-serif", fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Class roster</h2>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#8A8983', background: '#EDEBE4', padding: '2px 8px', borderRadius: 20 }}>8</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#8A8983' }}>Sort by</span>
                {(['risk','score','name'] as const).map(opt => (
                  <button key={opt} onClick={() => setSortBy(opt)} style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid', borderColor: sortBy === opt ? '#C68A2F' : '#D3D1C7', background: sortBy === opt ? '#FBF4E6' : '#fff', color: sortBy === opt ? '#9A6A1F' : '#5F5E5A', textTransform: 'capitalize' }}>
                    {opt === 'risk' ? 'Need help' : opt}
                  </button>
                ))}
              </div>
            </div>

            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 34 }}>
                {students.map((s) => (
                  <div key={s.email} style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(15,30,53,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0F1E35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A' }}>{s.name}</div>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#0F1E35' }}>{s.score}</span>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bandBg, color: s.bandText, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.bandDot }} />{s.band}
                      </span>
                      <span style={{ fontSize: 12, color: '#8A8983' }}>{s.tests} tests · {s.active}</span>
                    </div>
                    <div style={{ marginTop: 12, width: '100%', height: 9, borderRadius: 20, overflow: 'hidden', display: 'flex', gap: 1.5, background: '#F0EEE7' }}>
                      <div style={{ width: `${s.wQR}%`, background: '#B5D4F4' }} />
                      <div style={{ width: `${s.wAR}%`, background: '#9FE1CB' }} />
                      <div style={{ width: `${s.wGR}%`, background: '#FAC775' }} />
                      <div style={{ width: `${s.wPR}%`, background: '#CECBF6' }} />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: '#8A8983' }}>
                      Weakest · <span style={{ fontWeight: 600, color: '#5F5E5A' }}>{s.weakLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, overflowX: 'auto', marginBottom: 34 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                  <thead>
                    <tr style={{ background: '#FBFBF9', borderBottom: '1px solid #E7E5DD' }}>
                      {['Student','Score','Placement','Strand profile','Tests','Last active'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: h === 'Student' ? '11px 20px' : '11px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#8A8983', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.email} style={{ borderBottom: i < students.length - 1 ? '1px solid #F0EEE7' : 'none' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF7'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0F1E35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: '0 0 34px' }}>{s.initials}</div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A' }}>{s.name}</div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 14px', fontSize: 16, fontWeight: 700, color: '#0F1E35' }}>{s.score}</td>
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
                          <div style={{ marginTop: 6, fontSize: 11, color: '#8A8983' }}>
                            Weakest · <span style={{ fontWeight: 600, color: '#5F5E5A' }}>{s.weakLabel}</span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 14px', fontSize: 13.5, fontWeight: 600, color: '#5F5E5A' }}>{s.tests}</td>
                        <td style={{ padding: '13px 14px', fontSize: 12.5, color: '#8A8983' }}>{s.active}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Misconceptions */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
                <h2 style={{ margin: 0, fontFamily: "'Kodchasan',sans-serif", fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Top misconceptions</h2>
                <span style={{ fontSize: 13, color: '#5F5E5A' }}>Ranked by frequency across {totalAttempts} attempts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#8A8983' }}>
                {ORDER.map(k => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: STR[k].color, display: 'inline-block' }} />{k}</span>)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${miscCols},1fr)`, gap: 16 }}>
              {misc.map(m => (
                <div key={m.rank} style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: 18, boxShadow: '0 1px 2px rgba(15,30,53,0.04)', display: 'flex', flexDirection: 'column', minHeight: 182 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0F1E35', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{m.rank}</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0F1E35' }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: m.color, display: 'inline-block' }} />{m.strand}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: '#5F5E5A', background: '#F4F3EE', padding: '3px 7px', borderRadius: 5, whiteSpace: 'nowrap' }}>{m.topic}</span>
                  </div>
                  <div style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#26262A', flex: '1 1 auto' }}><MathText text={m.text} /></div>
                  <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid #F0EEE7', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 12, color: '#5F5E5A' }}>
                      <span style={{ fontWeight: 700, color: '#1A1A1A' }}>Selected {m.freq}×</span>
                      <span style={{ color: '#C9C7BE', margin: '0 6px' }}>·</span>
                      {m.students} students
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 26 }}>
                        {m.bars.map((b, i) => <div key={i} style={{ width: 5, borderRadius: '1.5px 1.5px 0 0', background: 'rgba(15,30,53,0.28)', height: `${b.h}%` }} />)}
                      </div>
                      <span style={{ fontSize: 9.5, letterSpacing: 0.4, color: '#A8A69D', textTransform: 'uppercase' }}>Last 6 sessions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div style={{ marginTop: 48, background: '#0F1E35', borderRadius: 16, padding: isMobile ? '28px 24px' : '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: "'Kodchasan',sans-serif", fontWeight: 600, fontSize: 22, color: '#fff', marginBottom: 8 }}>Ready to see your real class data?</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', maxWidth: 480 }}>Get full access to the Misconception Dashboard for your students. Founding teacher rate — $10/month, locked in for life.</div>
              </div>
              <a href="/login?role=teacher" style={{ background: '#C68A2F', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Get started →</a>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
