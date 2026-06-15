export type ThemeName = "light" | "dark";

export interface Theme {
  name: ThemeName;
  label: string;
  vars: Record<string, string>;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    label: "Light",
    vars: {
      "--ec-bg":            "#F0EDE8",
      "--ec-surface":       "#FFFFFF",
      "--ec-surface2":      "#F7F5F2",
      "--ec-ink":           "#1A1F2E",
      "--ec-ink-muted":     "rgba(26,31,46,0.55)",
      "--ec-ink-faint":     "rgba(26,31,46,0.32)",
      "--ec-line":          "rgba(26,31,46,0.08)",
      "--ec-accent":        "#0F69BA",
      "--ec-accent-soft":   "rgba(15,105,186,0.10)",
      "--ec-green":         "#3D9E6A",
      "--ec-green-bg":      "rgba(61,158,106,0.11)",
      "--ec-green-border":  "rgba(61,158,106,0.32)",
      "--ec-red":           "#C95F55",
      "--ec-red-bg":        "rgba(201,95,85,0.10)",
      "--ec-red-border":    "rgba(201,95,85,0.30)",
      "--ec-orange":        "#CB7119",
      "--ec-orange-bg":     "rgba(203,113,25,0.09)",
      "--ec-orange-border": "rgba(203,113,25,0.28)",
      "--ec-shadow":        "0 2px 16px rgba(26,31,46,0.07)",
      "--ec-shadow-btn":    "0 4px 18px rgba(15,105,186,0.22)",
      "--ec-header-bg":     "rgba(240,237,232,0.88)",
      "--ec-header-border": "rgba(26,31,46,0.08)",
      "--ec-btn-bg":        "#1A1F2E",
      "--ec-btn-text":      "#F0EDE8",
      "--ec-slash-color":   "#F0EDE8",
      "--ec-blob-a":        "rgba(175,208,230,0.55)",
      "--ec-blob-b":        "rgba(185,225,228,0.45)",
      "--ec-blob-c":        "rgba(242,200,148,0.38)",
    },
  },

  dark: {
    name: "dark",
    label: "Dark",
    vars: {
      "--ec-bg":            "#0C1120",
      "--ec-surface":       "#161E30",
      "--ec-surface2":      "#1C2438",
      "--ec-ink":           "#E8EEF8",
      "--ec-ink-muted":     "rgba(232,238,248,0.58)",
      "--ec-ink-faint":     "rgba(232,238,248,0.32)",
      "--ec-line":          "rgba(255,255,255,0.07)",
      "--ec-accent":        "#5AAAEE",
      "--ec-accent-soft":   "rgba(90,170,238,0.12)",
      "--ec-green":         "#5BC48A",
      "--ec-green-bg":      "rgba(91,196,138,0.10)",
      "--ec-green-border":  "rgba(91,196,138,0.30)",
      "--ec-red":           "#E07B72",
      "--ec-red-bg":        "rgba(224,123,114,0.10)",
      "--ec-red-border":    "rgba(224,123,114,0.30)",
      "--ec-orange":        "#F2A541",
      "--ec-orange-bg":     "rgba(242,165,65,0.09)",
      "--ec-orange-border": "rgba(242,165,65,0.28)",
      "--ec-shadow":        "0 2px 20px rgba(0,0,0,0.32)",
      "--ec-shadow-btn":    "0 4px 18px rgba(90,170,238,0.22)",
      "--ec-header-bg":     "rgba(12,17,32,0.92)",
      "--ec-header-border": "rgba(255,255,255,0.07)",
      "--ec-btn-bg":        "#5AAAEE",
      "--ec-btn-text":      "#0C1120",
      "--ec-slash-color":   "#0C1120",
      "--ec-blob-a":        "rgba(15,40,80,0.80)",
      "--ec-blob-b":        "rgba(10,50,60,0.70)",
      "--ec-blob-c":        "rgba(120,60,5,0.60)",  // warm orange for dark mode
    },
  },
};
