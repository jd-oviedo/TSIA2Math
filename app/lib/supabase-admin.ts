import { createClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS entirely, so this must only ever be
// imported into server-side code (API routes, route handlers, server
// actions). Never import this into a "use client" file or anything that
// ships to the browser, the service role key would leak.
//
// sessions/responses have RLS enabled with zero policies, so this is the
// only client that can write to them at all.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and Vercel env vars for prod). " +
        "Find it in Supabase project settings under API > service_role key. Do not expose this to the client."
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
