/** Reference top.sv for the chapter 12 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH12: Record<string, string> = {
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