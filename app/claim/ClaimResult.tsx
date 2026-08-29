import Link from "next/link";
import { FONT_HEADING, FONT_BODY, FONT_BASE_CSS } from "../components/fonts";
import type { Plan } from "../lib/products";
import type { ClaimOutcome } from "../lib/pending-entitlements";
import { MOTION_CSS } from '../motion';

// The claim outcomes, plus the one state that is not an outcome at all: the
// rate limiter turned them away before a claim was attempted. It shares this
// screen because it is the same question being answered -- "what happened to my
// purchase" -- and the answer is "nothing yet, and nothing was used up".
export type ClaimScreen = ClaimOutcome | "rate-limited";

// What the buyer sees after /claim has run. A server component: nothing here is
// interactive, so none of it needs to ship to the browser.
//
// SIX OUTCOMES, AND THEY DO NOT COLLAPSE INTO "worked" AND "didn't". Two of them
// look like failure to the buyer but mean their purchase is safe and held
// ("no-profile", "refused"), and one looks like failure but means they already
// have what they paid for ("already-claimed"). Telling someone their purchase is
// gone when it is sitting in a table waiting for them is the same class of
// mistake as the ops email that used to say the same thing.

const GOLD = "#C68A2F";
const NAVY = "#0F1E35";

const PLAN_LABELS: Record<Plan, string> = {
  "practice-pass": "Practice Pass",
  "full-course": "Full Course",
  "teacher-core": "Teacher Core",
  "teacher-pro": "Teacher Pro",
};

// Where "Continue" goes. A teacher plan earns the teacher dashboard; everything
// else lands on the student dashboard. Both destinations gate themselves, so a
// wrong guess here is a redirect, never access.
function destinationFor(plan: Plan | null): { href: string; label: string } {
  if (plan === "teacher-core" || plan === "teacher-pro") {
    return { href: "/teacher", label: "Go to your dashboard" };
  }
  return { href: "/dashboard", label: "Go to your dashboard" };
}

type Copy = {
  badge: string;
  /** Green when the buyer has access, amber when we are holding it, red when a
   *  person has to get involved. */
  tone: "good" | "holding" | "bad";
  heading: string;
  body: string;
  /** Omitted when there is nowhere useful to send them. */
  cta: boolean;
};

function copyFor(outcome: ClaimScreen, planLabel: string | null): Copy {
  switch (outcome) {
    case "claimed":
      return {
        badge: "CLAIMED",
        tone: "good",
        heading: "You're in.",
        body: planLabel
          ? `Your ${planLabel} is now on this account.`
          : "Your purchase is now on this account.",
        cta: true,
      };

    // The purchase is real and the account already carries something newer, so
    // from where the buyer stands this is a success. The conflict has already
    // raised an alert on our side; there is nothing for them to do about it and
    // nothing useful we could tell them.
    case "stale":
      return {
        badge: "ALREADY ACTIVE",
        tone: "good",
        heading: "This account is already set up.",
        body: "Your purchase is recorded, and the access already on this account is the newer of the two. Nothing else is needed.",
        cta: true,
      };

    case "already-claimed":
      return {
        badge: "ALREADY CLAIMED",
        tone: "holding",
        heading: "This link has already been used.",
        body: "A claim link works once. If you already signed in and have access, you're all set — if this wasn't you, or you still can't get in, email support@unpackmath.com and we'll sort it out.",
        cta: true,
      };

    case "nothing-owed":
      return {
        badge: "NOT FOUND",
        tone: "holding",
        heading: "We don't have a purchase for this link.",
        body: "Either the link is incomplete, or the purchase was already applied to an account automatically. Try signing in first — and if you still don't have access, email support@unpackmath.com with your receipt and we'll fix it by hand.",
        cta: true,
      };

    // Nothing was attempted, so nothing was consumed. Said plainly, because the
    // fear this screen has to answer is "did I just burn my one-use link".
    case "rate-limited":
      return {
        badge: "TOO MANY ATTEMPTS",
        tone: "holding",
        heading: "Give it an hour.",
        body: "You've tried this a few too many times. Your purchase hasn't been used up and the link still works — wait an hour and try again, or email support@unpackmath.com if you'd rather we just applied it.",
        cta: false,
      };

    // NEITHER OF THESE MAY SAY THE PURCHASE IS LOST. In both, the row was
    // deliberately left unclaimed, so it is still owed and still claimable.
    case "no-profile":
    case "refused":
      return {
        badge: "HOLDING",
        tone: "bad",
        heading: "Something went wrong on our side.",
        body: "Your purchase is safe — it's recorded and still waiting for you, and nothing about it has been used up. We've been alerted automatically. Try again in a few minutes, or email support@unpackmath.com and we'll apply it by hand.",
        cta: false,
      };
  }
}

