import Link from 'next/link';
import { requireWorksheetTeacher, loadWorksheet } from '../worksheet-data';
import { resolveForPrint } from '@/app/lib/worksheet-source';
import { DASH, cardStyle } from '@/app/components/dashboard-theme';

export const dynamic = 'force-dynamic';

// Preview and print config.
//
// WORKSHEET DATA PATH, same as the print route: resolveForPrint(), never
// resolveForKey(). A preview showing the correct answers would be convenient and
// is exactly the shortcut that puts an answer one "view source" away from a
// student looking over a shoulder. The key has its own route.
export default async function WorksheetPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireWorksheetTeacher(`/teacher/worksheets/${id}`);
  const worksheet = await loadWorksheet(id, profile.id);
  const items = await resolveForPrint(worksheet.course_id, worksheet.items);

  const topics = worksheet.options.topics ?? [];
  const levels = worksheet.options.levels ?? [];
  // Missing items mean a reference no longer resolves -- a retired instance with
  // no row, or a topic re-uploaded without that item number. Surfaced rather
  // than quietly printing a shorter sheet.
  const missing = worksheet.items.length - items.length;

  return (
    <main style={{ background: DASH.pageBg, minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Link href="/teacher/worksheets" style={{ fontSize: 13, color: DASH.muted, textDecoration: 'none' }}>
          ← Worksheets
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 16,
            margin: '8px 0 20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: DASH.heading, margin: '0 0 5px', letterSpacing: '-0.01em' }}>
              {worksheet.title}
            </h1>
            <p style={{ fontSize: 13.5, color: DASH.muted, margin: 0 }}>
              {items.length} question{items.length === 1 ? '' : 's'}
              {topics.length > 0 && ` · ${topics.length} topic${topics.length === 1 ? '' : 's'}`}
              {levels.length > 0 && ` · ${levels.join(', ')}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <Link href={`/teacher/worksheets/${id}/print`} style={primaryBtn}>
              Print worksheet
            </Link>
            <Link href={`/teacher/worksheets/${id}/key`} style={secondaryBtn}>
              Answer key
            </Link>
          </div>
        </div>

        {missing > 0 && (
          <div style={{ ...cardStyle(DASH), padding: '14px 16px', marginBottom: 16, borderLeft: '4px solid #B08328' }}>
            <p style={{ margin: 0, fontSize: 13.5, color: DASH.ink }}>
              {missing} question{missing === 1 ? '' : 's'} could not be loaded. The
              underlying content may have changed since this worksheet was made.
            </p>
          </div>
        )}

        <div style={{ ...cardStyle(DASH), padding: '26px 30px' }}>
          {items.map((item, i) => {
            const choices = Object.entries(item.choices_html).sort(([a], [b]) => a.localeCompare(b));
            return (
              <article
                key={`${item.topic_id}-${i}`}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${DASH.hairline}`,
                }}
              >
                <div style={{ fontWeight: 700, color: DASH.heading, minWidth: 24, fontVariantNumeric: 'tabular-nums' }}>
                  {i + 1}.
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: DASH.dim, marginBottom: 4, letterSpacing: '0.05em' }}>
                    {item.topic_id}
                  </div>
                  <div
                    style={{ color: DASH.ink, marginBottom: 8, lineHeight: 1.5 }}
                    dangerouslySetInnerHTML={{ __html: item.stem_html }}
                  />
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px 18px' }}>
                    {choices.map(([letter, html]) => (
                      <li key={letter} style={{ display: 'flex', gap: 7, color: DASH.muted, fontSize: 14 }}>
                        <span style={{ fontWeight: 600, color: DASH.ink }}>{letter})</span>
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
    </main>
  );
}

const primaryBtn: React.CSSProperties = {
  background: DASH.heading,
  color: '#FFF',
  padding: '10px 17px',
  borderRadius: 9,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const secondaryBtn: React.CSSProperties = {
  background: '#FFF',
  color: DASH.ink,
  border: `1px solid ${DASH.line}`,
  padding: '10px 17px',
  borderRadius: 9,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};
