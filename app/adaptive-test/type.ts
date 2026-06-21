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

// What actually ships to the browser during a live test — same shape minus
// every answer-bearing field. This is also what `questions_public` (the DB
// view) returns, so the client-side shape and the DB-enforced shape match by
// construction.
export type PublicItem = Omit<Item, "correct_answer" | "explanation" | "distractor_logic">;

// Returned by POST /api/items/reveal, once per question, only after the
// student has submitted an answer for that specific item.
export interface RevealData {
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  // The misconception note for the option the student actually picked.
  // Null when they got it right, or when the picked key has no entry.
  distractor_note: string | null;
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