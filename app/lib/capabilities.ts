// What each plan unlocks, and the one topic that is free.
//
// RUNTIME-PURE ON PURPOSE, same discipline as products.ts and crisis.ts. The
// only import is `import type`, which the type-stripping loader erases, so
// `node --test` can load this directly and fault it. That matters more here than
// usual: this file is imported by BOTH the gate in app/course/layout.tsx and the
// grading endpoint in app/api/curriculum/practice, and the whole point of it
// being one file is that those two cannot disagree about who gets in.
//
// THE BOUNDARY THIS ENCODES, which took three attempts to write down correctly
// (see the history in sql/entitlement_columns.sql section 2):
//
//   A PRACTICE PASS HOLDER NEVER LANDS ON A /course URL.
//   Practice Pass is the worksheet generator.
//   Curriculum, lessons and GUMU are Full Course.
//
// The /pricing bullets under Practice Pass ("Full practice bank across all 97
// topics", "A worked solution on every problem") read as though they contradict
// that. They do not; the pricing copy is wrong and is being fixed in the
// marketing repo. Do not re-derive the map from it.

import type { Plan } from "./products";

export type Capability =
  // The whole topic tree: lesson, practice, quiz, worked examples, completion
  // gates. There is no sub-capability and there must not be one: a split would
  // introduce a mid-topic lock, and app/lib/topic-parts.ts and TopicOverview
  // both state, deliberately, that no such lock exists.
  | "curriculum"
  // The Socratic tutor. Also reachable without a plan through the derived
  // teacher path, which is resolved in course-access.ts rather than here.
  | "gumu"
  // The worksheet generator. Not built, and not in /course.
  | "worksheets"
  // /teacher and every teacher API route.
  | "teacher-dashboard";

// Named separately so full-course is BUILT from it rather than restating it.
// "EVERYTHING IN PRACTICE PASS, PLUS" is published on the pricing page, and a
// commitment expressed as two hand-maintained lists is one edit from breaking
// silently. tests/capabilities.test.ts asserts the superset holds.
const PRACTICE_PASS: readonly Capability[] = ["worksheets"];

export const CAPABILITIES: Readonly<Record<Plan, ReadonlySet<Capability>>> = {
  "practice-pass": new Set(PRACTICE_PASS),
  "full-course": new Set([...PRACTICE_PASS, "curriculum", "gumu"]),
  "teacher-core": new Set(["teacher-dashboard", "worksheets"]),
  "teacher-pro": new Set(["teacher-dashboard", "worksheets"]),
};

// No WORKSHEET_QUOTA here, deliberately. Core and Pro differ by quota rather
// than by feature presence, but the number for "regular access" has never been
// decided and worksheets do not exist yet. Inventing a placeholder now would put
// a made-up number somewhere it could be read as settled.

// ---------------------------------------------------------------------------
// The tier label
// ---------------------------------------------------------------------------

/**
 * What a teacher's sidebar band should call their plan.
 *
 * THIS EXISTS BECAUSE BOTH RAILS WERE LYING. The teacher dashboard rendered the
 * string 'TEACHER · PRO' unconditionally, and the student rail computed its
 * badge as `role === 'teacher' && entitledTeacher`, which is ENTITLED, not PRO.
 * Every Teacher Core customer was shown the name of a product they had not
 * bought, including the first one to pay for it.
 *
 * Derived from the plan and nothing else. Entitlement decides whether a tier is
 * shown at all (an unentitled teacher keeps reading PREVIEW); it can never
 * decide WHICH tier, because that is what got this wrong in the first place.
 *
 * Returns null for a plan that names no teacher tier, so a caller has to say
 * out loud what it renders in that case rather than defaulting into a product
 * name.
 */
export function teacherTierLabel(plan: string | null | undefined): "PRO" | "CORE" | null {
  if (plan === "teacher-pro") return "PRO";
  if (plan === "teacher-core") return "CORE";
  return null;
}

export function planGrants(
  plan: string | null | undefined,
  capability: Capability
): boolean {
  if (plan == null) return false;
  return CAPABILITIES[plan as Plan]?.has(capability) ?? false;
}

