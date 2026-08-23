import { requireWorksheetTeacher, loadWorksheet, loadTopicMeta } from '../../worksheet-data';
import { resolveForKey } from '@/app/lib/worksheet-source';
import { PRINT_CSS } from '../../print-styles';
import { AnswerKeySheet } from '../../WorksheetSheet';
import PrintButton from '../../PrintButton';

// The answer key, chrome-free.
//
// ANSWER KEY DATA PATH, and the only route in the app that walks it.
// resolveForKey() reads curriculum_topics -- the BASE table -- through the admin
// client for correct_answer, worked_solutions and distractor_prose. That is
// legitimate here and nowhere else, and it is why requireWorksheetTeacher() runs
// before the load rather than after it.
//
// Deliberately NOT a query parameter on the worksheet print route. One handler
// with `?key=1` would fetch answers and then decide whether to render them, and
// that decision is one bad conditional away from being wrong. Two routes means
// the worksheet handler never holds an answer at all.
//
// THE MISCONCEPTION NOTES ARE THE POINT. Every competitor prints a letter. The
// line saying what the students who chose C actually did is the thing worth
// paying for, so it gets a panel rather than a footnote.

export const dynamic = 'force-dynamic';

export default async function AnswerKeyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireWorksheetTeacher(`/teacher/worksheets/${id}/key`);
  const worksheet = await loadWorksheet(id, profile.id);
  const items = await resolveForKey(worksheet.course_id, worksheet.items);
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
        <PrintButton label="Print answer key" />
        <a className="ws-btn" href={`/teacher/worksheets/${id}/print`}>Worksheet</a>
        <a className="ws-btn" href={`/teacher/worksheets/${id}`}>Back</a>
      </div>
      <AnswerKeySheet
        title={worksheet.title}
        items={items}
        created={created}
        topicMeta={topicMeta}
      />
    </>
  );
}
