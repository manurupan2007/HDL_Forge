/** Reference top.sv for the chapter 2 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH2: Record<string, string> = {
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