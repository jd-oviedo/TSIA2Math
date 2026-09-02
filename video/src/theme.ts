// Brand tokens for the video. Mirrors app/components/curriculum-theme and
// dashboard-theme in the Next app so the frames look like the product.
import { loadFont as loadKodchasan } from "@remotion/google-fonts/Kodchasan";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";

const kodchasan = loadKodchasan("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const nunito = loadNunito("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// Kodchasan for headings and captions, Nunito for body and tables.
export const FONT_HEADING = `${kodchasan.fontFamily}, Kodchasan, sans-serif`;
export const FONT_BODY = `${nunito.fontFamily}, Nunito, sans-serif`;
export const FONT_MONO = `ui-monospace, Menlo, "Courier New", monospace`;

export const C = {
  cream: "#E8E0CF",
  sand: "#F2EDDF",
  paper: "#FFFDF8",
  sunset: "#F0A33E",
  sunsetPressed: "#D98C2C",
  sky: "#87CEEB",
  gemini: "#6E9DC8",
  midnight: "#0E0E11",
  navy: "#0F1E35",
  ink: "#1A1A1A",
  heading: "#0F1E35",
  muted: "#5F5E5A",
  dim: "#6B6A65",
  placeholder: "#9A9891",
  line: "#E7E5DD",
  hairline: "#F0EEE7",
  border: "#D3D1C7",
  pageBg: "#F5F5F3",
  white: "#FFFFFF",
  subtle: "#FBFBF9",
  chipBg: "#EDEBE4",
  focusCard: "#F7F1E4",
  green: "#3F7150",
  greenBg: "#EDF3EA",
  warn: "#A8631F",
  warnBg: "#FBF0E2",
  link: "#2F6091",
  sidebarText: "#E8E0CF",
  sidebarMuted: "rgba(232, 224, 207, 0.6)",
  sidebarRule: "rgba(255, 255, 255, 0.08)",
  overlay: "rgba(14, 14, 17, 0.42)",
  gridLine: "#ECE7DA",
  qr: "#C9D6EE",
  pr: "#D9CCEE",
};
