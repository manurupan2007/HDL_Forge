import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 10,
  chapterSlug: "shift-registers",
  title: "Shift Registers",
  readMinutes: 25,
  youWillBeAbleTo: [
    "Draw a shift register as a row of flip-flops and predict its contents after any number of clocks",
    "Write a shift in one line of Verilog and say exactly which bit is thrown away and at which end",
    "Tell a shift operator apart from a shift register, and say which one remembers",
    "Name the four shift register architectures and pick the right one for a job",
    "Build a bidirectional, load-enabled shift register inside a single clocked block",
    "Explain the difference between shifting and rotating using the same circuit",
    "Build a combinational barrel shifter out of multiplexers and guard against an oversized shift count",
  ],
  mentalModel: [
    {
      title: "A row of little boxes that all move at once",
      body: "A shift register is a line of flip-flops — the memory elements you met in chapter 8 — wired so that each one copies the bit of its neighbour. That is the whole circuit. On every rising clock edge, each box reaches over and takes whatever is in the box next to it, and every bit moves one place. Nothing is added, nothing is calculated, nothing is decided. A value enters at one end, travels one position per clock, and leaves at the other end. If the value is 8 bits wide and you clock it 8 times, the last bit in has just left the building. Everything else in this chapter — the four architectures, the direction controls, the barrel shifter — is a variation on that one picture.",
    },
    {
      title: "A shift is a relabelling; the register is what makes it stick",
      body: "The expression `{q[2:0], d}` does not store anything. It builds a brand new 4-bit value out of bits that exist right now: `d` becomes the new lowest bit, and the three bits that were below the top slide up one place each, while the old top bit has nowhere to go and is dropped. That computation takes no time and is forgotten instantly. Put it on the right-hand side of a nonblocking assignment inside `always @(posedge clk)` and the flip-flops do the remembering. Confusing the two is the main trap in this chapter, so keep them apart in your head: the concatenation is the *motion*, the register is the *memory*.",
    },
    {
      title: "A barrel shifter is a stack of two-way switches",
      body: "When the amount of the shift is known at build time, you wire the motion into the circuit. When the amount arrives on a pin at runtime, you need a circuit that can move by 0, 1, 2, 3… positions depending on what is on that pin. The cheap way to do it is one layer of two-input multiplexers per bit of the shift amount, stacked in layers. Each layer either passes the value through or shifts it by its own power of two. That is the whole idea behind a barrel shifter, and it is chapter 4's multiplexer doing the work.",
    },
  ],
  topics: [
    {
      slug: "a-row-of-flip-flops",
      title: "A row of boxes that all move at once",
      lede: "The physical idea first: every flip-flop copies its neighbour on every clock edge, so every bit moves exactly one place.",
      blocks: [
        {
          kind: "analogy",
          text: "Put four people in a line, shoulder to shoulder, each holding a coin. Only one coin: the leftmost person has it, everyone else has their hands empty. Now everybody steps along one place to the left, simultaneously, on the count of three. The coin moves one place, and the person who was holding it has stepped into empty space. Nobody decides anything and nobody runs — the rule was fixed in advance, and it just happens. Three counts later the leftmost person has reached the end of the line and stepped off. That is a 4-bit shift register, except the coin is replaced by a bit that can be there or not there, and the count of three is a clock edge.",
        },
        {
          kind: "para",
          text: "In hardware you build the line out of flip-flops. You met a single one in chapter 8: a box with a data input and a clock, which on each rising edge copies its input into itself and forgets the old contents. A shift register is just N of those boxes with their data inputs cross-wired to each other. On every clock edge, box 3 takes the bit that was in box 2, box 2 takes the bit that was in box 1, box 1 takes the bit that was in box 0, and box 0 takes a fresh bit from a pin called `sin` — the *serial in* bit. Box 3's own old bit has nowhere to go and is thrown away. The output at box 3 is a pin called `sout`, the *serial out* bit.",
        },
        {
          kind: "code",
          caption:
            "The smallest useful shift register: 4 flip-flops, bits moving up one place on every rising edge, with a reset to clear it.",
          code: `module siso_left (
  input  wire clk,
  input  wire rst_n,   // active-low async reset, like the lesson starter
  input  wire sin,
  output reg  [3:0] q
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 4'b0000;
    else        q <= {q[2:0], sin};
  end
endmodule`,
          note: "Read the middle line as a sentence: on the clock edge, `sin` becomes the new lowest bit, and the three bits that were below the top now each sit one place higher. The bit that used to be in q[3] has no slot in the new value, so it is gone. That single fact — one bit enters at the bottom, one bit leaves at the top — is the entire behaviour of a shift register.",
        },
        {
          kind: "para",
          text: "Because all four boxes sample at the same instant, this is a parallel motion, not a queue. A bit cannot race from box 3 to box 0 in one edge. It moves exactly one position per edge, and no more. If you ever see a shift register where a bit appears to travel several positions in one clock, something is wrong with the assignment style — that failure is covered in the traps further down.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes) — the hand trace that makes the rest obvious",
          items: [
            "Draw four boxes in a row, side by side. Label them, from right to left, q0, q1, q2, q3 — so that the index numbers climb as your eye travels left, exactly like place values in a decimal number. This drawing is the whole lesson. Everything after it is just learning to write down what the drawing already shows.",
            "The controls are set to: reset has already been pulsed, so start every box at 0. Write 0000 across the four boxes as the contents after reset.",
            "Clock 1: assert load with d = 1010, then let go of load. All four boxes take a fresh copy. Write 1010 across the boxes. This is the moment you put a value into the register in one go, instead of feeding it in a bit at a time.",
            "Clock 2: load is 0, direction is up (left), sin is 0. Box 3 takes box 2's old bit, box 2 takes box 1's, box 1 takes box 0's, box 0 takes sin, and box 3's old bit is discarded. Write the new contents.",
            "Clock 3: same again. Write the new contents.",
            "Clock 4: same again. Write the new contents.",
            "Clock 5: same again. Write the new contents.",
            "Now answer these against your own drawing: which bit was thrown away on clock 2 — was it a 0 or a 1? Which bit was thrown away on clock 5, and was that the same bit that started in box 1?",
            "Count the 1s in each row. A shift does not change how many 1s there are, except on the one clock where a 1 falls off. Point at that clock, and say which of the two 1s it was.",
            "Finally: how many clock edges after the load did the 1 that started in box 1 survive? Write the answer as a number of edges, not as a row of the table.",
          ],
        },
        {
          kind: "table",
          head: ["Clock", "q3", "q2", "q1", "q0", "What happened"],
          rows: [
            ["after reset", "0", "0", "0", "0", "rst forced every box to zero"],
            ["1", "1", "0", "1", "0", "load took the whole 4-bit word at once"],
            ["2", "0", "1", "0", "0", "every bit moved up one; the old q[3] was thrown away"],
            ["3", "1", "0", "0", "0", "the 1 that started in q1 is now in q3"],
            ["4", "0", "0", "0", "0", "that 1 reached the top and fell off"],
            ["5", "0", "0", "0", "0", "nothing left to move; the register is empty"],
          ],
          caption:
            "This is the answer to the exercise above, so check it against your drawing rather than against the code. If a row disagrees with what you drew, find the first row where the two differ — that is the clock where your mental model broke, and everything after it will be wrong for the same reason.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the trace is the lesson, not the code",
          text: "Every shift register in every datasheet, every textbook and every job spec is one of these drawings. The Verilog is a transcription. If your drawing is right, the code almost writes itself; if the code is right and the drawing is missing, you will not be able to debug it. Get the picture first, and treat every error message afterwards as a disagreement between the tool and your drawing.",
        },
      ],
    },
    {
      slug: "the-one-line-shift",
      title: "The one line that performs the shift",
      lede: "How a concatenation relabels the wires so that every bit moves exactly one place — and how easy it is to write it backwards.",
      blocks: [
        {
          kind: "para",
          text: "The hand trace is done. Now find the notation that makes the machine do what the drawing shows. For the shift you just drew, you need a new 4-bit value whose bit 3 is the old bit 2, whose bit 2 is the old bit 1, whose bit 1 is the old bit 0, whose bit 0 is the fresh bit, and in which the old bit 3 appears nowhere. Read that list top to bottom and you will notice it is literally the definition of a *concatenation* — the `{ }` operator you met in chapter 3, which glues values end to end into one wider value, leftmost piece landing in the highest bits.",
        },
        {
          kind: "code",
          caption: "A left shift, written as a single standing rule. It is combinational: it recomputes whenever the inputs change.",
          code: `module shift_left_comb (
  input  wire [3:0] q,
  input  wire       d,
  output wire [3:0] nxt
);
  assign nxt = {q[2:0], d};
endmodule`,
          note: "The output is deliberately called nxt, for next. That name is doing real work in your head: it is the value q will have after the next clock edge, and it exists right now, on a wire, without any clock having happened.",
        },
        {
          kind: "steps",
          title: "Read `{q[2:0], d}` bit by bit",
          items: [
            {
              head: "The braces glue, left to right",
              body: "Inside `{ }`, pieces are written in the order they appear when you read the answer left to right, highest bit first. The leftmost piece lands in the top position. This is the same rule as writing `8'b1010_0000`.",
            },
            {
              head: "The leftmost field is `q[2:0]`",
              body: "That slice is 3 bits wide — q[2], q[1], q[0] — and it lands in positions 3, 2 and 1 respectively. Note the order: q[2] ends up in position 3, q[1] in position 2, q[0] in position 1. Every bit slid up exactly one place.",
            },
            {
              head: "The rightmost field is `d`",
              body: "`d` is 1 bit wide, so it lands alone in the lowest position, bit 0. Whatever you feed into `d` becomes the newest, lightest bit. The fresh bit always enters at the bottom in a left shift.",
            },
            {
              head: "Total width is 3 + 1 = 4",
              body: "The answer is 4 bits, the same width as `q`. Nothing is invented and nothing is lost except the one bit that had no slot.",
            },
            {
              head: "The bit that disappeared",
              body: "The old q[3] is not mentioned anywhere in the expression, so it is not in the answer. It has no destination. That is a real loss of information, and it is the defining difference between a shift and a rotation, which the barrel shifter topic comes back to.",
            },
            {
              head: "Check it against your drawing",
              body: "Take the row of your hand trace for clock 3, whose old contents were 0100. The rule says: new bit 3 is old q[2] = 1, new bit 2 is old q[1] = 0, new bit 1 is old q[0] = 0, new bit 0 is d = 0. So the answer is 1000. That is exactly what you drew. If it matches, the notation is doing what the picture says.",
            },
          ],
        },
        {
          kind: "para",
          text: "The mirror image is the other direction, and it is the single easiest thing to get backwards in this whole chapter. Write the concatenation the other way round and you get `{d, q[3:1]}`: the fresh bit `d` is now the *leftmost* field, so it lands in bit 3 — the high end — and the surviving bits slide *down* one place, with the old q[0] falling off the bottom. New bit arriving at the high end means the data is travelling toward the low end, which is a **shift right**, however innocently you labelled it.",
        },
        {
          kind: "table",
          head: ["Direction", "The one line", "Where the fresh bit enters", "Which bit falls off"],
          rows: [
            ["left (bits move up)", "{q[2:0], d}", "the low end, bit 0", "the old q[3], off the top"],
            ["right (bits move down)", "{d, q[3:1]}", "the high end, bit 3", "the old q[0], off the bottom"],
          ],
          caption:
            "Left and right always describe the bits, never your eye. Bits moving toward the high-numbered end is a left shift, and a left shift takes its fresh bit in at bit 0 — the same reason `q << 1` leaves zeroes at the bottom. If you find yourself arguing about which end is which, go back to your four labelled boxes and point.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Evaluate `nxt = {q[2:0], d}` by hand for q = 1010, d = 1. Work it out one bit at a time: new bit 3 is old bit 2, and so on down to new bit 0, which is d. Write the answer.",
            "Now evaluate `nxt = {d, q[3:1]}` for the same q and d. This is the right shift. Write the answer, and check that it is the mirror image of the first one.",
            "Take q = 0000 and d = 1 for both. You should get 0001 for the left shift and 1000 for the right shift — a single 1 walking to opposite ends of the register, from the same starting point and the same fresh bit.",
            "Write out the value 0110 shifted left by one and then by two, using the left rule. Confirm that after two shifts the original bits are all gone, because two shifts of a 4-bit value discards the two top bits.",
            "Now take the number 9 and shift it left by one using the operator, then by one using the concatenation. Both should give the same answer, because `a << 1` and `{a[2:0], 1'b0}` are the same circuit. If they disagree, you have mixed up the two directions.",
          ],
        },
        {
          kind: "trap",
          wrong: "`q <= {d, q[3:1]};` with a comment saying shift left.",
          right: "`q <= {q[2:0], d};` for left. The fresh bit goes at the *right* of the concatenation, because the right of a concatenation is the low end.",
          why: "This is the classic shifter bug, and it is silent. `{d, q[3:1]}` puts `d` in bit 3 and drops the old q[0] instead — that is a right shift, quietly mislabelled. Both versions are exactly 4 bits wide, so no warning appears and the value looks plausible. Your hand trace is what catches it: shift 1010 by one and only one of the two lines reproduces the row you drew.",
        },
        {
          kind: "trap",
          wrong: "`q <= {d, q[3:1]};` where `d` is a 4-bit bus rather than a single bit.",
          right: "Declare `d` as a 1-bit pin, or slice the bus down to the one bit you actually want.",
          why: "Verilator will report a WIDTHTRUNC warning, and it is right to. `d` is 4 bits, `q[3:1]` is 3 bits, so the concatenation is 7 bits being assigned to a 4-bit register. The extra 3 bits are silently truncated, which almost always means the register does not contain the value you thought. The fix is always the same: count the bits in every field and make the total match the destination.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The width rule in one sentence",
          text: "In a concatenation, the answer is exactly as wide as all the fields added together. `{q[2:0], d}` is 3 + 1 = 4 bits. `{d, q[3:1]}` is 1 + 3 = 4 bits. `{d, q}` would be 5 bits and would truncate on assignment. When a WIDTHEXPAND or WIDTHTRUNC warning appears on a shift line, count the fields before you look at anything else.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Let the tool confirm the bit you threw away",
          text: "Paste the `shift_left_comb` module above into the workspace and you will get an `UNUSEDSIGNAL` note saying that bit `q[3]` is not used. That is not a mistake in your code — it is the tool naming the bit you just lost. It is a nice free confirmation that you have understood the shift, and it is the same UNUSEDSIGNAL message you met in chapter 1, where it meant a leftover wire rather than a deliberate one.",
        },
      ],
    },
    {
      slug: "shift-operator-or-shift-register",
      title: "A shift operator, or a shift register?",
      lede: "Verilog can move bits with `<<` and `>>`. Those move bits too, but they remember nothing — and that is the whole difference.",
      blocks: [
        {
          kind: "para",
          text: "Verilog has two shift operators. `a << 2` shifts a left by 2 places, `a >> 1` shifts it right by 1. They are tempting to reach for in this chapter, and using them in the wrong place is the most common conceptual error here — so this topic exists mostly to keep them apart. The shift operators are *combinational*. The result is a function of the value you start with, computed the instant you look, and forgotten the instant the inputs move. A shift *register* is *sequential*. It has storage, it only changes on a clock edge, and it holds its value between edges.",
        },
        {
          kind: "table",
          head: ["", "Shift operator ( << >> )", "Shift register"],
          rows: [
            ["what it is", "an expression, like + or &", "a circuit of flip-flops"],
            ["what it does", "computes a shifted copy of the current value", "moves the stored value one place per clock edge"],
            ["does it remember?", "no — nothing is stored", "yes — that is the entire point"],
            ["when does the result change?", "the moment any input changes", "only on a rising clock edge"],
            ["how many places at once", "as many as the number you write", "exactly one, always"],
            ["where the fresh bits come from", "zeroes, filling the vacated end", "a pin, or a bus, driven by you"],
            ["typical use", "arithmetic scaling, and building barrel shifts", "serialisers, deserialisers, delay lines, LFSRs"],
          ],
          caption:
            "They look identical when you are staring at one line of code. They are not the same thing, and the difference is the difference between arithmetic and memory.",
        },
        {
          kind: "analogy",
          text: "The shift operator is a photocopier with a movable frame. Hand it a page and you get back a shifted copy; hand it a different page and you get a shifted copy of that. The machine holds nothing. A shift register is a rack of four trays, one behind the other, with a mechanism that tips everything forward one tray on every tick of a clock. The rack is the memory, and the tipping is the shift. Same motion, completely different object.",
        },
        {
          kind: "code",
          caption: "Two ways of writing down the same arithmetic — only one of them is a register.",
          code: `module double_and_delay (
  input  wire       clk,
  input  wire       sin,
  input  wire [7:0] a,
  output wire [7:0] doubled,
  output reg  [7:0] q
);
  // Combinational. A shifted copy of a, available immediately, forgotten immediately.
  assign doubled = a << 1;

  // Sequential. A real 8-bit shift register, 8 flip-flops, memory included.
  always @(posedge clk) q <= {q[6:0], sin};
endmodule`,
          note: "You could write `always @(posedge clk) q <= q << 1;` and it would also work — inside a clocked block, the right-hand side is evaluated from the old contents and the flip-flops do the storing. What you must never do is expect the shift operator itself to remember anything. Note also which output is a wire and which is a reg: `doubled` is driven by an `assign`, so it is a wire; `q` is assigned inside an `always` block, so it needs to remember and is a `reg`.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Bits that fall off a shift operator are gone",
          text: "A shift operator never makes a value wider. `8'h80 << 1` is `8'h00`, not `8'h100`, because the 1 slid off the top and the result has to stay 8 bits. And when the destination is *wider* than the value, Verilog pads the value with zeroes to the destination width before shifting — so a shift that looked lossy can stop being lossy purely because you declared a wider wire. That one surprises people who test at a different width than they designed for.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take a = 8'b0000_0001. Work out a << 1, a << 4, a << 7 and a << 8. Note carefully what a << 8 gives, and why it is not the same as a.",
            "Now take a = 8'b1000_0000 and work out a >> 1, a >> 4, a >> 7 and a >> 8. Which bit disappears, and on which of the four steps?",
            "Decide for each of these whether it describes a shift operator or a shift register: (a) a delay line that a bit walks through over eight clock cycles; (b) doubling a number in a datapath; (c) a value that survives between clock edges; (d) a copy of a value rotated by an amount that arrives on a pin.",
            "Finally, explain in one sentence why `assign q = q << 1;` cannot be a register. Think about what the left-hand side and the right-hand side have in common.",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign q = q << 1;` — using the shift operator and expecting a register to appear.",
          right: "Put it in a clocked block: `always @(posedge clk) q <= q << 1;`, or `always @(posedge clk) q <= {q[6:0], sin};`.",
          why: "Both halves of that continuous assignment refer to q, so the rule is q equals something derived from q. That is a loop with no memory in it — the tool reports it, and real hardware has nowhere to hold a value between clock edges. The shift operator computes a result; a flip-flop stores one. You need both.",
        },
        {
          kind: "trap",
          wrong: "Assuming `a << n` can produce a wider value, or that bits shifted out come back.",
          right: "The result is exactly as wide as the value and the context, and bits pushed past the end are discarded.",
          why: "Shifting is not arithmetic on paper — it is a fixed-width operation on a fixed number of wires. `8'h0F << 4` is `8'hF0`, not `8'hFF` and not `16'h00F0`. If you need the wider result, say so explicitly with a wider destination or a concatenation, and then think about which bits you actually wanted to keep.",
        },
      ],
    },
    {
      slug: "siso-sipo-piso-pipo",
      title: "The four shapes: SISO, SIPO, PISO and PIPO",
      lede: "Standard vocabulary for shift registers, named after whether the data goes in and comes out one bit at a time or all at once.",
      blocks: [
        {
          kind: "para",
          text: "Every shift register belongs to one of four families, named by two letters. The first letter describes how data gets in: **S**erial means one bit per clock cycle; **P**arallel means the whole word at once. The second letter describes how data gets out, on the same terms. You will meet these four words in every textbook, every datasheet and most job descriptions that involve serial interfaces, so it is worth being able to say them out loud.",
        },
        {
          kind: "analogy",
          text: "A queue at a counter. People arriving one at a time and being served one at a time is serial in, serial out. A bakery where a truck delivers 12 loaves at once and you take them off the shelf two at a time is parallel in, parallel out. The letters are not a technicality — they tell you how many wires the design needs, and wire count is often the whole reason for the choice.",
        },
        {
          kind: "table",
          head: ["Name", "Stands for", "Data in", "Data out", "What it is actually for"],
          rows: [
            ["SISO", "serial in, serial out", "one bit per clock on a single pin", "one bit per clock on a single pin", "a delay line, a tap, or the core of an LFSR"],
            ["SIPO", "serial in, parallel out", "one bit per clock on a single pin", "all N bits available at once", "turning a slow wire into a number the rest of the chip can use"],
            ["PISO", "parallel in, serial out", "all N bits loaded at once", "one bit per clock on a single pin", "turning a number into a slow wire, to send across a link"],
            ["PIPO", "parallel in, parallel out", "all N bits loaded at once", "all N bits available at once", "a general-purpose register with a shift mode; also the shape a bidirectional shifter has"],
          ],
          caption:
            "The first three are usually the same handful of flip-flops with different wiring and a load override. SIPO and PISO are the pair you will actually build, because they are the two halves of a serial link.",
        },
        {
          kind: "define",
          items: [
            { term: "serial", meaning: "One bit at a time, arriving on a single wire, one per clock cycle." },
            { term: "parallel", meaning: "All the bits at once, on N separate wires, taking one clock cycle." },
            { term: "serialiser", meaning: "A circuit that takes a whole number and pushes it out one bit at a time. This is a PISO shift register." },
            { term: "deserialiser", meaning: "A circuit that collects one bit per clock into a whole number you can use. This is a SIPO shift register." },
            { term: "load override", meaning: "A control input that makes the register take a whole parallel word instead of shifting, so a value can be put in without clocking it in bit by bit." },
          ],
        },
        {
          kind: "para",
          text: "This is why the load control exists at all. A shift register can always get a value in one bit at a time, but that takes N clocks and the value is smeared across N time steps. In a real design you usually have a number sitting in a register and you want it delivered bit by bit. That is PISO, and it needs a way to load all N bits at once — the `load` input, which overrides the shift on the next clock edge. Chapter 11 will use exactly this arrangement to walk a byte out over eight cycles.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "You have a sensor that produces 12 bits in one go, and a slow link to a microcontroller that takes one bit per clock. Which architecture, and which letter describes each end? Answer: PISO. The sensor is the parallel end, the link is the serial end.",
            "You have a UART that delivers one bit per clock and you need the whole 8-bit byte sitting in a register so an ALU can use it. Which architecture? Answer: SIPO. Serial in, parallel out — eight clocks, then read the whole register at once.",
            "You want a circuit that holds a value, can shift it either way, and can be reloaded from a bus. Name all four names it qualifies as. Answer: it is PIPO in shape, because it loads in parallel and presents in parallel, with serial shifts available on the same flip-flops.",
            "Count the wires. A 32-bit SISO needs one data wire and 32 flip-flops. A 32-bit PIPO needs 32 data wires in and 32 out. Say in one sentence which one you would pick to cross a chip boundary, and why.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why serial survived",
          text: "PISO and SISO look old-fashioned next to a chip with hundreds of pins, and they are still everywhere. Because one wire per clock is one pin, serial is how data crosses a board, a cable, a fibre or a chip boundary. Fewer pins means less wiring, less power and less skew to manage. Every USB, SPI, I2C and UART link on the planet is a PISO talking to an SIPO.",
        },
      ],
    },
    {
      slug: "building-the-shift-register",
      title: "Building it: direction, load and the one clocked block",
      lede: "The lesson's task, taken apart line by line — a bidirectional shift register with a load override.",
      blocks: [
        {
          kind: "para",
          text: "Now put it all together. You want a 4-bit register that can shift up, shift down, take a fresh 4-bit word from a bus, and clear itself on reset. That is four behaviours, and the classic way to express a priority order between behaviours in hardware is a chain of `if` / `else if` inside a single clocked block. The order of the tests *is* the priority, so it is also the thing you must get right.",
        },
        {
          kind: "code",
          caption:
            "The complete bidirectional, load-enabled shift register. Four behaviours, one block, one clock.",
          code: `module shifter (
  input  wire       clk,
  input  wire       rst_n,   // active-low async reset, like the lesson starter
  input  wire       load,
  input  wire       dir,
  input  wire       sin,
  input  wire [3:0] d,
  output reg  [3:0] q
);
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)     q <= 4'b0000;
    else if (load)  q <= d;
    else if (dir)   q <= {q[2:0], sin};   // dir = 1 shifts left
    else            q <= {sin, q[3:1]};   // dir = 0 shifts right
  end
endmodule`,
          note: "Two details are doing quiet work. `rst_n` is in the sensitivity list as `negedge rst_n`, which makes it an active-low asynchronous reset — it takes effect the moment it is pulled low, not on the next clock, exactly as in chapter 8 and in the lesson starter. And every assignment is `<=`, the nonblocking form, so all four flip-flops sample from the same old contents of q.",
        },
        {
          kind: "steps",
          title: "Read the block line by line",
          items: [
            {
              head: "`output reg [3:0] q`",
              body: "The word `reg` here does not mean software register. It means this signal is assigned inside an `always` block, and therefore needs to remember its value between clock edges — which is to say, it becomes flip-flops. Everything else in the track that is a `reg` is a row of flip-flops too.",
            },
            {
              head: "`always @(posedge clk or negedge rst_n)`",
              body: "This block runs on a rising clock edge, or on a falling reset edge. Adding `or negedge rst_n` is what makes reset active-low asynchronous: pull reset low and the outputs clear straight away, without waiting for a clock.",
            },
            {
              head: "`if (!rst_n) q <= 4'b0000;`",
              body: "Reset has the highest priority because it is tested first. If a clock edge and a reset happen at the same moment, reset wins. That is the safe order for a register that is meant to start in a known state.",
            },
            {
              head: "`else if (load) q <= d;`",
              body: "Load comes next. This is the override: when `load` is high, the register ignores shifting entirely and takes all four bits of the bus at once. It is what turns a plain SISO into a PISO, and it is why a value can be placed in the register in a single clock.",
            },
            {
              head: "`else if (dir) q <= {q[2:0], sin};`",
              body: "Direction third. `dir = 1` shifts left: the fresh bit lands at bit 0, the three bits below the top each move up one place, and the old q[3] is discarded. Note where the fresh bit is written — on the *right* of the concatenation, because the right of a concatenation is the low end of the result.",
            },
            {
              head: "`else q <= {sin, q[3:1]};`",
              body: "The fallthrough, with no `if`. If reset, load and dir are all low, this is what happens: a right shift, with `sin` arriving at bit 3 and the old q[0] discarded. Writing the last branch as a bare `else` rather than `else if (dir == 0)` is a small habit that saves you from a latch later.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the priority order is the design",
          text: "A chain of `if` / `else if` reads top to bottom and stops at the first true test. That is not a stylistic choice, it is the specification. Reading it as English: if reset is asserted, clear. Otherwise, if a load is requested, load. Otherwise, if direction is left, shift left. Otherwise, shift right. If you swap load and dir, then a load request arriving while `dir` happens to be 1 would be executed as a shift instead — and the design would silently ignore the load. Priority is behaviour, and the code is where you write it down.",
        },
        {
          kind: "code",
          caption: "A small testbench that exercises both directions, so you can watch the drawing from the first topic happen in a waveform.",
          code: `\`timescale 1ns / 1ps

module tb_shifter;
  reg        clk;
  reg        rst_n;
  reg        load;
  reg        dir;
  reg        sin;
  reg  [3:0] d;
  wire [3:0] q;

  shifter u (
    .clk(clk), .rst_n(rst_n), .load(load), .dir(dir),
    .sin(sin), .d(d), .q(q)
  );

  initial begin
    clk = 1'b0;
    forever #5 clk = ~clk;
  end

  initial begin
    rst_n = 1'b0; load = 1'b0; dir = 1'b0; sin = 1'b0; d = 4'b0000;
    #12 rst_n = 1'b1;      // release reset
    #3  load = 1'b1; d = 4'b1010;
    #10 load = 1'b0; dir = 1'b1;   // shift left from here on
    #40 dir = 1'b0;                // now shift right instead
    #40 $finish;
  end

  // Sample just *after* the nonblocking updates have landed.
  always @(posedge clk) #1 $display("q = %b", q);
endmodule`,
          note: "The `#1` in the display line is not decoration. An `$display` placed directly in `always @(posedge clk)` runs in the same instant as the nonblocking assignment but *before* it takes effect, so it prints the previous value, one step behind. Nudging one time unit later makes the printout match what the register now holds.",
        },
        {
          kind: "points",
          title: "Where this goes next",
          items: [
            "Add a hold behaviour: a 2-bit `mode` input where 00 is parallel load, 01 is shift left, 10 is shift right, and 11 is hold. That four-way arrangement is called a universal shift register, and it is the shape most real general-purpose shift registers have.",
            "The enable case is subtler than it looks. Chipping the clock — feeding the register a gated clock so it only sees edges when `en` is high — is bad practice, because generated clocks cause timing trouble. Gate the data or the update instead.",
            "The same flip-flops serve every direction. `sin` is simply whichever end is currently the input, and the circuit does not care which end that is.",
            "If you ever need the value coming out the other end as it goes in, you have a SISO with a `sout` pin. That single output wire is what makes it useful as a serialiser.",
          ],
        },
        {
          kind: "trap",
          wrong: "`always @(posedge clk) q = {q[2:0], sin};` — a blocking `=` inside a clocked block.",
          right: "`always @(posedge clk) q <= {q[2:0], sin};`",
          why: "This is a genuinely nasty one, because the code looks right and the trace looks almost right. With a blocking assignment, the first line writes the new value into q, and the *next* flip-flop then reads that already-updated value instead of the old one. The result is that a single clock edge shifts the data all the way across the register, not one place. The trace will look plausible and be wrong by a factor of the register width. Nonblocking, `<=`, evaluates everything from the old value first — that is the whole reason chapter 8 made it load-bearing.",
        },
        {
          kind: "trap",
          wrong: "Putting the direction test before the load test: `if (dir) ... else if (load) ...`.",
          right: "Test the overrides first — reset, then load — and give direction the lowest priority.",
          why: "A chain of `if` / `else if` takes the first true branch and ignores the rest. With direction first, any load request that happens to arrive while `dir` is 1 is executed as a shift, and the loaded value is never stored. No warning appears; the load is simply lost. Write the priority order down in English before you write the code, then check the code against the sentence.",
        },
      ],
    },
    {
      slug: "shift-or-rotate",
      title: "Shifting and rotating are not the same thing",
      lede: "A shift throws the bit that falls off away. A rotate puts it back on the other end. One connection is the whole difference.",
      blocks: [
        {
          kind: "para",
          text: "Everything so far has thrown a bit away. Shift left and the top bit is gone; shift right and the bottom bit is gone. That is correct for a shift register, and it is exactly what you want when the register is being used to move data along. But plenty of hardware needs the bits to come back around: circular buffers, rotating priority encoders, scramblers, the pointer that walks round a table. That is a *rotation*, also called a circular shift, and it is a different circuit.",
        },
        {
          kind: "analogy",
          text: "Four seats in a row, and a token that moves along them. A shift walks the token along the row and then… it is gone, and someone has to fetch a new one. A rotate walks the token to the end and then carries the end seat round to the front, so there is always exactly one token and it never leaves. From inside the row the two look identical until you look at the end.",
        },
        {
          kind: "table",
          head: ["Operation", "What happens to the bit that falls off", "4-bit example", "Result"],
          rows: [
            ["shift left by 1", "discarded", "1010", "0100"],
            ["rotate left by 1", "reappears at bit 0", "1010", "0101"],
            ["shift right by 1", "discarded", "1010", "0101"],
            ["rotate right by 1", "reappears at bit 3", "1010", "0101"],
          ],
          caption:
            "With 1010 the left shift and the right rotate happen to look identical, which is a coincidence of that particular value. Pick 1000 and the difference is unmissable: shift left gives 0000, rotate left gives 0001.",
        },
        {
          kind: "code",
          caption: "The two left operations, side by side. The only difference is what fills the vacated slot.",
          code: `// Left shift: the vacated top slot is filled with a fresh 0, and q[3] is gone.
assign shifted = {q[2:0], 1'b0};

// Left rotate: the vacated top slot is filled with the bit that fell off.
assign rotated = {q[2:0], q[3]};`,
          note: "One field differs: `1'b0` versus `q[3]`. That single connection from the output end back to the input end is the entire difference between a shift and a rotate, in both hardware and in code. The right-hand versions are the mirror image: `{1'b0, q[3:1]}` and `{q[0], q[3:1]}`.",
        },
        {
          kind: "para",
          text: "There is a third case that trips people up: the shift register as the engine of a pseudo-random number generator. In a *linear feedback shift register* — LFSR — the bit that would fall off is not fed straight back in. Instead it is XORed with two or three other bits, and that combined bit enters at the low end. A left-shifting register with feedback does this:",
        },
        {
          kind: "code",
          caption: "An 8-bit LFSR. The feedback bit is a combination of four taps, not a single bit.",
          code: `module lfsr8 (
  input  wire clk,
  input  wire rst_n,   // active-low async reset, like the lesson starter
  output reg  [7:0] q
);
  wire fb = q[7] ^ q[5] ^ q[4] ^ q[3];

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) q <= 8'b0000_0001;
    else        q <= {q[6:0], fb};
  end
endmodule`,
          note: "The `^` means XOR, which returns 1 when its two inputs differ. Watch the feedback bit over a few cycles and you will see the register walk through a long sequence before coming back to where it started. These taps are chosen so the sequence has maximal length: 255 steps through every non-zero 8-bit value. The exact tap set for a given width is tabulated in the literature — what matters here is the shape, one XOR of selected taps feeding the vacated end.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "An LFSR seeded with all zeros stays at all zeros",
          text: "Zero is a fixed point of the feedback function: an XOR of zeros is zero, forever. If you reset an LFSR to 8'b0000 you have built a machine that outputs 0 forever, and nothing in the waveform looks like an error. Seed it with a non-zero value such as 8'b0000_0001. This is a special case of a rule you will meet constantly: registers and state machines must be given a starting state you actually meant.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take 4'b1000 and work out a left shift, then a left rotate. Write both answers. Then do the same for a right shift and a right rotate. Which pair came out identical, and what does that tell you about picking a value for a trace?",
            "Take 4'b1100. Rotate it left once, twice, three times and four times. Write all four. What do you notice when you get to the fourth?",
            "Take the 8-bit LFSR above, seeded with 8'b0000_0001, and work out the feedback bit and the new contents for the first four clock edges. Confirm that you can reach a specific 8-bit value by clocking the right number of times — that is the property that makes an LFSR a lookup table as well as a random source.",
            "Now start the same LFSR from 8'b0000_0000 and do one clock edge. Write the result, and explain in one sentence why this is the one thing you must never do.",
          ],
        },
        {
          kind: "trap",
          wrong: "Resetting an LFSR to zero, or treating a shift register as if it remembers bits.",
          right: "Seed a rotate or an LFSR with a non-zero value, and use rotate rather than shift whenever the bits must survive the trip round.",
          why: "A shift register that discards a bit per cycle is lossy by design; the information genuinely is not there any more. And an LFSR seeded with zero stays at zero forever, because zero is a fixed point of the feedback. Both look like a dead output rather than an error, so check the seed before you start debugging the logic.",
        },
      ],
    },
    {
      slug: "barrel-shifter",
      title: "The barrel shifter: moving by a runtime amount",
      lede: "The chapter's project — a circuit that rotates a byte by 0 to 7 places, chosen by a pin, all in the same cycle.",
      blocks: [
        {
          kind: "para",
          text: "So far the amount of the shift has been built into the circuit: one concatenation, one direction, hard-wired. The barrel shifter removes that restriction. It takes a value and a shift *amount* on a pin, and produces the value moved by that amount — 0, 1, 2, up to 7 places for an 8-bit value — entirely within one clock cycle, with no register in the middle. That is the definition of combinational: the answer is a function of the inputs, valid immediately, and there is no clock involved anywhere.",
        },
        {
          kind: "para",
          text: "The pset expects module `top(d, amt, y)` — 8-bit data `d`, 3-bit amount `amt`, 8-bit result `y`, in that order — and the hidden bench checks all 2048 `(d, amt)` combinations rotate left correctly. The `barrel_rotate` module below is the same shape with the ports named `(v, sh, y)`: rename them to `(d, amt, y)` and it is submission-ready.",
        },
        {
          kind: "steps",
          title: "The general rule, and where it breaks",
          items: [
            {
              head: "Rotate left by k, in words",
              body: "The top 8-k bits of the answer are the bottom 8-k bits of the input. The bottom k bits of the answer are the top k bits of the input. That is the whole rule, and it is easier to check by eye than any formula.",
            },
            {
              head: "Rotate left by k, as a slice",
              body: "Written out, that rule is `{v[7-k:0], v[7:8-k]}` for an 8-bit value. With k = 3 that is `{v[4:0], v[7:5]}` — five bits, then three bits, totalling eight.",
            },
            {
              head: "Where it breaks: k = 0",
              body: "At k = 0 the second field is `v[7:8]`, an empty and illegal range, and the first field is the whole value. No amount of cleverness in the formula rescues that. A shift amount of zero is a perfectly ordinary thing to ask for, and it is one of the most common values, so it has to be handled — with its own branch.",
            },
            {
              head: "Where else it breaks: k >= 8",
              body: "If the amount pin is wider than the value, values of 8 and above are reachable and every slice for them is out of range. You have two honest choices: mask the amount down to the bits that matter, or clamp it. Silently doing neither is how a barrel shifter returns garbage for one count in sixteen.",
            },
            {
              head: "So: one special case, then a lookup",
              body: "Zero gets its own branch, and every remaining amount gets its own branch. Eight branches for an 8-bit value. Each branch is a two-way choice between two fixed versions of the same value — and a row of two-way choices between two named values is a multiplexer, which is chapter 4.",
            },
          ],
        },
        {
          kind: "code",
          caption:
            "The rotating barrel shifter: an 8-bit value, a 3-bit amount, one branch per amount, in one combinational block.",
          code: `module barrel_rotate (
  input  wire [7:0] v,
  input  wire [2:0] sh,
  output reg  [7:0] y
);
  always @(*) begin
    case (sh)
      3'd0: y = v;
      3'd1: y = {v[6:0], v[7]};
      3'd2: y = {v[5:0], v[7:6]};
      3'd3: y = {v[4:0], v[7:5]};
      3'd4: y = {v[3:0], v[7:4]};
      3'd5: y = {v[2:0], v[7:3]};
      3'd6: y = {v[1:0], v[7:2]};
      3'd7: y = {v[0:0], v[7:1]};
      default: y = v;
    endcase
  end
endmodule`,
          note: "Check the field widths as you read down: 7+1, 6+2, 5+3, 4+4, 3+5, 2+6, 1+7. Every one totals eight. That is not a coincidence to admire — it is the thing Verilator checks, and it is a WIDTHEXPAND or WIDTHTRUNC warning the moment one row is wrong.",
        },
        {
          kind: "table",
          head: ["sh", "Top 8-sh bits of the answer", "Bottom sh bits of the answer", "Field widths"],
          rows: [
            ["0", "v[7:0] — the whole value, handled separately", "—", "8 + 0"],
            ["1", "v[6:0]", "v[7]", "7 + 1"],
            ["2", "v[5:0]", "v[7:6]", "6 + 2"],
            ["3", "v[4:0]", "v[7:5]", "5 + 3"],
            ["4", "v[3:0]", "v[7:4]", "4 + 4"],
            ["5", "v[2:0]", "v[7:3]", "3 + 5"],
            ["6", "v[1:0]", "v[7:2]", "2 + 6"],
            ["7", "v[0:0]", "v[7:1]", "1 + 7"],
          ],
          caption:
            "Read the table across a row and the rule is visible: the top of the answer is the bottom of the input, and the bottom of the answer is the top of the input. Only the boundary moves.",
        },
        {
          kind: "para",
          text: "There is a second way to build the same thing, and once you see it you will recognise real barrel shifters on silicon. Instead of one mux per amount, you use one mux per *bit* of the amount, in layers. Layer 1 can shift by 0 or 1. Layer 2 takes layer 1's output and can add a further 0 or 2. Layer 3 can add 0 or 4. Choosing 1, 0, 1 across the three layers adds up to 5, so any amount from 0 to 7 falls out of three stacked rows of two-way switches.",
        },
        {
          kind: "code",
          caption:
            "The layered version. Three layers, one per bit of the shift amount, and a rotate falls out of three ordinary muxes.",
          code: `module barrel_rotate_layered (
  input  wire [7:0] v,
  input  wire [2:0] sh,
  output wire [7:0] y
);
  // Each layer either passes the value through or adds its own power of two.
  wire [7:0] l1 = sh[0] ? {v[6:0], v[7]}     : v;
  wire [7:0] l2 = sh[1] ? {l1[5:0], l1[7:6]} : l1;
  wire [7:0] l3 = sh[2] ? {l2[3:0], l2[7:4]} : l2;

  assign y = l3;
endmodule`,
          note: "This is the structure real hardware uses, because it is regular: 3 layers of 8 two-to-one muxes, 24 muxes in total, laid out in a grid. Set sh to 5, that is binary 101, and the layers add 1 + 0 + 4. The `case` version above is easier to read and produces the same eight answers — choose whichever is clearer, and expect to meet the layered one in a datasheet.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why a plain shift needs no barrel at all",
          text: "If the operation is a shift rather than a rotate, the shift operator already does the whole job: `assign y = v << sh;` moves by any runtime amount in one line, with no muxes and no case. The bits pushed off the end are simply discarded, which is exactly what a shift should do. Barrel shifters exist for rotates, and for shifts by an amount wider than the value, where the operator cannot help. That asymmetry is worth remembering — it is the shortest answer to a surprisingly common interview question.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes) — check the barrel, then break it on purpose",
          items: [
            "Take v = 8'b1011_0101. Work out the answer for sh = 0, 1 and 2 using the table's two columns. Write the three 8-bit answers.",
            "Continue for sh = 3 through 7. Then check one of them by moving the digits: rotating 10110101 left by 3 means taking the first three digits 101 off the front and putting them on the end, giving 10101101. Does your sh = 3 answer match?",
            "A useful shortcut to prove the table is right: rotating left by 7 is the same as rotating right by 1. Compute both and confirm they agree.",
            "Now change the port to `input wire [3:0] sh` — one bit wider, so sh can be 8 to 15. Work out what your barrel does for sh = 8. Then decide, in one sentence, how you want to handle it, and write the one line that does it.",
            "Finally, delete the `default` line from the case and look at the tool's output. Name the warning you get, and explain what the hardware would be doing that the design did not intend.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing a shift amount of 4 into `v << 4` on a 4-bit value, or leaving an oversized amount unhandled on a barrel.",
          right: "Understand that `4'b1010 << 4` is `4'b0000`, then choose deliberately between masking and clamping.",
          why: "A shift amount larger than the value's width pushes every bit out. Every 1 that was there is now gone, and the result is zero — not the original, and not an error. If the amount arrives on a pin, that pin will eventually present a value you did not anticipate. Masking it with `sh[2:0]` means a request for 8 is treated as a request for 0; clamping it means a request for anything above 7 is treated as 7. Either is a decision. Doing nothing means the hardware invented one for you.",
        },
        {
          kind: "trap",
          wrong: "A `case` on the shift amount with no `default`, inside `always @(*)`.",
          right: "Add `default: y = v;` and make sure every branch of the case assigns `y`.",
          why: "Verilator will tell you LATCH or CASEINCOMPLETE, and chapter 4 tells you why: a combinational block that does not assign its output on every path has to remember the previous value, so the tool infers a latch. A latch in a barrel shifter means the output can depend on what happened last time — which is a memory, in a circuit whose entire point is that it has none.",
        },
        {
          kind: "check",
          items: [
            {
              q: "v = 8'b0001_0000 and sh = 3'd3. What is y, and which bit does it end up in?",
              a: "The single 1 starts in bit 4, and a rotate left by 3 moves every bit three places up, so it lands in bit 7. y = 8'b1000_0000. Check it straight off the table row: sh=3 uses `{v[4:0], v[7:5]}`, so the top five bits of the answer are v[4:0] = 1,0,0,0,0 and the bottom three are v[7:5] = 0,0,0. That is 1000_0000 — the same answer.",
            },
            {
              q: "Why does the `case` version need a special branch for sh = 0, when the formula `{v[7-k:0], v[7:8-k]}` should cover every amount?",
              a: "At k = 0 the second field is `v[7:8]`, an empty and illegal range — there is no such thing as a slice whose start index is one below its end index. The first field is also the entire value, so the special branch is really just `y = v;`. Zero is a legitimate and very common shift amount, so it has to be answered explicitly rather than left to a formula that cannot express it.",
            },
            {
              q: "You need to move an 8-bit value by an amount on a 4-bit pin, and you decide the value should be rotated. What is the smallest change that makes the design well-defined for every possible pin value?",
              a: "Reduce the amount to the bits that matter before you use it. Either mask it — `wire [2:0] amt = sh[2:0];`, which treats a request for 8 as a request for 0 and makes the barrel wrap — or clamp it — `wire [2:0] amt = (sh > 3'd7) ? 3'd7 : sh[2:0];`, which saturates at a full width. Both are one line and both are defensible. What is not defensible is leaving the range unhandled, because a 4-bit pin really will present 8 to 15, and every slice for those values really is out of range. You have simply not decided what the hardware does yet.",
            },
          ],
        },
      ],
    },
    {
      slug: "common-mistakes",
      title: "When a shifter misbehaves, start here",
      lede: "The symptoms, what actually causes them, and which drawing question to ask first.",
      blocks: [
        {
          kind: "para",
          text: "Shifters fail in a small number of recognisable ways, and the symptom almost always tells you which one you have. The table below is deliberately arranged by symptom rather than by topic, because that is how you will meet it: something is wrong, you have a waveform, and you need to get to the cause quickly.",
        },
        {
          kind: "table",
          head: ["What you see", "What it usually means", "Where to look first"],
          rows: [
            ["Bits move several places in one clock edge", "blocking = used inside a clocked block instead of nonblocking <=", "the assignment operator on every line of the always block"],
            ["The register shifts the wrong way", "the concatenation fields are in the wrong order", "which side the fresh bit is written on"],
            ["A load is sometimes ignored", "load tested after direction, so a higher-priority branch caught it", "the order of the if / else if tests"],
            ["The value is wider or narrower than expected", "concatenation field widths do not sum to the destination width", "count the bits in every field; expect a WIDTHEXPAND or WIDTHTRUNC warning"],
            ["Rotating by 8 or more gives zeros", "the shift amount can exceed the value width and nothing handled it", "the width of the amount pin, and the default branch"],
            ["The output holds a value it should not", "a combinational case with no default, so a latch was inferred", "expect LATCH or CASEINCOMPLETE from the tool"],
            ["An LFSR outputs all zeros forever", "it was seeded with zero, which is a fixed point of the feedback", "the reset value of the register"],
            ["The waveform prints one step behind the design", "$display runs before the nonblocking update lands", "add a small delay after the posedge in the display statement"],
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes) — debug a broken shifter",
          items: [
            "You are given a shift register that is supposed to shift left, but the trace shows the whole word jumping end to end in one clock. Read the line and find the error: it is the assignment operator, not the concatenation. Write the corrected line and say in one sentence why the wrong version cascades.",
            "You are told load works, but a value loaded while `dir` is high never appears. Reorder the if / else if chain so the load override is honoured, and say which behaviour now has the lowest priority.",
            "You are handed a line labelled shift left that actually shifts right. Write down the rule for telling the two apart from the concatenation alone, then apply it to two lines of your own and label each one.",
            "Build a trace check: for v = 4'b0001 and a rotate-left barrel with a 2-bit amount, write all four answers and confirm that amount 0 gives the value unchanged. Then say which amount is the first one your 2-bit pin cannot express, and what has to happen for it.",
            "Finish by writing one sentence you could paste above your own shift registers: something along the lines of draw the boxes, then write the code, and treat every warning as a disagreement about the drawing.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The fastest fix for any of these",
          text: "Go back to the four boxes labelled q3 q2 q1 q0 and trace two clock edges on paper. Not one edge — two, because a one-edge trace will not reveal a cascading bug, which is exactly the class of bug where a single step looks correct. Whatever the code does, the drawing is the specification. If the code and the drawing disagree, the drawing wins and the code is what needs changing.",
        },
      ],
    },
    {
      slug: "check-yourself",
      title: "Check yourself",
      lede: "Six questions with worked answers, and what to do next.",
      blocks: [
        {
          kind: "check",
          items: [
            {
              q: "A 4-bit register holds 4'b0110 and you clock it once with a left shift and sin = 1. What is it afterwards, and which bit was lost?",
              a: "The left shift rule is `{q[2:0], d}`: new bit 3 is old bit 2 = 1, new bit 2 is old bit 1 = 1, new bit 1 is old bit 0 = 0, and new bit 0 is d = 1. So the answer is 1101. The bit that was lost is the old q[3], which held 0 — it had no slot in the new value. One bit entered at the bottom and one left off the top, so the width never changes.",
            },
            {
              q: "What is the difference between `q << 2` and a shift register that shifts twice?",
              a: "`q << 2` is combinational. It computes a shifted copy of q the moment you look at it, and holds nothing. A shift register shifting twice takes two clock edges, and between those edges it is holding a real value in real flip-flops. The results can be identical; the hardware is not. `q << 2` is one expression's worth of logic with no memory, a register is storage that moves one place per edge.",
            },
            {
              q: "Name the four shift register architectures, and say which one turns a 32-bit register into a serial link.",
              a: "SISO (serial in, serial out), SIPO (serial in, parallel out), PISO (parallel in, serial out) and PIPO (parallel in, parallel out). The one for a serial link is PISO: the 32 bits are loaded from the register in parallel, then shifted out one bit per clock on a single wire.",
            },
            {
              q: "Why does a rotate need a circuit at all, when a shift is just `v << sh`?",
              a: "Because a shift discards what falls off, and the shift operator does that for free — one expression, no muxes. A rotate has to *keep* the bit that fell off and feed it back in at the other end, and how much it moves depends on the runtime value of the shift amount. The shift operator has no way to express that, so you build it: one multiplexer per amount, or one multiplexer layer per bit of the amount. That is what a barrel shifter is.",
            },
            {
              q: "In the bidirectional shifter, why does the `load` test have to come before the `dir` test?",
              a: "Because an `if` / `else if` chain executes the first true branch and ignores the rest. If `dir` is tested first and happens to be 1, the shift branch runs and the load request is discarded — the value on the bus never gets stored, with no warning anywhere. Priority is behaviour, so the override has to be written first. Reset goes above load, because a register being reset should end up in a known state whatever else is on its pins.",
            },
            {
              q: "Your barrel shifter is correct for amounts 0 to 7 and returns 8'b0000_0000 for anything larger. What is wrong, and what are two reasonable fixes?",
              a: "The amount pin is wider than the value, so it can present values your case never handled, and every slice for those values is out of range. Two honest fixes: mask the amount to the bits that matter — `sh[2:0]`, which treats a request for 8 as a request for 0 and turns the barrel into a wrapping one — or clamp it, with `(sh > 3'd7) ? 3'd7 : sh[2:0]`, which saturates at a full width. Leaving it unhandled is not a third option. It just means the hardware invented a behaviour you did not choose.",
            },
          ],
        },
        {
          kind: "para",
          text: "That is the chapter. You can now build the four architectures, control direction and loading in a single clocked block, tell a shift operator from a shift register, explain why rotate and shift differ by one connection, and build a runtime barrel shifter out of multiplexers. The one habit worth keeping is the first one: draw the boxes, then write the code, and treat the tool's warnings as a disagreement about the drawing rather than as noise.",
        },
      ],
    },
  ],
  glossary: [
    { term: "barrel shifter", meaning: "A circuit that moves a value by a runtime-selected number of bit positions, built from layers of multiplexers, in a single cycle." },
    { term: "bi-directional shift register", meaning: "A shift register with a control input that chooses whether bits move toward the high end or the low end." },
    { term: "concatenation", meaning: "The `{ }` operator, which glues values end to end into one wider value, leftmost piece landing in the highest bits." },
    { term: "enable", meaning: "A control input that lets a register update on some clock edges and hold its value on the others." },
    { term: "LFSR", meaning: "Linear feedback shift register — a shift register whose incoming bit is an XOR of some of its own bits, producing a long pseudo-random sequence." },
    { term: "load", meaning: "A control input that makes a register take a whole parallel word from a bus instead of shifting, so a value can be loaded in one clock." },
    { term: "multiplexer (mux)", meaning: "A circuit that routes one of several inputs to a single output based on a select value — the building block of the barrel shifter." },
    { term: "PIPO", meaning: "Parallel in, parallel out — a shift register that loads and presents a whole word, with shifting available on the same flip-flops." },
    { term: "PISO", meaning: "Parallel in, serial out — a shift register that loads a whole word then shifts it out one bit per clock. A serialiser." },
    { term: "rotation", meaning: "A shift in which the bit that falls off one end reappears at the other end, so no information is lost." },
    { term: "serialisation", meaning: "Sending a whole value one bit at a time over a single wire, done with a PISO shift register." },
    { term: "shift amount", meaning: "How many places a shift or rotate moves a value, given as a number in the shift operator or on a barrel shifter's amount pin." },
    { term: "shift register", meaning: "A row of flip-flops wired so each copies its neighbour, moving every bit one place on each clock edge." },
    { term: "SISO", meaning: "Serial in, serial out — one bit in per clock, one bit out per clock. A delay line, a tap, or the core of an LFSR." },
  ],
  nextStep:
    "Read this page with a pencil, because the hand trace in the first topic is the thing that makes the rest stick. Then open the first lesson, The Shifter Family, where you build the bidirectional load-enabled register in the workspace, verify both directions in a testbench, and finish with a combinational rotate — the same barrel shifter you worked through by hand here, written as code. When a WIDTHEXPAND or WIDTHTRUNC warning appears on one of your concatenations, come back to the width rule in the second topic and count the fields.",
};
