// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://140962e2aa77c0f18993162b757cefd5@o4511610070499328.ingest.us.sentry.io/4511610070695936",

  // Only report from real deploys. `next dev` runs with NODE_ENV="development",
  // so local work never lands in the production Sentry project.
  enabled: process.env.NODE_ENV === "production",

  // VERCEL_ENV distinguishes production vs preview deploys (both build with
  // NODE_ENV="production"); NODE_ENV is the fallback for non-Vercel runs.
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,

  // Noise from environments we don't control and can't act on:
  //  - Instagram's in-app browser injects a webkit.messageHandlers bridge.
  //  - Browser extensions fire runtime.sendMessage into the page.
  ignoreErrors: [
    "window.webkit.messageHandlers",
    "Invalid call to runtime.sendMessage",
  ],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
