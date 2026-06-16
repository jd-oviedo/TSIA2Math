"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../theme/useTheme";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Switch light or dark mode"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "40px", height: "40px", borderRadius: "50%",
        border: "1px solid var(--ec-line)",
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        cursor: "pointer",
        color: "var(--ec-ink-muted)",
        transition: "background 0.3s",
      }}
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4.5" /><line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4.5" y2="12" /><line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" /><line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
          <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" /><line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
        </svg>
      )}
    </button>
  );
}

export function Header() {
  return (
    <header style={{
      position: "relative",
      zIndex: 10,
      padding: "14px 24px",
      maxWidth: "800px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <Image
          src="/unpackmath-logo.png"
          alt="UnpackMath logo"
          width={32}
          height={32}
          style={{ objectFit: "contain" }}
        />
        <span style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--ec-ink)",
          fontFamily: "'LXGW WenKai Mono TC', monospace",
          letterSpacing: "-0.01em",
        }}>
          UnpackMath – TSIA2 Math Practice Test
        </span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
