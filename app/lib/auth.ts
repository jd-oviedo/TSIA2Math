import { createClient } from './supabase-server'
import { createAdminClient } from './supabase-admin'

export type Profile = {
  id: string
  role: 'student' | 'teacher'
  subscription_status: 'active' | 'inactive'
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