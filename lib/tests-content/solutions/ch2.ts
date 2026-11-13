/** Reference top.sv solutions for chapter 2. Verify scripts only; never bundled. */
export const SOLUTIONS_CH2: Record<string, string> = {
  "logic-gates:gate-primitives": `module top (
  input  wire a,
  input  wire b,
  output wire y_and,
  output wire y_or,
  output wire y_nand,
  output wire y_xor
);
  assign y_and  = a & b;
  assign y_or   = a | b;
  assign y_nand = ~(a & b);
  // XOR from four 2-input NANDs:
  //   a ^ b = nand(nand(a, nand(a,b)), nand(b, nand(a,b)))
  wire n1, n2, n3;
  nand g1(n1, a, b);
  nand g2(n2, a, n1);
  nand g3(n3, b, n1);
  nand g4(y_xor, n2, n3);
endmodule
`,
  "logic-gates:gate-netlist-designer": `module top (
  input  wire a,
  input  wire b,
  input  wire c,
  input  wire d,
  output wire y
);
  // y = (a & b) | (c & d) with NANDs only:
  //   n1 = ~(a & b), n2 = ~(c & d)
  //   y  = ~(n1 & n2) = (a & b) | (c & d)   (De Morgan)
  wire n1, n2;
  nand g1(n1, a, b);
  nand g2(n2, c, d);
  nand g3(y, n1, n2);
endmodule
`,
};