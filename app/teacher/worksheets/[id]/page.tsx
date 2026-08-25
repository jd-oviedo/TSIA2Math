import Link from 'next/link';
import { requireWorksheetTeacher, loadWorksheet } from '../worksheet-data';
import { resolveForPrint } from '../../../lib/worksheet-source';
import {
  WS,
  WS_CHROME_CSS,
  microLabel,
  panelStyle,
  ctaStyle,
  quietBtnStyle,
} from '../worksheet-theme';
import TeacherShell from '../../TeacherShell';
import { loadTeacherIdentity } from '../../teacher-identity';

export const dynamic = 'force-dynamic';

// Preview and print config.
//
// WORKSHEET DATA PATH, same as the print route: resolveForPrint(), never
// resolveForKey(). A preview showing the correct answers would be convenient and
// is exactly the shortcut that puts an answer one "view source" away from a
// student looking over a shoulder. The key has its own route.
//
// RESTYLED 2026-08-25, AND THE PREVIEW IS STILL THE BESPOKE LIST. The board
// draws a scaled facsimile of the printed page inside the preview pane. This
// route does NOT render WorksheetSheet and does NOT import PRINT_CSS, on
// purpose: PRINT_CSS carries `@page { size: letter portrait }` and an
// `@media print` block, and neither has any business on a screen route. The
// frame around the preview is redesigned; what sits inside it is the same
// one-column list this page has always shown.
//
// WHICH IS WHY THE PREVIEW SAYS SO. The printed sheet is two columns. A
// one-column preview inside a page-shaped frame would quietly imply it is the
// layout, so the caption states the difference rather than leaving a teacher to
// discover it at the printer.
//
// .no-print IS STATED HERE, NOT BORROWED. The app's only .no-print rule lives
// inside PRINT_CSS. WS_CHROME_CSS declares its own, scoped to .ws-page and
// carrying no @page of any kind, so a stray Ctrl+P on this route drops the
// chrome instead of printing a rail and a toolbar.
//
// WHAT THE BOARD ASKS FOR AND THIS DOES NOT BUILD. The config rail on boards 04
// and 05 is almost entirely controls that have no backing: header fields, a
// repeat-header toggle, page size, student work space, directions, an answer key
// QR code, version A/B, Download PDF, a page counter, and the answer key's
// worked-solution, misconception and compact-key switches. Every one of those
// would change what prints, and the printed sheet is not in scope. The rail
// therefore reads out what the worksheet IS rather than pretending to configure
// it.
export default async function WorksheetPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireWorksheetTeacher(`/teacher/worksheets/${id}`);
  // For the rail. After the gate, like every other read on this page.
  const identity = await loadTeacherIdentity();
  const worksheet = await loadWorksheet(id, profile.id);
  const items = await resolveForPrint(worksheet.course_id, worksheet.items);

  const topics = worksheet.options.topics ?? [];
  const levels = worksheet.options.levels ?? [];
  // Missing items mean a reference no longer resolves -- a retired instance with
  // no row, or a topic re-uploaded without that item number. Surfaced rather
  // than quietly printing a shorter sheet.
  const missing = worksheet.items.length - items.length;

  const created = new Date(worksheet.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TeacherShell
      variant="standalone"
      activeLabel="Worksheets"
      teacherName={identity.teacherName}
      teacherEmail={identity.teacherEmail}
      isFounder={identity.isFounder}
      plan={profile.plan}
    >
      <main className="ws-page">
        <style>{WS_CHROME_CSS}</style>

        <div className="ws-config">
          {/* ── the rail ───────────────────────────────────────────────────── */}
          <div className="ws-config-rail no-print">
            <div
              style={{
                padding: '18px 20px 16px',
                borderBottom: `1px solid ${WS.hairline}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <Link href="/teacher/worksheets" style={{ fontSize: 12, textDecoration: 'none' }}>
                ← Back to worksheets
              </Link>
              <h1
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  color: WS.ink,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.25,
                }}
              >
                {worksheet.title}
              </h1>
            </div>

            <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={microLabel}>This worksheet</span>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <RailRow label="Questions" value={String(items.length)} />
                <RailRow label="Topics" value={String(topics.length)} />
                <RailRow label="Difficulty" value={levels.length > 0 ? levels.join(', ') : 'All bands'} />
                <RailRow label="Created" value={created} />
              </dl>

              <div style={{ height: 1, background: WS.hairline }} />

              <p style={{ margin: 0, fontSize: 11.5, color: WS.muted, lineHeight: 1.55 }}>
                A worksheet is fixed once it is built, so the same questions print
                every time. Printing and reprinting never count against your monthly
                total.
              </p>
            </div>
          </div>

          {/* ── the main pane ──────────────────────────────────────────────── */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div
              className="ws-config-bar no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
                padding: '16px 26px',
                background: WS.band,
                borderBottom: `1px solid ${WS.hairline}`,
              }}
            >
              {/* Two ROUTES drawn as two tabs, not a client-side switch. The key
                  route walks resolveForKey through the admin client for
                  correct_answer and the worked prose; folding it into this page
                  would put answers in this payload, which is the exact thing the
                  two-route split exists to prevent. */}
              <div style={{ display: 'flex', border: `1px solid ${WS.hairline}`, background: WS.panel }}>
                <span
                  aria-current="page"
                  style={{
                    fontSize: 13,
                    padding: '9px 18px',
                    background: WS.dark,
                    color: WS.darkInk,
                  }}
                >
                  Questions
                </span>
                <Link
                  href={`/teacher/worksheets/${id}/key`}
                  className="ws-tap"
                  style={{
                    fontSize: 13,
                    padding: '9px 18px',
                    color: WS.ink,
                    textDecoration: 'none',
                    borderLeft: `1px solid ${WS.hairline}`,
                  }}
                >
                  Answer key
                </Link>
              </div>

              <Link
                href={`/teacher/worksheets/${id}/print`}
                className="ws-cta ws-tap"
                style={{
                  ...ctaStyle,
                  padding: '10px 20px',
                  fontSize: 13.5,
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Print worksheet
              </Link>
            </div>

            <div style={{ padding: '26px 26px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              {missing > 0 && (
                <div
                  className="no-print"
                  style={{
                    ...panelStyle,
                    width: '100%',
                    maxWidth: 691,
                    padding: '14px 16px',
                    boxShadow: `inset 3px 0 0 ${WS.marker}`,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13.5, color: WS.ink, lineHeight: 1.55 }}>
                    {missing} question{missing === 1 ? '' : 's'} could not be loaded. The
                    underlying content may have changed since this worksheet was made.
                  </p>
                </div>
              )}

              <p className="no-print" style={{ ...microLabel, margin: 0, letterSpacing: '0.06em', textAlign: 'center' }}>
                Preview. The printed sheet sets these in two columns.
              </p>

              {/* The page, sitting in the cream gutter. Measured to the printed
                  sheet's 7.2in content box so the preview is the same MEASURE as
                  the paper even though it is not the same layout. */}
              <div style={{ ...panelStyle, width: '100%', maxWidth: 691, padding: '32px 36px', boxSizing: 'border-box' }}>
                {items.map((item, i) => {
                  const choices = Object.entries(item.choices_html).sort(([a], [b]) => a.localeCompare(b));
                  return (
                    <article
                      key={`${item.topic_id}-${i}`}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '14px 0',
                        borderTop: i === 0 ? 'none' : `1px solid ${WS.hairline}`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'ui-monospace, Menlo, monospace',
                          fontWeight: 600,
                          fontSize: 12,
                          color: WS.ink,
                          minWidth: 24,
                          paddingTop: 3,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {i + 1}.
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...microLabel, marginBottom: 5, letterSpacing: '0.06em', textTransform: 'none' }}>
                          {item.topic_id}
                        </div>
                        <div
                          className="ws-preview-stem"
                          style={{ color: WS.ink, marginBottom: 9, lineHeight: 1.55, fontSize: 14 }}
                          dangerouslySetInnerHTML={{ __html: item.stem_html }}
                        />
                        <ul
                          style={{
                            listStyle: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '5px 18px',
                          }}
                        >
                          {choices.map(([letter, html]) => (
                            <li key={letter} style={{ display: 'flex', gap: 8, color: WS.ink, fontSize: 13.5 }}>
                              <span
                                style={{
                                  fontFamily: 'ui-monospace, Menlo, monospace',
                                  fontSize: 10,
                                  fontWeight: 600,
                                  lineHeight: 1,
                                  padding: '3px 5px',
                                  background: WS.insetRow,
                                  border: `1px solid ${WS.hairline}`,
                                  color: WS.ink,
                                  flexShrink: 0,
                                  marginTop: 2,
                                }}
                              >
                                {letter}
                              </span>
                              <span dangerouslySetInnerHTML={{ __html: html }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </TeacherShell>
  );
}

function RailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
      <dt style={{ fontSize: 12.5, color: WS.muted }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 600,
          color: WS.ink,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </dd>
    </div>
  );
}
