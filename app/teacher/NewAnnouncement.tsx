'use client';

import { useState } from 'react';
import { FONT_HEADING } from '../components/fonts';
import type { ClassRow } from './TeacherDashboardClient';

// Minimal write path for /dashboard/announcements. Without it the student page
// has no source of real data short of hand-written SQL.
//
// Styled to the teacher dashboard's existing system (Deep Navy, Amber Gold,
// white cards), not the curriculum palette the student dashboard uses. This is
// a teacher surface and it should look like the rest of one.

export default function NewAnnouncement({
  classes,
  selectedClassId,
}: {
  classes: ClassRow[];
  selectedClassId: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [classId, setClassId] = useState(selectedClassId);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState<string | null>(null);

  const ready = title.trim().length > 0 && body.trim().length > 0;

  async function submit() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);
    setPosted(null);

    try {
      const res = await fetch('/api/teacher/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          class_id: classId || null,
          published,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not post that.');
        return;
      }

      setPosted(
        published
          ? 'Posted. Students in that class will see it on their dashboard.'
          : 'Saved as a draft. Students cannot see it until you publish.'
      );
      setTitle('');
      setBody('');
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  const input = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid rgba(15,30,53,0.14)',
    fontFamily: 'inherit',
    fontSize: 13.5,
    color: '#1A1A1A',
    background: '#fff',
  } as const;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(15,30,53,0.07)',
        borderRadius: 12,
        padding: '18px 18px 16px',
        boxShadow: '0 1px 2px rgba(15,30,53,0.04)',
        marginBottom: 22,
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
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: FONT_HEADING,
              fontWeight: 600,
              fontSize: 16,
              color: '#0F1E35',
            }}
          >
            Announcements
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5F5E5A' }}>
            Post a notice to your students&apos; dashboards.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            background: open ? 'transparent' : '#C68A2F',
            border: open ? '1px solid rgba(15,30,53,0.14)' : 'none',
            borderRadius: 9,
            padding: '9px 16px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: 600,
            color: open ? '#5F5E5A' : '#fff',
          }}
        >
          {open ? 'Cancel' : '+ New announcement'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div>
            <label
              htmlFor="ann-title"
              style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5F5E5A', marginBottom: 5 }}
            >
              Title
            </label>
            <input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              maxLength={200}
              placeholder="Quiz on Friday"
              style={input}
            />
          </div>

          <div>
            <label
              htmlFor="ann-body"
              style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5F5E5A', marginBottom: 5 }}
            >
              Message
            </label>
            <textarea
              id="ann-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 5000))}
              maxLength={5000}
              rows={4}
              placeholder="We'll cover unit rates. Bring your notes."
              style={{ ...input, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <label
                htmlFor="ann-class"
                style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#5F5E5A', marginBottom: 5 }}
              >
                Class
              </label>
              <select
                id="ann-class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                style={input}
              >
                <option value="">Everyone (no class)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 13,
                color: '#1A1A1A',
                paddingBottom: 9,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publish now
            </label>

            <button
              type="button"
              onClick={submit}
              disabled={!ready || saving}
              style={{
                background: ready ? '#C68A2F' : 'rgba(15,30,53,0.10)',
                border: 'none',
                borderRadius: 9,
                padding: '10px 20px',
                marginBottom: 1,
                cursor: ready && !saving ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 600,
                color: ready ? '#fff' : '#8A8983',
              }}
            >
              {saving ? 'Posting…' : 'Post'}
            </button>
          </div>

          <div role="status" aria-live="polite">
            {error && <p style={{ margin: 0, fontSize: 13, color: '#C2402F' }}>{error}</p>}
            {posted && <p style={{ margin: 0, fontSize: 13, color: '#2E7D53' }}>{posted}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
