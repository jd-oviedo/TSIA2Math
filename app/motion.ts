// The shared motion system: eight tokens, six keyframes, one guard.
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
// AND AS OF 2026-08-31 THE WORKSHEET GENERATOR OPTS IN TOO, which is what
// brought the interaction tokens and the four interaction keyframes below into
// the file. /teacher/worksheets/new puts .um-motion on its builder body -- NOT
// on its <main>, because .ws-stickybar is position: fixed inside that main at
// 375 and an animated ancestor would become its containing block.
//
// What the two locks still guarantee is unchanged and is the reason the claim
// was worth making: a surface receives nothing by default, opting in is visible
// at the call site, and the surfaces that have NOT opted in (the CAT engine, the
// student detail page, and every worksheet PRINT route) are untouched as a fact
// about selectors rather than a promise about future edits. The print routes
// matter most of that list: they render the sheet a teacher hands out, they do
// not import this file, and nothing here can reach paper.
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
// WAVE 1 DECLARED ONLY THE FOUR TOKENS IT ACTUALLY READ, holding back the
// --um-dur-1/2/3, --um-ease-standard, --um-ease-linear and --um-lift the Phase 0
// proposal had listed: a token nothing reads is a value nobody has checked, and
// it would be adopted later by someone assuming it had been.
//
// --um-dur-1/2/3 are now declared because the worksheet generator reads all
// three, at 150/220/280ms. That rule has not been relaxed -- the three tokens
// arrived WITH their consumer, in the same commit. --um-ease-standard,
// --um-ease-linear and --um-lift are still held back, and still for that reason.
//
// --um-stagger-panel 40ms is the other new value. See the token block for why it
// is a second number rather than a retune of --um-stagger.
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
 * Does this visitor want less motion?
 *
 * ─── WHY A FUNCTION HERE RATHER THAN A HOOK IN A SURFACE ────────────────────
 *
 * The guard at the bottom of MOTION_CSS is the reduced-motion policy for
 * everything this file drives, and it is CSS, so it can only reach declarative
 * animation. Two kinds of motion are outside its reach by construction:
 *
 *   1. Element.animate(), which is script-created and unaffected by a
 *      stylesheet rule.
 *   2. A setTimeout that paces a state change, where the "animation" is the
 *      component waiting before it swaps content.
 *
 * The adaptive test has one of each: the "Adjusting to your level" dot pulses
 * via Element.animate, and the next-question cross-fade holds the outgoing
 * question for a beat before mounting the incoming one. Both must collapse to
 * nothing for a visitor who asked for less motion, and no CSS rule can do it.
 *
 * It lives HERE, beside the guard, rather than as a hook in the surface that
 * needed it first, because reduced motion is one policy and this file already
 * owns it. A second home would be a second opinion, and the next surface with a
 * scripted animation would have to guess which one to read.
 *
 * NOT A HOOK, DELIBERATELY. It reads the media query at call time and returns a
 * boolean. A hook would add a subscription and a re-render path for a
 * preference that does not change mid-question, and every caller here reads it
 * inside an event handler or an effect where a plain read is what is wanted.
 *
 * FALSE ON THE SERVER, which is the safe direction: it means the markup renders
 * identically for everyone and the preference is applied on the client, where
 * matchMedia exists. Returning true during SSR would ship a no-motion first
 * paint to every visitor and then start animating after hydration.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

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
  /* Entrance scale. One surface settling in. */
  --um-dur-4: 600ms;
  --um-rise: 10px;
  --um-stagger: 60ms;

  /* Interaction scale, added when the worksheet generator adopted the system.
     These are --um-dur-1/2/3 by NAME because the header above reserved exactly
     those names and held them back until a surface read one; this is that
     surface, so they land with the values it consumes rather than as a
     speculative ladder nobody had checked.

       1  150ms  a state swap: hover ground, a checkbox filling, a CTA
       2  220ms  a thing arriving or leaving: a rail chip, a counter ticking
       3  280ms  a panel changing height, which is the largest move here

     One curve for all of them, and it is the entrance curve. A second easing
     would be a second opinion about how this product moves. */
  --um-dur-1: 150ms;
  --um-dur-2: 220ms;
  --um-dur-3: 280ms;
  --um-ease-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* IN-PANEL STAGGER, AND IT IS NOT --um-stagger. 60ms paces a page settling
     in, where the eye has just arrived and a slow sequence reads as care. This
     one paces cards appearing inside a panel the teacher just opened, where the
     eye is already on the target and the same 60ms reads as lag. Two numbers
     because they answer two questions, one curve because it is one system. */
  --um-stagger-panel: 40ms;
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

