import { createAdminClient } from './supabase-admin';
import { createClient } from './supabase-server';
import {
  renderInlineWithMath,
  renderMarkdownWithMath,
  extractDistractorProse,
} from '@/lib/curriculum-utils';
import {
  countTopicPool,
  isPrintable,
  itemKey,
  mergePools,
  type Candidate,
  type ItemRef,
  type Section,
} from './worksheet-select';

// Where worksheet questions come from.
//
// ONE ABSTRACTION, TWO BACKENDS. getItemsForTopic() answers "what can this topic
// contribute to a worksheet" without the caller learning which store answered:
//
//   curriculum_item_instances   for the items of that topic that are templated
//   curriculum_topics.practice_items   for every other item
//
// Per ITEM, not per topic. A templated topic mixes the two: rolled instances for
// the items that carry a template, authored numbers for the items deliberately
// marked "template": "static". See getItemsForTopic.
//
// Today exactly one topic of 97 takes the first branch (QR.3.5, 14 templates and
// 26,186 instances) and 96 take the second. That ratio is the whole reason the
// abstraction exists rather than a static-only path: when a topic is templated
// later, its pool deepens and Version A/B becomes possible for it with no change
// above this file, and nothing stored in worksheets.items has to be migrated.
//
//
// THE TWO DATA PATHS ARE SEPARATE AND MUST STAY THAT WAY
//
//   Building and printing a worksheet -> curriculum_topics_public, the redacted
//   view. Stems and choices only. jsonb_strip_keys has already removed
//   correct_answer and misconception_tag from practice_items, so there is no
//   answer in the response to leak even by accident.
//
//   The answer key -> curriculum_topics, the base table, through the admin
//   client, server-side, after requireTeacher(). This is the ONLY path in the
//   codebase that reads correct_answer, distractor_prose or worked_solutions for
//   a worksheet.
//
// They are not collapsed into one base-table query with a redaction step in
// TypeScript. The redaction is in the view, in SQL, where it cannot be forgotten
// by a future caller adding one more field to a select list. Every function
// below is named for which path it belongs to.
//
// ONE POOL ENTRY PER TEMPLATE, NOT PER INSTANCE
//
// A templated topic has thousands of instances but they are variants of 14
// questions. Offering all 26,186 as candidates would let one worksheet draw two
// rolls of the same template -- the same question with different numbers,
// printed twice, which reads as a mistake. So a templated topic contributes one
// live instance per template: the same 14 candidates a static topic offers, and
// a different 14 next time. The depth shows up ACROSS worksheets, which is where
// a teacher wants it.

export type PickerTopic = {
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
  related_strand: string;
  estimated_time_minutes: number | null;
  /** Gradeable questions available. Counted by format, never by array length. */
  available: number;
  /** Of those, how many carry a difficulty band. */
  levelled: number;
  /** True when this topic's pool is rolled rather than hand-authored. */
  templated: boolean;
};

type StoredItem = {
  item_number: number;
  format?: string | null;
  stem?: string | null;
  choices?: Record<string, string> | null;
  correct_answer?: string | null;
  level?: string | null;
};

type PracticeItems = {
  practice?: { items?: StoredItem[] } | null;
  mini_quiz?: { items?: StoredItem[] } | null;
};

type PickerRow = {
  topic_id: string;
  topic_name: string | null;
  unit_number: number | null;
  sequence_in_unit: number | null;
  related_strand: string | null;
  estimated_time_minutes: number | null;
  practice_items: PracticeItems | null;
  is_placeholder: boolean | null;
};

const SECTIONS: Section[] = ['practice', 'mini_quiz'];

// ─── The picker ─────────────────────────────────────────────────────────────

