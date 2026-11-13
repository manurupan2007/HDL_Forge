"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { clearOutbox } from "@/lib/progress";

const STORAGE_KEY = "hdlforge:progress:v1";

/**
 * Account self-deletion for the signed-in user (GDPR/FERPA). Two-step
 * inline confirm, then the server cascades the account's rows; local
 * progress is wiped as part of the flow.
 */
export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 409) {
        setError(
          "For security, sign out and sign in again, then confirm the deletion.",
        );
        setBusy(false);
        setConfirming(false);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? `Deletion failed (${res.status}).`);
        setBusy(false);
        setConfirming(false);
        return;
      }
      // Account is gone: drop local progress and the parked-write outbox,
      // clear the now-invalid session cookie, and land back on sign-in.
      try {
        localStorage.removeItem(STORAGE_KEY);
        clearOutbox();
      } catch {
        /* storage unavailable — nothing to clear */
      }
      await authClient.signOut();
      router.push("/signin?deleted=1");
    } catch {
      setError("Could not reach the server. Try again.");
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {confirming ? (
          <>
            <button
              type="button"
              className="btn bg-danger px-3 py-1.5 text-[13px] text-white hover:opacity-90 disabled:opacity-50"
              disabled={busy}
              onClick={() => void deleteAccount()}
            >
              {busy ? "Deleting…" : "Yes, delete everything"}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-3 py-1.5 text-[13px]"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn border border-danger px-3 py-1.5 text-[13px] text-danger hover:bg-canvas-inset"
            onClick={() => setConfirming(true)}
          >
            Delete account…
          </button>
        )}
      </div>
      {confirming && !busy && (
        <p className="mt-3 text-[13px] leading-relaxed text-warning">
          This permanently deletes your account, sign-ins, and all progress —
          including earned receipts and any claimed certificate. It cannot be
          undone.
        </p>
      )}
      {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}
    </div>
  );
}
