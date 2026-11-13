/** Reference top.sv solutions for chapter 8. Verify scripts only; never bundled. */
export const SOLUTIONS_CH8: Record<string, string> = {
  "sequential-fundamentals:flip-flops": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  input  wire d,
  output reg  q,
  output wire qn
);
  // Async active-low reset: negedge rst_n in the sensitivity list.
  // Nonblocking <= samples from the OLD values, so en-gating never races.
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 1'b0;
    else if (en) q <= d;
  end
  assign qn = ~q;
endmodule
`,
  "sequential-fundamentals:synchronizer": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire d,
  output wire q
);
  // Two flip-flops in series: stage 1 (meta) catches the async input,
  // stage 2 (sync) only ever samples a settled signal.
  reg meta, sync;
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      meta <= 1'b0;
      sync <= 1'b0;
    end else begin
      meta <= d;
      sync <= meta;
    end
  end
  assign q = sync;
endmodule
`,
};