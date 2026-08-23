'use client';

import { useCallback, useEffect, useState } from 'react';
import { DASH, cardStyle } from '../../../components/dashboard-theme';
import { FONT_BODY, FONT_HEADING } from '../../../components/fonts';
import {
  DELTA_LABEL,
  OFFICIAL_LEVELS,
  PASSING_WARNING_HINT,
  hasPassingScoreWithLevels,
  type OfficialLevel,
} from '../../../lib/official-scores';

// The official TSIA2A result: entry form, history, and the correction handle.
//
// A SEPARATE FILE FROM page.tsx, DELIBERATELY. The page is 355 lines of
// hardcoded hexes on no token system at all (see the PR body), and this is the
// first thing added to it since. Putting the new surface in its own component
// means it can be built on DASH tokens without either refactoring 29 existing
// colours or inheriting them.
//
// LIGHT ONLY, matching every other /teacher surface. dashboard-theme.ts states
// that the teacher dashboard is light-only and exports DASH = LIGHT rather than
// branching; there is no data-theme anywhere in this tree to respond to.
//
// ORANGE IS NEVER TEXT HERE. The warning below is a tinted panel with a rule and
// ink on it, not orange words. DASH.noticeWarn exists and measures 4.70, and the
// house rule is still that the fill carries the colour and the label takes ink.

type ScoreRow = {
  id: string;
  official_crc_score: number;
  test_date: string;
  level_qr: OfficialLevel | null;
  level_ar: OfficialLevel | null;
  level_gr: OfficialLevel | null;
  level_pr: OfficialLevel | null;
  created_at: string;
  corrected_at: string | null;
  entered_despite_warning: boolean;
  practice_estimate: number | null;
  practice_taken_at: string | null;
  delta: number | null;
  correctable: boolean;
};

const STRAND_FIELDS = [
  { key: 'level_qr', code: 'QR' },
  { key: 'level_ar', code: 'AR' },
  { key: 'level_gr', code: 'GR' },
  { key: 'level_pr', code: 'PR' },
] as const;

type LevelKey = (typeof STRAND_FIELDS)[number]['key'];

type FormState = {
  official_crc_score: string;
  test_date: string;
  level_qr: OfficialLevel | '';
  level_ar: OfficialLevel | '';
  level_gr: OfficialLevel | '';
  level_pr: OfficialLevel | '';
  affirmed: boolean;
};

const EMPTY_FORM: FormState = {
  official_crc_score: '',
  test_date: '',
  level_qr: '',
  level_ar: '',
  level_gr: '',
  level_pr: '',
  affirmed: false,
};

function formatDay(iso: string): string {
  // The stored value is a bare date. Parsed as UTC on purpose: `new Date('2026-12-05')`
  // is already UTC midnight, and formatting it in local time would print the 4th
  // for anyone west of Greenwich.
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: DASH.dim,
  marginBottom: 6,
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  border: `1px solid ${DASH.line}`,
  borderRadius: 2,
  fontSize: 14,
  fontFamily: FONT_BODY,
  color: DASH.ink,
  background: DASH.cardBg,
};

// 2px radius, no shadow, no gradient, no scale transform. The house rule for a
// new control, applied rather than argued with.
function buttonStyle(kind: 'primary' | 'quiet'): React.CSSProperties {
  return {
    padding: '9px 16px',
    borderRadius: 2,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: FONT_BODY,
    cursor: 'pointer',
    border: kind === 'primary' ? '1px solid #A8631F' : `1px solid ${DASH.line}`,
    // Orange as a CTA FILL with ink on it, which is the permitted use. Never as
    // the colour of a word.
    background: kind === 'primary' ? '#F0A33E' : 'transparent',
    color: kind === 'primary' ? DASH.ink : DASH.muted,
  };
}

