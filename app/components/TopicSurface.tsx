'use client';

import { useTheme } from '../theme/useTheme';
import { SURFACES, T } from './curriculum-surface';
import { useBodyBackground } from './useBodyBackground';

// The .um-topic wrapper, as a client component so it can carry data-theme.
//
// WHY THIS EXISTS AT ALL. The curriculum tree's layout is a server component,
// and the theme is only knowable in the browser: ThemeProvider reads the stored
// preference in an effect. So the wrapper element itself has to be a client
// component to set the attribute the CSS switches on. This is the same shape
// app/dashboard/StudentShell.tsx uses for .um-dash, for the same reason, and it
// is the whole structural cost of bringing this tree onto the theme.
//
// The children stay server components. They arrive already rendered and are
// passed straight through, so nothing moves to the browser bundle by being
// wrapped here.
//
// No second theme mechanism: useTheme() is the app's one hook, ThemeProvider is
// already mounted in the root layout, and the choice persists under the existing
// "ec-theme" key. Nothing here reads or writes storage.
//
// FIRST PAINT IS LIGHT, for a dark-mode viewer, for about one frame.
// ThemeProvider initialises to "light" and reads localStorage in an effect, so
// every themed surface in this app flashes light before settling. That is
// pre-existing and app-wide (the dashboard does it too); it is noted here so the
// next person does not read it as a bug introduced by this wrapper.

export default function TopicSurface({
  children,
  fontFamily,
}: {
  children: React.ReactNode;
  fontFamily: string;
}) {
  const { theme } = useTheme();

  // The overscroll gutter behind this wrapper. T.page is a var() reference and
  // body cannot resolve it, so the resolved hex for the current theme is passed.
  useBodyBackground(SURFACES[theme].page);

  return (
    <div
      className="um-topic"
      data-theme={theme}
      style={{
        minHeight: '100dvh',
        background: T.page,
        color: T.ink,
        fontFamily,
      }}
    >
      {children}
    </div>
  );
}
