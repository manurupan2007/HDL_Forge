import type { LessonTestSpec } from "../types";

// Lessons in chapter 6. See gold template lib/tests-content/lessons/ch1.ts for
// CONVENTIONS: [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
// starter that fails >=1 test, solution in ../solutions/ch6.ts, generation "2012".
// Expected keys:
//   arithmetic:twos-complement,
//   arithmetic:signed-magnitude-compare,
export const LESSONS_CH6: Record<string, LessonTestSpec> = {
  "arithmetic:twos-complement": {
    tests: [
      "neg of 4'b0010 is 4'b1110",
      "neg of 4'b0000 is 4'b0000",
      "neg of 4'b1000 (-8) wraps to itself",
      "sign-extend 4'b1111 (-1) to 8 bits",
      "sign-extend 4'b0011 (+3) to 8 bits",
      "2 + 5 = 7 with no overflow",
      "7 + 1 overflows signed",
      "-1 + 1 = 0 with no overflow",
      "-8 + -1 overflows signed",
      "-4 + -4 = -8 with no overflow",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] x,
  input  wire [3:0] y,
  output wire [3:0] neg,
  output wire [7:0] ext8,
  output wire [3:0] sum,
  output wire       ovf
);
  // TODO: negate with ~x + 1, sign-extend with the sign bit, and flag
  // signed overflow when both operands share a sign but the result does not.
  assign neg  = ~x + 4'b0001;
  assign ext8 = {4'b0000, x};   // zero-extension: wrong for negative x
  assign sum  = x + y;
  assign ovf  = 1'b0;           // overflow never flagged: wrong
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] x, y, neg, sum;
  logic [7:0] ext8;
  logic ovf;
  integer errors = 0;

  top dut (x, y, neg, ext8, sum, ovf);

  task check(input string name, input logic [3:0] vx, input logic [3:0] vy,
             input logic [3:0] exp_neg, input logic [7:0] exp_ext8,
             input logic [3:0] exp_sum, input logic exp_ovf);
    begin
      x = vx;
      y = vy;
      #1;
      if (neg === exp_neg && ext8 === exp_ext8 && sum === exp_sum && ovf === exp_ovf) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: x=%b y=%b neg=%b ext8=%b sum=%b ovf=%b expected neg=%b ext8=%b sum=%b ovf=%b",
                 name, x, y, neg, ext8, sum, ovf, exp_neg, exp_ext8, exp_sum, exp_ovf);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("neg of 4'b0010 is 4'b1110", 4'b0010, 4'b0000, 4'b1110, 8'b00000010, 4'b0010, 1'b0);
    check("neg of 4'b0000 is 4'b0000", 4'b0000, 4'b0000, 4'b0000, 8'b00000000, 4'b0000, 1'b0);
    check("neg of 4'b1000 (-8) wraps to itself", 4'b1000, 4'b0000, 4'b1000, 8'b11111000, 4'b1000, 1'b0);
    check("sign-extend 4'b1111 (-1) to 8 bits", 4'b1111, 4'b0000, 4'b0001, 8'b11111111, 4'b1111, 1'b0);
    check("sign-extend 4'b0011 (+3) to 8 bits", 4'b0011, 4'b0000, 4'b1101, 8'b00000011, 4'b0011, 1'b0);
    check("2 + 5 = 7 with no overflow", 4'b0010, 4'b0101, 4'b1110, 8'b00000010, 4'b0111, 1'b0);
    check("7 + 1 overflows signed", 4'b0111, 4'b0001, 4'b1001, 8'b00000111, 4'b1000, 1'b1);
    check("-1 + 1 = 0 with no overflow", 4'b1111, 4'b0001, 4'b0001, 8'b11111111, 4'b0000, 1'b0);
    check("-8 + -1 overflows signed", 4'b1000, 4'b1111, 4'b1000, 8'b11111000, 4'b0111, 1'b1);
    check("-4 + -4 = -8 with no overflow", 4'b1100, 4'b1100, 4'b0100, 8'b11111100, 4'b1000, 1'b0);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "arithmetic:signed-magnitude-compare": {
    tests: [
      "signed: -4 < 3 while unsigned 12 > 3",
      "signed: -1 == -1",
      "signed: 7 > -8 while unsigned 7 < 8",
      "signed: -3 < -2 (same sign)",
      "signed: -1 < 1 while unsigned 15 > 1",
      "signed: 5 < 6 matches unsigned",
      "signed: 0 == 0",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [1:0] cmp_s,
  output wire [1:0] cmp_u
);
  // TODO: reinterpret a and b with $signed() for cmp_s — the bits are the
  // same, the meaning is not. This version compares unsigned both ways.
  assign cmp_s = (a < b) ? 2'd0 : (a == b) ? 2'd1 : 2'd2;
  assign cmp_u = (a < b) ? 2'd0 : (a == b) ? 2'd1 : 2'd2;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b;
  logic [1:0] cmp_s, cmp_u;
  integer errors = 0;

  top dut (a, b, cmp_s, cmp_u);

  task check(input string name, input logic [3:0] va, input logic [3:0] vb,
             input logic [1:0] exp_s, input logic [1:0] exp_u);
    begin
      a = va;
      b = vb;
      #1;
      if (cmp_s === exp_s && cmp_u === exp_u) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b cmp_s=%0d cmp_u=%0d expected cmp_s=%0d cmp_u=%0d",
                 name, a, b, cmp_s, cmp_u, exp_s, exp_u);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("signed: -4 < 3 while unsigned 12 > 3", 4'b1100, 4'b0011, 2'd0, 2'd2);
    check("signed: -1 == -1", 4'b1111, 4'b1111, 2'd1, 2'd1);
    check("signed: 7 > -8 while unsigned 7 < 8", 4'b0111, 4'b1000, 2'd2, 2'd0);
    check("signed: -3 < -2 (same sign)", 4'b1101, 4'b1110, 2'd0, 2'd0);
    check("signed: -1 < 1 while unsigned 15 > 1", 4'b1111, 4'b0001, 2'd0, 2'd2);
    check("signed: 5 < 6 matches unsigned", 4'b0101, 4'b0110, 2'd0, 2'd0);
    check("signed: 0 == 0", 4'b0000, 4'b0000, 2'd1, 2'd1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};