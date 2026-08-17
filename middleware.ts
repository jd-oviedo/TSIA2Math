import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refreshes the Supabase auth token on every matched request.
//
// Why this has to exist: the browser client (app/lib/supabase.ts) persists the
// session in cookies, and every server route that gates on auth reads those
// cookies -- app/api/items/reveal is the sharp case, where an unauthenticated
// read silently returns `explanation: null` rather than erroring. Access tokens
// are short-lived. Without something refreshing them server-side, a student
// whose token expires mid-test keeps a stale cookie, the reveal route sees no
// session, and they are downgraded to the anonymous tier with no error and
// nothing to click. Server Components cannot write cookies, which is why the
// refresh cannot live in app/lib/supabase-server.ts -- its setAll swallows the
// write with a comment pointing at exactly this file.
//
// Deliberately does no gating. It refreshes and gets out of the way: no
// redirects, no role checks, no route protection. Every existing auth decision
// stays where it already is (requireTeacher, the per-page server gates, the
// reveal route). A signed-in request with a valid token passes through
// untouched -- getUser() finds a live session, setAll is never called, and the
// pass-through response is returned exactly as it was created. Only the
// refresh-on-expiry path differs, and there the only change is fresher cookies.
//
// IT DOES ONE OTHER THING NOW, AND ONLY ONE: it stamps the requested path onto
// the request as x-pathname. That is still not gating -- nothing here decides
// anything -- but /dashboard's layout needs the path to build a sign-in redirect
// that returns the student to the page they asked for, and a layout cannot see
// it. Measured rather than assumed: a layout receives exactly accept, host,
// user-agent and the four x-forwarded-* headers. There is no pathname in any
// form, so it has to be put there.
//
// The gate stays in the layout. Moving it into the five pages, which do know
// their own paths, would scatter the one place a sixth route cannot be added
// without a gate -- which is the regression verify_auth_gate.mjs exists to catch.
export async function middleware(request: NextRequest) {
  // Built fresh at each use, never snapshotted.
  //
  // This is the trap in this file. `request.cookies.set` in setAll below mutates
  // the cookie header, so a Headers object captured before that call carries a
  // STALE cookie header, and handing it to NextResponse.next would hand the
  // downstream handler the pre-refresh session -- reintroducing exactly the bug
  // this middleware exists to fix, in a form that only shows on the
  // refresh-on-expiry path. Cheap to rebuild, so it is rebuilt.
  const headersWithPath = () => {
    const headers = new Headers(request.headers)
    headers.set('x-pathname', request.nextUrl.pathname + request.nextUrl.search)
    return headers
  }

  // The pass-through response. Reassigned wholesale by setAll below when
  // tokens are refreshed, which is why it is `let` and not `const`.
  let supabaseResponse = NextResponse.next({ request: { headers: headersWithPath() } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Two writes, both required. The request copy is what any handler
          // downstream in this same pass will read; the response copy is what
          // actually reaches the browser. Writing only one of them produces a
          // session that works for exactly one request and then vanishes.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // headersWithPath() is called HERE, after the cookie writes above, so
          // the rebuilt request carries the refreshed cookies and not the ones
          // this request arrived with.
          supabaseResponse = NextResponse.next({ request: { headers: headersWithPath() } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser(), not getSession(). getSession() reads the cookie and returns
  // whatever it finds without contacting the auth server, so it will happily
  // hand back an expired token and never trigger a refresh -- which would make
  // this middleware a no-op for the one case it exists to fix. getUser()
  // validates against Supabase and refreshes when needed, and the refreshed
  // tokens come back out through setAll above.
  await supabase.auth.getUser()

  // Must be returned as-is. Building a different response here, or copying only
  // the body, drops the refreshed Set-Cookie headers and silently reintroduces
  // the bug.
  return supabaseResponse
}

export const config = {
  matcher: [
    // Everything except Next's static output, image optimizer, favicon, and
    // static image assets -- none of which read auth, all of which would pay
    // a getUser() round trip for nothing.
    //
    // /api/stripe/webhook is excluded as well: it is a machine-to-machine
    // endpoint that carries no cookies and authenticates by Stripe signature,
    // so a refresh attempt there is pure latency on a path Stripe retries.
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
