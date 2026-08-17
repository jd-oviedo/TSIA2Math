// Teardown for the verification scripts that stand up a real server.
//
// WHAT THIS EXISTS TO FIX
// -----------------------
// Every one of those scripts already tore down on the happy path, in a `finally`
// after the browser work. What none of them covered was the window between
// spawning the server and entering that `try`: if chromium.launch() throws, or
// the process is interrupted, the server had already been spawned and nothing
// killed it. A leaked `next start` then holds the port and the next run of the
// same script cannot bind it.
//
// It also clears .next/types. Next writes .next/types/validator.ts listing every
// route present at build time, so a probe route that has since been deleted stays
// referenced there and a later `npx tsc --noEmit` fails with "Cannot find module
// '../../app/um-probe-.../page.js'". Removing the directory is enough; the next
// build regenerates it.
//
// Handlers are registered at import, so importing this module early is what makes
// the failure and interrupt paths covered. Everything here is synchronous,
// because an 'exit' handler cannot await.

import { rmSync, existsSync } from 'fs';

const tasks = [];
let ran = false;

function runAll() {
  if (ran) return;
  ran = true;
  for (const task of tasks) {
    // Teardown must never throw: one failing task cannot be allowed to strand
    // the ones after it, which is how a leaked server outlives a leaked probe.
    try {
      task();
    } catch {
      /* nothing useful to do here */
    }
  }
}

/** Register a synchronous cleanup. Runs once, on any exit path. */
export function onTeardown(task) {
  tasks.push(task);
}

/**
 * Kill a detached child and the process group it leads.
 *
 * `next start` spawns its own worker, so killing the pid alone can leave the
 * worker holding the port. The child is spawned detached precisely so it leads a
 * group that can be killed whole.
 */
export function killServer(server) {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  try {
    process.kill(-server.pid);
  } catch {
    try {
      server.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  }
}

/** Drop the generated route types that still name a deleted probe route. */
export function clearNextTypes() {
  if (existsSync('.next/types')) {
    rmSync('.next/types', { recursive: true, force: true });
  }
}

process.on('exit', runAll);
process.on('SIGINT', () => {
  runAll();
  process.exit(130);
});
process.on('SIGTERM', () => {
  runAll();
  process.exit(143);
});
process.on('uncaughtException', (err) => {
  runAll();
  console.error(err);
  process.exit(1);
});
