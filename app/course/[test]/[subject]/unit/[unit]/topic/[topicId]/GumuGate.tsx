'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AnswerKeyEntries, AnswerKeyEntry } from '@/lib/curriculum-utils';
import { EYEBROW, MATH_LINE_HEIGHT } from '@/app/components/curriculum-theme';
import { T } from '../../../../../../../components/curriculum-surface';
import { FONT_BODY } from '@/app/components/fonts';

// Tracks whether any GUMU session is live on this topic, so the answer key can
// be gated while one is. The quiz sections and the answer key are siblings
// under a server component, so the state has to live in a provider wrapping
// both rather than being passed down from the page.

type GumuGateValue = {
  activeCount: number;
  setItemActive: (key: string, active: boolean) => void;
};

const GumuGateContext = createContext<GumuGateValue>({
  activeCount: 0,
  setItemActive: () => {},
});

export function useGumuGate() {
  return useContext(GumuGateContext);
}

export function GumuGateProvider({ children }: { children: React.ReactNode }) {
  // Keyed by item rather than counted, so a double report from one item can't
  // drift the count and leave the answer key permanently gated.
  const [active, setActive] = useState<Record<string, boolean>>({});

  const setItemActive = useCallback((key: string, isActive: boolean) => {
    setActive((prev) => {
      if (Boolean(prev[key]) === isActive) return prev;
      const next = { ...prev };
      if (isActive) next[key] = true;
      else delete next[key];
      return next;
    });
  }, []);

  const activeCount = Object.keys(active).length;
  const value = useMemo(() => ({ activeCount, setItemActive }), [activeCount, setItemActive]);

  return <GumuGateContext.Provider value={value}>{children}</GumuGateContext.Provider>;
}

// The answer key. Renders server-built HTML, but has to be a client component
// so it can read the gate. Cancer Violet appears here and nowhere else on the
// page, so a solution always looks like a solution.
export function AnswerKey({
  entries,
  fallbackHtml,
}: {
  entries: AnswerKeyEntries;
  fallbackHtml: string;
}) {
  const { activeCount } = useGumuGate();

  if (activeCount > 0) {
    return (
      <div
        style={{
          border: `1px dashed ${T.hairline}`,
          borderRadius: 0,
          padding: '18px 20px',
          background: T.quietBox,
          color: T.muted,
          font: `400 14.5px ${FONT_BODY}`,
          lineHeight: 1.65,
        }}
      >
        The answer key is paused while you&apos;re working through a question with GUMU. Finish
        that conversation, or use &ldquo;I&apos;ll just see the answer&rdquo;, and it will come
        back.
      </div>
    );
  }

  const groups = [
    { label: 'Practice', items: entries.practice },
    { label: 'Mini quiz', items: entries.mini_quiz },
  ].filter((group) => group.items.length > 0);

  // A topic whose Part 4 does not split into items -- an older content shape,
  // say -- still gets its answer key, just as the single panel it was before.
  if (groups.length === 0) {
    return (
      <details style={{ cursor: 'pointer' }}>
        <summary style={{ font: `500 15px ${FONT_BODY}`, color: T.answerKey }}>
          Reveal worked solutions
        </summary>
        <div
          className="um-prose"
          style={{
            marginTop: '16px',
            color: T.ink2,
            font: `400 15px ${FONT_BODY}`,
            lineHeight: MATH_LINE_HEIGHT,
          }}
          dangerouslySetInnerHTML={{ __html: fallbackHtml }}
        />
      </details>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {groups.map((group) => (
        <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {groups.length > 1 && (
            <div style={{ ...EYEBROW, color: T.disabled, fontSize: '10.5px' }}>{group.label}</div>
          )}
          {group.items.map((entry) => (
            <SolutionRow key={`${group.label}-${entry.item_number}`} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SolutionRow({ entry }: { entry: AnswerKeyEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: T.panel,
        borderRadius: 0,
        padding: open ? '17px 20px 20px' : '0',
        boxShadow: open
          ? `inset 0 0 0 1.5px ${T.answerKey}`
          : `inset 0 0 0 1px ${T.hairline}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <button
        type="button"
        className="um-solution-row"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          width: '100%',
          padding: open ? 0 : '17px 20px',
          border: 'none',
          background: 'none',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            flex: 'none',
            font: '600 12px ui-monospace, Menlo, monospace',
            color: T.answerKey,
          }}
        >
          {String(entry.item_number).padStart(2, '0')}
        </span>
        <span
          className={open ? undefined : 'um-clamp'}
          style={{
            flex: 1,
            minWidth: 0,
            font: `400 14.5px ${FONT_BODY}`,
            lineHeight: 1.6,
            color: T.ink2,
          }}
          dangerouslySetInnerHTML={{ __html: entry.label_html }}
        />
        <span
          style={{
            flex: 'none',
            font: `500 12.5px ${FONT_BODY}`,
            color: open ? T.muted : T.answerKey,
          }}
        >
          {open ? 'Hide' : 'Reveal solution'}
        </span>
      </button>

      {open && (
        <>
          <div style={{ height: '1px', background: 'rgba(168,110,200,.22)' }} />
          <div
            className="um-prose"
            style={{
              color: T.ink2,
              font: `400 15px ${FONT_BODY}`,
              lineHeight: 2.1,
              minHeight: '30px',
            }}
            dangerouslySetInnerHTML={{ __html: entry.solution_html }}
          />
        </>
      )}
    </div>
  );
}
