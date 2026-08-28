# Dead code and unused dependency audit, August 2026

Report only. Nothing was deleted, refactored, moved, or simplified in this pass.

Tooling: knip 6.32.3 (new `knip.json` with the Next.js plugin enabled), depcheck 1.4.7,
`npx tsc --noEmit` (exit 0, no errors), `npx next build` (passed, clean baseline).
Raw tool output is committed under `audit/` (`knip.txt`, `depcheck.txt`, `tsc.txt`).

Scope notes:

- Convention loaded files (`app/**/page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`,
  `error.tsx`, `loading.tsx`, `not-found.tsx`, `*.d.ts`, instrumentation and Sentry
  configs) were registered as knip entries, so none were false flagged as unused.
- There is no `next/dynamic` or `React.lazy` call anywhere in `app/` or `lib/`, so the
  dynamic reference check for the flagged files reduces to string grep, which was run.
- Env gated integrations (Sentry, PostHog, Upstash, Resend, Anthropic SDK, Stripe) were
  all reported as used by both tools. Nothing to flag there.
- Off limits areas per the audit instructions (the useBodyBackground hook, the
  misconception pipeline around record_misconception and its three API callers, the
  teacher dashboard including its export module, curriculum-theme.ts and
  curriculum-surface.ts) are excluded from the findings below and are not flagged as
  candidates, even where a tool mentioned them. The raw tool output in `audit/` is
  unfiltered.

## A. High confidence orphaned

Count: 1 file.

1. `app/theme/ThemeToggleHome.tsx` (598 bytes, 19 lines)
   - Imported by nothing. The only mention anywhere in the codebase is a prose comment
     in `app/components/ThemeModeButton.tsx:18` describing where the sun and moon
     artwork came from.
   - No dynamic import, no lazy load, no string keyed reference (grepped across `app`,
     `lib`, `scripts`, `tests`, `middleware.ts`).
   - Not convention loaded: it is a named export component, not a page, layout, or route.
   - Content: a thin wrapper that renders `ThemeModeButton` with the `--ec-*` variables.
     Its own comment says the artwork and logic already moved into ThemeModeButton, so
     this is the historical shell left behind after that move.

## B. Needs a ruling

1. `app/course/[test]/[subject]/unit/[unit]/topic/[topicId]/CheckYourself.tsx`
   (2,459 bytes, 55 lines)
   - Knip flags it as an unused file and it genuinely has no call site. It is listed
     here rather than in section A because the file itself documents, at length, that
     it is deliberately unreferenced on Juan's instruction of 2026-08-22: build the
     component, apply it to nothing, do not invent content to fill it. Not a removal
     candidate unless that decision is revisited.

2. Unused exports inside otherwise live files (knip: 48 values, 34 types)
   - These are not orphaned files. Each lives in a module that is imported and used;
     only the specific export has no importer. Removing them (or dropping the `export`
     keyword) is a code change to live files and several look like staged intent
     rather than rot, for example `app/login/copy.ts` and `app/login/login-theme.ts`
     from the login redesign, and the request body types in `app/lib/schemas.ts` that
     mirror zod schemas which are themselves in use.
   - The full list is in `audit/knip.txt` lines 16 to 99. Entries falling in off
     limits areas are excluded from consideration per the scope notes above.
   - Ruling needed per file owner before any of these are treated as dead.

3. `app/components/dashboard-theme.ts` duplicate export (`LIGHT` and `DASH`)
   - Knip reports the same object exported under two names. Both names have importers.
     Informational only; collapsing to one name is a rename across consumers, not a
     dead code removal.

4. Knip "unresolved import": `./scripts/ts-alias-hook.mjs` from
   `scripts/faultproof_official_scores.mjs`
   - False positive. The path is a string argument passed to a spawned `node` process
     (`--import ./scripts/ts-alias-hook.mjs`) and resolves from the repo root at run
     time. The file exists and is also used by the package.json test scripts.

5. Knip "unlisted binary": `ss` in `scripts/faultproof_assignments.mjs`
   - False positive as a dependency concern. `ss` is the Linux socket utility, invoked
     inside a try/catch that tolerates its absence. Not an npm package.

6. Unlisted dependency `hast` (flagged by both knip and depcheck)
   - `lib/curriculum-utils.ts:8` does `import type { ... } from 'hast'`. The types
     resolve today only because the remark and rehype chain pulls them in
     transitively. It works, but a rearrangement of that chain would break the build.
     Ruling: either add the types package as an explicit devDependency or accept the
     transitive reliance. Report only; nothing was changed.

## C. Unused dependencies

depcheck output, verbatim (all devDependencies; no production dependency was flagged
by either tool):

- `@types/react-dom`
- `autoprefixer`
- `depcheck`
- `knip`
- `postcss`
- `tailwindcss`

knip additionally flags `@types/katex`, and agrees on `autoprefixer`, `postcss`,
`tailwindcss`, `depcheck`.

Assessment per package:

- `tailwindcss`, `postcss`, `autoprefixer`: very likely genuinely unused. There is no
  `tailwind.config` or `postcss.config` in the repo, and the `@tailwind` directives in
  `app/globals.css:16-18` are documented in that same file (around lines 75 to 90) as
  deliberately inert: they reach the browser verbatim as invalid CSS and are
  discarded, and the app was intentionally built against the absence of Preflight.
  Removing the packages would also invite removing those three directive lines, which
  is a change to a documented decision, so this gets a ruling rather than a removal.
- `@types/react-dom`: false positive. TypeScript consumes it implicitly for the JSX
  and react-dom typings; there is no explicit import for depcheck to see. Keep.
- `@types/katex`: plausibly removable. katex 0.17 ships its own type definitions
  (`types/katex.d.ts` referenced from its package.json `types` field), which
  TypeScript prefers over `@types` for a direct `import katex from "katex"`. Needs a
  verification pass (remove, run `tsc --noEmit`) before acting, so it stays a ruling.
- `depcheck`, `knip`: installed by this audit itself. They are CLIs, imported by
  nothing, so both tools self report as unused. Keep if audits should be repeatable,
  otherwise they can go when the audit branch is closed out.
