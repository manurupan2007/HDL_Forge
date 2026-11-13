import type { LessonTestSpec } from "../types";

/**
 * Chapter 12 — Datapath: ALUs & Registers (SystemVerilog dialect).
 * alu-build: 8-bit ALU, six ops under a 3-bit opcode, zero + carry flags.
 * register-file: 2R1W register file with synchronous write and
 * read-during-write semantics (write-first).
 */
export const LESSONS_CH12: Record<string, LessonTestSpec> = {
  "datapath:alu-build": {
    tests: [
      "add: 0x12 + 0x2E = 0x40",
      "add: 0xFF + 0x01 wraps with carry",
      "sub: 0x50 - 0x20 = 0x30 no borrow",
      "sub: 0x20 - 0x50 = 0xD0 borrow",
      "and: 0xF0 & 0x3C = 0x30",
      "or: 0xF0 | 0x0F = 0xFF",
      "xor: 0xAA ^ 0x55 = 0xFF",
      "slt: 0x03 < 0x80 is true",
      "slt: 0x80 < 0x03 is false",
      "unknown opcode yields zero",
    ],
    starter: {
      "top.sv": `module top (
  input  logic [7:0] a, b,
  input  logic [2:0] op,
  output logic [7:0] y,
  output logic       zero,
  output logic       carry
);
  logic [7:0] result;

  always_comb begin
    case (op)
      3'b000: result = a + b;
      3'b001: result = a - b;
      3'b010: result = a & b;
      3'b011: result = a | b;
      3'b100: result = a ^ b;
      3'b101: result = (a > b) ? 8'h01 : 8'h00;  // TODO: slt is a < b
      default: result = 8'h00;
    endcase
  end

  assign y = result;
  assign zero = (result == 8'h00);
  assign carry = 1'b0;   // TODO: carry out of add/sub
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] a, b;
  logic [2:0] op;
  logic [7:0] y;
  logic zero, carry;
  integer errors = 0;

  top dut (a, b, op, y, zero, carry);

  task check_alu(input string name, input logic [7:0] av, input logic [7:0] bv,
                 input logic [2:0] opv, input logic [7:0] exp_y,
                 input logic exp_zero, input logic exp_carry);
    begin
      a = av; b = bv; op = opv;
      #1;
      if (y === exp_y && zero === exp_zero && carry === exp_carry) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: a=%h b=%h op=%b y=%h zero=%b carry=%b expected y=%h zero=%b carry=%b",
                 name, a, b, op, y, zero, carry, exp_y, exp_zero, exp_carry);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_alu("add: 0x12 + 0x2E = 0x40", 8'h12, 8'h2E, 3'b000, 8'h40, 1'b0, 1'b0);
    check_alu("add: 0xFF + 0x01 wraps with carry", 8'hFF, 8'h01, 3'b000, 8'h00, 1'b1, 1'b1);
    check_alu("sub: 0x50 - 0x20 = 0x30 no borrow", 8'h50, 8'h20, 3'b001, 8'h30, 1'b0, 1'b1);
    check_alu("sub: 0x20 - 0x50 = 0xD0 borrow", 8'h20, 8'h50, 3'b001, 8'hD0, 1'b0, 1'b0);
    check_alu("and: 0xF0 & 0x3C = 0x30", 8'hF0, 8'h3C, 3'b010, 8'h30, 1'b0, 1'b0);
    check_alu("or: 0xF0 | 0x0F = 0xFF", 8'hF0, 8'h0F, 3'b011, 8'hFF, 1'b0, 1'b0);
    check_alu("xor: 0xAA ^ 0x55 = 0xFF", 8'hAA, 8'h55, 3'b100, 8'hFF, 1'b0, 1'b0);
    check_alu("slt: 0x03 < 0x80 is true", 8'h03, 8'h80, 3'b101, 8'h01, 1'b0, 1'b0);
    check_alu("slt: 0x80 < 0x03 is false", 8'h80, 8'h03, 3'b101, 8'h00, 1'b1, 1'b0);
    check_alu("unknown opcode yields zero", 8'hFF, 8'hFF, 3'b110, 8'h00, 1'b1, 1'b0);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "datapath:register-file": {
    tests: [
      "reset clears all registers",
      "write r0 then read back",
      "write r1 then read back",
      "write r2 then read back",
      "write r3 then read back",
      "two reads see different registers",
      "read-during-write: port A sees new data",
      "read-during-write: port B sees new data",
      "write with we low is ignored",
    ],
    starter: {
      "top.sv": `module top (
  input  logic        clk, rst,
  input  logic        we,
  input  logic [1:0]  waddr,
  input  logic [7:0]  wdata,
  input  logic [1:0]  raddr_a,
  input  logic [1:0]  raddr_b,
  output logic [7:0]  rdata_a,
  output logic [7:0]  rdata_b
);
  logic [7:0] regs [0:3];

  always_ff @(posedge clk) begin
    if (we) regs[waddr] <= wdata;
  end

  always_comb begin
    rdata_a = regs[raddr_a];
    rdata_b = regs[raddr_b];
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, we;
  logic [1:0] waddr, raddr_a, raddr_b;
  logic [7:0] wdata, rdata_a, rdata_b;
  integer errors = 0;

  top dut (clk, rst, we, waddr, wdata, raddr_a, raddr_b, rdata_a, rdata_b);

  always #5 clk = ~clk;

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

  task write_reg(input logic [1:0] addr, input logic [7:0] data);
    begin
      we = 1; waddr = addr; wdata = data;
      @(posedge clk);
      #1;
      we = 0;
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; we = 0; waddr = 0; wdata = 0; raddr_a = 0; raddr_b = 0;
    @(posedge clk); #1;
    rst = 0;
    check2("reset clears all registers", 8'h00, 8'h00);

    raddr_a = 2'd0; raddr_b = 2'd1;
    write_reg(2'd0, 8'hA5);
    check2("write r0 then read back", 8'hA5, 8'h00);

    raddr_a = 2'd1; raddr_b = 2'd2;
    write_reg(2'd1, 8'h3C);
    check2("write r1 then read back", 8'h3C, 8'h00);

    raddr_a = 2'd2; raddr_b = 2'd3;
    write_reg(2'd2, 8'h5A);
    check2("write r2 then read back", 8'h5A, 8'h00);

    raddr_a = 2'd3; raddr_b = 2'd0;
    write_reg(2'd3, 8'hFF);
    check2("write r3 then read back", 8'hFF, 8'hA5);

    raddr_a = 2'd1; raddr_b = 2'd2;
    #1;
    check2("two reads see different registers", 8'h3C, 8'h5A);

    // Read-during-write: drive waddr/wdata and read the same address.
    we = 1; waddr = 2'd0; wdata = 8'h77;
    raddr_a = 2'd0; raddr_b = 2'd1;
    @(posedge clk);
    #1;
    check2("read-during-write: port A sees new data", 8'h77, 8'h3C);
    we = 0;

    we = 1; waddr = 2'd1; wdata = 8'h88;
    raddr_a = 2'd0; raddr_b = 2'd1;
    @(posedge clk);
    #1;
    check2("read-during-write: port B sees new data", 8'h77, 8'h88);
    we = 0;

    // we low: write ignored.
    we = 0; waddr = 2'd2; wdata = 8'h99;
    raddr_a = 2'd2; raddr_b = 2'd3;
    @(posedge clk);
    #1;
    check2("write with we low is ignored", 8'h5A, 8'hFF);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};