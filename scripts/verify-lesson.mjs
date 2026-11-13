#!/usr/bin/env node
/**
 * Verifies lesson testbenches in lib/tests-content/lessons.
 *
 * For every lesson that has a testbench, a starter, and a reference solution:
 *   1. RUN {top.sv = solution, top_tb.sv = tb}  => ALL declared tests PASS, SUMMARY 0 errors
 *   2. RUN {top.sv = starter,  top_tb.sv = tb}  => at least one declared test FAILS
 *
 * Usage:
 *   node --import tsx scripts/verify-lesson.mjs            # whole track
 *   node --import tsx scripts/verify-lesson.mjs ch5        # one chapter
 *   node --import tsx scripts/verify-lesson.mjs ch2 ch3    # several
 * Exit 0 = all verified, 1 = at least one failure. Content files must not
 * import runtime values (type-only imports are fine; stripped by Node).
 */
const { simulate } = await import("@veriflow/iverilog-wasm");

const { LESSON_TESTS_ALL } = await import("../lib/tests-content/lessons/index.ts");
const { SOLUTIONS_ALL } = await import("../lib/tests-content/solutions/index.ts");
const { chapters } = await import("../lib/curriculum.ts");

const wanted = process.argv.slice(2).map((w) => w.replace(/^ch/, ""));

function wantedKey(key) {
  if (wanted.length === 0) return true;
  const slug = key.split(":")[0];
  const num = chapters.find((c) => c.slug === slug)?.number;
  return wanted.includes(String(num));
}

function run(files) {
  return simulate({
    files,
    sources: files.map((f) => f.path),
    top: "top_tb",
    generation: "2012",
    artifacts: ["wave.vcd"],
    timeoutMs: 20000,
  });
}

const passCount = (out) => (out.match(/^\[PASS\]/gm) ?? []).length;
const failList = (out) => out.match(/^\[FAIL\].*$/gm) ?? [];

let failures = 0;
let ran = 0;

for (const key of Object.keys(LESSON_TESTS_ALL).sort()) {
  if (!wantedKey(key)) continue;
  const spec = LESSON_TESTS_ALL[key];
  const solution = SOLUTIONS_ALL[key];
  const notAuthored =
    !spec ||
    !solution ||
    solution.trim() === "// TODO" ||
    spec.tb.trim().startsWith("// TODO");
  if (notAuthored) {
    console.log(`  SKIP  ${key} (not authored)`);
    continue;
  }

  const tb = spec.tb;
  const withStarter = spec.starter?.["top.sv"]?.trim()
    ? spec.starter["top.sv"]
    : null;

  const resSol = await run([
    { path: "top.sv", data: solution },
    { path: "top_tb.sv", data: tb },
  ]);
  const solOk =
    resSol.success &&
    resSol.exitCode === 0 &&
    failList(resSol.combinedOutput).length === 0 &&
    passCount(resSol.combinedOutput) === spec.tests.length;

  let starterOk = true;
  let starterDetail = "";
  if (withStarter) {
    const resStart = await run([
      { path: "top.sv", data: withStarter },
      { path: "top_tb.sv", data: tb },
    ]);
    const starterPassesAll =
      resStart.success &&
      resStart.exitCode === 0 &&
      failList(resStart.combinedOutput).length === 0 &&
      passCount(resStart.combinedOutput) === spec.tests.length;
    starterOk = !starterPassesAll;
    starterDetail = resStart.combinedOutput.slice(0, 500);
  }

  let msg = null;
  if (!solOk) {
    msg = `FAIL(solution run) exit ${resSol.exitCode}, ${passCount(resSol.combinedOutput)}/${spec.tests.length} passes.\n${resSol.combinedOutput.slice(0, 1400)}`;
  } else if (withStarter && !starterOk) {
    msg = `FAIL(starter run) — starter passes everything (too easy).\n${starterDetail}`;
  }
  if (msg) {
    failures++;
    console.log(`  !!   ${key}\n  ${msg.split("\n").join("\n  ")}`);
  } else {
    ran++;
    console.log(
      `  OK   ${key} (${spec.tests.length} tests; starter ${withStarter ? "fails" : "(n/a)"})`,
    );
  }
}

console.log(`\nVerified ${ran} lessons, ${failures} failing.`);
process.exit(failures === 0 ? 0 : 1);