/* ─── The interaction keyframes ─────────────────────────────────────────────

   OPACITY AND A SMALL TRANSLATE, AND NOTHING ELSE. No scale, no shadow, no
   gradient, in a product whose surfaces are flat by decision -- a box that
   grows or casts on interaction contradicts the thing the flat system is
   saying. The distances are 6px and 4px against --um-rise's 10px, because
   these fire while the eye is already on the element rather than as a page
   arrives.

   THE DISTANCES ARE LITERALS HERE, unlike --um-rise. --um-rise is a token
   because two classes and three other surfaces read it; these four numbers are
   read by exactly one keyframe each and by nothing else, and a token nothing
   shares is a value with a second name.

   um-chip-out IS THE ONLY ONE THAT ENDS HIDDEN, which makes it the one
   exception to the file's "never a hidden base state" rule -- and it is not an
   exception at all, because the hidden state is still only in a keyframe. The
   element it runs on is unmounted by its own animationend handler, so nothing
   is left at opacity 0 waiting for a class to be removed. Under reduced motion
   the guard removes the animation, animationend never fires, and the component
   unmounts the chip on a timer instead. See WorksheetBuilder.tsx. */
@keyframes um-chip-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

@keyframes um-chip-out {
  from { opacity: 1; transform: none; }
  to   { opacity: 0; transform: translateY(6px); }
}

@keyframes um-tick-pop {
  from { opacity: 0.35; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}

@keyframes um-body-in {
  from { opacity: 0; transform: translateY(6px); }
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

/* The interaction classes. Same longhand discipline and the same reason: a
   var() that fails to resolve inside the 'animation:' shorthand would take the
   fill-mode down with it.

   THREE DURATIONS RATHER THAN ONE because these are three different events. A
   chip arriving and a counter ticking are both 220ms; a panel changing height
   is 280ms and is the only thing here allowed to be that slow. */
.um-motion .um-chip-in,
.um-motion .um-chip-out,
.um-motion .um-tick-pop,
.um-motion .um-body-in {
  animation-timing-function: var(--um-ease-out);
  animation-delay: var(--um-delay, 0ms);
  animation-fill-mode: both;
}

.um-motion .um-chip-in  { animation-name: um-chip-in;  animation-duration: var(--um-dur-2); }
.um-motion .um-chip-out { animation-name: um-chip-out; animation-duration: var(--um-dur-2); }
.um-motion .um-tick-pop { animation-name: um-tick-pop; animation-duration: var(--um-dur-2); }
.um-motion .um-body-in  { animation-name: um-body-in;  animation-duration: var(--um-dur-3); }

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

/* The in-panel stagger. Identical shape to the block above -- a base rule so
   the first child has no unset case, and a clamp on the tail so the sixth card
   cannot fall back to 0ms and fire first -- reading the 40ms token instead of
   the 60ms one.

   THE CLAMP EARNS ITS KEEP HERE MORE THAN ABOVE. A unit in the topic browser
   holds up to about thirty cards; without the clamp the last would begin more
   than a second after the first, which is not a stagger, it is a queue. */
.um-motion .um-stagger-panel > *                { --um-delay: 0ms; }
.um-motion .um-stagger-panel > *:nth-child(2)   { --um-delay: calc(var(--um-stagger-panel) * 1); }
.um-motion .um-stagger-panel > *:nth-child(3)   { --um-delay: calc(var(--um-stagger-panel) * 2); }
.um-motion .um-stagger-panel > *:nth-child(4)   { --um-delay: calc(var(--um-stagger-panel) * 3); }
.um-motion .um-stagger-panel > *:nth-child(5)   { --um-delay: calc(var(--um-stagger-panel) * 4); }
.um-motion .um-stagger-panel > *:nth-child(n+6) { --um-delay: calc(var(--um-stagger-panel) * 5); }

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

  /* TIER 2, AND THE SECOND PROPERTY IS THE POINT. The entrance classes above
     need 'animation: none' alone: they carry no transform of their own, so
     removing the animation returns them to a natural, untransformed, fully
     painted state.

     The interaction classes are staggered, and a staggered animation with
     fill-mode: both holds its 'from' frame for the whole delay. Flattening the
     duration instead of removing the animation would leave a card sitting at
     translateY(6px) for its 200ms of delay and then snapping -- motion, for the
     users who asked for none. Removing the animation is what this file already
     does; 'transform: none' is belt and braces for the case where a future call
     site puts its own transform on one of these elements and the removed
     animation is no longer the only thing holding it off its resting position.

     WHAT IS DELIBERATELY NOT RESET IS transition. A hover ground changing in
     150ms is a colour crossfade with no movement in it, which is what a reduced
     motion request leaves alone. The worksheet generator's own stylesheet does
     blanket transitions on that surface (worksheet-theme.ts) -- that is its
     call to make for its own controls, and this file does not need it to be
     true. */
  .um-motion .um-chip-in,
  .um-motion .um-chip-out,
  .um-motion .um-tick-pop,
  .um-motion .um-body-in,
  .um-motion .um-stagger-panel > * {
    animation: none !important;
    transform: none !important;
  }
}
`;
