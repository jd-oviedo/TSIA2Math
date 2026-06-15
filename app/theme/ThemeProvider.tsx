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
    const stored = localStorage.getItem("ec-theme") as ThemeName | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const vars = themes[theme].vars;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem("ec-theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
