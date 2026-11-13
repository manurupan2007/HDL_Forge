import { SIGNALS } from "@/lib/site";

export function WorkspacePreview() {
  return (
    <div className="card overflow-hidden shadow-2xl shadow-black/40">
      <div className="flex h-10 items-center gap-3 border-b border-border-subtle bg-canvas px-3">
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="ml-2 text-[13px] text-fg-muted">
          Chapter 5 — Adder Circuits
        </span>
        <span className="ml-auto text-xs text-fg-subtle">Reset layout</span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border-subtle md:grid-cols-[1fr_1.35fr_1fr]">
        <div className="bg-canvas-subtle">
          <div className="flex h-9 items-center border-b border-border-subtle px-3 text-[13px] font-medium">
            Ripple-Carry Adder
          </div>
          <div className="space-y-4 p-3">
            <div>
              <p className="text-xs font-medium text-fg-muted">Your task</p>
              <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                Chain four full adders into a nibble adder with carry
                input and output.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-fg-muted">Checkpoints</p>
              <p className="mt-1 text-[12px] leading-relaxed text-fg-subtle">
                ✓ Half adder passes · ⏳ Chain the carry
              </p>
            </div>
          </div>
        </div>

        <div className="bg-canvas-inset">
          <div className="flex h-9 items-center gap-4 border-b border-border-subtle bg-canvas px-2">
            <span className="border-b-2 border-accent px-1.5 font-mono text-xs leading-9 text-fg">
              top.sv
            </span>
            <span className="font-mono text-xs text-fg-subtle">top_tb.sv</span>
          </div>
          <div className="flex min-h-0">
            <div className="select-none px-3 pt-3 text-right font-mono text-[11px] leading-5 text-fg-subtle">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>
            <div className="pb-3 pt-3 font-mono text-[11px] leading-5 text-fg-subtle">
              <div>{"// Design your module here."}</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
              <div>&nbsp;</div>
            </div>
          </div>
        </div>

        <div className="bg-canvas-subtle">
          <div className="flex h-9 items-center border-b border-border-subtle px-3 text-[13px] font-medium">
            Waveform
          </div>
          <div className="p-3">
            <div className="flex">
              <div className="w-20 font-mono text-[11px] leading-6 text-fg-muted">
                {SIGNALS.map((sig) => (
                  <div key={sig.name}>{sig.name}</div>
                ))}
              </div>
              <div className="glass-grid h-[138px] min-w-0 flex-1 rounded-sm border border-border-subtle" />
            </div>
            <p className="mt-2 text-center font-mono text-[10px] text-fg-subtle">
              Run your design to render the waveform.
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-7 items-center gap-3 border-t border-border-subtle bg-canvas px-3 font-mono text-[10px] text-fg-subtle">
        <span>Compile</span>
        <span className="text-border-strong">→</span>
        <span>Elaborate</span>
        <span className="text-border-strong">→</span>
        <span>Simulate</span>
        <span className="text-border-strong">→</span>
        <span>VCD</span>
        <span className="text-border-strong">→</span>
        <span>Waveform</span>
      </div>
    </div>
  );
}