/**
 * Hidden problem-set testbench for chapter 2. SERVER-ONLY — imported only by
 * app/api/grade. Every graded throw of a P-Set must self-check and end with a
 * `SUMMARY <count> errors` line plus one [PASS]/[FAIL] per declared test name.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH2: Record<string, PSetTestSpec> = {
  "logic-gates:gate-netlist-designer": {
    testNames: [
      "rows 0..3 match (a&b)|(c&d)",
      "rows 4..7 match (a&b)|(c&d)",
      "rows 8..11 match (a&b)|(c&d)",
      "rows 12..15 match (a&b)|(c&d)",
    ],
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
    generation: "2012",
    points: 10,
  },
};