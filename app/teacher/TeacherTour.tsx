'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { FONT_HEADING, FONT_BODY } from '../components/fonts';
import { DASH } from '../components/dashboard-theme';

// Ten-step spotlight tour of the teacher dashboard, shown once per teacher.
//
// Hand-rolled rather than driver.js, for three reasons worth keeping written
// down so the next person does not redo the comparison:
//
//   1. The dim-with-a-hole is one element. A fixed div sized to the target with
//      `box-shadow: 0 0 0 9999px rgba(...)` darkens the page and punches a
//      rounded hole in a single declaration -- no four-panel overlay, no SVG
//      mask -- and animating its top/left/width/height is what makes the
//      highlight glide between steps instead of jumping.
//   2. driver.js is themed through a global stylesheet (.driver-popover et al).
//      This dashboard is 1150 lines of inline styles with its tokens in
//      dashboard-theme.ts precisely so there is no global sheet to drift; the
//      library would have meant shipping one back.
//   3. Nothing here needs the highlighted element to be clickable -- the only
//      controls are Next and Skip -- so the overlay never has to reach into the
//      page's z-index stack (sidebar 30, top bar 20, modals 200, slide-over
//      300, account menu 320). It sits above all of it at 398-400 and leaves
//      the dashboard untouched.
//
// Targets are found by `data-tour="..."` attributes rather than by CSS
// structure, so re-styling the dashboard cannot silently unhook a step.

// ─── Steps ───────────────────────────────────────────────────────────────────

interface TourStep {
  /** data-tour key, an array of keys to highlight together, or null for a
   *  centred step with no cutout. */
  target: string | string[] | null;
  /** Stands in for `target` below 1024px, where the desktop rail is not in the
   *  DOM. Steps that point at rail items retarget onto the menu button that
   *  opens the slide-over holding them. */
  compactTarget?: string | string[] | null;
  title: string;
  body: string;
  /** Stands in for `body` below 1024px. Only needed where the copy names a
   *  position that the compact layout moves. */
  compactBody?: string;
}

const STEPS: TourStep[] = [
  {
    target: 'new-class',
    title: 'Start here.',
    body: 'Create your first class and give it a name.',
  },
  {
    // The join code and the Invite button are two separate controls in the top
    // bar. Highlighting both as one union rect avoids wrapping them in a
    // container, which would change how the header wraps on narrow screens.
    target: ['join-code', 'invite'],
    title: 'Add your students.',
    body: "Share your class code, or invite them by email. Students join at unpackmath.com/login and select 'I'm a Student.'",
  },
  {
    target: null,
    title: 'First login, first test.',
    body: 'New students see one thing: a Begin Diagnostic button. Everything else unlocks after that.',
  },
  {
    target: 'summary',
    title: 'Data shows up fast.',
    body: "Once a student finishes the diagnostic, you'll see them here.",
  },
  {
    target: 'announcements',
    title: 'Announcements.',
    body: 'Post reminders about deadlines, focus areas, or upcoming TSI dates.',
  },
  {
    target: 'strand',
    title: 'Class strand mastery.',
    body: 'See where your whole class is struggling as a group, handy for planning what to teach next.',
  },
  {
    target: 'roster',
    title: 'Class roster.',
    body: "Click 'View' on any student for their full breakdown. Sort by Name, Score, or Need Help.",
  },
  {
    target: 'nav-misconceptions',
    compactTarget: 'menu-button',
    title: 'Top misconceptions.',
    body: 'The specific errors showing up most in your class, good material for small groups.',
  },
  {
    target: 'nav-practice',
    compactTarget: 'menu-button',
    title: 'Try it yourself.',
    body: 'Take a practice test to see exactly what your students see.',
  },
  {
    // The Help item lives inside the account dropdown, which opens on the
    // initials chip -- so the chip is what gets highlighted, and the copy says
    // to click it rather than claiming Help is already on screen.
    //
    // Compact moves the chip out of the corner and into the slide-over, so the
    // copy has to move with it; pointing at a top-left menu button while
    // saying "bottom left" would be worse than either alone.
    target: 'profile',
    compactTarget: 'menu-button',
    title: 'Stuck?',
    body: 'Click your initials, bottom left, then Help.',
    compactBody: 'Open the menu, top left, then click your initials and choose Help.',
  },
];

