import { z } from "zod";
import { DEFAULT_MAX_ITEMS } from "../adaptive-test/engine";

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
