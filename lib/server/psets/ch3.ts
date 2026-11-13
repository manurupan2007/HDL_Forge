/**
 * Hidden problem-set testbench for chapter 3. SERVER-ONLY — imported only by
 * app/api/grade. Every graded throw of a P-Set must self-check and end with a
 * `SUMMARY <count> errors` line plus one [PASS]/[FAIL] per declared test name.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH3: Record<string, PSetTestSpec> = {
  "combinational-expressions:expression-evaluator": {
    testNames: [
      "a,b sweep rows 0..255 with c=0101 d=1010",
      "a,b sweep rows 0..255 with c=1111 d=0000",
      "c,d sweep rows 0..255 with a=0011 b=1100",
      "c,d sweep rows 0..255 with a=1010 b=0101",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, c, d;
  logic [3:0] y, z;
  integer errors = 0;
  integer row;
  integer gerr;

  top dut (a, b, c, d, y, z);

  task check_group(input string name, input integer mode,
                   input integer lo, input integer hi);
    begin
      gerr = 0;
      for (row = lo; row <= hi; row = row + 1) begin
        if (mode === 0) begin
          a = row[7:4]; b = row[3:0]; c = 4'b0101; d = 4'b1010;
        end else if (mode === 1) begin
          a = row[7:4]; b = row[3:0]; c = 4'b1111; d = 4'b0000;
        end else if (mode === 2) begin
          a = 4'b0011; b = 4'b1100; c = row[7:4]; d = row[3:0];
        end else begin
          a = 4'b1010; b = 4'b0101; c = row[7:4]; d = row[3:0];
        end
        #1;
        if (y !== ((a & b) | ((c & d) ^ (a | d))) ||
            z !== ((a & b) | (c & d))) begin
          gerr = gerr + 1;
          errors = errors + 1;
          if (gerr <= 3) begin
            $display("[FAIL] %s: row %0d a=%b b=%b c=%b d=%b y=%b z=%b expected y=%b z=%b",
                     name, row, a, b, c, d, y, z,
                     (a & b) | ((c & d) ^ (a | d)), (a & b) | (c & d));
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("a,b sweep rows 0..255 with c=0101 d=1010", 0, 0, 255);
    check_group("a,b sweep rows 0..255 with c=1111 d=0000", 1, 0, 255);
    check_group("c,d sweep rows 0..255 with a=0011 b=1100", 2, 0, 255);
    check_group("c,d sweep rows 0..255 with a=1010 b=0101", 3, 0, 255);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};