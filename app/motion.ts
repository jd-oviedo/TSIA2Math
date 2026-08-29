// The shared motion system: four tokens, three keyframes, one guard.
//
// ─── WHY THIS IS A TS MODULE AND NOT globals.css ─────────────────────────────
//
// app/globals.css carries no animation rule of any kind today, and it must stay
// that way. Anything declared there reaches every surface in the product by
// construction -- the teacher dashboard, the CAT engine, the worksheet
// generator -- and a motion system that arrives everywhere by default is a
// motion system nobody can opt out of.
//
// So this mirrors app/login/login-theme.ts and app/components/dashboard-theme.ts,
// which solved the same problem for colour: a TS module exporting a CSS string
// that a surface drops into its own <style>. A page that does not import
// MOTION_CSS receives nothing.
//
// ─── THE TWO LOCKS ───────────────────────────────────────────────────────────
//
// Nothing below animates unless BOTH are true:
//
//   1. an ANCESTOR carries .um-motion  -- the surface opted in
//   2. the ELEMENT carries a shared class (.um-fade-up, .um-fade-in)
//
// Every rule is written as a strict descendant of .um-motion. That is what makes
// "the dashboard is untouched" a fact about the selectors rather than a promise
// about future edits: /teacher renders no .um-motion anywhere, so every rule
// here fails to match on that tree no matter what classes get added to it later.
//
// The :root token block is the one thing that lands globally, and it is inert by
// design -- a custom property paints nothing until a rule reads it, and the only
// rules that read these are locked behind .um-motion. Declaring them on :root
// rather than on .um-motion is deliberate: it keeps the values visible to
// devtools on any page and lets a future surface reference a duration without
// having to adopt the whole system.
//
// ─── THE VALUES ARE ALREADY LIVE, NOT INVENTED ───────────────────────────────
//
// Every number here was measured off the existing codebase rather than chosen:
//
//   --um-dur-4   600ms   all four um-rise call sites use exactly this
//                        (WelcomeClient.tsx FADE_MS, ClaimClient, ClaimResult)
//   --um-ease-out        TeacherTour.tsx:461's `move`, verbatim
//   --um-rise    10px    um-rise's own translateY
//
// --um-stagger 60ms is the one new value, and it is new because nothing in the
// product staggers today. reporte/page.tsx does, at 100ms across 8 items, which
// is a reveal on a shareable card rather than a page settling in.
//
// ONLY THE FOUR TOKENS WAVE 1 ACTUALLY READS ARE DECLARED. The Phase 0 proposal
// also listed --um-dur-1/2/3, --um-ease-standard, --um-ease-linear and
// --um-lift. They are held back until a surface consumes them: a token nothing
// reads is a value nobody has checked, and it would be adopted later by someone
// assuming it had been.
//
// ─── WHY THE ENTRANCE IS AN ANIMATION AND NEVER A BASE opacity: 0 ────────────
//
// This is the load-bearing safety property of the whole file, so it is stated
// where it can be read before anything is changed.
//
// The hidden state lives ONLY inside the keyframe's `from`, applied through
// animation-fill-mode: both. There is deliberately no `.um-fade-up { opacity: 0 }`
// base rule anywhere.
//
// If there were, the reduced-motion guard below -- which works by removing the
// animation -- would strip the thing that was going to bring the element back
// and leave the content permanently invisible for exactly the users who asked
// for less motion. As written, `animation: none` returns every element to its
// natural opacity: 1, so the reduced-motion render is the fully painted page
// with no motion, which is the correct outcome and the one that is verified.

/**
 * The tokens, the keyframe library, the two-lock opt-in rules, and the guard.
 *
 * Dropped into a surface's own <style> alongside whatever else it emits. Safe to
 * include more than once on a page: every declaration is idempotent.
 */
