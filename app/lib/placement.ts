// Placement banding and strand accuracy, shared between the teacher dashboard
// and the CSV exports.
//
// WHY THIS MODULE EXISTS
//
// Neither the band nor the per-strand percentage is stored anywhere. Both are
// display logic: `sessions` holds `final_score` and a `strand_breakdown` jsonb,
// and everything a teacher actually reads on the dashboard is computed from
// those two in the browser.
//
// That is fine while one surface renders them. It stops being fine the moment a
// CSV claims to be the same numbers, because a second implementation of
// `placementBand` means the file and the screen agree only until somebody moves
// a threshold. The export is supposed to be evidence a teacher can hand to an
// administrator; "the dashboard says College ready and the spreadsheet says
// Approaching" destroys that in one sitting.
//
// So this is the single definition, imported by both. It is deliberately free
// of React and of any server-only import so it can be used from a client
// component and from a route handler without a second copy.

export type Strand = "QR" | "AR" | "GR" | "PR";

/** Fixed reporting order. Used for columns in the CSV and bars on the screen. */
export const STRAND_ORDER: Strand[] = ["QR", "AR", "GR", "PR"];

export interface StrandBreakdown {
  QR?: { pct: number; total: number; correct: number };
  AR?: { pct: number; total: number; correct: number };
  GR?: { pct: number; total: number; correct: number };
  PR?: { pct: number; total: number; correct: number };
}

/** TSIA2 college-readiness cut score. */
export const PASSING = 950;

export interface PlacementBand {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

/**
 * The badge a score earns.
 *
 * The colours ride along because the dashboard needs them and splitting label
 * from swatch would mean two lookups that could drift apart. The export reads
 * `.label` and ignores the rest.
 */
export function placementBand(score: number | null): PlacementBand {
  if (score === null) return { label: "No test yet", bg: "#F0EEE7", text: "#5F5E5A", dot: "#B4B2A8" };
  if (score >= PASSING) return { label: "College ready", bg: "#EAF3DE", text: "#356B1B", dot: "#4F9A2E" };
  if (score >= 935) return { label: "Approaching", bg: "#FAEEDA", text: "#8A5712", dot: "#C68A2F" };
  return { label: "Below college ready", bg: "#FCEBEB", text: "#9A2A2A", dot: "#C2402F" };
}

/**
 * Per-strand accuracy percentages, defaulting a missing strand to 0.
 *
 * The zero default is the dashboard's existing behaviour and is preserved
 * rather than corrected: a strand with no items answered shows as 0% on screen,
 * so it must show as 0 in the file. Changing it here would be a dashboard
 * change wearing an export change's clothes.
 */
export function strandPcts(bd: StrandBreakdown | null): Record<Strand, number> {
  return {
    QR: bd?.QR?.pct ?? 0,
    AR: bd?.AR?.pct ?? 0,
    GR: bd?.GR?.pct ?? 0,
    PR: bd?.PR?.pct ?? 0,
  };
}
