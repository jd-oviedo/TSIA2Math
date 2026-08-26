import { notFound } from 'next/navigation';
import { DASHBOARD_CSS } from '../../dashboard/dashboard-css';
import StudentShell from '../../dashboard/StudentShell';
import {
  Card,
  CardTitle,
  EmptyState,
  Muted,
  PageHeadRow,
  PageHeading,
  PageStack,
  SectionGroup,
  SectionLabel,
  SPACING,
} from '../../dashboard/ui';
import FlagsPanel from '../../dashboard/FlagsPanel';
import { StudentNavPanel } from '../../components/StudentNav';
import AssignmentsHomeCard from '../../dashboard/AssignmentsHomeCard';
import AssignmentsList from '../../dashboard/assignments/AssignmentsList';
import JoinClassPanel from '../../dashboard/JoinClassPanel';
import DiagnosticCta from '../../dashboard/DiagnosticCta';
import AnnouncementCard from '../../dashboard/announcements/AnnouncementCard';
import type { Announcement, StudentAssignment } from '../../dashboard/data';
import TeacherPanelControl from '../TeacherPanelControl';
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
// the profile read, the flag rows the verifier feeds to FlagsPanel, which carry
// no colour either, and the two assignment rows below, which carry no colour
// and no spacing.
//
// ─── THE SPACING HALF, ADDED 2026-08-26 ──────────────────────────────────────
//
// scripts/verify_shell_spacing.mjs reads the shell's spacing scale and header
// tiers off this route. The same rule applies as above and it is the reason
// the block below is built from imported components rather than from markup
// written here: a harness that restates the values under test proves only that
// this file can type them twice. PageStack, SectionGroup, Card, CardTitle,
// SectionLabel and EmptyState are the real primitives; JoinClassPanel,
// DiagnosticCta, AssignmentsHomeCard and AssignmentsList are the real panels,
// rendered from props exactly as their pages render them.
//
// WHAT THIS ROUTE CANNOT REACH, STATED RATHER THAN GLOSSED. Home, Grades and
// Announcements are async server components that call getProfile() and read
// Supabase, so they cannot be mounted here and are NOT mounted here. That the
// three of them consume the scale rather than restating it is proved
// separately and statically, by tests/shell-spacing.test.ts, which fails if any
// in-scope page writes a literal gap on a vertical stack. Two proofs, one
// rendered and one static, and neither pretends to be the other.
//
// THE TWO ASSIGNMENT ROWS ARE CHOSEN TO BUCKET DETERMINISTICALLY: one due in
// the year 2000, which is overdue at any clock this ever runs on, and one with
// no due date at all. That is exactly two non-empty buckets, so the group gap
// between them is always there to measure and the two SectionLabel tones --
// the overdue one and the default one -- are both on the page.

