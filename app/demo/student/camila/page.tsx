'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MathText from '../../../components/MathText';
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from '../../../components/fonts';

// Hardcoded demo profile for Camila A. Mirrors /teacher/student/[id] but with
// sample data only — the same student and the same GR misconception shown on the
// parent digest at /reporte, stated in teacher-facing language.

type Strand = 'QR' | 'AR' | 'GR' | 'PR';

const STR: Record<Strand, { color: string; name: string }> = {
  QR: { color: '#B5D4F4', name: 'Quantitative Reasoning' },
  AR: { color: '#9FE1CB', name: 'Algebraic Reasoning' },
  GR: { color: '#FAC775', name: 'Geometric & Spatial' },
  PR: { color: '#CECBF6', name: 'Probabilistic & Statistical' },
};
const ORDER: Strand[] = ['QR', 'AR', 'GR', 'PR'];

const STUDENT = {
  name: 'Camila A.',
  initials: 'CA',
  email: 'camila.a@demo.edu',
  className: 'TSIA2 Prep — Period 2',
  enrolled: 'Jan 21, 2026',
  via: 'join code',
  score: 962,
  band: { label: 'College ready', bg: '#EAF3DE', text: '#356B1B', dot: '#4F9A2E' },
  tests: 4,
  active: '1d ago',
  weakest: { code: 'GR' as Strand, pct: 58 },
};

const SESSIONS: { date: string; score: number; acc: Record<Strand, number> }[] = [
  { date: 'May 14, 2026', score: 962, acc: { QR: 88, AR: 82, GR: 58, PR: 79 } },
  { date: 'Apr 28, 2026', score: 955, acc: { QR: 84, AR: 79, GR: 55, PR: 76 } },
  { date: 'Apr 9, 2026',  score: 944, acc: { QR: 80, AR: 74, GR: 52, PR: 71 } },
  { date: 'Mar 24, 2026', score: 936, acc: { QR: 76, AR: 70, GR: 49, PR: 68 } },
];

// Rank 1 is the misconception the parent digest reports to Camila's family.
// topic_id GR.4.2 = "Using Transformations to Investigate Congruence and
// Similarity" — the topic the dilation/translation items live under in data/items/GR.
const MISCONCEPTIONS = [
  { rank: 1, strand: 'GR', topic: 'GR.4.2', freq: 6, text: 'Student confuses a dilation (size change) with a translation (position change) when a figure is transformed.' },
  { rank: 2, strand: 'GR', topic: 'GR.2.7', freq: 4, text: 'Student omits the 1/3 factor from the pyramid volume formula entirely.' },
  { rank: 3, strand: 'PR', topic: 'PR.1.5', freq: 3, text: 'Student reasons that there are only two possible outcomes and a finite count is involved, confusing a binary categorical variable with a discrete numerical variable.' },
  { rank: 4, strand: 'AR', topic: 'AR.2.3', freq: 2, text: 'Student stops one step too early, treating an intermediate result as the final answer.' },
];

function bandFor(score: number) {
  if (score >= 950) return { label: 'College ready', bg: '#EAF3DE', text: '#356B1B', dot: '#4F9A2E' };
  if (score >= 935) return { label: 'Approaching', bg: '#FAEEDA', text: '#8A5712', dot: '#C68A2F' };
  return { label: 'Below college ready', bg: '#FCEBEB', text: '#9A2A2A', dot: '#C2402F' };
}

function useViewport() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return { isMobile: w < 640 };
}

