import type { NextConfig } from "next";
// v11 ships the build-time wrapper as a separate subpath export.
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@veriflow/iverilog-wasm"],
};

/**
 * withSentryConfig instruments the build: it injects release/version data,
 * wires Turbopack/webpack instrumentation, and (when SENTRY_AUTH_TOKEN is
 * present) uploads source maps for readable stack traces. Without a token
 * the build simply skips the upload step.
 */
export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
