import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of use for HDL Forge, including what the certificate does and does not attest.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "The service",
    body: [
      "HDL Forge is a free, open-access web platform for learning Verilog hardware description: guided chapters, in-browser simulation, automatically graded problem sets, and a verifiable certificate of completion. The service is provided as-is, without warranty of any kind — the curriculum is a study aid, not a substitute for formal instruction.",
    ],
  },
  {
    title: "What the certificate means",
    body: [
      "The certificate of completion is evidence-of-coursework: a signed record that a learner cleared every chapter problem set's autograder on this platform at a stated time. It attests to performance on this track's automated exercises — nothing else.",
      "It is NOT an accredited academic credential. It is not a degree, not a professional licensure, not a substitute for a university course, and it confers no academic credit at any institution. HDL Forge is not accredited by any educational authority.",
      "Employers reading a certificate should treat it as a credible, verifiable signal of self-driven coursework — the same way the certificates of well-known open courseware are read. Its signature can be checked publicly against the verification page, so its claims are auditable.",
      "We may revoke a certificate if it was obtained through abuse of the autograder (see below).",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "You may use the platform freely for learning, teaching, and portfolio purposes. You may not attempt to abuse the grading or simulation endpoints: no automated bulk requests, no scraping the curriculum for republication, no attempts to forge receipts or certificate tokens, and no use of the service to run workloads unrelated to learning Verilog.",
      "We apply per-IP rate limits to unauthenticated compute endpoints and may block clients that circumvent them.",
    ],
  },
  {
    title: "Your work",
    body: [
      "Verilog source you write on the platform remains yours. We store submitted sources only for the duration of a grading run and your own iteration; we do not claim ownership of student designs. The curriculum, code, and design of the platform itself are the property of HDL Forge's maintainers.",
    ],
  },
  {
    title: "Liability",
    body: [
      "To the maximum extent permitted by law, HDL Forge's maintainers are not liable for any damages arising from use of the service, including decisions made on the basis of a certificate. If a feature breaks, we fix it; that is the deal.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Terms of use
      </h1>
      <p className="mt-3 text-[13px] text-fg-subtle">
        Last updated: October 2026 · Applies to hdlforge.dev
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
            <div className="mt-2 flex flex-col gap-3">
              {s.body.map((p, i) => (
                <p
                  key={i}
                  className="max-w-2xl text-sm leading-relaxed text-fg-muted"
                >
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
