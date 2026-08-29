'use client';

import { useState } from 'react';
import { FONT_HEADING, FONT_BODY } from '../../components/fonts';
import { C } from '../../components/curriculum-theme';
import { L, LOGIN_CSS, FONT_MONO } from '../../login/login-theme';
import { StartChrome } from '../StartChrome';
import { StepIndicator } from '../StepIndicator';
import {
  GOOGLE_OAUTH_CLIENT_ID,
  HAS_OAUTH_CLIENT_ID,
  BOOKING_URL,
  SUPPORT_EMAIL,
} from '../../lib/onboarding-config';
import {
  ADMIN_MESSAGE_INTRO,
  ADMIN_MESSAGE_LEAD,
  ADMIN_MESSAGE_STEPS,
  ADMIN_MESSAGE_DETAILS_LABEL,
  ADMIN_MESSAGE_DETAILS,
  ADMIN_MESSAGE_TEXT,
  ADMIN_MAIL_SUBJECT,
} from './admin-message';

// Step 2 of teacher onboarding: the district access branch, linked from /start.
//
// Replaces the placeholder that shipped with the /start redesign. Two states on
// one route, because they are one question and its answer rather than two
// destinations, and a teacher who picks the wrong one should be able to go back
// without a navigation.
//
//   A  "is your district new to UnpackMath?"   the triage
//   B  "send this to your district's admin"    the actual helper
//
// ─── WHAT THIS PAGE DELIBERATELY DOES NOT DO ────────────────────────────────
//
// It does not tell the teacher we have "flagged your district internally", and
// that line was cut rather than reworded. There is no such backend: no table, no
// queue, no alert, nothing that would make the sentence true. Printing it would
// be a promise the product cannot keep, and the teacher would reasonably stop
// chasing their admin on the strength of it. Everything on this page is
// something the teacher can act on themselves right now.
//
// It also does not promise that a failed sign in routes here automatically.
// Nothing does that yet; a blocked sign in lands on /login with an error
// parameter the role selector never reads. That is its own task against
// app/auth/callback/route.ts, which this branch does not touch.
//
// ─── NO GATE, ON PURPOSE ─────────────────────────────────────────────────────
//
// A teacher who cannot get through Google sign in is by definition signed out,
// so anything requiring a session would be a page they could never reach.

// The message and its plain-text form both live in ./admin-message, so the block
// rendered on screen and the text the Copy and Email controls send are composed
// from the same constants and cannot drift.

/** The booking control's target. A real scheduling link when one is configured,
 *  otherwise mail to the support alias asking for the same thing, so the button
 *  is never a dead control. See app/lib/onboarding-config.ts. */
const BOOKING_HREF = BOOKING_URL
  ? BOOKING_URL
  : `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Help with district access for UnpackMath')}`;

const ADMIN_MAILTO =
  `mailto:?subject=${encodeURIComponent(ADMIN_MAIL_SUBJECT)}` +
  `&body=${encodeURIComponent(ADMIN_MESSAGE_TEXT)}`;

/** A small tracked section label, matching the mono labels on /login's bar. */
const SECTION_LABEL: React.CSSProperties = {
  font: `400 11px/1 ${FONT_MONO}`,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: L.inkMono,
};

/** Copy to clipboard with a two second acknowledgement. Returns false on the
 *  browsers and contexts where the API is missing or refused, so the caller can
 *  leave the text on screen to be selected by hand rather than claiming a copy
 *  that did not happen. */
function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Clipboard blocked, which happens over plain http and in some embedded
        // browsers. The text is visible and selectable either way, so this
        // degrades to "select it yourself" rather than to a broken button.
      });
  };
  return [copied, copy];
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: L.card,
        // The float: a flat fill and a hard 1px rule with the grid behind it.
        // No shadow, no radius, exactly as on /login and /start.
        border: `1px solid ${L.border}`,
        borderRadius: 0,
        padding: '28px 24px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {children}
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        margin: 0,
        font: `600 clamp(24px, 5.6vw, 29px)/1.2 ${FONT_HEADING}`,
        letterSpacing: '-0.02em',
        color: L.ink,
        textWrap: 'pretty',
      }}
    >
      {children}
    </h1>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, font: `400 15px/1.65 ${FONT_BODY}`, color: L.ink2 }}>{children}</p>
  );
}

function QuietLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="um-start-quiet"
      style={{
        font: `400 13px/1.5 ${FONT_BODY}`,
        color: L.ink2,
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}

// ─── State A: the triage ─────────────────────────────────────────────────────

/** One of the two answers. A flat card that is entirely clickable, which is why
 *  it is a button or an anchor rather than a div with an onClick. */
function ChoiceCard({
  title,
  detail,
  onClick,
  href,
}: {
  title: string;
  detail: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span style={{ font: `700 15px/1.35 ${FONT_BODY}`, color: L.ink }}>{title}</span>
      <span style={{ font: `400 13.5px/1.5 ${FONT_BODY}`, color: L.ink2 }}>{detail}</span>
    </>
  );
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    width: '100%',
    textAlign: 'left',
    padding: '16px 17px',
    background: 'transparent',
    border: `1px solid ${L.border}`,
    borderRadius: 0,
    cursor: 'pointer',
    textDecoration: 'none',
    boxSizing: 'border-box',
  };

  if (href) {
    return (
      <a href={href} className="um-choice" style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className="um-choice" style={style}>
      {inner}
    </button>
  );
}

function StateA({ onFirstTeacher }: { onFirstTeacher: () => void }) {
  return (
    <CardShell>
      <H1>Is your district new to UnpackMath?</H1>
      {/* POINTS AT STUDENTS, NOT AT THE TEACHER READING IT. Google Workspace
          blocks third-party apps for STUDENT accounts by default in most
          districts, while staff accounts usually sit in a group that already
          allows them. So the teacher signs in fine, assumes it works, and their
          class cannot get in. Saying "you can't sign in" here described a
          symptom most teachers will never see. */}
      <Sub>
        {`If your students can't sign in, your district's Google admin may need to trust the app for student accounts.`}
      </Sub>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ChoiceCard
          title={`I'm the first teacher here`}
          detail="Get the message to send your admin"
          onClick={onFirstTeacher}
        />
        <ChoiceCard
          title="Someone else already uses it"
          detail={`You're good, your students can sign in`}
          href="/start"
        />
      </div>

      <QuietLink href="/start">Back to sign in</QuietLink>
    </CardShell>
  );
}

// ─── State B: the helper ─────────────────────────────────────────────────────

function StateB({ onBack }: { onBack: () => void }) {
  const [copiedMessage, copyMessage] = useCopy();
  const [copiedId, copyId] = useCopy();

  const actionStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    border: `1px solid ${L.creamLine}`,
    borderRadius: 0,
    font: `700 14px/1 ${FONT_BODY}`,
    textDecoration: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  return (
    <CardShell>
      <H1>{`Send this to your district's Google admin`}</H1>
      {/* Students, matching the framing on state A and in the message itself. */}
      <Sub>One approval unlocks UnpackMath for every student in your district.</Sub>

      {/* ─── The message ────────────────────────────────────────────────────
          Selectable text in a bordered block rather than a textarea, so it reads
          as something to send rather than a field to fill in, and stays
          selectable by hand when the clipboard API is unavailable.

          Laid out from the same constants that compose ADMIN_MESSAGE_TEXT: the
          steps as a real ordered list and the details as labelled rows, rather
          than one wall of text with newlines in it. What a teacher copies is the
          plain-text form of exactly this. */}
      <div
        style={{
          border: `1px solid ${L.border}`,
          borderRadius: 0,
          padding: '16px 17px',
          background: L.ground,
          font: `400 14px/1.65 ${FONT_BODY}`,
          color: L.ink,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <p style={{ margin: 0 }}>{ADMIN_MESSAGE_INTRO}</p>
        <p style={{ margin: 0 }}>{ADMIN_MESSAGE_LEAD}</p>

        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ADMIN_MESSAGE_STEPS.map((step) => (
            <li key={step} style={{ paddingLeft: 2 }}>
              {step}
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ fontWeight: 700 }}>{ADMIN_MESSAGE_DETAILS_LABEL}</span>
          {ADMIN_MESSAGE_DETAILS.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ color: L.ink2, flexShrink: 0 }}>{`${label}:`}</span>
              {/* The client ID is the one value an admin retypes, so it is set
                  in mono and allowed to break rather than overflow the block. */}
              <span
                style={
                  label === 'OAuth client ID'
                    ? { font: `400 12.5px/1.5 ${FONT_MONO}`, wordBreak: 'break-all', minWidth: 0 }
                    : undefined
                }
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* THE STANDALONE "IN THE GOOGLE ADMIN CONSOLE" SECTION WAS REMOVED HERE.
          It read "Go to Security, then API controls, then App access control.
          Add UnpackMath as Trusted", which was written when the message above
          was two sentences and carried no instructions of its own.

          The message now contains all four console steps, in more detail and in
          the right order. Keeping the old section would have put two different
          sets of instructions for the same admin on one screen, and the shorter
          one was also the wrong one: it skipped "Manage third-party app access"
          and "Configure new app" entirely. */}

      {/* ─── OAuth client ID ────────────────────────────────────────────────
          Display only. When no ID is configured the field says so plainly and
          the copy control is disabled, rather than presenting an empty box that
          looks copyable. A placeholder here would be worse than nothing: an
          admin would paste it into App access control, it would match no app,
          and the approval would silently cover nothing. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={SECTION_LABEL}>OAuth client ID</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <code
            style={{
              flex: '1 1 240px',
              minWidth: 0,
              border: `1px solid ${HAS_OAUTH_CLIENT_ID ? L.border : L.barLine}`,
              borderRadius: 0,
              padding: '11px 12px',
              background: L.ground,
              font: `400 12.5px/1.5 ${FONT_MONO}`,
              color: HAS_OAUTH_CLIENT_ID ? L.ink : L.inkMono,
              wordBreak: 'break-all',
            }}
          >
            {HAS_OAUTH_CLIENT_ID ? GOOGLE_OAUTH_CLIENT_ID : 'Not published yet'}
          </code>
          <button
            type="button"
            disabled={!HAS_OAUTH_CLIENT_ID}
            onClick={() => copyId(GOOGLE_OAUTH_CLIENT_ID)}
            className="um-secondary"
            style={{
              ...actionStyle,
              flex: '0 0 auto',
              background: 'transparent',
              color: HAS_OAUTH_CLIENT_ID ? L.ink : L.disabledInk,
              borderColor: HAS_OAUTH_CLIENT_ID ? L.border : L.disabledLine,
              cursor: HAS_OAUTH_CLIENT_ID ? 'pointer' : 'default',
            }}
          >
            {copiedId ? 'Copied' : 'Copy'}
          </button>
        </div>
        <span style={{ font: `400 12.5px/1.5 ${FONT_BODY}`, color: L.ink2 }}>
          (client ID only, no secret needed)
        </span>
      </div>

      {/* ─── Actions ────────────────────────────────────────────────────────
          One primary and two secondaries. The primary is the orange fill the
          rest of the flow uses; the other two carry the same hard rule with no
          fill, so the hierarchy is a fill rather than a colour of type. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={() => copyMessage(ADMIN_MESSAGE_TEXT)}
          className="um-start-cta"
          style={{ ...actionStyle, width: '100%', background: L.cta, color: L.ctaInk }}
        >
          {copiedMessage ? 'Copied' : 'Copy message'}
        </button>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={ADMIN_MAILTO}
            className="um-secondary"
            style={{
              ...actionStyle,
              flex: '1 1 150px',
              background: 'transparent',
              color: L.ink,
              borderColor: L.border,
            }}
          >
            Email my admin
          </a>
          <a
            href={BOOKING_HREF}
            className="um-secondary"
            // A configured booking link is an external destination; the mailto
            // fallback is not, and must not open a tab.
            {...(BOOKING_URL ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={{
              ...actionStyle,
              flex: '1 1 150px',
              background: 'transparent',
              color: L.ink,
              borderColor: L.border,
            }}
          >
            {`We'll help, book 15 min`}
          </a>
        </div>
      </div>

      {/* Both escapes on one row. Stacked, two quiet links at the foot of a long
          card read as clutter and neither gets noticed. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onBack}
          className="um-start-quiet"
          style={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            font: `400 13px/1.5 ${FONT_BODY}`,
            color: L.ink2,
            cursor: 'pointer',
          }}
        >
          {`← That's not my situation`}
        </button>
        <QuietLink href="/start">Back to sign in</QuietLink>
      </div>
    </CardShell>
  );
}

// ─── Route ───────────────────────────────────────────────────────────────────

export default function DistrictAccessPage() {
  const [stage, setStage] = useState<'triage' | 'helper'>('triage');

  return (
    <>
      <style>{`
        ${LOGIN_CSS}
        .um-start, .um-start * { box-sizing: border-box; }
        .um-start h1, .um-start h2 { font-family: ${FONT_HEADING}; }
        .um-start { font-family: ${FONT_BODY}; }
        /* !important throughout, and it is load bearing: every control below
           sets these properties as INLINE style props, and an inline
           declaration outranks any stylesheet rule at any specificity without
           it. Same trap and same fix as app/dashboard/dashboard-css.ts:43.

           Backgrounds only. No transform and no box-shadow anywhere in this
           flow. */
        .um-start .um-choice:hover { background: ${L.tintAmber} !important; }
        .um-start .um-secondary:hover { background: ${L.tintAmber} !important; }
        .um-start .um-start-cta:not(:disabled):hover { background: ${C.sunsetHover} !important; }
        .um-start .um-start-quiet:hover { color: ${L.ink} !important; }
      `}</style>

      <StartChrome>
        <div
          style={{
            maxWidth: 440,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          <StepIndicator step={2} label="District access" />
          {stage === 'triage' ? (
            <StateA onFirstTeacher={() => setStage('helper')} />
          ) : (
            <StateB onBack={() => setStage('triage')} />
          )}
        </div>
      </StartChrome>
    </>
  );
}
