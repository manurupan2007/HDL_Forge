"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { loader, type OnMount } from "@monaco-editor/react";

loader.config({ paths: { vs: "/monaco/vs" } });
import { EDITOR_FILES } from "@/lib/site";
import type { VerilatorDiagnostic } from "@/lib/verilator";
import { countSeverity } from "@/lib/verilator";
import { ensureVerilogLanguage } from "@/lib/monaco-setup";
import type { CompileStatus } from "@/lib/useVerilogCompiler";

type EditorPanelProps = {
  activeFile: string;
  onActiveFile: (name: string) => void;
  files: Record<string, string>;
  onFileChange: (name: string, value: string) => void;
  diagnostics: VerilatorDiagnostic[];
  status: CompileStatus;
  reveal: { file: string; line: number; at: number } | null;
};

type Cursor = { line: number; col: number };

export function EditorPanel({
  activeFile,
  onActiveFile,
  files,
  onFileChange,
  diagnostics,
  status,
  reveal,
}: EditorPanelProps) {
  const cursorRef = useRef<Cursor>({ line: 1, col: 1 });
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const [cursor, setCursor] = useState<Cursor>({ line: 1, col: 1 });

  const handleBeforeMount = (monaco: Parameters<OnMount>[1]) => {
    ensureVerilogLanguage(monaco);
  };

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    ensureVerilogLanguage(monaco);
    monaco.editor.setTheme("hdlforge");

    editor.onDidChangeCursorPosition((event) => {
      const next = {
        line: event.position.lineNumber,
        col: event.position.column,
      };
      cursorRef.current = next;
      setCursor(next);
    });
  };

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    for (const name of EDITOR_FILES) {
      const model = monaco.editor.getModel(monaco.Uri.parse(`/${name}`));
      if (!model) continue;
      const markers = diagnostics
        .filter((d) => d.file === name && d.line != null)
        .map((d) => ({
          severity:
            d.severity === "error"
              ? monaco.MarkerSeverity.Error
              : d.severity === "warning"
                ? monaco.MarkerSeverity.Warning
                : monaco.MarkerSeverity.Hint,
          message: d.message,
          startLineNumber: d.line as number,
          startColumn: d.col ?? 1,
          endLineNumber: d.line as number,
          endColumn: d.col ? d.col + 1 : 2000,
        }));
      monaco.editor.setModelMarkers(model, "verilog", markers);
    }
  }, [diagnostics]);

  useEffect(() => {
    if (!reveal || !editorRef.current) return;
    if (reveal.file !== activeFile) return;
    const editor = editorRef.current;
    const timer = setTimeout(() => {
      editor.revealLineInCenter(reveal.line);
      editor.setPosition({ lineNumber: reveal.line, column: 1 });
      editor.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [reveal, activeFile]);

  const errorCount = countSeverity(diagnostics, "error");
  const warningCount = countSeverity(diagnostics, "warning");

  const statusChip = (() => {
    switch (status) {
      case "compiling":
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="text-[11px]">Linting…</span>
          </span>
        );
      case "success":
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px]">
              Linted
              {warningCount > 0 ? ` · ${warningCount} warning${warningCount === 1 ? "" : "s"}` : ""}
            </span>
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            <span className="text-[11px]">
              {errorCount} error{errorCount === 1 ? "" : "s"}
            </span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
            <span className="text-[11px]">Idle</span>
          </span>
        );
    }
  })();

  return (
    <div className="flex h-full min-w-0 flex-col bg-canvas-inset">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border-subtle bg-canvas px-2">
        {EDITOR_FILES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onActiveFile(name)}
            className={`h-full px-3 py-0 font-mono text-xs leading-9 transition-colors ${
              name === activeFile
                ? "border-b-2 border-accent bg-canvas-inset text-fg"
                : "text-fg-subtle hover:text-fg-muted"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <Editor
          path={`/${activeFile}`}
          language="verilog"
          theme="hdlforge"
          value={files[activeFile] ?? ""}
          onChange={(value) => onFileChange(activeFile, value ?? "")}
          onMount={handleMount}
          beforeMount={handleBeforeMount}
          loading={
            <div className="flex h-full items-center justify-center text-xs text-fg-subtle">
              Loading editor…
            </div>
          }
          options={{
            ariaLabel: "Verilog source editor",
            tabSize: 2,
            insertSpaces: true,
            fontSize: 13,
            lineHeight: 20,
            fontFamily:
              "var(--font-jetbrains), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "off",
            padding: { top: 14 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            overviewRulerBorder: false,
            renderLineHighlight: "all",
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            codeLens: false,
            folding: true,
            bracketPairColorization: { enabled: true },
            stickyScroll: { enabled: false },
            renderWhitespace: "none",
            quickSuggestions: true,
          }}
        />
      </div>

      <div className="flex h-6 shrink-0 items-center gap-4 border-t border-border-subtle bg-canvas px-3 font-mono text-[11px] text-fg-subtle">
        <span>{activeFile}</span>
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span className="ml-auto flex items-center gap-1.5">{statusChip}</span>
      </div>
    </div>
  );
}