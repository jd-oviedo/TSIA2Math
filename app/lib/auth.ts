import { createClient } from './supabase-server'
import { createAdminClient } from './supabase-admin'
import { isEntitledWithLegacyFallback } from './entitlement'
import { planGrants, type Capability } from './capabilities'

// The entitlement columns travel with the profile now.
//
// WIDENED BEFORE ANY READER MOVED, deliberately, and it is the reason this file
// changed first. Both helpers below used to select only id, role and
// subscription_status. isEntitled(undefined, undefined) is false, so a reader
// switched to the new predicate before its select was widened would deny
// everyone, every teacher included. Shape first, behaviour after.
export type Profile = {
  id: string
  role: 'student' | 'teacher'
  /** Legacy. Still written in lockstep by stripe-activation, still read here
   *  through isEntitledWithLegacyFallback, and blocked from being dropped by
   *  legacyActivateOnly. */
  subscription_status: 'active' | 'inactive'
  plan: string | null
  plan_status: string | null
  access_until: string | null
}

// The columns every profile read needs, spelled out once so the two helpers
// below cannot drift apart.
const PROFILE_COLUMNS = 'id, role, subscription_status, plan, plan_status, access_until'

/**
 * Does this profile hold a live entitlement for the given capability?
 *
 * Both halves matter. planGrants alone admits a lapsed buyer;
 * isEntitledWithLegacyFallback alone admits an entitled buyer of the wrong
 * product, which is exactly the hole that let a student row promoted to
 * role='teacher' pass the teacher gate.
 *
 * `capability` is the Capability type from capabilities.ts rather than a union
 * spelled out here. It used to be spelled out, and adding class-data-export
 * meant editing the same list in two files: the map, which decides what a plan
 * actually grants, and this signature, which decides what a caller is allowed
 * to ask about. The two agreed at the moment of the split and were one edit
 * from disagreeing, in the direction that fails quietly. A capability missing
 * from the local copy is not a runtime bug, it is a compile error at every call
 * site that names it, which reads as "this capability does not exist" rather
 * than "somebody forgot a line".
 *
 * Type-only import, so this adds no runtime edge. auth.ts already imports
 * planGrants from the same module, and capabilities.ts stays runtime-pure.
 */
export function profileGrants(
  profile: Pick<Profile, 'plan' | 'plan_status' | 'access_until' | 'subscription_status'>,
  capability: Capability,
  source: string
): boolean {
  if (!planGrants(profile.plan, capability)) return false
  return isEntitledWithLegacyFallback(
    profile.plan_status,
    profile.access_until,
    profile.subscription_status,
    source
  )
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
    .select(PROFILE_COLUMNS)
    .eq('id', session.user.id)
    .single()

  if (error || !profile) return null

  // MOVED OFF subscription_status. This is a genuine tightening, not a
  // translation: the old check was role plus a payment flag, so a student row
  // promoted to role='teacher' by any of the three promotion paths, while
  // holding an active STUDENT purchase, passed it and got a full teacher
  // dashboard including join codes and roster access over other people's
  // students. Now the plan has to be a teacher plan.
  const p = profile as Profile
  if (p.role !== 'teacher') return null
  if (!profileGrants(p, 'teacher-dashboard', 'requireTeacher')) return null

  return p
}

// The current user's profile whatever their role, plus the auth id. Use this
// where a page serves more than one role and needs to branch, rather than
// calling requireTeacher and treating null as "student" -- null also covers
// signed out, and an inactive teacher.
// user_metadata comes back alongside the profile because getUser() has already
// been called to get here, and the name every account chip wants lives in it.
// profiles has no name column (see displayName above), so a caller that only has
// a Profile has no way to render a person's name without a SECOND getUser()
// round trip -- which is exactly what app/dashboard/settings/page.tsx:22-25 does
// today. Additive: existing callers that ignore it are unaffected.
export async function getProfile(): Promise<
  (Profile & { email: string | null; user_metadata: Record<string, unknown> | null }) | null
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Read through the admin client for the same reason requireTeacher does:
  // the profiles row is the authority on role, and it should not depend on
  // whatever select policy happens to be on the table.
  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .single()

  if (error || !profile) return null

  return {
    ...(profile as Profile),
    email: user.email ?? null,
    user_metadata: user.user_metadata ?? null,
  }
}