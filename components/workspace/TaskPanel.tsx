"use client";

import { useState } from "react";
import type { Chapter, Lesson, PSet } from "@/lib/curriculum";
import type { ChapterLearn, LearnTopic } from "@/lib/learn";
import { topicForLesson } from "@/lib/learn";
import { LearnBlocks } from "@/components/learning/LearnBlocks";
import { HintPanel } from "./HintPanel";
import { PaneHeader } from "./PaneHeader";

const DIALECT_LABEL = {
  "verilog-2001": "Verilog-2001",
  systemverilog: "SystemVerilog",
} as const;

type TaskPanelProps = {
  mode: "lesson" | "pset";
  chapter: Chapter;
  item: Lesson | PSet;
  /** Beginner teaching material for this chapter. Absent falls back to Practice. */
  guide?: ChapterLearn;
  /** Which topic to open first, when the guide is present. */
  initialTopicSlug?: string;
  /** Progress-store key ("chapterSlug:psetSlug") — drives the hint ladder. */
  itemKey?: string;
  /** Failed submissions for this problem set (0 while unattempted/passed). */
  failCount?: number;
};

type Tab = "learn" | "practice";

function LearnTab({
  guide,
  chapter,
  lesson,
}: {
  guide: ChapterLearn;
  chapter: Chapter;
  lesson: Lesson;
}) {
  const [open, setOpen] = useState<string>(
    topicForLesson(chapter.slug, lesson.slug) ?? guide.topics[0]?.slug,
  );
  const topic: LearnTopic | undefined =
    guide.topics.find((t) => t.slug === open) ?? guide.topics[0];

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-accent/30 bg-accent/5 p-3">
        <h3 className="text-[13px] font-semibold text-fg">
          You do not need to know this yet
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
          Read this first. It explains the idea in plain words, with the maths
          you can work out on paper. The Practice tab is only worth doing once
          this one makes sense.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-fg">
          What you&apos;ll be able to do
        </h3>
        <ul className="mt-2 flex flex-col gap-1.5">
          {guide.youWillBeAbleTo.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-[13px] leading-relaxed text-fg-muted">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {guide.mentalModel.map((card) => (
        <section
          key={card.title}
          className="rounded-md border border-border-subtle bg-canvas-subtle p-3"
        >
          <h3 className="text-[13px] font-semibold text-fg">{card.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
            {card.body}
          </p>
        </section>
      ))}

      <section>
        <h3 className="text-sm font-semibold text-fg">Topics</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {guide.topics.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setOpen(t.slug)}
              className={`rounded border px-2 py-1 text-[12px] transition-colors ${
                t.slug === topic?.slug
                  ? "border-accent bg-accent/15 text-fg"
                  : "border-border-subtle bg-canvas text-fg-muted hover:border-border-strong hover:text-fg"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </section>

      {topic ? (
        <section className="border-t border-border-subtle pt-4">
          <h3 className="text-sm font-semibold text-fg">{topic.title}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-subtle">
            {topic.lede}
          </p>
          <div className="mt-3">
            <LearnBlocks blocks={topic.blocks} />
          </div>
        </section>
      ) : null}

      <section className="rounded-md border border-border-subtle bg-canvas-subtle p-3">
        <h3 className="text-[13px] font-semibold text-fg">
          Words used in this chapter
        </h3>
        <dl className="mt-2 flex flex-col gap-2">
          {guide.glossary.map((item) => (
            <div key={item.term} className="flex flex-col gap-0.5">
              <dt className="font-mono text-[12px] text-accent-bright">
                {item.term}
              </dt>
              <dd className="text-[13px] leading-relaxed text-fg-muted">
                {item.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <a
        href={`/learn/${chapter.slug}/learn`}
        className="btn btn-secondary w-full px-4 py-2 text-[13px]"
      >
        Read the full chapter, side by side →
      </a>
    </div>
  );
}

function PracticeTab({
  chapter,
  lesson,
}: {
  chapter: Chapter;
  lesson: Lesson;
}) {
  return (
    <>
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-fg">
          Recap of the idea
        </h3>
        <p className="text-[13px] leading-relaxed text-fg">
          {lesson.theory.intro}
        </p>
        <p className="text-[13px] leading-relaxed text-fg-muted">
          {lesson.theory.how}
        </p>
        {lesson.theory.example ? (
          <div className="mt-1">
            <pre className="overflow-x-auto rounded-md border border-border-subtle bg-canvas-inset p-3 font-mono text-xs leading-relaxed text-fg">
              <code>{lesson.theory.example.code}</code>
            </pre>
            {lesson.theory.example.note ? (
              <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                {lesson.theory.example.note}
              </p>
            ) : null}
          </div>
        ) : null}
        {lesson.theory.watch && lesson.theory.watch.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1.5 pl-1">
            {lesson.theory.watch.map((watch, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] leading-relaxed text-fg-subtle"
              >
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="inline-block align-top">{watch}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-5 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-fg">Objective</h3>
        <p className="text-[13px] leading-relaxed text-fg-muted">
          {lesson.objective}
        </p>
      </section>

      <section className="mt-5 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-fg">Practice</h3>
        <ul className="flex flex-col gap-2">
          {lesson.practice.map((stepTask, i) => (
            <li
              key={i}
              className="rounded-md border border-border-subtle bg-canvas-subtle px-3 py-2 text-[13px] leading-relaxed text-fg-subtle"
            >
              <input
                type="checkbox"
                className="mr-2 mt-[3px] h-3.5 w-3.5 shrink-0 translate-y-0 accent-accent"
                onChange={() => undefined}
                readOnly
              />
              <span className="inline-block align-top">{stepTask}</span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] leading-relaxed text-fg-muted">
          Tick these off in your head (or in the editor) before the task — they
          are the priming exercises for the graded problem set.
        </p>
      </section>

      <section className="mt-5 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-fg">Your task</h3>
        <p className="text-[13px] leading-relaxed text-fg">{lesson.task}</p>
        <p className="text-[13px] leading-relaxed text-fg-muted">
          Implement the design in{" "}
          <code className="font-mono text-[12px] text-accent-bright">top.sv</code>{" "}
          in {DIALECT_LABEL[chapter.dialect]}. The compiler checks your code
          against Verilator right in the browser as you work.
        </p>
      </section>
    </>
  );
}

export function TaskPanel({
  mode,
  chapter,
  item,
  guide,
  itemKey,
  failCount = 0,
}: TaskPanelProps) {
  const [tab, setTab] = useState<Tab>(guide ? "learn" : "practice");
  const step = chapter.lessons.findIndex((l) => l.slug === item.slug) + 1;

  if (mode === "pset") {
    return (
      <div className="flex h-full min-w-0 flex-col">
        <PaneHeader
          title={`Problem Set · ${item.title}`}
          meta={`Chapter ${chapter.number}`}
        />
        <div className="pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
          {guide ? (
            <section className="mb-5 rounded-md border border-border-subtle bg-canvas-subtle p-3">
              <h3 className="text-[13px] font-semibold text-fg">
                Before you start
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                This problem set is unguided. If anything here is unfamiliar,
                read the chapter&apos;s learning material first — it walks
                through every block you need, in plain words.
              </p>
              <a
                href={`/learn/${chapter.slug}/learn`}
                className="btn btn-secondary mt-3 w-full px-4 py-2 text-[13px]"
              >
                Read chapter {chapter.number}: {guide.title} →
              </a>
            </section>
          ) : null}
          <section className="flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-fg">Problem statement</h3>
            <p className="text-[13px] leading-relaxed text-fg-muted">
              {(item as PSet).summary} This is an unguided problem set —
              no step-by-step guidance; you design and verify everything
              yourself before submitting.
            </p>
          </section>
          <section className="mt-5 flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-fg">Deliverables</h3>
            <ul className="flex flex-col gap-1.5 text-[13px] text-fg-muted">
              <li className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-accent-bright">top.sv</span>
                <span>— the RTL module</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-accent-bright">top_tb.sv</span>
                <span>— a self-checking testbench (optional; grading always uses the hidden one)</span>
              </li>
            </ul>
          </section>
          <div className="card mt-5 p-3">
            <p className="text-xs font-medium text-fg-muted">Evaluation</p>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              Submissions are graded against a hidden, multi-vector testbench.
              Failures report the exact signal and vector that diverged from the
              reference design.
            </p>
          </div>
          {itemKey && (
            <HintPanel
              chapterSlug={chapter.slug}
              psetSlug={item.slug}
              failCount={failCount}
            />
          )}
          <p className="mt-4 text-[12px] leading-relaxed text-fg-subtle">
            Unfamiliar term? Every concept used in this track is defined in{" "}
            <a
              href="/glossary"
              target="_blank"
              rel="noreferrer"
              className="underline transition-colors hover:text-fg"
            >
              the glossary
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const lesson = item as Lesson;

  return (
    <div className="flex h-full min-w-0 flex-col">
      <PaneHeader
        title={lesson.title}
        meta={`Chapter ${chapter.number} · Step ${step} of ${chapter.lessons.length + 1}`}
      />
      {guide ? (
        <div
          role="tablist"
          aria-label="Learn or practise"
          className="flex shrink-0 border-b border-border-subtle"
        >
          {(["learn", "practice"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 text-[13px] font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-accent text-fg"
                  : "border-b-2 border-transparent text-fg-subtle hover:text-fg"
              }`}
            >
              {t === "learn" ? "Learn" : "Practice"}
            </button>
          ))}
        </div>
      ) : null}
      <div className="pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "learn" && guide ? (
          <LearnTab guide={guide} chapter={chapter} lesson={lesson} />
        ) : (
          <PracticeTab chapter={chapter} lesson={lesson} />
        )}
      </div>
    </div>
  );
}
