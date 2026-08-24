'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DASH, cardStyle } from '../../../components/dashboard-theme';
import { FONT_BODY, FONT_HEADING } from '../../../components/fonts';
import { UNIT_TITLES } from '../../../lib/units';

// One student's curriculum progress, for their teacher.
//
// ITS OWN FILE, ON DASH TOKENS, for the reason OfficialScorePanel.tsx:15-20
// already gives: page.tsx is 364 lines of hardcoded hexes on no token system,
// and the way to stop that spreading is to not add to it.
//
// STATUS ONLY. Three states per topic and the counts over them. No scores, no
// percentages, no gate progress -- the route does not serialize them (see its
// header) and this component could not render them if it wanted to. Grades are
// Build 3.
//
// EVERY "complete" HERE IS THE LIVE A1 COMPUTATION, arriving as `status` off
// /api/teacher/curriculum-progress, which strips the stored completed_at stamp
// server-side. There is no field on this component's data that could be read by
// mistake, which is the point of stripping it there rather than here.

type TopicRow = {
  course_id: string;
  topic_id: string;
  topic_name: string;
  unit_number: number;
  sequence_in_unit: number;
  status: 'complete' | 'in_progress' | 'not_started';
  last_worked_at: string | null;
};

type Summary = { complete: number; inProgress: number; notStarted: number; total: number };

const STATUS_LABEL: Record<TopicRow['status'], string> = {
  complete: 'Complete',
  in_progress: 'In progress',
  not_started: 'Not started',
};

// The three status colours are DASH tokens with measured contrast, not new
// hexes: statusComplete 5.69 and statusProgress 4.70 on cardBg. See
// dashboard-theme.ts:202-209.
const STATUS_COLOR: Record<TopicRow['status'], string> = {
  complete: DASH.statusComplete,
  in_progress: DASH.statusProgress,
  not_started: DASH.statusIdle,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** A filled dot in the status colour. The only thing carrying status colour. */
function StatusDot({ status }: { status: TopicRow['status'] }) {
  const filled = status !== 'not_started';
  return (
    <span
      aria-hidden
      style={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        flex: '0 0 9px',
        background: filled ? STATUS_COLOR[status] : 'transparent',
        border: filled ? 'none' : `1.5px solid ${DASH.statusIdle}`,
      }}
    />
  );
}

