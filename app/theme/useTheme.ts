"use client";

import { useThemeContext } from "./ThemeProvider";

export function useTheme() {
  return useThemeContext();
}
