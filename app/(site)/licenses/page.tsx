import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licenses",
  description:
    "License of this project and third-party notices for Verilator, Icarus Verilog, Monaco Editor, and fonts.",
};

export const dynamic = "force-static";

/**
 * Renders THIRD_PARTY_NOTICES.md at build time — the file stays the single
 * source of truth, so this page can never drift from what ships.
 */
function loadNotices(): string {
  try {
    return readFileSync(
      resolve(process.cwd(), "THIRD_PARTY_NOTICES.md"),
      "utf8",
    );
  } catch {
    return "Third-party notices could not be loaded. See THIRD_PARTY_NOTICES.md in the repository.";
  }
}

function NoticeBody({ text }: { text: string }) {
  // Minimal markdown rendering: headings, bullets, paragraphs, inline code.
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={i}
              className="mt-6 text-xl font-semibold tracking-tight text-fg"
            >
              {trimmed.slice(2)}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mt-4 text-base font-semibold tracking-tight text-fg"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }
        if (trimmed.startsWith("- ")) {
          return (
            <ul key={i} className="flex flex-col gap-1.5 pl-5">
              {trimmed.split("\n").map((line, j) => (
                <li
                  key={j}
                  className="list-disc text-[13px] leading-relaxed text-fg-muted"
                >
                  {line.replace(/^-\s*/, "").trim()}
                </li>
              ))}
            </ul>
          );
        }
        const html = /<https?:\/\/[^>]+>/.test(trimmed) || /https?:\/\//.test(trimmed);
        return (
          <p
            key={i}
            className={
              html
                ? "text-[13px] leading-relaxed text-fg-muted break-words"
                : "text-[13px] leading-relaxed text-fg-muted"
            }
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function LicensesPage() {
  const notices = loadNotices();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Licenses
      </h1>

      <div className="card mt-8 p-6">
        <h2 className="text-base font-semibold tracking-tight text-fg">
          This project
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          The HDL Forge platform code is licensed under the{" "}
          <span className="font-medium text-fg">MIT License</span>. The
          curriculum text and lesson/problem-set content in{" "}
          <code className="font-mono text-xs text-fg">lib/curriculum.ts</code>{" "}
          and{" "}
          <code className="font-mono text-xs text-fg">lib/tests-content/</code>{" "}
          are licensed under{" "}
          <span className="font-medium text-fg">
            Creative Commons BY-NC-SA 4.0
          </span>{" "}
          — free to learn from, share, and adapt with attribution, for
          non-commercial use. Third-party assets carry their own licenses,
          listed below.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          Full license texts: <code className="font-mono text-xs">LICENSE</code>{" "}
          in the repository root.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-base font-semibold tracking-tight">
          Third-party notices
        </h2>
        <p className="mt-1 text-[13px] text-fg-subtle">
          Auto-synced from THIRD_PARTY_NOTICES.md
        </p>
        <div className="card mt-3 p-6">
          <NoticeBody text={notices} />
        </div>
      </section>
    </div>
  );
}
