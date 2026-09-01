"use client";

import Link from "next/link";
import { useTheme } from "./theme/useTheme";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useBodyBackground } from "./components/useBodyBackground";
import { Entrance } from "./components/Entrance";
import { C, CAT_CSS, FONT_HEADING, SURFACES } from "./adaptive-test/cat-theme";

// ─── WHY THIS IS NOW A CLIENT COMPONENT ──────────────────────────────────────
//
// It was a server component, and it could be, because it had no state: it read
// the global --ec-* variables that ThemeProvider writes onto <html>, and those
// resolve the same whoever renders them.
//
// This pass moves the hero onto the --umc-* scale so it shares one ground, one
// hairline, one grid and one orange CTA with /adaptive-test. Those tokens are
// scoped to a wrapper and flipped by a data-theme attribute, and the value of
// that attribute comes from useTheme() -- a hook, so the wrapper has to be a
// client component. This is the same trade LoginChrome, StartChrome,
// StudentShell and CatChrome all make for the same reason.
//
// The page still prerenders. useTheme's context default is "light", so the
// static HTML is the light hero and the stored preference applies on hydration,
// which is how every other themed surface here already behaves.
//
// ─── WHAT THE BLOB LAYER WAS ─────────────────────────────────────────────────
//
// A fixed, full-viewport, pointer-events-none layer holding three circles at
// 520/460/540px, each blurred 90px, filled --ec-blob-a/b/c. It is deleted
// outright rather than retuned: a 90px gaussian blur is the soft gradient wash
// the flat system exists to replace, and the grid is what takes its place.
//
// --ec-blob-a/b/c are now unreferenced. They stay declared in themes.ts, which
// is locked this pass.

export default function Home() {
  const { theme } = useTheme();

  // The overscroll gutter. C.page is a var() reference and body cannot resolve
  // one declared on a descendant, so the resolved hex is passed. The grid does
  // not extend into the gutter, which is correct: it is a page texture, not a
  // document one.
  useBodyBackground(SURFACES[theme].page);

  return (
    <div
      className="um-home"
      data-theme={theme}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>{CAT_CSS}</style>
      <div style={{ position: "relative" }}>
        <Header />
      </div>
      <main style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px 80px" }}>
        {/* Flat card: hairline, 8px radius, no shadow, no glass, no blur. The
            grid reads through from the ground around it rather than under it,
            which is what keeps the card crisp against the texture.

            Wrapped as ONE unit: the eyebrow, headline, copy, CTA and stat row
            arrive together rather than in sequence. A stagger here would be a
            second opinion about how this page settles, and the hero is a single
            statement. */}
        <Entrance>
        <div style={{
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "48px 36px",
        }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.goldInk }}>
            TSIA2 Math Prep
          </p>
          <h1 style={{ fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 800, color: C.ink, letterSpacing: "-0.03em", lineHeight: 1.08, margin: 0, fontFamily: FONT_HEADING }}>
            Get your score before test day.
          </h1>
          <p style={{ fontSize: "17px", color: C.muted, lineHeight: 1.65, maxWidth: "400px", margin: 0 }}>
            A computer-adaptive practice test built for the TSIA2. Every question adjusts to your level so you always work exactly where it counts.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "340px" }}>
            {/* Orange fill, dark ink. Was --ec-btn-bg, a Deep Navy #1A1F2E
                carrying near-white text, which made the one CTA on the home
                page the only primary action in the product that was not the
                brand orange. */}
            <Link
              href="/adaptive-test"
              style={{
                display: "block", padding: "16px",
                background: C.cta, color: C.ctaInk,
                borderRadius: "8px", fontWeight: 700, fontSize: "16px",
                textDecoration: "none", letterSpacing: "-0.01em",
              }}
            >
              Start My Practice Test
            </Link>
            <p style={{ fontSize: "12px", color: C.muted, margin: 0 }}>
              no account needed · free to use
            </p>
          </div>
          {/* Copy is unchanged and deliberately so: this is a visual pass. The
              "20" here is the published test length and must not drift. */}
          <div style={{ display: "flex", gap: "36px", marginTop: "8px" }}>
            {[["1,100+", "practice items"], ["4", "math strands"], ["20", "questions per test"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>{num}</div>
                <div style={{ fontSize: "11px", color: C.muted, marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        </Entrance>
      </main>
      <Footer />
    </div>
  );
}
