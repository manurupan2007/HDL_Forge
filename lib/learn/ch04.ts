import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 4,
  chapterSlug: "multiplexers",
  title: "Multiplexers & Selectors",
  readMinutes: 21,
  youWillBeAbleTo: [
    "Say in plain words what a multiplexer does, and name its two halves: the data inputs and the select lines",
    "Write a 2:1 multiplexer as a single line of Verilog using the ternary `? :` operator",
    "Work out how many select lines a mux over N inputs needs, and prove the rule by counting",
    "Write a 4:1 and an 8:1 multiplexer with `case` inside `always @(*)`, including a `default` branch",
    "Predict the output of a mux for a given select value and set of data inputs, by hand, before you compile",
    "Say why widening the data does not change the select lines, and what a width mismatch does instead",
    "Explain what a latch is, why an incomplete `case` creates one, and fix it in one line",
    "Reuse one mux body for 4-bit, 8-bit and 32-bit data by giving it a parameter",
  ],
  mentalModel: [
    {
      title: "A mux is a question, and the select lines are the answer",
      body: "A multiplexer (short for MUX) is a device with several inputs, one output, and a few control wires called select lines. Its whole job is to answer one question: 'out of these, which one do I want?' You tell it the answer on the select lines, and the chosen input passes through to the output. Nothing is stored. Nothing is computed. The output is always a copy of one of the inputs, chosen right now, this instant. That is the entire idea, and everything else in this chapter is a way of writing it down: the ternary `? :` is a mux with two inputs, a `case` statement is a mux with as many inputs as you have labels, and a parameter is a mux that does not care how wide the data is.",
    },
    {
      title: "The select lines are a number written in binary",
      body: "Here is the fact that makes the whole chapter predictable. If you have N data inputs, the select lines are a binary number from 0 to N-1, and the number says which input to pass. N = 2 needs one select line. N = 4 needs two. N = 8 needs three. N = 16 needs four. The rule is simply that k select lines can be set to 2^k different values, and you need exactly N different values, so k = the number of steps to double from 1 up to N. Read the select value as a plain number and index your inputs with it: sel = 2'b11 means 'input number 3', which is the fourth one. Once you see the select as an index rather than as a code, mux bugs stop happening, because there is nothing to decode in your head.",
    },
  ],
  topics: [
    {
      slug: "what-a-mux-does",
      title: "One output, many inputs, one question",
      lede: "Before any Verilog: what a multiplexer is, and why it is the most reused block in the track.",
      blocks: [
        {
          kind: "analogy",
          text: "A jukebox holds eight records and has one speaker. You do not need eight speakers. You need one speaker and a way to say which record is currently sitting in the pickup. The record number is 3 bits wide, because eight records need eight different numbers, and 3 bits can be set to eight different values. That is a multiplexer, with no difference at all: eight songs in, one speaker out, three lines choosing which song.",
        },
        {
          kind: "para",
          text: "Say the idea in the fewest words you can. A mux takes several values in on one side, takes a number on the select lines, and puts exactly one of those values on the output. It is a wire that moves. The selected value is copied to the output, unchanged, continuously, for as long as the select lines hold that value.",
        },
        {
          kind: "define",
          items: [
            { term: "data input", meaning: "One of the values the mux can pass through. There are several of these, and they are usually all the same width." },
            { term: "select line", meaning: "A control wire that says which input to choose. The select lines together form a number." },
            { term: "output", meaning: "The single wire the chosen input appears on. It is the same width as the data inputs." },
            { term: "N:1 mux", meaning: "A mux with N data inputs and one output. You will write 2:1, 4:1 and 8:1 in this chapter." },
          ],
        },
        {
          kind: "table",
          head: ["Name", "Data inputs", "Select lines", "Output"],
          rows: [
            ["2:1 mux", "2 (a and b)", "1 (s)", "1 — a or b"],
            ["4:1 mux", "4 (a, b, c, d)", "2 (s)", "1 — one of the four"],
            ["8:1 mux", "8 (a through h)", "3 (s)", "1 — one of the eight"],
            ["16:1 mux", "16", "4", "1 — one of the sixteen"],
          ],
          caption:
            "The middle column doubles every time. That doubling is not a style choice — it is forced by counting, and the next topic after the 2:1 mux works the counting out on paper.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why this chapter matters more than it looks",
          text: "A mux is the universal selector. Once you can say 'choose one of these', you can build a register file that picks a register, an instruction decoder that picks a control signal, an adder that picks a carry-in, or a memory that picks a row. The chapter summaries call this out on purpose: almost every datapath you will meet later is a nest of muxes deciding which value moves next. Muxes are the joints of digital design.",
        },
        {
          kind: "para",
          text: "One more property is worth holding on to, because it explains why muxes are so cheap. All the data inputs are present all the time, whether or not they are selected. Nothing is switched off. The select lines do not send a value somewhere; they only decide which input the output is wired to look at. So a mux is a small amount of extra logic, not a chunk of extra storage. That is why synthesised designs are full of them.",
        },
        {
          kind: "check",
          items: [
            {
              q: "In plain words, what does a 4:1 multiplexer do?",
              a: "It has four data inputs and one output. A 2-bit number on its select lines chooses which of the four inputs appears on the output. The chosen input is copied to the output unchanged, and the other three are simply ignored at that moment.",
            },
            {
              q: "Does a mux keep a copy of the input it selected?",
              a: "No. There is no storage in a mux. The output is continuously connected to the selected input, so if that input changes, the output changes with it, with no delay beyond gate propagation. Change the select lines and the output stops following the old input and starts following the new one, immediately.",
            },
          ],
        },
      ],
    },
    {
      slug: "ternary-mux2",
      title: "The ternary operator is a 2:1 mux",
      lede: "`s ? b : a` is a complete multiplexer. Read it as a sentence: if s then b, otherwise a.",
      blocks: [
        {
          kind: "para",
          text: "You met the ternary conditional in chapter 1, in the form `condition ? 1'b1 : 1'b0`, where it turned a yes/no question into a 0 or a 1. Now remove the restriction that both branches are single bits. If the two branches are whole values, the operator does the same job with data: it hands back one of two candidate values. That is a 2:1 multiplexer, in one line.",
        },
        {
          kind: "code",
          caption: "A complete 2:1 multiplexer. One line of logic, one line of comment.",
          code: `module mux2 (
  input  wire a,
  input  wire b,
  input  wire s,
  output wire y
);
  assign y = s ? b : a;
endmodule`,
          note: "Read it aloud: 'y is b if s, otherwise a.' The value after the ? is used when the condition is true. The value after the : is used when it is false. Nothing is computed — a and b are copied straight through.",
        },
        {
          kind: "table",
          head: ["s", "What `s ? b : a` gives", "You would read that as"],
          rows: [
            ["0", "a", "s is false, so take the branch after the colon"],
            ["1", "b", "s is true, so take the branch after the question mark"],
          ],
          caption:
            "Two rows, because a 2:1 mux has one select line and one select line has two values. That is the whole truth table. Nothing else can happen.",
        },
        {
          kind: "analogy",
          text: "A light switch with two positions and one bulb. The switch is the select line, the two wires arriving at the fitting are the data inputs, and the bulb is the output. You do not dim the bulb, you do not average the two wires, you simply connect the output to one of them. The ternary is that connection, written as text.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Write out the two inputs as a and b, and write the rule `y = s ? b : a` underneath.",
            "Make a table with three columns: s, which input is the answer, and y. Fill in the row for s = 0. The rule is 's is not true', so you take what comes after the colon.",
            "Fill in the row for s = 1. The rule is 's is true', so you take what comes after the question mark.",
            "Now set a = 1 and b = 0. Work out y for s = 0 and again for s = 1. Then set a = 0 and b = 1 and do it again. Four rows total, and they match the table in the testbench for `s=0 routes a to y2` and `s=1 routes b to y2`.",
            "Finally, try to break it: what happens if s is x? Write down what you expect, then check it in the simulator. The answer is the surprising one, and topic five comes back to it.",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign y = s ? a : b;` when you meant 's = 0 gives a, s = 1 gives b'.",
          right: "`assign y = s ? b : a;`",
          why: "The branches are the wrong way round. The value after the ? is used when the condition is true, and the value after the : when it is false. Swapping them builds a mux that is wired backwards — it still compiles, it is still a legal 2:1 mux, and no warning appears, because the circuit is perfectly valid. It is just answering the opposite question. The only way to catch it is to trace two rows by hand before compiling.",
        },
        {
          kind: "trap",
          wrong: "Reading `s ? b : a` as 'choose a, unless s, then b'.",
          right: "Read it left to right as an if-then-else: 'if s, then b, otherwise a'.",
          why: "The `?` binds to the condition on its left, and the first branch is the *true* case. Beginners often assume the symbol is doing the selecting and that the order is a preference list. It is not a preference list — the order carries the meaning, and reversing it reverses the circuit.",
        },
        {
          kind: "check",
          items: [
            {
              q: "For `assign y = s ? b : a`, what is y when s = 1?",
              a: "b. s is 1, which is true, so the value after the question mark is used. b is after the question mark. The colon branch is only reached when the condition is false.",
            },
            {
              q: "You want 'when s = 1 output a, otherwise output b'. What do you write?",
              a: "`assign y = s ? a : b;`. The true case (s = 1) is a, so a goes after the question mark, and the false case (s = 0) is b, so b goes after the colon.",
            },
          ],
        },
      ],
    },
    {
      slug: "mux-from-gates",
      title: "The same mux, spelled with gates",
      lede: "A mux is not magic — it is two AND gates, one NOT, and one OR, and the ternary is a shortcut for all four.",
      blocks: [
        {
          kind: "para",
          text: "So far the mux has been one line of expression, and a beginner is right to feel slightly suspicious. What does that line actually turn into? The answer is reassuringly small. To pass a when s is 0, and b when s is 1, you AND a with 's is 0' and b with 's is 1', then OR those two results together. The 's is 0' signal is just `~s`. That is four gates, and that is the whole device.",
        },
        {
          kind: "code",
          caption: "The 2:1 mux written out as gates. The wires ns, p and q are the internal connections.",
          code: `module mux2_gates (
  input  wire a,
  input  wire b,
  input  wire s,
  output wire y
);
  wire ns;   // s inverted: high exactly when s is 0
  wire p;    // a, but only when s is 0
  wire q;    // b, but only when s is 1

  not u_ns (ns, s);
  and u_p  (p, ns, a);
  and u_q  (q, s,  b);
  or  u_y  (y, p,  q);
endmodule`,
          note: "Gate primitives in Verilog take the output first, then the inputs. `and u_p (p, ns, a)` means 'a two-input AND whose result is p, from ns and a'. The name after the keyword — u_p — is just a label you can read in a waveform.",
        },
        {
          kind: "code",
          caption: "And the same circuit as one expression, which is what you will actually write.",
          code: `assign y = (~s & a) | (s & b);`,
          note: "This is bit-for-bit the same circuit as the four gates above. The synthesiser sees one expression and builds the same AND-OR network. Writing the expression is the right choice; writing the gates is how you prove to yourself that the expression is real.",
        },
        {
          kind: "steps",
          title: "Prove on paper that the two versions are identical",
          items: [
            {
              head: "Case s = 0",
              body: "Then ~s = 1 and s = 0. The first AND is `1 & a` = a. The second AND is `0 & b` = 0, because anything ANDed with 0 is 0. So y = a | 0 = a. The ternary gives the same thing: s is false, so it takes a.",
            },
            {
              head: "Case s = 1",
              body: "Then ~s = 0 and s = 1. The first AND is `0 & a` = 0. The second AND is `1 & b` = b. So y = 0 | b = b. The ternary gives the same thing: s is true, so it takes b.",
            },
            {
              head: "That is the whole proof",
              body: "Two cases, and both versions agree in both cases, so they are the same circuit for every input. Nothing was assumed. This is the standard way to argue in hardware design: enumerate the cases, show the outputs match.",
            },
            {
              head: "Now notice what the gates are doing",
              body: "Each AND acts as a gate on one path: it lets its data through only when its control line is 1, and it forces the output to 0 otherwise. Two ANDs each holding one path open, then one OR merging them. A mux is one of these held-open paths, doubled up. The moment you see that, larger muxes stop being mysterious.",
            },
            {
              head: "The general version, before we go to code",
              body: "An N:1 mux is the same picture with more arms. Every data input gets an AND gated by 'my select code matches', and all of those are ORed together. For 4:1 that is four ANDs, two NOTs, and one OR — or, more usually, a decode of the two select bits feeding four ANDs. The expression and the `case` you are about to write are both just a tidier way of saying the same sum.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why bother learning the gate form at all",
          text: "Two reasons, and both are about debugging. First, when a mux gives the wrong answer you need to know which of the four pieces is at fault, and you can only do that if you know what the pieces are. Second, chapter 5 builds an adder out of these same primitives, and the adder's carry logic is a mux in disguise. Gate-level reading is a skill, and this is the cheapest place to get it.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw the four gates on paper: a NOT on s, an AND of ~s with a, an AND of s with b, an OR of the two results.",
            "Trace the path for s = 0: write 1 next to ~s, a next to the first AND's data input, 0 next to the second AND's data input, and work down to y.",
            "Trace it again for s = 1, and confirm y is b.",
            "Now write the truth table with columns s, ~s, p, q, y. Four columns of one bit each, and p should be a when s is 0 and 0 when s is 1.",
            "Add the ternary's answer as a final column and confirm the two agree in every row.",
          ],
        },
      ],
    },
    {
      slug: "select-lines-log2",
      title: "How many select lines: counting to the answer",
      lede: "k select lines give 2^k choices, so the count is forced. Here it is derived, not asserted.",
      blocks: [
        {
          kind: "analogy",
          text: "A house number. If a street has two houses, the number is a single digit: 0 or 1. If it has four houses, you need two digits, because 0 to 3 takes two binary digits. If it has sixteen houses, four digits, because 0 to 15 takes four. The number of digits is not a choice — it is the smallest number that can write down every house on the street. Select lines are house numbers, and the data inputs are the houses.",
        },
        {
          kind: "para",
          text: "Now do the counting instead of trusting the table at the top of this chapter. Start from the smallest possible case. One select line is one wire, and one wire is either 0 or 1, so it can be set to 2 different values. If you need 2 different values, one line is enough and you have a 2:1 mux. Two select lines are two wires, and they can be set to 4 different values: 00, 01, 10, 11. So two lines serve 4 inputs. Three lines give 8 patterns, so three lines serve 8 inputs.",
        },
        {
          kind: "table",
          head: ["Select lines", "Different values they can hold", "So the mux can choose among"],
          rows: [
            ["1", "2 (0, 1)", "2 data inputs — a 2:1 mux"],
            ["2", "4 (00, 01, 10, 11)", "4 data inputs — a 4:1 mux"],
            ["3", "8 (000 through 111)", "8 data inputs — an 8:1 mux"],
            ["4", "16 (0000 through 1111)", "16 data inputs — a 16:1 mux"],
            ["5", "32", "32 data inputs"],
            ["6", "64", "64 data inputs"],
          ],
          caption:
            "Each extra select line doubles the count, because it doubles the number of possible patterns. The number you want must be a power of two, or you must round up to the next power and leave the extra combinations unused.",
        },
        {
          kind: "para",
          text: "Read the rule both ways, and you will not forget it. To get the number of select lines, start at 1 and keep doubling until you reach or pass your number of inputs: 1, 2, 4, 8, 16. How many doublings did it take? That is your select line count. And to go the other way, take the number of inputs and count the doublings you had to skip. Four inputs is 2, because 1 doubles to 2 and 2 doubles to 4. Sixteen inputs is 4, because 1 to 2 to 4 to 8 to 16.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "What if N is not a power of two?",
          text: "Say you want to choose among 3 inputs. There is no 1.58 lines. You build a 4:1 mux and leave one input unconnected, or tie it to a value you do not care about. The select value 2'b11 is then never used. A 6-input selector is an 8:1 mux with two arms spare. This is why real designs use powers of two everywhere, and it is not superstition — it is what the counting rule costs.",
        },
        {
          kind: "table",
          head: ["sel[1]", "sel[0]", "sel as a number", "Input chosen", "y is"],
          rows: [
            ["0", "0", "0", "a", "a"],
            ["0", "1", "1", "b", "b"],
            ["1", "0", "2", "c", "c"],
            ["1", "1", "3", "d", "d"],
          ],
          caption:
            "The whole 4:1 mux, on paper. Read sel as a plain number and count the data inputs from zero: input number 0 is a, number 3 is d. sel[1] chooses the pair (top two or bottom two); sel[0] chooses within the pair.",
        },
        {
          kind: "para",
          text: "Look at that table a second time and you will see the structure that scales. sel[1] alone picks between the top half {a, b} and the bottom half {c, d}. sel[0] alone picks within whichever half is active. For 8:1, sel[2] picks the half, sel[1] picks the pair, sel[0] picks within the pair. A 16:1 mux adds one more layer of the same thing. Selection is a tree, and each select bit walks one level down it.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write the doubling out from scratch: start at 1, double to 2, double to 4, double to 8, double to 16. Under each number write how many select lines you had at that point: 0, 1, 2, 3, 4. You have just derived the rule without a formula.",
            "Now answer three questions with the doubling: how many select lines does a 16-input mux need? (Four.) An 8-input mux? (Three.) A 32-input mux? (Five.)",
            "Prove the 4:1 case in full. Write the four data inputs a, b, c, d across the top. Write the two select lines s1 and s0 beneath them. For each of the four settings of s1s0, write which input reaches y and say why in words. Then fill the table above from your own list rather than copying it.",
            "Do the same proof for a 5-input mux. How many select lines did you use? Write down what happens when the select value is the unused one, 2'b11 for a 4-line selector over 5 inputs. Which of your five inputs would a real design connect to that arm?",
            "Finally, one line of your own: 'to choose among N inputs I need ___ select lines because ___'. Write it in plain English, in full. If you can fill both blanks from the doubling, the topic is done.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "How many select lines does a 4:1 multiplexer have, and why?",
              a: "Two. You need four distinct settings to name four inputs: 00, 01, 10, 11. One line can only be 0 or 1, which is two settings, not four. Two lines give 2² = 4 settings, which is exactly enough. The count is forced by the number of choices, not chosen by style.",
            },
            {
              q: "You need to choose among 12 inputs. How many select lines, and what happens to the extra settings?",
              a: "Four, because 3 lines give only 8 settings and 4 give 16. You build a 16:1 mux and use 12 of the 16 arms; the remaining 4 select values (1100 through 1111) are never used. This is the standard answer whenever N is not a power of two.",
            },
          ],
        },
      ],
    },
    {
      slug: "case-and-always",
      title: "Past two inputs: `case` inside `always @(*)`",
      lede: "Two branches fit in a ternary. Five fit in a `case` — and you need a `default` or you get a latch.",
      blocks: [
        {
          kind: "para",
          text: "The ternary handles exactly two branches. You could chain ternaries for more, but nesting them is how beginners write unreadable code by accident. Verilog has a construct made for this: the `case` statement, which looks at one expression and runs the branch whose label matches. Wrapped in an `always @(*)` block, it is the standard way to write a mux of any size.",
        },
        {
          kind: "para",
          text: "You have not met `always @(*)` yet, so here it is in one line. An `always` block is a region of code the tool re-runs whenever something it depends on changes. The `@(*)` is the dependency list, and the `*` means 'work it out for me, from whatever signals I read inside'. So `always @(*)` re-runs every time any input to the block changes. It is not a loop and it has no end condition: it just keeps the output in step with the inputs, exactly like an `assign`, which is why a mux written this way is still purely combinational.",
        },
        {
          kind: "table",
          head: ["You write", "What it does"],
          rows: [
            ["always @(*)", "Open a block that re-runs whenever any signal it reads changes."],
            ["begin", "Start of the block. You can omit it when the block holds a single statement."],
            ["case (s)", "Compare the value of s against each label below, top to bottom."],
            ["2'b00: y = a;", "A label and its statement. The first label that matches s is the one that runs."],
            ["default: y = d;", "Runs when nothing above matched. It is the safety net."],
            ["endcase", "End of the case. Also needs a semicolon."],
            ["end", "End of the block."],
            ["=", "Inside a block, plain equals assigns. Outside a block you need the keyword assign."],
          ],
          caption:
            "One change from chapter 1: inside an always block the assignment is `=`, not `assign y =`. The keyword assign is only for statements that live directly in the module body.",
        },
        {
          kind: "code",
          caption: "The 4:1 mux. This is the shape the rest of the chapter is about.",
          code: `module mux4 (
  input  wire [3:0] a,
  input  wire [3:0] b,
  input  wire [3:0] c,
  input  wire [3:0] d,
  input  wire       [1:0] s,
  output reg  [3:0] y
);
  always @(*) begin
    case (s)
      2'b00: y = a;
      2'b01: y = b;
      2'b10: y = c;
      default: y = d;   // covers 2'b11, and any x or z on the select
    endcase
  end
endmodule`,
          note: "Note `output reg [3:0] y`. Because y is now assigned from inside a block rather than by a continuous assign, it has to be declared reg. In this context reg does not mean 'stores something' — it means 'this signal gets its value from a block'. The mux still has no memory.",
        },
        {
          kind: "analogy",
          text: "A telephone menu. You press one digit and the system runs one branch of a script. The menu is the `case`, each option line is a label, and the catch-all line at the end — 'for all other options, press 0 to speak to a person' — is the `default`. Without that last line, some presses do nothing at all, and the caller is left listening to nothing. That is exactly what happens in a `case` with no `default`.",
        },
        {
          kind: "table",
          head: ["s", "Which label matched", "y becomes", "The value you would write down"],
          rows: [
            ["2'b00", "2'b00", "a", "whatever a is, all 4 bits of it"],
            ["2'b01", "2'b01", "b", "whatever b is"],
            ["2'b10", "2'b10", "c", "whatever c is"],
            ["2'b11", "none of the three, so default", "d", "whatever d is"],
          ],
          caption:
            "The complete behaviour of the module above. Four settings in, four behaviours out, and no setting where the block does nothing.",
        },
        {
          kind: "para",
          text: "The 8:1 mux is the same file with more lines. Three select lines give eight settings, you write seven labels in binary counting order, and the eighth one becomes the `default`. Write your labels in counting order — 000, 001, 010, 011, 100, 101, 110 — because a gap or a repeat in that list is the most common mistake in a long case, and counting order makes both visible at a glance.",
        },
        {
          kind: "code",
          caption: "The 8:1 mux. Notice that the only difference is three select bits and one more line.",
          code: `module mux8 (
  input  wire [3:0] a, b, c, d, e, f, g, h,
  input  wire       [2:0] s,
  output reg  [3:0] y
);
  always @(*) begin
    case (s)
      3'b000: y = a;
      3'b001: y = b;
      3'b010: y = c;
      3'b011: y = d;
      3'b100: y = e;
      3'b101: y = f;
      3'b110: y = g;
      default: y = h;   // 3'b111
    endcase
  end
endmodule`,
          note: "The last labelled branch is written as `default` rather than as 3'b111. Both work for a known select value; `default` additionally gives a defined answer when s holds an x, which the next topic explains.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Two ways to write the same mux, and when to use each",
          text: "For two inputs, `assign y = s ? b : a;` with an `output wire` is shorter and clearer, so use it. For four or more, `always @(*)` with a `case` is shorter and clearer, so use that. Never drive the same output from both an `assign` and a block — two drivers on one wire is a genuine conflict and the result is x. Pick one style per output and stay there.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Take a = 4'hA, b = 4'hB, c = 4'hC, d = 4'hD. Write them on paper as a = 1010, b = 1011, c = 1100, d = 1101, so you can see all four values differ.",
            "Set s = 2'b10. Start at the top of the case and walk down: does 2'b00 match 2'b10? No. Does 2'b01? No. Does 2'b10? Yes. So y = c = 1100 = 4'hC. Write that down.",
            "Set s = 2'b11 and walk down again. This time all three labels fail, so you fall past them into `default`, and y = d = 4'hD. This is the row beginners most often get wrong, because they stop walking at the third label.",
            "Finish the table for all four select values with those same four data values. You should have y = A, B, C, D in order. That table is exactly what the testbench checks.",
            "Now the ternary, for contrast: with s = 2'b00 on a 2:1 mux built from a and b, `assign y2 = s ? b : a;` gives a, because s is 0. Write that down next to the case row and check the two agree.",
            "Last one, and it is the interesting one: change only a to 4'h1 and leave everything else alone, with s = 2'b00. Does y change? It must, immediately, to 4'h1. If it does not, your mux has remembered something, and that is the latch problem in the next topic.",
          ],
        },
      ],
    },
    {
      slug: "bus-and-widths",
      title: "Why the data side is a bus, and why that changes nothing",
      lede: "A beginner's question with a surprising answer: widening the data does not add select lines.",
      blocks: [
        {
          kind: "para",
          text: "Here is the question that trips people up, and it deserves a straight answer. If a 4:1 mux carries a 4-bit value, then a = 1010 is four bits, b = 1011 is four bits, and there are 4 x 4 = 16 bits sitting on the data inputs. Surely that needs more select lines? It does not. The select lines are still two.",
        },
        {
          kind: "para",
          text: "The reason is that a bit of data does not select anything. Select lines answer a question about *which wire*, not *what value*. Widening the data does not add more choices to make; it makes each choice carry more payload. Those are two independent axes. Choose among 4 wires: 2 select lines, whether each wire carries 1 bit, 4 bits, or 32 bits. Carry 32 bits on each wire: still 2 select lines. Add a fifth wire: now 3 select lines, because the number of choices went up.",
        },
        {
          kind: "table",
          head: ["What you change", "What happens to the data", "What happens to the select lines"],
          rows: [
            ["4:1 mux, 1-bit data to 4-bit data", "16 bits in, 4 bits out, instead of 4 in and 1 out", "Still 2. Unchanged."],
            ["4:1 mux to 8:1 mux", "One more data input", "2 becomes 3, because 8 needs 8 settings"],
            ["4:1 mux down to 2:1", "Two fewer data inputs", "2 becomes 1, and two arms are wasted"],
            ["4:1 mux, 4-bit data up to 32-bit data", "128 bits in, 32 bits out", "Still 2. Unchanged."],
          ],
          caption:
            "Data width multiplies the payload on each arm. Select width counts the arms. Mixing the two up is the single most common confusion in this chapter, so keep the two columns separate in your head.",
        },
        {
          kind: "para",
          text: "Put the other way, which is the sentence to remember: a mux is a switch on a wire, not a switch on a value. A switch does not care how thick the wire is. That is also why a mux is written with the same `assign` whether it is moving one bit or a 32-bit word — the code is identical and only the declared width changes.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "All the data inputs and the output must be the same width",
          text: "This is not a style preference. If the data inputs are 1 bit and the output is declared 4 bits, then `assign y = s ? b : a;` produces a 1-bit result, and a 1-bit result assigned to a 4-bit wire is padded on the left with zeros. y becomes 4'b0000 or 4'b0001 and never anything else — so 4'hA can never come out, and the only clue is a WIDTHEXPAND warning in the status chip. Declare the data inputs and the output with matching ranges, every time.",
        },
        {
          kind: "trap",
          wrong: "`output wire [3:0] y` with `input wire a, b` and `assign y = s ? b : a;`",
          right: "Make the data inputs match: `input wire [3:0] a, b, c, d;` and `output wire [3:0] y;`.",
          why: "The ternary yields a 1-bit result because a and b are 1 bit. Assigning 1 bit to a 4-bit wire zero-extends it, so y is 4'b0000 or 4'b0001. The mux is doing its job perfectly on the wrong-sized data. Nothing errors; the WIDTHEXPAND warning is the only signal, and it is easy to scroll past. Get the widths right at the port list, before writing a line of logic.",
        },
        {
          kind: "para",
          text: "One more consequence of the bus idea: because the width is written once per signal, a mux that works on 4 bits can be pointed at 32 bits with no change to the body of the logic. That is worth doing by hand, and it is the last thing this chapter teaches.",
        },
        {
          kind: "code",
          caption: "One body, any data width. W is set when the module is built, and the logic never mentions 4 or 32 anywhere.",
          code: `module mux4_wide #(
  parameter W = 4
) (
  input  wire [W-1:0] a,
  input  wire [W-1:0] b,
  input  wire [W-1:0] c,
  input  wire [W-1:0] d,
  input  wire       [1:0] s,
  output reg [W-1:0] y
);
  always @(*) begin
    case (s)
      2'b00: y = a;
      2'b01: y = b;
      2'b10: y = c;
      default: y = d;
    endcase
  end
endmodule`,
          note: "A `parameter` is a number you supply when you build the module, like a setting on a dial. Every `[W-1:0]` in the port list then becomes `[3:0]` for the default. The body of the case has no width in it at all, so it is correct for every value of W.",
        },
        {
          kind: "code",
          caption: "Using it twice, at two different widths, with no second copy of the logic.",
          code: `// Four bits wide — W is left at its default.
mux4_wide small_mux (a, b, c, d, s, y_small);

// Thirty-two bits wide — same code inside, wider wires.
mux4_wide #(.W(32)) wide_mux (p, q, r, t, s, y_wide);`,
          note: "The `#(.W(32))` is the override. The first instance is left as it is and picks up the default of 4. In this chapter the port list is connected by position, so the arguments follow the order a, b, c, d, s, y exactly as written in the module header.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why the WIDTHEXPAND/WIDTHTRUNC warning keeps coming back",
          text: "Once W is a parameter rather than a fixed number, a mistyped branch — say a 3-bit input where the rest are W wide — is exactly the width mismatch from the trap above, and a WIDTHEXPAND or WIDTHTRUNC warning is what tells you. Keep the warning on. When it fires inside a parameterized module, the fix is almost always to make the odd branch the same width as the others, not to silence the warning.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A 4:1 mux carries 8-bit data instead of 4-bit. How many select lines does it have?",
              a: "Still 2. The select lines count the choices and there are still four of them. Widening the data from 4 bits to 8 bits doubles the payload on each arm — 32 bits in instead of 16 — but adds no new choice, so the select value is still 0 to 3 and still needs two bits.",
            },
            {
              q: "You write `assign y = s ? b : a;` where y is 4 bits and a and b are 1 bit. What is on y?",
              a: "Either 4'b0000 or 4'b0001, and nothing else. The ternary result is one bit wide, and a 1-bit value written to a 4-bit wire is padded on the left with zeros. The mux is working correctly on data that is too small. Verilator reports this as a WIDTHEXPAND warning.",
            },
          ],
        },
      ],
    },
    {
      slug: "feature-selector",
      title: "The Feature Selector, start to finish",
      lede: "The chapter's task, assembled: four 4-bit sources, a 2-bit select, one routed output.",
      blocks: [
        {
          kind: "para",
          text: "This is the module the chapter asks you to build, in the form the testbench expects. Nothing in it is new — it is the 4:1 `case` from topic five, with the ports named. Read it as a whole first, then work through it line by line, then predict its output by hand.",
        },
        {
          kind: "code",
          caption: "The Feature Selector. Four sources in, one 2-bit select, one routed output.",
          code: `module top (
  input  wire [3:0] a, b, c, d,
  input  wire       [1:0] sel,
  output reg  [3:0] y
);
  always @(*) begin
    case (sel)
      2'b00:   y = a;
      2'b01:   y = b;
      2'b10:   y = c;
      default: y = d;
    endcase
  end
endmodule`,
          note: "The comments line up the labels in counting order, which is the habit worth keeping. Four labelled branches plus a default covers all four values of a 2-bit select, so the block is never left without something to assign.",
        },
        {
          kind: "steps",
          title: "Predict before you compile",
          items: [
            {
              head: "Read the port list as a promise",
              body: "Four data inputs, each 4 bits wide, named a, b, c, d. One select input, 2 bits wide, named sel. One output, 4 bits, named y. The widths of a, b, c, d and y all match, which is the rule from topic six. Nothing in this module can produce a WIDTHEXPAND or WIDTHTRUNC warning.",
            },
            {
              head: "Work out the mapping first, without any data",
              body: "sel = 2'b00 routes a. sel = 2'b01 routes b. sel = 2'b10 routes c. sel = 2'b11 routes d, via the default. Four lines, and they are the specification of the whole module. If you cannot write these four sentences, the code is not ready to be written.",
            },
            {
              head: "Now predict one case with real numbers",
              body: "Take a = 4'hA, b = 4'hB, c = 4'hC, d = 4'hD, sel = 2'b01. Walk the case from the top: 2'b00 does not match, 2'b01 does, so y = b = 4'hB. Write that down before touching the compiler.",
            },
            {
              head: "Predict a second case, and pick the awkward one",
              body: "Same data, sel = 2'b11. All three labels fail, so the walk falls past them into default, and y = d = 4'hD. The awkward row is always 2'b11 in a three-label case, and it is the one that catches a mapping that has been shifted by one.",
            },
            {
              head: "Then vary the data, not the select",
              body: "Set a = 4'h1, b = 4'h2, c = 4'h3, d = 4'h4, and walk all four select values. You should get y = 1, 2, 3, 4 in order. The point of this pass is that y must follow the data changes, not stay where it was — a mux that does not follow its input is holding state, and that is the latch in the next topic.",
            },
            {
              head: "Now compile and compare",
              body: "If your four predictions and the tool disagree, one of you is wrong, and finding out which is the whole point. The hidden testbench runs sixteen different data patterns for each of the four select values, so it will catch a mapping that is right for one data pattern and wrong for another. Predict first, then look.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Copy the four-branch mapping as four sentences, as in step 2. Say each one out loud: 'sel 00 gives a, sel 01 gives b, sel 10 gives c, sel 11 gives d'.",
            "Fill a table with five columns — sel, then the y you predict for four different sets of data. Use A/B/C/D first, then 1/2/3/4, then F/0/7/E, then all-zeros.",
            "Now trace the *fall-through* carefully. Start at 2'b11 and read every label downward before you reach default. Notice that the default is reached by no match, not by an explicit test. Write one sentence saying what that means for a select value that is x.",
            "Write a 2:1 mux that picks between a and b only, using the ternary, and confirm it agrees with the Feature Selector's rows for sel = 00 and sel = 01.",
            "Delete the `default:` line and the 2'b10 label, leaving three branches. Read the rest of the module and predict what y holds when sel = 2'b11. Write down your prediction before you change anything, then compare with the warning the tool gives you.",
            "Finally, decide for yourself which mistake is more likely: routing c on 2'b11 and d on 2'b10, or omitting d entirely. Say which one a testbench is more likely to catch, and why.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Why the default branch earns its place",
          text: "Try it on the ternary. If a 2:1 mux's select line is x, the simulator cannot pick a branch, so it merges the two candidates bit by bit: where a and b agree you get that bit, where they differ you get x. The output is then partly unknown, and that x spreads into whatever reads it. The `default` branch does not have that problem — a mux written with a `case` and a `default` always has a defined output, whatever the select lines hold. That is a real reason to prefer the `case` form beyond readability.",
        },
        {
          kind: "check",
          items: [
            {
              q: "With a = 4'hA, b = 4'hB, c = 4'hC, d = 4'hD, what is y when sel = 2'b10?",
              a: "4'hC. Walking the case from the top, 2'b00 does not match 2'b10 and 2'b01 does not match it, then 2'b10 does match, so the statement that runs is y = c, and c is 1100.",
            },
            {
              q: "What changes if you delete the `default:` line and keep the other three labels?",
              a: "For the three covered select values nothing changes. For sel = 2'b11 no branch matches, so the block assigns nothing at all, and y holds whatever value it had — which at the start of a simulation is x. The tool reports this as CASEINCOMPLETE and as a LATCH, and the fix is to put the default back or add an explicit 2'b11 label.",
            },
          ],
        },
      ],
    },
    {
      slug: "traps-and-latches",
      title: "The mistakes that actually happen, and the latch underneath them",
      lede: "Every trap in this chapter, gathered in one place, with the reason each one survives a clean compile.",
      blocks: [
        {
          kind: "para",
          text: "A multiplexer is simple enough that most mistakes in it are not syntax errors. They are circuits that compile, pass a lint check, and quietly give the wrong answer. This topic collects the ones you will really make, and explains the one underneath them that connects all the others.",
        },
        {
          kind: "para",
          text: "Start with that one. A *latch* is a small piece of memory: a circuit that holds its last value instead of always being told what to do. You never write a latch on purpose in this chapter, but you can accidentally ask the tool to build one. The way you ask is by giving the tool a rule that does not say what the output should be in some situations. When that happens, the only circuit the tool can build is one that remembers.",
        },
        {
          kind: "analogy",
          text: "A colleague who is following a set of instructions. You say 'if the code is 0 write A, if it is 1 write B'. They do exactly that. Now you say the code is 2 — which you never mentioned. Your colleague has no instruction to follow, so they leave the whiteboard as it was. A `default` is the line that says 'and for anything else, write C'. Without it, the output is whatever it happened to be, and that is a latch.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "The two warnings, and what they actually say",
          text: "LATCH means the tool inferred memory in a block that should have been purely combinational — your block has a path through it where the output is never assigned, so something has to remember. CASEINCOMPLETE means your `case` does not cover every value the select can take. They almost always arrive together and almost always have the same cause: a missing branch. Add the `default` first and debug afterwards; a latch is easier to diagnose once something is driving the output on every path.",
        },
        {
          kind: "code",
          caption: "The same 4:1 mux with a hole in it. Nothing is assigned when sel is 2'b11.",
          code: `always @(*) begin
  case (s)
    2'b00: y = a;
    2'b01: y = b;
    2'b10: y = c;
    // no 2'b11 branch, and no default
  endcase
end`,
          note: "This is a latch, not a mux. Change a, b or c and y follows. Change d and y does not move, because d is not connected to anything. The testbench catches it as soon as it selects 2'b11 and finds y holding a stale value.",
        },
        {
          kind: "para",
          text: "A complete `case` can still latch, and this trips people up. Coverage is necessary but not sufficient: the tool checks that *every path through the block* assigns the output, not that every label is present. So a branch containing an `if` with no `else` also leaves a path unassigned, even though the `case` above it looked complete. The general rule is simple to state and worth memorising: inside `always @(*)`, the output is assigned on every possible path, or the tool builds a latch.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The one legal alternative to a default",
          text: "You can also give the output a value before the case, and let the case override it: `always @(*) begin y = a; case (s) ... endcase end`. That is latch-free, because every execution of the block assigns y before it can leave, and y is correct even on the select values the case never names. You will still see CASEINCOMPLETE, because the `case` itself does not cover every value — but there is no LATCH, and that difference is worth reading carefully rather than dismissing. The `default:` version is the one used in this track, because one mechanism is easier to check than two.",
        },
        {
          kind: "trap",
          wrong: "A `case` with three of the four select values covered and no `default:`.",
          right: "Add the fourth label, or add `default: y = d;`.",
          why: "The uncovered select value runs no statement, so the output keeps its previous value — a latch. The circuit is still valid hardware, just not the circuit you meant, and it is a real hardware difference: change the unconnected input and nothing happens. CASEINCOMPLETE and LATCH both fire. Default branch first, diagnosis second.",
        },
        {
          kind: "trap",
          wrong: "`case (sel)` where sel is 2 bits, but the labels are written 1 bit wide: `1'b0: y = a; 1'b1: y = b;`.",
          right: "Match the label width to the select: `2'b00:`, `2'b01:`, `2'b10:`, then a `default:`.",
          why: "In a `case`, both the select value and each label are widened to the same width before being compared, and a narrower label is zero-padded. So 1'b1 becomes 2'b01 and 1'b0 becomes 2'b00, which means your two labels only ever match sel = 00 and sel = 01. sel = 10 and sel = 11 fall through to nothing, and you get a latch on exactly the two rows you thought you had covered. Writing the labels at the full width makes this impossible to get wrong by eye.",
        },
        {
          kind: "trap",
          wrong: "`output wire [3:0] y;` and then `y = a;` inside an `always @(*)` block.",
          right: "Declare it `output reg [3:0] y;`.",
          why: "A `wire` is a plain connection and cannot be the target of an assignment from inside a block — the tool reports that the wire is not a valid target for this operation. `reg` is the legacy word for 'this signal gets its value from a block'. In a mux it does not imply storage; the storage is the latch, and that comes from a missing branch, not from the keyword.",
        },
        {
          kind: "trap",
          wrong: "Writing the case labels in a random order, or repeating one: `2'b00, 2'b10, 2'b01, 2'b10`.",
          right: "Write them in binary counting order: 00, 01, 10, 11, with the last one as `default`.",
          why: "Counting order makes a gap or a repeat visible immediately, because the sequence should never go backwards. A repeated label is dead code the tool will not warn about, and it usually means one of the inputs is never reachable. A gap is a latch. One pass of the eye down a counting-order list catches both.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why does a missing `default` produce a latch rather than an error?",
              a: "Because the circuit is legal. The tool could build a mux, but you have not told it what the output should be for one select value, and an output that is not always specified has to hold its last value. That is exactly what a latch does, so the tool builds one and warns you with LATCH and CASEINCOMPLETE. It is a warning rather than an error because a latch is sometimes what you actually want — just not in this chapter.",
            },
            {
              q: "You want a 2:1 mux with 8-bit data. How many select lines, and what are the data widths?",
              a: "One select line, since there are only two choices. The data inputs and the output are all 8 bits: `input wire [7:0] a, b;`, `input wire s;`, `output wire [7:0] y;`, and `assign y = s ? b : a;`. The data width does not affect the select line count at all.",
            },
          ],
        },
      ],
    },
    {
      slug: "check-yourself",
      title: "The chapter in one page",
      lede: "A recap and a last self-check. If you can answer these without looking back, you are ready for the lesson.",
      blocks: [
        {
          kind: "points",
          title: "What to carry forward",
          items: [
            "A mux answers one question: which of these N values do I want? The output is always a copy of one of the inputs, right now.",
            "The ternary `? :` is a 2:1 mux. The value after `?` is the true case; the value after `:` is the false case. Reversing them builds a valid but backwards circuit.",
            "k select lines hold 2^k different values, so a mux over N inputs needs the number of doublings from 1 up to N. 2 inputs: 1 line. 4 inputs: 2 lines. 8 inputs: 3 lines.",
            "The select value is an index, written in binary. sel = 2'b11 means input number 3, which is the fourth input. Read it as a number and index with it.",
            "Past two inputs, use `always @(*)` with a `case`. Cover every select value with a `default`, and declare the output `reg`.",
            "Data width and select width are independent. Widening the data from 4 to 32 bits leaves the select lines untouched. All data inputs and the output must be the same width.",
            "A gate-level mux is a NOT, two ANDs and an OR. A larger mux is that picture with more arms, or a `case` that says the same thing more readably.",
            "An uncovered select value is a latch. LATCH and CASEINCOMPLETE mean the same thing: the output is not assigned on some path.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "A mux has 5 data inputs. How many select lines, and what happens to the settings you do not need?",
              a: "3 select lines, because 2 lines give only 4 settings and 3 give 8. You build an 8:1 mux and use 5 arms; select values 101, 110 and 111 are never used, so the three spare inputs are unconnected or tied to whatever is harmless. N is not always a power of two, and rounding up is the standard answer.",
            },
            {
              q: "You write `assign y = s ? a : b;` and the testbench says s = 0 should give a, but you get b. What is wrong?",
              a: "The branches are the wrong way round. The value after `?` is used when the condition is true, so `s ? a : b` returns a when s is 1 and b when s is 0. To get a when s is 0 you want `s ? b : a`. Nothing warned you, because both versions are valid 2:1 muxes — they are just wired opposite ways.",
            },
            {
              q: "In a 4:1 mux with select s, you set s = 2'b11 and the tool reports CASEINCOMPLETE and LATCH. What is the one-line fix?",
              a: "Add a `default:` branch, for example `default: y = d;`. The `case` only had labels for 00, 01 and 10, so sel = 2'b11 ran no statement and the output held its previous value — a latch. A default gives the output something to do on every path.",
            },
            {
              q: "Your 4:1 mux works for 4-bit data. You change the port list to 32-bit data and nothing else. Does it still work, and how many select lines are there now?",
              a: "Yes, and it is still 2 select lines. The case body assigns whole data inputs to the whole output and never names a width, so it is correct for any data width. Widening the data adds no new choice, so the select count is unchanged — that independence is the whole point of the bus idea.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "The habit that carries into every later chapter",
          text: "Predict the output by hand before you compile. For a mux the prediction is easy — read the select as a number, count to that input, done — and it is the fastest way to catch a shifted mapping, which is the bug you are most likely to write and the one a compiler will never mention.",
        },
      ],
    },
  ],
  glossary: [
    { term: "2:1 mux", meaning: "The smallest multiplexer: two data inputs, one select line, one output." },
    { term: "4:1 mux", meaning: "A multiplexer with four data inputs, two select lines, and one output." },
    { term: "8:1 mux", meaning: "A multiplexer with eight data inputs, three select lines, and one output." },
    { term: "always @(*)", meaning: "A block of code that re-runs whenever any signal it reads changes; the `*` means work the list out automatically." },
    { term: "case statement", meaning: "A block that compares one expression against a list of labels and runs the first branch that matches." },
    { term: "combinational logic", meaning: "Logic with no memory: the output depends only on what the inputs are right now." },
    { term: "data input", meaning: "One of the values a multiplexer can pass through to its output." },
    { term: "default branch", meaning: "The `default:` line of a `case`, which runs when no other label matched the select value." },
    { term: "gate-level", meaning: "Describing a circuit as actual AND, OR and NOT parts wired together, rather than as an expression." },
    { term: "latch", meaning: "A circuit that holds its last value because nothing told it what to do; in this chapter it is always a bug." },
    { term: "multiplexer (mux)", meaning: "A device with several inputs, one output, and control lines that choose which input reaches the output." },
    { term: "parameter", meaning: "A number you set when you build a module, so one piece of logic serves many widths." },
    { term: "select line", meaning: "A control wire that says which input to choose; the select lines together form a number." },
    { term: "ternary conditional", meaning: "The `? :` form, read as 'if this is true then this value, otherwise that one'." },
  ],
  nextStep:
    "The next step is the lesson MUX Circuits, in the workspace. You will write a 2:1 mux with `assign y = s ? b : a;` and a 4:1 mux with `case` inside `always @(*)`, check all four input combinations, then extend the same body to 32-bit data with a parameter. The practice list is the chapter's own: do them in order, and on purpose try deleting the `default` line once so you meet the LATCH warning before it ever surprises you in graded work. Come back to the traps topic whenever the status chip says CASEINCOMPLETE.",
};
