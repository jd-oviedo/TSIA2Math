import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { displayName, getProfile, profileGrants } from '../lib/auth';
import { loginHref, DEFAULT_NEXT, safeNext } from '../lib/next-param';
import StudentShell from './StudentShell';
import { DASHBOARD_CSS } from './dashboard-css';

// Gate for the whole /dashboard tree.
//
// Teachers are let through read-only rather than bounced to /teacher. The
// teacher sidebar already carries a "Student view" link pointing here, so a
// redirect would turn that link into a loop back to the page it was clicked
// from. They see the student surface with their own (empty) data and a badge
// in the sidebar saying so.

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  if (!profile) {
    // Send them back to the page they actually asked for. This used to be a
    // hardcoded '/dashboard', so a deep link to /dashboard/grades signed you in
    // and then dropped you on the dashboard index.
    //
    // The path comes from middleware.ts as x-pathname, because a layout is given
    // no part of the URL. Falls back to the dashboard index when the header is
    // missing or unusable -- which is the pre-existing behaviour, so a middleware
    // that stopped setting it would be a silent regression to today rather than
    // a broken sign-in.
    //
    // ONLY THIS BRANCH IS TOUCHED. A teacher arriving through the sidebar's
    // "Student view" link is signed in, so `profile` is truthy and none of this
    // runs; the read-only pass-through below is unchanged.
    const requested = (await headers()).get('x-pathname');
    redirect(loginHref(safeNext(requested, DEFAULT_NEXT)));
  }

  if (profile.role !== 'student' && profile.role !== 'teacher') {
    redirect('/');
  }

  // The name the identity provider gave us, not the raw email address.
  //
  // This passed profile.email, so the rail's account chip read "vics8388..."
  // truncated, and StudentNav derived the avatar initials by splitting that same
  // string. displayName() reads full_name then name from auth.users metadata,
  // where Google OAuth writes it, and falls back to the email local part only
  // when there is genuinely no name. /dashboard/settings, /teacher/settings and
  // /teacher have all been using it; these two chips were the stragglers.
  const name = displayName(profile.user_metadata, profile.email);

  return (
    <>
      <style>{DASHBOARD_CSS}</style>
      {/* A derived boolean rather than the raw column. The shell and the rail
          only ever asked "is this an entitled teacher", and passing the flag
          down meant two components had to remember how to answer it. */}
      <StudentShell
        name={name}
        role={profile.role}
        entitledTeacher={profileGrants(profile, 'teacher-dashboard', 'DashboardLayout')}
        plan={profile.plan}
      >
        {children}
      </StudentShell>
    </>
  );
}

// Every page under here is scoped to the signed-in user, so none of it is
// cacheable on the URL alone.
export const dynamic = 'force-dynamic';
