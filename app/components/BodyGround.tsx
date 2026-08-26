'use client';

import { useBodyBackground } from './useBodyBackground';

// The client edge of useBodyBackground, for a surface whose page is a SERVER
// component.
//
// /teacher/students and /teacher/settings both gate on the session server-side
// and put their frame in the first paint, so neither can call a hook. This is
// the smallest thing that can: it renders nothing, and exists only so the
// effect runs. A page that is already a client component -- the dashboard,
// /teacher/student/[id] -- calls the hook directly and has no use for this.
//
// The colour must be a RESOLVED value, not a var() reference, for the reason
// given at the bottom of useBodyBackground.ts: body cannot read a custom
// property declared on one of its own descendants.
export function BodyGround({ color }: { color: string }) {
  useBodyBackground(color);
  return null;
}
