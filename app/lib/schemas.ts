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