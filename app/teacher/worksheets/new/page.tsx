import { requireWorksheetTeacher } from '../worksheet-data';
import { listPickerTopics } from '@/app/lib/worksheet-source';
import WorksheetBuilder from './WorksheetBuilder';

export const dynamic = 'force-dynamic';

// The picker.
//
// Topics are loaded server-side through the PUBLIC view, then handed to the
// builder as plain data. The builder is a client component and everything it
// receives ships to the browser, which is exactly why listPickerTopics() reads
// curriculum_topics_public and never the base table: there is no answer in this
// payload to leak, by construction rather than by care.
export default async function NewWorksheetPage() {
  await requireWorksheetTeacher('/teacher/worksheets/new');
  const topics = await listPickerTopics('tsia2-math');
  return <WorksheetBuilder topics={topics} />;
}
