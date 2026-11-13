export type Dialect = "verilog-2001" | "systemverilog";

export type LessonTheory = {
  intro: string;
  how: string;
  example?: { code: string; note?: string };
  watch?: string[];
};

export type Lesson = {
  slug: string;
  title: string;
  objective: string;
  practice: string[];
  task: string;
  theory: LessonTheory;
};

export type PSet = {
  slug: string;
  title: string;
  summary: string;
};

export type Chapter = {
  number: number;
  slug: string;
  title: string;
  summary: string;
  duration: string;
  dialect: Dialect;
  concepts: string[];
  lessons: Lesson[];
  pset: PSet;
};

export const TRACK_TITLE = "Verilog Digital Design";
export const CHAPTER_COUNT = 15;

export const chapters: Chapter[] = [
  {
    number: 1,
    slug: "synthesis-foundations",
    title: "Synthesis Foundations",
    summary:
      "Bits, truth tables, and the compile-elaborate-simulate flow that every RTL design sits on.",
    duration: "~2 hrs",
    dialect: "verilog-2001",
    concepts: ["bits & widths", "4-state values (0/1/x/z)", "truth tables", "Verilog literals"],
    lessons: [
      {
        slug: "bits-and-truth-tables",
        title: "Bits, Vectors & Truth Tables",
        objective:
          "Model signals as fixed-width bit vectors, read a truth table, and understand what it means to compile and lint a design.",
        practice: [
          "Declare a module with a 4-bit input `a` and a 4-bit output `y`.",
          "Write the literals `4'b1010`, `4'd10` and `4'hA` and confirm they denote the same 4-bit value.",
          "Complete a 2-input truth table by hand, then reproduce it with an `assign`.",
          "Run the compiler and read the status chip; notice UNUSED/UNDRIVEN info messages and treat them as style notes.",
        ],
        task: "Model simple input vectors and confirm a truth table by hand.",
        theory: {
          intro:
            "Digital hardware speaks in fixed-width bit vectors. A 4-bit signal `a` is a bundle of four independent wires, each holding exactly one value: 0, 1, x (unknown) or z (floating).",
          how:
            "A `module` is the unit of hardware: it declares ports (its interface) and a body that describes behavior. An `assign` drives an output continuously from an expression — every time an input changes, the output is re-evaluated. A truth table lists, for every combination of inputs, the output the hardware must produce; an `assign` is how you make the hardware honest to that table.",
          example: {
            code: `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y
);
  // One row of a truth table, expressed directly.
  assign y = (a == 4'b0011) && (b == 4'b0001) ? 4'b0001 : 4'b0000;
endmodule`,
            note: "`[3:0]` means bit 3 is the most significant — keep the same ordering everywhere and your design reads top-to-bottom.",
          },
          watch: [
            "4'b1010, 4'd10 and 4'hA are all the same ten. Read literals as width'base'value.",
            "Verilator reports UNUSED and UNDRIVEN as style notes, not failures — a signal that is declared but never read is usually a mistake, but the design still lints.",
            "x and z are real 4-state values: x means unknown, z means high-impedance. Don't treat them as \"don't care\" yet.",
          ],
        },
      },
    ],
    pset: {
      slug: "truth-table-synthesizer",
      title: "Truth-Table Synthesizer",
      summary:
        "Synthesize the graded truth table: y is 4'b0001 only when a==4'b0011 AND b==4'b0001, else 4'b0000; ports: top(a, b, y).",
    },
  },
  {
    number: 2,
    slug: "logic-gates",
    title: "Logic Gates",
    summary:
      "AND, OR, NOT, NAND, NOR, XOR, XNOR as continuous assignments and gate-level primitives.",
    duration: "~2 hrs",
    dialect: "verilog-2001",
    concepts: ["continuous assignment (assign)", "gate primitives", "explicit vs implicit nets", "NAND-universality"],
    lessons: [
      {
        slug: "gate-primitives",
        title: "Gate Primitives & assign",
        objective:
          "Write combinational gates two ways — `assign` expressions and gate primitives — and derive any gate from NANDs.",
        practice: [
          "Write `assign y = a & b;` and predict the truth table before compiling.",
          "Express NAND two ways: `assign y = ~(a & b);` and `nand g(y, a, b);`.",
          "Build XOR from 4 NAND gates; verify all four input rows.",
          "Instantiate a gate primitive and watch the output net appear on the wire.",
        ],
        task: "Write a 2-input gate as a continuous assignment and as a primitive.",
        theory: {
          intro:
            "There are two ways to describe a gate in Verilog: an expression (`assign y = a & b;`) or a gate primitive (`and g(y, a, b);`). They synthesize to the same hardware — the choice is about how you want to think about the circuit.",
          how:
            "Dataflow modelling (assign) describes the Boolean equation; structural modelling (primitives) describes the gate instances and their wiring, with the output as the first port and inputs after. Because everything is built from NAND, any circuit you can draw as gates can be rebuilt with NANDs only — a classic proof of universality that you will physically verify.",
          example: {
            code: `module top (
  input  wire a,
  input  wire b,
  output wire y
);
  // Same function, two spellings:
  assign y = ~(a & b);   // dataflow
  // nand g(y, a, b);    // structural — same net
endmodule`,
            note: "With gate primitives the output net must be declared before use, and Verilator warns with IMPLICIT if you forgot to declare a net it infers.",
          },
          watch: [
            "The NOT of AND is NAND, and NOT alone is `not` (built-in). A NOT made of NAND is `nand (y, i, i);` — both inputs tied together.",
            "XOR built from four NANDs is a rite of passage; check every one of the four input rows in a truth table, not just two.",
            "Unused output? Verilator says UNUSED. Input no one drives? UNDRIVEN. Both are info-level style notes here, not errors.",
          ],
        },
      },
    ],
    pset: {
      slug: "gate-netlist-designer",
      title: "Gate Netlist Designer",
      summary:
        "Build a NAND-only network for y = (a & b) | (c & d) over all 16 input rows; ports: top(a, b, c, d, y).",
    },
  },
  {
    number: 3,
    slug: "combinational-expressions",
    title: "Combinational Expressions",
    summary:
      "Operators, operator precedence, vectors, and structural vs. behaviorial modelling of pure logic.",
    duration: "~3 hrs",
    dialect: "verilog-2001",
    concepts: ["operators & precedence", "part-selects & variable-select (+:)", "concatenation vs replication", "reduction operators"],
    lessons: [
      {
        slug: "operators-and-precedence",
        title: "Operators & Precedence",
        objective:
          "Translate Boolean equations into Verilog expressions with correct grouping and operator precedence.",
        practice: [
          "Rewrite `y = ab + cd` with correct precedence and parens, then without parens and compare the result.",
          "Use the unary reduction `&a, |a, ^a` on a 4-bit vector and confirm it returns a 1-bit result.",
          "Find a 4-bit `x` where `(x[0] & x[1]) != (x & 4'b0011)` to see width semantics.",
          "Explain why `(a + b) >> 1` truncates differently for unsigned vectors.",
        ],
        task: "Translate a Boolean equation into a Verilog expression with correct grouping.",
        theory: {
          intro:
            "Operators read like C, but the traps live in precedence and width — Verilog decides how wide an expression is before it decides what it means.",
          how:
            "Among bitwise operators, `~` binds tightest, then `&`, then `^`/`^~`, then `|`. Logical operators (`&&`, `||`) are looser still and yield a 1-bit true/false. Unary reductions (`&a`, `|a`, `^a`) squish a whole vector into one bit. Width: when an expression's left operand is narrower than its right, Verilog silently extends — that is where `(a + b) >> 1` on 4-bit unsigned vectors loses the carry.",
          example: {
            code: `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y,
  output wire       all_high
);
  // Boolean equation with explicit grouping:
  assign y = (a & ~b) | (b & ~a);   // XOR
  assign all_high = &a;             // reduction AND -> 1 bit
endmodule`,
            note: "Read `~(a & b)` as NOT-of-AND, and `~a & b` as (NOT a) AND b. They differ!",
          },
          watch: [
            "WIDTH tells you two operands in a bitwise/arithmetic expression disagree on width — the classic silent bug before you ever simulate.",
            "`a & 4'b0011` is a 4-bit AND; `a[0] & a[1]` is a 1-bit AND. Same symbol, different width → different result.",
            "Prefer parentheses for any expression a reviewer (or you, tomorrow) could mis-group.",
          ],
        },
      },
      {
        slug: "vector-slices",
        title: "Vector Slices & Concatenation",
        objective:
          "Slice, concatenate and replicate bit vectors to rearrange data at word level.",
        practice: [
          "Re-extract `a[3:0]` from a 8-bit vector and compare with `a[7:4]`.",
          "Reverse a 4-bit vector using explicit slices, then a 100-bit one with a loop.",
          "Build `{a, b}` and `{4{1'b1}}`; predict the widths before compiling.",
          "Swap the high and low nibbles of a byte in one assign.",
        ],
        task: "Slice, concat and reduce vectors for a word-level function.",
        theory: {
          intro:
            "Vectors are how data moves; slicing, concatenating and replicating are how you rearrange data at the word level — the digital-design equivalent of moving bytes around in memory.",
          how:
            "A part-select `a[3:0]` pulls a fixed span of bits out. `{a, b}` concatenates a then b into one wider vector (widths add). `{4{1'b1}}` replicates a 1-bit value 4 times — the replication count goes first, outside the braces. For variable indexes you must use the indexed select `a[idx +: 4]`, because a hardware span must be known at elaboration time.",
          example: {
            code: `module top (
  input  wire [7:0] a,
  output wire [7:0] swapped,
  output wire [3:0] low_nibble
);
  // Swap high and low nibbles + replicate a 4-bit pattern.
  assign swapped    = {a[3:0], a[7:4]};
  assign low_nibble = {4{1'b1}};   // 4'b1111
endmodule`,
            note: "`{a[3:0], a[7:4]}` reads the low nibble into the high position — the leftmost item becomes the most significant bits.",
          },
          watch: [
            "WIDTHCONCAT fires when the target is narrower/wider than the concatenation — a sign you mis-sliced.",
            "100-bit reversal in a single class is painful; a `for` loop in a generate or procedural block does it once — but the loop bound must be constant.",
            "`{N{bit}}` is replication; `{N bit}` (no braces doubled) is a syntax error. The two are easily confused at a glance.",
          ],
        },
      },
    ],
    pset: {
      slug: "expression-evaluator",
      title: "Expression Evaluator",
      summary:
        "Implement y = (a & b) | ((c & d) ^ (a | d)) and z = (a & b) | (c & d) over 4-bit vectors; ports: top(a, b, c, d, y, z).",
    },
  },
  {
    number: 4,
    slug: "multiplexers",
    title: "Multiplexers & Selectors",
    summary:
      "MUX-2, MUX-4, wide busses, ternary operators, and MUX-based universality.",
    duration: "~2 hrs",
    dialect: "verilog-2001",
    concepts: ["? : ternary", "case with default", "parametric widths", "incomplete case → latch"],
    lessons: [
      {
        slug: "mux-circuits",
        title: "MUX Circuits",
        objective:
          "Implement 2:1 and 4:1 multiplexers with the ternary operator and `case`, at parameterized widths.",
        practice: [
          "Write a 2:1 MUX with `assign y = s ? b : a;` and verify all four input combinations.",
          "Write the same MUX with `case` inside `always @(*)`, including `default`.",
          "Extend to 4:1 with a 2-bit select; try omitting `default` and read the latch warning.",
          "Parameterize the data width so the same MUX works on 4-bit and 32-bit buses.",
        ],
        task: "Implement 2:1 and 4:1 multiplexers with parameterized widths.",
        theory: {
          intro:
            "A multiplexer routes one of several input busses to a shared output. It is the universal selector — every datapath in this course is a nest of muxes choosing which value moves next.",
          how:
            "`assign y = s ? b : a;` selects b when s is 1, else a. Whenever the selection logic grows past two inputs, a `case` inside `always @(*)` reads far better. Two rules keep muxes honest: cover every select value (`default`), and assign the output in every branch — otherwise the synthesizer infers a latch where you wanted a mux.",
          example: {
            code: `module top (
  input  wire [3:0] a, b, c, d,
  input  wire [1:0] s,
  output reg  [3:0] y
);
  always @(*) begin
    case (s)
      2'b00: y = a;
      2'b01: y = b;
      2'b10: y = c;
      default: y = d;      // covers 2'b11 AND anything weird
    endcase
  end
endmodule`,
            note: "Named select constants (a localparam per value) make 16-input muxes readable.",
          },
          watch: [
            "LATCH is Verilator's warning that your combinational block remembered state — almost always a missing `default` or a branch without an assignment.",
            "CASEINCOMPLETE fires when the case does not cover all select values; add `default` first, debug later.",
            "A parameterized `WIDTH1/2 [W-1:0]` mux must pad to the full bus width in every branch — mixed widths both truncate and latch.",
          ],
        },
      },
    ],
    pset: {
      slug: "feature-selector",
      title: "Feature Selector",
      summary:
        "Route one of four 4-bit sources to the output: sel 00->a, 01->b, 10->c, 11->d; ports: top(a, b, c, d, sel, y).",
    },
  },
  {
    number: 5,
    slug: "adders",
    title: "Adder Circuits",
    summary:
      "Half adder, full adder, ripple-carry, carry-lookahead, and parameterized adders.",
    duration: "~3 hrs",
    dialect: "verilog-2001",
    concepts: ["half/full adder", "structural composition", "ripple-carry", "carry-out vs overflow", "first testbench ($display/$finish)"],
    lessons: [
      {
        slug: "half-and-full-adder",
        title: "Half & Full Adder",
        objective:
          "Build a full adder from basic gates, then reuse it structurally; write your first minimal testbench.",
        practice: [
          "Write the half-adder truth table, then realize `sum = a ^ b`, `cout = a & b` with assigns.",
          "Assemble a full adder from two half adders and an OR.",
          "Write a minimal testbench: an `initial` block that drives all 8 input rows and prints with `$display`.",
          "End the testbench with `$finish` and read the waveform of `cout`.",
        ],
        task: "Build a full adder from gates, then reuse it structurally.",
        theory: {
          intro:
            "Adding starts with one column of bits. A half adder produces the sum bit (XOR) and the carry-out (AND) for two bits; a full adder also swallows a carry-in so columns can chain.",
          how:
            "`sum = a ^ b`, `carry = a & b`. Two half adders plus an OR make a full adder: first halve a,b → s0,c0; halve s0,cin → sum,c1; carry = c0 | c1. Hardware is hierarchical — you build the column once, then reuse it. A minimal testbench is just an `initial` block: drive inputs, wait a tick, `$display` the result, then `$finish` so the simulation ends.",
          example: {
            code: `module full_adder (
  input  wire a, b, cin,
  output wire sum, cout
);
  wire s1, c1, c2;
  assign s1 = a ^ b;        // first half: sum of a,b
  assign c1 = a & b;        // first half: carry of a,b
  assign sum = s1 ^ cin;    // second half: absorb the carry-in
  assign c2 = s1 & cin;
  assign cout = c1 | c2;
endmodule`,
            note: "Three `assign`s of pure gates = exactly the full-adder equation.",
          },
          watch: [
            "A testbench without `$finish` runs forever in simulation — always end the stimulus.",
            "`$display` prints once per execution; it is the workhorse here because `$monitor` is not supported by this Verilator build.",
            "Drive inputs and read outputs on different `#` delays in the `initial` block to avoid racing the combinational update.",
          ],
        },
      },
      {
        slug: "ripple-carry",
        title: "Ripple-Carry Adder",
        objective:
          "Chain full adders into a nibble adder with carry input/output, then generalize to any width.",
        practice: [
          "Instantiate 4 full adders and chase the carry chain by hand for `4'b0011 + 4'b0101`.",
          "Add a carry-in and carry-out port to the nibble adder.",
          "Parameterize the adder with `parameter N = 4` and verify 8- and 16-bit widths.",
          "Detect difference between carry-out and overflow by adding two positive values whose sum exceeds the width.",
        ],
        task: "Chain 4 full adders into a nibble adder with carry input/output.",
        theory: {
          intro:
            "Four full adders in a chain pass each carry into the next column: a ripple-carry adder. It is slow on purpose — the critical path is the carry rippling — but it is the honest, structural way to add N bits.",
          how:
            "Column i produces sum_i from a[i], b[i] and the carry out of column i-1. Watch the carry-out of the last column: carry-out ≠ overflow. Overflow is when the result sign is wrong (adding two positives yields negative); carry-out is just bit N leaving the bus. A `parameter N` lets the same structure serve 4-, 8- or 32-bit buses.",
          example: {
            code: `module ripple_carry #(
  parameter N = 8
)(
  input  wire [N-1:0] a, b,
  input  wire         cin,
  output wire [N-1:0] sum,
  output wire         cout
);
  wire [N:0] carry;
  assign carry[0] = cin;
  genvar i;
  generate
    for (i = 0; i < N; i = i + 1) begin : cols
      full_adder fa (
        .a(a[i]), .b(b[i]), .cin(carry[i]),
        .sum(sum[i]), .cout(carry[i+1])
      );
    end
  endgenerate
  assign cout = carry[N];
endmodule`,
            note: "Named instantiation (`.port(sig)`) is the safe style — positional port order breaks when a port list changes.",
          },
          watch: [
            "PINMISSING fires when a port is left unconnected; an open carry-out is how pins go missing in generated loops.",
            "For unsigned `a + b`, overflow needs a wider result to be seen at all — you cannot detect it from the adder alone without the sign context.",
            "Retype the parameter after widening; lint will thank you for the un-truncated widths.",
          ],
        },
      },
    ],
    pset: {
      slug: "nibble-adder",
      title: "Nibble Adder RTL + TB",
      summary:
        "Add two nibbles with carry-in so {cout, sum} = a + b + cin across all rows; ports: top(a, b, cin, sum, cout).",
    },
  },
  {
    number: 6,
    slug: "arithmetic",
    title: "Number Systems & Arithmetic",
    summary:
      "Two's complement, subtractors, comparators, and sign handling in RTL.",
    duration: "~3 hrs",
    dialect: "verilog-2001",
    concepts: ["two's complement", "signed vs unsigned", "$signed/$unsigned", "sign-extension", "overflow detection"],
    lessons: [
      {
        slug: "twos-complement",
        title: "Two's Complement",
        objective:
          "Compute two's-complement negation, extend signs safely, and detect overflow on a signed datapath.",
        practice: [
          "Negate `4'b0010` in gates (`~x + 1`) and confirm the value on paper.",
          "Compare `a < b` first as unsigned, then cast with `$signed()` and observe the difference for `4'b1111` (=-1).",
          "Add `4'b0111 + 4'b0001` and flag overflow; decide whether carry-out equals overflow here.",
          "Sign-extend a 4-bit signed value to 8 bits and verify with `$signed()`.",
        ],
        task: "Compute negation and detect overflow on a 4-bit signed datapath.",
        theory: {
          intro:
            "Two's complement makes the most-significant bit the sign: `1000` is −8, `1111` is −1, `0111` is +7 — and addition/subtraction need absolutely no sign-aware hardware.",
          how:
            "Negation is `~x + 1` (invert every bit, add one). Whether a hex dump means 15 or −1 depends on the declaration: plain Verilog vectors are unsigned; `$signed(x)` reinterprets them for comparisons and shifts. To widen a signed value you SIGN-extend — copy the sign bit: `{{4{x[3]}}, x}` for 4→8 bits. Overflow appears only in signed view: two positives summing past the sign boundary.",
          example: {
            code: `module top (
  input  wire [3:0] x,
  output wire [3:0] neg,
  output wire [7:0] ext8
);
  assign neg  = ~x + 4'b0001;          // two's-complement negation
  assign ext8 = {{4{x[3]}}, x};        // sign-extension: fill with sign bit
endmodule`,
            note: "Zero-extension is silent — Verilator does not warn on it; truncation warns as WIDTHTRUNC (widening as WIDTHEXPAND) — so a sign-extension that silently zero-extended is the most common signed bug.",
          },
          watch: [
            "`4'b1111` is 15 unsigned and −1 signed — the same bits, two meanings chosen by declaration and context.",
            "Overflow := sign(result) wrong in signed view; carry-out is a separate wire and not the same thing.",
            "Shifting right: unsigned `>>` shifts in zeros; signed must use `>>>` or `$signed()` — never mix the two silently.",
          ],
        },
      },
    ],
    pset: {
      slug: "signed-magnitude-compare",
      title: "Signed Comparator",
      summary:
        "Compare signed nibbles with alt = ($signed(a) < $signed(b)), aeq = (a == b), agt = ($signed(a) > $signed(b)); ports: top(a, b, alt, aeq, agt).",
    },
  },
  {
    number: 7,
    slug: "encode-decode",
    title: "Encoders, Decoders & Priority",
    summary:
      "Binary decoders, priority encoders, casez, and one-hot control logic.",
    duration: "~2 hrs",
    dialect: "verilog-2001",
    concepts: ["3:8 decoder", "priority encoder", "valid flag", "casez / don't-care", "interrupt arbitration"],
    lessons: [
      {
        slug: "priority-encoder",
        title: "Priority Encoder",
        objective:
          "Encode the highest-priority active request line into an index, with a valid signal.",
        practice: [
          "Build the truth table of an 8:3 priority encoder and identify the highest-priority rule.",
          "Implement it with an `always @(*)` and a `case` returning the index per pattern.",
          "Rewrite with `casez` using `1'b?` don't-care items; compare match semantics.",
          "Add a `valid` output and verify it is 0 when every request line is 0.",
        ],
        task: "Encode the highest-priority active request line.",
        theory: {
          intro:
            "A priority encoder turns several request lines into the index of the highest-priority one that is active — it is the arbiter every interrupt controller and bus arbiter is built from.",
          how:
            "With requests `req[7:0]`, you decide a priority order (say: index 7 highest) and answer \"what is the index of the highest active line, and is any line active at all?\" The first matching `case` item wins, so ordering the case items IS the priority order. `casez` treats `?` as don't-care, which lets you write giant match patterns compactly.",
          example: {
            code: `module top (
  input  wire [7:0] req,
  output reg  [2:0] idx,
  output reg        valid
);
  always @(*) begin
    valid = 1'b0;
    idx   = 3'b000;
    casez (req)
      8'b1???????: idx = 3'd7;  // highest priority first
      8'b01??????: idx = 3'd6;
      8'b001?????: idx = 3'd5;
      8'b0001????: idx = 3'd4;
      8'b00001???: idx = 3'd3;
      8'b000001??: idx = 3'd2;
      8'b0000001?: idx = 3'd1;
      8'b00000001: idx = 3'd0;
      default:     valid = 1'b0;   // no request
    endcase
    if (req != 8'b0) valid = 1'b1;
  end
endmodule`,
            note: "`?` in `casez` matches 0, 1 or x — great for masks, dangerous if you meant exact equality.",
          },
          watch: [
            "CASEX and CASEWITHX warn about matches relying on x/z values — in linted RTL that is almost always a bug; prefer `casez`.",
            "Missing `default` in a priority encoder latches — LATCH again, because one branch assigned nothing.",
            "When any request is high, valid must be 1: build it from the OR of requests and double-check the all-zero row.",
          ],
        },
      },
    ],
    pset: {
      slug: "interrupt-priority",
      title: "Interrupt Priority Unit",
      summary:
        "Encode the highest active request with idx as the highest set bit and valid = (req != 0); ports: top(req, idx, valid).",
    },
  },
  {
    number: 8,
    slug: "sequential-fundamentals",
    title: "Sequential Fundamentals",
    summary:
      "D latch vs. flip-flop, always blocks, resets, and clocking discipline.",
    duration: "~3–4 hrs",
    dialect: "verilog-2001",
    concepts: ["always @(posedge clk)", "nonblocking (<=) vs blocking (=)", "async vs sync reset", "enable gates", "metastability & synchronizers"],
    lessons: [
      {
        slug: "flip-flops",
        title: "Flip-Flops & Resets",
        objective:
          "Implement a D flip-flop with async active-low reset and an enable gate, and reason about unknown initial state.",
        practice: [
          "Write a D flip-flop as `always @(posedge clk) q <= d;` and explain why nonblocking matters here.",
          "Add an async active-low reset: `always @(posedge clk or negedge rst_n)` with `if (!rst_n)`.",
          "Add an enable: register `d` only while `en` is high.",
          "Compare sync vs async active-low reset behavior with a stimulus that loads x into `d`.",
        ],
        task: "Implement a DFF with async active-low reset and an enable gate; grading uses the hidden bench.",
        theory: {
          intro:
            "Sequential logic is where the design remembers. A flip-flop samples its input once per clock edge; everything else about the design is combinational logic around that sampling.",
          how:
            "`always @(posedge clk) q <= d;` samples on every rising edge. The nonblocking `<=` is load-bearing: all `<=` in one clocked block update from the OLD values simultaneously, so a pipeline stage always sees last cycle's data — no race. An async active-low reset (`negedge rst_n` added to the sensitivity list, `if (!rst_n) q <= 0`) forces `q <= 0` instantly; an enable (`if (en)`) gates the sample, never the clock.",
          example: {
            code: `module dff (
  input  wire clk, rst_n, en, d,
  output reg  q
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 1'b0;    // async active-low reset: wins immediately
    else if (en) q <= d;     // enable: hold when low
  end
endmodule`,
            note: "Sampling at power-up, before rst_n asserts, your flip-flop holds x — resets exist to get the machine into a known state.",
          },
          watch: [
            "BLKSEQ fires when a clocked block uses blocking `=`. Unless you are an experienced FSM author, that is a bug-in-waiting.",
            "Reset in the sensitivity list but not on the right edge? Verilator reads sync vs async from the list — `negedge rst_n` in the list is async, omitting it is sync.",
            "Metastability is real: an async input violates setup/hold; synchronizers (two flip-flops) bound the failure probability. That is exactly the chapter PSet.",
          ],
        },
      },
    ],
    pset: {
      slug: "synchronizer",
      title: "Two-Flip-Flop Synchronizer",
      summary:
        "Build a two-flop synchronizer with async active-low reset clearing q; grading uses the hidden bench, not a student testbench; ports: top(clk, rst_n, d, q).",
    },
  },
  {
    number: 9,
    slug: "counters",
    title: "Counters & Dividers",
    summary:
      "Up/down counters, modulus counters, prescalers, and clock division.",
    duration: "~3–4 hrs",
    dialect: "verilog-2001",
    concepts: ["modulo-N counting", "terminal-count flag", "up/down enable", "toggle divider", "50% duty clock divider"],
    lessons: [
      {
        slug: "mod-n-counter",
        title: "Modulo-N Counter",
        objective:
          "Build a counter that wraps at a configurable modulus with a terminal-count pulse.",
        practice: [
          "Keep the graded ports `top(clk, rst_n, en, clk_out, phase)` with async active-low reset clearing phase to 0 (clk_out 0).",
          "While `en` is high count phase 0..7 and wrap (phase = count mod 8, K=8); while `en` is low hold phase — never gate the clock.",
          "Drive the 50%-duty single-toggle output as `clk_out = phase[2]`, low for phases 0..3 and high for 4..7.",
          "Verify reset gives clk_out=0/phase=0, enabled edges step phase through the 8-phase pattern, and en=0 freezes clk_out and phase.",
        ],
        task: "Count to N, wrap with terminal count flag.",
        theory: {
          intro:
            "A counter is just a register plus an incrementer — the heartbeat every timer, divider and sequential control unit builds on.",
          how:
            "On each enabled rising edge the register counts. To wrap at a modulus N you compare the count and branch back to 0 (or reverse direction); a terminal-count pulse `tc` is a 1-cycle flag high exactly when the counter reaches its limit. Never gate the clock to enable counting — gate the count with an `en`, which keeps the clock edge uniform. The simplest divider is a 1-bit counter (a toggle flip-flop): 50% duty at exactly half the reference frequency.",
          example: {
            code: `module counter #(
  parameter W = 4, N = 10
)(
  input  wire clk, rst, en,
  output reg  [W-1:0] count,
  output wire         tc
);
  assign tc = (count == N - 1);
  always @(posedge clk or posedge rst) begin
    if (rst) count <= 0;
    else if (en) begin
      if (count == N-1) count <= 0;   // wrap at modulus
      else count <= count + 1;
    end
  end
endmodule`,
            note: "`tc` is combinational from count — latches for a full clock in normal operation.",
          },
          watch: [
            "WIDTH on `count + 1` after widening: the add must carry the full register width or the counter silently saturates.",
            "UNOPTFLAT can appear on messy enable combinations — keep enables as simple `en` wires, not derived clusters.",
            "Gating a clock (`clk = en && clk`) is an anti-pattern for lint-level design; testbench clock generation must stay out of design files.",
          ],
        },
      },
    ],
    pset: {
      slug: "clock-divider",
      title: "Clock Divider",
      summary:
        "Divide by K=8 with phase = count mod 8 and a 50%-duty single-toggle clk_out = phase[2], en-gated with async active-low reset; ports: top(clk, rst_n, en, clk_out, phase).",
    },
  },
  {
    number: 10,
    slug: "shift-registers",
    title: "Shift Registers",
    summary:
      "SISO / SIPO / PIPO, barrel shifters, and serialization patterns.",
    duration: "~2 hrs",
    dialect: "verilog-2001",
    concepts: ["bi-directional shift", "load/enable controls", "rotate vs shift", "LFSR", "serialize/deserialize"],
    lessons: [
      {
        slug: "shifter-family",
        title: "The Shifter Family",
        objective:
          "Build a bidirectional, load-enable shift register and a combinational barrel rotate.",
        practice: [
          "Write a shift register that shifts left on `posedge clk` with a load-enable override.",
          "Add a `dir` control to shift right; verify both directions in a testbench.",
          "Rotate a 4-bit value by an arbitrary amount in a single cycle using slices + concat.",
          "Extend the rotation to 8 bits and generalize the shift count input.",
        ],
        task: "Build a bidirectional, load-enable shift register.",
        theory: {
          intro:
            "Shifting moves every bit one slot per clock — the engine of serializers, deserializers, and pseudo-random LFSRs. Rotating is shifting where bits that leave one end re-enter the other.",
          how:
            "On a rising edge the register grabs its neighbour's bit: shift-left takes new bits in at the right, shift-right at the left. A load-override loads a whole parallel word instead. Rotation by an arbitrary amount in one cycle is combinational: e.g. `y = (d << amt) | (d >> (8 - amt))` or indexed selects such as `v[i +: 1]` inside a constant-bounded loop — a barrel shifter made of muxes, not clocks.",
          example: {
            code: `module shifter (
  input  wire clk, rst, load, dir,
  input  wire sin,
  input  wire [3:0] d,
  output reg  [3:0] q
);
  always @(posedge clk or posedge rst) begin
    if (rst) q <= 4'b0;
    else if (load) q <= d;
    else if (dir) q <= {q[2:0], sin};   // shift left
    else q <= {sin, q[3:1]};            // shift right
  end
endmodule`,
            note: "Rotate-by-k, all in one combinational assign, is the chapter PSet — compare it to the 4-cycle sequential version you write first.",
          },
          watch: [
            "Rotating is not the same as shifting: a rotate puts the bit shifted out back on the other side, while a shift brings in a fresh bit.",
            "WIDTH on slice width mismatch (`{q[3:1]}` is 3 bits, the left field must also be 3 bits).",
            "A `for` loop inside `always @(*)` rotating an arbitrary count must still be unrolled — keep the bounds constant!",
          ],
        },
      },
    ],
    pset: {
      slug: "barrel-shifter",
      title: "Rotating Barrel Shifter",
      summary:
        "Rotate a byte left combinationally with y = (d << amt) | (d >> (8 - amt)) for amt 0..7; ports: top(d, amt, y).",
    },
  },
  {
    number: 11,
    slug: "finite-state-machines",
    title: "Finite State Machines",
    summary:
      "Mealy vs. Moore, state encoding, safe FSM (defaults), and one-hot design.",
    duration: "~4–6 hrs",
    dialect: "systemverilog",
    concepts: ["always_comb + always_ff two-process style", "enum/typedef state types", "Mealy vs Moore", "safe default states", "reset discipline"],
    lessons: [
      {
        slug: "mealy-vs-moore",
        title: "Mealy vs. Moore",
        objective:
          "Distinguish Mealy from Moore outputs and code the Moore flavor with separate decode logic.",
        practice: [
          "List one circuit you would implement Mealy and one Moore; justify from output timing.",
          "In SystemVerilog, declare a state type with `typedef enum logic [1:0] {S0, S1, S2} state_t;`.",
          "Code a Moore sequence edge-detector with `always_comb` for the output decode.",
          "Add a `default` state branch and confirm no latch is inferred.",
        ],
        task: "Describe each style and code the Moore flavor with output decode.",
        theory: {
          intro:
            "A finite state machine is a small, deliberate loop: state determines what happens next (the transition), and outputs say what the outside world sees. Moore outputs depend only on state; Mealy outputs also watch the current input — same cycle, which is why Mealy is faster and glitchier.",
          how:
            "SystemVerilog gives you the three tools that make FSMs readable: `typedef enum` for named states, `always_comb` for combinational next-state/output logic, and `always_ff` for the registered state. A Moore machine has two combinational jobs — compute next state, decode registered state to outputs — and one registered one. A `default` branch makes an illegal-state landing spot instead of a latch or an x.",
          example: {
            code: `module edge_detect (
  input  logic clk, rst, in,
  output logic rise
);
  typedef enum logic [1:0] { IDLE, SAW_0, ROSE } state_t;
  state_t state, next;

  // Registered state
  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= IDLE;
    else state <= next;
  end

  // Next-state + output decode (Moore: from state only)
  always_comb begin
    next = state;
    case (state)
      IDLE:   begin next = in ? ROSE : IDLE; rise = 1'b0; end
      ROSE:   begin next = in ? SAW_0 : IDLE; rise = 1'b1; end
      SAW_0:  begin next = in ? ROSE : IDLE; rise = 1'b0; end
      default: begin next = IDLE; rise = 1'b0; end
    endcase
  end
endmodule`,
            note: "Compare `rise` here (registered through state) with a Mealy version where `rise = in & !prev` changes mid-cycle.",
          },
          watch: [
            "Missing `default` → CASEINCOMPLETE or LATCH; never leave a state type partially covered.",
            "Outputs assigned in only some branches of the case latch too — assign them in every branch, even trivially.",
            "Verilator accepts enum without an explicit encoding; count on WIDTH if you assign enum values to plain vectors carelessly.",
          ],
        },
      },
      {
        slug: "fsm-2-step",
        title: "Two-Paragraph FSM",
        objective:
          "Split next-state logic from registered state into separate `always_comb` + `always_ff` blocks.",
        practice: [
          "Rewrite your Moore FSM as two paragraphs: `always_comb` computes `next`, `always_ff` latches it.",
          "Move Mealy outputs into the combinational block and observe when they change vs registered outputs.",
          "Add `timeunit 1ns / timeprecision 1ps` and verify timescale warnings disappear.",
          "Switch one state variable to `enum` and confirm Verilator accepts it.",
        ],
        task: "Split next-state logic from output logic in separate always blocks.",
        theory: {
          intro:
            "\"Two paragraphs\" is the canonical synthesizable FSM style: one combinational paragraph that answers \"where do I go and what do I emit\", one registered paragraph that answers \"save it\". It reads top to bottom like a protocol.",
          how:
            "`always_comb` computes `next` from `state` and the inputs, and any Mealy outputs. Blocking `=` here is correct — it is combinational. `always_ff @(posedge clk or posedge rst)` then `state <= next` on the edge, nonblocking, so the transition commits one cycle later. Adding `timeunit 1ns / timeprecision 1ps` at the top of the file states the timescale formally and silences `TIMESCALEMOD`.",
          example: {
            code: "`timescale 1ns / 1ps\nmodule fsm (\n  input  logic clk, rst, go,\n  output logic done\n);\n  typedef enum logic [1:0] { S0, S1 } state_t;\n  state_t state, next;\n\n  always_ff @(posedge clk or posedge rst)\n    if (rst) state <= S0;\n    else state <= next;\n\n  always_comb begin\n    next = S0;\n    done = 1'b0;\n    case (state)\n      S0: if (go) begin next = S1; done = 1'b1; end\n      S1: begin next = S0; done = 1'b0; end\n      default: next = S0;\n    endcase\n  end\nendmodule",
            note: "Blocking in `always_comb`, nonblocking in `always_ff` — the rule that keeps both paragraphs honest.",
          },
          watch: [
            "Verilator's BLKSEQ flags blocking `=` inside a clocked block — the two-paragraph split makes that error visible immediately.",
            "TIMESCALEMOD warns when a module has no timescale; `timeunit/timeprecision` is the SV-native replacement for `` `timescale ``.",
            "Count every branch of the output: Mealy outputs that skip a branch will LATCH — assign defaults at the top of the combinational block.",
          ],
        },
      },
    ],
    pset: {
      slug: "traffic-light-controller",
      title: "Traffic Light Controller",
      summary:
        "Run the street-crossing FSM with active-high rst: main green 3 cycles → main yellow 1 → side green 3 → side yellow 1 → repeat (lights: 2'b10 green, 2'b01 yellow, 2'b00 red). A ped request latched during main green/yellow extends the NEXT side green to 5 cycles; ped during side phases is ignored. Ports: top(clk, rst, ped, main_light, side_light).",
    },
  },
  {
    number: 12,
    slug: "datapath",
    title: "Datapath: ALUs & Registers",
    summary:
      "ALU function units, register files, and combining datapath with control.",
    duration: "~3–5 hrs",
    dialect: "systemverilog",
    concepts: ["8-bit ALU (add/sub/and/or/xor/slt)", "opcode decode", "2R1W register file", "read-during-write semantics", "FSM + datapath (FSMD)"],
    lessons: [
      {
        slug: "alu-build",
        title: "Build an 8-bit ALU",
        objective:
          "Implement an 8-bit ALU with six ops under a 3-bit opcode, plus zero and carry flags.",
        practice: [
          "Decode a 3-bit opcode with `case` inside `always_comb` and a full `default`.",
          "Implement add, sub (via two's complement), and, or, xor and slt.",
          "Produce a `zero` flag from the 8-bit result, and a `carry`/`overflow` flag where meaningful.",
          "Pipeline-test the ALU with an exhaustive testbench of corner inputs.",
        ],
        task: "Implement add, sub, and, or, xor, slt under a 3-bit opcode.",
        theory: {
          intro:
            "The ALU is the compute engine every datapath owns: one register, several operations, one mux choosing the result. Opcodes are how software asks hardware which operation to run.",
          how:
            "A `case` on the opcode inside `always_comb` picks the result; subtraction is two's-complement addition (`a + (~b + 1)`). Flags turn the result into conditions: `zero` is NOR of all result bits; `carry`/`overflow` come from the width-8 adder and the signed boundary. A `default` keeps unknown opcodes from latching.",
          example: {
            code: `module alu8 (
  input  logic [7:0] a, b,
  input  logic [2:0] op,
  output logic [7:0] y,
  output logic       zero
);
  logic [7:0] result;
  always_comb begin
    case (op)
      3'b000: result = a + b;
      3'b001: result = a - b;
      3'b010: result = a & b;
      3'b011: result = a | b;
      3'b100: result = a ^ b;
      3'b101: result = (a < b) ? 8'h01 : 8'h00; // slt
      default: result = 8'h00;
    endcase
  end
  assign y = result;
  assign zero = (result == 8'h00);
endmodule`,
            note: "slt compares unsigned here; comparing signed operands needs `$signed()` around a and b.",
          },
          watch: [
            "WIDTH on `a - b` widening or `(a < b)` — sign and width are where arithmetic silently changes meaning.",
            "Every branch must drive `result`: an uncovered opcode is a LATCH, not an error you can see until simulation.",
            "Flags computed from truncated result lie until you account for the carry-out — verify with corner cases, not just a couple of adds.",
          ],
        },
      },
    ],
    pset: {
      slug: "register-file",
      title: "4-Port Register File",
      summary:
        "Deliver a 2R1W file with synchronous we-gated write, dual combinational reads, and write-first read-during-write returning new data; ports: top(clk, rst, we, waddr, wdata, raddr_a, raddr_b, rdata_a, rdata_b).",
    },
  },
  {
    number: 13,
    slug: "memory",
    title: "Memory Blocks",
    summary:
      "ROM, single-port RAM, inferring vs. instantiating, and read-during-write rules.",
    duration: "~3–4 hrs",
    dialect: "systemverilog",
    concepts: ["memory arrays logic [7:0] mem [0:255]", "inferred RAM/ROM", "$readmemh boot images", "read-during-write", "synchronous reads"],
    lessons: [
      {
        slug: "single-port-ram",
        title: "Single-Port RAM",
        objective:
          "Write a synchronous-read RAM that maps to block RAM, then load a ROM image from a hex file.",
        practice: [
          "Declare `logic [7:0] mem [0:255];` and implement a synchronous-read single-port RAM.",
          "Define the read-during-write behavior for your design and test it.",
          "Load a boot image with `$readmemh(\"boot.hex\", mem);` in an initial block.",
          "Wrap the ROM with a valid-latched read port and confirm `mem` is never driven from two blocks.",
        ],
        task: "Write a synchronous-read RAM that maps to block RAM.",
        theory: {
          intro:
            "Memory is just a two-dimensional array of bits declared in one line — and the toolchain infers block RAM from the shape you write. Read/write discipline is what makes it predictable.",
          how:
            "`logic [7:0] mem [0:255];` is 256 bytes. A synchronous-read RAM registers the address so the data comes back one cycle later — that shape is what maps to block RAM instead of hundreds of flops. Read-during-write: if the write path and read path both touch the same cycle, you must DECIDE the answer (return old, new, or x) and stay consistent. `$readmemh` fills a ROM-like array from a hex file at time zero.",
          example: {
            code: `module sram (
  input  logic        clk,
  input  logic        we,
  input  logic [7:0]  addr,
  input  logic [7:0]  din,
  output logic [7:0]  dout
);
  logic [7:0] mem [0:255];

  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;   // synchronous write
    dout <= mem[addr];          // synchronous read: sees the OLD value
    // read-during-write: with nonblocking <= the read sees the OLD mem value regardless of statement order.
  end
endmodule`,
            note: "Statement order does not change a nonblocking read: `dout <= mem[addr]` always sees the OLD value; to forward the NEW value add an explicit bypass such as `dout <= we ? din : mem[addr]`.",
          },
          watch: [
            "MULTIDRIVEN: two `always` blocks writing `mem` is illegal — drive a memory from exactly one procedural block.",
            "`$readmemh(\"boot.hex\", mem);` needs the file in reach; a wrong path is the #1 runtime surprise in this platform.",
            "UPDATE: dynamic arrays/queues and `int` are NOT synthesizable memory — keep fixed `logic [W-1:0] mem [0:D-1]` shapes for block RAM.",
          ],
        },
      },
    ],
    pset: {
      slug: "rom-boot-image",
      title: "Boot ROM with Image",
      summary:
        "Expose the boot ROM through a registered dout with valid rising on the first read and staying high until reset (addr 0->0x00, 5->0x05, 8->0x15, 13->0xE9, 15->0x62); ports: top(clk, rst, addr, dout, valid).",
    },
  },
  {
    number: 14,
    slug: "interfaces",
    title: "Interfaces: UART",
    summary:
      "Byte framing, baud generation, TX/RX with start/stop bits, and modular I/O.",
    duration: "~4–6 hrs",
    dialect: "systemverilog",
    concepts: ["baud-rate counter", "bit timing & mid-bit sampling", "start/stop framing", "1 start · 8 data · 1 stop frame", "loopback bridging"],
    lessons: [
      {
        slug: "uart-tx",
        title: "UART Transmitter",
        objective:
          "Serialize a byte into a start-bit / 8 data bits / stop-bit frame at a baud-rate enable.",
        practice: [
          "Build a baud generator that pulses an enable every N reference clocks.",
          "Serialize a byte with the baud enable; send LSb first inside the frame.",
          "Insert the start (0) and stop (1) bits and verify the full frame on the wire.",
          "Add an `busy` output and a `tx_en` handshake so the caller knows when the TX accepts data.",
        ],
        task: "Serialize a byte with start and stop bits at a baud-clock.",
        theory: {
          intro:
            "UART ships a byte one bit at a time, wrapped in a frame: start (0) + 8 data bits (LSb first) + stop (1). The recipient re-reads the timing; you just need a clock enable that ticks at the baud rate.",
          how:
            "A baud counter divides the reference clock down to one enable per bit period. The transmitter walks through the frame with a bit counter: pull the wire low for the start bit, shift the byte out low-first, pull high for the stop. An idle line sits high — that guarantee is what makes the falling edge of start detectable on the other end.",
          example: {
            code: `module uart_tx (
  input  logic clk, rst,
  input  logic baud_en,          // one pulse per bit period
  input  logic tx_en,            // handshake: start a frame
  input  logic [7:0] d,
  output logic tx, busy
);
  logic [3:0] bitcnt;
  logic [7:0] shreg;
  enum logic [1:0] { IDLE, SEND } st;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin st <= IDLE; tx <= 1'b1; busy <= 1'b0; end
    else begin
      case (st)
        IDLE: begin
          busy <= 1'b0; tx <= 1'b1;
          if (tx_en) begin
            st <= SEND; busy <= 1'b1;
            shreg <= d; bitcnt <= 4'd0; tx <= 1'b0; // start bit
          end
        end
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1; st <= IDLE;              // stop bit
          end else begin
            tx <= shreg[0]; shreg <= shreg >> 1; // LSb first
            bitcnt <= bitcnt + 1;
          end
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule`,
            note: "The idle-high line is the contract; the receiver's job in the next lesson is to detect the start falling edge and re-zero its own clock.",
          },
          watch: [
            "Naming a wire `tx_en` and the handshake `tx_en` is how handshakes collide — pick distinct, self-documenting names.",
            "A bit counter that never reaches its last state hangs the frame; assert the stop bit on the final count.",
            "Timing is a simulation concern: `#delays` need `--timing`; keep design files purely clocked and let testbenches own the delays.",
          ],
        },
      },
      {
        slug: "uart-rx",
        title: "UART Receiver",
        objective:
          "Sample the line at mid-bit, recover the byte, and flag framing errors.",
        practice: [
          "Detect the falling edge of the start bit and wait one half-bit before sampling.",
          "Sample each data bit at its midpoint using the baud enable.",
          "Reassemble the byte and check the stop bit; raise a framing-error flag if it is not high.",
          "Loop TX to RX and pass a byte-integrity self-test with `$display` per byte.",
        ],
        task: "Sample the line mid-bit and recover a byte with framing check.",
        theory: {
          intro:
            "The receiver is the mirror image: it watches the idle-high line for the start bit's falling edge, then samples every data bit at its midpoint, far from the transitions where the line changes.",
          how:
            "On the falling edge of start you wait half a bit so you land in the middle of the start bit; from then on one baud-enable per bit gets you to the middle of each data bit. Add the received bit to a shift register, check the stop bit is 1 when you expect it, and raise a framing-error flag if it isn't. Loop TX→RX and every byte must round-trip intact.",
          example: {
            code: `module uart_rx (
  input  logic clk, rst, baud_en, rx,
  output logic [7:0] dout,
  output logic ferr, rdy
);
  logic [3:0] bitcnt;
  logic [7:0] shreg;

  enum logic [2:0] { IDLE, START, BITS, STOP } st;

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin st <= IDLE; rdy <= 1'b0; ferr <= 1'b0; end
    else begin
      rdy <= 1'b0;
      case (st)
        IDLE: begin
          ferr <= 1'b0;
          if (!rx) st <= START;          // falling edge of start
        end
        START: if (baud_en) begin
          st <= BITS; bitcnt <= 4'd0;    // now centred in start bit
        end
        BITS: if (baud_en) begin
          shreg <= {rx, shreg[7:1]};     // MSb-first into a reversing
          bitcnt <= bitcnt + 1;          // shift => LSb recovered last
          if (bitcnt == 4'd7) st <= STOP;
        end
        STOP: if (baud_en) begin
          ferr <= ~rx;                   // stop bit must be high
          rdy  <= 1'b1; dout <= shreg;
          st   <= IDLE;
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule`,
            note: "Sampling one baud-enable after the start edge lands in each bit's middle — the classic mid-bit sampling trick.",
          },
          watch: [
            "Sampling on the edge instead of mid-bit makes noise near transitions corrupt bits — count, don't guess, the half-bit wait.",
            "Framing error is a real handshake flag, not a lint warning: assert it on a low stop bit, keep RX in a sane state (IDLE) afterwards.",
            "In the loopback PSet, drive both ends from the SAME baud_en and confirm byte integrity with `$display`, byte by byte.",
          ],
        },
      },
    ],
    pset: {
      slug: "uart-loopback",
      title: "UART Loopback Bridge",
      summary:
        "Loop bytes through TX wired to RX where a single baud_en input pulses once per baud tick (frame = start 0 + 8 data LSB-first + stop 1 = 10 ticks), busy blocks a mid-frame tx_en, and clean frames keep ferr low; ports: top(clk, rst, baud_en, tx_en, d_in, tx, busy, d_out, rdy, ferr).",
    },
  },
  {
    number: 15,
    slug: "risc-v-blocks",
    title: "RISC-V Blocks",
    summary:
      "PC mux, ALU datapath slices, and the interface discipline of a pipelined core.",
    duration: "~5–7 hrs",
    dialect: "systemverilog",
    concepts: ["RV32I basics", "PC+4 & branch target mux", "I/S/B/U immediate formats", "sign-extension", "datapath slice composition"],
    lessons: [
      {
        slug: "pc-datapath",
        title: "PC & Immediate Datapath",
        objective:
          "Generate the next PC and the sign-extended immediate for an RV32I slice, in SystemVerilog.",
        practice: [
          "Build the PC+4 increment and a branch-target mux under a `branch_taken` select.",
          "Extract the I-type immediate from a 32-bit instruction and sign-extend it.",
          "Add the S/B/U immediates; tabulate the bit positions from the RV32I manual.",
          "Combine the slices into a small fetch/decode datapath and drive it with a test instruction stream.",
        ],
        task: "Generate the next PC and sign-extended immediate for a basic core.",
        theory: {
          intro:
            "A processor is a datapath with a state machine wrapped around it. You already own every piece: the ALU (chapter 12) and the muxes; here you add the bookkeeper that produces the next address and every immediate.",
          how:
            "The PC is a register that normally advances by 4; on a taken branch it instead jumps to `PC + imm`, chosen by a mux under `branch_taken`. Immediates are fields extracted from the 32-bit instruction word and SIGN-extended to 32 bits — RV32I defines I, S, B, U each with its own bit positions (U puts the value in the top 20 bits). Practice: build each extractor and verify the border cases against the manual's diagram.",
          example: {
            code: `module pc_path (
  input  logic        clk, rst,
  input  logic        branch_taken,
  input  logic [31:0] pc_imm,       // branch target
  output logic [31:0] pc
);
  logic [31:0] pc_next;

  assign pc_next = branch_taken ? pc_imm : (pc + 32'd4);
  always_ff @(posedge clk or posedge rst) begin
    if (rst) pc <= 32'h0000_1000;   // typical reset vector
    else pc <= pc_next;
  end

  // I-type immediate: inst[31:20] sign-extended.
  // assign imm_i = {{20{inst[31]}}, inst[31:20]};
endmodule`,
            note: "Immediates are slices plus sign-extension — the exact `{{W{x[MSB]}}, x}` pattern from chapter 6, aimed at an instruction word.",
          },
          watch: [
            "Getting a bit position wrong by one column silently corrupts programs — tabulate I/S/B/U from the manual before coding.",
            "U-immediates occupy the TOP 20 bits: sign-extension doesn't apply, and `{inst[31:12], 12'b0}` is the LUI value.",
            "A branch mux wired the wrong way around produces infinite loops that lint fine — the testbench's instruction stream is your safety net.",
          ],
        },
      },
    ],
    pset: {
      slug: "core-datapath",
      title: "RISC-V Core Datapath",
      summary:
        "Completes the track: assemble the datapath blocks into a microcore that executes ADDI/SUB/BEQ/HALT and raises done at HALT; ports: top(clk, rst, pc, dbg, done).",
    },
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getLesson(chapterSlug: string, lessonSlug: string) {
  const chapter = getChapter(chapterSlug);
  const lesson = chapter?.lessons.find((l) => l.slug === lessonSlug);
  if (!chapter || !lesson) return undefined;
  return { chapter, lesson };
}

export function getPSet(chapterSlug: string, psetSlug: string) {
  const chapter = getChapter(chapterSlug);
  if (!chapter || chapter.pset.slug !== psetSlug) return undefined;
  return { chapter, pset: chapter.pset };
}

export function lessonOf(chapter: Chapter, index: number) {
  return chapter.lessons[index];
}