"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { themes, type ThemeName } from "./themes";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  /**
   * Has the stored preference been read yet?
   *
   * WHY THIS EXISTS. `theme` starts at "light" and only becomes the visitor's
   * actual choice after the localStorage read below, which is an effect and so
   * runs after the first paint. For most consumers that does not matter -- they
   * read a colour and re-render. It matters enormously to anything that
   * ANIMATES on load: a surface that starts its entrance on mount is animating
   * across the frame where the ground flips from the default light to the
   * stored dark, and the flip reads as jank on top of the fade.
   *
   * false until the read has happened, true forever after, whether or not
   * anything was stored. Consumers that do not care can ignore it entirely;
   * nothing about the existing contract changes.
   */
  hydrated: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  hydrated: false,
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage throws SecurityError in the Instagram in-app browser and iOS
    // private mode. A missing preference just falls back to the "light" default.
    try {
      const stored = localStorage.getItem("ec-theme") as ThemeName | null;
      if (stored && (stored === "light" || stored === "dark")) {
        setThemeState(stored);
      }
    } catch {
      // no persisted theme available -- keep the default
    }
    // SET UNCONDITIONALLY, INCLUDING DOWN THE catch. "Hydrated" means the read
    // has been ATTEMPTED, not that it succeeded: a browser that refuses
    // localStorage has settled on the default just as finally as one that
    // returned a value, and a consumer waiting on this must not wait forever
    // because storage threw.
    //
    // Batched with setThemeState above into a single commit by React 18, so no
    // consumer ever observes hydrated=true alongside a stale theme.
    setHydrated(true);
  }, []);

  useEffect(() => {
    const vars = themes[theme].vars;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    // Same SecurityError guard: applying the theme to the DOM must not depend on
    // being able to persist it.
    try {
      localStorage.setItem("ec-theme", theme);
    } catch {
      // persistence unavailable -- theme still applies for this session
    }
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, hydrated }}>
      {children}
    </ThemeContext.Provider>
  );
}
