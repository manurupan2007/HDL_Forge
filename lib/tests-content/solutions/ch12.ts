/** Reference top.sv solutions for chapter 12. Verify scripts only; never bundled. */
export const SOLUTIONS_CH12: Record<string, string> = {
  "datapath:alu-build": `module top (
  input  logic [7:0] a, b,
  input  logic [2:0] op,
  output logic [7:0] y,
  output logic       zero,
  output logic       carry
);
  logic [8:0] sum9;

  always_comb begin
    sum9 = 9'd0;
    y = 8'h00;
    carry = 1'b0;
    case (op)
      3'b000: begin
        sum9 = {1'b0, a} + {1'b0, b};
        y = sum9[7:0];
        carry = sum9[8];
      end
      3'b001: begin
        sum9 = {1'b0, a} + {1'b0, ~b} + 9'd1;   // two's-complement subtract
        y = sum9[7:0];
        carry = sum9[8];                        // 1 = no borrow
      end
      3'b010: y = a & b;
      3'b011: y = a | b;
      3'b100: y = a ^ b;
      3'b101: y = (a < b) ? 8'h01 : 8'h00;      // slt, unsigned
      default: y = 8'h00;
    endcase
  end

  assign zero = (y == 8'h00);
endmodule
`,
  "datapath:register-file": `module top (
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

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      regs[0] <= 8'h00;
      regs[1] <= 8'h00;
      regs[2] <= 8'h00;
      regs[3] <= 8'h00;
    end else if (we) begin
      regs[waddr] <= wdata;
    end
  end

  always_comb begin
    rdata_a = regs[raddr_a];
    rdata_b = regs[raddr_b];
    // Read-during-write: a read of the written register sees the new data.
    if (we && raddr_a == waddr) rdata_a = wdata;
    if (we && raddr_b == waddr) rdata_b = wdata;
  end
endmodule
`,
};