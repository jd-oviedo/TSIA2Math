import { topicKey } from './topic-key';
import type { AttemptRow } from './attempt-sets';

// THE GRADE, in one place, in both of the two definitions that disagree.
//
// Build 3. Until now "how did this student score on this topic" was answered in
// two places that had never been compared:
//
//   LATEST-ATTEMPT   app/dashboard/grades/page.tsx:35-61, inline in the page.
//                    A retry REPLACES the earlier answer. Denominator is the
//                    items the student attempted.
//   EVER-CORRECT     app/lib/attempt-sets.ts correctInSection, feeding the
//                    completion gates. A retry never takes a correct away --
//                    "mastery counts up, never down". Denominator is the
//                    topic's gradable item count.
//
// THEY DISAGREE ON REAL DATA, ON BOTH HALVES OF THE FRACTION. Measured in
// production 2026-08-24 on vics8388, topic GR.4.3: he answered item 2 correctly,
// retried it a day later and missed. Latest-attempt reads 1/3. Ever-correct
// reads 2/4. Neither is wrong; they are answers to different questions.
//
// So this module exposes BOTH, as pure functions over the same rows, and the
// student page and the teacher pages call the identical code. The disagreement
// is not resolved here -- it is made visible, labelled, on every surface that
// shows a per-topic score. Only the roster LETTER commits to one (mastery; see
// rollupLetter).
//
// ─── PRACTICE IS CONTEXT, NEVER A GRADE ──────────────────────────────────────
//
// Every function below keeps `practice` and `mini_quiz` in separate buckets and
// nothing sums them. Practice is formative: it is the work a student does to
// learn the topic, it is where they are supposed to be wrong, and averaging it
// into an attainment number would punish exactly the behaviour the product asks
// for. gradesFor returns both so a teacher can see effort beside attainment;
// rollupLetter reads ONLY the quiz.
//
// ─── curriculum_completion.quiz_score IS A TRAP AND IS NEVER READ ────────────
//
// The column exists, it is populated, and it holds ever-correct-over-gradable as
// a ready-made percentage (curriculum-progress.ts:717). Reading it would save
// this module most of its work and would be wrong, for the same reason Build 2
// refused completed_at one layer up:
//
//   THE ROW IS WRITTEN WHEN THE LESSON IS READ. syncCompletionSnapshot upserts
//   on any topic activity, so a student who opened the notes and never took the
//   quiz gets quiz_correct 0, quiz_total 4, quiz_score 0.
//
// Measured on vics8388, 2026-08-24: NINE completion rows, SEVEN of them
// quiz_score = 0 for a quiz he has never opened. A letter built on that column
// reads those seven zeros as seven failures and hands him an F for work he was
// never set. "No quiz attempt" is ABSENT, and absent is not zero.
//
// So every number here is recomputed from curriculum_attempts, which is the
// record of what actually happened. This module never sees a completion row.
//
// ─── PURE, AND IMPORT-FREE AT RUNTIME ────────────────────────────────────────
//
// The only value import is topicKey, four characters of string concatenation in
// a module that imports nothing. AttemptRow arrives as `import type` and is
// erased. Same split as topic-completion.ts and curriculum-rollup.ts, for the
// same reason: `node --test` and scripts/faultproof_grades_extract.mjs load this
// directly, with no Supabase client anywhere in the graph.

/** The two sections a topic is made of. Only one of them is ever a grade. */
export type Section = 'practice' | 'mini_quiz';

/** What this module needs out of a TopicShape: the gradable count per section. */
export type TopicShapeLike = {
  practice: { gradable: number };
  mini_quiz: { gradable: number };
};

/**
 * One section's score under one definition.
 *
 * `attempted` is carried alongside `total` because the two definitions divide by
 * DIFFERENT denominators and a surface that renders a bare percentage would hide
 * which. Latest-attempt divides by attempted; mastery divides by the topic's
 * gradable count. Both are here so a caller never has to guess, and so the
 * fraction can be rendered as a fraction.
 */
export type SectionScore = {
  correct: number;
  /** The denominator THIS definition uses. */
  total: number;
  /** Distinct items the student has answered at least once. */
  attempted: number;
  /** Most recent attempt in this section, ISO. */
  lastWorkedAt: string;
};

/** One topic, both definitions, both sections. Nothing summed across sections. */
export type TopicGrade = {
  /** Matches app/dashboard/grades. Null when the section was never attempted. */
  latest: SectionScore | null;
  /** Matches the completion gates. Null when the section was never attempted. */
  mastery: SectionScore | null;
};

