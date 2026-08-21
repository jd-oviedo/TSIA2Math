<!-- The PR description for feat/curriculum-redesign, kept in the repo rather than in a
     scratch directory because a Codespace restart lost the Phase 1 and Phase 2 reports
     once already. Paste as the PR body when the branch is pushed; delete after, or keep
     it as the record. -->

Closes #176. Closes #177.

Student curriculum surfaces, redesigned: the modules tree is gated to the viewer's plan,
status colours become theme-aware token pairs, units get names, and the breadcrumb's dead
ancestor links are repaired.

## What changed

- **Entitlement gate on `/dashboard/modules`** (#176). Server-side, via `resolveCourseAccess`
  -- the same resolver the other three surfaces use, so a row that renders as a link and a
  route that admits the visitor cannot disagree. Free tier and Practice Pass see AR.1.4 live
  and everything else as a non-link row. The resume card takes the same gate, because the
  attempt log outlives entitlement. Logged for attorney review in unpackmath-home's
  `legal-audit-2026-08.md`.
- **Status colours as theme-aware pairs.** `statusColor()` returns `V.*` instead of reaching
  into the light-only curriculum palette. The dated decision in `dashboard-theme.ts` records
  the measurements, including why no single hex works across the flip and why `#A8631F` is a
  darkened text-only variant of Sunset rather than a third brand orange.
- **Unit titles** in `app/lib/units.ts`, runtime-pure, bare titles with callers composing the
  prefix.
- **Breadcrumb repair** (#177). Both ancestor links pointed at routes that do not exist,
  which tripped the course gate's Sentry branch and redirected to `/dashboard`. They point
  into the modules tree now, with `?unit=N` so the target is a real address.
- Scoped `.katex` fix, drawer enter/exit animation with a reduced-motion guard, course-level
  progress counter removed, `displayName()` on the account chips.

## Two things the checks did not catch, and what was done about it

**The gated row was invisible in dark mode, and no existing check would have found it.** It
was caught by looking at screenshots. `statusColor()`'s gated branch still returned
`INK_MUTED` -- the light-only curriculum ink -- painted on `V.gatedRowBg`, which is `#26262B`
after dark. Measured on rendered pixels: **4.88:1 light, 1.18:1 dark**, for the topic name
and the "Not available" label both, on 96 of 97 rows, seen by exactly the free-tier and
Practice Pass students this feature was built for. It was the same defect the status-colour
work existed to fix, surviving in the one branch of the same function still pointing at a
light-only constant. Now `V.muted`: 5.81 / 6.63.

`verify_modules_states.mjs` now measures contrast from rendered pixels in both themes with an
ungated row as the control, and it was shown failing at 1.18 on the real defect before the
fix.

**`verify_collapsible_units.mjs` had been silently broken since cc47543.** Making `unitTitle`
a required prop broke its probe's compile, which failed its build, which failed the whole
script -- and it is not in `test:offline`, so nothing ran it and nothing reported it. Fixed
here. It is deliberately **not** added to `test:offline`: that suite is nine node-only
scripts finishing in about five seconds, and this one needs `npx next build` plus chromium,
90+ seconds. Adding it would change what `test:offline` is and would still leave the other 19
browser scripts unrun. Recorded as #180.

## The fold moved, deliberately

Unit titles wrap at 360px rather than clipping, because clipping cuts exactly the words that
distinguish one unit from another. That breaks PR #117's "six headers above the fold" claim:
measured 836px against a 780px viewport. `verify_modules_density.mjs` now measures against a
stated 880px budget and a 96px scroll budget, each a measurement plus stated headroom, and
the headroom is deliberately smaller than one more unit -- verified by adding a seventh unit
to the fixture and measuring 900px / 136px, failing both.

## Known and deliberate

- **#178** -- unit titles collapse to one word per line at 390px. The header row's
  `15 topics` and progress bar hold their width and squeeze the flexible title. Fixing it
  means a mobile header layout change, which is outside this PR's approved scope.
- **#179** -- the worksheet builder's unit names disagree with the student syllabus on five
  of six. Unit 2 is a content error, the rest wording. Teacher-visible copy, own review.
- **#138** -- `V.dim`'s remaining 18 call sites are not migrated; `grades/page.tsx:145`
  painting light-only `C.green` on a theme-aware surface is logged there too.
- **#180** -- the browser test tier is unrun: 20 playwright scripts, 8 with no npm alias,
  none in any aggregate, no CI workflow. That is why `verify_collapsible_units` could break
  in cc47543 and stay broken. Infrastructure decision, deliberately not taken here.

## Verification

`tsc --noEmit`, `next build`, `npm test` (247), `verify_modules_density` (8 + control),
`verify_modules_states` (18 + controls), `verify_collapsible_units` (16 + control),
`verify_auth_gate` (14 + control). All browser runs against `next build && next start`.

Both new check groups were shown failing on faulted input: an injected `Tag = 'a'` for the
gating checks, and the real 1.18:1 defect for the contrast checks.

`verify_topic_chrome.mjs` could not be run -- it drives the real `/course` route, which
redirects signed-out, and the harness has no way to sign in.

**The six entitlement states are covered at the predicate level only**, in
`tests/units.test.ts` against `allowsTopic` -- the same function the page and the `/course`
gate both call -- plus the rendered gated/ungated walk in both themes at 1280 and 390 in
`verify_modules_states.mjs`. What that does not cover is the real page composing them end to
end for a signed-in account on each plan.

That gap is not closeable by the harness: free tier, Practice Pass, Full Course, teacher and
derived-teacher each need an account already on that plan, and putting an account into a
state is a production entitlement write. It is a manual browser walk against a local build,
and its result is not recorded here.
