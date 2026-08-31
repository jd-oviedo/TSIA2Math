'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { countEligible, MAX_QUESTIONS } from '../../../lib/worksheet-select';
import { MOTION_CSS } from '../../../motion';
import type { PickerTopic } from '../../../lib/worksheet-source';
import { QuotaMeter, QuotaCapNotice } from '../QuotaNotice';

const LEVELS = ['Basic', 'Proficient', 'Advanced'] as const;
type Level = (typeof LEVELS)[number];

// THE ONE PLACE JAVASCRIPT HAS TO KNOW A DURATION, and it is a duplicate of
// --um-dur-3 in app/motion.ts. It cannot read that token: the accordion drops
// its cards on a timer rather than on transitionend (see toggleUnit for why),
// and a timer needs a number before the element exists. If --um-dur-3 moves,
// this moves with it -- being too LONG is the safe direction, since the cards
// are already invisible inside a closed row by then.
const CLOSE_MS = 280;

// The same duplication, for the chip exit, against --um-dur-2. See CLOSE_MS.
// A little long rather than a little short: the timer is the fallback, and
// firing it early would cut the animation off mid-frame.
const CHIP_MS = 260;

/**
 * Run um-tick-pop on an element whenever a value changes.
 *
 * NO REFLOW HACK. The usual way to restart a CSS animation is to remove the
 * class, read offsetWidth to force a synchronous layout, and add it back. That
 * flushes layout on every keystroke of the count field, on a page holding 97
 * topic cards, to restart a 220ms fade.
 *
 * Removing the class and adding it on the NEXT FRAME does the same job: the
 * browser has already committed a frame without the class, so re-adding it
 * starts the animation from the beginning. The rAF is cancelled on cleanup, so
 * a value that changes twice inside one frame schedules one animation.
 *
 * The first render is skipped on purpose -- a counter that pops on arrival is
 * an entrance, and this hook is for changes.
 */
