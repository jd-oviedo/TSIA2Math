import { NextResponse } from 'next/server'
import { createClient } from '../../lib/supabase-server'
import { createAdminClient } from '../../lib/supabase-admin'
import { safeNext } from '../../lib/next-param'
import { claimPending } from '../../lib/pending-entitlements'

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
    // A PURCHASE MAY BE WAITING FOR THIS EMAIL.
    //
    // The webhook captures a paid checkout that matched no account into
    // pending_entitlements. This is the surface that closes failure mode (b):
    // the buyer paid with a Google address they had simply never signed in with
    // before, or with a different address they typed at Stripe's form, which
    // pre-fills nothing on a direct buy.stripe.com link. The moment that account
    // exists, the debt is payable, and this is the moment it exists.
    //
    // It cannot close mode (a) -- a checkout email that is not a Google address
    // can never appear here at all -- which is what /claim is for.
    //
    // NEVER ALLOWED TO BREAK SIGN-IN. claimPending throws on a database error,
    // which is right at its own call sites and wrong at this one: a Redis or
    // Postgres hiccup must not strand someone at /login?error=auth_failed when
    // their authentication actually succeeded. Caught, logged loudly, and the
    // row stays unclaimed, so the next sign-in tries again.
    if (!error && data.user?.email) {
      // SKIPPED WHEN /claim IS THE DESTINATION, deliberately. The buyer is one
      // redirect away from claiming a SPECIFIC session id. If this broad
      // email sweep consumed that same row first, /claim would greet them with
      // "this link has already been used" a second after they got their access
      // — a false alarm, and one that is unanswerable because the table records
      // no claimed_by to compare against. Whatever this sweep would have found
      // by email is still owed and is picked up on their next sign-in.
      const headingToClaim = next === '/claim' || next.startsWith('/claim?')
      if (!headingToClaim) {
        try {
          const admin = createAdminClient()
          const results = await claimPending(admin, data.user.id, { email: data.user.email })
          for (const r of results) {
            if (r.outcome !== 'nothing-owed') {
              console.log(
                `[auth/callback] pending entitlement for ${data.user.id}: ` +
                  `${r.outcome} (${r.checkoutSessionId ?? 'no session'})`
              )
            }
          }
        } catch (err) {
          console.error(
            '[auth/callback] CLAIMING PENDING ENTITLEMENTS FAILED. Sign-in continues and the ' +
              'rows stay unclaimed, so the next sign-in retries.',
            err
          )
        }
      }
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}