/**
 * Every topic a teacher may put on a worksheet, with its real question count.
 *
 * PUBLIC PATH. Reads curriculum_topics_public through the anon-capable server
 * client, exactly as a student page would. The picker needs no answer and so is
 * given no access to one.
 *
 * Placeholders are excluded here rather than in the UI. There are 100 rows in
 * curriculum_topics: 97 real topics and 3 content-free COMING-SOON rows (one
 * each for AR, GR and PR, all unit 1, all with practice_items = '{}'). They
 * exist so the recommendation engine always has a topic to route to per strand.
 * On a worksheet picker they would render as selectable topics offering zero
 * questions, so they are filtered at the source -- a UI-level filter would have
 * to be repeated by every future caller.
 */
export async function listPickerTopics(courseId: string): Promise<PickerTopic[]> {
  const supabase = await createClient();
  // One string literal, not a concatenation: supabase-js infers the row type
  // from the select text at compile time, and anything it cannot read as a
  // literal degrades the result to GenericStringError.
  const { data, error } = await supabase
    .from('curriculum_topics_public')
    .select('topic_id, topic_name, unit_number, sequence_in_unit, related_strand, estimated_time_minutes, practice_items, is_placeholder')
    .eq('course_id', courseId)
    .eq('is_placeholder', false)
    .overrideTypes<PickerRow[], { merge: false }>();

  if (error || !data) return [];

  const templated = await templatedTopicIds(courseId);

  const rows: PickerTopic[] = data.map((row) => {
    // countTopicPool applies isPrintable, the same predicate drawFromStatic
    // uses. Counting here with isGradeable is what made every badge read 0:
    // this row came from curriculum_topics_public, which strips correct_answer.
    const { available, levelled } = countTopicPool(row.practice_items);
    return {
      topic_id: row.topic_id,
      topic_name: row.topic_name ?? row.topic_id,
      unit_number: row.unit_number ?? 0,
      sequence_in_unit: row.sequence_in_unit ?? 0,
      related_strand: row.related_strand ?? '',
      estimated_time_minutes: row.estimated_time_minutes ?? null,
      available,
      levelled,
      templated: templated.has(row.topic_id),
    };
  });

  // SCHEMA FACT 2: sort on sequence_in_unit, never on topic_id.
  //
  // Topic ids do not track unit numbers -- QR.3.8 is in unit 0, QR.3.1 in unit
  // 1, QR.3.2 in unit 2 -- so an id sort scrambles the teaching order inside
  // three of the six units. Measured against the source: units 0, 2 and 4 all
  // order differently by id than by sequence. topic_id is the final tiebreak
  // only, so the order is total and the list never reshuffles between renders.
  return rows.sort(
    (a, b) =>
      a.unit_number - b.unit_number ||
      a.sequence_in_unit - b.sequence_in_unit ||
      a.topic_id.localeCompare(b.topic_id),
  );
}

// ─── Which topics are templated ─────────────────────────────────────────────

type TemplateRow = { id: string; topic_id: string; section: string; item_number: number; verified_param_sets: number | null };

/**
 * Templates for a course, keyed by topic. Admin client: curriculum_item_templates
 * holds zero grants for the API roles, by design -- the template object carries
 * correct_answer and the misconception map.
 *
 * Only the item KEY and the row id are selected, never the template body. This
 * function decides which backend a topic uses; it has no business reading an
 * answer, and not selecting the column is a stronger guarantee than not using it.
 */
async function templatesByTopic(courseId: string): Promise<Map<string, TemplateRow[]>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('curriculum_item_templates')
    .select('id, topic_id, section, item_number, verified_param_sets')
    .eq('course_id', courseId);

  const byTopic = new Map<string, TemplateRow[]>();
  if (error || !data) return byTopic;
  for (const row of data as TemplateRow[]) {
    const list = byTopic.get(row.topic_id) ?? [];
    list.push(row);
    byTopic.set(row.topic_id, list);
  }
  return byTopic;
}

async function templatedTopicIds(courseId: string): Promise<Set<string>> {
  return new Set((await templatesByTopic(courseId)).keys());
}

// ─── The abstraction ────────────────────────────────────────────────────────

