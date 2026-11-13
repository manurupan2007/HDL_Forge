/** Hidden problem-set testbench for chapter 10. SERVER-ONLY — do not import from client code. */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH10: Record<string, PSetTestSpec> = {
  "shift-registers:barrel-shifter": {
    testNames: [
      "all (d,amt) combos 0..511 rotate left correctly",
      "all (d,amt) combos 512..1023 rotate left correctly",
      "all (d,amt) combos 1024..1535 rotate left correctly",
      "all (d,amt) combos 1536..2047 rotate left correctly",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] d, y;
  logic [2:0] amt;
  logic [7:0] exp;
  integer errors = 0;
  integer row, gerr;

  top dut (d, amt, y);

  task check_group(input string name, input integer lo, input integer hi);
    begin
      gerr = 0;
      for (row = lo; row <= hi; row = row + 1) begin
        d = row >> 3;      // 8-bit data
        amt = row;         // low 3 bits: rotate amount 0..7
        #1;
        exp = (d << amt) | (d >> (8 - amt));
        if (y !== exp) begin
          gerr = gerr + 1;
          errors = errors + 1;
          if (gerr <= 3) begin
            $display("[FAIL] %s: d=%b amt=%0d y=%b expected %b", name, d, amt, y, exp);
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("all (d,amt) combos 0..511 rotate left correctly", 0, 511);
    check_group("all (d,amt) combos 512..1023 rotate left correctly", 512, 1023);
    check_group("all (d,amt) combos 1024..1535 rotate left correctly", 1024, 1535);
    check_group("all (d,amt) combos 1536..2047 rotate left correctly", 1536, 2047);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};