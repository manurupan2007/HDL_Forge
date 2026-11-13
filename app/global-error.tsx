"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Root-level error boundary. global-error renders its own document and does
 * not inherit globals.css — keep it self-contained.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0e14",
          color: "#e7edf3",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h2>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: "#9aa4b2",
            }}
          >
            An unexpected error occurred. The crash has been reported.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              borderRadius: 6,
              padding: "0.5rem 0.875rem",
              fontSize: "0.875rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
