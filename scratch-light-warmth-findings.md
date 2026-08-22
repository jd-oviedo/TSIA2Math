# Scratch: things found while doing the light-warmth swap

Not acted on. Parked here deliberately — the light-warmth branch was scoped to
five token swaps and nothing else. No issues filed. Nothing below is a
regression introduced by this branch.

Measured 2026-08-22 unless stated.

---

## 1. Entitlement coverage — the free-tier gap is the real one

`walk_curriculum.mjs` walks **signed out** and **full course** on real URLs.
Three states are uncovered, and they are **not** equally risky.

**Safe.** `teacher-by-plan` and `derived teacher-grant` both resolve to
`{curriculum: true, gumu: true}` in `course-access.ts`, and `viaTeacher` has
**zero UI consumers** anywhere in `app/`. Every repainted component renders
identically to the full-course walk. Closing these closes a gate-logic gap, not
a visual one.

**Not safe.** Signed-in **free tier** renders components that no walk sees:

| component | what only free tier renders |
|---|---|
| `TopicListRow.tsx` | the `gated` row — `'Not available'`, `V.gatedRowBg`, dashed rule, no `href`. A full-course account never renders this branch. |
| `practice/page.tsx:116`, `quiz/page.tsx:91` | `tutorAvailable = allowsTopic(access,'gumu',…)` is **false** on the AR.1.4 sample (`freeSampleGrants` grants `curriculum` only), so both render a distinct GUMU-absent banner |
| `GumuGate.tsx`, `GumuChat.tsx`, `PracticeQuiz.tsx` | the absent-tutor pairing instead of the `T.tutorSurface` panel |

Interim cover is `verify_modules_states.mjs` and `verify_gumu_tier.mjs` —
component-level, does not exercise the gate.

Blocked on a decision, not on work: closing it needs a second account, and the
three ways to get one (creating accounts in production auth, changing the
owner's live plan, borrowing a customer's) are all calls for Juan. None taken.

## 2. The `.jsx` → `.tsx` probe conversion

`verify_modules_states.mjs:118` writes `app/um-probe-states/page.jsx`.
`CourseBand.tsx:53` names this file as the origin of the `undefined / 97`
vacuous pass, and the fix is to make the probe `.tsx` so tsc sees required props.

**Confirmed it would work.** A one-file `.tsx` calling `CourseBand` the way a
probe does:

```
error TS2741: Property 'completedTopics' is missing in type
'{ topicCount: number; unitCount: number; }' but required in type
'{ topicCount: number; unitCount: number; completedTopics: number; }'
```

`tsconfig.json` includes `**/*.tsx`, excludes only `node_modules` and `tests`,
and there is no `ignoreBuildErrors`, so a probe route under `app/` is genuinely
typechecked at build.

## 3. `verify_modules_density.mjs` is currently broken

Already `.tsx` (`:136`), renders `<CourseBand topicCount={97} unitCount={6} />`
at `:107` with **no `completedTopics`**, then runs `npx next build` at `:155`.
That is exactly the TS2741 above, so the script throws. Broken since `0f1f969`
made the prop required. Its inline comment ("the course band carries no progress
any more") is stale — `CourseBand` explicitly supersedes that removal.

## 4. Retiring `um-probe-dark`

`verify_curriculum_dark.mjs:40` writes a synthetic `app/um-probe-dark/page.jsx`.
`verify_lesson_dark.mjs`'s header already records that it is owed a rewrite
against real `/course` URLs. Now possible, since `walk_curriculum.mjs` proves the
route is reachable with a real session. A whole-script rewrite, not a tail commit.

## 5. Two live orange-as-text AA failures on `/dashboard`

Both 11px on `#FFFFFF`, both shipping today:

| text | colour | ratio |
|---|---|---|
| "Start with this" | `#B5763A` | **3.74:1** |
| "Pick up where you left off" | `#F0A33E` | **2.10:1** |

Found while looking for reusable warmth. Part of what reads as warmth on that
screenshot is produced by contrast failures. Neither was imported onto the course
surface. Same family as #138 and probably belongs with it.

## 6. #138, confirmed by measurement

`dashboard-theme.ts` `LIGHT.dim` `#8A8983` measures **3.21:1** on `V.pageBg`
`#F5F5F3` and **3.51:1** on `V.cardBg` `#FFFFFF`. 18 `V.dim` call sites. Excluded
from the light-warmth proposal for this reason.

## 7. The problem eyebrow is fragile, and it bounds any future round

`#6E6E6D` ("Problem 1 of 10 · Basic") clears AA **only** on `T.panel`:

| ground | ratio |
|---|---|
| `T.panel` `#FFFDF8` | 5.02 ✅ |
| `T.insetRow` `#F6F2E8` | 4.57 ✅ |
| `T.band` `#F3EFE3` | 4.44 ❌ |
| `T.rail` `#EDE8DA` | 4.17 ❌ |
| `T.quietBox` `#EDE7D6` | 4.13 ❌ |
| `T.page` `#E8E0CF` | 3.89 ❌ |

So the practice/quiz fieldset's `#FFFDF8` fill is load-bearing for
accessibility. It cannot be flattened onto the ground without re-inking that
label first. This branch changed only the border, for exactly this reason.

## 8. Smaller things

- **`.katex` as a bare selector** still appears in other probe scripts. Only
  `walk_curriculum.mjs` was tightened to `.um-prose p .katex`. On QR.1.5 the bare
  selector happens to resolve to the right node, but the outline rail renders
  `heading_html` before the content column, so a topic with maths in an authored
  `h5` would silently measure a rail heading.
- **`networkidle` is unreachable on the quiz surface** — 30s timeout with zero
  requests outstanding. `walk_curriculum.mjs` no longer waits on it; other
  scripts that do will hang there.
- **Next 16.2 deprecation:** `The "middleware" file convention is deprecated.
  Please use "proxy" instead.` `middleware.ts` stamps `x-pathname` for the course
  gate and refreshes the Supabase token, so the rename has real blast radius on
  the auth path. Its own header explains why the gate depends on it.
- **P5 was not shipped.** The proposal included a 3px Sunset section marker left
  of each `.um-prose-card` (1.60:1 on the ground, orange as a rule). Cut from
  scope as the only genuinely new element rather than a token swap.
