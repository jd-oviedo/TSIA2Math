import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '../../lib/supabase-server'
import { createAdminClient } from '../../lib/supabase-admin'
import { safeNext } from '../../lib/next-param'
import { claimPending } from '../../lib/pending-entitlements'
import { JOIN_COOKIE, JOIN_COOKIE_OPTIONS } from '../../lib/join-code'
import { enrolFromJoinCode, type JoinOutcome } from '../../lib/join-enroll'

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

// Appends the join outcome to wherever the student was already going.
//
// Built by string append rather than `new URL(next, origin)` on purpose. The
// note in app/lib/next-param.ts spells out why: `${origin}${next}` is
// accidentally safe against every payload measured, and the URL constructor is
// the obvious-looking refactor that would make it stop being safe. `next` has
// already been through safeNext, so it starts with a single "/" and carries no
// control characters -- but the parsing rule stays unchanged all the same.
//
// A fragment, if one ever appears, has to keep its position: query parameters
// belong before the "#", not after it.
function withJoinResult(base: string, outcome: JoinOutcome, className: string | null): string {
  const hash = base.indexOf('#')
  const path = hash === -1 ? base : base.slice(0, hash)
  const fragment = hash === -1 ? '' : base.slice(hash)
  const sep = path.includes('?') ? '&' : '?'
  const name = className ? `&jc=${encodeURIComponent(className)}` : ''
  return `${path}${sep}join=${outcome}${name}${fragment}`
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
    // THE `role` PARAMETER ARRIVES HERE AND IS DELIBERATELY IGNORED.
    //
    // This is where `role=teacher` used to become a profile write, and it fired
    // on the parameter alone: anyone who reached /login?role=teacher got
    // role='teacher' with no payment anywhere in the path. Three production rows
    // carry it. They were inert only because every authorization surface also
    // requires a teacher plan -- app/lib/auth.ts:110-111, and the same two-step
    // in /teacher and /teacher/settings -- so the write bought nothing and left a
    // free teacher role one refactor away from mattering.
    //
    // THE WEBHOOK OWNS role NOW. app/lib/stripe-activation.ts:277-280 writes it
    // inside the guarded UPDATE at :228-282, in the same statement as the
    // entitlement columns and on a teacher plan only, so the role and the plan
    // land atomically or not at all. That is the one path every purchase goes
    // through. This one was a URL parameter.
    //
    // THE PARAMETER IS NOT DEAD, so do not chase it out of the URL builders on
    // the way to tidying this up. /login renders the teacher OAuth screen for
    // role=teacher and the role selector without it (app/login/page.tsx:37,187),
    // and /upgrade derives it from the product being bought
    // (app/upgrade/route.ts:109-110). Dropping it would put a "student or
    // teacher?" chooser in the middle of a purchase.

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

    // ─── The join-code handoff ───────────────────────────────────────────────
    //
    // A student who entered a class code before signing in has it waiting in an
    // httpOnly cookie set by /api/enroll/lookup. This is the first moment an
    // enrolment is possible at all: class_enrollments.student_id is a foreign
    // key to auth.users(id), so there is no writing it before the account
    // exists.
    //
    // NOTHING THE CLIENT SENT IS TRUSTED HERE. The cookie carries the code, not
    // the class id, and enrolFromJoinCode re-validates it and re-resolves the
    // class against the freshly authenticated user id.
    //
    // NEVER ALLOWED TO BREAK SIGN-IN, the same rule the pending-entitlement
    // sweep above follows and for the same reason: a student whose enrolment
    // failed is still a student who authenticated successfully, and must land on
    // their dashboard with an explanation rather than at /login?error=auth_failed
    // wondering what happened to their account.
    if (!error && data.user) {
      const joinCode = (await cookies()).get(JOIN_COOKIE)?.value
      if (joinCode) {
        let outcome: JoinOutcome = 'failed'
        let className: string | null = null
        try {
          const admin = createAdminClient()
          const result = await enrolFromJoinCode(admin, data.user.id, joinCode)
          outcome = result.outcome
          className = result.className
        } catch (err) {
          console.error('[auth/callback] JOIN-CODE ENROLMENT THREW. Sign-in continues.', err)
        }
        if (outcome !== 'enrolled' && outcome !== 'reactivated') {
          console.warn(`[auth/callback] join code did not enrol: ${outcome}`)
        }
        const res = NextResponse.redirect(`${origin}${withJoinResult(next, outcome, className)}`)
        // Cleared on every outcome, success or not. A code that has had its one
        // attempt must not fire again on the student's next sign-in, and a
        // failure they have been told about is not a reason to keep it.
        res.cookies.set(JOIN_COOKIE, '', { ...JOIN_COOKIE_OPTIONS, maxAge: 0 })
        return res
      }
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // AUTHENTICATION DID NOT HAPPEN: no code in the callback, or the exchange
  // failed. Cancelling at Google's account chooser is the ordinary way to get
  // here, and until now it landed silently on the role selector with an
  // error param nothing read.
  //
  // The join cookie is DELIBERATELY LEFT IN PLACE on this path. The student's
  // code is still good and still has minutes left on it, so the retry costs them
  // nothing -- but /login cannot see an httpOnly cookie, so the fact that one is
  // waiting is passed as join=pending for the screen to say so.
  const pendingJoin = (await cookies()).get(JOIN_COOKIE)?.value
  const failedParams = new URLSearchParams({ error: 'auth_failed' })
  if (pendingJoin) {
    failedParams.set('role', 'student')
    failedParams.set('join', 'pending')
  }
  return NextResponse.redirect(`${origin}/login?${failedParams.toString()}`)
}