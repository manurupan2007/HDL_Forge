/** Reference top.sv for the chapter 3 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH3: Record<string, string> = {
  "combinational-expressions:expression-evaluator": `module top (
  input  wire [3:0] a, b, c, d,
  output wire [3:0] y,
  output wire [3:0] z
);
  // Multi-term function with explicit grouping.
  assign y = (a & b) | ((c & d) ^ (a | d));
  // Precedence does the grouping here: & binds tighter than |.
  assign z = a & b | c & d;
endmodule
`,
};