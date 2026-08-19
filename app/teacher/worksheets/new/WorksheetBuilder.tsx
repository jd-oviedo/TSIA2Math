'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DASH, cardStyle } from '@/app/components/dashboard-theme';
import type { PickerTopic } from '@/app/lib/worksheet-source';

const LEVELS = ['Basic', 'Proficient', 'Advanced'] as const;
type Level = (typeof LEVELS)[number];

const UNIT_NAMES: Record<number, string> = {
  0: 'Unit 0 · Foundations',
  1: 'Unit 1 · Quantitative Reasoning',
  2: 'Unit 2 · Algebraic Foundations',
  3: 'Unit 3 · Geometry & Measurement',
  4: 'Unit 4 · Functions & Modelling',
  5: 'Unit 5 · Probability & Statistics',
};

// The builder.
//
// Every number shown here is real. The count badge is the topic's gradeable item
// count, computed by format on the server; the running total is the sum of what
// the selected topics can actually deliver. Nothing is padded to look deeper
// than it is, because the moment a badge overstates a pool the teacher finds out
// by printing a short worksheet.
export default function WorksheetBuilder({ topics }: { topics: PickerTopic[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(15);
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byUnit = useMemo(() => {
    // Already sorted by (unit_number, sequence_in_unit) on the server -- schema
    // fact 2. Grouping preserves that order; it does not re-sort.
    const map = new Map<number, PickerTopic[]>();
    for (const t of topics) {
      const list = map.get(t.unit_number) ?? [];
      list.push(t);
      map.set(t.unit_number, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [topics]);

  const filtering = levels.size > 0;

  // What the current selection can actually deliver.
  //
  // SCHEMA FACT 3 made visible. `levelled` counts only items carrying a
  // difficulty band, and every mini_quiz item has level = null across all 97
  // topics -- so with a filter on, the pool is the 10 practice items, not the
  // 14 gradeable ones. Showing `available` while filtering would promise
  // questions the draw cannot produce.
  const pool = useMemo(() => {
    let total = 0;
    for (const t of topics) {
      if (!selected.has(t.topic_id)) continue;
      total += filtering ? t.levelled : includeQuiz ? t.available : t.levelled;
    }
    return total;
  }, [topics, selected, filtering, includeQuiz]);

  const capped = Math.min(count, pool);
  const short = selected.size > 0 && pool < count;

  // Rough, and labelled as rough. There is no per-item timing anywhere in the
  // schema; estimated_time_minutes is per TOPIC and covers the whole lesson, so
  // deriving a worksheet estimate from it would be wrong by a wide margin. A
  // flat 90 seconds a question is honest about being a rule of thumb.
  const minutes = Math.max(1, Math.round((capped * 1.5) / 5) * 5);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleLevel(l: Level) {
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(l)) next.delete(l);
      else next.add(l);
      return next;
    });
  }

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/worksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Practice worksheet',
          topics: [...selected],
          count,
          levels: [...levels],
          include_quiz: includeQuiz,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
      };
      if (!res.ok || !body.id) {
        setError(body.error ?? 'Could not build that worksheet.');
        return;
      }
      router.push(`/teacher/worksheets/${body.id}`);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ background: DASH.pageBg, minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/teacher/worksheets" style={{ fontSize: 13, color: DASH.muted, textDecoration: 'none' }}>
          ← Worksheets
        </Link>
        <h1 style={{ fontSize: 27, fontWeight: 700, color: DASH.heading, margin: '8px 0 22px', letterSpacing: '-0.01em' }}>
          New worksheet
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>
          {/* ── topic tree ── */}
          <div style={{ ...cardStyle(DASH), padding: '18px 20px' }}>
            <h2 style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: DASH.dim, margin: '0 0 14px' }}>
              Topics
            </h2>
            {byUnit.map(([unit, list]) => (
              <section key={unit} style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: DASH.heading, margin: '0 0 8px' }}>
                  {UNIT_NAMES[unit] ?? `Unit ${unit}`}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {list.map((t) => {
                    const on = selected.has(t.topic_id);
                    const shown = filtering ? t.levelled : t.available;
                    return (
                      <label
                        key={t.topic_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '6px 8px',
                          borderRadius: 7,
                          background: on ? '#EEF3FA' : 'transparent',
                          cursor: shown > 0 ? 'pointer' : 'not-allowed',
                          opacity: shown > 0 ? 1 : 0.45,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={shown === 0}
                          onChange={() => toggle(t.topic_id)}
                          style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: 12, color: DASH.dim, minWidth: 62, fontVariantNumeric: 'tabular-nums' }}>
                          {t.topic_id}
                        </span>
                        <span style={{ flex: 1, fontSize: 13.5, color: DASH.ink, minWidth: 0 }}>
                          {t.topic_name}
                        </span>
                        <span style={chip(t.related_strand)}>{t.related_strand}</span>
                        {t.templated && (
                          <span
                            title="This topic generates fresh numbers each time"
                            style={{ ...chip('QR'), background: '#E4EFE8', color: '#2C6248' }}
                          >
                            deep
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: shown === 0 ? '#A8321E' : DASH.muted,
                            fontVariantNumeric: 'tabular-nums',
                            minWidth: 18,
                            textAlign: 'right',
                          }}
                        >
                          {shown}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* ── controls ── */}
          <div style={{ ...cardStyle(DASH), padding: '18px 20px', position: 'sticky', top: 20 }}>
            <label style={labelStyle}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Practice worksheet"
              maxLength={120}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: 16 }}>Questions</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: 16 }}>Difficulty</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLevel(l)}
                  style={{
                    ...pillStyle,
                    background: levels.has(l) ? DASH.heading : '#FFF',
                    color: levels.has(l) ? '#FFF' : DASH.ink,
                    borderColor: levels.has(l) ? DASH.heading : DASH.line,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Schema fact 3, said out loud at the moment it starts to matter. */}
            {filtering && (
              <p style={{ fontSize: 11.5, color: '#8A6A16', margin: '9px 0 0', lineHeight: 1.45 }}>
                Mini-quiz questions are not tagged with a difficulty, so they are
                left out while a filter is on. That is why the counts drop.
              </p>
            )}

            {!filtering && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13, color: DASH.ink }}>
                <input
                  type="checkbox"
                  checked={includeQuiz}
                  onChange={(e) => setIncludeQuiz(e.target.checked)}
                  style={{ margin: 0 }}
                />
                Include mini-quiz questions
              </label>
            )}

            <div style={{ borderTop: `1px solid ${DASH.hairline}`, margin: '18px 0 14px' }} />

            <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Row label="Topics" value={String(selected.size)} />
              <Row label="Available" value={String(pool)} />
              <Row label="On the sheet" value={String(capped)} strong />
              <Row label="Approx. time" value={`~${minutes} min`} />
            </dl>

            {short && (
              <p style={{ fontSize: 11.5, color: '#8A6A16', margin: '10px 0 0', lineHeight: 1.45 }}>
                Only {pool} question{pool === 1 ? '' : 's'} available. Add a topic
                or lower the count — questions are never repeated.
              </p>
            )}

            {error && (
              <p style={{ fontSize: 12.5, color: '#A8321E', margin: '10px 0 0' }} role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={create}
              disabled={busy || selected.size === 0 || pool === 0}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '11px 16px',
                borderRadius: 9,
                border: 'none',
                background: selected.size === 0 || pool === 0 ? DASH.line : DASH.heading,
                color: selected.size === 0 || pool === 0 ? DASH.dim : '#FFF',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: busy || selected.size === 0 || pool === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Building…' : 'Build worksheet'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <dt style={{ fontSize: 12.5, color: DASH.muted }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontSize: strong ? 17 : 13.5,
          fontWeight: strong ? 700 : 600,
          color: DASH.heading,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </dd>
    </div>
  );
}

const STRAND_COLOR: Record<string, string> = {
  QR: '#E8EEF7',
  AR: '#F3EAF6',
  GR: '#E8F1EC',
  PR: '#FAEFE3',
};

function chip(strand: string): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.05em',
    padding: '2px 6px',
    borderRadius: 4,
    background: STRAND_COLOR[strand] ?? '#EFEFEC',
    color: '#4A4A46',
  };
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: DASH.dim,
  fontWeight: 700,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  borderRadius: 8,
  border: `1px solid ${DASH.line}`,
  fontSize: 14,
  fontFamily: 'inherit',
  color: DASH.ink,
  background: '#FFF',
  boxSizing: 'border-box',
};

const pillStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  padding: '6px 11px',
  borderRadius: 7,
  border: `1px solid ${DASH.line}`,
  fontFamily: 'inherit',
  cursor: 'pointer',
};
