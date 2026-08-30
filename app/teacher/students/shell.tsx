import { BodyGround } from '../../components/BodyGround';
import { DASH, DASH_FLAT, flatPanelStyle } from '../../components/dashboard-theme';
import { NAVY, INK_2, DASH_HOVER_CSS } from '../dashboard-chrome';
import { FONT_BASE_CSS, FONT_BODY, FONT_HEADING } from '../../components/fonts';
import type { TeacherClass } from './students-data';
import { SPIN_CSS } from '../../motion';
import Link from 'next/link';

// The frame all three Build 3 pages sit in.
//
// A SERVER COMPONENT, so the header, the title and the class switcher are in
// the first paint and only the grade data streams in behind them. The pages
// themselves put their fetching in a client child, which is the split
// /teacher/worksheets already uses.
//
// ─── WHAT THIS SHELL IS NO LONGER ────────────────────────────────────────────
//
// It used to open with a navy #0F1E35 banner carrying a back chevron, a
// breadcrumb trail and the wordmark, over a maxWidth 1180 centred column. All
// three are gone as of 2026-08-30, because the pages now render inside
// TeacherShell and every one of them was a worse copy of something the rail
// already does:
//
//   the wordmark      the rail carries it, at the top, on every teacher route
//   the back chevron  the rail is the way back, and it is always visible
//   "Dashboard /"     the rail's first nav item, which also shows you are not
//                     on it -- a crumb cannot do the second half
//
// Keeping both would have given the page two competing back affordances and two
// navy grounds a few pixels apart. The ONE crumb that survives is on the
// gradebook detail page, rendered by GradebookClient rather than here, because
// the thing it has to name is the student and this component cannot know it.
// See the note in that file.
//
// THE CLASS SWITCHER IS STILL LINKS, NOT A <select>, and that is unchanged.
// Every one of these pages is addressable by ?class_id=, so switching class is a
// navigation and should behave like one -- back button, middle click, copyable
// URL. The dashboard's picker is unpersisted React state and cannot do any of
// that, which is part of why these pages resolve their own class rather than
// inheriting one. Only the chip's COLOUR moved.

// The band and the column, in a stylesheet rather than inline props, for one
// reason: this is a SERVER component and the dashboard states its padding as
// `isMobile ? ... : ...` off useViewport, which is a client hook. A media query
// is the server-safe way to land on the same two values.
//
// 639px, not 640px, because the dashboard's breakpoint is `w < 640`
// (TeacherShell.tsx useViewport) and max-width is inclusive.
const STUDENTS_CHROME_CSS = `
.um-students-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  background: ${DASH.pageBg};
}

/* The band. Page ground with one hairline under it, no radius and no shadow,
   which is the worksheet generator's header treatment on this same rail. */
.um-students-band {
  background: ${DASH.pageBg};
  border-bottom: 1px solid ${DASH_FLAT.panelHairline};
  padding: 26px 32px 18px;
}

.um-students-band-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.um-students-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

/* FULL BLEED, NOT A CENTRED 1180 COLUMN. Read off the dashboard rather than
   chosen: TeacherDashboardClient.tsx renders its content in
   padding: isMobile ? '18px 16px 48px' : '26px 32px 52px'. Matching it is what
   puts this column on the dashboard's left edge beside the 200px rail; a
   max-width centred column sat visibly inboard of it.

   NO BACKTICKS IN THIS BLOCK. It is a template literal, so a backtick in a CSS
   comment ends the string and the file stops parsing as TypeScript. */
.um-students-main { padding: 26px 32px 52px; }

@media (max-width: 639px) {
  .um-students-band { padding: 18px 16px 14px; }
  .um-students-main { padding: 18px 16px 48px; }
  .um-students-actions { width: 100%; }
}

.um-visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
`;

export function StudentsShell({
  classes,
  selected,
  /** Where the class chips point. `?class_id=` is appended. */
  basePath,
  title,
  blurb,
  actions,
  children,
}: {
  classes: TeacherClass[];
  selected: TeacherClass | null;
  basePath: string;
  title: string;
  blurb?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; }
        ${FONT_BASE_CSS}
        ${SPIN_CSS}
        ${DASH_HOVER_CSS}
        ${STUDENTS_CHROME_CSS}
      `}</style>

      {/* The ground the removed `body { background }` rule was trying to set and
          never did -- the root layout paints the body from an inline prop, which
          no ordinary stylesheet rule can outrank. This shell is a server
          component, so the hook is reached through its client edge. */}
      <BodyGround color={DASH.pageBg} />

      <main className="um-students-page">
        <header className="um-students-band">
          <div className="um-students-band-top">
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, font: `600 25px ${FONT_HEADING}`, letterSpacing: -0.4, color: DASH.heading }}>
                {title}
              </h1>
              {blurb && (
                <p style={{ margin: '6px 0 0', font: `400 13.5px ${FONT_BODY}`, color: INK_2, maxWidth: 640 }}>
                  {blurb}
                </p>
              )}
            </div>
            {actions && <div className="um-students-actions">{actions}</div>}
          </div>

          {/* Only rendered when there is a choice to make. A single-class
              teacher gets no switcher rather than a switcher with one option. */}
          {classes.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {classes.map((c) => {
                const active = c.id === selected?.id;
                return (
                  <Link
                    key={c.id}
                    href={`${basePath}?class_id=${c.id}`}
                    // THE DASHBOARD'S OWN CHIP PAIR, and it is the roster's sort
                    // buttons rather than its class picker. The picker is a
                    // <select> in a flat box and has no active/inactive state to
                    // copy; the sort row is the one place on the dashboard where
                    // a set of chips has exactly this job, so it is the honest
                    // mirror: Dashboard Navy fill with white on it when chosen,
                    // the navy outline ghost when not.
                    //
                    // Retires #C68A2F on #FBF4E6 at radius 999, which was the
                    // last amber pill on this surface.
                    className={active ? undefined : 'um-tdash-ghost'}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      font: `600 12.5px ${FONT_BODY}`,
                      padding: '5px 12px',
                      borderRadius: 0,
                      textDecoration: 'none',
                      border: `1px solid ${NAVY}`,
                      background: active ? NAVY : undefined,
                      color: active ? '#FFFFFF' : undefined,
                    }}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}
        </header>

        <div className="um-students-main">{children}</div>
      </main>
    </>
  );
}

/** The state every one of these pages needs when there is no class to show. */
export function NoClass() {
  return (
    <div style={{ ...flatPanelStyle(), padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: INK_2 }}>
        No class to show.
      </p>
      <p style={{ margin: 0, font: `400 13px ${FONT_BODY}`, color: DASH.dim }}>
        Create a class from the dashboard, or check the link you followed.
      </p>
    </div>
  );
}
