/**
 * Chapter 2 — Logic Gates.
 *
 * CONVENTIONS (see gold template lib/tests-content/lessons/ch1.ts):
 * [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
 * starter that fails >=1 test, solution in ../solutions/ch2.ts, generation "2012".
 * Starter/solution are plain verilog-2001 (wire/reg, assign, gate primitives);
 * the testbench may use SV logic/tasks.
 */
import type { LessonTestSpec } from "../types";

export const LESSONS_CH2: Record<string, LessonTestSpec> = {
  "logic-gates:gate-primitives": {
    tests: [
      "a=0,b=0 all gates",
      "a=0,b=1 all gates",
      "a=1,b=0 all gates",
      "a=1,b=1 all gates",
    ],
    starter: {
      "top.sv": `module top (
  input  wire a,
  input  wire b,
  output wire y_and,
  output wire y_or,
  output wire y_nand,
  output wire y_xor
);
  // TODO: y_and and y_or are done; fix y_nand and y_xor.
  // y_nand must be ~(a & b); y_xor must be a ^ b (build it from
  // four 2-input NAND primitives).
  assign y_and  = a & b;
  assign y_or   = a | b;
  assign y_nand = a & b;      // WRONG: this is AND, not NAND
  assign y_xor  = a & b;      // WRONG: this is AND, not XOR
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic a, b;
  logic y_and, y_or, y_nand, y_xor;
  integer errors = 0;

  top dut (a, b, y_and, y_or, y_nand, y_xor);

  task check(input string name, input logic wa, input logic wb,
             input logic e_and, input logic e_or,
             input logic e_nand, input logic e_xor);
    begin
      a = wa;
      b = wb;
      #1;
      if (y_and === e_and && y_or === e_or &&
          y_nand === e_nand && y_xor === e_xor) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b and=%b or=%b nand=%b xor=%b expected and=%b or=%b nand=%b xor=%b",
                 name, a, b, y_and, y_or, y_nand, y_xor,
                 e_and, e_or, e_nand, e_xor);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("a=0,b=0 all gates", 1'b0, 1'b0, 1'b0, 1'b0, 1'b1, 1'b0);
    check("a=0,b=1 all gates", 1'b0, 1'b1, 1'b0, 1'b1, 1'b1, 1'b1);
    check("a=1,b=0 all gates", 1'b1, 1'b0, 1'b0, 1'b1, 1'b1, 1'b1);
    check("a=1,b=1 all gates", 1'b1, 1'b1, 1'b1, 1'b1, 1'b0, 1'b0);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "logic-gates:gate-netlist-designer": {
    tests: [
      "rows 0..3 match (a&b)|(c&d)",
      "rows 4..7 match (a&b)|(c&d)",
      "rows 8..11 match (a&b)|(c&d)",
      "rows 12..15 match (a&b)|(c&d)",
    ],
    starter: {
      "top.sv": `module top (
  input  wire a,
  input  wire b,
  input  wire c,
  input  wire d,
  output wire y
);
  // TODO: y = (a & b) | (c & d) using ONLY 2-input NAND primitives.
  // Current version only covers the first product term.
  assign y = a & b;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic a, b, c, d, y;
  integer errors = 0;
  integer row;
  integer gerr;

  top dut (a, b, c, d, y);

  task check_group(input string name, input integer lo, input integer hi);
    begin
      gerr = 0;
      for (row = lo; row <= hi; row = row + 1) begin
        a = row[0];
        b = row[1];
        c = row[2];
        d = row[3];
        #1;
        if (y !== ((a & b) | (c & d))) begin
          gerr = gerr + 1;
          errors = errors + 1;
          if (gerr <= 3) begin
            $display("[FAIL] %s: row %0d a=%b b=%b c=%b d=%b y=%b expected %b",
                     name, row, a, b, c, d, y, (a & b) | (c & d));
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("rows 0..3 match (a&b)|(c&d)",   0,  3);
    check_group("rows 4..7 match (a&b)|(c&d)",   4,  7);
    check_group("rows 8..11 match (a&b)|(c&d)",  8, 11);
    check_group("rows 12..15 match (a&b)|(c&d)", 12, 15);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
};