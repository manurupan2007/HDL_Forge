import type { LessonTestSpec } from "../types";

/**
 * Chapter 15 — RISC-V Blocks (SystemVerilog dialect).
 * pc-datapath: PC+4 / branch-target mux plus I/S/B/U immediate extractors.
 * core-datapath: a tiny RV32I microcore — 8x32 ROM, 4 registers, ADDI/ADD/
 *   BEQ/HALT decode, branch skip, done flag. dbg mirrors regs[3].
 */
export const LESSONS_CH15: Record<string, LessonTestSpec> = {
  "risc-v-blocks:pc-datapath": {
    tests: [
      "reset loads the reset vector 0x1000",
      "pc advances by 4",
      "pc advances by 4 again",
      "branch taken jumps to pc_imm",
      "pc resumes +4 after branch",
      "I-type immediate sign-extends",
      "S and B immediates sign-extend",
      "U-immediate occupies the top 20 bits",
    ],
    starter: {
      "top.sv": `module top (
  input  logic        clk, rst,
  input  logic        branch_taken,
  input  logic [31:0] pc_imm,
  input  logic [31:0] inst,
  output logic [31:0] pc,
  output logic [31:0] imm_i,
  output logic [31:0] imm_s,
  output logic [31:0] imm_b,
  output logic [31:0] imm_u
);
  logic [31:0] pc_next;

  assign pc_next = branch_taken ? (pc + 32'd4) : pc_imm;   // TODO: mux is inverted
  always_ff @(posedge clk or posedge rst) begin
    if (rst) pc <= 32'h0000_1000;
    else pc <= pc_next;
  end

  assign imm_i = {20'b0, inst[31:20]};   // TODO: should be sign-extended
  assign imm_s = {{20{inst[31]}}, inst[31:25], inst[11:7]};
  assign imm_b = {{20{inst[31]}}, inst[7], inst[30:25], inst[11:8], 1'b0};
  assign imm_u = {inst[31:12], 12'b0};
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, branch_taken;
  logic [31:0] pc_imm, inst, pc;
  logic [31:0] imm_i, imm_s, imm_b, imm_u;
  integer errors = 0;
  integer gerr;

  top dut (clk, rst, branch_taken, pc_imm, inst, pc, imm_i, imm_s, imm_b, imm_u);

  always #5 clk = ~clk;

  task cycle();
    begin
      @(posedge clk);
      #1;
    end
  endtask

  task check_pc(input string name, input logic [31:0] exp_pc);
    begin
      if (pc === exp_pc) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: pc=%h expected %h", name, pc, exp_pc);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; branch_taken = 0; pc_imm = 0; inst = 0;
    cycle();
    rst = 0;
    check_pc("reset loads the reset vector 0x1000", 32'h0000_1000);

    cycle();
    check_pc("pc advances by 4", 32'h0000_1004);

    cycle();
    check_pc("pc advances by 4 again", 32'h0000_1008);

    branch_taken = 1; pc_imm = 32'h0000_2000;
    cycle();
    branch_taken = 0;
    check_pc("branch taken jumps to pc_imm", 32'h0000_2000);

    cycle();
    check_pc("pc resumes +4 after branch", 32'h0000_2004);

    inst = 32'hFE000293;   // ADDI x5, x0, -32
    #1;
    gerr = 0;
    if (imm_i !== 32'hFFFFFFE0) begin
      gerr = gerr + 1;
      errors = errors + 1;
      $display("[FAIL] I-type immediate sign-extends: imm_i=%h expected %h", imm_i, 32'hFFFFFFE0);
    end
    if (gerr === 0) $display("[PASS] I-type immediate sign-extends");

    gerr = 0;
    inst = 32'hFE22A623;   // SW x2, -20(x5)
    #1;
    if (imm_s !== 32'hFFFFFFEC) begin
      gerr = gerr + 1;
      errors = errors + 1;
      $display("[FAIL] S and B immediates sign-extend: imm_s=%h expected %h", imm_s, 32'hFFFFFFEC);
    end
    inst = 32'hFE1000E3;   // BEQ x2, x1, -32
    #1;
    if (imm_b !== 32'hFFFFFFE0) begin
      gerr = gerr + 1;
      errors = errors + 1;
      $display("[FAIL] S and B immediates sign-extend: imm_b=%h expected %h", imm_b, 32'hFFFFFFE0);
    end
    if (gerr === 0) $display("[PASS] S and B immediates sign-extend");

    inst = 32'h12345037;   // LUI x0, 0x12345
    #1;
    gerr = 0;
    if (imm_u !== 32'h12345000) begin
      gerr = gerr + 1;
      errors = errors + 1;
      $display("[FAIL] U-immediate occupies the top 20 bits: imm_u=%h expected %h", imm_u, 32'h12345000);
    end
    if (gerr === 0) $display("[PASS] U-immediate occupies the top 20 bits");

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "risc-v-blocks:core-datapath": {
    tests: [
      "reset: pc at 0, dbg 0, done low",
      "ADDI x1, x0, 5 executes",
      "ADDI x2, x0, 7 executes",
      "ADD x3, x1, x2 = 12",
      "BEQ skips the next word",
      "ADDI x3, x3, 1 = 13",
      "HALT raises done",
      "done stays high",
    ],
    starter: {
      "top.sv": `module top (
  input  logic        clk, rst,
  output logic [31:0] pc,
  output logic [31:0] dbg,
  output logic        done
);
  logic [31:0] rom [0:7];
  initial begin
    rom[0] = 32'h00500093;   // ADDI x1, x0, 5
    rom[1] = 32'h00700113;   // ADDI x2, x0, 7
    rom[2] = 32'h002081B3;   // ADD  x3, x1, x2
    rom[3] = 32'h00000463;   // BEQ  x0, x0, +8 (skip rom[4])
    rom[4] = 32'h00000193;   // ADDI x3, x0, 0 (skipped)
    rom[5] = 32'h00118193;   // ADDI x3, x3, 1
    rom[6] = 32'hFFFFFFFF;   // HALT
    rom[7] = 32'h00000000;
  end

  logic [31:0] instr;
  logic [4:0] rd, rs1, rs2;
  logic [31:0] imm_i, imm_b;
  logic [31:0] rs1_val, rs2_val, alu_out;
  logic is_addi, is_add, is_sub, is_beq, is_halt, reg_write, branch_taken;
  logic [31:0] regs [0:3];

  assign instr = rom[pc[4:2]];

  assign rd  = instr[11:7];
  assign rs1 = instr[19:15];
  assign rs2 = instr[24:20];
  assign imm_i = {{20{instr[31]}}, instr[31:20]};
  assign imm_b = {{20{instr[31]}}, instr[7], instr[30:25], instr[11:8], 1'b0};

  assign is_addi = (instr[6:0] == 7'b0010011) && (instr[14:12] == 3'b000);
  assign is_add  = (instr[6:0] == 7'b0110011) && (instr[14:12] == 3'b000) && (instr[31:25] == 7'b0000000);
  assign is_sub  = (instr[6:0] == 7'b0110011) && (instr[14:12] == 3'b000) && (instr[31:25] == 7'b0100000);
  assign is_beq  = (instr[6:0] == 7'b1100011) && (instr[14:12] == 3'b000);
  assign is_halt = (instr == 32'hFFFFFFFF);

  assign reg_write = is_addi | is_add | is_sub;
  assign rs1_val = (rs1 == 5'd0) ? 32'h00000000 : regs[rs1];
  assign rs2_val = (rs2 == 5'd0) ? 32'h00000000 : regs[rs2];

  always_comb begin
    if (is_sub) alu_out = rs1_val - rs2_val;
    else if (is_addi) alu_out = rs1_val + imm_i;
    else alu_out = rs1_val + rs2_val;
  end

  assign branch_taken = is_beq && (rs1_val != rs2_val);   // TODO: should be ==

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      pc <= 32'h0000_0000;
      done <= 1'b0;
      regs[0] <= 32'h00000000;
      regs[1] <= 32'h00000000;
      regs[2] <= 32'h00000000;
      regs[3] <= 32'h00000000;
    end else begin
      if (is_halt) begin
        done <= 1'b1;
      end else if (branch_taken) begin
        pc <= pc + imm_b;
      end else begin
        pc <= pc + 32'd4;
      end
      if (reg_write && rd != 5'd0 && rd < 5'd4) begin
        regs[rd] <= alu_out;
      end
    end
  end

  assign dbg = regs[3];
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
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
    check("reset: pc at 0, dbg 0, done low", 32'h00000000, 32'h00000000, 1'b0);

    cycle();
    check("ADDI x1, x0, 5 executes", 32'h00000004, 32'h00000000, 1'b0);

    cycle();
    check("ADDI x2, x0, 7 executes", 32'h00000008, 32'h00000000, 1'b0);

    cycle();
    check("ADD x3, x1, x2 = 12", 32'h0000000C, 32'h0000000C, 1'b0);

    cycle();
    check("BEQ skips the next word", 32'h00000014, 32'h0000000C, 1'b0);

    cycle();
    check("ADDI x3, x3, 1 = 13", 32'h00000018, 32'h0000000D, 1'b0);

    cycle();
    check("HALT raises done", 32'h00000018, 32'h0000000D, 1'b1);

    cycle();
    check("done stays high", 32'h00000018, 32'h0000000D, 1'b1);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};