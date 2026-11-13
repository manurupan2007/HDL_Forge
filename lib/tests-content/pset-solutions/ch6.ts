/** Reference top.sv for the chapter 6 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH6: Record<string, string> = {
  "arithmetic:signed-magnitude-compare": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire       alt,
  output wire       aeq,
  output wire       agt
);
  // One-hot signed comparison flags: exactly one is high for any a, b.
  assign aeq = (a == b);
  assign alt = ($signed(a) < $signed(b));
  assign agt = ($signed(a) > $signed(b));
endmodule
`,
};