/** Reference top.sv solutions for chapter 11. Verify scripts only; never bundled. */
export const SOLUTIONS_CH11: Record<string, string> = {
  "finite-state-machines:mealy-vs-moore": `module top (
  input  logic clk, rst,
  input  logic in,
  output logic det
);
  typedef enum logic [1:0] { S0, S1, S2, S3 } state_t;
  state_t state, next;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= S0;
    else state <= next;
  end

  always_comb begin
    next = state;
    case (state)
      S0: if (in) next = S1; else next = S0;
      S1: if (in) next = S1; else next = S2;
      S2: if (in) next = S3; else next = S0;
      S3: if (in) next = S1; else next = S2;
      default: next = S0;
    endcase
  end

  // Moore-style output: depends only on the state, so det is stable for a
  // full cycle after "101" is seen (including the overlapping "1011" case).
  assign det = (state == S3);
endmodule
`,
  "finite-state-machines:fsm-2-step": `module top (
  input  logic clk, rst,
  input  logic go,
  output logic busy,
  output logic done
);
  typedef enum logic [1:0] { IDLE, RUN, DONE } state_t;
  state_t state, next;
  logic tick;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= IDLE;
      tick <= 1'b0;
    end else begin
      state <= next;
      if (state == RUN) tick <= ~tick;
      else tick <= 1'b0;
    end
  end

  always_comb begin
    next = state;
    busy = 1'b0;
    done = 1'b0;
    case (state)
      IDLE: if (go) next = RUN;
      RUN: begin
        busy = 1'b1;
        if (tick) next = DONE;   // RUN lasts two cycles: tick toggles 0 -> 1
      end
      DONE: begin
        done = 1'b1;
        next = IDLE;
      end
      default: next = IDLE;
    endcase
  end
endmodule
`,
  "finite-state-machines:traffic-light-controller": `module top (
  input  logic clk, rst,
  output logic [1:0] main_light,
  output logic [1:0] side_light
);
  // Light codes: 2'b00 RED, 2'b01 YELLOW, 2'b10 GREEN.
  typedef enum logic [1:0] { MG, MY, SG, SY } state_t;
  state_t state, next;
  logic [1:0] cnt;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= MG;
      cnt <= 2'd0;
    end else begin
      state <= next;
      if (state == MG || state == SG) cnt <= cnt + 2'd1;
      else cnt <= 2'd0;
    end
  end

  always_comb begin
    next = state;
    case (state)
      MG: if (cnt == 2'd2) next = MY;   // green lasts 3 cycles
      MY: next = SG;
      SG: if (cnt == 2'd2) next = SY;   // green lasts 3 cycles
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