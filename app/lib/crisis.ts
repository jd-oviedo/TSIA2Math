// The crisis screen: everything about it that can be decided without a network
// call.
//
// THIS IS THE FLOOR, NOT THE FINISHED THING.
//
// GUMU shipped with no crisis handling of any kind. The only prompt instruction
// covering a student in difficulty tells the model to keep tutoring
// (gumu.ts:22), nothing looked at what a student typed, and none of the four
// session statuses could represent a conversation that stopped being about
// math. This closes that, at the minimum shape that is defensible. Three
// questions are still open with a school counselor and are marked [COUNSELOR]
// where they bite. See gumu-crisis-screen-design.md.
//
// RUNTIME-PURE ON PURPOSE, same discipline as products.ts. This file has no
// imports at all, so `node --test` can load it directly and fault it. The one
// thing that needs the network, the classifier call, lives in crisis-screen.ts,
// so that everything decidable stays decidable in a harness.

export type CrisisGrade = "none" | "concern" | "crisis";

// v1 fires on `crisis` alone.
//
// `concern` exists so the classifier reports at full resolution from day one and
// adding a gentler middle tier later is a code change rather than a
// reclassification. Whether that tier should exist, and what it would do, is
// [COUNSELOR]. Until then a `concern` message continues to the tutor, which is
// the pre-existing behaviour and is deliberately not being widened on a guess:
// firing the 988 card at a student who said they are stressed about a test is
// the false positive that teaches a class not to talk to this product.
const STOPPING_GRADES: ReadonlySet<CrisisGrade> = new Set<CrisisGrade>(["crisis"]);

export function gradeStops(grade: CrisisGrade): boolean {
  return STOPPING_GRADES.has(grade);
}

// ---------------------------------------------------------------------------
// The lexical floor
// ---------------------------------------------------------------------------

