import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lexicalFloorHit,
  decideScreen,
  gradeStops,
  CRISIS_STOP_COPY,
} from '../app/lib/crisis.ts';

// The crisis screen's decidable half.
//
// Everything here runs without a network call, which is the reason crisis.ts is
// runtime-pure: the threshold, the floor, the failure direction and the copy are
// the parts that must be right, and they are all assertable offline. The model
// call in crisis-screen.ts is not tested here; what is tested is that every
// verdict it can return, INCLUDING no verdict at all, lands somewhere defined.
//
// The ordering property (the screen runs before the tutor and before the
// transcript write) is a property of the route, and is proved by
// scripts/faultproof_crisis_screen.mjs.

// ─── The hyperbole set ───────────────────────────────────────────────────────

// NONE OF THESE MAY TRIP THE FLOOR, and this is the most important block in the
// file.
//
// A false negative is catastrophic and a false positive is recoverable, but that
// asymmetry is bounded: a screen that stops the conversation every time a
// frustrated fifteen year old types "this is killing me" teaches a class of
// students not to say how they feel to this product, which makes them less safe
// rather than more. This is ordinary teenage register about schoolwork and the
// floor must be silent on all of it.
const HYPERBOLE = [
  'this problem is killing me',
  "I'm dying",
  'I want to die',
  'i wanna die lol',
  'this is torture',
  'kill me now',
  'I could kill myself for missing that',
  'ugh I hate this so much',
  "I'm so done with this question",
  'this test is the death of me',
  'im dead',
  'i want to throw my laptop out the window',
];

test('the hyperbole set does not trip the lexical floor', () => {
  for (const message of HYPERBOLE) {
    assert.equal(lexicalFloorHit(message), false, `tripped on: ${message}`);
  }
});

// ─── The disclosure set ──────────────────────────────────────────────────────

// The floor is NOT the primary detector and is not trying to be complete. It
// catches only first person plus an explicit intent verb plus an explicit self
// referent, which is the narrowest thing that stays unambiguous with no context.
// Its job is to survive a classifier outage with reduced sensitivity rather than
// none.
const DISCLOSURE = [
  'i want to kill myself',
  'I want to kill myself',
  "I'm going to kill myself",
  'im gonna kill myself',
  'i wanna hurt myself',
  'I need to hurt myself',
  'I want to end my life',
  'i want to end it all',
  "I've been cutting myself",
  'i have been hurting myself',
  "i don't want to be alive anymore",
  'i dont want to live any more',
];

test('the floor catches unambiguous first person disclosure', () => {
  for (const message of DISCLOSURE) {
    assert.equal(lexicalFloorHit(message), true, `missed: ${message}`);
  }
});

test('the floor reads the phrase, not the words, so surrounding text is fine', () => {
  assert.equal(lexicalFloorHit('i got it wrong again and honestly i want to kill myself'), true);
  assert.equal(lexicalFloorHit('idk this is hard, i want to die, what do i do for step 2'), false);
});

// ─── The threshold ───────────────────────────────────────────────────────────

test('v1 fires on crisis alone, and concern continues to the tutor', () => {
  assert.equal(gradeStops('crisis'), true);
  assert.equal(gradeStops('concern'), false);
  assert.equal(gradeStops('none'), false);
});

// ─── The failure direction ───────────────────────────────────────────────────

test('a clean grade with a silent floor continues', () => {
  assert.deepEqual(decideScreen({ grade: 'none', floorHit: false }), { action: 'continue' });
});

test('the two detectors are OR-ed, so the floor catches what the classifier misses', () => {
  assert.deepEqual(decideScreen({ grade: 'none', floorHit: true }), {
    action: 'stop',
    detectedBy: 'lexical',
  });
});

test('the classifier decides when it can', () => {
  assert.deepEqual(decideScreen({ grade: 'crisis', floorHit: false }), {
    action: 'stop',
    detectedBy: 'classifier',
  });
});

test('a classifier that cannot answer never results in unscreened tutoring', () => {
  // The whole point. Fail open would leave the hole unprotected exactly when
  // infrastructure is degraded.
  const decision = decideScreen({ grade: null, floorHit: false });
  assert.notEqual(decision.action, 'continue');
  assert.equal(decision.action, 'unavailable');
});

test('a classifier that cannot answer does not show crisis resources on its own', () => {
  // The mirror failure. Fail closed would show 988 to every student mid-algebra
  // during a model outage.
  assert.deepEqual(decideScreen({ grade: null, floorHit: false }), { action: 'unavailable' });
});

test('on classifier failure the floor still stands', () => {
  assert.deepEqual(decideScreen({ grade: null, floorHit: true }), {
    action: 'stop',
    detectedBy: 'lexical',
  });
});

// ─── The copy ────────────────────────────────────────────────────────────────

const ALL_COPY = [
  CRISIS_STOP_COPY.opening,
  CRISIS_STOP_COPY.explanation,
  CRISIS_STOP_COPY.trusted,
  CRISIS_STOP_COPY.closing,
  ...CRISIS_STOP_COPY.resources.flatMap((r) => [r.line, r.org, ...r.actions.map((a) => a.label)]),
].join('\n');

// Three of the four exclusions are asserted. The fourth, that the copy asks no
// question, is deliberately NOT asserted: a counselor's version may legitimately
// contain a question, the test would then fail on correct copy, and someone
// would delete the test rather than think about it. The reasoning lives in a
// comment above the constant instead.

test('the copy never claims anyone was notified', () => {
  // It may not be true: a self-serve student has no teacher. And whether
  // disclosing the notification suppresses future disclosure is still open with
  // a school counselor, so this notifies silently.
  assert.doesNotMatch(ALL_COPY, /\bteacher\b/i);
  assert.doesNotMatch(ALL_COPY, /\bnotifi/i);
  assert.doesNotMatch(ALL_COPY, /\btold\b/i);
});

test('the copy does not apologise', () => {
  assert.doesNotMatch(ALL_COPY, /\bsorry\b/i);
  assert.doesNotMatch(ALL_COPY, /\bapolog/i);
});

test('the copy does not escalate emotionally', () => {
  assert.doesNotMatch(ALL_COPY, /\b(?:urgent|emergency|desperate|terribly|deeply|alarm)/i);
});

test('both numbers are tappable, and both carry their keyword in visible text', () => {
  const hrefs = CRISIS_STOP_COPY.resources.flatMap((r) => r.actions.map((a) => a.href));
  assert.ok(hrefs.includes('tel:988'), '988 must be callable in one tap');
  assert.ok(hrefs.some((h) => h.startsWith('sms:988')), '988 must be textable in one tap');
  assert.ok(hrefs.some((h) => h.startsWith('sms:741741')), '741741 must be textable in one tap');

  // The body prefill is honoured by iOS and inconsistently by Android, so the
  // keyword has to be readable regardless. This is what actually guarantees a
  // student can act.
  assert.match(ALL_COPY, /\bHOME\b/);
  assert.match(ALL_COPY, /741741/);
  assert.match(ALL_COPY, /988/);
});

test('every action href is a real dialer or messaging scheme', () => {
  for (const resource of CRISIS_STOP_COPY.resources) {
    for (const action of resource.actions) {
      assert.match(action.href, /^(?:tel:|sms:)/, `not tappable: ${action.href}`);
      assert.ok(action.label.trim().length > 0, 'every action needs a visible label');
    }
  }
});
