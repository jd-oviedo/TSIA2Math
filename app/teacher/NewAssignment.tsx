'use client';

import { useMemo, useState } from 'react';
import { DASH, flatPanelStyle, DASH_FLAT } from '../components/dashboard-theme';
import { CTA_INK, NAVY, INK_2, DASH_HOVER_CSS } from './dashboard-chrome';
import { FONT_HEADING } from '../components/fonts';
import { UNIT_TITLES } from '../lib/units';

// Setting work: pick a topic, pick who it is for, optionally pick a due date.
//
// ON DASH TOKENS, NOT HARDCODED HEXES. NewAnnouncement.tsx beside it is a wall
// of literal '#0F1E35's written before dashboard-theme.ts existed. The way that
// stops spreading is to not add to it, which is the same call
// OfficialScorePanel.tsx:15-20 and CurriculumProgressPanel.tsx:8-13 both made.
//
// THE TOPIC LIST IS A PROP, loaded server-side and handed down. It is the same
// source and the same filter the worksheet picker uses -- non-placeholder topics
// only, ordered by (unit_number, sequence_in_unit) and never by topic_id, which
// scrambles the teaching order in three units (app/lib/worksheet-source.ts:157).
// The route re-checks assignability on every write regardless: this list is a
// convenience, not the gate.

export type AssignTopic = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
};

export type AssignStudent = {
  student_id: string;
  name: string;
};

type Target = 'class' | 'student';

