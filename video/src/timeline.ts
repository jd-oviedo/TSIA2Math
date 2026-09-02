// Scene order and lengths in frames at 30 fps. Offsets are derived, so a
// scene can be retimed by changing one number.
export const FPS = 30;

const ORDER = [
  ["hook", 150],
  ["dashboard", 180],
  ["invite", 150],
  ["addRoster", 210],
  ["paste", 390],
  ["codes", 330],
  ["student", 450],
  ["close", 180],
] as const;

export type SceneKey = (typeof ORDER)[number][0];

export const SCENES = (() => {
  const out = {} as Record<SceneKey, { from: number; dur: number }>;
  let from = 0;
  for (const [key, dur] of ORDER) {
    out[key] = { from, dur };
    from += dur;
  }
  return out;
})();

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, s) => a + s.dur, 0);

// Frames to export as stills for the credential check before a full render.
export const STILL_FRAMES = {
  codesTable: SCENES.codes.from + 150,
  codeEntry: SCENES.student.from + 262,
};
