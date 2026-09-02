import { z } from "zod";
import { DEFAULT_MAX_ITEMS } from "../adaptive-test/engine";
import { isRosterEmail, BULK_PROVISION_MAX_ROWS } from "./roster-paste";

// Item IDs follow a STRAND_TIER_NUMBER pattern (e.g. "PR_B_022"), but this
// is kept loose rather than locked to that exact shape. The real authority
// on whether an item_id is valid is the database lookup that happens right
// after parsing, in both routes — this schema only exists to reject
// obviously-garbage input fast, with a clean error message, before it ever
// reaches a query.
export const itemIdSchema = z
  .string()
  .min(1, "item_id is required")
  .max(50, "item_id is too long")
  .regex(/^[A-Za-z0-9_]+$/, "item_id contains invalid characters");

export const answerLetterSchema = z.enum(["A", "B", "C", "D"], {
  message: "selected_answer must be one of A, B, C, D",
});

// POST /api/items/reveal
export const revealBodySchema = z.object({
  item_id: itemIdSchema,
  selected_answer: answerLetterSchema,
});

export type RevealBody = z.infer<typeof revealBodySchema>;

// POST /api/sessions
const sessionResponseSchema = z.object({
  item_id: itemIdSchema,
  selected_answer: answerLetterSchema,
  elapsed_ms: z
    .number()
    .int()
    .min(0, "elapsed_ms cannot be negative")
    .max(30 * 60 * 1000, "elapsed_ms exceeds a sane per-item bound"),
});

export const sessionsBodySchema = z
  .object({
    // A real test is always exactly DEFAULT_MAX_ITEMS (20) questions per
    // the TSIA2 strand quotas, but a test can in principle complete early if
    // the item bank runs dry for a strand, so this bounds the array as a
    // sanity/DoS limit rather than enforcing an exact length.
    responses: z
      .array(sessionResponseSchema)
      .min(1, "responses cannot be empty")
      .max(DEFAULT_MAX_ITEMS, `responses cannot exceed ${DEFAULT_MAX_ITEMS} items`),
    max_items: z.number().int().min(1).max(DEFAULT_MAX_ITEMS),
    posthog_distinct_id: z.string().max(200).optional(),
  })
  .refine(
    (body) => new Set(body.responses.map((r) => r.item_id)).size === body.responses.length,
    { message: "responses contains duplicate item_id values", path: ["responses"] }
  );

export type SessionsBody = z.infer<typeof sessionsBodySchema>;

// Both routes parse JSON first (which can throw on its own), then run the
// relevant schema against the result. Centralized here so both routes
// produce the same shape of 400 response on bad input.
export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Malformed request body";
}
export const flagSchema = z.object({
  item_id: z.string().regex(/^[A-Za-z0-9_]+$/),
  category: z.enum([
    "symbols_or_math_look_wrong",
    "answer_seems_incorrect",
    "explanation_unclear_or_wrong",
    "question_has_typo_or_is_confusing",
    "other",
  ]),
  comment: z.string().max(500).optional(),
});
export const inviteSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  class_id: z.string().uuid("Must be a valid class ID"),
});

export type InviteBody = z.infer<typeof inviteSchema>;

// POST /api/teacher/provision -- "Add with code".
//
// First and last name are separate fields because the modal asks for them
// separately; they are joined into user_metadata.full_name by the provisioning
// module, since profiles has no name column. .trim() before .min(1) so a field
// of spaces is refused here rather than becoming an account named " ".
export const provisionStudentSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80, "First name is too long"),
  last_name: z.string().trim().min(1, "Last name is required").max(80, "Last name is too long"),
  email: z.string().trim().email("Must be a valid email address"),
  class_id: z.string().uuid("Must be a valid class ID"),
});

// POST /api/teacher/provision/bulk -- "Add roster", the same provisioning run
// over a pasted class. The row cap is declared in roster-paste.ts and re-exported
// here, so the preview that enforces it and the schema that rejects it read the
// same number.
export { BULK_PROVISION_MAX_ROWS } from "./roster-paste";