const TONES: Record<Copy["tone"], { border: string; text: string; dot: string }> = {
  good: { border: "rgba(198,138,47,0.45)", text: "#E7BE7B", dot: GOLD },
  holding: { border: "rgba(255,255,255,0.22)", text: "rgba(255,255,255,0.7)", dot: "rgba(255,255,255,0.5)" },
  bad: { border: "rgba(224,138,138,0.45)", text: "#E8A5A5", dot: "#C46B6B" },
};

export default function ClaimResult({
  outcome,
  plan,
}: {
  outcome: ClaimScreen;
  plan: Plan | null;
}) {
  const planLabel = plan ? PLAN_LABELS[plan] : null;
  const copy = copyFor(outcome, planLabel);
  const tone = TONES[copy.tone];
  const destination = destinationFor(plan);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        /* !important, and it is load-bearing: app/layout.tsx paints the body
           from an INLINE style prop, and an inline declaration outranks every
           stylesheet rule at every specificity unless the rule carries this.
           Without it the gutter falls back to --ec-bg, which is #F0EDE8 in
           light mode -- a cream band bouncing against a navy page. Same fix as
           app/teacher/worksheets/worksheet-theme.ts:290, and correct here for
           the same reason: one colour, no theme switch, nothing to recompute. */
        body { margin: 0; background: ${NAVY} !important; }
        ${FONT_BASE_CSS}
        /* ─── THE LOCAL @keyframes um-rise IS GONE ────────────────────────
           It was one of three byte-identical copies (ClaimClient, ClaimResult
           and WelcomeClient). @keyframes are global BY NAME regardless of which
           <style> defines them, so those three were never three scoped
           animations -- they were one name defined three times, and it only
           stayed harmless because the bodies happened to agree.

           MOTION_CSS's um-fade-up has the same body, so this is a rename and
           not a retune:

             um-rise      from { opacity: 0; transform: translateY(10px); }
             um-fade-up   from { opacity: 0; transform: translateY(var(--um-rise)); }

           AND THAT var() IS WHY THE WHOLE OF MOTION_CSS IS EMITTED HERE rather
           than just the keyframe. --um-rise is declared in MOTION_CSS's :root
           block and it is 10px. Without that block the var would not resolve,
           the 'transform' in the 'from' frame would compute to none, and the
           element would fade in with no rise at all -- a silent half-migration
           that looks almost right.

           The rest of MOTION_CSS is inert on this page: every other rule in it
           is a strict descendant of .um-motion, which this tree does not carry.
           The entrance below stays an inline 'animation' shorthand with the
           literal 'ease-out', NOT var(--um-ease-out) -- those are two different
           curves (0,0,.58,1 against .4,0,.2,1) and swapping them would be a
           retune. */
        ${MOTION_CSS}
        @media (prefers-reduced-motion: reduce) {
          .um-phase { animation: none !important; }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: NAVY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          fontFamily: FONT_BODY,
        }}
      >
        <div
          className="um-phase"
          style={{
            width: "100%",
            maxWidth: 440,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: `3px solid ${copy.tone === "bad" ? "#C46B6B" : GOLD}`,
            borderRadius: 20,
            padding: "40px 36px 44px",
            animation: "um-fade-up 600ms ease-out both",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${tone.border}`,
              color: tone.text,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.4,
              padding: "3px 8px",
              borderRadius: 5,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: tone.dot }} />
            {copy.badge}
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: FONT_HEADING,
              fontWeight: 600,
              fontSize: "clamp(26px, 5vw, 32px)",
              letterSpacing: -0.5,
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            {copy.heading}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
            }}
          >
            {copy.body}
          </p>

          {copy.cta ? (
            <Link
              href={destination.href}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#fff",
                color: "#1f1f1f",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {destination.label}
            </Link>
          ) : null}
        </div>
      </main>
    </>
  );
}
