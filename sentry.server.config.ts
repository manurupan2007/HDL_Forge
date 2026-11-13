import * as Sentry from "@sentry/nextjs";

/**
 * Server runtime Sentry init. No-ops unless NEXT_PUBLIC_SENTRY_DSN is set,
 * so local development and preview builds run clean without an account.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Errors: 100%. Spans: sampled down in production to respect the free tier.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  });
}