// THE ROW IS provisionStudentSchema WITHOUT THE CLASS, because one paste goes
// into one class and repeating the id on every row would let a malformed body
// ask for two.
//
// The email rule is overridden to the predicate the paste preview uses
// (roster-paste.ts), and that is not a style choice. zod validates the whole
// body at once, so a single address the preview called ready and .email()
// refused would 400 the entire paste, after the teacher had already been told
// every line was fine. Sharing the predicate makes that disagreement
// impossible rather than unlikely.
const rosterRowSchema = provisionStudentSchema.omit({ class_id: true }).extend({
  email: z
    .string()
    .trim()
    .max(254, "Email address is too long")
    .refine(isRosterEmail, "Must be a valid email address"),
});

export const bulkProvisionSchema = z.object({
  class_id: z.string().uuid("Must be a valid class ID"),
  students: z
    .array(rosterRowSchema)
    .min(1, "Add at least one student")
    .max(BULK_PROVISION_MAX_ROWS, `A roster cannot exceed ${BULK_PROVISION_MAX_ROWS} students`),
});

export type BulkProvisionBody = z.infer<typeof bulkProvisionSchema>;

// POST /api/curriculum/practice
// Identifies one item within a topic. As with itemIdSchema above, the real
// authority is the practice_items lookup in the route; this only rejects
// obvious garbage before it reaches a query.
export const curriculumPracticeBodySchema = z.object({
  course_id: z
    .string()
    .min(1, "course_id is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "course_id contains invalid characters"),
  topic_id: z
    .string()
    .min(1, "topic_id is required")
    .max(50)
    .regex(/^[A-Za-z0-9.]+$/, "topic_id contains invalid characters"),
  section: z.enum(["practice", "mini_quiz"], {
    message: "section must be practice or mini_quiz",
  }),
  item_number: z.number().int().min(1).max(100),
  selected_answer: answerLetterSchema,
});

export type CurriculumPracticeBody = z.infer<typeof curriculumPracticeBodySchema>;

// POST /api/gumu/session
// One endpoint, three actions, discriminated so each carries only its own
// fields: opening a session needs the item, continuing needs the transcript
// it belongs to, and the escape hatch needs neither.
const gumuStartSchema = z.object({
  action: z.literal("start"),
  course_id: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  topic_id: z.string().min(1).max(50).regex(/^[A-Za-z0-9.]+$/),
  section: z.enum(["practice", "mini_quiz"]),
  item_number: z.number().int().min(1).max(100),
  selected_answer: answerLetterSchema,
});

const gumuMessageSchema = z.object({
  action: z.literal("message"),
  session_id: z.string().uuid("session_id must be a valid session ID"),
  message: z
    .string()
    .min(1, "message cannot be empty")
    .max(2000, "message is too long"),
});

// "I'll just see the answer" — always available, never blocked.
const gumuRevealSchema = z.object({
  action: z.literal("reveal"),
  session_id: z.string().uuid("session_id must be a valid session ID"),
});

export const gumuBodySchema = z.discriminatedUnion("action", [
  gumuStartSchema,
  gumuMessageSchema,
  gumuRevealSchema,
]);

export type GumuBody = z.infer<typeof gumuBodySchema>;
// GET /api/teacher/export/{roster,scores,misconceptions}
//
// Validated off searchParams rather than a body. These are downloads: the
// browser navigates to them and the response carries a Content-Disposition
// attachment header, which a POST cannot do without JavaScript reassembling the
// file client side. Zod still does the validating, it just reads the query
// string.
//
// `classes` is either the literal "all" or a comma-separated list of class ids.
// Validating the ids here is a convenience, not the security boundary: the
// boundary is resolveOwnedClasses() in app/lib/teacher-export.ts, which proves
// the requesting teacher owns every one of them. A well-formed uuid belonging
// to someone else still gets a 403 there.
const MAX_CLASSES_PER_EXPORT = 50;

export const teacherExportQuerySchema = z
  .object({
    classes: z.string().min(1, "classes is required"),
    // Off unless explicitly asked for. Student email is a teacher-controlled
    // choice and the default has to be the private one.
    email: z.enum(["0", "1"], { message: "email must be 0 or 1" }).optional(),
  })
  .transform((q, ctx) => {
    const includeEmail = q.email === "1";

    if (q.classes === "all") {
      return { classIds: null as string[] | null, includeEmail };
    }

    const ids = [...new Set(q.classes.split(",").map((s) => s.trim()).filter(Boolean))];

    if (ids.length === 0) {
      ctx.addIssue({ code: "custom", message: "classes must be \"all\" or at least one class ID" });
      return z.NEVER;
    }
    if (ids.length > MAX_CLASSES_PER_EXPORT) {
      ctx.addIssue({ code: "custom", message: "too many classes requested" });
      return z.NEVER;
    }
    for (const id of ids) {
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
        ctx.addIssue({ code: "custom", message: "classes contains an invalid class ID" });
        return z.NEVER;
      }
    }

    return { classIds: ids as string[] | null, includeEmail };
  });

