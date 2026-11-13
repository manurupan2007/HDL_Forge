/**
 * Reference top.sv solutions for chapter 1 lessons. Imported ONLY by the
 * verification script (never by the app), so these can never reach the client.
 */
export const SOLUTIONS_CH1: Record<string, string> = {
  "synthesis-foundations:bits-and-truth-tables": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y
);
  assign y = (a == 4'b0011) && (b == 4'b0001) ? 4'b0001 : 4'b0000;
endmodule
`,
};