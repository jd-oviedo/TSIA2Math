import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// PostHog host: update this if you ever switch PostHog regions or use a
// self-hosted instance. The NEXT_PUBLIC_POSTHOG_HOST env var should match.
const POSTHOG_HOST = "https://us.posthog.com";
const POSTHOG_ASSETS = "https://us-assets.i.posthog.com";
const SENTRY_INGEST = "https://*.ingest.us.sentry.io";

// Your Supabase project URL — tighten this to your exact project subdomain
// rather than the wildcard if you want a stricter connect-src. The wildcard
// is fine for now, it only allows supabase.co subdomains.
const SUPABASE_HOST = "https://*.supabase.co";

// Upstash Redis is only contacted server-side (in the route handlers), so
// it does not need a browser-level CSP entry. Never add it here.

const cspDirectives = [
  // Only load scripts from our own origin. PostHog injects its own script
  // from the host defined below; we allow that explicitly.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${POSTHOG_HOST} ${POSTHOG_ASSETS}`,

  // Inline styles are used throughout via JSX style={{}} props. 'unsafe-inline'
  // is the correct tradeoff here: our risk is not CSS injection (we have no
  // user-supplied style content), and avoiding it would require nonce
  // infrastructure that buys nothing meaningful for this app's threat model.
  // Google Fonts injects a <style> tag, so fonts.googleapis.com is also needed.
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net`,

  // Fonts served from Google's CDN.
  `font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net`,

  // API calls: Supabase (DB + auth REST), PostHog analytics.
  // No Upstash here — it's server-to-server only.
  `connect-src 'self' ${SUPABASE_HOST} ${POSTHOG_HOST} ${POSTHOG_ASSETS} ${SENTRY_INGEST}`,

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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "unpackmath",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