/**
 * Candidate questions this topic can contribute, from whichever backend it has.
 *
 * `count` is a hint, not a contract: it bounds how much the instance path
 * fetches. The caller does the actual drawing in worksheet-select.ts, which is
 * where the difficulty filter and the no-duplicates rule live.
 *
 * Returns [] for an unknown or content-free topic rather than throwing. A
 * worksheet with one bad topic id should lose that topic, not fail to build.
 */
export async function getItemsForTopic(
  courseId: string,
  topicId: string,
  count: number,
  options: { seed: number },
): Promise<Candidate[]> {
  const templates = (await templatesByTopic(courseId)).get(topicId);

  // 96 of 97 topics. Nothing templated, nothing to merge.
  if (!templates || templates.length === 0) return drawFromStatic(courseId, topicId);

  // MIXED POOL. A templated topic is no longer all-or-nothing.
  //
  // The two backends compose per item: a rolled instance where one exists, the
  // authored numbers everywhere else. The rule itself is mergePools() in
  // worksheet-select.ts, which is runtime-pure and faulted directly; this
  // function's job is only to fetch both sides.
  //
  // Inferring "authored" as "not rolled" is safe because of what the verifier
  // refuses to let through: a multiple-choice item with NO template key is a
  // hard failure there, so the only items that can reach production without a
  // template row are the ones an author deliberately marked
  // `"template": "static"`. An item nobody has considered cannot ship by
  // omission -- see load_curriculum in scripts/verify_templates.py.
  const [{ candidates: rolled, served }, authored] = await Promise.all([
    rollFromInstances(topicId, templates, options.seed),
    drawFromStatic(courseId, topicId),
  ]);

  return mergePools(rolled, authored, served);
}

/**
 * STATIC BACKEND. Reads the redacted public view.
 *
 * Eligibility is decided by isPrintable() -- format and a populated choice map,
 * per item, never by array length. NOT isGradeable(): this row came from
 * curriculum_topics_public, which strips correct_answer, so the stricter
 * predicate matches nothing here. See schema fact 1 and QR.1.1.
 */
// No count parameter: the static pool is at most 14 items, so it is returned
// whole and worksheet-select.ts does the drawing. The instance path takes a
// count because its pool is unbounded and has to be sampled at the query.
async function drawFromStatic(
  courseId: string,
  topicId: string,
): Promise<Candidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('curriculum_topics_public')
    .select('practice_items')
    .eq('course_id', courseId)
    .eq('topic_id', topicId)
    .maybeSingle();

  if (error || !data) return [];

  // isPrintable, the same predicate the picker counts with. This used to be
  // open-coded here -- the same rule written twice, which is how it came to
  // disagree with the badge in the first place.
  const items = (data.practice_items ?? {}) as PracticeItems;
  const out: Candidate[] = [];
  for (const section of SECTIONS) {
    for (const item of items[section]?.items ?? []) {
      if (!isPrintable(item)) continue;
      out.push({
        ref: { source: 'static', topic_id: topicId, section, item_number: item.item_number },
        level: (item.level as Candidate['level']) ?? null,
        section,
      });
    }
  }
  return out;
}

/**
 * INSTANCE BACKEND. One live instance per template.
 *
 * The offset is derived from the seed and bounded by verified_param_sets, which
 * the template row already carries -- so picking a variant costs no COUNT query.
 * Ordering by param_hash makes the sequence stable but effectively arbitrary,
 * which is exactly what a variant picker wants: the same seed reproduces the
 * same sheet, a different seed gives genuinely different numbers.
 *
 * `retired_at is null` is the rollable filter. A retired instance stays
 * resolvable for worksheets that already reference it and is never drawn again.
 */
