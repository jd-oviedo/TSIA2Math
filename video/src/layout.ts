// Two aspect ratios share every scene. The layout tells a scene where the
// screen viewport sits, where captions go, and how big type should be.
import type { Rect } from "./lib/geometry";

export type Orientation = "landscape" | "portrait";

export type Layout = {
  orientation: Orientation;
  width: number;
  height: number;
  screen: Rect;
  caption: { x: number; y: number; w: number };
  captionSize: number;
  chipSize: number;
  hookSize: number;
  titleSize: number;
  subSize: number;
  wordmarkWidth: number;
};

export const LAYOUTS: Record<Orientation, Layout> = {
  landscape: {
    orientation: "landscape",
    width: 1920,
    height: 1080,
    screen: { x: 0, y: 0, w: 1920, h: 870 },
    caption: { x: 80, y: 902, w: 1760 },
    captionSize: 48,
    chipSize: 19,
    hookSize: 96,
    titleSize: 84,
    subSize: 34,
    wordmarkWidth: 440,
  },
  portrait: {
    orientation: "portrait",
    width: 1080,
    height: 1920,
    screen: { x: 0, y: 520, w: 1080, h: 1320 },
    caption: { x: 70, y: 150, w: 940 },
    captionSize: 64,
    chipSize: 24,
    hookSize: 104,
    titleSize: 92,
    subSize: 38,
    wordmarkWidth: 420,
  },
};
