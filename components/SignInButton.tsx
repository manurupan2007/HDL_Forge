"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setError(null);
    setBusy(true);
    try {
      await authClient.signIn.social(
        { provider: "google", callbackURL: "/learn" },
        {
          onError: (ctx) => {
            setError(
              ctx.error.message ??
                "Sign-in failed. The deployment may be missing its Google OAuth credentials.",
            );
            setBusy(false);
          },
        },
      );
      // On success the browser redirects to Google; if we are still here
      // with no error, reset the button.
      setBusy(false);
    } catch {
      setError(
        "Could not reach the sign-in service. Check your connection and try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary w-full"
        disabled={busy}
        onClick={() => void signIn()}
      >
        {busy ? "Redirecting…" : "Continue with Google"}
      </button>
      {error && (
        <p className="mt-3 text-[13px] leading-relaxed text-red-400">{error}</p>
      )}
    </div>
  );
}
