/** Reference top.sv solutions for chapter 7. Verify scripts only; never bundled. */
export const SOLUTIONS_CH7: Record<string, string> = {
  "encode-decode:priority-encoder": `module top (
  input  wire [7:0] req,
  output reg  [2:0] idx,
  output reg        valid
);
  // Highest priority is req[7]; the first matching casez item wins.
  always @(*) begin
    valid = |req;
    idx   = 3'd0;
    casez (req)
      8'b1???????: idx = 3'd7;
      8'b01??????: idx = 3'd6;
      8'b001?????: idx = 3'd5;
      8'b0001????: idx = 3'd4;
      8'b00001???: idx = 3'd3;
      8'b000001??: idx = 3'd2;
      8'b0000001?: idx = 3'd1;
      8'b00000001: idx = 3'd0;
      default:     idx = 3'd0;   // no request: valid is already 0
    endcase
  end
endmodule
`,
  "encode-decode:interrupt-priority": `module top (
  input  wire [7:0] req,
  input  wire [7:0] en,
  output reg  [2:0] idx,
  output reg        valid
);
  // Masked requests cannot win arbitration: encode (req & en).
  wire [7:0] masked = req & en;
  always @(*) begin
    valid = |masked;
    idx   = 3'd0;
    casez (masked)
      8'b1???????: idx = 3'd7;
      8'b01??????: idx = 3'd6;
      8'b001?????: idx = 3'd5;
      8'b0001????: idx = 3'd4;
      8'b00001???: idx = 3'd3;
      8'b000001??: idx = 3'd2;
      8'b0000001?: idx = 3'd1;
      8'b00000001: idx = 3'd0;
      default:     idx = 3'd0;
    endcase
  end
endmodule
`,
};