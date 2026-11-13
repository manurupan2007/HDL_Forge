/**
 * Hidden problem-set testbench for chapter 4. SERVER-ONLY — imported only by
 * app/api/grade. Every graded throw of a P-Set must self-check and end with a
 * `SUMMARY <count> errors` line plus one [PASS]/[FAIL] per declared test name.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH4: Record<string, PSetTestSpec> = {
  "multiplexers:feature-selector": {
    testNames: [
      "sel=00 across 16 data patterns",
      "sel=01 across 16 data patterns",
      "sel=10 across 16 data patterns",
      "sel=11 across 16 data patterns",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b, c, d;
  logic [1:0] sel;
  logic [3:0] y;
  integer errors = 0;
  integer row;
  integer gerr;

  top dut (a, b, c, d, sel, y);

  task check_group(input string name, input logic [1:0] wsel);
    begin
      gerr = 0;
      for (row = 0; row <= 15; row = row + 1) begin
        a = row[3:0];
        b = ~row[3:0];
        c = row[3:0] ^ 4'hA;
        d = {row[0], row[1], row[2], row[3]};
        sel = wsel;
        #1;
        if (wsel === 2'b00) begin
          if (y !== a) begin gerr = gerr + 1; errors = errors + 1; end
        end else if (wsel === 2'b01) begin
          if (y !== b) begin gerr = gerr + 1; errors = errors + 1; end
        end else if (wsel === 2'b10) begin
          if (y !== c) begin gerr = gerr + 1; errors = errors + 1; end
        end else begin
          if (y !== d) begin gerr = gerr + 1; errors = errors + 1; end
        end
        if (gerr <= 3 && gerr > 0) begin
          $display("[FAIL] %s: row %0d sel=%b a=%h b=%h c=%h d=%h y=%h",
                   name, row, sel, a, b, c, d, y);
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("sel=00 across 16 data patterns", 2'b00);
    check_group("sel=01 across 16 data patterns", 2'b01);
    check_group("sel=10 across 16 data patterns", 2'b10);
    check_group("sel=11 across 16 data patterns", 2'b11);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};