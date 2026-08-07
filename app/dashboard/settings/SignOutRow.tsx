'use client';

import { LogoutButton } from '@/app/components/LogoutButton';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import { useTheme } from '@/app/theme/useTheme';

// Sign-out row for the student settings page. The button itself is the shared
// LogoutButton so the sign-out path stays in one place; this only supplies the
// label beside it. Never the "light" variant: that one runs on the --ec
// variables, whose palette is not this surface's.
export default function SignOutRow() {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ font: `600 13.5px ${FONT_BODY}`, color: V.heading }}>Sign out</div>
        <div style={{ marginTop: 3, font: `400 12.5px ${FONT_BODY}`, color: V.muted }}>
          Ends this session on this device.
        </div>
      </div>
      <LogoutButton variant={theme === 'dark' ? 'dark' : 'cream'} size={34} />
    </div>
  );
}
