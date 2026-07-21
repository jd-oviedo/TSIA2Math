'use client';

import { useState, useEffect } from 'react';
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from '../../components/fonts';

export default function InactiveTeacher() {
  const [w, setW] = useState(1280);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const isNarrow = w < 860;

  return (
    <>
      <style>{`* { box-sizing: border-box; } body { margin: 0; background: #0F1E35; } ${FONT_BASE_CSS}`}</style>
      <div style={{ minHeight: '100vh', background: '#0F1E35', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isNarrow ? '32px 20px' : '40px 24px', fontFamily: FONT_BODY }}>
        <div style={{ maxWidth: 900, width: '100%', display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap: isNarrow ? 36 : 60, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(198,138,47,0.45)', color: '#E7BE7B', fontSize: 9, fontWeight: 700, letterSpacing: 1.4, padding: '3px 8px', borderRadius: 5, marginBottom: 24 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C68A2F' }} />
              TEACHER · PRO
            </div>
            <h1 style={{ margin: '0 0 16px', fontFamily: FONT_HEADING, fontWeight: 600, fontSize: isNarrow ? 30 : 36, letterSpacing: -0.5, color: '#fff', lineHeight: 1.1 }}>
              You're almost in.
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              The Misconception Dashboard gives you a live view of where your class is breaking down — by strand, by topic, and by student. You're one step away from access.
            </p>
            <ul style={{ margin: '0 0 32px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'See the most common misconceptions in your class',
                'Identify which students are stuck on the same concept',
                'Get small-group-ready next steps and follow-up prompts',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#C68A2F', marginTop: 2, flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="https://unpackmath.com/pricing" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#C68A2F', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, padding: '13px 24px', borderRadius: 10 }}>
                Reserve your founding spot →
              </a>
              <a href="/demo" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 600, fontSize: 14, padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
                Preview the dashboard first
              </a>
              <a href="/dashboard" style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                Go to student dashboard instead
              </a>
            </div>
          </div>

          {/* Right — mockup */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ height: 8, width: 90, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                <div style={{ height: 8, width: 60, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#BA7517', background: '#FAEEDA', border: '1px solid #FAC775', padding: '3px 10px', borderRadius: 999 }}>Coming soon</span>
            </div>
            <div style={{ padding: '16px 18px' }}>
              {/* Strand pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[['QR','#E6F1FB','#185FA5','#B5D4F4'],['AR','#E1F5EE','#0F6E56','#9FE1CB'],['GR','#FAEEDA','#854F0B','#FAC775'],['PR','#EEEDFE','#534AB7','#CECBF6']].map(([code,bg,text,border]) => (
                  <span key={code} style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 999, background: bg, color: text, border: `1px solid ${border}` }}>{code}</span>
                ))}
              </div>
              {/* Misconception cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { rank: 1, strand: 'AR', topic: 'AR.2.3', color: '#9FE1CB', textColor: '#0F6E56', bg: '#E1F5EE', border: '#9FE1CB', bars: [40,60,70,85,75,100], count: '18 selections' },
                  { rank: 2, strand: 'QR', topic: 'QR.1.4', color: '#B5D4F4', textColor: '#185FA5', bg: '#E6F1FB', border: '#B5D4F4', bars: [50,50,30,60,55,50], count: '11 selections' },
                ].map(m => (
                  <div key={m.rank} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: '#0F1E35', border: '1px solid rgba(198,138,47,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#E7BE7B' }}>{m.rank}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999, background: m.bg, color: m.textColor, border: `1px solid ${m.border}` }}>{m.strand}</span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>{m.topic}</span>
                    </div>
                    <div style={{ height: 7, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: 5 }} />
                    <div style={{ height: 7, width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 5 }} />
                    <div style={{ height: 7, width: '60%', background: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
                    <div style={{ marginTop: 10, display: 'flex', gap: 3, alignItems: 'flex-end', height: 22 }}>
                      {m.bars.map((h, i) => (
                        <div key={i} style={{ width: 5, background: m.color, borderRadius: '2px 2px 0 0', height: `${h}%`, opacity: 0.7 }} />
                      ))}
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4, alignSelf: 'flex-end' }}>{m.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Strand bar */}
              <div style={{ marginTop: 14, display: 'flex', gap: 4 }}>
                {[['#B5D4F4','30%'],['#9FE1CB','25%'],['#FAC775','26%'],['#CECBF6','19%']].map(([color, width]) => (
                  <div key={color} style={{ height: 8, borderRadius: 999, background: color, width, opacity: 0.7 }} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}