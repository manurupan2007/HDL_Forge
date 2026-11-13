import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 1,
  chapterSlug: "synthesis-foundations",
  title: "Synthesis Foundations",
  readMinutes: 22,
  youWillBeAbleTo: [
    "Explain what a bit is and why a hardware signal can only be 0 or 1",
    "Group bits into a vector and say how many values that vector can hold",
    "Write a number in Verilog in binary, decimal and hex, and prove they are the same value",
    "Describe a module's interface with input, output and wire, and say what each word does",
    "Drive an output with a continuous assignment and explain why it keeps up with its inputs",
    "Read and complete a truth table, and turn a truth table into one line of Verilog",
    "Tell the difference between 0, 1, x and z, and know when each one shows up",
    "Read a compiler message and decide whether it is a real mistake or just a style note",
  ],
  mentalModel: [
    {
      title: "A bit is a switch, and a wire is a wire",
      body: "Everything in digital hardware is built from one idea: a wire that is either pushed low or pushed high. Low we call 0. High we call 1. That single choice, repeated, is enough to compute anything — because you can build a rule that says \"this wire is high only when both those wires are high\". When people say hardware is digital, they mean exactly this: every wire is one of two states, with nothing in between. A bit is just the name for one of those on/off facts. A 4-bit signal is four of those wires bundled together and named as a group. Verilog's job is to let you describe those wires and the rules between them, in text, instead of with solder.",
    },
    {
      title: "Describing hardware is not the same as running software",
      body: "A Verilog module is not a recipe you execute line by line. It is a picture of a circuit that always exists. There is no \"then\" in hardware — everything is happening at once, all the time. This is why Verilog has no `if` at the top level and no loop at the top level. Instead you write rules: \"this output equals that expression\". The tool reads all your rules together and builds the circuit. The word *synthesis* just means that conversion — turning your written rules into a real netlist of gates. This chapter is called Synthesis Foundations because everything later in the track is a more elaborate way of writing rules that become gates.",
    },
  ],
  topics: [
    {
      slug: "what-is-a-bit",
      title: "What a bit actually is",
      lede: "Before any syntax, the physical idea: a wire is low or high, and that is all a bit is.",
      blocks: [
        {
          kind: "analogy",
          text: "Picture a light switch. It has two positions: off and on. A wire in a digital circuit is the same thing — a single switch, permanently in one of two positions. Electrically, 0 means \"pulled down to ground\" and 1 means \"pulled up to the supply rail\". Nobody has ever put a genuine 0.7 volts on a digital wire and called it a third state. That is why the word *bit* (binary digit) is honest: a bit has exactly two values, so one bit can carry exactly one bit of information.",
        },
        {
          kind: "para",
          text: "Now the useful consequence. If one wire has two possible values, and you want to remember one of several things, you count. One bit distinguishes 2 things. Two bits, used as a pair, distinguish 4. Eight bits distinguish 256. Sixteen bits distinguish 65,536. Every memory size, every register width, every address you will ever write in this track is just this counting rule applied to a number of wires.",
        },
        {
          kind: "table",
          head: ["Bits", "How many different values it can hold"],
          rows: [
            ["1", "2 (0 and 1)"],
            ["2", "4 (0, 1, 2, 3)"],
            ["4", "16 (0 through 15)"],
            ["8", "256 (0 through 255)"],
            ["16", "65,536 (0 through 65,535)"],
            ["32", "4,294,967,296 (0 through 4,294,967,295)"],
          ],
          caption:
            "The rule is 2 to the power of the width. 4 bits means 2⁴ = 16 values, which is why a 4-bit value tops out at 15.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why this matters for width errors",
          text: "If you declare a wire as 4 bits and try to put the value 20 into it, 20 needs 5 bits and does not fit. Hardware cannot overflow on its own — there is nowhere for the extra bit to go. In software an integer just grows. In Verilog the value is forced to the width you declared, and the extra bit is thrown away. This single fact causes more silent bugs than anything else in the track, which is why it appears again in every chapter.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A signal is 3 bits wide. How many distinct values can it hold, and what is the largest one?",
              a: "2³ = 8 distinct values, largest is 7. Three wires, each high or low, gives 8 combinations: 000, 001, 010, 011, 100, 101, 110, 111. Written as numbers that is 0 to 7.",
            },
            {
              q: "You have a box with 12 switches. How many different states can it be in?",
              a: "2¹² = 4096 states. Multiply, don't add: each switch doubles the count, so a box of n switches has 2ⁿ states. Twelve switches is enough to name 4096 different things.",
            },
          ],
        },
      ],
    },
    {
      slug: "vectors",
      title: "Grouping bits: vectors and widths",
      lede: "Four wires in a row is a 4-bit signal, and `[3:0]` is how you say which end is which.",
      blocks: [
        {
          kind: "para",
          text: "You almost never care about one wire alone. You want a whole number: a byte, a counter value, a shift amount. So you bundle wires into a group and give the group a name. That group is called a *vector*. Its width — 4, 8, 16 — is the number of wires in the bundle. When you declare `wire [3:0] a`, you are saying: make four wires, name them a[3], a[2], a[1], a[0], and let people refer to the whole bundle as `a`.",
        },
        {
          kind: "analogy",
          text: "A vector is a row of toggle switches on a mixing desk, each labelled left to right. The bracket notation `[3:0]` is the labels on those switches, and the order of the labels is the part people get wrong. The number before the colon is the *high* end (the biggest place value) and the number after is the *low* end. `[3:0]` reads \"counting down from 3 to 0\", so bit 3 sits on the left and is the most significant bit.",
        },
        {
          kind: "table",
          head: ["How you write it", "What it means"],
          rows: [
            ["wire a", "one wire, 1 bit wide"],
            ["wire [3:0] a", "four wires: a[3] a[2] a[1] a[0]"],
            ["wire [0:3] a", "the same four wires, but a[0] is listed first"],
            ["wire [7:0] a", "eight wires — one byte, the standard unit in this track"],
            ["wire [15:8] a", "a slice: just the top 8 of 16 wires"],
          ],
          caption:
            "`[3:0]` and `[0:3]` describe the same width. They differ only in which index is the leftmost. The rule in this track: always write the high index first, `[7:0]`, so the number reads the same way it is written on paper.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The leftmost bit is the heaviest",
          text: "In `[3:0]`, a[3] has a value of 8, a[2] is worth 4, a[1] is worth 2, a[0] is worth 1. That is binary place value, exactly like decimal place value: in 457, the 4 is worth 400 and the 7 is worth 7. The high index is on the left because that is where the biggest value goes.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Write `wire [3:0] a` and label the four wires a[3] a[2] a[1] a[0].",
            "Write the place value under each: 8, 4, 2, 1.",
            "Set the wires to `a = 4'b1010`. Add up the lit wires: 8 + 0 + 2 + 0 = 10.",
            "Set them to `a = 4'b0111`. Add up: 0 + 4 + 2 + 1 = 7. That is the largest 4-bit value, which confirms the count.",
            "Set them to `a = 4'b1111` and confirm 8 + 4 + 2 + 1 = 15, and that there is no 16th value.",
            "Repeat once for `[7:0]`: write the place values 128 64 32 16 8 4 2 1 and check that `8'b0000_1000` is 8.",
          ],
        },
        {
          kind: "trap",
          wrong: "`wire [0:3] a;` on Monday, `wire [3:0] a;` on Tuesday, in the same design.",
          right: "Pick one convention and never break it. Use `[high:0]` everywhere.",
          why: "Both are legal Verilog and both are 4 bits wide, so the compiler will not warn you. The bug appears when you write `a[0]` expecting the top bit and get the bottom one, and the failure shows up as a wrong answer somewhere unrelated. Convention is what protects you here, not the toolchain.",
        },
      ],
    },
    {
      slug: "literals",
      title: "Writing numbers in Verilog",
      lede: "The literal format is width'basedigits — how many bits, what base, then the digits.",
      blocks: [
        {
          kind: "para",
          text: "Writing `1010` in Verilog is ambiguous: is that one thousand and ten in decimal, or ten in binary? Verilog removes the guessing with a compact format that reads as size, then base, then the value. You have seen it already without knowing it: `4'b1010`. That is four bits, binary, one-zero-one-zero. Four pieces of information, and you only had to learn four letters.",
        },
        {
          kind: "table",
          head: ["You write", "You mean"],
          rows: [
            ["4'b1010", "4 bits, binary, the value ten"],
            ["4'd10", "4 bits, decimal, the value ten"],
            ["4'hA", "4 bits, hex, the value ten"],
            ["4'o12", "4 bits, octal, the value ten"],
            ["8'hFF", "8 bits, hex, the largest byte"],
            ["32'd42", "32 bits, decimal, forty-two"],
            ["1'b1", "the single value 1"],
            ["1'b0", "the single value 0"],
          ],
          caption:
            "The letters are b, d, o, h for binary, decimal, octal, hexadecimal. The width number before the quote mark is optional but you should always write it in this track.",
        },
        {
          kind: "para",
          text: "Hexadecimal exists because writing a long binary number is miserable. One hex digit is exactly four binary bits, so `8'hA0` and `8'b1010_0000` are the same 8 bits. When you count 4 bits at a time, hex is a quarter the typing. This is the only reason to care about hex in chapter 1, and it is worth it — you will read hex register dumps for the rest of the track.",
        },
        {
          kind: "analogy",
          text: "It is exactly like time. 60 seconds, 1 minute, 60 minutes, 1 hour — same duration, different notation, chosen for convenience. `4'b1010`, `4'd10` and `4'hA` are three notations for the same instant. The number in front tells you how much room the container has.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Write the value 10 in binary on four bits: start at the heaviest wire. 8 fits into 10, so set that bit and subtract — 2 left. 4 does not fit into 2, so leave that wire 0. 2 fits, so set that bit — 0 left, and the last wire is 0. You should get `1010`.",
            "Write `4'b1010` and `4'd10` and `4'hA` next to each other and tick that all three are ten.",
            "Convert `8'b1010_1010` to hex by splitting into two halves, `1010` and `1010`, each of which is A. Result: `8'hAA`.",
            "Convert `8'hFF` back to binary: F is 1111, so the answer is `1111_1111`.",
            "Check the width rule: `4'b1100` is twelve. Now ask what `4'd12` is — still twelve. Both fit in 4 bits.",
            "Try to break it: `4'b11000` is 24 in binary, but 24 does not fit in 4 bits. Paste it into the editor and read what Verilator says — it refuses the literal with an error, Too many digits for 4 bit number, and the build stops. iverilog is the lenient one: it prints a warning and quietly keeps 1000, which is 8. Either way the 24 you typed is gone, so always size your numbers.",
          ],
        },
        {
          kind: "trap",
          wrong: "`4'b11000` — writing five digits into a four-bit literal.",
          right: "`5'b11000`, or work out that 24 needs 5 bits.",
          why: "Verilator rejects it loudly — the error says the literal has too many digits for its declared width, and the build stops. iverilog truncates with a warning instead: 4 bits can hold 0 to 15 only, so the leading 1 is discarded and you are left holding 8. Always check that the number fits before you type the literal.",
        },
        {
          kind: "trap",
          wrong: "`8'b1010 1010` — a space in the middle of the digits.",
          right: "Use `8'b1010_1010` with an underscore.",
          why: "The underscore is the only character Verilog allows for readability inside a literal, which is why every wide constant in this track is written as `4'b0000_1111`. A space ends the literal and the trailing digits become a syntax error — a loud one, at least. The base letter itself is case-insensitive: `4'B1010` and `4'HA` are both legal, so writing it lowercase is our convention, not the language's rule.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Small numbers, written clearly",
          text: "For values 0 to 9 you can write them as plain decimal: `y = 0;` or `y = 9;` and Verilog fills in the width for you. It is still better practice to write the explicit form — `4'd0`, `4'd9` — because it forces you to keep track of how wide the signal is supposed to be. Explicit width is a habit that prevents bugs in this track.",
        },
        {
          kind: "check",
          items: [
            {
              q: "What value does `4'h7` hold? What about `4'b0111`?",
              a: "Both are 7. Hex digit 7 is the same as binary 0111 — 0+4+2+1. `4'h7` = `4'b0111` = `4'd7`.",
            },
            {
              q: "You need to store the value 19. What is the narrowest width that works, and what is the literal?",
              a: "5 bits, because 19 > 15. Write `5'b10011` or `5'd19` or `5'h13` — all the same. If you wrote `4'd19`, Verilator would flag it with a WIDTHTRUNC warning — Value too large for 4 bit number — and iverilog would truncate it to `4'b0011` = 3 with a warning of its own. Loud in both tools, but only if you read the output, so always size your numbers.",
            },
          ],
        },
      ],
    },
    {
      slug: "module-and-ports",
      title: "A module is a box with pins",
      lede: "The unit of hardware: a name, a list of pins, and a description of what happens inside.",
      blocks: [
        {
          kind: "analogy",
          text: "A module is a black box. You cannot see inside it, you only know what goes in and what comes out. The list of pins is the guarantee: an `input` is a wire that pushes a value in, an `output` is a wire that hands a value back. If someone hands you a black box and you are told \"two inputs, one output, and the output is high when both inputs are high\", you can use it correctly without ever knowing how it was built. That is the entire point, and it is why modules are the foundation of every large design.",
        },
        {
          kind: "para",
          text: "Writing one is three things: the keyword `module`, a name, and a parenthesised port list. The port list is where direction and width live. The word `wire` in the port list says this is a plain wire — a connection, not a storage element. For now, every port is a `wire`, and that will be true for most of the track.",
        },
        {
          kind: "code",
          caption: "The smallest useful module. Two inputs in, one output out.",
          code: `module top (
  input  wire a,
  input  wire b,
  output wire y
);
  // The inside of the box goes here.
endmodule`,
          note: "The trailing comma after each port is just style. It lets you add or remove a line without touching the line above it, which matters when a module has eight ports and you are editing them at midnight.",
        },
        {
          kind: "define",
          items: [
            { term: "module", meaning: "One piece of hardware with a name and a fixed list of pins." },
            { term: "port", meaning: "A pin on that box. The only way anything connects to the inside." },
            { term: "input", meaning: "A pin that pushes a value into the box. From the box's point of view, something outside drives it." },
            { term: "output", meaning: "A pin the box drives. From the box's point of view, the box is the one pushing a value out." },
            { term: "wire", meaning: "A plain connection, like a copper track. It carries a value, it does not remember one." },
          ],
        },
        {
          kind: "para",
          text: "Direction is from the module's own point of view, and this trips up almost everyone once. Inside `top`, an `output` is a wire the module drives. But from *outside* `top`, that same pin is a wire that must be driven by whoever connects to it. Two different views of one pin. If a pin is `inout` — readable and writable from both sides — it is how true bidirectional buses like an open-drain line are declared, and you will meet it late in the track.",
        },
        {
          kind: "steps",
          title: "Read the smallest module line by line",
          items: [
            {
              head: "`module top (`",
              body: "Opens a new box and names it `top`. `top` is a convention, not a keyword — the real convention is that `top` is the module the testbench instantiates at the very top of the design.",
            },
            {
              head: "`input wire a,`",
              body: "One pin, coming in, one bit wide. A pin with no range is 1 bit.",
            },
            {
              head: "`output wire y`",
              body: "One pin, going out, one bit wide. Note the port is only a *name* here — nothing says what `y` will hold. That comes next.",
            },
            {
              head: "`);` and the body",
              body: "The parenthesis closes the port list. Everything between `);` and `endmodule` is the inside of the box.",
            },
            {
              head: "`endmodule`",
              body: "Closes the box. Missing this is the single most common syntax error beginners hit, and the error message points at the *next* thing in the file rather than the one they forgot.",
            },
          ],
        },
        {
          kind: "trap",
          wrong: "Adding logic but forgetting `endmodule` at the end of the file.",
          right: "Always end the file with `endmodule`.",
          why: "Verilog has no other way to know the module ended, so the error is reported at some later token — often the next module's `module` keyword, with a message about an unexpected identifier. The line number in the error is not the line you forgot.",
        },
      ],
    },
    {
      slug: "assign",
      title: "Driving a wire: the assign statement",
      lede: "One kind of statement, and it is the only one you need for everything in this chapter.",
      blocks: [
        {
          kind: "para",
          text: "Inside the box you need to say what `y` will hold. You do that with `assign y = <an expression>;`. An *expression* is just a rule for combining values. `a & b` means \"a AND b\". `~a` means \"NOT a\". Put them together with `&&`, `||`, and you have arithmetic and logic. The `assign` keyword is not a command you run once — it is a standing rule, and that is the single most important idea in this section.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why `assign` is not `=`",
          text: "In most programming languages the equals sign means \"store this value now\". In Verilog `=` inside `assign` does not store anything. It declares a permanent relationship: *y is now defined to equal that expression, right now and forever*. If `a` changes at any moment, the expression is re-evaluated and `y` follows, with no code of yours involved. The tool keeps the wire and the expression in sync by itself.",
        },
        {
          kind: "analogy",
          text: "A `assign` is a light that follows a switch. You do not push the light up every time the switch moves. You wire the light to the switch once, and the light is simply always showing the switch's current position. Software is you flipping the light by hand. Hardware is the wiring.",
        },
        {
          kind: "code",
          caption: "The complete first module: a box, and one rule about what comes out of it.",
          code: `module top (
  input  wire a,
  input  wire b,
  output wire y
);
  assign y = a & b;
endmodule`,
          note: "Read it as a sentence: y is a AND b. The trailing semicolon ends the statement, exactly like any language you have used.",
        },
        {
          kind: "table",
          head: ["You write", "It means"],
          rows: [
            ["a & b", "a AND b, 1 bit in 1 bit out"],
            ["a | b", "a OR b"],
            ["~a", "NOT a"],
            ["a ^ b", "a XOR b — 1 when a and b differ"],
            ["a && b", "a AND b, but the whole expression can be 0, 1, x"],
            ["a || b", "a OR b, same idea"],
            ["a + b", "add, treating both as unsigned numbers"],
            ["~& a", "NOT of (a AND b) — the NAND, as one operator"],
          ],
          caption:
            "The single-character operators ( & | ^ ~ ) are bit-by-bit on vectors. The double-character ones ( && || ) work on the whole value and can produce x. You will meet the difference in chapter 3; for now, either works for 1-bit values.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "One driver per wire",
          text: "Every `assign` creates a driver. Two `assign`s on the same wire means two things fighting over its value, and the result is genuinely unpredictable — usually `x`. One output, one `assign`. If you need to choose between two possible sources, that is a multiplexer, and chapter 4 is entirely about doing that properly.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "For `assign y = a & b;` write down all four input combinations: a=0 b=0, a=0 b=1, a=1 b=0, a=1 b=1.",
            "Fill in what y must be for each row, following the rule \"y is 1 only when both are 1\".",
            "Now do the same for `assign y = a | b;` and for `assign y = ~(a & b);`.",
            "Compare the three tables. Rows 1 and 4 are where the interesting differences live.",
          ],
        },
        {
          kind: "trap",
          wrong: "`y = a & b;` — using a plain equals inside a module body, outside any block.",
          right: "`assign y = a & b;`",
          why: "A bare `=` is not a statement in Verilog outside a procedural block. The compiler reports it as a syntax error near `=`. If you find yourself reaching for `=` in module scope, you almost always want `assign`.",
        },
      ],
    },
    {
      slug: "truth-tables",
      title: "Truth tables: the specification of a circuit",
      lede: "The table you write before you write any code. It defines the circuit; the code is just a translation.",
      blocks: [
        {
          kind: "para",
          text: "A truth table lists every possible input combination and, for each one, the output the circuit must produce. With two inputs there are four rows. With three, eight. With n inputs, 2ⁿ rows. The table is a complete specification: a design is correct if, and only if, it agrees with the table on every row. There is no row left to \"improve\".",
        },
        {
          kind: "analogy",
          text: "A truth table is the exam and the answers combined. The left side is what you are given, the right side is what the circuit must return. Your job in code is not to be clever, it is to be faithful. If the code is hard to read but the table is satisfied, it is a correct design.",
        },
        {
          kind: "table",
          head: ["a", "b", "y = a & b", "y = a | b", "y = ~(a & b)", "y = a ^ b"],
          rows: [
            ["0", "0", "0", "0", "1", "0"],
            ["0", "1", "0", "1", "1", "1"],
            ["1", "0", "0", "1", "1", "1"],
            ["1", "1", "1", "1", "0", "0"],
          ],
          caption:
            "Four rows cover every possible input. This is the whole table — there is no fifth case hiding.",
        },
        {
          kind: "steps",
          title: "Turn a truth table into one line of Verilog",
          items: [
            {
              head: "List the rows where the output is 1",
              body: "For `y = a & b` that is just the last row: a=1, b=1. For `y = a ^ b` it is rows 2 and 3.",
            },
            {
              head: "Write the condition for those rows",
              body: "AND: `(a == 1'b1) && (b == 1'b1)`. You can shorten this to `a && b` because the condition only needs to be true when both are 1.",
            },
            {
              head: "Choose the result",
              body: "The output is 1 there and 0 everywhere else, so the whole thing is a *conditional*: `condition ? 1 : 0`. The `? :` construct is called a ternary conditional and reads as \"if this then that, otherwise the other\".",
            },
            {
              head: "Write the assign",
              body: "`assign y = (a == 1'b1) && (b == 1'b1) ? 1'b1 : 1'b0;` — long and mechanical, and it is exactly right.",
            },
            {
              head: "Now simplify",
              body: "`assign y = a & b;` is the same circuit, twice as short. The table is the specification; the short form is the good engineering. Keep the table in your notes either way, because that is what you check against when something misbehaves.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "When the output is 0 only in a few rows",
          text: "NAND and NOR are easier to recognise by their zero rows than their one rows. If the table has 1 in only one or two places, you can write the condition for the 0 rows and invert: `assign y = ~((a == 0) && (b == 0));`. When in doubt, write the long version, then simplify once you have tested it.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write a full truth table for `y = (a & b) | (a & ~b)`. Simplify it by hand first — it should collapse to just `a` — then confirm by filling the table row by row.",
            "Write the truth table for OR: one 1 row, three 0 rows. Write the table for NOR: three 1 rows, one 0 row. Notice they are opposites.",
            "Design a truth table for a function that is 1 only when a=0 and b=0. Write the Verilog two ways: as a condition, and as `~a & ~b`.",
            "Now make a mistake on purpose: write the table for `a & b` but with the columns in the wrong order (b before a). Confirm the table still works, because a truth table is about the values, not the column order. The mistake to avoid is mixing up rows, not columns.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing the table for `a & b` but reading a row as \"a=1, b=0 means the output is 1\".",
          right: "Walk the columns one at a time, top to bottom, for every row.",
          why: "Truth table errors are almost always row-reading errors, and they are silent — the compiler has no idea what you meant. Reading columns vertically instead of rows horizontally is the fix. Say the row out loud as you go: \"a is zero, b is one, so for AND the output is zero\".",
        },
        {
          kind: "check",
          items: [
            {
              q: "You need a circuit that outputs 1 when exactly one of a and b is 1. Which operator is that, and what is its truth table?",
              a: "XOR, written `a ^ b`. Table: 0,0 → 0; 0,1 → 1; 1,0 → 1; 1,1 → 0. It is 1 exactly when the two inputs differ — rows 2 and 3 — and 0 when they agree, which is both row 1 (0,0) and row 4 (1,1). Two rows are 1 and two are 0.",
            },
            {
              q: "Your table has 3 inputs. How many rows must it have, and what should you do if you cannot think of all 8?",
              a: "8 rows, always — every combination. If you cannot enumerate them, list them in binary counting order: 000, 001, 010, 011, 100, 101, 110, 111. Counting in binary is the reliable way to guarantee you did not miss one or repeat one.",
            },
          ],
        },
      ],
    },
    {
      slug: "four-state-values",
      title: "The four values: 0, 1, x and z",
      lede: "Why a Verilog wire can be unknown, and what that changes when you simulate.",
      blocks: [
        {
          kind: "para",
          text: "So far every wire has been 0 or 1. Real hardware has a third situation: a wire that is connected to nothing, or driven by two things that disagree. Verilog does not hide this. It gives you four values, and two of them are the honest admission that the answer is not known yet.",
        },
        {
          kind: "table",
          head: ["Value", "Name", "What it means"],
          rows: [
            ["0", "logic zero", "the wire is definitely low"],
            ["1", "logic one", "the wire is definitely high"],
            ["x", "unknown", "the value is not known, or the sources disagree, or nothing drives it at all"],
            ["z", "high impedance", "the wire is not being driven — it is floating, like an unconnected wire"],
          ],
          caption:
            "The mnemonic is 0, 1, X, Z, in that order. `x` comes before `z` and people remember it as \"X before Z\" because the states are ordered by how the simulator resolves them.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Where x actually comes from",
          text: "Three common sources. First, a wire nothing drives: at time zero every wire is x until something assigns it, so an undriven output is x. Second, two drivers disagree — one says 0, the other says 1, and the result is x. Third, arithmetic on an x: 1 + x is x, and so is 1 & x. Once a value is x it usually spreads, which is why fixing the root cause matters more than the symptom you can see.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "x is not the same as \"I don't care\"",
          text: "In a *testbench* or a *truth table analysis* you may see x written to mean \"this input is irrelevant here, I did not bother\". In *hardware* an x is a real, unresolved wire. In this track, do not use x to mean don't-care. Write the 0 or 1 that the circuit actually produces. You will see this distinction bite in chapter 7 when we simplify truth tables.",
        },
        {
          kind: "analogy",
          text: "Think of a spreadsheet cell. A 0 or 1 is a number you have typed in. An x is a formula that references an empty cell — Excel shows you an error, because the answer exists mathematically but not yet in the world. A z is a cell that was deliberately left blank to be filled in by a neighbour. Three distinct situations, and a careful person records which one they are in.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (3 minutes)",
          items: [
            "Write the rule: an AND with an x is x. So `1'b1 & 1'bx` = `1'bx`, and `1'b0 & 1'bx` = ? (Answer: 0, because ANDing with 0 forces 0 no matter what.)",
            "Apply the same thought to OR: `1'b1 | 1'bx` = 1, because ORing with 1 forces 1.",
            "Decide: is it better to fix the x at its source, or to write code that tolerates x? Write one sentence saying why fixing the source is almost always right.",
          ],
        },
      ],
    },
    {
      slug: "toolchain",
      title: "What the compiler is actually telling you",
      lede: "Errors stop the build. Warnings do not — but on this track most warnings are worth reading.",
      blocks: [
        {
          kind: "para",
          text: "The tool in this workspace is Verilator. Its main job is to read your design, check it for mistakes, and tell you what it finds. It does not simulate in the way a software compiler runs your program — it *lints*, meaning it inspects and reports. That is why the status chip appears as you type, with no simulation involved.",
        },
        {
          kind: "table",
          head: ["Message", "Severity", "What it actually means for you"],
          rows: [
            ["syntax error", "error", "The compiler cannot even read the line. Usually a missing semicolon, a missing endmodule, or a typo in a keyword."],
            ["WIDTHEXPAND / WIDTHTRUNC", "warning", "An expression mixes widths, or a value does not fit the wire it is assigned to. The narrow side is zero-padded (WIDTHEXPAND) or the extra bits are dropped (WIDTHTRUNC) — usually zeros you did not intend, or data you meant to keep."],
            ["UNDRIVEN", "warning", "A signal is read but nothing ever drives it. It will be x in simulation. Almost always a real bug."],
            ["UNUSEDSIGNAL", "info", "A signal is written but never read, or a port is connected to nothing. Stylistic — the design is fine, but the dead signal may be a leftover."],
            ["LATCH", "warning", "A combinational always block can leave its output unchanged on some path, so the output needs to remember. In this track that is almost always a bug."],
            ["MULTIDRIVEN", "warning", "Two things drive the same wire. The result is x when they disagree."],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "UNUSEDSIGNAL on the starter code is normal",
          text: "The starter code in this track deliberately leaves some signals dangling so you can see these messages appear. UNUSEDSIGNAL and UNDRIVEN are informational — they do not fail a check. Read them, decide if they are the leftover you think they are, and move on. The checks that fail your work are the ones about behaviour.",
        },
        {
          kind: "trap",
          wrong: "Ignoring every warning because the build still succeeded.",
          right: "Read each warning, and treat WIDTHEXPAND, WIDTHTRUNC, UNDRIVEN, LATCH and MULTIDRIVEN as real.",
          why: "Verilog compiles happily with all four of those, and the resulting hardware is silently wrong. A width mismatch between a 4-bit and an 8-bit signal is the classic one — the code runs, the answer is wrong, and nothing in the output says why.",
        },
      ],
    },
    {
      slug: "end-to-end",
      title: "Your first module, start to finish",
      lede: "Putting the pieces together: read, predict, write, check.",
      blocks: [
        {
          kind: "para",
          text: "Here is a complete module that uses everything in this chapter. Read it first as a whole, then work through it line by line. There is nothing in it that is not already explained above — no new syntax.",
        },
        {
          kind: "code",
          caption:
            "Outputs 1 when both inputs are 1, or when both are 0. That is an XNOR: the two are equal.",
          code: `module top (
  input  wire       [3:0] a,
  input  wire       [3:0] b,
  output wire       [3:0] y,
  output wire       eq
);
  // Rule 1: bit by bit AND, then NOT — a NAND, written as an expression.
  assign y = ~(a & b);

  // Rule 2: the ternary conditional picks between two values.
  assign eq = (a == b) ? 1'b1 : 1'b0;
endmodule`,
          note: "`(a == b)` is a single bit answer to the question \"are these two 4-bit numbers the same?\" — true becomes 1, false becomes 0. The ternary then turns that bit into an output. This two-line pattern is used constantly in the rest of the track.",
        },
        {
          kind: "steps",
          title: "Predict before you compile",
          items: [
            {
              head: "Pick a test vector",
              body: "Let a = `4'b1100` and b = `4'b1010`. Write both down in binary before computing anything.",
            },
            {
              head: "Predict y by hand",
              body: "a & b bit by bit: 1100 AND 1010 = 1000. Then NOT: ~1000 = 0111. So you expect y = `4'b0111`, decimal 7.",
            },
            {
              head: "Predict eq by hand",
              body: "Is 1100 equal to 1010? No. So eq = `1'b0`.",
            },
            {
              head: "Now check a case where a and b match",
              body: "Let a = b = `4'b0110`. Then a & b = 0110, ~0110 = 1001, so y = `4'b1001`. And eq = `1'b1`.",
            },
            {
              head: "Then compile and read the status",
              body: "If your prediction and the tool disagree, one of you is wrong. Find out which before moving on — this is the habit that makes the rest of the track easy.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "For the module above, write the full truth table for `eq` alone, with 1-bit a and b. Four rows. Confirm every row matches what `==` does.",
            "Now work out `y` for all four rows of that same 1-bit table, and confirm it matches your `~(a & b)` prediction each time.",
            "For the 4-bit version, work out y for four different (a, b) pairs of your own choosing, using the two-step method: AND bit by bit, then flip every bit.",
            "Write down the rule for flipping every bit of a 4-bit value: subtract from all ones, or XOR with 4'b1111. Check that both give the same answer as the NOT you used.",
            "Finally: predict which compiler warnings appear when you paste this in. (There should be a UNUSEDSIGNAL on one of the outputs if you do not connect it in your testbench.)",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "The habit worth building",
          text: "Predict, then check. Every exercise in this track is set up so you can work out the answer by hand before you compile. That is not busywork — it is the difference between copying code that works and understanding why it works. When the check passes and your prediction was right, you have learned something.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You write `wire [7:0] data;` and then `assign data = 8'hF;`. What is the value of `data`, in decimal?",
              a: "15. Hex F is one hex digit = four binary bits, so 8'hF is `8'b0000_1111`, which is 8 + 4 + 2 + 1 = 15. The width 8 just means the value is padded with four leading zeros.",
            },
            {
              q: "Explain in one sentence why `assign` is not a command.",
              a: "Because it declares a permanent relationship rather than performing a one-time action — the output is defined to equal the expression at all times, so the tool keeps them in sync automatically when any input changes.",
            },
            {
              q: "You read `UNUSEDSIGNAL` on a signal. Is your design broken?",
              a: "No. UNUSEDSIGNAL is an info-level note that a signal is written but never read — the design is complete and correct, but there may be a leftover wire. It does not fail any check. Contrast with UNDRIVEN, which means a signal is read but nothing drives it, and that one usually is a real bug.",
            },
          ],
        },
        {
          kind: "para",
          text: "The problem set for this chapter is called Truth-Table Synthesizer, and it runs the truth-table skill in the direction you will use for the rest of the track: you are handed the rows of a table and asked for the circuit that realises them. The module has two 4-bit inputs, `a` and `b`, and one 4-bit output `y`. The table has a single hot row — y must be 1 when a is `4'b0011` and b is `4'b0001`, and 0 for every other combination of the 256.",
        },
        {
          kind: "code",
          caption:
            "The whole problem set is one hot row of a truth table, written as one rule.",
          code: `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] y
);
  // 1 when a is 0011 AND b is 0001, 0 on every other row.
  assign y = (a == 4'b0011) && (b == 4'b0001) ? 4'b0001 : 4'b0000;
endmodule`,
          note: "Read it with the pieces from this chapter: `==` asks a 1-bit question of a 4-bit value, `&&` joins two such questions, and the ternary picks which 4-bit literal `y` holds. Every construct in that line is one you have already met — the problem set is checking that you can read the table, not that you can invent new syntax.",
        },
        {
          kind: "check",
          items: [
            {
              q: "In the P-Set, why is y declared 4 bits wide when the answer is only ever 0001 or 0000?",
              a: "Because the interface is the contract: the hidden testbench drives a and b as 4-bit values and reads all four bits of y. The two branch literals are written `4'b0001` and `4'b0000` so the width of the answer matches the width of the port exactly. The function only needs the bottom bit, but the width is part of the specification, not part of the logic.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "bit", meaning: "A single wire that is either 0 or 1 — one binary digit." },
    { term: "vector", meaning: "A named group of bits treated as one value, like `wire [7:0] data`." },
    { term: "width", meaning: "How many bits are in a signal. 8 bits can hold 0 to 255." },
    { term: "module", meaning: "One piece of hardware with a name and a list of pins — the unit of design." },
    { term: "port", meaning: "A pin on a module. `input` receives, `output` sends, `inout` does both." },
    { term: "net (wire)", meaning: "A plain connection that carries a value but does not store one." },
    { term: "assign", meaning: "A statement that permanently defines a signal to equal an expression, re-evaluated whenever the inputs change." },
    { term: "expression", meaning: "A combination of values and operators that produces one result, like `a & b`." },
    { term: "truth table", meaning: "A table listing every input combination and the required output — a complete specification of a circuit." },
    { term: "literal", meaning: "A number written directly in code, in a format that says its width and base, like `4'b1010`." },
    { term: "ternary conditional", meaning: "The `? :` form, which reads \"if this is true then that value, otherwise the other one\"." },
    { term: "x (unknown)", meaning: "A value that is genuinely not known — undriven, or two drivers disagreeing." },
    { term: "z (high impedance)", meaning: "A wire that is deliberately not driven, so it floats." },
    { term: "lint", meaning: "Inspecting a design for mistakes and reporting them, without simulating it." },
    { term: "synthesis", meaning: "Turning your written rules into a real gate-level circuit." },
  ],
  nextStep:
    "You now have the whole vocabulary: bits, widths, literals, modules, `assign`, and truth tables. The first lesson, Bits, Vectors & Truth Tables, puts them to work in the workspace — you will write a module, predict its output, and confirm it against a truth table. Then the problem set, Truth-Table Synthesizer, hands you the single hot row from the last topic — y is 1 only when a is `4'b0011` and b is `4'b0001` — and asks for the circuit that realises it. Read this page after the lesson, then come back whenever a message in the status chip is not one you recognise.",
};
