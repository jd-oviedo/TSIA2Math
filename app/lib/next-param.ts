// The `next` param: where to send someone after they sign in.
//
// One place, because it was being built in seven and read in one, with the
// encoding written two ways (encodeURIComponent in five sites, a hand-written
// %2F in two) and the value never validated at the point it became a redirect.
//
// THE GUARD IS DEFENCE IN DEPTH, NOT A FIX FOR A LIVE HOLE. Measured before it
// was written: app/auth/callback builds its redirect as `${origin}${next}`, and
// string concatenation turns out to be safer than `new URL(next, origin)` would
// be. Every payload tried stayed on the origin --
//
//   //evil.com          -> https://host//evil.com     same host, a path
//   \\evil.com          -> https://host//evil.com     same host, a path
//   https://evil.com    -> https://hosthttps//evil.com  same host, garbage path
//   javascript:alert(1) -> throws Invalid URL, so a 500
//
// -- so nothing escapes the origin today. What the guard buys is that a
// user-controlled value reaching a redirect is checked rather than accidentally
// safe, and that the javascript: case becomes a clean fallback instead of a 500.
// If the callback is ever rewritten to use `new URL(next, origin)`, which is the
// obvious-looking refactor, the accident stops holding and this becomes the only
// thing standing between the param and an open redirect.
//
// Imports nothing, so `node --test` can load it directly.

// Where someone lands when `next` is missing or refused.
export const DEFAULT_NEXT = '/dashboard';

// A path is honoured only if it is unambiguously same-origin and relative:
// starts with a single "/", and the second character is neither "/" nor "\".
//
// The second-character rule is the whole point. "//evil.com" and "/\evil.com"
// both start with "/" and both are read by browsers as protocol-relative or
// backslash-normalised authorities in enough contexts to be worth refusing
// outright rather than reasoning about per call site.
export function isSafeNext(next: string | null | undefined): next is string {
  if (!next || typeof next !== 'string') return false;
  if (next[0] !== '/') return false;
  if (next[1] === '/' || next[1] === '\\') return false;
  // A control character or space can split a header or smuggle a scheme past
  // a naive reader. Nothing legitimate here contains one.
  if (/[\u0000-\u0020\u007F]/.test(next)) return false;
  return true;
}

// The safe destination for a raw param, falling back rather than throwing: a
// student who followed a mangled link should land somewhere sensible, not on an
// error.
export function safeNext(next: string | null | undefined, fallback = DEFAULT_NEXT): string {
  return isSafeNext(next) ? next : fallback;
}

// Builds "/login?next=..." for a path, with `role` when the caller knows which
// sign-in screen it wants. Without a role, /login renders the role selector
// rather than the OAuth screen, which is why the selector has to carry the param
// onward rather than substituting its own.
export function loginHref(next: string, role?: 'student' | 'teacher'): string {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  params.set('next', safeNext(next));
  return `/login?${params.toString()}`;
}
