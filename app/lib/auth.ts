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