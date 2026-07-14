"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ *
 * Initial loading state for the Parent Digest.
 *
 * The navy field is opaque from the very first paint, including the
 * server-rendered HTML, before hydration, so it covers the page while
 * it loads. Only the logo animates: it slides in, holds, then slides
 * out and fades as `exiting` flips, while the report's first card fades
 * in underneath over the same window. The page owns the timing.
 * ------------------------------------------------------------------ */

// Exit transition duration. The page waits this long before unmounting us.
export const EXIT_MS = 650;
const ENTER_MS = 450;

const EASE_IN = "cubic-bezier(0.4,0,1,1)";
const EASE_OUT = "cubic-bezier(0,0,0.2,1)";

export function ReporteLoadingScreen({ exiting }: { exiting: boolean }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Next frame, so the browser has a start value to transition from.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const ms = exiting ? EXIT_MS : ENTER_MS;
  const ease = exiting ? EASE_IN : EASE_OUT;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0F1E35",
        zIndex: 50,
        // Opaque until the exit begins; never fades *in*, or the page would
        // flash uncovered before hydration.
        opacity: exiting ? 0 : 1,
        transition: `opacity ${EXIT_MS}ms ${EASE_IN}`,
        pointerEvents: "none",
      }}
    >
      <img
        src="/npackmath.png"
        alt="UnpackMath"
        style={{
          width: 220,
          maxWidth: "62vw",
          height: "auto",
          display: "block",
          opacity: entered && !exiting ? 1 : 0,
          transform: exiting ? "translateY(-16px)" : entered ? "translateY(0)" : "translateY(8px)",
          transition: `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}`,
        }}
      />
    </div>
  );
}
