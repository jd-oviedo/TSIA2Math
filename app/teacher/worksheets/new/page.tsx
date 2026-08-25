import { requireWorksheetTeacher } from '../worksheet-data';
import { listPickerTopics } from '@/app/lib/worksheet-source';
import { readWorksheetQuota } from '../../../lib/worksheet-quota';
import WorksheetBuilder from './WorksheetBuilder';
import TeacherShell from '../../TeacherShell';
import { loadTeacherIdentity } from '../../teacher-identity';

export const dynamic = 'force-dynamic';

// The picker.
//
// Topics are loaded server-side through the PUBLIC view, then handed to the
// builder as plain data. The builder is a client component and everything it
// receives ships to the browser, which is exactly why listPickerTopics() reads
// curriculum_topics_public and never the base table: there is no answer in this
// payload to leak, by construction rather than by care.
export default async function NewWorksheetPage() {
  const profile = await requireWorksheetTeacher('/teacher/worksheets/new');
  // For the rail. After the gate, like every other read on this page.
  const identity = await loadTeacherIdentity();
  const topics = await listPickerTopics('tsia2-math');

  // Read here rather than trusted from the index. This page is directly
  // reachable by URL, so a teacher who is at their cap must meet the same state
  // whether they clicked through or typed the address.
  const quota = await readWorksheetQuota(profile.id, profile.plan);

  return (
    <TeacherShell
      variant="standalone"
      activeLabel="Worksheets"
      teacherName={identity.teacherName}
      teacherEmail={identity.teacherEmail}
      isFounder={identity.isFounder}
      plan={profile.plan}
    >
      <WorksheetBuilder
        topics={topics}
        quotaUsed={quota.unmetered ? null : quota.used}
        quotaCap={quota.cap}
      />
    </TeacherShell>
  );
}
