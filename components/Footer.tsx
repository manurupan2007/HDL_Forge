import Link from "next/link";
import { FEEDBACK_URL, NAV_LINKS, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle print:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-semibold tracking-tight">{SITE_NAME}</p>
          <p className="text-[13px] text-fg-subtle">
            Learn Verilog in the browser. Practice with instant feedback. Prove
            it with a certificate.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/privacy"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            Terms
          </Link>
          <Link
            href="/licenses"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            Licenses
          </Link>
          <Link
            href="/glossary"
            className="text-fg-muted transition-colors hover:text-fg"
          >
            Glossary
          </Link>
          {FEEDBACK_URL && (
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-muted transition-colors hover:text-fg"
            >
              Feedback <span aria-hidden>#</span>
            </a>
          )}
          <span className="text-fg-subtle">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
