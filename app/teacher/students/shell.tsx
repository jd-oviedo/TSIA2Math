import Link from 'next/link';
import { BodyGround } from '../../components/BodyGround';
import { DASH } from '../../components/dashboard-theme';
import { FONT_BASE_CSS, FONT_BODY, FONT_HEADING } from '../../components/fonts';
import type { TeacherClass } from './students-data';
import { SPIN_CSS } from '../../motion';

// The frame all three Build 3 pages sit in.
//
// A SERVER COMPONENT, so the header, the breadcrumb and the class switcher are
// in the first paint and only the grade data streams in behind them. The pages
// themselves put their fetching in a client child, which is the split
// /teacher/worksheets already uses.
//
// THE CLASS SWITCHER IS LINKS, NOT A <select>. Every one of these pages is
// addressable by ?class_id=, so switching class is a navigation and should
// behave like one -- back button, middle click, copyable URL. The dashboard's
// picker is unpersisted React state and cannot do any of that, which is part of
// why these pages resolve their own class rather than inheriting one.

export function StudentsShell({
  classes,
  selected,
  /** Where the class chips point. `?class_id=` is appended. */
  basePath,
  crumbs,
  title,
  blurb,
  actions,
  children,
}: {
  classes: TeacherClass[];
  selected: TeacherClass | null;
  basePath: string;
  /** Trail above the title. The last entry is the current page and is not a link. */
  crumbs: { label: string; href?: string }[];
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
        .um-visually-hidden {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
        }
      `}</style>

      {/* The ground the removed `body { background }` rule was trying to set and
          never did -- the root layout paints the body from an inline prop, which
          no ordinary stylesheet rule can outrank. This shell is a server
          component, so the hook is reached through its client edge. */}
      <BodyGround color={DASH.pageBg} />

      <div style={{ minHeight: '100vh', background: DASH.pageBg, fontFamily: FONT_BODY, color: DASH.ink }}>
        <header style={{ background: '#0F1E35', color: '#fff', padding: '14px 24px' }}>
          <div
            style={{
              maxWidth: 1180,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 3 L5 8 L10 13" />
              </svg>
              {crumbs.map((c, i) => (
                <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>/</span>}
                  {c.href ? (
                    <Link
                      href={c.href}
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        font: `600 13px ${FONT_BODY}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      aria-current="page"
                      style={{
                        color: '#fff',
                        font: `600 13px ${FONT_BODY}`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
            <img
              src="/unpackmath-wordmark.png"
              alt="UnpackMath"
              width={2000}
              height={485}
              style={{ width: 96, height: 'auto', display: 'block', flexShrink: 0 }}
            />
          </div>
        </header>

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 24px 64px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, font: `600 25px ${FONT_HEADING}`, letterSpacing: -0.4, color: DASH.heading }}>
                {title}
              </h1>
              {blurb && (
                <p style={{ margin: '6px 0 0', font: `400 13.5px ${FONT_BODY}`, color: DASH.muted, maxWidth: 640 }}>
                  {blurb}
                </p>
              )}
            </div>
            {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
          </div>

          {/* Only rendered when there is a choice to make. A single-class
              teacher gets no switcher rather than a switcher with one option. */}
          {classes.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {classes.map((c) => {
                const active = c.id === selected?.id;
                return (
                  <Link
                    key={c.id}
                    href={`${basePath}?class_id=${c.id}`}
                    style={{
                      font: `600 12.5px ${FONT_BODY}`,
                      padding: '5px 12px',
                      borderRadius: 999,
                      textDecoration: 'none',
                      border: `1px solid ${active ? '#C68A2F' : DASH.line}`,
                      background: active ? '#FBF4E6' : DASH.cardBg,
                      color: active ? '#9A6A1F' : DASH.muted,
                    }}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  );
}

/** The state every one of these pages needs when there is no class to show. */
export function NoClass() {
  return (
    <div
      style={{
        background: DASH.cardBg,
        border: `1px solid ${DASH.cardBorder}`,
        borderRadius: 12,
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 6px', font: `400 14px ${FONT_BODY}`, color: DASH.muted }}>
        No class to show.
      </p>
      <p style={{ margin: 0, font: `400 13px ${FONT_BODY}`, color: DASH.dim }}>
        Create a class from the dashboard, or check the link you followed.
      </p>
    </div>
  );
}
