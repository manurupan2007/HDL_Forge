/**
 * Shared structural types for lesson/pset test content. Type-only module —
 * no runtime imports, so it is safe to bundle on the client AND import from
 * Node's type-stripping. Content chapter files import only from here.
 */

export type LessonTestSpec = {
  /** Named checks the testbench emits, in UI display order. */
  tests: string[];
  /**
   * The testbench source (module top_tb) that drives `top`. Optional because
   * a problem-set entry in this map carries a starter but no client-visible
   * bench — its hidden bench lives in lib/server/psets.
   */
  tb?: string;
  /** Initial editor files. Defaults to the global STARTER_FILES. */
  starter?: Record<string, string>;
  /** Icarus generation; "2012" accepts both verilog-2001 and SystemVerilog. */
  generation?: "2005" | "2005-sv" | "2009" | "2012" | "2017" | "2023";
};

export type PSetTestSpec = {
  /** Named hidden vectors, in UI display order. */
  testNames: string[];
  /** Hidden graded testbench — server-only, never bundled to the client. */
  tb: string;
  generation?: "2005" | "2005-sv" | "2009" | "2012" | "2017" | "2023";
  /** Score the pset contributes once all vectors pass. */
  points?: number;
};

export function mergeMaps<T extends Record<string, unknown>>(
  maps: T[],
): Record<string, T[string]> {
  return Object.assign({}, ...maps) as Record<string, T[string]>;
}