// DELIBERATELY NARROW, AND NOT A KEYWORD FILTER.
//
// This is not the primary detector and must not be widened into one. The
// classifier is the primary, because the distinction that actually decides
// whether this feature is tolerable is hyperbole versus disclosure, and that
// needs context a pattern cannot see. A frustrated fifteen year old on question
// seven types "this is killing me" and "I want to die" and means neither, and a
// screen that stops the conversation every time teaches them not to say how they
// feel here. That is an anti-safety outcome produced by a safety feature.
//
// So the entire die / dying / kill me family is ABSENT ON PURPOSE. Every pattern
// below requires the first person, an explicit intent verb, and an explicit self
// referent, which is the narrowest thing that is still unambiguous without
// context. Anything looser belongs to the classifier.
//
// What this floor is FOR: surviving a classifier outage with reduced sensitivity
// rather than none. See decideScreen.
const FLOOR_PATTERNS: readonly RegExp[] = [
  /\bi\s+(?:(?:want|need)\s+to|wanna)\s+(?:kill|hurt|harm)\s+myself\b/i,
  /\bi(?:'?m| am)?\s*(?:going to|gonna)\s+(?:kill|hurt|harm)\s+myself\b/i,
  /\bi\s+(?:want\s+to|wanna)\s+end\s+(?:my life|it all)\b/i,
  /\bi(?:'?m| am)?\s*(?:going to|gonna)\s+end\s+(?:my life|it all)\b/i,
  /\bi(?:'ve| have)\s+been\s+(?:hurting|cutting)\s+myself\b/i,
  /\bi\s+(?:don'?t|do not)\s+want\s+to\s+(?:be alive|live)(?:\s+any\s?more)?\b/i,
];

export function lexicalFloorHit(message: string): boolean {
  return FLOOR_PATTERNS.some((pattern) => pattern.test(message));
}

// ---------------------------------------------------------------------------
// The decision
// ---------------------------------------------------------------------------

export type ScreenInput = {
  /** Null when the classifier could not produce a verdict: error, refusal, or
   *  a malformed response. A refusal is a FAILURE, not a hit: inferring a
   *  disclosure from the model declining is guessing. */
  grade: CrisisGrade | null;
  floorHit: boolean;
};

export type ScreenDecision =
  | { action: "continue" }
  | { action: "stop"; detectedBy: "classifier" | "lexical" }
  /** Neither detector could speak. The turn is refused rather than tutored. */
  | { action: "unavailable" };

/**
 * WHICH WAY THIS FAILS, which is the part that is not obvious.
 *
 * safeLimit fails OPEN for rate limiting and says why: rate limiting is
 * auxiliary and 500ing every request because Redis hiccuped is worse than
 * briefly having none. Neither that reasoning nor its opposite transfers here.
 *
 *   fail open  (classifier down, tutor anyway)  the protection is absent exactly
 *                                               when infrastructure is degraded,
 *                                               which is the hole being closed
 *   fail closed (classifier down, show 988)     a model outage shows crisis
 *                                               resources to every student
 *                                               mid-algebra, at full scale
 *
 * So the failure direction is a third thing: NEVER TUTOR AN UNSCREENED MESSAGE,
 * and NEVER SHOW CRISIS RESOURCES ON AN INFRASTRUCTURE ERROR. On classifier
 * failure the floor's verdict stands if it fired; if it did not, the turn is
 * refused with the 503 the route already returns for a model outage, which says
 * nothing about why and costs the student neither a turn nor a stored message.
 *
 * The two detectors are OR'd on the healthy path. The floor is narrow enough
 * that its contribution to false positives is small, and a disclosure the
 * classifier misses is exactly what it is there for.
 */
export function decideScreen({ grade, floorHit }: ScreenInput): ScreenDecision {
  if (grade === null) {
    if (floorHit) return { action: "stop", detectedBy: "lexical" };
    return { action: "unavailable" };
  }
  if (gradeStops(grade)) return { action: "stop", detectedBy: "classifier" };
  if (floorHit) return { action: "stop", detectedBy: "lexical" };
  return { action: "continue" };
}

// ---------------------------------------------------------------------------
// What the student sees
// ---------------------------------------------------------------------------

export type CrisisAction = { label: string; href: string };
export type CrisisResource = { line: string; org: string; actions: CrisisAction[] };

/**
 * [PLACEHOLDER, COUNSELOR]
 *
 * Every string below is a draft awaiting a school counselor's version. It is one
 * constant so that replacing it is an edit to these literals and not a change to
 * any logic, markup, or route.
 *
 * FOUR THINGS THIS DRAFT DELIBERATELY DOES NOT DO. They are not oversights and
 * they should survive an edit:
 *
 *  1. It asks no question. GUMU has stopped. A question implies something is
 *     still listening, and nothing will read the answer. (No test asserts the
 *     absence of a question mark: a counselor's version may legitimately contain
 *     one, that test would fail on correct copy, and someone would delete the
 *     test rather than think about it. This comment is the record instead.)
 *  2. It does not say a teacher was notified. It may not be true, since a
 *     self-serve student has no teacher, and whether disclosing the
 *     notification suppresses future disclosure is [COUNSELOR]. Notify silently
 *     for now.
 *  3. It does not apologise and does not escalate emotionally. Calm and short.
 *  4. It reads correctly for a false positive AND a real disclosure in the same
 *     sentences. A student who typed "this problem is killing me" reads it and
 *     shrugs; a student who meant it reads it and feels seen. That dual read is
 *     the point, because the classifier will sometimes be wrong.
 *
 * Items 2, 3 and 4 are asserted in tests/crisis.test.ts.
 */
export const CRISIS_STOP_COPY = {
  opening: "Let's pause the math for a second.",

  explanation:
    "What you said sounds like it might be about something bigger than this " +
    "problem, and I'm not the right kind of help for that. There are people you " +
    "can talk to right now, any time, free:",

  // Both numbers must be reachable in one tap on a phone, which is where most
  // students are. The `body=HOME` prefill is honoured by iOS and inconsistently
  // by Android handsets, so the keyword is also in the VISIBLE line: that, not
  // the prefill, is what guarantees a student can act.
  resources: [
    {
      line: "Call or text 988",
      org: "Suicide and Crisis Lifeline",
      actions: [
        { label: "Call 988", href: "tel:988" },
        { label: "Text 988", href: "sms:988" },
      ],
    },
    {
      line: "Text HOME to 741741",
      org: "Crisis Text Line",
      actions: [{ label: "Text HOME to 741741", href: "sms:741741?&body=HOME" }],
    },
  ] as CrisisResource[],

  trusted: "If you're with someone you trust, talking to them is a good move too.",

  // [COUNSELOR] Whether closing is right at all, or whether the student should
  // be able to come back and keep working, is on the open list. Mechanically
  // they can already reopen: gumu_sessions_one_active_per_item is partial on
  // status = 'active', so ending the session frees the slot, and every message
  // is screened again anyway. So this is a care question, not a safety one.
  closing: "This session is closed. Your progress is saved and the math will still be here.",
} as const;
