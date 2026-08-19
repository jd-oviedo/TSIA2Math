import { redirect, notFound } from 'next/navigation';
import { requireTeacher, profileGrants, type Profile } from '@/app/lib/auth';
import { createAdminClient } from '@/app/lib/supabase-admin';
import type { ItemRef } from '@/app/lib/worksheet-select';

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
