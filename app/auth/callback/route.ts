import { NextResponse } from 'next/server'
import { createClient } from '../../lib/supabase-server'
import { createAdminClient } from '../../lib/supabase-admin'
import { safeNext } from '../../lib/next-param'

// Resolve the public-facing origin to redirect back to. Behind a proxy
// (GitHub Codespaces port-forwarding, Vercel) the dev server receives
// `Host: localhost:3000` and forwards the real host in x-forwarded-host, so
// deriving the origin from request.url would strand the user on localhost.
// Prefer the forwarded headers whenever present; fall back to request.url's
// origin only for true local dev, where those headers are absent.
function resolveOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
    return `${forwardedProto}://${forwardedHost}`
  }
  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = resolveOrigin(request)
  const code = searchParams.get('code')
  // Validated rather than trusted. This is the one place the param becomes a
  // redirect, so it is the one place worth guarding.
  //
  // Measured before the guard was added: `${origin}${next}` is accidentally
  // safe -- //evil.com and \\evil.com both resolve to a PATH on the origin,
  // https://evil.com resolves to a garbage path on the origin, and
  // javascript:alert(1) throws Invalid URL and 500s. Nothing escaped. So this
  // closes no live hole; it makes a user-controlled value reaching a redirect
  // checked instead of accidentally safe, turns the javascript: case into a
  // clean fallback rather than a 500, and holds if anyone later rewrites this
  // as `new URL(next, origin)`, which is the obvious-looking refactor and the
  // one that would make the accident stop holding.
  const next = safeNext(searchParams.get('next'), '/')
  const sessionId = searchParams.get('session_id')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user && sessionId) {
      // Claim the anonymous session they just took, but only if it's
      // genuinely unclaimed — never overwrite an existing owner.
      const admin = createAdminClient()
      const { error: claimError } = await admin
        .from('sessions')
        .update({ user_id: data.user.id })
        .eq('id', sessionId)
        .is('user_id', null)

      if (claimError) {
        console.error('[auth/callback] failed to claim session:', claimError.message)
      }
    }
  // If the user came through the teacher signup flow, elevate their role.
    // subscription_status stays inactive until Stripe confirms payment.
    if (!error && data.user) {
      const roleParam = searchParams.get("role");
      if (roleParam === "teacher") {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .update({ role: "teacher" })
          .eq("id", data.user.id);
      }
    }
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}