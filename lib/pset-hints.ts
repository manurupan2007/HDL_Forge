/**
 * Built-in hint ladder + pitfall checklists for every problem set.
 *
 * CLIENT-SAFE by design: this file contains design-level guidance only —
 * never hidden-testbench vectors or bench code. The hidden benches live in
 * lib/server/psets/ and stay server-only. Hints describe WHAT the grader
 * checks (test names are already student-visible in the Checks panel) and
 * HOW to think about the design, so a stuck student can climb at their own
 * pace without anyone handing them a solution.
 *
 * Hint escalation contract:
 *   hint 1 — unpack the spec into plain facts and exact numbers
 *   hint 2 — the design sketch (state list / block structure)
 *   hint 3 — the subtle trap the bench actually catches
 */

export type PSetHint = {
  /** Progressive hints, revealed one at a time. */
  hints: [string, string, string];
  /** Checklist shown after a failed submission. */
  pitfalls: string[];
};

export const PSET_HINTS: Record<string, PSetHint> = {
  "synthesis-foundations:truth-table-synthesizer": {
    hints: [
      "Read the spec as a filter, not a table. The graded surface is all 256 (a,b) rows — exactly one row (a = 4'b0011, b = 4'b0001) outputs 4'b0001, and every other row outputs 4'b0000. So the whole design is one equality test driving one ternary — not 256 lines of anything.",
      "Shape: assign y = (a == 4'b0011 && b == 4'b0001) ? 4'b0001 : 4'b0000;. The bench sweeps a and b as 4-bit vectors (16 × 16 = 256 rows), so compare against 4-bit literals.",
      "If rows far from (3,1) fail, the else-branch is wrong: make sure y is 4'b0000 everywhere else and never left unassigned. Verilator width warnings (WIDTHEXPAND / WIDTHTRUNC) mean a literal's width disagrees with its target — read them, they point at the exact line.",
    ],
    pitfalls: [
      "Compare the full 4-bit inputs: a == 4'b0011, not just the low bits.",
      "The matching row outputs 4'b0001 (four bits) — not 1'b1.",
      "Every non-matching row must emit 4'b0000; an unassigned path shows up as x and fails the 4-state compare.",
    ],
  },

  "logic-gates:gate-netlist-designer": {
    hints: [
      "NAND is functionally complete: NOT x is NAND(x,x); AND(p,q) is NOT(NAND(p,q)); and by De Morgan OR(p,q) = NAND(NOT p, NOT q). For y = (a&b)|(c&d) the double negation collapses beautifully: y = NAND( NAND(a,b), NAND(c,d) ). Prove that to yourself on one row before coding.",
      "Structure: three nand primitives. w1 = nand(a,b) carries ~(a&b); w2 = nand(c,d) carries ~(c&d); then y = nand(w1, w2) = ~( ~(a&b) & ~(c&d) ) = (a&b)|(c&d). Two intermediate wires, one output, nothing else.",
      "Declare the intermediates: wire w1, w2; — Verilator lints implicit nets, and the habit of explicit nets is the point of this chapter. The bench checks all 16 rows, so any wrong intermediate shows up as a block of failing rows.",
    ],
    pitfalls: [
      "The final gate is a NAND of the two raw NAND outputs — not of a, b, c, d directly.",
      "No and/or/not primitives anywhere: the constraint is a NAND-ONLY network.",
      "Undeclared intermediate wires create implicit nets — Verilator warns and it is the flagged style trap.",
    ],
  },

  "combinational-expressions:expression-evaluator": {
    hints: [
      "Two outputs from the same inputs, both pure continuous assigns. Copy the spec's parentheses verbatim: y = (a & b) | ((c & d) ^ (a | d)); and z = (a & b) | (c & d); — the spec's parentheses are the ground truth; rewriting the expression from memory is how precedence bugs are born.",
      "These are bitwise operators on 4-bit vectors: every lane computes independently, lane by lane. Don't confuse bitwise ^ (two operands, 4-bit result) with the reduction operator ^x (one operand, 1-bit parity result) — they look almost identical in text.",
      "Self-check before submitting: with a=0011, b=1100, c=0101, d=1010, compute y and z by hand lane-by-lane, put those values in your own top_tb.sv, and Run. The hidden bench sweeps a,b with c,d pinned and vice versa — if only one family of sweeps fails, the bug lives in the asymmetric term ((c&d)^(a|d)).",
    ],
    pitfalls: [
      "Bitwise ^ takes two operands; ^a is reduction and yields 1 bit — an easy typo with a silent width warning.",
      "z contains no ^ at all — if z fails only where (c&d) changes, you probably pasted the y expression into z.",
      "Parenthesize exactly as the spec does: & binds tighter than ^, which binds tighter than | — but explicit parens make the code unmisreadable.",
    ],
  },

  "multiplexers:feature-selector": {
    hints: [
      "One 4:1 multiplexer. Two idiomatic shapes: always @(*) with case (sel) covering 2'b00/01/10/11 plus a default, or chained ternaries. The bench drives all four sel values across 16 data patterns — every path is exercised.",
      "If you use case: assign y in EVERY branch. A branch that forgets to assign infers a latch — the exact trap this chapter teaches — and Verilator will flag CASEINCOMPLETE / LATCH.",
      "sel is 2 bits, so the case items are 2'b00, 2'b01, 2'b10, 2'b11 — width-match the literals. The default branch is never exercised by the bench (it never drives x/z), but it must exist for lint and latch prevention.",
    ],
    pitfalls: [
      "Incomplete case → inferred latch; Verilator reports CASEINCOMPLETE.",
      "sel literals must be 2-bit (2'b10, not 1'b0 pairs or bare decimals).",
      "Route the sources straight through — no arithmetic on a, b, c, d.",
    ],
  },

  "adders:nibble-adder": {
    hints: [
      "The graded fact: {cout, sum} = a + b + cin over all 256 (a,b) rows × both cin values. You can prove it with one wide assign, but the chapter's craft is structural: four chained full_adder instances whose carry ripples left to right.",
      "Structural shape: full_adder fa0 (.a(a[0]), .b(b[0]), .cin(cin), .sum(sum[0]), .cout(c1)); then fa1, fa2, fa3 chain c1 → c2 → c3, and cout = c3. Use named port connections (.port(sig)) — positional order breaks silently when a port list changes.",
      "One-line version, if you go arithmetic: assign {cout, sum} = a + b + cin; — legal, because the concatenation lvalue widens the addition context to 5 bits. The classic bug is assign cout = a + b + cin (truncated to fit) — the concat form is the safe spelling.",
    ],
    pitfalls: [
      "Carry chain off-by-one: stage i's cin must be stage i−1's cout, and stage 0's cin is the pset's cin port.",
      "Truncation: a 4-bit add without widening drops the carry — cout reads 0 on rows like 15+15+1.",
      "Named instantiation (.a(a[i])) throughout — positional port order is the flagged style trap of this chapter.",
    ],
  },

  "arithmetic:signed-magnitude-compare": {
    hints: [
      "Three outputs, three assigns: alt = ($signed(a) < $signed(b)); agt = ($signed(a) > $signed(b)); aeq = (a == b); — the equality needs no cast, because bit-equality is identical signed or unsigned.",
      "Why the cast matters: 4'b1111 is 15 unsigned but −1 signed. Without $signed, alt and agt flip on every row where a or b is ≥ 8. The bench splits its sweep into a = 0..3 / 4..7 / 8..11 / 12..15 groups precisely to catch the cast-less version.",
      "Hand-check the boundaries: a=4'b1000 (−8) vs b=4'b0111 (+7) → alt=1, agt=0, aeq=0. a == b → aeq only. If your flags agree on rows 0..7 but invert on 8..15, the cast is missing or applied to only one side.",
    ],
    pitfalls: [
      "Comparing without $signed — the most common signed bug in the whole track.",
      "aeq = (a == b) — don't route equality through the signed comparisons.",
      "All three outputs on every path: plain assigns carry no latch risk, but a case-based rewrite needs a default.",
    ],
  },

  "encode-decode:interrupt-priority": {
    hints: [
      "Spec unpack: 'highest set bit' means the highest INDEX — req[7] outranks req[6]. valid is simply (req != 0), independent of idx. The bench sweeps all 256 req values checking both outputs together.",
      "Idiomatic shape: always @(*) with casez (req), items ordered from the top bit down: 8'b1??????? : idx = 3'd7; … 8'b0000000? : idx = 3'd0; default: idx = 3'd0. The FIRST matching item wins, so the item order IS the priority order.",
      "Debug with your own TB: req = 8'b0001_0000 must give idx=4, valid=1; req = 8'b1000_0000 gives idx=7 even when lower bits are set; req = 8'h00 gives valid=0. One ? per don't-care bit, and the higher-priority patterns must be listed first.",
    ],
    pitfalls: [
      "Priority direction: index 7 is the TOP priority here — an ascending-priority casez fails most rows.",
      "valid must be 0 exactly when req == 8'h00 — don't derive it from the idx value.",
      "Missing default in the casez infers a latch — Verilator reports CASEINCOMPLETE.",
    ],
  },

  "sequential-fundamentals:synchronizer": {
    hints: [
      "Exactly two flip-flops in series, both clocked on posedge clk: stage1 <= d, then your q <= stage1. A level on d appears at q exactly TWO rising edges later — that two-cycle delay is the graded behavior.",
      "Reset is asynchronous and active-LOW: always @(posedge clk or negedge rst_n) if (!rst_n) begin stage1 <= 0; q <= 0; end else … . The bench pulls rst_n low between clock edges — a synchronous-only reset fails the 'async reset wins between clock edges' test.",
      "Use nonblocking (<=) in both stages. With blocking (=), the chain collapses: q tracks d after ONE edge instead of two, and the 'single-cycle pulse never appears early' test catches it.",
    ],
    pitfalls: [
      "Active-LOW: rst_n = 0 means reset asserted — copying an active-high reset shape breaks the reset test.",
      "Blocking = instead of <= merges the two stages into one pass-through — the pulse test catches it.",
      "One flop is half the design: the two-edge delay is the entire point of a synchronizer.",
      "Reset must clear BOTH stages so q reads 0 in reset even while d toggles.",
    ],
  },

  "counters:clock-divider": {
    hints: [
      "One 3-bit counter, one derived output. On posedge clk: if (!rst_n) phase <= 0; else if (en) phase <= phase + 1 — and a 3-bit vector wraps to 0 by itself (3'd7 + 1 = 3'd0), no modulo needed. Then one continuous assign: clk_out = phase[2].",
      "Why phase[2] is the right tap: across an 8-count cycle, bit 2 is low for counts 0–3 and high for counts 4–7 — exactly the 4-low / 4-high 50% duty the bench checks on clocks 25–32.",
      "en = 0 must FREEZE, not clear: when en drops, phase holds its value and clk_out holds phase[2]. The bench's freeze test checks that BOTH outputs hold still.",
    ],
    pitfalls: [
      "Counting through the en=0 gap — the else branch must hold the value, not reset it.",
      "Deriving clk_out from a separate toggle flop lets it drift from phase; derive it as phase[2] and duty is automatic.",
      "In reset, clk_out must read 0 — with clk_out = phase[2] and phase cleared to 0, that is automatic.",
      "A 4-bit counter with a manual %8 wrap works, but a 3-bit natural wrap is the cleaner shape.",
    ],
  },

  "shift-registers:barrel-shifter": {
    hints: [
      "Rotate left is one line: y = (d << amt) | (d >> (8 - amt));. The << term moves bits up; the >> term catches what fell off the top and brings it in at the bottom — that OR is the wrap.",
      "Widths: d and y are 8-bit, amt is 3-bit (0..7). The bench runs all 2048 (d, amt) combinations including amt = 0 — where the formula still lands correct: 8−0 wraps to 0 in 3-bit arithmetic and d >> 0 contributes d, so y = d. Computing 8−amt in a wider context gives d >> 8 = 0 — also fine.",
      "Self-check: rotating 8'b1000_0001 left by 1 must give 8'b0000_0011. If your output looks like a plain shift (a bit disappears off the end), the (d >> (8 - amt)) half is missing or inverted.",
    ],
    pitfalls: [
      "Missing the (d >> (8 - amt)) term — that is a shift, not a rotate, and the bench fails from combo 1 onward.",
      "Rotate right by accident (shift directions swapped) — every value with high bits set fails.",
      "amt is 3-bit: a mismatched amt width or over-wide literals trigger Verilator width warnings.",
    ],
  },

  "finite-state-machines:traffic-light-controller": {
    hints: [
      "Full spec, unpacked — the graded timing table: MAIN GREEN 3 cycles → MAIN YELLOW 1 → SIDE GREEN 3 → SIDE YELLOW 1 → repeat. Light codes: 2'b10 = green, 2'b01 = yellow, 2'b00 = red. A ped request is LATCHED when ped = 1 during ANY cycle of main green or main yellow; it turns the NEXT side green into 5 cycles instead of 3, then clears. ped during side green / side yellow is IGNORED. rst is active-HIGH.",
      "State list: four states (M_GREEN, M_YELLOW, S_GREEN, S_YELLOW) plus a cycle counter and a ped_latched flop. Count cycles inside each green state; when the count expires (3 normally, 5 in side green with a latched request), advance and clear the latch. Alternative shape: expand to explicit per-cycle states (M1, M2, M3, MY, S1..S5, SY) — more states, no counter, same graded result.",
      "The three subtle bench checks: (a) the latch fires during main YELLOW too, not just green; (b) clear ped_latched when the EXTENDED side green ENDS — clearing it at the start re-extends forever and 'cycle returns to main green' fails; (c) after reset, main green starts immediately and NO request is pending.",
    ],
    pitfalls: [
      "Phase lengths are 3/1/3/1 (3/1/5/1 when a request was latched) — nothing else; guessing 2 or 4 fails the hold tests.",
      "Clearing the request at side-green START re-extends every pass — clear it at side-green END.",
      "Honoring ped during side phases — the bench asserts it there and expects it ignored.",
      "rst is active-HIGH in this chapter (chapter 8's synchronizer was active-LOW) — don't copy the old reset shape.",
    ],
  },

  "datapath:register-file": {
    hints: [
      "Storage: logic [7:0] regs [0:3]. One clocked block for writes: on posedge clk, if (we) regs[waddr] <= wdata. Reset is asynchronous and active-high in this chapter (posedge clk or posedge rst) and must clear all four registers.",
      "Reads are combinational: rdata_a = regs[raddr_a], rdata_b = regs[raddr_b]. But a plain array read returns the OLD value during the very cycle a write lands — and the bench checks write-first behavior on BOTH ports.",
      "Write-first bypass: rdata_a = (we && raddr_a == waddr) ? wdata : regs[raddr_a]; — and the identical mux for port B. That single ternary per port is what makes read-during-write return the NEW data.",
    ],
    pitfalls: [
      "Blocking (=) in the clocked block breaks the write timing — always nonblocking (<=) for the array write.",
      "A synchronous reset fails the 'reset clears all four registers' test — this bench resets asynchronously.",
      "The we gate: with we = 0 nothing may write; 'we low leaves register unchanged' checks exactly that.",
      "Bypass on port A but not port B — the bench checks read-during-write on both ports.",
    ],
  },

  "memory:rom-boot-image": {
    hints: [
      "Storage: logic [7:0] rom [0:15] (deeper is fine), initialized once at boot: rom[0]=8'h00; rom[5]=8'h05; rom[8]=8'h15; rom[13]=8'hE9; rom[15]=8'h62; — via an initial block or a $readmemh boot image. Ungraded addresses can hold 0.",
      "The read port is REGISTERED: always @(posedge clk) begin dout <= rom[addr]; … end. valid marks 'a read has completed since reset': a 1-bit flop cleared by rst, set on the first clocked read, and never cleared again until the next reset.",
      "Timing the bench checks: after reset, valid is LOW; on the first clocked read, valid rises WITH the data (the same edge sets both); then valid stays high across every later read. If your valid is combinational — tied to an addr range or to dout != 0 — the 'valid low after reset' or 'stays high' tests fail.",
    ],
    pitfalls: [
      "Combinational dout — the bench wants a registered read port: dout changes one edge after the address.",
      "valid derived from 'dout is nonzero' — address 0 legitimately reads 8'h00 and must still assert valid.",
      "valid dropping between reads — once set, only reset may clear it.",
      "Forgetting rst in the read block — 'valid low after reset' fails immediately.",
    ],
  },

  "interfaces:uart-loopback": {
    hints: [
      "Protocol, unpacked: one UART with TX and RX both inside top, tx wired to your own RX input. baud_en is a 1-cycle pulse = one baud tick. A frame is 1 start bit (0) + 8 data bits (LSB first) + 1 stop bit (1) = 10 baud ticks. On tx_en while !busy, TX latches d_in on the next clock edge, raises busy, and puts the start bit on the wire.",
      "RX side: detect the falling edge (idle 1 → start 0), then count baud ticks — tick 0 is the start bit, ticks 1–8 are data (LSB first), tick 9 is the stop bit. On a clean stop (1): d_out updates, rdy rises, ferr stays 0. If the stop bit reads 0, raise ferr instead of delivering a byte.",
      "The graded control facts: busy spans start→stop — the bench tries tx_en with 8'hC3 while 8'h3C is mid-frame, that attempt must be IGNORED and 8'h3C must complete intact; back-to-back frames must be accepted as soon as busy drops; ferr must read LOW after every clean loopback (0x55, 0xAA, 0x00, 0xFF, 0x3C).",
    ],
    pitfalls: [
      "MSB-first data — UART (and this bench) sends LSB first.",
      "busy dropping mid-frame — it must stay high until the stop bit has been on the wire.",
      "Sampling bits on every clock edge instead of on baud_en ticks — baud_en is what times the frame.",
      "ferr asserted on clean frames (e.g. counting the stop tick as a data bit) — the bench checks ferr LOW at the end.",
    ],
  },

  "risc-v-blocks:core-datapath": {
    hints: [
      "The graded program, word by word: rom[0]=ADDI x1,x0,10; rom[1]=ADDI x2,x0,4; rom[2]=SUB x3,x1,x2; rom[3]=BEQ that skips ONE word; rom[4]=a poisoned ADDI the branch must skip (it would zero x3); rom[5]=ADDI x3,x3,2; rom[6]=HALT — 32'hFFFF_FFFF, the lesson's halt marker, matched as a whole word (no real RV32I opcode). Graded pins: pc, dbg (the debug register — x3), done.",
      "Architecture: PC register + pc+4 adder, instruction ROM, decoder emitting write-enable / dest-select / ALU-op, register file, ALU, and the PC mux: pc+4 vs branch target (pc + 4 + imm) vs HOLD once done is high. The halt condition gates the PC mux — that is how 'done stays high' pins pc at 0x18.",
      "The bench steps one clock edge at a time and compares pins after each — so trace it by hand first: reset (pc 0, dbg 0, done 0) → pc=4 (x1=10, dbg still 0) → pc=8 (x2=4) → pc=0xC (x3=6, dbg=6) → taken BEQ lands pc=0x14 (dbg still 6 — the poisoned word never ran) → pc=0x18 (dbg=8) → HALT: done=1, pc HOLDS 0x18, dbg stays 8. Wrong early pc row → bug is in fetch or decode; only the branch row wrong → the branch mux or taken condition.",
    ],
    pitfalls: [
      "PC advancing past HALT — done must gate the PC update; 'done stays high after halt' checks pc holds at 0x18.",
      "Branch target is pc + 4 + immediate (not pc + imm).",
      "The poisoned word at rom[4] must never execute — if dbg drops to 0 after the branch, your BEQ isn't skipping.",
      "dbg must reflect the debug register (x3), not the PC or the ALU output directly.",
    ],
  },
};

/** Look up the hint data for a pset key ("chapterSlug:psetSlug"). */
export function getPSetHint(chapterSlug: string, psetSlug: string): PSetHint | undefined {
  return PSET_HINTS[`${chapterSlug}:${psetSlug}`];
}
