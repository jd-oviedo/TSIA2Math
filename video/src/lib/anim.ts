// Small easing and keyframe helpers. Every scene reads its own local frame
// (scenes sit inside a Sequence), so all helpers take the frame explicitly.
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { lerpPoint, lerpRect, type Point, type Rect } from "./geometry";

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);

export const fadeIn = (frame: number, start: number, dur = 8) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clampOpts, easing: easeOut });

export const fadeOut = (frame: number, end: number, dur = 6) =>
  interpolate(frame, [end - dur, end], [1, 0], clampOpts);

export const progress = (frame: number, start: number, dur: number, easing = easeInOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clampOpts, easing });

export const between = (frame: number, from: number, to: number) => frame >= from && frame < to;

export type Keyed<T> = { frame: number; value: T };

// Piecewise interpolation through keyframes with an ease on every segment.
export function keyed<T>(frame: number, keys: Keyed<T>[], mix: (a: T, b: T, t: number) => T): T {
  if (frame <= keys[0].frame) return keys[0].value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame < b.frame) {
      const span = Math.max(1, b.frame - a.frame);
      return mix(a.value, b.value, easeInOut((frame - a.frame) / span));
    }
  }
  return keys[keys.length - 1].value;
}

export const rectAt = (frame: number, keys: Keyed<Rect>[]) => keyed(frame, keys, lerpRect);
export const pointAt = (frame: number, keys: Keyed<Point>[]) => keyed(frame, keys, lerpPoint);

// Camera helper: the focus rect (in UI pixels) the Screen should fit right now.
export const useCamera = (keys: Keyed<Rect>[]) => rectAt(useCurrentFrame(), keys);

// Typewriter. Returns the prefix of `text` visible at `frame`.
export const typed = (text: string, frame: number, start: number, framesPerChar: number) => {
  const n = Math.floor((frame - start) / framesPerChar);
  if (n <= 0) return "";
  return text.slice(0, Math.min(text.length, n));
};

// Repeating attention pulse: 0..1 progress inside each pulse window, or null.
export const pulseAt = (frame: number, starts: number[], len = 22) => {
  for (const s of starts) {
    if (frame >= s && frame < s + len) return (frame - s) / len;
  }
  return null;
};