export default function OfficialScorePanel({
  studentId,
  classId,
  isMobile,
}: {
  studentId: string;
  classId: string;
  isMobile: boolean;
}) {
  const [scores, setScores] = useState<ScoreRow[] | null>(null);
  const [stored, setStored] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // NOTHING BEFORE THE FIRST await TOUCHES STATE. Clearing the error up here
  // would be a setState in the synchronous part of the function, which is a
  // cascading render when the mount effect calls it (react-hooks/
  // set-state-in-effect). Each branch below sets the error to its final value
  // instead, which also stops a stale message flickering away and back on a
  // retry that fails again.
  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/teacher/official-scores?student_id=${studentId}&class_id=${classId}`
      );
      if (!res.ok) {
        setLoadError('Could not load official scores.');
        setScores([]);
        return;
      }
      const body = await res.json();
      setLoadError(null);
      setScores(body.scores ?? []);
      setStored(body.stored !== false);
    } catch {
      setLoadError('Could not load official scores.');
      setScores([]);
    }
  }, [studentId, classId]);

  useEffect(() => {
    load();
  }, [load]);

  const levels: (OfficialLevel | null)[] = STRAND_FIELDS.map(
    (f) => (form[f.key] === '' ? null : (form[f.key] as OfficialLevel))
  );
  const parsedScore = Number.parseInt(form.official_crc_score, 10);
  // Decision 8: warn, never block. Computed from the same helper the server uses
  // so the screen and the stored flag cannot disagree about what an anomaly is.
  const showWarning =
    Number.isFinite(parsedScore) && hasPassingScoreWithLevels(parsedScore, levels);

  function beginAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setOpen(true);
  }

  function beginCorrect(row: ScoreRow) {
    setEditingId(row.id);
    setForm({
      official_crc_score: String(row.official_crc_score),
      test_date: row.test_date.slice(0, 10),
      level_qr: row.level_qr ?? '',
      level_ar: row.level_ar ?? '',
      level_gr: row.level_gr ?? '',
      level_pr: row.level_pr ?? '',
      // Re-affirmation is required for a correction too. The teacher is
      // vouching for the NEW values, and carrying the old tick forward would
      // mean the affirmation names something nobody looked at.
      affirmed: false,
    });
    setFormError(null);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload = {
      official_crc_score: Number.parseInt(form.official_crc_score, 10),
      test_date: form.test_date,
      level_qr: form.level_qr === '' ? null : form.level_qr,
      level_ar: form.level_ar === '' ? null : form.level_ar,
      level_gr: form.level_gr === '' ? null : form.level_gr,
      level_pr: form.level_pr === '' ? null : form.level_pr,
      affirmed_official_report: form.affirmed,
      ...(editingId ? { id: editingId } : { student_id: studentId, class_id: classId }),
    };

    try {
      const res = await fetch('/api/teacher/official-scores', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFormError(typeof body.error === 'string' ? body.error : 'Could not save.');
        return;
      }
      setOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch {
      setFormError('Could not save.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setSaving(true);
    try {
      const res = await fetch('/api/teacher/official-scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setLoadError(typeof body.error === 'string' ? body.error : 'Could not remove.');
        return;
      }
      await load();
    } catch {
      setLoadError('Could not remove.');
    } finally {
      setSaving(false);
    }
  }

  const panel: React.CSSProperties = { ...cardStyle(), padding: isMobile ? '18px 16px' : '20px 22px' };

  return (
    <div>
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
          Official TSIA2 result
        </h2>
        <span style={{ fontSize: 12, color: DASH.dim }}>
          From the student&rsquo;s College Board score report
        </span>
      </div>

      <div style={panel}>
        {loadError && (
          <p style={{ margin: '0 0 12px', fontSize: 13.5, color: DASH.noticeWarn }}>{loadError}</p>
        )}

        {!stored && (
          <p style={{ margin: '0 0 12px', fontSize: 13.5, color: DASH.muted }}>
            Official score storage is not set up yet.
          </p>
        )}

        {scores === null ? (
          <p style={{ margin: 0, fontSize: 13.5, color: DASH.dim }}>Loading…</p>
        ) : scores.length === 0 && !open ? (
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: DASH.muted }}>
              No official result recorded. A passing student has no strand detail on their
              report, which is normal and complete.
            </p>
            <button type="button" style={buttonStyle('primary')} onClick={beginAdd}>
              Record official score
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {scores.map((row) => (
              <HistoryRow
                key={row.id}
                row={row}
                isMobile={isMobile}
                busy={saving}
                onCorrect={() => beginCorrect(row)}
                onRemove={() => remove(row.id)}
              />
            ))}
            {!open && (
              <div>
                <button type="button" style={buttonStyle('primary')} onClick={beginAdd}>
                  Record another sitting
                </button>
              </div>
            )}
          </div>
        )}

        {open && (
          <form onSubmit={submit} style={{ marginTop: scores && scores.length > 0 ? 18 : 0 }}>
            <div
              style={{
                borderTop: scores && scores.length > 0 ? `1px solid ${DASH.hairline}` : 'none',
                paddingTop: scores && scores.length > 0 ? 18 : 0,
              }}
            >
              <h3
                style={{
                  margin: '0 0 14px',
                  fontFamily: FONT_HEADING,
                  fontWeight: 600,
                  fontSize: 15,
                  color: DASH.heading,
                }}
              >
                {editingId ? 'Correct this entry' : 'New official result'}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={labelStyle} htmlFor="os-score">
                    CRC score (910 to 990)
                  </label>
                  <input
                    id="os-score"
                    type="number"
                    inputMode="numeric"
                    min={910}
                    max={990}
                    step={1}
                    required
                    value={form.official_crc_score}
                    onChange={(e) =>
                      setForm({ ...form, official_crc_score: e.target.value })
                    }
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="os-date">
                    Test date
                  </label>
                  <input
                    id="os-date"
                    type="date"
                    required
                    value={form.test_date}
                    onChange={(e) => setForm({ ...form, test_date: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 6 }}>
                <span style={labelStyle}>Strand diagnostic levels</span>
                <p style={{ margin: '0 0 10px', fontSize: 12.5, color: DASH.muted }}>
                  Leave every strand on &ldquo;None&rdquo; for a student who met the standard.
                  A passing report carries no strand detail.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {STRAND_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label style={labelStyle} htmlFor={`os-${f.key}`}>
                      {f.code}
                    </label>
                    <select
                      id={`os-${f.key}`}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value as OfficialLevel | '' })
                      }
                      style={fieldStyle}
                    >
                      <option value="">None</option>
                      {OFFICIAL_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {showWarning && (
                // Warns and allows. The fill carries the colour, the words take
                // ink, and there is no disabled state anywhere below this.
                <div
                  role="status"
                  style={{
                    background: DASH.noticeWarnBg,
                    borderLeft: '3px solid #A8631F',
                    borderRadius: 2,
                    padding: '11px 13px',
                    marginBottom: 16,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: DASH.ink, lineHeight: 1.5 }}>
                    {PASSING_WARNING_HINT}
                  </p>
                </div>
              )}

              <label
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  marginBottom: 16,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={form.affirmed}
                  onChange={(e) => setForm({ ...form, affirmed: e.target.checked })}
                  style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13.5, color: DASH.ink, lineHeight: 1.5 }}>
                  I am entering this from the student&rsquo;s official score report.
                </span>
              </label>

              {formError && (
                <p style={{ margin: '0 0 14px', fontSize: 13.5, color: DASH.noticeWarn }}>
                  {formError}
                </p>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="submit" disabled={saving} style={buttonStyle('primary')}>
                  {saving ? 'Saving…' : editingId ? 'Save correction' : 'Save official score'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  style={buttonStyle('quiet')}
                  onClick={() => {
                    setOpen(false);
                    setEditingId(null);
                    setFormError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function HistoryRow({
  row,
  isMobile,
  busy,
  onCorrect,
  onRemove,
}: {
  row: ScoreRow;
  isMobile: boolean;
  busy: boolean;
  onCorrect: () => void;
  onRemove: () => void;
}) {
  const passed = row.official_crc_score >= 950;
  const strandLevels = STRAND_FIELDS.map((f) => ({
    code: f.code,
    level: row[f.key as LevelKey],
  }));
  const anyLevel = strandLevels.some((s) => s.level !== null);

  return (
    <div
      style={{
        background: DASH.subtleBg,
        border: `1px solid ${DASH.hairline}`,
        borderRadius: 2,
        padding: '14px 15px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: DASH.heading,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {row.official_crc_score}
          </span>
          <span style={{ fontSize: 12, color: DASH.dim }}>official / 990</span>
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: passed ? DASH.noticeOkBg : DASH.noticeWarnBg,
            color: DASH.ink,
          }}
        >
          {passed ? 'Met the standard' : 'Did not meet'}
        </span>
      </div>

      <div style={{ marginTop: 8, fontSize: 12.5, color: DASH.muted }}>
        Tested {formatDay(row.test_date)}
        {row.corrected_at ? ' · corrected' : ''}
      </div>

      {/* THE DELTA. On the student detail page and in the export, never in the
          roster cell. Named for the interval it actually uses: the student's
          most recent completed practice run before the test date, which is NOT
          their diagnostic. */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: `1px solid ${DASH.hairline}`,
          fontSize: 13,
          color: DASH.muted,
        }}
      >
        {row.delta === null ? (
          <span>No completed practice run before this date, so there is nothing to compare.</span>
        ) : (
          <span>
            <strong
              style={{
                color: DASH.heading,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
              }}
            >
              {row.delta > 0 ? `+${row.delta}` : row.delta}
            </strong>{' '}
            {DELTA_LABEL} ({row.practice_estimate}
            {row.practice_taken_at ? `, ${formatDay(row.practice_taken_at)}` : ''})
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          display: 'flex',
          gap: isMobile ? 10 : 16,
          flexWrap: 'wrap',
          fontSize: 12.5,
          color: DASH.muted,
        }}
      >
        {anyLevel ? (
          strandLevels.map((s) => (
            <span key={s.code}>
              {s.code} ·{' '}
              <span style={{ color: DASH.ink, fontWeight: 600 }}>{s.level ?? 'None'}</span>
            </span>
          ))
        ) : (
          <span>
            No strand detail, which is what a report shows for a student who met the standard.
          </span>
        )}
      </div>

      {row.correctable && (
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" disabled={busy} style={buttonStyle('quiet')} onClick={onCorrect}>
            Correct
          </button>
          <button type="button" disabled={busy} style={buttonStyle('quiet')} onClick={onRemove}>
            Remove
          </button>
          <span style={{ fontSize: 12, color: DASH.dim, alignSelf: 'center' }}>
            Editable for 24 hours after entry
          </span>
        </div>
      )}
    </div>
  );
}
