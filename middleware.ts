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
export async function middleware(request: NextRequest) {
  // The pass-through response. Reassigned wholesale by setAll below when
  // tokens are refreshed, which is why it is `let` and not `const`.
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
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
