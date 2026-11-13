/**
 * Hidden problem-set testbench for chapter 13. SERVER-ONLY — do not import from client code.
 * Boot ROM with a valid-latched read port: dout is registered, valid rises with
 * the first read and stays high until reset.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH13: Record<string, PSetTestSpec> = {
  "memory:rom-boot-image": {
    testNames: [
      "valid low after reset",
      "first read: valid rises with data",
      "addr 0 reads 0x00",
      "addr 5 reads 0x05",
      "addr 8 reads 0x15",
      "addr 13 reads 0xE9",
      "addr 15 reads 0x62",
      "valid stays high across reads",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst;
  logic [3:0] addr;
  logic [7:0] dout;
  logic valid;
  integer errors = 0;

  top dut (clk, rst, addr, dout, valid);

  always #5 clk = ~clk;

  task cycle();
    begin
      @(posedge clk);
      #1;
    end
  endtask

  task check(input string name, input logic [7:0] exp_dout, input logic exp_valid);
    begin
      if (dout === exp_dout && valid === exp_valid) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: addr=%0d dout=%h valid=%b expected dout=%h valid=%b", name, addr, dout, valid, exp_dout, exp_valid);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; addr = 0;
    cycle();
    rst = 0;
    check("valid low after reset", 8'h00, 1'b0);

    addr = 4'd0;
    cycle();
    check("first read: valid rises with data", 8'h00, 1'b1);

    addr = 4'd0;
    cycle();
    check("addr 0 reads 0x00", 8'h00, 1'b1);

    addr = 4'd5;
    cycle();
    check("addr 5 reads 0x05", 8'h05, 1'b1);

    addr = 4'd8;
    cycle();
    check("addr 8 reads 0x15", 8'h15, 1'b1);

    addr = 4'd13;
    cycle();
    check("addr 13 reads 0xE9", 8'hE9, 1'b1);

    addr = 4'd15;
    cycle();
    check("addr 15 reads 0x62", 8'h62, 1'b1);

    addr = 4'd0;
    cycle();
    check("valid stays high across reads", 8'h00, 1'b1);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};