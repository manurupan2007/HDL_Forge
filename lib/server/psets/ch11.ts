/**
 * Hidden problem-set testbench for chapter 11. SERVER-ONLY — do not import from client code.
 * Traffic light with a pedestrian request: ped latches during main green/yellow and
 * extends the next side green to 5 cycles; ped during side green/yellow is ignored.
 */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH11: Record<string, PSetTestSpec> = {
  "finite-state-machines:traffic-light-controller": {
    testNames: [
      "reset starts with main green",
      "main green holds three cycles",
      "main yellow after green",
      "side green after yellow",
      "side green holds three cycles",
      "side yellow after green",
      "cycle returns to main green",
      "ped request during main green latches",
      "extended side green lasts five cycles",
      "override returns to main green",
      "ped during side green is ignored",
      "ped during main yellow honored",
      "ped during side yellow is ignored",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic clk = 0;
  logic rst, ped;
  logic [1:0] main_light, side_light;
  integer errors = 0;

  top dut (clk, rst, ped, main_light, side_light);

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
    rst = 1; ped = 0;
    @(posedge clk); #1;
    rst = 0;

    // Baseline: main green 3, yellow 1, side green 3, yellow 1, repeat.
    check("reset starts with main green", 2'b10, 2'b00);
    cycle(); cycle();
    check("main green holds three cycles", 2'b10, 2'b00);
    cycle();
    check("main yellow after green", 2'b01, 2'b00);
    cycle();
    check("side green after yellow", 2'b00, 2'b10);
    cycle(); cycle();
    check("side green holds three cycles", 2'b00, 2'b10);
    cycle();
    check("side yellow after green", 2'b00, 2'b01);
    cycle();
    check("cycle returns to main green", 2'b10, 2'b00);

    // Pedestrian request during main green: latched, side green extends to 5.
    ped = 1;
    cycle(); cycle();
    check("ped request during main green latches", 2'b10, 2'b00);
    cycle();                       // MG -> MY
    cycle();                       // MY -> SG
    cycle(); cycle(); cycle(); cycle();  // SG counts 1..4
    check("extended side green lasts five cycles", 2'b00, 2'b10);
    cycle();                       // SG -> SY
    cycle();                       // SY -> MG, request cleared
    check("override returns to main green", 2'b10, 2'b00);

    // Pedestrian during side green: ignored, side green stays 3 cycles.
    ped = 0;
    cycle(); cycle();              // MG counts 1..2
    cycle();                       // MG -> MY
    cycle();                       // MY -> SG
    ped = 1;
    cycle(); cycle();              // SG counts 1..2
    cycle();                       // SG -> SY (not extended)
    check("ped during side green is ignored", 2'b00, 2'b01);

    // Pedestrian during main yellow: honored, next side green extends to 5.
    cycle();                       // SY -> MG
    ped = 0;
    cycle(); cycle();              // MG counts 1..2
    cycle();                       // MG -> MY
    ped = 1;
    cycle();                       // MY -> SG, request latched
    cycle(); cycle(); cycle(); cycle();  // SG counts 1..4
    check("ped during main yellow honored", 2'b00, 2'b10);
    cycle();                       // SG -> SY
    ped = 1;                       // request during side yellow
    cycle();                       // SY -> MG, request cleared
    ped = 0;
    cycle(); cycle();              // MG counts 1..2
    cycle();                       // MG -> MY
    cycle();                       // MY -> SG
    cycle(); cycle();              // SG counts 1..2
    cycle();                       // SG -> SY (not extended)
    check("ped during side yellow is ignored", 2'b00, 2'b01);

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};