export type TopicGrades = {
  quiz: TopicGrade;
  practice: TopicGrade;
};

/** `courseId:topicId:section`. The key both reducers below bucket into. */
export function sectionKey(courseId: string, topicId: string, section: string): string {
  return `${topicKey(courseId, topicId)}:${section}`;
}

// ─── Definition 1: latest attempt per item ───────────────────────────────────

/**
 * THE EXTRACT. Byte-identical in result to app/dashboard/grades/page.tsx:35-61,
 * which is what scripts/faultproof_grades_extract.mjs exists to prove -- it runs
 * a frozen copy of that loop and this function over the same fixtures and
 * compares canonically-sorted JSON, with five mutations that must each redden
 * their named cases.
 *
 * A RETRY REPLACES THE EARLIER ANSWER, right or wrong. That is the whole
 * definition, and it is the number a student currently reads on their own Grades
 * page, so it is the number a teacher must be shown for the same student and
 * topic. It is deliberately NOT the flattering direction: a student who was
 * right and then fumbled a re-attempt reads lower here, and higher under
 * mastery.
 *
 * THE DENOMINATOR IS ITEMS ATTEMPTED, NOT THE TOPIC'S ITEM COUNT, which is why
 * no shape is passed in. The page counts one item per distinct item_number it
 * has seen. A student three questions into a four-question quiz reads x/3, not
 * x/4. Changing that would change the live number, so it is preserved exactly;
 * mastery is where the other denominator lives.
 *
 * ─── ORDER-INDEPENDENT, WHICH THE ORIGINAL WAS NOT ──────────────────────────
 *
 * The page's loop reads:
 *
 *     if (!latest.has(key)) latest.set(key, ...)
 *
 * "first row seen wins", which is the LATEST attempt only because getAttempts
 * orders created_at descending (curriculum-progress.ts:302). Nothing in the
 * signature said so, and a caller handing rows in any other order would have got
 * the OLDEST attempt per item with no error and no visible symptom.
 *
 * This keeps the same answer by comparing timestamps instead of trusting
 * position -- the same discipline topicStatusesFor already applies to its own
 * lastWorked reduction (curriculum-progress.ts:488-490), and for the same stated
 * reason: a pure reducer that silently depends on its input being sorted is one
 * caller away from being wrong.
 *
 * THE ONE DOCUMENTED DIFFERENCE, settled 2026-08-24. If two attempts on the same
 * item carry an IDENTICAL created_at, the original keeps whichever the array
 * happened to hold first, and this keeps whichever it sees first -- so they
 * agree on the same input order and could differ on a shuffled one. That is
 * accepted rather than engineered around: created_at is a Postgres timestamptz
 * written per answer with microsecond resolution, and two answers to one item at
 * the same microsecond is not a state the product can reach. The fixture matrix
 * carries the tie case (8) to keep the boundary visible, and deliberately does
 * not shuffle it.
 */
export function latestAttemptScores(attempts: readonly AttemptRow[]): Map<string, SectionScore> {
  // Winner per ITEM first, then bucketed per section -- the same two passes the
  // page makes, kept as two passes because collapsing them would make the
  // "distinct items" denominator depend on iteration order again.
  const winner = new Map<string, { is_correct: boolean; created_at: string; section: string; courseId: string; topicId: string }>();

  for (const a of attempts) {
    const key = sectionKey(a.course_id, a.topic_id, a.section) + `:${a.item_number}`;
    const held = winner.get(key);
    // STRICTLY GREATER, so a tie keeps the row already held. See the tie note
    // above; this is the only line where the two reducers can part.
    if (!held || a.created_at > held.created_at) {
      winner.set(key, {
        is_correct: a.is_correct,
        created_at: a.created_at,
        section: a.section,
        courseId: a.course_id,
        topicId: a.topic_id,
      });
    }
  }

  const out = new Map<string, SectionScore>();
  for (const w of winner.values()) {
    const key = sectionKey(w.courseId, w.topicId, w.section);
    const row = out.get(key);
    if (row) {
      row.total += 1;
      row.attempted += 1;
      if (w.is_correct) row.correct += 1;
      if (w.created_at > row.lastWorkedAt) row.lastWorkedAt = w.created_at;
    } else {
      out.set(key, {
        correct: w.is_correct ? 1 : 0,
        // total === attempted under this definition, and both are kept rather
        // than aliased: `total` is what the fraction divides by and `attempted`
        // is a fact about the student. They coincide here and do not under
        // mastery, so a caller reading either gets the same answer it would get
        // from the other definition's object.
        total: 1,
        attempted: 1,
        lastWorkedAt: w.created_at,
      });
    }
  }
  return out;
}

