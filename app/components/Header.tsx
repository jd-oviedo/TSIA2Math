"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../theme/useTheme";
import { themes, type ThemeName } from "../theme/themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "abyss" || theme === "ember";

  const cycle = () => {
    if (theme === "sand") setTheme("abyss");
    else if (theme === "abyss") setTheme("ember");
    else setTheme("sand");
  };

  return (
    <button
      onClick={cycle}
      aria-label="Switch theme"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        border: "1px solid var(--ec-card-border)",
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        cursor: "pointer",
        flexShrink: 0,
        fontSize: "15px",
        transition: "background 0.15s ease",
      }}
    >
      {isDark ? "☼" : "☾"}
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "12px 16px",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          pointerEvents: "all",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "8px 12px 8px 8px",
          borderRadius: "999px",
          maxWidth: "800px",
          width: "100%",
          background: scrolled
            ? "var(--ec-header-bg)"
            : "var(--ec-header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--ec-header-border)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)"
            : "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.25s ease, background 0.25s ease",
        }}
      >
        {/* Logo + wordmark */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--ec-glass-bg)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid var(--ec-glass-border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <Image
              src="/unpackmath-logo.png"
              alt="UnpackMath logo"
              width={24}
              height={24}
              style={{ objectFit: "contain" }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-kodchasan, 'Kodchasan', sans-serif)",
              fontWeight: 600,
              fontSize: "15px",
              color: "var(--ec-ink)",
              letterSpacing: "0.04em",
            }}
          >
            UnpackMath
          </span>
        </Link>

        {/* Right side: theme switcher pill + toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <ThemeSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const options: ThemeName[] = ["sand", "ember", "abyss"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        background: "var(--ec-pill-track)",
        borderRadius: "99px",
        padding: "3px",
      }}
    >
      {options.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          style={{
            padding: "5px 13px",
            borderRadius: "99px",
            border: theme === t ? "1px solid var(--ec-accent-border)" : "1px solid transparent",
            background: theme === t ? "var(--ec-pill-active-bg)" : "transparent",
            color: theme === t ? "var(--ec-pill-active-text)" : "var(--ec-pill-inactive-text)",
            fontFamily: "inherit",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.03em",
            transition: "all 0.18s ease",
          }}
        >
          {themes[t].label}
        </button>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        padding: "40px 24px",
        textAlign: "center",
        fontSize: "13px",
        color: "var(--ec-ink-muted)",
      }}
    >
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} JDOM LLC &middot;{" "}
        <a href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>privacy</a>
        {" "}&middot;{" "}
        <a href="/terms" style={{ color: "inherit", textDecoration: "underline" }}>terms</a>
      </p>
    </footer>
  );
}
