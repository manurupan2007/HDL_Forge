import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 7,
  chapterSlug: "encode-decode",
  title: "Encoders, Decoders & Priority",
  readMinutes: 24,
  youWillBeAbleTo: [
    "Explain what a decoder does and read a 3-to-8 decoder truth table",
    "Explain what an encoder does and say why a plain encoder breaks when two inputs are high",
    "Write a decoder and an encoder in Verilog and predict their outputs on paper",
    "Use a case statement with endcase as a multi-way choice and reason about which branch wins",
    "Design a priority encoder by choosing and applying a priority order on purpose",
    "Mark don't-care rows in a truth table with x and use them to delete a whole product term",
    "Tell case, casez and casex apart and say when a wildcard match is dangerous",
  ],
  mentalModel: [
    {
      title: "A decoder lights one lamp; an encoder asks which lamp is lit",
      body: "Both are about turning a number into a different shape of number. A decoder takes n bits on one side and puts n separate one-bit outputs on the other, exactly one of which is high — like a row of eight lamps where a 3-bit number picks which single lamp lights. An encoder is the same box turned around: eight one-bit inputs go in, and a 3-bit number naming the active one comes out. A decoder always has a definite answer, because a 3-bit number is by definition one particular value. An encoder does not, the moment more than one input is high at the same time. That gap — between the clean table and the messy reality — is where this chapter actually lives, and the priority encoder is the thing you build to close it.",
    },
    {
      title: "Priority is a decision you make, not one the wires make",
      body: "When two request lines are high at once, the hardware does not have an opinion. Somebody has to decide which one is answered, and that decision has consequences: in a real system it decides whose urgent request gets served first. A priority encoder makes the decision explicit and readable, by writing the choices in an order and letting the first match win. The order of the branches *is* the priority. Once you see it that way, 'which has priority?' stops being a question about electronics and becomes a question about the design, which you can then answer, argue about, and change in one place.",
    },
  ],
  topics: [
    {
      slug: "decoders",
      title: "A decoder: one lamp out of eight",
      lede: "A decoder takes a number on the input side and lights exactly one lamp on the output side.",
      blocks: [
        {
          kind: "analogy",
          text: "Picture a row of eight lamps on a wall, and a 3-bit number wired to a controller. The controller reads the number and lights the lamp whose position matches it. Number 0 lights the first lamp. Number 7 lights the eighth. Never two, never none. That is a decoder, and it is the single most-used block in digital hardware: it is how a system turns \"which of these eight things?\" into a one-line answer that software can read.",
        },
        {
          kind: "para",
          text: "The input is an *n*-bit number, so it can be one of 2ⁿ values. The output is 2ⁿ separate wires, one per value, each 1 bit wide. Because exactly one output is high at any moment, that pattern is called *one-hot* — one bit hot, all the rest cold. The name matters because you will meet the opposite pattern, *one-cold*, in the very next section, and confusing the two is a reliable source of off-by-one bugs.",
        },
        {
          kind: "table",
          head: ["sel", "Decimal", "y[7:0]", "Which lamp is on"],
          rows: [
            ["3'b000", "0", "8'b0000_0001", "y[0]"],
            ["3'b001", "1", "8'b0000_0010", "y[1]"],
            ["3'b010", "2", "8'b0000_0100", "y[2]"],
            ["3'b011", "3", "8'b0000_1000", "y[3]"],
            ["3'b100", "4", "8'b0001_0000", "y[4]"],
            ["3'b101", "5", "8'b0010_0000", "y[5]"],
            ["3'b110", "6", "8'b0100_0000", "y[6]"],
            ["3'b111", "7", "8'b1000_0000", "y[7]"],
          ],
          caption:
            "All eight rows, with sel counted up in binary from 000 to 111. Read the y column right to left: the lamp number matches the decimal value of sel. y[0] is the rightmost bit, so sel = 0 puts a 1 in the rightmost position.",
        },
        {
          kind: "code",
          caption:
            "A complete 3-to-8 decoder. Eight lines, one per lamp, and the job of each line is a single yes-or-no question: \"is sel equal to my number?\"",
          code: `module decoder3to8 (
  input  wire [2:0] sel,
  output wire [7:0] y
);
  assign y[0] = (sel == 3'd0);
  assign y[1] = (sel == 3'd1);
  assign y[2] = (sel == 3'd2);
  assign y[3] = (sel == 3'd3);
  assign y[4] = (sel == 3'd4);
  assign y[5] = (sel == 3'd5);
  assign y[6] = (sel == 3'd6);
  assign y[7] = (sel == 3'd7);
endmodule`,
          note: "The `==` operator returns 1 bit: 1 when the two sides are equal, 0 when they are not. So `(sel == 3'd0)` is already the right width to drive one lamp — no extra bit juggling needed. Notice there is no `if` anywhere. A decoder is pure combinational logic: eight standing rules, all true at once, all the time.",
        },
        {
          kind: "para",
          text: "Read the code as a sentence. y[0] is high only when sel is 3'b000. y[1] is high only when sel is 3'b001. And so on down to y[7]. Eight rules, no interference, and the truth table above is the complete specification of what they do. Notice the width on the literals: `3'd4` and `3'd7` are written 3 bits wide, because sel is 3 bits wide, and Verilator warns with WIDTHTRUNC or WIDTHEXPAND if you mix widths carelessly.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Write the 3-to-8 decoder truth table from memory before you look back at it: eight rows, sel counting up in binary from 000 to 111.",
            "For the row sel = 3'b101, find the lamp. Decimal 5, so it is y[5], which is bit 5 counting from 0 at the right. Write the full 8-bit pattern with the 1 in position 5 and check it has exactly one 1 in it.",
            "Now do the opposite direction. Given y = 8'b0010_0000, find sel. The 1 is in bit 5, so sel = 5 = 3'b101.",
            "Count the 1s in every row of the table. If any row has two 1s or zero 1s, you have made an error — one-hot means exactly one.",
            "Predict what y is when sel is 3'bxxx, all unknown. Then check your prediction against the code: `sel == 3'd0` with an unknown sel gives an unknown answer, not 0 and not 1, so every lamp ends up x.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "A 4-to-16 decoder is built the same way. How many assign lines does it need, and what is the width of its output?",
              a: "Sixteen assign lines, one per output bit, and a 16-bit output. The pattern is that a decoder has 2ⁿ outputs and one assign per output. The input is still 4 bits and still only 16 possible values, so exactly one of the sixteen lines is ever high.",
            },
            {
              q: "In the row sel = 3'b011, y is 8'b0000_1000. Why is the 1 in that position and not the one for y[3]?",
              a: "It *is* the one for y[3]. Bit positions are counted from 0 on the right, so the pattern 0000_1000 has its 1 as the fourth bit from the right, which is bit 3. sel = 3'b011 is decimal 3, so y[3] is the lamp. Reading binary patterns right to left is the habit that makes this second nature.",
            },
          ],
        },
      ],
    },
    {
      slug: "encoders",
      title: "An encoder: which lamp is on?",
      lede: "An encoder runs the decoder backwards, turning a set of one-bit lines into a number.",
      blocks: [
        {
          kind: "analogy",
          text: "Now stand in front of the same wall of lamps, but you cannot see which are lit — you can only feel the wall and read the switches. You go along and report back: \"lamp 5 is the one that's on.\" That report is a 3-bit number, because you need 3 bits to say any number from 0 to 7. That is an encoder. The trouble is obvious the moment you say it out loud: if two lamps are lit, what do you report?",
        },
        {
          kind: "para",
          text: "Formally, an 8-to-3 encoder has 8 one-bit inputs and one 3-bit output. The output names *which* input is high. So the decoder table above, read backwards, is the encoder table: 0000_0001 in gives 3'b000 out, 1000_0000 in gives 3'b111 out. The output pattern is one-cold — at most one bit is high — which is the mirror image of the decoder's one-hot output and the same fact seen from the other side.",
        },
        {
          kind: "table",
          head: ["in[7:0]", "What is high", "code[2:0]", "Decimal"],
          rows: [
            ["8'b0000_0001", "in[0]", "3'b000", "0"],
            ["8'b0000_0010", "in[1]", "3'b001", "1"],
            ["8'b0000_0100", "in[2]", "3'b010", "2"],
            ["8'b0000_1000", "in[3]", "3'b011", "3"],
            ["8'b0001_0000", "in[4]", "3'b100", "4"],
            ["8'b0010_0000", "in[5]", "3'b101", "5"],
            ["8'b0100_0000", "in[6]", "3'b110", "6"],
            ["8'b1000_0000", "in[7]", "3'b111", "7"],
            ["8'b0000_0000", "nothing", "3'b000", "ambiguous"],
            ["two or more", "more than one", "not in this table", "undefined"],
          ],
          caption:
            "The first eight rows are the whole specification. The last two are where a plain encoder has no answer at all, and the second of those is the reason this chapter continues.",
        },
        {
          kind: "code",
          caption:
            "A plain 8-to-3 encoder, written the long way so you can see exactly what it does. Each line is a question, and the last matching question is the one that wins.",
          code: `module encoder8to3 (
  input  wire [7:0] in,
  output reg  [2:0] code
);
  always @(*) begin
    code = 3'd0;
    if (in[0]) code = 3'd0;
    if (in[1]) code = 3'd1;
    if (in[2]) code = 3'd2;
    if (in[3]) code = 3'd3;
    if (in[4]) code = 3'd4;
    if (in[5]) code = 3'd5;
    if (in[6]) code = 3'd6;
    if (in[7]) code = 3'd7;
  end
endmodule`,
          note: "Read it top to bottom and watch what happens when two lines are true. `in = 8'b0000_0011` makes both `in[0]` and `in[1]` high. The first `if` sets code to 0, then the second `if` overwrites it with 1. The last matching line wins, so the *highest-numbered* input has priority — but nothing in this code says that on purpose. You found it by accident.",
        },
        {
          kind: "steps",
          title: "What this code actually specifies",
          items: [
            {
              head: "It never leaves code undefined",
              body: "The first statement inside the block is `code = 3'd0;`. That runs before any of the ifs, on every single evaluation. So the all-zero input — no lamp lit at all — produces 0 rather than keeping whatever the value was before. This is not an encoder design decision; it is basic hygiene, and it is why this code lints clean with no LATCH warning.",
            },
            {
              head: "Each if is a one-line question",
              body: "`if (in[0]) code = 3'd0;` means: when in[0] is high, the answer is 0. Read the number on the right as \"the index of the lamp on the left\", and the eight lines are a direct transcription of the first eight rows of the table.",
            },
            {
              head: "But there is no order written down",
              body: "The lines happen to be in ascending order, and because later lines overwrite earlier ones, the last one wins. Try `in = 8'b1000_0001` — both in[0] and in[7] are high — and you get 7. That is a priority encoder. It works. It also has no comment saying *in[7] outranks in[0]*, so the next person to reorder these lines changes the chip's behaviour without noticing.",
            },
            {
              head: "And the all-zero case is silently wrong",
              body: "With `in = 8'b0000_0000` the output is 3'b000, which is *exactly* the same answer the encoder gives for `in = 8'b0000_0001`. Software reading this module cannot tell \"nothing was lit\" from \"lamp 0 was lit\". That ambiguity is not fixable inside this module, because it has no spare output. It needs a *valid flag* — a second output that is 1 only when at least one lamp is genuinely on.",
            },
          ],
        },
        {
          kind: "para",
          text: "Both of those problems have the same root cause, and it is worth saying plainly: a plain encoder quietly assumes that **at most one** input is ever high. That assumption is fine for a keypad row where only one button can be pressed, and wrong the moment you point it at eight interrupt request lines from eight different peripherals. Peripheral 0 and peripheral 3 can absolutely both be asking for attention in the same cycle. The next topic is about that moment.",
        },
        {
          kind: "trap",
          wrong: "Writing the eight ifs in descending order, from in[7] down to in[0].",
          right: "Decide the priority order deliberately, write a comment saying which input outranks which, and make the code match the comment.",
          why: "Descending order silently makes in[0] the highest priority instead of in[7], and there is no warning. Both versions lint clean and both produce plausible-looking numbers, so the only thing protecting you is that you wrote down what you intended. This is the argument for the priority encoder: the same hardware, with the decision visible.",
        },
      ],
    },
    {
      slug: "the-case-statement",
      title: "The case statement: choosing between more than two things",
      lede: "A case statement is a multiplexer with more than two inputs, and the first branch that matches is the one that runs.",
      blocks: [
        {
          kind: "para",
          text: "You have already built a two-way choice: the ternary `sel ? a : b`, and the mux module in chapter 4. A `case` statement is the general version. Instead of a 1-bit selector choosing between two values, a multi-bit selector chooses between any number of them, and each choice can be a whole list of values. On hardware it costs nothing extra — it is the same switch you already understand, with more positions.",
        },
        {
          kind: "code",
          caption:
            "The full anatomy of a case statement. Everything between `case` and `endcase` is one multi-way choice.",
          code: `always @(*) begin
  case (sel)              // 1. the thing being examined
    2'd0: y = a;          // 2. one branch per value of sel
    2'd1: y = b;
    2'd2, 2'd3: y = c;    //    several values can share a branch
    default: y = a;       // 3. everything not listed above
  endcase                 // 4. endcase closes the construct
end`,
          note: "There is no `break` in a Verilog case statement, and there is no fall-through. The moment a branch matches, that branch's statements run and control jumps straight to `endcase`. Each line ends with a semicolon, exactly like any other Verilog statement. The `default` branch is optional in the language but never optional in this track.",
        },
        {
          kind: "steps",
          title: "Read the anatomy line by line",
          items: [
            {
              head: "`case (sel)`",
              body: "The expression inside the parentheses is what gets examined. It can be any width. Here it is 2 bits, so it has four possible values and needs at most four branches — but the language does not require you to write all of them, and that is exactly where the trouble starts.",
            },
            {
              head: "`2'd0: y = a;`",
              body: "A branch is `value : statement;`. The colon separates the condition from the action. The action here is a single statement, so it needs no `begin`/`end`. If a branch needs several statements, wrap them in `begin` … `end`, which is a normal block just like the one around the whole `always`.",
            },
            {
              head: "`2'd2, 2'd3: y = c;`",
              body: "Comma-separated values share a branch. This is shorthand for writing `2'd2: y = c;` and `2'd3: y = c;` on two lines. It is the same trick you will use constantly in the priority encoder.",
            },
            {
              head: "`default: y = a;`",
              body: "The fallback, taken when nothing above matched. The keyword is `default` and it takes no value. Think of it as the last position on the rotary switch — the one that says \"anything else\".",
            },
            {
              head: "`endcase`",
              body: "Closes the construct, the same way `endmodule` closes a module and `end` closes a block. Miss it and the error is reported at some later token in the file, not at the line you forgot. The traps topic at the end of this chapter has the full story.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "First match wins — this is the whole rule",
          text: "A case statement is not a parallel set of questions. It checks the branches **from top to bottom** and stops at the first one that matches. Nothing after it runs. That single fact is why the order of your branches carries meaning, and it is the mechanism the entire priority encoder is built on. If two branches could both match, the earlier one silently takes it — no warning, no error.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take the case statement above with sel = 2'd3. Walk down the branches: does 2'd0 match? no. 2'd1? no. `2'd2, 2'd3`? yes — y = c. Stop there. `default` is never reached.",
            "Now use sel = 2'd3 but delete the `2'd2, 2'd3` branch. The default catches it and y = a. Same input, different hardware, and you chose which by writing code.",
            "Write a case statement for a 1-bit input `a` with two branches, 1'b1 and default. Confirm it is a NOT gate: y = 1 when a is 0, y = 0 when a is 1.",
            "Write out what happens if you add a third branch `2'd0: y = b;` directly above the existing `2'd0: y = a;`. Then work out which one is dead code.",
            "Count: a 3-bit selector has 8 possible values. How many branches do you need to cover every case with no default? How many with a default that handles one of them for you?",
          ],
        },
        {
          kind: "trap",
          wrong: "Indenting a nested case so the inner branches line up visually with the outer ones, and then adding a branch to the inner case that the outer one should have had.",
          right: "Give the inner case its own `case`/`endcase` pair, indent both by two spaces from the branch it sits in, and count the `endcase` lines against the `case` lines before you save.",
          why: "Verilog does not care about indentation at all, so a branch that belongs to the inner case and looks like it belongs to the outer one will compile without complaint — and do the wrong thing. Whichever `case` it actually lands in runs, and the other branch never executes. This is the one bug in this chapter that the toolchain will not catch for you, so it is worth a deliberate check every time you nest.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You have `case (a)` with branches for 1'b0, 1'b1, and 2'bx. What does an `a` of 1'bx do?",
              a: "In a plain `case`, 1'bx matches the branch 2'bx exactly, because case compares all four values including x. So the 2'bx branch runs. If you had left that branch out, a plain case would fall to default. Remember this: plain `case` treats x as just another value to be compared, and casez and casex are the ones that stop doing that.",
            },
            {
              q: "Why is `default` not optional in practice, even though the language allows a case with no default?",
              a: "Because if a plain `case` has no `default` and does not list every value, the branch taken is undefined for the unlisted inputs — and in a combinational `always` block, an output that is not assigned on every path is a latch, which Verilator reports as %Warning-LATCH. Separately, `%Warning-CASEINCOMPLETE` tells you the case does not cover the space. Writing a default makes both go away and makes the code say what it means.",
            },
          ],
        },
      ],
    },
    {
      slug: "two-requests-at-once",
      title: "What happens when two things ask at the same time",
      lede: "Eight interrupt lines can all be high at once, and that is not an error — it is the normal case.",
      blocks: [
        {
          kind: "analogy",
          text: "You are on a help desk and eight people raise their hands. You can only help one at a time. Two things are now obvious. First, you will not take them in the order they raised their hands — a customer's whole machine being down outranks someone with a slow printer, and the person who raised their hand first has no special claim on your attention. Second, you need a written rule for who goes first, because otherwise you will make the call differently every time and someone will always be unhappy about it. That written rule is a priority order.",
        },
        {
          kind: "para",
          text: "This is the actual situation in a processor. Each peripheral has a request line: the timer wants attention, the disk controller wants attention, the network card wants attention. When two of them assert in the same clock cycle, something has to pick one, and the choice is a design decision with real consequences. Ignore the timer and you lose your timebase. Ignore the network card and you drop a packet. There is no right answer in the abstract — the right answer is the one your system decided on, written down and consistent.",
        },
        {
          kind: "table",
          head: ["req[7:0]", "How many requests", "What should idx be", "What a plain encoder does"],
          rows: [
            ["8'b0000_0000", "0", "meaningless — valid must be 0", "3'b000, indistinguishable from the next row"],
            ["8'b0000_0001", "1 (req[0])", "0", "3'b000"],
            ["8'b0000_0011", "2 (req[1], req[0])", "one of 0 or 1 — a decision", "3'b001, decided by line order"],
            ["8'b0000_0110", "2 (req[2], req[1])", "one of 1 or 2 — a decision", "3'b010, decided by line order"],
            ["8'b0011_0000", "2 (req[5], req[4])", "one of 4 or 5 — a decision", "3'b101, decided by line order"],
            ["8'b1100_0000", "2 (req[7], req[6])", "one of 6 or 7 — a decision", "3'b111, decided by line order"],
          ],
          caption:
            "The interesting rows are the multi-bit ones. Note that a plain encoder still produces a definite number for them — it just picked without telling you, and its pick is a side effect of how the code was written down.",
        },
        {
          kind: "para",
          text: "There is a second problem hiding in the first row, and it is easy to miss because it looks harmless. With `req = 8'b0000_0000`, nothing at all is asking for attention. A plain encoder reports 0, which is byte-for-byte the same answer it gives for `req = 8'b0000_0001`. Software reading this output has no way to tell the difference, so it would go off and service interrupt 0 — which is not requesting anything. The fix is a second output line, a *valid flag*, that is 1 only when at least one request is genuinely asserted.",
        },
        {
          kind: "code",
          caption:
            "The reduction operator solves the valid flag in one character. A single `|` with nothing on its left means \"OR together every bit of this vector\".",
          code: `module valid_8 (
  input  wire [7:0] req,
  output wire       valid
);
  assign valid = |req;
endmodule`,
          note: "This is called a *reduction* operator, and it is worth recognising on sight. The result is 1 bit no matter how wide the input is: 1 if any bit is 1, and 0 only if every bit is 0. It replaces a whole `if (req != 8'b0)` in one expression, and unlike the `!=` comparison it can never produce a width warning.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Count the rows where a plain encoder is unambiguous. Out of the 256 possible values of an 8-bit input, how many have exactly one bit high? Answer: 8, one for each position. How many have zero bits high? Exactly 1.",
            "So out of 256 input patterns, how many give the plain encoder a real, unambiguous answer? 8. What fraction of the possible inputs break it?",
            "Now pick a priority order: say req[7] is highest, then req[6], down to req[0]. Write down what idx should be for req = 8'b0110_0000 under that rule, and say which request is being served.",
            "Change the priority order to 'req[0] is highest' and answer the same input. Confirm the hardware output changed even though the input did not — the design decision moved.",
            "For req = 8'b0000_0000, work out what `|req` gives. Now check it against the encoder's 3'b000 output and confirm the two together are unambiguous: valid = 0, idx = 000, and that pairing means nothing is asking.",
          ],
        },
        {
          kind: "trap",
          wrong: "Relying on the plain encoder to handle a request line that is briefly 0, so that a second request slips in and the answer changes between two cycles of the same event.",
          right: "Once a request is seen, the priority decision must be stable. Either hold the request until the system acknowledges it, or register the decision at a clock edge before acting on it.",
          why: "This is a real hardware hazard and it is invisible in a truth table, because a truth table has no time in it. If req[2] drops and req[1] rises on the next line, the combinational encoder's output changes from 2 to 1, and anything downstream that latched the earlier value now disagrees with the combinational output. This chapter's output is combinational; chapter 8, Sequential Fundamentals, is where you add a register to hold it steady.",
        },
      ],
    },
    {
      slug: "priority-encoders",
      title: "The priority encoder: deciding, in writing, who goes first",
      lede: "A priority encoder is a normal encoder plus an explicit rule for what happens when more than one input is high.",
      blocks: [
        {
          kind: "para",
          text: "Now we know the two problems to solve. The plain encoder has no opinion about which of several high inputs to report, and it cannot tell you when nothing is high. A priority encoder fixes both: it walks the inputs in a declared order, reports the first one it finds, and raises a valid flag so the all-zero case is unambiguous. Nothing about the arithmetic changes. The whole contribution is *the order, written down*.",
        },
        {
          kind: "para",
          text: "Once the order is fixed, the truth table gets much shorter — because you no longer need a row for every combination. If you have already said \"req[7] beats everything\", then the only thing that matters about `req = 8'b1000_0000` and `req = 8'b1011_0110` is that bit 7 is high. The other seven bits cannot change the answer. That is a *pattern*, not a value, and it is the reason the priority encoder is written with a case statement rather than a table of 256 rows.",
        },
        {
          kind: "table",
          head: ["The pattern that means…", "…written as", "idx", "Priority"],
          rows: [
            ["bit 7 is the highest set bit", "8'b1???????", "3'd7", "1st"],
            ["bit 6, with bit 7 clear", "8'b01??????", "3'd6", "2nd"],
            ["bit 5, with 7 and 6 clear", "8'b001?????", "3'd5", "3rd"],
            ["bit 4, with 7, 6, 5 clear", "8'b0001????", "3'd4", "4th"],
            ["bit 3, with 7 to 4 clear", "8'b00001???", "3'd3", "5th"],
            ["bit 2, with 7 to 3 clear", "8'b000001??", "3'd2", "6th"],
            ["bit 1, with 7 to 2 clear", "8'b0000001?", "3'd1", "7th"],
            ["only bit 0 is high", "8'b00000001", "3'd0", "8th"],
            ["no bit is high at all", "8'b00000000", "3'd0", "— valid is 0"],
          ],
          caption:
            "Read the first column as the question each row asks, in order. Read the second column as the answer pattern: the bits that matter are written, the bits that cannot matter are `?`. Row 4 says: bit 4 is set, and it does not matter what bits 7, 6 and 5 are, because if any of them were set an earlier row would have matched first.",
        },
        {
          kind: "code",
          caption:
            "The complete priority encoder. The order of the case branches is the priority order, and the comment says so.",
          code: `module priority_encoder8 (
  input  wire [7:0] req,
  output reg  [2:0] idx,
  output reg        valid
);
  // Priority order, highest first: req[7], req[6], ... req[0].
  // The first matching case branch wins, so order IS the priority.
  always @(*) begin
    idx   = 3'd0;      // safe value if nothing below matches
    valid = 1'b0;
    casez (req)
      8'b1???????: idx = 3'd7;
      8'b01??????: idx = 3'd6;
      8'b001?????: idx = 3'd5;
      8'b0001????: idx = 3'd4;
      8'b00001???: idx = 3'd3;
      8'b000001??: idx = 3'd2;
      8'b0000001?: idx = 3'd1;
      8'b00000001: idx = 3'd0;
      default:     idx = 3'd0;
    endcase
    valid = |req;       // 1 if any request is high, else 0
  end
endmodule`,
          note: "Two things make this lint clean, and both are deliberate. The `idx = 3'd0;` before the case means idx is assigned on every path, so there is no LATCH. The `default:` branch means the case is complete, so there is no CASEINCOMPLETE. You can lint this file and confirm both are silent.",
        },
        {
          kind: "para",
          text: "Forward note: `casez` gets its full treatment in the casez-and-casex topic below, and the clocked `always @(posedge clk ...)` with `<=` in the capstone is there to show where a decision gets held steady — chapter 8 explains these keywords in full; here they just mean the obvious thing.",
        },
        {
          kind: "steps",
          title: "Why the order is the whole design",
          items: [
            {
              head: "Ask the biggest question first",
              body: "The first branch is `8'b1???????` — is bit 7 set? If yes, the answer is 7, and nothing about the other seven bits matters. That single branch answers 128 of the 256 possible input patterns, because bit 7 is set in exactly half of them.",
            },
            {
              head: "Each later branch is narrower",
              body: "The second branch asks bit 7 is clear *and* bit 6 is set. It does not spell out \"bit 7 is clear\" in the pattern, because it does not have to: if bit 7 had been set, the first branch would already have matched and we would never have reached this line. The cascade of earlier branches is what makes each later one shorter.",
            },
            {
              head: "The bottom is exact",
              body: "The last real branch is `8'b00000001`, with no `?` at all. By the time we reach it, we already know bits 7 down to 1 are all clear, so the only question left is bit 0 — and if even that is clear, the request is 0, which is what `default` handles.",
            },
            {
              head: "valid is computed independently",
              body: "`valid = |req;` sits after the case on purpose. It answers a completely different question — \"was *any* request made?\" — and it does not care which one won. Putting it after the case means the two outputs cannot get out of step with each other. This is the version I would write; the version with `if (req != 8'b0) valid = 1'b1;` also works, but it is two more lines for the same one bit.",
            },
            {
              head: "Check the all-zero row explicitly",
              body: "For `req = 8'b0000_0000`, no branch matches, so idx stays 3'd0 and default fires. Then `valid = |req` gives 0. The pair (idx = 0, valid = 0) means nothing is asking, and no input pattern produces that pair. That is the property that makes the module usable, and it is worth checking by hand before you trust it.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "This block is an arbiter",
          text: "An *arbiter* is anything that picks a winner among competing requests. This priority encoder is one. So is the bus arbiter that decides which memory-mapped peripheral gets the bus, and so is the interrupt controller inside a processor, which is built from exactly this shape. When you meet arbitration again in a later chapter, recognise it: the question is always the same — what is the priority order, and who decided it?",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write out the eight case patterns in the order that makes req[7] highest, without looking. Then check each one against the table above.",
            "For `req = 8'b1100_0000`, walk down the branches and say which one matches and why the first one is enough. Confirm idx = 3'd7 and valid = 1.",
            "For `req = 8'b0000_0011`, walk down again. The first branch fails, the second fails, and you should land on `8'b0000001?` giving idx = 3'd1. Note that this is the same answer a plain descending if-chain gives, because req[1] outranks req[0] here.",
            "For `req = 8'b0000_0000`, confirm idx = 3'd0 and valid = 0. Then ask the important question: is (idx = 0, valid = 0) reachable from any other input? Prove it is not, by listing every input that would give idx = 0.",
            "Now reverse the priority by moving the `8'b00000001` branch to the top. Work out the new idx for `req = 8'b0000_0011`. Confirm the hardware changed behaviour with no other edit — that is the decision being live in the code.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Why is `8'b0000001?` written with a `?` on the right rather than `8'b00000010` written exactly?",
              a: "Both would work only for one input each. `8'b0000001?` matches both 8'b00000010 and 8'b00000011, which are exactly the two cases where bit 1 is the highest set bit. Writing it exactly would need two separate branches, one for each of those values. The `?` is what lets one line cover every case where the same bit wins, and it is why the whole encoder is eight lines instead of 256.",
            },
            {
              q: "valid is 1 and idx is 0. What does that tell you, and what would you have to check before acting on it?",
              a: "It means req[0] was the highest-priority request that was asserted. Before acting, you must confirm that the lower-priority req[1] through req[7] are genuinely clear, not merely that this module reported them clear. This module reports what its own priority order implies; it does not confirm the requests have not changed since. That is why a real system registers the decision at a clock edge before acting on it.",
            },
          ],
        },
      ],
    },
    {
      slug: "dont-care-in-a-truth-table",
      title: "x in a truth table means 'this never happens'",
      lede: "This is the one chapter where x does not mean unknown — and the distinction is the whole point.",
      blocks: [
        {
          kind: "para",
          text: "Chapter 1 told you that in this track, x means unknown, and that you should not use it to mean don't-care. That advice is still right for hardware. But there is one place where x means something else entirely, and it is a place you meet on paper, not in silicon: **a truth table you are minimising**. There, an x in an output column means \"I am not going to output anything meaningful here, because this input combination never occurs, so you may make this row say whatever is convenient for you.\"",
        },
        {
          kind: "table",
          head: ["Where you see the x", "What it means", "What it is not"],
          rows: [
            ["A truth table you are minimising", "This input combination cannot occur, so its output is free", "Not unknown — a real decision about the inputs"],
            ["A waveform in simulation", "The value is genuinely not known", "Not permission to choose"],
            ["A wire in real hardware", "Not representable in two states; the value is undetermined", "Not a free choice"],
            ["The input side of a `casez` pattern", "This bit cannot affect the answer", "Not 'this bit is unknown'"],
          ],
          caption:
            "The same character, four meanings, decided entirely by where it appears. Every confusion about don't-cares comes from reading a minimisation table with simulation eyes, or the reverse.",
        },
        {
          kind: "code",
          caption:
            "Two versions of the same function. The long one is correct with no assumptions at all. The short one is correct only because one input combination is known never to happen.",
          code: `// f is 1 when c is high, except when a and b are both high.
module two_versions (
  input  wire a,
  input  wire b,
  input  wire c,
  output wire f_careful,   // correct for all 8 input combinations
  output wire f_simple     // correct only if 111 never occurs
);
  assign f_careful = (~a & c) | (a & ~b & c);
  assign f_simple  = c;
endmodule`,
          note: "These two functions are not equal. On input a=1, b=1, c=1 the careful version outputs 0 and the simple version outputs 1. If that input can never occur, the disagreement is unobservable and the simple version is the right one — three literals instead of five, and one gate instead of two.",
        },
        {
          kind: "table",
          head: ["a", "b", "c", "f_careful", "f_simple", "What we actually need"],
          rows: [
            ["0", "0", "0", "0", "0", "0"],
            ["0", "0", "1", "1", "1", "1"],
            ["0", "1", "0", "0", "0", "0"],
            ["0", "1", "1", "1", "1", "1"],
            ["1", "0", "0", "0", "0", "0"],
            ["1", "0", "1", "1", "1", "1"],
            ["1", "1", "0", "0", "0", "0"],
            ["1", "1", "1", "0", "1", "x  — never occurs"],
          ],
          caption:
            "The first five rows where they differ: there are none. The two versions agree on 000, 001, 010, 011, 100, 101, 110 — every single row that can actually happen. They disagree only on the last row, which is the row that cannot happen.",
        },
        {
          kind: "steps",
          title: "How one x deletes a whole product term",
          items: [
            {
              head: "Start from what the circuit must actually do",
              body: "The circuit is meant to be high when c is high, but not when both a and b are high — because a and b high together means a fault condition that the spec says the system prevents. So the row a=1, b=1, c=1 is unreachable. Write x in that output cell. This is a statement about the world, not about the circuit.",
            },
            {
              head: "Now minimise, treating that cell as free",
              body: "Look for neighbouring rows. The ones where c is high are 001, 011, 101, and 111. All four have c=1. The row 111 is free, so the group of four collapses to a single rule: output c. No a, no b, no gates to speak of.",
            },
            {
              head: "Count what you removed",
              body: "Without the free cell, the best you can do is `c AND NOT (a AND b)`, which needs the product term `a & ~b & c` as well. That is one AND gate and two NOTs. With the free cell, you write `c` and delete that entire product term. One product term, gone — the hardware shrinks because you told it a row it never has to get right.",
            },
            {
              head: "The crucial honesty step",
              body: "You may only mark a row x if you can say out loud *why* it cannot occur. \"I could not think of a case\" is not a reason. \"The datasheet says these two signals are mutually exclusive\" is. \"The only way to reach this state is a fault we treat as impossible\" is. If you cannot produce that sentence, leave the row alone and write the careful version.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          title: "An x in an output column is a promise about the inputs",
          text: "You are not saying \"the circuit will produce an unknown value here\". You are saying \"this state is unreachable, so build whatever is cheapest\". If you mark a row x and the state turns out to be reachable, the circuit will not complain — it will quietly return the wrong value in exactly the situation you promised could not happen, which is the worst possible time to find out. Treat every x you write as a design decision you would have to defend in a review.",
        },
        {
          kind: "trap",
          wrong: "Copying a truth table from a textbook or a datasheet, minimising it with the x's, and then dropping the x's and shipping the simplified Verilog without reading what each x assumed.",
          right: "Keep the table with its x's, and write one line of prose next to the code saying which input combinations are unreachable and why.",
          why: "The x's are not decoration in the table — they are the load-bearing part of the argument. A textbook that marks a row x is telling you the function only exists inside a larger system with constraints you may not share. Lift the table out of that system and the x becomes a lie, and the simplified code will be wrong for a real, reachable input that the original author knew about and you do not.",
        },
      ],
    },
    {
      slug: "casez-and-casex",
      title: "case, casez and casex: matching with wildcards",
      lede: "casez treats z and ? as 'any bit here'. casex goes further and treats x as well — which is why it is dangerous.",
      blocks: [
        {
          kind: "para",
          text: "The priority encoder needed patterns like `8'b1???????`, where seven bits are marked as not mattering. That is a *wildcard* match, and it is what `casez` provides. The rule is short: in a `casez`, a `?` or a `z` in the pattern matches 0, 1, x, or z. An `x` written in the *pattern* is compared the normal exact way — but an `x` in the *expression* is still matched by a wildcard position, which is the subtlety the table below spells out. Plain `case` has no wildcards at all — every bit must match exactly, all four states included.",
        },
        {
          kind: "table",
          head: ["You write", "`?` in the pattern", "`z` in the pattern", "`x` in the pattern", "Verilator says"],
          rows: [
            ["case", "no wildcard — never matches anything but a literal ?", "compared exactly", "compared exactly", "nothing if it is all defined values"],
            ["casez", "matches 0, 1, x or z", "matches anything", "x in the expression IS still matched by `?`: `a=1x` matches `1?`; only an `x` written in the *pattern* is compared exactly", "%Warning-CASEWITHX if you write a literal x"],
            ["casex", "matches 0, 1, x or z", "matches anything", "matches anything", "%Warning-CASEX every time"],
          ],
          caption:
            "The middle column is the whole difference between casez and casex. Both treat ? as a wildcard. Only casex also treats a real x as a wildcard — and that is the setting that quietly erases the distinction between 'I do not care' and 'I do not know'.",
        },
        {
          kind: "code",
          caption:
            "The same two-branch case, written four ways. All four compile. They agree on defined inputs and diverge in exactly the places the warning names.",
          code: `module four_ways (
  input  wire [1:0] a,
  output reg  y
);
  // 1. plain case: '0?' in the pattern means a literal question mark,
  //    so this branch can essentially never match. Verilator reports
  //    %Warning-CASEWITHX: x/? constant in case statement.
  always @(*) begin
    case (a)
      2'b0?: y = 1'b1;
      default: y = 1'b0;
    endcase
  end
endmodule`,
          note: "On defined inputs this module outputs 0 for every value of a. That is what a plain case does with a wildcard: nothing. If you meant 'bit 1 is high, bit 0 does not matter', you wanted casez, and the CASEX/CASEWITHX warning is the tool telling you so.",
        },
        {
          kind: "code",
          caption:
            "The version you actually meant. `2'b0?` now matches 0, 1, x and z in the low position, which is exactly the 'this bit cannot affect the answer' pattern from the priority encoder.",
          code: `module wildcard_by_intent (
  input  wire [1:0] a,
  output reg  y
);
  always @(*) begin
    casez (a)
      2'b0?: y = 1'b1;
      default: y = 1'b0;
    endcase
  end
endmodule`,
          note: "Compare the two modules on the input 2'b0x. The plain case falls to default and gives 0. The casez matches the 2'b0? branch and gives 1, because it decided the low bit was irrelevant — which is a decision about your design, and a correct one if bit 0 truly cannot change the answer.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Never use casex in this track",
          text: "casex makes an x in a wire a wildcard, so a genuinely unknown input silently falls into whichever branch happens to match. You get a confident-looking 0 or 1 out of a circuit that was handed a value it should have flagged as a problem. Verilator tells you every single time: `%Warning-CASEX: Suggest casez (with ?'s) in place of casex (with X's)`. Treat that warning as an error, and if you feel a pull toward casex, what you actually want is casez or a plain case with an explicit default.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "When casez is genuinely the right tool",
          text: "Three cases. First, exactly the priority encoder pattern: a bit that cannot change the answer because an earlier branch already ruled it out. Second, bit masks — matching a register's control bits while ignoring the data bits, as in `casez (ctrl) 4'b01??: …`. Third, any time a bit is a genuine don't-care *by construction*, like a padded field that is documented as always zero. In all three, the bit is irrelevant to the hardware, not merely unknown to the simulator. That is the test: could you point at the design and say this bit has no effect on the output, for reasons that hold in the real chip?",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take the two modules above and work out y for a = 2'b00, 2'b01, 2'b10, 2'b11 in each. The plain case gives 0 for all four, because a `?` there is just a question mark. The casez gives 1, 1, 0, 0. They do not agree anywhere — which is the point of the next item.",
            "Now the input 2'b0x. Plain case gives 0. casez gives 1. Write one sentence explaining why the casez answer is defensible: because the branch pattern says bit 0 is irrelevant to the result, so any value in that position — including x — must produce the same output.",
            "Then imagine the pattern had been `2'b?0` instead, and a = 2'bx0. The casez branch matches on bit 0 being clear and bit 1 being free. Ask whether that is a decision you made or a coincidence, and whether the hardware would still be right if bit 1 were genuinely unknown.",
            "Count the wildcard characters in the priority encoder's eight patterns and add them up. Then write the module out with plain `case` and every one of the 256 possible input values spelled out. That is what the wildcards are saving you from.",
            "Finally, write a one-line comment you would put above a casez block explaining which bits are wildcards and why they cannot matter. If you cannot write it, you do not understand the block well enough to ship it.",
          ],
        },
        {
          kind: "trap",
          wrong: "Using `casex` to \"match anything\", because it sounds like it ignores x.",
          right: "Use `casez` with `?` characters. If you need the pattern to accept a genuinely unknown bit, ask whether your design should be producing a result at all when a value is unknown.",
          why: "casex does ignore x — that is exactly the problem. An input that has gone unknown, whether from a fault, an uninitialised register, or a timing violation, will quietly select a branch and produce a confident answer. The bug it causes is not a wrong value you can see in the output; it is the absence of the x that would have told you something was wrong. casez keeps the difference: `?` is a decision you made, x is still information the hardware is handing you.",
        },
      ],
    },
    {
      slug: "latches-and-missing-branches",
      title: "Missing defaults, missing endcase, and the two warnings that mean it",
      lede: "A case that does not cover its input space is not a style problem. It is a hardware change.",
      blocks: [
        {
          kind: "para",
          text: "A combinational `always` block describes hardware that is always computing something. For that to be true, every output must be given a value on every path through the code. If there is a path where an output is not assigned — because a `case` falls off the end — the hardware cannot just guess. It has to *remember* the value from last time. That memory is a latch, and a latch in a design that did not ask for one is a bug, not an optimisation.",
        },
        {
          kind: "code",
          caption:
            "This is a case with no `default`, covering only 2 of 8 possible input values. Both warnings fire, and both are right.",
          code: `module bad_latch (
  input  wire [2:0] sel,
  output reg  [2:0] y
);
  always @(*) begin
    case (sel)
      3'd0: y = 3'd1;
      3'd1: y = 3'd2;
    endcase
  end
endmodule`,
          note: "Verilator reports two things here. %Warning-CASEINCOMPLETE: Case values incompletely covered (example pattern 0x2) — the case does not mention 3'd2. And %Warning-LATCH: Latch inferred for signal 'y' (not all control paths of combinational always assign a value). The first names the gap, the second names the hardware damage.",
        },
        {
          kind: "table",
          head: ["Message", "What it says", "What to do"],
          rows: [
            ["%Warning-CASEINCOMPLETE", "The case does not mention every possible value, and there is no default", "Add a default, or list every value"],
            ["%Warning-LATCH", "Some path through the block leaves this output unassigned, so it must hold its old value", "Assign the output on every path — a default is the easy way"],
            ["%Warning-CASEX", "You used casex, where x matches as a wildcard", "Switch to casez with ? wildcards"],
            ["%Warning-CASEWITHX", "You used x or ? in a plain case, where neither is a wildcard", "Switch to casez if you meant a wildcard"],
            ["%Warning-WIDTHTRUNC", "The right-hand side is wider than the destination", "Widen the destination or narrow the expression explicitly"],
          ],
          caption:
            "All five of these are Verilator warning class names, and all five are worth treating as real. The first two are the pair you will meet most in this chapter.",
        },
        {
          kind: "code",
          caption:
            "The same module with a `default` added. Both warnings are gone, and lint is silent.",
          code: `module good_latch (
  input  wire [2:0] sel,
  output reg  [2:0] y
);
  always @(*) begin
    case (sel)
      3'd0: y = 3'd1;
      3'd1: y = 3'd2;
      default: y = 3'd0;
    endcase
  end
endmodule`,
          note: "There is a second fix, and it is worth knowing because it is a common style. Assign the output before the case, then the case only has to override it when a branch matches. That silences LATCH — Verilator will not report a latch when the output is assigned on every path — but CASEINCOMPLETE will still fire, because the case genuinely does not cover the space. Both fixes are legitimate; the default is the one that says what the hardware should do.",
        },
        {
          kind: "code",
          caption:
            "And the version from the priority encoder, which uses both. Lint it and confirm neither warning appears.",
          code: `always @(*) begin
  idx   = 3'd0;     // covers every path, so no LATCH
  valid = 1'b0;
  casez (req)
    8'b1???????: idx = 3'd7;
    8'b01??????: idx = 3'd6;
    // ... six more branches ...
    default:     idx = 3'd0;   // covers every value, so no CASEINCOMPLETE
  endcase
  valid = |req;
end`,
          note: "The pre-assignment is belt and the default is braces. If you write the default, the pre-assignment is not strictly needed. If you write the pre-assignment, you should still understand that CASEINCOMPLETE is warning you about the case itself, not about the latch.",
        },
        {
          kind: "trap",
          wrong: "Forgetting `endcase` when a `case` sits inside a branch of another `case`.",
          right: "Count the `case` keywords and count the `endcase` keywords. They must match, every time, before you save.",
          why: "Verilog does not recover well from a missing block terminator. If the outer `case` has no `endcase`, Verilator reports `syntax error, unexpected end, expecting IDENTIFIER-for-type` pointing at the *end* of your `always` block — several lines past the mistake. The line number in the error is the end of the construct you broke, not the line you broke it on, so following the message literally sends you the wrong way.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take `bad_latch` above and work out y for all eight values of sel. For sel = 3'd2 through 3'd7, y keeps whatever it had. Write that as 'y = y' in your table, and recognise it as a latch: a wire that remembers.",
            "Now ask: is the latch *always* wrong? Sometimes a latch is exactly what you want, for a signal that is meant to hold its value until something changes it. Name one such use from the chapters so far, and confirm you would write a different, deliberate form for it — which is what the Verilator LATCH message suggests when it says to use `always_latch` for intentional latches.",
            "Add `default: y = 3'd0;` to `bad_latch`. Work out y for sel = 3'd5 and confirm it is now a definite 0 rather than 'unchanged'.",
            "Delete the `default` again but put `y = 3'd0;` as the first line inside the `always` block instead. Lint it in your workspace. Which warning appears and which one does not, and what does that tell you about what each warning is actually measuring?",
          ],
        },
      ],
    },
    {
      slug: "interrupt-priority-unit",
      title: "Preview: registering the priority decision (chapter 8)",
      lede: "The whole chapter in one module — eight request lines in, a 3-bit index and a valid flag out — held steady by a clock and a reset, which are chapter 8's subject.",
      blocks: [
        {
          kind: "para",
          text: "This topic is a preview of chapter 8. The chapter's practice set, the Interrupt Priority Unit, is the **combinational** version of this module with the 3-port interface `top (req, idx, valid)` — the priority encoder you have already built, no clock. Here we take that same logic one step further and add a register that holds the decision steady, driven by `clk` and an active-low `rst_n`. Eight peripherals each drive a request line. The unit decides which one gets serviced when several are asking and reports the winner as a 3-bit index plus a flag saying whether there was anything to report. Everything you have learned in this chapter lives in the combinational half: the decoder's pattern-matching instinct, the case statement's first-match-wins rule, the priority order, the valid flag, and the `default` that keeps the latch away. The clocked half is what chapter 8 explains in full.",
        },
        {
          kind: "code",
          caption:
            "The finished module. Read it once as a whole before you take it apart — there is no new syntax in it, only decisions you have already seen made.",
          code: `module interrupt_priority_unit (
  input  wire       clk,
  input  wire       rst_n,
  input  wire [7:0] req,
  output reg  [2:0] idx,
  output reg        valid,
  output wire       irq
);

  // Which request wins. The order of these lines is the design decision:
  // req[7] is the most urgent, req[0] the least.
  reg [2:0] idx_r;
  reg       valid_r;

  always @(*) begin
    idx_r   = 3'd0;
    valid_r = 1'b0;
    casez (req)
      8'b1???????: idx_r = 3'd7;
      8'b01??????: idx_r = 3'd6;
      8'b001?????: idx_r = 3'd5;
      8'b0001????: idx_r = 3'd4;
      8'b00001???: idx_r = 3'd3;
      8'b000001??: idx_r = 3'd2;
      8'b0000001?: idx_r = 3'd1;
      8'b00000001: idx_r = 3'd0;
      default:     idx_r = 3'd0;
    endcase
    valid_r = |req;
  end

  // Hold the decision so it cannot change while it is being acted on.
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      idx   <= 3'd0;
      valid <= 1'b0;
    end else begin
      idx   <= idx_r;
      valid <= valid_r;
    end
  end

  // One wire out to the processor: something is asking.
  assign irq = valid;

endmodule`,
          note: "Note the port list: idx and valid are `output reg`, not `output wire`, because a clocked `always` block assigns them. irq stays a wire because a continuous `assign` drives it, and a wire can feed a continuous assign. Get this wrong and Verilator stops with %Error-PROCASSWIRE: Procedural assignment to wire. The first `always` block is combinational and is the priority encoder you already know; the second is sequential, and the `reg` declarations on the ports are what allow it to exist.",
        },
        {
          kind: "steps",
          title: "Take the module apart, part by part",
          items: [
            {
              head: "The ports say what the box is for",
              body: "`req[7:0]` is eight request lines coming in. `idx[2:0]` is the answer: which request won, as a number. `valid` says whether there was anything to answer. `irq` is the interrupt request line itself, wired straight to valid. `clk` and `rst_n` are for the register — clock edge, and an active-low reset (the `n` suffix means the reset is asserted when the signal is 0).",
            },
            {
              head: "The combinational block makes the decision",
              body: "Everything from `idx_r = 3'd0;` down to `valid_r = |req;` is the priority encoder. The `casez` walks the requests from req[7] downward and the first pattern that matches sets the index. Nothing here is new — it is the module from the priority encoder topic with the register and the `reg` declarations bolted on.",
            },
            {
              head: "The sequential block holds it steady",
              body: "The second `always` uses `@(posedge clk or negedge rst_n)`, which is the standard reset-able clocked block. On every rising edge, `idx` and `valid` take the values the combinational block computed. Now if req[2] drops and req[1] rises, the combinational answer changes from 2 to 1, but `idx` stays at 2 until the next clock edge — which is exactly the hazard from the priority topic, fixed.",
            },
            {
              head: "irq is a rename, not a new computation",
              body: "`assign irq = valid;` is a continuous assignment giving a second name to the same wire. Some systems will read it as a single level-sensitive interrupt line; the registered version of the module exposes it as a convenience. The chapter's practice set does not have this port — it stops at `idx` and `valid`. The logic is identical to `|req`, held for one clock cycle.",
            },
            {
              head: "Check the reset, because it is the row people forget",
              body: "Before the first clock edge, a register holds x. If software reads `idx` or `valid` in that window it gets x, not 0. `if (!rst_n)` forces both registers to 0 on the first clock edge after reset is asserted, so the module comes out of reset in a known state. This is the same care you took in chapter 1 with the all-zero row of an encoder, one level up.",
            },
          ],
        },
        {
          kind: "table",
          head: ["req", "Which lines are high", "idx", "valid", "Why"],
          rows: [
            ["8'b0000_0000", "none", "000", "0", "Nothing is asking. The `default` fires and `|req` is 0."],
            ["8'b0000_0001", "req[0]", "000", "1", "Only bit 0 matches `8'b00000001`."],
            ["8'b0000_0100", "req[2]", "010", "1", "Bits 7 to 3 are clear, bit 2 is set."],
            ["8'b0000_0011", "req[1], req[0]", "001", "1", "req[1] outranks req[0], so it wins."],
            ["8'b1100_0000", "req[7], req[6]", "111", "1", "req[7] is the very first branch, so it wins immediately."],
            ["8'b1010_1010", "req[7], req[5], req[3], req[1]", "111", "1", "Four requests at once; req[7] wins and the rest wait."],
            ["8'bxxxx_xxxx", "unknown", "x", "x", "No pattern matches for certain — each one pins at least one literal 1, and an unknown is not a 1 — so the simulation hands you x on both outputs. A real design should not be driving unknown requests."],
          ],
          caption:
            "The last two rows are the ones to think hardest about. The multi-request rows are the whole point of the design. The all-x row is a warning of a different kind: a request bus that has gone unknown does not produce a confident index of 7 — it produces x, because every branch has a literal 1 that an unknown cannot equal. The wildcards kept the module compact and correct for real inputs; what they cannot do is turn a broken input into a valid answer.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The habit to build from this chapter",
          text: "Before you compile, pick four inputs, write down what you predict for idx and valid, and only then run it. The fourth row of that table — req = 8'b0000_0011 with two requests high — is the one worth predicting, because it is the only row where your answer depends on a decision you made rather than on arithmetic. If your prediction and the simulator disagree, one of you has the priority order wrong, and now you know exactly where to look.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Two request lines are high and neither is req[7]. What does this module report, and what does that tell you about the design?",
              a: "It reports the higher-numbered of the two, because the case branches are written in descending order and the first match wins. That is the priority order stated explicitly in the source: req[7] down to req[0]. If the system needed the other one to win, you would reorder the branches — and you would change the chip's behaviour, which is exactly why that decision belongs in the code where a reader can find it rather than in an accident of statement order.",
            },
            {
              q: "You swap two case branches and the lint output is unchanged. What does that tell you, and what does it not tell you?",
              a: "That tells you the code is still structurally valid — the patterns are still well-formed, the case is still complete, the default is still there, so no warning changes. It does not tell you the behaviour is unchanged, and it certainly does not tell you the behaviour is still correct. Lint checks structure; priority order is a design decision that no tool can check for you, which is why the comment above the case is not decoration.",
            },
            {
              q: "Why does the combinational part of this module assign idx_r before the case, when there is also a default?",
              a: "Because the two are doing different jobs. The pre-assignment guarantees idx_r is written on every path, which is what keeps the block latch-free and defensible even if someone later deletes the default. The default is what makes the case complete, which is what silences CASEINCOMPLETE. Having both means each property is established explicitly rather than as a side effect of the other. It costs one line and it makes the module's behaviour readable without tracing the case.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "decoder", meaning: "A block that takes an n-bit number on its input and lights exactly one of 2ⁿ one-bit outputs — the bit pattern you get is called one-hot." },
    { term: "encoder", meaning: "A block that takes 2ⁿ one-bit inputs and reports which one is high, as an n-bit number. The reverse of a decoder." },
    { term: "one-hot", meaning: "An output pattern with exactly one bit high and the rest low, like 0000_1000." },
    { term: "one-cold", meaning: "An output pattern with at most one bit high — what an encoder produces, and the mirror image of one-hot." },
    { term: "case statement", meaning: "A multi-way choice: `case` … `endcase` with one branch per value of the expression in parentheses." },
    { term: "default", meaning: "The branch of a case taken when nothing else matched. Optional in the language, mandatory in practice — without it, or without assigning outputs on every path, you get a latch." },
    { term: "first match wins", meaning: "A case checks its branches from top to bottom and stops at the first match, so branch order carries meaning. This is the mechanism behind priority." },
    { term: "priority encoder", meaning: "An encoder that also declares which input wins when several are high, reporting the highest-priority active one." },
    { term: "priority order", meaning: "The declared ranking of competing inputs. In code it is the order of the case branches." },
    { term: "valid flag", meaning: "A separate output that is 1 only when the input genuinely encodes something, so that an all-zero input cannot be mistaken for a real answer." },
    { term: "reduction operator", meaning: "A single `|` before a vector, meaning OR every bit together into one result. `|req` is the standard way to build a valid flag." },
    { term: "arbiter", meaning: "Any block that picks a winner among competing requests. A priority encoder, a bus arbiter, and an interrupt controller are all arbiters." },
    { term: "don't-care condition", meaning: "A row of a truth table marked x during minimisation, meaning the input combination cannot occur so the output there is free to be whatever is cheapest." },
    { term: "casez", meaning: "A case variant where `?` (and `z`) in the pattern matches 0, 1, x or z. `x` is still compared exactly. This is the safe wildcard." },
    { term: "casex", meaning: "A case variant where `x`, `z` and `?` are all wildcards. It hides genuinely unknown inputs, Verilator warns with %Warning-CASEX, and this track does not use it." },
    { term: "latch", meaning: "Hardware that remembers its output when the input does not change. In a combinational `always` block it means some path failed to assign the output — Verilator reports %Warning-LATCH." },
  ],
  nextStep:
    "The first lesson, Priority Encoder, puts the combinational core on the board: build the truth table of an 8-to-3 priority encoder, implement it with an `always @(*)` and a `case`, then rewrite it with `casez` and compare the match semantics, and finally add a `valid` output and confirm it is 0 for the all-zero request. That is the 3-port module the practice set asks for as `top (req, idx, valid)`, one step at a time. The registered interrupt unit in the capstone is a preview of chapter 8 — the clock, the reset and the `<=` arrive there, and the comparison between the plain `case` and the `casez` version is still worth slowing down on now.",
};
