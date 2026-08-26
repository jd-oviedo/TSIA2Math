'use client';

import { useEffect, useState } from 'react';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
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
          color: V.muted,
          padding: '4px 0',
        }}
      >
        Item flags (teacher tool)
      </summary>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* V.noticeWarn, not C.amber. C.amber is the LIGHT-ONLY curriculum
            palette and measured 3.74 on this card in light, 4.34 in dark. */}
        {error && <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: V.noticeWarn }}>{error}</p>}
        {!error && flags === null && (
          <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: V.dim }}>Loading…</p>
        )}
        {flags?.length === 0 && (
          <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: V.dim }}>No flags yet.</p>
        )}
        {flags?.map((flag) => {
          const resolved = flag.status === 'resolved';
          return (
            <div
              key={flag.id}
              style={{
                background: V.subtleBg,
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
                {/* V.link, not C.gemini. Same reason the notice copy above is
                    V.noticeWarn: C.* is the LIGHT-ONLY curriculum palette and
                    this surface flips. Gemini measured 2.77 on V.subtleBg in
                    light and 5.25 in dark -- failing one theme, passing the
                    other, from one hardcoded hex. The pair is 6.33 / 5.25, and
                    the dark value IS Gemini, unchanged.

                    The token is named for a link and this is an item id, which
                    is a stretch it is worth naming: the two share a ground, a
                    tier and now a value, and a second token holding the same
                    pair would have to justify itself before it diverges. If
                    this id ever needs its own colour, that is the moment to
                    split it out, not now. */}
                <span style={{ font: '700 13px ui-monospace, Menlo, monospace', color: V.link }}>
                  {flag.item_id}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      font: `700 11px ${FONT_BODY}`,
                      // The fill stays coloured and the label takes ink: the
                      // settled orange rule, applied rather than argued with.
                      // The tint is darker than the card so it binds, and no
                      // amber clears it -- #A8631F reaches only 4.18, and
                      // lightening the tint far enough drives it to 1.02 against
                      // its own container. Ink on the tint is 15.47, and the
                      // chip still says which state it is in, in words.
                      background: resolved ? V.noticeOkBg : V.noticeWarnBg,
                      color: V.ink,
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
                      border: `1px solid ${V.line}`,
                      font: `600 11px ${FONT_BODY}`,
                      color: V.muted,
                      cursor: 'pointer',
                    }}
                  >
                    {togglingId === flag.id ? '…' : resolved ? 'Reopen' : 'Resolve'}
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, font: `600 13px ${FONT_BODY}`, color: V.heading }}>
                {CATEGORY_LABELS[flag.category] ?? flag.category}
              </p>
              {flag.comment && (
                <p
                  style={{
                    margin: 0,
                    font: `400 13px ${FONT_BODY}`,
                    fontStyle: 'italic',
                    color: V.muted,
                  }}
                >
                  {flag.comment}
                </p>
              )}
              <p style={{ margin: 0, font: `400 11px ${FONT_BODY}`, color: V.dim }}>
                {flag.user_email ?? 'anonymous'} · {formatDate(flag.created_at)}
              </p>
            </div>
          );
        })}
      </div>
    </details>
  );
}
