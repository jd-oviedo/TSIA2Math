// Which unit the Modules page should arrive with expanded.
//
// A pure function in its own module rather than a helper inside page.tsx, for a
// concrete reason: node --test cannot load .tsx, so anything living beside JSX is
// unreachable by the unit runner. This is the entire server half of the
// auto-expand feature, and it is the half a browser test cannot reach at all,
// since /dashboard/modules redirects to /login without a session.
//
// The rule: match this app's own topic route, take the unit number, and open
// nothing on any other input. The dominant journey is modules -> topic -> back to
// modules, and re-hunting the unit you just left is the exact problem collapsing
// creates. Any other entry, a direct visit or a bookmark, has no referer to match
// and every unit stays collapsed, which is the intended default rather than a
// fallback.
export function unitFromReferer(referer: string | null): number | null {
  if (!referer) return null;
  const m = /\/course\/[^/]+\/[^/]+\/unit\/(\d+)\/topic\//.exec(referer);
  if (!m) return null;
  const n = Number(m[1]);
  // Not `n || null`: unit 0 is a real unit in this course and also falsy.
  return Number.isInteger(n) ? n : null;
}
