"use client";

import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/** Route-level error boundary for the public site pages. */
export default function SiteError({
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
    <div className="grid flex-1 place-items-center px-4 py-16">
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="font-mono text-xs text-fg-subtle">page error</p>
        <h1 className="mt-2 text-lg font-semibold tracking-tight">
          Something went wrong on this page
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          An unexpected error occurred — it has been reported automatically.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-fg-subtle">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            className="btn btn-primary px-3 py-1.5 text-[13px]"
            onClick={() => retry()}
          >
            Try again
          </button>
          <Link href="/" className="btn btn-secondary px-3 py-1.5 text-[13px]">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
