/**
 * Hidden problem-set testbench for chapter 14. SERVER-ONLY — do not import from client code.
 * UART loopback: TX wired to RX on the same baud_en. Every byte must round-trip
 * intact; tx_en mid-frame must be ignored while busy.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH14: Record<string, PSetTestSpec> = {
  "interfaces:uart-loopback": {
    testNames: [
      "reset: line idle, rdy low",
      "loopback 0x55 round-trips",
      "loopback 0xAA round-trips",
      "loopback 0x00 round-trips",
      "loopback 0xFF round-trips",
      "back-to-back bytes round-trip",
      "busy blocks a new frame mid-transmission",
      "loopback 0x3C round-trips",
      "clean loopback: no framing errors",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, baud_en, tx_en;
  logic [7:0] d_in, d_out;
  logic tx, busy, rdy, ferr;
  integer errors = 0;

  top dut (clk, rst, baud_en, tx_en, d_in, tx, busy, d_out, rdy, ferr);

  always #5 clk = ~clk;

  task baud_tick();
    begin
      baud_en = 1;
      @(posedge clk);
      #1;
      baud_en = 0;
    end
  endtask

  task send_byte(input logic [7:0] data);
    integer k;
    begin
      tx_en = 1; d_in = data;
      @(posedge clk); #1;      // E0: TX latches, drives start
      tx_en = 0;
      @(posedge clk); #1;      // E0+1: RX detects the start edge
      for (k = 0; k < 10; k = k + 1) baud_tick();
    end
  endtask

  task check_byte(input string name, input logic [7:0] exp_dout, input logic exp_rdy, input logic exp_ferr);
    begin
      if (d_out === exp_dout && rdy === exp_rdy && ferr === exp_ferr) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: d_out=%h rdy=%b ferr=%b expected d_out=%h rdy=%b ferr=%b", name, d_out, rdy, ferr, exp_dout, exp_rdy, exp_ferr);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; baud_en = 0; tx_en = 0; d_in = 0;
    @(posedge clk); #1;
    rst = 0;
    check_byte("reset: line idle, rdy low", 8'h00, 1'b0, 1'b0);

    send_byte(8'h55);
    check_byte("loopback 0x55 round-trips", 8'h55, 1'b1, 1'b0);

    send_byte(8'hAA);
    check_byte("loopback 0xAA round-trips", 8'hAA, 1'b1, 1'b0);

    send_byte(8'h00);
    check_byte("loopback 0x00 round-trips", 8'h00, 1'b1, 1'b0);

    send_byte(8'hFF);
    check_byte("loopback 0xFF round-trips", 8'hFF, 1'b1, 1'b0);

    // Back-to-back: start the next frame immediately after the previous one.
    send_byte(8'h5A);
    send_byte(8'hA5);
    check_byte("back-to-back bytes round-trip", 8'hA5, 1'b1, 1'b0);

    // Start a frame, then try to start another mid-frame: must be ignored.
    tx_en = 1; d_in = 8'h3C;
    @(posedge clk); #1;
    tx_en = 0;
    @(posedge clk); #1;
    baud_tick();               // first data bit on the wire
    tx_en = 1; d_in = 8'hC3;   // attempt to start a new frame mid-frame
    @(posedge clk); #1;
    tx_en = 0;
    if (busy === 1'b1) $display("[PASS] busy blocks a new frame mid-transmission");
    else begin
      errors = errors + 1;
      $display("[FAIL] busy blocks a new frame mid-transmission: busy=%b", busy);
    end
    repeat (9) baud_tick();    // finish the 0x3C frame
    check_byte("loopback 0x3C round-trips", 8'h3C, 1'b1, 1'b0);

    // Final clean byte: ferr must stay low.
    send_byte(8'h6B);
    check_byte("clean loopback: no framing errors", 8'h6B, 1'b1, 1'b0);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};