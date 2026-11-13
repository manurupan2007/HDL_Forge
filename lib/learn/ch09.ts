import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 9,
  chapterSlug: "counters",
  title: "Counters & Dividers",
  readMinutes: 25,
  youWillBeAbleTo: [
    "Say what state is in a circuit, and why a counter needs both a memory and a rule for the next value",
    "Hand-trace a 3-bit counting sequence and predict every value before you compile anything",
    "Write a free-running counter that advances on every rising clock edge",
    "Choose the width a modulo-N counter needs, and explain why N bits count to 2^N and not to N",
    "Wrap a counter at a modulus set by a `parameter`, and pulse a terminal-count flag at the last value",
    "Add enable, load and up/down control pins without ever gating the clock",
    "Derive a 50%-duty divide-by-K clock by toggling one bit every K/2 enabled rising edges",
  ],
  mentalModel: [
    {
      title: "A counter is state plus one rule",
      body: "Everything up to now was wires: a value flows in, a rule combines values, a value flows out. A counter is the first thing in this track that *remembers*. It has two parts and they are both small. The first part is its **state** — the number it is holding right now, stored in a register, the same register you met in chapter 8. The second part is its **transition rule** — how to work out the next state from the current one. That is it. There is no third part. Everything that follows in this chapter — wrapping at a modulus, counting down, pausing, dividing a clock — is the same two parts with a different transition rule bolted on. When a counter misbehaves, it is always one of the two that is wrong: the state was wrong, or the rule was wrong.",
    },
    {
      title: "The clock never stops; you decide whether it counts",
      body: "The clock edge is the heartbeat. It does not care what your counter is doing, it keeps arriving at the same steady rate forever. The tempting shortcut is to make the heartbeat conditional — only deliver an edge when you want a count. That is a trap, and chapter 9 spends a whole topic on why. The correct shape is the opposite: the clock always arrives, and *inside* the clocked block you test an `en` (enable) pin and skip the update if it is low. The edge is uniform; the counting is what you control. Hold this picture for the whole chapter, because the divider at the end is the same idea with a different rule attached.",
    },
  ],
  topics: [
    {
      slug: "what-is-state",
      title: "What a counter knows, and what it does next",
      lede: "Before any code: a counter remembers a number, and has one rule for the next number.",
      blocks: [
        {
          kind: "analogy",
          text: "The odometer in a car is a counter. It shows a number, and it holds that number until something happens. The number on the glass is its *state* — the thing it remembers right now. The mechanism behind the glass is a *transition rule*: add one, and if you run off the end, come back to the start. The drive cable is the tick, and one pull of the cable is one rising edge. The odometer does not measure time. It counts pulls, and it has no idea how long a pull takes.",
        },
        {
          kind: "analogy",
          text: "Or think of a doorman with a number board, counting people through a door. The board shows 0. Somebody walks through, so the board says 1. Somebody walks through, so 2, then 3. The rule for the last number is written on the board next to the doorman: after 3, wipe it and start at 0 again. Nobody in the queue knows what the board said ten minutes ago. They only ever need to know one thing — what it says now. That is the whole mental model of a sequential circuit, and a counter is the smallest one that exists.",
        },
        {
          kind: "define",
          items: [
            { term: "state", meaning: "The value a circuit is holding right now. In a counter it is the current count." },
            { term: "register", meaning: "The bit or bits that hold the state. In Verilog you declare it with `reg` and update it inside an `always @(posedge clk)` block." },
            { term: "transition rule", meaning: "The rule that turns the current state into the next one." },
            { term: "rising edge", meaning: "The instant a clock wire goes from 0 to 1. Written `posedge clk` in Verilog. One edge = one tick." },
          ],
        },
        {
          kind: "para",
          text: "Here is the base case, and it is worth being precise about it. Take a register 3 bits wide, so it can hold 0 to 7. Give it the rule \"add one\". Now add one to 7 and you get 8, which does not fit in 3 bits. There is nowhere for the extra bit to go, so it falls off the end and the register reads 0 again. Nobody wrote a reset rule. The width forced one. This is *wrapping*, and it is not a special feature — it is the only thing a fixed number of bits can do.",
        },
        {
          kind: "table",
          head: ["Rising edges so far", "count[2] count[1] count[0]", "Decimal"],
          rows: [
            ["0 (just after reset)", "0 0 0", "0"],
            ["1", "0 0 1", "1"],
            ["2", "0 1 0", "2"],
            ["3", "0 1 1", "3"],
            ["4", "1 0 0", "4"],
            ["5", "1 0 1", "5"],
            ["6", "1 1 0", "6"],
            ["7", "1 1 1", "7"],
            ["8 — wraps", "0 0 0", "0"],
          ],
          caption:
            "Eight rising edges and you are back where you started. That is the entire behaviour of a 3-bit counter: eight states, one per edge, and no other rule at all.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Verilog gives you the add for free — write it out anyway",
          text: "The rule \"add one\" is one character pair in Verilog: `count + 1'b1`. You will not need to work out binary carries by hand. But trace the table above on paper once before you type it, for two reasons. First, it is the fastest way to convince yourself that a counter counts *up* and not down, and how it wraps, and that 7 is followed by 0 and not by 8. Second, when a counter does the wrong thing later in the track, you will want this table in your head to argue with the simulator. Understanding the trace is what lets you predict instead of guessing.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw three boxes in a row and label them count[2], count[1], count[0]. All three low.",
            "Now write the rule you are about to use: \"on each rising edge, add one\".",
            "Apply the rule eight times, filling in the three boxes after each step. Do not compute anything in your head — just fill them in.",
            "At step 8 confirm you have written 0 0 0 again, and say out loud why: 111 plus one has a carry that leaves the top of the register, and the register is only 3 bits wide.",
            "Now extend the drawing to 4 boxes and write out the first ten values of that sequence. Confirm you reach 1 0 0 0 at step 9, which is decimal 16.",
            "Write down, in one sentence, the rule connecting the width of a register to how high it counts before it wraps.",
          ],
        },
      ],
    },
    {
      slug: "first-counter",
      title: "Writing your first counter",
      lede: "A counter is a register plus one line of arithmetic, inside an always block that fires on the clock edge.",
      blocks: [
        {
          kind: "para",
          text: "Chapter 8 gave you the shape of a clocked block: `always @(posedge clk)` and the nonblocking assignment `<=`. This is the first design that uses that shape for something you can see working. Here is the whole thing. Read it as a whole first, then we will take it apart line by line.",
        },
        {
          kind: "code",
          caption:
            "A 4-bit counter that advances by one on every rising edge of `clk`, but only while `en` is high.",
          code: `module counter_free (
  input  wire       clk,
  input  wire       rst_n,
  input  wire       en,
  output reg  [3:0] count
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)  count <= 4'b0000;
    else if (en) count <= count + 1'b1;
  end
endmodule`,
          note: "There is no `else` on the outside. When `en` is low, nothing in the block assigns `count`, and a register that is not assigned simply keeps the value it had. That is how you hold still without writing `else count <= count;`.",
        },
        {
          kind: "steps",
          title: "Read it line by line",
          items: [
            {
              head: "`input wire clk, rst_n, en`",
              body: "Three one-bit pins coming in. `clk` is the heartbeat, `rst_n` is the reset — active low, so `!rst_n` means the reset is being held down — and `en` is the enable that decides whether this edge counts.",
            },
            {
              head: "`output reg [3:0] count`",
              body: "The state. Four bits, so 0 to 15. The word `reg` is required here and was not required in chapter 1 — a signal assigned inside an `always` block must be declared `reg`, because the tool has to know it is storage and not just a wire.",
            },
            {
              head: "`always @(posedge clk or negedge rst_n)`",
              body: "This block wakes on a rising clock edge or on a falling reset edge (the moment `rst_n` goes to 0). The `or` in the list is what makes the reset *asynchronous*: reset does not wait for a clock edge, it takes effect the moment it is asserted. You met this form in chapter 8; nothing new here.",
            },
            {
              head: "`if (!rst_n) count <= 4'b0000;`",
              body: "Reset wins over everything. This is the first `if` in the block, so it is checked first, and if it is true nothing below it runs.",
            },
            {
              head: "`else if (en) count <= count + 1'b1;`",
              body: "The transition rule. Only if reset is released (`rst_n` is high) *and* `en` is high does the state change. The `1'b1` is a one-bit literal, so the addition happens at 4 bits and wraps at 15 back to 0. Writing a bare `1` leaves the width up to the tool's 32-bit default instead — see the traps below for why the width matters the moment the sum is compared rather than stored.",
            },
            {
              head: "The missing `else`",
              body: "If `en` is low, no branch fires, so `count` is not assigned. In Verilog that means it keeps its old value. This is not an oversight to fix; it is the idiomatic way to write an enable.",
            },
          ],
        },
        {
          kind: "para",
          text: "Before reset is asserted, `count` holds `x` — the unknown value from chapter 1. The simulator starts every register at `x`, and `x + 1` is `x`, so a counter with no reset stays unknown forever. That is why the reset line is not decoration. It is the thing that puts the machine into a known starting state, and it is the first thing to check when a counter reads `x` in simulation.",
        },
        {
          kind: "trap",
          wrong: "`always @(posedge clk) count = count + 1'b1;` — a plain `=` inside a clocked block.",
          right: "`always @(posedge clk) count <= count + 1'b1;`",
          why: "This one does not error and often appears to work, which is what makes it dangerous. Nonblocking `<=` means every statement in the block reads the *old* values; blocking `=` means later statements read values just written. In a block that writes one register it happens to give the same answer. As soon as you write a block that writes two registers which read each other, blocking assignments produce a result that depends on the order the lines happen to be in, and Verilator reports it as BLKSEQ. Use `<=` in every clocked block and you will never have to think about it.",
        },
        {
          kind: "trap",
          wrong: "`count <= count + 1;` with a bare `1`, and comparing `count + 1 == 0` to spot the wrap.",
          right: "`count <= count + 1'b1;` so the addition happens at the register's own width.",
          why: "A bare `1` is a 32-bit integer. So `count + 1` is computed as 32 bits and then truncated back to 4. For a plain add the truncated answer is the same, so you get away with it. But the moment the widened result is *compared* rather than stored, the truncation never happens: at `count == 15`, `count + 1` is 32-bit sixteen, and `== 0` is false. Write the wrap test against the modulus, and size the literal.",
        },
        {
          kind: "check",
          items: [
            {
              q: "With the module above, `rst_n` high (reset released), `en` high, and `count` currently `4'd9`. What is `count` immediately after the next rising edge, and what is it one edge after that?",
              a: "First edge: 9 + 1 = 10, so `4'd10`. Second edge: 10 + 1 = 11, so `4'd11`. A plain 4-bit counter has no opinion about 9 being special — it counts straight through to 15 and only wraps when it gets there. Making 9 the last value is the subject of the next topic.",
            },
            {
              q: "Same module, but `en` is low for three consecutive rising edges. What happens to `count`?",
              a: "Nothing. `rst_n` is high so the first branch is skipped, and `en` is low so the second is skipped too. No branch fires, `count` is never assigned, and a register that is not assigned keeps its value. The clock edges still happen — three of them — the counter just declines to move.",
            },
          ],
        },
      ],
    },
    {
      slug: "modulo-n",
      title: "Counting to a number you choose",
      lede: "Modulo-N counting stops at N-1 and returns to 0, and the width you declared is the part that bites.",
      blocks: [
        {
          kind: "para",
          text: "A 4-bit counting register does not stop at 10. It goes 0, 1, 2 … all the way to 15 and wraps. If you want it to stop at 9, you have to say so. That is the entire idea of a *modulo-N counter*: a counter whose rule is not \"add one forever\" but \"add one, and when you reach N-1, go back to 0\". Counting to N means N distinct values, 0 through N-1, and the wrap is what makes it repeat.",
        },
        {
          kind: "code",
          caption:
            "The same 4-bit counter, but the rule now says 9 is the last value and 0 comes next. That is a modulo-10 counter.",
          code: `module counter_mod10 (
  input  wire       clk,
  input  wire       rst_n,
  input  wire       en,
  output reg  [3:0] count
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= 4'b0000;
    else if (en) begin
      if (count == 4'd9) count <= 4'b0000;   // 9 is the last value; wrap to 0
      else                count <= count + 1'b1;
    end
  end
endmodule`,
          note: "One extra `if` and one extra line. That is the whole difference between a free-running counter and a modulo-10 one.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "N bits count to 2^N, not to N",
          text: "This is the mistake that costs the most time in this chapter. You asked for a modulo-10 counter, so you need the values 0 to 9. Those need four bits, because three bits only reach 7. The general rule: a register of W bits holds 2^W distinct values, so a modulo-N counter needs the narrowest W with 2^W ≥ N. For N = 10 that is W = 4, because 2^3 = 8 is too small and 2^4 = 16 is enough. Pick the width from N, never from the shape of the number. This chapter uses Verilog-2001, which has no built-in function that works out that width for you, so you do it by hand. (SystemVerilog has one called `$clog2`; you will meet it later in the track.)",
        },
        {
          kind: "table",
          head: ["Modulus N you want", "Narrowest width W", "Why", "Does it fit?"],
          rows: [
            ["2", "1", "2¹ = 2", "yes — 0, 1"],
            ["8", "3", "2³ = 8", "yes — 0 to 7"],
            ["9", "4", "2³ = 8 is one short, 2⁴ = 16 works", "yes, but only in 4 bits"],
            ["10", "4", "2⁴ = 16", "yes — 0 to 9, with 10, 11 … 15 unused"],
            ["16", "4", "2⁴ = 16", "yes — 0 to 15, nothing unused"],
            ["17", "5", "2⁴ = 16 is one short, 2⁵ = 32 works", "yes, in 5 bits"],
          ],
          caption:
            "The unused values in the last row of the middle block are the tell. A 4-bit register counting 0 to 9 can physically hold 15, and the six values 10 to 15 are simply never reached, because the wrap rule jumps over them.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Wrap is not a bug, and it is not saturation",
          text: "Beginners often expect a counter that has reached its limit to sit there and stay at 9, 9, 9, 9. That behaviour is called *saturation*, and it is a different, perfectly reasonable design — but it is not what a plain register can do, because the bits are physical. Seven plus one in three bits is zero. If you want saturation you must write it: when the count is at the limit, hold it instead of wrapping. The default, and what this chapter builds, is wrap.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Draw a 4-bit register and the rule \"if count is 9, go to 0; otherwise add one\". Start at 0.",
            "Write the value after each of the first twelve rising edges. You should see 1, 2, 3 … 9, 0, 1, 2.",
            "Count the distinct values in that trace. Confirm it is 10, and that 10 through 15 never appear.",
            "Now find the narrowest width for a modulo-6 counter. Work out 2², 2³, 2⁴ and pick the first one that is 6 or more.",
            "Repeat for modulo-16 and for modulo-17. For 16, note whether any value in the register is unreachable.",
            "Now the hard one: a modulo-100 counter. 2⁶ = 64 and 2⁷ = 128, so the width is 7. Write the 7 place values (64 32 16 8 4 2 1) and check that 99 fits, since 64 + 32 + 2 + 1 = 99.",
            "Finally, write the wrap line of Verilog for the modulo-100 counter, using a 7-bit declaration. Write the comparison value as a 7-bit literal so it is obviously the same width as the register.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing the wrap test as `if (count + 1 == 0) count <= 4'b0000;`",
          right: "Test the count itself against a literal: `if (count == 4'd9) count <= 4'b0000;`",
          why: "The `+ 1` is evaluated at 32 bits before the `==` runs, so at the top of the range the sum is 16, not 0, and the test never fires. The deeper problem is that the rule is indirect: comparing the count against the last value says what you mean directly, and there is no arithmetic to get the width wrong.",
        },
        {
          kind: "trap",
          wrong: "Writing the last value as `N` instead of `N - 1`: `if (count == 4'd10) count <= 4'b0000;`",
          right: "A modulo-10 counter compares against 9, its tenth value.",
          why: "A counter that counts 0, 1 … 10 has eleven values, not ten. The off-by-one is easy to miss because the waveform still rises and falls and looks plausible. Write the sentence \"0 through N-1 is N values\" next to the code and the off-by-one stops being possible.",
        },
      ],
    },
    {
      slug: "parameters",
      title: "One counter, any modulus",
      lede: "A `parameter` is a number you can change without editing the body of the module.",
      blocks: [
        {
          kind: "para",
          text: "Hard-coding `4'd9` works for exactly one modulus. Change the module so it counts to 249 for a millisecond timer, and you are editing code that is supposed to stay the same. A *parameter* fixes that: it is a named constant that lives in the module's header, is used in the body wherever the number is needed, and can be set to a different value by whoever instantiates the module. One module body, any width, any modulus.",
        },
        {
          kind: "code",
          caption:
            "The modulo-N counter again, but the width and the modulus are now named. The body says `N - 1` and `{W{1'b0}}` and never says 4 or 10.",
          code: `module counter_mod #(
  parameter W = 4,
  parameter N = 10
)(
  input  wire         clk,
  input  wire         rst_n,
  input  wire         en,
  output reg  [W-1:0] count
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= {W{1'b0}};
    else if (en) begin
      if (count == N - 1) count <= {W{1'b0}};
      else                count <= count + 1'b1;
    end
  end
endmodule`,
          note: "The `#( ... )` block after the module name is the parameter port list. It is new syntax in this chapter, and it is worth ten seconds of attention: everything inside those parentheses is a named constant with a default value, and it becomes visible to the body of the module as if you had typed it at the top.",
        },
        {
          kind: "code",
          caption: "Setting the parameters at the point of use. The dot before each name says which one you are setting, so the order does not matter.",
          code: `// A 4-bit counter that counts 0 through 9 and wraps.
counter_mod #(.W(4), .N(10)) u_count (
  .clk  (clk),
  .rst_n(rst_n),
  .en   (en),
  .count(count)
);`,
          note: "You can also write `#(4, 10)` positionally — first parameter first — but the named form survives someone reordering the parameter list, so use it. The `u_count` after the parameter list is the *instance name*: a label for this particular copy of the module inside your design.",
        },
        {
          kind: "para",
          text: "Two new pieces of syntax hide in `{W{1'b0}}`. The inner `{1'b0}` is one bit, low. The outer braces with a number in front — `W` copies of it — is called *replication*, and it builds a W-bit value that is all zeros. It is how you write \"the same bit, this many times\", which is exactly what you want for both clearing a counter and writing a number as wide as the register. It is worth using everywhere the width comes from a parameter, because then the literal can never disagree with the port declaration.",
        },
        {
          kind: "points",
          title: "Why a parameter and not a literal",
          items: [
            "One edit. Change `N = 10` to `N = 250` in one place and every comparison in the body follows.",
            "The port list and the arithmetic cannot drift apart, because both refer to the same `W`.",
            "Two instances, two moduli. A 4-bit modulo-10 and an 8-bit modulo-250 can live in the same design, side by side, from one module body.",
            "The number of states is stated once, at the top, where a reader can see it — instead of being sprinkled through the code as 4'd9, 4'b0000 and [3:0].",
          ],
        },
        {
          kind: "trap",
          wrong: "Declaring `parameter W = 4` and then writing the port as `output reg [3:0] count;`.",
          right: "`output reg [W-1:0] count;` — use the parameter in the port list too.",
          why: "The parameter is declared, so the code looks parameterised, but the comparison in the body now mixes the 32-bit `N - 1` with a 4-bit register, and if you then set `N = 250` the module still has only 4 bits of state: the counter physically cannot reach 249, so the wrap test can never be true and it stops at 15. The failure is silent and it looks like a logic bug.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You write `counter_mod #(.W(8), .N(200))` and nothing else. Is 2^8 ≥ 200, and will the counter reach 199?",
              a: "Yes: 2⁸ = 256, and 256 ≥ 200, so an 8-bit register can hold every value 0 to 199. The counter will reach 199 and then wrap. If you had asked for N = 300 the answer would be no — 256 < 300, the register cannot hold 299, and the wrap test would never fire. Always check 2^W ≥ N before you pick W.",
            },
            {
              q: "What is `{4{1'b1}}`, and why would you write it in a counter?",
              a: "Four copies of the bit `1`, so it is `4'b1111`, the value 15. In a counter you would use it to hold the register at its maximum, or to write the largest value a given width can take when you need a specific width-agnostic constant.",
            },
          ],
        },
      ],
    },
    {
      slug: "terminal-count",
      title: "Terminal count: saying \"that was the last one\"",
      lede: "A `tc` output goes high for exactly one cycle when the count reaches its limit, and it should be read straight off the count.",
      blocks: [
        {
          kind: "para",
          text: "A counter that counts 0 to 9 and wraps is fine, but it leaves the rest of the design with a question: how do I know the period just ended? Polling for a particular value is possible and awkward. Much better is a dedicated output that is high for exactly one clock cycle at the end of each pass. That is the *terminal count* flag, conventionally called `tc`. Its whole contract is one sentence: `tc` is high if and only if the count currently equals N-1. Because the count holds that value for a full clock period, `tc` is high for a full clock period — one clean window, not a momentary spike.",
        },
        {
          kind: "code",
          caption:
            "The complete modulo-N counter. A correct starting point for the lesson's bench `top (clk, rst_n, en, count, tc)`: the same ports and the same wrap-at-N, pulse-at-N-1 rule the lesson checks.",
          code: `module counter #(
  parameter W = 4, N = 10
)(
  input  wire clk, rst_n, en,
  output reg  [W-1:0] count,
  output wire         tc
);
  assign tc = (count == N - 1);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) count <= {W{1'b0}};
    else if (en) begin
      if (count == N-1) count <= {W{1'b0}};   // wrap at modulus
      else count <= count + 1'b1;
    end
  end
endmodule`,
          note: "Two things are worth noticing. First, `tc` is a plain `assign`, sitting outside the `always` block — it is combinational, a question asked of the count right now, not a thing that gets stored. Second, every literal is sized to the register: `{W{1'b0}}` for zero and `1'b1` for the increment, so the arithmetic happens at the counter's own width instead of the tool's 32-bit default. Width mixing that does bite is reported as WIDTHTRUNC or WIDTHEXPAND; keeping both sides the same width is the habit that keeps it away.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why `tc` must not be a stored flag",
          text: "It is tempting to add `tc` to the register and set it inside the clocked block. Do not. If `tc` is stored, the flag is assigned at the same edge that changes the count, so it goes high one clock cycle *after* the count reached the limit. Everything downstream then reacts to the wrong cycle, and the bug shows up as a one-cycle offset that is tedious to find. Read the flag off the count combinationally and it is correct by construction, because the answer to \"is the count at its last value?\" is a fact about the count, not an event that has to be remembered.",
        },
        {
          kind: "table",
          head: ["Rising edges so far", "count", "tc"],
          rows: [
            ["1", "0", "0"],
            ["2", "1", "0"],
            ["3", "2", "0"],
            ["4", "3", "0"],
            ["5", "4", "0"],
            ["6", "5", "0"],
            ["7", "6", "0"],
            ["8", "7", "0"],
            ["9", "8", "0"],
            ["10", "9", "1 — the last value"],
            ["11", "0", "0 — wrapped"],
            ["12", "1", "0"],
          ],
          caption:
            "One high sample out of ten. `tc` is a single-cycle pulse, and the count it flags is the last value before the wrap, not the zero that follows it.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "A parameter is 32 bits wide, and Verilator says so",
          text: "An un-ranged `parameter N = 10` is a 32-bit integer, so `count == N - 1` compares a 4-bit register with a wider value. The answer is still correct — the tool pads the 4-bit count with zeros on the left, and count is only ever 0 to 9, so nothing is lost — but the two sides of a comparison should match widths by habit, not by luck. Width mismatches that do matter are reported as WIDTHEXPAND or WIDTHTRUNC; mismatches that happen to be harmless can pass without a word, which is exactly why the fix is a habit rather than a response to a warning. Give the parameter an explicit range, or size the value you compare against.",
        },
        {
          kind: "trap",
          wrong: "`assign tc = (count == N);` — flagging the count N instead of the last value.",
          right: "`assign tc = (count == N - 1);`",
          why: "With this line the flag never fires: the count goes to N-1, then wraps to 0, so it is never equal to N. The counter itself still works, which is what makes it confusing — the output you added is simply always low. If a flag never pulses, check its off-by-one first, before you check anything else.",
        },
        {
          kind: "check",
          items: [
            {
              q: "For a modulo-10 counter, how many clock cycles in each ten does `tc` sit high, and at which count value?",
              a: "One, at `count == 9`. It is high for the whole time the count is 9, which is one clock period, and low for the other nine. That makes it a pulse rather than a level, which is what lets downstream logic use it as an event.",
            },
            {
              q: "You set `en` low for five cycles while the count sits at 9. Does `tc` stay high for those five cycles?",
              a: "Yes, and that is the right behaviour. `tc` is combinational from the count, and the count is not changing because `en` is low, so the count is still 9 and `tc` is still high. If you need a pulse that is exactly one clock wide regardless of the enable, say so in the interface — do not get it by accident.",
            },
          ],
        },
      ],
    },
    {
      slug: "enable-load-and-direction",
      title: "Enable, load, and counting down",
      lede: "Three more pins turn a counting machine into something you can steer, and none of them touches the clock.",
      blocks: [
        {
          kind: "para",
          text: "A counter that always runs is a curiosity. What makes one useful is control: let it start, let it stop, let it begin from a value you chose, let it run backwards. Each of those is a pin. The important structural fact is that **all of them are tested inside the clocked block** — they never change what the clock does, only what the block does when the clock arrives.",
        },
        {
          kind: "code",
          caption:
            "The complete controlled counter: reset, load, enable, and a choice of direction, with a terminal-count flag.",
          code: `module counter_ctrl #(
  parameter W = 4,
  parameter N = 10
)(
  input  wire           clk,
  input  wire           rst_n,
  input  wire           en,
  input  wire           load,
  input  wire           up_dn,
  input  wire [W-1:0]   load_value,
  output reg  [W-1:0]   count,
  output wire           tc
);
  assign tc = (count == N - 1);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)    count <= {W{1'b0}};
    else if (load) count <= load_value;
    else if (en) begin
      if (up_dn) begin
        if (count == N - 1) count <= {W{1'b0}};
        else                  count <= count + 1'b1;
      end else begin
        if (count == 0)      count <= N - 1;
        else                  count <= count - 1'b1;
      end
    end
  end
endmodule`,
          note: "Read the order of the `if`s as a priority list: reset beats load, load beats the enable, and the enable is where counting actually happens. Only the first matching branch runs.",
        },
        {
          kind: "table",
          head: ["rst_n", "load", "en", "What the count does on this rising edge"],
          rows: [
            ["0", "x", "x", "goes to 0 — reset always wins (active low)"],
            ["1", "1", "x", "takes load_value — a load does not need the enable"],
            ["1", "0", "1", "counts up or down by one, wrapping at the ends"],
            ["1", "0", "0", "holds where it is"],
          ],
          caption:
            "Four rows, and the module is fully specified. The order of the branches is the whole priority scheme — there is no other logic to check.",
        },
        {
          kind: "para",
          text: "Counting down needs its own wrap. Upwards, the rule is \"at N-1, go to 0\". Downwards it is the mirror image: \"at 0, go to N-1\". The `up_dn` pin — the up/down enable — picks which rule applies, and it is read inside the same clocked block, so flipping it costs nothing and creates no timing problem. Note that the down direction also produces a `tc` at the top: if you want the flag to mean \"the count is at an end, whichever end\", write `tc = (count == N-1) | (count == 0)`.",
        },
        {
          kind: "trap",
          wrong: "Gating the clock: `assign gated_clk = en && clk;` and then using `gated_clk` in the `always` block.",
          right: "Keep `always @(posedge clk)` and put `if (en)` inside it.",
          why: "This is the single most common structural mistake in counters, and it is wrong in a way that simulation mostly forgives and real hardware does not. The AND gate puts a delay in the clock path, so the derived edge arrives later than the real edge and later by a different amount depending on which other gates are in the path. That is clock skew on a control signal pretending to be a clock, and it also makes the clock depend on a data signal. Keep the enable in the data path — one mux, no new edges — and keep every flip-flop on the one real clock. If a gated clock *does* close a purely combinational loop (an enable that feeds back from logic the same block drives), that is the class of bug Verilator reports as UNOPTFLAT; if anything else also drives the wire, it reports MULTIDRIVEN.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Clock generation belongs in the testbench",
          text: "The related habit: do not write a clock inside a design file. A design module's `clk` pin arrives from outside, driven by the testbench or by an on-chip oscillator block. The moment you put `always #5 clk = ~clk;` inside a design file you have fused simulation time into the design, and the file no longer means what it says. The pattern is a rule, not a preference: design files describe hardware, testbench files describe the world the hardware sits in.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Take the controlled counter with W = 4 and N = 10. Start with `count = 0`, `rst_n` high (reset released).",
            "Set `load` high with `load_value = 7` for one rising edge. Write the new count. Then set `load` low.",
            "Set `up_dn = 1` and `en = 1`. Write the count after each of the next three rising edges. You should get 8, 9, then 0.",
            "At the moment the count is 9, write the value of `tc`. One edge later, after the wrap, write `tc` again.",
            "Now set `up_dn = 0` and keep `en = 1`. Write the count after each of the next four rising edges, starting from 0. You should get 9, 8, 7, 6.",
            "Set `en = 0` for three rising edges. Write the count after each one. Then set `en = 1` and write the count after the next one.",
            "Finally, pull `rst_n` low while the count is 6. Write what the count is immediately — before any clock edge at all — and confirm that is why the reset is called asynchronous. Remember the reset is active low, so 0 is the asserting value.",
          ],
        },
      ],
    },
    {
      slug: "toggle-divider",
      title: "Dividing a clock: the one-bit counter",
      lede: "A divider is a counter whose answer is a single bit, and the simplest one divides by two without counting at all.",
      blocks: [
        {
          kind: "analogy",
          text: "Somebody is pacing back and forth between two walls. Every step takes them to the other wall. The time from one wall to the other and back is one full cycle, and each leg is a half cycle. If the floor vibrates once per second and they take one step per vibration, they are pacing at half the vibration rate. Which wall they are nearest at any moment is a single bit, and that bit *is* the divided clock. Nobody is counting steps. They are just changing direction, and the count of steps between turns is the half period.",
        },
        {
          kind: "para",
          text: "Look at a 1-bit register with the rule \"flip me\". One bit has two values, so it alternates 0, 1, 0, 1. Each flip takes one clock edge. A full cycle — 0 through 1 and back to 0 — takes two edges. So the output has a *period* of two input clock cycles, which means it runs at half the input frequency. A flip-flop with no data input, wired to invert its own output, is a divide-by-2 clock, and it is the only divider you need to understand first because every other divider is this one plus a counter.",
        },
        {
          kind: "code",
          caption: "Divide by 2. Four lines, no counter, no parameters.",
          code: `module div_by_2 (
  input  wire clk,
  input  wire rst_n,
  output reg  div2
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) div2 <= 1'b0;
    else        div2 <= ~div2;
  end
endmodule`,
          note: "`~div2` reads the current value and inverts it. Because the read and the write are both nonblocking, the output never glitches between the two values — it changes once per edge, on the edge, exactly as a clock should.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Duty cycle, and why a toggle gives you 50% for free",
          text: "The *duty cycle* of a signal is the fraction of its period that it is high. A 50%-duty signal is high for exactly half its period and low for the other half. A divider that toggles after a fixed number of input clocks gets this for nothing: it spends exactly that many input clocks high and exactly that many low, so high time equals low time no matter what the divide ratio is. That is why the toggle is the standard way to make a slow clock. The obvious alternative — comparing the counter against a threshold, `assign clk_out = (cnt < K/2);` — only gives 50% when K is even, and its output is a combinational function of a counter that is itself changing, so a carry ripple can produce a runt pulse a fraction of a clock wide. The toggle has no such edge case.",
        },
        {
          kind: "para",
          text: "Now the bridge to everything you have built so far. A counter that goes 0, 1, 2 … up to N-1 and then wraps to 0 spends exactly N edges in each of its N states. If you take a bit of that counter as your clock — specifically, if you look at the bit that flips half way through — you have divided by 2N. That is the whole relationship: **a modulo-N counter is a half-period counter, and its output clock runs at f / 2N**. The counter you wrote in the last topics is not a detour on the way to a divider. It is the divider.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw eight rising edges as eight vertical marks on a line, evenly spaced, and label them 1 to 8.",
            "Above the line, write the value of `div2` as it stands just after each edge. Start at 0 after reset.",
            "Confirm the pattern: 0 for edges 1, 2, 3, 4 and 1 for edges 5, 6, 7, 8 — the check is the *change* points, at 1 and at 5.",
            "Mark every edge where the value changed. There should be exactly one change every two input edges.",
            "Count the edges in one full cycle of the divided signal, low-to-low or high-to-high. You should get 2, so the period is 2 input clocks and the frequency is f/2.",
            "Now ask the same question with `en` low for edges 3 and 4. Write the values and confirm the output simply stands still for those two edges rather than going slow. That is the honest behaviour of an enabled divider, and it is worth knowing before you rely on one.",
          ],
        },
      ],
    },
    {
      slug: "dividing-by-n",
      title: "Dividing by K, worked out on paper",
      lede: "How many edges make a half period, what the counter compares against, and what the output does over twenty clocks.",
      blocks: [
        {
          kind: "para",
          text: "A divide-by-K clock must be low for K/2 input clocks and high for K/2 of them. That is what 50% duty means, and it fixes the design: the output has to flip once every K/2 enabled rising edges. So build a counter that reaches N-1 after N edges with N = K/2, and toggle the output when it does. The compare is against the *last* value, which is the same off-by-one from the modulo counter — the counter is done counting at N-1, so that is the edge on which the output flips.",
        },
        {
          kind: "steps",
          title: "Derive a divide-by-10 from nothing",
          items: [
            {
              head: "Write down what the output must do",
              body: "Divide by 10 means one full cycle of the output takes 10 input clock cycles, and 50% duty splits that into 5 low and 5 high. So the output changes value every 5 input cycles.",
            },
            {
              head: "Turn 5 into a modulus",
              body: "The counter must count 0, 1, 2, 3, 4 and then wrap — 5 states, so N = 5, and the last value is N-1 = 4. This is exactly the modulo-5 counter from the previous topics.",
            },
            {
              head: "Check the width",
              body: "2² = 4 is too small, 2³ = 8 is enough, so the half-period counter needs 3 bits. It holds 0 to 7 and only ever uses 0 to 4.",
            },
            {
              head: "Write the toggle",
              body: "When the count is 4, reset the count to 0 *and* flip the output. Otherwise advance the count by one and leave the output alone. One counter, one bit of output, and the output changes exactly once per 5 edges.",
            },
            {
              head: "Check the very first edge",
              body: "With the count at 0 and the output at 0 after reset, the first edge sets the count to 1 and does not touch the output. The output is still low. If your output changes on the first edge, the comparison is off by one — that is the check that catches it fastest.",
            },
            {
              head: "Count the period",
              body: "The output goes high on edge 5, low on edge 10, high on edge 15, low on edge 20. One high plus one low is 10 input cycles, so the output frequency is f/10 and the duty is 5 out of 10. Both requirements are met.",
            },
          ],
        },
        {
          kind: "code",
          caption:
            "The general divider: toggle the output every HALF enabled rising edges. One module covers every divide-by-2·HALF.",
          code: `module clock_divider #(
  parameter HALF = 4
)(
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  output reg  clk_out
);
  reg [1:0] hcnt;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      hcnt    <= 2'd0;
      clk_out <= 1'b0;
    end else if (en) begin
      if (hcnt == HALF - 1) begin
        hcnt    <= 2'd0;
        clk_out <= ~clk_out;
      end else begin
        hcnt <= hcnt + 2'd1;
      end
    end
  end
endmodule`,
          note: "This is a divide-by-8 as written, because 2 bits hold 0 to 3 and `HALF - 1` is 3. The reusable part is the shape: a half-period counter, a compare against HALF-1, and a toggle. Set HALF = 5 and it divides by 10. If you need a larger HALF, widen `hcnt` to match — 2 bits covers HALF up to 4, 3 bits up to 8, and so on, which is the same 2^W ≥ N rule as before.",
        },
        {
          kind: "table",
          head: ["You want", "HALF", "Compare against", "Output period", "Output frequency"],
          rows: [
            ["divide by 2", "1", "hcnt == 0", "2 clocks", "f / 2"],
            ["divide by 4", "2", "hcnt == 1", "4 clocks", "f / 4"],
            ["divide by 8", "4", "hcnt == 3", "8 clocks", "f / 8"],
            ["divide by 10", "5", "hcnt == 4", "10 clocks", "f / 10"],
            ["divide by 16", "8", "hcnt == 7", "16 clocks", "f / 16"],
          ],
          caption:
            "The pattern in the third column is the one to remember: the compare is always HALF minus one, because the counter is already at its last value when the output must change.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (15 minutes) — the divide-by-10 trace",
          items: [
            "Set HALF = 5. Draw a table with three columns: rising edge number, hcnt just after that edge, clk_out just after that edge.",
            "Start after reset with hcnt = 0 and clk_out = 0, then fill in rows 1 to 20.",
            "The output should change on exactly four of those twenty edges. Write down which ones.",
            "Count how many rows the output spends high. It should be five, and then five low, and then five high again. Write down where each run ends.",
            "Now state the period in input clock cycles, and the output frequency as a fraction of the input frequency.",
            "Finally, work out the duty cycle as a fraction, and confirm the high time and the low time are equal.",
          ],
        },
        {
          kind: "code",
          caption:
            "The divide-by-8 with a free phase output — the shape the problem set's bench expects: `top (clk, rst_n, en, clk_out, phase)` with K = 8 (HALF = 4) and `phase` walking 0 to 7. The phase is just the toggle bit above the half-count.",
          code: `module clock_divider #(
  parameter HALF = 4
)(
  input  wire       clk,
  input  wire       rst_n,
  input  wire       en,
  output reg        clk_out,
  output wire [2:0] phase
);
  reg [1:0] hcnt;

  assign phase = {clk_out, hcnt};

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      hcnt    <= 2'd0;
      clk_out <= 1'b0;
    end else if (en) begin
      if (hcnt == HALF - 1) begin
        hcnt    <= 2'd0;
        clk_out <= ~clk_out;
      end else begin
        hcnt <= hcnt + 2'd1;
      end
    end
  end
endmodule`,
          note: "With HALF = 4, phase walks 0, 1, 2, 3, 4, 5, 6, 7 and starts again, and `clk_out` is simply the top bit of phase: low for phase 0 to 3, high for phase 4 to 7. So the phase output is not an extra feature you have to compute — it falls out of gluing the toggle bit to the top of the half-count, and once you can see that, the divider is done.",
        },
        {
          kind: "trap",
          wrong: "`if (hcnt == HALF) begin` — comparing against HALF instead of HALF - 1.",
          right: "`if (hcnt == HALF - 1) begin`",
          why: "The counter reaches HALF-1 on the HALFth edge, so that is the edge on which the output must change. Comparing against HALF means the output waits one edge too long: the period becomes 2·(HALF+1) clocks instead of 2·HALF, and a divide-by-8 comes out as a divide-by-10. The error is invisible in isolation — the waveform is a perfectly good square wave at the wrong frequency — and it shows up only when you measure the period. Trace the first few edges on paper every time.",
        },
        {
          kind: "trap",
          wrong: "Resetting only the counter and leaving the output alone, or leaving the counter uninitialised entirely.",
          right: "The reset branch sets both `hcnt` and `clk_out` to zero.",
          why: "If `hcnt` starts as `x`, then `hcnt == HALF - 1` evaluates to `x`, which is not true, so the branch never fires and the output never toggles. You get a permanently static output and no error message, which is the worst combination. And if you reset the counter but not the output, the output can come out of reset sitting high, and your first half period is the wrong length — a 50%-duty guarantee that is 50% except once every reset.",
        },
      ],
    },
    {
      slug: "warnings-and-self-check",
      title: "What the tool is telling you, and a last self-check",
      lede: "The warnings this chapter earns, what each one means, and four questions to answer before you move on.",
      blocks: [
        {
          kind: "table",
          head: ["Message", "Severity", "What it means for a counter"],
          rows: [
            ["WIDTHTRUNC / WIDTHEXPAND", "warning", "A value changed width: WIDTHTRUNC when bits are dropped (a wide expression into a narrow sink), WIDTHEXPAND when a narrow operand is widened (a small register compared against the 32-bit parameter `N`). The fix is to size both sides to the register."],
            ["BLKSEQ", "warning", "A blocking `=` was used inside a clocked block. Change it to `<=`. It is a real bug as soon as the block writes two registers that read each other."],
            ["UNOPTFLAT", "warning", "Circular combinational logic: a signal's value depends on itself through a path with no register in it, so there is no order in which the logic settles. Break the loop."],
            ["MULTIDRIVEN", "warning", "Two things drive the same wire — in this chapter, usually a clock or an output that is also the target of an `assign` or a second instance."],
            ["LATCH", "warning", "An `always @(*)` block left its output unassigned on some path, so the output would have to remember. Use `assign` for simple combinational logic like `tc`."],
            ["IMPLICIT", "error", "A signal was used without being declared — almost always a typo in a signal name. The language mode this track lints with stops with 'Can't find definition of variable' rather than quietly creating a 1-bit wire."],
            ["UNUSEDSIGNAL", "warning", "A signal is written but never read — often a leftover pin, or an `en` on a module where nothing gates the count. The design is correct; the wire is dead."],
          ],
          caption:
            "For this chapter, treat WIDTHTRUNC, WIDTHEXPAND, BLKSEQ, UNOPTFLAT, MULTIDRIVEN and LATCH as real. UNUSEDSIGNAL is a note about tidiness.",
        },
        {
          kind: "code",
          caption: "The one latch trap in this chapter, and the two ways to write it correctly.",
          code: `// Wrong: when en is low, tc is not assigned, so it has to remember
// its old value. That is a latch, and Verilator reports LATCH.
always @(*) begin
  if (en) tc = (count == N - 1);
end

// Right, first way: a question about the count needs no block at all.
assign tc = (count == N - 1);

// Right, second way: an always block that always assigns.
always @(*) begin
  tc = 1'b0;
  if (en) tc = (count == N - 1);
end`,
          note: "A terminal-count flag is a single expression, so `assign` is the right tool. Reach for `always @(*)` only when the combinational logic needs several statements — and then give it a complete assignment on every path.",
        },
        {
          kind: "points",
          title: "Five things to check before you compile",
          items: [
            "Does the width satisfy 2^W ≥ N? A modulo counter that cannot reach its last value will never wrap.",
            "Is every compare against the *last value* (N-1, HALF-1) rather than N or HALF?",
            "Is every addition sized — `count + 1'b1`, not `count + 1`?",
            "Does the reset set *every* register the design depends on, including the divider's output bit?",
            "Is the clock ungated? Every control should be an `if` inside `always @(posedge clk)`, never an AND in front of the clock.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Trace the divide-by-10 divider (HALF = 5) for 20 rising edges from reset. On which edges does the output change, and what is the period?",
              a: "The output changes on edges 5, 10, 15 and 20. It is low for edges 1 to 4, high for 5 to 9, low for 10 to 14, high for 15 to 19, and low from 20. One high run plus one low run is 10 input clock cycles, so the period is 10 input cycles and the frequency is f/10. The duty cycle is 5 high out of 10, which is exactly 50%. Notice the output is low for only 4 rows at the very start — that is just the initial phase, and it settles into five-and-five from the first toggle onwards.",
            },
            {
              q: "You change the divider to divide by 8 by setting HALF = 8, and leave `reg [1:0] hcnt;` in place. What happens?",
              a: "Nothing good. Two bits hold 0 to 3, so `hcnt` can never reach HALF - 1 = 7. The compare is never true, the toggle branch never runs, and the output stays low forever. Verilator gives you a WIDTHEXPAND warning on the comparison — a 2-bit register against the wider parameter — and that warning is the only clue. The fix is to widen `hcnt` to 3 bits. This is the 2^W ≥ N rule from the modulo counter, showing up again in the place it hurts most.",
            },
            {
              q: "Why is `en` tested inside the always block instead of being ANDed with the clock, and which warning would the AND version earn?",
              a: "The AND version creates a derived clock, and a derived clock picks up the delay of the AND gate, so its edges no longer line up with the real clock's edges. That is clock skew on a control signal, and the design's timing no longer depends only on the clock. Worse, if the enable is derived from logic that feeds back from the same block, you have built a circular combinational dependency — the class of bug Verilator reports as UNOPTFLAT — and if anything else also drives the clock wire, MULTIDRIVEN. Testing `if (en)` inside `always @(posedge clk)` keeps every edge uniform and puts the control in the data path, where it belongs.",
            },
            {
              q: "A modulo-10 counter is running, and `tc` never goes high. Name the two things to check first.",
              a: "First, the off-by-one: `tc` should compare the count against N-1 = 9, not N = 10. The count wraps from 9 straight to 0 and is never 10, so a compare against N can never be true. Second, the width: confirm the register is at least 4 bits, since 2³ = 8 cannot hold 9. Both failures look identical on a waveform — a counter that runs and a flag that stays low — so check the compare value and the port declaration before you start tracing anything else.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "clock divider", meaning: "A circuit that turns a fast clock into a slower one with a predictable period, usually by counting clock edges." },
    { term: "counter", meaning: "A register plus a rule that advances its value once per clock edge, wrapping back to zero at the end." },
    { term: "duty cycle", meaning: "The fraction of a signal's period that it is high. A 50%-duty clock is high for exactly half its period." },
    { term: "enable", meaning: "A pin tested inside a clocked block that decides whether this edge changes the state. It never gates the clock itself." },
    { term: "half period", meaning: "Half of one full cycle. In a 50%-duty divider it is how long the output stays at each value." },
    { term: "load", meaning: "A control that makes the counter take a chosen value on the next edge instead of counting." },
    { term: "modulus", meaning: "The number of distinct values a counter runs through. A modulo-N counter counts 0 to N-1, so it has N states." },
    { term: "nonblocking assignment (`<=`)", meaning: "The assignment used inside a clocked block. All statements read the values from before the edge." },
    { term: "parameter", meaning: "A named constant in a module's header that can be set when the module is used, so one body serves many widths and moduli." },
    { term: "register", meaning: "The bits that hold a design's state. Declared with `reg` and updated inside an `always @(posedge clk)` block." },
    { term: "state", meaning: "The value a circuit is holding right now. A counter's state is its current count." },
    { term: "terminal count", meaning: "The moment a counter reaches its last value, before wrapping. The `tc` flag marks exactly that cycle." },
    { term: "toggle flip-flop", meaning: "A 1-bit register wired to invert its own output. It is a divide-by-2 clock." },
    { term: "wrap", meaning: "What a fixed-width register does when it runs off the top: the extra carry is discarded and the value returns to zero." },
  ],
  nextStep:
    "You now have a counter with a `parameter` for its width and modulus, an `en`, an active-low asynchronous reset, and a combinational `tc` flag — a correct starting point for the lesson's bench `top (clk, rst_n, en, count, tc)`. The first lesson, Modulo-N Counter, asks you to make it wrap at N and pulse `tc` at the right cycle against that bench. Do the paper trace of a 3-bit sequence from this page first if you have not already — the exercise is much faster once you can predict the waveform without running it. The chapter's problem set is the clock divider, `top (clk, rst_n, en, clk_out, phase)` with K = 8, and the phase section above is the module to start from.",
};
