'use client';

import { useState } from 'react';
import { C, INK_DISABLED } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import { V } from '@/app/components/dashboard-theme';
import { CardTitle, SPACING } from './ui';

// Carried over from the old single-page dashboard, restyled onto the curriculum
// palette. Same /api/enroll call and same six-character code rule.

// THE AUTO-SUBMIT IS GONE, along with the ?code= parameter that fed it. A
// student arriving with a code in hand is now handled before authentication:
// /login looks the code up, shows them whose class it is, and the OAuth callback
// performs the enrolment from an httpOnly cookie. The code never travels in a
// URL any more, so there is nothing here to pick up on mount.
//
// This panel keeps its own job unchanged: the post-auth join box on the
// dashboard, backed by /api/enroll, for a student who gets a code later.
export default function JoinClassPanel() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <>
      {/* The third inline copy of CardTitle, and the one that had drifted
          furthest -- the same 16px/600 as the other two at a margin of 3. */}
      <CardTitle>Join a class</CardTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.BLOCK }}>
        <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, lineHeight: 1.6, color: V.muted }}>
          Enter the 6-character code your teacher shared with you.
        </p>

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
              color: ready ? C.midnight : INK_DISABLED,
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Joining…' : 'Join'}
          </button>
        </div>

        <div role="status" aria-live="polite">
          {/* Theme-aware notice tokens, not the light-only curriculum palette.
              C.amber measured 3.74 light / 4.34 dark here and C.green 4.11 /
              3.95. Both sit inside the role="status" region above, which is what
              carries the distinction now that the two colours are close in
              luminance. */}
          {error && (
            <p style={{ margin: 0, font: `400 13.5px ${FONT_BODY}`, color: V.noticeWarn }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ margin: 0, font: `500 13.5px ${FONT_BODY}`, color: V.noticeOk }}>
              {success}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
