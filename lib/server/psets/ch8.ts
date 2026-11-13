/** Hidden problem-set testbench for chapter 8. SERVER-ONLY — do not import from client code. */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH8: Record<string, PSetTestSpec> = {
  "sequential-fundamentals:synchronizer": {
    testNames: [
      "reset clears the synchronizer output",
      "a level on d appears at q exactly two rising edges later",
      "a single-cycle pulse on d never appears at q early",
      "q holds the last synchronized value while d toggles",
      "async reset wins between clock edges",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, d;
  logic q;
  integer errors = 0;
  integer gerr;

  top dut (clk, rst_n, d, q);

  always #5 clk = ~clk;

  task expect_q(input string name, input logic exp_q);
    begin
      #1;
      if (q !== exp_q) begin
        gerr = gerr + 1;
        errors = errors + 1;
        $display("[FAIL] %s: q=%b expected %b", name, q, exp_q);
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
    d = 1'b0;
    #1;
    rst_n = 1'b0;
    #1;
    gerr = 0;
    expect_q("reset clears the synchronizer output", 1'b0);
    group_done("reset clears the synchronizer output");
    rst_n = 1'b1;
    @(negedge clk);
    d = 1'b1;
    @(posedge clk);
    expect_q("a level on d appears at q exactly two rising edges later", 1'b0);
    @(posedge clk);
    expect_q("a level on d appears at q exactly two rising edges later", 1'b1);
    group_done("a level on d appears at q exactly two rising edges later");
    // Drain the pipeline: d was left high, so let the level pass through.
    @(negedge clk);
    d = 1'b0;
    @(posedge clk);
    @(posedge clk);
    // Now apply a true single-cycle pulse.
    @(negedge clk);
    d = 1'b1;
    @(posedge clk);
    expect_q("a single-cycle pulse on d never appears at q early", 1'b0);
    @(negedge clk);
    d = 1'b0;
    @(posedge clk);
    expect_q("a single-cycle pulse on d never appears at q early", 1'b1);
    @(posedge clk);
    expect_q("a single-cycle pulse on d never appears at q early", 1'b0);
    group_done("a single-cycle pulse on d never appears at q early");
    @(negedge clk);
    d = 1'b1;
    @(posedge clk);
    @(posedge clk);
    @(negedge clk);
    d = 1'b0;
    @(posedge clk);
    expect_q("q holds the last synchronized value while d toggles", 1'b1);
    @(posedge clk);
    expect_q("q holds the last synchronized value while d toggles", 1'b0);
    group_done("q holds the last synchronized value while d toggles");
    @(negedge clk);
    d = 1'b1;
    @(posedge clk);
    @(posedge clk);
    @(negedge clk);
    #1;
    rst_n = 1'b0;
    expect_q("async reset wins between clock edges", 1'b0);
    rst_n = 1'b1;
    group_done("async reset wins between clock edges");
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};