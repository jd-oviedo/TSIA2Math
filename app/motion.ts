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
// Every rule is written as a strict descendant of .um-motion, so a surface gets
// nothing from this file until it says so twice.
//
// THIS BLOCK USED TO SAY "/teacher renders no .um-motion anywhere" AND THAT IS
// NO LONGER TRUE. It was true through Wave 2. As of 2026-08-30 the teacher
// dashboard and all three students pages opt in: TeacherDashboardClient puts
// .um-motion on its <main> and .um-fade-up on its content block, and
// app/teacher/students/shell.tsx does the same for the three pages it frames.
//
// What the two locks still guarantee is unchanged and is the reason the claim
// was worth making: a surface receives nothing by default, opting in is visible
// at the call site, and the surfaces that have NOT opted in (the CAT engine, the
// worksheet generator, the student detail page) are untouched as a fact about
// selectors rather than a promise about future edits.
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
 * The one shared spinner keyframe, and it is a SEPARATE EXPORT ON PURPOSE.
 *
 * ─── WHY IT IS NOT INSIDE MOTION_CSS ────────────────────────────────────────
 *
 * Its only consumers are loading spinners on the teacher dashboard, the student
 * detail page and the adaptive test. Folding it into MOTION_CSS would mean
 * those surfaces importing MOTION_CSS to get it, and that would put the whole
 * two-lock entrance system -- the :root tokens, um-fade-in, um-fade-up, the
 * stagger rules and the reduced-motion guard -- into the dashboard tree.
 *
 * "Inert because no element opted in" is a much weaker promise than "absent",
 * and the split keeps the stronger one available: a surface that needs a
 * spinning border can take SPIN_CSS and receive nothing else at all.
 *
 * The dashboard now imports BOTH, having opted into the entrance system (see
 * the header). That does not retire the split: the adaptive test and the
 * student detail page still take SPIN_CSS alone, and they are the surfaces the
 * separation was protecting.
 *
 * ─── WHY IT IS IN THIS FILE AT ALL ──────────────────────────────────────────
 *
 * Because @keyframes are global by name, so the thing that actually goes wrong
 * with duplicated animation is a name collision, and the fix is one place that
 * owns the names. That is what this module is. Splitting the spinner into its
 * own file would give the codebase two keyframe registries and no reason to
 * check the second one.
 *
 * ─── WHAT IT REPLACED ───────────────────────────────────────────────────────
 *
 * Four definitions of the same rotation, under two different names:
 *
 *   umspin   TeacherDashboardClient.tsx, students/shell.tsx, student/[id]/page.tsx
 *   spin     adaptive-test/page.tsx
 *
 * All four bodies were `to { transform: rotate(360deg); }` and every consumer
 * ran it at `0.8s linear infinite`, so the collapse is a rename. `spin` in
 * particular was worth retiring on its own: it is a name generic enough that a
 * third-party stylesheet or a future component could define it and silently
 * change how the adaptive test's loader turns.
 *
 * NOTE ON `to`-ONLY: the implicit `from` is the element's own computed
 * transform, which is what lets a spinner start from wherever it is rather than
 * snapping to 0deg. Preserved exactly.
 *
 * NO REDUCED-MOTION GUARD HERE, DELIBERATELY. A spinner is not decoration; it
 * is the only thing on screen saying the page is still working. Stopping it
 * under prefers-reduced-motion would leave a frozen ring that reads as a hang.
 * If these ever need a reduced-motion treatment it is a static "Loading" state,
 * which is a design decision and not a find-and-replace.
 */
export const SPIN_CSS = `@keyframes um-spin { to { transform: rotate(360deg); } }`;

/**
 * The tokens, the keyframe library, the two-lock opt-in rules, and the guard.
 *
 * Dropped into a surface's own <style> alongside whatever else it emits. Safe to
 * include more than once on a page: every declaration is idempotent.
 *
 * ─── NEVER WRITE AN OPENING STYLE TAG INSIDE THE TEMPLATE BELOW ─────────────
 *
 * Not even in a CSS comment, which is exactly where it was until 2026-08-31,
 * twice. (This paragraph is OUTSIDE the template literal, so it can say the
 * thing it is warning about; the rules below cannot.)
 *
 * React renders that template as the text content of a <style> element. On the
 * SERVER it escapes an embedded style tag into a CSS identifier escape, so the
 * markup carries a backslash-7-3 form; on the CLIENT it hydrates the raw text.
 * The two strings differ, so every page emitting MOTION_CSS logged a hydration
 * mismatch that named the <style> tag as the culprit. That reads as "the
 * stylesheet is broken" and is really "a comment contains six characters React
 * has to escape".
 *
 * It stayed latent while the only consumers were /login, /start, /claim and
 * /teacher/welcome, and surfaced the day the teacher dashboard adopted the
 * system. Write "stylesheet" instead. The same trap applies to a closing tag.
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

   @keyframes are global by NAME regardless of which stylesheet defines them,
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
   own stylesheet may emit blocks after this one. */
@media (prefers-reduced-motion: reduce) {
  .um-motion .um-fade-in,
  .um-motion .um-fade-up,
  .um-motion .um-stagger > * {
    animation: none !important;
  }
}
`;
