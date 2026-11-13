/** Reference top.sv solutions for chapter 10. Verify scripts only; never bundled. */
export const SOLUTIONS_CH10: Record<string, string> = {
  "shift-registers:shifter-family": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire load,
  input  wire dir,        // 1 = shift left, 0 = shift right
  input  wire sin,        // serial input
  input  wire [3:0] d,    // parallel load
  output reg  [3:0] q,
  output wire sout        // bit leaving the register
);
  assign sout = dir ? q[3] : q[0];
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 4'b0000;
    else if (load) q <= d;              // load overrides shifting
    else if (dir) q <= {q[2:0], sin};   // shift left: new bit at bit 0
    else q <= {sin, q[3:1]};            // shift right: new bit at bit 3
  end
endmodule
`,
  "shift-registers:barrel-shifter": `module top (
  input  wire [7:0] d,
  input  wire [2:0] sh,
  input  wire       left,
  input  wire       rot,
  output wire [7:0] y
);
  // One-cycle variable shift. When rot=1 the bits that leave one end
  // re-enter the other: (d << sh) | (d >> (8 - sh)) rotates left.
  assign y = rot
    ? (left ? ((d << sh) | (d >> (8 - sh)))
            : ((d >> sh) | (d << (8 - sh))))
    : (left ? (d << sh) : (d >> sh));
endmodule
`,
};