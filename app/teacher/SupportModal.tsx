'use client';

import { useRef, useState } from 'react';
import { FONT_HEADING } from '../components/fonts';

// Support request modal, opened from Help in the sidebar account menu.
//
// Posts multipart form data to /api/support, which is where the Resend send
// and the screenshot upload happen. Nothing here talks to Supabase or Resend
// directly: the service-role key and the API key are both server-only.

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function SupportModal({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (f && f.size > MAX_IMAGE_BYTES) {
      setStatus('error');
      setMessage('That image is over 5MB. Pick a smaller one.');
      return;
    }
    setFile(f);
    setStatus('idle');
    setMessage('');
  }

  async function handleSubmit() {
    if (!subject.trim() || !body.trim()) return;
    setStatus('loading');
    try {
      const form = new FormData();
      form.append('subject', subject.trim());
      form.append('body', body.trim());
      if (file) form.append('image', file);

      const res = await fetch('/api/support', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
        return;
      }
      setStatus('success');
      setMessage(
        data.image_uploaded === false
          ? 'Sent, but the screenshot could not be attached.'
          : 'Sent. Support will reply to your email.'
      );
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  }

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && status !== 'loading';

  return (
    // Cancelling by backdrop click or Cancel discards the draft; nothing is
    // persisted until Send.
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(15,30,53,0.42)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact support"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18, padding: 28,
          width: '100%', maxWidth: 460,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 70px rgba(15,30,53,0.28)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 18, color: '#0F1E35' }}>
            Contact support
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8983', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" /></svg>
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '18px 0 4px' }}>
            <div style={{ fontSize: 32, marginBottom: 10, color: '#4F9A2E' }}>✓</div>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#356B1B', fontWeight: 600 }}>{message}</p>
            <button onClick={onClose} style={{ padding: '10px 24px', border: 'none', borderRadius: 9, background: '#C68A2F', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#5F5E5A', lineHeight: 1.5 }}>
              Tell us what went wrong. Your email is set as the reply-to, so support can answer you directly.
            </p>

            <label style={labelStyle} htmlFor="support-subject">Subject</label>
            <input
              id="support-subject"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setStatus('idle'); setMessage(''); }}
              placeholder="Roster is not loading"
              autoFocus
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: 14 }} htmlFor="support-body">Message</label>
            <textarea
              id="support-body"
              value={body}
              onChange={(e) => { setBody(e.target.value); setStatus('idle'); setMessage(''); }}
              placeholder="What happened, and what were you doing at the time?"
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
            />

            <label style={{ ...labelStyle, marginTop: 14 }}>Screenshot (optional)</label>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', border: '1px solid #D3D1C7', borderRadius: 9, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#0F1E35', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3.5" width="13" height="11" rx="1.8" /><circle cx="6.6" cy="7.4" r="1.1" /><path d="M3 12.4l3.6-3.1 3 2.5 2.3-1.8 3.1 2.6" /></svg>
                Choose image
              </button>
              <span style={{ fontSize: 12.5, color: '#8A8983', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file ? file.name : 'No file chosen'}
              </span>
              {file && (
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8983', fontSize: 12.5, fontFamily: 'inherit', textDecoration: 'underline', flexShrink: 0, padding: 0 }}
                >
                  Remove
                </button>
              )}
            </div>

            {status === 'error' && <p style={{ margin: '12px 0 0', fontSize: 12.5, color: '#C2402F' }}>{message}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #D3D1C7', borderRadius: 9, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#5F5E5A' }}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 9, background: canSend ? '#C68A2F' : '#D4A55A', cursor: canSend ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff' }}
              >
                {status === 'loading' ? 'Sending…' : 'Send to support'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: '#8A8983',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #D3D1C7',
  borderRadius: 9,
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1A1A1A',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};
