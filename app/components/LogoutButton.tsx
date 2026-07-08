"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

// Small circular icon button that signs the current user out of Supabase and
// sends them to /login. Used in the teacher sidebar chip (dark) and the shared
// Header (light). Redirect uses window.location to match this codebase's
// client-side redirect convention (no useRouter is used anywhere).
export function LogoutButton({
  variant = "light",
  size = 34,
}: {
  variant?: "light" | "dark";
  size?: number;
}) {
  const [loading, setLoading] = useState(false);
  const dark = variant === "dark";

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      // Redirect regardless — a failed signOut still shouldn't strand the user.
      window.location.href = "/login";
    }
  };

  const idleBg = dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)";
  const hoverBg = dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.32)";

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out"
      title="Log out"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid var(--ec-line)",
        background: idleBg,
        color: dark ? "rgba(255,255,255,0.7)" : "var(--ec-ink-muted)",
        cursor: loading ? "default" : "pointer",
        flexShrink: 0,
        opacity: loading ? 0.6 : 1,
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idleBg; }}
    >
      <svg
        width={Math.round(size * 0.47)}
        height={Math.round(size * 0.47)}
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 15.5 H3.5 A1.5 1.5 0 0 1 2 14 V4 A1.5 1.5 0 0 1 3.5 2.5 H7" />
        <polyline points="11 12.5 14.5 9 11 5.5" />
        <line x1="14.5" y1="9" x2="6.5" y2="9" />
      </svg>
    </button>
  );
}