// ---------------------------------------------------------------------------
// The free sample
// ---------------------------------------------------------------------------

/**
 * The one topic a signed-in visitor with no entitlement may open.
 *
 * AR.1.4 rather than QR.1.1, decided on the data rather than on taste. Read from
 * production while choosing: AR.1.4's practice is interactive with 10 items, all
 * multiple choice, all 10 carrying a misconception tag, and its mini quiz is 4
 * for 4 the same way. QR.1.1's practice is NOT interactive (which is why
 * practice/page.tsx carries a whole static branch naming it), only 3 of its 12
 * items are multiple choice, and NOTHING in the topic carries a misconception
 * tag in either section.
 *
 * A sample should show the product working normally, not one of its two
 * exceptions.
 *
 * ANONYMOUS DOES NOT GET THIS. The free topic is for signed-in free-tier users
 * only; an anonymous visitor gets the CAT engine and no curriculum at all. The
 * check in isFreeSample deliberately says nothing about sessions, because that
 * is the caller's job and conflating the two here would let a future caller
 * grant it to nobody-in-particular.
 */
export const FREE_SAMPLE = { courseId: "tsia2-math", topicId: "AR.1.4" } as const;

export function isFreeSample(courseId: string, topicId: string): boolean {
  return courseId === FREE_SAMPLE.courseId && topicId === FREE_SAMPLE.topicId;
}

/**
 * What the free sample unlocks, which is everything except GUMU.
 *
 * GUMU is the Full Course differentiator and a sample that included it would
 * give away the thing the $89 buys. This is NOT a mid-topic route lock: GUMU is
 * a panel that mounts only when the grader says so, so a free-tier student on
 * the sample lands in the behaviour the anonymous tier already has, which is the
 * correct answer inline and no panel. verify_gumu_tier.mjs already pins that
 * pairing.
 */
export function freeSampleGrants(capability: Capability): boolean {
  return capability === "curriculum";
}

// ---------------------------------------------------------------------------
// The gate's decision
// ---------------------------------------------------------------------------

/**
 * What a request may reach, once resolved.
 *
 * Lives HERE rather than next to the resolver so the decision below stays
 * loadable by `node --test`. course-access.ts imports the Supabase clients, so
 * anything in that file is unreachable from a harness; the same split as
 * products.ts against stripe-activation.ts, and crisis.ts against
 * crisis-screen.ts.
 */
export type CourseAccess = {
  /** May open any topic in the tree. */
  curriculum: boolean;
  /** May open a GUMU session. Never granted by the free sample. */
  gumu: boolean;
  /** Reached the tree as a teacher rather than as a buyer. */
  viaTeacher: boolean;
  /**
   * Whether there is a session at all.
   *
   * LOAD-BEARING, not informational. The free sample is the one exemption from
   * the plan check and it is for SIGNED-IN free-tier users only: an anonymous
   * visitor gets the CAT engine and no curriculum at all, not even the sample.
   * isFreeSample says nothing about sessions on purpose, so this is what stops
   * the exemption becoming an anonymous door into the tree.
   */
  signedIn: boolean;
};

export const NO_COURSE_ACCESS: CourseAccess = {
  curriculum: false,
  gumu: false,
  viaTeacher: false,
  signedIn: false,
};

/**
 * The gate's question, for one topic.
 *
 * The free sample is the single exemption and grants `curriculum` only, so a
 * signed-in free-tier student on it lands in the behaviour the anonymous tier
 * already has: the correct answer inline, and no GUMU panel.
 */
export function allowsTopic(
  access: CourseAccess,
  capability: Capability,
  courseId: string,
  topicId: string
): boolean {
  if (capability === "curriculum" && access.curriculum) return true;
  if (capability === "gumu" && access.gumu) return true;

  // THE SESSION CHECK IS THE POINT OF THIS LINE. Without it the exemption grants
  // the sample to anonymous visitors, which is exactly what the tiers forbid,
  // and it would do so while every "can a free-tier user open the sample" test
  // still passed.
  if (!access.signedIn) return false;

  return isFreeSample(courseId, topicId) && freeSampleGrants(capability);
}
