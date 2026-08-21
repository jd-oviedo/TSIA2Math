'use client';

import { useCallback, useEffect, useState } from 'react';

// Language for the three login screens.
//
// WHAT THIS REPLACES. The role selector held its language in a bare useState,
// so the choice reset to English on every mount: on reload, on navigating away
// and back, and on returning from the OAuth round trip. A Spanish-dominant
// student who picked Español and then signed in came back to English. The
// role-specific screens had no toggle at all and were English only.
//
// SAME MECHANISM AS THE THEME, not a second one. localStorage, alongside
// "ec-theme", with the same try/catch guards for the same measured reason:
// localStorage throws SecurityError in the Instagram in-app browser and in iOS
// private mode, and a missing preference must degrade to the default rather
// than take the screen down. See app/theme/ThemeProvider.tsx:23-47.
//
// NOT A PROVIDER, because it does not need to be one. The three screens are one
// route and never mount together, so there is no tree to share state across --
// each reads the stored value on mount. If this ever grows past /login it should
// become a provider rather than a fourth copy of this hook.
//
// SCOPED TO /login DELIBERATELY. /reporte and /go carry their own parallel
// language implementations. Unifying those three is its own piece of work and
// touching them here would widen a login redesign into a site-wide i18n change.

export type Lang = 'en' | 'es';

const STORAGE_KEY = 'ec-lang';

function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'es';
}

export function useLoginLang(): [Lang, (l: Lang) => void] {
  // Starts English on the server and on first paint, then corrects from storage
  // in an effect. Reading localStorage during render would not work anyway --
  // it does not exist on the server -- and this matches how the theme behaves,
  // so the two controls flip at the same moment rather than one lagging.
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLang(stored)) setLangState(stored);
    } catch {
      // no persisted preference available -- keep the default
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    // Applied first and persisted second, so a storage failure still changes the
    // language for this visit.
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // persistence unavailable -- the choice still holds for this session
    }
  }, []);

  return [lang, setLang];
}
