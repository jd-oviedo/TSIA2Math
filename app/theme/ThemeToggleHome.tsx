"use client";

import { ThemeModeButton } from "../components/ThemeModeButton";

// The 44px toggle for the marketing surfaces. It used to carry its own copy of
// the switch; the sun/moon artwork and the useTheme() call both moved into
// ThemeModeButton when the student dashboard needed the same control, and this
// is now just that component wearing the --ec variables.
export function ThemeToggleHome() {
  return (
    <ThemeModeButton
      size={44}
      bg="var(--ec-surface)"
      border="var(--ec-line)"
      color="var(--ec-ink-muted)"
      shadow="var(--ec-shadow)"
    />
  );
}
