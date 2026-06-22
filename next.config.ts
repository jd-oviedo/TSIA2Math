import type { NextConfig } from "next";

// PostHog host: update this if you ever switch PostHog regions or use a
// self-hosted instance. The NEXT_PUBLIC_POSTHOG_HOST env var should match.
const POSTHOG_HOST = "https://us.posthog.com";

// Your Supabase project URL — tighten this to your exact project subdomain
// rather than the wildcard if you want a stricter connect-src. The wildcard
// is fine for now, it only allows supabase.co subdomains.
const SUPABASE_HOST = "https://*.supabase.co";

// Upstash Redis is only contacted server-side (in the route handlers), so
// it does not need a browser-level CSP entry. Never add it here.

const cspDirectives = [
  // Only load scripts from our own origin. PostHog injects its own script
  // from the host defined below; we allow that explicitly.
  `script-src 'self' 'unsafe-eval' ${POSTHOG_HOST}`,

  // Inline styles are used throughout via JSX style={{}} props. 'unsafe-inline'
  // is the correct tradeoff here: our risk is not CSS injection (we have no
  // user-supplied style content), and avoiding it would require nonce
  // infrastructure that buys nothing meaningful for this app's threat model.
  // Google Fonts injects a <style> tag, so fonts.googleapis.com is also needed.
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,

  // Fonts served from Google's CDN.
  `font-src 'self' https://fonts.gstatic.com`,

  // API calls: Supabase (DB + auth REST), PostHog analytics.
  // No Upstash here — it's server-to-server only.
  `connect-src 'self' ${SUPABASE_HOST} ${POSTHOG_HOST}`,

  // Google OAuth redirect. 'self' covers our own /auth/callback route.
  `frame-ancestors 'none'`,

  // Images: only our own origin and data URIs (used by some UI components).
  `img-src 'self' data: https:`,

  // Disallow all plugins (Flash etc.) and object embeds.
  `object-src 'none'`,

  // Forms only submit to our own origin.
  `form-action 'self' https://accounts.google.com`,

  // Only load our app in an iframe from our own origin (belt-and-suspenders
  // alongside the X-Frame-Options header below).
  `frame-src 'self' https://accounts.google.com`,

  // Default fallback for anything not explicitly listed above.
  `default-src 'self'`,

  // Force HTTPS for any resource not covered by a more specific directive.
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes.
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            // Prevents clickjacking — redundant with frame-ancestors in CSP
            // but included for browsers that don't support CSP.
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Prevents MIME-type sniffing. Cheap, no downside.
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Only send the full referrer within our own origin; send only
            // the origin (no path/query) for cross-origin requests.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Opt out of browser features the app doesn't use. Keeps the
            // attack surface minimal if a CSP bypass is ever found.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            // Tell browsers to always use HTTPS for this domain for the
            // next year, even if they somehow end up on HTTP.
            // preload is intentionally omitted until the domain is stable.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;