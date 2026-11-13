"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Chapter, Lesson, PSet } from "@/lib/curriculum";
import { getGuide } from "@/lib/learn";
import { countSeverity } from "@/lib/verilator";
import type { TestReport } from "@/lib/tests";
import { isComplete, markComplete } from "@/lib/progress";
import {
  readFailCount,
  subscribeFails,
  writeFailCount,
} from "@/lib/pset-fails";
import { useVerilogCompiler } from "@/lib/useVerilogCompiler";
import { TaskPanel } from "./TaskPanel";
import { EditorPanel } from "./EditorPanel";
import { WaveformPanel } from "./WaveformPanel";

type WorkspaceProps = {
  mode: "lesson" | "pset";
  chapter: Chapter;
  item: Lesson | PSet;
  backHref: string;
  breadcrumb: string;
  /** Canonical `chapter:slug` key used for progress tracking. */
  itemKey: string;
  /** Declared test names for the lesson bench (client-safe). */
  testNames?: string[];
  /** Lesson bench — client-visible for lessons, never shipped for psets. */
  bench?: string;
  /** Starter sources to seed the editor with. */
  initialFiles?: Record<string, string>;
  /** Present only in pset mode; routes the submit to /api/grade. */
  gradeTarget?: { chapterSlug: string; psetSlug: string };
};

