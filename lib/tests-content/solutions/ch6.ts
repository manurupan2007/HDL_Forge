/** Reference top.sv solutions for chapter 6. Verify scripts only; never bundled. */
export const SOLUTIONS_CH6: Record<string, string> = {
  "arithmetic:twos-complement": `module top (
  input  wire [3:0] x,
  input  wire [3:0] y,
  output wire [3:0] neg,
  output wire [7:0] ext8,
  output wire [3:0] sum,
  output wire       ovf
);
  // Two's-complement negation: invert every bit, then add one.
  assign neg  = ~x + 4'b0001;
  // Sign-extension: fill the upper bits with a copy of the sign bit.
  assign ext8 = {{4{x[3]}}, x};
  // 4-bit wrap-around addition; overflow is a signed-view property.
  assign sum  = x + y;
  // Signed overflow: both operands share a sign, the result does not.
  assign ovf  = (x[3] == y[3]) && (sum[3] != x[3]);
endmodule
`,
  "arithmetic:signed-magnitude-compare": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [1:0] cmp_s,
  output wire [1:0] cmp_u
);
  // 0 = less, 1 = equal, 2 = greater.
  // $signed() reinterprets the same bits so 4'b1111 means -1, not 15.
  assign cmp_s = ($signed(a) < $signed(b)) ? 2'd0 :
                 (a == b)                   ? 2'd1 : 2'd2;
  assign cmp_u = (a < b) ? 2'd0 : (a == b) ? 2'd1 : 2'd2;
endmodule
`,
};