/** Reference top.sv for the chapter 8 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH8: Record<string, string> = {
  "sequential-fundamentals:synchronizer": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire d,
  output wire q
);
  // Metastability-hardened synchronizer: two stages, async active-low reset.
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