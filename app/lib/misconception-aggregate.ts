import type { SupabaseClient } from "@supabase/supabase-js";

// Type-only, so this module carries no runtime dependency on the admin client
// and stays testable against a stub. Callers pass the service-role client.
type Admin = SupabaseClient;

/**
 * One misconception, aggregated across every item that tests it.
 *
 * Before this existed the teacher dashboard grouped wrong answers by
 * `item_id + selected_answer`, so "top misconceptions" was really "top
 * item-option pairs by wrong-answer frequency": two students making the same
 * conceptual error on two different items showed as two unrelated rows, and a
 * single student making it twice counted as two affected students. Grouping on
 * the slug is what makes the count mean what the card says it means.
 */
export type AggregatedMisconception = {
  rank: number;
  /** Taxonomy slug. Stable across items — this is the grouping key. */
  misconception_tag: string;
  /**
   * Prose from one representative item, not a definition of the slug. The
   * most-selected option within the group, so the example a teacher reads is
   * the one their students actually hit most.
   */
  distractor_text: string;
  example_item_id: string;
  example_selected_answer: string;
  /** Distinct items in this population where the slug was hit. */
  item_count: number;
  /** Dominant strand and topic by response count; a slug can span both. */
  primary_strand: string;
  topic_id: string;
  topic_count: number;
  /** Total wrong selections carrying this slug. */
  frequency: number;
  /** Distinct students, counted once each however many items they hit it on. */
  affected_students: number;
};

export type MisconceptionResult = {
  misconceptions: AggregatedMisconception[];
  /**
   * True when `questions.misconception_tag` does not exist yet. The column
   * arrives with sql/questions_misconception_tag.sql; until it does, selecting
   * it is a PostgREST 42703. Reported as an empty result rather than a 500 so
   * a deploy that lands before the migration degrades to the existing empty
   * state instead of breaking the dashboard.
   */
  pendingMigration: boolean;
};

const EMPTY: MisconceptionResult = { misconceptions: [], pendingMigration: false };

function isMissingColumn(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return err.code === "42703" || /misconception_tag/i.test(err.message ?? "");
}

/** Highest count wins; ties break on the key so output is deterministic. */
function dominant(counts: Map<string, number>): string {
  let best = "";
  let bestN = -1;
  for (const [key, n] of [...counts].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (n > bestN) {
      best = key;
      bestN = n;
    }
  }
  return best;
}

/**
 * Aggregate wrong answers into misconceptions, grouped by taxonomy slug.
 *
 * @param sessionToStudent maps every session id in scope to its student, so
 *   affected_students can be a distinct count. The class view passes the whole
 *   roster; the student view passes that one student's sessions.
 */
export async function aggregateMisconceptions(
  admin: Admin,
  sessionIds: string[],
  sessionToStudent: Map<string, string>,
  limit: number
): Promise<MisconceptionResult> {
  if (sessionIds.length === 0) return EMPTY;

  const { data: responses, error: respError } = await admin
    .from("responses")
    .select("item_id, selected_answer, session_id")
    .in("session_id", sessionIds)
    .eq("is_correct", false);

  if (respError) throw new Error(respError.message);
  if (!responses || responses.length === 0) return EMPTY;

  const itemIds = [...new Set(responses.map((r) => r.item_id))];

  const { data: questions, error: qError } = await admin
    .from("questions")
    .select("item_id, primary_strand, topic_id, distractor_logic, misconception_tag")
    .in("item_id", itemIds);

  if (qError) {
    if (isMissingColumn(qError)) return { misconceptions: [], pendingMigration: true };
    throw new Error(qError.message);
  }

  const questionMap = new Map((questions ?? []).map((q) => [q.item_id, q]));

  type Group = {
    tag: string;
    frequency: number;
    students: Set<string>;
    items: Set<string>;
    topics: Map<string, number>;
    strands: Map<string, number>;
    /** `${item_id}__${option}` -> { count, text } for choosing the example. */
    options: Map<string, { count: number; text: string; itemId: string; option: string }>;
  };

  const groups = new Map<string, Group>();

  for (const r of responses) {
    const q = questionMap.get(r.item_id);
    if (!q) continue;

    // The correct option carries no tag by design, so an absent tag also
    // covers the case the old `startsWith("Correct:")` guard was written for.
    // An untagged wrong option means the item predates tagging; skipping it is
    // correct — there is no misconception to attribute it to.
    const tag = (q.misconception_tag as Record<string, string> | null)?.[r.selected_answer];
    if (!tag) continue;

    let g = groups.get(tag);
    if (!g) {
      g = {
        tag,
        frequency: 0,
        students: new Set(),
        items: new Set(),
        topics: new Map(),
        strands: new Map(),
        options: new Map(),
      };
      groups.set(tag, g);
    }

    g.frequency += 1;
    g.items.add(r.item_id);
    g.topics.set(q.topic_id, (g.topics.get(q.topic_id) ?? 0) + 1);
    g.strands.set(q.primary_strand, (g.strands.get(q.primary_strand) ?? 0) + 1);

    const studentId = sessionToStudent.get(r.session_id);
    if (studentId) g.students.add(studentId);

    const optionKey = `${r.item_id}__${r.selected_answer}`;
    const existing = g.options.get(optionKey);
    if (existing) {
      existing.count += 1;
    } else {
      g.options.set(optionKey, {
        count: 1,
        text: q.distractor_logic?.[r.selected_answer] ?? "",
        itemId: r.item_id,
        option: r.selected_answer,
      });
    }
  }

  const misconceptions = [...groups.values()]
    .sort(
      (a, b) =>
        b.frequency - a.frequency ||
        b.students.size - a.students.size ||
        a.tag.localeCompare(b.tag)
    )
    .slice(0, limit)
    .map((g, i) => {
      const example = [...g.options.values()].sort(
        (a, b) =>
          b.count - a.count ||
          a.itemId.localeCompare(b.itemId) ||
          a.option.localeCompare(b.option)
      )[0];
      return {
        rank: i + 1,
        misconception_tag: g.tag,
        distractor_text: example?.text ?? "",
        example_item_id: example?.itemId ?? "",
        example_selected_answer: example?.option ?? "",
        item_count: g.items.size,
        primary_strand: dominant(g.strands),
        topic_id: dominant(g.topics),
        topic_count: g.topics.size,
        frequency: g.frequency,
        affected_students: g.students.size,
      };
    });

  return { misconceptions, pendingMigration: false };
}