function StrandProfile({ acc }: { acc: Record<Strand, number> }) {
  const sum = ORDER.reduce((a, k) => a + acc[k], 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ width: 150, maxWidth: '50vw', height: 9, borderRadius: 20, overflow: 'hidden', display: 'flex', gap: 1.5, background: '#F0EEE7' }}>
        {ORDER.map((k) => (
          <div key={k} style={{ width: `${sum > 0 ? (acc[k] / sum) * 100 : 25}%`, background: STR[k].color }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, fontSize: 10.5, color: '#8A8983' }}>
        {ORDER.map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: STR[k].color }} />{acc[k]}%
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DemoStudentProfilePage() {
  const { isMobile } = useViewport();

  const stats = [
    { label: 'Total attempts', value: STUDENT.tests, sub: `${STUDENT.tests} tests taken` },
    { label: 'Latest score', value: STUDENT.score, sub: STUDENT.band.label, tone: 'good' as const },
    { label: 'Weakest strand', value: STUDENT.weakest.code, sub: `${STUDENT.weakest.pct}% accuracy`, tone: 'warn' as const },
    { label: 'Last active', value: STUDENT.active, sub: 'most recent attempt' },
  ];

  const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)' };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F5F5F3; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
      `}</style>

      {/* Persistent, non-dismissible demo banner — same as /demo */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0F1E35', color: '#fff', padding: isMobile ? '10px 16px' : '11px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, flexWrap: 'wrap' }}>
        <span style={{ lineHeight: 1.4 }}>This is a live demo with sample data. Sign in as a teacher to see your real class data.</span>
        <a href="/login?role=teacher" style={{ background: '#C68A2F', color: '#fff', padding: '7px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>Get started →</a>
      </div>

      <div style={{ minHeight: '100vh', background: '#F5F5F3', fontFamily: FONT_BODY, color: '#1A1A1A' }}>

        {/* Navy header strip with breadcrumb back to the demo dashboard */}
        <header style={{ background: '#0F1E35', color: '#fff', padding: isMobile ? '12px 16px' : '14px 28px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3 L5 8 L10 13" /></svg>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? 160 : 320 }}>{STUDENT.className}</span>
            </Link>
            <img
              src="/unpackmath-wordmark.png"
              alt="UnpackMath"
              width={2000}
              height={485}
              style={{ width: 96, height: 'auto', display: 'block', flexShrink: 0 }}
            />
          </div>
        </header>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '20px 16px 48px' : '28px 28px 56px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Profile header */}
          <div style={{ background: '#fff', border: '1px solid rgba(15,30,53,0.07)', borderRadius: 16, padding: isMobile ? '20px' : '24px 26px', boxShadow: '0 1px 2px rgba(15,30,53,0.04)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0F1E35', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flex: '0 0 64px' }}>
              {STUDENT.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: isMobile ? 22 : 26, letterSpacing: -0.4, color: '#0F1E35' }}>{STUDENT.name}</h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: STUDENT.band.bg, color: STUDENT.band.text, fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: STUDENT.band.dot }} />{STUDENT.band.label}
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#5F5E5A' }}>{STUDENT.email}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12, color: '#8A8983' }}>
                <span>Class · <span style={{ color: '#5F5E5A', fontWeight: 600 }}>{STUDENT.className}</span></span>
                <span>Enrolled · <span style={{ color: '#5F5E5A', fontWeight: 600 }}>{STUDENT.enrolled}</span></span>
                <span>Via · <span style={{ color: '#5F5E5A', fontWeight: 600 }}>{STUDENT.via}</span></span>
              </div>
            </div>
            <div style={{ textAlign: isMobile ? 'left' : 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: '#0F1E35', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{STUDENT.score}</div>
              <div style={{ fontSize: 11, color: '#8A8983', marginTop: 4 }}>latest / 990</div>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
            {stats.map((c) => (
              <div key={c.label} style={c.tone === 'warn'
                ? { background: '#FBF4E6', border: '1px solid rgba(198,138,47,0.35)', borderRadius: 12, padding: '14px 16px' }
                : cardStyle}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.7, textTransform: 'uppercase', color: c.tone === 'warn' ? '#9A6A1F' : '#8A8983' }}>{c.label}</div>
                <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: c.tone === 'good' ? '#356B1B' : '#0F1E35', lineHeight: 1.1 }}>{c.value}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: c.tone === 'warn' ? '#7A5B2A' : '#5F5E5A' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Test history */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 13, gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Test history</h2>
              <span style={{ fontSize: 12, color: '#8A8983' }}>All attempts, most recent first</span>
            </div>

            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {SESSIONS.map((sess, i) => {
                  const b = bandFor(sess.score);
                  return (
                    <div key={sess.date} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#0F1E35', fontVariantNumeric: 'tabular-nums' }}>{sess.score}</div>
                          <div style={{ fontSize: 12, color: '#8A8983', marginTop: 2 }}>{sess.date} · #{SESSIONS.length - i}</div>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: b.bg, color: b.text, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.dot }} />{b.label}
                        </span>
                      </div>
                      <div style={{ marginTop: 12 }}><StrandProfile acc={sess.acc} /></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FBFBF9', borderBottom: '1px solid #E7E5DD' }}>
                      {['Date', 'Score', 'Placement', 'Strand performance (QR / AR / GR / PR)', 'Attempt'].map((h, i) => (
                        <th key={h} style={{ textAlign: i === 4 ? 'center' : 'left', padding: '11px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#8A8983', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SESSIONS.map((sess, i) => {
                      const b = bandFor(sess.score);
                      return (
                        <tr key={sess.date} style={{ borderBottom: i < SESSIONS.length - 1 ? '1px solid #F0EEE7' : 'none' }}>
                          <td style={{ padding: '12px 16px', color: '#5F5E5A', whiteSpace: 'nowrap', fontSize: 13 }}>{sess.date}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 15, color: '#0F1E35', fontVariantNumeric: 'tabular-nums' }}>{sess.score}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: b.bg, color: b.text, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.dot }} />{b.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}><StrandProfile acc={sess.acc} /></td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12.5, color: '#8A8983' }}>#{SESSIONS.length - i}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Misconceptions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 13, gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>Misconceptions</h2>
              <span style={{ fontSize: 12, color: '#8A8983' }}>Across all attempts</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
              {MISCONCEPTIONS.map((mc) => {
                const color = STR[mc.strand as Strand]?.color ?? '#D3D1C7';
                return (
                  <div key={mc.rank} style={{ ...cardStyle, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 8, background: '#0F1E35', color: '#E7BE7B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{mc.rank}</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0F1E35' }}>
                          <span style={{ width: 9, height: 9, borderRadius: 2, background: color }} />{mc.strand}
                        </span>
                      </div>
                      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#5F5E5A', background: '#F4F3EE', padding: '3px 7px', borderRadius: 5 }}>{mc.topic}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: '#26262A' }}>
                      <MathText text={mc.text} />
                    </div>
                    <div style={{ fontSize: 12, color: '#5F5E5A', paddingTop: 10, borderTop: '1px solid #F0EEE7' }}>
                      Selected <strong style={{ color: '#1A1A1A' }}>{mc.freq}</strong> {mc.freq === 1 ? 'time' : 'times'} across all attempts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
