export type VerilatorSeverity = "error" | "warning" | "info";

export type VerilatorDiagnostic = {
  severity: VerilatorSeverity;
  file: string | null;
  line: number | null;
  col: number | null;
  message: string;
};

export type CompileRequest = {
  id: number;
  type: "compile";
  files: Record<string, string>;
  args: string[];
  wasmUrl: string;
};

export type CompileResult = {
  id: number;
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  diagnostics: VerilatorDiagnostic[];
  durationMs: number;
  message: string;
};

export const DEFAULT_ARGS = ["--lint-only", "--language", "1800-2017", "-Wall", "-Wno-fatal"];

const ERROR_LINE_RE =
  /^%(-?(?:Error|Warning(?:-[A-Za-z0-9_]+)?|Info(?:-[A-Za-z0-9_]+)?))\s*:\s*(.*)$/;
const FILE_LINE_RE = /^([^:\n]+?\.sv):(\d+)(?::(\d+))?\s*:\s*(.*)$/;

export function parseDiagnostics(raw: string): VerilatorDiagnostic[] {
  const diagnostics: VerilatorDiagnostic[] = [];
  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trimEnd();
    const match = line.match(ERROR_LINE_RE);
    if (!match) continue;
    const tag = match[1];
    const severity: VerilatorSeverity = tag.startsWith("Warning")
      ? "warning"
      : tag.startsWith("Info") || tag.startsWith("-")
        ? "info"
        : "error";
    const rest = match[2];
    if (rest.startsWith("Exiting due to")) continue;
    const loc = rest.match(FILE_LINE_RE);
    if (loc) {
      diagnostics.push({
        severity,
        file: loc[1],
        line: Number(loc[2]),
        col: loc[3] ? Number(loc[3]) : null,
        message: loc[4],
      });
    } else {
      diagnostics.push({ severity, file: null, line: null, col: null, message: rest });
    }
  }
  return diagnostics;
}

export function dedupeDiagnostics(
  diagnostics: VerilatorDiagnostic[],
): VerilatorDiagnostic[] {
  const seen = new Set<string>();
  const out: VerilatorDiagnostic[] = [];
  for (const d of diagnostics) {
    const key = `${d.severity}|${d.file ?? "?"}|${d.line ?? "?"}|${d.col ?? "?"}|${d.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}

export const STARTER_FILES: Record<string, string> = {
  "top.sv": `module top (
  input  logic [3:0] a,
  input  logic [3:0] b,
  output logic [3:0] y
);

  assign y = a + b;

endmodule
`,
  "top_tb.sv": `// Your testbench will be compiled alongside the design when you write it.
`,
};

export function isBlankSource(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return true;
  return trimmed.split("\n").every((line) => line.trim().startsWith("//"));
}

export function countSeverity(
  diagnostics: VerilatorDiagnostic[] | null | undefined,
  severity: VerilatorSeverity,
): number {
  return (diagnostics ?? []).filter((d) => d.severity === severity).length;
}