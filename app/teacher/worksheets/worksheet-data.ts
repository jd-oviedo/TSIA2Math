import { redirect, notFound } from 'next/navigation';
import { requireTeacher, profileGrants, type Profile } from '@/app/lib/auth';
import { createAdminClient } from '@/app/lib/supabase-admin';
import { createClient } from '../../lib/supabase-server';
import { renderInlineWithMath } from '../../../lib/curriculum-utils';
import type { ItemRef } from '@/app/lib/worksheet-select';
import type { KeyItem } from '@/app/lib/worksheet-source';

// The gate and the load, shared by every /teacher/worksheets route.
//
// ONE PLACE, because five routes need the identical three-step check and the
// print routes are the ones where getting it wrong is worst: they are
// chrome-free, so a page that renders without its gate looks exactly like a page
// that passed it. There is no nav bar missing to notice.

export type WorksheetRow = {
  id: string;
  title: string;
  course_id: string;
  items: ItemRef[];
  options: {
    topics?: string[];
    count?: number;
    levels?: string[];
    include_quiz?: boolean;
    seed?: number;
  };
  created_at: string;
};

/**
 * Entitled teacher, or a redirect. Never returns an unentitled profile.
 *
 * Both capabilities are checked for the reason the API routes give: 'teacher
 * dashboard' and 'worksheets' are separate grants in capabilities.ts and a plan
 * could hold one without the other.
 */
export async function requireWorksheetTeacher(next: string): Promise<Profile> {
  const profile = await requireTeacher();
  if (!profile) {
    redirect('/login?role=teacher&next=' + encodeURIComponent(next));
  }
  if (!profileGrants(profile, 'worksheets', 'worksheets.page')) {
    redirect('/teacher/inactive');
  }
  return profile;
}

/**
 * One worksheet, scoped to its owner.
 *
 * The teacher_id filter is on the query, not a check after it. The admin client
 * bypasses RLS, so worksheets_select_own does not defend this read -- this
 * filter is the entire tenancy boundary for server-rendered pages.
 *
 * A worksheet belonging to another teacher 404s rather than 403s, so the
 * response cannot be used to confirm that an id exists.
 */
export async function loadWorksheet(id: string, teacherId: string): Promise<WorksheetRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('worksheets')
    .select('id, title, course_id, items, options, created_at')
    .eq('id', id)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (error || !data) notFound();

  return {
    id: data.id as string,
    title: data.title as string,
    course_id: (data.course_id as string) ?? 'tsia2-math',
    items: (Array.isArray(data.items) ? data.items : []) as ItemRef[],
    options: (data.options ?? {}) as WorksheetRow['options'],
    created_at: data.created_at as string,
  };
}

/**
 * Topic name and strand for every topic on a worksheet, keyed on topic_id.
 *
 * PUBLIC PATH. Reads curriculum_topics_public through the anon-capable server
 * client, exactly as the picker does. Neither column is answer-bearing, and
 * fetching them here rather than widening resolveForPrint keeps the two data
 * paths in worksheet-source.ts exactly as they are -- the print resolver still
 * selects nothing but stems and choices.
 *
 * KEYED ON topic_id, WHICH IS WHY IT WORKS FOR BOTH BACKENDS. sql/worksheets.sql
 * carries topic_id on both reference shapes, the static one and the rolled one,
 * so a rolled instance resolves its heading through the same lookup as an
 * authored item. Nothing here needs to know which backend answered.
 *
 * A missing row falls back to the id rather than an empty heading: a worksheet
 * whose topic was renamed should print a slightly stale label, not a blank one.
 */
export type TopicMeta = { topic_name: string; strand: string };

export async function loadTopicMeta(
  courseId: string,
  items: ItemRef[],
): Promise<Record<string, TopicMeta>> {
  const topicIds = [...new Set(items.map((item) => item.topic_id))];
  const meta: Record<string, TopicMeta> = {};
  if (topicIds.length === 0) return meta;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('curriculum_topics_public')
    .select('topic_id, topic_name, related_strand')
    .eq('course_id', courseId)
    .in('topic_id', topicIds);

  // Allowed to fail quietly, like loadProse: a heading is worth less than the
  // questions under it, so a view that has moved should cost the sheet its
  // topic names rather than its render.
  if (error || !data) return meta;

  for (const row of data) {
    const id = row.topic_id as string;
    meta[id] = {
      topic_name: (row.topic_name as string | null) ?? id,
      strand: (row.related_strand as string | null) ?? '',
    };
  }
  return meta;
}

/**
 * The rationales page, one entry per question.
 *
 * THE SOURCE IS distractor_prose, NOT worked_solutions, and the choice is a
 * measurement rather than a preference. Across the 97 topic files the correct-
 * option prose runs a median of 93 characters and p90 of 121; the worked
 * solutions run a median of 346 across a median of 6 block paragraphs. Twenty
 * of the first fit the approved two-column page. Twenty of the second are three
 * to four pages and are not a "page" at all.
 *
 * NO MATH IN THIS FIELD TODAY. Zero of the 1,344 stored correct-option lines
 * contain a dollar sign, so page 3 renders no KaTeX against live content. It is
 * still rendered through renderInlineWithMath rather than printed as text,
 * because this is the field a rationale-authoring pass will enrich, and the day
 * it carries math the page should already know what to do with it. Verified by
 * rendering a synthetic entry, not by assuming.
 *
 * Only the prose goes through the renderer. The "Choice D is correct:" label is
 * markup in the component, so nothing this function writes can be re-read as
 * markdown by the pipeline.
 */
export type Rationale = {
  n: number;
  letter: string;
  /** Rendered prose, or null when the item has no stored rationale. */
  html: string | null;
  /** A rolled instance, whose authored prose names the canonical numbers. */
  generated: boolean;
};

export function buildRationales(items: KeyItem[]): Rationale[] {
  return items.map((item, i) => {
    const right = item.notes.find((note) => note.correct);
    return {
      n: i + 1,
      letter: item.correct_answer,
      html: right ? renderInlineWithMath(right.text) : null,
      generated: item.ref.source === 'instance',
    };
  });
}
