import type { LessonTestSpec } from "../types";

// Lessons in chapter 9. See gold template lib/tests-content/lessons/ch1.ts for
// CONVENTIONS: [PASS]/[FAIL] protocol, test names == tests array, $dumpvars + #1, ===,
// starter that fails >=1 test, solution in ../solutions/ch9.ts, generation "2012".
// Expected keys:
//   counters:mod-n-counter,
//   counters:clock-divider,
export const LESSONS_CH9: Record<string, LessonTestSpec> = {
  "counters:mod-n-counter": {
    tests: [
      "async reset clears count to 0 (tc low)",
      "enabled counter counts 0 to 1",
      "enabled counter counts 1 to 2",
      "en=0 holds the count",
      "count reaches terminal 9 with tc high",
      "count wraps 9 to 0 and tc drops",
    ],
    starter: {
      "top.sv": `module top #(
  parameter W = 4,
  parameter N = 10
)(
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  output reg  [W-1:0] count,
  output wire tc
);
  // TODO: wrap at the modulus N (not at 2^W) and pulse tc at N-1.
  assign tc = (count == {W{1'b1}});
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= {W{1'b0}};
    else if (en) count <= count + 1'b1;
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, en;
  logic [3:0] count;
  logic tc;
  integer errors = 0;

  top dut (clk, rst_n, en, count, tc);

  always #5 clk = ~clk;

  task check(input string name, input logic [3:0] exp_c, input logic exp_tc);
    begin
      #1;
      if (count === exp_c && tc === exp_tc) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: count=%0d tc=%b expected count=%0d tc=%b",
                 name, count, tc, exp_c, exp_tc);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst_n = 1'b1;
    en = 1'b0;
    #1;
    rst_n = 1'b0;
    check("async reset clears count to 0 (tc low)", 4'd0, 1'b0);
    rst_n = 1'b1;
    @(negedge clk);
    en = 1'b1;
    @(posedge clk);
    check("enabled counter counts 0 to 1", 4'd1, 1'b0);
    @(posedge clk);
    check("enabled counter counts 1 to 2", 4'd2, 1'b0);
    @(negedge clk);
    en = 1'b0;
    @(posedge clk);
    check("en=0 holds the count", 4'd2, 1'b0);
    @(negedge clk);
    en = 1'b1;
    repeat (7) @(posedge clk);
    check("count reaches terminal 9 with tc high", 4'd9, 1'b1);
    @(posedge clk);
    check("count wraps 9 to 0 and tc drops", 4'd0, 1'b0);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
  "counters:clock-divider": {
    tests: [
      "async reset clears clk_out to 0",
      "clk_out still low after the first enabled edge",
      "clk_out toggles high after HALF edges",
      "en=0 freezes clk_out",
      "clk_out returns low after another HALF edges",
    ],
    starter: {
      "top.sv": `module top #(
  parameter HALF = 2
)(
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  output reg  clk_out
);
  reg [7:0] cnt;
  // TODO: toggle clk_out when the half-period count expires.
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      cnt <= 8'd0;
      clk_out <= 1'b0;
    end else if (en) begin
      if (cnt == HALF - 1) cnt <= 8'd0;
      else cnt <= cnt + 8'd1;
    end
  end
endmodule
`,
      "top_tb.sv": `// Your own testbench. Lesson checks run against a hidden bench.
`,
    },
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 1'b0;
  logic rst_n, en;
  logic clk_out;
  integer errors = 0;

  top dut (clk, rst_n, en, clk_out);

  always #5 clk = ~clk;

  task check(input string name, input logic exp_out);
    begin
      #1;
      if (clk_out === exp_out) begin
        $display("[PASS] %s", name);
      end else begin
        errors = errors + 1;
        $display("[FAIL] %s: clk_out=%b expected %b", name, clk_out, exp_out);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    rst_n = 1'b1;
    en = 1'b0;
    #1;
    rst_n = 1'b0;
    check("async reset clears clk_out to 0", 1'b0);
    rst_n = 1'b1;
    @(negedge clk);
    en = 1'b1;
    @(posedge clk);
    check("clk_out still low after the first enabled edge", 1'b0);
    @(posedge clk);
    check("clk_out toggles high after HALF edges", 1'b1);
    @(negedge clk);
    en = 1'b0;
    repeat (3) @(posedge clk);
    check("en=0 freezes clk_out", 1'b1);
    @(negedge clk);
    en = 1'b1;
    @(posedge clk);
    @(posedge clk);
    check("clk_out returns low after another HALF edges", 1'b0);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
  },
};