import { test } from 'node:test';
import assert from 'node:assert/strict';
import { C, INK_MUTED, INK_DISABLED, ink } from '../app/components/curriculum-theme.ts';

// Contrast, measured against the real token values rather than re-derived by
// hand every time somebody wonders.
//
// This exists because the numbers in a comment cannot fail a build. INK_MUTED
// was introduced at 0.6 after ink(0.45) was found failing 4.5:1 on all seven
// surfaces it lands on, and the only thing stopping that recurring is a check
// that reads the token and does the arithmetic.
//
// The ratios are computed here, not pasted: pasting a table would pass against a
// token that had drifted away from it, which is the defect this replaces.

// WCAG relative luminance, then the contrast ratio between two colours.
function luminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function fromHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

// The tokens are rgba() over an opaque surface, so the thing a student's eye
// receives is the composite. Comparing the rgba string to the background
// directly would measure a colour nothing renders.
function composite(rgba: string, background: string): [number, number, number] {
  const m = rgba.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  assert.ok(m, `not an rgba() value: ${rgba}`);
  const [fr, fg, fb, alpha] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
  const bg = fromHex(background);
  return [fr, fg, fb].map((c, i) => Math.round(alpha * c + (1 - alpha) * bg[i])) as [
    number,
    number,
    number,
  ];
}

// Every surface this text is painted on. Seven, not the five on the palette
// ladder: `sand` carries answer-choice captions and `gumuSurface` carries GUMU's
// status lines, and both were failing exactly as the others were.
const SURFACES: Array<[string, string]> = [
  ['cream', C.cream],
  ['sand', C.sand],
  ['paper', C.paper],
  ['band', C.band],
  ['rail', C.rail],
  ['quietBox', C.quietBox],
  ['gumuSurface', C.gumuSurface],
];

const AA_NORMAL = 4.5;

test('INK_MUTED clears 4.5:1 on every surface it lands on', () => {
  for (const [name, background] of SURFACES) {
    const r = ratio(composite(INK_MUTED, background), fromHex(background));
    assert.ok(
      r >= AA_NORMAL,
      `INK_MUTED on ${name} (${background}) is ${r.toFixed(2)}:1, needs ${AA_NORMAL}`
    );
  }
});

// The value this replaced, kept as the control. Without it the test above would
// pass just as happily against a token that had never been broken, and would say
// nothing about whether the check could detect the defect it exists for.
test('CONTROL: the value INK_MUTED replaced fails on every one of them', () => {
  for (const [name, background] of SURFACES) {
    const r = ratio(composite(ink(0.45), background), fromHex(background));
    assert.ok(
      r < AA_NORMAL,
      `ink(0.45) on ${name} scores ${r.toFixed(2)}:1, which is not the failure this replaced`
    );
  }
});

// INK_DISABLED is exempt from 4.5:1 and must STAY exempt-looking. A disabled
// control rendered as dark as readable text reads as enabled, which costs a
// student more than a dim grey does. Asserted in the failing direction on
// purpose: if somebody "fixes" this token, this test is what tells them it was
// not broken.
test('INK_DISABLED stays quiet, and is deliberately not held to 4.5:1', () => {
  for (const [name, background] of SURFACES) {
    const r = ratio(composite(INK_DISABLED, background), fromHex(background));
    assert.ok(
      r < AA_NORMAL,
      `INK_DISABLED on ${name} is ${r.toFixed(2)}:1. If it now clears 4.5:1 it is no longer ` +
        `readable as disabled -- use INK_MUTED for text instead of raising this.`
    );
  }
});

test('the two tokens are actually different, and muted is the darker one', () => {
  assert.notEqual(INK_MUTED, INK_DISABLED);
  for (const [, background] of SURFACES) {
    const muted = ratio(composite(INK_MUTED, background), fromHex(background));
    const disabled = ratio(composite(INK_DISABLED, background), fromHex(background));
    assert.ok(muted > disabled, 'INK_MUTED must read stronger than INK_DISABLED');
  }
});

// Pins the arithmetic itself. If composite() or ratio() were wrong, every check
// above could pass while measuring nothing real.
test('the measurement agrees with known values', () => {
  // Black on white is the defined maximum, 21:1.
  assert.equal(Math.round(ratio([0, 0, 0], [255, 255, 255])), 21);
  // A colour against itself is 1:1.
  assert.equal(ratio(fromHex(C.cream), fromHex(C.cream)), 1);
  // Full alpha composites to the foreground, zero alpha to the background.
  assert.deepEqual(composite('rgba(14, 14, 17, 1)', C.paper), [14, 14, 17]);
  assert.deepEqual(composite('rgba(14, 14, 17, 0)', C.paper), fromHex(C.paper));
});
