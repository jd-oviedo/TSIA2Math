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
  /** Which PRICE was paid, when a Payment Link named one. The only per-row way
   *  to tell a $5 tripwire from an $89 Full Course, since both carry
   *  plan='full-course'; entitlement.ts reads it for the grace window. */
  stripe_payment_link_id: string | null
}

// The columns every profile read needs, spelled out once so the two helpers
// below cannot drift apart.
const PROFILE_COLUMNS =
  'id, role, subscription_status, plan, plan_status, access_until, stripe_payment_link_id'

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
  profile: Pick<
    Profile,
    'plan' | 'plan_status' | 'access_until' | 'subscription_status' | 'stripe_payment_link_id'
  >,
  capability: Capability,
  source: string
): boolean {
  if (!planGrants(profile.plan, capability)) return false
  return isEntitledWithLegacyFallback(
    profile.plan_status,
    profile.access_until,
    // THE GRACE WINDOW IS A PROPERTY OF THE PRICE, so the row has to carry the
    // link id this far. Required in the Pick rather than optional: every caller
    // that hand-picks its columns now fails to COMPILE until it selects this
    // one, which is the only way a reader cannot quietly fall back to the
    // three-day default on a seven-day pass.
    //
    // INERT FOR EVERY CALLER TODAY, and that is worth saying out loud rather
    // than leaving to be discovered. A tripwire row carries plan='full-course',
    // and every live call site of this function asks about a capability
    // full-course does not hold, or sits behind requireTeacher(). planGrants
    // above therefore returns false before this line is reached. The threading
    // is here so the NEXT student-facing gate is correct by construction, not
    // because one is wrong today.
    profile.stripe_payment_link_id,
    profile.subscription_status,
    source
  )
}

// displayName and initialsFrom MOVED to app/lib/display-name.ts and are
// re-exported here, so every existing `from '../lib/auth'` import still works.
// They are pure string helpers over user_metadata; keeping them in the module
// that reads the session meant importing next/headers to spell somebody's name,
// which made teacher-directory.ts unloadable outside a request.
export { displayName, initialsFrom } from './display-name'

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