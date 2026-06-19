import type { Item, ItemValidationError, LoadResult, ProficiencyLevel, Response, Strand } from "./type";

export const TSIA2_MIN = 910;
export const TSIA2_MAX = 990;
export const TSIA2_PASSING = 950;
export const THETA_MIN = -3;
export const THETA_MAX = 3;
export const THETA_STEP = 0.5;
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

const REQUIRED_FIELDS: (keyof Item)[] = [
  "item_id",
  "primary_strand",
  "proficiency_level",
  "question_text",
  "answer_choices",
  "correct_answer",
  "explanation",
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
  const items: Item[] = [];
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
      items.push(record as unknown as Item);
    }
  });

  return { items, errors };
}

export function selectNextItem(
  items: Item[],
  seenIds: Set<string>,
  targetDifficulty: ProficiencyLevel,
  targetStrand: Strand
): Item | null {
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

export function updateTheta(theta: number, correct: boolean): number {
  const delta = correct ? THETA_STEP : -THETA_STEP;
  return Math.max(THETA_MIN, Math.min(THETA_MAX, theta + delta));
}

export function thetaToScore(theta: number): number {
  const range = TSIA2_MAX - TSIA2_MIN;
  const mid = (TSIA2_MAX + TSIA2_MIN) / 2;
  const score = mid + (theta / THETA_MAX) * (range / 2);
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