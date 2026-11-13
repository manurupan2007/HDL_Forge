/**
 * Chapter 5 — Adder Circuits.
 *
 * CONVENTIONS (see gold template lib/tests-content/lessons/ch1.ts):
 * [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
 * starter that fails >=1 test, solution in ../solutions/ch5.ts, generation "2012".
 * Starter/solution are plain verilog-2001 (wire/reg, assign, generate);
 * the testbench may use SV logic/tasks.
 */
import type { LessonTestSpec } from "../types";

export const LESSONS_CH5: Record<string, LessonTestSpec> = {
  "adders:half-and-full-adder": {
    tests: [
      "a=0,b=0,cin=0 -> sum=0,cout=0",
      "a=0,b=0,cin=1 -> sum=1,cout=0",
      "a=0,b=1,cin=0 -> sum=1,cout=0",
      "a=0,b=1,cin=1 -> sum=0,cout=1",
      "a=1,b=0,cin=0 -> sum=1,cout=0",
      "a=1,b=0,cin=1 -> sum=0,cout=1",
      "a=1,b=1,cin=0 -> sum=0,cout=1",
      "a=1,b=1,cin=1 -> sum=1,cout=1",
    ],
    starter: {
      "top.sv": `module top (
  input  wire a,
  input  wire b,
  input  wire cin,
  output wire sum,
  output wire cout
);
  // TODO: this is only a half adder — it ignores cin.
  // Full adder: sum = a ^ b ^ cin; cout = (a & b) | ((a ^ b) & cin).
  assign sum  = a ^ b;
  assign cout = a & b;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic a, b, cin;
  logic sum, cout;
  integer errors = 0;

  top dut (a, b, cin, sum, cout);

  task check(input string name, input logic wa, input logic wb, input logic wcin,
             input logic esum, input logic ecout);
    begin
      a = wa; b = wb; cin = wcin;
      #1;
      if (sum === esum && cout === ecout) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b cin=%b sum=%b cout=%b expected sum=%b cout=%b",
                 name, a, b, cin, sum, cout, esum, ecout);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("a=0,b=0,cin=0 -> sum=0,cout=0", 1'b0, 1'b0, 1'b0, 1'b0, 1'b0);
    check("a=0,b=0,cin=1 -> sum=1,cout=0", 1'b0, 1'b0, 1'b1, 1'b1, 1'b0);
    check("a=0,b=1,cin=0 -> sum=1,cout=0", 1'b0, 1'b1, 1'b0, 1'b1, 1'b0);
    check("a=0,b=1,cin=1 -> sum=0,cout=1", 1'b0, 1'b1, 1'b1, 1'b0, 1'b1);
    check("a=1,b=0,cin=0 -> sum=1,cout=0", 1'b1, 1'b0, 1'b0, 1'b1, 1'b0);
    check("a=1,b=0,cin=1 -> sum=0,cout=1", 1'b1, 1'b0, 1'b1, 1'b0, 1'b1);
    check("a=1,b=1,cin=0 -> sum=0,cout=1", 1'b1, 1'b1, 1'b0, 1'b0, 1'b1);
    check("a=1,b=1,cin=1 -> sum=1,cout=1", 1'b1, 1'b1, 1'b1, 1'b1, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "adders:ripple-carry": {
    tests: [
      "0+0+0 = 0, no carry",
      "3+5+0 = 8, no carry",
      "7+8+0 = 15, no carry",
      "15+0+1 = 0, carry out",
      "15+15+1 = 15, carry out",
      "5+5+1 = 11, no carry",
      "8+8+0 = 0, carry out",
    ],
    starter: {
      "top.sv": `module top #(
  parameter N = 4
)(
  input  wire [N-1:0] a,
  input  wire [N-1:0] b,
  input  wire         cin,
  output wire [N-1:0] sum,
  output wire         cout
);
  // TODO: chain N full adders so carries ripple from column to
  // column. This version ignores the carry chain entirely.
  assign sum  = a ^ b;
  assign cout = cin;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b;
  logic cin;
  logic [3:0] sum;
  logic cout;
  logic [4:0] exp;
  integer errors = 0;

  top dut (a, b, cin, sum, cout);

  task check(input string name, input logic [3:0] wa, input logic [3:0] wb,
             input logic wcin);
    begin
      a = wa; b = wb; cin = wcin;
      exp = {1'b0, wa} + {1'b0, wb} + wcin;
      #1;
      if ({cout, sum} === exp) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b cin=%b sum=%b cout=%b expected sum=%b cout=%b",
                 name, a, b, cin, sum, cout, exp[3:0], exp[4]);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("0+0+0 = 0, no carry",     4'b0000, 4'b0000, 1'b0);
    check("3+5+0 = 8, no carry",     4'b0011, 4'b0101, 1'b0);
    check("7+8+0 = 15, no carry",    4'b0111, 4'b1000, 1'b0);
    check("15+0+1 = 0, carry out",   4'b1111, 4'b0000, 1'b1);
    check("15+15+1 = 15, carry out", 4'b1111, 4'b1111, 1'b1);
    check("5+5+1 = 11, no carry",    4'b0101, 4'b0101, 1'b1);
    check("8+8+0 = 0, carry out",    4'b1000, 4'b1000, 1'b0);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "adders:nibble-adder": {
    tests: [
      "0+0+0 = 0, no carry",
      "1+1+0 = 2, no carry",
      "7+1+0 = 8, no carry",
      "15+0+1 = 0, carry out",
      "15+15+1 = 15, carry out",
      "8+7+1 = 0, carry out",
      "5+10+0 = 15, no carry",
      "3+3+1 = 7, no carry",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  input  wire       cin,
  output wire [3:0] sum,
  output wire       cout
);
  // TODO: chain four full adders so every carry path works.
  // This version drops the carry-in and never emits a carry-out.
  assign sum  = a + b;
  assign cout = 1'b0;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b;
  logic cin;
  logic [3:0] sum;
  logic cout;
  logic [4:0] exp;
  integer errors = 0;

  top dut (a, b, cin, sum, cout);

  task check(input string name, input logic [3:0] wa, input logic [3:0] wb,
             input logic wcin);
    begin
      a = wa; b = wb; cin = wcin;
      exp = {1'b0, wa} + {1'b0, wb} + wcin;
      #1;
      if ({cout, sum} === exp) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b cin=%b sum=%b cout=%b expected sum=%b cout=%b",
                 name, a, b, cin, sum, cout, exp[3:0], exp[4]);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("0+0+0 = 0, no carry",     4'b0000, 4'b0000, 1'b0);
    check("1+1+0 = 2, no carry",     4'b0001, 4'b0001, 1'b0);
    check("7+1+0 = 8, no carry",     4'b0111, 4'b0001, 1'b0);
    check("15+0+1 = 0, carry out",   4'b1111, 4'b0000, 1'b1);
    check("15+15+1 = 15, carry out", 4'b1111, 4'b1111, 1'b1);
    check("8+7+1 = 0, carry out",    4'b1000, 4'b0111, 1'b1);
    check("5+10+0 = 15, no carry",   4'b0101, 4'b1010, 1'b0);
    check("3+3+1 = 7, no carry",     4'b0011, 4'b0011, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
};