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
  | "teacher-dashboard"
  // The CSV exports of class data: roster, score history, misconceptions.
  //
  // THE FIRST CAPABILITY THAT SEPARATED THE TWO TEACHER TIERS, and still the
  // only one. Everything else is held identically by Core and Pro, and the note
  // under CAPABILITIES used to say the tiers differ by quota rather than by
  // feature presence. That is no longer true, and the note has been corrected
  // rather than left to rot.
  | "class-data-export"
  // Recording a student's official TSIA2A result from their College Board
  // Individual Score Report, and reading it back.
  //
  // CORE, NOT PRO, and this is the point at which "Pro is Core plus exports"
  // stopped being derivable from the shape of this list. Held by both teacher
  // tiers; held by no student plan, because a student never transcribes their
  // own official score.
  //
  // SEPARATE FROM class-data-export ON PURPOSE. Entering an official score is
  // Core. Exporting a CSV that contains it stays Pro. The same values are
  // therefore reachable under two different capabilities depending on what is
  // being done with them, which is deliberate: the tier boundary is about
  // getting data OUT in bulk, not about which teacher may record a result for
  // the student in front of them.
  | "official-scores"
  // Reading a student's curriculum progress STATUS -- per topic, and rolled up
  // over a class -- from the teacher surface.
  //
  // CORE AND PRO BOTH, following official-scores and the rule stated under
  // CAPABILITIES below: a new teacher feature is Core by default unless there is
  // a reason it is not. There is no reason here. Seeing how far your own class
  // has got through the course is what a teacher bought a dashboard for; the
  // tier boundary is bulk export, and this exports nothing.
  //
  // STATUS ONLY, NOT GRADES. What this unlocks is complete / in_progress /
  // not_started per topic and the counts derived from them. Scores, correct
  // counts and gate percentages are a separate surface and, when it lands, its
  // own decision. Do not widen this capability to cover it by assuming the name
  // already stretches that far.
  | "curriculum-progress";

// ---------------------------------------------------------------------------
// Exhaustiveness
// ---------------------------------------------------------------------------

/**
 * Every capability, as a VALUE, checked by the compiler against the type.
 *
 * WHY THIS IS NOT IN THE TEST FILE, WHICH IS WHERE IT LOOKS LIKE IT BELONGS.
 * tests/capabilities.test.ts carried a hand-written array of every capability,
 * used to assert that no plan grants anything when the plan is null. It was
 * typed `Capability[]`, which sounds like enough and is not: adding a member to
 * the type leaves a SHORT array perfectly valid, so the list silently stopped
 * being exhaustive and the test kept passing over the subset it happened to
 * name. That is precisely the failure the test existed to catch.
 *
 * Moving the assertion into the test file would not have fixed it either.
 * tsconfig.json excludes `tests`, verified by putting a deliberate type error
 * in a test file and watching `tsc --noEmit` ignore it, so any compile-time
 * check placed there can never fail a build.
 *
 * So the list lives here, where tsc does run, and the test imports it.
 *
 * Record<Capability, true> is what does the work, in both directions:
 *
 *   a member added to Capability but not here  -> TS2741, property missing
 *   a key here that is not in Capability       -> TS2353, unknown property
 *
 * The values carry no meaning. `true` is just the cheapest inhabited type; the
 * keys are the point.
 */
const CAPABILITY_PRESENCE: Record<Capability, true> = {
  curriculum: true,
  gumu: true,
  worksheets: true,
  "teacher-dashboard": true,
  "class-data-export": true,
  "official-scores": true,
  "curriculum-progress": true,
};

/**
 * Every capability, in declaration order. Derived, never hand-maintained.
 *
 * Exported for tests. Nothing in the running app iterates capabilities: the
 * gates all ask about one named capability at a time, which is the right shape
 * for a gate and the reason this had no reason to exist until a test needed it.
 */
export const ALL_CAPABILITIES: readonly Capability[] = Object.keys(
  CAPABILITY_PRESENCE
) as Capability[];

// Named separately so full-course is BUILT from it rather than restating it.
// "EVERYTHING IN PRACTICE PASS, PLUS" is published on the pricing page, and a
// commitment expressed as two hand-maintained lists is one edit from breaking
// silently. tests/capabilities.test.ts asserts the superset holds.
const PRACTICE_PASS: readonly Capability[] = ["worksheets"];

