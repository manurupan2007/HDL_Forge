/** Hidden problem-set testbench for chapter 7. SERVER-ONLY — do not import from client code. */
import type { PSetTestSpec } from "../../tests-content/types";

export const PSETS_CH7: Record<string, PSetTestSpec> = {
  "encode-decode:interrupt-priority": {
    testNames: [
      "all requests 0..63 encode the highest set bit",
      "all requests 64..127 encode the highest set bit",
      "all requests 128..191 encode the highest set bit",
      "all requests 192..255 encode the highest set bit",
    ],
    tb: `\`timescale 1ps/1ps
module top_tb;
  logic [7:0] req;
  logic [2:0] idx;
  logic valid;
  logic [2:0] exp_idx;
  logic exp_valid;
  integer errors = 0;
  integer row, k, gerr;

  top dut (req, idx, valid);

  task check_group(input string name, input integer lo, input integer hi);
    begin
      gerr = 0;
      for (row = lo; row <= hi; row = row + 1) begin
        req = row;
        #1;
        exp_valid = (row != 0);
        exp_idx = 3'd0;
        for (k = 0; k < 8; k = k + 1)
          if (req[k]) exp_idx = k;   // last write wins -> highest set bit
        if (idx !== exp_idx || valid !== exp_valid) begin
          gerr = gerr + 1;
          errors = errors + 1;
          if (gerr <= 3) begin
            $display("[FAIL] %s: req=%b idx=%b valid=%b expected idx=%b valid=%b",
                     name, req, idx, valid, exp_idx, exp_valid);
          end
        end
      end
      if (gerr === 0) $display("[PASS] %s", name);
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, top_tb);
    check_group("all requests 0..63 encode the highest set bit", 0, 63);
    check_group("all requests 64..127 encode the highest set bit", 64, 127);
    check_group("all requests 128..191 encode the highest set bit", 128, 191);
    check_group("all requests 192..255 encode the highest set bit", 192, 255);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule
`,
    generation: "2012",
    points: 10,
  },
};