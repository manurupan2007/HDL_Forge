/**
 * Hidden problem-set testbench for chapter 12. SERVER-ONLY — do not import from client code.
 * 2R1W register file: synchronous write, async reset, write-first read-during-write.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH12: Record<string, PSetTestSpec> = {
  "datapath:register-file": {
    testNames: [
      "reset clears all four registers",
      "write r0 and read back",
      "write r1 and read back",
      "write r2 and read back",
      "write r3 and read back",
      "independent reads from both ports",
      "read-during-write port A returns new data",
      "read-during-write port B returns new data",
      "we low leaves register unchanged",
      "overwrite register with new value",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, we;
  logic [1:0] waddr, raddr_a, raddr_b;
  logic [7:0] wdata, rdata_a, rdata_b;
  integer errors = 0;

  top dut (clk, rst, we, waddr, wdata, raddr_a, raddr_b, rdata_a, rdata_b);

  always #5 clk = ~clk;

  task cycle();
    begin
      @(posedge clk);
      #1;
    end
  endtask

  task check2(input string name, input logic [7:0] exp_a, input logic [7:0] exp_b);
    begin
      if (rdata_a === exp_a && rdata_b === exp_b) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: rdata_a=%h rdata_b=%h expected %h %h", name, rdata_a, rdata_b, exp_a, exp_b);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; we = 0; waddr = 0; wdata = 0; raddr_a = 0; raddr_b = 0;
    cycle();
    rst = 0;
    check2("reset clears all four registers", 8'h00, 8'h00);

    // Write each register, read it back on port A.
    raddr_a = 2'd0; raddr_b = 2'd1;
    we = 1; waddr = 2'd0; wdata = 8'h11;
    cycle();
    we = 0;
    check2("write r0 and read back", 8'h11, 8'h00);

    raddr_a = 2'd1; raddr_b = 2'd2;
    we = 1; waddr = 2'd1; wdata = 8'h22;
    cycle();
    we = 0;
    check2("write r1 and read back", 8'h22, 8'h00);

    raddr_a = 2'd2; raddr_b = 2'd3;
    we = 1; waddr = 2'd2; wdata = 8'h44;
    cycle();
    we = 0;
    check2("write r2 and read back", 8'h44, 8'h00);

    raddr_a = 2'd3; raddr_b = 2'd0;
    we = 1; waddr = 2'd3; wdata = 8'h88;
    cycle();
    we = 0;
    check2("write r3 and read back", 8'h88, 8'h11);

    // Independent reads.
    raddr_a = 2'd1; raddr_b = 2'd2;
    #1;
    check2("independent reads from both ports", 8'h22, 8'h44);

    // Read-during-write: port A.
    we = 1; waddr = 2'd0; wdata = 8'hAA;
    raddr_a = 2'd0; raddr_b = 2'd3;
    cycle();
    we = 0;
    check2("read-during-write port A returns new data", 8'hAA, 8'h88);

    // Read-during-write: port B.
    we = 1; waddr = 2'd3; wdata = 8'hBB;
    raddr_a = 2'd0; raddr_b = 2'd3;
    cycle();
    we = 0;
    check2("read-during-write port B returns new data", 8'hAA, 8'hBB);

    // we low: unchanged.
    we = 0; waddr = 2'd1; wdata = 8'hCC;
    raddr_a = 2'd1; raddr_b = 2'd2;
    cycle();
    check2("we low leaves register unchanged", 8'h22, 8'h44);

    // Overwrite.
    we = 1; waddr = 2'd2; wdata = 8'hDD;
    raddr_a = 2'd2; raddr_b = 2'd0;
    cycle();
    we = 0;
    check2("overwrite register with new value", 8'hDD, 8'hAA);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};