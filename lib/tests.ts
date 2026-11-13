/**
 * Client-safe types and parsing for the test-report protocol. This module is
 * imported by the browser bundle, so it must not import the Icarus runtime.
 */

/** A named check a lesson/pset testbench is expected to emit. */
export type TestDef = {
  name: string;
};

/** One result parsed from a simulation's stdout. */
export type NamedTestResult = {
  name: string;
  pass: boolean;
  detail?: string;
};

/** Full report for a simulation run. */
export type TestReport = {
  results: NamedTestResult[];
  passed: number;
  failed: number;
  got: number;
  /** Aggregated stdout+stderr, for diagnostics when something crashes. */
  combinedOutput: string;
  durationsMs: number;
};

const TEST_LINE_RE = /^\[(PASS|FAIL|XFAIL|XPASS|NOTRUN)\]\s*([^:]*?)\s*(?::\s*(.*))?$/;
const SUMMARY_RE = /^SUMMARY\s+(\d+)\s+(?:errors?|failures?)\s*$/i;

/**
 * Parse the `[PASS] name` / `[FAIL] name: detail` protocol our testbenches
 * print. Lines that do not match are ignored. A trailing `SUMMARY <n> errors`
 * line pins the total failure count when the bench reports it.
 */
export function parseTestResults(combinedOutput: string): {
  results: NamedTestResult[];
  declaredErrors: number | null;
} {
  const results: NamedTestResult[] = [];
  let declaredErrors: number | null = null;
  for (const rawLine of combinedOutput.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const summary = line.match(SUMMARY_RE);
    if (summary) {
      declaredErrors = Number(summary[1]);
      continue;
    }
    const m = line.match(TEST_LINE_RE);
    if (!m) continue;
    const verdict = m[1];
    const detail = (m[3] ?? "").trim() || undefined;
    if (verdict === "PASS" || verdict === "XPASS") {
      results.push({
        name: m[2].trim(),
        pass: true,
        detail,
      });
    } else if (verdict === "FAIL" || verdict === "XFAIL") {
      results.push({
        name: m[2].trim(),
        pass: false,
        detail,
      });
    } else {
      results.push({
        name: m[2].trim(),
        pass: false,
        detail: "did not run",
      });
    }
  }
  return { results, declaredErrors };
}

/** Build a TestReport from parsed results, filling missing declared tests as failures. */
export function buildTestReport(
  combinedOutput: string,
  declared: string[],
  durationsMs: number,
): TestReport {
  const { results } = parseTestResults(combinedOutput);
  const byName = new Map<string, NamedTestResult>();
  for (const r of results) byName.set(r.name, r);

  const merged: NamedTestResult[] = declared.map((name) => {
    const found = byName.get(name);
    if (found) return found;
    return { name, pass: false, detail: "never reported by the testbench" };
  });

  let passed = 0;
  for (const r of merged) if (r.pass) passed += 1;

  return {
    results: merged,
    passed,
    failed: merged.length - passed,
    got: results.length,
    combinedOutput,
    durationsMs,
  };
}