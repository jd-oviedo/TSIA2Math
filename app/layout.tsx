import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme/ThemeProvider";
import { PostHogProvider } from "./providers";
import { Kodchasan } from "next/font/google";

const kodchasan = Kodchasan({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-kodchasan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UnpackMath – TSIA2 Prep",
  description: "Computer-adaptive TSIA2 math practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={kodchasan.variable}>
      <body
        className="min-h-screen"
        style={{ background: "var(--ec-bg)", color: "var(--ec-ink)" }}
      >
        <PostHogProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}