import type { LessonTestSpec } from "../types";

/**
 * Chapter 14 — Interfaces: UART (SystemVerilog dialect).
 * uart-tx: serialize a byte as start + 8 data bits (LSb first) + stop.
 * uart-rx: detect the start falling edge, wait one baud_en, then sample each
 *   data bit one baud_en later (mid-bit), check the stop bit, flag ferr.
 * uart-loopback: wire TX to RX and round-trip bytes on the same baud_en.
 */
export const LESSONS_CH14: Record<string, LessonTestSpec> = {
  "interfaces:uart-tx": {
    tests: [
      "idle line is high",
      "tx_en starts the frame: start bit low",
      "data bit 0 is 1",
      "data bit 1 is 0",
      "data bit 2 is 1",
      "data bit 3 is 0",
      "data bit 4 is 1",
      "data bit 5 is 0",
      "data bit 6 is 1",
      "data bit 7 is 0",
      "stop bit is high",
      "busy deasserts after the frame",
    ],
    starter: {
      "top.sv": `module top (
  input  logic clk, rst,
  input  logic baud_en,
  input  logic tx_en,
  input  logic [7:0] d,
  output logic tx,
  output logic busy
);
  typedef enum logic [1:0] { IDLE, SEND } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      tx <= 1'b1;
      busy <= 1'b0;
    end else begin
      case (st)
        IDLE: begin
          busy <= 1'b0;
          tx <= 1'b1;
          if (tx_en) begin
            st <= SEND;
            busy <= 1'b1;
            shreg <= d;
            bitcnt <= 4'd0;
            tx <= 1'b0;          // start bit
          end
        end
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1;          // stop bit
            st <= IDLE;
          end else begin
            tx <= shreg[7];            // TODO: should be shreg[0] (LSb first)
            shreg <= {shreg[6:0], 1'b0};
            bitcnt <= bitcnt + 4'd1;
          end
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, baud_en, tx_en;
  logic [7:0] d;
  logic tx, busy;
  integer errors = 0;

  top dut (clk, rst, baud_en, tx_en, d, tx, busy);

  always #5 clk = ~clk;

  task baud_tick();
    begin
      baud_en = 1;
      @(posedge clk);
      #1;
      baud_en = 0;
    end
  endtask

  task check(input string name, input logic exp_tx, input logic exp_busy);
    begin
      if (tx === exp_tx && busy === exp_busy) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: tx=%b busy=%b expected tx=%b busy=%b", name, tx, busy, exp_tx, exp_busy);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; baud_en = 0; tx_en = 0; d = 8'h55;
    @(posedge clk); #1;
    rst = 0;
    check("idle line is high", 1'b1, 1'b0);

    // Start the frame.
    tx_en = 1;
    @(posedge clk); #1;      // E0: start bit driven
    tx_en = 0;
    check("tx_en starts the frame: start bit low", 1'b0, 1'b1);

    // 8 data bits, LSb first: 0x55 = 1,0,1,0,1,0,1,0
    baud_tick();
    check("data bit 0 is 1", 1'b1, 1'b1);
    baud_tick();
    check("data bit 1 is 0", 1'b0, 1'b1);
    baud_tick();
    check("data bit 2 is 1", 1'b1, 1'b1);
    baud_tick();
    check("data bit 3 is 0", 1'b0, 1'b1);
    baud_tick();
    check("data bit 4 is 1", 1'b1, 1'b1);
    baud_tick();
    check("data bit 5 is 0", 1'b0, 1'b1);
    baud_tick();
    check("data bit 6 is 1", 1'b1, 1'b1);
    baud_tick();
    check("data bit 7 is 0", 1'b0, 1'b1);
    baud_tick();
    check("stop bit is high", 1'b1, 1'b1);
    baud_tick();
    check("busy deasserts after the frame", 1'b1, 1'b0);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "interfaces:uart-rx": {
    tests: [
      "reset clears rdy and ferr",
      "receive 0x55 with clean stop",
      "receive 0xAA with clean stop",
      "receive 0x00 with clean stop",
      "receive 0xFF with clean stop",
      "framing error on low stop bit",
      "receive 0x3C after framing error",
      "receive 0xC3 with clean stop",
    ],
    starter: {
      "top.sv": `module top (
  input  logic clk, rst, baud_en, rx,
  output logic [7:0] dout,
  output logic ferr, rdy
);
  typedef enum logic [2:0] { IDLE, START, BITS, STOP } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      rdy <= 1'b0;
      ferr <= 1'b0;
    end else begin
      rdy <= 1'b0;
      case (st)
        IDLE: begin
          ferr <= 1'b0;
          if (!rx) st <= START;
        end
        START: if (baud_en) begin
          st <= BITS;
          bitcnt <= 4'd0;
        end
        BITS: if (baud_en) begin
          shreg <= {shreg[6:0], rx};   // TODO: should be {rx, shreg[7:1]}
          bitcnt <= bitcnt + 4'd1;
          if (bitcnt == 4'd7) st <= STOP;
        end
        STOP: if (baud_en) begin
          ferr <= ~rx;
          rdy <= 1'b1;
          dout <= shreg;
          st <= IDLE;
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, baud_en, rx;
  logic [7:0] dout;
  logic ferr, rdy;
  integer errors = 0;

  top dut (clk, rst, baud_en, rx, dout, ferr, rdy);

  always #5 clk = ~clk;

  task baud_tick();
    begin
      baud_en = 1;
      @(posedge clk);
      #1;
      baud_en = 0;
    end
  endtask

  task send_frame(input logic [7:0] data, input logic stop_bit);
    integer k;
    begin
      rx = 1'b0;                 // start bit
      @(posedge clk); #1;        // RX sees the falling edge -> START
      baud_tick();               // tick 1: START -> BITS (no sample yet)
      for (k = 0; k < 8; k = k + 1) begin
        rx = data[k];            // data[k] on the wire for tick k+2
        baud_tick();             // tick k+2: samples data[k]
      end
      rx = stop_bit;             // stop bit on the wire
      baud_tick();               // tick 10: STOP latches rdy/dout/ferr
    end
  endtask

  task check_rx(input string name, input logic [7:0] exp_dout, input logic exp_rdy, input logic exp_ferr);
    begin
      if (dout === exp_dout && rdy === exp_rdy && ferr === exp_ferr) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: dout=%h rdy=%b ferr=%b expected dout=%h rdy=%b ferr=%b", name, dout, rdy, ferr, exp_dout, exp_rdy, exp_ferr);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; baud_en = 0; rx = 1;
    @(posedge clk); #1;
    rst = 0;
    if (rdy === 1'b0 && ferr === 1'b0) $display("[PASS] reset clears rdy and ferr");
    else begin
      errors = errors + 1;
      $display("[FAIL] reset clears rdy and ferr: rdy=%b ferr=%b", rdy, ferr);
    end

    send_frame(8'h55, 1'b1);
    check_rx("receive 0x55 with clean stop", 8'h55, 1'b1, 1'b0);

    send_frame(8'hAA, 1'b1);
    check_rx("receive 0xAA with clean stop", 8'hAA, 1'b1, 1'b0);

    send_frame(8'h00, 1'b1);
    check_rx("receive 0x00 with clean stop", 8'h00, 1'b1, 1'b0);

    send_frame(8'hFF, 1'b1);
    check_rx("receive 0xFF with clean stop", 8'hFF, 1'b1, 1'b0);

    send_frame(8'h5A, 1'b0);
    check_rx("framing error on low stop bit", 8'h5A, 1'b1, 1'b1);

    send_frame(8'h3C, 1'b1);
    check_rx("receive 0x3C after framing error", 8'h3C, 1'b1, 1'b0);

    send_frame(8'hC3, 1'b1);
    check_rx("receive 0xC3 with clean stop", 8'hC3, 1'b1, 1'b0);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "interfaces:uart-loopback": {
    tests: [
      "reset: idle line high, no ready",
      "loopback 0x55 round-trips",
      "loopback 0xAA round-trips",
      "loopback 0x00 round-trips",
      "loopback 0xFF round-trips",
      "busy high during transmission",
      "loopback 0x3C round-trips",
      "rdy pulses once per byte",
      "no framing error on clean loopback",
    ],
    starter: {
      "top.sv": `module uart_tx (
  input  logic clk, rst,
  input  logic baud_en,
  input  logic tx_en,
  input  logic [7:0] d,
  output logic tx,
  output logic busy
);
  typedef enum logic [1:0] { IDLE, SEND } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      tx <= 1'b1;
      busy <= 1'b0;
    end else begin
      case (st)
        IDLE: begin
          busy <= 1'b0;
          tx <= 1'b1;
          if (tx_en) begin
            st <= SEND;
            busy <= 1'b1;
            shreg <= d;
            bitcnt <= 4'd0;
            tx <= 1'b0;
          end
        end
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1;
            st <= IDLE;
          end else begin
            tx <= shreg[0];
            shreg <= shreg >> 1;
            bitcnt <= bitcnt + 4'd1;
          end
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule

module uart_rx (
  input  logic clk, rst, baud_en, rx,
  output logic [7:0] dout,
  output logic ferr, rdy
);
  typedef enum logic [2:0] { IDLE, START, BITS, STOP } state_t;
  state_t st;
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      st <= IDLE;
      rdy <= 1'b0;
      ferr <= 1'b0;
    end else begin
      rdy <= 1'b0;
      case (st)
        IDLE: begin
          ferr <= 1'b0;
          if (!rx) st <= START;
        end
        START: if (baud_en) begin
          st <= BITS;
          bitcnt <= 4'd0;
        end
        BITS: if (baud_en) begin
          shreg <= {shreg[6:0], rx};   // TODO: should be {rx, shreg[7:1]}
          bitcnt <= bitcnt + 4'd1;
          if (bitcnt == 4'd7) st <= STOP;
        end
        STOP: if (baud_en) begin
          ferr <= ~rx;
          rdy <= 1'b1;
          dout <= shreg;
          st <= IDLE;
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule

module top (
  input  logic clk, rst,
  input  logic baud_en,
  input  logic tx_en,
  input  logic [7:0] d_in,
  output logic tx,
  output logic busy,
  output logic [7:0] d_out,
  output logic rdy,
  output logic ferr
);
  uart_tx tx_inst (clk, rst, baud_en, tx_en, d_in, tx, busy);
  uart_rx rx_inst (clk, rst, baud_en, tx, d_out, ferr, rdy);
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
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
    check_byte("reset: idle line high, no ready", 8'h00, 1'b0, 1'b0);

    send_byte(8'h55);
    check_byte("loopback 0x55 round-trips", 8'h55, 1'b1, 1'b0);

    send_byte(8'hAA);
    check_byte("loopback 0xAA round-trips", 8'hAA, 1'b1, 1'b0);

    send_byte(8'h00);
    check_byte("loopback 0x00 round-trips", 8'h00, 1'b1, 1'b0);

    send_byte(8'hFF);
    check_byte("loopback 0xFF round-trips", 8'hFF, 1'b1, 1'b0);

    // busy check: during a frame, busy is high.
    tx_en = 1; d_in = 8'h3C;
    @(posedge clk); #1;
    tx_en = 0;
    if (busy === 1'b1) $display("[PASS] busy high during transmission");
    else begin
      errors = errors + 1;
      $display("[FAIL] busy high during transmission: busy=%b", busy);
    end
    @(posedge clk); #1;
    repeat (10) baud_tick();
    check_byte("loopback 0x3C round-trips", 8'h3C, 1'b1, 1'b0);

    // rdy pulses: falls again on the next cycle.
    @(posedge clk); #1;
    if (rdy === 1'b0) $display("[PASS] rdy pulses once per byte");
    else begin
      errors = errors + 1;
      $display("[FAIL] rdy pulses once per byte: rdy=%b", rdy);
    end

    // One more clean byte: ferr stays low.
    send_byte(8'hC3);
    check_byte("no framing error on clean loopback", 8'hC3, 1'b1, 1'b0);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};