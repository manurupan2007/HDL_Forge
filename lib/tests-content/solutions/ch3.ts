/** Reference top.sv solutions for chapter 3. Verify scripts only; never bundled. */
export const SOLUTIONS_CH3: Record<string, string> = {
  "combinational-expressions:operators-and-precedence": `module top (
  input  wire [3:0] a, b, c, d,
  output wire [3:0] y_paren,
  output wire [3:0] y_plain,
  output wire       red_and,
  output wire       red_or,
  output wire       red_xor
);
  // Explicit grouping — the safe spelling.
  assign y_paren = (a & b) | (c & d);
  // Same function without parens: & binds tighter than |.
  assign y_plain = a & b | c & d;
  // Unary reductions squash the whole vector to one bit.
  assign red_and = &a;
  assign red_or  = |a;
  assign red_xor = ^a;
endmodule
`,
  "combinational-expressions:vector-slices": `module top (
  input  wire [7:0] a,
  output wire [7:0] swapped,
  output wire [3:0] low_nibble,
  output wire [3:0] high_nibble,
  output wire [7:0] doubled
);
  assign swapped     = {a[3:0], a[7:4]};   // nibble swap in one assign
  assign low_nibble  = a[3:0];
  assign high_nibble = a[7:4];
  assign doubled     = {2{a[3:0]}};        // replicate the low nibble twice
endmodule
`,
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