// ─── THE ANNOUNCEMENT PANEL, ADDED 2026-08-26 ────────────────────────────────
//
// scripts/verify_announcements_card.mjs reads the announcement panel's radius,
// shadow, fill and TAG NAME off this route. AnnouncementCard is mounted here as
// the real component for the usual reason -- /dashboard/announcements is an
// async server component that reads Supabase and cannot be mounted, and a lane
// that hand-copied its markup would measure a copy rather than the panel that
// ships. It was split out of that page precisely so this mount is possible.
//
// The fixture below carries no colour, no radius, no shadow and no spacing:
// every property under test comes from Card via AnnouncementCard. It is dated
// in the year 2000 like the assignment rows, so formatDate's output is stable.

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

        {/* ─── The spacing scale and the header tiers ─────────────────────── */}
        <div data-probe="spacing-lane" style={{ marginTop: 18 }}>
          <PageStack>
            <SectionGroup>
              <Card>
                {/* The panel-tier header and its content as siblings, which is
                    the shape every converted panel now uses: CardTitle's own
                    margin is the header-to-content distance, and the gap probe
                    below measures it on the rendered box rather than trusting
                    the declaration. */}
                <div
                  data-probe="head-row"
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <CardTitle>Panel title</CardTitle>
                  <span data-probe="head-aux">aux</span>
                </div>

                <div
                  data-probe="block-stack"
                  style={{ display: 'flex', flexDirection: 'column', gap: SPACING.BLOCK }}
                >
                  <Muted size={13}>First block inside the panel.</Muted>
                  <Muted size={13}>Second block inside the panel.</Muted>
                </div>
              </Card>

              <Card>
                <JoinClassPanel />
              </Card>
            </SectionGroup>

            <SectionGroup>
              <DiagnosticCta />

              <Card>
                <AssignmentsHomeCard assignments={LANE_ASSIGNMENTS} total={2} />
              </Card>
            </SectionGroup>

            <SectionGroup>
              <EmptyState title="Empty state" detail="The primitive, at its own padding." />
            </SectionGroup>
          </PageStack>

          {/* The real grouped list, which supplies its own PageStack and its own
              SectionLabels. Scoped under its own probe attribute so the two
              PageStacks on this route are never confused for one another. */}
          <div data-probe="assignments-lane" style={{ marginTop: 18 }}>
            <AssignmentsList assignments={LANE_ASSIGNMENTS} />
          </div>

          {/* T2 on its own, away from the bucket colours, so the default tone
              can be read without depending on which bucket sorted first. */}
          <div data-probe="label-lane" style={{ marginTop: 18 }}>
            <SectionLabel>Group label</SectionLabel>
            <Card>
              <Muted size={13}>Content under a group label.</Muted>
            </Card>
          </div>

          {/* THE ANNOUNCEMENT PANEL. The real component, inside the real
              SectionGroup its page wraps it in. Two of them so the chip branch
              and the chipless branch are both on the page.

              THE PLAIN <Card> BELOW IT IS THE CONTROL, and it is the whole
              point of the tag assertion: these two panels must measure
              identically on radius, shadow and fill, and differ ONLY in tag
              name -- section for the default caller, article for this one. A
              revert of the `as` prop reddens on the tag while every colour
              assertion still passes, which is exactly the failure that would
              otherwise ship silently. */}
          <div data-probe="announcement-lane" style={{ marginTop: 18 }}>
            <SectionGroup>
              <AnnouncementCard item={LANE_ANNOUNCEMENT} classLabel="Period 3" />
              <AnnouncementCard item={LANE_ANNOUNCEMENT_NO_CLASS} classLabel={null} />
            </SectionGroup>
            <div data-probe="announcement-control" style={{ marginTop: 18 }}>
              <Card>
                <Muted size={13}>The default caller, for the tag comparison.</Muted>
              </Card>
            </div>
          </div>

          {/* THE RAIL, BOTH WIDTHS, so the brand mark's centring is a measured
              fact rather than a style string someone read back.

              `margin: '0 auto'` is not self-proving. Whether it centres depends
              on the parent having a width to centre inside, and on the image
              being narrower than it -- and the expanded wordmark is 148px in a
              rail whose padding differs between the two widths. Reading the
              declaration back would pass even if the wrapper collapsed to the
              image's own width, which is the case where it visibly does not
              move. So the verifier reads the two boxes and compares centres.

              Rendered at both `collapsed` values because the collapsed arm is
              the one the expanded arm was made to mirror: a check that watched
              only the expanded arm would go quiet if the collapsed arm drifted.

              Props are the lane's own, and the panel reaches no database: it is
              handed a name, a role and a plan, and renders links. */}
          <div data-probe="rail-lane" style={{ marginTop: 18, display: 'flex', gap: 18 }}>
            <div data-probe="rail-expanded" style={{ width: 232 }}>
              <StudentNavPanel name="Lane Student" role="student" plan="full-course" />
            </div>
            <div data-probe="rail-collapsed" style={{ width: 64 }}>
              <StudentNavPanel name="Lane Student" role="student" plan="full-course" collapsed />
            </div>
          </div>

          {/* THE TEACHER PANEL, AND THE ONLY THING ON THIS ROUTE THAT IS NOT
              THE STUDENT SHELL.
              ================================================================
              It is here to be measured as UNCHANGED. The student panels above
              went flat on 2026-08-26 and /teacher deliberately did not, so
              every Card assertion on this page is half a claim: radius 0 on the
              student panel proves the flatten happened, and only radius 12 on a
              teacher panel read in the same browser on the same run proves it
              stopped where it was supposed to.

              Card no longer imports cardStyle() at all, which is the structural
              half of that guarantee (see app/dashboard/ui.tsx). This is the
              measured half. Both are wanted: the import graph can be
              re-crossed by an edit, and this reddens when it is.

              See ../TeacherPanelControl.tsx for why NewAssignment is the panel
              chosen and why it needs a client wrapper. */}
          <div data-probe="teacher-control" style={{ marginTop: 18 }}>
            <TeacherPanelControl />
          </div>
        </div>

        {/* ─── THE TWO-COLUMN PAGE HEAD, ADDED 2026-08-26 ─────────────────────
            scripts/verify_home_head_row.mjs reads the head row's GEOMETRY off
            this block, at three viewports.

            IT IS THE REAL PRIMITIVE, HOLDING THE REAL PageHeading AND THE REAL
            JoinClassPanel IN THE REAL Card -- exactly the four components
            app/dashboard/page.tsx composes. That is the whole reason
            PageHeadRow is an export rather than a div in page.tsx: Home reads
            Supabase and cannot be mounted here, and a lane that hand-wrote the
            row's flex declarations would be measuring a replica of the thing
            under test. What the verifier measures here is what ships.

            THE PageStack UNDER IT IS PART OF THE FIXTURE, NOT DECORATION. The
            26px the row leaves under itself is not a margin anyone declared on
            the row -- it falls out of the flex line's cross size being the
            larger of the two columns' MARGIN boxes -- so it can only be read as
            the distance from the aside's bottom edge to the next block's top
            edge. There has to be a next block.

            THE SECOND join-code INPUT ON THIS ROUTE IS KNOWN AND DELIBERATE.
            JoinClassPanel hard-codes id="join-code", and the spacing lane above
            already mounts one at its own position, which verify_shell_spacing
            and verify_flat_panels both select through. Removing that one to
            keep the id unique would move every position selector in those two
            files. Both probes are container-scoped, so neither reads the other,
            and this route never ships: it 404s unless the lane flag is set. */}
        <div data-probe="page-head-lane" style={{ marginTop: 18 }}>
          <PageHeadRow
            heading={<PageHeading title="Home" blurb="Lane head, as Home composes it." />}
            aside={
              <Card>
                <JoinClassPanel />
              </Card>
            }
          />
          <PageStack>
            <SectionGroup>
              <Card>
                <Muted size={13}>The stack the head row sits 26px above.</Muted>
              </Card>
            </SectionGroup>
          </PageStack>
        </div>
      </StudentShell>
    </>
  );
}

