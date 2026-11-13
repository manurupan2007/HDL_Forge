import { CHAPTER_COUNT, chapters } from "@/lib/curriculum";
import {
  CertificateClaim,
  CertificateVerify,
} from "@/components/CertificateClaim";

const POINTS = [
  {
    title: "Cryptographically verifiable",
    body: "Each certificate is signed and can be checked against the public verification ledger.",
  },
  {
    title: "Signed & checkable",
    body: "Every credential carries a tamper-proof signature anyone can verify in one click — built for CVs and portfolios.",
  },
  {
    title: "Earned, not bought",
    body: `Clear all ${CHAPTER_COUNT} chapter problem sets and the certificate unlocks. No shortcuts.`,
  },
];

export const metadata = {
  title: "Certificate",
};

export default function CertificatePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <p className="eyebrow">Certification</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        A verifiable record of the track
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
        Finish every chapter problem set and HDL Forge issues a signed,
        verifiable certificate of completion — a credential whose claims are
        auditable, not just asserted.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.title} className="card p-5">
            <h3 className="text-sm font-semibold text-fg">{p.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              {p.body}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Preview</h2>
        <div className="card mt-3 overflow-hidden">
          <div className="flex h-9 items-center justify-between border-b border-border-subtle bg-canvas px-4">
            <span className="text-[13px] font-medium">Certificate of Completion</span>
            <span className="text-xs text-fg-subtle">preview</span>
          </div>
          <div className="px-6 py-16 text-center">
            <p className="font-mono text-xs text-fg-subtle">HDL Forge</p>
            <p className="mt-6 text-2xl font-semibold tracking-tight">
              Certificate of Completion
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
              Awarded upon clearing all {CHAPTER_COUNT} chapter problem sets of
              the Verilog Digital Design track.
            </p>
            <p className="mx-auto mt-6 max-w-sm text-[13px] leading-relaxed text-fg-subtle">
              Clear every problem set below, enter the name for the
              certificate, and claim it — the signed token renders instantly.
            </p>
          </div>
          <div className="flex h-9 items-center justify-between border-t border-border-subtle bg-canvas px-4 font-mono text-[10px] text-fg-subtle">
            <span>signature · SHA-256</span>
            <span>issued by HDL Forge</span>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">
          Claim your certificate
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
          Signed in or not, your earned receipts live with your progress —
          sign in to keep them across devices.
        </p>
        <CertificateClaim
          items={chapters.map((c) => ({
            key: `${c.slug}:${c.pset.slug}`,
            label: `Ch ${c.number}`,
          }))}
        />
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">
          Verify a certificate
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
          Paste a certificate token to confirm it was genuinely issued by the
          platform.
        </p>
        <CertificateVerify />
      </section>
    </div>
  );
}