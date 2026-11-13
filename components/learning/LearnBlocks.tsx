import type { LearnBlock, LearnTopic, ChapterLearn } from "@/lib/learn";

function Code({
  code,
  caption,
  note,
}: {
  code: string;
  caption?: string;
  note?: string;
}) {
  return (
    <figure className="my-4 flex flex-col gap-2">
      {caption ? (
        <figcaption className="text-[13px] font-medium text-fg">
          {caption}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-canvas-inset p-4 font-mono text-[12.5px] leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
      {note ? (
        <figcaption className="text-[13px] leading-relaxed text-fg-muted">
          {note}
        </figcaption>
      ) : null}
    </figure>
  );
}

const CALLOUT_STYLE: Record<string, { box: string; label: string }> = {
  tip: { box: "border-success/40 bg-success/5", label: "text-success" },
  note: { box: "border-accent/40 bg-accent/5", label: "text-accent-bright" },
  warn: { box: "border-warning/40 bg-warning/5", label: "text-warning" },
  why: { box: "border-border-strong bg-canvas-subtle", label: "text-fg" },
};

const CALLOUT_LABEL: Record<string, string> = {
  tip: "Tip",
  note: "Note",
  warn: "Careful",
  why: "Why this matters",
};

function renderBlock(block: LearnBlock, key: number) {
  switch (block.kind) {
    case "para":
      return (
        <p key={key} className="text-[15px] leading-[1.75] text-fg">
          {block.text}
        </p>
      );

    case "analogy":
      return (
        <blockquote
          key={key}
          className="my-4 rounded-r-md border-l-2 border-accent bg-accent/5 py-3 pl-4 pr-3 text-[15px] leading-[1.75] text-fg-muted"
        >
          {block.text}
        </blockquote>
      );

    case "doThis":
      return (
        <section
          key={key}
          className="my-4 rounded-lg border border-border-subtle bg-canvas-subtle p-4"
        >
          <h4 className="text-[13px] font-semibold tracking-wide text-fg">
            {block.title}
          </h4>
          <ol className="mt-3 flex flex-col gap-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-[11px] text-fg-subtle">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-[1.7] text-fg-muted">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </section>
      );

    case "points":
      return (
        <div key={key} className="my-4">
          {block.title ? (
            <h4 className="mb-2 text-[13px] font-semibold tracking-wide text-fg">
              {block.title}
            </h4>
          ) : null}
          <ul className="flex flex-col gap-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="text-[14px] leading-[1.7] text-fg-muted">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "define":
      return (
        <dl
          key={key}
          className="my-4 flex flex-col gap-2.5 rounded-lg border border-border-subtle bg-canvas-subtle p-4"
        >
          {block.items.map((item) => (
            <div key={item.term} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-[13px] text-accent-bright sm:w-44">
                {item.term}
              </dt>
              <dd className="text-[14px] leading-[1.7] text-fg-muted">
                {item.meaning}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "code":
      return <Code key={key} code={block.code} caption={block.caption} note={block.note} />;

    case "table":
      return (
        <figure key={key} className="my-5">
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="bg-canvas-inset">
                  {block.head.map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap border-b border-border-subtle px-3 py-2.5 font-semibold text-fg"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 ? "bg-canvas-subtle/40" : undefined}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`border-b border-border-subtle px-3 py-2.5 align-top leading-relaxed ${
                          ci === 0
                            ? "font-mono text-[12.5px] whitespace-nowrap text-accent-bright"
                            : "text-fg-muted"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption ? (
            <figcaption className="mt-2 text-[13px] leading-relaxed text-fg-subtle">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "steps":
      return (
        <section key={key} className="my-5">
          <h4 className="text-[14px] font-semibold text-fg">{block.title}</h4>
          <ol className="mt-3 flex flex-col gap-0">
            {block.items.map((item, i) => (
              <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-[11px] text-fg-subtle">
                    {i + 1}
                  </span>
                  {i < block.items.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-border-subtle" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-mono text-[13px] text-accent-bright">
                    {item.head}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.75] text-fg-muted">
                    {item.body}
                  </p>
                  {item.code ? (
                    <pre className="mt-3 overflow-x-auto rounded-md border border-border-subtle bg-canvas-inset p-3 font-mono text-[12.5px] leading-relaxed text-fg">
                      <code>{item.code}</code>
                    </pre>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      );

    case "callout": {
      const style = CALLOUT_STYLE[block.tone] ?? CALLOUT_STYLE.note;
      return (
        <aside
          key={key}
          className={`my-4 rounded-lg border px-4 py-3.5 ${style.box}`}
        >
          <p className={`text-[12px] font-semibold tracking-wide ${style.label}`}>
            {block.title ?? CALLOUT_LABEL[block.tone] ?? "Note"}
          </p>
          <p className="mt-1.5 text-[14px] leading-[1.75] text-fg-muted">
            {block.text}
          </p>
        </aside>
      );
    }

    case "trap":
      return (
        <section
          key={key}
          className="my-4 rounded-lg border border-danger/30 bg-danger/5 p-4"
        >
          <p className="text-[12px] font-semibold tracking-wide text-danger">
            A mistake you will make
          </p>
          <div className="mt-2.5 flex flex-col gap-2 font-mono text-[12.5px]">
            <p className="text-fg-subtle line-through decoration-danger/50">
              {block.wrong}
            </p>
            <p className="text-success">{block.right}</p>
          </div>
          <p className="mt-2.5 text-[14px] leading-[1.75] text-fg-muted">
            {block.why}
          </p>
        </section>
      );

    case "check":
      return (
        <section
          key={key}
          className="my-5 rounded-lg border border-border-subtle bg-canvas-subtle p-4"
        >
          <h4 className="text-[13px] font-semibold tracking-wide text-fg">
            Check yourself
          </h4>
          <p className="mt-1 text-[13px] text-fg-subtle">
            Try to answer out loud before you open one. Nothing here is graded.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {block.items.map((item, i) => (
              <details
                key={i}
                className="group rounded-md border border-border-subtle bg-canvas-inset"
              >
                <summary className="cursor-pointer list-none px-3 py-2.5 text-[14px] leading-relaxed text-fg marker:hidden">
                  <span className="font-mono text-[12px] text-fg-subtle">
                    Q{i + 1}.{" "}
                  </span>
                  {item.q}
                </summary>
                <div className="border-t border-border-subtle px-3 py-2.5 text-[14px] leading-[1.75] text-fg-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      );

    default:
      return null;
  }
}

export function LearnBlocks({ blocks }: { blocks: LearnBlock[] }) {
  return (
    <div className="flex flex-col">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

export function LearnTopicSection({
  guide,
  topic,
  headingLevel = 2,
}: {
  guide: ChapterLearn;
  topic: LearnTopic;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section
      id={`topic-${guide.chapterSlug}-${topic.slug}`}
      className="scroll-mt-20 border-t border-border-subtle pt-10 first:border-t-0 first:pt-0"
    >
      <Heading
        className={
          headingLevel === 2
            ? "text-2xl font-semibold tracking-tight text-fg"
            : "text-lg font-semibold tracking-tight text-fg"
        }
      >
        {topic.title}
      </Heading>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-subtle">
        {topic.lede}
      </p>
      <div className="mt-5">
        <LearnBlocks blocks={topic.blocks} />
      </div>
    </section>
  );
}
