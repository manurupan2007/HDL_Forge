/** Reference top.sv for the chapter 5 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH5: Record<string, string> = {
  "adders:nibble-adder": `module full_adder (
  input  wire a, b, cin,
  output wire sum, cout
);
  wire s1, c1, c2;
  assign s1  = a ^ b;
  assign c1  = a & b;
  assign sum = s1 ^ cin;
  assign c2  = s1 & cin;
  assign cout = c1 | c2;
endmodule

module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  input  wire       cin,
  output wire [3:0] sum,
  output wire       cout
);
  wire c0, c1, c2;
  full_adder fa0 (.a(a[0]), .b(b[0]), .cin(cin),  .sum(sum[0]), .cout(c0));
  full_adder fa1 (.a(a[1]), .b(b[1]), .cin(c0),   .sum(sum[1]), .cout(c1));
  full_adder fa2 (.a(a[2]), .b(b[2]), .cin(c1),   .sum(sum[2]), .cout(c2));
  full_adder fa3 (.a(a[3]), .b(b[3]), .cin(c2),   .sum(sum[3]), .cout(cout));
endmodule
`,
};