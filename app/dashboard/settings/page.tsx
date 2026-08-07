import { getProfile } from '../../lib/auth';
import { createClient } from '../../lib/supabase-server';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import { Card, Muted, PageHeading } from '../ui';
import SignOutRow from './SignOutRow';

// Student account settings, reached from Account Settings in the sidebar's
// profile menu.
//
// Read-only by design, and the same shape as the teacher's page at
// /teacher/settings. Name and email both come from the Google identity behind
// the session, so neither is editable here -- an input that silently failed to
// persist would be worse than no input at all.
//
// It renders inside the /dashboard layout, so the gate on that layout is the
// gate on this page too.

export default async function StudentSettingsPage() {
  const profile = await getProfile();
  if (!profile) return null; // The layout has already redirected.

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const meta = user?.user_metadata ?? {};
  const name: string =
    meta.full_name || meta.name || (profile.email?.split('@')[0] ?? 'Student');

  return (
    <>
      <PageHeading title="Account settings" blurb="Your UnpackMath account." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding="0">
          <Row label="Name" value={name} />
          <Row label="Email" value={profile.email ?? '—'} />
          <Row label="Role" value={profile.role === 'teacher' ? 'Teacher' : 'Student'} last />
          <div style={{ padding: '14px 24px', borderTop: `1px solid ${V.cardBorder}` }}>
            <Muted size={12.5}>
              Name and email come from the Google account you sign in with. To change either, change
              them in Google and sign in again.
            </Muted>
          </div>
        </Card>

        <Card>
          <SignOutRow />
        </Card>
      </div>
    </>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 24px',
        borderBottom: last ? 'none' : `1px solid ${V.cardBorder}`,
      }}
    >
      <span
        style={{
          font: '600 11px ui-monospace, Menlo, monospace',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: V.dim,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          font: `600 13.5px ${FONT_BODY}`,
          color: V.heading,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}
