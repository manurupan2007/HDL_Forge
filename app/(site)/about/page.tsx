import Link from "next/link";
import { CHAPTER_COUNT, TRACK_TITLE, chapters } from "@/lib/curriculum";
import { FEEDBACK_URL, SITE_NAME } from "@/lib/site";

const LESSON_COUNT = chapters.reduce((n, c) => n + c.lessons.length, 0);

const COMPARISON = [
  {
    platform: "HDLBits",
    limitation:
      "Excellent problem bank for gates, but no guided theory, lesson context, or completion certification.",
    advantage: "Adds structured curriculum and certification.",
  },
  {
    platform: "EDA Playground",
    limitation:
      "Powerful blank-slate sandbox; no step-by-step track, autograding, or progression.",
    advantage: "Adds guided micro-tracks and automated grading.",
  },
  {
    platform: "NPTEL / Coursera",
    limitation:
      "Mostly passive video; no in-browser coding or instant waveform feedback.",
    advantage: "Builds active, learn-by-doing practice.",
  },
  {
    platform: "FreeCodeCamp",
    limitation:
      "Split-screen lessons are effective but target software, not RTL design.",
    advantage: "Retargets the model to Verilog.",
  },
  {
    platform: "CS50x",
    limitation:
      "Rigorous problem sets and certification, built around C and the web.",
    advantage: "Retains the evaluation model for Verilog.",
  },
];

const STACK = [
  { layer: "Frontend", tech: "React / Next.js + Tailwind CSS" },
  { layer: "Code editor", tech: "Monaco Editor (VS Code core)" },
  { layer: "Simulation core", tech: "Verilator compiled to WebAssembly" },
  { layer: "Visualization & grading", tech: "WaveDrom SVG + JS autograder" },
];

const PIPELINE = [
  "Monaco Editor",
  "Verilator WASM",
  "VCD Generator",
  "WaveDrom SVG",
];

const FAQ = [
  {
    q: "Who is this for, and what do I need to know first?",
    a: "Anyone learning digital logic or RTL design — students, hobbyists, or engineers from software. No prior Verilog is assumed; comfort with boolean logic (gates, truth tables) helps but Chapter 1 builds from zero.",
  },
  {
    q: "What do I need to install?",
    a: "Nothing. The editor, simulator, and waveform viewer all run in your browser. A modern desktop browser is enough.",
  },
  {
    q: "How long does the track take?",
    a: `Early chapters are a focused hour or two; the later ones (FSMs, UART, the CPU core) honestly run four to seven hours each. A steady few weeks of evenings completes the full ${CHAPTER_COUNT}-chapter track. Your progress is saved as you go.`,
  },
  {
    q: "Does it cost anything?",
    a: "No. Every chapter, problem set, and the certificate are free and open-access. No paywalls, no ads, no account required to learn.",
  },
  {
    q: "What exactly does the certificate attest?",
    a: `That you cleared every chapter's automatically graded problem set on ${SITE_NAME} at a verifiable time. It is evidence-of-coursework — deliberately not an accredited academic credential. See the terms page for how employers should read it.`,
  },
  {
    q: "Do I need an account?",
    a: "No — learning, simulation, and grading work anonymously with progress stored in your own browser. An account (Google sign-in) only syncs that progress across devices and backs your certificate receipts. You can delete your account and data yourself at any time.",
  },
  {
    q: "What if I get stuck on a problem set?",
    a: "Every problem set ships a built-in hint ladder: three progressively deeper hints you reveal yourself — the first unpacks the spec, the second sketches the design, the third names the exact trap. After a couple of failed submissions the first hint surfaces on its own, alongside a checklist of common pitfalls for that specific problem. Nothing is time-gated; nothing hands you the answer either.",
  },
];

const BUG_NOTICE = {
  withFeedback:
    "Use the Feedback link in the footer — it opens the project's public issue tracker. Wrong grading is treated as a bug: every lesson and problem set has a verified reference solution.",
  withoutFeedback:
    "Wrong grading is treated as a bug with top priority: every lesson and problem set has a verified reference solution, and the verification scripts that prove it are part of the repository.",
};

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <p className="eyebrow">Why {SITE_NAME}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Verilog should be learned hands-on
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
        Mastering Verilog should not start with multi-gigabyte EDA
        installations and license queues. {SITE_NAME} is an open-access,
        browser-native Verilog track that merges FreeCodeCamp&apos;s split-screen
        micro-lessons with CS50&apos;s evaluation rigor — {TRACK_TITLE} in{" "}
        {CHAPTER_COUNT} chapters, ending in a verified certificate.
      </p>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">
          How the platform differs
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {COMPARISON.map((row) => (
            <div key={row.platform} className="card grid grid-cols-1 gap-2 p-4 sm:grid-cols-[1fr_1.4fr_1fr]">
              <p className="text-sm font-medium text-fg">{row.platform}</p>
              <p className="text-[13px] leading-relaxed text-fg-muted">
                {row.limitation}
              </p>
              <p className="text-[13px] leading-relaxed text-fg-subtle">
                {row.advantage}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Architecture</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
          A client-heavy, serverless design. The full simulation pipeline runs
          in the browser.
        </p>
        <div className="card mt-3 p-4">
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-fg-muted">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span>{step}</span>
                {i < PIPELINE.length - 1 && (
                  <span className="text-border-strong">→</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Technology</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STACK.map((s) => (
            <div key={s.layer} className="card p-4">
              <p className="text-xs font-medium text-fg-subtle">{s.layer}</p>
              <p className="mt-1.5 font-mono text-[13px] text-fg">{s.tech}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Status</h2>
        <div className="card mt-3 bg-canvas p-5">
          <p className="text-[13px] leading-relaxed text-fg-muted">
            The full track is live: {CHAPTER_COUNT} chapters ({LESSON_COUNT}{" "}
            guided lessons + {CHAPTER_COUNT} problem sets), every lesson
            verified against its hidden bench, the autograder running on all{" "}
            {CHAPTER_COUNT} problem sets, and signed certificates with public
            verification. Sign-in is optional — the curriculum, simulation,
            and grading all work anonymously.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">FAQ</h2>
        <div className="mt-3 flex flex-col gap-2">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="card group px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:hidden">
                <span className="mr-2 inline-block text-fg-subtle transition-transform group-open:rotate-90">
                  ▸
                </span>
                {f.q}
              </summary>
              <p className="mt-2 pl-5 text-[13px] leading-relaxed text-fg-muted">
                {f.a}
              </p>
            </details>
          ))}
          <div className="card px-4 py-3">
            <p className="text-sm font-medium text-fg">
              <span className="mr-2 inline-block text-fg-subtle">▸</span>
              Where can I report a bug or a wrong lesson?
            </p>
            <p className="mt-2 pl-5 text-[13px] leading-relaxed text-fg-muted">
              {FEEDBACK_URL ? BUG_NOTICE.withFeedback : BUG_NOTICE.withoutFeedback}
            </p>
          </div>
        </div>
      </section>

      <section id="licenses" className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">
          Licenses &amp; notices
        </h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-fg-muted">
          The platform&apos;s code is MIT-licensed and the curriculum text is
          Creative Commons BY-NC-SA — see the{" "}
          <Link href="/licenses" className="underline">
            licenses page
          </Link>{" "}
          for the full third-party notices (Verilator, Icarus Verilog, Monaco,
          fonts).
        </p>
      </section>
    </div>
  );
}