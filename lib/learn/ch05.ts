import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 5,
  chapterSlug: "adders",
  title: "Adder Circuits",
  readMinutes: 25,
  youWillBeAbleTo: [
    "Add two numbers by hand in binary, writing the carry out of every column",
    "State the half adder's truth table and explain why its sum is XOR and its carry is AND",
    "Build a full adder out of two half adders and an OR, and say what each internal wire is for",
    "Decide how many bits a result needs, and explain why four-bit inputs need a five-bit answer",
    "Chain full adders into a ripple-carry adder and trace the carry through every stage",
    "Tell carry-out apart from overflow, and say why confusing them loses information",
    "Write a testbench that drives your adder row by row and prints the answers with $display",
  ],
  mentalModel: [
    {
      title: "Four chapters of parts, and now the machine they were for",
      body: "You have spent four chapters on switches, wires, gates, and the multiplexer. On their own those are just parts on a tray. An adder is the first circuit that puts them to work and does something you actually care about: it adds. Half a page from here you will be able to add 15 and 15 and know, before you compile anything, exactly which wire carries the answer out. That is the point of this chapter. The logic is not hard. The reason it feels satisfying is that every piece was introduced earlier for a reason you can now name — XOR gives you the sum, AND gives you the carry, a module gives you the column you can copy, and a `generate` loop gives you as many columns as you ask for. Nothing new is invented here. That is what payoff means.",
    },
    {
      title: "Every adder is the same one-column question, asked again and again",
      body: "Nobody has ever designed a clever 16-bit adder. A wide adder is a row of small identical questions, one per column, and the question is always: these three bits in — two from the numbers, one carried in from the column on the right — what single bit do I write in this column, and does it leave a carry for the column on the left? Two bits in and two bits out is a *half adder*. Three bits in and two bits out is a *full adder*. A whole adder is nothing more than a full adder at the bottom with nothing carried in, and a full adder above it, and a full adder above that, all the way to the top. Once you can answer the one-column question, you can build any width you will ever need.",
    },
    {
      title: "The carry is a wire, and wires have a cost",
      body: "The carry out of a column is not an internal detail that disappears. It is an ordinary wire, and it has to be driven before the column to its left can do anything useful. That is why an adder built this way is called a *ripple-carry* adder: the answer does not appear all at once, it arrives as a wave moving leftward one column per gate delay. The logic is as simple as a circuit gets and the timing is still the interesting part. Hold on to that tension for this chapter — the simplest correct design is also the slowest one, and knowing why is what separates someone who has read about adders from someone who has built one.",
    },
  ],
  topics: [
    {
      slug: "adding-one-column-at-a-time",
      title: "Adding one column at a time",
      lede: "Binary addition is the addition you already do, run right to left, with a carry you have to write down.",
      blocks: [
        {
          kind: "para",
          text: "You already know how to add. 7 plus 3 is 10. The only thing that changes in binary is that the columns are single bits, and a single bit can only show 0 or 1 — so a column that reaches 2 has to spill 1 into the next column. That spill is the whole story of this chapter. If you can write down the carry leaving each column, you can build an adder. If you cannot, no amount of Verilog will save you.",
        },
        {
          kind: "analogy",
          text: "Picture two jars of coins on a table, one holding 7p written in binary and one holding 3p, with columns of coins drawn underneath them. Take the rightmost column from each jar. Count the coins. If the count is 1, leave it. If it is 2, you cannot leave two coins in a column that only fits one, so you leave one and hand the other one to the next column on the left. Keep going left. The string of coins left behind is the answer, and the coin you were holding at the end is the carry out. The hardware in this chapter does exactly that, one column at a time, forever.",
        },
        {
          kind: "para",
          text: "Each column has three bits going in: one bit from each number, plus the carry from the column to its right. Each column produces two bits: the bit that stays in the column, and the carry that moves left. The rightmost column has no carry from anywhere, so its incoming carry is 0 — you will see that this is exactly what happens in real Verilog. Here is the whole example worked out, 7 + 3:",
        },
        {
          kind: "table",
          head: ["Column", "Bit of 0111", "Bit of 0011", "Carry in", "Total", "Sum bit", "Carry out"],
          rows: [
            ["0 (rightmost)", "1", "1", "0", "1+1+0 = 2", "0", "1"],
            ["1", "1", "1", "1", "1+1+1 = 3", "1", "1"],
            ["2", "1", "0", "1", "1+0+1 = 2", "0", "1"],
            ["3 (leftmost)", "0", "0", "1", "0+0+1 = 1", "1", "0"],
          ],
          caption:
            "Read the Sum bit column from right to left: 0, 1, 0, 1 — which written on paper is 1010. That is 10, and 7 + 3 = 10. The carry out of the leftmost column is 0 because 10 fits in four bits.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Three bits in, two bits out — always",
          text: "Notice the shape of every row above. Three single bits go in. Two single bits come out. That is a truth table with 3 inputs and 2 outputs, so it has 8 rows, not 4. The extra input is the carry, and it is why a full adder exists as a separate thing from a half adder. The extra output is the carry, and it is why a whole multi-bit adder is a chain rather than one big block.",
        },
        {
          kind: "doThis",
          title: "Walk one column at a time (10 minutes)",
          items: [
            "Write `0111` and `0011` one above the other, and label the four columns 0, 1, 2, 3 from the right.",
            "Start at column 0. Write the bit of `0111`, then the bit of `0011`, then the carry in, which is 0 because nothing has spilled yet. Add the three digits as ordinary small numbers.",
            "Write the total in the 'Total' column, then split it: the remainder after dividing by 2 is the sum bit, the quotient is the carry out. For a total of 2 that gives sum 0 and carry 1. For a total of 3 it gives sum 1 and carry 1.",
            "Move one column left and use the carry you just wrote as that column's carry in. Do all four columns. Do not skip ahead — the whole skill is being able to stop and think about one column without holding the rest in your head.",
            "Read your four sum bits off as a binary number and check it equals 10.",
            "Now do the same walk for `0011` + `0101`. Every column should come out as either 0 or 1 with carries, and the answer should be `1000`.",
            "Last one, and this is the one to remember: `4'b1111` + `4'b0001`. Work the columns. The answer written in 4 bits is `0000`, and a carry of 1 comes out of the top. Fifteen plus one is sixteen, which does not fit in 4 bits at all. Write down what that tells you about how wide the result has to be — you will need it in a few minutes.",
          ],
        },
        {
          kind: "para",
          text: "Look at that last case again. 15 + 1 = 16, and 4 bits can only hold 0 through 15. The answer is genuinely too big for the container you put it in. Write that down: **the result of adding two n-bit numbers can need n+1 bits.** Every adder in this chapter is built with that fact built into its port list, and the single most common bug in this chapter is forgetting it.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Adding 4-bit `1010` and 4-bit `0101`, what is the carry out of column 0, and what is the carry into column 1?",
              a: "Column 0: a[0] = 0, b[0] = 1, carry in = 0, so the total is 0+1+0 = 1. That gives sum bit 0 and carry out 1. So the carry out of column 0 is 1, and the carry into column 1 is also 1 — they are the same wire. The wire leaving one column *is* the wire entering the next. That single fact is what makes the ripple chain possible.",
            },
            {
              q: "Two 4-bit numbers are added and the carry out of the top column is 1. Does that mean the answer is wrong?",
              a: "No. It means the true sum needed a fifth bit. The four bits you have are the correct low four bits of the answer — they are just not the whole answer. Adding `1000` + `1000` gives a carry out of 1 and sum `0000`, and `0000` is not zero, it is 16. The carry out is not an error, it is the missing bit being reported. Whether it *means* an error is the difference between unsigned and signed arithmetic, which is chapter 6.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-half-adder",
      title: "The half adder: two bits in, a sum and a carry out",
      lede: "The smallest useful adder, and the reason XOR exists in your toolbox.",
      blocks: [
        {
          kind: "para",
          text: "Take the bottom column of an addition and pretend no carry ever arrives. You have two bits in — a[0] and b[0] — and you need two bits out: the sum bit that stays in the column, and the carry that goes left. A circuit with that shape is a *half adder*. It is called half because it only handles half the input: it has no carry-in pin, so it cannot be chained. It is still a complete, useful part, and it is the building block of the part that is.",
        },
        {
          kind: "para",
          text: "Because it has two inputs, it has exactly four rows. Here they all are, with the ordinary decimal sum of the two bits in the last column so you can check the table against arithmetic you already trust:",
        },
        {
          kind: "table",
          head: ["a", "b", "a + b", "sum", "carry"],
          rows: [
            ["0", "0", "0", "0", "0"],
            ["0", "1", "1", "1", "0"],
            ["1", "0", "1", "1", "0"],
            ["1", "1", "2", "0", "1"],
          ],
          caption:
            "Four rows, because 2² = 4. The last row is the only interesting one: 1 + 1 does not fit in one bit, so the sum bit is 0 and the carry is 1.",
        },
        {
          kind: "steps",
          title: "Why sum is XOR, row by row",
          items: [
            {
              head: "Read the sum column: 0, 1, 1, 0",
              body: "A column of truth-table results is the definition of an operator. Compare it to the table for `a ^ b` from chapter 1: 0, 1, 1, 0. Identical. So the sum bit is `a ^ b`, and you can stop reasoning about it forever — the table is the proof.",
            },
            {
              head: "Say it in words instead",
              body: "XOR is 1 when the two inputs *differ*. Check that against the column: when a and b differ (0/1 or 1/0) the sum is 1. When they are the same the sum is 0. And that is right, because 1 + 1 is the only case that produces a carry, and when it produces a carry the low bit of the answer is 0.",
            },
            {
              head: "Read the carry column: 0, 0, 0, 1",
              body: "That is 1 in exactly one place — when both inputs are 1. That is the definition of AND. So the carry is `a & b`.",
            },
            {
              head: "Check the carry column against arithmetic",
              body: "A carry happens only when a + b reaches 2, and with two single bits that requires 1 + 1. AND is high only when both inputs are high. The gate and the arithmetic agree on every row, which is what makes the pattern trustworthy rather than a coincidence.",
            },
            {
              head: "Write it",
              body: "Two continuous assignments. `assign sum = a ^ b;` and `assign carry = a & b;`. That is the entire half adder, and it is the entire half adder forever.",
            },
          ],
        },
        {
          kind: "code",
          caption: "The complete half adder. Two inputs, two outputs, two lines of logic.",
          code: `module half_adder (
  input  wire a,
  input  wire b,
  output wire sum,
  output wire carry
);
  assign sum   = a ^ b;
  assign carry = a & b;
endmodule`,
          note: "There is no `begin`/`end` and no `always` block, because nothing here needs to remember anything. Every output is defined in terms of the inputs at all times. That is the shape of any combinational circuit.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "sum is not a reserved word",
          text: "Plenty of beginners look at `sum` and assume Verilog has already claimed it, and go looking for a safe alternative like `s` or `result`. It has not. `sum` is an ordinary identifier. Name your signal `sum` and name it `s` — both are fine, and both are readable. The thing worth worrying about in an adder is not the name of the output, it is the width of the output, and we get to that shortly.",
        },
        {
          kind: "doThis",
          title: "Build the table, then the module (8 minutes)",
          items: [
            "Draw the four-row table above on paper, but leave the sum and carry columns blank.",
            "Fill in the sum column by doing the addition out loud for each row: 0+0=0 so sum is 0; 0+1=1 so sum is 1; 1+0=1 so sum is 1; 1+1=2 so the sum bit is 0 with a 1 carried left.",
            "Fill in the carry column by asking one question only: did the total reach 2? Three times the answer is no, once the answer is yes.",
            "Look at your two finished columns and write the operator name for each next to it. The pattern 0,1,1,0 is XOR. The pattern 0,0,0,1 is AND.",
            "Write the module above from memory. Then write the truth table for the full adder on the next topic without looking at the half adder's, to prove you can derive it rather than only recall it.",
          ],
        },
      ],
    },
    {
      slug: "the-full-adder",
      title: "The full adder: now with a carry coming in",
      lede: "Add the missing pin and the half adder becomes the part you will actually chain.",
      blocks: [
        {
          kind: "para",
          text: "A half adder cannot be chained, and that is the only thing wrong with it. Every column except the rightmost one receives a carry from its neighbour. So take the half adder, give it a third input, and it can sit in the middle of a chain. That is a *full adder*: three bits in, two bits out. It is the workhorse of this chapter and of essentially all arithmetic hardware.",
        },
        {
          kind: "table",
          head: ["a", "b", "cin", "sum", "cout", "Does the row look like arithmetic?"],
          rows: [
            ["0", "0", "0", "0", "0", "0 + 0 + 0 = 0, nothing spills"],
            ["0", "0", "1", "1", "0", "0 + 0 + 1 = 1, nothing spills"],
            ["0", "1", "0", "1", "0", "0 + 1 + 0 = 1, nothing spills"],
            ["0", "1", "1", "0", "1", "0 + 1 + 1 = 2, one spills"],
            ["1", "0", "0", "1", "0", "1 + 0 + 0 = 1, nothing spills"],
            ["1", "0", "1", "0", "1", "1 + 0 + 1 = 2, one spills"],
            ["1", "1", "0", "0", "1", "1 + 1 + 0 = 2, one spills"],
            ["1", "1", "1", "1", "1", "1 + 1 + 1 = 3, one spills and 1 stays"],
          ],
          caption:
            "Eight rows, because 2³ = 8. Read the sum column as 0, 1, 1, 0, 1, 0, 0, 1 and the cout column as 0, 0, 0, 1, 0, 1, 1, 1 — both patterns are operators you already have.",
        },
        {
          kind: "para",
          text: "Two facts fall straight out of that table, and together they *are* the full adder. First, the sum column is 0, 1, 1, 0, 1, 0, 0, 1 — which is XOR twice: `a ^ b ^ cin`. Any odd number of the three bits being 1 gives a sum of 1, and a chain of XORs is exactly that. Second, the cout column is 1 in the four rows 011, 101, 110 and 111 — that is, whenever **two or more** of the three inputs are 1. A function that is 1 when a majority of its inputs are 1 has a name, and the name is the *majority* function. `cin` matters to the carry exactly as much as a and b do, which is the entire reason this part is different from the half adder.",
        },
        {
          kind: "code",
          caption: "The full adder as pure gates. This is the version that shows you what is inside.",
          code: `module full_adder (
  input  wire a,
  input  wire b,
  input  wire cin,
  output wire sum,
  output wire cout
);
  wire s1, c1, c2;

  assign s1   = a ^ b;      // first half: sum of a and b
  assign c1   = a & b;      // first half: carry of a and b
  assign sum  = s1 ^ cin;   // second half: absorb the carry-in
  assign c2   = s1 & cin;
  assign cout = c1 | c2;    // either half's carry is a carry
endmodule`,
          note: "Five lines of gates, and every one of them is something you have already met. `s1`, `c1` and `c2` are ordinary wires declared inside the box — they exist so two expressions can share a result.",
        },
        {
          kind: "steps",
          title: "Read the internal wiring like a schematic",
          items: [
            {
              head: "`s1 = a ^ b` and `c1 = a & b` — that is a half adder",
              body: "These two lines are the half adder from the last topic, inlined rather than instantiated. It answers a partial question: given a and b, what is their sum bit and their carry? Call the results s1 and c1.",
            },
            {
              head: "`sum = s1 ^ cin` and `c2 = s1 & cin` — that is a second half adder",
              body: "The same two rules again, applied to s1 and cin. Adding s1 to cin gives the final sum bit, and any carry from that addition is c2. Because XOR is associative, s1 ^ cin is `(a ^ b) ^ cin`, which is `a ^ b ^ cin` — the sum column of the eight-row table, derived rather than looked up.",
            },
            {
              head: "`cout = c1 | c2` — a carry is a carry",
              body: "Two things could produce a carry: the first addition (c1) or the second (c2). The column has one carry-out pin, so if either happened, carry out. That is OR. And it is exactly the four rows of the table where two or more of a, b, cin are 1.",
            },
            {
              head: "So the full adder is two half adders and an OR",
              body: "This is not a trick. It is the actual way a full adder is built, and once you have a module for the half adder you can literally plug two of them together and add an OR. The wiring is five gate-equivalents, which is small enough that real hardware does exactly this rather than using a cleverer single primitive.",
            },
            {
              head: "Then you can go the other way",
              body: "The two versions are interchangeable. `assign sum = a ^ b ^ cin;` and `assign cout = (a & b) | (a & cin) | (b & cin);` are the same circuit in one line each, and the second is a fair amount easier to check against the table. Write the readable version in your own design, and understand the version above.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why this is the important idea in the chapter",
          text: "You have just built a three-input part out of a two-input part, and the bigger part did not need to know anything about how the smaller one worked. That is *structural composition*: you compose a circuit from sub-circuits, each behind its own port list. It is the same reason a module is worth having, and it is the reason a 32-bit adder is not a frightening thing. It is thirty-two small things you already trust. The next topic does nothing new — it just repeats this part four times.",
        },
        {
          kind: "check",
          items: [
            {
              q: "a = 1, b = 1, cin = 0. What are sum and cout, and which of the three inputs caused the carry?",
              a: "sum = 0, cout = 1. Step through the wiring: s1 = 1 ^ 1 = 0, c1 = 1 & 1 = 1. Then sum = s1 ^ cin = 0 ^ 0 = 0, and c2 = s1 & cin = 0. Finally cout = c1 | c2 = 1 | 0 = 1. The carry came from c1, meaning a and b together were enough — the carry-in contributed nothing, because 1 + 1 + 0 is already 2.",
            },
            {
              q: "All three inputs are 1. What are sum and cout, and what decimal number is that?",
              a: "sum = 1, cout = 1, so the full result is `11` in binary, which is 3. And 1 + 1 + 1 = 3, so the table agrees with arithmetic. Note that both output bits are 1 at once — the full adder's two outputs are genuinely independent, and you cannot infer the sum from the carry or the reverse.",
            },
          ],
        },
      ],
    },
    {
      slug: "five-bits-out",
      title: "Four bits in, five bits out",
      lede: "The width mistake that makes a correct-looking adder wrong, and the WIDTHTRUNC warning that tells you.",
      blocks: [
        {
          kind: "para",
          text: "Go back to the last thing you did by hand: `4'b1111` + `4'b0001`. Four bits of `a`, four bits of `b`, and the answer is 16 — which needs five bits. If your module declares a 4-bit output and throws the fifth bit away, the module returns `0000` and looks perfectly confident while being wrong by sixteen. This is the biggest trap in the chapter, and it is worth being pedantic about: **an adder's result is one bit wider than its inputs.**",
        },
        {
          kind: "para",
          text: "The trap is nastier when you let Verilog do the adding for you. Writing `assign sum = a + b;` looks obviously right, and it is — right up to the moment the sum does not fit. The width of the addition is set by the width of the thing you are assigning it to. Assign 4 bits and the addition is performed in 4 bits, the fifth bit has nowhere to go, and the tool discards it without a sound. The code compiles, the build is green, and the answer is wrong.",
        },
        {
          kind: "code",
          caption: "The wrong version and two correct fixes. Only the port widths differ.",
          code: `// WRONG: 4-bit in, 4-bit out. The carry out of the top column is
// computed and then thrown away. 15 + 1 returns 0000.
module sum_narrow (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] sum
);
  assign sum = a + b;
endmodule

// FIX 1: make the destination 5 bits. The addition is then done at 5 bits,
// the operands are widened, and the carry survives.
module sum_wide (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [4:0] sum
);
  assign sum = a + b;
endmodule

// FIX 2: keep the 4-bit result and a separate carry-out pin. The
// concatenation makes the destination 5 bits wide, so the addition is
// still performed at 5 bits — cout just gets the extra bit.
module sum_split (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] sum,
  output wire       cout
);
  assign {cout, sum} = a + b;
endmodule`,
          note: "Neither fix adds logic. There is no gate you have to write. The only change is how wide the thing on the left of the `=` is, and that width is what decides the width of the arithmetic on the right.",
        },
        {
          kind: "table",
          head: ["a", "b", "a + b in decimal", "4-bit sum", "4-bit sum + cout"],
          rows: [
            ["0000", "0000", "0", "0000", "0 0000"],
            ["0111", "0001", "8", "1000", "0 1000"],
            ["1000", "1000", "16", "0000", "1 0000"],
            ["1111", "0001", "16", "0000", "1 0000"],
            ["1111", "1111", "30", "1110", "1 1110"],
          ],
          caption:
            "Read the last two columns against each other. Wherever cout is 1, the 4-bit column alone is not the answer — the 5-bit column is. 15 + 15 = 30 is `11110`, and the four low bits of that are `1110`.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Verilator's WIDTHTRUNC warning is telling you exactly this",
          text: "When an expression's natural width and the destination's width disagree, Verilator emits a WIDTHTRUNC warning naming the operator and both widths. It is a real warning, not a style note — treat it as a bug report about your port list. The same applies to UNUSEDSIGNAL on a signal you meant to connect: a carry-out you forgot to wire up is exactly the mistake where the fifth bit quietly disappears.",
        },
        {
          kind: "trap",
          wrong: "`output wire [3:0] sum;` on a module that adds two 4-bit numbers.",
          right: "`output wire [4:0] sum;`, or a 4-bit `sum` plus a 1-bit `cout`.",
          why: "The largest value two 4-bit numbers can produce is 15 + 15 = 30, and 30 needs 5 bits. With a 4-bit destination the addition is evaluated at 4 bits and the top bit is discarded, so `1111 + 0001` returns `0000`. Nothing in the build fails. The WIDTHTRUNC warning is the only thing that tells you, which is why you should not be scrolling past it.",
        },
        {
          kind: "trap",
          wrong: "Renaming `sum` to `s` to 'fix' an adder that gives the wrong answer.",
          right: "Leave the name alone and go check the widths.",
          why: "`sum` is a perfectly ordinary identifier and means nothing special to Verilog. If renaming a signal changes behaviour, then two different signals in your design are somehow attached to each other — which is a wiring bug, not a naming one, and renaming hides it rather than fixing it. The width of a signal is what determines behaviour; its name never does.",
        },
        {
          kind: "doThis",
          title: "Find the overflow, on paper (6 minutes)",
          items: [
            "List every 4-bit pair whose true sum is 15 or more — those are the cases where a 4-bit destination loses information. Start at 1000 + 1000 = 16 and work up.",
            "For each, write the 4-bit answer you would get and the 5-bit answer you should get. Check that the 4-bit answer is always the 5-bit answer with its leading bit chopped off.",
            "Now find the smallest pair of 4-bit unsigned numbers whose sum needs a fifth bit. You should get `1000` + `1000`.",
            "Write the port list for an adder that gets this right, from memory. Check every width against the two rules: result one bit wider than the inputs, carry-in one bit.",
            "Finally, predict what happens if you add 4-bit `1000` and 4-bit `1000` and look only at `cout`. Is `cout` alone enough to reconstruct the full 5-bit answer? (It is — the fifth bit is exactly what cout holds.)",
          ],
        },
      ],
    },
    {
      slug: "chaining-columns",
      title: "Chaining the columns: the ripple-carry adder",
      lede: "Four full adders in a row, each feeding its carry to the one on its left.",
      blocks: [
        {
          kind: "analogy",
          text: "Four people sit in a row passing one message to the left. The rightmost person knows the bottom two digits. He works out his digit of the answer and passes a note reading 'carry' to the next person. That person now has three pieces of information, works out his digit, and passes a note on. The last person on the left has everything he needs. The message takes four hops, and the last person cannot finish until the note has travelled all the way. That delay is real, and it is the defining weakness of this design.",
        },
        {
          kind: "para",
          text: "Now do it in Verilog. The rules are mechanical: the carry out of each full adder *is* the carry in of the one above it, the rightmost full adder gets `cin` from the module's port list, and the topmost full adder's carry out *is* the module's `cout`. Every column uses the same `full_adder` you already built. You are not writing any new logic in this topic, only wiring.",
        },
        {
          kind: "code",
          caption: "A 4-bit ripple-carry adder. Four copies of the same part, wired in a line.",
          code: `module nibble_adder (
  input  wire [3:0] a,
  input  wire [3:0] b,
  input  wire       cin,
  output wire [3:0] sum,
  output wire       cout
);
  // The three carries *between* columns. The carry into column 0 is
  // the cin port; the carry out of column 3 is the cout port.
  wire c1, c2, c3;

  full_adder fa0 (
    .a(a[0]),
    .b(b[0]),
    .cin(cin),
    .sum(sum[0]),
    .cout(c1)
  );

  full_adder fa1 (
    .a(a[1]),
    .b(b[1]),
    .cin(c1),
    .sum(sum[1]),
    .cout(c2)
  );

  full_adder fa2 (
    .a(a[2]),
    .b(b[2]),
    .cin(c2),
    .sum(sum[2]),
    .cout(c3)
  );

  full_adder fa3 (
    .a(a[3]),
    .b(b[3]),
    .cin(c3),
    .sum(sum[3]),
    .cout(cout)
  );
endmodule`,
          note: "Every connection is named — `.a(a[0])` means 'connect the port called a to bit 0 of my a'. Named connections are the safe style: if somebody adds a port to `full_adder` later, your instantiations still connect to the right things. Positional connections (`fa0(a[0], b[0], cin, sum[0], c1)`) silently shift every argument if the port list ever changes order.",
        },
        {
          kind: "steps",
          title: "Chase the carry by hand for 4'b0011 + 4'b0101",
          items: [
            {
              head: "Write the two numbers out, bit by bit",
              body: "a = 0011 (decimal 3), b = 0101 (decimal 5). You expect the answer 8, which is `1000`, and since 8 fits in 4 bits you expect cout to be 0. The point of this walk is not the answer, it is watching the carry travel.",
            },
            {
              head: "Column 0: a[0]=1, b[0]=1, cin=0",
              body: "1 + 1 + 0 = 2. Sum bit 0, carry out 1. Write sum[0] = 0 and c1 = 1. The carry now enters column 1.",
            },
            {
              head: "Column 1: a[1]=1, b[1]=0, cin=c1=1",
              body: "1 + 0 + 1 = 2. Sum bit 0, carry out 1. Write sum[1] = 0 and c2 = 1. Note how useless column 1 would have been without the carry arriving — 1 + 0 is just 1.",
            },
            {
              head: "Column 2: a[2]=0, b[2]=1, cin=c2=1",
              body: "0 + 1 + 1 = 2. Sum bit 0, carry out 1. Write sum[2] = 0 and c3 = 1.",
            },
            {
              head: "Column 3: a[3]=0, b[3]=0, cin=c3=1",
              body: "0 + 0 + 1 = 1. Sum bit 1, carry out 0. Write sum[3] = 1 and cout = 0.",
            },
            {
              head: "Read the result and check",
              body: "sum[3] sum[2] sum[1] sum[0] = 1 0 0 0 = `4'b1000` = 8, and cout = 0. That matches 3 + 5 = 8. The carry was 1 for three columns in a row, which is exactly the *ripple* the design is named for.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "The logic is trivial and the timing is not",
          text: "Look at how long column 3 had to wait. It cannot produce a correct answer until c3 has settled, and c3 cannot settle until c2 has, and c2 until c1, and c1 until the first two XOR and AND gates have settled. Four stages of gates, in series, and the answer is only trustworthy at the end of them. That series of stages is called the *critical path* — the longest chain of logic the input has to travel through. Because every column is roughly the same delay, adding more bits makes the adder linearly slower. Doubling the width to 32 bits doubles the worst-case time to get an answer. This is why real processors do not use plain ripple adders for fast arithmetic: they rearrange the logic so the carries do not have to travel one at a time. That rearrangement is called carry-lookahead, and it is where this story goes after the exercises — but you cannot appreciate it until you have felt the ripple.",
        },
        {
          kind: "trap",
          wrong: "`wire [N-1:0] carry;` for the internal carry bus of an N-bit adder.",
          right: "`wire [N:0] carry;` — N+1 wires, not N.",
          why: "The chain has N stages and therefore N+1 carry values: one arriving, one between each pair of stages, one leaving. Declaring N wires means the last stage has no output pin to write to, and Verilator will tell you that bit N does not exist in a signal declared `[N-1:0]`. It is the same off-by-one as the missing fifth output bit in the previous topic, wearing a different hat.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Label four columns 0 to 3 and draw three carry wires c1, c2, c3 running between them. Label the module's `cin` arriving at column 0 and `cout` leaving column 3.",
            "Do the full 3 + 5 walk above in your drawing, writing the value of every wire as you go.",
            "Find a pair of 4-bit numbers that makes the carry go all the way: `1000` + `1000` gives 1 at every carry. Trace it and confirm cout = 1 with sum = `0000`.",
            "Now trace `0100` + `0011` (4 + 3 = 7, fits). Watch where the ripple stops — c1 is 1, but by column 2 the carry has nothing left to do and dies. This is the case where the adder is fastest.",
            "Count the number of full adders in your design. Now imagine being asked for 8 bits. How many instances, and how many carry wires between them? Write the answer down; you will parameterise it in the last topic.",
          ],
        },
      ],
    },
    {
      slug: "carry-out-is-not-overflow",
      title: "Carry-out is not overflow",
      lede: "Two different facts about the same wire, and conflating them hides real errors.",
      blocks: [
        {
          kind: "para",
          text: "Your adder has a `cout` pin and it is easy to assume cout = 1 means 'something went wrong'. It does not, on its own. Carry-out is a *wiring fact*: it says that bit N of the sum exists and did not fit inside the N bits you asked for. It is simply the answer reporting its own overflow past the bus, and it is always trustworthy. Whether the answer is *right* is a separate question, and answering it needs to know whether your numbers are signed or unsigned. Chapter 6 is about that. This topic is about not mixing the two words up.",
        },
        {
          kind: "table",
          head: ["The two ideas", "What it means", "What you need to know"],
          rows: [
            ["Carry-out", "Bit N of the true sum is 1 — the answer did not fit in N bits", "Nothing. It is always well defined."],
            ["Overflow (unsigned)", "The true sum is larger than the largest N-bit value", "Nothing extra. It is exactly carry-out."],
            ["Overflow (signed)", "The true sum cannot be represented as an N-bit signed number", "That the inputs are signed, and what their sign bits are."],
          ],
          caption:
            "For unsigned addition, carry-out and overflow are the same thing. For signed addition they are not, and that is the entire reason chapter 6 exists.",
        },
        {
          kind: "steps",
          title: "Two examples that look identical and are not",
          items: [
            {
              head: "Example A — the honest overflow",
              body: "`4'b1111` + `4'b0001`. Unsigned, that is 15 + 1 = 16. Walk it: every column produces a carry, cout = 1, and sum = `0000`. The 4 bits of sum are a perfectly good description of the low four bits of the answer, which really are zero. The answer was too big for 4 bits, cout said so, and the arithmetic is not in error. If you widened the result to 5 bits you would get `1_0000` and the sum would be right.",
            },
            {
              head: "Example B — carry-out is 0 and something is still wrong",
              body: "`4'b0111` + `4'b0001` gives `1000` with cout = 0, so by the unsigned reading everything is fine. Now reinterpret bit 3 as a sign bit, the way chapter 6 will: 0111 is +7 and 0001 is +1, and +7 + 1 = +8 — which is `1000` in this notation, and 1000 is −8. Two positive numbers produced a negative answer. The carry-out is 0 and the addition is still wrong. This is signed overflow, and no amount of staring at `cout` will reveal it.",
            },
            {
              head: "The lesson",
              body: "Carry-out tells you about the width of the bus. Overflow tells you about the meaning of the numbers. Neither is a substitute for the other, and in signed arithmetic carry-out is not even the right thing to look at. Carry the cout port — it is genuinely useful, for multi-byte arithmetic and for detecting that you need a wider result — and do not let it make you think the answer is safe.",
            },
          ],
        },
        {
          kind: "trap",
          wrong: "Treating a 1 on `cout` as an error condition and zeroing the result.",
          right: "Let the wider result be wider. If you need N+1 bits, declare N+1 bits.",
          why: "cout = 1 does not mean the low N bits are garbage — they are the correct low N bits of the answer. Throwing them away discards good data. The usual mistake is a module with a 4-bit sum and a cout, where the testbench only prints `sum` and the carry quietly gets lost. If you build the carry-out pin, actually use it.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A 4-bit unsigned adder computes `4'b1100` + `4'b1100`. What is sum, what is cout, and is the unsigned addition in error?",
              a: "12 + 12 = 24, which is `11000` in binary. The low four bits are `1000`, so sum = `4'b1000` and cout = 1. The unsigned addition is not in error — 24 genuinely needs 5 bits, and cout is correctly reporting that. You have simply asked a 4-bit question and gotten a 5-bit answer split across two pins.",
            },
            {
              q: "You add two 4-bit values and cout is 0. Can you conclude the answer is correct?",
              a: "For unsigned values, yes — no carry out means the true sum fits in 4 bits, so sum is the whole answer. For signed values, no. `4'b0111` + `4'b0001` gives sum `1000` with cout = 0, but +7 + 1 cannot be represented in a signed 4-bit number. Signed overflow is a sign-bit question, not a carry question, and it is the subject of chapter 6.",
            },
          ],
        },
      ],
    },
    {
      slug: "your-first-testbench",
      title: "Your first testbench",
      lede: "A module that proves the design, drives the inputs, prints the answers, and stops.",
      blocks: [
        {
          kind: "para",
          text: "You now have an adder and no way to be sure it is right. Lint will tell you a signal is undriven or a width is wrong, but it cannot tell you the sum is wrong. For that you need a *testbench*: a second module, with no real inputs and no real outputs, whose whole job is to poke your design, watch it, and print what happened. This is the first time in the track you write something that is not the design itself, and it is the moment the whole way of working changes — from code you hope is right to code you have watched fail.",
        },
        {
          kind: "code",
          caption: "A testbench that drives all eight rows of the full adder and prints every answer.",
          code: `\`timescale 1ns/1ps

module tb_full_adder;

  // Signals the test drives are reg: this block assigns them.
  reg  a;
  reg  b;
  reg  cin;

  // The design's outputs stay wire: the design drives them, we only read.
  wire sum;
  wire cout;

  full_adder dut (
    .a(a),
    .b(b),
    .cin(cin),
    .sum(sum),
    .cout(cout)
  );

  initial begin
    a = 1'b0; b = 1'b0; cin = 1'b0; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b0; b = 1'b0; cin = 1'b1; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b0; b = 1'b1; cin = 1'b0; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b0; b = 1'b1; cin = 1'b1; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b1; b = 1'b0; cin = 1'b0; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b1; b = 1'b0; cin = 1'b1; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b1; b = 1'b1; cin = 1'b0; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);
    a = 1'b1; b = 1'b1; cin = 1'b1; #1 $display("%b%b%b -> %b%b", a, b, cin, cout, sum);

    $finish;
  end
endmodule`,
          note: "The expected printout is eight lines: 000 -> 00, 001 -> 01, 010 -> 01, 011 -> 10, 100 -> 01, 101 -> 10, 110 -> 10, 111 -> 11. Every line is cout followed by sum, which reads left to right exactly like the sum written on paper.",
        },
        {
          kind: "steps",
          title: "Read the testbench line by line",
          items: [
            {
              head: "`reg a, b, cin;` and `wire sum, cout;`",
              body: "The `reg` signals are the ones this module assigns, so they must be `reg` — a testbench cannot assign to a wire. The `sum` and `cout` are the design's outputs, and the design drives them, so from this module's point of view they are wires. Getting this backwards is the most common testbench error, and it produces a type error the moment you assign to a wire.",
            },
            {
              head: "`full_adder dut ( .a(a), ... );`",
              body: "This instantiates the design, the same syntax you used in the nibble adder. `dut` means *device under test* — it is just the instance name. The testbench and the design are two separate modules, connected only by these named pins.",
            },
            {
              head: "`initial begin`",
              body: "An `initial` block runs once, at time zero, in order. It is how a testbench describes a sequence of events. This is the one place in the track where code that looks procedural is exactly right: there is no clock here, and there is no hardware being built from the block. The block is the experiment, not the circuit.",
            },
            {
              head: "`a = 1'b0; b = 1'b0; cin = 1'b0; #1 $display(...)`",
              body: "Set all three inputs, then wait `#1` — one unit of time — and only then read the outputs. The delay is not decoration. Your adder is built from continuous assignments, which settle after the inputs change, and if you read `sum` in the same instant you assign `a` you are reading the *old* answer. Changing inputs and reading outputs on different timesteps is the fix, and it is why the drive and the read are separated here.",
            },
            {
              head: "`$display(\"%b%b%b -> %b%b\", a, b, cin, cout, sum)`",
              body: "`%b` prints a value in binary, once per value in the list. `%f`, `%d` and `%h` are the same idea for floating point, decimal and hex. Putting the format string and the values in order means the line prints the three inputs, an arrow, then the two outputs — one readable line per test row. Compare that against your hand-written truth table; the two should match on every row or one of you is wrong.",
            },
            {
              head: "`$finish;`",
              body: "Ends the simulation. Without it the simulator keeps running with nothing left to do, forever, and either hangs or looks like a hang. Always end the stimulus.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "$display, not $monitor",
          text: "`$display` prints exactly when you call it, and this track uses it throughout. `$monitor` is the instruction that says 'print this line whenever any of these signals changes' — convenient, and worth knowing about, but it is not supported by this Verilator build and using it will fail. The explicit `$display` after each input change is the pattern you need, and it has the advantage that your eight test rows appear in a known order.",
        },
        {
          kind: "trap",
          wrong: "A testbench with no `$finish;` at the end of the `initial` block.",
          right: "End every `initial` block with `$finish;`.",
          why: "The simulator has no reason to stop. With nothing left to change, the design's outputs sit still and the run either never returns or appears to hang with no output after the last line. A hang with no message is much harder to diagnose than an error, so make `$finish` a habit you never have to think about.",
        },
        {
          kind: "trap",
          wrong: "Reading `sum` on the same timestep you assigned `a` and `b`.",
          right: "Drive, then `#1`, then read.",
          why: "Nothing in the design is instantaneous. The input changes, the XOR and AND gates respond, and the outputs settle — but that all takes time. In a zero-delay read you print the previous row's answer, and every line of your output is one row behind. It looks like a logic bug and it is not one, which is why the `#1` before the read is the line to get right.",
        },
        {
          kind: "doThis",
          title: "Test it the way the pset wants (12 minutes)",
          items: [
            "Write the testbench above for `full_adder` and predict the eight output lines *before* you run anything. Write them on paper from the truth table, not from the code.",
            "Run it and compare. If your prediction and the output disagree, do not start changing code — find which one is wrong and say why. Every disagreement is a real misunderstanding and it is the most valuable moment in the exercise.",
            "Now write a testbench for `nibble_adder` that drives at least four cases, and make sure at least two of them produce a carry out of the top column. Those are the rows that catch a missing cout port.",
            "Include `4'b1111 + 4'b0001` and check that sum is `0000` with cout = 1. If cout is 0, or missing, you have found a real bug in your instantiations — a full adder with an unconnected carry-out is exactly how that happens.",
            "Add a case that drives `cin = 1` with `a = 0` and `b = 0`. The answer is sum 1, cout 0. This row is the one that proves the carry-in is genuinely reaching column 0 and not just floating.",
            "Make the testbench *self-checking*: compare each result against the expected value with a conditional and print `PASS` or `FAIL` per row. You now have a testbench that can tell you the design is wrong without you reading eight lines by eye.",
          ],
        },
      ],
    },
    {
      slug: "any-width-and-the-plus-operator",
      title: "Any width, and the operator that does it for you",
      lede: "Parameterise the chain, then find out why you will rarely build one by hand again.",
      blocks: [
        {
          kind: "para",
          text: "The nibble adder works because it is written out four times by hand, and a 32-bit version would be thirty-two copies, which is absurd. `parameter` fixes that: name a width once in the module header, use that name in the port widths and in the loop, and the same source file serves 4, 8, 16 or 32 bits depending on what you ask for. `generate` and `genvar` are the other half — they are the Verilog construct for building many copies of a module at elaboration time, which is exactly what a chain of columns is.",
        },
        {
          kind: "code",
          caption: "The same chain, any width. Change one number to change the design.",
          code: `module ripple_carry #(
  parameter N = 4
)(
  input  wire [N-1:0] a,
  input  wire [N-1:0] b,
  input  wire         cin,
  output wire [N-1:0] sum,
  output wire         cout
);
  // N+1 carry wires, not N: one arriving, N-1 between, one leaving.
  wire [N:0] carry;

  assign carry[0] = cin;

  genvar i;
  generate
    for (i = 0; i < N; i = i + 1) begin : cols
      full_adder fa (
        .a(a[i]),
        .b(b[i]),
        .cin(carry[i]),
        .sum(sum[i]),
        .cout(carry[i+1])
      );
    end
  endgenerate

  assign cout = carry[N];
endmodule`,
          note: "`generate` is not a runtime loop. There is no hardware that counts up to N — the block is expanded N times when the design is elaborated, and each copy becomes real gates. The block label `cols` is what names the copies, so `cols[0].fa` and `cols[3].fa` are addressable in a waveform viewer.",
        },
        {
          kind: "code",
          caption: "Using it. One module, three different widths, no duplicated source.",
          code: `ripple_carry #(.N(4))  add4  (
  .a(a4),  .b(b4),  .cin(c4),  .sum(s4),  .cout(cy4)
);

ripple_carry #(.N(8))  add8  (
  .a(a8),  .b(b8),  .cin(c8),  .sum(s8),  .cout(cy8)
);

ripple_carry #(.N(16)) add16 (
  .a(a16), .b(b16), .cin(c16), .sum(s16), .cout(cy16)
);`,
          note: "`#(.N(8))` overrides the default of 4, by name. The named-override form is the one to use: `#(8)` works but means 'the first parameter', and the first parameter will not always be the width.",
        },
        {
          kind: "para",
          text: "So why learn all of this, when the `+` operator exists? Because `assign sum = a + b;` builds the same circuit. The tool recognises addition and generates an adder for you — and a good one, since synthesis tools usually produce a faster structure than a hand-written ripple. In your own designs you should write `+`. What this chapter bought you is the knowledge to *read* that generated adder, to reason about its carry and its width, and to hand-build a version when the built-in one does not fit. You now know that `assign sum = a + b` is only correct if `sum` is wide enough, and you know why the carry is the thing that makes the design interesting. That knowledge is worth far more than the eight lines of code you saved.",
        },
        {
          kind: "table",
          head: ["Situation", "What to write"],
          rows: [
            ["Ordinary N-bit unsigned addition", "`assign sum = a + b;` with `sum` one bit wider than `a` and `b`"],
            ["You need the carry-out separately", "`assign {cout, sum} = a + b;` — the width of the concatenation is what makes it correct"],
            ["You are teaching, or the structure matters", "A hand-built full adder chain, so every gate is visible"],
            ["A carry is needed early by other logic", "A separate carry-lookahead structure, which is faster than a ripple"],
            ["Signed arithmetic or overflow detection", "Out of scope here — chapter 6, with two's complement"],
          ],
          caption:
            "Reach for `+` in real designs. Reach for the hand-built version when you need to see the carries, or when the structure of the adder is the thing you are building.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Subtraction is the same adder",
          text: "You will meet this properly in chapter 6, but the shape of it is worth knowing now: to subtract b from a you add the two's complement of b instead, and a - b is a + (~b + 1). The `+ 1` is just a cin of 1 fed into column 0 of the adder you have already built. That is why subtraction costs no extra hardware in a CPU — the subtract unit *is* the add unit, with a different b, and with the carry-in tied high. Nothing you learned in this chapter was wasted on that.",
        },
        {
          kind: "trap",
          wrong: "`full_adder fa (.a(a[i]), .b(b[i]), .cin(carry[i]), .s(sum[i]), .c(carry[i+1]));` — guessing at the port names.",
          right: "Copy the port names from the `full_adder` header. They are `.a`, `.b`, `.cin`, `.sum` and `.cout`.",
          why: "A named connection to a port the module does not have is reported as a PINMISSING error, and it is reported at the instantiation, not in the module — so the error is in the file you thought was fine. Named connections are exactly what make this diagnosable: the message names the connection that has nothing to connect to.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You instantiate the ripple-carry adder with `#(.N(8))` and the compiler says bit 8 of `carry` does not exist. What did you declare?",
              a: "You declared `wire [N-1:0] carry;`, giving 8 wires indexed 0 to 7, but the last stage writes `carry[i+1]` with i = 7, which is `carry[8]`. The chain needs N+1 wires, so it must be `wire [N:0] carry;` — 9 wires, indices 0 to 8. It is the missing-carry-bit bug from the previous topic in its parameterised form: every stage produces a carry, including the last one.",
            },
            {
              q: "You want to use `+` but your 4-bit module returns 0000 for 15 + 1. What is the smallest change that fixes it?",
              a: "Widen the destination by one bit. Change `output wire [3:0] sum;` to `output wire [4:0] sum;` and the answer becomes `1_0000`, correct. Alternatively keep the 4-bit sum, add a 1-bit `cout` port, and write `assign {cout, sum} = a + b;`. The addition is evaluated at whatever width the destination is, so the fix is entirely on the left-hand side of the `=` — no gate needs writing and no logic changes.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "adder", meaning: "A circuit that adds two numbers, built from a chain of full adders." },
    { term: "carry-in (cin)", meaning: "The bit entering a column from the column to its right. Zero for the rightmost column." },
    { term: "carry-out (cout)", meaning: "The bit leaving a column to go left, or the bit leaving the top column of a whole adder." },
    { term: "critical path", meaning: "The longest chain of logic an input must pass through; it sets the adder's worst-case delay." },
    { term: "full adder", meaning: "A circuit with three bits in (a, b, carry-in) and two out (sum, carry-out). The chainable unit." },
    { term: "generate block", meaning: "Verilog syntax that builds many copies of a module at elaboration time, using a `genvar` loop." },
    { term: "half adder", meaning: "A circuit with two bits in and a sum and a carry out. It has no carry-in, so it cannot be chained." },
    { term: "instance", meaning: "One copy of a module placed inside a larger design, wired up through its port list." },
    { term: "least significant bit (LSB)", meaning: "Bit 0, the rightmost bit, worth 1." },
    { term: "most significant bit (MSB)", meaning: "The highest-index bit, on the left, worth half the value of the whole vector." },
    { term: "overflow", meaning: "The result does not fit the width you gave it. For unsigned addition it equals carry-out; for signed it does not." },
    { term: "ripple carry", meaning: "Each column's carry feeds the column above it, so the answer arrives as a wave moving leftward." },
    { term: "structural composition", meaning: "Building a bigger circuit out of smaller modules, each behind its own port list." },
    { term: "testbench", meaning: "A module that drives a design's inputs, reads its outputs, and checks the results. Not part of the hardware." },
    { term: "waveform", meaning: "A plot of signal values against time, which is how you watch a carry ripple across columns." },
  ],
  nextStep:
    "Start with the first lesson, Half & Full Adder. It asks you to write the half-adder truth table, realise it as `sum = a ^ b` and `carry = a & b`, assemble a full adder from two half adders and an OR, and then write the testbench above so the design proves itself. Read this page beside it — the worked additions in the first topic are the same arithmetic the lesson's exercises will ask you to do by hand, and the width discussion in 'Four bits in, five bits out' is what stops the carry from vanishing in the graded task.",
};
