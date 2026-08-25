import { createClient } from '../lib/supabase-server';
import { createAdminClient } from '../lib/supabase-admin';

// The four things the teacher rail renders about the person looking at it.
//
// WHY THIS EXISTS. requireWorksheetTeacher() returns a Profile, and a Profile
// carries `plan` but not a name, an email or the founder flag: profiles has no
// name column at all (see displayName in app/lib/auth.ts), so the only name we
// hold for anyone is the one the identity provider wrote into user_metadata.
// Any page that mounts the rail has to go and get those separately.
//
// TWO READS, NOT ONE, AND THE SECOND IS ALLOWED TO FAIL. profiles.is_founder is
// added by sql/founder_flag.sql; until that has run the column does not exist
// and a select naming it errors as a whole. It is read on its own so an unrun
// migration costs a badge rather than the page. This is the same shape, and the
// same reasoning, as the three tolerant reads in app/teacher/page.tsx.
//
// AND IT IS A SECOND COPY OF THEM, DELIBERATELY, FOR NOW. Folding the
// dashboard's own reads into this helper is the obvious tidy-up and it is NOT
// done here: /teacher rendering exactly as it does today is the gate this
// change is measured against, and the two derivations are not in fact
// identical -- page.tsx falls back to the literal 'Teacher' where auth.ts's
// displayName falls back to an empty string. Reconciling that is a behaviour
// question about the dashboard, not part of extracting a sidebar. Flagged for
// the consolidation PR that stacks on this one.

export type TeacherIdentity = {
  teacherName: string;
  teacherEmail: string;
  isFounder: boolean;
};

export async function loadTeacherIdentity(): Promise<TeacherIdentity> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Unreachable through the worksheet routes, which all call
  // requireWorksheetTeacher() first and are redirected away without a session.
  // Answered rather than thrown so a future caller that forgets the gate gets a
  // blank rail instead of a 500 -- the gate is what protects the data, not this.
  if (!session) return { teacherName: 'Teacher', teacherEmail: '', isFounder: false };

  const admin = createAdminClient();
  const { data: founderRow } = await admin
    .from('profiles')
    .select('is_founder')
    .eq('id', session.user.id)
    .maybeSingle();

  const meta = session.user.user_metadata ?? {};
  const teacherName: string =
    meta.full_name || meta.name || (session.user.email?.split('@')[0] ?? 'Teacher');

  return {
    teacherName,
    teacherEmail: session.user.email ?? '',
    isFounder: founderRow?.is_founder === true,
  };
}
