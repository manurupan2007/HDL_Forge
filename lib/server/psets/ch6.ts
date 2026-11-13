/** Hidden problem-set testbench for chapter 6. SERVER-ONLY — do not import from client code. */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH6: Record<string, PSetTestSpec> = {
  "arithmetic:signed-magnitude-compare": {
    testNames: [
      "all a x b=0..3 pairs match signed flags",
      "all a x b=4..7 pairs match signed flags",
      "all a x b=8..11 pairs match signed flags",
      "all a x b=12..15 pairs match signed flags",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [3:0] a, b;
  logic alt, aeq, agt;
  logic exp_alt, exp_aeq, exp_agt;
  integer errors = 0;
  integer ai, bi, gerr;

  top dut (a, b, alt, aeq, agt);

  task check_group(input string name, input integer blo, input integer bhi);
    begin
      gerr = 0;
      for (ai = 0; ai <= 15; ai = ai + 1) begin
        for (bi = blo; bi <= bhi; bi = bi + 1) begin
          a = ai;
          b = bi;
          #1;
          exp_aeq = (a === b);
          exp_alt = ($signed(a) < $signed(b));
          exp_agt = ($signed(a) > $signed(b));
          if (alt !== exp_alt || aeq !== exp_aeq || agt !== exp_agt) begin
            gerr = gerr + 1;
            errors = errors + 1;
            if (gerr <= 3) begin
              $display("[FAIL] %s: a=%b b=%b alt=%b aeq=%b agt=%b expected %b %b %b",
                       name, a, b, alt, aeq, agt, exp_alt, exp_aeq, exp_agt);
            end
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("all a x b=0..3 pairs match signed flags", 0, 3);
    check_group("all a x b=4..7 pairs match signed flags", 4, 7);
    check_group("all a x b=8..11 pairs match signed flags", 8, 11);
    check_group("all a x b=12..15 pairs match signed flags", 12, 15);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};