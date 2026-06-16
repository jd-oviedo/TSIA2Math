import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme/ThemeProvider";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UnpackMath – TSIA2 Prep",
  description: "Computer-adaptive TSIA2 math practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={hanken.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-mono-tc-webfont@1.7.0/style.css"
        />
      </head>
      <body
        className="min-h-screen"
        style={{
          background: "var(--ec-bg)",
          color: "var(--ec-ink)",
          fontFamily: "var(--font-hanken), system-ui, sans-serif",
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
