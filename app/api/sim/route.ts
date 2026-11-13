import { NextRequest } from "next/server";
import { runSimulation } from "@/lib/iverilog";
import { buildTestReport } from "@/lib/tests";
import { assertSameOrigin, enforceRateLimit } from "@/lib/server/ratelimit";

const MAX_CODE_CHARS = 300_000;
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return Buffer.from(binary, "binary").toString("base64");
}

export async function POST(request: NextRequest) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;
  const limited = await enforceRateLimit(request, "sim");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const files = (body as { files?: Record<string, string> }).files;
  if (!files || typeof files !== "object") {
    return Response.json({ error: "no files provided" }, { status: 400 });
  }
  const entries = Object.entries(files).filter(
    ([, code]) => typeof code === "string" && code.trim().length > 0,
  );
  if (entries.length === 0) {
    return Response.json({ error: "no non-empty sources to simulate" }, { status: 400 });
  }
  const totalChars = entries.reduce((sum, [, code]) => sum + code.length, 0);
  if (totalChars > MAX_CODE_CHARS) {
    return Response.json(
      { error: "submission too large (max 300KB of source text)" },
      { status: 413 },
    );
  }

  const tests = Array.isArray((body as { tests?: unknown }).tests)
    ? ((body as { tests?: unknown }).tests as unknown[]).filter(
        (t): t is string => typeof t === "string",
      )
    : [];
  const fileNameSet = new Set(entries.map(([name]) => name));
  const top = fileNameSet.has("top_tb.sv") ? "top_tb" : undefined;
  const timeoutMs = 25_000;

  const sim = await runSimulation({
    files: entries.map(([path, data]) => ({ path, data })),
    top,
    generation: "2012",
    artifacts: ["wave.vcd"],
    timeoutMs,
  });

  const durationsMs = Object.values(sim.timings).reduce((a, b) => a + (b ?? 0), 0);
  const report = buildTestReport(sim.combinedOutput, tests, Math.round(durationsMs));
  const vcd = sim.artifacts["wave.vcd"]
    ? toBase64(sim.artifacts["wave.vcd"])
    : null;

  return Response.json({
    ok: sim.success && sim.exitCode === 0,
    sim: {
      stage: sim.stage,
      exitCode: sim.exitCode,
      stderr: sim.stderr.slice(0, 50_000),
      stdout: sim.stdout.slice(0, 50_000),
      timings: sim.timings,
    },
    report,
    vcd,
  });
}