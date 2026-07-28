'use client';

import { useEffect, useState } from 'react';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import { formatDate } from './ui';

// Item flag review, carried over from the old dashboard rather than dropped.
//
// It is a teacher tool that happened to live on the student dashboard, behind a
// tab that only appeared for teachers. The rebuild keeps it reachable at the
// same URL and keeps it out of the way -- collapsed, at the foot of Home, and
// only rendered for a teacher. It probably belongs on /teacher; moving it is a
// separate change from rebuilding this tree.

type FlagRow = {
  id: string;
  created_at: string;
  item_id: string;
  user_email: string | null;
  category: string;
  comment: string | null;
  status: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  symbols_or_math_look_wrong: 'Symbols or math look wrong',
  answer_seems_incorrect: 'Answer seems incorrect',
  explanation_unclear_or_wrong: 'Explanation is unclear or has an error',
  question_has_typo_or_is_confusing: 'Question has a typo or is confusing',
  other: 'Other',
};

export default function FlagsPanel() {
  const [flags, setFlags] = useState<FlagRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || flags !== null) return;
    fetch('/api/flags')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to load flags.');
        } else {
          setFlags(data.flags ?? []);
        }
      })
      .catch(() => setError('Failed to load flags.'));
  }, [open, flags]);

  async function toggleStatus(flag: FlagRow) {
    const next = flag.status === 'open' ? 'resolved' : 'open';
    setTogglingId(flag.id);
    try {
      const res = await fetch('/api/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flag.id, status: next }),
      });
      if (!res.ok) throw new Error();
      setFlags((prev) => prev?.map((f) => (f.id === flag.id ? { ...f, status: next } : f)) ?? prev);
    } catch {
      // Silent: the flag stays as it was.
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <details onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary
        style={{
          cursor: 'pointer',
          font: `500 13.5px ${FONT_BODY}`,
          color: ink(0.55),
          padding: '4px 0',
        }}
      >
        Item flags (teacher tool)
      </summary>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: C.amber }}>{error}</p>}
        {!error && flags === null && (
          <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: ink(0.5) }}>Loading…</p>
        )}
        {flags?.length === 0 && (
          <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: ink(0.5) }}>No flags yet.</p>
        )}
        {flags?.map((flag) => {
          const resolved = flag.status === 'resolved';
          return (
            <div
              key={flag.id}
              style={{
                background: C.sand,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                opacity: resolved ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ font: '700 13px ui-monospace, Menlo, monospace', color: C.gemini }}>
                  {flag.item_id}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      font: `700 11px ${FONT_BODY}`,
                      background: resolved ? C.greenBg : C.amberBg,
                      color: resolved ? C.green : C.amber,
                    }}
                  >
                    {resolved ? 'Resolved' : 'Open'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleStatus(flag)}
                    disabled={togglingId === flag.id}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'none',
                      border: `1px solid ${ink(0.15)}`,
                      font: `600 11px ${FONT_BODY}`,
                      color: ink(0.55),
                      cursor: 'pointer',
                    }}
                  >
                    {togglingId === flag.id ? '…' : resolved ? 'Reopen' : 'Resolve'}
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, font: `600 13px ${FONT_BODY}`, color: C.midnight }}>
                {CATEGORY_LABELS[flag.category] ?? flag.category}
              </p>
              {flag.comment && (
                <p
                  style={{
                    margin: 0,
                    font: `400 13px ${FONT_BODY}`,
                    fontStyle: 'italic',
                    color: ink(0.6),
                  }}
                >
                  {flag.comment}
                </p>
              )}
              <p style={{ margin: 0, font: `400 11px ${FONT_BODY}`, color: ink(0.4) }}>
                {flag.user_email ?? 'anonymous'} · {formatDate(flag.created_at)}
              </p>
            </div>
          );
        })}
      </div>
    </details>
  );
}
