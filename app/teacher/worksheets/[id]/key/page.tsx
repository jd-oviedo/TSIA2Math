import {
  requireWorksheetTeacher,
  loadWorksheet,
  buildRationales,
} from '../../worksheet-data';
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
// TWO PAGES. The answer grid, then one line per question saying why the correct
// choice is correct. It used to print a third part, a Teacher Notes card per
// item, which ran the fixture's key to sixteen pages for twenty questions.
//
// The reasoning did not leave with it. The correct option's authored prose IS
// the rationale on page two, so what a teacher reads is the same sentence; what
// is gone is the per-item card that repeated the stem and the worked solution
// around it. See AnswerKeySheet.

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
  // No loadTopicMeta here. The topic name was a line on the Teacher Notes card
  // and nothing else on this route ever read it. The worksheet route still
  // needs it for its topic eyebrows, so the loader stays where it is.
  const rationales = buildRationales(items);

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
        rationales={rationales}
      />
    </>
  );
}