const MIN = 20;
const MAX = 60;
const DEFAULT_LEFT = 32;
const DEFAULT_RIGHT = 28;
const CENTER_MIN = 8;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function Workspace({
  mode,
  chapter,
  item,
  backHref,
  breadcrumb,
  itemKey,
  testNames,
  bench,
  initialFiles,
  gradeTarget,
}: WorkspaceProps) {
  const [leftPct, setLeftPct] = useState(DEFAULT_LEFT);
  const [rightPct, setRightPct] = useState(DEFAULT_RIGHT);
  const [outputOpen, setOutputOpen] = useState(true);
  const [bottomView, setBottomView] = useState<"output" | "checks">("output");
  const [checkReport, setCheckReport] = useState<TestReport | null>(null);
  const [checkRunning, setCheckRunning] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(() => isComplete(itemKey));
  const [reveal, setReveal] = useState<{
    file: string;
    line: number;
    at: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Failed submissions drive the hint ladder. localStorage through
  // useSyncExternalStore: server and first client render agree (0), then the
  // client snapshot picks up the persisted value — no hydration mismatch.
  const subscribe = useCallback(
    (cb: () => void) => subscribeFails(cb),
    [],
  );
  const getFailSnapshot = useCallback(() => readFailCount(itemKey), [itemKey]);
  const failCount = useSyncExternalStore(
    subscribe,
    getFailSnapshot,
    () => 0,
  );

  const {
    files,
    setFile,
    activeFile,
    setActiveFile,
    status,
    diagnostics,
    output,
    compilerError,
    lastResult,
    runCompile,
  } = useVerilogCompiler(initialFiles);

  const handleReveal = useCallback((file: string, line: number | null) => {
    if (line == null) return;
    setActiveFile(file);
    setReveal({ file, line, at: Date.now() });
  }, [setActiveFile]);

  const runCheck = useCallback(async () => {
    if (checkRunning) return;
    setCheckRunning(true);
    setCheckError(null);
    try {
      if (mode === "pset") {
        if (!gradeTarget) {
          setCheckError("This problem set has no grading target.");
          return;
        }
        const res = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...gradeTarget, files }),
        });
        const data = (await res.json()) as {
          error?: string;
          report?: TestReport;
          receipt?: string | null;
          points?: number;
        };
        if (!res.ok || !data.report) {
          setCheckError(data.error ?? `Grading failed (${res.status}).`);
          return;
        }
        setCheckReport(data.report);
        setBottomView("checks");
        if (data.report.failed === 0 && data.report.got > 0) {
          writeFailCount(itemKey, 0);
          markComplete(itemKey, "pset", {
            score: data.report.passed,
            total: data.report.results.length,
            ...(typeof data.points === "number"
              ? { points: data.points }
              : {}),
            ...(typeof data.receipt === "string"
              ? { receipt: data.receipt }
              : {}),
          });
          setCompleted(true);
        } else {
          writeFailCount(itemKey, readFailCount(itemKey) + 1);
        }
      } else {
        if (!bench) {
          setCheckError("This lesson has no checks yet.");
          return;
        }
        const res = await fetch("/api/sim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: { ...files, "top_tb.sv": bench },
            tests: testNames ?? [],
          }),
        });
        const data = (await res.json()) as {
          error?: string;
          report?: TestReport;
        };
        if (!res.ok || !data.report) {
          setCheckError(data.error ?? `Simulation failed (${res.status}).`);
          return;
        }
        setCheckReport(data.report);
        setBottomView("checks");
        if (data.report.failed === 0 && data.report.got > 0) {
          markComplete(itemKey, "lesson");
          setCompleted(true);
        }
      }
    } catch {
      setCheckError("Could not reach the simulation server.");
    } finally {
      setCheckRunning(false);
    }
  }, [checkRunning, mode, gradeTarget, files, bench, testNames, itemKey]);

  const centerPct = 100 - leftPct - rightPct;

  function startDrag(side: "left" | "right") {
    return (e: ReactPointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const startX = e.clientX;
      const startLeft = leftPct;
      const startRight = rightPct;
      const w = el.getBoundingClientRect().width;

      const onMove = (ev: PointerEvent) => {
        const dx = ((ev.clientX - startX) / w) * 100;
        if (side === "left") {
          let next = clamp(startLeft + dx, MIN, MAX);
          if (100 - next - startRight < CENTER_MIN)
            next = 100 - startRight - CENTER_MIN;
          setLeftPct(next);
        } else {
          let next = clamp(startRight - dx, MIN, MAX);
          if (100 - startLeft - next < CENTER_MIN)
            next = 100 - startLeft - CENTER_MIN;
          setRightPct(next);
        }
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.cursor = "";
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      document.body.style.cursor = "col-resize";
      e.preventDefault();
    };
  }

  function reset() {
    setLeftPct(DEFAULT_LEFT);
    setRightPct(DEFAULT_RIGHT);
  }

  const errorCount = countSeverity(diagnostics, "error");
  const warns = output || compilerError;

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-border-subtle bg-canvas px-3">
        <a
          href={backHref}
          className="shrink-0 text-sm text-fg-subtle transition-colors hover:text-fg"
          aria-label={`Back to chapter ${chapter.number}`}
        >
          ← Ch {chapter.number}
        </a>
        <span className="h-3.5 w-px bg-border" />
        <span className="truncate text-[13px] text-fg-muted">{breadcrumb}</span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {completed && (
            <span className="rounded bg-success/15 px-1.5 py-px font-mono text-[11px] text-success">
              ✓ passed
            </span>
          )}
          <span
            className={`hidden font-mono text-[11px] sm:inline ${
              status === "success"
                ? "text-success"
                : status === "error"
                  ? "text-danger"
                  : "text-fg-subtle"
            }`}
          >
            {lastResult ? `${(lastResult.durationMs / 1000).toFixed(2)}s` : "—"}
          </span>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-xs text-fg-subtle transition-colors hover:text-fg"
          >
            Reset layout
          </button>
          <button
            type="button"
            onClick={runCheck}
            disabled={checkRunning}
            className="btn shrink-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {checkRunning
              ? mode === "pset"
                ? "Grading…"
                : "Checking…"
              : mode === "pset"
                ? "Submit"
                : "Check"}
          </button>
          <button
            type="button"
            onClick={() => runCompile(files)}
            disabled={status === "compiling"}
            className="btn btn-primary shrink-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {status === "compiling" ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-fg/40 border-t-fg" />
                Linting…
              </>
            ) : (
              "Lint"
            )}
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 select-none overflow-hidden max-md:flex-col max-md:overflow-y-auto"
      >
        <section
          style={{ width: `${leftPct}%` }}
          className="min-w-0 shrink-0 max-md:w-full! max-md:min-h-[38vh] max-md:shrink-0"
        >
          <TaskPanel
            mode={mode}
            chapter={chapter}
            item={item}
            guide={getGuide(chapter.slug)}
            itemKey={itemKey}
            failCount={failCount}
          />
        </section>

        <div
          onPointerDown={startDrag("left")}
          onDoubleClick={reset}
          className="group absolute top-0 bottom-0 z-20 w-1.5 -translate-x-1/2 cursor-col-resize max-md:hidden"
          style={{ left: `${leftPct}%` }}
        >
          <div className="mx-auto h-full w-px bg-border transition-colors group-hover:bg-accent group-active:bg-accent" />
        </div>

        <section
          style={{ width: `${centerPct}%` }}
          className="min-w-0 shrink-0 max-md:w-full! max-md:min-h-[55vh] max-md:shrink-0"
        >
          <EditorPanel
            activeFile={activeFile}
            onActiveFile={setActiveFile}
            files={files}
            onFileChange={setFile}
            diagnostics={diagnostics}
            status={status}
            reveal={reveal}
          />
        </section>

        <div
          onPointerDown={startDrag("right")}
          onDoubleClick={reset}
          className="group absolute top-0 bottom-0 z-20 w-1.5 -translate-x-1/2 cursor-col-resize max-md:hidden"
          style={{ left: `${leftPct + centerPct}%` }}
        >
          <div className="mx-auto h-full w-px bg-border transition-colors group-hover:bg-accent group-active:bg-accent" />
        </div>

        <section
          style={{ width: `${rightPct}%` }}
          className="min-w-0 shrink-0 max-md:w-full! max-md:min-h-[32vh] max-md:shrink-0"
        >
          <WaveformPanel
            mode={mode}
            status={status}
            diagnostics={diagnostics}
            onRun={() => runCompile(files)}
          />
        </section>
      </div>

      <section className="shrink-0 border-t border-border-subtle bg-canvas-inset">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOutputOpen((open) => !open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOutputOpen((open) => !open);
            }
          }}
          className="flex h-8 w-full items-center gap-2 px-3 text-left text-[11px] font-medium text-fg-muted transition-colors hover:text-fg"
          aria-expanded={outputOpen}
        >
          <span
            className={`text-[9px] transition-transform ${
              outputOpen ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBottomView("checks");
              }}
              className={`rounded px-1.5 py-px transition-colors ${
                bottomView === "checks"
                  ? "bg-canvas-elevated text-fg"
                  : "hover:text-fg"
              }`}
            >
              Checks
              {checkReport && (
                <span
                  className={`ml-1 font-mono text-[10px] ${
                    checkReport.failed === 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {checkReport.passed}/{checkReport.results.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBottomView("output");
              }}
              className={`rounded px-1.5 py-px transition-colors ${
                bottomView === "output"
                  ? "bg-canvas-elevated text-fg"
                  : "hover:text-fg"
              }`}
            >
              Output
              {diagnostics.length > 0 && (
                <span
                  className={`ml-1 rounded px-1.5 py-px font-mono text-[10px] ${
                    errorCount > 0
                      ? "bg-danger/15 text-danger"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {errorCount > 0
                    ? `${errorCount} error${errorCount === 1 ? "" : "s"}`
                    : `${countSeverity(diagnostics, "warning")} warning${countSeverity(diagnostics, "warning") === 1 ? "" : "s"}`}
                </span>
              )}
            </button>
          </span>
          <span className="ml-auto font-mono text-[10px] text-fg-subtle">
            Verilator 5.051 · lint-only
          </span>
        </div>

        {outputOpen && bottomView === "checks" && (
          <div className="flex h-44 min-h-0 flex-col border-t border-border-subtle">
            {checkError ? (
              <div className="flex min-h-0 flex-1 flex-col justify-center px-3">
                <p className="font-mono text-[11px] text-danger">{checkError}</p>
                <p className="mt-1 text-[11px] text-fg-subtle">
                  Fix the issue and check again — the browser lint output below
                  may have more detail.
                </p>
              </div>
            ) : checkReport ? (
              <ul className="pane-scroll min-h-0 flex-1 overflow-y-auto py-1">
                {checkReport.results.length === 0 && (
                  <li className="px-3 py-1 font-mono text-[11px] text-fg-subtle">
                    The bench produced no named checks. See the Output view for
                    the raw simulation log.
                  </li>
                )}
                {checkReport.results.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 px-3 py-1 font-mono text-[11px] leading-relaxed"
                  >
                    <span
                      className={`shrink-0 font-semibold uppercase ${
                        r.pass ? "text-success" : "text-danger"
                      }`}
                    >
                      {r.pass ? "PASS" : "FAIL"}
                    </span>
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {r.name}
                      {r.detail && (
                        <span className="text-fg-subtle"> — {r.detail}</span>
                      )}
                    </span>
                  </li>
                ))}
                {checkReport.failed === 0 && checkReport.got > 0 && (
                  <li className="border-t border-border-subtle px-3 py-1.5 text-[11px] text-success">
                    All checks passed — progress saved
                    {mode === "pset" ? " and receipt signed." : "."}
                  </li>
                )}
              </ul>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center text-[11px] text-fg-subtle">
                {mode === "pset"
                  ? "Press Submit to grade your design against the hidden testbench."
                  : "Press Check to run your design against the lesson testbench."}
              </div>
            )}
          </div>
        )}

        {outputOpen && bottomView === "output" && (
          <div className="flex h-44 min-h-0 flex-col border-t border-border-subtle">
            {diagnostics.length > 0 ? (
              <ul className="pane-scroll min-h-0 flex-1 overflow-y-auto py-1">
                {diagnostics.map((d, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handleReveal(d.file ?? "", d.line)}
                      disabled={!d.file || d.line == null}
                      className={`flex w-full items-start gap-3 px-3 py-1 text-left font-mono text-[11px] leading-relaxed transition-colors ${
                        d.severity === "error"
                          ? "text-danger"
                          : d.severity === "warning"
                            ? "text-warning"
                            : "text-fg-subtle"
                      } ${d.file && d.line ? "hover:bg-canvas-elevated" : ""}`}
                    >
                      <span className="shrink-0 font-semibold uppercase">
                        {d.file && d.line !== null ? `${d.file}:${d.line}` : "verilator"}
                      </span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">{d.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : warns ? (
              <pre className="pane-scroll min-h-0 flex-1 overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-fg-muted">
                {warns}
              </pre>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center text-[11px] text-fg-subtle">
                Press Lint to check your design with Verilator.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}