// ─── Geometry ────────────────────────────────────────────────────────────────

const RING_PAD = 8;
const RING_RADIUS = 12;
const CARD_W = 330;
const GAP = 14;
const MARGIN = 16;
/** Ring height ceiling, as a share of the viewport. The roster is taller than
 *  the screen; without this its cutout fills the viewport and leaves the card
 *  nowhere to sit. */
const MAX_RING_VH = 0.55;
/** Floor for that clamp. On a short window the room-for-the-card calculation
 *  can go to nothing, and a highlight has to stay big enough to read as one. */
const MIN_RING_H = 120;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** The target a step uses at the current width. Tested by key presence, not
 *  truthiness, so a step may deliberately declare `compactTarget: null` to lose
 *  its highlight on narrow screens rather than inherit the desktop one. */
function targetFor(step: TourStep, compact: boolean): TourStep['target'] {
  if (compact && 'compactTarget' in step) return step.compactTarget ?? null;
  return step.target;
}

function resolve(target: TourStep['target']): HTMLElement[] {
  if (!target) return [];
  const keys = Array.isArray(target) ? target : [target];
  return keys.flatMap((k) =>
    Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${k}"]`))
  );
}

/** Smallest box containing every element, in viewport coordinates. Zero-size
 *  elements are ignored so a target that is present but unrendered (a collapsed
 *  rail item, say) cannot drag the box to the origin. */
function unionRect(els: HTMLElement[], pad: number): Box | null {
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }

  if (top === Infinity) return null;
  return {
    top: top - pad,
    left: left - pad,
    width: right - left + pad * 2,
    height: bottom - top + pad * 2,
  };
}

/** True if the element rides in a sticky or fixed subtree -- the top bar and
 *  the sidebar rail both do. Such a target is on screen whatever the scroll
 *  position, so scrolling to it is at best pointless and at worst yanks the
 *  page to the top to "reach" something that never moved. */
function isPinned(el: HTMLElement): boolean {
  let n: HTMLElement | null = el;
  while (n && n !== document.body) {
    const p = getComputedStyle(n).position;
    if (p === 'fixed' || p === 'sticky') return true;
    n = n.parentElement;
  }
  return false;
}

/** Right edge of the desktop rail, or 0 when it is not on screen. The card is
 *  never laid over it -- a rail target's own cutout sits inside the rail, so
 *  "just to the right of the target" would land the card on top of the navy. */
function railRight(): number {
  const el = document.querySelector<HTMLElement>('[data-tour-rail]');
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  return r.width > 0 ? r.right : 0;
}

/** Narrow enough that putting the card alongside it makes sense. A full-width
 *  content panel fails this and goes below instead, even though its left edge
 *  is also near the rail. */
const ALONGSIDE_MAX_W = 260;

/** Where the card goes relative to the cutout: alongside for small rail-side
 *  targets, otherwise below, then above, then whichever side has room. Every
 *  branch is clamped inside the viewport and outside the rail. */
