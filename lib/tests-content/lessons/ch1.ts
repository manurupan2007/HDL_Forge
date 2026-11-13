/**
 * Chapter 1 — Synthesis Foundations.
 *
 * CONVENTIONS (read before authoring any other chapter):
 * 1. `top` is the DUT module in top.sv with fixed port names. The testbench
 *    declares `module top_tb;` and instantiates `top dut (...)`.
 * 2. Testbench protocol: print `[PASS] <name>` and `[FAIL] <name>: <reason>`,
 *    then at the end `$display("SUMMARY %0d errors", errors); $finish;`.
 *    Test names MUST match the `tests` array exactly.
 * 3. Always `$dumpfile("wave.vcd"); $dumpvars(0, top_tb);` so the API can
 *    return a waveform. Use `#1` after driving inputs before asserting.
 * 4. Compare outputs with `===` (4-state aware), never `==`.
 * 5. Every lesson also gets a `starter` (compiles, but FAILS at least one
 *    test so the student has something to fix) and — in the parallel
 *    solutions/chN.ts file — a reference top.sv that passes all tests.
 * 6. `generation: "2012"` for every entry (accepts 2001-style reg/wire AND
 *    SystemVerilog always_ff/logic). Time unit: 1ps/1ps.
 */
import type { LessonTestSpec } from "../types";

export const LESSONS_CH1: Record<string, LessonTestSpec> = {
  "synthesis-foundations:bits-and-truth-tables": {
    tests: [
      "a=3,b=1 drives y=1",
      "a=3,b=0 clears y",
      "a=2,b=1 clears y",
      "a=15,b=1 clears y",
      "a=0,b=0 clears y",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y
);
  // TODO: complete the truth table — y is 4'b0001 only when
  // a == 4'b0011 AND b == 4'b0001, otherwise 4'b0000.
  assign y = 4'b0000;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, y;
  integer errors = 0;

  top dut (a, b, y);

  task check(input string name, input logic [3:0] wire_a,
             input logic [3:0] wire_b, input logic [3:0] exp_y);
    begin
      a = wire_a;
      b = wire_b;
      #1;
      if (y === exp_y) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%b b=%b y=%b expected %b", name, a, b, y, exp_y);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("a=3,b=1 drives y=1",  4'b0011, 4'b0001, 4'b0001);
    check("a=3,b=0 clears y",    4'b0011, 4'b0000, 4'b0000);
    check("a=2,b=1 clears y",    4'b0010, 4'b0001, 4'b0000);
    check("a=15,b=1 clears y",   4'b1111, 4'b0001, 4'b0000);
    check("a=0,b=0 clears y",    4'b0000, 4'b0000, 4'b0000);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "synthesis-foundations:truth-table-synthesizer": {
    tests: [
      "all rows 0..63 match the truth table",
      "all rows 64..127 match the truth table",
      "all rows 128..191 match the truth table",
      "all rows 192..255 match the truth table",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y
);
  // TODO: complete the function — y is 4'b0001 only when
  // a == 4'b0011 AND b == 4'b0001; otherwise 4'b0000.
  assign y = 4'b0000;
endmodule
`,
    },
  },
};
