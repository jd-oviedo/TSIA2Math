import type { ItemValidationError, LoadResult, ProficiencyLevel, PublicItem, Response, Strand } from "./type";

export const TSIA2_MIN = 910;
export const TSIA2_MAX = 990;
export const TSIA2_PASSING = 950;

// Simplified 1PL (Rasch-style) IRT model: a = 1, c = 0 for every item, since
// no item in the bank has real calibrated a/b/c parameters yet (pending
// pretesting with a real test-taker cohort — see TSIA2 Technical Manual,
// Ch. 3). Each proficiency tier stands in for a b-parameter (item difficulty
// on the theta scale) until real calibration data exists.
export const TIER_B: Record<ProficiencyLevel, number> = {
  Basic: -1,
  Proficient: 0,
  Advanced: 1,
};
const IRT_SCALE = 1.7; // standard logistic scaling constant from the 3PL/1PL model
const THETA_STEP_SIZE = 1.0; // learning-rate-style step for the simplified MLE-style update

// TSIA2's real CRC test starts test takers at theta = -1.0 on purpose, "to
// allow most test takers a successful experience in the beginning of the
// test" (Technical Manual, Ch. 3, "Initial Trait Level").
export const STARTING_THETA = -1.0;

// theta has no hard floor/ceiling during the test itself — only the final
// score transform clamps to the reportable scale. This display range covers
// the realistic theta spread for a 20-item test with b in [-1, 1].
const THETA_DISPLAY_MIN = -4;
const THETA_DISPLAY_MAX = 4;

export const DEFAULT_MAX_ITEMS = 20;
export const STARTING_DIFFICULTY: ProficiencyLevel = "Proficient";

// Official TSIA2 CRC strand quotas (20 items total per testing experience).
// Source: College Board TSIA2 Mathematics Test Specifications v1.4.
export const STRAND_QUOTAS: Record<Strand, number> = {
  QR: 6,
  AR: 7,
  GR: 3,
  PR: 4,
};

const REQUIRED_FIELDS: (keyof PublicItem)[] = [
  "item_id",
  "primary_strand",
  "proficiency_level",
  "question_text",
  "answer_choices",
];

const DIFFICULTY_ORDER: ProficiencyLevel[] = ["Basic", "Proficient", "Advanced"];

export function difficultyIndex(level: ProficiencyLevel): number {
  return DIFFICULTY_ORDER.indexOf(level);
}

export function nextDifficulty(current: ProficiencyLevel, correct: boolean): ProficiencyLevel {
  const idx = difficultyIndex(current);
  if (correct) return DIFFICULTY_ORDER[Math.min(idx + 1, 2)];
  return DIFFICULTY_ORDER[Math.max(idx - 1, 0)];
}
/**
 * Builds a randomized strand sequence for one testing experience, respecting
 * fixed strand quotas (e.g. 6 QR, 7 AR, 3 GR, 4 PR). The order is shuffled
 * per test so the strand sequence feels organic rather than four visible
 * blocks, while every test still ends up with the exact same count per strand.
 */
export function buildStrandQueue(quotas: Record<Strand, number> = STRAND_QUOTAS): Strand[] {
  const pool: Strand[] = [];
  (Object.keys(quotas) as Strand[]).forEach((strand) => {
    for (let i = 0; i < quotas[strand]; i++) pool.push(strand);
  });
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function validateItems(raw: unknown[]): LoadResult {
  const items: PublicItem[] = [];
  const errors: ItemValidationError[] = [];

  raw.forEach((obj, index) => {
    if (typeof obj !== "object" || obj === null) {
      errors.push({ item_id: `[index ${index}]`, missing: ["(not an object)"] });
      return;
    }
    const record = obj as Record<string, unknown>;
    const missing = REQUIRED_FIELDS.filter((f) => !record[f as string]);
    if (missing.length > 0) {
      errors.push({ item_id: String(record.item_id ?? `[index ${index}]`), missing });
    } else {
      items.push(record as unknown as PublicItem);
    }
  });

  return { items, errors };
}

export function selectNextItem(
  items: PublicItem[],
  seenIds: Set<string>,
  targetDifficulty: ProficiencyLevel,
  targetStrand: Strand
): PublicItem | null {
  const tiers: ProficiencyLevel[] = [targetDifficulty];
  const idx = difficultyIndex(targetDifficulty);
  if (idx > 0) tiers.push(DIFFICULTY_ORDER[idx - 1]);
  if (idx < 2) tiers.push(DIFFICULTY_ORDER[idx + 1]);
  const allTiers = DIFFICULTY_ORDER.filter((t) => !tiers.includes(t));
  tiers.push(...allTiers);

  const strandItems = items.filter((i) => i.primary_strand === targetStrand);

  for (const tier of tiers) {
    const pool = strandItems.filter((i) => i.proficiency_level === tier && !seenIds.has(i.item_id));
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return null;
}

/**
 * Probability of a correct response given ability theta and item difficulty b,
 * under the 1PL logistic model (a = 1, c = 0). Same family of equation as the
 * TSIA2 3PL model, simplified for an uncalibrated item bank.
 */
export function probabilityCorrect(theta: number, b: number): number {
  const exponent = IRT_SCALE * (theta - b);
  return 1 / (1 + Math.exp(-exponent));
}

/**
 * Updates the ability estimate after one response using a single
 * stochastic-approximation step toward the observed outcome, weighted by how
 * surprising that outcome was given the item's difficulty. This approximates
 * one iteration of the Newton-Raphson ability estimation TSIA2 uses, without
 * requiring real calibrated a/b/c parameters.
 *
 * Unlike a flat +/- step, a wrong answer on an easy item moves theta down
 * more than a wrong answer on a hard item (and vice versa for correct
 * answers) — so a string of incorrect answers can't artificially "floor"
 * the estimate the way a fixed-step walk does.
 *
 * No clamping happens here — theta accumulates freely across the test, exactly
 * as in real IRT scoring. Clamping only happens once, in thetaToScore, when
 * converting the final estimate to the reportable scale.
 */
export function updateTheta(theta: number, correct: boolean, difficulty: ProficiencyLevel): number {
  const b = TIER_B[difficulty];
  const predicted = probabilityCorrect(theta, b);
  const outcome = correct ? 1 : 0;
  return theta + THETA_STEP_SIZE * (outcome - predicted);
}

export function thetaToScore(theta: number): number {
  const range = TSIA2_MAX - TSIA2_MIN;
  const mid = (TSIA2_MAX + TSIA2_MIN) / 2;
  const clampedTheta = Math.max(THETA_DISPLAY_MIN, Math.min(THETA_DISPLAY_MAX, theta));
  const score = mid + (clampedTheta / THETA_DISPLAY_MAX) * (range / 2);
  return Math.round(Math.max(TSIA2_MIN, Math.min(TSIA2_MAX, score)));
}

export interface CategoryStats {
  strand: string;
  total: number;
  correct: number;
  pct: number;
}

export function buildCategoryBreakdown(responses: Response[]): CategoryStats[] {
  const map: Record<string, { total: number; correct: number }> = {};
  for (const r of responses) {
    const s = r.item.primary_strand;
    if (!map[s]) map[s] = { total: 0, correct: 0 };
    map[s].total++;
    if (r.isCorrect) map[s].correct++;
  }
  return Object.entries(map).map(([strand, { total, correct }]) => ({
    strand,
    total,
    correct,
    pct: total > 0 ? Math.round((correct / total) * 100) : 0,
  }));
}