import type { Metadata } from "next";
import { Hanken_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme/ThemeProvider";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdCipher Math – TSIA2 Prep",
  description: "Computer-adaptive TSIA2 math practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${playfair.variable}`}>
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
