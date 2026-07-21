import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme/ThemeProvider";
import { PostHogProvider } from "./providers";
import { Kodchasan, Fredoka } from "next/font/google";
import { ChunkErrorHandler } from './components/ChunkErrorHandler';

const kodchasan = Kodchasan({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-kodchasan",
  display: "swap",
});

// Body/UI face for the teacher-facing surfaces. Fredoka is a variable font, so
// the weight range covers the 400–700 the dashboards use.
const fredoka = Fredoka({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

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
    <html lang="en" className={`${kodchasan.variable} ${fredoka.variable}`}>
      <body
        className="min-h-screen"
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