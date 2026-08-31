'use client';

import { useCallback, useEffect, useState } from 'react';
import { DASH, flatPanelStyle } from '../components/dashboard-theme';
import { NAVY, INK_2, CTA_INK } from './dashboard-chrome';
import { CollapseButton, CollapseBody } from './collapse';
import NewAssignment, { type AssignTopic } from './NewAssignment';
import { FONT_HEADING } from '../components/fonts';
import { formatDue, isOverdue } from '../lib/assignments';

// What has been set, and how far the targeted students have got with it.
//
// EVERY NUMBER HERE IS DERIVED, NOTHING IS STORED. The counts come from
// /api/teacher/assignments, which reads getTopicStatuses for the resolved
// targets and tallies the three statuses. There is no completion column on an
// assignment and there must not be one -- see the route header.
//
// STATUS ONLY, NEVER SCORES. The response carries no correct counts, no
// percentages and no completedAt stamp; this component could not render them if
// it wanted to. Same constraint, enforced the same way (server-side projection
// rather than client-side restraint), as CurriculumProgressPanel.

type Assignment = {
  id: string;
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  target_type: 'student' | 'class';
  due_at: string | null;
  created_at: string;
  target_count: number;
  complete: number;
  in_progress: number;
  not_started: number;
};

/** A filled bar in three parts. The only thing carrying status colour. */
function StatusBar({ a }: { a: Assignment }) {
  const total = a.target_count;
  if (total === 0) return null;
  const seg = (n: number, color: string) =>
    n > 0 ? <span style={{ width: `${(n / total) * 100}%`, background: color, display: 'block' }} /> : null;
  return (
    <div style={{ display: 'flex', height: 6, overflow: 'hidden', background: DASH.trackBg, marginTop: 9 }}>
      {seg(a.complete, DASH.statusComplete)}
      {seg(a.in_progress, DASH.statusProgress)}
    </div>
  );
}

