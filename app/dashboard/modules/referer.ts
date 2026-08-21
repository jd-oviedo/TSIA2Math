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
/**
 * The unit to expand, from the explicit `?unit=` parameter.
 *
 * ADDED because the referer rule below, while it works, is not addressable: there
 * was no URL that meant "modules, unit 3 open", so nothing could link to one. The
 * topic breadcrumb's "Unit N" link pointed at /course/{test}/{subject}/unit/{n},
 * which has no route at all -- it parsed as unreadable, tripped the course gate's
 * Sentry branch, and redirected to /dashboard. See #177.
 *
 * Explicit wins over referer: a parameter is something the product chose to put
 * in a link, a referer is a header the browser may or may not send. The referer
 * rule stays as the fallback so the modules -> topic -> back journey keeps working
 * from a plain back button.
 */
export function unitFromParam(unit: string | string[] | undefined): number | null {
  if (typeof unit !== 'string') return null;
  // PLAIN DIGITS, tested before Number() rather than after.
  //
  // The first version of this was `Number.isInteger(Number(unit)) && n >= 0`,
  // whose comment claimed it rejected '1e2' and ' 3'. It did not: Number('1e2')
  // is 100 and Number(' 3') is 3, both integers, both >= 0, so a URL reading
  // ?unit=1e2 opened unit 100 and ?unit=%203 opened unit 3. Caught by the test
  // written to pin exactly that claim.
  if (!/^\d+$/.test(unit)) return null;
  const n = Number(unit);
  // Unit 0 is real and also falsy, which is why this tests the type rather than
  // the truthiness -- the same trap unitFromReferer documents below.
  return Number.isInteger(n) ? n : null;
}

export function unitFromReferer(referer: string | null): number | null {
  if (!referer) return null;
  const m = /\/course\/[^/]+\/[^/]+\/unit\/(\d+)\/topic\//.exec(referer);
  if (!m) return null;
  const n = Number(m[1]);
  // Not `n || null`: unit 0 is a real unit in this course and also falsy.
  return Number.isInteger(n) ? n : null;
}
