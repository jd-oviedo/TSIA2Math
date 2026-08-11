import { createClient } from './supabase-server'
import { createAdminClient } from './supabase-admin'

export type Profile = {
  id: string
  role: 'student' | 'teacher'
  subscription_status: 'active' | 'inactive'
}

// profiles has no name column, so the only real name we hold for anyone is the
// one the identity provider gave us at sign-up: Google OAuth writes full_name
// (and name) into auth.users.user_metadata. That is what these two read.
//
// The email local part is a last-resort fallback, not the default -- it is only
// correct for a user whose metadata genuinely carries no name, e.g. someone
// created by an email invite who has never completed an OAuth sign-in.
type UserMetadata = Record<string, unknown> | null | undefined

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

// Returns the profile if the current user is an active teacher, null otherwise.
// Use this at the top of every teacher-facing page and API route.
export async function requireTeacher(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, role, subscription_status')
    .eq('id', session.user.id)
    .single()

  if (error || !profile) return null
  if (profile.role !== 'teacher' || profile.subscription_status !== 'active') return null

  return profile as Profile
}

// The current user's profile whatever their role, plus the auth id. Use this
// where a page serves more than one role and needs to branch, rather than
// calling requireTeacher and treating null as "student" -- null also covers
// signed out, and an inactive teacher.
export async function getProfile(): Promise<(Profile & { email: string | null }) | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Read through the admin client for the same reason requireTeacher does:
  // the profiles row is the authority on role, and it should not depend on
  // whatever select policy happens to be on the table.
  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, role, subscription_status')
    .eq('id', user.id)
    .single()

  if (error || !profile) return null

  return { ...(profile as Profile), email: user.email ?? null }
}