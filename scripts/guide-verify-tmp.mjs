// TEMPORARY verification script (deleted after the fix pass).
const { simulate } = await import("@veriflow/iverilog-wasm");
const { chapterLearn: ch10 } = await import("../lib/learn/ch10.ts");
const { chapterLearn: ch11 } = await import("../lib/learn/ch11.ts");
const { chapterLearn: ch13 } = await import("../lib/learn/ch13.ts");
const { chapterLearn: ch14 } = await import("../lib/learn/ch14.ts");
const { PSETS_CH10 } = await import("../lib/server/psets/ch10.ts");
const { PSETS_CH11 } = await import("../lib/server/psets/ch11.ts");
const { PSETS_CH13 } = await import("../lib/server/psets/ch13.ts");
const { PSETS_CH14 } = await import("../lib/server/psets/ch14.ts");
const { LESSONS_CH11 } = await import("../lib/tests-content/lessons/ch11.ts");
const { LESSONS_CH14 } = await import("../lib/tests-content/lessons/ch14.ts");

function findCode(ch, needle) {
  for (const t of ch.topics) for (const b of (t.blocks ?? [])) {
    if (b.kind === "code" && b.code && (b.caption ?? "").includes(needle)) return b.code;
  }
  throw new Error("code not found: " + needle);
}
let failures = 0;
async function run(name, dut, tb, expect) {
  const res = await simulate({
    files: [{ path: "top.sv", data: dut }, { path: "top_tb.sv", data: tb }],
    sources: ["top.sv", "top_tb.sv"],
    top: "top_tb", generation: "2012", timeoutMs: 60000,
  });
  const pass = (res.combinedOutput.match(/^\[PASS\]/gm) ?? []).length;
  const fails = (res.combinedOutput.match(/^\[FAIL\].*$/gm) ?? []);
  const summary = (res.combinedOutput.match(/SUMMARY.*$/gm) ?? [""])[0];
  const ok = res.success && res.exitCode === 0 && pass === expect && fails.length === 0;
  console.log(`${ok ? "OK  " : "FAIL"} ${name}: ${pass}/${expect} ${summary}`);
  if (!ok) { failures++; console.log(res.combinedOutput.slice(0, 2500)); }
}
const barrel = findCode(ch10, "The rotating barrel shifter").replace("module barrel_rotate (", "module top (");
await run("ch10 pset barrel", barrel, PSETS_CH10["shift-registers:barrel-shifter"].tb, 4);
await run("ch11 lesson traffic", findCode(ch11, "The lesson version"), LESSONS_CH11["finite-state-machines:traffic-light-controller"].tb, 7);
await run("ch11 pset traffic", findCode(ch11, "The pset version"), PSETS_CH11["finite-state-machines:traffic-light-controller"].tb, 13);
await run("ch13 pset rom", findCode(ch13, "read on the clock"), PSETS_CH13["memory:rom-boot-image"].tb, 8);
await run("ch14 pset loopback", findCode(ch14, "The loopback, complete"), PSETS_CH14["interfaces:uart-loopback"].tb, 9);
await run("ch14 lesson loopback", findCode(ch14, "The loopback, complete"), LESSONS_CH14["interfaces:uart-loopback"].tb, 9);
console.log(failures === 0 ? "ALL GUIDE BENCHES PASS" : `${failures} FAILING`);
process.exit(failures === 0 ? 0 : 1);
