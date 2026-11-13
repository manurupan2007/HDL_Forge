import type { LessonTestSpec } from "../types";

// Lessons in chapter 7. See gold template lib/tests-content/lessons/ch1.ts for
// CONVENTIONS: [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
// starter that fails >=1 test, solution in ../solutions/ch7.ts, generation "2012".
// Expected keys:
//   encode-decode:priority-encoder,
//   encode-decode:interrupt-priority,
export const LESSONS_CH7: Record<string, LessonTestSpec> = {
  "encode-decode:priority-encoder": {
    tests: [
      "req=10000000 -> idx=7 valid=1",
      "req=01000000 -> idx=6 valid=1",
      "req=00010000 -> idx=4 valid=1",
      "req=00000001 -> idx=0 valid=1",
      "req=00101010 -> idx=5 valid=1",
      "req=00000111 -> idx=2 valid=1",
      "req=00000000 -> idx=0 valid=0",
      "req=11111111 -> idx=7 valid=1",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [7:0] req,
  output reg  [2:0] idx,
  output reg        valid
);
  // TODO: encode the HIGHEST-priority active line (bit 7 wins ties).
  // This version stops at the first set bit it finds — the lowest one.
  integer i;
  reg found;
  always @(*) begin
    idx = 3'd0;
    valid = 1'b0;
    found = 1'b0;
    i = 0;
    while (!found && i < 8) begin
      if (req[i]) begin
        idx = i;
        valid = 1'b1;
        found = 1'b1;
      end
      i = i + 1;
    end
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] req;
  logic [2:0] idx;
  logic valid;
  integer errors = 0;

  top dut (req, idx, valid);

  task check(input string name, input logic [7:0] vreq,
             input logic [2:0] exp_idx, input logic exp_valid);
    begin
      req = vreq;
      #1;
      if (idx === exp_idx && valid === exp_valid) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: req=%b idx=%b valid=%b expected idx=%b valid=%b",
                 name, req, idx, valid, exp_idx, exp_valid);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("req=10000000 -> idx=7 valid=1", 8'b10000000, 3'd7, 1'b1);
    check("req=01000000 -> idx=6 valid=1", 8'b01000000, 3'd6, 1'b1);
    check("req=00010000 -> idx=4 valid=1", 8'b00010000, 3'd4, 1'b1);
    check("req=00000001 -> idx=0 valid=1", 8'b00000001, 3'd0, 1'b1);
    check("req=00101010 -> idx=5 valid=1", 8'b00101010, 3'd5, 1'b1);
    check("req=00000111 -> idx=2 valid=1", 8'b00000111, 3'd2, 1'b1);
    check("req=00000000 -> idx=0 valid=0", 8'b00000000, 3'd0, 1'b0);
    check("req=11111111 -> idx=7 valid=1", 8'b11111111, 3'd7, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "encode-decode:interrupt-priority": {
    tests: [
      "mask disables the highest request (idx drops to 0)",
      "all lines masked -> valid=0",
      "full mask passes req through (idx=7)",
      "masked high line yields to the lower active line",
      "masking the only active line clears valid",
      "mask lets a lower line win over a masked higher one",
      "single unmasked line encodes to its index",
    ],
    starter: {
      "top.sv": `module top (
  input  wire [7:0] req,
  input  wire [7:0] en,
  output reg  [2:0] idx,
  output reg        valid
);
  // TODO: only requests enabled by the en mask may win arbitration.
  // This version ignores the mask entirely.
  always @(*) begin
    valid = |req;
    idx = 3'd0;
    casez (req)
      8'b1???????: idx = 3'd7;
      8'b01??????: idx = 3'd6;
      8'b001?????: idx = 3'd5;
      8'b0001????: idx = 3'd4;
      8'b00001???: idx = 3'd3;
      8'b000001??: idx = 3'd2;
      8'b0000001?: idx = 3'd1;
      8'b00000001: idx = 3'd0;
      default:     idx = 3'd0;
    endcase
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] req, en;
  logic [2:0] idx;
  logic valid;
  integer errors = 0;

  top dut (req, en, idx, valid);

  task check(input string name, input logic [7:0] vreq, input logic [7:0] ven,
             input logic [2:0] exp_idx, input logic exp_valid);
    begin
      req = vreq;
      en = ven;
      #1;
      if (idx === exp_idx && valid === exp_valid) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: req=%b en=%b idx=%b valid=%b expected idx=%b valid=%b",
                 name, req, en, idx, valid, exp_idx, exp_valid);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check("mask disables the highest request (idx drops to 0)", 8'b10000001, 8'b01111111, 3'd0, 1'b1);
    check("all lines masked -> valid=0", 8'b11111111, 8'b00000000, 3'd0, 1'b0);
    check("full mask passes req through (idx=7)", 8'b11111111, 8'b11111111, 3'd7, 1'b1);
    check("masked high line yields to the lower active line", 8'b00100100, 8'b00011111, 3'd2, 1'b1);
    check("masking the only active line clears valid", 8'b00010000, 8'b11101111, 3'd0, 1'b0);
    check("mask lets a lower line win over a masked higher one", 8'b10001000, 8'b00001111, 3'd3, 1'b1);
    check("single unmasked line encodes to its index", 8'b00000001, 8'b11111111, 3'd0, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};