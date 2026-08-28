// Which items go on a worksheet, and in what order.
//
// RUNTIME-PURE ON PURPOSE, the same discipline as capabilities.ts and
// products.ts: the only import is `import type`, which the type-stripping loader
// erases, so `node --test` can load this directly and fault it. The half that
// touches Supabase lives in worksheet-source.ts and is unreachable from a
// harness.
//
// The split matters here more than usual, because the rules below are the ones
// a teacher notices when they are wrong -- asking for 20 questions and getting
// 13, or getting the same question twice.

/** Authored difficulty band. Practice items carry one; quiz items do not. */
export type Level = 'Basic' | 'Proficient' | 'Advanced';

/**
 * Which authored block an item came from.
 *
 * `extra_practice` is Part 5: a worksheet-only pool of any size, added so the
 * candidate pool can grow without moving the student's mastery bar. The two
 * gated sections are 10 and 4 items by house rule, and requiredCorrect() in
 * topic-completion.ts is a RATIO of the section's live length -- so deepening
 * `practice` for teachers would have re-locked every student mid-topic. This
 * section is drawn by worksheets and read by nothing on the student path.
 *
 * Nothing else in this file distinguishes the three. The draw, the allocator,
 * the shuffle and the no-duplicates rule were all written per candidate rather
 * than per section, which is why adding one costs a union member and a loop
 * bound rather than a branch.
 */
export type Section = 'practice' | 'mini_quiz' | 'extra_practice';

/**
 * Every section a worksheet may draw from, in stored order.
 *
 * ONE LIST, exported, because three separate walks of practice_items now need
 * it -- poolEntries here, and loadStaticItems in worksheet-source.ts, which
 * resolves both the printed sheet and the answer key. A section missing from
 * one of those walks is a question that can be selected and then cannot be
 * printed, or printed and then missing from the key.
 */
export const POOL_SECTIONS: readonly Section[] = ['practice', 'mini_quiz', 'extra_practice'];

/**
 * One item on a worksheet, as stored.
 *
 * A tagged union because there are two backends and a worksheet may mix them.
 * See sql/worksheets.sql for why topic_id is carried on both arms.
 */
export type ItemRef =
  | { source: 'static'; topic_id: string; section: Section; item_number: number }
  | { source: 'instance'; topic_id: string; instance_id: string };

/**
 * The two fields the eligibility rule reads, and nothing else.
 *
 * Candidate is this plus a ref. The picker has no refs -- it has not drawn
 * anything yet -- so splitting the shape is what lets the badge and the draw
 * share one predicate instead of two arithmetics that agree until they do not.
 */
export type PoolEntry = {
  section: Section;
  /** Null wherever the source carries no band heading. See passesLevel. */
  level: Level | null;
};

/** A selectable item, before it is chosen. */
export type Candidate = PoolEntry & {
  ref: ItemRef;
};

export type SelectOptions = {
  /** How many questions the teacher asked for. */
  count: number;
  /** Empty or absent means no difficulty filter. */
  levels?: readonly Level[];
  /**
   * Whether mini-quiz items may be used at all. Honoured in BOTH modes.
   *
   * It used to be ignored when `levels` was set, because the filter dropped the
   * quiz section wholesale and there was nothing left for the switch to decide.
   * Now that a banded quiz item can satisfy a filter, "filter on, quiz off" is a
   * real request and this is what answers it.
   */
  includeQuiz?: boolean;
  /** Stored on the worksheet so a regenerate under the same intent repeats. */
  seed: number;
};

export type SelectResult = {
  refs: ItemRef[];
  /** requested - delivered. Zero on a normal draw. */
  shortfall: number;
  /**
   * Why the teacher got what she got, in her words. Surfaced in the builder;
   * never silently swallowed. An empty array means "exactly what you asked for".
   */
  notes: string[];
};

// ─── Counting ───────────────────────────────────────────────────────────────

