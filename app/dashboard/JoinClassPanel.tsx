'use client';

import { useEffect, useState } from 'react';
import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';

// Carried over from the old single-page dashboard, restyled onto the curriculum
// palette. Same /api/enroll call and same six-character code rule.

export default function JoinClassPanel({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(() => (initialCode ?? '').toUpperCase().slice(0, 6));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A code carried in from the /login role selector (student signs in with a
  // join code already in hand) should submit itself, not wait for a click.
  useEffect(() => {
    if (initialCode && initialCode.trim().length === 6) {
      handleJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Join codes are 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ join_code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Coerce defensively: the error state renders directly as a React
        // child, so a non-string payload would throw.
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong.');
      } else {
        setSuccess(`You've joined ${data.class_name}.`);
        setCode('');
      }
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const ready = code.trim().length === 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h2 style={{ margin: '0 0 3px', font: `600 16px ${FONT_HEADING}`, color: V.heading }}>
          Join a class
        </h2>
        <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, lineHeight: 1.6, color: V.muted }}>
          Enter the 6-character code your teacher shared with you.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="join-code" className="um-visually-hidden">
          Class join code
        </label>
        <input
          id="join-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().slice(0, 6));
            setError(null);
            setSuccess(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="e.g. XK7R2P"
          maxLength={6}
          style={{
            width: 148,
            padding: '10px 14px',
            borderRadius: 11,
            border: 'none',
            background: V.subtleBg,
            boxShadow: `inset 0 0 0 1.5px ${V.trackBg}`,
            font: '700 15px ui-monospace, Menlo, monospace',
            letterSpacing: '0.12em',
            color: V.heading,
            textTransform: 'uppercase',
          }}
        />
        <button
          type="button"
          className="um-btn-primary"
          onClick={handleJoin}
          disabled={loading || !ready}
          style={{
            padding: '11px 22px',
            borderRadius: 11,
            border: 'none',
            background: ready ? C.sunset : V.cardBorder,
            boxShadow: ready ? `0 2px 0 ${C.sunsetShadow}` : 'none',
            font: `600 14px ${FONT_BODY}`,
            color: ready ? C.midnight : ink(0.4),
            cursor: ready ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Joining…' : 'Join'}
        </button>
      </div>

      <div role="status" aria-live="polite">
        {error && (
          <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: C.amber }}>{error}</p>
        )}
        {success && (
          <p style={{ margin: 0, font: `500 13.5px ${FONT_BODY}`, color: C.green }}>{success}</p>
        )}
      </div>
    </div>
  );
}
