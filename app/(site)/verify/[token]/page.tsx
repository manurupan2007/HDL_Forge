import type { Metadata } from "next";
import Link from "next/link";
import { TRACK_TITLE } from "@/lib/curriculum";
import { SITE_NAME } from "@/lib/site";
import { verifyCertificate } from "@/lib/server/certs";
import { CertificateShareBar } from "@/components/CertificateShareBar";

type VerifyPageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({
  params,
}: VerifyPageProps): Promise<Metadata> {
  const { token } = await params;
  return { title: token ? `Verify · ${token.slice(0, 12)}…` : "Verify" };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params;
  const raw = decodeURIComponent(token);
  const result = verifyCertificate(raw);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="eyebrow print:hidden">Verify</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight print:hidden">
        Certificate lookup
      </h1>

      {result.valid ? (
        <>
          {/* Action bar (screen only) */}
          <div className="mt-4 print:hidden">
            <CertificateShareBar token={raw} />
          </div>

          {/* The certificate document — this is what prints on A4 */}
          <article className="certificate-sheet mt-6">
            <div className="cert-inner">
              <p className="cert-brand">{SITE_NAME}</p>
              <h2 className="cert-title">Certificate of Completion</h2>
              <p className="cert-certifies">This certifies that</p>
              <p className="cert-name">{result.payload.name}</p>
              <p className="cert-certifies">has completed</p>
              <p className="cert-track">
                {TRACK_TITLE}
                <span className="cert-track-sub">
                  {" "}
                  — all {result.payload.cleared} of {result.payload.totalPsets}{" "}
                  chapter problem sets cleared
                </span>
              </p>
              <p className="cert-issued">
                Issued{" "}
                {new Date(result.payload.issuedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="cert-signatures">
                <div className="cert-signature">
                  <svg
                    viewBox="0 0 220 60"
                    className="cert-signature-squiggle"
                    aria-hidden
                  >
                    <path
                      d="M12 44 C 34 8, 52 10, 56 30 C 60 50, 74 46, 86 26 C 96 10, 108 14, 110 28 C 112 44, 128 42, 140 26 C 152 10, 168 16, 172 30 C 176 44, 196 40, 208 22"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="cert-signature-line" />
                  <p className="cert-signature-role">
                    Maintainer, {SITE_NAME}
                  </p>
                </div>
                <div className="cert-signature">
                  <div className="cert-seal">✓ Verified</div>
                  <p className="cert-signature-role">Signature verified</p>
                </div>
              </div>

              <p className="cert-footer">
                Verify this credential at hdlforge.dev/verify — the signed
                token below is tamper-proof (HMAC-SHA256).
              </p>
              <p className="cert-token">{raw}</p>
            </div>
          </article>

          <p className="mt-6 text-xs leading-relaxed text-fg-subtle print:hidden">
            This certificate is evidence-of-coursework on the {SITE_NAME}{" "}
            platform — it is not an accredited academic credential. See{" "}
            <Link href="/terms" className="underline">
              the terms
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <div className="card mt-6 print:hidden p-5">
            <p className="text-xs font-medium text-fg-muted">Token</p>
            <p className="mt-1.5 break-all font-mono text-sm text-fg">{raw}</p>
          </div>

          <div className="card mt-3 bg-canvas p-5 print:hidden">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <p className="text-sm font-medium text-fg-muted">
                Not a valid certificate
              </p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              {result.reason}. Check the token for typos, or{" "}
              <Link href="/certificate" className="underline">
                claim a new one
              </Link>
              .
            </p>
          </div>
        </>
      )}
    </div>
  );
}
