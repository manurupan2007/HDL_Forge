"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_ARGS,
  STARTER_FILES,
  type CompileRequest,
  type CompileResult,
  type VerilatorDiagnostic,
} from "@/lib/verilator";

export type CompileStatus = "idle" | "compiling" | "success" | "error";

export const WASM_URL = "/compiler/verilator.wasm";

export function useVerilogCompiler(initialFiles?: Record<string, string>) {
  const baseFiles = initialFiles ?? STARTER_FILES;
  const workerRef = useRef<Worker | null>(null);
  const [compilerError, setCompilerError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, string>>(baseFiles);
  const [activeFile, setActiveFile] = useState<string>(
    Object.keys(baseFiles)[0],
  );
  const [status, setStatus] = useState<CompileStatus>("idle");
  const [diagnostics, setDiagnostics] = useState<VerilatorDiagnostic[]>([]);
  const [output, setOutput] = useState<string>("");
  const [lastResult, setLastResult] = useState<CompileResult | null>(null);
  const seq = useRef(0);

  const setFile = useCallback((name: string, value: string) => {
    setFiles((prev) => ({ ...prev, [name]: value }));
  }, []);

  const runCompile = useCallback((sources: Record<string, string>) => {
    const worker = workerRef.current;
    if (!worker) return;
    setCompilerError(null);
    setStatus("compiling");
    const request: CompileRequest = {
      id: ++seq.current,
      type: "compile",
      files: { ...sources },
      args: [...DEFAULT_ARGS],
      wasmUrl: WASM_URL,
    };
    worker.postMessage(request);
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL("../components/workspace/verilator.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;

    const onMessage = (event: MessageEvent<CompileResult>) => {
      const result = event.data;
      if (!result || typeof result.id !== "number") return;
      setLastResult(result);
      setDiagnostics(result.diagnostics);
      setOutput((result.stdout + result.stderr).trim());
      setStatus(result.ok ? "success" : "error");
    };
    const onError = (event: ErrorEvent) => {
      setCompilerError(event.message || "Compiler worker failed to start.");
      setStatus("error");
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    return () => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runCompile(baseFiles), 700);
    return () => clearTimeout(timer);
  }, [runCompile, baseFiles]);

  return {
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
  };
}