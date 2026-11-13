import type { LessonTestSpec } from "../types";

/**
 * Chapter 11 — Finite State Machines (SystemVerilog dialect).
 * Two-paragraph FSM style: always_ff for registered state, always_comb for
 * next-state + output decode. Mealy vs Moore distinction is exercised by the
 * mealy-vs-moore starter (a Mealy output that fires a cycle early).
 */
export const LESSONS_CH11: Record<string, LessonTestSpec> = {
  "finite-state-machines:mealy-vs-moore": {
    tests: [
      "reset clears det",
      "saw 1: det stays low",
      "saw 10: det stays low",
      "saw 101: det goes high",
      "next 0: det falls low",
      "overlap 1011: det high again",
      "after overlap 1: det low",
      "saw 10 again: det low",
      "final 101: det high",
    ],
    starter: {
      "top.sv": `module top (
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

  // Mealy-style output: watches the input too, so det fires a cycle early.
  assign det = (state == S2) && in;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, in, det;
  integer errors = 0;

  top dut (clk, rst, in, det);

  always #5 clk = ~clk;

  task step(input string name, input logic bit_in, input logic exp_det);
    begin
      in = bit_in;
      @(posedge clk);
      #1;
      if (det === exp_det) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: in=%b det=%b expected %b", name, in, det, exp_det);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; in = 0;
    @(posedge clk); #1;
    rst = 0;
    if (det === 1'b0) $display("[PASS] reset clears det");
    else begin
      errors = errors + 1;
      $display("[FAIL] reset clears det: det=%b", det);
    end
    step("saw 1: det stays low", 1'b1, 1'b0);
    step("saw 10: det stays low", 1'b0, 1'b0);
    step("saw 101: det goes high", 1'b1, 1'b1);
    step("next 0: det falls low", 1'b0, 1'b0);
    step("overlap 1011: det high again", 1'b1, 1'b1);
    step("after overlap 1: det low", 1'b1, 1'b0);
    step("saw 10 again: det low", 1'b0, 1'b0);
    step("final 101: det high", 1'b1, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "finite-state-machines:fsm-2-step": {
    tests: [
      "reset returns to IDLE",
      "go starts the burst: busy high",
      "burst holds busy for two cycles",
      "burst completes: done high",
      "done pulses exactly one cycle",
      "idle after done: busy and done low",
      "go starts a second burst",
      "second burst holds busy",
      "second burst done",
    ],
    starter: {
      "top.sv": `module top (
  input  logic clk, rst,
  input  logic go,
  output logic busy,
  output logic done
);
  typedef enum logic [1:0] { IDLE, RUN, DONE } state_t;
  state_t state, next;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= IDLE;
    else state <= next;
  end

  always_comb begin
    next = state;
    busy = 1'b0;
    done = 1'b0;
    case (state)
      IDLE: if (go) next = RUN;
      RUN: begin
        busy = 1'b1;
        next = DONE;   // TODO: RUN should last two cycles
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
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, go, busy, done;
  integer errors = 0;

  top dut (clk, rst, go, busy, done);

  always #5 clk = ~clk;

  task tick(input string name, input logic go_val, input logic exp_busy, input logic exp_done);
    begin
      go = go_val;
      @(posedge clk);
      #1;
      if (busy === exp_busy && done === exp_done) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: busy=%b done=%b expected busy=%b done=%b", name, busy, done, exp_busy, exp_done);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1; go = 0;
    @(posedge clk); #1;
    rst = 0;
    if (busy === 1'b0 && done === 1'b0) $display("[PASS] reset returns to IDLE");
    else begin
      errors = errors + 1;
      $display("[FAIL] reset returns to IDLE: busy=%b done=%b", busy, done);
    end
    tick("go starts the burst: busy high", 1'b1, 1'b1, 1'b0);
    tick("burst holds busy for two cycles", 1'b1, 1'b1, 1'b0);
    tick("burst completes: done high", 1'b0, 1'b0, 1'b1);
    tick("done pulses exactly one cycle", 1'b0, 1'b0, 1'b0);
    tick("idle after done: busy and done low", 1'b0, 1'b0, 1'b0);
    tick("go starts a second burst", 1'b1, 1'b1, 1'b0);
    tick("second burst holds busy", 1'b0, 1'b1, 1'b0);
    tick("second burst done", 1'b0, 1'b0, 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "finite-state-machines:traffic-light-controller": {
    tests: [
      "reset starts with main green",
      "main green holds for three cycles",
      "main turns yellow after green",
      "yellow lasts one cycle",
      "side green holds for three cycles",
      "side turns yellow",
      "cycle returns to main green",
    ],
    starter: {
      "top.sv": `module top (
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
      MG: if (cnt == 2'd1) next = MY;   // TODO: green should last 3 cycles
      MY: next = SG;
      SG: if (cnt == 2'd2) next = SY;
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
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst;
  logic [1:0] main_light, side_light;
  integer errors = 0;

  top dut (clk, rst, main_light, side_light);

  always #5 clk = ~clk;

  task cycle();
    begin
      @(posedge clk);
      #1;
    end
  endtask

  task check(input string name, input logic [1:0] exp_main, input logic [1:0] exp_side);
    begin
      if (main_light === exp_main && side_light === exp_side) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: main=%b side=%b expected main=%b side=%b", name, main_light, side_light, exp_main, exp_side);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst = 1;
    @(posedge clk); #1;
    rst = 0;
    check("reset starts with main green", 2'b10, 2'b00);
    cycle();
    cycle();
    check("main green holds for three cycles", 2'b10, 2'b00);
    cycle();
    check("main turns yellow after green", 2'b01, 2'b00);
    cycle();
    check("yellow lasts one cycle", 2'b00, 2'b10);
    cycle();
    cycle();
    check("side green holds for three cycles", 2'b00, 2'b10);
    cycle();
    check("side turns yellow", 2'b00, 2'b01);
    cycle();
    check("cycle returns to main green", 2'b10, 2'b00);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};