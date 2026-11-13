import Link from "next/link";
import { chapters, CHAPTER_COUNT, TRACK_TITLE } from "@/lib/curriculum";
import { SITE_TAGLINE } from "@/lib/site";
import { WorkspacePreview } from "@/components/WorkspacePreview";

const FEATURES = [
  {
    title: "Split-screen micro-lessons",
    body: "A theory and task pane beside a real code editor, with live waveform feedback. Bite-sized practice tasks, instant results.",
  },
  {
    title: "Unguided problem sets",
    body: `Each of the ${CHAPTER_COUNT} chapters ends with an unguided problem set: design the full RTL module and testbench yourself. A built-in hint ladder keeps you moving when stuck.`,
  },
  {
    title: "Automated evaluation",
    body: "Submissions run against hidden, multi-vector testbenches that check corner cases, timing, and syntax — with precise failure reports.",
  },
  {
    title: "Verified certificate",
    body: "Pass every chapter problem set and earn a signed, verifiable certificate — any employer can check it in one click.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-border-subtle">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
            <div className="max-w-xl">
              <p className="eyebrow">Open access · Browser-native</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
                {SITE_TAGLINE}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-fg-muted">
                A guided Verilog curriculum with instant, in-browser simulation
                feedback — no EDA installs, no license queues. Finish each
                chapter&apos;s problem set to earn a verified certificate of
                completion.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/learn" className="btn btn-primary">
                  Start learning
                </Link>
                <Link href="/about" className="btn btn-secondary">
                  How it works
                </Link>
              </div>
              <ul className="mt-6 flex flex-col gap-1.5 text-sm text-fg-muted">
                <li>• Split-screen lessons with live waveform feedback</li>
                <li>• Unguided problem sets with a built-in hint ladder</li>
                <li>• Verified, cryptographically signed certificate</li>
              </ul>
            </div>

            <div className="min-w-0 flex-1">
              <WorkspacePreview />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover flex flex-col p-5">
              <h3 className="text-sm font-semibold text-fg">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border-subtle">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow">The track</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {TRACK_TITLE} — {CHAPTER_COUNT} chapters
              </h2>
            </div>
            <Link
              href="/learn"
              className="whitespace-nowrap text-sm text-fg-muted transition-colors hover:text-fg"
            >
              View full curriculum →
            </Link>
          </div>
          <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/learn/${c.slug}`}
                  className="card card-hover flex h-full flex-col p-4"
                >
                  <span className="text-xs font-medium text-fg-subtle">
                    Chapter {String(c.number).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-fg">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                    {c.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border-subtle">
        <div className="mx-auto w-full max-w-6xl px-4 py-20">
          <div className="card mx-auto max-w-2xl p-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Start with Chapter 1
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
              {CHAPTER_COUNT} guided chapters, one problem set each, and a
              verified certificate when you clear the track. Free and open.
            </p>
            <Link
              href="/learn"
              className="btn btn-primary mt-6 px-6 py-2.5"
            >
              Go to the curriculum
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}