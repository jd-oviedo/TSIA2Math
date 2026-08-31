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
    borderRadius: 0,
    border: '1px solid #E8E4DA',
    fontFamily: 'inherit',
    fontSize: 13.5,
    color: '#1A1A1A',
    background: '#fff',
  } as const;

  return (
    <div
      data-tour="announcements"
      style={{
        // Flat, radius 0, one warm hairline, no shadow. The four values are
        // restated here rather than spread from flatPanelStyle() for the same
        // reason the rest of this file states its hexes literally (see the note
        // at the top): this component is a wall of literals by choice. What
        // matters is that the numbers agree with DASH_FLAT, and they do.
        background: '#FFFFFF',
        border: '1px solid #E8E4DA',
        borderRadius: 0,
        boxShadow: 'none',
        // NO height, AND THAT IS THE WHOLE BUG THIS LINE USED TO BE.
        //
        // PR #238 put a height:100% here so this card would stretch to its
        // neighbour in the two-up row. The change that deleted that row
        // reverted only half of it: the height stayed and the marginBottom
        // never came back. The prop was INERT inside the grid, which is why it
        // read as harmless; standing alone it is not. <main> is a flex column with
        // flex:1 inside the shell's min-height:100vh row, so the percentage
        // resolves and the card fills every pixel left in the column.
        //
        // Measured in a browser on the real ancestor chain: 235px with the
        // prop, 59px without. The 176px difference was the empty white box.
        //
        // The card sizes to its content -- a title, a blurb and one button when
        // closed, plus the form when open -- and nothing here should ever give
        // it a height again, fixed or otherwise.

        // The rhythm of the two full-width flat panels it now sits between.
        // Identical to StrandPanel and CurriculumRollupPanel, which is what
        // makes three stacked panels read as one column rather than three
        // boxes: SummaryCards closes at 16, then these three at 26 each.
        padding: '18px 22px 20px',
        marginBottom: 26,
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
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A5A52' }}>
            Post a notice to your students&apos; dashboards.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          // Sunset Orange fill with #111111 on it at 9.00 when closed; the
          // navy secondary outline once it is open, because Cancel is not the
          // action anybody came here for. The label shortens to "+ New": the
          // heading two lines up already says Announcements, and at half width
          // "+ New announcement" wrapped.
          className={open ? 'um-tdash-ghost' : 'um-tdash-cta'}
          style={{
            border: open ? '1px solid #0F1E35' : 'none',
            borderRadius: 0,
            padding: '9px 16px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13.5,
            fontWeight: open ? 600 : 700,
            color: open ? undefined : '#111111',
          }}
        >
          {open ? 'Cancel' : '+ New'}
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
              // The class supplies the fill through --umt-cta-bg. The disabled
              // branch sets background inline, which beats the rule, so a dead
              // button keeps its grey however it is hovered.
              className="um-tdash-cta"
              style={{
                background: ready ? undefined : 'rgba(15,30,53,0.10)',
                border: 'none',
                borderRadius: 0,
                padding: '10px 20px',
                marginBottom: 1,
                cursor: ready && !saving ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 700,
                // Disabled ink stays failing on purpose: WCAG 1.4.3 exempts
                // inactive controls, and a disabled button at readable ink
                // reads as enabled.
                color: ready ? '#111111' : '#8A8983',
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
