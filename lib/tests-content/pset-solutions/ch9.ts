/** Reference top.sv for the chapter 9 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH9: Record<string, string> = {
  "counters:clock-divider": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  output reg  clk_out,
  output wire [2:0] phase
);
  // Divide-by-8 with 50% duty: toggle clk_out every 4 enabled rising
  // edges (the half period). phase = {clk_out, hcnt} walks 0..7.
  reg [1:0] hcnt;
  assign phase = {clk_out, hcnt};
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      hcnt <= 2'd0;
      clk_out <= 1'b0;
    end else if (en) begin
      if (hcnt == 2'd3) begin
        hcnt <= 2'd0;
        clk_out <= ~clk_out;
      end else begin
        hcnt <= hcnt + 2'd1;
      end
    end
  end
endmodule
`,
};