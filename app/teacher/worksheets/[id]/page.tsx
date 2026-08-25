import Link from 'next/link';
import { requireWorksheetTeacher, loadWorksheet, loadTopicMeta } from '../worksheet-data';
import { resolveForPrint } from '../../../lib/worksheet-source';
import { WS, WS_CHROME_CSS, microLabel, panelStyle } from '../worksheet-theme';
import { PRINT_CSS } from '../print-styles';
import { WorksheetSheet } from '../WorksheetSheet';
import TeacherShell from '../../TeacherShell';
import { loadTeacherIdentity } from '../../teacher-identity';
import WorksheetTabs from './WorksheetTabs';

export const dynamic = 'force-dynamic';

// The worksheet: preview, answer key and print, on one page.
//
// THE PREVIEW IS THE SHEET. This route used to draw a bespoke one-column list
// and caption it to admit it was not the layout, while the actual two-column
// sheet lived on /print and the key on /key. All three are one page now, and
// what the teacher sees under the tabs is WorksheetSheet and AnswerKeySheet --
// the very components those routes rendered. Preview equals print by
// construction rather than by care, so the caption that used to apologise for
// the difference is gone with the difference.
//
// WHICH IS WHY PRINT_CSS IS INJECTED HERE. An earlier ruling kept PRINT_CSS and
// its @page off this route on the grounds that neither belongs on a screen. The
// real sheet now renders here and print runs through it, so that ruling is
// dead: without this stylesheet the sheet has no paper to be printed on. The
// chrome's own print rules live in WS_CHROME_CSS and neutralise every ancestor
// this page adds around the sheet.
//
// WORKSHEET DATA PATH, UNCHANGED. resolveForPrint() reads
// curriculum_topics_public, the redacted view where jsonb_strip_keys has
// already removed correct_answer, and selects stems and choices only for rolled
// items. No answer is fetched on this render at any point, so none can be
// leaked by a serialisation bug or by a future edit that adds one more field to
// a prop. The key arrives separately, on demand, through the server action in
// ./actions.ts, and only when a teacher selects that tab.
//
// WHAT THE BOARD ASKS FOR AND THIS STILL DOES NOT BUILD. The config rail on
// boards 04 and 05 is largely controls with no backing: header fields, a
// repeat-header toggle, page size, student work space, directions, an answer
// key QR code, version A/B, Download PDF, a page counter. Every one would
// change what prints, and the printed sheet is not in scope. The rail reads out
// what the worksheet IS rather than pretending to configure it.
export default async function WorksheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  // The index rows link here with ?tab=key so "Answer key" still lands on the
  // key in one click. It selects the starting tab and nothing else: the key
  // itself is still fetched by the action, after the tab is live, so arriving
  // with the parameter does not put an answer in this payload.
  const { tab } = await searchParams;
  const initialTab = tab === 'key' ? 'key' : 'questions';

  const profile = await requireWorksheetTeacher(`/teacher/worksheets/${id}`);
  const identity = await loadTeacherIdentity();
  const worksheet = await loadWorksheet(id, profile.id);
  const items = await resolveForPrint(worksheet.course_id, worksheet.items);
  // Names and strands for the topic headings. A second read rather than a wider
  // resolveForPrint: neither column is answer-bearing, and the print resolver's
  // select list is the thing that keeps an answer off this path.
  const topicMeta = await loadTopicMeta(worksheet.course_id, worksheet.items);

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
        {/* Order is not load-bearing between these two. The one selector pair
            that used to collide across them, .katex and a, no longer overlaps:
            the chrome's rules exclude .ws-sheet descendants outright. */}
        <style>{WS_CHROME_CSS}</style>
        <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

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
                Back to worksheets
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

              {missing > 0 && (
                <div style={{ ...panelStyle, padding: '12px 14px', boxShadow: `inset 3px 0 0 ${WS.marker}` }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: WS.ink, lineHeight: 1.5 }}>
                    {missing} question{missing === 1 ? '' : 's'} could not be loaded. The
                    underlying content may have changed since this worksheet was made.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── the tabs and the sheet ─────────────────────────────────────── */}
          <WorksheetTabs
            worksheetId={id}
            title={worksheet.title}
            initialTab={initialTab}
            questionsSheet={
              <WorksheetSheet title={worksheet.title} items={items} topicMeta={topicMeta} />
            }
          />
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
