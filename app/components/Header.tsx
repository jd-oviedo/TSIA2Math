"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "../theme/useTheme";
import { supabase } from "../lib/supabase";
import { LogoutButton } from "./LogoutButton";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Switch light or dark mode"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        border: "1px solid var(--ec-line)",
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

type NavRole = "teacher" | "student" | "anon";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navRole, setNavRole] = useState<NavRole>("anon");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setNavRole("anon"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, subscription_status")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "teacher" && profile?.subscription_status === "active") {
        setNavRole("teacher");
      } else if (session) {
        setNavRole("student");
      }
    }
    checkRole();
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
          background: "var(--ec-header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--ec-header-border)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)"
            : "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.25s ease",
        }}
      >
        
        <a  href="https://www.unpackmath.com"
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
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.35)",
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
              width={42}
              height={42}
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
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {navRole === "teacher" && (
            
            <a  href="/teacher"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#C68A2F",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(198,138,47,0.35)",
                background: "rgba(198,138,47,0.08)",
                whiteSpace: "nowrap",
              }}
            >
              Teacher Dashboard
            </a>
          )}
          {navRole === "student" && (
            
            <a  href="/dashboard"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ec-ink-muted)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "999px",
                border: "1px solid var(--ec-line)",
                whiteSpace: "nowrap",
              }}
            >
              My Dashboard
            </a>
          )}
          {navRole !== "anon" && <LogoutButton />}
          <ThemeToggle />
        </div>
      </nav>
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
      <p style={{ margin: 0, fontFamily: "var(--font-kodchasan, Kodchasan, sans-serif)" }}>
        &copy; {new Date().getFullYear()} UnpackMath &middot;{" "}
        <a href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>privacy</a>
        {" "}&middot;{" "}
        <a href="/terms" style={{ color: "inherit", textDecoration: "underline" }}>terms</a>
      </p>
    </footer>
  );
}