// ─── Definition 2: ever correct, over the topic's gradable count ─────────────

/**
 * What the completion gates measure. Distinct items ever answered correctly,
 * over the section's authored gradable count.
 *
 * REUSES THE RULE, DOES NOT REIMPLEMENT IT. The numerator is the same reduction
 * as correctItemsInSection in attempt-sets.ts -- distinct item_number where
 * is_correct, "ever" rather than "most recently" -- computed here in one pass
 * over all sections rather than one call per section, because the grid needs
 * every topic at once. If that rule ever changes, both must change; the fixture
 * matrix pins this one against the frozen page reducer, and
 * tests/topic-completion.test.ts pins the gate that consumes the other.
 *
 * THE DENOMINATOR IS THE SHAPE, NOT THE ATTEMPTS. A student who has answered
 * three of four quiz items reads x/4 here, because the question this definition
 * answers is "how much of this topic have you demonstrated", and the item they
 * have not opened is part of the topic. That is also what makes it comparable
 * across students, which the roster letter needs and latest-attempt could not
 * give: two students with x/3 and x/4 have not taken the same measurement.
 *
 * A SECTION WITH NO ATTEMPTS IS ABSENT FROM THE MAP, never present with zero.
 * That distinction is the whole of Ruling A -- see the quiz_score note in the
 * module header -- and it is why this returns a sparse map keyed by what the
 * student actually touched, rather than a dense one over every topic in the
 * course.
 *
 * A section whose shape is unknown (a topic unpublished since it was attempted)
 * falls back to the attempted count as its denominator, so the row degrades to
 * the latest-attempt denominator rather than dividing by zero or vanishing.
 */
export function masteryScores(
  attempts: readonly AttemptRow[],
  shapes: ReadonlyMap<string, TopicShapeLike>
): Map<string, SectionScore> {
  const correctItems = new Map<string, Set<number>>();
  const seenItems = new Map<string, Set<number>>();
  const last = new Map<string, string>();
  const coords = new Map<string, { courseId: string; topicId: string; section: string }>();

  for (const a of attempts) {
    const key = sectionKey(a.course_id, a.topic_id, a.section);
    if (!coords.has(key)) {
      coords.set(key, { courseId: a.course_id, topicId: a.topic_id, section: a.section });
    }
    if (!seenItems.has(key)) seenItems.set(key, new Set());
    seenItems.get(key)!.add(a.item_number);
    if (a.is_correct) {
      if (!correctItems.has(key)) correctItems.set(key, new Set());
      correctItems.get(key)!.add(a.item_number);
    }
    const held = last.get(key);
    if (!held || a.created_at > held) last.set(key, a.created_at);
  }

  const out = new Map<string, SectionScore>();
  for (const [key, coord] of coords) {
    const attempted = seenItems.get(key)?.size ?? 0;
    const shape = shapes.get(topicKey(coord.courseId, coord.topicId));
    const gradable =
      coord.section === 'mini_quiz'
        ? shape?.mini_quiz.gradable
        : coord.section === 'practice'
          ? shape?.practice.gradable
          : undefined;

    out.set(key, {
      correct: correctItems.get(key)?.size ?? 0,
      // An unknown or zero-gradable section (QR.1.1's practice is written work,
      // interactive false, gradable 0) would otherwise divide by zero and render
      // as x/0. Falling back to what the student attempted keeps the row honest
      // and matches what the student's own Grades page shows for it.
      total: gradable === undefined || gradable === 0 ? attempted : gradable,
      attempted,
      lastWorkedAt: last.get(key)!,
    });
  }
  return out;
}

// ─── Both definitions, per topic ─────────────────────────────────────────────

/**
 * Every topic this student has touched, both definitions, both sections.
 *
 * Keyed by topicKey. A topic appears iff it has at least one attempt row; a
 * SECTION inside it is null iff that section has none. So "never opened the
 * quiz" is a null, and a caller cannot accidentally render it as a zero.
 */
