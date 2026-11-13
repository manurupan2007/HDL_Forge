import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Only the Node runtime is used by this app (no edge routes).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
