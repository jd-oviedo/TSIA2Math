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

// scripts/ -> repo root. Derived rather than hardcoded so this keeps working
// from any working directory.
const ROOT = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), '..') + '/').href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context);
    const url = new URL(specifier.slice(2), ROOT).href;
    return nextResolve(/\.[cm]?[jt]sx?$/.test(url) ? url : `${url}.ts`, context);
  },
});
