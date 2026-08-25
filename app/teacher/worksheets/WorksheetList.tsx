'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  WS,
  microLabel,
  panelStyle,
  ctaStyle,
  darkBtnStyle,
  quietBtnStyle,
  strandChip,
} from './worksheet-theme';
import type { WorksheetSummary } from './page';

// The saved list. A client component only because deleting needs local state --
// the rows themselves are rendered from server-supplied data.

/**
 * The strands on a worksheet, in first-seen order.
 *
 * Derived from the stored topic ids rather than fetched: every id opens with
 * its two-letter strand, which is the same fallback strandTint() uses on the
 * printed sheet. Nothing new is read to draw these chips.
 */
function strandsOf(topics: string[]): string[] {
  const seen: string[] = [];
  for (const t of topics) {
    const s = t.split('.')[0].toUpperCase();
    if (s && !seen.includes(s)) seen.push(s);
  }
  return seen;
}

export default function WorksheetList({ worksheets }: { worksheets: WorksheetSummary[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/worksheets/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Could not delete that worksheet.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  if (worksheets.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 40px' }}>
        <div
          style={{
            ...panelStyle,
            width: '100%',
            maxWidth: 640,
            padding: '46px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            textAlign: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: WS.ink }}>
            Build a worksheet in about a minute
          </h2>
          {/* The board's copy promises a version B with different numbers. That
              does not exist, so it is not said here. What is said is what the
              key actually prints: an answer grid and one rationale per
              question. */}
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: WS.muted, maxWidth: 440 }}>
            Pick your TSIA2 topics and how many questions you want. Every worksheet
            prints with an answer key and a rationale for each question.
          </p>
          <Link
            href="/teacher/worksheets/new"
            className="ws-cta ws-tap"
            style={{
              ...ctaStyle,
              padding: '13px 24px',
              fontSize: 14.5,
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: 4,
            }}
          >
            + New worksheet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p style={{ color: WS.missed, fontSize: 13, margin: '0 0 12px' }} role="alert">
          {error}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {worksheets.map((w) => {
          const strands = strandsOf(w.topics);
          return (
            <div key={w.id} className="ws-row" style={{ ...panelStyle, padding: '18px 20px' }}>
              <div className="ws-row-main">
                <Link
                  href={`/teacher/worksheets/${w.id}`}
                  style={{
                    fontFamily: WS.font.heading,
                    fontSize: 17,
                    fontWeight: 600,
                    color: WS.ink,
                    textDecoration: 'none',
                  }}
                >
                  {w.title}
                </Link>
                {strands.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    {strands.map((s) => (
                      <span key={s} style={strandChip(s)}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ws-row-stat">
                <span style={{ fontFamily: WS.font.heading, fontSize: 15, color: WS.ink }}>
                  {w.item_count} question{w.item_count === 1 ? '' : 's'}
                </span>
                <span style={{ ...microLabel, letterSpacing: '0.04em' }}>
                  {w.topics.length} topic{w.topics.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="ws-row-date">
                <span style={{ fontSize: 12.5, color: WS.muted }}>
                  {new Date(w.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="ws-row-actions">
                <Link
                  href={`/teacher/worksheets/${w.id}/print`}
                  className="ws-tap"
                  style={{ ...darkBtnStyle, ...actionPad, textDecoration: 'none' }}
                >
                  Print
                </Link>
                <Link
                  href={`/teacher/worksheets/${w.id}/key`}
                  className="ws-tap"
                  style={{ ...quietBtnStyle, ...actionPad, fontWeight: 500, textDecoration: 'none' }}
                >
                  Answer key
                </Link>
                {confirming === w.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => remove(w.id)}
                      disabled={busy === w.id}
                      className="ws-tap"
                      style={{
                        ...quietBtnStyle,
                        ...actionPad,
                        color: WS.missed,
                        borderColor: WS.missed,
                      }}
                    >
                      {busy === w.id ? 'Deleting' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="ws-tap"
                      style={{ ...quietBtnStyle, ...actionPad, fontWeight: 500 }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(w.id)}
                    aria-label={`Delete ${w.title}`}
                    className="ws-tap"
                    style={{ ...quietBtnStyle, ...actionPad, fontWeight: 500, color: WS.muted }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const actionPad: React.CSSProperties = {
  fontSize: 12.5,
  padding: '9px 14px',
  whiteSpace: 'nowrap',
};
