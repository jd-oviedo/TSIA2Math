import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme/ThemeProvider";
import { PostHogProvider } from "./providers";
import { Kodchasan, Nunito } from "next/font/google";
import { ChunkErrorHandler } from './components/ChunkErrorHandler';

const kodchasan = Kodchasan({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-kodchasan",
  display: "swap",
});

// Body/UI face for every surface. Nunito reads as precise rather than playful,
// which is what the dashboards need from labels, tables and data. The weight
// range covers the 400-700 they use.
const nunito = Nunito({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// Explicit viewport so mobile scaling is deterministic rather than relying on
// the framework default. `viewport-fit=cover` pairs with the dvh-based layouts.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "UnpackMath – TSIA2 Prep",
  description: "Computer-adaptive TSIA2 math practice",
  icons: [
    { rel: "icon", url: "/favicon.png?v=1", type: "image/png" },
    { rel: "shortcut icon", url: "/favicon.ico?v=1" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kodchasan.variable} ${nunito.variable}`}>
      <body
        className="min-h-dvh"
        style={{ background: "var(--ec-bg)", color: "var(--ec-ink)" }}
      >
        <PostHogProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </PostHogProvider>
        <ChunkErrorHandler />
      </body>
    </html>
  );
}