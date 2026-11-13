#!/usr/bin/env node
/**
 * Verifies hidden pset testbenches in lib/server/psets against the reference
 * solutions in lib/tests-content/pset-solutions.
 *
 * For every authored pset: RUN {top.sv = solution, top_tb.sv = hidden tb} and
 * require ALL testNames to PASS with SUMMARY 0 errors.
 *
 * Usage:
 *   node --import tsx scripts/verify-pset.mjs            # whole track
 *   node --import tsx scripts/verify-pset.mjs ch5        # one chapter
 * Exit 0 = all verified, 1 = at least one failure.
 */
const { simulate } = await import("@veriflow/iverilog-wasm");

const { PSETS_ALL } = await import("../lib/server/psets/index.ts");
const { PSET_SOLUTIONS_ALL } = await import("../lib/tests-content/pset-solutions/index.ts");
const { chapters } = await import("../lib/curriculum.ts");

const wanted = process.argv.slice(2).map((w) => w.replace(/^ch/, ""));

function wantedKey(key) {
  if (wanted.length === 0) return true;
  const slug = key.split(":")[0];
  const num = chapters.find((c) => c.slug === slug)?.number;
  return wanted.includes(String(num));
}

const passCount = (out) => (out.match(/^\[PASS\]/gm) ?? []).length;
const failList = (out) => out.match(/^\[FAIL\].*$/gm) ?? [];

let failures = 0;
let ran = 0;

for (const key of Object.keys(PSETS_ALL).sort()) {
  if (!wantedKey(key)) continue;
  const spec = PSETS_ALL[key];
  const solution = PSET_SOLUTIONS_ALL[key];
  const notAuthored =
    !spec ||
    !solution ||
    spec.tb.trim().startsWith("// TODO") ||
    solution.trim() === "// TODO" ||
    spec.testNames.length === 0;
  if (notAuthored) {
    console.log(`  SKIP  ${key} (not authored)`);
    continue;
  }
  const res = await simulate({
    files: [
      { path: "top.sv", data: solution },
      { path: "top_tb.sv", data: spec.tb },
    ],
    sources: ["top.sv", "top_tb.sv"],
    top: "top_tb",
    generation: spec.generation ?? "2012",
    artifacts: ["wave.vcd"],
    timeoutMs: 20000,
  });

  const ok =
    res.success &&
    res.exitCode === 0 &&
    failList(res.combinedOutput).length === 0 &&
    passCount(res.combinedOutput) === spec.testNames.length;

  if (ok) {
    ran++;
    console.log(`  OK   ${key} (${spec.testNames.length} hidden vectors)`);
  } else {
    failures++;
    console.log(
      `  !!   ${key} exit ${res.exitCode}, ${passCount(res.combinedOutput)}/${spec.testNames.length} passes.\n  ${res.combinedOutput.slice(0, 1400).split("\n").join("\n  ")}`,
    );
  }
}

console.log(`\nVerified ${ran} psets, ${failures} failing.`);
process.exit(failures === 0 ? 0 : 1);