'use client';

import { L } from '../login/login-theme';
import { FONT_MONO } from '../login/login-theme';

// Where you are in the five step teacher onboarding flow.
//
// SLIM AND LIGHT, WHICH IS THE WHOLE BRIEF. It is a row of five 3px segments and
// a mono label, sitting on the page ground. It is deliberately NOT a rail, a
// sidebar, or anything with its own surface: the flow already has one dark
// element too many in its history, and progress is a caption on this screen
// rather than furniture around it.
//
// The filled segments are L.cta, Sunset Orange, which is a MARKER role and
// allowed. The label beside them is L.inkMono and never orange, which is the
// standing rule on this palette: orange is a fill, a rule or a marker, never
// type.
//
// The unfilled segments use L.barLine rather than a lower alpha of the fill, so
// the track reads as the same hairline family as every other rule on these
// screens.

/** The flow, in order. Kept here so the denominator has one definition and a
 *  screen cannot claim to be step 2 of 4. */
export const ONBOARDING_STEPS = 5;

// `className` exists for exactly one caller: the shared motion system's
// .um-fade-up. It is a pass-through and not a styling hook -- the indicator's
// own look stays entirely in the inline styles below, so a caller cannot
// restyle it by handing it a class.
//
// A className rather than a wrapper <div> because this component is a direct
// child of a .um-stagger container on both /start and /start/access, and the
// stagger's delay rules select DIRECT children only. A wrapper would still
// work, but it would put a layout-neutral box between the container and the
// element that actually animates for no reason. There is no uml-lift here and
// nothing inside this component transforms, so entrance and hover cannot land
// on the same node.
export function StepIndicator({
  step,
  label,
  className,
}: {
  step: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 9 }}
      role="group"
      aria-label={`Step ${step} of ${ONBOARDING_STEPS}${label ? `: ${label}` : ''}`}
    >
      <div aria-hidden style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: ONBOARDING_STEPS }, (_, i) => (
          <span
            key={i}
            style={{
              height: 3,
              width: 26,
              background: i < step ? L.cta : L.barLine,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <span
        style={{
          font: `400 11px/1 ${FONT_MONO}`,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: L.inkMono,
        }}
      >
        {`Step ${step} of ${ONBOARDING_STEPS}${label ? ` · ${label}` : ''}`}
      </span>
    </div>
  );
}