// SETTING WORK AND READING IT ARE ONE PANEL NOW.
//
// This used to be the second half of a pair: NewAssignment rendered its own card
// with its own "Assignments" heading further up the page, and this rendered
// "Assigned work" below it. Two panels, two headings a teacher had to tell
// apart, and the compose form nowhere near the list it changed.
//
// The trigger moved into this header and the form renders underneath it. The
// component is the SAME NewAssignment, mounted with chrome={false} so it brings
// the form and none of its old furniture. Nothing about the form was copied.
export default function AssignmentsPanel({
  classId,
  topics,
  students,
  isMobile,
}: {
  classId: string;
  /** For the compose form this header now owns. */
  topics: AssignTopic[];
  students: { student_id: string; name: string }[];
  isMobile: boolean;
}) {
  const [rows, setRows] = useState<Assignment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  /**
   * The clock this panel measures "overdue" against, read WHEN THE DATA LOADS
   * rather than while rendering.
   *
   * Date.now() inline in the render body is an impure call during render, which
   * react-hooks/purity refuses -- and it is right to: a component that reads the
   * clock while rendering produces a different tree for the same props, so React
   * is free to render it twice and get two answers. This is a real constraint,
   * not a lint preference, so it is fixed by moving the read rather than by
   * silencing the rule.
   *
   * LOADED-AT, NOT MOUNTED-AT, and the distinction is the honest one: the
   * complete / in-progress / not-started counts beside the due date were
   * computed by the server for that same read. Measuring the deadline against
   * the moment those counts arrived keeps every number in a row describing the
   * same instant. A clock captured at mount would drift away from the counts on
   * every refresh; a clock read at render would disagree with them by however
   * long the panel had been open.
   *
   * Null until the first load resolves. Nothing renders a due-date chip before
   * then, because the list itself is null until the same moment.
   */
  const [loadedAt, setLoadedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!classId) return;
    setFailed(false);
    try {
      const res = await fetch(`/api/teacher/assignments?class_id=${classId}`);
      if (!res.ok) {
        setFailed(true);
        setRows([]);
        return;
      }
      const body = await res.json();
      // Read here, in the loader, which is the whole point: this runs from an
      // effect, not from the render path.
      setLoadedAt(Date.now());
      // stored:false is the pre-migration answer. Render nothing at all rather
      // than an empty list that reads as "you have set no work".
      setRows(body.stored === false ? null : (body.assignments ?? []));
    } catch {
      setFailed(true);
      setRows([]);
    }
  }, [classId]);

  useEffect(() => { setRows(null); load(); }, [load]);

  // THE ROUND TRIP IS GONE. A new assignment used to travel up to
  // TeacherDashboardClient, bump an `assignmentsKey` integer, and come back down
  // as a changed prop purely to make this panel refetch -- state in a parent
  // that existed only because the two components could not talk. They are one
  // panel now, so the form calls this directly.
  function reloadAfterCreate() {
    setComposeOpen(false);
    load();
  }

  async function remove(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (rows === null && !failed) return null;
  if (failed) {
    // One panel, not the dashboard. Same call the curriculum rollup makes.
    return null;
  }
  const list = rows ?? [];

  return (
    // THE PANEL, AND THE HEADER LIVES INSIDE IT.
    //
    // padding and marginBottom are CurriculumRollupPanel's, read off it rather
    // than picked, so all six sections down the page share one rhythm.
    //
    // ONLY THE BODY COLLAPSES, NEVER THE PANEL. The panel is the outer div and
    // it has no collapse wrapper on it; CollapseBody sits inside, below the
    // header. So a collapsed section is a normal panel showing its header at
    // full padding, exactly as CurriculumRollupPanel has always behaved, rather
    // than a card that shrinks to a hairline and disappears.
    <div style={{ ...flatPanelStyle(), padding: '18px 22px 20px', marginBottom: 26 }}>
      {/* THE HEADER ROW STAYS VISIBLE WHEN COLLAPSED, at all four collapsible
          sections. A collapsed section that shows nothing but a chevron is a
          mystery box; one that keeps its title and its count is a summary. */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: DASH.heading }}>
            Assigned work
          </h2>
          <span style={{ fontSize: 13, color: INK_2 }}>
            {list.length === 0
              ? 'Live status, computed from student progress'
              : `${list.length} set · live status, computed from student progress`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* THE TRIGGER THAT MOVED. Orange fill when closed, navy outline once
              open, the same pair it carried in its old card. */}
          <button
            type="button"
            onClick={() => setComposeOpen((o) => !o)}
            disabled={!classId}
            className={composeOpen ? 'um-tdash-ghost' : 'um-tdash-cta'}
            style={{
              border: composeOpen ? `1px solid ${NAVY}` : 'none',
              borderRadius: 0,
              padding: '7px 14px',
              cursor: classId ? 'pointer' : 'not-allowed',
              opacity: classId ? 1 : 0.5,
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: composeOpen ? 600 : 700,
              color: composeOpen ? undefined : CTA_INK,
            }}
          >
            {composeOpen ? 'Cancel' : '+ New'}
          </button>
          <CollapseButton
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            controls="assigned-work-body"
            section="assigned work"
          />
        </div>
      </div>

      <CollapseBody id="assigned-work-body" collapsed={collapsed}>
      {/* The compose form, inside the collapse: opening a section to set work
          and then collapsing it should take the form with it. */}
      <NewAssignment
        classId={classId}
        topics={topics}
        students={students}
        onCreated={reloadAfterCreate}
        chrome={false}
        open={composeOpen}
        onOpenChange={setComposeOpen}
      />

      {list.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: DASH.dim, marginBottom: 11, marginTop: composeOpen ? 16 : 0 }}>
          {[['Complete', DASH.statusComplete], ['In progress', DASH.statusProgress], ['Not started', DASH.statusIdle]].map(([t, c]) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, background: c, display: 'inline-block' }} />{t}
            </span>
          ))}
        </div>
      )}

      {/* No border of its own any more: it sits inside the section panel, and a
          bordered box inside a bordered box is two hairlines saying the same
          thing. Same for the list container below. */}
      {list.length === 0 ? (
        <div style={{ padding: '20px 0 4px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: INK_2, margin: 0 }}>
            Nothing assigned yet. Set a topic above and it will show up here with live progress.
          </p>
        </div>
      ) : (
        <div style={{ overflow: 'hidden' }}>
          {list.map((a, i) => {
            // OVERDUE IS DERIVED HERE, never stored. The API sends due_at raw:
            // an "overdue" computed on the server is wrong the moment the
            // response is cached, and wrong all night for a teacher in a
            // different timezone from the server.
            //
            // The comparison is against `loadedAt`, captured in the loader --
            // see the note on that state. Reading the clock on this line instead
            // would be an impure call during render. Same two conditions as
            // before, same answer: past its date, and not everyone is done.
            //
            // THE RULE MOVED, THE ANSWER DID NOT (Build 4b). This was the same
            // four-clause expression written inline; it is now the shared
            // helper, so the student surface cannot come to mean something
            // different by "overdue". The third argument is where the two
            // callers differ and all they differ by: this one asks whether
            // EVERYONE is done, the student one asks whether THEY are.
            const overdue = isOverdue(a.due_at, loadedAt, a.complete < a.target_count);

            return (
              <div
                key={a.id}
                style={{
                  padding: isMobile ? '14px 14px' : '14px 18px',
                  borderTop: i === 0 ? 'none' : `1px solid ${DASH.hairline}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 14,
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: DASH.heading }}>{a.topic_name}</span>
                    <span style={{ fontSize: 12, color: DASH.dim }}>{a.topic_id}</span>
                    {a.due_at && (
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 0,
                          background: overdue ? DASH.noticeWarnBg : DASH.chipBg,
                          color: overdue ? DASH.noticeWarn : INK_2,
                        }}
                      >
                        {overdue ? 'Overdue ' : 'Due '}{formatDue(a.due_at)}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 4, fontSize: 12.5, color: INK_2 }}>
                    {a.target_type === 'class' ? 'Whole class' : 'Selected students'}
                    {' · '}
                    {/* THE ZERO CASE IS NAMED, not rendered as "0 of 0 done".
                        A student-target assignment whose students have all left
                        the class reaches nobody, and a teacher needs to be told
                        that in words rather than shown an empty progress bar. */}
                    {a.target_count === 0
                      ? 'reaches nobody right now'
                      : `${a.complete} of ${a.target_count} complete`}
                    {a.target_count > 0 && a.in_progress > 0 && ` · ${a.in_progress} in progress`}
                  </div>

                  <StatusBar a={a} />
                </div>

                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  disabled={busyId === a.id}
                  className="um-tdash-ghost"
                  style={{
                    border: `1px solid ${NAVY}`,
                    borderRadius: 0,
                    padding: '6px 11px',
                    cursor: busyId === a.id ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 12.5,
                    flex: '0 0 auto',
                  }}
                >
                  {busyId === a.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      </CollapseBody>
    </div>
  );
}
