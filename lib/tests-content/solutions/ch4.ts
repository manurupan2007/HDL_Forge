/** Reference top.sv solutions for chapter 4. Verify scripts only; never bundled. */
export const SOLUTIONS_CH4: Record<string, string> = {
  "multiplexers:mux-circuits": `module top (
  input  wire [3:0] a, b, c, d,
  input  wire       s,
  input  wire [1:0] sel,
  output wire [3:0] y2,
  output reg  [3:0] y4
);
  // 2:1 mux with the ternary operator.
  assign y2 = s ? b : a;
  // 4:1 mux with case; default covers 2'b11 and any x/z.
  always @(*) begin
    case (sel)
      2'b00:   y4 = a;
      2'b01:   y4 = b;
      2'b10:   y4 = c;
      default: y4 = d;
    endcase
  end
endmodule
`,
  "multiplexers:feature-selector": `module top (
  input  wire [3:0] a, b, c, d,
  input  wire [1:0] sel,
  output reg  [3:0] y
);
  always @(*) begin
    case (sel)
      2'b00:   y = a;
      2'b01:   y = b;
      2'b10:   y = c;
      default: y = d;
    endcase
  end
endmodule
`,
};