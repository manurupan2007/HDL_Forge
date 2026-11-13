import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 6,
  chapterSlug: "arithmetic",
  title: "Number Systems & Arithmetic",
  readMinutes: 24,
  youWillBeAbleTo: [
    "Explain why hardware needs a way to represent a negative number, and why two's complement beat the alternatives",
    "Convert a number to two's complement by hand, in both directions, at any width",
    "Declare a signal signed, and say exactly what changes about the way it is read and compared",
    "Sign-extend a narrow signed value into a wider wire and predict the resulting bits",
    "Tell an arithmetic operator from a bitwise one, and pick the right one for a sum",
    "Decide whether an addition overflowed, and explain why the carry-out is not the same answer",
    "Write a comparator that returns the right verdict for signed and for unsigned operands",
  ],
  mentalModel: [
    {
      title: "The bits never change — only the reading does",
      body: "A 4-bit wire holds sixteen bits and nothing else. Those sixteen bits do not carry a sign; they are just bits. What they *mean* is decided by a word you write in the declaration and by the operator you apply them to. `4'b1111` is 15 when you read it as unsigned and −1 when you read it as signed, and it is the same sixteen bits on the wire in both cases. Verilog defaults to unsigned, which is why almost every surprising signed bug in this chapter is really the same bug: nobody said out loud which reading was meant, so you got the default.",
    },
    {
      title: "Two's complement makes the minus sign free",
      body: "A designer choosing how to store negative numbers has one goal above all: make the adder you already built do the work. Sign-and-magnitude would need a magnitude comparator and a second subtractor bolted onto the front of the adder. Ones' complement needs a special end-around carry. Two's complement needs nothing at all — because the pattern for minus-b is simply the bit pattern for b with every bit flipped, plus one. Adding a and minus-b is then just the ordinary addition you have been building since chapter 5, with the result's top bit falling out of the adder for free. The whole representation exists to buy that one simplification.",
    },
  ],
  topics: [
    {
      slug: "why-negative-numbers",
      title: "Why we need a way to write minus",
      lede: "Bits count upward, so somebody has to decide which bit patterns mean 'below zero' — and there are three reasonable answers.",
      blocks: [
        {
          kind: "analogy",
          text: "A thermometer has a zero, and that zero is a choice, not a fact. Somebody picked a day and called it 0, and now there is a whole half of the dial below it that only exists because of the label. Numbers work the same way. The question is never \"is there a negative?\" — it is \"which of the bit patterns do I hand over to the negatives?\"",
        },
        {
          kind: "para",
          text: "Start with the counting. Four bits give 2⁴ = 16 distinct patterns. Now count how many values a signed 4-bit number should be able to hold: −8, −7, −6, …, −1, 0, 1, … 7. That is 8 negative values, one zero, and 7 positive values — exactly 16. Sixteen patterns, sixteen values, one pattern each. Do it again at 8 bits: −128 through +127 is 256 values, and 2⁸ = 256 patterns. The split is forced, every time. Half the patterns go to the negative side and half to the positive side including zero.",
        },
        {
          kind: "table",
          head: ["Scheme", "How +5 looks", "How −5 looks", "How many zeros?", "Negate a value by"],
          rows: [
            ["sign and magnitude", "0_0101", "1_1010", "two (+0 and −0)", "flip the sign bit"],
            ["ones' complement", "4'b0101", "4'b1010", "two (+0 and −0)", "flip every bit"],
            ["two's complement", "4'b0101", "4'b1011", "one", "flip every bit, then add one"],
          ],
          caption:
            "The high bit of the first row is a separate sign bit, written with an underscore to show it. In the other two rows every bit carries weight, which is why the patterns fill the whole 0-to-15 range.",
        },
        {
          kind: "para",
          text: "Look at what each scheme costs you. Sign and magnitude keeps the sign off to the side, which looks tidy until you try to add. To work out +5 + (−3) you must first notice that the signs differ, then compare the magnitudes 5 and 3, then subtract the smaller from the larger, then attach the sign of whichever was bigger. That is a comparator and a second subtractor sitting in front of the adder, for every single addition. It also has two zeros, and 0_0000 and 1_0000 are different bit patterns that both mean zero — so `==` has to treat them as equal, which special cases the equality operator forever.",
        },
        {
          kind: "para",
          text: "Ones' complement is better. Negation is just flipping the bits, which is free. But it still has two zeros: +0 is 0000 and −0 is 1111, and both must compare equal to each other. Worse, addition needs a rule that does not exist in ordinary addition. Add 5 and 1 in ones' complement: 0101 + 0001 = 0110, no carry, fine. Add 1 and 1: 0001 + 0001 = 0010, still fine. Now add 1111 (−0) and 0001: you get 1_0000, and you have to notice the carry out of the top and feed it back into the bottom. That is the *end-around carry*, and it is a special case the adder must carry around with it forever.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why two's complement won",
          text: "Two's complement has one zero, and its negation is \"flip the bits and add one\". But the real prize is the third row's property: adding is completely ordinary. There is no magnitude comparison, no second subtractor, no end-around carry, no second zero. The adder you built in chapter 5 handles positives and negatives without being told which is which, because the pattern for a negative number was chosen to make that true.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write the 4-bit sign-and-magnitude pattern for +5 and for −5. Then write the ones' complement pattern for +5 and −5. Then write two's complement for +5. Notice that ones' and two's complement agree for +5 and differ for −5: 1010 versus 1011.",
            "In sign and magnitude, write +0 and −0. Now ask your future self a question: are those two patterns `==` to each other? In a circuit they are two different bit patterns, so a plain equality check says no. Write one sentence saying why that is a problem.",
            "Do the ones' complement end-around carry by hand: add 4'b1111 and 4'b0001 and you get 1_0000. Because there was a carry out of the top, you add that carry back into the low four bits: 0000 + 1 = 0001, which is +1. That extra step is the special case two's complement avoids.",
            "Fill in the missing half of each scheme's range. Sign and magnitude 4 bits: +0 to +7 and −0 to −7. Ones' complement 4 bits: −7 to +7. Two's complement 4 bits: −8 to +7. Write down why only the last one can represent −8.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Sign and magnitude has two zeros. Give one concrete thing that breaks because of it.",
              a: "Equality. +0 is 0_0000 and −0 is 1_0000 — two different bit patterns that both mean zero. A plain `==` on those patterns returns 0, which is false. So the equality operator has to carry a special case forever, and any gate that compares two operands has to handle it too. Two's complement has one zero (0000), so the special case simply never arises.",
            },
            {
              q: "Why does a 4-bit signed value go down to −8 and not −7?",
              a: "Count the values. A signed 4-bit number must be able to hold 16 distinct values, because there are 2⁴ = 16 bit patterns and every value needs its own pattern. 0 and the seven positives 1 to 7 use eight patterns, and the remaining eight go to the negatives: −1 through −8. The range is −2ⁿ⁻¹ to 2ⁿ⁻¹−1, so 4 bits gives −8 to +7. It is not a choice, it is a consequence of the count.",
            },
          ],
        },
      ],
    },
    {
      slug: "twos-complement",
      title: "Invert, then add one",
      lede: "The two-step rule, worked both directions on −5, and the moment it clicks: addition stops caring about signs.",
      blocks: [
        {
          kind: "para",
          text: "The whole representation is one rule. To negate a value: flip every bit, then add one. That is why the name — you are computing the *two's* complement of the number, meaning the two's-complement quantity you must add to cancel it out. The next topics show why that rule makes the adder sign-blind. For now, learn the mechanics cold.",
        },
        {
          kind: "steps",
          title: "Work −5 in 4 bits, in both directions",
          items: [
            {
              head: "Start from the positive",
              body: "+5 in 4 bits is 0101, because 5 = 4 + 1. That part is ordinary binary place value and you already know it.",
              code: "5 = 4'b0101",
            },
            {
              head: "Flip every bit",
              body: "One becomes zero, zero becomes one. 0101 becomes 1010. This is the *ones' complement* of 5, and on its own it is not yet −5.",
              code: "~4'b0101 = 4'b1010",
            },
            {
              head: "Add one",
              body: "1010 + 0001 = 1011. Nothing spills out of four bits, so the answer stays 4 bits. This is −5 in two's complement.",
              code: "4'b1010 + 4'b0001 = 4'b1011",
            },
            {
              head: "Now go the other way",
              body: "You have 1011 and you want the magnitude 5. Subtract one first: 1011 − 0001 = 1010. Then invert every bit: 1010 → 0101, which is 5. The steps are the same two, just in the opposite order — subtract-one, then invert, is the exact undo of invert, then add-one.",
              code: "4'b1011 - 4'b0001 = 4'b1010,  then  ~4'b1010 = 4'b0101",
            },
            {
              head: "Check it the cheap way",
              body: "A number and its negation must cancel to zero. Add 5 and −5: 0101 + 1011 = 1_0000, and the low four bits are 0000. The carry out of the top is thrown away, which is fine, because that is the bit that got traded for the wrap-around. If the two did not sum to zero in four bits, you made an arithmetic slip somewhere.",
              code: "4'b0101 + 4'b1011 = 1_0000  ->  low 4 bits = 4'b0000",
            },
            {
              head: "One number that refuses to behave",
              body: "−8 is 1000, and negating it gives 1000 again. There is no +8 in four bits, so −8 negated is −8. That is not a bug, it is overflow, and chapter section on overflow below explains exactly when it is your fault and when it is the representation's.",
              code: "~4'b1000 + 4'b0001 = 4'b1000",
            },
          ],
        },
        {
          kind: "table",
          head: ["Bits", "Read as unsigned", "Read as signed", "Which is it?"],
          rows: [
            ["4'b0000", "0", "0", "the one and only zero"],
            ["4'b0001", "1", "1", "positive"],
            ["4'b0011", "3", "3", "positive"],
            ["4'b0111", "7", "7", "the largest positive"],
            ["4'b1000", "8", "−8", "negative"],
            ["4'b1011", "11", "−5", "negative"],
            ["4'b1110", "14", "−2", "negative"],
            ["4'b1111", "15", "−1", "the value that trips everybody"],
          ],
          caption:
            "A full table runs 0000 to 1111. The dividing line is 1000: every pattern from 1000 up has its top bit set, and that is what makes it negative.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "The property that makes this standard",
          text: "Two's complement is not popular because it is simple to store. It is popular because of one magic property: the pattern for −b is the pattern for b with the bits flipped and one added, which means **adding a negative number is the exact same operation as adding a positive number**. The adder never learns that a negative was involved. It has one job — add bits and propagate carries — and it does that job for −1 and for +1 with identical hardware. Every other scheme forces a decision point into the arithmetic that two's complement pushes out to the pattern-making step, where it is free.",
        },
        {
          kind: "steps",
          title: "Watch the magic happen: 5 + (−3) = 2",
          items: [
            {
              head: "Write both operands as 4-bit patterns",
              body: "+5 is 0101, straight from place value. −3 needs the rule: +3 is 0011, invert to 1100, add one to get 1101. So −3 is 4'b1101. The two operands on the wire are 0101 and 1101, and nothing about them looks like a sign to the adder.",
              code: "5  = 4'b0101\n-3 = 4'b1101",
            },
            {
              head: "Add column by column, right to left",
              body: "bit 0: 1 + 1 = 0, write 0, carry 1. bit 1: 0 + 0 + 1 = 1, write 1, carry 0. bit 2: 1 + 1 = 2, write 0, carry 1. bit 3: 0 + 1 + 1 = 2, write 0, carry 1. No signs consulted anywhere, no special case, no comparison of magnitudes.",
              code: "  bit:  3  2  1  0\n   5:   0  1  0  1\n  -3:   1  1  0  1\n  ---------------\n       1  0  0  1  0\n         ^          ^\n         |          +- bit 0 = 0 (1+1), carry 1\n         +- carry out, thrown away",
            },
            {
              head: "Keep the low four bits",
              body: "The answer is 0010, which reads as +2. The carry out of the top is the price of the wrap-around and gets discarded — it is the same carry that shows up whenever the true sum does not fit. 5 + (−3) is 2, and the adder that did it has no idea a negative was involved.",
              code: "4'b0101 + 4'b1101 = 1_0010  ->  low 4 bits = 4'b0010 = 2",
            },
          ],
        },
        {
          kind: "code",
          caption: "Negation in a module. One line, and it is a real piece of hardware: an inverter per bit, then the same adder you already wrote.",
          code: `module negator (
  input  wire [3:0] x,
  output wire [3:0] neg
);
  assign neg = ~x + 4'b0001;
endmodule`,
          note: "Read it as a sentence: neg is x with every bit flipped, plus one. Synthesis turns this into four NOT gates and one 4-bit adder. There is no negation gate in hardware, only this.",
        },
        {
          kind: "trap",
          wrong: "Writing −5 as `4'b1010` because you inverted 0101 and stopped there.",
          right: "Invert, then add one: `~4'b0101 + 4'b0001` = `4'b1011`.",
          why: "4'b1010 is the *ones' complement* of 5, not the two's complement. It is a real pattern and it means −6 in two's complement, because 6 inverted is 1010. Mixing the two schemes is easy to do and hard to spot, since the wrong answer is only one off. If you remember nothing else, remember the extra +1.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Negate 2 in 4 bits, following the rule out loud at each step: 0010 → invert → 1101 → add one → 1110. So −2 is 4'b1110.",
            "Go back the other way for 1110: subtract one to get 1101, invert to get 0010, which is +2. Confirm your two answers agree.",
            "Now do −1: start at 0001, invert to 1110, add one to get 1111. Write down that −1 is 4'b1111 — and circle it, because that is the pattern that causes the most damage later in this chapter.",
            "Do +6 and −6: +6 is 0110, so −6 is 1001 + 1 = 1010. Check by adding 0110 + 1010 and confirming you get 1_0000, four zero bits.",
            "Add 4'b1011 (−5) and 4'b0011 (+3) column by column. The low four bits should be 1110, which is −2, and 5 − 3 = 2 but you asked for −2, so the low four bits say −2. Confirm both readings, unsigned and signed, come from the same bits.",
            "Try to break the rule: negate 1000. Write down what you get and explain in one sentence why it comes back unchanged.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "What is −6 in 4-bit two's complement, and what is 4'b1010 as a signed value?",
              a: "−6 is 4'b1010. Start at +6 = 0110, invert to 1001, add one to get 1010. And 4'b1010 read as signed is indeed −6: its top bit is 1, so subtract 16 from the unsigned reading of 10 to get −6. The two answers are the same, which is the check that the rule is right.",
            },
            {
              q: "Using the same 4-bit adder, what does 4'b1001 + 4'b0001 produce, and what does it mean signed and unsigned?",
              a: "4'b1001 + 4'b0001 = 4'b1010 with a carry out of the top. Unsigned that is 9 + 1 = 10. Signed, 4'b1001 is −7, so −7 + 1 = −6, and 4'b1010 read signed is also −6. Same four bits, both readings correct, because 10 − 16 = −6.",
            },
          ],
        },
      ],
    },
    {
      slug: "signed-vs-unsigned",
      title: "The same bits, read two ways",
      lede: "Signedness is not a property of a value. It is a word in a declaration, and it changes how every operator in the expression reads the bits.",
      blocks: [
        {
          kind: "para",
          text: "Here is the sentence to hold on to: **Verilog signals are unsigned unless you say otherwise.** You write `wire [3:0] a` and that is unsigned, full stop. If you want a signed 4-bit signal you add one word, `signed`, in the declaration. That word does not change a single bit on the wire. It changes what the operators do when they look at the bits.",
        },
        {
          kind: "table",
          head: ["You write", "Meaning"],
          rows: [
            ["wire [3:0] a", "4 bits, unsigned — 0 to 15"],
            ["wire signed [3:0] a", "4 bits, signed — −8 to +7"],
            ["input wire signed [7:0] a", "an input port that carries signed data"],
            ["output wire signed [3:0] y", "an output port that carries signed data"],
            ["$signed(x)", "treat the bits of x as signed, for this expression"],
            ["$unsigned(x)", "treat the bits of x as unsigned, for this expression"],
          ],
          caption:
            "The declaration form is permanent for that signal. The `$signed` and `$unsigned` casts are local: they change the reading inside one expression and nothing else.",
        },
        {
          kind: "para",
          text: "The cast forms exist because you often cannot change the declaration. A signal arrives from a port you did not write. A literal needs to be signed inside one particular expression. `$signed` and `$unsigned` are the escape hatches. They do not move bits either — `assign w = $signed(x);` gives you exactly the same bits, just relabelled.",
        },
        {
          kind: "code",
          caption: "Two wires holding identical bits, read two different ways. The only difference is the word `signed`.",
          code: `module two_readings (
  input  wire       [3:0] raw,
  output wire       [3:0] as_unsigned,
  output wire signed [3:0] as_signed
);
  assign as_unsigned = raw;   // 4'b1111 is 15 here
  assign as_signed   = raw;   // 4'b1111 is -1 here
endmodule`,
          note: "Both assignments are wire-for-wire identical. Feed 4'b1111 in and both outputs read 4'b1111. The difference only appears when an operator does the reading, and that is the next topic.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "One unsigned operand makes the whole expression unsigned",
          text: "This is the rule that catches everybody, and it is a standard Verilog rule, not a quirk. If **any** operand of an expression is unsigned, the entire expression is evaluated as unsigned — every operator in it, left to right, no exceptions. So `$signed(a) < b` where `b` is unsigned does not compare two signed numbers. It compares two unsigned ones, and the cast on `a` did nothing. You have to cast the other operand too, or declare both signals signed, before either of them is trustworthy.",
        },
        {
          kind: "trap",
          wrong: "`assign lt = $signed(a) < b;` where `a` is signed and `b` is not.",
          right: "`assign lt = $signed(a) < $signed(b);`, or make both signals signed and write `a < b`.",
          why: "Because `b` is unsigned, the whole comparison is unsigned — the rule in the callout above. The cast on `a` is silently ignored. No warning, no message, just an answer computed with the wrong reading of the same bits. Whenever you cast one side of a comparison, check what the other side is.",
        },
        {
          kind: "trap",
          wrong: "Writing a signed literal like `4'sb0010` to force a signed operand in a comparison.",
          right: "In Verilog-2001 there are no signed literals. Use `$signed(4'b0010)`.",
          why: "The `s` in a base specifier is SystemVerilog, not Verilog-2001, and this chapter's dialect is Verilog-2001. In a Verilog-2001 tool that line is a syntax error rather than a subtle bug, which is at least a loud failure. An unsized decimal literal like `10` is signed, so `1 - 2` is −1 — but as soon as one operand is a sized literal like `4'b0010`, the whole expression goes unsigned again.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Write the full 16-row table: every 4-bit pattern, its unsigned reading, and its signed reading. Check that the two unsigned-only answers are 0 and 15, and that the signed range runs −8 to +7.",
            "Write two module declarations, one with the `signed` keyword and one without, both driving 4'b1111. Write down what value each output has under each. Confirm the bits are identical and only the reading changed.",
            "Now write the *use* of each one: `out1 < out2` where both are unsigned, versus `out1s < out2s` where both are signed. Use 4'b1100 and 4'b0011. Unsigned says 12 is not less than 3; signed says −4 is less than 3. Same comparison, same bits, opposite verdict.",
            "Try to break the rule deliberately: write `$signed(a) < b` with `a` signed and `b` unsigned, and reason out loud about which operand's signedness wins. Then swap and confirm the answer did not change.",
          ],
        },
      ],
    },
    {
      slug: "arithmetic-vs-bitwise",
      title: "Adding numbers and testing bits are different operators",
      lede: "The plus sign carries between positions. The ampersand does not. Choosing the wrong one is a plausible-looking wrong answer.",
      blocks: [
        {
          kind: "para",
          text: "Verilog has two families of operator and they sit right next to each other on the keyboard, which is exactly how the mistake happens. The *arithmetic* operators treat their operands as numbers: they add, subtract, multiply and divide, and they carry or borrow between bit positions. The *bitwise* operators treat their operands as walls of independent bits: every position is computed on its own with no information flowing sideways. A third family, the *logical* operators, collapses each operand to a single truth value first.",
        },
        {
          kind: "table",
          head: ["Operator", "Family", "What it does"],
          rows: [
            ["a + b", "arithmetic", "add the numbers, carrying between positions"],
            ["a - b", "arithmetic", "subtract, borrowing between positions"],
            ["a * b", "arithmetic", "multiply — 4×4 needs an 8-bit answer"],
            ["a / b", "arithmetic", "integer quotient, truncating toward zero"],
            ["a % b", "arithmetic", "remainder, and its sign follows the first operand"],
            ["a & b", "bitwise", "AND each position independently, no carries"],
            ["a | b", "bitwise", "OR each position independently"],
            ["a ^ b", "bitwise", "XOR each position independently"],
            ["~a", "bitwise", "flip every position"],
            ["a && b", "logical", "is a nonzero AND is b nonzero — one bit out"],
            ["a || b", "logical", "is a nonzero OR is b nonzero — one bit out"],
            ["!a", "logical", "is a zero — one bit out"],
          ],
          caption:
            "Single characters operate on every bit and come back the same width. `&&`, `||` and `!` collapse a whole vector to a single bit, and an x anywhere makes their answer x.",
        },
        {
          kind: "code",
          caption: "The same two values through a `+` and through a `&`. The operators differ by one character and the answers have nothing to do with each other.",
          code: `module arith_vs_bitwise (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] sum,
  output wire [3:0] both
);
  assign sum  = a + b;   // 12 + 6 = 18 -> low 4 bits are 0010, carry out 1
  assign both = a & b;   // 1100 & 0110 = 0100
endmodule`,
          note: "Run it with a = 4'b1100 and b = 4'b0110. `sum` comes out 0010 (the top bit of 18 fell off the end) and `both` comes out 0100. Nobody would confuse 18 with 4, which is why the `+`/`&` mix-up is caught the first time you see it — and then forgotten and repeated six months later.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Take a = 4'b1100 and b = 4'b0110 and do all four operations by hand: `+`, `&`, `|`, `^`. Write the 4-bit answer for each.",
            "Do the addition as a column sum with carries, right to left, showing each carry as it happens. The answer's low four bits are 0010 and there was a carry out of the top — 12 + 6 = 18 needs five bits.",
            "Do the AND as a column-by-column table: write each bit of a above each bit of b, compute the result underneath each column, and confirm no carry ever crossed a column boundary. That is the whole difference between the two operators.",
            "Predict which of the four operators would be correct for \"is bit 3 of a high?\" The answer is a bit-test, not any of these four — you would write `a[3]`. Then say which of the four you would use for \"how many are the total\".",
            "Now swap in signed values. With a = 4'b1100 and b = 4'b0110, work out the *signed* result of the addition: −4 + 6 = 2, and confirm the low four bits 0010 read as signed are also 2. This one happens to agree, which is a coincidence and not a rule — try a = 4'b1100, b = 4'b1110 next and see it disagree.",
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "Multiplication and division are honest but expensive",
          text: "`*`, `/` and `%` are not built from a lookup table. Synthesis turns `a * b` into an array of AND gates feeding a chain of adders, and `/` and `%` into a long restoring-division structure that is both wide and slow. All three are legal Verilog, all three produce the right answer, and you should not be shy about them in this track. Just know that a divider in your design is a real chunk of silicon, and that a synthesised `%` is as expensive as a synthesised `/`. If you ever see one of these in a design and it is a surprise, look at the width first — a divider that is eight times wider than it needs to be is eight times worse.",
        },
        {
          kind: "table",
          head: ["You write", "Result", "Notes"],
          rows: [
            ["4'b1100 * 4'b0011", "4'b0100", "4-bit result: −4 × 3 = −12, and −12 needs 5 bits, so it wrapped"],
            ["$signed(4'b1100) * $signed(4'b0011)", "4'b0100", "same bits, same 4-bit answer — the width, not the signedness, cut it"],
            ["7 / 2", "3", "integer division always truncates toward zero, never rounds"],
            ["$signed(4'b1001) / $signed(4'b0010)", "4'b1101", "−7 / 2 is −3, truncated toward zero, not floored to −4"],
            ["$signed(4'b1001) % $signed(4'b0010)", "4'b1111", "−7 remainder 2 is −1; the remainder takes the sign of the first operand"],
            ["a / 0 or a % 0", "all x", "Verilog's honest answer to dividing by zero — guard against it if it can happen"],
          ],
          caption:
            "Note the truncation direction. It is toward zero, matching C: −7 / 2 is −3, not −4. This is a frequent surprise for people arriving from languages that floor.",
        },
        {
          kind: "trap",
          wrong: "`wire [3:0] prod; assign prod = a * b;` with `a` and `b` both 4 bits.",
          right: "`wire [7:0] prod; assign prod = a * b;` — two 4-bit numbers need an 8-bit product.",
          why: "The expression `a * b` works out its own width as the wider of the two operands, which is 4 bits. Two 4-bit values can multiply to anything up to 15 × 15 = 225, and 225 needs 8 bits, so the top half is thrown away. Every width in the statement agrees with every other width, so there is no mismatch to warn about — the answer is simply wrong. Widening the wire is the fix, and the general rule is that a multiply's result needs the sum of the operand widths, not the larger of them.",
        },
        {
          kind: "trap",
          wrong: "`assign prod = (a * b);` — spare parentheses around the whole right-hand side.",
          right: "Write the expression without the redundant outer parentheses, and size the wire so the answer fits.",
          why: "The width of a parenthesised expression is worked out on its own, without the width of the wire it is being assigned to. So `assign p = a * b;` into an 8-bit wire can do an 8-bit multiply, while `assign p = (a * b);` computes the product at the operands' own width of 4 and then widens the already-truncated answer. The two lines look identical and are not. Do not rely on the width of a spare pair of brackets — make the wire wide enough and write the expression plainly.",
        },
        {
          kind: "check",
          items: [
            {
              q: "With a = 4'b0110 (6) and b = 4'b0011 (3), what is `a + b` and what is `a & b`?",
              a: "`a + b` is 4'b1001 (9, with a carry out of the top). `a & b` is 4'b0010. The addition carries: bit 0 is 0+1 = 1, bit 1 is 1+1 = 0 with a carry, bit 2 is 1+0+1 = 0 with a carry, bit 3 is 0+0+1 = 1. The AND has no carry at all: 0110 AND 0011 gives 0010 by comparing each column on its own.",
            },
            {
              q: "What does `$signed(4'b1001) / $signed(4'b0010)` evaluate to, and why not −4?",
              a: "4'b1101, which is −3. Verilog's division truncates toward zero, so −7 / 2 is −3.4 and the fraction is dropped, not rounded down to −4. Languages that *floor* negative division give −4 there, which is why the answer surprises people arriving from Python's // on negatives. If you actually want flooring you have to detect the sign yourself and adjust.",
            },
          ],
        },
      ],
    },
    {
      slug: "sign-extension",
      title: "Moving a signed value into a wider wire",
      lede: "Four new bits appear above your value. What you put in them decides whether the number survives.",
      blocks: [
        {
          kind: "para",
          text: "Widen a signal and you have to fill the new positions with something. For an unsigned value the answer is obvious: zeros, because a positive number with more room above it is still the same number. For a signed value the answer is the sign bit, copied. `4'b1100` is −4, and `8'b0000_1100` is +12 — the same four bits, four bits wider, and a completely different number. `8'b1111_1100` is −4, which is what you wanted. Getting this wrong is the single most common signed bug in practice, because the hardware is happy either way.",
        },
        {
          kind: "analogy",
          text: "It is like writing a number on the end of a line instead of in a box. `1100` in a four-digit box is a specific, bounded thing. `1100` scrawled on the end of a longer line does not shift over — the digits you already wrote still mean what they meant, and the extra line above them changes what the whole thing adds up to. Only a convention saves you, and here the convention is: the new digits take their value from the digit that was already the sign.",
        },
        {
          kind: "code",
          caption: "The same widening, done both ways. One line is right and one is wrong, and they are the same width.",
          code: `module widen (
  input  wire        [3:0] x,
  output wire        [7:0] zero_ext,
  output wire        [7:0] sign_ext
);
  // Wrong for negative x: puts zeros where the sign should spread.
  assign zero_ext = {4'b0000, x};

  // Right: replicate the sign bit x[3] into the four new positions.
  assign sign_ext = {{4{x[3]}}, x};
endmodule`,
          note: "Read `{{4{x[3]}}, x}` out loud: four copies of the bit x[3], then the four bits of x. That is eight bits. The doubled braces are the repetition syntax — the inner braces say \"copy this one bit\", and the 4 in front says how many copies.",
        },
        {
          kind: "table",
          head: ["4-bit input", "As signed", "Zero-extended to 8 bits", "Sign-extended to 8 bits", "Right answer"],
          rows: [
            ["4'b0000", "0", "8'b0000_0000", "8'b0000_0000", "same — 0"],
            ["4'b0011", "+3", "8'b0000_0011", "8'b0000_0011", "same — +3"],
            ["4'b1000", "−8", "8'b0000_1000", "8'b1111_1000", "sign-extended only"],
            ["4'b1011", "−5", "8'b0000_1011", "8'b1111_1011", "sign-extended only"],
            ["4'b1100", "−4", "8'b0000_1100", "8'b1111_1100", "sign-extended only"],
            ["4'b1111", "−1", "8'b0000_1111", "8'b1111_1111", "sign-extended only"],
          ],
          caption:
            "Every negative value is a casualty of zero-extension. Every non-negative one is fine, which is why the bug survives casual testing and only shows up once real data goes negative.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why copying the sign bit is right, in one line of arithmetic",
          text: "For a value of N bits, the signed reading S and the unsigned reading U are related by S = U − 2ᴺ. Take 4'b1100: U = 12, so S = 12 − 16 = −4. Now widen to 8 bits and demand the signed reading still be −4. At 8 bits the rule is S = U − 256, so U has to come out at −4 + 256 = 252. And 252 in eight-bit binary is 1111_1100 — which is exactly the original 1100 with the sign bit 1 copied into the four new positions above it. The rule is not a convention anyone invented; it falls out of the arithmetic.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "What WIDTHEXPAND and WIDTHTRUNC do and do not tell you",
          text: "Verilator's WIDTHEXPAND/WIDTHTRUNC warnings fire when the operands of an arithmetic or bitwise expression disagree on width. It is a *width* detector, not a *signedness* detector. It will catch `assign ext8 = x;` where a 4-bit signal lands in an 8-bit wire, and it will catch a 4-bit operand sitting inside an 8-bit sum. It will **not** catch `{4'b0000, x}` — that concatenation is honestly 8 bits wide, every width agrees, and the circuit is silently wrong for every negative input. And it will not catch a signed/unsigned mismatch at all, because if two signals are both `[3:0]` their widths match perfectly. When no width warning fires and you still suspect a sign problem, the reliable detector is to print the value: `$display(\"a as signed = %0d\", $signed(a));` tells you in one line what a hundred lint messages will not.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Sign-extend 4'b0110 (+6) to 8 bits. The sign bit is 0, so the new bits are all 0: 8'b0000_0110. Then sign-extend 4'b1010 (−6): the sign bit is 1, so 8'b1111_1010. Check the second with the rule from the callout — 8'b1111_1010 is 250 unsigned, and 250 − 256 = −6, which is exactly right.",
            "Widen 4'b1000 (−8) to 16 bits, twice: once with the sign bit and once with zeros. Then confirm the claim from the callout: use S = U − 2ᴺ to show the sign-extended version is still −8. 16 bits means 2¹⁶ = 65536, so U must be −8 + 65536 = 65528, and check that 65528 in binary is 1111_1111_1111_1000.",
            "Take the module above with x = 4'b1111. Write down what zero_ext holds and what it *means* as an unsigned number, then what sign_ext holds and what it means. Which one still represents −1?",
            "Invent the case that a test written only with small positive values cannot catch, and explain in one sentence why the bug would reach production.",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign ext8 = {4'b0000, x};` when `x` holds signed data.",
          right: "`assign ext8 = {{4{x[3]}}, x};`",
          why: "Both lines are 8 bits wide, so nothing complains. The zero-extension only happens to be right when x is non-negative; the moment x is negative you get a large positive number instead. −1 in 4 bits becomes +255 in 8 bits, and every operation downstream is wrong by an amount that grows with the magnitude. The fix is one word: replace the constant zeros with copies of the sign bit.",
        },
        {
          kind: "trap",
          wrong: "Using `>>` to divide a signed value by two: `half = x >> 1;` where x is `signed [7:0]`.",
          right: "`half = x >>> 1;` — the arithmetic shift, which fills the vacated positions with copies of the sign bit.",
          why: "`>>` is a *logical* right shift and fills with zeros. So `4'b1111 >> 1` is `4'b0111`, which is 7, when the value you meant was −1. `>>>` fills the vacated positions with the sign bit, so `4'b1111 >>> 1` is `4'b1111`, still −1. This is sign extension applied to a shift, which is why it belongs in this section. Note the follow-on: −1 >>> 1 is −1, so an arithmetic shift right rounds toward negative infinity, while −1 / 2 truncates toward zero and gives 0. If you are halving a negative number, decide which you want.",
        },
      ],
    },
    {
      slug: "overflow",
      title: "Overflow is not the carry-out",
      lede: "The bit that comes out of the top tells you the sum did not fit. It does not tell you the answer is wrong.",
      blocks: [
        {
          kind: "para",
          text: "Two different questions get confused here, and the toolchain has a wire for each. **Carry-out** asks: did the sum need more bits than the result has? It is a fact about arithmetic, true whether you are looking at the numbers as signed or unsigned. **Overflow** asks: is the result's sign wrong once you read it back as a signed number? It only exists in the signed reading, and it is the one that means your answer is not the answer you asked for.",
        },
        {
          kind: "table",
          head: ["4-bit addition", "Low 4 bits", "Carry-out", "Signed result", "Overflow?"],
          rows: [
            ["0111 + 0001  (7 + 1)", "4'b1000", "1", "−8", "yes — the true answer is 8 and does not fit"],
            ["1111 + 0001  (−1 + 1)", "4'b0000", "1", "0", "no — −1 + 1 is exactly 0"],
            ["1000 + 1111  (−8 + −1)", "4'b0111", "1", "+7", "yes — the true answer is −9 and does not fit"],
            ["0010 + 0101  (2 + 5)", "4'b0111", "0", "+7", "no"],
            ["1100 + 1100  (−4 + −4)", "4'b1000", "0", "−8", "no — exactly the limit"],
            ["0110 + 0001  (6 + 1)", "4'b0111", "0", "+7", "no"],
          ],
          caption:
            "Look down the carry-out column and then down the overflow column. Rows 1 and 2 both carry out, and one overflows while the other does not. That single pair of rows is the whole lesson.",
        },
        {
          kind: "para",
          text: "The rule is one sentence: **overflow happens only when the two operands have the same sign and the result has a different one.** Two positives that sum past the limit come out looking negative. Two negatives that sum past the bottom come out looking positive. Two operands with different signs can never overflow, because the true answer always lies between the two of them and therefore always fits.",
        },
        {
          kind: "code",
          caption: "The overflow flag in one line, straight from that sentence. `sum` here is 4 bits wide, so it is already the truncated answer.",
          code: `module add4 (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire [3:0] sum,
  output wire       carry,
  output wire       ovf
);
  // Widen by one bit so nothing is lost, then take it back apart.
  wire [4:0] full = {1'b0, a} + {1'b0, b};

  assign sum   = full[3:0];              // the low four bits — the answer we can hold
  assign carry = full[4];                // the bit the adder did not have room for
  assign ovf   = (a[3] == b[3]) && (sum[3] != a[3]);
endmodule`,
          note: "Read ovf as a sentence: if a and b agree in sign, and the sum disagrees with them, something did not fit. The `&&` there is the logical form, which is what you want for a condition — a single `&` would compute the same two bits and hand you a one-bit answer sitting inside a wider expression. Note also that carry and ovf are read off two different places: carry is bit 4 of the widened sum, ovf is worked out from the sign bits.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Work all sixteen rows of the 4-bit addition table by hand: for every pair of 4-bit nibbles, write the low four bits, the carry out of the top, and whether signed overflow occurred. Sixteen rows is the entire table for 4-bit signed arithmetic and it is worth doing once.",
            "Take 0111 + 0001 and confirm the three bits: the result is 1000, whose sign bit is 1, and the operands both had sign bit 0. Different sign on the result → overflow. Then read that 1000 as unsigned and notice it is a perfectly correct 8, which is the same addition behaving correctly in the other reading.",
            "Take 1111 + 0001 and confirm the carry-out is 1 but the overflow is 0: the operands had different signs (1 and 0), so the rule can never fire. The result 0000 is right, and the carry-out is telling you about the *unsigned* sum 15 + 1 = 16, which genuinely did not fit.",
            "Find a case where there is no carry-out but there is overflow. Then find one where there is a carry-out and no overflow. Having both in your notes is what stops you from ever conflating them again.",
            "For each of the three rows in the table with overflow, write down the true mathematical answer and confirm it is one step past the representable range: 8 is one past +7, and −9 is one past −8.",
          ],
        },
        {
          kind: "trap",
          wrong: "`assign ovf = carry;` — using the carry-out as the overflow flag.",
          right: "Detect overflow from the sign bits: `(a[3] == b[3]) && (sum[3] != a[3])`.",
          why: "Carry-out means the *unsigned* sum did not fit in the available bits. It fires on 15 + 1 = 16, which is a correct signed result of −1 + 1 = 0 with no signed overflow at all. Conversely a signed overflow always comes with a carry-out, so if you used the carry the flag would be right for the wrong reason on some rows and simply wrong on others. They are different wires. Keep both, if you need both.",
        },
        {
          kind: "check",
          items: [
            {
              q: "4-bit signed addition: 4'b0101 + 4'b0011. Carry out? Signed overflow?",
              a: "Carry out is 0, signed overflow is 1. Add it out: 0101 + 0011 = 1000, and nothing spilled past the top, so the carry-out is 0. But both operands have sign bit 0 and the result has sign bit 1, and by the rule that means overflow. It is right: 5 + 3 = 8, and 8 is one past the largest positive value a 4-bit signed number can hold. Two different answers from the same addition, and that is the point of the section.",
            },
            {
              q: "Can two operands with opposite sign bits produce a signed overflow?",
              a: "No. When the signs differ the true sum lies between the two operands: a positive plus a negative is somewhere in between, so it cannot be past either end of the range. That is why the rule requires the two operand sign bits to be equal. The hardware consequence is that the overflow flag is genuinely a two-operand condition, not something you can get from the result alone.",
            },
          ],
        },
      ],
    },
    {
      slug: "comparison",
      title: "Comparison: where signedness finally bites",
      lede: "Equality is safe. The ordering operators are not, and the wrong answer arrives without a single message.",
      blocks: [
        {
          kind: "para",
          text: "A comparator answers a question about *order*, and order depends on the reading. Is 4'b1100 less than 4'b0011? Unsigned, that is 12 against 3, so no. Signed, it is −4 against 3, so yes. Same bits, same operator, opposite verdict. The `==` operator is the exception: two patterns that represent the same number are `==` under either reading, so equality is safe to leave unsigned. Every operator that establishes an ordering — `<`, `>`, `<=`, `>=` — changes meaning with signedness.",
        },
        {
          kind: "table",
          head: ["Operator", "Answer", "Depends on signedness?"],
          rows: [
            ["a == b", "1 bit: are the two values equal", "no — same answer either way"],
            ["a != b", "1 bit: are they different", "no"],
            ["a < b", "1 bit: is a smaller than b", "yes"],
            ["a > b", "1 bit: is a larger than b", "yes"],
            ["a <= b", "1 bit: is a smaller or equal", "yes"],
            ["a >= b", "1 bit: is a larger or equal", "yes"],
            ["a === b", "1 bit: are the bit patterns identical, x and z included", "no"],
            ["a !== b", "1 bit: are the patterns different, x and z included", "no"],
          ],
          caption:
            "`==` returns x if either side contains an x, because it genuinely cannot decide. `===` never returns x — it compares the four-state patterns as raw bits, so an x matches an x.",
        },
        {
          kind: "table",
          head: ["a", "b", "a unsigned", "b unsigned", "a signed", "b signed", "a < b ?", "a < b signed ?"],
          rows: [
            ["4'b1100", "4'b0011", "12", "3", "−4", "+3", "no (12 > 3)", "yes (−4 < 3)"],
            ["4'b1111", "4'b0001", "15", "1", "−1", "+1", "no (15 > 1)", "yes (−1 < 1)"],
            ["4'b0111", "4'b1000", "7", "8", "+7", "−8", "yes (7 < 8)", "no (+7 > −8)"],
            ["4'b1101", "4'b1110", "13", "14", "−3", "−2", "yes (13 < 14)", "yes (−3 < −2)"],
            ["4'b1111", "4'b1111", "15", "15", "−1", "−1", "no", "no"],
            ["4'b0000", "4'b0000", "0", "0", "0", "0", "no", "no"],
          ],
          caption:
            "Row 4 is the interesting one: both readings agree. When two values have the same sign, the unsigned and signed orderings coincide, which is why a comparator tested only on same-sign pairs looks perfectly correct and then fails in the field.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "The whole trap, in one sentence",
          text: "A comparison between a signed and an unsigned operand is unsigned, and it produces no warning at all — not a WIDTHEXPAND or WIDTHTRUNC warning, not an UNUSEDSIGNAL note, nothing. Your two operands are the same width, so there is no width mismatch to report, and signedness is not something this toolchain lints. Both the result and the failure are silent. The only defences are: declare your signals signed at the interface, and print the values with `$display(\"%0d\", $signed(a))` when something looks wrong.",
        },
        {
          kind: "code",
          caption: "The same three bits compared two ways. This is the whole pset in four lines, and the only difference between the two outputs is the cast.",
          code: `module compare_both (
  input  wire       [3:0] a,
  input  wire       [3:0] b,
  output wire       a_lt_b,   // signed
  output wire       a_gt_b    // unsigned
);
  // Both operands cast, or both signals declared signed.
  assign a_lt_b = ($signed(a) < $signed(b)) ? 1'b1 : 1'b0;
  assign a_gt_b = (a > b) ? 1'b1 : 1'b0;
endmodule`,
          note: "With a = 4'b1100 and b = 4'b0011 the first output is 1 (−4 is less than 3) and the second is 1 (12 is greater than 3). One input pair, two readings, two flags — and no message either way.",
        },
        {
          kind: "trap",
          wrong: "Casting one side of a comparison: `$signed(a) < b` where `b` is unsigned.",
          right: "Cast both sides (`$signed(a) < $signed(b)`) or declare both signals signed.",
          why: "One unsigned operand makes the entire expression unsigned — this is the standard rule, and it applies to relational operators just as it does to arithmetic. The cast on `a` is ignored, the comparison runs on unsigned readings, and you get a confident wrong answer. It is the most-repeated mistake in this chapter because the code looks like it is being careful.",
        },
        {
          kind: "trap",
          wrong: "Comparing a signed expression against an unsized literal: `$signed(a) > 10`.",
          right: "Cast the literal too: `$signed(a) > $signed(10)`, or better, make `a` signed and write `a > 10`.",
          why: "An unsized decimal literal like 10 is signed, so this particular case happens to work. The moment the literal gets a size and a base — `4'd10`, or worse `4'b1010` — it becomes unsigned and drags the whole comparison back to unsigned. Sized literals are the trap because they look like the safest way to write a number and they are the one that flips the reading.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Fill in the signed column of the 4-bit table for all sixteen patterns, writing the top-bit-zero patterns as 0 to +7 and the top-bit-one ones as −8 to −1. You did this in the two's complement topic; do it again now with the ordering in mind, because this time you care which is bigger.",
            "For each of the three opposing rows in the table above, say out loud which reading the `==` operator would use, and confirm it does not matter: two values are equal or they are not, and that is a statement about the number rather than the encoding.",
            "Work all sixteen by sixteen comparisons of `a < b` both ways and mark on a grid which pairs agree and which disagree. Every disagreement should have a or b with its top bit set — that is the only thing that can make the readings diverge.",
            "Find a comparison where `a == b` is false but `a === b` is also false even though the values look the same, by putting an x in one of them. Note that this is a simulation-only concern: real hardware has no x, it has settled 0s and 1s.",
            "Write down the one rule you will put next to your comparison code as a comment, and say why the rule cannot be enforced by the compiler.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "a = 4'b1000, b = 4'b0111, both declared unsigned. What is `a < b`, and what is it if both are declared signed?",
              a: "Unsigned: 8 against 7, so `a < b` is 0 — 8 is larger. Signed: −8 against +7, so `a < b` is 1. This is the single most dramatic case in the whole chapter, because the unsigned answer puts the *smallest* signed value last and the signed answer puts it first. It is the row to write on a sticky note.",
            },
            {
              q: "Why is it safe to write `a == b` without casting, in a comparator that otherwise uses `$signed`?",
              a: "Equality is not an ordering, so the signed reading cannot change the answer. If two values are the same number, they are the same number whether the top bit is a sign or a magnitude. That is why the reference comparators in this track cast the ordering comparisons and leave `==` alone. The one exception to watch is four-state: plain `==` returns x if either side has an x in it, while `===` compares the patterns directly and never does.",
            },
          ],
        },
      ],
    },
    {
      slug: "signed-comparator",
      title: "The Signed Comparator, start to finish",
      lede: "The practice problem, written out, with the two cases that prove it and the ones that catch it.",
      blocks: [
        {
          kind: "para",
          text: "The practice problem is a comparator: two 4-bit inputs in, a verdict out, and the verdict has to be right for negative values. That is the whole specification. Everything from the previous five topics goes into it — the two's complement reading, the declaration, and the rule about one unsigned operand — and nothing else does. Read the whole module first, then take it apart.",
        },
        {
          kind: "code",
          caption: "The signed comparator. Three one-bit flags, and every interesting decision is in the two casts.",
          code: `module top (
  input  wire [3:0] a,
  input  wire [3:0] b,
  output wire       alt,   // a less than b,  signed
  output wire       aeq,   // a equal to b
  output wire       agt    // a greater than b, signed
);
  assign alt = ($signed(a) < $signed(b)) ? 1'b1 : 1'b0;
  assign aeq = (a == b)                   ? 1'b1 : 1'b0;
  assign agt = ($signed(a) > $signed(b)) ? 1'b1 : 1'b0;
endmodule`,
          note: "The two ordering comparisons are cast on both sides. The equality comparison is not cast, because equality does not depend on the reading. If you write `alt` and `agt` without the casts, the design is an unsigned comparator wearing a signed name, and it will pass every same-sign test you throw at it.",
        },
        {
          kind: "table",
          head: ["Flag", "1 when", "Reading it needs"],
          rows: [
            ["alt", "$signed(a) < $signed(b)", "signed, both operands"],
            ["aeq", "a == b", "either — equality is reading-independent"],
            ["agt", "$signed(a) > $signed(b)", "signed, both operands"],
          ],
          caption:
            "The pset expects exactly these three one-bit flags — `top(a, b, alt, aeq, agt)` — and the bench rejects any other port list with 'Wrong number of ports'. There is no two-bit-coded alternative.",
        },
        {
          kind: "steps",
          title: "Trace two cases, one that works and one that catches",
          items: [
            {
              head: "The case you would get right anyway: −3 against −2",
              body: "a = 4'b1101, b = 4'b1110. Signed, that is −3 and −2, and −3 is smaller, so alt = 1. Now read them unsigned: 13 and 14, and 13 is also smaller, so an unsigned comparator would agree. This is the trap's hiding place — same sign, both readings agree, nothing looks wrong.",
            },
            {
              head: "The case that separates them: −4 against +3",
              body: "a = 4'b1100, b = 4'b0011. Signed, that is −4 against 3, and −4 is smaller, so alt = 1 and agt = 0. Unsigned it is 12 against 3, so an unsigned comparator says agt = 1 and alt = 0 — the exact opposite. A design that passes the first case and fails this one is not broken in a subtle way; it is a comparator that thinks −4 is a big number.",
            },
            {
              head: "The case that inverts everything: +7 against −8",
              body: "a = 4'b0111, b = 4'b1000. Signed, +7 against −8, so agt = 1. Unsigned it is 7 against 8, so alt = 1. Here the largest positive value is less than the most negative one under the unsigned reading, which is the clearest demonstration in the whole chapter that unsigned order is not a number line at all.",
            },
            {
              head: "Equality, for completeness",
              body: "a = 4'b1111, b = 4'b1111. aeq = 1 under any reading, and both ordering flags are 0. This is why the equality line is safe to leave uncast — the two values are the same number whichever way you read them.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          title: "The pset wants three flags, not a two-bit code",
          text: "The bench instantiates your module as `top(a, b, alt, aeq, agt)` — two 4-bit inputs and three one-bit flags — and any other port list is rejected with \"Wrong number of ports\". A two-bit-coded output (0 = less, 1 = equal, 2 = greater) carries the same information but does not fit the contract, so do not submit it here. If you want the practice anyway, write it as an exercise and check it against the same two cases above: −4 against +3 must read less, and +7 against −8 must read greater.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (15 minutes)",
          items: [
            "Trace the comparator for all sixteen values of b with a fixed at 4'b1000 (−8). Write down alt, aeq and agt for each. Then check your answers against the number line from −8 to +7: −8 is less than everything except nothing, so aeq only when b is also 4'b1000, and agt never fires at all. If your trace disagrees, find the row where it does.",
            "Do the same trace again as an unsigned comparator, and mark which of the sixteen rows gave a different verdict. Nine of the sixteen should differ, and the seven that agree are exactly the cases where b reads as more than +8 unsigned. Write that sentence down — it is the cleanest statement of the bug you have.",
            "Find the pattern rather than the count: look at the top bits of a and b and work out exactly when the signed and unsigned comparators can ever agree. Then check your rule against one same-sign pair and one opposite-sign pair from the table above.",
            "Write your own comparator from scratch without looking at the code above, then diff it against the version in this topic. Any difference other than signal names is something you decided deliberately — make sure you can say why.",
            "Decide, in writing, where in a real design you would put the `signed` keyword: the port declarations, the internal wires, the literals, and any place a value crosses a module boundary. Then go look at how it is done once in chapter 3 and see if you agree with yourself.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "a = 4'b1000, b = 4'b0111. Your comparator says alt = 1. Which reading did it use, and what is the bug?",
              a: "The unsigned reading. Unsigned, a is 8 and b is 7, so 8 < 7 is false and alt should be 0. Signed, a is −8 and b is +7, so −8 < 7 is true and alt should be 1. An unsigned answer of alt = 1 on this pair means the comparison ran on unsigned values, which in turn means one operand of the comparison was unsigned and dragged the whole expression back with it. The fix is a `$signed` on both sides, or `signed` on both declarations.",
            },
            {
              q: "Why does the reference comparator leave `aeq` uncast while casting the other two?",
              a: "Because equality is not an ordering. Two patterns are `==` when they represent the same number, and they represent the same number whether the top bit is a sign or a magnitude — the reading only decides which direction the number line runs, not where any particular point sits. So `a == b` is correct under either reading and casting it would be noise. The ordering operators are the ones that need the cast, and those are the two lines that have it.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "$signed / $unsigned", meaning: "System functions that reinterpret a value's bits as signed or unsigned inside one expression, without changing a single bit." },
    { term: "arithmetic operator", meaning: "`+`, `-`, `*`, `/` and `%` — they treat operands as numbers and carry or borrow between bit positions." },
    { term: "bitwise operator", meaning: "`&`, `|`, `^` and `~` — they work on each bit position independently, with no carry flowing sideways." },
    { term: "carry-out", meaning: "The bit that leaves the top of an adder because the sum needed more room. A fact about width, not about signs." },
    { term: "comparator", meaning: "A circuit that answers an ordering question about two values, like `a < b`." },
    { term: "most significant bit", meaning: "The highest-index bit, the one with the largest place value — and in a signed value, the sign bit." },
    { term: "negation", meaning: "Flipping a number's sign. In two's complement it is done by inverting every bit and adding one." },
    { term: "overflow", meaning: "The signed result's sign came out wrong, so the true answer did not fit in the bits available." },
    { term: "sign bit", meaning: "The top bit of a signed value: 0 means non-negative, 1 means negative." },
    { term: "sign extension", meaning: "Widening a signed value by filling the new high positions with copies of the sign bit, so the value survives." },
    { term: "signed", meaning: "A declaration that says the top bit is a sign, giving a range from −2ⁿ⁻¹ to 2ⁿ⁻¹−1 instead of 0 to 2ⁿ−1." },
    { term: "two's complement", meaning: "The number system where negation is \"invert the bits and add one\", so ordinary addition handles negatives with no special case." },
    { term: "unsigned", meaning: "The Verilog default: the top bit is just another place value, giving a range of 0 to 2ⁿ−1." },
    { term: "width", meaning: "How many bits a signal has, and therefore how many values it can hold." },
  ],
  nextStep:
    "Everything on this page is preparation for one lesson: Two's Complement. The task there is negation and overflow on a 4-bit signed datapath — invert-and-add-one, the sign bit repeated upward, and a flag that fires when two same-sign operands produce a result that disagrees with them. You have done the arithmetic on paper for all of it here, so the module should be familiar. Read the lesson, then come back to the comparison topic whenever a signed verdict looks wrong, because that one is always a cast you forgot.",
};
