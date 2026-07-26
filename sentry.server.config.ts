// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