export const MOTION_CSS = `
/* ─── Tokens ────────────────────────────────────────────────────────────────
   Inert. Nothing paints from these until a .um-motion rule below reads them. */
:root {
  --um-dur-4: 600ms;
  --um-ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --um-rise: 10px;
  --um-stagger: 60ms;
}

/* ─── Keyframe library ──────────────────────────────────────────────────────

   NEW NAMES, AND THAT IS THE POINT RATHER THAN A PREFERENCE.

   @keyframes are global by NAME regardless of which <style> tag defines them,
   so two blocks called um-rise are not two scoped animations -- they are one
   name, last parsed wins. There are three identical um-rise definitions live
   today (ClaimClient, ClaimResult, WelcomeClient), which is harmless only
   because they are byte identical.

   Reusing that name here would put a fourth definition into the same global
   namespace and make the collapse of the other three a race rather than a
   refactor. um-fade-up is a new name, so this system and the existing copies
   cannot shadow each other, and Wave 2 can retire them one at a time. */
@keyframes um-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes um-fade-up {
  from { opacity: 0; transform: translateY(var(--um-rise)); }
  to   { opacity: 1; transform: none; }
}

/* ─── The opt-in classes ────────────────────────────────────────────────────

   Longhand rather than the 'animation:' shorthand on purpose: a var() that
   fails to resolve inside a shorthand invalidates the WHOLE declaration, which
   would silently drop the fill-mode and leave an element visible before its
   turn. In longhand a bad token costs one property. */
.um-motion .um-fade-in,
.um-motion .um-fade-up {
  animation-duration: var(--um-dur-4);
  animation-timing-function: var(--um-ease-out);
  /* Set by the stagger block below. The fallback is what a .um-fade-up outside
     any .um-stagger gets, and it is the right default: no delay. */
  animation-delay: var(--um-delay, 0ms);
  animation-fill-mode: both;
}

.um-motion .um-fade-in { animation-name: um-fade-in; }
.um-motion .um-fade-up { animation-name: um-fade-up; }

/* ─── The stagger ───────────────────────────────────────────────────────────

   Sets a delay custom property per child; the classes above read it. Written
   this way rather than as animation-delay directly so that a child which is
   NOT carrying a shared class costs nothing at all -- it inherits a variable
   no rule reads.

   THE FIRST RULE AND THE LAST RULE ARE BOTH TRAPS BEING CLOSED, not padding.

   The base rule gives EVERY child 0ms, so :nth-child(1) is covered without a
   rule of its own and there is no unset case.

   The :nth-child(n+6) clamp catches the tail. Without it a sixth child would
   match no rule, fall back to 0ms, and fire FIRST -- a stagger that runs
   backwards the moment someone adds a row. Everything from the sixth on lands
   with the fifth instead, which reads as a settle rather than a sequence but
   never as a glitch. */
.um-motion .um-stagger > *                { --um-delay: 0ms; }
.um-motion .um-stagger > *:nth-child(2)   { --um-delay: calc(var(--um-stagger) * 1); }
.um-motion .um-stagger > *:nth-child(3)   { --um-delay: calc(var(--um-stagger) * 2); }
.um-motion .um-stagger > *:nth-child(4)   { --um-delay: calc(var(--um-stagger) * 3); }
.um-motion .um-stagger > *:nth-child(5)   { --um-delay: calc(var(--um-stagger) * 4); }
.um-motion .um-stagger > *:nth-child(n+6) { --um-delay: calc(var(--um-stagger) * 5); }

/* ─── The guard ─────────────────────────────────────────────────────────────

   ONE block, and it is SCOPED to this system's own classes. It is deliberately
   not a blanket '* { animation: none }'.

   A blanket guard would not animate anything -- so it would not break the
   opt-in -- but it would still reach across the whole product and change how
   the dashboard's spinners and TeacherTour behave under a setting neither of
   them currently reads. That is a real behaviour change to surfaces this wave
   does not cover, and it is a separate decision from shipping this file.

   'animation: none' and not a shorter duration: there is no hidden base state
   to unwind (see the header), so removing the animation outright is what leaves
   the page fully painted and completely still. !important because a surface's
   own <style> may emit blocks after this one. */
@media (prefers-reduced-motion: reduce) {
  .um-motion .um-fade-in,
  .um-motion .um-fade-up,
  .um-motion .um-stagger > * {
    animation: none !important;
  }
}
`;
