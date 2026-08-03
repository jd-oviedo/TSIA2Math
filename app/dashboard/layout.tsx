import { redirect } from 'next/navigation';
import { getProfile } from '../lib/auth';
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
    redirect('/login?next=' + encodeURIComponent('/dashboard'));
  }

  if (profile.role !== 'student' && profile.role !== 'teacher') {
    redirect('/');
  }

  const name = profile.email ?? 'Student';

  return (
    <>
      <style>{DASHBOARD_CSS}</style>
      <StudentShell name={name} role={profile.role} subscriptionStatus={profile.subscription_status}>
        {children}
      </StudentShell>
    </>
  );
}

// Every page under here is scoped to the signed-in user, so none of it is
// cacheable on the URL alone.
export const dynamic = 'force-dynamic';