export default function CurriculumProgressPanel({
  studentId,
  classId,
  isMobile,
}: {
  studentId: string;
  classId: string;
  isMobile: boolean;
}) {
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openUnits, setOpenUnits] = useState<Set<number> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/teacher/curriculum-progress?student_id=${studentId}&class_id=${classId}`
      );
      if (!res.ok) {
        setLoadError('Could not load curriculum progress.');
        setTopics([]);
        return;
      }
      const body = await res.json();
      setLoadError(null);
      setTopics(body.topics ?? []);
      setSummary(body.summary ?? null);
    } catch {
      setLoadError('Could not load curriculum progress.');
      setTopics([]);
    }
  }, [studentId, classId]);

  useEffect(() => {
    if (studentId && classId) load();
  }, [studentId, classId, load]);

  // Topics arrive in course order off the route, which orders by
  // (unit_number, sequence_in_unit). Grouping preserves that; it does not re-sort.
  const units = useMemo(() => {
    const byUnit = new Map<number, TopicRow[]>();
    for (const topic of topics ?? []) {
      if (!byUnit.has(topic.unit_number)) byUnit.set(topic.unit_number, []);
      byUnit.get(topic.unit_number)!.push(topic);
    }
    return [...byUnit.entries()].sort((a, b) => a[0] - b[0]);
  }, [topics]);

  // Units with activity open themselves; the rest stay shut.
  //
  // 97 topics is six screens of list, and all-shut hides the only rows a teacher
  // came to see while all-open buries them. Computed once, when the data lands,
  // and held as state afterwards so a teacher's own open/shut choices survive --
  // deriving it on every render would slam a unit shut the moment they opened it.
  useEffect(() => {
    if (topics === null || openUnits !== null) return;
    const active = new Set<number>();
    for (const topic of topics) {
      if (topic.status !== 'not_started') active.add(topic.unit_number);
    }
    setOpenUnits(active);
  }, [topics, openUnits]);

  const toggle = (unit: number) => {
    setOpenUnits((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(unit)) next.delete(unit);
      else next.add(unit);
      return next;
    });
  };

  const heading = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 13,
        gap: 10,
        flexWrap: 'wrap',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: FONT_HEADING,
          fontWeight: 600,
          fontSize: 18,
          color: DASH.heading,
        }}
      >
        Curriculum progress
      </h2>
      <span style={{ fontSize: 12, color: DASH.dim }}>
        Course status, updated live
      </span>
    </div>
  );

  if (loadError) {
    return (
      <div style={{ fontFamily: FONT_BODY }}>
        {heading}
        <div style={{ ...cardStyle(), padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: DASH.muted, margin: 0 }}>{loadError}</p>
        </div>
      </div>
    );
  }

  if (topics === null || summary === null) {
    return (
      <div style={{ fontFamily: FONT_BODY }}>
        {heading}
        <div style={{ ...cardStyle(), padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: DASH.muted, margin: 0 }}>Loading…</p>
        </div>
      </div>
    );
  }

  const { complete, inProgress, notStarted, total } = summary;
  const touched = complete + inProgress;

  // Percentages for the bar. Guarded against a zero denominator, which would
  // only happen with an empty course, but NaN% is a silently invisible bar.
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  const counts: { label: string; value: number; status: TopicRow['status'] }[] = [
    { label: 'Complete', value: complete, status: 'complete' },
    { label: 'In progress', value: inProgress, status: 'in_progress' },
    { label: 'Not started', value: notStarted, status: 'not_started' },
  ];

  return (
    <div style={{ fontFamily: FONT_BODY }}>
      {heading}

      <div style={{ ...cardStyle(), padding: isMobile ? 18 : '20px 22px' }}>
        {/* The headline: N of 97 complete. The denominator is the course, so it
            reads the same as the student's own syllabus does. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: DASH.heading,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {complete}
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: DASH.dim }}>
            of {total} topics complete
          </span>
        </div>
        <div style={{ fontSize: 12, color: DASH.muted, marginBottom: 14 }}>
          {touched === 0
            ? 'Has not started the course yet'
            : `${touched} ${touched === 1 ? 'topic' : 'topics'} opened so far`}
        </div>

        {/* Three-segment bar. Not-started is the track itself rather than a third
            fill, so an untouched course reads as an empty bar and not as a full
            grey one. */}
        <div
          style={{
            display: 'flex',
            height: 10,
            borderRadius: 20,
            overflow: 'hidden',
            background: DASH.trackBg,
            marginBottom: 14,
          }}
        >
          <div style={{ width: `${pct(complete)}%`, background: DASH.statusComplete }} />
          <div style={{ width: `${pct(inProgress)}%`, background: DASH.statusProgress }} />
        </div>

        <div style={{ display: 'flex', gap: isMobile ? 16 : 26, flexWrap: 'wrap' }}>
          {counts.map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusDot status={c.status} />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: DASH.heading,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {c.value}
              </span>
              <span style={{ fontSize: 12.5, color: DASH.muted }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per unit, per topic. */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {units.map(([unit, unitTopics]) => {
          const open = openUnits?.has(unit) ?? false;
          const unitComplete = unitTopics.filter((t) => t.status === 'complete').length;
          const unitTouched = unitTopics.filter((t) => t.status !== 'not_started').length;
          return (
            <div key={unit} style={{ ...cardStyle(), overflow: 'hidden' }}>
              <button
                onClick={() => toggle(unit)}
                aria-expanded={open}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: isMobile ? '13px 15px' : '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: DASH.dim,
                    }}
                  >
                    Unit {unit}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 2,
                      fontSize: 14,
                      fontWeight: 600,
                      color: DASH.heading,
                    }}
                  >
                    {UNIT_TITLES[unit] ?? 'Untitled unit'}
                  </span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: unitTouched > 0 ? DASH.muted : DASH.dim,
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {unitComplete}/{unitTopics.length}
                  </span>
                  <span
                    aria-hidden
                    style={{
                      fontSize: 11,
                      color: DASH.dim,
                      transform: open ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.12s',
                    }}
                  >
                    ▶
                  </span>
                </span>
              </button>

              {open && (
                <div style={{ borderTop: `1px solid ${DASH.hairline}` }}>
                  {unitTopics.map((topic, i) => (
                    <div
                      key={`${topic.course_id}:${topic.topic_id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 11,
                        padding: isMobile ? '10px 15px' : '10px 18px',
                        borderTop: i === 0 ? 'none' : `1px solid ${DASH.hairline}`,
                      }}
                    >
                      <StatusDot status={topic.status} />
                      <span
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: 11,
                          color: DASH.muted,
                          background: DASH.chipBg,
                          padding: '3px 7px',
                          borderRadius: 5,
                          flexShrink: 0,
                        }}
                      >
                        {topic.topic_id}
                      </span>
                      <span
                        style={{
                          fontSize: 13.5,
                          color: DASH.ink,
                          flex: '1 1 auto',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {topic.topic_name}
                      </span>
                      {!isMobile && topic.last_worked_at && (
                        <span
                          style={{ fontSize: 11.5, color: DASH.dim, flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {formatDate(topic.last_worked_at)}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color:
                            topic.status === 'not_started' ? DASH.dim : STATUS_COLOR[topic.status],
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          width: isMobile ? undefined : 78,
                          textAlign: 'right',
                        }}
                      >
                        {STATUS_LABEL[topic.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
