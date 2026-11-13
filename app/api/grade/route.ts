import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { chapters } from "@/lib/curriculum";
import { auth } from "@/lib/auth";
import { runSimulation } from "@/lib/iverilog";
import { buildTestReport } from "@/lib/tests";
import { getPSetTests } from "@/lib/server/psets";
import { signReceipt } from "@/lib/server/certs";
import { upsertProgressForUser } from "@/lib/server/progress";
import { assertSameOrigin, enforceRateLimit } from "@/lib/server/ratelimit";
import * as Sentry from "@sentry/nextjs";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_CODE_CHARS = 300_000;

export async function POST(request: NextRequest) {
  const blocked = assertSameOrigin(request);
  if (blocked) return blocked;
  const limited = await enforceRateLimit(request, "grade");
  if (limited) return limited;

  try {
    return await grade(request);
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "api/grade" } });
    console.error("[grade] unexpected failure", err);
    return Response.json({ error: "internal grading error" }, { status: 500 });
  }
}

async function grade(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { chapterSlug, psetSlug, files } = body as {
    chapterSlug?: string;
    psetSlug?: string;
    files?: Record<string, string>;
  };

  if (!chapterSlug || !psetSlug || !files || typeof files !== "object") {
    return Response.json({ error: "missing chapterSlug, psetSlug or files" }, { status: 400 });
  }

  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return Response.json({ error: "unknown chapter" }, { status: 404 });
  if (chapter.pset.slug !== psetSlug) {
    return Response.json({ error: "unknown problem set" }, { status: 404 });
  }

  const hidden = getPSetTests(`${chapterSlug}:${psetSlug}`);
  if (!hidden) {
    return Response.json({ error: "problem set has no autograder yet" }, { status: 404 });
  }

  const entries = Object.entries(files).filter(
    ([name, code]) =>
      /\.sv$/.test(name) && typeof code === "string" && code.trim().length > 0,
  );
  if (entries.length === 0) {
    return Response.json({ error: "no non-empty sources to grade" }, { status: 400 });
  }
  const totalChars = entries.reduce((sum, [, code]) => sum + code.length, 0);
  if (totalChars > MAX_CODE_CHARS) {
    return Response.json({ error: "submission too large" }, { status: 413 });
  }

  // Student sources, with the hidden bench authoritative for top_tb.sv.
  const filesWithHidden = entries
    .filter(([name]) => name !== "top_tb.sv")
    .map(([path, data]) => ({ path, data }));
  filesWithHidden.push({ path: "top_tb.sv", data: hidden.tb });

  const sim = await runSimulation({
    files: filesWithHidden,
    top: "top_tb",
    generation: hidden.generation ?? "2012",
    artifacts: ["wave.vcd"],
    timeoutMs: 25_000,
  });

  const durationsMs = Object.values(sim.timings).reduce((a, b) => a + (b ?? 0), 0);
  const report = buildTestReport(
    sim.combinedOutput,
    hidden.testNames,
    Math.round(durationsMs),
  );

  const passedAll = sim.success && sim.exitCode === 0 && report.failed === 0;
  const receipt = passedAll
    ? signReceipt({
        v: 1,
        chapterSlug,
        psetSlug,
        score: report.passed,
        total: report.results.length,
        passedAll: true,
        submittedAt: new Date().toISOString(),
      })
    : null;

  // Best-effort: persist the pass to the submitter's account so the receipt
  // survives device switches. Never fails the grading response.
  if (receipt) {
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session) {
        await upsertProgressForUser(session.user.id, `${chapterSlug}:${psetSlug}`, {
          kind: "pset",
          score: report.passed,
          total: report.results.length,
          points: hidden.points ?? 10,
          receipt,
        });
      }
    } catch (err) {
      // The grading result stands regardless, but a lost receipt blocks the
      // certificate claim — surface it instead of swallowing silently.
      Sentry.captureException(err, {
        tags: { route: "api/grade", step: "persist-receipt" },
        extra: { chapterSlug, psetSlug },
      });
      console.error("[grade] receipt persist failed", err);
    }
  }

  return Response.json({
    ok: passedAll,
    chapterSlug,
    psetSlug,
    report,
    receipt,
    points: hidden.points ?? 10,
    sim: {
      stage: sim.stage,
      exitCode: sim.exitCode,
      stderr: sim.stderr.slice(0, 50_000),
      stdout: sim.stdout.slice(0, 50_000),
      timings: sim.timings,
    },
  });
}