export function gradesFor(
  attempts: readonly AttemptRow[],
  shapes: ReadonlyMap<string, TopicShapeLike>
): Map<string, TopicGrades> {
  const latest = latestAttemptScores(attempts);
  const mastery = masteryScores(attempts, shapes);

  const out = new Map<string, TopicGrades>();
  for (const a of attempts) {
    const key = topicKey(a.course_id, a.topic_id);
    if (out.has(key)) continue;
    out.set(key, {
      quiz: {
        latest: latest.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz')) ?? null,
        mastery: mastery.get(sectionKey(a.course_id, a.topic_id, 'mini_quiz')) ?? null,
      },
      practice: {
        latest: latest.get(sectionKey(a.course_id, a.topic_id, 'practice')) ?? null,
        mastery: mastery.get(sectionKey(a.course_id, a.topic_id, 'practice')) ?? null,
      },
    });
  }
  return out;
}

// ─── The roster letter ───────────────────────────────────────────────────────

export type Letter = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * The letter scale. ONE TABLE, and the only place a cutoff is written.
 *
 * Ordered high to low and read by the first `percent >= min` that matches, so
 * adding a band is one row rather than a chain of else-ifs to get right.
 */
export const LETTER_BANDS: readonly { letter: Letter; min: number }[] = [
  { letter: 'A', min: 90 },
  { letter: 'B', min: 80 },
  { letter: 'C', min: 70 },
  { letter: 'D', min: 60 },
  { letter: 'F', min: 0 },
];

/**
 * ─── THE MINIMUM-EVIDENCE GATE ───────────────────────────────────────────────
 *
 * NAMED HERE, TUNED HERE, AND NOWHERE ELSE. Every surface that renders a letter
 * imports these two rather than testing a number of its own, so raising the bar
 * is one edit and cannot leave the roster and the gradebook disagreeing about
 * whether a student has enough graded work to have a grade.
 *
 * WHY A GATE AND NOT JUST AN EMPTY STATE. The obvious empty state -- "no quizzed
 * topics reads no graded work yet" -- catches the student who has done nothing
 * and misses the student who has done almost nothing, and the second one is
 * worse, because the arithmetic succeeds and produces a real-looking letter.
 *
 * MEASURED, ON THE ACTUAL DATA, 2026-08-24. vics8388 has quizzed exactly two
 * topics and answered five quiz items across them, neither quiz finished. He is
 * not the empty state. Without this gate he reads:
 *
 *     mastery pooled       3/8   37.5%   F
 *     mastery mean         (50+25)/2     F
 *     latest-attempt pooled 2/5  40.0%   F
 *     latest-attempt mean  (33.3+50)/2   F
 *
 * -- an F under every definition, off five questions. That is the F-by-default
 * this build exists to refuse, and the empty state alone would not have caught
 * it.
 *
 * AND IT IS NOT AN EDGE CASE. Six students in the entire product have ever
 * attempted a quiz, across 55 attempt rows. Every letter at launch is a
 * thin-data letter, so the withheld state is the common path and has to read
 * like a normal state rather than an error.
 *
 * BOTH GATES, NOT EITHER. Topics guard against one heavily-worked topic standing
 * in for a course; items guard against three topics with one question each.
 */
export const LETTER_MIN_GRADED_TOPICS = 3;
export const LETTER_MIN_GRADED_ITEMS = 8;

export type LetterResult =
  | {
      kind: 'letter';
      letter: Letter;
      /**
       * The overall grade, 0-100. THE MEAN OF THE PER-TOPIC QUIZ PERCENTAGES,
       * each topic weighted equally -- NOT correct-over-possible across items.
       *
       * No item tally is carried beside it, deliberately. A pooled
       * `correct/possible` would be a second number on the same object that
       * disagrees with this one whenever quizzes differ in length, and the next
       * surface to render "3/8" beside a 42% would be rendering two different
       * grades. The per-topic fractions are already on the cells.
       */
      percent: number;
      gradedTopics: number;
      gradedItems: number;
    }
  | {
      kind: 'withheld';
      reason: 'no_graded_work' | 'not_enough_topics' | 'not_enough_items';
      /** What the surface renders where the letter would be. Always a dash. */
      display: '—';
      /** The honest count, e.g. "2 of 3 topics quizzed". */
      subtitle: string;
      gradedTopics: number;
      gradedItems: number;
    };

