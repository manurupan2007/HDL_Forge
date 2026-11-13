import { simulate } from "@veriflow/iverilog-wasm";

export type IverilogGeneration =
  | "2005"
  | "2005-sv"
  | "2009"
  | "2012"
  | "2017"
  | "2023";

export const DEFAULT_GENERATION: IverilogGeneration = "2012";

export type SimRunResult = {
  success: boolean;
  stage: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  combinedOutput: string;
  timings: Record<string, number>;
  artifacts: Record<string, Uint8Array>;
};

/**
 * Compile + simulate a set of Verilog/SystemVerilog sources with Icarus
 * Verilog compiled to WebAssembly. Runs server-side only: the runtime is
 * Node-bound (worker_threads), and hidden testbenches must never be shipped
 * to the client.
 */
export async function runSimulation(input: {
  files: Array<{ path: string; data: string }>;
  sources?: string[];
  top?: string;
  generation?: IverilogGeneration;
  artifacts?: string[];
  timeoutMs?: number;
}): Promise<SimRunResult> {
  const sources = input.sources ?? input.files.map((f) => f.path);
  const result = await simulate({
    files: input.files,
    sources,
    top: input.top,
    generation: input.generation ?? DEFAULT_GENERATION,
    artifacts: input.artifacts ?? [],
    timeoutMs: Math.min(Math.max(input.timeoutMs ?? 20_000, 1_000), 60_000),
  });

  const artifacts: Record<string, Uint8Array> = {};
  for (const [name, bytes] of result.artifacts.entries()) {
    artifacts[name] = bytes;
  }

  return {
    success: result.success,
    stage: result.stage,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    combinedOutput: result.combinedOutput,
    timings: result.timings as Record<string, number>,
    artifacts,
  };
}

import type { NamedTestResult } from "./tests";
export type { NamedTestResult };