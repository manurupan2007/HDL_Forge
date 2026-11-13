import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 12,
  chapterSlug: "datapath",
  title: "Datapath: ALUs & Registers",
  readMinutes: 24,
  youWillBeAbleTo: [
    "Compose an adder, a subtractor, and bitwise logic into one 8-bit ALU using a multiplexer",
    "Read and write an ALU operation table that maps a 3-bit opcode to a result",
    "Decode an opcode with a case statement whose default covers every remaining value",
    "Produce a zero flag and a carry flag, and explain why a truncated result cannot tell you about overflow",
    "Tell unsigned comparison and signed comparison apart, and pick the one your ALU means",
    "Build an accumulator where a register's input comes from combinational logic and updates once per clock",
    "Build a 2R1W register file with a write enable and a read-during-write behaviour you chose on purpose",
  ],
  mentalModel: [
    {
      title: "The ALU is not new magic. It is a mux on top of chapters 2 to 6",
      body: "Read the ALU you are about to build and every line of it is something you have already written. The AND in it is the bitwise AND from Combinational Expressions. The add is an 8-bit ripple adder from Adder Circuits. The subtract is the same adder fed the bit-flipped value of one operand, which is the two's-complement trick from Number Systems & Arithmetic. The bitwise OR and XOR are the same gates you built as truth tables in chapter 1. And the thing that picks which of those results you get is a multiplexer, which is chapter 4. Put a mux on top of the function units and the switch that says which function unit you want is an ALU. There is no new gate in this chapter. This is the chapter where the track pays out.",
    },
    {
      title: "A datapath is two kinds of hardware, and a clock between them",
      body: "Every piece of a datapath is one of exactly two kinds. *Combinational* hardware is a rule: given these inputs, this output, right now, with no memory involved. An adder, a mux, a comparator — all combinational. *Sequential* hardware remembers: it holds a value and only changes it when a clock edge arrives. A register, a counter, a memory — all sequential. A datapath is nothing more than combinational blocks sitting between registers, with the clock deciding when a value moves from one register into another. The ALU is a combinational block. The accumulator register and the register file are sequential blocks. Draw the picture as arrows: value comes out of a register, passes through the combinational logic, goes back into a register, and the clock edge is the only thing that makes it stick. Chapter 11 gave you the state machine that decides *which* step happens; this chapter gives you the hardware it steps.",
    },
    {
      title: "Only the clock is allowed to change what is remembered",
      body: "This is the rule that keeps a datapath debuggable. Inside combinational logic, every change you make to an output happens immediately, forever, as inputs move. Inside sequential logic, a value changes only on a clock edge, and nothing else in the design can touch it. That is why the ALU has no clock input at all — it answers instantly and forgets — while the register file has a clock and nothing else. When a design misbehaves, this rule tells you where to look: a value that is one step behind where you expect it is a sequential problem, and a value that is unstable or stuck is a combinational problem. Every trap in this chapter is a violation of this one rule.",
    },
  ],
  topics: [
    {
      slug: "why-an-alu",
      title: "An ALU is a mux on top of everything you already built",
      lede: "Nothing in this chapter is a new idea — it is adders, subtractors, AND, OR, XOR and a selector, wired together.",
      blocks: [
        {
          kind: "analogy",
          text: "A pocket calculator is an ALU with a display glued to it. The silicon inside is a pile of adders and gates, and the one thing that makes it a calculator rather than a random collection of arithmetic is a small switch that says which arithmetic to do this time. Press + and the sum comes out; press & and the bitwise AND comes out. The ALU is that switch plus the arithmetic. The switch is a multiplexer. The arithmetic is the stuff you have been building for ten chapters.",
        },
        {
          kind: "para",
          text: "Say the five words an ALU is made of, and where each one came from. A *function unit* is a block that does one operation — the adder is a function unit, the AND gate is a function unit, the comparator is a function unit. All of them run at once, all of the time, each one chewing on the same two input numbers. A *mux* picks one of their results and puts it on the shared output. An *opcode* is the small number that says which result to pick. That is the whole machine. Eight of these units wired to eight bits wide is a real ALU, and the six you are about to build is a perfectly respectable small one.",
        },
        {
          kind: "code",
          caption:
            "The tiniest complete ALU: an adder that can also subtract, chosen by one bit. Read it as a whole first.",
          code: `module top (
  input  wire       [7:0] a,
  input  wire       [7:0] b,
  input  wire       sub,
  output wire [8:0] sum9,
  output wire       carry
);
  // sub = 0 does a + b. sub = 1 does a - b, using two's complement.
  assign sum9 = sub ? ({1'b0, a} + {1'b0, ~b} + 9'd1)
                    : ({1'b0, a} + {1'b0, b});
  assign carry = sum9[8];
endmodule`,
          note: "One control bit, so the mux has two inputs and picks one — that is the entire idea. `{1'b0, a}` widens the 8-bit `a` to 9 bits by putting a zero in front, because a 9-bit result needs somewhere to put the carry. Both branches of the `? :` are 9 bits, so the output is 9 bits too. By the end of this chapter the same shape will have eight branches instead of two.",
        },
        {
          kind: "steps",
          title: "Take the tiny ALU apart line by line",
          items: [
            {
              head: "`output wire [8:0] sum9,`",
              body: "The result is 9 bits wide, not 8. The ninth bit exists only to carry out of the addition, so that the caller can find out whether the 8-bit answer was too small. If you made this 8 bits, `0xFF + 1` would silently become `0x00` and the overflow would be invisible.",
            },
            {
              head: "`{1'b0, a}`",
              body: "A concatenation: a zero bit joined to the 8 bits of `a`, giving 9 bits whose value equals `a`. It is how you widen a number in Verilog without changing it.",
            },
            {
              head: "`~b` inside the add",
              body: "Flipping every bit of `b` is how you negate it in two's complement. Flipping is free in hardware — it is one inverter per bit — which is why subtraction is not a separate expensive circuit. It is the same adder with different inputs.",
            },
            {
              head: "`+ 9'd1`",
              body: "The `+ 1` is what completes the negation. Flip the bits and add one. This was the whole content of two's-complement arithmetic in chapter 6, and here it is earning its keep inside a real module.",
            },
            {
              head: "`assign carry = sum9[8];`",
              body: "Bit 8 of a 9-bit result is exactly the carry out of the top bit. Reading one bit of a value and calling it a flag is the pattern you will use for `zero` and `carry` in the full ALU.",
            },
            {
              head: "Everything is an `assign`",
              body: "No `always` block, no clock, no `always @(*)`. This module is pure combinational logic: give it new inputs and the outputs are correct immediately, with no delay to wait for. That is what makes it a function unit rather than a register.",
            },
          ],
        },
        {
          kind: "define",
          items: [
            { term: "ALU", meaning: "Arithmetic Logic Unit. The block that does one of several operations on two numbers, chosen by an opcode." },
            { term: "function unit", meaning: "One small block that performs a single operation, such as an adder or an AND gate. An ALU is several of them." },
            { term: "operand", meaning: "One of the numbers an operation is applied to. The two inputs of an ALU are its two operands." },
            { term: "opcode", meaning: "The small number that says which operation the ALU should perform." },
            { term: "datapath", meaning: "The collection of registers and combinational blocks that move data around and compute on it, under the control of a clock." },
          ],
        },
        {
          kind: "points",
          title: "The five things every ALU in this track has",
          items: [
            "Two operand inputs, say `a` and `b`, both the same width.",
            "One opcode input, narrow — 3 bits here, which is 8 possible values.",
            "Several function units, all fed the same operands, all running at once.",
            "One mux that picks one unit's output onto the result.",
            "One or more flags, which are single bits that say things *about* the result, such as \"the result is zero\".",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Your ALU has 6 operations and a 3-bit opcode. How many opcode values are there, and what happens to the 2 that you do not use?",
              a: "3 bits give 2³ = 8 values: 000 through 111. You use 6 of them, so 110 and 111 are left over. The rule is that they must still produce a defined, stable result — in this chapter the `default` row makes them give zero. An opcode that matches no row and has no `default` leaves the output holding its previous value, which the tool reports as a LATCH.",
            },
            {
              q: "Name the chapter that gave you each of these four things: the adder, the subtractor, the multiplexer, the bitwise gates.",
              a: "Adder Circuits (chapter 5) gave the adder. The subtractor is that same adder fed `~b + 1`, from Number Systems & Arithmetic (chapter 6). Multiplexers & Selectors (chapter 4) gave the selector. The bitwise gates came from Logic Gates (chapter 2) and Combinational Expressions (chapter 3). Nothing in chapter 12 is new.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-operation-table",
      title: "Opcodes, and the operation table as a case statement",
      lede: "An opcode is an index into a list. Write the list down as a table, then translate the table into a `case` — one row per line, plus one row that catches everything else.",
      blocks: [
        {
          kind: "para",
          text: "The ALU does not take the words \"add\" or \"subtract\". Software cannot hand a string to a wire. It takes a small number, and the hardware agrees in advance what each number means. That agreement is called an encoding, and the table that records it is the *operation table*. Once the table is written down and agreed the mapping is arbitrary: 000 could mean add and 001 could mean subtract, and the hardware would be perfectly happy. In this small table the opcodes happen to run 0, 1, 2, 3, 4, 5; in a real CPU the opcode space is carved up for reasons that have nothing to do with arithmetic, since some ranges load from memory and some are reserved. That pattern is a decoder, and a decoder is chapter 7. For this chapter consecutive is fine and much easier to read. You could pick a result with a chain of `if` and `else if` tests, but a `case` says the same thing in one construct that *looks* like the table — one line per row, aligned, easy to read, and easy to check against the paper version. That is the whole reason to use it.",
        },
        {
          kind: "analogy",
          text: "It is the same as the letters on a telephone keypad. Nobody was forced to put ABC on 2 — you could put XYZ there instead. The digits would still work. What matters is that everyone agrees, and that the agreement is written down somewhere. A CPU's opcode table is that agreement, and the ISA manual is the document that publishes it.",
        },
        {
          kind: "table",
          head: ["Opcode", "Name", "What the ALU computes", "Verilog expression"],
          rows: [
            ["3'b000", "add", "a plus b", "`a + b`"],
            ["3'b001", "sub", "a minus b", "`a - b`, which is `a + (~b + 1)`"],
            ["3'b010", "and", "bit-by-bit AND", "`a & b`"],
            ["3'b011", "or", "bit-by-bit OR", "`a | b`"],
            ["3'b100", "xor", "bit-by-bit XOR", "`a ^ b`"],
            ["3'b101", "slt", "1 if a is less than b, else 0", "`(a < b) ? 8'h01 : 8'h00`"],
            ["3'b110", "—", "not used, so it gives zero", "`8'h00` from the `default` row"],
            ["3'b111", "—", "not used, so it gives zero", "`8'h00` from the `default` row"],
          ],
          caption:
            "This table is the specification. Your code is correct when, and only when, it agrees with this table on every row — the same rule you used for the truth tables in chapter 1. The middle column (`slt` = set less than) is the only name you need to learn by heart; the rest are the operations you already know. Look down the last column: five results are naturally 8 bits wide, but `slt` is only one bit of information, so it is padded out to 8. Every branch of the mux must be the same width, or the tool has to guess how to widen and warns you about a WIDTHEXPAND mismatch.",
        },
        {
          kind: "code",
          caption:
            "The complete 8-bit ALU. Every operation table row, plus a `default`, plus the two flags.",
          code: `module top (
  input  wire       [7:0] a,
  input  wire       [7:0] b,
  input  wire       [2:0] op,
  output wire       [7:0] y,
  output wire             zero,
  output wire             carry
);
  // The 9-bit temporary that catches the carry out of the arithmetic.
  reg  [8:0] sum9;

  // The result, and the carry, as named registers the case block can write.
  reg  [7:0] result;
  reg        carry_r;

  always @(*) begin
    // Sensible defaults first, so every path below has a value to change.
    sum9    = 9'd0;
    result  = 8'h00;
    carry_r = 1'b0;

    case (op)
      3'b000: begin                 // add
        sum9    = {1'b0, a} + {1'b0, b};
        result  = sum9[7:0];
        carry_r = sum9[8];
      end

      3'b001: begin                 // sub, as two's-complement addition
        sum9    = {1'b0, a} + {1'b0, ~b} + 9'd1;
        result  = sum9[7:0];
        carry_r = sum9[8];
      end

      3'b010: result = a & b;       // and
      3'b011: result = a | b;       // or
      3'b100: result = a ^ b;       // xor

      3'b101: result = (a < b) ? 8'h01 : 8'h00;   // slt, unsigned

      default: result = 8'h00;      // every opcode we do not implement
    endcase
  end

  assign y     = result;
  assign zero  = (result == 8'h00);
  assign carry = carry_r;
endmodule`,
          note: "Two things to notice before anything else. First, the bitwise rows are one line each, because `a & b` needs no carry and no 9-bit temporary. Second, the `default` row exists even though the operation table already named the two unused opcodes — belt and braces, and it is the row that makes the LATCH warning go away.",
        },
        {
          kind: "steps",
          title: "Read the module line by line",
          items: [
            {
              head: "`always @(*)`",
              body: "The `(*)` is shorthand for \"every signal read inside this block\". It means: whenever `op`, `a`, or `b` changes, run this block again. It is the combinational form. Compare it with `always @(posedge clk)` from chapter 8, which means: run this block only when the clock's low-to-high transition arrives. The two never belong in the same block.",
            },
            {
              head: "The three default assignments",
              body: "`sum9`, `result` and `carry_r` are all given a value before the `case` starts. This is the single most useful habit in this chapter. Whatever the opcode turns out to be, these three lines have already written a legal value, so the `case` only ever has to *improve* on it. You will not get a stale value carried over from a previous evaluation, and you will not get a latch.",
            },
            {
              head: "`3'b000: begin ... end`",
              body: "A row that needs several statements gets a `begin` / `end` pair so it reads as one block. A row that needs exactly one statement — like the AND — does not need them, and leaving them off keeps the table looking like the table you drew on paper.",
            },
            {
              head: "`result = sum9[7:0];`",
              body: "The result port is 8 bits, but the arithmetic produced 9. Taking bits 7 down to 0 is how you say \"the answer, ignoring the carry\". The carry is not thrown away — it is on its own output, in the next line. That separation is the entire reason the adder needs the extra bit.",
            },
            {
              head: "`3'b001: begin // sub`",
              body: "The subtract row. It adds `a` to the bit-flipped `b` plus one, which is the definition of two's-complement negation. There is no subtractor in the module. The row that subtracts is the adder row with different inputs, and it is one extra line rather than a whole new circuit.",
            },
            {
              head: "`default: result = 8'h00;`",
              body: "The catch-all. It handles 3'b110 and 3'b111, and it also handles anything that is not a legal 0 or 1 — an `x` or a `z` on the opcode input, for instance. Without it, an unmatched opcode leaves `result` at whatever the default assignment put there, which in this code is still zero, so this module is doubly safe. Remove the defaults *and* the `default` row in an experiment and watch the LATCH warning appear.",
            },
            {
              head: "The three `assign` lines at the bottom",
              body: "The `always` block writes to the internal registers `result` and `carry_r`. The module's actual output pins are wires, and wires get driven by `assign`. `zero` needs no register at all: it is a comparison of the finished result against zero, and it is a one-line rule with nothing to decide.",
            },
          ],
        },
        {
          kind: "table",
          head: ["What you write", "Which of the six operations it runs", "Result for a = 8'hF0, b = 8'h3C"],
          rows: [
            ["`3'b000`", "add", "0xF0 + 0x3C = 0x12C, truncated to 8 bits = 0x2C, carry out = 1"],
            ["`3'b001`", "sub", "0xF0 − 0x3C = 0xB4, carry out = 1 (no borrow)"],
            ["`3'b010`", "and", "1111_0000 AND 0011_1100 = 0011_0000 = 0x30"],
            ["`3'b011`", "or", "1111_0000 OR 0011_1100 = 1111_1100 = 0xFC"],
            ["`3'b100`", "xor", "1111_0000 XOR 0011_1100 = 1100_1100 = 0xCC"],
            ["`3'b101`", "slt", "0xF0 (240) is not less than 0x3C (60), so 0x00"],
          ],
          caption:
            "The right-hand column is worked out by hand, not by the tool. Doing two of these before you compile is the fastest way to find a mistyped opcode.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Count the opcode values: 3 bits is 2³ = 8. Write them out as 000, 001, 010, 011, 100, 101, 110, 111 and confirm there are eight.",
            "Assign the six operations to the first six values in the order add, sub, and, or, xor, slt. That assignment *is* your design; you are free to change it as long as the table and the code change together. The leftover values 110 and 111 have no operation, so decide what they must produce — zero is the usual choice, because it is stable, obvious in a waveform, and makes a bug visible instead of silent.",
            "Take a = 8'h12 and b = 8'h2E. Add them in hex one digit at a time: 2 + E = 0x10, so that digit is 0 and carry 1; 1 + 3 + 1 = 5. The answer is 0x40. Write `12` + `2E` = `40` in your notes, then confirm the carry flag is 0, because 0x40 fits in 8 bits.",
            "Now add 8'hFF and 8'h01. The answer in 9 bits is 0x100, so the low 8 bits are 0x00 and the ninth bit is 1. Write down that `y` = 0x00 and `carry` = 1, and that `zero` = 1 because the 8-bit result really is zero. This one case teaches the difference between the result and the carry.",
            "Subtract 8'h50 − 8'h20 in two's complement: flip b to 0xDF, add 1 to get 0xE0, then 0x50 + 0xE0 = 0x130, so the low 8 bits are 0x30 and the ninth bit is 1. Record that `y` = 0x30 and `carry` = 1.",
            "Subtract 8'h20 − 8'h50: flip b to 0xAF, add 1 to get 0xB0, then 0x20 + 0xB0 = 0xD0, which fits in 8 bits with no ninth bit. Record that `y` = 0xD0 and `carry` = 0. This is the case that catches people who assume `carry` is always 1 after a subtract.",
            "Compute the AND of 8'hF0 and 8'h3C bit by bit, then check the worked-values table above says 0x30. Three rows that agree means the encoding is right.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing only five `case` rows and no `default`, trusting that no one will ever send an unhandled opcode.",
          right: "Always end a `case` over a small enumerated value with `default:`.",
          why: "An unmatched `case` leaves the target register holding whatever it had. Verilator reports this as a LATCH warning, and the symptom in simulation is a result that is correct one cycle and stale the next — which is far harder to debug than the warning. The `default` also gives you a defined answer for `x` on the opcode input, which is what you want during bring-up.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why is the temporary declared 9 bits when both operands are 8 bits?",
              a: "Because the result of adding two 8-bit numbers can need 9 bits. 0xFF + 0x01 = 0x100, and 0x100 does not fit in 8 bits. If the adder were 8 bits wide the ninth bit would be discarded and the carry flag could never be computed from anything. Widening the operands with `{1'b0, a}` and `{1'b0, b}` makes the wide adder legal, and then bit 8 of the result *is* the carry.",
            },
            {
              q: "You delete the `default` row and the three default assignments, leaving only the six `case` rows. What breaks?",
              a: "Opcodes 3'b110 and 3'b111 match no row. `result` is a register, so it keeps its previous value forever — Verilator warns LATCH, and in simulation the output is stale for those two opcodes. Worse, it is stale in a way that depends on history, so the same inputs give different outputs depending on what you did before. Restoring either the `default` row or the top-of-block defaults fixes it, and having both is best.",
            },
            {
              q: "Someone hands you an opcode table where 3'b000 means XOR. Is that wrong?",
              a: "No. The tool cannot tell you what an opcode is *supposed* to mean — that is a design decision, not a fact. What matters is that the table, the code, and whatever testbench you write all agree. This is why you write the table on paper before you write the `case`: the table is the thing you can be wrong about, and once the code matches the table, the code is right.",
            },
          ],
        },
      ],
    },
    {
      slug: "flags",
      title: "Flags: turning a result into a question someone else can ask",
      lede: "A flag is one extra bit that reports a fact about the result, so the next piece of logic can branch on it without recomputing anything.",
      blocks: [
        {
          kind: "para",
          text: "The result tells you what came out. A *flag* tells you something about it. \"The result is zero\" is a fact you could recompute yourself, but you do not have to, because the ALU hands it to you as a single bit. That matters because the next thing in a datapath is usually a decision: a branch if zero, a carry into the next adder, do not store a value that did not change. Computing the fact once inside the ALU and passing it along is cheaper than making everyone recompute it, and it is why flags are on the pin list of every ALU in every processor ever built.",
        },
        {
          kind: "table",
          head: ["Flag", "Width", "How it is computed", "True when"],
          rows: [
            ["`zero`", "1", "`(result == 8'h00)`", "every one of the 8 result bits is 0"],
            ["`carry`", "1", "bit 8 of the 9-bit sum", "adding produced a value too big for 8 bits"],
            ["`overflow`", "1", "see the note below", "the true answer does not fit in the signed range −128 to 127"],
          ],
          caption:
            "`zero` is a comparison, so it needs no register — it is one `assign` line. `carry` is a bit sliced out of the wide sum, so it has to be computed inside the `case` where the sum lives. Note that `carry` and `overflow` are genuinely different questions, and the third row is the one people forget.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Carry is not overflow",
          text: "Take 8'h7F + 8'h01. The unsigned sum is 128, which needs 9 bits, so `carry` comes out 1. The signed sum is 127 + 1 = 128, and the signed 8-bit range stops at 127, so `overflow` also comes out 1 — here the two agree. Now take 8'hFF + 8'h01. The unsigned sum is 256, so `carry` is 1. But read as signed numbers those are −1 and +1, which sum to 0, which fits perfectly — so `overflow` is 0. That is why the flags have to be answered separately: a carry means the unsigned result wrapped, an overflow means the signed result wrapped.",
        },
        {
          kind: "para",
          text: "This chapter's port list asks for `zero` and `carry`, so overflow is a bonus rather than a requirement. If you want it anyway, the rule for 8-bit signed addition is: overflow when `a` and `b` have the same top bit and the result's top bit differs from theirs. Written as Verilog, `(~(a[7] ^ b[7])) & (a[7] ^ result[7])`. For subtraction, `a` and `b` must have *opposite* top bits, then the same second test. That is the whole rule, and it is a good exercise to write out by hand for the four sign combinations.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "List every input pair that makes `zero` true for `op = 3'b010` (AND). The answer is any pair where every bit of a is 0 wherever b is 1. Give one example: a = 0x0F, b = 0xF0 gives 0x00, so `zero` is 1.",
            "Confirm `zero` is also true for the unused opcodes 3'b110 and 3'b111, because the `default` row produces 0x00. An unused opcode that quietly returned the old result would not have done that.",
            "For 8'h80 − 8'h01, compute the result: 128 − 1 = 127 = 0x7F. Work out `carry`: flip b to 0xFE, add 1 for 0xFF, then 0x80 + 0xFF = 0x17F, so bit 8 is 1 and `carry` is 1. Record that.",
            "Now ask the signed question for the same pair: 0x80 is −128, 0x01 is 1, and −128 − 1 = −129, which is below the signed minimum of −128, so `overflow` would be 1. Carry and overflow disagree here too.",
            "Write one sentence in your own words explaining why you cannot work out `carry` from the finished 8-bit `result`. The answer: the bit that tells you about the carry was thrown away when you truncated, and 0x00 is equally the answer to \"0x00 + 0x00\" and to \"0xFF + 0x01\".",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign carry = (y < a);` — guessing the carry by comparing the truncated result with an operand.",
          right: "Take bit 8 of the 9-bit sum, computed inside the `case` where the sum still exists.",
          why: "The carry is not a property of the 8-bit answer at all. `0xFF + 0x01` and `0x00 + 0x00` both produce `0x00`, and only one of them carried. By the time the sum has been truncated to 8 bits the evidence is gone, so any formula that only looks at `y` and the operands is guessing. Widen the adder, keep the ninth bit, and read it.",
        },
        {
          kind: "trap",
          wrong: "Adding a seventh flag by editing the port list and then not connecting it anywhere.",
          right: "Add the port, drive it with an `assign`, and expect an UNUSEDSIGNAL note if the testbench leaves it open.",
          why: "An output you declare and never drive is a real bug that the tool reports as UNDRIVEN, and its value will be x in simulation. A flag you declare and drive but do not read is only an UNUSEDSIGNAL note — harmless, but it tells you the flag is dead weight. Read the difference: one of those two messages is a fault, the other is a note.",
        },
      ],
    },
    {
      slug: "comparison-and-signedness",
      title: "The one operation that is not bit-by-bit: comparison",
      lede: "Add, AND, OR and XOR all work one bit at a time. `<` cannot, and that is why it is the row people get wrong.",
      blocks: [
        {
          kind: "para",
          text: "Look again at the five operations in the table. `a + b` works column by column from the least significant bit, carrying upward. `a & b`, `a | b` and `a ^ b` work one bit at a time with no carry at all. `a < b` cannot be done that way, because \"is this number smaller\" is a fact about the whole value, not about any individual bit. The hardware for it is a chain of comparisons that collapse down to one bit. So the ALU's answer is not eight bits of a comparison — it is a single yes or no, padded out to eight bits so every row of the table matches.",
        },
        {
          kind: "para",
          text: "That single bit is called a *flag* here, and the operation is `slt`: set less than. Set the result to 1 when `a` is smaller than `b`, and 0 otherwise. Two details cause nearly all the errors. First, `<` is not `>` — a testbench that checks \"0x03 is less than 0x80\" will fail against a `>` implementation even though the module is otherwise perfect, and the fix is a single character. Second, Verilog decides whether a comparison is signed by looking at the operands, and a plain 8-bit `reg` is unsigned. That is a decision with real consequences, and it is the subject of the next block.",
        },
        {
          kind: "table",
          head: ["Interpretation", "What 8'h80 means", "Is 8'h03 < 8'h80?", "Verilog"],
          rows: [
            ["unsigned", "128", "yes, 3 is less than 128", "`(a < b)`"],
            ["signed", "−128", "no, 3 is not less than −128", "`($signed(a) < $signed(b))`"],
          ],
          caption:
            "Same bits, same module, opposite answers. The width of the signal did not change — 8'h80 is `1000_0000` either way. Only the interpretation did, and the interpretation is what decides the result.",
        },
        {
          kind: "code",
          caption:
            "The same comparison, written two ways. Only the `$signed` changes the answer.",
          code: `// Unsigned: 8 bits hold 0 to 255, so 0x80 is a large number.
module slt_u (
  input  wire       [7:0] a,
  input  wire       [7:0] b,
  output wire       [7:0] result
);
  reg [7:0] r;
  always @(*) begin
    r = (a < b) ? 8'h01 : 8'h00;
  end
  assign result = r;
endmodule

// Signed: the same 8 bits read as -128 to 127, so 0x80 is a small number.
module slt_s (
  input  wire       [7:0] a,
  input  wire       [7:0] b,
  output wire       [7:0] result
);
  reg [7:0] r;
  always @(*) begin
    r = ($signed(a) < $signed(b)) ? 8'h01 : 8'h00;
  end
  assign result = r;
endmodule`,
          note: "In the full ALU the body of this block is one line of the `case`: `3'b101: result = (a < b) ? 8'h01 : 8'h00;`. `$signed(a)` is a system function that says \"read these bits as a two's-complement number\". It changes nothing about the circuit except which of the two interpretations the comparator uses. Pick one per ALU and write it in the operation table, because a datapath where some rows are signed and some are not is a design nobody can reason about.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why the ALU in this chapter is unsigned",
          text: "The eight bits are described as 0 to 255 throughout, with no mention of a sign bit, and the operation table is written that way. So `slt` here is an unsigned comparison, and the correct row is `a < b`. A signed ALU would say in its table that the top bit is a sign and the range is −128 to 127, and would then need `$signed`. Both are correct designs. What is not correct is an ALU whose documentation does not say which one it is.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Write both interpretations of every value from 8'h7E to 8'h82. Unsigned: 126, 127, 128, 129, 130. Signed: 126, 127, −128, −127, −126. Notice where the two orderings disagree: at 8'h80.",
            "Decide the answer to \"is 8'h03 less than 8'h80?\" under each interpretation. Unsigned: yes. Signed: no. Write both down; this is the whole point of the block.",
            "For 8'h03 < 8'h80 unsigned, the result is 0x01 and `zero` is 0, because 0x01 is not zero. For 8'h80 < 8'h03 unsigned, the result is 0x00 and `zero` is 1. Record both — the second one is a case where the result is zero but the operation succeeded, which trips people who expect `zero` to mean \"nothing happened\".",
            "Now write the truth table for a 1-bit comparison: a=0, b=1 gives 1; a=1, b=0 gives 0; a=0, b=0 and a=1, b=1 both give 0. It is a strict less-than, so equal values give 0, not 1.",
            "Predict what a signed version of your ALU would return for 8'h80 < 8'h03, and confirm the two interpretations give different answers for every pair that straddles 0x80.",
          ],
        },
        {
          kind: "trap",
          wrong: "`result = a < b;` — writing the comparison straight into the 8-bit result register.",
          right: "`result = (a < b) ? 8'h01 : 8'h00;`",
          why: "The comparison produces a single bit, and the register is 8 bits, so Verilator emits a WIDTHEXPAND warning about expanding 1 bit to 8. The circuit would still be right — the bit gets zero-extended — but you have trained yourself to ignore a warning that would matter in a different line. Writing `8'h01` and `8'h00` makes the intent explicit and the warning disappears.",
        },
        {
          kind: "trap",
          wrong: "`result = (a > b) ? 8'h01 : 8'h00;` written on the row labelled `slt`.",
          right: "`result = (a < b) ? 8'h01 : 8'h00;`",
          why: "The two differ on every input except equality, and equality is rare in a random test, so a testbench with ten hand-picked cases can pass while the operation is exactly backwards. The testbench row \"0x03 is less than 0x80 is true\" exists to catch precisely this. The name is the check: `slt` is *set less than*, not *set greater than*.",
        },
        {
          kind: "trap",
          wrong: "Widening a and b to 16 bits before comparing, on the theory that a wider comparison is more correct.",
          right: "Compare at the natural width, and use `$signed` if you mean signed.",
          why: "Zero-extending (`{8'h00, a}`) turns a signed 8-bit value into a positive 16-bit value, so −128 becomes 128 and the comparison is now unsigned whether you wanted it or not. Sign-extending makes the numbers correct but changes the answer anyway, because the comparison then genuinely treats them as signed. Widening to change an interpretation is a trap; widening to prevent an overflow is fine. Know which one you are doing.",
        },
      ],
    },
    {
      slug: "always-blocks",
      title: "Two kinds of always block, and the latch warning that tells you which you wrote",
      lede: "One block reacts to its inputs immediately. One block reacts to a clock edge and only then. Mixing them up is the most common structural error in this chapter.",
      blocks: [
        {
          kind: "table",
          head: ["", "Combinational", "Sequential"],
          rows: [
            ["Header", "`always @(*)`", "`always @(posedge clk)`"],
            ["When it runs", "whenever any signal it reads changes", "only on the low-to-high edge of `clk`"],
            ["Assignment", "`=` (blocking)", "`<=` (nonblocking)"],
            ["What it builds", "a rule: output always equals this expression", "a register: a value that holds until the next edge"],
            ["Has a clock input", "no", "yes"],
            ["Example here", "the ALU's `case`, the read mux of the register file", "the register file's write block, the accumulator"],
            ["Warns if you forget something", "LATCH", "nothing — it is perfectly legal to do nothing"],
          ],
          caption:
            "Six rows, and every trap in the rest of this chapter is a violation of one of them. Print this table out and keep it next to the editor for the duration of the chapter.",
        },
        {
          kind: "code",
          caption: "The two forms side by side. The bodies look almost identical; the headers decide everything.",
          code: `// Combinational: a mux, chosen by one bit, with no memory.
module comb_mux (
  input  wire       sel,
  input  wire [7:0] a,
  input  wire [7:0] b,
  output wire [7:0] y
);
  reg [7:0] picked;
  always @(*) begin
    if (sel)
      picked = a;
    else
      picked = b;
  end
  assign y = picked;
endmodule

// Sequential: one register that reloads itself on every clock edge.
module seq_reg (
  input  wire       clk,
  input  wire       en,
  input  wire [7:0] d,
  output wire [7:0] y
);
  reg [7:0] r;
  always @(posedge clk) begin
    if (en)
      r <= d;
  end
  assign y = r;
endmodule`,
          note: "In the first module, move `sel` and `y` changes *immediately*, in the same instant — that is why a combinational block has to be right on every path. In the second, move `d` at 5 ns and nothing happens; `r` only changes at the next rising edge, and only if `en` is 1 at that moment. That delay is not a limitation. It is the feature that makes a datapath work.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The workspace files spell these three things differently",
          text: "The starter code in this chapter is written in the newer SystemVerilog style, where the same ideas have shorter names: `logic` instead of `reg` or `wire`, `always_comb` instead of `always @(*)`, and `always_ff @(posedge clk)` instead of `always @(posedge clk)`. They mean the same thing and behave the same way; the new spellings exist so the tool can check that you did not use a `logic` as a register inside a combinational block. Everything in this guide uses the Verilog-2001 spellings, and both forms are correct in a `.sv` file.",
        },
        {
          kind: "para",
          text: "The LATCH warning deserves its own paragraph, because it is the tool telling you something precise. A latch is a bit that remembers. Verilator reports LATCH when a combinational block leaves an output unassigned along some path — for example, when the `case` has no `default` and no row matches. The block still has to produce a value, so the hardware keeps the old one. That is a latch, and it is a bug here, because in a datapath an output that depends on what happened previously is exactly the kind of thing that makes a design impossible to reason about. Combinational logic must be a pure function of its inputs: same inputs, same output, no history. Fix it by giving every path a value, and the LATCH warning goes away.",
        },
        {
          kind: "trap",
          wrong: "Writing a mux as `always @(posedge clk) if (sel) y <= a; else y <= b;`",
          right: "`always @(*) if (sel) y = a; else y = b;`",
          why: "The mux now only changes on a clock edge, so it has become a register: `y` holds its old value until the next clock, and if there is no clock at all it never updates. The result looks right in a testbench that only checks just after a clock edge, and wrong everywhere else. The header of the block is what declares the *kind* of hardware, and the kind must match what you meant.",
        },
        {
          kind: "trap",
          wrong: "Using `=` in a clocked block, because that is the assignment you learned in the combinational blocks.",
          right: "Use `<=` in a clocked block. `<=` means \"schedule this update for the end of the current time step\".",
          why: "The two behave identically when there is one statement, so the mistake is invisible in a small block. It bites the moment a clocked block reads a signal it also writes: with blocking `=`, the new value is visible to the rest of the block immediately, so a later line sees the *updated* value instead of the value from before the edge. The safe habit is mechanical: `<=` in every clocked block, always, and never think about it again.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "For the combinational mux above, list the two inputs it reads: `sel`, `a`, `b`. Confirm that changing any of them changes `picked` with no clock involved.",
            "For the sequential block, list the inputs it reads: `clk`, `en`, `d`. Then ask which of those three can change `r` without changing `r`. Only the clock edge can, and only if `en` is high at that edge.",
            "Sketch the two on paper as boxes. The mux should have arrows entering and leaving all at the same moment, with nothing inside. The register should have a small clock symbol on the side, and inside it a shape that looks like a latch.",
            "Now delete the `else` from the combinational mux and decide what Verilator would say. A LATCH warning, because when `sel` is 0 there is no assignment on that path and `picked` keeps its old value.",
            "Delete the `if (en)` from the register instead. Verilator says nothing, because a register that only changes on a clock edge is exactly what it should be — it just happens to never change. Legal, and useless. This asymmetry is worth remembering.",
          ],
        },
      ],
    },
    {
      slug: "registers-and-the-accumulator",
      title: "The accumulator: the loop you will build over and over",
      lede: "Value out of a register, through combinational logic, back into the register. The clock edge is where the value commits.",
      blocks: [
        {
          kind: "para",
          text: "Here is the picture, in words, because this is the shape you will reuse in every remaining chapter. Draw a box on the left and label it **register R**. It has an output on its right side and an input on its left side. Draw a box in the middle labelled **combinational logic** — the ALU, or for this first version a single add. Run a wire from R's output into that box. Run a second wire out of the box, back round to R's input. Then draw a clock symbol attached to R only, with no connection to the middle box. That is the whole datapath: one register, one block of logic, one loop. The middle box has no memory, so it is always computing; the register only moves when the clock says so.",
        },
        {
          kind: "steps",
          title: "What happens in one clock cycle",
          items: [
            {
              head: "The register is sitting on a value",
              body: "Call it 5. It has been there since the last rising edge, and it is not going anywhere. R's output wire carries 5, and the combinational block down-stream of it has been computing 5 + d this whole time.",
            },
            {
              head: "New inputs arrive",
              body: "Someone drives `d` with 3. This is not a clock event — it is just a value appearing. The combinational block re-evaluates immediately, because `always @(*)` says so, and its output changes from whatever it was to 8. Nothing about R has changed. R is still holding 5.",
            },
            {
              head: "The clock edge arrives",
              body: "This is the only moment that matters. If `we` is 1, the register takes whatever is on its input, which is 8, and holds it. If `we` is 0, it ignores the input entirely and keeps holding 5. The new value is not visible on R's output until the edge has passed — that is what a register is.",
            },
            {
              head: "The loop repeats",
              body: "Next time `d` changes, the same thing happens one step further along. After enough cycles the register holds a sum, a running total, a filtered value, a partial result — whatever the middle box is designed to accumulate. Adding `d` to `R` repeatedly is how you build a sum without a wide adder. That is the trick this pattern exists for.",
            },
          ],
        },
        {
          kind: "code",
          caption: "An 8-bit accumulator. On each clock edge, either load or add — never both, never neither by accident.",
          code: `module acc8 (
  input  wire       clk,
  input  wire       rst,
  input  wire       we,
  input  wire       inc,
  input  wire [7:0] d,
  output wire [7:0] q
);
  reg [7:0] r;

  // Combinational: what the register would hold if the clock let it change.
  wire [7:0] next = inc ? (r + d) : d;

  // Sequential: the only place r ever changes.
  always @(posedge clk) begin
    if (rst)
      r <= 8'h00;
    else if (we)
      r <= next;
  end

  assign q = r;
endmodule`,
          note: "`inc` chooses between adding and loading. It is a 1-bit mux sitting between the register and the logic, and it is the smallest possible example of the operation-select mux from the ALU. Note the ordering of the `if` chain: `rst` is tested first, so a reset wins over everything else. That ordering is a priority decision, and it should always be deliberate.",
        },
        {
          kind: "para",
          text: "The middle of this design is combinational, and that is what makes the design safe. The ALU has no clock, so it never has stale data inside it — the answer on its output is correct for the inputs it currently sees, at this instant. The register is the only thing in the picture that can be out of date, and it is out of date by exactly one clock edge, by construction. Chapter 11's state machine fits in here too: replace the `if (we) ... else if (inc) ...` with `case (state)`, and you have a *finite state machine with a datapath*, usually shortened to FSMD. The state machine says which operation happens; the datapath does it. Neither one can do the other's job, which is exactly why they are separate boxes.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Start with `r` = 0 after reset. On cycle 1, set `we` = 1, `inc` = 1, `d` = 5. Before the edge, what is the value on `next`? It is 0 + 5 = 5. After the edge, what is `r`? It is 5. Write both numbers down — this is the pattern the rest of the exercise repeats.",
            "Cycle 2: `we` = 1, `inc` = 1, `d` = 3. `next` is now 5 + 3 = 8, because the add reads the *current* value of `r`, not the value from before the last edge. After the edge `r` is 8.",
            "Cycle 3: `we` = 1, `inc` = 1, `d` = 250. `next` is 8 + 250 = 258, which does not fit in 8 bits, so the wire carries 258 − 256 = 2. After the edge `r` is 2. Write down that the accumulator has silently wrapped, and that this is correct unsigned behaviour — it is a modulo-256 adder.",
            "Cycle 4: `we` = 0. What is `next`? Still 8 + 250 = 2, because the combinational block does not know or care about `we`. But after the edge `r` is still 2 — unchanged, because `we` was 0. This is the crucial observation: the middle block computes something every cycle, and the register simply chooses whether to accept it.",
            "Cycle 5: `we` = 1, `inc` = 0, `d` = 7. `next` is 7, not the old `r` plus 7, because `inc` is 0. After the edge `r` is 7 — the load path overwrites the sum.",
            "Cycle 6: assert `rst` = 1 for one edge. `r` becomes 0 regardless of `we` and `d`, because `rst` is tested first. Then drop `rst` and confirm a normal cycle works again.",
            "As a final check, list the three signals in the module that can change `r`: `clk` (with the edge condition), `rst` (if it happens to be high at an edge), and `we` together with whatever `next` is. `d` and `inc` change what *would* be loaded, never what *is* loaded.",
          ],
        },
        {
          kind: "trap",
          wrong: "Declaring the register as `wire [7:0] r;` because every other signal in the module is a wire.",
          right: "`reg [7:0] r;`",
          why: "A wire is a connection. You are not allowed to assign to a wire from inside an `always` block, and the tool will tell you so with a clear error. The distinction is not arbitrary: a wire is something the module *drives out of* and something else *drives into*, while a `reg` is storage the module owns. If you find yourself wanting to assign to it inside a block, it is a register — say so with `reg`.",
        },
        {
          kind: "trap",
          wrong: "Writing `r = next;` in the clocked block instead of `r <= next;`.",
          right: "`r <= next;`",
          why: "It compiles and it works in a block this small, so the mistake survives. It breaks the moment two registers read each other in the same block, because blocking assignment makes each update visible to the rest of the block immediately and the design starts to depend on the order of your lines. Nonblocking assignment in clocked blocks is a habit with no exceptions and no cost.",
        },
        {
          kind: "check",
          items: [
            {
              q: "In the accumulator, `d` changes three times between clock edges. How many times does `next` change?",
              a: "Three times. `next` is driven by a `wire` assigned from a combinational expression, so it re-evaluates the instant `d` or `r` changes, with no clock involved. `r`, meanwhile, changes zero times in that interval. The register samples whatever `next` happens to be *at the edge* — which is exactly why the value of `d` must be stable across the edge, and why real designs register their inputs before feeding a datapath.",
            },
            {
              q: "You want the accumulator to add on every cycle automatically, with no `we` at all. What changes, and what is the risk?",
              a: "Drop `we` and the `else` branch, so every edge does `r <= next;`. The risk is that `r` becomes sensitive to the exact moment of the first edge after reset: if `rst` is deasserted asynchronously and the input is not yet valid, the first edge loads garbage, and from then on it is permanently in the sum. A datapath is only as good as the timing of what feeds it.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-register-file",
      title: "A register file: two read ports and one write port",
      lede: "Four registers that hold values, with a way to look at two of them at once and a way to put a new value into one.",
      blocks: [
        {
          kind: "para",
          text: "An ALU is good at arithmetic and terrible at remembering. A register is good at remembering and cannot do arithmetic. A *register file* is the second one, extended: a small set of registers with addressing, so you can name one to read it and name one to write it. This is the part of a processor you are most likely to recognise — it is the thing whose contents a programmer sees as numbered variables, and it is the first place in the track where you choose a behaviour rather than compute one.",
        },
        {
          kind: "table",
          head: ["Pin", "Width", "Direction", "What it does"],
          rows: [
            ["`clk`", "1", "in", "The clock. Every write happens on a rising edge and at no other time."],
            ["`rst`", "1", "in", "Reset. When it is high at a clock edge, every register is cleared."],
            ["`we`", "1", "in", "Write enable — the guard on the write port."],
            ["`waddr`", "2", "in", "Which of the four registers the write port is aimed at. Two bits because 2² = 4."],
            ["`wdata`", "8", "in", "The value to write."],
            ["`raddr_a`", "2", "in", "Which register read port A looks at."],
            ["`raddr_b`", "2", "in", "Which register read port B looks at."],
            ["`rdata_a`", "8", "out", "What read port A currently sees."],
            ["`rdata_b`", "8", "out", "What read port B currently sees."],
          ],
          caption:
            "Two bits of address reach four registers, so 2² = 4 — the counting rule from chapter 1 again. Note which pins are gated by the clock and which are not: only the write side mentions `clk`, because only the write side changes anything.",
        },
        {
          kind: "table",
          head: ["Port", "Address in", "Data out", "Data in", "Count"],
          rows: [
            ["Read port A", "`raddr_a`", "`rdata_a`", "—", "1"],
            ["Read port B", "`raddr_b`", "`rdata_b`", "—", "1"],
            ["Write port", "`waddr`", "—", "`wdata`, gated by `we`", "1"],
          ],
          caption:
            "The shape is called 2R1W: two reads, one write. That is the number that matters, not the number in the problem-set name. Two read ports exist because a real instruction often needs two source operands at the same instant — think of `a + b` — and one write port because a single instruction produces one result. The `we` pin is not a fourth access port; it is the switch that says whether the write port counts this cycle.",
        },
        {
          kind: "code",
          caption: "The complete register file: a memory array, one clocked write block, and a combinational read block.",
          code: `module top (
  input  wire       clk,
  input  wire       rst,
  input  wire       we,
  input  wire [1:0] waddr,
  input  wire [7:0] wdata,
  input  wire [1:0] raddr_a,
  input  wire [1:0] raddr_b,
  output wire [7:0] rdata_a,
  output wire [7:0] rdata_b
);
  // The four registers, as one array. This is a memory declaration.
  reg [7:0] regs [0:3];

  // --- The write port: the only place regs[] ever changes. ---
  always @(posedge clk or posedge rst) begin
    if (rst) begin
      regs[0] <= 8'h00;
      regs[1] <= 8'h00;
      regs[2] <= 8'h00;
      regs[3] <= 8'h00;
    end else if (we) begin
      regs[waddr] <= wdata;
    end
  end

  // --- The read ports: pure combinational, no clock. ---
  reg [7:0] ra, rb;
  always @(*) begin
    ra = regs[raddr_a];
    rb = regs[raddr_b];
    // Read-during-write: a read of the register being written sees the new data.
    if (we && raddr_a == waddr) ra = wdata;
    if (we && raddr_b == waddr) rb = wdata;
  end

  assign rdata_a = ra;
  assign rdata_b = rb;
endmodule`,
          note: "`reg [7:0] regs [0:3];` is an *array of registers*: the `[7:0]` describes each element, and the `[0:3]` says there are four of them. `regs[waddr]` picks one by index. Nothing about this is mysterious — it is four separate `reg [7:0]` declarations and a `case` on the address, written in a shorter, more useful form.",
        },
        {
          kind: "para",
          text: "The write block is guarded three times over, and each guard is a decision. `posedge rst` in the sensitivity list makes the reset *asynchronous*: it takes effect immediately, not at the next edge, which is what you want at power-up when there is no clock yet. `if (rst)` then clears every register, written out one line at a time because spelling it out is clearer than a `for` loop when there are only four. `else if (we)` is the guard that matters most, and it is the subject of the next block.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the write port must be guarded by `we`",
          text: "Delete `else if (we)` and the block becomes `regs[waddr] <= wdata;` on every single clock edge. `waddr` and `wdata` are always driven by something — there is no state in which they are not connected to a value — so on every edge the register named by `waddr` would be overwritten with whatever `wdata` happens to hold. A write port with no enable is not a faster design; it is a design where one register is permanently destroyed and the other three are unreachable. `we` is what turns a set of pins into a port that only acts when asked.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (6 minutes)",
          items: [
            "Write out the contents of all four registers as `r0` through `r3`, starting after a reset: all four are 0x00. Confirm that both read ports, pointed at any address, return 0x00.",
            "Trace a write: set `we` = 1, `waddr` = 2, `wdata` = 0x44, and let a clock edge pass. Before the edge, `regs[2]` is 0x00. After the edge it is 0x44, and nothing else changed. Note that the read ports see the new value only because they are combinational — there is no read cycle.",
            "Drop `we` to 0 while leaving `waddr` = 2 and `wdata` = 0xDD, and let an edge pass. Confirm `regs[2]` is still 0x44. This is the test that catches a missing or misspelled write-enable guard, and it is worth making that mistake deliberately once.",
            "Point both read ports at the same address and confirm both outputs agree. Two read ports is not two different things — it is one lookup available twice, so a single register can be both operands of an operation.",
            "Now write two separate `if (rst) ... ` and `if (we) ...` statements instead of one `if (rst) ... else if (we) ...` chain, and decide what register 2 holds after a reset with `we` high. It is 0x44, not 0x00, because the second `if` runs after the first and overwrites the reset. That is the bug the `else` prevents.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing `regs[waddr] <= wdata;` with no `else if (we)` guard, or with the guard as a separate `if` rather than an `else if`.",
          right: "One `if (rst) ... else if (we) ...` chain, in that priority order.",
          why: "Two separate `if` statements inside one clocked block do not sequence themselves — the block runs top to bottom, so a reset that clears every register followed by an unconditional write to register 2 would leave register 2 non-zero after reset. The `else` is what makes reset the higher priority. Chain them with `else if` and the priority is visible in the indentation.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Both read ports point at register 1, and a write to register 1 is in progress. What do the two ports return, and what would change if the design were read-first?",
              a: "Write-first: both return the new `wdata`, because the override applies to each port independently and both addresses match. Read-first: both return the old contents. The two ports never disagree with each other — the decision applies to the whole file at once, not per port. The next topic is entirely about making that choice on purpose.",
            },
            {
              q: "Why does the read block need no `case` on the address, when `regs[raddr_a]` looks like it should need one?",
              a: "Because the array declaration `reg [7:0] regs [0:3];` already promises four elements, and the tool turns each index into a mux over them. Writing `case (raddr_a)` with four rows would produce the same hardware with more lines. The array is not a shortcut here; it is the same circuit written the way the tool wants to see it, and chapter 13 is entirely about the cases where it is *not* the right choice.",
            },
          ],
        },
      ],
    },
    {
      slug: "read-during-write",
      title: "What a read returns during a write, and why you have to decide",
      lede: "When a read port and the write port touch the same register in the same cycle, nothing tells you the answer. You choose it.",
      blocks: [
        {
          kind: "para",
          text: "In a register file the write happens on a clock edge, and the read is combinational — it has no edge of its own. That leaves a genuine question that the hardware has to answer, because in real silicon a flop cannot be read and written at the same instant and come out unambiguous. When read port A is aimed at register 2 in the same cycle that a write is landing in register 2, what does `rdata_a` show? There are three defensible answers and no fourth. This is the first point in the chapter where the tool cannot check your work, because all three designs are real and all three are used in real processors.",
        },
        {
          kind: "table",
          head: ["Behaviour", "What a read of the register being written returns", "Name"],
          rows: [
            ["Old contents", "the value the register held before this cycle", "read-first"],
            ["New data", "the value being written this cycle", "write-first"],
            ["Undefined", "an `x` in simulation; whatever the hardware happens to do", "don't care"],
          ],
          caption:
            "This is called *read-during-write* semantics, and it is a design decision, not a fact. Pick one, write it in a comment, and make the code match. The module earlier in this chapter is write-first: while `we` is high and a read address equals the write address, that read port is overridden to show `wdata`.",
        },
        {
          kind: "code",
          caption:
            "The whole decision, in two lines. Delete them and the design becomes read-first.",
          code: `    if (we && raddr_a == waddr) ra = wdata;
    if (we && raddr_b == waddr) rb = wdata`,
          note: "These lines live in the read block, after the array lookup has already loaded `ra` and `rb`. They override the lookup only when two conditions hold at once: a write is happening, and this particular read port is pointed at the register being written. Every other read is untouched, which is why the two read ports can disagree with each other only if you wrote the override twice with different conditions.",
        },
        {
          kind: "para",
          text: "How does a register file differ from the RAM in chapter 13? Both are arrays with an address, and the declaration looks almost identical — which is exactly why it is worth being precise. A register file is made of flip-flops: every bit of every register exists in silicon all the time, reads are combinational and take no clock cycles, and it is small enough that the tool will happily build it out of flops. A RAM is a different animal, built out of memory cells with a shared address bus, and its read is usually *synchronous*: you present an address and the data comes back on the *next* clock edge, because that is what lets the hardware share one read path among all the cells. So the register file gives you a read-during-write question with no cycle involved, and RAM gives you the same question with a cycle involved — and for that reason the answers usually differ, since an extra cycle of latency often makes the old data available for free. Same array syntax, very different machines.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Assume register 2 holds 0x00. Set `we` = 1, `waddr` = 2, `wdata` = 0x44, and `raddr_a` = 2. With the write-first override in place, what is `rdata_a` *before* the clock edge? 0x44, because `we` is already high and the override does not wait for an edge. Write that down — it surprises people who assume this only applies after the edge.",
            "Now delete both override lines and answer the same question. `rdata_a` is 0x00, the old contents, because `regs[2]` has not changed yet. That is the read-first design, and it is a perfectly good one.",
            "Point `raddr_b` at register 3 during that same write. Both designs return 0x00 for port B, because the write is aimed at register 2 and the addresses do not match. The override is per-port and address-matched, not a blanket substitution.",
            "Now consider the don't-care option: delete the override lines *and* the array lookups for a port, and leave the output unwritten on that path. Verilator will warn you about a latch, and in simulation you get an `x`. That is the third option, and it is only acceptable if no one ever reads and writes in the same cycle — which for a processor nobody can promise.",
            "Finally, write one sentence in your notes stating which behaviour your register file has and which line of code proves it. The sentence is the deliverable. A behaviour that is not written down is a behaviour that changes by accident.",
          ],
        },
        {
          kind: "trap",
          wrong: "Putting the read logic in an `always @(posedge clk)` block, because that is how the write block was written.",
          right: "Reads go in `always @(*)`. Only writes are clocked.",
          why: "A clocked read means the data on `rdata_a` is one clock edge stale, so reading a register and immediately using it takes an extra cycle, and the read-during-write question stops having a clean answer. It also contradicts the whole point of a register file, which is that reading is free and instant. Combinational reads and clocked writes is the shape every register file in every processor has, and it is worth being able to say why.",
        },
      ],
    },
    {
      slug: "testing-it-yourself",
      title: "Why you have to write your own testbench",
      lede: "A module under test has no inputs of its own. Something has to drive them, and that something is a testbench.",
      blocks: [
        {
          kind: "para",
          text: "A *testbench* is a module whose job is to sit on top of your design and poke it. It has no output pins of its own worth speaking of. Instead it holds the input signals, assigns values to them, waits, and then checks what came out. If everything matches, it prints a line saying so. This is not a testing framework bolted on afterwards; it is the only way anything happens at all, because a design like the ALU has no clock and no internal activity of its own. Ten clock cycles in an unreferenced module is a design that does nothing and simulates in microseconds.",
        },
        {
          kind: "para",
          text: "Read the hidden bench before you write: the ALU bench drives ten rows — 0x12 + 0x2E, the 0xFF + 0x01 wrap with carry, both subtract directions, AND, OR, XOR, the two `slt` orderings around 0x80, and an unknown opcode that must yield zero — checking `y`, `zero` and `carry` on every row. The register-file bench resets all four registers, writes each one and reads it back on both ports, then holds `we` high across an edge with matching addresses to demand write-first read-during-write on each port, and finishes with a `we`-low write that must be ignored. If your module passes your own sweep but fails one of those rows, the bench is right and the row names the bug.",
        },
        {
          kind: "code",
          caption:
            "A complete testbench for the ALU. Note that there is no clock — the ALU is combinational.",
          code: `\`timescale 1ns/1ps
module top_tb;
  reg  [7:0] a, b;
  reg  [2:0] op;
  wire [7:0] y;
  wire       zero, carry;
  integer    errors = 0;

  // Instantiate the design under test. Positional: a, b, op, y, zero, carry.
  top dut (a, b, op, y, zero, carry);

  initial begin
    a = 8'h12; b = 8'h2E; op = 3'b000;   // add
    #1;                                  // let the combinational logic settle
    if (y === 8'h40 && zero === 1'b0 && carry === 1'b0)
      $display("[PASS] 0x12 + 0x2E = 0x40");
    else begin
      errors = errors + 1;
      $display("[FAIL] got y=%h zero=%b carry=%b", y, zero, carry);
    end

    a = 8'hFF; b = 8'h01; op = 3'b000;   // add, wraps
    #1;
    if (y === 8'h00 && zero === 1'b1 && carry === 1'b1)
      $display("[PASS] 0xFF + 0x01 wraps with carry");
    else
      $display("[FAIL] expected y=00 zero=1 carry=1");

    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule`,
          note: "Three things to notice. `#1` waits one time unit so the combinational logic has settled — the ALU has no clock, so there is no edge to wait for and a plain delay is the right tool. `===` is the strict equality that treats `x` as a real value, so a test cannot accidentally pass by comparing an unknown. And the checks are written from the paper work you did earlier, not from whatever the module happens to produce.",
        },
        {
          kind: "para",
          text: "The register file needs a clock, so its testbench has one more piece: a `reg` that toggles on its own. `initial begin clk = 0; forever #5 clk = ~clk; end` produces a clock that rises every 10 time units, forever. Then a write is done by setting `we`, `waddr` and `wdata`, waiting for `@(posedge clk)`, waiting `#1` for the write to land, and setting `we` back to 0. Read-during-write is then easy to write a test for: hold `we` high across the edge with matching addresses and check the output. You do not need to understand the testbench deeply yet — you need to be able to change the input values in it and see what your module does.",
        },
        {
          kind: "points",
          title: "What a testbench gives you that reading code does not",
          items: [
            "Corner cases you would never check by hand: 0xFF + 1, 0x00 − 1, equal operands for `<`.",
            "The unused opcodes, checked once with a single test row rather than reasoned about.",
            "A regression: a file of checks you re-run every time you change the design, so you can tell whether your edit broke something.",
            "A waveform, via `$dumpfile` and `$dumpvars`, that shows every signal over time when a check fails.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Your testbench prints `[PASS] add: 0x12 + 0x2E = 0x40` but nothing happens when you change the opcode to `3'b101`. What have you forgotten?",
              a: "Most likely `#1`. The ALU is combinational, so assigning `a`, `b` and `op` schedules the new values for the current time step, and the `if` that follows runs before the design has re-evaluated. Without a delay, the check reads the *previous* result. If the delay is there and it still fails, the next thing to check is that `slt` is an unsigned comparison — a signed ALU returns the opposite answer for these two values, which is the single most common reason a `slt` test fails.",
            },
            {
              q: "You are writing the register file testbench and your first write never takes effect. Name three possible causes.",
              a: "First, the clock may not be toggling at all — a missing `forever` loop, or `clk` left at 0, means there is no posedge to wait on. Second, `we` may already be back to 0 by the time the edge arrives, so the write is correctly ignored. Third, the reset may still be high: `rst` is tested before `we` in the `if` chain, so while `rst` is high the module clears registers and ignores writes entirely. Check the clock first; it explains the other two symptoms too.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "accumulator", meaning: "A register that feeds its own output back in through combinational logic, so each clock cycle builds on the last." },
    { term: "ALU (arithmetic logic unit)", meaning: "The block that performs one of several operations on two operands, chosen by an opcode." },
    { term: "carry flag", meaning: "One bit reporting that an addition produced a value too large for the result width; for subtraction, 1 means no borrow was needed." },
    { term: "case statement", meaning: "A statement that compares one value against a list of possibilities and takes the branch whose value matches — the ALU operation table written as code." },
    { term: "datapath", meaning: "Registers and combinational blocks wired together to move and compute on data, with a clock deciding when a value moves." },
    { term: "flag", meaning: "A single output bit reporting a fact about a result, such as `zero` or `carry`, so later logic need not recompute it." },
    { term: "nonblocking assignment", meaning: "`<=`, used inside clocked blocks so every update lands at the end of the time step rather than immediately." },
    { term: "opcode", meaning: "The small number that tells an ALU which operation to perform; an index into the operation table." },
    { term: "read-during-write", meaning: "What a read port returns when it is reading the register being written in the same cycle: the old data, the new data, or an undefined value." },
    { term: "register file", meaning: "A small addressed set of registers with several read ports and one write port, like a processor's named variables." },
    { term: "two's complement", meaning: "The signed number system in which negating a value means flipping every bit and adding one, which lets one adder do both jobs." },
    { term: "write enable", meaning: "The `we` input that says whether a write port should act this cycle; without it a write port would overwrite its target on every clock edge." },
    { term: "zero flag", meaning: "One bit that is 1 when the result is all zero, used to answer \"did these two values match?\" without a separate comparison." },
  ],
  nextStep:
    "Open the first lesson, Build an 8-bit ALU, with this page beside you. You will fill in the `case` rows you worked out on paper, wire up `zero` and `carry`, and run the checks. Two things to have ready before you start: the operation table above, exactly as you wrote it in the doThis, and the two's-complement subtraction worked out in longhand — because the one thing the tool will not tell you is that you meant a different operation than the one you wrote.",
};
