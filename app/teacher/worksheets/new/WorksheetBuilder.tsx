'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  WS,
  WS_CHROME_CSS,
  microLabel,
  panelStyle,
  ctaStyle,
  strandChip,
} from '../worksheet-theme';
import type { PickerTopic } from '../../../lib/worksheet-source';
import { QuotaMeter, QuotaCapNotice } from '../QuotaNotice';

const LEVELS = ['Basic', 'Proficient', 'Advanced'] as const;
type Level = (typeof LEVELS)[number];

// The app's unit map, not the design import's. The board names Unit 3
// "Geometric and Spatial Reasoning", Unit 4 "Probabilistic and Statistical
// Reasoning" and Unit 5 "Test Strategy"; none of those is this course. The
// Curriculum Unit Map is the authority for unit metadata.
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
//
// RESTYLED 2026-08-25, LOGIC UNTOUCHED. The panes swap sides to match the board
// (selection rail left, topic browser right) and every control is redrawn in the
// cream language, but not one line of the selection, pool, quota or create
// behaviour changed. What the board asks for and this does NOT build:
//
//   * PER-TOPIC QUESTION STEPPERS. The board gives every selected topic its own
//     +/- count. The API takes ONE global `count` and worksheet-select.ts
//     distributes it across the chosen topics. Honouring the board would mean a
//     new request shape, a new draw and a new stored options blob, so the global
//     count input stays and the steppers are not drawn.
//   * DRAG TO REORDER. Nothing stores or reads a topic order.
//   * VERSION B, FREE RESPONSE FORMAT. Neither exists.
//   * SEARCH, STRAND FILTERS, UNIT ACCORDIONS, EXPAND ALL, SHOW LOCKED. Each
//     would be a new control rather than a restyled one.
//
// DIFFICULTY STAYS MULTI-SELECT AND MUST LOOK IT. The board draws a segmented
// Basic / Mixed / Advanced, which is a single-select shape over a value that
// does not exist. Levels here are three independent toggles against the real
// schema bands, so they are drawn as three independent toggles with a check
// marker each. A segmented look over multi-select behaviour would teach the
// wrong model on first contact.
export default function WorksheetBuilder({
  topics,
  quotaUsed,
  quotaCap,
}: {
  topics: PickerTopic[];
  /** Worksheets created this month, or null when the plan is not metered. */
  quotaUsed: number | null;
  /** The plan's monthly cap, or null when unlimited. */
  quotaCap: number | null;
}) {
  const router = useRouter();
  // Seeded from the server and moved only by what the server sends back. The
  // create response carries the count it just enforced, so the number here
  // cannot drift from the counter by re-deriving itself.
  const [used, setUsed] = useState(quotaUsed);
  const metered = used !== null && quotaCap !== null;
  const atCap = metered && used >= quotaCap;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(15);
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which units are EXPANDED. Empty on every load, so the picker opens as a
  // list of six unit headings rather than 97 cards, and the teacher opens the
  // one they came for.
  //
  // EXPANDED rather than collapsed, deliberately: the default is then the empty
  // set, which needs no knowledge of what units exist. A collapsed-set default
  // would have to be seeded from `topics` and would silently re-open a unit
  // that arrived after the seed.
  //
  // NOT PERSISTED, to storage or to the database. It is a view state on one
  // screen, and a teacher who returns to build a second worksheet should meet
  // the same tidy list rather than the shape of their last session.
  //
  // HELD APART FROM `selected` AND `order` ON PURPOSE. Collapsing a unit is a
  // question about what is on screen, never about what is chosen: nothing below
  // reads this set when building the payload, so a collapsed unit's topics stay
  // selected, stay counted in the totals, and stay listed in the rail.
  const [openUnits, setOpenUnits] = useState<Set<number>>(new Set());

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

  function toggleUnit(unit: number) {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unit)) next.delete(unit);
      else next.add(unit);
      return next;
    });
  }

  const byId = useMemo(() => {
    const map = new Map<string, PickerTopic>();
    for (const t of topics) map.set(t.topic_id, t);
    return map;
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
  // Said as "0 min" rather than "~1 min" when nothing is selected. The rule of
  // thumb has a floor of one minute, which was invisible in the old summary row
  // and is 26px display type in the totals band. A prominent number that reads
  // "about a minute" over an empty sheet is worse than no number.
  const timeLabel = capped === 0 ? '0 min' : `~${minutes} min`;

  // Selection order, so the rail lists topics in the order they were picked.
  // Held alongside the Set rather than replacing it: every existing read is a
  // membership test, and a Set is the right shape for that.
  const [order, setOrder] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
        capped?: boolean;
        used?: number | null;
      };
      // A 429 carries the enforced count, so hitting the cap by racing the
      // button or by posting directly lands in the same state as arriving here
      // already spent, rather than in a generic error string.
      if (typeof body.used === 'number') setUsed(body.used);
      if (!res.ok || !body.id) {
        setError(body.capped ? null : body.error ?? 'Could not build that worksheet.');
        return;
      }
      router.push(`/teacher/worksheets/${body.id}`);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  const blocked = busy || atCap || selected.size === 0 || pool === 0;

  // ws-chrome: the builder renders no sheet, so the whole main is chrome. A
  // plain comment and not a JSX one, because this element is the root of the
  // return and a {/* */} beside it would be a second child.
  return (
    <main className="ws-page ws-chrome">
      <style>{WS_CHROME_CSS}</style>

      <header style={{ background: WS.band, borderBottom: `1px solid ${WS.hairline}` }}>
        <div className="ws-headband-inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <Link href="/teacher/worksheets" style={{ ...microLabel, letterSpacing: '0.14em', textDecoration: 'none' }}>
              Worksheets
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: WS.ink, margin: 0, letterSpacing: '-0.01em' }}>
              New worksheet
            </h1>
          </div>
          {metered && !atCap && (
            <div className="ws-headband-actions">
              <QuotaMeter used={used as number} cap={quotaCap as number} />
            </div>
          )}
        </div>
      </header>

      <div className="ws-builder">
        {/* ── selection rail, upper half ─────────────────────────────────── */}
        <div className="ws-builder-rail-top">
          <div
            style={{
              padding: '18px 22px 14px',
              borderBottom: `1px solid ${WS.hairline}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
            }}
          >
            <label htmlFor="ws-title" style={microLabel}>
              Worksheet name
            </label>
            <input
              id="ws-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Practice worksheet"
              maxLength={120}
              style={{ ...fieldStyle, fontFamily: WS.font.heading, fontSize: 15 }}
            />
          </div>

          <div
            style={{
              padding: '16px 22px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
              flex: 1,
              minHeight: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span style={microLabel}>Selected topics</span>
              <span style={{ ...microLabel, letterSpacing: '0.04em' }}>
                {selected.size} of {topics.length}
              </span>
            </div>

            {order.length === 0 ? (
              <div
                style={{
                  border: `1px dashed ${WS.hairline}`,
                  background: WS.insetRow,
                  padding: '22px 14px',
                  textAlign: 'center',
                  fontSize: 12.5,
                  color: WS.muted,
                }}
              >
                Pick a topic on the right to add it here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {order.map((id) => {
                  const t = byId.get(id);
                  if (!t) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        ...panelStyle,
                        padding: '10px 11px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 9,
                        boxShadow: `inset 3px 0 0 ${WS.marker}`,
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                        <span style={{ fontSize: 13, lineHeight: 1.35, color: WS.ink }}>{t.topic_name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={strandChip(t.related_strand)}>{t.related_strand}</span>
                          <span style={{ ...microLabel, letterSpacing: '0.04em', textTransform: 'none' }}>
                            {t.topic_id}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        aria-label={`Remove ${t.topic_name}`}
                        className="ws-tap"
                        style={{
                          border: 'none',
                          background: 'none',
                          color: WS.muted,
                          fontSize: 15,
                          lineHeight: 1,
                          cursor: 'pointer',
                          padding: '2px 3px',
                          fontFamily: 'inherit',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── selection rail, lower half ─────────────────────────────────── */}
        <div className="ws-builder-rail-bot">
          {/* ── the totals band ──────────────────────────────────────────────
              Desktop only. At 375 the sticky bar carries the same two numbers,
              and printing them twice on one screen invites the two to disagree
              the first time somebody edits one of them. */}
          <div
            className="ws-only-desk"
            style={{
              padding: '14px 22px',
              background: WS.quietBox,
              borderTop: `1px solid ${WS.hairline}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontFamily: WS.font.heading,
                  fontSize: 26,
                  fontWeight: 600,
                  color: WS.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {capped}
              </span>
              <span style={{ ...microLabel, fontSize: 9.5, letterSpacing: '0.1em' }}>On the sheet</span>
            </div>
            <div style={{ width: 1, height: 34, background: WS.hairline }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
              <span
                style={{
                  fontFamily: WS.font.heading,
                  fontSize: 26,
                  fontWeight: 600,
                  color: WS.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {timeLabel}
              </span>
              <span style={{ ...microLabel, fontSize: 9.5, letterSpacing: '0.1em' }}>Estimated time</span>
            </div>
          </div>

          {/* ── the controls ─────────────────────────────────────────────── */}
          <div
            style={{
              padding: '16px 22px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              borderTop: `1px solid ${WS.hairline}`,
              background: WS.rail,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label htmlFor="ws-count" style={microLabel}>
                Questions
              </label>
              {/* The board has no field here, because it counts per topic. That
                  is not built, so the one global count the API accepts keeps
                  its input. */}
              <input
                id="ws-count"
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                style={{ ...fieldStyle, fontVariantNumeric: 'tabular-nums' }}
              />
              <span style={{ fontSize: 11, color: WS.muted, lineHeight: 1.45 }}>
                Spread across the topics you pick. {pool} available from this selection.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={microLabel}>Difficulty</span>
              {/* Three independent toggles, drawn as three. See the header. */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {LEVELS.map((l) => {
                  const on = levels.has(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() => toggleLevel(l)}
                      className="ws-tap"
                      style={{
                        flex: 1,
                        minWidth: 92,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        border: `1px solid ${WS.hairline}`,
                        borderRadius: 0,
                        background: WS.panel,
                        color: WS.ink,
                        fontFamily: 'inherit',
                        fontSize: 12.5,
                        padding: '8px 6px',
                        cursor: 'pointer',
                        boxShadow: on ? `inset 3px 0 0 ${WS.marker}` : 'none',
                      }}
                    >
                      <Marker on={on} />
                      {l}
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: 11, color: WS.muted, lineHeight: 1.45 }}>
                Pick any combination, or leave all three off to draw from every band.
              </span>
            </div>

            {/* Schema fact 3, said out loud at the moment it starts to matter. */}
            {filtering && (
              <p style={{ fontSize: 11.5, color: WS.error, margin: 0, lineHeight: 1.45 }}>
                Mini-quiz questions are not tagged with a difficulty, so they are
                left out while a filter is on. That is why the counts drop.
              </p>
            )}

            {!filtering && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  fontSize: 13,
                  color: WS.ink,
                  cursor: 'pointer',
                }}
              >
                <input
                  className="ws-sr"
                  type="checkbox"
                  checked={includeQuiz}
                  onChange={(e) => setIncludeQuiz(e.target.checked)}
                />
                <Marker on={includeQuiz} />
                Include mini-quiz questions
              </label>
            )}

            {short && (
              <p style={{ fontSize: 11.5, color: WS.error, margin: 0, lineHeight: 1.45 }}>
                Only {pool} question{pool === 1 ? '' : 's'} available. Add a topic
                or lower the count, questions are never repeated.
              </p>
            )}

            {error && (
              <p style={{ fontSize: 12.5, color: WS.missed, margin: 0 }} role="alert">
                {error}
              </p>
            )}

            {atCap && <QuotaCapNotice cap={quotaCap as number} />}

            <button
              type="button"
              onClick={create}
              disabled={blocked}
              className={`ws-only-desk ws-tap${blocked ? '' : ' ws-cta'}`}
              style={{
                ...ctaStyle,
                width: '100%',
                padding: '14px 0',
                fontSize: 15,
                background: blocked ? WS.quietBox : WS.cta,
                color: blocked ? WS.disabled : WS.ctaInk,
                cursor: blocked ? 'not-allowed' : 'pointer',
              }}
            >
              {busy ? 'Building' : 'Generate worksheet'}
            </button>
          </div>
        </div>

        {/* ── topic browser ──────────────────────────────────────────────── */}
        <div className="ws-builder-main">
          <div
            style={{
              padding: '20px 26px 14px',
              background: WS.band,
              borderBottom: `1px solid ${WS.hairline}`,
            }}
          >
            <span style={microLabel}>Topics</span>
          </div>

          <div style={{ padding: '18px 26px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {byUnit.map(([unit, list]) => {
              const open = openUnits.has(unit);
              // Counted from `selected`, never from what is on screen, so the
              // number is the truth about the worksheet rather than a summary of
              // the visible cards. It is the reassurance that makes collapsing a
              // unit with choices in it safe to do.
              const chosen = list.reduce((n, t) => n + (selected.has(t.topic_id) ? 1 : 0), 0);
              return (
              <section key={unit} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {/* The whole heading row is the control, not a chevron beside
                    it: the heading is what a teacher aims at, and a 15px target
                    floating next to a full-width row is the wrong thing to ask
                    anyone to hit. A real <button>, so Enter and Space work and
                    aria-expanded says what it does. */}
                <button
                  type="button"
                  onClick={() => toggleUnit(unit)}
                  aria-expanded={open}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    font: 'inherit',
                    color: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Points down when open, right when closed. aria-hidden: the
                      button already announces its own state. */}
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      flex: '0 0 11px',
                      color: WS.muted,
                      transform: open ? 'rotate(90deg)' : 'none',
                      transition: 'transform 160ms ease',
                    }}
                  >
                    <polyline points="6 3 13 9 6 15" />
                  </svg>
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: WS.ink,
                      margin: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {UNIT_NAMES[unit] ?? `Unit ${unit}`}
                  </h2>
                  <div style={{ flex: 1, height: 1, background: WS.hairline }} />
                  {chosen > 0 && (
                    <span
                      style={{
                        ...microLabel,
                        letterSpacing: '0.06em',
                        color: WS.ink,
                        fontWeight: 700,
                      }}
                    >
                      {chosen} selected
                    </span>
                  )}
                  <span style={{ ...microLabel, letterSpacing: '0.06em' }}>
                    {list.length} topic{list.length === 1 ? '' : 's'}
                  </span>
                </button>

                {/* UNMOUNTED, not hidden. A display:none grid would keep 97
                    checkboxes in the accessibility tree and in the tab order,
                    which is the opposite of what collapsing is for. */}
                {open && (
                <div className="ws-topicgrid">
                  {list.map((t) => {
                    const on = selected.has(t.topic_id);
                    const shown = filtering ? t.levelled : t.available;
                    const locked = shown === 0;
                    return (
                      <label
                        key={t.topic_id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '14px 15px',
                          background: locked ? WS.insetRow : WS.panel,
                          border: locked ? `1px dashed ${WS.hairline}` : `1px solid ${WS.hairline}`,
                          boxShadow: on ? `inset 3px 0 0 ${WS.marker}` : 'none',
                          opacity: locked ? 0.55 : 1,
                          cursor: locked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          className="ws-sr"
                          type="checkbox"
                          checked={on}
                          disabled={locked}
                          onChange={() => toggle(t.topic_id)}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                          <span style={{ fontSize: 14, lineHeight: 1.35, color: WS.ink }}>{t.topic_name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={strandChip(t.related_strand)}>{t.related_strand}</span>
                            <span style={{ ...microLabel, letterSpacing: '0.04em', textTransform: 'none' }}>
                              {t.topic_id}
                            </span>
                            <span style={{ ...microLabel, letterSpacing: '0.04em' }}>
                              {locked ? 'None available' : `${shown} available`}
                            </span>
                            {t.templated && (
                              <span
                                title="This topic generates fresh numbers each time"
                                style={{
                                  ...strandChip('AR'),
                                  background: WS.correctTint,
                                  color: WS.statusComplete,
                                }}
                              >
                                deep
                              </span>
                            )}
                          </div>
                        </div>
                        {!locked && <Marker on={on} plus />}
                      </label>
                    );
                  })}
                </div>
                )}
              </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* The board's sticky bottom sheet, at 375 only. .ws-only-mobile and
          .ws-only-desk are mutually exclusive at every width, so exactly one
          Generate button is ever in the accessibility tree. */}
      <div className="ws-stickybar ws-only-mobile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontFamily: WS.font.heading,
              fontSize: 17,
              fontWeight: 600,
              color: WS.ink,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {capped} · {timeLabel}
          </span>
          <span style={{ ...microLabel, fontSize: 9.5, letterSpacing: '0.1em' }}>
            {selected.size} topic{selected.size === 1 ? '' : 's'} selected
          </span>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={blocked}
          className={`ws-tap${blocked ? '' : ' ws-cta'}`}
          style={{
            ...ctaStyle,
            flex: 1,
            padding: '13px 0',
            fontSize: 14.5,
            background: blocked ? WS.panel : WS.cta,
            color: blocked ? WS.disabled : WS.ctaInk,
            cursor: blocked ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? 'Building' : 'Generate'}
        </button>
      </div>
    </main>
  );
}

/**
 * The board's 16px state marker.
 *
 * Orange as a FILL with near-black on it when on, a hairline box when off. It
 * is never the only signal: every marker sits beside its own label, and a
 * selected card also carries the inset rule.
 */
function Marker({ on, plus }: { on: boolean; plus?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: on ? WS.cta : 'transparent',
        border: on ? `1px solid ${WS.cta}` : `1px solid ${WS.controlBorder}`,
        color: WS.ink,
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      {on ? (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={WS.ink} strokeWidth="2">
          <path d="M2 6.4 4.6 9 10 3.2" />
        </svg>
      ) : plus ? (
        '+'
      ) : null}
    </span>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${WS.hairline}`,
  borderRadius: 0,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: WS.ink,
  background: WS.panel,
  outline: 'none',
  boxSizing: 'border-box',
};
