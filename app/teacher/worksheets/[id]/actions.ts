'use server';

import { requireWorksheetTeacher, loadWorksheet, buildRationales, type Rationale } from '../worksheet-data';
import { resolveForKey, type KeyItem } from '../../../lib/worksheet-source';

// THE ANSWER KEY, FETCHED ONLY WHEN A TEACHER ASKS FOR IT.
//
// The key used to be its own route. Folding the two routes into one page means
// something has to go and get the answers when the Answer key tab is selected,
// and this is deliberately a SERVER ACTION rather than a route handler.
//
// Both designs would carry identical gating. The difference is the shape of
// what gets minted. GET /api/teacher/worksheets/[id]/key would be a stable,
// guessable, machine-readable URL that returns every answer on a worksheet: one
// leaked session cookie away from being scriptable across every id a teacher
// owns, and the sort of thing that ends up in browser history, a proxy log or a
// pasted bug report. A server action has no stable URL and is POST-only.
// Neither is a security boundary by itself. Given two equally gated designs,
// the one that does not mint the endpoint is the one to build. This is the same
// leak class as the answer-key exposure that had to be closed on the base
// tables, and it is worth not re-opening a door of that shape.
//
// THE GATE RUNS HERE, NOT IN THE CALLER. A server action is an entry point: it
// is reachable by anything that can POST to it, so it repeats the page's checks
// rather than trusting that a page ran them. In the same order, and no weaker
// than the route it replaces:
//
//   1. requireWorksheetTeacher()  -- requireTeacher() plus the 'worksheets'
//      grant; redirects rather than returning an unentitled profile.
//   2. loadWorksheet(id, profile.id)  -- the .eq('teacher_id') filter is the
//      entire tenancy boundary, because the admin client bypasses RLS. Another
//      teacher's id 404s rather than 403s, so the answer cannot be used to
//      confirm an id exists.
//
// Only after both does resolveForKey touch curriculum_topics, the BASE table,
// for correct_answer and the authored prose.

/** Exactly what AnswerKeySheet renders, and nothing else. */
export type KeyPayload = {
  items: KeyItem[];
  created: string;
  rationales: Rationale[];
};

export async function loadAnswerKey(worksheetId: string): Promise<KeyPayload> {
  const profile = await requireWorksheetTeacher(`/teacher/worksheets/${worksheetId}`);
  const worksheet = await loadWorksheet(worksheetId, profile.id);

  const resolved = await resolveForKey(worksheet.course_id, worksheet.items);
  const rationales = buildRationales(resolved);

  const created = new Date(worksheet.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // NARROWED ON THE WAY OUT, and this is the second half of the isolation.
  //
  // resolveForKey returns full KeyItems: every stem, every choice, every worked
  // solution and a teacher-facing note for every WRONG option too. AnswerKeySheet
  // reads three things off them -- items.length, item.topic_id for the React key,
  // and item.correct_answer -- and buildRationales has already taken the correct
  // option's prose. Serialising the rest would put every worked solution and
  // every distractor rationale in the browser payload for nothing on paper.
  //
  // Rebuilt rather than deleted-from, so a field ADDED to KeyItem later arrives
  // here as a type error rather than silently riding along to the client.
  //
  // The printed output is unaffected: none of the emptied fields is rendered by
  // AnswerKeySheet, and its prop type is untouched, which guardrail A requires.
  const items: KeyItem[] = resolved.map((item) => ({
    ref: item.ref,
    topic_id: item.topic_id,
    stem_html: '',
    choices_html: {},
    correct_answer: item.correct_answer,
    solution_html: null,
    notes: [],
  }));

  return { items, created, rationales };
}
