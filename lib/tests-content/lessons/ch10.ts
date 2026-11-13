import type { LessonTestSpec } from "../types";

// Lessons in chapter 10. See gold template lib/tests-content/lessons/ch1.ts for
// CONVENTIONS: [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
// starter that fails >=1 test, solution in ../solutions/ch10.ts, generation "2012".
// Expected keys:
//   shift-registers:shifter-family,
//   shift-registers:barrel-shifter,
export const LESSONS_CH10: Record<string, LessonTestSpec> = {
  "shift-registers:shifter-family": {
    tests: [
      "async reset clears q to 0",
      "load loads the parallel word d",
      "shift left inserts sin at bit 0",
      "shift right inserts sin at bit 3",
      "load has priority over shift",
      "async reset clears q between clock edges",
    ],
    starter: {
      "top.sv": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire load,
  input  wire dir,
  input  wire sin,
  input  wire [3:0] d,
  output reg  [3:0] q,
  output wire sout
);
  // TODO: add the parallel load (highest priority) and honor dir.
  assign sout = dir ? q[3] : q[0];
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 4'b0000;
    else q <= {q[2:0], sin};   // always shifts left
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, load, dir, sin;
  logic [3:0] d, q;
  logic sout;
  integer errors = 0;

  top dut (clk, rst_n, load, dir, sin, d, q, sout);

  always #5 clk = ~clk;

  task check(input string name, input logic [3:0] exp_q, input logic exp_sout);
    begin
      #1;
      if (q === exp_q && sout === exp_sout) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: q=%b sout=%b expected q=%b sout=%b",
                 name, q, sout, exp_q, exp_sout);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst_n = 1'b1;
    load = 1'b0;
    dir = 1'b1;
    sin = 1'b0;
    d = 4'b0000;
    #1;
    rst_n = 1'b0;
    check("async reset clears q to 0", 4'b0000, 1'b0);
    rst_n = 1'b1;
    @(negedge clk);
    load = 1'b1;
    d = 4'b1010;
    @(posedge clk);
    check("load loads the parallel word d", 4'b1010, 1'b1);
    @(negedge clk);
    load = 1'b0;
    sin = 1'b1;
    @(posedge clk);
    check("shift left inserts sin at bit 0", 4'b0101, 1'b0);
    @(negedge clk);
    dir = 1'b0;
    sin = 1'b1;
    @(posedge clk);
    check("shift right inserts sin at bit 3", 4'b1010, 1'b0);
    @(negedge clk);
    load = 1'b1;
    dir = 1'b1;
    d = 4'b0110;
    @(posedge clk);
    check("load has priority over shift", 4'b0110, 1'b0);
    @(negedge clk);
    #1;
    rst_n = 1'b0;
    check("async reset clears q between clock edges", 4'b0000, 1'b0);
    rst_n = 1'b1;
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "shift-registers:barrel-shifter": {
    tests: [
      "shift amount 0 passes data through",
      "left shift by 1 inserts a zero at bit 0",
      "left shift by 3 moves the low nibble up",
      "right shift by 2 zero-fills the top",
      "right shift by 7 keeps only the LSB",
      "rotate left by 4 swaps the nibbles",
      "rotate right by 1 wraps the LSB to the MSB",
      "rotate by 0 is the identity",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [7:0] d,
  input  wire [2:0] sh,
  input  wire       left,
  input  wire       rot,
  output wire [7:0] y
);
  // TODO: when rot=1 the bits that leave one end must re-enter the other.
  assign y = left ? (d << sh) : (d >> sh);
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] d, y;
  logic [2:0] sh;
  logic left, rot;
  integer errors = 0;

  top dut (d, sh, left, rot, y);

  task check(input string name, input logic [7:0] vd, input logic [2:0] vsh,
             input logic vleft, input logic vrot, input logic [7:0] exp_y);
    begin
      d = vd;
      sh = vsh;
      left = vleft;
      rot = vrot;
      #1;
      if (y === exp_y) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: d=%b sh=%0d left=%b rot=%b y=%b expected %b",
                 name, d, sh, left, rot, y, exp_y);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("shift amount 0 passes data through", 8'b10010110, 3'd0, 1'b1, 1'b0, 8'b10010110);
    check("left shift by 1 inserts a zero at bit 0", 8'b10010110, 3'd1, 1'b1, 1'b0, 8'b00101100);
    check("left shift by 3 moves the low nibble up", 8'b00001111, 3'd3, 1'b1, 1'b0, 8'b01111000);
    check("right shift by 2 zero-fills the top", 8'b11110000, 3'd2, 1'b0, 1'b0, 8'b00111100);
    check("right shift by 7 keeps only the LSB", 8'b10000000, 3'd7, 1'b0, 1'b0, 8'b00000001);
    check("rotate left by 4 swaps the nibbles", 8'b10110010, 3'd4, 1'b1, 1'b1, 8'b00101011);
    check("rotate right by 1 wraps the LSB to the MSB", 8'b10110011, 3'd1, 1'b0, 1'b1, 8'b11011001);
    check("rotate by 0 is the identity", 8'b10110010, 3'd0, 1'b1, 1'b1, 8'b10110010);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};