export default function NewAssignment({
  classId,
  topics,
  students,
  onCreated,
}: {
  classId: string;
  topics: AssignTopic[];
  students: AssignStudent[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [topicKeyValue, setTopicKeyValue] = useState('');
  const [target, setTarget] = useState<Target>('class');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const byUnit = useMemo(() => {
    const map = new Map<number, AssignTopic[]>();
    for (const t of topics) {
      if (!map.has(t.unit_number)) map.set(t.unit_number, []);
      map.get(t.unit_number)!.push(t);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [topics]);

  const ready =
    topicKeyValue.length > 0 &&
    classId.length > 0 &&
    (target === 'class' || picked.size > 0);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);
    setDone(null);

    // The select carries "course:topic" so one value identifies a topic. The
    // pair is split apart again here rather than sent composed: the API takes
    // two columns, because a topic id alone does not identify a topic.
    const sep = topicKeyValue.indexOf(':');
    const course_id = topicKeyValue.slice(0, sep);
    const topic_id = topicKeyValue.slice(sep + 1);

    // A DUE DATE MEANS THE END OF THAT DAY, IN THE TEACHER'S OWN TIMEZONE.
    // <input type="date"> gives a bare YYYY-MM-DD, and turning that into
    // midnight UTC would make work "due Friday" overdue on Thursday evening for
    // a teacher in US Central. 23:59 local, converted to an instant here, is
    // what a teacher means by a due date.
    const due_at = dueDate ? new Date(`${dueDate}T23:59:00`).toISOString() : null;

    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          target === 'class'
            ? { class_id: classId, course_id, topic_id, target_type: 'class', due_at }
            : {
                class_id: classId,
                course_id,
                topic_id,
                target_type: 'student',
                due_at,
                student_ids: [...picked],
              }
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        // 409 is the A4 partial unique index: this topic already has a live
        // whole-class assignment here. Said in the teacher's terms, with the
        // action they can take, rather than as a failure.
        if (res.status === 409) {
          setError('That topic is already assigned to this whole class. Remove the existing one first, or assign it to specific students.');
        } else if (res.status === 404 && Array.isArray(data.rejected)) {
          setError(`${data.rejected.length} of the students you picked are no longer in this class. Refresh and try again.`);
        } else {
          setError(typeof data.error === 'string' ? data.error : 'Could not set that assignment.');
        }
        return;
      }

      setDone(
        target === 'class'
          ? 'Assigned to the whole class.'
          : `Assigned to ${picked.size} ${picked.size === 1 ? 'student' : 'students'}.`
      );
      setTopicKeyValue('');
      setPicked(new Set());
      setDueDate('');
      onCreated();
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  const field = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 0,
    border: `1px solid ${DASH_FLAT.panelHairline}`,
    fontFamily: 'inherit',
    fontSize: 13.5,
    color: DASH.ink,
    background: DASH.cardBg,
  } as const;

  const label = {
    display: 'block',
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    color: DASH.dim,
    marginBottom: 6,
  };

  return (
    // height 100% and NO marginBottom: this panel is one half of the two-up
    // row in TeacherDashboardClient, which owns the gap between the two and
    // stretches both to the taller one. A margin here would double the space
    // under the shorter card and pull the row out of alignment.
    <div style={{ ...flatPanelStyle(), padding: '18px 18px 16px', height: '100%' }}>
      {/* THIS COMPONENT CARRIES ITS OWN COPY OF THE HOVER SHEET, and that is
          not belt-and-braces. /um-verify/shell mounts it on its own, through
          ../um-verify/TeacherPanelControl.tsx, on a route that loads no
          dashboard CSS at all -- so a `.um-tdash-cta` button whose fill lived
          only in TeacherDashboardClient would paint transparent there. The
          dashboard emits the identical sheet; the rules are idempotent. */}
      <style>{DASH_HOVER_CSS}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 16, color: DASH.heading }}>
            Assignments
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: INK_2 }}>
            Set a topic for the whole class or for specific students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={!classId}
          // Orange fill with #111111 on it at 9.00 when closed; the navy
          // secondary outline once open, because Cancel is not the action
          // anybody came here for. The label shortens to "+ New": the heading
          // two lines up already says Assignments, and at half width
          // "+ New assignment" wrapped.
          className={open ? 'um-tdash-ghost' : 'um-tdash-cta'}
          style={{
            border: open ? `1px solid ${NAVY}` : 'none',
            borderRadius: 0,
            padding: '9px 16px',
            cursor: classId ? 'pointer' : 'not-allowed',
            opacity: classId ? 1 : 0.5,
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: open ? 600 : 700,
            color: open ? undefined : CTA_INK,
          }}
        >
          {open ? 'Cancel' : '+ New'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
          <div>
            <label htmlFor="assign-topic" style={label}>Topic</label>
            <select
              id="assign-topic"
              value={topicKeyValue}
              onChange={(e) => setTopicKeyValue(e.target.value)}
              style={field}
            >
              <option value="">Choose a topic…</option>
              {byUnit.map(([unit, list]) => (
                <optgroup key={unit} label={`Unit ${unit} · ${UNIT_TITLES[unit] ?? ''}`}>
                  {list.map((t) => (
                    <option key={`${t.course_id}:${t.topic_id}`} value={`${t.course_id}:${t.topic_id}`}>
                      {t.topic_id} — {t.topic_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {/* Said out loud rather than left as an absence. A teacher holding a
                syllabus that names more topics than this list shows should be
                told why, not left to wonder whether the picker is broken. */}
            <p style={{ margin: '6px 0 0', fontSize: 12, color: DASH.dim }}>
              Topics that are still being written cannot be assigned.
            </p>
          </div>

          <div>
            <span style={label}>Who</span>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: DASH.ink, cursor: 'pointer' }}>
                <input type="radio" name="assign-target" checked={target === 'class'} onChange={() => setTarget('class')} />
                Whole class
              </label>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 13.5,
                  color: students.length === 0 ? DASH.dim : DASH.ink,
                  cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="assign-target"
                  checked={target === 'student'}
                  disabled={students.length === 0}
                  onChange={() => setTarget('student')}
                />
                Specific students
              </label>
            </div>
            {target === 'class' && (
              // The live-resolution rule, in one sentence, where the decision is
              // being made. Whole-class is not a snapshot of today's roster.
              <p style={{ margin: '8px 0 0', fontSize: 12, color: DASH.dim }}>
                Everyone currently in the class, including anyone who joins later.
              </p>
            )}
          </div>

          {target === 'student' && (
            <div
              style={{
                border: `1px solid ${DASH_FLAT.panelHairline}`,
                borderRadius: 0,
                maxHeight: 190,
                overflowY: 'auto',
                background: DASH.subtleBg,
              }}
            >
              {students.map((s) => (
                <label
                  key={s.student_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '8px 12px',
                    fontSize: 13.5,
                    color: DASH.ink,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${DASH.hairline}`,
                  }}
                >
                  <input type="checkbox" checked={picked.has(s.student_id)} onChange={() => toggle(s.student_id)} />
                  {s.name}
                </label>
              ))}
            </div>
          )}

          <div style={{ maxWidth: 220 }}>
            <label htmlFor="assign-due" style={label}>Due date (optional)</label>
            <input
              id="assign-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={field}
            />
          </div>

          {error && <p style={{ margin: 0, fontSize: 13, color: '#C2402F' }}>{error}</p>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={submit}
              disabled={!ready || saving}
              // The class supplies the fill through --umt-cta-bg. The disabled
              // branch sets background inline, which beats the rule, so a
              // dead button keeps its grey however it is hovered.
              className="um-tdash-cta"
              style={{
                background: ready && !saving ? undefined : DASH.chipBg,
                border: 'none',
                borderRadius: 0,
                padding: '10px 18px',
                cursor: ready && !saving ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 700,
                color: ready && !saving ? CTA_INK : DASH.dim,
              }}
            >
              {saving ? 'Assigning…' : 'Assign'}
            </button>
            {done && <span style={{ fontSize: 13, color: DASH.noticeOk }}>{done}</span>}
          </div>
        </div>
      )}

      {!open && done && (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: DASH.noticeOk }}>{done}</p>
      )}
    </div>
  );
}
