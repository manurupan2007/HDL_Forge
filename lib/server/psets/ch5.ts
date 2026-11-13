/**
 * Hidden problem-set testbench for chapter 5. SERVER-ONLY — imported only by
 * app/api/grade. Every graded throw of a P-Set must self-check and end with a
 * `SUMMARY <count> errors` line plus one [PASS]/[FAIL] per declared test name.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH5: Record<string, PSetTestSpec> = {
  "adders:nibble-adder": {
    testNames: [
      "rows 0..127 with cin=0",
      "rows 128..255 with cin=0",
      "rows 0..127 with cin=1",
      "rows 128..255 with cin=1",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b;
  logic cin;
  logic [3:0] sum;
  logic cout;
  logic [4:0] exp;
  integer errors = 0;
  integer row;
  integer gerr;

  top dut (a, b, cin, sum, cout);

  task check_group(input string name, input integer lo, input integer hi,
                   input logic wcin);
    begin
      gerr = 0;
      for (row = lo; row <= hi; row = row + 1) begin
        a = row[7:4];
        b = row[3:0];
        cin = wcin;
        exp = {1'b0, a} + {1'b0, b} + cin;
        #1;
        if ({cout, sum} !== exp) begin
          gerr = gerr + 1;
          errors = errors + 1;
          if (gerr <= 3) begin
            $display("[FAIL] %s: row %0d a=%b b=%b cin=%b sum=%b cout=%b expected sum=%b cout=%b",
                     name, row, a, b, cin, sum, cout, exp[3:0], exp[4]);
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("rows 0..127 with cin=0",   0, 127, 1'b0);
    check_group("rows 128..255 with cin=0", 128, 255, 1'b0);
    check_group("rows 0..127 with cin=1",   0, 127, 1'b1);
    check_group("rows 128..255 with cin=1", 128, 255, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};