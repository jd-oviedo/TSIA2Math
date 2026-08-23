import { requireWorksheetTeacher, loadWorksheet, loadTopicMeta } from '../../worksheet-data';
import { resolveForPrint } from '@/app/lib/worksheet-source';
import { PRINT_CSS } from '../../print-styles';
import { WorksheetSheet } from '../../WorksheetSheet';
import PrintButton from '../../PrintButton';

// The worksheet, chrome-free, for the browser's own print-to-PDF.
//
// WORKSHEET DATA PATH. resolveForPrint() reads curriculum_topics_public for
// static items -- the redacted view, where jsonb_strip_keys has already removed
// correct_answer and misconception_tag -- and selects stems and choices only for
// rolled ones. No answer is fetched on this route at any point, so none can be
// leaked by a rendering mistake, a serialisation bug, or a future edit that adds
// one more field to a prop.
//
// No PDF library. The browser's print dialog produces better typography than
// anything we would generate, honours the user's paper size, and costs no
// dependency. The page's whole job is to be worth printing.

export const dynamic = 'force-dynamic';

export default async function WorksheetPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireWorksheetTeacher(`/teacher/worksheets/${id}/print`);
  const worksheet = await loadWorksheet(id, profile.id);
  const items = await resolveForPrint(worksheet.course_id, worksheet.items);
  // Names and strands for the topic headings. A second read rather than a
  // wider resolveForPrint: neither column is answer-bearing, and the print
  // resolver's select list is the thing that keeps an answer off this route.
  const topicMeta = await loadTopicMeta(worksheet.course_id, worksheet.items);

  const created = new Date(worksheet.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="ws-toolbar no-print">
        <PrintButton label="Print worksheet" />
        <a className="ws-btn" href={`/teacher/worksheets/${id}/key`}>Answer key</a>
        <a className="ws-btn" href={`/teacher/worksheets/${id}`}>Back</a>
      </div>
      <WorksheetSheet
        title={worksheet.title}
        items={items}
        created={created}
        topicMeta={topicMeta}
      />
    </>
  );
}
