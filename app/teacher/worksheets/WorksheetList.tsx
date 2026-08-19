'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DASH, cardStyle } from '@/app/components/dashboard-theme';
import type { WorksheetSummary } from './page';

// The saved list. A client component only because deleting needs local state --
// the rows themselves are rendered from server-supplied data.
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
      <div style={{ ...cardStyle(DASH), padding: '44px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: DASH.heading, fontWeight: 600, margin: '0 0 6px' }}>
          No worksheets yet
        </p>
        <p style={{ fontSize: 14, color: DASH.muted, margin: '0 0 18px' }}>
          Pick a few topics and we will build a printable sheet with a full answer key.
        </p>
        <Link
          href="/teacher/worksheets/new"
          style={{
            display: 'inline-block',
            background: DASH.heading,
            color: '#FFF',
            padding: '10px 18px',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Build your first worksheet
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p style={{ color: '#A8321E', fontSize: 13, margin: '0 0 12px' }} role="alert">
          {error}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {worksheets.map((w) => (
          <div
            key={w.id}
            style={{
              ...cardStyle(DASH),
              padding: '15px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <Link
                href={`/teacher/worksheets/${w.id}`}
                style={{
                  fontSize: 15.5,
                  fontWeight: 600,
                  color: DASH.heading,
                  textDecoration: 'none',
                }}
              >
                {w.title}
              </Link>
              <p style={{ fontSize: 12.5, color: DASH.dim, margin: '3px 0 0' }}>
                {w.item_count} question{w.item_count === 1 ? '' : 's'}
                {w.topics.length > 0 && ` · ${w.topics.slice(0, 3).join(', ')}`}
                {w.topics.length > 3 && ` +${w.topics.length - 3}`}
                {' · '}
                {new Date(w.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link href={`/teacher/worksheets/${w.id}/print`} style={linkBtn}>
                Print
              </Link>
              <Link href={`/teacher/worksheets/${w.id}/key`} style={linkBtn}>
                Key
              </Link>
              {confirming === w.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => remove(w.id)}
                    disabled={busy === w.id}
                    style={{ ...linkBtn, color: '#A8321E', borderColor: '#E4C4BD', cursor: 'pointer' }}
                  >
                    {busy === w.id ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    style={{ ...linkBtn, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(w.id)}
                  aria-label={`Delete ${w.title}`}
                  style={{ ...linkBtn, color: DASH.muted, cursor: 'pointer' }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const linkBtn: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  padding: '7px 12px',
  borderRadius: 7,
  border: `1px solid ${DASH.line}`,
  background: '#FFF',
  color: DASH.ink,
  textDecoration: 'none',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
};
