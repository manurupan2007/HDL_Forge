/** Reference top.sv for the chapter 13 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH13: Record<string, string> = {
  "memory:rom-boot-image": `module top (
  input  logic        clk, rst,
  input  logic [3:0]  addr,
  output logic [7:0]  dout,
  output logic        valid
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
    rom[8]  = 8'h15;
    rom[9]  = 8'h22;
    rom[10] = 8'h37;
    rom[11] = 8'h59;
    rom[12] = 8'h90;
    rom[13] = 8'hE9;
    rom[14] = 8'h79;
    rom[15] = 8'h62;
  end

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      dout <= 8'h00;
      valid <= 1'b0;
    end else begin
      dout <= rom[addr];
      valid <= 1'b1;
    end
  end
endmodule
`,
};