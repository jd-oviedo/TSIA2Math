"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "../theme/useTheme";
import { supabase } from "../lib/supabase";
import { planGrants } from "../lib/capabilities";
import { isEntitledWithLegacyFallback } from "../lib/entitlement";
import { LogoutButton } from "./LogoutButton";
import { CalculatorToggle } from "./Calculator";

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

// showCalculator is opt-in, and defaults to off.
//
// The calculator used to render on every page that mounts this header, which
// is the home page, the login page and all five phases of /adaptive-test --
// including the pre-test screen and the results screen. It is a testing aid,
// so it belongs to exactly one of those: a test that is actually in progress.
//
// Default false rather than true so that a new page mounting this header has
// to ask for the calculator rather than inherit it. Adding a surface should
// not silently hand a student a calculator on a page that has no test on it.
export function Header({ showCalculator = false }: { showCalculator?: boolean } = {}) {
  const [navRole, setNavRole] = useState<NavRole>("anon");

  // THE SCROLL LISTENER THAT USED TO SIT HERE IS GONE, and it is worth saying
  // why rather than letting it look like an oversight. It set a `scrolled`
  // boolean whose ONLY consumer was the pill's box-shadow, deepening it once
  // the page moved. The bar is flat now, so the state had no reader left and
  // the listener was running on every scroll frame of both surfaces that mount
  // this header for nothing.
  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setNavRole("anon"); return; }

      // The user's OWN row, under the "users can read own profile" policy, so
      // widening the select leaks nothing new: these columns were already
      // readable by the person they describe.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, subscription_status, plan, plan_status, access_until")
        .eq("id", session.user.id)
        .single();

      // Cosmetic, and the last of the six subscription_status readers to move.
      // The predicate is the shared one rather than a second copy of the rule:
      // both entitlement.ts and capabilities.ts import nothing at runtime, so
      // using them here costs the browser bundle nothing.
      //
      // STILL A CLIENT-SIDE READ, which is worth naming rather than leaving
      // implicit. Nothing is gated on this. It picks which nav shape to draw,
      // and every real decision is made on the server. Feeding it from the
      // server instead would be better and is a wider change than moving a
      // reader.
      const isTeacher =
        profile?.role === "teacher" &&
        planGrants(profile?.plan, "teacher-dashboard") &&
        isEntitledWithLegacyFallback(
          profile?.plan_status,
          profile?.access_until,
          profile?.subscription_status,
          "Header"
        );

      if (isTeacher) {
        setNavRole("teacher");
      } else if (session) {
        setNavRole("student");
      }
    }
    checkRole();
  }, []);

  // A FLAT FULL-WIDTH BAR, NOT A FLOATING PILL.
  //
  // What went: the outer 12px inset, the nav's maxWidth 800px, the 999px
  // radius, the 20px backdrop blur, the two-layer box-shadow and its scroll
  // transition. What arrived: one hairline along the bottom edge.
  //
  // ─── WHY THE FILL IS A VAR WITH A FALLBACK ─────────────────────────────────
  //
  // This component is shared, and it is rendered by exactly two surfaces: the
  // home hero (.um-home) and the adaptive test (.um-cat). Both declare the
  // --umc-* scale, so var(--umc-card) resolves inside either one, in both
  // themes, with no prop threaded through.
  //
  // THE BAR IS A CARD SURFACE, NOT THE PAGE GROUND. It was --umc-page, which
  // is the same value the page under it uses -- so once the grid arrived the
  // bar had nothing separating it from the texture and read as a strip of
  // gridded page with a line under it. --umc-card lifts it off: #FFFFFF over
  // #F5F5F3 in light, #17171B over #0E0E11 in dark. The hairline still does
  // the edge; the fill now does the separation.
  //
  // The fallback is the load-bearing half. Custom properties do not inherit
  // from nowhere: rendered OUTSIDE both scopes, var(--umc-card) would resolve
  // to nothing, and an unresolved var() in `background` is guaranteed-invalid,
  // so the bar would silently paint TRANSPARENT over the scrolling content
  // beneath it. --ec-surface is the global card token, so a third surface
  // adopting this header gets a card-coloured bar rather than a bug nobody
  // would see in review.
  //
  // --ec-header-bg and --ec-header-border are no longer referenced anywhere.
  // They are left declared in themes.ts, which is locked this pass.
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <nav
        className="um-nav"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "10px 24px",
          width: "100%",
          boxSizing: "border-box",
          background: "var(--umc-card, var(--ec-surface))",
          borderBottom: "1px solid var(--umc-border, var(--ec-line))",
        }}
      >
        {/* Small-screen guard: the "…Dashboard" pill truncates (ellipsis) so the
            logout + theme-toggle icons never clip off the right edge. */}
        <style>{`
          .um-navpill {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          @media (max-width: 420px) {
            .um-nav { gap: 10px; }
          }
        `}</style>

        <a  href="https://www.unpackmath.com"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/unpackmath-wordmark.png"
            alt="UnpackMath"
            width={2000}
            height={485}
            style={{ height: "31px", width: "auto" }}
          />
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          {navRole === "teacher" && (

            <a  href="/teacher"
              className="um-navpill"
              title="Teacher Dashboard"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#C68A2F",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "8px",
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
              className="um-navpill"
              title="My Dashboard"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--ec-ink-muted)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid var(--ec-line)",
                whiteSpace: "nowrap",
              }}
            >
              My Dashboard
            </a>
          )}
          {navRole !== "anon" && <LogoutButton />}
          {showCalculator && <CalculatorToggle />}
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