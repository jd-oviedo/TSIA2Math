import { notFound } from 'next/navigation';
import { DASHBOARD_CSS } from '../../dashboard/dashboard-css';
import StudentShell from '../../dashboard/StudentShell';
import { Card } from '../../dashboard/ui';
import { verifyLaneEnabled } from '../guard';

// THE SHELL HALF OF THE UI VERIFICATION LANE.
//
// This lane exists so that UI verifiers can read computed styles off the real
// theming chrome without a database. There is no local or branch Supabase in
// this repo -- .env.local points at the live project and nothing listens on
// 54321 -- and agent-run checks never touch prod, so a verifier that needs a
// live topic route has nowhere to run. Everything left to verify on these
// surfaces (page ground, panel fill, drawer fill, card width, section rule) is
// computed style and needs no data at all, so the substrate is a route that
// mounts the real wrappers and the real tokens and fetches nothing.
//
// DB-FREE: performs no data fetching and no DB reads/writes. One read-only auth
// check still runs via existing middleware; it reads and writes nothing.
//
// UI VERIFIERS MUST USE THIS LANE RATHER THAN A LIVE TOPIC ROUTE. A live route
// needs a real session and real curriculum rows, which means prod. If a check
// needs lesson-section data specifically, that is a different lane: the
// loadTopicFixture path in scripts/verify_lesson_dark.mjs renders from local
// markdown and is deliberately kept separate from this one.
//
// WHY THIS IS SPLIT FROM /um-verify/curriculum. StudentShell.tsx:63 and
// TopicSurface.tsx:41 both call useBodyBackground, which writes
// document.body.style.background. Mounted on one page they would fight over the
// body and the loser's cleanup could wipe the winner's colour -- the exact
// order-dependence useBodyBackground.ts:69-74 exists to avoid. Two routes, two
// documents, no contention.
//
// WHAT IS REAL HERE, because a harness that mocks the thing under test proves
// nothing: DASHBOARD_CSS is the real stylesheet, StudentShell is the real
// shell, Card is the real card, and ThemeProvider is not mounted here because
// it is already in the root layout (app/layout.tsx:54) and is inherited. The
// only fabrications are the three props the shell needs to render a rail --
// name, role, plan -- which carry no colour and are what let this route skip
// the profile read.

export default function VerifyLaneShell() {
  // Layer one of the guard. Layer two throws at import; see ../guard.ts.
  if (!verifyLaneEnabled()) notFound();

  return (
    <>
      <style>{DASHBOARD_CSS}</style>
      <StudentShell name="Verify Lane" role="student" plan={null}>
        <Card>
          <p data-probe="card-copy" style={{ margin: 0 }}>
            Panel fill and page ground are read off .um-dash and this card.
          </p>
        </Card>
      </StudentShell>
    </>
  );
}

// The guard reads process.env per request rather than at build. Without this
// the flag would be baked in at build time and a lane built with it unset
// would 404 even once it is set.
export const dynamic = 'force-dynamic';