/**
 * Can this stored entry be PRINTED as a worksheet question?
 *
 * Format and choices, and deliberately nothing else -- because this is the
 * question the redacted view can answer. curriculum_topics_public applies
 * jsonb_strip_keys(practice_items, array['correct_answer','misconception_tag']),
 * so an item arriving from the public path has no correct_answer at all.
 *
 * THIS IS THE PREDICATE THE PICKER AND THE DRAW BOTH USE, and that is the whole
 * point of it existing. They previously answered the same question differently
 * -- the picker required correct_answer, the draw did not -- so every badge in
 * the builder read 0 while drawFromStatic would have found 14, and every
 * checkbox was disabled. A count that does not match what the draw produces is
 * wrong in whichever direction it differs.
 *
 * IT IS THE FIRST OF TWO SHARED PREDICATES, and the pair divides cleanly.
 * isPrintable answers "could this item ever go on a worksheet", a fact about the
 * item. isEligible answers "may it go on THIS worksheet", which also depends on
 * the bands ticked and on include_quiz. The badge was rebuilt on the second for
 * exactly the reason this paragraph gives about the first: it was answering the
 * question with its own arithmetic and the two came apart the moment a mini-quiz
 * item could carry a band.
 *
 * SCHEMA FACT 1 still holds here: this is counted per item by format, never by
 * array length. QR.1.1 has 16 entries and 7 printable ones.
 */
export function isPrintable(item: {
  format?: string | null;
  choices?: Record<string, string> | null;
}): boolean {
  return (
    item.format === 'multiple_choice' &&
    !!item.choices &&
    Object.keys(item.choices).length > 0
  );
}

/**
 * Is this entry printable AND backed by a parsed correct answer?
 *
 * The stricter test, and it is only answerable on the BASE table -- the view
 * cannot see correct_answer. Use it where an answer is genuinely required:
 * building the key, or validating an upload. Using it against the public view
 * returns false for every item in the course, which is exactly the bug this
 * pair of functions was split apart to prevent.
 *
 * MEASURED, so the split costs nothing today: across all 97 non-placeholder
 * topics there are 1,351 printable items and 1,351 gradeable ones -- zero
 * printable-but-unkeyed. So counting from the view is currently exact.
 *
 * That is a property of the CONTENT, not a mechanism, and it is not relied on.
 * upload_curriculum.py's validate_practice_items() cross-checks the correct
 * answer at authoring time, and the `interactive` flag on each stored section
 * is false when any item in it lacks one. If an unkeyed item ever ships, it
 * would appear on a worksheet and be blank on the key -- so the guard belongs at
 * upload, where it already is, rather than in a count that cannot see the field.
 */
export function isGradeable(item: {
  format?: string | null;
  correct_answer?: string | null;
  choices?: Record<string, string> | null;
}): boolean {
  return (
    isPrintable(item) &&
    typeof item.correct_answer === 'string' &&
    item.correct_answer.length > 0
  );
}

/**
 * Section and band for every printable item in a stored practice_items object.
 *
 * THE ONE WALK. Everything that needs to know what a topic can offer derives
 * from this: countTopicPool below, and the picker badge, which now ships these
 * entries to the browser so it can apply isEligible() -- the draw's own rule --
 * rather than re-deriving the answer from a pair of totals.
 *
 * Pure, and takes the jsonb rather than a Supabase row, so it can be tested
 * against a verbatim capture of what curriculum_topics_public actually returns.
 * It could not be, before: the counting lived inline inside listPickerTopics
 * next to the query, so the only way to exercise it was to have a database, and
 * every existing test used hand-built objects carrying a correct_answer the
 * real view never sends. That is why a course-wide count of zero shipped.
 *
 * `level` is carried as authored, null included. Narrowing to Level here would
 * be a lie about content that has no band, and null is the value the filter
 * needs to see in order to refuse it.
 */
export function poolEntries(practiceItems: unknown): PoolEntry[] {
  const sections = (practiceItems ?? {}) as Record<
    string,
    { items?: { format?: string | null; correct_answer?: string | null; choices?: Record<string, string> | null; level?: string | null }[] } | null
  >;
  const out: PoolEntry[] = [];
  for (const section of POOL_SECTIONS) {
    // Absent on the 96 topics with no Part 5, and `?? []` is what makes that a
    // non-event rather than a branch. build_practice_items omits an optional
    // section that parsed to nothing rather than storing it empty.
    for (const item of sections[section]?.items ?? []) {
      if (!isPrintable(item)) continue;
      out.push({ section, level: (item.level as Level | null) ?? null });
    }
  }
  return out;
}

