export type ProficiencyLevel = "Basic" | "Proficient" | "Advanced";
export type Strand = "QR" | "AR" | "GR" | "PR";

export interface StrategyHint {
  strategy: string;
  hint_text: string;
}

// Full schema, matches the DB row exactly. Includes answer-bearing fields
// (correct_answer, explanation, distractor_logic). Server-side use only —
// never import this as the type of anything that reaches the browser before
// an item has been answered. See PublicItem below for what the client gets.
export interface Item {
  item_id: string;
  schema_version: string;
  version: number;
  status: string;
  category: string;
  primary_strand: Strand;
  secondary_strands: Strand[];
  objective: string;
  objective_text: string;
  topic_id: string;
  topic: string;
  topic_text: string;
  proficiency_level: ProficiencyLevel;
  assessment_layer: string;
  unit: number;
  skills_targeted: string[];
  question_text: string;
  question_format: string;
  answer_choices: Record<string, string>;
  correct_answer: string;
  explanation: string;
  distractor_logic: Record<string, string>;
  // Per-option misconception slug, keyed by answer letter. Answer-bearing by
  // omission: the correct option carries no tag, so the missing letter is the
  // answer. Same shape and same rule as the curriculum side's
  // `misconception_tag` (curriculum_topics.misconception_tags).
  //
  // Optional only because the column does not exist in Supabase yet — it lands
  // with sql/questions_misconception_tag.sql. Tighten to required once that
  // migration has run, so a server read cannot silently get undefined.
  misconception_tag?: Record<string, string>;
  difficulty_level: ProficiencyLevel;
  difficulty_b: number | null;
  discrimination_a: number | null;
  guessing_c: number | null;
  calculator_type: string;
  requires_calculator: boolean;
  applicable_strategies: string[];
  strategy_hints: StrategyHint[];
  content_context: string;
  context_tags: string[];
  estimated_time_seconds: number;
  contains_image: boolean;
  image_url: string | null;
  figure_type: string | null;
  // Structured, per-figure-type props consumed by FigureRenderer. Shape varies
  // by figure_type (nested arrays/objects), so this is intentionally loose.
  figure_props: Record<string, unknown> | null;
  exposure_max: number;
  times_administered: number;
  times_correct: number;
  dif_flag: string | null;
  fairness_review_status: string;
  fairness_review_date: string | null;
  fairness_review_notes: string | null;
  author: string;
  created_at: string;
  last_modified: string;
  review_notes: string | null;
}

// What `questions_public` (the DB view) returns — the full row minus every
// answer-bearing field. Kept as its own type even though nothing selects all of
// it, because it records where the answer fields actually become unreachable:
// the view, enforced by the database, not the client's choice of columns.
export type PublicViewItem = Omit<
  Item,
  "correct_answer" | "explanation" | "distractor_logic" | "misconception_tag"
>;

// The columns the live test selects out of that view, and the only ones any of
// the test UI reads. Narrowing the select is not a security boundary — the view
// already is one — it is the difference between shipping the whole bank's
// metadata to every test-taker and shipping the part that gets rendered:
// 736KB against 532KB across the 1124 draft items, measured.
//
// The string and the type sit together so the query and the shape cannot drift.
// A column added to one has to be added to the other to be readable, and
// reading a field that is not selected is a compile error at the point of use
// rather than an undefined at render time.
export const CAT_ITEM_COLUMNS =
  "item_id, question_text, answer_choices, primary_strand, proficiency_level, objective_text, category, figure_type, figure_props";

export type PublicItem = Pick<
  PublicViewItem,
  | "item_id"
  | "question_text"
  | "answer_choices"
  | "primary_strand"
  | "proficiency_level"
  | "objective_text"
  | "category"
  | "figure_type"
  | "figure_props"
>;

// Returned by POST /api/items/reveal, once per question, only after the
// student has submitted an answer for that specific item.
export type RevealData = {
  isCorrect: boolean
  correct_answer: string
  explanation: string | null
  distractor_note: string | null
}

export interface ItemValidationError {
  item_id: string;
  missing: string[];
}

export interface LoadResult {
  items: PublicItem[];
  errors: ItemValidationError[];
}

export interface Response {
  item: PublicItem;
  selectedAnswer: string;
  isCorrect: boolean;
  thetaAfter: number;
  scoreAfter: number;
  elapsedMs: number;
}

export interface SessionState {
  phase: "loading" | "ready" | "active" | "complete" | "error";
  loadError: string | null;
  allItems: PublicItem[];
  seenIds: Set<string>;
  currentItem: PublicItem | null;
  currentDifficulty: ProficiencyLevel;
  theta: number;
  responses: Response[];
  maxItems: number;
  itemStartTime: number;
  strandQueue: Strand[];
}