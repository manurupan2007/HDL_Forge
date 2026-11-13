/**
 * Chapter 4 — Multiplexers & Selectors.
 *
 * CONVENTIONS (see gold template lib/tests-content/lessons/ch1.ts):
 * [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
 * starter that fails >=1 test, solution in ../solutions/ch4.ts, generation "2012".
 * Starter/solution are plain verilog-2001 (wire/reg, assign, always @(*));
 * the testbench may use SV logic/tasks.
 */
import type { LessonTestSpec } from "../types";

export const LESSONS_CH4: Record<string, LessonTestSpec> = {
  "multiplexers:mux-circuits": {
    tests: [
      "s=0 routes a to y2",
      "s=1 routes b to y2",
      "sel=00 routes a to y4",
      "sel=01 routes b to y4",
      "sel=10 routes c to y4",
      "sel=11 routes d to y4",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a, b, c, d,
  input  wire       s,
  input  wire [1:0] sel,
  output wire [3:0] y2,
  output reg  [3:0] y4
);
  // TODO: fix the 2:1 select and the 4:1 case mapping.
  // y2 = s ? b : a;  y4: sel=00->a, 01->b, 10->c, default->d.
  assign y2 = a;                 // WRONG: ignores s
  always @(*) begin
    case (sel)
      2'b00:   y4 = a;
      2'b01:   y4 = b;
      2'b10:   y4 = d;           // WRONG: swapped with default
      default: y4 = c;
    endcase
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, c, d;
  logic s;
  logic [1:0] sel;
  logic [3:0] y2, y4;
  integer errors = 0;

  top dut (a, b, c, d, s, sel, y2, y4);

  task check(input string name, input logic [3:0] wa, input logic [3:0] wb,
             input logic [3:0] wc, input logic [3:0] wd,
             input logic ws, input logic [1:0] wsel,
             input logic [3:0] e2, input logic [3:0] e4);
    begin
      a = wa; b = wb; c = wc; d = wd; s = ws; sel = wsel;
      #1;
      if (y2 === e2 && y4 === e4) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: s=%b sel=%b y2=%h y4=%h expected y2=%h y4=%h",
                 name, s, sel, y2, y4, e2, e4);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("s=0 routes a to y2",      4'hA, 4'hB, 4'hC, 4'hD, 1'b0, 2'b00, 4'hA, 4'hA);
    check("s=1 routes b to y2",      4'hA, 4'hB, 4'hC, 4'hD, 1'b1, 2'b01, 4'hB, 4'hB);
    check("sel=00 routes a to y4",   4'hA, 4'hB, 4'hC, 4'hD, 1'b0, 2'b00, 4'hA, 4'hA);
    check("sel=01 routes b to y4",   4'hA, 4'hB, 4'hC, 4'hD, 1'b1, 2'b01, 4'hB, 4'hB);
    check("sel=10 routes c to y4",   4'hA, 4'hB, 4'hC, 4'hD, 1'b0, 2'b10, 4'hA, 4'hC);
    check("sel=11 routes d to y4",   4'hA, 4'hB, 4'hC, 4'hD, 1'b1, 2'b11, 4'hB, 4'hD);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
  "multiplexers:feature-selector": {
    tests: [
      "sel=00 routes a",
      "sel=01 routes b",
      "sel=10 routes c",
      "sel=11 routes d",
      "sel=00 routes a (distinct data)",
      "sel=11 routes d (distinct data)",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [3:0] a, b, c, d,
  input  wire [1:0] sel,
  output reg  [3:0] y
);
  // TODO: route c on sel=10 and d on sel=11.
  always @(*) begin
    case (sel)
      2'b00:   y = a;
      2'b01:   y = b;
      default: y = c;   // WRONG: sel=11 must route d
    endcase
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, c, d;
  logic [1:0] sel;
  logic [3:0] y;
  integer errors = 0;

  top dut (a, b, c, d, sel, y);

  task check(input string name, input logic [3:0] wa, input logic [3:0] wb,
             input logic [3:0] wc, input logic [3:0] wd,
             input logic [1:0] wsel, input logic [3:0] ey);
    begin
      a = wa; b = wb; c = wc; d = wd; sel = wsel;
      #1;
      if (y === ey) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: sel=%b y=%h expected %h", name, sel, y, ey);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("sel=00 routes a",                4'hA, 4'hB, 4'hC, 4'hD, 2'b00, 4'hA);
    check("sel=01 routes b",                4'hA, 4'hB, 4'hC, 4'hD, 2'b01, 4'hB);
    check("sel=10 routes c",                4'hA, 4'hB, 4'hC, 4'hD, 2'b10, 4'hC);
    check("sel=11 routes d",                4'hA, 4'hB, 4'hC, 4'hD, 2'b11, 4'hD);
    check("sel=00 routes a (distinct data)", 4'h1, 4'h2, 4'h3, 4'h4, 2'b00, 4'h1);
    check("sel=11 routes d (distinct data)", 4'h1, 4'h2, 4'h3, 4'h4, 2'b11, 4'h4);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
  },
};