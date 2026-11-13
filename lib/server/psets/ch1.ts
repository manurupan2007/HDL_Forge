/**
 * Hidden problem-set testbench for chapter 1. SERVER-ONLY — imported only by
 * app/api/grade. Every graded throw of a P-Set must self-check and end with a
 * `SUMMARY <count> errors` line plus one [PASS]/[FAIL] per declared test name.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH1: Record<string, PSetTestSpec> = {
  "synthesis-foundations:truth-table-synthesizer": {
    testNames: [
      "all rows 0..63 match the truth table",
      "all rows 64..127 match the truth table",
      "all rows 128..191 match the truth table",
      "all rows 192..255 match the truth table",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, y;
  logic [3:0] expected;
  integer errors = 0;
  integer row;
  integer gerr;

  top dut (a, b, y);

  task check_group(input string name, input integer lo, input integer hi);
    begin
      gerr = 0;
      for (row = lo; row <= hi; row = row + 1) begin
        a = row[7:4];
        b = row[3:0];
        expected = (a === 4'b0011 && b === 4'b0001) ? 4'b0001 : 4'b0000;
        #1;
        if (y !== expected) begin
          gerr = gerr + 1;
          errors = errors + 1;
          if (gerr <= 3) begin
            $display("[FAIL] %s: row %0d a=%b b=%b y=%b expected %b", name, row, a, b, y, expected);
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("all rows 0..63 match the truth table",        0,  63);
    check_group("all rows 64..127 match the truth table",     64, 127);
    check_group("all rows 128..191 match the truth table",   128, 191);
    check_group("all rows 192..255 match the truth table",   192, 255);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};