export type TeacherExportQuery = z.infer<typeof teacherExportQuerySchema>;

// ---------------------------------------------------------------------------
// Official TSIA2A score entry
// ---------------------------------------------------------------------------

const uuidSchema = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  "must be a UUID"
);

const officialLevelSchema = z
  .enum(["Basic", "Proficient", "Advanced"], {
    message: "level must be Basic, Proficient or Advanced",
  })
  .nullable()
  .default(null);

// 910 to 990, integer. The same bound as the CHECK in sql/official_scores.sql,
// stated twice on purpose: the CHECK is what makes a bad row impossible, and
// this is what turns a typo into a sentence a teacher can act on instead of a
// 500 from Postgres.
const crcScoreSchema = z
  .number({ message: "Enter the CRC score from the score report." })
  .int("The CRC score is a whole number.")
  .min(910, "The CRC score scale starts at 910.")
  .max(990, "The CRC score scale ends at 990.");

/**
 * The test date, as printed on the report.
 *
 * NOT IN THE FUTURE IS ENFORCED HERE, and it has to be, because the database
 * cannot do it. `check (test_date <= current_date)` is refused by Postgres:
 * check constraints may only call IMMUTABLE functions and current_date is
 * STABLE. sql/official_scores.sql carries an immutable sanity RANGE instead and
 * says so at the column. This is the other half of that split.
 *
 * ONE DAY OF SLACK against UTC, deliberately. The server compares to a UTC date
 * and the teacher is in US Central, which is behind it, so their "today" is
 * never ahead of the server's. A teacher further east would be, and rejecting a
 * legitimate same-day entry because of a timezone is a worse failure than
 * accepting a date one day out. The database range still catches a mistyped
 * year, which is the error this is really guarding against.
 */
const testDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD.")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), {
    message: "That is not a real date.",
  })
  .refine(
    (s) => {
      const entered = Date.parse(`${s}T00:00:00Z`);
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      return entered <= tomorrow;
    },
    { message: "The test date cannot be in the future." }
  );

const officialScoreFieldsSchema = z.object({
  official_crc_score: crcScoreSchema,
  test_date: testDateSchema,
  // Absent and null both mean "no level", which is the COMPLETE state for a
  // student who met the standard. Neither is an error and neither may be
  // coerced to 'Advanced'.
  level_qr: officialLevelSchema,
  level_ar: officialLevelSchema,
  level_gr: officialLevelSchema,
  level_pr: officialLevelSchema,
});

/**
 * Creating a row.
 *
 * `affirmed_official_report` is z.literal(true), not z.boolean(). The column is
 * a bare CHECK with no false branch, so a false here would be refused by
 * Postgres anyway; catching it in Zod is what turns that into a message rather
 * than a 500. A missing field is refused for the same reason: an unaffirmed row
 * must not be creatable by a caller that simply omits the key.
 *
 * `entered_despite_warning` is DELIBERATELY ABSENT from this schema. It is
 * computed on the server from the score and the levels, so a request that never
 * rendered the form cannot claim it was not warned.
 */
