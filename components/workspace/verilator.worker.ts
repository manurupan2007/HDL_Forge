/// <reference lib="webworker" />
import {
  DEFAULT_ARGS,
  dedupeDiagnostics,
  isBlankSource,
  parseDiagnostics,
  type CompileRequest,
  type CompileResult,
} from "@/lib/verilator";
import { createVerilator } from "@/lib/vendor/verilator-wasm.mjs";

const ctx = self as unknown as DedicatedWorkerGlobalScope;

const COMPILE_TIMEOUT_MS = 30_000;

let compiler: Awaited<ReturnType<typeof createVerilator>> | null = null;

async function ensureCompiler(wasmUrl: string) {
  if (compiler) return compiler;
  const response = await fetch(wasmUrl);
  if (!response.ok) {
    throw new Error(`Failed to load Verilator WASM (HTTP ${response.status})`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  compiler = await createVerilator({ wasmBinary: bytes });
  return compiler;
}

async function runCompile(msg: CompileRequest): Promise<CompileResult> {
  const started = performance.now();
  try {
    const verilator = await ensureCompiler(msg.wasmUrl);
    const files = Object.fromEntries(
      Object.entries(msg.files).filter(([, value]) => !isBlankSource(value)),
    );
    const args = [...msg.args, ...Object.keys(files)];
    let stdout = "";
    let stderr = "";
    let exitCode = 0;
    try {
      const res = await verilator.run({
        args,
        files,
        onStdout: (chunk) => {
          stdout += chunk;
        },
        onStderr: (chunk) => {
          stderr += chunk;
        },
      });
      exitCode = res.exitCode ?? 0;
      stdout += res.stdout ?? "";
      stderr += res.stderr ?? "";
    } catch (err) {
      const cast = err as { exitCode?: number; stdout?: string; stderr?: string };
      exitCode = typeof cast.exitCode === "number" ? cast.exitCode : 1;
      stdout += cast.stdout ?? "";
      stderr += cast.stderr ?? "";
    }

    const durationMs = Math.round(performance.now() - started);
    const diagnostics = dedupeDiagnostics(
      parseDiagnostics(stderr + "\n" + stdout),
    );
    const errors = diagnostics.filter((d) => d.severity === "error").length;
    const warnings = diagnostics.filter((d) => d.severity === "warning").length;
    const ok = exitCode === 0 && errors === 0;
    const message = ok
      ? warnings > 0
        ? `Compiled with ${warnings} warning${warnings === 1 ? "" : "s"}.`
        : "Compiled cleanly."
      : errors > 0
        ? `${errors} error${errors === 1 ? "" : "s"} found. Fix them and run again.`
        : "Compilation failed. Check the output below.";

    return {
      id: msg.id,
      ok,
      exitCode,
      stdout,
      stderr,
      diagnostics,
      durationMs,
      message,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - started);
    return {
      id: msg.id,
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "",
      diagnostics: [{ severity: "error", file: null, line: null, col: null, message: String((err as Error).message ?? err) }],
      durationMs,
      message: "The compiler could not start.",
    };
  }
}

ctx.onmessage = (event: MessageEvent<CompileRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== "compile") return;

  const timer = setTimeout(() => {
    ctx.postMessage({
      id: msg.id,
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "",
      diagnostics: [{ severity: "error", file: null, line: null, col: null, message: `Verilator exceeded the ${COMPILE_TIMEOUT_MS / 1000}s timeout.` }],
      durationMs: COMPILE_TIMEOUT_MS,
      message: "Compilation timed out.",
    });
  }, COMPILE_TIMEOUT_MS);

  runCompile(msg)
    .catch(() =>
      Promise.resolve({
        id: msg.id,
        ok: false,
        exitCode: 1,
        stdout: "",
        stderr: "",
        diagnostics: [],
        durationMs: 0,
        message: "Unexpected compiler failure.",
      }),
    )
    .then((result) => {
      clearTimeout(timer);
      ctx.postMessage(result);
    });
};

// Keep DEFAULT_ARGS so the worker and the client agree on what "compile" means.
void DEFAULT_ARGS;