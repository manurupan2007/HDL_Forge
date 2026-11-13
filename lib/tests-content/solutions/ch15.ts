/** Reference top.sv solutions for chapter 15. Verify scripts only; never bundled. */
export const SOLUTIONS_CH15: Record<string, string> = {
  "risc-v-blocks:pc-datapath": `module top (
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

  assign pc_next = branch_taken ? pc_imm : (pc + 32'd4);
  always_ff @(posedge clk or posedge rst) begin
    if (rst) pc <= 32'h0000_1000;
    else pc <= pc_next;
  end

  // I-type: inst[31:20] sign-extended.
  assign imm_i = {{20{inst[31]}}, inst[31:20]};
  // S-type: inst[31:25] | inst[11:7] sign-extended.
  assign imm_s = {{20{inst[31]}}, inst[31:25], inst[11:7]};
  // B-type: inst[31] inst[7] inst[30:25] inst[11:8] 0, sign-extended.
  assign imm_b = {{20{inst[31]}}, inst[7], inst[30:25], inst[11:8], 1'b0};
  // U-type: top 20 bits, low 12 zero.
  assign imm_u = {inst[31:12], 12'b0};
endmodule
`,
  "risc-v-blocks:core-datapath": `module top (
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

  assign branch_taken = is_beq && (rs1_val == rs2_val);

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
};