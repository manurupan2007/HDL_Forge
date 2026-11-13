"use client";

import { SIGNALS, SIMULATION_STEPS } from "@/lib/site";
import { countSeverity, type VerilatorDiagnostic } from "@/lib/verilator";
import type { CompileStatus } from "@/lib/useVerilogCompiler";
import { PaneHeader } from "./PaneHeader";

type WaveformPanelProps = {
  mode: "lesson" | "pset";
  status: CompileStatus;
  diagnostics: VerilatorDiagnostic[];
  onRun: () => void;
};

export function WaveformPanel({
  mode,
  status,
  diagnostics,
  onRun,
}: WaveformPanelProps) {
  const errorCount = countSeverity(diagnostics, "error");
  const warnCount = countSeverity(diagnostics, "warning");

  const statusText = (() => {
    switch (status) {
      case "compiling":
        return "Linting with Verilator in your browser…";
      case "success":
        return `No errors${warnCount > 0 ? ` (${warnCount} warning${warnCount === 1 ? "" : "s"})` : ""}. Press Check (lessons) or Submit (p-sets) to simulate against the testbench.`;
      case "error":
        return errorCount > 0
          ? `${errorCount} lint error${errorCount === 1 ? "" : "s"} — fix them in the editor and lint again.`
          : "Lint failed. Check the output below.";
      default:
        return "Press Lint to check your design with Verilator.";
    }
  })();

  const chip = (() => {
    switch (status) {
      case "compiling":
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="font-mono text-[10px]">Linting</span>
          </span>
        );
      case "success":
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-mono text-[10px]">
              {warnCount > 0 ? `Clean · ${warnCount} warn` : "Clean"}
            </span>
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            <span className="font-mono text-[10px]">
              {errorCount} error{errorCount === 1 ? "" : "s"}
            </span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
            <span className="font-mono text-[10px]">Idle</span>
          </span>
        );
    }
  })();

  return (
    <div className="flex h-full min-w-0 flex-col bg-canvas-inset">
      <PaneHeader title="Waveform" meta="VCD" />

      <div className="pane-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="flex p-3">
          <div className="w-24 shrink-0 font-mono text-xs leading-8 text-fg-muted">
            {SIGNALS.map((sig) => (
              <div key={sig.name} className="flex items-center gap-1">
                <span>{sig.name}</span>
                {sig.width > 1 && (
                  <span className="text-[10px] text-fg-subtle">
                    [{sig.width - 1}:0]
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="glass-grid min-w-0 flex-1 rounded-md border border-border-subtle" />
        </div>

        <div className="px-3 pb-3 text-center font-mono text-[11px] text-fg-subtle">
          {statusText}
        </div>

        {mode === "pset" && (
          <div className="border-t border-border-subtle p-3">
            <p className="text-xs font-medium text-fg-muted">Evaluation</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              Submissions are graded against a hidden, multi-vector testbench
              on the server — your top_tb.sv is replaced by the official bench
              before simulation. Press Submit in the header to grade.
            </p>
            <button
              type="button"
              onClick={onRun}
              disabled={status === "compiling"}
              className="btn btn-primary mt-3 disabled:pointer-events-none disabled:opacity-50"
            >
              {status === "compiling" ? "Linting…" : "Run linter"}
            </button>
          </div>
        )}
      </div>

      <div className="flex h-8 shrink-0 items-center gap-2 border-t border-border-subtle bg-canvas px-3">
        {chip}
        <span className="flex items-center gap-1 truncate font-mono text-[10px] text-fg-subtle">
          {SIMULATION_STEPS.map((step, i) => (
            <span key={step} className="flex shrink-0 items-center gap-1">
              <span>{step}</span>
              {i < SIMULATION_STEPS.length - 1 && (
                <span className="text-border-strong">→</span>
              )}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}