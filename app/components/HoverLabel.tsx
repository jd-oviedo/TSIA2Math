'use client';

import { useState } from 'react';

// Floating hover label for collapsed sidebar icons. Lifted out of the teacher
// dashboard so the student rail shows the same thing rather than a second
// tooltip implementation.
//
// Positioned fixed off the hovered element's own rect rather than absolutely
// inside the sidebar, because the nav clips horizontally while the collapse
// animation runs and an absolutely positioned label would be cut off at the
// rail's edge. Fixed also keeps it above the sticky top bar.
//
// It is purely additive: nav items keep their existing active and hover
// background treatment underneath, and the label layers over the main column.

export type Tip = { label: string; x: number; y: number };

export function HoverLabel({ tip }: { tip: Tip }) {
  return (
    <span
      role="tooltip"
      style={{
        position: 'fixed',
        left: tip.x,
        top: tip.y,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 400,
        background: '#fff',
        color: '#0F1E35',
        border: '1px solid rgba(15,30,53,0.07)',
        boxShadow: '0 4px 14px rgba(15,30,53,0.18)',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        // Fades in on hover. Removal is an unmount, so it disappears at once
        // on mouse-out rather than lingering through a fade.
        animation: 'umtipin 120ms ease-out',
      }}
    >
      {tip.label}
    </span>
  );
}

// The keyframe the label's fade-in needs. Each sidebar drops this into its own
// <style> block; it was previously inlined in the teacher dashboard's.
export const HOVER_LABEL_CSS = `@keyframes umtipin { from { opacity: 0; } to { opacity: 1; } }`;

// The hover bookkeeping both rails repeat: which item is hovered (for its own
// background treatment) and where to float the label.
export function useHoverLabel() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Anchors the label to the right edge of whatever icon is hovered.
  function showTip(label: string) {
    return (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setTip({ label, x: r.right + 10, y: r.top + r.height / 2 });
      setHovered(label);
    };
  }

  function hideTip() {
    setTip(null);
    setHovered(null);
  }

  return { tip, hovered, showTip, hideTip };
}
