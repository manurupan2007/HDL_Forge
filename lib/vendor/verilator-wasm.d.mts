export type VerilatorWasmRunOptions = {
  args?: string[];
  files?: Record<string, string>;
  cwd?: string;
  env?: Record<string, string>;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
};

export type VerilatorWasmRunResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  files: Record<string, string>;
};

export type VerilatorWasm = {
  run(options?: VerilatorWasmRunOptions): Promise<VerilatorWasmRunResult>;
  module: WebAssembly.Module;
};

export function createVerilator(options?: {
  wasmBinary?: Uint8Array;
  wasmUrl?: string | URL;
  wasmModule?: WebAssembly.Module;
}): Promise<VerilatorWasm>;

export default createVerilator;