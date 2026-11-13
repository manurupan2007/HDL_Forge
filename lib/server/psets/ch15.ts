/** Hidden problem-set testbench for chapter 15. SERVER-ONLY — do not import from client code. */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH15: Record<string, PSetTestSpec> = {
  "risc-v-blocks:core-datapath": {
    testNames: [
      "reset: pc 0, dbg 0, done low",
      "ADDI x1, x0, 10 executes",
      "ADDI x2, x0, 4 executes",
      "SUB x3, x1, x2 = 6",
      "BEQ skips the next word",
      "ADDI x3, x3, 2 = 8",
      "HALT raises done",
      "done stays high after halt",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst;
  logic [31:0] pc, dbg;
  logic done;
  integer errors = 0;

  top dut (clk, rst, pc, dbg, done);

  always #5 clk = ~clk;

  task cycle();
    begin
      @(posedge clk);
      #1;
    end
  endtask

  task check(input string name, input logic [31:0] exp_pc, input logic [31:0] exp_dbg, input logic exp_done);
    begin
      if (pc === exp_pc && dbg === exp_dbg && done === exp_done) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: pc=%h dbg=%h done=%b expected pc=%h dbg=%h done=%b", name, pc, dbg, done, exp_pc, exp_dbg, exp_done);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1;
    cycle();
    rst = 0;
    check("reset: pc 0, dbg 0, done low", 32'h00000000, 32'h00000000, 1'b0);

    cycle();
    check("ADDI x1, x0, 10 executes", 32'h00000004, 32'h00000000, 1'b0);

    cycle();
    check("ADDI x2, x0, 4 executes", 32'h00000008, 32'h00000000, 1'b0);

    cycle();
    check("SUB x3, x1, x2 = 6", 32'h0000000C, 32'h00000006, 1'b0);

    cycle();
    check("BEQ skips the next word", 32'h00000014, 32'h00000006, 1'b0);

    cycle();
    check("ADDI x3, x3, 2 = 8", 32'h00000018, 32'h00000008, 1'b0);

    cycle();
    check("HALT raises done", 32'h00000018, 32'h00000008, 1'b1);

    cycle();
    check("done stays high after halt", 32'h00000018, 32'h00000008, 1'b1);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};