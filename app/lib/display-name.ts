// A person's name, out of whatever the identity provider gave us.
//
// LIFTED OUT OF auth.ts VERBATIM, and the reason is the import graph rather than
// the code. auth.ts reads the session, so it imports supabase-server, which
// imports next/headers. Anything that wanted these two pure string helpers had
// to drag that whole chain along -- which made app/lib/teacher-directory.ts
// unloadable outside a request, and with it anything that imports it. These
// functions touch no session, no request and no client; they belong at a leaf.
//
// auth.ts re-exports both, so every existing call site is untouched. Same move,
// and the same reason, as CODE_ALPHABET moving into join-code.ts.
//
// profiles has no name column, so the only real name we hold for anyone is the
// one the identity provider gave us at sign-up: Google OAuth writes full_name
// (and name) into auth.users.user_metadata. That is what these two read.
//
// The email local part is a last-resort fallback, not the default -- it is only
// correct for a user whose metadata genuinely carries no name, e.g. someone
// created by an email invite who has never completed an OAuth sign-in, or a
// student provisioned by a teacher before their full_name was written.
export type UserMetadata = Record<string, unknown> | null | undefined

function metaString(metadata: UserMetadata, key: string): string {
  const value = metadata?.[key]
  return typeof value === 'string' ? value.trim() : ''
}

export function displayName(metadata: UserMetadata, email: string | null | undefined): string {
  return (
    metaString(metadata, 'full_name') ||
    metaString(metadata, 'name') ||
    (email ?? '').split('@')[0]
  )
}

// Initials from whatever displayName resolved to. Splitting on whitespace as
// well as [._-] means this reads "Juan Oviedo" and the "jd.oviedo" email
// fallback the same way, so the avatar chip stays consistent either way.
export function initialsFrom(name: string): string {
  return (
    name
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((p) => p[0]!.toUpperCase())
      .slice(0, 2)
      .join('') || '??'
  )
}