function place(box: Box | null, cw: number, ch: number, vw: number, vh: number, avoidLeft: number) {
  const minLeft = avoidLeft > 0 ? Math.max(MARGIN, avoidLeft + GAP) : MARGIN;
  const maxLeft = Math.max(minLeft, vw - cw - MARGIN);
  const clampL = (x: number) => Math.min(Math.max(x, minLeft), maxLeft);
  const clampT = (y: number) => Math.min(Math.max(y, MARGIN), Math.max(MARGIN, vh - ch - MARGIN));

  // Centred within the space the rail leaves, not within the viewport, so a
  // no-target step does not drift under the navy on a narrow desktop.
  if (!box) return { top: clampT((vh - ch) / 2), left: clampL(minLeft + (vw - minLeft - cw) / 2) };

  const right = box.left + box.width;
  const bottom = box.top + box.height;

  // Alongside. minLeft is what keeps step 10's card off the rail: the initials
  // chip ends around x=54, and right + GAP alone would put the card at 68,
  // roughly 130px deep into a 200px rail.
  const beside = Math.max(right + GAP, minLeft);
  if (box.width <= ALONGSIDE_MAX_W && box.left < vw * 0.3 && beside + cw <= vw - MARGIN) {
    return { top: clampT(box.top + box.height / 2 - ch / 2), left: beside };
  }
  if (bottom + GAP + ch <= vh - MARGIN) {
    return { top: bottom + GAP, left: clampL(box.left) };
  }
  if (box.top - GAP - ch >= MARGIN) {
    return { top: box.top - GAP - ch, left: clampL(box.left) };
  }
  // Nothing fits cleanly. Prefer the left flank if it clears the rail,
  // otherwise fall back to the clamped right flank.
  const leftSide = box.left - GAP - cw;
  return {
    top: clampT(box.top + box.height / 2 - ch / 2),
    left: leftSide >= minLeft ? leftSide : clampL(beside),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TOUR_STORAGE_KEY = 'um_teacher_tour_done';

/** prefers-reduced-motion, as a React value.
 *
 *  A local copy of the hook at app/reporte/page.tsx:254 rather than an import:
 *  that one is not exported, and hoisting it into a shared module would mean
 *  editing reporte/page.tsx, which is outside this wave. Same shape, so the two
 *  can be collapsed the day a third caller appears.
 *
 *  Starts false and corrects in an effect, which is the SSR-safe direction:
 *  matchMedia does not exist on the server, and the first client paint of this
 *  component is the tour opening, at which point the effect has already run.
 *  The 'change' listener matters because the setting can be flipped while the
 *  tour is open. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export default function TeacherTour({
  compact,
  onStarted,
  onClose,
}: {
  /** The dashboard's own isCompact (<1024px), where the rail is a slide-over.
   *  Owned there rather than re-derived here so both agree on the breakpoint. */
  compact: boolean;
  /** Fired once the tour is actually on screen, so the dashboard can latch it
   *  open and a background roster refetch cannot unmount it mid-step. */
  onStarted: () => void;
  onClose: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  /** 'out' while the page is scrolling to a target that is off screen: the
   *  cutout collapses to a point so the dim never lifts mid-move. */
  const [phase, setPhase] = useState<'idle' | 'out'>('idle');
  /** Transitions are on for step-to-step moves and off while tracking a scroll,
   *  where a 280ms ease would read as the ring lagging behind the page. */
  const [animate, setAnimate] = useState(true);
  /** Drives the one-frame-late fade of the page dim, so the tour opens softly
   *  instead of dropping a dark layer on the dashboard in a single frame. */
  const [entered, setEntered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;

  const stepBody = compact && step.compactBody ? step.compactBody : step.body;

  const measure = useCallback(() => {
    const b = unionRect(resolve(targetFor(STEPS[i], compact)), RING_PAD);
    if (b) {
      const vh = window.innerHeight;
      // The ceiling is not just a share of the viewport: the ring also has to
      // leave room for the card beneath it. A target taller than what is left
      // pushes the card past the bottom edge, and the last-resort branch in
      // place() then puts it back on top of the very thing it describes --
      // which is what the roster step did at 1280x800 with wrapped copy.
      const cardH = cardRef.current?.offsetHeight ?? 190;
      const room = vh - b.top - cardH - GAP - MARGIN;
      const maxH = Math.min(vh * MAX_RING_VH, Math.max(MIN_RING_H, room));
      if (b.height > maxH) b.height = maxH;
    }
    setBox(b);
    setVp({ w: window.innerWidth, h: window.innerHeight });
  }, [i, compact]);

  // Per-step: scroll the target into view if it is not already there, then
  // measure once the page has stopped moving.
  useEffect(() => {
    const els = resolve(targetFor(STEPS[i], compact));
    const raw = unionRect(els, 0);
    const vh = window.innerHeight;
    const tall = raw ? raw.height > vh * MAX_RING_VH : false;

    // Tall targets are anchored near the top so their first rows are what the
    // teacher actually sees; everything else is centred.
    const wanted = raw
      ? tall
        ? window.scrollY + raw.top - 110
        : window.scrollY + raw.top + raw.height / 2 - vh / 2
      : window.scrollY;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    const to = Math.min(Math.max(0, wanted), maxScroll);

    // Nothing to scroll to if the target is pinned, or if the scroll we would
    // ask for is the one we are already at. Both cases glide instead, which is
    // what keeps consecutive top-bar steps from cross-fading needlessly.
    const pinned = els.length > 0 && els.every(isPinned);
    const needsScroll = raw !== null && !pinned && Math.abs(to - window.scrollY) > 24;

    if (!needsScroll) {
      setPhase('idle');
      setAnimate(true);
      measure();
      setVisible(true);
      return;
    }

    setPhase('out');
    window.scrollTo({ top: to, behavior: 'smooth' });

    // No scrollend listener: Safari only shipped it recently, and a settle
    // poll is both portable and self-limiting.
    let raf = 0;
    let cancelled = false;
    let last = window.scrollY;
    let stable = 0;
    const started = performance.now();

    const tick = () => {
      if (cancelled) return;
      const y = window.scrollY;
      stable = y === last ? stable + 1 : 0;
      last = y;
      if (stable >= 3 || performance.now() - started > 900) {
        setAnimate(true);
        measure();
        setPhase('idle');
        setVisible(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [i, compact, measure]);

  // Keep the cutout glued to its target if the teacher scrolls or resizes
  // underneath the tour.
  useEffect(() => {
    let raf = 0;
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setAnimate(false);
        measure();
      });
    };
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [measure]);

  // Card placement needs the card's real height, so it is measured after paint
  // and positioned on the next frame. Until then the card renders transparent.
  const lastCardH = useRef(0);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    setCardPos(place(box, el.offsetWidth, h, window.innerWidth, window.innerHeight, railRight()));

    // The ring clamp in measure() needs this step's card height, which is only
    // knowable once the copy has rendered. One corrective pass when it moves;
    // the height does not depend on the box, so this settles immediately.
    if (Math.abs(h - lastCardH.current) > 8) {
      lastCardH.current = h;
      measure();
    }
  }, [box, i, visible, compact, measure]);

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, '1');
    } catch {
      // Private mode or a blocked store. The server flag is the real record;
      // worst case the tour reappears next visit.
    }
    // Fire and forget: dismissal should feel instant, and a failed write only
    // costs the teacher a second showing.
    fetch('/api/teacher/tour', { method: 'POST' }).catch(() => {});
    onClose();
  }, [onClose]);

  const next = useCallback(() => {
    if (isLast) finish();
    else setI((n) => n + 1);
  }, [isLast, finish]);

  // Escape skips, Enter and Right advance. The card takes focus on each step so
  // these land without the teacher having to click into the overlay first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish, next]);

  useEffect(() => {
    if (visible) cardRef.current?.focus({ preventScroll: true });
  }, [visible, i]);

  useEffect(() => {
    if (!visible) return;
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, [visible]);

  // Ref-latched rather than depending on onStarted, which the dashboard passes
  // as an inline arrow and so is a new function every render.
  const startedRef = useRef(false);
  useEffect(() => {
    if (visible && !startedRef.current) {
      startedRef.current = true;
      onStarted();
    }
  }, [visible, onStarted]);

  if (!visible) return null;

  const collapsed = phase === 'out' || !box;
  const ring: Box = collapsed
    ? { top: vp.h / 2, left: vp.w / 2, width: 0, height: 0 }
    : box;

  const move = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const fade = 'border-color 200ms linear, box-shadow 200ms linear';

  // ─── THE REDUCED-MOTION GUARD ─────────────────────────────────────────────
  //
  // WHY IT IS HERE AND NOT IN A STYLESHEET. Both of this component's moving
  // parts set `transition` as an INLINE style prop, and no media query can
  // reach an inline declaration. app/motion.ts's guard is also no help and is
  // not meant to be: it is scoped to .um-motion, which the dashboard does not
  // carry, and its header records the deliberate refusal to ship a blanket
  // '* { animation: none }' that would reach across the product. So the read
  // has to happen in JS, and this is the one dashboard-adjacent change in the
  // wave that does it.
  //
  // IT SHORT-CIRCUITS BOTH TIERS, WHICH IS THE POINT. Routing `reduced` into
  // the existing `animate` flag alone would only drop the 280ms move and leave
  // `fade` -- itself a 200ms border-colour and box-shadow transition -- still
  // running. `animate` is about scroll tracking, a different question, so it
  // is left to answer only that and `reduced` is checked outside it.
  //
  // 'none' rather than a short duration: nothing here is hidden behind a
  // transition, so removing them outright leaves every step landing instantly
  // and fully painted. The spotlight still moves between steps, the card still
  // repositions, the dim still appears -- they just arrive rather than glide.
  const ringTransition = reduced
    ? 'none'
    : animate
      ? `top 280ms ${move}, left 280ms ${move}, width 280ms ${move}, height 280ms ${move}, ${fade}`
      : fade;
  const cardTransition = reduced
    ? 'none'
    : `top 280ms ${move}, left 280ms ${move}, opacity 200ms linear`;

  return (
    <>
      {/* Swallows clicks on the dashboard for the duration. Scrolling still
          works, and the cutout tracks it. */}
      <div
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: 398, cursor: 'default' }}
      />

      {/* The spotlight. The 9999px spread is the page dim; the box itself is
          the hole. Collapsing it to a point is how a no-target step and a
          mid-scroll move both render as an evenly dimmed page. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: ring.top,
          left: ring.left,
          width: ring.width,
          height: ring.height,
          borderRadius: collapsed ? 0 : RING_RADIUS,
          border: `2px solid ${collapsed ? 'transparent' : '#E7BE7B'}`,
          // Glow first so it paints over the dim. Its alpha goes to zero rather
          // than the shadow being dropped from the list: a 4px spread on a 0x0
          // box is an 8px amber dot, which is exactly what a no-target step
          // would otherwise leave sitting in the middle of the screen. Keeping
          // both shadows also lets the pair interpolate.
          boxShadow: `0 0 0 4px rgba(231,190,123,${collapsed ? 0 : 0.2}), 0 0 0 9999px rgba(15,30,53,${entered ? 0.55 : 0})`,
          zIndex: 399,
          pointerEvents: 'none',
          transition: ringTransition,
        }}
      />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="um-tour-title"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: cardPos?.top ?? 0,
          left: cardPos?.left ?? 0,
          width: CARD_W,
          maxWidth: `calc(100vw - ${MARGIN * 2}px)`,
          // A short window plus wrapped copy can make the card taller than the
          // space it has. Capping it and scrolling inside keeps the Skip and
          // Next controls reachable instead of pushing them off screen.
          maxHeight: `calc(100vh - ${MARGIN * 2}px)`,
          overflowY: 'auto',
          zIndex: 400,
          background: '#fff',
          border: '1px solid rgba(15,30,53,0.07)',
          borderRadius: 14,
          padding: '17px 18px 15px',
          boxShadow: '0 18px 48px rgba(15,30,53,0.28)',
          fontFamily: FONT_BODY,
          color: DASH.ink,
          outline: 'none',
          opacity: cardPos && phase === 'idle' ? 1 : 0,
          transition: cardTransition,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            color: '#C68A2F',
          }}
        >
          Step {i + 1} of {STEPS.length}
        </div>

        <h3
          id="um-tour-title"
          style={{
            margin: '7px 0 0',
            fontFamily: FONT_HEADING,
            fontWeight: 600,
            fontSize: 16.5,
            lineHeight: 1.3,
            color: DASH.heading,
          }}
        >
          {step.title}
        </h3>

        <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: DASH.muted }}>
          {stepBody}
        </p>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={finish}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 2px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12.5,
              fontWeight: 600,
              color: DASH.dim,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = DASH.muted; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = DASH.dim; }}
          >
            Skip tour
          </button>

          <button
            type="button"
            onClick={next}
            style={{
              background: '#C68A2F',
              border: 'none',
              borderRadius: 9,
              padding: '9px 18px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#B27C29'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#C68A2F'; }}
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