async function rollFromInstances(
  topicId: string,
  templates: TemplateRow[],
  seed: number,
): Promise<{ candidates: Candidate[]; served: Set<string> }> {
  const admin = createAdminClient();
  const out: Candidate[] = [];
  // Which items this roll actually answered for. Not the same as "which items
  // have a template": a template whose every instance has been retired answers
  // for nothing, and its authored item has to come back into the pool. See
  // mergePools.
  const served = new Set<string>();

  await Promise.all(
    templates.map(async (tpl, i) => {
      const pool = Math.max(1, tpl.verified_param_sets ?? 1);
      const offset = Math.abs((seed + i * 7919) % pool);
      const { data } = await admin
        .from('curriculum_item_instances')
        .select('id')
        .eq('template_id', tpl.id)
        .is('retired_at', null)
        .order('param_hash', { ascending: true })
        .range(offset, offset);

      // verified_param_sets can overstate the live count once instances have
      // been retired, which lands the offset past the end and returns nothing.
      // Retry at the start rather than dropping the item off the worksheet.
      let row = data?.[0];
      if (!row) {
        const { data: first } = await admin
          .from('curriculum_item_instances')
          .select('id')
          .eq('template_id', tpl.id)
          .is('retired_at', null)
          .order('param_hash', { ascending: true })
          .limit(1);
        row = first?.[0];
      }
      if (!row) return;

      served.add(itemKey((tpl.section as Section) ?? 'practice', tpl.item_number));
      out.push({
        ref: { source: 'instance', topic_id: topicId, instance_id: row.id as string },
        // curriculum_item_instances has no level column, so a rolled item can
        // never satisfy a difficulty filter. Reported in the builder rather than
        // silently narrowing the pool -- see the note in the picker.
        level: null,
        section: (tpl.section as Section) ?? 'practice',
      });
    }),
  );

  return { candidates: out, served };
}

// ─── Resolving stored references ────────────────────────────────────────────

export type PrintItem = {
  ref: ItemRef;
  topic_id: string;
  stem_html: string;
  choices_html: Record<string, string>;
};

export type KeyItem = PrintItem & {
  correct_answer: string;
  /** Rendered worked solution, or null when the topic has none stored. */
  solution_html: string | null;
  /** Teacher-facing note per option letter, already unwrapped. */
  notes: { letter: string; text: string; correct: boolean }[];
};

/**
 * WORKSHEET PATH. Resolve stored references to printable questions, no answers.
 *
 * Reads curriculum_topics_public for the static refs and
 * curriculum_item_instances for the rolled ones. The instance table has no
 * public view, so that half necessarily goes through the admin client -- and
 * `correct_answer` is deliberately absent from the select list. That is the one
 * place on this path where an answer is reachable, and the narrow select is what
 * keeps it out of the response.
 *
 * Order is preserved exactly as stored: the worksheet a teacher printed on
 * Monday must be the worksheet she reprints on Friday.
 */
export async function resolveForPrint(
  courseId: string,
  refs: ItemRef[],
): Promise<PrintItem[]> {
  const staticByTopic = await loadStaticItems(courseId, refs, { withAnswers: false });
  const instances = await loadInstances(refs, { withAnswers: false });

  const out: PrintItem[] = [];
  for (const ref of refs) {
    if (ref.source === 'static') {
      const item = staticByTopic.get(`${ref.topic_id}/${ref.section}/${ref.item_number}`);
      if (!item) continue;
      out.push({
        ref,
        topic_id: ref.topic_id,
        stem_html: renderInlineWithMath(item.stem ?? ''),
        choices_html: renderChoices(item.choices),
      });
    } else {
      const row = instances.get(ref.instance_id);
      if (!row) continue;
      out.push({
        ref,
        topic_id: ref.topic_id,
        stem_html: renderInlineWithMath(row.stem),
        choices_html: renderChoices(row.choices),
      });
    }
  }
  return out;
}

function renderChoices(choices: Record<string, string> | null | undefined) {
  return Object.fromEntries(
    Object.entries(choices ?? {}).map(([letter, text]) => [
      letter,
      renderInlineWithMath(String(text)),
    ]),
  );
}

