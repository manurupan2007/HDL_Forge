import Link from "next/link";
import { chapters, CHAPTER_COUNT, TRACK_TITLE } from "@/lib/curriculum";
import { getGuide } from "@/lib/learn";
import {
  LiveProgressBar,
  LiveProgressLabel,
} from "@/components/LiveProgressBar";

export const metadata = {
  title: "Learn",
};

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <p className="eyebrow">Curriculum</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        {TRACK_TITLE}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
        {CHAPTER_COUNT} chapters, each with a full beginner learning guide you
        can read before you write a line of code, then split-screen
        micro-lessons, and finally an unguided problem set graded against a
        hidden testbench. Clear all {CHAPTER_COUNT} to unlock the certificate.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {chapters.map((chapter) => {
          const total = chapter.lessons.length + 1;
          const guide = getGuide(chapter.slug);
          return (
            <div
              key={chapter.slug}
              className="card card-hover relative block p-5"
            >
              <Link
                href={`/learn/${chapter.slug}`}
                className="absolute inset-0 z-0"
                aria-label={`Open Chapter ${chapter.number}: ${chapter.title}`}
              />
              <div className="pointer-events-none relative z-10 flex items-start gap-4">
                <span className="w-8 shrink-0 pt-0.5 font-mono text-sm text-fg-subtle">
                  {String(chapter.number).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-[15px] font-semibold text-fg">
                      {chapter.title}
                    </h2>
                    <span className="text-xs text-fg-subtle">
                      {chapter.duration}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                    {chapter.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {chapter.lessons.map((lesson, i) => (
                      <span
                        key={lesson.slug}
                        className="rounded border border-border-subtle bg-canvas px-2 py-0.5 text-[11px] text-fg-muted"
                      >
                        {i + 1} · {lesson.title}
                      </span>
                    ))}
                    <span className="rounded border border-border-strong bg-canvas-elevated px-2 py-0.5 text-[11px] text-fg">
                      P-Set · {chapter.pset.title}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-32">
                      <LiveProgressBar
                        keys={[
                          ...chapter.lessons.map(
                            (l) => `${chapter.slug}:${l.slug}`,
                          ),
                          `${chapter.slug}:${chapter.pset.slug}`,
                        ]}
                      />
                    </div>
                    <LiveProgressLabel
                      keys={[
                        ...chapter.lessons.map(
                          (l) => `${chapter.slug}:${l.slug}`,
                        ),
                        `${chapter.slug}:${chapter.pset.slug}`,
                      ]}
                    />
                    <span className="ml-auto text-[11px] text-fg-subtle">
                      {total} steps
                    </span>
                  </div>
                </div>
              </div>
              {guide ? (
                <span className="pointer-events-none absolute top-4 right-4 z-10">
                  <span className="rounded border border-accent/50 bg-accent/10 px-2 py-0.5 text-[11px] text-accent-bright">
                    Learn · {guide.readMinutes} min
                  </span>
                </span>
              ) : null}
              {guide ? (
                <Link
                  href={`/learn/${chapter.slug}/learn`}
                  className="relative z-20 mt-3 inline-block text-[12px] text-accent-bright underline underline-offset-2 transition-colors hover:text-fg"
                >
                  Read the learning material →
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}