/**
 * The pool a topic offers, counted from a stored practice_items object.
 *
 * Derived from poolEntries rather than walking the jsonb a second time. Two
 * walks would be two opinions about what an item is, and the first time they
 * disagreed the badge would be reporting on a population the draw cannot see --
 * which is the exact defect the isPrintable/isGradeable split above was made to
 * prevent.
 *
 * `levelled` is counted only among printable items, never across all array
 * entries -- QR.1.1 has 12 entries carrying a level but only 3 of them are
 * questions a worksheet can use.
 *
 * NOT THE BADGE NUMBER, and it never was a safe one. `levelled` answers "how
 * many items carry a band", which is a fact about content. What a filtered draw
 * delivers is a different question, because it also depends on WHICH bands are
 * ticked and on include_quiz. The two agreed only while every quiz item was
 * unbanded and every practice item was banded, so `levelled` happened to equal
 * the practice count. Use countEligible() for anything a teacher reads.
 */
export function countTopicPool(practiceItems: unknown): {
  available: number;
  levelled: number;
} {
  const entries = poolEntries(practiceItems);
  return {
    available: entries.length,
    levelled: entries.filter((entry) => entry.level != null).length,
  };
}

// ─── The mixed pool ─────────────────────────────────────────────────────────

/** How an item is addressed inside one topic. Both halves of the merge use it. */
export function itemKey(section: Section, itemNumber: number): string {
  return `${section}/${itemNumber}`;
}

/**
 * Rolled instances plus the authored items nothing rolled for. D1.
 *
 * PER ITEM, NOT PER TOPIC, and that is the whole change. It used to be
 * all-or-nothing: any live instance replaced the topic's authored pool
 * outright, and the static bank was reachable only as a fallback for a roll
 * that came back completely empty. A topic with three items that resist
 * templating -- a stem needing `\frac`, a choice carrying a unit -- could not
 * ship eleven rolled plus three authored. It could only ship eleven, and the
 * other three silently left every worksheet the topic appeared on.
 *
 * `served` is the set of items that actually PRODUCED a rolled candidate, not
 * the set that has a template row, and the difference is the retirement case.
 * When every instance of one template has been retired, that item's roll comes
 * back empty and its authored version is offered instead -- the same fallback
 * the all-or-nothing branch had, kept, but now per item rather than for the
 * whole topic. Keying on "has a template" would lose it: the item would be
 * excluded from the authored side and absent from the rolled side, which is how
 * a question disappears from a worksheet with nothing reporting a shortfall.
 *
 * Pure, and here rather than in worksheet-source.ts, so it can be faulted
 * directly. The Supabase half decides which items rolled; this decides what
 * that means, and only the second half has a rule in it.
 */
export function mergePools(
  rolled: readonly Candidate[],
  authored: readonly Candidate[],
  served: ReadonlySet<string>,
): Candidate[] {
  const kept = authored.filter(
    (c) => c.ref.source !== 'static' || !served.has(itemKey(c.ref.section, c.ref.item_number)),
  );
  return [...rolled, ...kept];
}

// ─── The difficulty rule ────────────────────────────────────────────────────

/**
 * Does this entry survive the active difficulty filter?
 *
 * SCHEMA FACT 3, AND IT IS NOW A PROPERTY OF CONTENT RATHER THAN OF SECTION.
 *
 * It used to read: `level` is null on ALL 388 mini_quiz items across all 97
 * topics, because the band headings (`**Basic Level**`) only existed in Part 2
 * and the parser had nothing to attach to a Part 3 item. So a difficulty filter
 * could only ever draw a topic's 10 practice items, not its 14 gradeable ones.
 *
 * That is no longer a fact about the mini quiz. build_practice_items() in
 * curriculum/migrations/upload_curriculum.py runs ONE level scan over both
 * sections -- it always did -- so a band heading placed in Part 3 is honoured
 * with no parser change, and a banded quiz item carries a real band. The course
 * is being banded topic by topic, so at any moment some quiz items have a band
 * and some do not.
 *
 * WHICH IS WHY THIS FUNCTION IS THE ONLY GATE, and selectItems no longer drops
 * the quiz section wholesale. A null level still fails any active filter, so an
 * unbanded topic behaves exactly as it did before a single line of this changed;
 * a banded one contributes its quiz items to the bands they were authored into.
 * Section is not consulted here at all, and must not be: "is this the mini quiz"
 * and "does this match the requested difficulty" are different questions, and
 * answering the second with the first is what made the banding inert.
 *
 * IT USED TO BE WORSE FOR A ROLLED ITEM, which carried null whatever its source
 * item said, because curriculum_item_instances had no level column at all -- so
 * a templated topic contributed nothing to a filtered worksheet, not 10 of 14.
 * D2 gives an instance the band of the item it was rolled from
 * (sql/instance_level.sql), and this function does not distinguish the two
 * backends: it never did, which is why the fix is a column and not a branch.
 */
