import type { LessonTestSpec } from "../types";

/**
 * Chapter 13 — Memory Blocks (SystemVerilog dialect).
 * single-port-ram: 256x8 synchronous-read RAM, write-first read-during-write.
 * rom-boot-image: 16x8 Fibonacci boot image (mod 256), combinational read.
 * The ROM image is initialized inline (the WASM sandbox has no boot.hex file);
 * the theory lesson still teaches $readmemh as the real-world approach.
 */
export const LESSONS_CH13: Record<string, LessonTestSpec> = {
  "memory:single-port-ram": {
    tests: [
      "read addr 0x00 returns 0xAB",
      "read addr 0xFF returns 0xCD",
      "read addr 0x80 returns 0x12",
      "read-during-write returns new data",
      "read addr 0x00 returns updated value",
      "write again and read back",
    ],
    starter: {
      "top.sv": `module top (
  input  logic        clk,
  input  logic        we,
  input  logic [7:0]  addr,
  input  logic [7:0]  din,
  output logic [7:0]  dout
);
  logic [7:0] mem [0:255];

  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;
    dout <= mem[addr];   // TODO: read-during-write returns the OLD value
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic we;
  logic [7:0] addr, din, dout;
  integer errors = 0;

  top dut (clk, we, addr, din, dout);

  always #5 clk = ~clk;

  task cycle();
    begin
      @(posedge clk);
      #1;
    end
  endtask

  task check(input string name, input logic [7:0] exp);
    begin
      if (dout === exp) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: addr=%h dout=%h expected %h", name, addr, dout, exp);
      end
    end
  endtask

  task write(input logic [7:0] av, input logic [7:0] dv);
    begin
      we = 1; addr = av; din = dv;
      cycle();
      we = 0;
    end
  endtask

  task read(input logic [7:0] av);
    begin
      we = 0; addr = av;
      cycle();
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    we = 0; addr = 0; din = 0;

    write(8'h00, 8'hAB);
    read(8'h00);
    check("read addr 0x00 returns 0xAB", 8'hAB);

    write(8'hFF, 8'hCD);
    read(8'hFF);
    check("read addr 0xFF returns 0xCD", 8'hCD);

    write(8'h80, 8'h12);
    read(8'h80);
    check("read addr 0x80 returns 0x12", 8'h12);

    // Read-during-write: dout must show the NEW data in the write cycle.
    we = 1; addr = 8'h00; din = 8'h77;
    cycle();
    check("read-during-write returns new data", 8'h77);
    we = 0;

    read(8'h00);
    check("read addr 0x00 returns updated value", 8'h77);

    write(8'h00, 8'hAB);
    read(8'h00);
    check("write again and read back", 8'hAB);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "memory:rom-boot-image": {
    tests: [
      "addr 0 reads 0x00",
      "addr 2 reads 0x01",
      "addr 5 reads 0x05",
      "addr 8 reads 0x15",
      "addr 13 reads 0xE9",
      "addr 15 reads 0x62",
      "full sweep: all 16 entries match",
    ],
    starter: {
      "top.sv": `module top (
  input  logic [3:0] addr,
  output logic [7:0] dout
);
  // Fibonacci boot image (mod 256): 0,1,1,2,3,5,8,13,21,34,55,89,144,233,121,98
  logic [7:0] rom [0:15];
  initial begin
    rom[0]  = 8'h00;
    rom[1]  = 8'h01;
    rom[2]  = 8'h01;
    rom[3]  = 8'h02;
    rom[4]  = 8'h03;
    rom[5]  = 8'h05;
    rom[6]  = 8'h08;
    rom[7]  = 8'h0D;
    rom[8]  = 8'h14;   // TODO: should be 0x15
    rom[9]  = 8'h22;
    rom[10] = 8'h37;
    rom[11] = 8'h59;
    rom[12] = 8'h90;
    rom[13] = 8'hE8;   // TODO: should be 0xE9
    rom[14] = 8'h79;
    rom[15] = 8'h62;
  end
  assign dout = rom[addr];
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] addr;
  logic [7:0] dout;
  logic [7:0] expected;
  integer errors = 0;
  integer i;
  integer gerr;

  top dut (addr, dout);

  task check_addr(input string name, input logic [3:0] av, input logic [7:0] exp);
    begin
      addr = av;
      #1;
      if (dout === exp) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: addr=%0d dout=%h expected %h", name, addr, dout, exp);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_addr("addr 0 reads 0x00", 4'd0, 8'h00);
    check_addr("addr 2 reads 0x01", 4'd2, 8'h01);
    check_addr("addr 5 reads 0x05", 4'd5, 8'h05);
    check_addr("addr 8 reads 0x15", 4'd8, 8'h15);
    check_addr("addr 13 reads 0xE9", 4'd13, 8'hE9);
    check_addr("addr 15 reads 0x62", 4'd15, 8'h62);

    gerr = 0;
    for (i = 0; i <= 15; i = i + 1) begin
      addr = i[3:0];
      #1;
      case (i)
        0:  expected = 8'h00;
        1:  expected = 8'h01;
        2:  expected = 8'h01;
        3:  expected = 8'h02;
        4:  expected = 8'h03;
        5:  expected = 8'h05;
        6:  expected = 8'h08;
        7:  expected = 8'h0D;
        8:  expected = 8'h15;
        9:  expected = 8'h22;
        10: expected = 8'h37;
        11: expected = 8'h59;
        12: expected = 8'h90;
        13: expected = 8'hE9;
        14: expected = 8'h79;
        15: expected = 8'h62;
        default: expected = 8'h00;
      endcase
      if (dout !== expected) begin
        gerr = gerr + 1;
        errors = errors + 1;
        if (gerr <= 3) begin
          $display("[FAIL] full sweep: addr=%0d dout=%h expected %h", i, dout, expected);
        end
      end
    end
    if (gerr === 0) $display("[PASS] full sweep: all 16 entries match");
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};