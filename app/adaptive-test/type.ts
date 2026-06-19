export type ProficiencyLevel = "Basic" | "Proficient" | "Advanced";
export type Strand = "QR" | "AR" | "GR" | "PR";

export interface StrategyHint {
  strategy: string;
  hint_text: string;
}

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

export interface ItemValidationError {
  item_id: string;
  missing: string[];
}

export interface LoadResult {
  items: Item[];
  errors: ItemValidationError[];
}

export interface Response {
  item: Item;
  selectedAnswer: string;
  isCorrect: boolean;
  thetaAfter: number;
  scoreAfter: number;
  elapsedMs: number;
}

export interface SessionState {
  phase: "loading" | "ready" | "active" | "complete" | "error";
  loadError: string | null;
  allItems: Item[];
  seenIds: Set<string>;
  currentItem: Item | null;
  currentDifficulty: ProficiencyLevel;
  theta: number;
  responses: Response[];
  maxItems: number;
  itemStartTime: number;
  strandQueue: Strand[];
}