export function passesLevel(
  candidate: Pick<PoolEntry, 'level'>,
  levels: readonly Level[] | undefined,
): boolean {
  if (!levels || levels.length === 0) return true;
  return candidate.level != null && levels.includes(candidate.level);
}

/**
 * May this entry be drawn under the teacher's current settings?
 *
 * THE ONE ELIGIBILITY RULE, and the reason it is exported rather than inlined
 * into selectItems: the picker badge has to answer the identical question about
 * a topic it has not drawn from yet. Before this existed the badge answered a
 * parallel question with parallel arithmetic (`filtering ? levelled : available`)
 * and the two agreed only by coincidence -- see the note on countTopicPool.
 * A badge that does not match what the draw produces is wrong in whichever
 * direction it differs, and that has already shipped once on this screen.
 *
 * Two rules, in this order, because they answer to different controls:
 *
 *   include_quiz  is the teacher's own switch and is absolute. It applies while
 *                 a filter is on, which it did not before: the old code checked
 *                 it only in the unfiltered branch, so a teacher who unticked
 *                 the box and then picked a band silently got quiz questions
 *                 back. The switch is now rendered in both modes too.
 *
 *   passesLevel   is a fact about the item. A quiz item with no band fails it,
 *                 which is what keeps an unbanded topic behaving as it always has.
 */
export function isEligible(
  entry: PoolEntry,
  options: { levels?: readonly Level[]; includeQuiz?: boolean },
): boolean {
  const { levels, includeQuiz = true } = options;
  if (entry.section === 'mini_quiz' && !includeQuiz) return false;
  return passesLevel(entry, levels);
}

/** How many of these entries the draw could pull under the same settings. */
export function countEligible(
  entries: readonly PoolEntry[],
  options: { levels?: readonly Level[]; includeQuiz?: boolean },
): number {
  return entries.reduce((n, entry) => (isEligible(entry, options) ? n + 1 : n), 0);
}

// ─── Deterministic shuffling ────────────────────────────────────────────────

// mulberry32, the same generator FigureRenderer uses for its scatter clouds.
//
// Seeded rather than Math.random() for one reason: the seed is stored on the
// worksheet, so "regenerate with the same settings" can reproduce a draw, and a
// worksheet built on the server renders identically if the selection is ever
// recomputed. Pure arithmetic, no crypto, no global state.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates against a seeded source. Returns a new array. */
export function seededShuffle<T>(input: readonly T[], seed: number): T[] {
  const out = input.slice();
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Allocation across topics ───────────────────────────────────────────────

/**
 * Split a requested total across the chosen topics as evenly as the pools allow.
 *
 * Largest-remainder rather than `Math.floor(count / topics.length)` per topic:
 * a plain floor loses up to (topics - 1) questions to rounding, so a teacher
 * picking 3 topics and 20 questions would get 18 with no explanation.
 *
 * Topics whose pool is smaller than their share do not simply come up short --
 * the remainder is redistributed to topics that still have room, which is what
 * makes a mixed selection including QR.1.1 (7 gradeable) still deliver the full
 * count as long as the other topics can cover it.
 */
export function allocate(
  pools: readonly { topic_id: string; available: number }[],
  count: number,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const p of pools) result.set(p.topic_id, 0);
  if (pools.length === 0 || count <= 0) return result;

  const capacity = new Map(pools.map((p) => [p.topic_id, p.available]));
  let remaining = Math.min(
    count,
    pools.reduce((n, p) => n + p.available, 0),
  );

  // Round-robin rather than a one-shot division. It self-balances against
  // uneven pools without a second redistribution pass, and the order is stable
  // so the same inputs always allocate the same way.
  let progress = true;
  while (remaining > 0 && progress) {
    progress = false;
    for (const p of pools) {
      if (remaining === 0) break;
      const taken = result.get(p.topic_id)!;
      if (taken < capacity.get(p.topic_id)!) {
        result.set(p.topic_id, taken + 1);
        remaining--;
        progress = true;
      }
    }
  }
  return result;
}