export const officialScoreCreateSchema = officialScoreFieldsSchema.extend({
  student_id: uuidSchema,
  class_id: uuidSchema,
  affirmed_official_report: z.literal(true, {
    message: "Confirm you are entering this from the student's official score report.",
  }),
});

/**
 * Correcting a row inside its window.
 *
 * The same fields, plus the row id. student_id and class_id are NOT accepted:
 * a correction fixes a transcription slip, it does not move a result onto a
 * different student, and allowing that here would make entered_by a signature
 * on something other than what was signed.
 */
export const officialScoreCorrectSchema = officialScoreFieldsSchema.extend({
  id: uuidSchema,
  affirmed_official_report: z.literal(true, {
    message: "Confirm the corrected values come from the official score report.",
  }),
});

export const officialScoreDeleteSchema = z.object({ id: uuidSchema });

export type OfficialScoreCreate = z.infer<typeof officialScoreCreateSchema>;
export type OfficialScoreCorrect = z.infer<typeof officialScoreCorrectSchema>;

// ---------------------------------------------------------------------------
// Assignments
//
// POST /api/teacher/assignments. Build 4a: the first teacher WRITE in the
// curriculum arc, and the first request body that can name other people.
//
// A DISCRIMINATED UNION, NOT ONE OBJECT WITH OPTIONAL FIELDS, and that is the
// whole design of this schema. `student_ids` is not merely optional on a
// class-target assignment -- it is meaningless on one, and an object schema
// with an optional array would accept
//
//   { target_type: 'class', student_ids: [<somebody else's uuid>] }
//
// and hand the route a body it has to remember to ignore. Here that request does
// not parse at all: the 'class' branch declares no such key, so the shape is
// refused before any handler logic runs. Same reason gumuBodySchema above is a
// union rather than one object with three optional halves.
//
// WHAT IS DELIBERATELY ABSENT: created_by. It is written on the server from the
// session profile, exactly as entered_despite_warning is computed there rather
// than accepted -- see the note on officialScoreCreateSchema. A request that
// could name its own author could sign an assignment as another teacher.
// ---------------------------------------------------------------------------

/**
 * The due date, or none at all.
 *
 * NULL IS A REAL AND COMMON STATE, not missing data: "work through this topic,
 * no deadline" is a thing teachers set. So null is accepted, undefined defaults
 * to null, and neither is an error.
 *
 * THE RANGE IS THE OTHER HALF OF A SPLIT THE DATABASE FORCED. sql/assignments.sql
 * A1 carries `check (due_at is null or due_at between '2021-01-01' and
 * '2100-01-01')` and cannot carry anything tighter: check constraints may only
 * call IMMUTABLE functions, now() is STABLE, and the create table fails with
 * 42P17. So the database catches a mistyped year and anything time-relative
 * lives here. Same split as testDateSchema above, stated at
 * sql/official_scores.sql:110-121.
 *
 * A PAST due date is ACCEPTED on purpose. A teacher setting Friday's work on
 * Saturday morning, or backfilling what was already assigned on paper, is
 * ordinary; the tracker renders it overdue, which is the honest answer. Refusing
 * it would be the schema inventing a workflow rule.
 */
const dueAtSchema = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: "That is not a real date." })
  .refine(
    (s) => {
      const at = Date.parse(s);
      return (
        at >= Date.parse("2021-01-01T00:00:00Z") && at <= Date.parse("2100-01-01T00:00:00Z")
      );
    },
    { message: "That due date is not in a sensible range." }
  )
  .nullable()
  .default(null);

