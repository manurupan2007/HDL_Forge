/** Hidden problem-set testbench for chapter 9. SERVER-ONLY — do not import from client code. */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH9: Record<string, PSetTestSpec> = {
  "counters:clock-divider": {
    testNames: [
      "reset drives clk_out=0 and phase=0",
      "output period 1 (clocks 1-8) follows the 8-phase pattern",
      "output period 2 (clocks 9-16) follows the 8-phase pattern",
      "output period 3 (clocks 17-24) follows the 8-phase pattern",
      "clocks 25-32 keep 50% duty (4 low, 4 high samples)",
      "en=0 freezes clk_out and phase",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, en;
  logic clk_out;
  logic [2:0] phase;
  logic [2:0] pexp;
  integer errors = 0;
  integer gerr;
  integer n;

  top dut (clk, rst_n, en, clk_out, phase);

  always #5 clk = ~clk;

  task expect_sample(input string name, input integer clock_no);
    begin
      #1;
      pexp = clock_no % 8;
      if (clk_out !== pexp[2] || phase !== pexp) begin
        gerr = gerr + 1;
        errors = errors + 1;
        if (gerr <= 3) begin
          $display("[FAIL] %s: clock %0d clk_out=%b phase=%0d expected clk_out=%b phase=%0d",
                   name, clock_no, clk_out, phase, pexp[2], pexp);
        end
      end
    end
  endtask

  task group_done(input string name);
    begin
      if (gerr === 0) $display("[PASS] %s", name);
      gerr = 0;
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst_n = 1'b1;
    en = 1'b0;
    #1;
    rst_n = 1'b0;
    #1;
    gerr = 0;
    expect_sample("reset drives clk_out=0 and phase=0", 0);
    group_done("reset drives clk_out=0 and phase=0");
    rst_n = 1'b1;
    @(negedge clk);
    en = 1'b1;
    gerr = 0;
    for (n = 1; n <= 8; n = n + 1) begin
      @(posedge clk);
      expect_sample("output period 1 (clocks 1-8) follows the 8-phase pattern", n);
    end
    group_done("output period 1 (clocks 1-8) follows the 8-phase pattern");
    gerr = 0;
    for (n = 9; n <= 16; n = n + 1) begin
      @(posedge clk);
      expect_sample("output period 2 (clocks 9-16) follows the 8-phase pattern", n);
    end
    group_done("output period 2 (clocks 9-16) follows the 8-phase pattern");
    gerr = 0;
    for (n = 17; n <= 24; n = n + 1) begin
      @(posedge clk);
      expect_sample("output period 3 (clocks 17-24) follows the 8-phase pattern", n);
    end
    group_done("output period 3 (clocks 17-24) follows the 8-phase pattern");
    gerr = 0;
    for (n = 25; n <= 32; n = n + 1) begin
      @(posedge clk);
      expect_sample("clocks 25-32 keep 50% duty (4 low, 4 high samples)", n);
    end
    group_done("clocks 25-32 keep 50% duty (4 low, 4 high samples)");
    // Continue to a high phase, then freeze the enable.
    repeat (4) @(posedge clk);
    @(negedge clk);
    en = 1'b0;
    gerr = 0;
    repeat (6) @(posedge clk);
    #1;
    if (clk_out !== 1'b1 || phase !== 3'd4) begin
      gerr = gerr + 1;
      errors = errors + 1;
      $display("[FAIL] en=0 freezes clk_out and phase: clk_out=%b phase=%0d expected 1 4",
               clk_out, phase);
    end
    group_done("en=0 freezes clk_out and phase");
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};