export const CAPABILITIES: Readonly<Record<Plan, ReadonlySet<Capability>>> = {
  "practice-pass": new Set(PRACTICE_PASS),
  "full-course": new Set([...PRACTICE_PASS, "curriculum", "gumu"]),
  "teacher-core": new Set([
    "teacher-dashboard",
    "worksheets",
    "official-scores",
    "curriculum-progress",
  ]),
  "teacher-pro": new Set([
    "teacher-dashboard",
    "worksheets",
    "class-data-export",
    "official-scores",
    "curriculum-progress",
  ]),
};

// CORRECTED 2026-08-21. This note used to open "Core and Pro differ by quota
// rather than by feature presence". That was true when it was written and is
// not true now: class-data-export is a feature Pro holds and Core does not, and
// it is the first of its kind. Left as a correction rather than a deletion,
// because the old sentence is quoted in design notes elsewhere and somebody
// will come looking for why it changed.
//
// EXTENDED 2026-08-23. official-scores is the first capability added since, and
// it goes to BOTH teacher tiers. So the map is no longer "Pro is Core plus one
// export": the two tiers now differ by exactly one capability out of three that
// either of them holds, and a new teacher feature is Core by default unless
// there is a reason it is not. Do not read the ordering of this list as a tier
// ladder; read CAPABILITIES, which is the only thing that decides.
//
// EXTENDED 2026-08-24. curriculum-progress is the second, and it takes the same
// route: Core by default, both tiers. class-data-export is STILL the only
// difference between the tiers, now one capability out of four rather than out
// of three, and tests/capabilities.test.ts asserts that symmetric difference
// directly rather than leaving it to be inferred from the two lists.

// ---------------------------------------------------------------------------
// The worksheet quota
// ---------------------------------------------------------------------------

/**
 * How many worksheets a plan may CREATE per calendar month.
 *
 * This block used to say, deliberately, that no WORKSHEET_QUOTA belonged here:
 * the number had never been decided, and inventing a placeholder would have put
 * a made-up figure somewhere it could be read as settled. Juan has now set it at
 * 15 for Teacher Core, so the number is real and this is where it lives.
 *
 * ONE PLAN IS CAPPED. Everything else is unlimited, which makes this map's job
 * narrower than it looks: it exists so exactly one tier's limit has a single
 * home, not so every tier can be metered.
 *
 * null MEANS "NO CAP DECLARED", AND IT IS NOT Infinity. Infinity would be the
 * obvious spelling and it is the wrong one, for a reason that only shows up at
 * the boundary: JSON.stringify(Infinity) is `null`. This value crosses to the
 * client for the usage indicator, so Infinity would silently arrive as null
 * anyway and the codebase would carry two spellings of one idea. null also
 * forces a call site to branch on it rather than doing arithmetic that happens
 * to work, and it is what a nullable column would hold.
 *
 * Record<Plan, ...> for the same reason CAPABILITIES is: a new plan does not
 * compile until it has said what its quota is. That is the whole value of the
 * map, and it is why practice-pass and full-course appear here at all -- see
 * the note on them below.
 */
export const WORKSHEET_QUOTA: Readonly<Record<Plan, number | null>> = {
  // Both student plans hold the `worksheets` capability and neither can reach a
  // worksheet today: there is no student route, and both pricing cards say
  // COMING. They are null rather than omitted so the exhaustiveness check above
  // keeps working, and null is also the right answer for when that route lands
  // -- the pricing page promises students unlimited worksheets.
  "practice-pass": null,
  "full-course": null,
  // The only capped plan in the product.
  "teacher-core": 15,
  "teacher-pro": null,
};

/**
 * The cap for a plan, or null when the plan is unlimited.
 *
 * Returns null for an unknown or absent plan too, which is safe here only
 * because this is a METER and not a gate: nothing reaches a call site of this
 * function without having already cleared requireTeacher() and profileGrants().
 * A null from here means "do not count", never "let them in".
 */
export function worksheetQuota(plan: string | null | undefined): number | null {
  if (plan == null) return null;
  return WORKSHEET_QUOTA[plan as Plan] ?? null;
}

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