// The pair that identifies a topic, patterned exactly as
// curriculumPracticeBodySchema above patterns them, and for the same stated
// reason: this rejects obvious garbage fast with a clean message. The real
// authority on whether a topic is ASSIGNABLE is isAssignableTopic() in the
// route, which additionally refuses placeholders -- a well-formed id for a
// "Coming soon" topic passes this and is refused there.
const assignmentTopicFields = {
  class_id: uuidSchema,
  course_id: z
    .string()
    .min(1, "course_id is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "course_id contains invalid characters"),
  // HYPHENS ARE ALLOWED HERE AND ARE NOT ALLOWED BY curriculumPracticeBodySchema
  // ABOVE, and the difference is deliberate rather than drift.
  //
  // Real topic ids look like "QR.3.5". PLACEHOLDER ids do not: production
  // carries AR.COMING-SOON, GR.COMING-SOON and PR.COMING-SOON. If this pattern
  // refused a hyphen, a request naming a placeholder would be rejected HERE, as
  // a malformed id, and isAssignableTopic() -- the thing that actually
  // implements "a teacher cannot assign a topic that is still being written" --
  // would never run for the only ids that test it.
  //
  // That is the difference between a rule and a coincidence. The placeholder
  // ruling would appear to hold while resting entirely on how somebody happened
  // to name three rows, and would break silently the first time a placeholder
  // was named without a hyphen. So the shape check is widened to let those ids
  // through to the check that is supposed to refuse them, and
  // scripts/faultproof_assignments.mjs W5 proves the refusal by deleting the
  // is_placeholder filter and watching a "Coming soon" topic become assignable.
  topic_id: z
    .string()
    .min(1, "topic_id is required")
    .max(50)
    .regex(/^[A-Za-z0-9.-]+$/, "topic_id contains invalid characters"),
  due_at: dueAtSchema,
};

/**
 * The whole class.
 *
 * NO STUDENT LIST, AND NO WAY TO SEND ONE. The target is resolved live against
 * active enrolments every time the tracker is read, so a student who joins next
 * week is included and a removed student drops out without anything stored
 * changing. That is why this branch carries no ids: there is nothing to store.
 */
const assignmentClassTargetSchema = z.object({
  ...assignmentTopicFields,
  target_type: z.literal("class"),
});

/**
 * A named set of students: one for an individual, N for an ad-hoc subset.
 *
 * ONE SHAPE COVERS BOTH, deliberately. There is no group entity in this product
 * and a "assign to one student" branch would be a second code path that agrees
 * with this one until it does not.
 *
 * THE ARRAY IS BOUNDED AND DEDUPLICATED HERE, and neither is cosmetic. The bound
 * is a sanity limit far past any real class, matching how sessionsBodySchema
 * bounds `responses`. The duplicate check exists because assignment_students has
 * a composite primary key, so a repeated id would make the whole insert fail
 * with 23505 and be reported to the teacher as a duplicate ASSIGNMENT, which is
 * a different and confusing error. Same refine, same reason, as the duplicate
 * item_id check on sessionsBodySchema.
 *
 * EVERY ID IS STILL UNVERIFIED AFTER THIS SCHEMA PASSES. A well-formed uuid
 * belonging to a student in another teacher's class parses perfectly. Membership
 * is proved in the route against activeStudentIds() before a row is written, and
 * that check -- not this one -- is the tenant boundary on the write path.
 */
const assignmentStudentTargetSchema = z.object({
  ...assignmentTopicFields,
  target_type: z.literal("student"),
  student_ids: z
    .array(uuidSchema)
    .min(1, "Select at least one student.")
    .max(200, "That is more students than a class can hold.")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "student_ids contains the same student twice",
    }),
});

export const assignmentCreateSchema = z.discriminatedUnion("target_type", [
  assignmentClassTargetSchema,
  assignmentStudentTargetSchema,
]);

export type AssignmentCreate = z.infer<typeof assignmentCreateSchema>;

/** Removing one. Id only: an assignment is not edited in Build 4a. */
export const assignmentDeleteSchema = z.object({ id: uuidSchema });
