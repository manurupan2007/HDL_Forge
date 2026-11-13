import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter } from "@/lib/curriculum";
import { getGuide } from "@/lib/learn";
import {
  LiveProgressBar,
  LiveProgressLabel,
} from "@/components/LiveProgressBar";

type ChapterPageProps = { params: Promise<{ chapter: string }> };

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { chapter } = await params;
  const data = getChapter(chapter);
  return { title: data ? `Chapter ${data.number} · ${data.title}` : "Chapter" };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapter } = await params;
  const data = getChapter(chapter);
  if (!data) notFound();
  const guide = getGuide(chapter);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <nav className="text-sm text-fg-subtle">
        <Link
          href="/learn"
          className="transition-colors hover:text-fg"
        >
          Curriculum
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">Chapter {data.number}</span>
      </nav>

      <p className="mt-8 font-mono text-xs text-fg-subtle">
        Chapter {String(data.number).padStart(2, "0")}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        {data.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
        {data.summary}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="w-36">
          <LiveProgressBar
            keys={[
              ...data.lessons.map((l) => `${data.slug}:${l.slug}`),
              `${data.slug}:${data.pset.slug}`,
            ]}
          />
        </div>
        <LiveProgressLabel
          keys={[
            ...data.lessons.map((l) => `${data.slug}:${l.slug}`),
            `${data.slug}:${data.pset.slug}`,
          ]}
          suffix={`${data.duration}`}
        />
        <span className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
          {data.dialect === "systemverilog" ? "SystemVerilog" : "Verilog-2001"}
        </span>
      </div>

      {guide ? (
        <section className="mt-10">
          <h2 className="text-base font-semibold tracking-tight">
            Learning material
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
            Start here. About {guide.readMinutes} minutes of plain-English
            explanation with worked examples and paper exercises — nothing on
            this page is graded. Read it before the lessons.
          </p>
          <Link
            href={`/learn/${data.slug}/learn`}
            className="card card-hover mt-4 block p-5"
          >
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-medium text-fg">
                  Learn Chapter {guide.chapterNumber}: {guide.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {guide.mentalModel[0]?.body.slice(0, 190)}
                  {guide.mentalModel[0] && guide.mentalModel[0].body.length > 190
                    ? "…"
                    : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.topics.map((t) => (
                    <span
                      key={t.slug}
                      className="rounded border border-border-subtle bg-canvas px-2 py-0.5 text-[11px] text-fg-muted"
                    >
                      {t.title}
                    </span>
                  ))}
                </div>
              </div>
              <span className="btn btn-primary shrink-0 px-4 py-1.5 text-[13px]">
                Start reading
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Lessons</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
          Guided practice in the browser. Each one opens with a Learn tab and a
          Practice tab — read first, then code.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {data.lessons.map((lesson, i) => (
            <Link
              key={lesson.slug}
              href={`/learn/${data.slug}/lesson/${lesson.slug}`}
              className="card card-hover flex items-center gap-4 p-4"
            >
              <span className="w-6 shrink-0 text-center font-mono text-sm text-fg-subtle">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-fg">
                  {lesson.title}
                </h3>
                <p className="mt-0.5 text-[13px] text-fg-muted">
                  {lesson.objective}
                </p>
              </div>
              <span className="shrink-0 text-xs text-fg-subtle">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-base font-semibold tracking-tight">Problem set</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
          Unguided by design. Design the full module and
          testbench yourself, then submit for evaluation against the hidden
          testbench.
        </p>
        <Link
          href={`/learn/${data.slug}/pset/${data.pset.slug}`}
          className="card card-hover mt-4 block p-5"
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-medium text-fg">
                Problem Set {data.number} · {data.pset.title}
              </h3>
              <p className="mt-1 text-[13px] text-fg-muted">
                {data.pset.summary}
              </p>
            </div>
            <span className="btn btn-secondary shrink-0 px-4 py-1.5 text-[13px]">
              Start
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}