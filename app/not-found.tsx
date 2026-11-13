import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid flex-1 place-items-center px-4 py-24">
      <div className="mx-auto text-center">
        <p className="font-mono text-5xl font-semibold text-fg-subtle">404</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          The page you are looking for does not exist.
        </p>
        <Link href="/" className="btn btn-primary mt-6 px-6 py-2.5">
          Back home
        </Link>
      </div>
    </div>
  );
}