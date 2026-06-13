import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme/ThemeProvider";

export const metadata: Metadata = {
  title: "EdCipher Math – TSIA2 Prep",
  description: "Computer-adaptive TSIA2 math practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen"
        style={{ background: "var(--ec-bg)", color: "var(--ec-ink)" }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
