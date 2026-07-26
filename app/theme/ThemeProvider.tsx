"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { themes, type ThemeName } from "./themes";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");

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
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
