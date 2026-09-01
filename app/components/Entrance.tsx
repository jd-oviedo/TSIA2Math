'use client';

import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { useThemeContext } from '../theme/ThemeProvider';
import { prefersReducedMotion } from '../motion';
import { MOTION } from '../adaptive-test/cat-theme';

// The page-load entrance for the two student surfaces: the home hero and the
// adaptive test. One soft fade-up of the whole content block as a single unit,
// opacity 0 + translateY 10px to opacity 1 + translateY 0, once per page load.
//
// ─── WHY IT WAITS FOR THE THEME, AND WHAT IT LOOKS LIKE WHEN IT DOES NOT ────
//
// Both surfaces decide their ground from `theme`: the wrapper stamps
// data-theme, and the --umc-* block for that theme paints the page. `theme`
// starts at "light" and only becomes the visitor's real choice after
// ThemeProvider's localStorage read, which is an effect, so it lands after the
// first paint.
//
// A visitor who has chosen dark therefore gets one light frame before the flip.
// That flash exists with or without this component. What this component must
// not do is run a 400ms fade ACROSS it -- fading content in over a ground that
// changes colour underneath halfway through is the jank, and it is much more
// visible than the bare flip.
//
// So the entrance is gated on `hydrated` from ThemeProvider, which is that
// read having been attempted. Ground settles first, then content arrives.
//
// ─── WHY THE REDUCED-MOTION READ IS IN A LAYOUT EFFECT ──────────────────────
//
// prefersReducedMotion() is false during SSR, because there is no matchMedia on
// the server. Reading it while RENDERING would make the server markup and the
// client's first render disagree for a visitor who asked for less motion, which
// is a hydration mismatch on the style attribute.
//
// Reading it in a LAYOUT effect instead keeps render deterministic and still
// beats the paint: layout effects flush before the browser draws, so a
// reduced-motion visitor never sees the opacity-0 frame. A passive effect would
// run after that frame and produce a blink -- motion, for the person who asked
// for none.
//
// ─── THE HIDDEN STATE IS IN THE MARKUP, AND CSS IS WHAT UNDOES IT ──────────
//
// This element renders at opacity 0 on the SERVER too. That is deliberate: it
// is what makes the entrance flash-free, because there is no frame where the
// content is painted, then hidden, then faded back in.
//
// It also means a script cannot be the whole answer for reduced motion. The
// offending frame -- invisible, translated content -- is painted from static
// HTML before any JavaScript has run, so a layout effect is already too late.
// Measured in a real browser: a reduced-motion visitor saw opacity 0 and
// translateY(10px) on the first paint of both surfaces.
//
// So the guard is a media query, in CAT_CSS, on the .um-entrance class below.
// It applies at first paint with no JavaScript and pins the element to its
// final state. The layout effect still runs and still sets `shown`, so the two
// agree rather than fight; the CSS is what covers the window before hydration.
//
// This is the one place this surface uses a class for styling, and it is
// because a class is the only thing a media query can select. Everything else
// here remains an inline style prop.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function Entrance({ children }: { children: ReactNode }) {
  const { hydrated } = useThemeContext();
  // shown: the element has been released to its final state.
  // instant: released with no transition, because motion was declined.
  const [{ shown, instant }, setState] = useState({ shown: false, instant: false });

  useIsomorphicLayoutEffect(() => {
    if (shown) return;
    if (prefersReducedMotion()) {
      setState({ shown: true, instant: true });
      return;
    }
    if (!hydrated) return;
    // One frame after the theme commit, so the browser has a painted
    // opacity-0 state to transition FROM. Setting both states in the same
    // frame would collapse into a single style recalculation and the
    // transition would never run.
    const raf = requestAnimationFrame(() => setState({ shown: true, instant: false }));
    return () => cancelAnimationFrame(raf);
  }, [hydrated, shown]);

  return (
    <div
      className="um-entrance"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${MOTION.enterTravel}px)`,
        transition: instant
          ? 'none'
          : `opacity ${MOTION.durSlow}ms ${MOTION.ease}, transform ${MOTION.durSlow}ms ${MOTION.ease}`,
      }}
    >
      {children}
    </div>
  );
}
