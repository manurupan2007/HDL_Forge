"use client";

import { useState } from "react";
import { getPSetHint } from "@/lib/pset-hints";

/**
 * Built-in hint ladder for problem sets. Hints are authored design guidance
 * (lib/pset-hints.ts) — never hidden-bench vectors. Reveals are progressive,
 * and the first hint surfaces automatically once a student has failed a
 * submission twice: getting stuck is expected, and the platform supplies
 * the ladder instead of leaving them alone.
 */

const AUTO_REVEAL_AFTER = 2;

const DEBUG_LOOP = [
  "Read the failing row in the Checks panel — it names the exact signal and the expected vs actual value.",
  "Reproduce that same input in your own top_tb.sv with a $display, and Run — your bench shows the waveform.",
  "Compare on paper at the failing instant: which lane, bit, or cycle is wrong?",
  "Fix, re-run YOUR bench until it passes, then Submit against the hidden one.",
];

export function HintPanel({
  chapterSlug,
  psetSlug,
  failCount,
}: {
  chapterSlug: string;
  psetSlug: string;
  failCount: number;
}) {
  const hint = getPSetHint(chapterSlug, psetSlug);
  const [revealedManual, setRevealedManual] = useState(0);

  // Derived, not stored: once the student is stuck (AUTO_REVEAL_AFTER failed
  // submissions), hint 1 is simply visible — no effect writes needed.
  const revealed = Math.max(
    revealedManual,
    failCount >= AUTO_REVEAL_AFTER ? 1 : 0,
  );

  if (!hint) return null;

  const revealNext = () =>
    setRevealedManual((cur) => Math.min(hint.hints.length, cur + 1));

  return (
    <div className="card mt-5 border-accent/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-fg">Stuck? Hint ladder</h3>
        <span className="font-mono text-[11px] text-fg-subtle">
          {revealed}/{hint.hints.length} revealed
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-fg-subtle">
        Three progressively deeper hints — you choose how much help to take.
        Nothing here is time-gated, and nothing gives away the testbench.
      </p>

      {failCount >= 1 && (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-3">
          <p className="text-[12px] font-semibold text-fg">
            Common pitfalls to check before resubmitting
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {hint.pitfalls.map((p, i) => (
              <li
                key={i}
                className="flex gap-2 text-[12px] leading-relaxed text-fg-muted"
              >
                <span className="shrink-0 text-warning">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: revealed }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-subtle bg-canvas-subtle p-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-bright">
              Hint {i + 1}
              {i === 0 && revealedManual === 0
                ? " · surfaced after failed submissions"
                : ""}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
              {hint.hints[i]}
            </p>
          </div>
        ))}
        {revealed < hint.hints.length && (
          <button
            type="button"
            onClick={revealNext}
            className="btn btn-secondary px-3 py-1.5 text-[12px]"
          >
            {revealed === 0 ? "Reveal hint 1" : `Reveal hint ${revealed + 1}`}
          </button>
        )}
      </div>

      <div className="mt-3 border-t border-border-subtle pt-3">
        <p className="text-[12px] font-semibold text-fg">
          The debugging loop that always works
        </p>
        <ol className="mt-1.5 flex flex-col gap-1">
          {DEBUG_LOOP.map((step, i) => (
            <li
              key={i}
              className="flex gap-2 text-[12px] leading-relaxed text-fg-muted"
            >
              <span className="shrink-0 font-mono text-fg-subtle">
                {i + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
