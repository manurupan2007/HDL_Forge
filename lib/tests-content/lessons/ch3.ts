/**
 * Chapter 3 — Combinational Expressions.
 *
 * CONVENTIONS (see gold template lib/tests-content/lessons/ch1.ts):
 * [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
 * starter that fails >=1 test, solution in ../solutions/ch3.ts, generation "2012".
 * Starter/solution are plain verilog-2001 (wire/reg, assign);
 * the testbench may use SV logic/tasks.
 */
import type { LessonTestSpec } from "../types";

export const LESSONS_CH3: Record<string, LessonTestSpec> = {
  "combinational-expressions:operators-and-precedence": {
    tests: [
      "a=1010,b=1100,c=0011,d=0101",
      "a=0000,b=1111,c=1111,d=0000",
      "a=1111,b=0000,c=0000,d=1111",
      "a=0101,b=1010,c=1010,d=0101",
      "a=1001,b=0110,c=0001,d=1000",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a, b, c, d,
  output wire [3:0] y_paren,
  output wire [3:0] y_plain,
  output wire       red_and,
  output wire       red_or,
  output wire       red_xor
);
  // TODO: fix the mis-grouped and partial expressions.
  // y_paren = (a & b) | (c & d)  — done.
  // y_plain must equal the same function WITHOUT parens
  //          (& binds tighter than |).
  // red_* must reduce ALL FOUR bits of a, not just two.
  assign y_paren = (a & b) | (c & d);
  assign y_plain = a & (b | c) & d;   // WRONG grouping
  assign red_and = a[0] & a[1];       // WRONG: partial reduction
  assign red_or  = a[0] | a[1];       // WRONG: partial reduction
  assign red_xor = a[0] ^ a[1];       // WRONG: partial reduction
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, c, d;
  logic [3:0] y_paren, y_plain;
  logic red_and, red_or, red_xor;
  integer errors = 0;

  top dut (a, b, c, d, y_paren, y_plain, red_and, red_or, red_xor);

  task check(input string name, input logic [3:0] wa, input logic [3:0] wb,
             input logic [3:0] wc, input logic [3:0] wd);
    begin
      a = wa; b = wb; c = wc; d = wd;
      #1;
      if (y_paren === ((wa & wb) | (wc & wd)) &&
          y_plain === ((wa & wb) | (wc & wd)) &&
          red_and === &wa && red_or === |wa && red_xor === ^wa) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b c=%b d=%b y_paren=%b y_plain=%b red_and=%b red_or=%b red_xor=%b expected y=%b red_and=%b red_or=%b red_xor=%b",
                 name, a, b, c, d, y_paren, y_plain, red_and, red_or, red_xor,
                 (wa & wb) | (wc & wd), &wa, |wa, ^wa);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("a=1010,b=1100,c=0011,d=0101", 4'b1010, 4'b1100, 4'b0011, 4'b0101);
    check("a=0000,b=1111,c=1111,d=0000", 4'b0000, 4'b1111, 4'b1111, 4'b0000);
    check("a=1111,b=0000,c=0000,d=1111", 4'b1111, 4'b0000, 4'b0000, 4'b1111);
    check("a=0101,b=1010,c=1010,d=0101", 4'b0101, 4'b1010, 4'b1010, 4'b0101);
    check("a=1001,b=0110,c=0001,d=1000", 4'b1001, 4'b0110, 4'b0001, 4'b1000);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "combinational-expressions:vector-slices": {
    tests: [
      "a=8'h12 swaps to 8'h21",
      "a=8'hAB swaps to 8'hBA",
      "a=8'h00 stays 8'h00",
      "a=8'hF0 swaps to 8'h0F",
      "a=8'h5A swaps to 8'hA5",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [7:0] a,
  output wire [7:0] swapped,
  output wire [3:0] low_nibble,
  output wire [3:0] high_nibble,
  output wire [7:0] doubled
);
  // TODO: fix the slice directions and the replication.
  // swapped = {a[3:0], a[7:4]}; low = a[3:0]; high = a[7:4];
  // doubled = {2{a[3:0]}}.
  assign swapped     = a;                 // WRONG: no swap
  assign low_nibble  = a[7:4];            // WRONG: that is the high nibble
  assign high_nibble = a[3:0];            // WRONG: that is the low nibble
  assign doubled     = {a[7:4], a[3:0]};  // WRONG: that is the swap, not a replicate
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] a;
  logic [7:0] swapped, doubled;
  logic [3:0] low_nibble, high_nibble;
  integer errors = 0;

  top dut (a, swapped, low_nibble, high_nibble, doubled);

  task check(input string name, input logic [7:0] wa);
    begin
      a = wa;
      #1;
      if (swapped === {wa[3:0], wa[7:4]} &&
          low_nibble === wa[3:0] &&
          high_nibble === wa[7:4] &&
          doubled === {2{wa[3:0]}}) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%h swapped=%h low=%h high=%h doubled=%h expected swapped=%h low=%h high=%h doubled=%h",
                 name, a, swapped, low_nibble, high_nibble, doubled,
                 {wa[3:0], wa[7:4]}, wa[3:0], wa[7:4], {2{wa[3:0]}});
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("a=8'h12 swaps to 8'h21", 8'h12);
    check("a=8'hAB swaps to 8'hBA", 8'hAB);
    check("a=8'h00 stays 8'h00",   8'h00);
    check("a=8'hF0 swaps to 8'h0F", 8'hF0);
    check("a=8'h5A swaps to 8'hA5", 8'h5A);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "combinational-expressions:expression-evaluator": {
    tests: [
      "a=1010,b=1100,c=0011,d=0101",
      "a=0000,b=1111,c=1111,d=0000",
      "a=1111,b=0000,c=0000,d=1111",
      "a=0101,b=1010,c=1010,d=0101",
      "a=1001,b=0110,c=0001,d=1000",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a, b, c, d,
  output wire [3:0] y,
  output wire [3:0] z
);
  // TODO: y = (a & b) | ((c & d) ^ (a | d))
  //       z = (a & b) | (c & d)   — & binds tighter than |, so
  //           z can be written without parens.
  assign y = a & b;              // WRONG: missing the second term
  assign z = a & (b | c) & d;    // WRONG: mis-grouped
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, c, d;
  logic [3:0] y, z;
  integer errors = 0;

  top dut (a, b, c, d, y, z);

  task check(input string name, input logic [3:0] wa, input logic [3:0] wb,
             input logic [3:0] wc, input logic [3:0] wd);
    begin
      a = wa; b = wb; c = wc; d = wd;
      #1;
      if (y === ((wa & wb) | ((wc & wd) ^ (wa | wd))) &&
          z === ((wa & wb) | (wc & wd))) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b c=%b d=%b y=%b z=%b expected y=%b z=%b",
                 name, a, b, c, d, y, z,
                 (wa & wb) | ((wc & wd) ^ (wa | wd)), (wa & wb) | (wc & wd));
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("a=1010,b=1100,c=0011,d=0101", 4'b1010, 4'b1100, 4'b0011, 4'b0101);
    check("a=0000,b=1111,c=1111,d=0000", 4'b0000, 4'b1111, 4'b1111, 4'b0000);
    check("a=1111,b=0000,c=0000,d=1111", 4'b1111, 4'b0000, 4'b0000, 4'b1111);
    check("a=0101,b=1010,c=1010,d=0101", 4'b0101, 4'b1010, 4'b1010, 4'b0101);
    check("a=1001,b=0110,c=0001,d=1000", 4'b1001, 4'b0110, 4'b0001, 4'b1000);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
};