/**
 * One student's letter, over their assigned-or-attempted topics.
 *
 * MASTERY DRIVES IT, and this build ships no toggle. Settled 2026-08-24:
 *
 *   * it is the definition the gates already enforce, so a student who has
 *     cleared every gate cannot be reading a failing letter;
 *   * it never drops when a student retries and fumbles, which latest-attempt
 *     does -- a grade that punishes practising contradicts the whole product;
 *   * its denominator is the topic's item count, which is comparable across
 *     students. Latest-attempt's is not: x/3 and x/4 are not the same
 *     measurement, and a roster column ranks students against each other.
 *
 * BOTH DEFINITIONS STILL SHOW, LABELLED, on every per-topic cell. Only this
 * rollup commits, because a roster column has room for one number and an
 * unlabelled pair would be worse than either.
 *
 * QUIZ ONLY. `grades.practice` is never read here, and the two-axis note above
 * topicCompletion says why the same practice rows are nonetheless load-bearing
 * three inches away.
 *
 * EACH TOPIC WEIGHTED EQUALLY. The mean of the per-topic quiz percentages, not
 * sum(correct)/sum(possible). Every quiz is four items today so the two coincide
 * exactly, which is precisely why the choice had to be made deliberately now
 * rather than discovered later by whoever authors the first six-item quiz. A
 * topic is a unit of the course and a grade is an average of topics; pooling
 * would silently make a long quiz count for more of a student's grade than a
 * short one.
 *
 * THE DENOMINATOR IS "TOPICS WITH AT LEAST ONE QUIZ ATTEMPT", exactly. Not the
 * assigned set, not the attempted set, not 97. Work a student has not been
 * given, and work they have been given but not yet reached, must never lower a
 * grade -- so `topicKeys` decides which topics are ELIGIBLE and the quiz-attempt
 * test below decides which of those are actually COUNTED.
 *
 * @param topicKeys the assigned-or-attempted set. NOT all 97 -- a student is not
 *   failing the topics nobody has asked them to do. Callers build it as
 *   (assigned to this student) union (has any attempt row).
 */
export function rollupLetter(
  grades: ReadonlyMap<string, TopicGrades>,
  topicKeys: readonly string[]
): LetterResult {
  const topicPercents: number[] = [];
  let gradedItems = 0;

  for (const key of topicKeys) {
    const quiz = grades.get(key)?.quiz.mastery;
    // ABSENT, NOT ZERO, AND NOT IN THE DENOMINATOR EITHER. A topic with no quiz
    // attempt contributes no percentage and does not lengthen the list being
    // averaged. This one `if` is Ruling A in the arithmetic: reading
    // curriculum_completion.quiz_score instead would have pushed a 0 into this
    // array for every topic whose NOTES were opened.
    if (!quiz || quiz.attempted === 0) continue;
    gradedItems += quiz.attempted;
    // Per-topic percentage, on the mastery denominator (the topic's gradable
    // count), so an unfinished quiz reads as the share of the QUIZ mastered
    // rather than the share of what was attempted. That is what makes two
    // students comparable in a roster column.
    topicPercents.push((quiz.correct / quiz.total) * 100);
  }

  const gradedTopics = topicPercents.length;

  if (gradedTopics === 0) {
    return {
      kind: 'withheld',
      reason: 'no_graded_work',
      display: '—',
      subtitle: 'No graded work yet',
      gradedTopics,
      gradedItems,
    };
  }

  if (gradedTopics < LETTER_MIN_GRADED_TOPICS) {
    return {
      kind: 'withheld',
      reason: 'not_enough_topics',
      display: '—',
      // Names the binding constraint and how far off it is, so a teacher can
      // tell "not yet" from "broken" without opening anything.
      subtitle: `${gradedTopics} of ${LETTER_MIN_GRADED_TOPICS} topics quizzed`,
      gradedTopics,
      gradedItems,
    };
  }

  if (gradedItems < LETTER_MIN_GRADED_ITEMS) {
    return {
      kind: 'withheld',
      reason: 'not_enough_items',
      display: '—',
      subtitle: `${gradedItems} of ${LETTER_MIN_GRADED_ITEMS} questions answered`,
      gradedTopics,
      gradedItems,
    };
  }

  // gradedTopics > 0 here, so this cannot divide by zero. Rounded once, at the
  // end, over unrounded per-topic percentages: rounding each topic first and
  // then averaging drifts by up to half a point per topic in the same direction.
  const percent = Math.round(topicPercents.reduce((a, b) => a + b, 0) / gradedTopics);
  const letter = LETTER_BANDS.find((b) => percent >= b.min)!.letter;

  return { kind: 'letter', letter, percent, gradedTopics, gradedItems };
}

