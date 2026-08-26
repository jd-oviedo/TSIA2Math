// The production guard for the UI verification lane.
//
// Modelled directly on lib/curriculum-fixture.ts:72-90, which solves the same
// problem for the curriculum fixture, and deliberately kept the same shape so
// there is one pattern in this repo for "local-only route" rather than two.
//
// WHAT IS BEING GUARDED. app/um-verify/* renders the real theming chrome with
// no auth gate and no data, so that UI verifiers can read computed styles off
// real components. That is exactly what makes it useful locally and exactly
// what makes it unwanted on a deploy: it is an ungated route that mounts the
// student shell with a fabricated name and role. It leaks no data -- there is
// none to leak -- but it is not a page any visitor should be able to reach, and
// an ungated route that renders app chrome is the kind of thing that later
// grows a feature and becomes a real hole.
//
// TWO LAYERS, BECAUSE THEY FAIL DIFFERENTLY.
//
//   1. Each route calls notFound() unless UM_VERIFY_LANE is set. That is the
//      everyday behaviour: on any deploy where nobody set the flag, the lane
//      simply is not there.
//   2. This module throws at import if the flag IS set on a deploy. A
//      conditional would degrade quietly when it is wrong; a throw takes the
//      build down, which is loud and impossible to miss.
//
// ── Why the sentinel is VERCEL_ENV and not NODE_ENV ─────────────────────────
//
// The same reasoning as curriculum-fixture.ts:40-67, and it is not a weakening.
// `next build && next start` on a laptop sets NODE_ENV=production. It is a
// production BUILD and it is not a DEPLOYMENT -- and it is the only server mode
// this project runs Playwright against, because `next dev` collapses under
// Playwright load and surfaces as false 404s. Gating on NODE_ENV would ban the
// lane from the only place it is ever used, which is how the equivalent mistake
// was found on the fixture.
//
// VERCEL_ENV is set on every Vercel deploy, production and preview alike, and on
// no local machine. Preview is refused too: a preview URL is reachable by anyone
// who has it.
//
// Residual gap, named so it is not rediscovered the hard way: if this app is
// ever hosted somewhere that does not set VERCEL_ENV, this guard goes quiet and
// needs a sentinel for that host added here. The same note is on the fixture
// guard, and both should be updated together.

const LANE_ENV = 'UM_VERIFY_LANE';

/** True when the lane is switched on. The routes render only under this. */
export function verifyLaneEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env[LANE_ENV]);
}

/**
 * Throws when the lane flag is set on a deployed environment.
 *
 * Exported as a pure function of an env bag so the guard itself can be tested
 * rather than assumed. See tests/verify-lane-guard.test.ts.
 */
export function assertVerifyLaneSafe(env: Record<string, string | undefined>): void {
  const enabled = Boolean(env[LANE_ENV]);
  if (enabled && Boolean(env.VERCEL_ENV)) {
    throw new Error(
      `${LANE_ENV} is set on a deployed environment ` +
        `(VERCEL_ENV=${env.VERCEL_ENV}). Refusing to start.\n\n` +
        'This flag exposes app/um-verify/*, which renders the student shell ' +
        'and the curriculum surface with no auth gate and fabricated props, ' +
        'so that UI verifiers can read computed styles off real components. ' +
        'It is a local verification lane and has no business on a deploy.\n\n' +
        `Unset ${LANE_ENV}. It is for local use only.`,
    );
  }
}

// Runs on import. Both lane routes import this module, so any build that would
// render one runs the guard first.
assertVerifyLaneSafe(process.env);
