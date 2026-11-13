import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 3,
  chapterSlug: "combinational-expressions",
  title: "Combinational Expressions",
  readMinutes: 24,
  youWillBeAbleTo: [
    "Translate a Boolean equation into a Verilog expression, keeping the grouping you intended",
    "Predict the value of an expression by hand, before you compile anything",
    "Explain what operator precedence is, and use parentheses to override it deliberately",
    "Tell a bitwise operator from a logical one, and say how many bits each one returns",
    "Take a single bit, a fixed span, or a moving span out of a vector",
    "Rebuild a wider vector from pieces using concatenation and replication",
    "Read a WIDTHEXPAND or WIDTHTRUNC warning and find the two operands that disagree",
  ],
  mentalModel: [
    {
      title: "An operator is a small box of gates, not a step in a program",
      body: "Chapter 1 gave you `assign y = a & b;` and said it is a standing rule. Now the rule gets bigger. `assign y = (a & b) | (c & d);` does not run left to right, once, when you write it. It describes a circuit that already exists: one box that ANDs a with b, another that ANDs c with d, and a third that ORs their two outputs together. Change any input and the change ripples through the boxes on its own. An *expression* is just a name for that network of boxes. There is no top-level `if` and no top-level loop in Verilog, for the same reason there is no such thing as a circuit whose wiring depends on a value that has not arrived yet.",
    },
    {
      title: "Verilog asks two questions, in this order: how wide, then what it means",
      body: "Every expression gets evaluated in two passes. First *width*: Verilog looks at every operand, works out how many bits the whole thing will be, and pads the narrower operands with zeros on the left. Only then does it apply *meaning*: which operator binds to which operand, and what the gates do. The order matters because a width decision changes what the expression even is. `4'b0011 & 4'b111x` is 4 bits wide, so the answer is `4'b001x` — a four-bit answer with an unknown bit in it. `4'b0011 && 4'b111x` is 1 bit wide, so the answer is `1'b1` — a clean yes. Same symbols, same inputs, different question answered first. Most of the bugs in this chapter come from one of these two rules, and almost none of them announce themselves.",
    },
  ],
  topics: [
    {
      slug: "operators-are-gates",
      title: "Every operator is a piece of hardware",
      lede: "What an expression really is, before you learn a single operator name.",
      blocks: [
        {
          kind: "analogy",
          text: "A Verilog expression is a board with components soldered onto it, not a list of steps on a recipe card. `a & b | c` is two little components wired to each other: a two-input AND box, and a two-input OR box, with the AND box’s output plugged into the OR box. The components are fixed. There is no software in there deciding anything, and there is no time passing. You can trace a signal from the left of the board to the right and it arrives at the same answer every time, as long as the inputs are the same.",
        },
        {
          kind: "define",
          items: [
            { term: "operator", meaning: "A symbol that combines values into a new value — `&`, `|`, `+`, `~` and so on. Each one is a real piece of hardware." },
            { term: "operand", meaning: "A value the operator works on. `a` and `b` are the operands of `a & b`." },
            { term: "expression", meaning: "Operands and operators combined into one value, like `(a & b) | (c & d)`." },
            { term: "combinational", meaning: "Output depends only on the inputs right now, with no memory of anything earlier. This whole chapter is combinational." },
          ],
        },
        {
          kind: "code",
          caption:
            "A complete, runnable module. Four 4-bit inputs, two outputs, two rules. Read it as a whole before you read any part of it.",
          code: `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  input  wire [3:0] c,
  input  wire [3:0] d,
  output wire [3:0] y,
  output wire [3:0] z
);
  // y is 1 where a and b differ.
  assign y = (a & ~b) | (b & ~a);
  // z is 1 where both of a and b are 1, or both of c and d are 1.
  assign z = (a & b) | (c & d);
endmodule`,
          note: "Both lines have four inputs and one output, both 4 bits wide. That is not a coincidence — a bitwise operator is a gate with one pin per bit, so a gate on 4-bit values has 4 pins and produces 4 bits.",
        },
        {
          kind: "steps",
          title: "Take the first line apart, one box at a time",
          items: [
            {
              head: "`(a & ~b)`",
              body: "First, `~b` flips every bit of b. b is 4 bits, so the result is 4 bits: 1010 becomes 0101, 0000 becomes 1111. Then `a & (~b)` is a 4-input AND gate with a[3], a[2], a[1], a[0] on one side and the flipped b bits on the other.",
            },
            {
              head: "`(b & ~a)`",
              body: "The mirror image. A second AND gate, with b on one side and the flipped a on the other.",
            },
            {
              head: "the `|` between them",
              body: "A third gate, a 4-input OR, taking the output of the first AND and the output of the second. Its 4 bits are the answer.",
            },
            {
              head: "the parentheses",
              body: "They are not decoration. They tell the tool which wire plugs into which gate. `(a & b) | c` and `a & (b | c)` build two different circuits out of the same three symbols, and we come back to that in a moment.",
            },
            {
              head: "`assign y = …;`",
              body: "The whole network gets a name on its output pin. The name does not change anything about the circuit — it just lets you refer to it. And because it is an `assign`, the network is permanent: any time an input moves, the answer moves with it.",
            },
          ],
        },
        {
          kind: "table",
          head: ["You write", "How many inputs the gate has", "How many bits come out"],
          rows: [
            ["a & b", "one per bit of the wider operand", "the width of the wider operand"],
            ["a | b", "one per bit of the wider operand", "the width of the wider operand"],
            ["a ^ b", "one per bit of the wider operand", "the width of the wider operand"],
            ["~a", "one per bit of a", "the width of a"],
            ["a + b", "one per bit of the wider operand", "the width of the wider operand"],
            ["a == b", "every bit of both, compared together", "1 bit"],
            ["&a", "every bit of a, folded together", "1 bit"],
            ["{a, b}", "all bits of a, then all bits of b", "the width of a plus the width of b"],
          ],
          caption:
            "Read the last column as the number of wires leaving the box. It is the single most useful thing to know about an operator, because it tells you how big the answer is before you work out what the answer is.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why this chapter has no loops at the top level",
          text: "Because the circuit has to be the same size no matter what the data is. If you could write `for (i = 0; i < n; i = i + 1)` in a module body, the tool would have to build a circuit with a number of parts that depends on a value it does not have yet. So it builds a circuit that handles every possible n, which is enormous and almost always slower. Later chapters show you the two honest ways around this: unroll the loop yourself with a `generate` block, or put the loop in an `always` block that is clearly describing a *sequence* rather than a network.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You write `assign y = a | b;` and both `a` and `b` are 4 bits. How many AND/OR gates does the tool build, and how many bits is `y`?",
              a: "Four 2-input OR gates, one per bit position, and `y` is 4 bits. The bitwise OR is not one gate that handles the whole number — it is four independent gates that happen to be written with one symbol. That is also why the inputs must be the same width or one must be padded first, and why a WIDTHEXPAND warning is usually the tool telling you about exactly that padding.",
            },
            {
              q: "In `assign y = a & b;`, if `a` changes, who recalculates `y`?",
              a: "Nobody in your code. There is no code running. The wires are physically connected, so the change propagates through the gate on its own. That is the whole reason for `assign` — it declares a connection, not a command, and there is no clock, no loop, and no place for a bug in the timing.",
            },
          ],
        },
      ],
    },
    {
      slug: "bitwise-vs-logical",
      title: "One character or two: bitwise and logical",
      lede: "The single most important distinction in this chapter, and the easiest to miss.",
      blocks: [
        {
          kind: "para",
          text: "Verilog has two whole families of AND and OR, and they look almost identical. The bitwise family is `&`, `|`, `^` and `~` — one character. The logical family is `&&`, `||` and `!` — two. On a single bit, with no unknowns in play, they give the same answer, which is precisely why a beginner can write the wrong one for weeks without ever finding out. They come apart as soon as the value is more than one bit wide, or as soon as an x shows up.",
        },
        {
          kind: "table",
          head: ["Bitwise — one character", "Logical — two characters", "What it means"],
          rows: [
            ["a & b", "a && b", "AND. Bitwise: AND every bit pair, answer is as wide as the operands. Logical: ask “is a true?”, ask “is b true?”, answer 1 or 0."],
            ["a | b", "a || b", "OR. Same split: per-bit versus one whole-value yes/no."],
            ["a ^ b", "—", "XOR. There is no logical XOR operator. `a != b` is how you ask that question."],
            ["~a", "!a", "NOT. Bitwise: flip every bit, width unchanged. Logical: answer 1 if a is 0, 0 if a is non-zero. Always 1 bit."],
            ["&a, |a, ^a", "—", "Reductions. There is no logical version — `&a` already answers exactly one bit."],
          ],
          caption:
            "The rule of thumb: one character works on every bit, so the answer has the same shape as the input. Two characters work on the whole value, and the answer is always exactly one bit.",
        },
        {
          kind: "analogy",
          text: "The logical operators ask about the whole thing. `a && b` is asking a yes/no question about two numbers: are both of them non-zero? The bitwise operators ask about each part. `a & b` is looking at two registers of lights and working out, bulb by bulb, which ones are on in both. If you asked “is the hallway lit?” about a string of eight bulbs, you would not list the bulbs — you would just say yes. That is `&&`. If you needed to know which bulbs, you would list them. That is `&`.",
        },
        {
          kind: "code",
          caption:
            "The same number, four ways. Only the widths and the values differ — read the bit patterns, not the shape.",
          code: `wire [3:0] a = 4'b0011;   // 3
wire [3:0] b = 4'b0000;   // 0

// Logical: two 1-bit questions, joined into a 1-bit answer.
wire       l_and = a && b;   // 1'b0
wire       l_or  = a || b;   // 1'b1
wire       l_not = !a;       // 1'b0 — a is 3, which is not zero

// Bitwise: four independent gates, four answers.
wire [3:0] b_and = a &  b;   // 4'b0000
wire [3:0] b_or  = a |  b;   // 4'b0011
wire [3:0] b_not = ~a;       // 4'b1100`,
          note: "`!a` and `~a` on the same `a` give completely different answers, and not just different widths. `!` asks a question and answers 0 or 1. `~` flips every one of the four wires. Neither is a typo of the other.",
        },
        {
          kind: "para",
          text: "The x case is the one that bites hardest in simulation. If a bit is unknown, the bitwise answer is allowed to be unknown — that is honest, because some bit really is unresolved. The logical operator can still answer, because it does not care which bit is unresolved, only whether the number as a whole is definitely zero or definitely not. This is a genuine advantage, and it is the reason `&&` exists alongside `&` rather than being a pointless synonym.",
        },
        {
          kind: "code",
          caption:
            "One bit is x. The bitwise operator is stuck; the logical operator is not. Both are correct.",
          code: `wire [3:0] a = 4'b0011;   // 3
wire [3:0] b = 4'b111x;   // one bit is unknown

wire       l_and = a && b;   // 1'b1  — a is non-zero, b is non-zero
wire [3:0] b_and = a &  b;   // 4'b001x — bit 0 is 1 & x, and that is x`,
          note: "Same two operands, same symbol family, different question. The logical one is only ever 0 or 1. The bitwise one hands back four bits and one of them is a genuine unknown that will spread into anything downstream.",
        },
        {
          kind: "trap",
          wrong: "`assign both_high = a & b;` on two 4-bit signals, when you meant “are both of these non-zero?”",
          right: "If you want a clean yes/no bit, write `a && b`, or compare against a constant. If you want per-bit AND, keep the `&` — and declare `both_high` as 4 bits.",
          why: "`a & b` on 4-bit values is four AND gates wired in parallel, and its answer is 4 bits wide. It is not wrong — it is just not the question you asked. The two failures that follow are a width mismatch when you declared the output as 1 bit (Verilator says WIDTHTRUNC), and a downstream circuit fed four bits where it expected a decision.",
        },
        {
          kind: "trap",
          wrong: "Reaching for `!` when you mean NOT, or `~` when you mean “is this zero?”",
          right: "`~a` flips every bit and keeps the width. `!a` collapses a to one bit of truth. Decide which question you are asking before you type the symbol.",
          why: "On 1-bit values the two are identical, so the habit of picking the wrong one forms early and survives. `~4'b0000` is `4'b1111` — a number, 15, not “false”. `!4'b1111` is `1'b0`, which is the answer to the question you probably meant to ask.",
        },
        {
          kind: "check",
          items: [
            {
              q: "`wire [3:0] a = 4'b1010;` What is `!a`, and what is `~a`?",
              a: "`!a` is `1'b0`: the question is “is a zero?”, and 10 is not zero, so no. `~a` is `4'b0101`: every one of the four bits flips, and 0101 is decimal 5. Note the shapes — 1 bit and 4 bits. If you had declared `a` as a single bit, both would give `1'b0` and you would see no difference at all.",
            },
            {
              q: "You want “are all four bits of `a` set?”, written as one bit. Which operator, and what is it called?",
              a: "`&a`, the reduction AND. It folds all four bits together with AND and returns a single bit: 1 only if every bit is 1. The one-character `&` is doing double duty here — as a binary operator it is a per-bit AND between two values, and as a unary operator it is this fold. Both return a value; the width differs.",
            },
          ],
        },
      ],
    },
    {
      slug: "precedence-and-grouping",
      title: "Precedence: who groups with whom",
      lede: "The rule that decides what your parentheses did, and the one that silently decides when you do not write them.",
      blocks: [
        {
          kind: "para",
          text: "An expression with two operators has two possible groupings, and they do not have to be the same. `a & b | c & d` can mean “(a AND b) OR (c AND d)” or it can mean “a AND (b OR c) AND d”. Precedence is the rule that picks one of those without asking you. The symbols bind to their neighbours in a fixed order, tightest first, and the tighter operator grabs its operand before the looser one gets a look in.",
        },
        {
          kind: "table",
          head: ["Level", "Operators", "What it does"],
          rows: [
            ["1 (tightest)", "!  ~  +  -", "NOT, and unary plus/minus — applied to the nearest operand first"],
            ["2", "**", "raise to a power"],
            ["3", "*  /  %", "multiply, divide, remainder"],
            ["4", "+  -", "add, subtract (binary)"],
            ["5", "<<  >>  <<<  >>>", "shift left, shift right"],
            ["6", "<  <=  >  >=", "less than, less-or-equal, greater than, greater-or-equal"],
            ["7", "==  !=  ===  !==", "equal, not equal (and the four-state-safe versions)"],
            ["8", "&", "bitwise AND"],
            ["9", "^  ^~  ~^", "bitwise XOR and XNOR"],
            ["10", "|", "bitwise OR"],
            ["11", "&&", "logical AND"],
            ["12", "||", "logical OR"],
            ["13 (loosest)", "?  :", "ternary conditional — “if this then that, else the other”"],
          ],
          caption:
            "The only two things to memorise for this chapter: `&` is tighter than `^`, `^` is tighter than `|`, and *all* of those are tighter than `&&`, which is tighter than `||`. That is levels 8 to 12, and it is where almost every surprise lives.",
        },
        {
          kind: "code",
          caption:
            "One line, three operators, and the grouping is decided before you typed it. The comment above each line is what the tool actually builds.",
          code: `assign y = a & b | c & d;        // groups as: (a & b) | (c & d)
assign y = a & b | c & d ^ e;   // groups as: (a & b) | ((c & d) ^ e)
assign y = a & b | c & d & e;   // groups as: (a & b) | (c & d & e)`,
          note: "Notice the middle line. You added a `^` at the end and the answer changed shape, because `^` binds tighter than `|`, so the `^` reached inside the right-hand OR instead of sitting at the top. Adding one operator moved two groups.",
        },
        {
          kind: "para",
          text: "The rule for reading an expression by eye is mechanical: find the loosest operator in the whole line, and split there. Then look at each half and do the same. Keep splitting until every piece has a single operator. That is the grouping, every time, with no guessing. The practical version is the reverse: when you *write* an expression, put the parentheses in first and then delete the ones the precedence already gives you.",
        },
        {
          kind: "doThis",
          title: "Two expressions, identical symbols, different answers (5 minutes)",
          items: [
            "Write down a = 4'b1010, b = 4'b1100, c = 4'b0011, d = 4'b0101. Do not compute anything yet.",
            "Evaluate the first expression: `a & b | c & d`. Read it as “loosest operator first, split there”: a & b becomes one term, c & d becomes another, and the | joins them. Work out a & b = 1000, c & d = 0001, then 1000 | 0001.",
            "Write down your answer for the first expression. It should be 4'b1001.",
            "Now evaluate the second: `a & (b | c) & d`. Here the parentheses force the OR to happen first, so b | c = 1111, then a & 1111 = 1010, then 1010 & 0101.",
            "Write down your answer for the second. It should be 4'b0000.",
            "Compare. Every symbol, every operand and every width is identical between the two lines. The only difference is which operators were allowed to group together — and that is the whole difference between 1001 and 0000.",
            "Now find a value of a, b, c, d where the two expressions happen to agree. (a = b = c = d = 4'b0000 works. Now try to find one that is not all zeros.)",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Parentheses that survive review",
          text: "The default in this track is to write them. `assign z = (a & b) | (c & d);` and `assign z = a & b | c & d;` compile to the identical circuit, and the first one survives being read aloud, being copied into a spreadsheet, and being read by you in six months. Keep the parentheses around every AND-group when it is an operand of an OR, and remove the ones that would only restate the default order. That is the whole policy.",
        },
        {
          kind: "steps",
          title: "Translating a Boolean equation: y = ab + cd",
          items: [
            {
              head: "Read the equation the way it was written",
              body: "`y = ab + cd` uses algebra notation, where writing two letters next to each other means multiply, and `+` means add. The engineer who wrote it meant a Boolean expression, not arithmetic: multiply means AND, add means OR.",
            },
            {
              head: "Say the substitution out loud",
              body: "Juxtaposition becomes AND, so `ab` is `a & b`. The plus becomes OR, so the whole thing is `(a & b) OR (c & d)`. The `= y` becomes `assign y = …` because the output is a wire being driven.",
            },
            {
              head: "Write the safe version, with parentheses",
              body: "`assign y = (a & b) | (c & d);` — this is the spelling you would defend in a code review. Nothing is being trusted to the reader, and nothing depends on you remembering the precedence table at eleven at night.",
            },
            {
              head: "Check whether precedence makes them redundant",
              body: "Read the table. `&` is level 8, `|` is level 10, so `&` already binds tighter. `a & b | c & d` groups as `(a & b) | (c & d)` with no help from you. The parentheses are redundant — not wrong, just unnecessary.",
            },
            {
              head: "Decide which one to keep",
              body: "Both compile to the same gates. Keeping the parentheses costs nothing in hardware and saves the next reader a lookup. Dropping them is also fine as long as you did the lookup yourself first, which is what step four was for. In the lesson for this chapter you will write both spellings and confirm they agree on every test row.",
            },
            {
              head: "Predict before you compile",
              body: "With a = 4'b1010, b = 4'b1100, c = 4'b0011, d = 4'b0101, the answer is 1000 | 0001 = 4'b1001. Write that down. If the tool disagrees, one of you is wrong, and finding out which is the actual lesson.",
            },
          ],
        },
        {
          kind: "code",
          caption:
            "A Boolean equation and the line of Verilog it becomes. Note that a real hardware designer writing the equation by hand would use a bar over the letters to mean NOT — that is the overline, not a multiplication sign.",
          code: `// Equation as drawn on paper:   y = ab + cd
assign y = (a & b) | (c & d);   // safe spelling

// Equation with an inverted input:  y = a·b̄ + c̄·d
assign y = (a & ~b) | (~c & d);  // b̄ is written ~b, c̄ is written ~c`,
          note: "The second line is the trap in one line of code: `~b & d` and `~(b & d)` are different circuits, because the first negates one input and the second negates the whole result. Always parenthesise what you are negating.",
        },
        {
          kind: "trap",
          wrong: "`assign y = a * b + c * d;` — reading a Boolean equation literally as arithmetic.",
          right: "`assign y = (a & b) | (c & d);`",
          why: "This one compiles, runs, and is quietly a completely different function. With a = 1010 (10), b = 1100 (12), c = 0011 (3), d = 0101 (5): the arithmetic version computes 10 × 12 + 3 × 5 = 135, which does not fit in 4 bits and truncates to 4'b0111. The Boolean version gives 1000 | 0001 = 4'b1001. Two different answers, no warning, and the only clue is that one of them is a surprising number.",
        },
        {
          kind: "trap",
          wrong: "`assign y = a & b | c & d ^ e & f;` written from the paper equation without checking the grouping.",
          right: "Parenthesise each product term: `assign y = (a & b) | ((c & d) ^ (e & f));`",
          why: "Because `^` is tighter than `|`, this silently groups as `(a & b) | ((c & d) ^ (e & f))` — which happens to be what you wanted here. Now change the XOR to an AND and re-read it: `(a & b) | (c & d & e & f)`, which is not the same function. Precedence is only obvious when it happens to match your intent. When it does, the expression is still hard to read.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Group this properly: `a | b & c | d`.",
              a: "`(a | b) | (c | d)`, which simplifies to `a | b | c | d`. `&` is level 8 and `|` is level 10, so both ANDs happen before the ORs. Find the loosest operator in the line — there are two `|` symbols and they are equally loose — and split at the first one, then the second. Both halves are now a single OR of two pieces.",
            },
            {
              q: "Group this properly: `a & b | c & d ^ e`.",
              a: "`(a & b) | ((c & d) ^ e)`. Start with the loosest operator: the `|`. That gives `(a & b)` and `c & d ^ e`. In the right-hand piece, the loosest operator is `^`, so it splits into `(c & d)` and `e`. Note that the `^` pulled itself *inside* the OR — that is what level 9 being tighter than level 10 means.",
            },
            {
              q: "Does `a & b | c & d` need parentheses to mean “(a AND b) OR (c AND d)” ?",
              a: "No, because `&` already binds tighter than `|`. This is the case the lesson exercises: you write `y_paren` with the parentheses and `y_plain` without, and the hidden testbench confirms both give the same 4-bit answer on every row. If you are unsure, write them. The parentheses cost no gates.",
            },
          ],
        },
      ],
    },
    {
      slug: "reduction-operators",
      title: "Folding a vector down to one bit",
      lede: "The reduction operators, and why the & you already know has a second job.",
      blocks: [
        {
          kind: "para",
          text: "Sometimes the question is about the whole number: is anything set? is everything set? is an odd number of bits set? Those are answered with a *reduction* operator. A reduction takes one operand, applies its usual gate to every bit in turn, and folds the results together into a single bit. The width of the operand does not matter — 4 bits in, 1 bit out, and the same for 64.",
        },
        {
          kind: "table",
          head: ["You write", "It reads as", "Result is 1 when"],
          rows: [
            ["&a", "AND every bit of a together", "every bit of a is 1"],
            ["~|a  or  ~| a", "NOT (OR every bit of a together)", "no bit of a is 1 — a is all zeros"],
            ["|a", "OR every bit of a together", "at least one bit of a is 1"],
            ["~&a  or  ~& a", "NOT (AND every bit of a together)", "at least one bit of a is 0"],
            ["^a", "XOR every bit of a together", "an odd number of the bits are 1"],
            ["~^a  or  ^~a", "XNOR every bit of a together", "an even number of the bits are 1"],
          ],
          caption:
            "Note the spacing in the first two rows. `~&a` — tilde first, ampersand stuck to the variable — is NAND. `& ~a` — ampersand first, space, then the negation — is AND applied to the already-negated a. The order of the two symbols is the difference between the gate and its input.",
        },
        {
          kind: "analogy",
          text: "A row of eight lamps above a doorway, and someone asking “is the room lit?”. `|a` is the question “is any lamp on?”. `&a` is “are all eight on?”. Neither question needs you to report which lamps — just yes or no, which is why a reduction always hands back a single bit, no matter how many lamps you started with.",
        },
        {
          kind: "code",
          caption:
            "Three reductions on the same 4-bit value, and the same & symbol doing two completely different jobs on the two lines.",
          code: `module top (
  input  wire [3:0] a,
  output wire       all_high,
  output wire       any_high,
  output wire       odd_count
);
  assign all_high = &a;   // 1 only if a is 1111
  assign any_high = |a;   // 1 if any bit is set
  assign odd_count = ^a;  // 1 if an odd number of bits are set
endmodule`,
          note: "On the line `assign all_high = a & b;` the `&` is binary: two operands, one result bit per operand bit. On `assign all_high = &a;` the same character is unary: one operand, one result bit. The number of operands is what tells you which job it is doing.",
        },
        {
          kind: "doThis",
          title: "Work out the reductions on paper (5 minutes)",
          items: [
            "Write a = 4'b1010 and, next to it, the three answers you expect from &a, |a and ^a. Check your work by folding step by step: for &a, go 1&0 = 0, then 0&1 = 0, then 0&0 = 0. For ^a, count the ones instead: there are two, which is even, so the answer is 0.",
            "Try a = 4'b1011. Now &a is still 0, |a is still 1, but ^a flips to 1, because there are three ones now and three is odd.",
            "Try a = 4'b0000. All three are 0, and |~a is 1. Write down why |~a is the exact opposite of &a.",
            "Now try a = 4'b1111. &a is 1 and ~&a is 0. Write down the two questions that separate them.",
            "Predict the width of each of the three outputs. Then check: all three are declared as plain `wire` with no range, which is 1 bit.",
            "Find a value of a where &a and ^a give the same answer, and one where they differ. For the same answer you need an even number of ones *and* at least one zero — 4'b0110 works if you want a starting point.",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign red_and = a[0] & a[1];` on a 4-bit `a`, when you meant “are all four bits set?”",
          right: "`assign red_and = &a;`",
          why: "This is a genuine silent bug and it is the one the lesson starter for this chapter is built around. `a[0] & a[1]` really does AND the bottom two bits, so it is a valid 1-bit expression and nothing warns you. But it reports on bits 0 and 1 and ignores bits 2 and 3 entirely: a = 4'b1100 has both low bits clear, so your “all set” flag reads 0 — the right answer by luck. Change to a = 4'b1010 and the same line still reads 0 while `&a` also reads 0. Try a = 4'b0101 and now they finally disagree, and you have a bug that only shows up on some rows. Folding the whole vector is one symbol and cannot be incomplete.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "`~&a` and `~(&a)` are the same gate",
          text: "Both spellings parse as NOT of the reduction AND, so both compute the NAND and neither one is a bug. `~&a` is the compact form; `~(&a)` spells the grouping out. The only real question is readability: in a busier expression like `x & ~&a` the bare tilde-ampersand is easy to misread, while `x & ~(&a)` needs no precedence rule memorised to be read correctly. Pick the spelling the next reader will get right.",
        },
        {
          kind: "check",
          items: [
            {
              q: "`a` is 4'b0110. What are `&a`, `|a` and `^a`?",
              a: "`&a` = 0, because bits 3 and 0 are clear. `|a` = 1, because bits 2 and 1 are set. `^a` = 0, because there are exactly two 1s and two is even — XOR folding is a parity check, not an “is anything set” check. All three are 1 bit wide, even though `a` is 4 bits wide.",
            },
            {
              q: "You want a flag that is 1 when `a` is *not* 4'b1111. Which reduction, and what is the operator called?",
              a: "`~&a` — the reduction AND followed by NOT, which is NAND. A NAND reduction is 1 whenever at least one bit is clear, which is exactly “not all set”. The equivalent spelling is `|~a`: flip every bit first, then OR them, and the result is 1 as soon as any original bit was 0. Both return 1 bit.",
            },
          ],
        },
      ],
    },
    {
      slug: "one-bit-and-slices",
      title: "Taking bits out: selects and slices",
      lede: "How you reach into a vector for one bit or a fixed span, and where each one ends up.",
      blocks: [
        {
          kind: "para",
          text: "So far every operator has taken whole values. Now you reach inside one. A *bit select* gives you a single wire, written `a[3]`. A *part select* gives you a fixed span, written `a[7:4]`. Both produce a new value that you can use anywhere you would use a number, and neither one copies anything — the tool just wires the existing bits through to whatever you assign them to.",
        },
        {
          kind: "analogy",
          text: "A 12-pack of eggs, numbered along the front, is a 12-bit vector. `[11:0]` says how the pack is labelled. Tapping one egg is a bit select. Lifting a strip of four eggs out of the front of the pack is a part select — and the four eggs stay in their original order, so the leftmost egg you lift is still the highest-numbered one. Getting the eggs out of a different pack and gluing them onto a new pack in a chosen order is concatenation, which is the next topic.",
        },
        {
          kind: "code",
          caption:
            "One byte, four ways of looking at it. Copy the widths on the left and the values on the right onto paper — this picture is the one to keep.",
          code: `wire [7:0] a = 8'h5A;   // binary 0101_1010

wire [3:0] low  = a[3:0];   // bits 3 2 1 0  =  1 0 1 0  = 4'b1010  = 8'hA
wire [3:0] high = a[7:4];   // bits 7 6 5 4  =  0 1 0 1  = 4'b0101  = 8'h5
wire       bit3 = a[3];     //             =  1
wire       bit0 = a[0];     //             =  0`,
          note: "The part select `a[7:4]` names four bits and the result is 4 bits wide. The bit select `a[3]` names one bit and the result is 1 bit wide. The width of the select is the width of the answer — nothing is zero-padded.",
        },
        {
          kind: "doThis",
          title: "Sketch the vector, then take pieces off it (5 minutes)",
          items: [
            "Write a horizontal line of eight boxes. Label them a[7] down to a[0] from left to right, and write 0 1 0 1 1 0 1 0 inside them, because 8'h5A is 0101_1010.",
            "Bracket the four leftmost boxes and write `a[7:4]` above the bracket. Read the four digits left to right, top to bottom: 0101. Write `4'b0101` next to it. That is decimal 5.",
            "Bracket the four rightmost boxes, write `a[3:0]` above, and read them left to right: 1010. Write `4'b1010`. That is decimal 10, or hex A.",
            "Now the bit selects. Write `a[3]` and find that single box — it holds 1. Write `a[0]` — it holds 0. Confirm a bit select is 1 bit and a part select is 4 bits.",
            "Now take a range that straddles the middle, `a[5:2]`. Bracket boxes 5, 4, 3, 2 and read them: 0 1 1 0, so 4'b0110. Note the range names four wires even though it does not start at a multiple of four — Verilog does not care, it just takes the wires in the range you gave.",
            "Finally, check the width rule by subtraction: which single bit, removed from 8 bits, leaves exactly the 7 that `a[3:0]` should have? If your arithmetic is right you should say it is a[0]’s job, not a[7]’s — a[3:0] contains 3, 2, 1 and 0.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Where the slice lands",
          text: "A part select is a *view*, not a crop with a new position. `a[7:4]` does not become the low nibble of anything — it is 4 bits of value, and when you assign it to a 4-bit wire, that wire holds the value 5, and nothing else. Where it ends up in a wider result is decided by the *next* topic, not by this one. The rule to hold on to: a select always keeps the left-to-right order of the original vector.",
        },
        {
          kind: "trap",
          wrong: "`assign low_nibble = a[7:4];` and `assign high_nibble = a[3:0];` — the two names the wrong way round.",
          right: "low is the low-order half, so it is `a[3:0]`. high is `a[7:4]`.",
          why: "The names are about position, and position is exactly what the index says. `a[7:4]` is the four bits numbered 7 down to 4, which are the high-order half of the byte, because the highest index is the most significant bit. This is exactly the mistake the vector-slices lesson starter is seeded with, and it produces a design that is wrong on every single row without a single warning.",
        },
        {
          kind: "trap",
          wrong: "`assign low = a[7-4];` — using a minus sign to mean “from 7 down to 4”.",
          right: "`assign low = a[7:4];` — a colon, not a minus.",
          why: "`a[7-4]` is a perfectly valid expression, and it evaluates to 3, so the tool is reading it as the bit select `a[3]` — one bit, not four. You get a 1-bit answer where you declared a 4-bit wire, which Verilator reports as a WIDTHEXPAND warning, and zero-padding on the other three bits. The colon is the only character in Verilog that means “this range of wires”.",
        },
        {
          kind: "trap",
          wrong: "`a[8]` or `a[-1]` on a `wire [7:0] a`, and `b[3]` on a 4-bit `b`.",
          right: "Stay inside the declared range. `[7:0]` means the legal bit indices are 7, 6, 5, 4, 3, 2, 1, 0 and nothing else.",
          why: "This is an error, not a warning, because there is genuinely no wire there to connect to. The tool stops and tells you the index and the range it was given. The habit worth building is to read the range out loud when you declare a signal — “a is bits 7 down to 0” — because every out-of-range access then becomes obviously wrong at a glance.",
        },
        {
          kind: "check",
          items: [
            {
              q: "a is 8'hB4. What are `a[3:0]`, `a[7:4]` and `a[6]`?",
              a: "8'hB4 is 1011_0100. `a[3:0]` takes the right four bits, 0100, so 4'b0100 = 4. `a[7:4]` takes the left four, 1011, so 4'b1011 = 8'hB = 11. `a[6]` is a single bit: bits 7 6 5 4 are 1 0 1 1, so a[6] is 0. The widths are 4, 4 and 1.",
            },
            {
              q: "Why does `a[4:7]` on 8'h5A not give you the same value as `a[7:4]`?",
              a: "Verilog does accept a part select written low-to-high, but the number you write first becomes the left end of the result. On 8'h5A = 0101_1010, `a[7:4]` reads bits 7, 6, 5, 4 and gives 0101. `a[4:7]` starts at bit 4 and walks upward, so bit 4 lands on the left: 1 0 1 0, which is 4'b1010. Same four wires, reversed order. This track always writes `[high:low]`, so you never have to remember it.",
            },
          ],
        },
      ],
    },
    {
      slug: "indexed-slices",
      title: "A slice whose start moves",
      lede: "Why `a[3:0]` is easy and `a[idx+3:idx]` is not, and what `+:` gives you instead.",
      blocks: [
        {
          kind: "para",
          text: "A part select needs two fixed numbers. Hardware can do that. What hardware cannot do is build a circuit whose *size* depends on a value that arrives at runtime — there is no such thing as a shifter that is 4 bits wide on one clock edge and 9 bits wide on the next. So `a[idx+3:idx]` is not legal Verilog-2001: the range’s width is a value, and the tool cannot make a fixed circuit out of it. The fix is to fix the width and let only the *start* move, and that is exactly what the indexed part select does.",
        },
        {
          kind: "table",
          head: ["You write", "It selects", "The window is"],
          rows: [
            ["a[3:0]", "a[3], a[2], a[1], a[0]", "4 bits, always, starting at bit 3"],
            ["a[idx +: 4]", "a[idx], a[idx+1], a[idx+2], a[idx+3]", "4 bits, always, starting wherever idx points"],
            ["a[idx -: 4]", "a[idx], a[idx-1], a[idx-2], a[idx-3]", "4 bits, always, walking downward from idx"],
            ["a[idx]", "just one bit, chosen at runtime", "1 bit"],
          ],
          caption:
            "The `+:` and `-:` forms need no space, and the `+` or `-` comes *before* the colon. `a[idx +: 4]` means “starting at idx, going up, 4 bits”. `a[idx -: 4]` means “starting at idx, going down, 4 bits”.",
        },
        {
          kind: "code",
          caption:
            "A 4-bit window that slides over a byte. The width never changes, so the circuit is a fixed set of gates every time.",
          code: `module top (
  input  wire [7:0] a,
  input  wire [2:0] idx,
  output wire [3:0] window
);
  assign window = a[idx +: 4];
endmodule`,
          note: "The window is 4 bits wide no matter what idx holds. On an 8-bit a the legal starting points are idx = 0 to 4; if idx is 5 or more, the window would need bits 5 through 8 and bit 8 does not exist, so the tool complains at compile time rather than inventing a wire.",
        },
        {
          kind: "analogy",
          text: "A window of fixed size sliding along a wall. The window is 4 tiles wide, always — that is the glass, and glass is hardware. What moves is where you push it. A “window as wide as the number I just told you” would need different glass for every width, and you do not get to decide the glass after someone shouts a number across the room.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "What the tool actually builds for `a[idx +: 4]`",
          text: "A multiplexer. Every bit of the answer is a small chooser that picks one of the 8 bits of a, and idx — 3 bits, so 8 choices — is what the choosers look at. Four muxes, each 8-to-1. That is a fixed circuit built from a constant, which is exactly what a synthesis tool is willing to do. The forbidden version, `a[idx+3:idx]`, has a width that is not a constant, so there is no such fixed circuit to build.",
        },
        {
          kind: "trap",
          wrong: "`assign w = a[idx +: 4];` on an 8-bit `a` with an `idx` that can reach 7, and assuming the top bits of the answer are fine.",
          right: "Size idx so the window always fits — for a 4-bit window on an 8-bit vector, idx is 3 bits and its legal range is 0 to 4.",
          why: "The tool will not let the window run off the end silently, but it will let you *declare* a range that can get there, and then you have written a design that is undefined for the values of idx it does not like. Count before you declare: window width 4, vector width 8, so 8 − 4 = 4 is the number of legal starting positions, and idx must be able to name exactly those.",
        },
        {
          kind: "trap",
          wrong: "Writing `a[idx+:4]` inside a module and expecting it to work like an array index into memory.",
          right: "Read `+:` as “a fixed span of wires, starting here”. Arrays and memories are a different mechanism, covered later in the track.",
          why: "The two look alike and mean nothing alike. `a[idx +: 4]` is four wires of a vector selected by a small chooser circuit. Reading a memory is a whole data structure with an address bus and a write port. Confusing them leads to designs that are structurally fine and functionally nothing like what you meant.",
        },
        {
          kind: "check",
          items: [
            {
              q: "On `wire [7:0] a = 8'h5A`, what is `a[2 +: 4]` ?",
              a: "8'h5A is 0101_1010. Starting at bit 2 and walking up four bits takes a[2], a[3], a[4], a[5] = 0, 1, 1, 0, so the result is 4'b0110. Read the bits in the order the `+:` gives you, not in the order the vector numbers them — that is the whole reason `+:` and `-:` exist as separate spellings.",
            },
            {
              q: "Why can the width of an indexed part select be a literal like 4 but never a signal like `n`?",
              a: "Because the width of a circuit has to be decided when the circuit is built, before any data value is known. A width of 4 is a constant, so the tool builds four wires and a mux per wire. A width taken from a signal would mean building a different circuit depending on data, and hardware has no way to do that. This is called elaboration time — the period when the design is turned into gates, long before simulation runs.",
            },
          ],
        },
      ],
    },
    {
      slug: "concatenate-and-replicate",
      title: "Building vectors: concatenation and replication",
      lede: "Two braces, and between them you can join pieces up or stamp a pattern out.",
      blocks: [
        {
          kind: "para",
          text: "Concatenation is how you build a wide value out of narrower ones. Write two or more things between curly braces, `{ ... }`, and they are joined into one vector. The widths add up, and the leftmost item lands in the most significant bits — the same left-to-right rule you have used for every vector since chapter 1. Replication is the same braces with one thing repeated a fixed number of times. Both are pure rewiring: no arithmetic, no gates that change a value, just bits being routed.",
        },
        {
          kind: "analogy",
          text: "Writing a number on paper. `{a, b}` is writing a’s digits and then b’s digits next to each other with no space, so if a is 2 and b is 3 you have written 23, not 5. The left-hand item is always the more significant half. Replication is the trick of drawing a shape and stamping it: `{4{1'b1}}` is the same `1` written four times, which is `4'b1111`.",
        },
        {
          kind: "code",
          caption:
            "The byte-swap you would otherwise need four assigns for, done in one. Read the widths left to right: 4 then 4 is 8.",
          code: `module top (
  input  wire [7:0] a,
  output wire [7:0] swapped,
  output wire [3:0] low_nibble,
  output wire [7:0] doubled
);
  assign swapped     = {a[3:0], a[7:4]};  // low half moves to the high half
  assign low_nibble  = a[3:0];
  assign doubled     = {2{a[3:0]}};       // the low nibble, written twice
endmodule`,
          note: "On a = 8'h12, `doubled` is 8'h22: the low nibble 2 is 0010, and writing it twice gives 0010_0010. The count 2 goes outside the first brace — `{2{a[3:0]}}`, not `{a[3:0], a[3:0]}` for the same result, though the second happens to work too.",
        },
        {
          kind: "table",
          head: ["You write", "The pieces, left to right", "Result width", "a = 8'h12, so a[3:0] = 4'b0010"],
          rows: [
            ["{a[3:0], a[7:4]}", "low nibble, then high nibble", "8 bits", "8'h21 — the swap"],
            ["{a[7:4], a[3:0]}", "high nibble, then low nibble", "8 bits", "8'h12 — a, unchanged"],
            ["{a}", "just a", "8 bits", "8'h12 — a copy"],
            ["{2{a[3:0]}}", "the low nibble, twice", "8 bits", "8'h22"],
            ["{4{1'b1}}", "a single 1, four times", "4 bits", "4'b1111"],
            ["{8{1'b0}}", "a single 0, eight times", "8 bits", "8'b0000_0000"],
            ["{a, 1'b1}", "all of a, then one more bit", "9 bits", "9'b0_0001_0011"],
          ],
          caption:
            "Row 2 is the important one. `{a[7:4], a[3:0]}` puts everything back where it started, so it is an expensive no-op that looks like work. Always check which end your data is on.",
        },
        {
          kind: "para",
          text: "Concatenation and replication nest, and you can count the width either way. `{2{a[3:0]}}` is 2 copies of 4 bits, so 8. `{a[3:0], 2{a[5:4]}}` is 4 bits then 2 × 2 bits, so 8. Predict the width *before* you compile — that is the fastest way to catch a mistyped count, and it takes five seconds.",
        },
        {
          kind: "code",
          caption:
            "Reversing a vector. Four lines beat one unreadable expression, and the generate loop is the version that scales.",
          code: `module reverse4 (
  input  wire [3:0] a,
  output wire [3:0] rev
);
  assign rev = {a[0], a[1], a[2], a[3]};
endmodule

// The same idea for any width. genvar is the loop counter, and it
// is fixed before the design is built, so this is legal hardware.
module reverse8 (
  input  wire [7:0] a,
  output wire [7:0] rev
);
  genvar i;
  generate
    for (i = 0; i < 8; i = i + 1) begin : g_rev
      assign rev[i] = a[7 - i];
    end
  endgenerate
endmodule`,
          note: "The loop bound is a constant — 8 — and it has to be. The tool unrolls the loop into eight separate assignments before it builds anything, because eight wires is a thing a circuit can be. A loop that ran `i < n` where `n` is a signal would need a different number of wires per value, which is the same impossibility you hit with a variable-width part select.",
        },
        {
          kind: "doThis",
          title: "Predict the widths, then check them (8 minutes)",
          items: [
            "Set a = 8'h12 = 0001_0010 and write a[3:0] and a[7:4] on paper. a[3:0] = 0010 and a[7:4] = 0001.",
            "Work out `{a[3:0], a[7:4]}` by pasting the two 4-bit groups side by side, low first: 0010 then 0001, which is 8'b0010_0001 = 8'h21. Write down the width too: 4 + 4 = 8.",
            "Work out `{a[7:4], a[3:0]}` the same way: 0001 then 0010 = 8'b0001_0010 = 8'h12. Notice it is a again. That is the mistake the lesson starter is built around.",
            "Work out `{2{a[3:0]}}` by stamping the group twice: 0010 0010 = 8'h22. The width is 2 × 4 = 8, not 4.",
            "Work out `{4{1'b1}}` and `{8{1'b0}}`. The first is 4'b1111, the second is 8'b0000_0000. Confirm the count outside the braces is the number of copies, and that the thing being copied is the whole inner expression.",
            "Now find the x that makes `{2{a[3:0]}}` come out as 8'h33. (a = 8'h3F, since a[3:0] = F = 1111.)",
            "Finally, work out what a concat does when the target is narrower than the concat. If you assign an 8-bit concat to a 4-bit wire, the extra high bits have nowhere to go and are discarded, and Verilator warns you with WIDTHTRUNC. Try it deliberately once so you have seen the message before it surprises you.",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign swapped = {a[7:4], a[3:0]};` — writing the high half first because that is how you say it out loud.",
          right: "`assign swapped = {a[3:0], a[7:4]};`",
          why: "The leftmost item becomes the most significant bits, so writing high-then-low puts the data back exactly where it started. The design looks busy, compiles cleanly, and is a no-op on every one of the 256 possible input bytes. The test for any concat is worth memorising: write down what the *left* four bits of the result must be, and check the left item in your expression matches.",
        },
        {
          kind: "trap",
          wrong: "`assign y = {4 1'b1};` — one brace pair, with a space instead of a second brace.",
          right: "`assign y = {4{1'b1}};` — the count sits outside a brace pair that wraps the item being repeated.",
          why: "The two are easy to confuse at a glance because the difference is a single pair of curly braces. The single-brace version is not replication at all and does not compile — the error points at the number, which is confusing if you were expecting it to work. Read replication as “N copies of the thing in the next braces”, and if you see a bare count inside a single brace, you are looking at a mistake.",
        },
        {
          kind: "trap",
          wrong: "`assign y = {a + b};` — expecting braces to group a sum the way parentheses do.",
          right: "`assign y = (a + b);` for a sum, and `{a, b}` when you mean to join two values into one wide vector.",
          why: "Inside a concat every item must be a fixed-width value — a wire, a literal, a select, or another concat. A sum has a width that depends on its operands, so it is not allowed there. Braces are for wiring bits together, parentheses are for grouping arithmetic. Using the wrong one is a compile error, which is at least a loud one.",
        },
        {
          kind: "check",
          items: [
            {
              q: "On `a = 8'hAB`, what is `{a[3:0], a[7:4]}` in hex?",
              a: "8'hAB is 1010_1011. a[3:0] = 1011, a[7:4] = 1010. The concat is 1011 then 1010, which is 8'hBA. Note that this is the same as the byte swap: AB becomes BA, because the low nibble B moved up and the high nibble A moved down. The width is 4 + 4 = 8 bits, and nothing was added or lost.",
            },
            {
              q: "What is the width of `{2{a[3:0]}}` when a is 8 bits, and how do you get that number without compiling?",
              a: "8 bits. The outer count of 2 multiplies the width of the inner expression, and `a[3:0]` is 4 bits, so 2 × 4 = 8. The general rule: add the widths of every item in a concat, and multiply by the count for replication. Predicting it by counting is the check that catches a typo in the count before you ever see a WIDTHTRUNC warning.",
            },
          ],
        },
      ],
    },
    {
      slug: "widths-decide-first",
      title: "Verilog asks how wide before it asks what",
      lede: "The rule behind almost every silent bug, and the one your compiler is telling you about with WIDTHEXPAND and WIDTHTRUNC.",
      blocks: [
        {
          kind: "para",
          text: "Every expression in Verilog has a width, and it is worked out before a single gate is imagined. Verilog looks at every operand, finds the widest, and pads all the others on the left with zeros so that everything matches. Then, and only then, does it apply the operators. This is why `4'b0011` quietly becomes `32'd3` when it is compared with a 32-bit value, and why a bitwise `&` against a 32-bit zero quietly produces 32 bits instead of 1.",
        },
        {
          kind: "table",
          head: ["Expression", "Width of the result", "Because"],
          rows: [
            ["a & b, both 4 bits", "4 bits", "one AND gate per bit of the wider operand"],
            ["a & 4'b0011, a is 4 bits", "4 bits", "both operands are 4 bits, so the mask is 4 bits"],
            ["a[0] & a[1]", "1 bit", "each select is one bit, so the AND is one bit"],
            ["!a, a is 4 bits", "1 bit", "the logical operators always answer in one bit"],
            ["~a, a is 4 bits", "4 bits", "NOT flips every bit and changes no widths"],
            ["&a, a is 4 bits", "1 bit", "a reduction always folds down to one bit"],
            ["a == b, a and b 4 bits", "1 bit", "a comparison answers true or false"],
            ["a && b", "1 bit", "logical AND, always 1 bit"],
            ["a + b, both 4 bits", "4 bits", "and the carry out of the top bit is discarded"],
            ["{a[3:0], a[7:4]}", "8 bits", "concatenation adds the widths"],
            ["{2{a[3:0]}}", "8 bits", "replication multiplies the width"],
          ],
          caption:
            "The one line to memorise: a bitwise or arithmetic operator takes the width of its widest operand and gives back that many bits. Everything else on this list is a special case of that rule or an exception to it.",
        },
        {
          kind: "code",
          caption:
            "Two ways to halve a sum. One throws the carry away, the other keeps it. Same inputs, and the difference is a single bit of headroom.",
          code: `module shift_sum (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] narrow,
  output wire [4:0] wide
);
  // a and b are 4 bits, so a + b is a 4-bit result. 15 + 1 = 16
  // does not fit, so the carry out of bit 3 is discarded.
  assign narrow = (a + b) >> 1;

  // Make room first, then add. Now the sum is 5 bits and the
  // carry survives, so the answer is the real half.
  assign wide   = ({1'b0, a} + {1'b0, b}) >> 1;
endmodule`,
          note: "With a = 4'b1111 and b = 4'b0001: narrow is 0 and wide is 8. Halving 16 gives 8, so only the second one is right. Writing `{1'b0, a}` is a concatenation — a leading zero bit followed by all of a, giving 5 bits.",
        },
        {
          kind: "doThis",
          title: "Chase one value through the widths (5 minutes)",
          items: [
            "Find a 4-bit value of `x` where `(x[0] & x[1])` and `(x & 4'b0011)` are not the same expression. Take x = 4'b0011: the left side is 1'b1, the right side is 4'b0011.",
            "Work out why the `!=` between them is true. A comparison widens the narrower operand, so the 1-bit 1 becomes 4'b0001, and 4'b0001 is not 4'b0011. Same symbol `&`, same value, two different answers, purely because of width.",
            "Check your answer by counting: the two sides agree only when x's bottom two bits are 00. Write down that condition and test it against x = 4'b0000 (they agree) and x = 4'b0001 (they do not).",
            "Now take the shift. a = 4'b1111, b = 4'b0001. Write a + b in binary as a 4-bit answer and see what happened to the 16.",
            "Redo the sum with 5 bits: 1_1111 + 0_0001 = 1_0000. Shift that right by one and read the result. Compare with the 4-bit version and write one sentence about where the information went.",
            "Finally, write down the rule you would tell someone: “an expression is as wide as its widest operand, and anything wider is thrown away without a word.”",
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          title: "What WIDTHEXPAND and WIDTHTRUNC are telling you",
          text: "WIDTHEXPAND fires when the tool has to pad a narrow value to fit a wider one; WIDTHTRUNC fires when a wide value is trimmed to fit — a literal that does not fit its declared width, or a concat assigned to too few wires. Neither is a style note. On this track they are the difference between a design that computes what you meant and a design that quietly computes zero-padding. When you see one, the fix is almost never to silence it — it is to find the two operands that disagree and either widen the narrow one with a concatenation like `{1'b0, a}`, or narrow the target deliberately and say so in a comment.",
        },
        {
          kind: "trap",
          wrong: "Ignoring a WIDTHEXPAND or WIDTHTRUNC warning because the simulation still produced sensible-looking values.",
          right: "Treat WIDTHEXPAND and WIDTHTRUNC as real. Find the width that disagrees and fix it in the code.",
          why: "The zero padding is often harmless and often is not, and there is no way to tell from the output which case you are in. A 4-bit result assigned to an 8-bit wire quietly becomes 0000_xxxx, and if that 8-bit value later gets compared with something that cares about the high bits, the bug appears far away from its cause. Padding from a 4-bit value to a 4-bit one is harmless; the warning is asking you to confirm that you meant it.",
        },
        {
          kind: "trap",
          wrong: "`wire [3:0] all_high;` with `assign all_high = &a;` — declaring the reduction result with the width of the input.",
          right: "`wire all_high;` — a reduction is 1 bit, so declare it as 1 bit.",
          why: "You get a 1-bit answer assigned to a 4-bit wire, so Verilator warns WIDTHEXPAND, and the three top bits are zero-padding that you did not ask for and may later mistake for data. The width of the declaration should always be the width of the answer, which is a habit worth forming now: bit select is 1, part select is the range size, reduction is 1, comparison is 1, concat is the sum.",
        },
        {
          kind: "check",
          items: [
            {
              q: "`a` and `b` are both 4 bits. What is the width of `a & b`, and what is the width of `a && b` ?",
              a: "`a & b` is 4 bits — four AND gates in parallel, one result per input bit. `a && b` is 1 bit — two questions about whether each number is non-zero, joined into a single yes or no. The operands and the symbols are nearly identical; the width is what separates them, and that is why declaring a 1-bit output for `&` produces a WIDTHTRUNC warning.",
            },
            {
              q: "You want “is the 4-bit value `a` equal to 0, but you also want the answer to come out as 4'b0001 for a downstream bus?”",
              a: "The comparison itself is 1 bit, and there is no way to make `a == 0` return 4 bits. Write `assign flag4 = {3'b000, (a == 0)};` — a concatenation of three literal zero bits and the 1-bit answer, which is 4 bits wide. That is the general repair for any 1-bit result you need to put on a wider bus: pad it yourself, deliberately, where the reader can see it.",
            },
          ],
        },
      ],
    },
    {
      slug: "expression-evaluator",
      title: "Putting it together: the expression evaluator",
      lede: "The whole chapter in two lines of Verilog, with every parenthesis accounted for.",
      blocks: [
        {
          kind: "para",
          text: "The problem set for this chapter is called Expression Evaluator. It is two outputs from four 4-bit inputs, and the entire difficulty is grouping. Once you can read an expression left to right, splitting at the loosest operator, the task is short. Work it out on paper first — the hidden testbench sweeps every one of the 256 combinations of two of the inputs, so a single mis-grouped parenthesis fails on some rows and not others, which is the hardest kind of bug to see by eye.",
        },
        {
          kind: "code",
          caption:
            "The whole problem set, with the safe spelling. Read the two lines as two different questions about the same four inputs.",
          code: `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  input  wire [3:0] c,
  input  wire [3:0] d,
  output wire [3:0] y,
  output wire [3:0] z
);
  // y is 1 where a and b share a bit, or where exactly one of
  // c, d, a, d is set. Three terms, two levels of grouping.
  assign y = (a & b) | ((c & d) ^ (a | d));

  // z is 1 where a and b share a bit, or where c and d share a bit.
  // Here precedence already does the grouping, so the parens
  // around the two AND terms are optional.
  assign z = (a & b) | (c & d);
endmodule`,
          note: "Every operator here is bitwise and every operand is 4 bits, so y and z are both 4 bits and there is no width to argue about. That is deliberate: the only thing that can be wrong in this chapter's problem set is the grouping.",
        },
        {
          kind: "steps",
          title: "Hand-evaluate the first test row, a = 1010, b = 1100, c = 0011, d = 0101",
          items: [
            {
              head: "Write the inputs down as columns",
              body: "a = 1010, b = 1100, c = 0011, d = 0101. Line them up so you can read any two of them against each other. Do not compute anything yet — a bit of setup is what makes the next six steps fast.",
            },
            {
              head: "y, step 1: the innermost brackets first",
              body: "`(c & d) ^ (a | d)`. The XOR needs its two operands, so do those: c & d = 0011 AND 0101 = 0001. a | d = 1010 OR 0101 = 1111. Write both down.",
            },
            {
              head: "y, step 2: the XOR of those",
              body: "0001 XOR 1111 = 1110. Every bit differs except the last, so the last stays 1. The whole bracketed group is 4'b1110, still 4 bits wide — a bitwise XOR of two 4-bit values returns 4 bits.",
            },
            {
              head: "y, step 3: the outer OR",
              body: "(a & b) is 1010 AND 1100 = 1000. Then 1000 OR 1110 = 1110. So y = 4'b1110, decimal 14. Write that down before you go any further.",
            },
            {
              head: "z, the same way",
              body: "a & b = 1000. c & d = 0001. 1000 OR 0001 = 1001. So z = 4'b1001, decimal 9.",
            },
            {
              head: "Now find the one that is not obvious",
              body: "If you delete the parentheses in y and write `a & b | c & d ^ a | d`, precedence gives you `a & b` first (tightest), then `c & d`, then the XOR, then the two ORs. The XOR reaches *inside* the right-hand OR, so it groups as `a & b | (c & d ^ a) | d`, and on this row that gives 1000 | 1011 | 0101 = 1111. Correct y is 1110. One deleted bracket, and the answer is wrong by one bit. The parentheses in y are not decoration.",
            },
            {
              head: "Now prove the z parentheses are optional",
              body: "Delete them: `a & b | c & d`. `&` is level 8 and `|` is level 10, so this is `(a & b) | (c & d)` — the same function. Both spellings give 4'b1001 on this row and on all 256. That is the lesson for Operators & Precedence in one sentence: keep the parentheses where they carry meaning, and you can drop them only where you have checked the table yourself.",
            },
          ],
        },
        {
          kind: "table",
          head: ["a", "b", "c", "d", "y", "z"],
          rows: [
            ["1010", "1100", "0011", "0101", "1110", "1001"],
            ["0000", "1111", "1111", "0000", "0000", "0000"],
            ["1111", "0000", "0000", "1111", "1111", "0000"],
            ["0101", "1010", "1010", "0101", "0101", "0000"],
            ["1001", "0110", "0001", "1000", "1001", "0000"],
          ],
          caption:
            "Worked examples on a and b with c and d held to simple patterns, done by hand — the hidden testbench sweeps two inputs at a time, so these are a sample, not its first rows. Row 3 is the useful one: y and z differ, because a | d is all ones there and so the XOR produces all ones, while z sees only the two AND terms and both are zero.",
        },
        {
          kind: "doThis",
          title: "Build the rest of the table yourself (10 minutes)",
          items: [
            "Set a = 0000, b = 1111, c = 1111, d = 0000. Work out a & b, c & d, a | d, the XOR, and both outputs. You should get y = 0000 and z = 0000 — nothing here overlaps.",
            "Set a = 1111, b = 0000, c = 0000, d = 1111. Work out both outputs. y should be 1111 and z should be 0000. Ask yourself why y is all ones: a | d is 1111, and 0000 XOR 1111 is 1111, so the OR term is all ones on its own.",
            "Set a = 0101, b = 1010, c = 1010, d = 0101. Here c and d are swapped copies of a and b, so a & b = 0000 and c & d = 0000, which means z is 0000 no matter what. Work out a | d = 0101, then (c & d) ^ (a | d) = 0000 XOR 0101 = 0101, then y = 0000 OR 0101 = 0101.",
            "Set a = 1001, b = 0110, c = 0001, d = 1000. Work out both. y should be 1001 and z should be 0000 — a & b is 0000 and c & d is 0000, and a | d = 1001, which passes through the XOR with 0000 unchanged.",
            "Now delete every parenthesis from y and recompute all five rows. Write down which rows changed. You should find that only some rows differ, and that is precisely the bug pattern a sweep test catches and a spot check does not.",
            "Finish by writing the module with the parens on z removed and the parens on y kept. Then read it aloud as a sentence. If you can say what each group does, you are done.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The habit this chapter is really teaching",
          text: "Predict, then check. Write the answer on paper, in bits, before you compile. Every silent bug in this chapter — the missing bracket, the partial reduction, the mask that should have been a 1-bit AND, the carry that fell off the end — produces a design that compiles cleanly and is wrong on some rows. Paper is the only tool that finds them before the testbench does.",
        },
        {
          kind: "check",
          items: [
            {
              q: "For `y = (a & b) | ((c & d) ^ (a | d))` with a = 1111, b = 0000, c = 0000, d = 1111, what is y and why is it not 0000?",
              a: "y = 4'b1111. a & b = 1111 AND 0000 = 0000, so the left OR term is 0000. But the right term is not zero: a | d = 1111, and c & d = 0000 AND 1111 = 0000, so 0000 XOR 1111 = 1111. The final OR of 0000 with 1111 is 1111. The reason it is not zero is that XOR with an all-ones value turns zeros into ones — which is exactly the behaviour you would get from a NOT, and the reason `x ^ w'b1111` is a common idiom for inverting a value.",
            },
            {
              q: "Your z output is right on rows where a and b share a bit, and wrong everywhere else. You wrote `assign z = a && b | c && d;`. What went wrong?",
              a: "The operators are the logical family, so `a && b` and `c && d` are 1-bit answers, and the `|` between them is a bitwise OR on those two 1-bit values — which happens to be fine width-wise. The real problem is precedence: `&&` is level 11 and `|` is level 10, so the `|` groups *first*, giving `a && (b | c) && d`. The OR never sees two 1-bit operands; it sees b and c as 4-bit vectors. The fix is either to use the bitwise family throughout — `(a & b) | (c & d)` — or to parenthesise every logical term. Mixing the two families in one expression is the fastest route to a precedence bug.",
            },
            {
              q: "Name the four width decisions you made when you wrote this chapter's two lines, and say what each one produced.",
              a: "One: `a & b` and `c & d` are bitwise ANDs of two 4-bit values, so each is 4 bits. Two: `a | d` is a bitwise OR of two 4-bit values, so 4 bits. Three: the `^` of two 4-bit values is 4 bits, and the `|` of two 4-bit values is 4 bits, so `y` is 4 bits and matches its declaration. Four: no `!`, no `&&`, no `==` and no reduction appears anywhere, so nothing silently collapsed to 1 bit. When the output width and the expression width agree with no warning, it is because every one of those four decisions was made deliberately.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "bit select", meaning: "One wire out of a vector, written `a[3]`. The result is 1 bit wide." },
    { term: "bitwise operator", meaning: "A one-character operator like `&`, `|`, `^`, `~` that works on every bit separately and returns as many bits as its widest operand." },
    { term: "concatenation", meaning: "Joining values into one wider vector with braces — `{a, b}`. Widths add, and the leftmost item takes the most significant bits." },
    { term: "elaboration", meaning: "The stage where the tool turns your written design into gates, before simulation runs. Anything that must be a constant for the circuit to be buildable has to be constant by this point." },
    { term: "expression", meaning: "Operands and operators combined into one value, like `(a & b) | (c & d)`." },
    { term: "index", meaning: "The number in the brackets that says which bit or which starting wire you mean." },
    { term: "indexed part select", meaning: "A part select with a fixed width but a start that moves: `a[idx +: 4]` walks up, `a[idx -: 4]` walks down." },
    { term: "logical operator", meaning: "A two-character operator like `&&`, `||`, `!` that works on the whole value and always returns exactly 1 bit." },
    { term: "operand", meaning: "A value an operator works on. `a` and `b` are the operands of `a & b`." },
    { term: "operator", meaning: "A symbol that combines values into a new value. Each one describes a fixed piece of hardware." },
    { term: "operator precedence", meaning: "The fixed order in which operators bind to their operands, tightest first. It decides the grouping when you do not write parentheses." },
    { term: "part select", meaning: "A fixed run of wires out of a vector, written `a[7:4]`. The result is as many bits as the range." },
    { term: "reduction operator", meaning: "A unary operator — `&a`, `|a`, `^a` and their negations — that folds every bit of a vector into a single bit." },
    { term: "replication", meaning: "Repeating a value a fixed number of times, written `{4{1'b1}}`. The count multiplies the width." },
    { term: "width", meaning: "How many bits a signal or an expression is. An expression is as wide as its widest operand, and the extra is zero-padded or discarded." },
  ],
  nextStep:
    "You now have the whole operator vocabulary: which operators exist, which bind tightest, how to reach inside a vector, and how to build a wider one out of pieces. The first lesson, Operators & Precedence, puts it to work in the workspace — you will translate a Boolean equation, write the same function with and without parentheses, and build three reductions over a 4-bit vector, then confirm all of it against a hidden testbench that sweeps the inputs. Read it after this page, and come back to the precedence table every time an expression grows past three operators.",
};