// ─── The OTHER axis: completion ──────────────────────────────────────────────

/**
 * ═══ TWO AXES, TWO DENOMINATORS, ON PURPOSE. DO NOT RECONCILE THEM. ═══
 *
 * This is the one thing in this module most likely to be "fixed" by a later
 * edit, so it is stated before the code rather than after it.
 *
 *   COMPLETION  denominator = 3 SECTIONS   lesson + practice + quiz.
 *               PRACTICE COUNTS. This is progress: how much of the topic has
 *               the student worked through.
 *
 *   GRADE       denominator = QUIZZED TOPICS.
 *               PRACTICE IS INVISIBLE. This is attainment: how well did they
 *               do on the thing that measures it.
 *
 * THE SAME PRACTICE ROWS PLAY BOTH ROLES AND MUST KEEP PLAYING BOTH. A student
 * who read the notes and worked the practice on a topic and never opened its
 * quiz is 2/3 COMPLETE on that topic and is NOT IN THE GRADE DENOMINATOR AT ALL.
 * Both of those are correct at the same time. They are not a contradiction to be
 * resolved -- they are the reason the axes are separate.
 *
 * So, concretely, none of the following is a tidy-up:
 *
 *   * folding practiceCorrect into rollupLetter, "since we have the data";
 *   * dropping practice from this count so the two axes "agree";
 *   * counting an unquizzed-but-practised topic as a 0 in the grade so the
 *     denominators match.
 *
 * The third is the dangerous one: it is the same shape as the
 * curriculum_completion.quiz_score trap in this module's header, arrived at from
 * the opposite direction, and it produces the same F-by-default.
 *
 * ─── Where the input comes from ─────────────────────────────────────────────
 *
 * A STRUCTURAL TYPE, NOT AN IMPORT OF TopicStatus, so this module stays loadable
 * by `node --test` with no Supabase client in the graph -- the same reason
 * topic-completion.ts declares ObservedLike rather than importing TopicProgress.
 * getTopicStatuses already produces every field, having done the snapshot/
 * observed reconciliation and the A1 lesson rule, so nothing here re-derives a
 * gate: it counts three booleans that were decided elsewhere.
 */
export type CompletionInput = {
  /** A1: the stored stamp OR evidence of activity. From isPastLesson. */
  lessonDone: boolean;
  practiceCorrect: number;
  practiceRequired: number;
  practiceCount: number;
  practiceAttempted: boolean;
  quizCorrect: number;
  quizRequired: number;
  quizCount: number;
  quizAttempted: boolean;
};

/** The three sections a topic is completed in. Named, not a bare 3. */
export const COMPLETION_SECTIONS = 3;

export type TopicCompletion = {
  /** 0 to COMPLETION_SECTIONS. */
  done: number;
  total: number;
  lesson: boolean;
  practice: boolean;
  quiz: boolean;
};

/**
 * How much of one topic is done, out of three.
 *
 * RETURNS NULL FOR AN UNTOUCHED TOPIC, and that is not the same as 0/3. A
 * student who has never opened a topic has no progress to report on it, and a
 * surface must render "—" rather than "0%" -- a nought is a claim about work
 * attempted, and there was none. Same distinction, same reason, as absent-not-
 * zero in rollupLetter above.
 *
 * "Cleared" per section is the gate, not mere attendance: practiceCorrect
 * against practiceRequired, quizCorrect against quizRequired, both supplied by
 * requiredCorrect in topic-completion.ts. A section with no gradable items
 * (QR.1.1's practice is written work, gradable 0) counts as cleared, exactly as
 * isTopicComplete treats it -- otherwise that topic could never reach 3/3.
 *
 * A topic where all three are cleared is 3/3 and is precisely the population
 * isTopicComplete calls complete. This function does not recompute that; it
 * decomposes it, so a teacher can see WHICH third is missing.
 */
export function topicCompletion(status: CompletionInput | undefined): TopicCompletion | null {
  if (!status) return null;
  if (!status.lessonDone && !status.practiceAttempted && !status.quizAttempted) return null;

  const practice = status.practiceCount === 0 || status.practiceCorrect >= status.practiceRequired;
  const quiz = status.quizCount === 0 || status.quizCorrect >= status.quizRequired;
  const lesson = status.lessonDone;

  return {
    done: Number(lesson) + Number(practice) + Number(quiz),
    total: COMPLETION_SECTIONS,
    lesson,
    practice,
    quiz,
  };
}
