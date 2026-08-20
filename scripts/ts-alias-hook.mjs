// Teach plain Node how to resolve this repo's `@/` path alias.
//
// WHY THIS EXISTS
// ---------------
// tsconfig maps `@/*` to the repo root, and TypeScript and Next's bundler both
// honour it. Node's ESM resolver does not, and never will -- it is a compiler
// convention, not a module-system one. So the moment any module a harness loads
// gains a `@/` import, that harness stops being able to load at all:
//
//   Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/app'
//     imported from lib/curriculum-utils.ts
//
// which is exactly what happened in #133 and silently disabled
// faultproof_earned_solutions.mjs -- the check on the per-item worked-solution
// gate -- for three merges. See issue #142.
//
// WHY A HOOK RATHER THAN CHANGING THE IMPORT
// ------------------------------------------
// The alternative is a relative path, and Node requires an explicit extension on
// one (measured: extensionless relative .ts imports fail to resolve). Writing
// `'../app/lib/lesson-sections.ts'` in application code then needs
// `allowImportingTsExtensions` in tsconfig, which is a project-wide compiler
// setting bought to fix one import.
//
// More to the point, that fixes the instance. This fixes the class: the next
// `@/` import into any module a harness reaches costs nothing, because the
// harness can already resolve it. Application code and tsconfig are untouched.
//
// Node also requires the extension on the file it lands on, so `.ts` is appended
// when the specifier does not carry one. Directory imports and index files are
// deliberately not supported: nothing in this repo uses them, and guessing at
// them would make a missing file look like a resolution bug.
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

// scripts/ -> repo root. Derived rather than hardcoded so this keeps working
// from any working directory.
const ROOT = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), '..') + '/').href;

// THE SECOND HALF OF THE SAME PROBLEM. Node also refuses an EXTENSIONLESS
// RELATIVE import of a TypeScript file -- `from './supabase-admin'` -- which is
// how every module in app/lib imports its neighbours, and which tsc resolves
// without complaint. So the moment a harness loads any module that has a
// sibling import, it dies the same way the `@/` case did:
//
//   Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../app/lib/supabase-admin'
//
// Rewriting those imports in application code was rejected for the reason given
// above: it needs allowImportingTsExtensions project-wide, bought to serve the
// harnesses. This resolves them here instead, on the same principle.
//
// GUARDED BY EXISTENCE, DELIBERATELY. The `.ts` candidate is only substituted
// when that file is actually on disk, so this can never turn a genuinely missing
// module into a confusing failure somewhere else -- it only ever rescues a
// specifier that was about to throw. A path that resolves today keeps resolving
// exactly as it did.
function tsCandidate(specifier, parentURL) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) return null;
  if (/\.[cm]?[jt]sx?$/.test(specifier)) return null;
  if (!parentURL) return null;
  for (const ext of ['.ts', '.tsx']) {
    const candidate = new URL(specifier + ext, parentURL);
    if (existsSync(fileURLToPath(candidate))) return candidate.href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const url = new URL(specifier.slice(2), ROOT).href;
      return nextResolve(/\.[cm]?[jt]sx?$/.test(url) ? url : `${url}.ts`, context);
    }
    const relative = tsCandidate(specifier, context.parentURL);
    if (relative) return nextResolve(relative, context);
    return nextResolve(specifier, context);
  },
});