async function loadStaticItems(
  courseId: string,
  refs: ItemRef[],
  { withAnswers }: { withAnswers: boolean },
): Promise<Map<string, StoredItem>> {
  const topicIds = [...new Set(refs.filter((r) => r.source === 'static').map((r) => r.topic_id))];
  const map = new Map<string, StoredItem>();
  if (topicIds.length === 0) return map;

  // THE TWO PATHS, and the only place they diverge.
  //
  // Without answers this reads the redacted view, exactly as a student page
  // does. With answers it reads the base table through the admin client -- and
  // every caller that passes withAnswers has already cleared requireTeacher().
  const client = withAnswers ? createAdminClient() : await createClient();
  const table = withAnswers ? 'curriculum_topics' : 'curriculum_topics_public';

  const { data } = await client
    .from(table)
    .select('topic_id, practice_items')
    .eq('course_id', courseId)
    .in('topic_id', topicIds);

  for (const row of data ?? []) {
    const items = (row.practice_items ?? {}) as PracticeItems;
    for (const section of SECTIONS) {
      for (const item of items[section]?.items ?? []) {
        map.set(`${row.topic_id}/${section}/${item.item_number}`, item);
      }
    }
  }
  return map;
}

type InstanceRow = { id: string; stem: string; choices: Record<string, string>; correct_answer?: string };

async function loadInstances(
  refs: ItemRef[],
  { withAnswers }: { withAnswers: boolean },
): Promise<Map<string, InstanceRow>> {
  const ids = refs.filter((r) => r.source === 'instance').map((r) => r.instance_id);
  const map = new Map<string, InstanceRow>();
  if (ids.length === 0) return map;

  // Two calls with literal select lists rather than one with a ternary. The
  // ternary is what supabase-js cannot type, and writing it out twice keeps the
  // answer-bearing column visible at the call site instead of hidden in an
  // expression -- which is the column most worth being able to grep for.
  const admin = createAdminClient();
  const query = withAnswers
    ? admin
        .from('curriculum_item_instances')
        .select('id, stem, choices, correct_answer')
        .in('id', ids)
        .overrideTypes<InstanceRow[], { merge: false }>()
    : admin
        .from('curriculum_item_instances')
        .select('id, stem, choices')
        .in('id', ids)
        .overrideTypes<InstanceRow[], { merge: false }>();

  const { data } = await query;
  for (const row of data ?? []) map.set(row.id, row);
  return map;
}

// ─── The answer key ─────────────────────────────────────────────────────────

/**
 * ANSWER KEY PATH. The only function here that reads an answer.
 *
 * Reads curriculum_topics (base table, admin client) for correct_answer,
 * worked_solutions and distractor_prose. Every caller must have cleared
 * requireTeacher() first; this function does not check, because a data loader
 * that enforces its own auth invites callers to assume it always does.
 *
 * The prose is unwrapped with extractDistractorProse/distractorLine from
 * lib/curriculum-utils.ts -- shipped and tested in PR #159. There is no second
 * extractor here and there must not be one: the anchored regex is the piece that
 * keeps the 184 entries containing their own parentheses intact.
 *
 *
 * ROLLED INSTANCES GET NO PROSE, AND THIS IS THE INTERESTING CASE.
 *
 * distractor_prose and worked_solutions are authored against the CANONICAL item
 * -- "adds the 9 to 14 instead of subtracting it, producing 23" names specific
 * numbers. A rolled instance has different numbers, so that sentence is
 * arithmetically wrong for it while reading as perfectly authoritative.
 *
 * A teacher would have no way to tell. So a non-canonical instance carries no
 * worked solution and no misconception notes, and the key says so in place of
 * them. The correct letter is still exact -- it comes from the instance row
 * itself, which the upload asserts per instance.
 *
 * This is the one place the two backends are NOT interchangeable, and it is a
 * content problem rather than a code one: closing it means authoring
 * parameterised prose alongside the parameterised choices. Reported, not
 * papered over.
 */
