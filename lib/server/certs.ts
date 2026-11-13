/**
 * HMAC-signed receipts and certificate tokens. Server-only.
 *
 * A "receipt" proves that a pset passed all its hidden test vectors at a
 * given time. A "certificate token" proves that a named learner collected a
 * valid receipt for every one of the track's 15 psets. Signatures use HMAC-
 * SHA256 with a server secret; without the secret, receipts cannot be forged.
 */

import crypto from "node:crypto";

const DEV_SECRET = "hdlforge-dev-only-secret-change-me";

export function certSecret(): string {
  const secret = process.env.CERT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      // Intentionally permissive in local dev so the flow is testable.
      return DEV_SECRET;
    }
    throw new Error("CERT_SECRET environment variable is not set");
  }
  return secret;
}

export type PSetReceipt = {
  v: 1;
  chapterSlug: string;
  psetSlug: string;
  score: number;
  total: number;
  passedAll: boolean;
  submittedAt: string;
};

export type CertificatePayload = {
  v: 1;
  name: string;
  issuedAt: string;
  track: "hdlforge-v1";
  /** Count of chapter psets that were cleared. */
  cleared: number;
  totalPsets: number;
};

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function encode(parts: string[]): string {
  return parts.join(".");
}

function decode(token: string): string[] | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  return parts;
}

export function signReceipt(receipt: PSetReceipt): string {
  const secret = certSecret();
  const payload = Buffer.from(JSON.stringify(receipt)).toString("base64url");
  return encode([payload, sign(payload, secret)]);
}

export function verifyReceipt(token: string): PSetReceipt | null {
  try {
    const parts = decode(token);
    if (!parts) return null;
    const [payloadB64, sig] = parts;
    const secret = certSecret();
    const expected = sign(payloadB64, secret);
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const receipt = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as PSetReceipt;
    if (receipt.v !== 1) return null;
    return receipt;
  } catch {
    return null;
  }
}

export function issueCertificate(payload: CertificatePayload): string {
  const secret = certSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return encode([body, sign(body, secret)]);
}

export function verifyCertificate(
  token: string,
): { valid: true; payload: CertificatePayload } | { valid: false; reason: string } {
  try {
    const parts = decode(token);
    if (!parts) return { valid: false, reason: "malformed token" };
    const [payloadB64, sig] = parts;
    const secret = certSecret();
    const expected = sign(payloadB64, secret);
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, reason: "signature mismatch" };
    }
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as CertificatePayload;
    if (payload.v !== 1 || payload.track !== "hdlforge-v1") {
      return { valid: false, reason: "unsupported certificate version" };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "could not decode token" };
  }
}