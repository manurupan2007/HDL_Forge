import Link from "next/link";
import { NAV_LINKS, SITE_NAME } from "@/lib/site";
import { AuthMenu } from "@/components/AuthMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-canvas/85 backdrop-blur print:hidden">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 items-center rounded border border-border-strong px-1.5 font-mono text-[11px] font-semibold tracking-tight text-accent-bright">
            hdl
          </span>
          <span className="text-sm font-semibold tracking-tight text-fg">
            {SITE_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-canvas-elevated hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <AuthMenu />
      </nav>
    </header>
  );
}