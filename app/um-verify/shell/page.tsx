import { notFound } from 'next/navigation';
import { DASHBOARD_CSS } from '../../dashboard/dashboard-css';
import StudentShell from '../../dashboard/StudentShell';
import { Card, Muted } from '../../dashboard/ui';
import FlagsPanel from '../../dashboard/FlagsPanel';
import { verifyLaneEnabled } from '../guard';

// THE SHELL HALF OF THE UI VERIFICATION LANE.
//
// This lane exists so that UI verifiers can read computed styles off the real
// theming chrome without a database. There is no local or branch Supabase in
// this repo -- .env.local points at the live project and nothing listens on
// 54321 -- and agent-run checks never touch prod, so a verifier that needs a
// live topic route has nowhere to run. Everything left to verify on these
// surfaces (page ground, panel fill, drawer fill, card width, section rule,
// link and focus colour) is computed style, so the substrate is a route that
// mounts the real wrappers and the real tokens and reaches no database.
//
// DB-FREE: no DB reads or writes, and no real network call. One read-only auth
// check still runs via existing middleware; it reads and writes nothing.
//
// THE ONE FETCH ON THIS ROUTE, STATED PLAINLY. FlagsPanel below is a <details>
// that fetches /api/flags when it is expanded, and nothing else here fetches at
// all. It is mounted because the colour under test at FlagsPanel.tsx:132 lives
// inside a rendered flag row and is unreachable any other way, and it is safe
// here because the only thing that ever expands it is a verifier that has
// already intercepted /api/flags at the browser and answers it from a fixture
// -- scripts/verify_shell_link_contrast.mjs, same technique as
// scripts/verify_dashboard_contrast.mjs. Left collapsed, it fetches nothing. If
// a future check expands it WITHOUT stubbing the route, that request reaches
// the live project, and that is the line this lane must not cross.
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
// shell, Card is the real card, FlagsPanel is the real panel, and ThemeProvider
// is not mounted here because it is already in the root layout
// (app/layout.tsx:54) and is inherited. The two anchors carry no inline style
// at all, so their colour can only have come from the stylesheet under test.
// The only fabrications are the three props the shell needs to render a rail --
// name, role, plan -- which carry no colour and are what let this route skip
// the profile read, and the flag rows the verifier feeds to FlagsPanel, which
// carry no colour either.

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

          {/* THE LINK ON A CARD. app/dashboard/grades/page.tsx:103 in miniature:
              a bare anchor inside <Muted>, inside a Card. It carries NO inline
              style of any kind, so every pixel of its colour comes from
              `.um-dash a` in DASHBOARD_CSS and a probe that reads #2F6091 here
              cannot be reading something this file wrote. */}
          <Muted size={13.5}>
            The link ground on a card is{' '}
            <a data-probe="link-card" href="/um-verify/shell">
              this anchor
            </a>
            .
          </Muted>
        </Card>

        {/* THE LINK ON THE PAGE GROUND. app/dashboard/upgrade/page.tsx:55: the
            shell's main column paints nothing of its own, so an anchor outside a
            Card sits directly on --umd-page-bg, which is the darker of the two
            link grounds in light and therefore the binding one. Also the element
            the focus-ring probe tabs to. */}
        <p style={{ margin: '18px 0 0' }}>
          <a data-probe="link-page" href="/um-verify/shell">
            The link ground on the page itself
          </a>
        </p>

        {/* THE FLAG ID. The real FlagsPanel, not a copy of its markup: the
            colour under test is on a row that only exists after a fetch, so the
            component has to run its own state machine to reach it. Collapsed
            until a verifier clicks it, and only after that verifier has stubbed
            /api/flags -- see the header. */}
        <div style={{ marginTop: 18 }}>
          <Card padding="16px 24px">
            <FlagsPanel />
          </Card>
        </div>
      </StudentShell>
    </>
  );
}

// The guard reads process.env per request rather than at build. Without this
// the flag would be baked in at build time and a lane built with it unset
// would 404 even once it is set.
export const dynamic = 'force-dynamic';
