import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry init (runs before hydration). Catches WASM/worker
 * crashes inside the Verilator and iverilog pipelines that never surface to
 * server logs. No-ops unless NEXT_PUBLIC_SENTRY_DSN is set.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  });
}
