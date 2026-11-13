import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter } from "@/lib/curriculum";
import { getGuide } from "@/lib/learn";
import { LearnTopicSection } from "@/components/learning/LearnBlocks";

type LearnPageProps = { params: Promise<{ chapter: string }> };

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const { chapter } = await params;
  const guide = getGuide(chapter);
  const data = getChapter(chapter);
  return {
    title: guide
      ? `Learn · Chapter ${guide.chapterNumber} · ${guide.title}`
      : data
        ? `Learn · ${data.title}`
        : "Learn",
  };
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { chapter } = await params;
  const guide = getGuide(chapter);
  const data = getChapter(chapter);
  if (!guide || !data) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
        <article className="min-w-0">
          <nav className="text-sm text-fg-subtle">
            <Link href="/learn" className="transition-colors hover:text-fg">
              Curriculum
            </Link>
            <span className="mx-1.5">/</span>
            <Link
              href={`/learn/${data.slug}`}
              className="transition-colors hover:text-fg"
            >
              Chapter {data.number}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-fg-muted">Learn</span>
          </nav>

          <p className="mt-8 font-mono text-xs text-fg-subtle">
            Chapter {String(guide.chapterNumber).padStart(2, "0")} · Learning
            material
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {guide.title}
          </h1>
          <p className="mt-3 text-sm text-fg-subtle">
            About {guide.readMinutes} minutes to read. Nothing on this page is
            graded — read it, work the exercises on paper, then go to the
            practice.
          </p>

          <section className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-5">
            <h2 className="text-sm font-semibold text-fg">
              By the end of this chapter you can
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {guide.youWillBeAbleTo.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-[14px] leading-relaxed text-fg-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {guide.mentalModel.length > 0 ? (
            <section className="mt-6 flex flex-col gap-3">
              {guide.mentalModel.map((card) => (
                <div
                  key={card.title}
                  className="rounded-lg border border-border-subtle bg-canvas-subtle p-5"
                >
                  <h2 className="text-sm font-semibold text-fg">{card.title}</h2>
                  <p className="mt-2 text-[15px] leading-[1.75] text-fg-muted">
                    {card.body}
                  </p>
                </div>
              ))}
            </section>
          ) : null}

          <div className="mt-12 flex flex-col gap-10">
            {guide.topics.map((topic) => (
              <LearnTopicSection
                key={topic.slug}
                guide={guide}
                topic={topic}
              />
            ))}
          </div>

          {guide.glossary.length > 0 ? (
            <section className="mt-12 border-t border-border-subtle pt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">
                Words used in this chapter
              </h2>
              <dl className="mt-5 flex flex-col gap-3">
                {guide.glossary.map((item) => (
                  <div
                    key={item.term}
                    className="flex flex-col gap-1 sm:flex-row sm:gap-4"
                  >
                    <dt className="shrink-0 font-mono text-[13px] text-accent-bright sm:w-52">
                      {item.term}
                    </dt>
                    <dd className="text-[14px] leading-[1.7] text-fg-muted">
                      {item.meaning}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="mt-12 rounded-lg border border-border-subtle bg-canvas-subtle p-5">
            <h2 className="text-sm font-semibold text-fg">What to do next</h2>
            <p className="mt-2 text-[14px] leading-[1.75] text-fg-muted">
              {guide.nextStep}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {data.lessons.map((lesson, i) => (
                <Link
                  key={lesson.slug}
                  href={`/learn/${data.slug}/lesson/${lesson.slug}`}
                  className="btn btn-secondary px-4 py-1.5 text-[13px]"
                >
                  {i + 1}. {lesson.title}
                </Link>
              ))}
              <Link
                href={`/learn/${data.slug}`}
                className="btn btn-secondary px-4 py-1.5 text-[13px]"
              >
                Back to chapter
              </Link>
            </div>
          </section>
        </article>

        <aside className="hidden lg:block">
          <nav className="sticky top-20 flex flex-col gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
              In this chapter
            </p>
            {guide.topics.map((topic, i) => (
              <a
                key={topic.slug}
                href={`#topic-${guide.chapterSlug}-${topic.slug}`}
                className="text-[13px] leading-snug text-fg-muted transition-colors hover:text-accent-bright"
              >
                <span className="mr-1.5 font-mono text-[11px] text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {topic.title}
              </a>
            ))}
            <a
              href="#glossary"
              className="mt-2 border-t border-border-subtle pt-2.5 text-[13px] text-fg-muted transition-colors hover:text-accent-bright"
            >
              Words used in this chapter
            </a>
          </nav>
        </aside>
      </div>
    </div>
  );
}
