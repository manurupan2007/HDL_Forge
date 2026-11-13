/** Reference top.sv for the chapter 1 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH1: Record<string, string> = {
  "synthesis-foundations:truth-table-synthesizer": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y
);
  assign y = (a == 4'b0011) && (b == 4'b0001) ? 4'b0001 : 4'b0000;
endmodule
`,
};