'use client';

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { AnswerKeySheet } from '../WorksheetSheet';
import { WS, ctaStyle } from '../worksheet-theme';
import { loadAnswerKey, type KeyPayload } from './actions';

// The two tabs, the preview under them, and the print button.
//
// WHAT THE TABS SWITCH IS THE SHEET, and the sheet is the real one: the same
// WorksheetSheet and AnswerKeySheet the standalone /print and /key routes
// rendered before they were deleted. Preview and paper are the same component
// receiving the same props from the same resolvers, so they cannot drift; there
// is nothing left to keep in sync and nothing left to caption.
//
// THE QUESTIONS SHEET ARRIVES AS A NODE, ALREADY RENDERED ON THE SERVER. It is
// not rebuilt here from data, which keeps WorksheetSheet and the whole
// PrintItem payload out of the client bundle, and keeps this file with no
// access to anything the server resolved for it.
//
// THE INACTIVE TAB UNMOUNTS. Not display:none, not visibility:hidden, not
// off-screen. Two .ws-sheet elements in the DOM would BOTH print, and the
// .ws-part + .ws-part rule would page-break between them, so a teacher printing
// the worksheet would get the answer key stapled to the back of it. A
// conditional render is the only version of this that is safe, and it is why
// the two branches below are an if/else and never a pair of styled divs.

type Tab = 'questions' | 'key';

export default function WorksheetTabs({
  worksheetId,
  title,
  questionsSheet,
  initialTab,
}: {
  worksheetId: string;
  /** The worksheet title, for the answer key's masthead. Already on this page
   *  and not answer-bearing, so it comes down as a prop rather than riding back
   *  from the action. */
  title: string;
  /** Server-rendered <WorksheetSheet>. */
  questionsSheet: ReactNode;
  initialTab: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [key, setKey] = useState<KeyPayload | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function selectTab(next: Tab) {
    setTab(next);
    // Fetched once per page load, then held. Re-selecting the tab does not go
    // back to the server: the worksheet is fixed once built, so the answers
    // cannot have changed underneath this page.
    if (next === 'key' && key === null && !pending) {
      setKeyError(null);
      startTransition(async () => {
        try {
          setKey(await loadAnswerKey(worksheetId));
        } catch {
          // The action redirects rather than throwing for an unentitled or
          // non-owning caller, so reaching here means the resolve itself
          // failed. Said plainly instead of leaving an empty pane.
          setKeyError('The answer key could not be loaded. Try again.');
        }
      });
    }
  }

  // The print action names what it will actually produce. window.print() prints
  // whatever is mounted, and exactly one sheet ever is, so the label and the
  // paper cannot disagree.
  const printLabel = tab === 'questions' ? 'Print worksheet' : 'Print answer key';
  const canPrint = tab === 'questions' || (key !== null && !pending);

  return (
    <div className="ws-config-main">
      <div
        className="ws-config-bar ws-chrome no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
          padding: '16px 26px',
          background: WS.band,
          borderBottom: `1px solid ${WS.hairline}`,
        }}
      >
        {/* Two tabs, one control group. role="tablist" rather than two links:
            these no longer navigate, and announcing them as links would promise
            a page change that does not happen. */}
        <div role="tablist" aria-label="Worksheet view" style={{ display: 'flex', border: `1px solid ${WS.hairline}`, background: WS.panel }}>
          <TabButton label="Questions" active={tab === 'questions'} onSelect={() => selectTab('questions')} />
          <TabButton label="Answer key" active={tab === 'key'} onSelect={() => selectTab('key')} first={false} busy={pending && tab === 'key'} />
        </div>

        <button
          type="button"
          className="ws-cta ws-tap"
          disabled={!canPrint}
          onClick={() => window.print()}
          style={{
            ...ctaStyle,
            padding: '10px 20px',
            fontSize: 13.5,
            opacity: canPrint ? 1 : 0.55,
            cursor: canPrint ? 'pointer' : 'not-allowed',
          }}
        >
          {printLabel}
        </button>
      </div>

      <div className="ws-preview-frame">
        {tab === 'questions' ? (
          questionsSheet
        ) : keyError ? (
          <p className="no-print" style={{ margin: 0, fontSize: 13.5, color: WS.error, lineHeight: 1.55 }}>
            {keyError}
          </p>
        ) : key === null ? (
          <p className="no-print" style={{ margin: 0, fontSize: 12.5, color: WS.muted }}>
            Loading the answer key...
          </p>
        ) : (
          <AnswerKeySheet
            title={title}
            items={key.items}
            created={key.created}
            rationales={key.rationales}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onSelect,
  first = true,
  busy = false,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  first?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className="ws-tap"
      style={{
        fontSize: 13,
        padding: '9px 18px',
        border: 'none',
        borderLeft: first ? 'none' : `1px solid ${WS.hairline}`,
        background: active ? WS.dark : 'transparent',
        color: active ? WS.darkInk : WS.ink,
        fontFamily: WS.font.body,
        cursor: 'pointer',
      }}
    >
      {label}
      {busy && ' ...'}
    </button>
  );
}
