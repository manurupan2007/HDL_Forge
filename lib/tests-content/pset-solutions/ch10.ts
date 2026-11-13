/** Reference top.sv for the chapter 10 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH10: Record<string, string> = {
  "shift-registers:barrel-shifter": `module top (
  input  wire [7:0] d,
  input  wire [2:0] amt,
  output wire [7:0] y
);
  // Combinational barrel rotate left by amt in a single cycle.
  // amt=0: (d << 0) | (d >> 8) = d | 0 = d.
  assign y = (d << amt) | (d >> (8 - amt));
endmodule
`,
};