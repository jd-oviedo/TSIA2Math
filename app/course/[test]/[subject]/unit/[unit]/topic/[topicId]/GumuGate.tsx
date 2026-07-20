'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

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
// so it can read the gate.
export function AnswerKey({ html }: { html: string }) {
  const { activeCount } = useGumuGate();

  if (activeCount > 0) {
    return (
      <div
        style={{
          border: '1px dashed #D8D6D1',
          borderRadius: '8px',
          padding: '1rem',
          color: '#5F5E5A',
          fontSize: '15px',
          lineHeight: 1.6,
        }}
      >
        The answer key is hidden while you&apos;re working through a question with GUMU.
        Finish that conversation, or use &ldquo;I&apos;ll just see the answer&rdquo;, and it
        will come back.
      </div>
    );
  }

  return (
    <details style={{ cursor: 'pointer' }}>
      <summary style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F1E35' }}>
        Click to reveal answers
      </summary>
      <div
        style={{
          lineHeight: '1.8',
          marginTop: '1rem',
          marginBottom: '2rem',
          color: '#1A1A1A',
          fontSize: '16px',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </details>
  );
}