// ─── The draw ───────────────────────────────────────────────────────────────

/**
 * Choose the worksheet's items.
 *
 * `pools` is one entry per chosen topic, already resolved by
 * worksheet-source.ts from whichever backend that topic has. This function does
 * not know or care which backend produced a candidate -- that is the whole
 * point of the abstraction, and it is why adding templated topics later changes
 * nothing here.
 *
 * NEVER RETURNS A DUPLICATE. Each candidate is drawn at most once, so a topic
 * with a 14-item pool cannot fill a 20-item request on its own and will report
 * a shortfall instead of repeating a question. On a templated topic the same
 * code delivers 20 distinct questions without noticing the difference.
 */
export function selectItems(
  pools: readonly { topic_id: string; candidates: readonly Candidate[] }[],
  options: SelectOptions,
): SelectResult {
  const { count, levels, includeQuiz = true, seed } = options;
  const notes: string[] = [];

  const filtering = !!levels && levels.length > 0;

  // Apply the filters first, so allocation sees the pool a teacher will
  // actually get rather than the pool that exists.
  let droppedQuizToLevel = 0;
  let droppedQuizToOption = 0;

  // ONE PREDICATE, called once per candidate. The counters are bookkeeping for
  // the notes below and are deliberately derived from the SAME call rather than
  // from a second set of conditions -- a note that disagrees with the draw is
  // worse than no note, because a teacher acts on it.
  const filtered = pools.map((pool) => {
    const candidates = pool.candidates.filter((c) => {
      const eligible = isEligible(c, { levels, includeQuiz });
      if (!eligible && c.section === 'mini_quiz') {
        if (!includeQuiz) droppedQuizToOption++;
        else if (filtering) droppedQuizToLevel++;
      }
      return eligible;
    });
    return { topic_id: pool.topic_id, candidates };
  });

  // BOTH NOTES FIRE IN BOTH MODES NOW. The old pair was guarded on `filtering`
  // and `!filtering` respectively, which was safe only while the filter branch
  // swallowed the quiz section whole: with include_quiz now honoured during a
  // filtered draw, "filter on AND quiz off" is a real state, and under the old
  // guards it dropped the quiz items and said nothing at all.
  if (droppedQuizToOption > 0) {
    notes.push(
      `Mini-quiz questions are turned off: ` +
        `${droppedQuizToOption} question${droppedQuizToOption === 1 ? '' : 's'} set aside.`,
    );
  }

  if (droppedQuizToLevel > 0) {
    notes.push(
      `${droppedQuizToLevel} mini-quiz question${droppedQuizToLevel === 1 ? '' : 's'} ` +
        `set aside: ${droppedQuizToLevel === 1 ? 'it carries' : 'they carry'} no ` +
        `difficulty band, so a band filter cannot draw ${droppedQuizToLevel === 1 ? 'it' : 'them'}. ` +
        `Mini-quiz questions on topics that have been banded are included normally.`,
    );
  }

  const allocation = allocate(
    filtered.map((p) => ({ topic_id: p.topic_id, available: p.candidates.length })),
    count,
  );

  // Draw per topic, then order the sheet by topic so a worksheet reads as
  // grouped work rather than a shuffled pile. Within a topic the order is
  // shuffled, so two worksheets over the same small pool do not look identical.
  const refs: ItemRef[] = [];
  filtered.forEach((pool, i) => {
    const want = allocation.get(pool.topic_id) ?? 0;
    if (want === 0) return;
    // Vary the seed per topic, or every topic shuffles into the same order.
    const shuffled = seededShuffle(pool.candidates, seed + i * 7919);
    for (const c of shuffled.slice(0, want)) refs.push(c.ref);
  });

  const shortfall = Math.max(0, count - refs.length);
  if (shortfall > 0) {
    notes.push(
      `Asked for ${count}, found ${refs.length}. ` +
        `The selected topics do not have enough distinct questions` +
        (filtering ? ` at the chosen difficulty.` : `.`) +
        ` Add a topic, or lower the count.`,
    );
  }

  return { refs, shortfall, notes };
}
