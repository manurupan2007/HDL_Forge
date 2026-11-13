/** Reference top.sv solutions for chapter 9. Verify scripts only; never bundled. */
export const SOLUTIONS_CH9: Record<string, string> = {
  "counters:mod-n-counter": `module top #(
  parameter W = 4,
  parameter N = 10
)(
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  output reg  [W-1:0] count,
  output wire tc
);
  // Terminal count: combinational pulse, high exactly at N-1.
  assign tc = (count == N - 1);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= {W{1'b0}};
    else if (en) begin
      if (count == N - 1) count <= {W{1'b0}};   // wrap at the modulus
      else count <= count + 1'b1;
    end
  end
endmodule
`,
  "counters:clock-divider": `module top #(
  parameter HALF = 2
)(
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  output reg  clk_out
);
  // Half-period toggle divider: clk_out flips every HALF enabled rising
  // edges, so the output period is 2*HALF input clocks at 50% duty.
  reg [7:0] cnt;
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      cnt <= 8'd0;
      clk_out <= 1'b0;
    end else if (en) begin
      if (cnt == HALF - 1) begin
        cnt <= 8'd0;
        clk_out <= ~clk_out;
      end else begin
        cnt <= cnt + 8'd1;
      end
    end
  end
endmodule
`,
};