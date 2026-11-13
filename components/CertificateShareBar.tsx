"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/site";

/**
 * Screen-only action bar for a verified certificate: LinkedIn share,
 * copy-link, and print-to-PDF. Hidden entirely in print output.
 */
export function CertificateShareBar({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const verifyUrl = `${SITE_URL}/verify/${encodeURIComponent(token)}`;

  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    verifyUrl,
  )}`;

  return (
    <div className="print:hidden flex flex-wrap items-center gap-2">
      <a
        href={linkedIn}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary px-3 py-1.5 text-[13px]"
      >
        Share on LinkedIn
      </a>
      <button
        type="button"
        className="btn btn-secondary px-3 py-1.5 text-[13px]"
        onClick={() => {
          void navigator.clipboard
            ?.writeText(verifyUrl)
            .then(() => setCopied(true))
            .catch(() => setCopied(false));
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button
        type="button"
        className="btn btn-secondary px-3 py-1.5 text-[13px]"
        onClick={() => window.print()}
      >
        Print / Save PDF
      </button>
    </div>
  );
}
