"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
} from "@/lib/progress";
import { ProgressBar } from "@/components/ProgressBar";

export type ClaimItem = { key: string; label: string };

type ClaimResult =
  | { state: "idle" }
  | { state: "working" }
  | { state: "done"; token: string; name: string }
  | { state: "error"; message: string };

/** Collects the 15 signed pset receipts and issues the certificate. */
export function CertificateClaim({ items }: { items: ClaimItem[] }) {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot,
  );
  const [name, setName] = useState("");
  const [result, setResult] = useState<ClaimResult>({ state: "idle" });
  const [copied, setCopied] = useState(false);

  const cleared = items.filter((i) => {
    const r = progress[i.key];
    return r && typeof r.receipt === "string" && r.receipt.length > 0;
  });
  const ready = cleared.length === items.length;

  async function claim() {
    setResult({ state: "working" });
    setCopied(false);
    const snap = getProgressSnapshot();
    const receipts: string[] = [];
    for (const i of items) {
      const r = snap[i.key];
      if (!r || typeof r.receipt !== "string" || r.receipt.length === 0) {
        setResult({
          state: "error",
          message: `Missing receipt for ${i.label}. Re-submit that problem set first.`,
        });
        return;
      }
      receipts.push(r.receipt);
    }
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), receipts }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setResult({
          state: "error",
          message: data.error ?? `Claim failed (${res.status}).`,
        });
        return;
      }
      setResult({ state: "done", token: data.token, name: name.trim() });
    } catch {
      setResult({ state: "error", message: "Could not reach the server." });
    }
  }

  return (
    <div className="card mt-3 p-5">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">
            {cleared.length} / {items.length} problem sets cleared
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            Each cleared problem set earns a signed receipt; all{" "}
            {items.length} unlock the certificate.
          </p>
        </div>
        <div className="w-36 shrink-0">
          <ProgressBar value={cleared.length / items.length} />
        </div>
      </div>

      {result.state === "done" ? (
        <div className="mt-4 rounded-md border border-border-strong bg-canvas-elevated p-4">
          <p className="text-sm font-semibold text-fg">
            Certificate issued for {result.name}
          </p>
          <p className="mt-2 break-all font-mono text-xs leading-relaxed text-fg-muted">
            {result.token}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary px-3 py-1.5 text-[13px]"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(result.token)
                  .then(() => setCopied(true))
                  .catch(() => setCopied(false));
              }}
            >
              {copied ? "Copied" : "Copy token"}
            </button>
            <Link
              href={`/verify/${encodeURIComponent(result.token)}`}
              className="btn btn-primary px-3 py-1.5 text-[13px]"
            >
              View certificate
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name for the certificate"
            className="input max-w-md"
            maxLength={60}
          />
          <button
            type="button"
            className="btn btn-primary shrink-0"
            disabled={!ready || name.trim().length < 3 || result.state === "working"}
            onClick={() => void claim()}
            title={
              ready
                ? "Issue the certificate"
                : "Clear all 15 problem sets first"
            }
          >
            {result.state === "working" ? "Issuing…" : "Claim certificate"}
          </button>
        </div>
      )}
      {result.state === "error" && (
        <p className="mt-3 text-[13px] text-red-400">{result.message}</p>
      )}
      {!ready && result.state !== "error" && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {items.map((i) => {
            const done = cleared.some((c) => c.key === i.key);
            return (
              <span
                key={i.key}
                className={`rounded border px-2 py-0.5 font-mono text-[11px] ${
                  done
                    ? "border-border-strong bg-canvas-elevated text-fg"
                    : "border-border-subtle bg-canvas text-fg-subtle"
                }`}
              >
                {done ? "✓ " : ""}
                {i.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

type VerifyResult =
  | { state: "idle" }
  | { state: "working" }
  | { state: "valid"; name: string; issuedAt: string; cleared: number; total: number }
  | { state: "invalid"; reason: string };

/** Token verification form backed by /api/certificate/verify. */
export function CertificateVerify() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<VerifyResult>({ state: "idle" });

  async function verify() {
    const t = token.trim();
    if (!t) return;
    setResult({ state: "working" });
    try {
      const res = await fetch(
        `/api/certificate/verify?token=${encodeURIComponent(t)}`,
      );
      const data = (await res.json()) as {
        valid?: boolean;
        reason?: string;
        payload?: {
          name?: string;
          issuedAt?: string;
          cleared?: number;
          totalPsets?: number;
        };
      };
      if (data.valid && data.payload) {
        setResult({
          state: "valid",
          name: String(data.payload.name ?? "—"),
          issuedAt: String(data.payload.issuedAt ?? "—"),
          cleared: Number(data.payload.cleared ?? 0),
          total: Number(data.payload.totalPsets ?? 0),
        });
      } else {
        setResult({
          state: "invalid",
          reason: String(data.reason ?? `invalid (${res.status})`),
        });
      }
    } catch {
      setResult({ state: "invalid", reason: "Could not reach the server." });
    }
  }

  return (
    <div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Certificate token"
          className="input max-w-md font-mono"
        />
        <button
          type="button"
          className="btn btn-secondary shrink-0"
          disabled={!token.trim() || result.state === "working"}
          onClick={() => void verify()}
        >
          {result.state === "working" ? "Verifying…" : "Verify"}
        </button>
      </div>
      {result.state === "valid" && (
        <p className="mt-3 text-[13px] text-fg">
          <span className="font-semibold text-emerald-400">✓ Valid</span> —{" "}
          {result.name}, issued {result.issuedAt.slice(0, 10)} ·{" "}
          {result.cleared}/{result.total} problem sets.
        </p>
      )}
      {result.state === "invalid" && (
        <p className="mt-3 text-[13px] text-red-400">
          Invalid certificate: {result.reason}
        </p>
      )}
    </div>
  );
}