function useTickPop(value: unknown) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.remove('um-tick-pop');
    const id = requestAnimationFrame(() => el.classList.add('um-tick-pop'));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return ref;
}

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
// AVAILABILITY COUNTS ARE HIDDEN, DELIBERATELY AND TEMPORARILY. Three numbers
// used to be drawn from the item bank: a per-topic "N available" badge, an
// "N available from this selection" clause under the QUESTIONS field, and the
// count inside the shortfall warning. All three are gone while the bank is
// small. They were never wrong -- that was the point of the old note here, and
// the honesty rule it stated still governs anything this screen does print.
//
// NOTHING BEHIND THEM CHANGED, which is what makes this a clean revert. Every
// number is still computed on every render -- eligibleIn() per topic, `pool` as
// their sum -- and still drives behaviour: a zero-eligible topic is still
// locked and unpickable, `short` still fires on exactly `pool < count`, and
// Generate is still refused on an empty pool. Only the printing is removed.
// To restore: put the three strings back and re-add
// `const available = Math.min(pool, MAX_QUESTIONS)` beside `capped`. No logic
// comes back with them.
//
// A LOCKED TOPIC STILL SAYS WHY. The dashed, dimmed, unpickable card kept its
// styling, so removing its badge outright would have left a teacher who ticks
// Advanced looking at greyed cards with no words. It carries the cause instead
// of a count.
//
// STILL NUMBERS ON THIS SCREEN, and none of them is a bank count: "On the
// sheet" and the time estimate describe the worksheet about to be built, and
// "N of 97" / "N topics" / "N topics selected" count topics, not questions.
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

  // MOUNTED BUT CLOSING. The grid row has to travel from 1fr to 0fr before its
  // cards can leave, and a card that has already unmounted cannot be seen
  // sliding shut, so a closing unit keeps its children for the length of the
  // transition and only then drops them.
  //
  // THE A11Y PROPERTY THE OLD `{open && ...}` PROTECTED IS UNCHANGED. A closed
  // unit still renders no cards at all -- no checkboxes in the tab order, none
  // in the accessibility tree. The wrapper stays, empty and zero-height, which
  // is what gives the open transition something to animate FROM.
  const [closingUnits, setClosingUnits] = useState<Set<number>>(new Set());

  // Bumped every time a unit opens, and used as the card grid's key so the
  // stagger restarts on each open rather than only on first mount. A key change
  // remounts the children, which is what re-runs their animation; the
  // alternative is reading offsetWidth to force a reflow, which is a layout
  // flush disguised as a no-op.
  const [openToken, setOpenToken] = useState<Record<number, number>>({});

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
    const isOpen = openUnits.has(unit);
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (isOpen) next.delete(unit);
      else next.add(unit);
      return next;
    });

    if (isOpen) {
      // Hold the cards for the length of the close, then drop them. A TIMER
      // rather than transitionend, deliberately: under prefers-reduced-motion
      // this surface's own stylesheet sets `transition: none`, the event never
      // fires, and a listener would leave the cards mounted for good -- the
      // accessibility regression this whole dance exists to avoid, arriving
      // only for the users who asked for less motion.
      setClosingUnits((prev) => new Set(prev).add(unit));
      window.setTimeout(() => {
        setClosingUnits((prev) => {
          const next = new Set(prev);
          next.delete(unit);
          return next;
        });
      }, CLOSE_MS);
    } else {
      // Re-opening during a close cancels it, so the cards are never dropped
      // out from under a unit that is on its way back open.
      setClosingUnits((prev) => {
        if (!prev.has(unit)) return prev;
        const next = new Set(prev);
        next.delete(unit);
        return next;
      });
      setOpenToken((prev) => ({ ...prev, [unit]: (prev[unit] ?? 0) + 1 }));
    }
  }

  const byId = useMemo(() => {
    const map = new Map<string, PickerTopic>();
    for (const t of topics) map.set(t.topic_id, t);
    return map;
  }, [topics]);

  const filtering = levels.size > 0;

  // The teacher's settings in the shape countEligible() takes, so the badge and
  // the server are handed the identical arguments. Memoised on the Set rather
  // than rebuilt per topic: `levels` is replaced on every toggle, so identity is
  // a correct dependency and 97 topics do not each allocate their own array.
  const draw = useMemo(
    () => ({ levels: [...levels], includeQuiz }),
    [levels, includeQuiz],
  );

  // How many questions a topic can contribute right now.
  //
  // THE DRAW'S OWN RULE, not a restatement of it. This used to read
  // `filtering ? t.levelled : includeQuiz ? t.available : t.levelled`, three
  // branches of arithmetic standing in for selectItems, and they agreed only
  // because of a content coincidence: no mini-quiz item carried a band, so
  // `levelled` happened to equal the practice count. Band one topic's quiz and
  // the coincidence breaks -- `levelled` reads 14 while the draw still delivers
  // 10, and the middle branch was already wrong for "no filter, quiz off" for
  // the same reason.
  //
  // countEligible() is the function selectItems() filters with, over the entries
  // listPickerTopics() built with the predicate drawFromStatic() draws with. The
  // badge cannot overstate the pool without the draw overstating it too.
  const eligibleIn = useCallback(
    (t: PickerTopic) => countEligible(t.entries, draw),
    [draw],
  );

  // What the current selection can actually deliver.
  const pool = useMemo(() => {
    let total = 0;
    for (const t of topics) {
      if (!selected.has(t.topic_id)) continue;
      total += eligibleIn(t);
    }
    return total;
  }, [topics, selected, eligibleIn]);

  const capped = Math.min(count, pool);
  const short = selected.size > 0 && pool < count;

  // NO `available` HERE ANY MORE. It was Math.min(pool, MAX_QUESTIONS), read by
  // the one clause under QUESTIONS that printed a bank number, and it is
  // orphaned now that clause is gone -- see the header note on hidden
  // availability. Restoring the counts restores this line with them.
  //
  // `pool` itself is untouched and still does its two jobs: `short` above, and
  // `blocked` below, which refuses a Generate on an empty selection.

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

  // The two readouts in the totals band. Both are RESULT counts -- what the
  // sheet will hold, not what the bank holds -- and they move whenever the
  // count field or the selection does, which is exactly when a small
  // acknowledgement helps and a large one would be noise.
  const sheetCountRef = useTickPop(capped);
  const timeRef = useTickPop(timeLabel);

  // Selection order, so the rail lists topics in the order they were picked.
  // Held alongside the Set rather than replacing it: every existing read is a
  // membership test, and a Set is the right shape for that.
  const [order, setOrder] = useState<string[]>([]);

  // Chips on their way out. `selected` and every total move on the CLICK, as
  // they always did -- only the chip's removal from `order` waits for its
  // animation. Deferring the selection itself would make the counts lag the
  // pointer by 220ms, which is the one thing this screen must never do.
  const [leaving, setLeaving] = useState<Set<string>>(new Set());

  // MIRRORED IN A REF BECAUSE A TIMER HAS TO READ IT, and the timer was
  // scheduled before the state it needs to consult existed. Without this,
  // pick -> unpick -> re-pick inside 260ms loses the chip: the first removal's
  // fallback timer fires against a topic that is selected again and takes its
  // rail row away, leaving a selected topic with nothing in the rail. The ref
  // is what lets dropChip ask "is this STILL leaving" at the moment it runs
  // rather than at the moment it was scheduled.
  const leavingRef = useRef<Set<string>>(new Set());

  function markLeaving(id: string) {
    const next = new Set(leavingRef.current).add(id);
    leavingRef.current = next;
    setLeaving(next);
  }

  /** Clears the flag, and reports whether it was actually set. */
  function clearLeaving(id: string): boolean {
    if (!leavingRef.current.has(id)) return false;
    const next = new Set(leavingRef.current);
    next.delete(id);
    leavingRef.current = next;
    setLeaving(next);
    return true;
  }

  function toggle(id: string) {
    const isSelected = selected.has(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(id);
      else next.add(id);
      return next;
    });

    if (isSelected) {
      markLeaving(id);
      // The belt to animationend's braces. Under reduced motion no animation
      // runs and no animationend arrives, so without this the chip would never
      // leave the rail. dropChip is idempotent, so whichever fires first wins
      // and the second is a no-op.
      window.setTimeout(() => dropChip(id), CHIP_MS);
    } else {
      // Re-picking a topic mid-exit reclaims the chip that is still on screen
      // rather than queueing a second one behind it -- and, through the ref
      // above, defuses the fallback timer that was going to remove it.
      clearLeaving(id);
      setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  }

  /**
   * The chip has finished leaving. Now it can go.
   *
   * IDEMPOTENT AND CONDITIONAL, which is what makes it safe to call from both
   * animationend and a timer, and safe to call late. If the topic was re-picked
   * while the chip was on its way out it is no longer leaving, and this returns
   * without touching the rail.
   */
  function dropChip(id: string) {
    if (!clearLeaving(id)) return;
    setOrder((prev) => prev.filter((x) => x !== id));
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
      {/* MOTION_CSS after WS_CHROME_CSS. Nothing in either overlaps the other
          -- one owns grounds and chrome, the other owns durations, keyframes
          and the reduced-motion guard -- but the order is fixed rather than
          incidental so a future collision is settled the same way twice. */}
      <style>{WS_CHROME_CSS + MOTION_CSS}</style>

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

      {/* LOCK 1 of the shared motion system, and it is HERE rather than on the
          <main> above for one concrete reason: .ws-stickybar is position:fixed
          inside that main below 375px (worksheet-theme.ts), and a transformed
          ancestor becomes the containing block for a fixed descendant. The
          mobile bar would stop being pinned to the viewport and start being
          pinned to the page. .um-motion itself carries no transform, but the
          class that opts a subtree in is the wrong place to be relying on
          that: everything this file animates lives inside .ws-builder, and the
          sticky bar is deliberately outside it.

          The consequence is stated rather than hidden: the mobile bar's own
          count does not tick, because it is outside the opted-in subtree. */}
      <div className="ws-builder um-motion">
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
                  const going = leaving.has(id);
                  return (
                    <div
                      key={id}
                      // in on mount, out on removal. The chip is still in
                      // `order` while it leaves -- `selected` and every total
                      // updated on the click -- so what is animating here is a
                      // list row, not a decision.
                      className={going ? 'um-chip-out' : 'um-chip-in'}
                      // THE EXIT'S ONLY EXIT. Under prefers-reduced-motion the
                      // guard removes the animation, animationend never fires,
                      // and a chip that waited for it would sit in the rail
                      // forever after its topic was deselected. onTransitionEnd
                      // would not help; there is no transition. So the removal
                      // is ALSO scheduled on a timer at the click, and this
                      // handler is the fast path rather than the only path --
                      // see dropChip, which is idempotent for exactly that
                      // reason.
                      onAnimationEnd={() => {
                        if (going) dropChip(id);
                      }}
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
                ref={sheetCountRef}
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
                ref={timeRef}
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
              {/* BOTH BOUNDS OFF THE ONE CONSTANT, and both are needed. `max` is
                  what the stepper and the browser's own validation read; the
                  clamp is what actually holds, because a number input accepts a
                  typed value well past its max and fires change with it. The
                  server refuses the same number either way -- this is so a
                  teacher never reaches a request the server will reject. */}
              <input
                id="ws-count"
                type="number"
                min={1}
                max={MAX_QUESTIONS}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(MAX_QUESTIONS, Number(e.target.value) || 1)))
                }
                style={{ ...fieldStyle, fontVariantNumeric: 'tabular-nums' }}
              />
              <span style={{ fontSize: 11, color: WS.muted, lineHeight: 1.45 }}>
                Spread across the topics you pick.
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
                      className="ws-tap ws-swap"
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
                        // The left rule that says "on". ws-swap below is what
                        // makes it arrive over 150ms instead of appearing.
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

            {/* Said out loud at the moment it starts to matter, and it now says
                something different. The old copy read "mini-quiz questions are
                not tagged with a difficulty, so they are left out while a filter
                is on", which was a statement about the SECTION. Bands are being
                added to mini quizzes topic by topic, so it is a statement about
                each topic's content instead, and the counts above already show
                which way each one falls. */}
            {filtering && (
              <p style={{ fontSize: 11.5, color: WS.muted, margin: 0, lineHeight: 1.45 }}>
                Only questions carrying one of the ticked bands are drawn.
                Mini-quiz questions are included where they carry a band and left
                out where they do not, which is why some counts drop.
              </p>
            )}

            {/* RENDERED IN BOTH MODES NOW. It used to be hidden while a filter
                was on, on the grounds that the filter excluded the mini quiz
                anyway. The state persisted through the hide, so a teacher who
                unticked it and then picked a band sent include_quiz:false from a
                control they could no longer see -- harmless only for as long as
                the server ignored it, which it no longer does. */}
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

            {short && (
              <p style={{ fontSize: 11.5, color: WS.error, margin: 0, lineHeight: 1.45 }}>
                Not enough questions in this selection to fill that count. Add a
                topic or lower the number. Questions are never repeated.
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
              className={`ws-only-desk ws-tap ws-swap${blocked ? '' : ' ws-cta'}`}
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
              // Open OR shutting: the cards outlive the click by the length of
              // the row's transition so the close can be seen.
              const closing = closingUnits.has(unit);
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
                    className="ws-chev"
                    style={{
                      flex: '0 0 11px',
                      color: WS.muted,
                      transform: open ? 'rotate(90deg)' : 'none',
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

                {/* STILL UNMOUNTED WHEN CLOSED, and that is the property to
                    preserve rather than the markup. A display:none grid would
                    keep 97 checkboxes in the accessibility tree and in the tab
                    order, which is the opposite of what collapsing is for.

                    The wrapper is now always present so the row has something
                    to travel FROM -- an element that mounts at its open height
                    has no transition to run -- but it is empty and 0fr high
                    while the unit is closed, so a closed unit still contributes
                    no focusable anything. The cards mount on open and are
                    dropped a beat after close, once the row has shut. */}
                <div className={`ws-unitbody${open ? ' ws-unitbody-open' : ''}`}>
                  <div>
                    {(open || closing) && (
                    <div className="ws-topicgrid um-stagger-panel" key={openToken[unit] ?? 0}>
                  {list.map((t) => {
                    const on = selected.has(t.topic_id);
                    // The same call the running total uses, so a topic's badge
                    // and the sum of the badges cannot disagree.
                    const shown = eligibleIn(t);
                    const locked = shown === 0;
                    return (
                      <label
                        key={t.topic_id}
                        // GROUND AND EDGE MOVED OUT OF THE INLINE STYLE, and
                        // they had to: an inline background beats a stylesheet
                        // rule, so a card that painted its own ground could
                        // never be hovered by one. .ws-card owns both through
                        // --card-bg / --card-border and :hover reassigns the
                        // variables. What stays inline is state React already
                        // owns -- the selected rule, the locked dimming.
                        className={`um-body-in ${locked ? 'ws-card-locked' : 'ws-card'}`}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '14px 15px',
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
                            {locked && (
                              <span style={{ ...microLabel, letterSpacing: '0.04em' }}>
                                No match at this difficulty
                              </span>
                            )}
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
                  </div>
                </div>
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
          className={`ws-tap ws-swap${blocked ? '' : ' ws-cta'}`}
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
      className="ws-swap"
      style={{
        position: 'relative',
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
      {/* ALWAYS RENDERED, faded rather than mounted. A checkmark that appears
          cannot cross-fade with the '+' it replaces, and mounting one on tick
          is a layout change inside a 16px box. Absolutely placed by .ws-tick so
          neither glyph moves the other. */}
      <span className="ws-tick" style={{ opacity: on ? 1 : 0 }}>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke={WS.ink} strokeWidth="2">
          <path d="M2 6.4 4.6 9 10 3.2" />
        </svg>
      </span>
      {!on && plus ? '+' : null}
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
