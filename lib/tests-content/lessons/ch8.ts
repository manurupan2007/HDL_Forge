import type { LessonTestSpec } from "../types";

// Lessons in chapter 8. See gold template lib/tests-content/lessons/ch1.ts for
// CONVENTIONS: [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
// starter that fails >=1 test, solution in ../solutions/ch8.ts, generation "2012".
// Expected keys:
//   sequential-fundamentals:flip-flops,
//   sequential-fundamentals:synchronizer,
export const LESSONS_CH8: Record<string, LessonTestSpec> = {
  "sequential-fundamentals:flip-flops": {
    tests: [
      "q starts unknown before first reset",
      "async active-low reset clears q with no clock edge",
      "q loads 1 on an enabled posedge",
      "q follows d on the next enabled edge",
      "en=0 holds q through a posedge",
      "q loads 1 again after re-enable",
      "async reset clears q between clock edges",
    ],
    starter: {
      "top.sv": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  input  wire d,
  output reg  q,
  output wire qn
);
  // TODO: make the reset asynchronous (add negedge rst_n to the sensitivity
  // list) and gate the load with en.
  always @(posedge clk) begin
    if (!rst_n) q <= 1'b0;
    else q <= d;
  end
  assign qn = ~q;
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, en, d;
  logic q, qn;
  integer errors = 0;

  top dut (clk, rst_n, en, d, q, qn);

  always #5 clk = ~clk;

  task check(input string name, input logic exp_q);
    begin
      #1;
      if (q === exp_q && qn === ~exp_q) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: q=%b qn=%b expected q=%b qn=%b", name, q, qn, exp_q, ~exp_q);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst_n = 1'b1;
    en = 1'b0;
    d = 1'b0;
    check("q starts unknown before first reset", 1'bx);
    rst_n = 1'b0;
    check("async active-low reset clears q with no clock edge", 1'b0);
    rst_n = 1'b1;
    @(negedge clk);
    en = 1'b1;
    d = 1'b1;
    @(posedge clk);
    check("q loads 1 on an enabled posedge", 1'b1);
    @(negedge clk);
    d = 1'b0;
    @(posedge clk);
    check("q follows d on the next enabled edge", 1'b0);
    @(negedge clk);
    en = 1'b0;
    d = 1'b1;
    @(posedge clk);
    check("en=0 holds q through a posedge", 1'b0);
    @(negedge clk);
    en = 1'b1;
    @(posedge clk);
    check("q loads 1 again after re-enable", 1'b1);
    @(negedge clk);
    #1;
    rst_n = 1'b0;
    check("async reset clears q between clock edges", 1'b0);
    rst_n = 1'b1;
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "sequential-fundamentals:synchronizer": {
    tests: [
      "q is unknown before first reset",
      "async reset clears q with no clock edge",
      "after one edge the pulse sits only in stage 1",
      "after two edges the pulse reaches q",
      "q returns low once the pulse passes",
      "steady input appears at q after two rising edges",
      "async reset clears q between clock edges",
    ],
    starter: {
      "top.sv": `module top (
  input  wire clk,
  input  wire rst_n,
  input  wire d,
  output reg  q
);
  // TODO: two flip-flops in series (meta then sync) — one stage is not
  // enough to bound metastability.
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 1'b0;
    else q <= d;
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, d;
  logic q;
  integer errors = 0;

  top dut (clk, rst_n, d, q);

  always #5 clk = ~clk;

  task check(input string name, input logic exp_q);
    begin
      #1;
      if (q === exp_q) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: q=%b expected %b", name, q, exp_q);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst_n = 1'b1;
    d = 1'b0;
    check("q is unknown before first reset", 1'bx);
    rst_n = 1'b0;
    check("async reset clears q with no clock edge", 1'b0);
    rst_n = 1'b1;
    @(negedge clk);
    d = 1'b1;                       // single-cycle pulse
    @(posedge clk);
    check("after one edge the pulse sits only in stage 1", 1'b0);
    @(negedge clk);
    d = 1'b0;
    @(posedge clk);
    check("after two edges the pulse reaches q", 1'b1);
    @(posedge clk);
    check("q returns low once the pulse passes", 1'b0);
    @(negedge clk);
    d = 1'b1;                       // steady level
    @(posedge clk);
    @(posedge clk);
    check("steady input appears at q after two rising edges", 1'b1);
    @(negedge clk);
    #1;
    rst_n = 1'b0;
    check("async reset clears q between clock edges", 1'b0);
    rst_n = 1'b1;
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};