// Two rows, and the dates are load-bearing: see the header. They carry no
// colour and no spacing of their own -- every pixel the spacing verifier reads
// off the list comes from PageStack, SectionLabel and the row's own styles.
const LANE_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: 'lane-overdue',
    course_id: 'tsia2-math',
    topic_id: 'QR.1.1',
    topic_name: 'An assignment that is always overdue',
    unit_number: 1,
    href: '/um-verify/shell',
    due_at: '2000-01-01T00:00:00.000Z',
    created_at: '2000-01-01T00:00:00.000Z',
    status: 'not_started',
  },
  {
    id: 'lane-undated',
    course_id: 'tsia2-math',
    topic_id: 'QR.1.2',
    topic_name: 'An assignment with no due date',
    unit_number: 1,
    href: '/um-verify/shell',
    due_at: null,
    created_at: '2000-01-02T00:00:00.000Z',
    status: 'not_started',
  },
];

// The announcement fixtures. No colour, no radius, no shadow, no spacing -- see
// the header. The first carries a class so the chip branch renders; the second
// carries none so the chipless branch does too.
const LANE_ANNOUNCEMENT: Announcement = {
  id: 'lane-announcement',
  title: 'An announcement panel',
  body: 'The panel around this text is the shape under test.',
  created_at: '2000-01-01T00:00:00.000Z',
  class_id: 'lane-class',
};

const LANE_ANNOUNCEMENT_NO_CLASS: Announcement = {
  id: 'lane-announcement-no-class',
  title: 'An announcement with no class',
  body: 'Posted to everyone, so no class chip renders above this line.',
  created_at: '2000-01-02T00:00:00.000Z',
  class_id: null,
};

// The guard reads process.env per request rather than at build. Without this
// the flag would be baked in at build time and a lane built with it unset
// would 404 even once it is set.
export const dynamic = 'force-dynamic';
