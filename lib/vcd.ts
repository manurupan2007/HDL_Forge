/**
 * Minimal, dependency-free VCD (Value Change Dump) parser. Client-safe.
 * Parses signal declarations, the timescale, and timestamped value changes
 * into a compact structure the waveform renderer can draw.
 */

export type WaveSignal = {
  /** Qualified name, e.g. "top_tb.dut.count". */
  name: string;
  /** Unqualified last segment, for compact labels. */
  label: string;
  width: number;
  scope: string[];
  /** Raw ticks are integers interpreted in `unit` units. */
  unit: string;
  /** Time in nanoseconds of each value point. */
  points: Array<{ tNs: number; value: string }>;
};

export type VcdData = {
  timescale: string;
  /** Factor converting a raw tick to nanoseconds. */
  nsPerUnit: number;
  signals: WaveSignal[];
  maxTNs: number;
  hasParseErrors: boolean;
};

const UNIT_NS: Record<string, number> = {
  s: 1e9,
  ms: 1e6,
  us: 1e3,
  ns: 1,
  ps: 1e-3,
  fs: 1e-6,
};

const VAR_RE = /^\$var\s+(\S+)\s+(\d+)\s+(\S+)\s+(\S+)(?:\s+(\S+))?\s+\$end\s*$/;

export function parseVcd(raw: string): VcdData {
  const signals: WaveSignal[] = [];
  const byId = new Map<string, WaveSignal>();
  const scopes: string[] = [];
  let unit = "1ps";
  let nsPerUnit = 1e-3;
  let maxTNs = 0;
  let hasParseErrors = false;
  let lastTick = 0;

  const lines = raw.split("\n");
  let i = 0;
  let inDefinitions = true;

  const pushChange = (id: string, value: string) => {
    const sig = byId.get(id);
    if (!sig) return;
    const tNs = lastTick * nsPerUnit;
    if (tNs > maxTNs) maxTNs = tNs;
    const prev = sig.points[sig.points.length - 1];
    if (prev && prev.value === value) return;
    sig.points.push({ tNs, value });
  };

  while (i < lines.length) {
    const line = lines[i];
    i += 1;

    if (inDefinitions) {
      const trimmed = line.trim();
      if (trimmed.startsWith("$timescale")) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 3) {
          unit = `${parts[1]}${parts[2]}`;
          const magnitude = Number(parts[1]) || 1;
          const ns = UNIT_NS[parts[2]];
          if (ns != null) nsPerUnit = magnitude * ns;
        }
        continue;
      }
      if (trimmed.startsWith("$scope")) {
        const parts = trimmed.split(/\s+/);
        if (parts[2]) scopes.push(parts[2]);
        continue;
      }
      if (trimmed.startsWith("$upscope")) {
        scopes.pop();
        continue;
      }
      const varm = trimmed.match(VAR_RE);
      if (varm) {
        const type = varm[1];
        if (type === "integer" || type === "real" || type === "event") {
          continue;
        }
        const width = Number(varm[2]);
        const id = varm[3];
        const name = varm[4];
        const label = name.replace(/\[[\d:]+\]$/, "");
        const qualified = [...scopes, label].join(".");
        const sig: WaveSignal = {
          name: qualified,
          label,
          width,
          scope: [...scopes],
          unit,
          points: [],
        };
        byId.set(id, sig);
        signals.push(sig);
        continue;
      }
      if (trimmed === "$enddefinitions") {
        inDefinitions = false;
      }
      continue;
    }

    // Value-change section.
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("$dump")) {
      // $dumpvars / $dumpall / $dumpon: contained value changes follow until $end.
      while (i < lines.length) {
        const inner = lines[i].trim();
        i += 1;
        if (inner === "$end") break;
        if (!inner) continue;
        if (inner.startsWith("#")) {
          lastTick = Number(inner.slice(1)) || 0;
          continue;
        }
        const consumed = consumeChange(inner, pushChange);
        if (!consumed) hasParseErrors = true;
      }
      continue;
    }
    if (trimmed.startsWith("#")) {
      lastTick = Number(trimmed.slice(1)) || 0;
      continue;
    }
    const consumed = consumeChange(trimmed, pushChange);
    if (!consumed) hasParseErrors = true;
  }

  return { timescale: unit, nsPerUnit, signals, maxTNs, hasParseErrors };
}

function consumeChange(
  line: string,
  push: (id: string, value: string) => void,
): boolean {
  if (line.length === 0) return false;
  if (line[0] === "b" || line[0] === "B") {
    const sp = line.indexOf(" ");
    if (sp === -1) return false;
    const val = line.slice(1, sp);
    const id = line.slice(sp + 1).trim();
    if (!id) return false;
    push(id, val.replace(/_/g, ""));
    return true;
  }
  const first = line[0];
  if (first === "0" || first === "1" || first === "x" || first === "X" || first === "z" || first === "Z") {
    if (line.length < 2) return false;
    const id = line.slice(1).trim();
    if (!id) return false;
    push(id, first === "X" ? "x" : first === "Z" ? "z" : first);
    return true;
  }
  return false;
}