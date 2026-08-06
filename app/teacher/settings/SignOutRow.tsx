'use client';

import { LogoutButton } from '../../components/LogoutButton';

// Sign-out row for the settings page. The button itself is the shared
// LogoutButton so the sign-out path stays in one place; this only supplies the
// label beside it, and the light variant to suit the white card.
export default function SignOutRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A' }}>Sign out</div>
        <div style={{ marginTop: 3, fontSize: 12.5, color: '#8A8983' }}>
          Ends this session on this device.
        </div>
      </div>
      <LogoutButton variant="light" size={34} />
    </div>
  );
}