export async function resolveForKey(
  courseId: string,
  refs: ItemRef[],
): Promise<KeyItem[]> {
  const staticItems = await loadStaticItems(courseId, refs, { withAnswers: true });
  const instances = await loadInstances(refs, { withAnswers: true });
  const prose = await loadProse(courseId, refs);

  const out: KeyItem[] = [];
  for (const ref of refs) {
    if (ref.source === 'static') {
      const key = `${ref.topic_id}/${ref.section}/${ref.item_number}`;
      const item = staticItems.get(key);
      if (!item) continue;
      const topicProse = prose.get(ref.topic_id);
      const optionProse =
        topicProse?.distractor_prose?.[ref.section]?.[String(ref.item_number)] ?? {};
      const solution =
        topicProse?.worked_solutions?.[ref.section]?.[String(ref.item_number)] ?? null;

      out.push({
        ref,
        topic_id: ref.topic_id,
        stem_html: renderInlineWithMath(item.stem ?? ''),
        choices_html: renderChoices(item.choices),
        correct_answer: item.correct_answer ?? '',
        solution_html: solution ? renderMarkdownWithMath(solution) : null,
        notes: buildNotes(optionProse, item.correct_answer ?? ''),
      });
    } else {
      const row = instances.get(ref.instance_id);
      if (!row) continue;
      out.push({
        ref,
        topic_id: ref.topic_id,
        stem_html: renderInlineWithMath(row.stem),
        choices_html: renderChoices(row.choices),
        correct_answer: row.correct_answer ?? '',
        // See the note above: authored prose names the canonical numbers.
        solution_html: null,
        notes: [],
      });
    }
  }
  return out;
}

/**
 * Turn one item's stored prose map into ordered, unwrapped teacher lines.
 *
 * Ordered A-D rather than by object key order so the key reads down the page in
 * the same order as the choices printed on the worksheet.
 */
function buildNotes(
  optionProse: Record<string, string>,
  correct: string,
): KeyItem['notes'] {
  const letters = ['A', 'B', 'C', 'D'];
  const notes: KeyItem['notes'] = [];
  for (const letter of letters) {
    const raw = optionProse[letter];
    if (!raw) continue;
    const parsed = extractDistractorProse(raw);
    if (!parsed) continue;
    notes.push({
      letter,
      text: parsed.text,
      // Trust the item's own correct_answer over the prose's "Correct:" prefix.
      // They agree today; if they ever disagree, the graded field is the one the
      // student was marked against.
      correct: letter === correct,
    });
  }
  return notes;
}

type ProseRow = {
  distractor_prose: Record<string, Record<string, Record<string, string>>> | null;
  worked_solutions: Record<string, Record<string, string>> | null;
};

/** ANSWER KEY PATH. Base table, admin client. */
async function loadProse(
  courseId: string,
  refs: ItemRef[],
): Promise<Map<string, ProseRow>> {
  const topicIds = [...new Set(refs.map((r) => r.topic_id))];
  const map = new Map<string, ProseRow>();
  if (topicIds.length === 0) return map;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('curriculum_topics')
    .select('topic_id, distractor_prose, worked_solutions')
    .eq('course_id', courseId)
    .in('topic_id', topicIds);

  // Allowed to fail, deliberately. sql/curriculum_prose_columns.sql may not have
  // been run yet, in which case these columns do not exist and the select
  // errors. The key should still print with its correct letters rather than 500
  // -- the notes are the enhancement, the letters are the point.
  if (error || !data) return map;

  for (const row of data) {
    map.set(row.topic_id as string, {
      distractor_prose: (row.distractor_prose ?? {}) as ProseRow['distractor_prose'],
      worked_solutions: (row.worked_solutions ?? {}) as ProseRow['worked_solutions'],
    });
  }
  return map;
}
