/** Reference top.sv for the chapter 11 problem set. Verify scripts only. */
export const PSET_SOLUTIONS_CH11: Record<string, string> = {
  "finite-state-machines:traffic-light-controller": `module top (
  input  logic clk, rst,
  input  logic ped,
  output logic [1:0] main_light,
  output logic [1:0] side_light
);
  // Light codes: 2'b00 RED, 2'b01 YELLOW, 2'b10 GREEN.
  typedef enum logic [1:0] { MG, MY, SG, SY } state_t;
  state_t state, next;
  logic [2:0] cnt;
  logic ped_req;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= MG;
      cnt <= 3'd0;
      ped_req <= 1'b0;
    end else begin
      state <= next;
      if (state == MG || state == SG) cnt <= cnt + 3'd1;
      else cnt <= 3'd0;
      if (ped && (state == MG || state == MY)) ped_req <= 1'b1;
      else if (state == SY) ped_req <= 1'b0;
    end
  end

  always_comb begin
    next = state;
    case (state)
      MG: if (cnt == 3'd2) next = MY;   // main green lasts 3 cycles
      MY: next = SG;
      SG: if ((ped_req && cnt == 3'd4) || (!ped_req && cnt == 3'd2)) next = SY;
      SY: next = MG;
      default: next = MG;
    endcase
  end

  always_comb begin
    main_light = 2'b00;
    side_light = 2'b00;
    case (state)
      MG: main_light = 2'b10;
      MY: main_light = 2'b01;
      SG: side_light = 2'b10;
      SY: side_light = 2'b01;
      default: ;
    endcase
  end
endmodule
`,
};