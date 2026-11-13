import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 2,
  chapterSlug: "logic-gates",
  title: "Logic Gates",
  readMinutes: 20,
  youWillBeAbleTo: [
    "Explain what a gate is, and read the seven standard gate symbols",
    "Write any of the seven gates as a continuous assignment with `assign`",
    "Write the same gate as a primitive, with the output pin listed first every time",
    "Name the internal wires between gates, and recognise the IMPLICIT warning when you forget",
    "Turn a NOT into a single NAND by tying the two inputs to the same wire",
    "Derive an XOR from four NAND gates and prove it on all four input rows",
    "Rebuild any of the seven gates out of NANDs only, which is what the problem set asks for",
  ],
  mentalModel: [
    {
      title: "A gate is one rule about one wire",
      body: "Take a light switch. Now take a second one, and wire a small box so the box's output is high only when both switches are high. That box is an AND gate. Swap the rule to \"high when either switch is high\" and it is an OR gate. Invert the output and it is a NAND. That is the whole idea: a gate is a box with input pins, one output pin, and a fixed rule for what the output is given the inputs. The rule never changes, never depends on time, and never remembers anything — it answers the same way every single time. Engineers draw these boxes as shapes so a whole circuit can be read at a glance, and that shape drawing is called a schematic (a circuit diagram). Verilog gives you the same boxes in text, and this chapter is about the two ways to type one.",
    },
    {
      title: "Two spellings, one piece of hardware",
      body: "The same AND can be written as a sentence — `assign y = a & b;` — or as a box in a list — `and g1(y, a, b);`. The first is called dataflow modelling: you state the equation and let the tool choose the gate. The second is called structural modelling: you name each gate and say how it is wired to the others. Both compile to the identical circuit. The choice is not about correctness, it is about which description you want to be reading later — the equation, or the schematic. Most real designs mix them: `assign` for the leaves where the formula is obvious, primitives where you want the gate count and shape under your control.",
    },
    {
      title: "One gate type is enough to build everything",
      body: "Seven gates sounds like seven different things to learn. It is really one. A NAND can be told to behave as a NOT by giving it the same wire twice. Two NANDs make an AND. Three make an OR. Four make an XOR. A gate type with this property is called universal: with a pile of it and nothing else, you can build any function you can write down. This is not a curiosity — real integrated circuits are built almost entirely from one gate type, because one type means one shape on the wafer, laid out in repeating rows, which is far cheaper to manufacture. The second half of this chapter is the proof, and the problem set is the exercise.",
    },
  ],
  topics: [
    {
      slug: "what-a-gate-is",
      title: "A gate is one rule about one wire",
      lede: "Before any syntax: a gate is a small box with input pins, one output pin, and a rule that never changes.",
      blocks: [
        {
          kind: "analogy",
          text: "A doorbell. Two switches, and a rule: ring when both are pressed. Press the first — nothing. Press the second — nothing. Press both — it rings. The box between the switches and the bell is the gate. Nobody has to shout at the bell, and nobody has to remember whether it rang last time. The rule is fixed in the wiring. That is the same thing a logic gate does, with the sound replaced by a voltage.",
        },
        {
          kind: "para",
          text: "A gate has input pins (wires that bring values in) and exactly one output pin (the wire it pushes a value onto). It has no clock, no state, and no memory. That combination has a name: the gate is *combinational*, meaning its output depends only on its inputs right now. Change an input and the output follows. There is nothing else a gate can do. Everything in this chapter — the symbols, the seven types, the NAND trick — is a variation on that single sentence.",
        },
        {
          kind: "define",
          items: [
            { term: "gate", meaning: "A small piece of hardware with input pins, one output pin, and a fixed rule for the output." },
            { term: "input pin", meaning: "A wire that brings a value into the gate. Read only, from the gate's point of view." },
            { term: "output pin", meaning: "The single wire the gate drives. Always exactly one per gate, except for the special two-output buffer form." },
            { term: "bubble", meaning: "The little circle drawn on a gate's output in a schematic. It means the output is inverted." },
            { term: "schematic", meaning: "A circuit drawn as a picture of gate shapes joined by lines. The shape tells you the rule." },
            { term: "combinational", meaning: "Describes logic whose output depends only on its current inputs, with no memory of the past." },
          ],
        },
        {
          kind: "code",
          caption:
            "A whole module, first. Two rules about two inputs, written as an AND and as a NAND.",
          code: `module top (
  input  wire a,
  input  wire b,
  output wire y_and,
  output wire y_nand
);
  assign y_and  = a & b;
  assign y_nand = ~(a & b);
endmodule`,
          note: "There is nothing in there you cannot read: `wire` makes a plain connection, `assign` says what the output equals, and the trailing semicolon ends the statement. Two outputs, two separate rules, two separate wires. That is the shape of every small module in this chapter.",
        },
        {
          kind: "steps",
          title: "Read that module line by line",
          items: [
            {
              head: "`module top (`",
              body: "Opens the box and names it `top`. `top` is a convention, not a keyword — it means \"the module the testbench instantiates at the very top\".",
            },
            {
              head: "`input wire a,` and `input wire b,`",
              body: "Two incoming pins, one bit each. `wire` says these are plain connections, not storage. A pin with no bit range is exactly 1 bit wide.",
            },
            {
              head: "`output wire y_and,` and `output wire y_nand`",
              body: "Two outgoing pins. The names are just labels — nothing yet says what they hold. That is the next line's job.",
            },
            {
              head: "`assign y_and = a & b;`",
              body: "The rule for the first output: y_and is 1 when a and b are both 1. The `&` is the AND operator. `assign` is a standing rule, not a one-time action, so the output follows its inputs automatically.",
            },
            {
              head: "`assign y_nand = ~(a & b);`",
              body: "The rule for the second output: compute a AND b, then flip it with `~`. AND with an inverted output is the NAND gate. Note the parentheses — they are what stop `~` applying to `a` alone.",
            },
            {
              head: "`endmodule`",
              body: "Closes the box. Nothing drives `y_and` and `y_nand` twice, nothing is left dangling, and the whole design is complete.",
            },
          ],
        },
        {
          kind: "points",
          title: "Three facts that hold for every gate in this chapter",
          items: [
            "One output pin. A gate produces one value. If you want two values, you need two gates.",
            "No memory. The answer depends on the inputs now and only on the inputs now.",
            "Instant. There is no delay, no clock and no order of evaluation — a gate is always answering.",
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw the four input combinations in a column: a=0 b=0, a=0 b=1, a=1 b=0, a=1 b=1.",
            "Fill in `y_and` for each row using the rule \"1 only when both are 1\". You should get 0, 0, 0, 1.",
            "Fill in `y_nand` for the same rows. Every row should be the opposite of `y_and`: 1, 1, 1, 0.",
            "Count how many 1s each output has. `y_and` has one row that is 1. `y_nand` has one row that is 0.",
            "Write the sentence \"y_nand is 1 unless both inputs are 1.\" That is the NAND rule in English, and it is the version you will actually remember.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Why can a gate never be \"waiting\" for something?",
              a: "Because a gate has no memory. It is combinational: the output is a function of the inputs at this instant, with nothing carried over from before. The instant an input changes, the rule is reapplied and the output is whatever the rule says for the new combination. There is no place to store a past value, so there is nothing to wait with.",
            },
            {
              q: "You want a circuit that is 1 only when a and b are both 1. How many outputs does it have, and which gate is it?",
              a: "One output, and it is an AND gate — `assign y = a & b;`. A gate produces exactly one value, so a single AND covers this. The number of outputs is fixed by the specification (one signal called y), not by the gate.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-seven-gates",
      title: "The seven gates, and what each one does",
      lede: "One complete reference: for every gate, the shape, the expression, the primitive name, and all four output rows.",
      blocks: [
        {
          kind: "para",
          text: "There are seven standard gates. Five of them are independent rules, and two are just one of those rules with the output flipped — which is why the little circle on a schematic is such a useful thing to recognise. You met truth tables in chapter 1; this section gives you the complete table for this chapter's gates, in one place, so you never have to reconstruct it from memory.",
        },
        {
          kind: "table",
          head: ["Gate", "What its shape looks like", "As an expression", "As a primitive"],
          rows: [
            ["AND", "Flat left edge, rounded right edge — like a D", "a & b", "and g(y, a, b);"],
            ["OR", "Curved input edge, pointed output edge", "a | b", "or g(y, a, b);"],
            ["NOT", "A triangle, no bubble", "~a", "not g(y, a);"],
            ["NAND", "AND shape with a bubble on the output", "~(a & b)", "nand g(y, a, b);"],
            ["NOR", "OR shape with a bubble on the output", "~(a | b)", "nor g(y, a, b);"],
            ["XOR", "OR shape with an extra curved line at the input", "a ^ b", "xor g(y, a, b);"],
            ["XNOR", "XOR shape with a bubble on the output", "~(a ^ b)", "xnor g(y, a, b);"],
          ],
          caption:
            "Five base rules (AND, OR, NOT, XOR and their inverses). The bubble is the whole trick: NAND is a bubbled AND, NOR is a bubbled OR, XNOR is a bubbled XOR. Read the shape and you know the rule without looking it up.",
        },
        {
          kind: "table",
          head: ["a", "b", "AND", "OR", "NOT a", "NAND", "NOR", "XOR", "XNOR"],
          rows: [
            ["0", "0", "0", "0", "1", "1", "1", "0", "1"],
            ["0", "1", "0", "1", "1", "1", "0", "1", "0"],
            ["1", "0", "0", "1", "0", "1", "0", "1", "0"],
            ["1", "1", "1", "1", "0", "0", "0", "0", "1"],
          ],
          caption:
            "Every gate, every row. Four input combinations cover the whole space, exactly as in chapter 1. Check the NOT column against `a` only — that column ignores `b` completely, which is the mistake people make most often on this table.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "The bubble is a promise, not a decoration",
          text: "A bubble on the output means exactly one thing: the output is the inverse of what the shape would give. AND with a bubble is NAND — 0 only when both inputs are 1. That is also the same thing as \"0 when both are 1, 1 otherwise\", and the two phrasings are worth knowing separately, because NANDs are easier to recognise by their single zero row. When you meet an unfamiliar gate, look for the bubble first: it tells you how many 0 rows the truth table has.",
        },
        {
          kind: "para",
          text: "Two of these deserve a sentence each, because their names are misleading. **XOR** is short for exclusive OR, and *exclusive* means \"but not both\". The XOR output is 1 when the inputs differ, and that includes 0,1 and 1,0 but not 1,1. **XNOR** is the exact opposite: 1 when the inputs are the same, which makes it the natural \"are these equal?\" gate. Both are the gates you will use most after this chapter — XOR for parity and for selecting between two values, XNOR for comparisons.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Cover the truth table with your hand. From memory, write the four rows of the AND column. Then OR, then XOR. Uncover and check. The three you will get right fastest are AND, OR and XOR.",
            "Now cover the expressions and rebuild them from the rules: \"1 only when both are 1\" is `a & b`; \"1 when either is 1\" is `a | b`; \"1 when they differ\" is `a ^ b`.",
            "Write the rule for NAND and NOR as English sentences, then translate each back to an expression. \"0 only when both are 1\" is `~(a & b)`. \"0 only when both are 0\" is `~(a | b)`.",
            "Find the single row where NAND is 0, and write down which inputs produce it. That row is the identity of the gate: everything else is 1.",
            "Do the same for NOR: find its single 0 row. Then notice that NAND and NOR are exact opposites on every row.",
            "Finally, fill in the XNOR column by reading the XNOR rule aloud, not by pattern-matching the other columns. \"1 when a and b are equal\" gives you 1, 0, 0, 1.",
          ],
        },
        {
          kind: "trap",
          wrong: "Reading the NOT column as if it depended on both inputs, and predicting 0 for the first row because a=0.",
          right: "NOT only ever looks at its one input. For a=0 the answer is 1, in both of the rows where a=0.",
          why: "The NOT column is duplicated down the table (1, 1, 0, 0) precisely because `b` is irrelevant to it. If you expect the column to change when `b` changes, you will mispredict two rows out of four and start doubting the tool instead of your reading. Say the rule out loud: NOT flips a, and nothing else.",
        },
        {
          kind: "trap",
          wrong: "`assign y = a & ~b;` when you meant NAND — forgetting the parentheses around the AND.",
          right: "`assign y = ~(a & b);`",
          why: "`~` binds to the nearest value, so `a & ~b` means \"a AND (NOT b)\", not \"NOT (a AND b)\". Those are different functions with different truth tables, and the first is a perfectly reasonable gate that you did not ask for. Any time you invert a compound expression, wrap it: `~( ... )`.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Write the expression for a gate that is 1 when a and b are different, and 0 when they are the same. What is its truth table?",
              a: "XOR, written `a ^ b`. The table is 0,0 → 0; 0,1 → 1; 1,0 → 1; 1,1 → 0. It is 1 exactly when the two inputs differ, so only the second and third rows are 1 — the two rows where they disagree.",
            },
            {
              q: "How many rows in the table above are 0 for NAND? Which one?",
              a: "Exactly one: the row where a=1 and b=1. NAND is 0 only when both inputs are 1, and 1 in all three other rows. That single-zero-row pattern is the fastest way to recognise a NAND in a schematic.",
            },
            {
              q: "You need a gate that outputs 1 when two 1-bit values are equal. Which one, and how do you write it?",
              a: "XNOR, written `~(a ^ b)` as an expression or `xnor g(y, a, b);` as a primitive. Its table is 1, 0, 0, 1 — 1 for the two rows where a and b match. If your inputs are wider than one bit you would write `~^(a ^ b)` instead, where `^` applies bit by bit; that is chapter 3's business.",
            },
          ],
        },
      ],
    },
    {
      slug: "gate-primitives",
      title: "Drawing the gate: primitive syntax and the output-first rule",
      lede: "A gate primitive is a gate type and a list of pins — and the pins go output first, every time.",
      blocks: [
        {
          kind: "para",
          text: "Chapter 1 wrote gates as expressions. Verilog has a second way: a *gate primitive*. A primitive is a statement that names a gate type and lists the wires it joins together. It reads like a line in a parts list, and the tool builds exactly that gate. This is the style you use when you care about the shape of the circuit — how many gates, what kind, wired to what.",
        },
        {
          kind: "code",
          caption: "One NAND written as an expression, one primitive, and one NOT primitive.",
          code: `module top (
  input  wire a,
  input  wire b,
  output wire y,
  output wire y_not
);
  // 1. As an expression, the way you have been writing it.
  assign y = ~(a & b);

  // 2. As a primitive, output first then inputs. This is a second
  //    spelling of line 1, not a second driver. Keep one or the
  //    other — a net takes exactly one driver.
  // nand g1(y, a, b);

  // 3. NOT, as a primitive: one output pin, one input pin.
  not g2(y_not, a);
endmodule`,
          note: "Look at `not g2(y_not, a);` and at the commented-out `nand g1(y, a, b);`. A primitive is three things in order: the gate type, a name for this particular gate, then the pin list. In that pin list the first pin is the output — the wire the gate drives — and everything after it is an input.",
        },
        {
          kind: "table",
          head: ["Part of the line", "In `nand g1(y, a, b);`", "What it is"],
          rows: [
            ["gate type", "nand", "Which gate to build. One of and, or, not, nand, nor, xor, xnor, buf."],
            ["instance name", "g1", "A name for this one gate, so you can point at it in a waveform or a report. Optional in Verilog, but always write it here."],
            ["first pin", "y", "The OUTPUT. The net this gate drives."],
            ["remaining pins", "a, b", "The INPUTS, in any order. AND and OR do not care which is which."],
            ["parentheses", "( ... )", "Enclose the whole pin list."],
            ["semicolon", ";", "Ends the statement, like any other Verilog line."],
          ],
          caption:
            "One primitive, one line, one gate. If you remember nothing else about primitives, remember the row order: type, name, output, inputs.",
        },
        {
          kind: "steps",
          title: "Read `nand g2(n2, a, n1);` one piece at a time",
          items: [
            {
              head: "`nand`",
              body: "Build a NAND gate. The keyword comes first, always, because it is what tells the tool which physical gate to place.",
            },
            {
              head: "`g2`",
              body: "This gate's name. Every gate in a module needs its own name, and reusing one is not allowed by the language standard even though the tools in this workspace may not catch it. Numbering them g1, g2, g3 in wiring order makes a netlist readable top to bottom.",
            },
            {
              head: "(`n2, a, n1`)",
              body: "The pins. The first, `n2`, is the output net this gate drives. `a` and `n1` are its two inputs. The order of the two inputs does not matter for a NAND — NAND(a, b) and NAND(b, a) are the same gate.",
            },
            {
              head: "`) ;`",
              body: "Close the list, end the statement. A missing semicolon here is reported at the *next* line, which is why a single forgotten semicolon can produce a baffling error message three lines further down.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the output has to be first",
          text: "The output is not a value the gate computes and then sends somewhere — it is a wire the gate *drives*, continuously, forever. So the tool has to know which wire to attach the gate's driving end to before it can do anything else with the list. Putting the output last would mean guessing. Verilog solves this the blunt way: the first pin is the output, always, for every gate primitive, with one exception you will meet much later (the two-output buffer form). This is the single most-missed rule in the whole chapter, and it is worth memorising rather than looking up.",
        },
        {
          kind: "doThis",
          title: "The output-first drill (5 minutes)",
          items: [
            "Write four primitives for a 2-input AND, each with a different output-first pin order, so you see the list is not fixed: `and g1(y, a, b);`, `and g2(y, b, a);`, and two more of your own. All four describe the same gate.",
            "Now write the WRONG version, with the output last: `and g3(a, b, y);`. Predict what the tool will say. Then run Verilator on it and read the message. It reports ASSIGNIN — assigning to an input — because the gate is now trying to push a value onto `a`, which is an input pin and cannot be driven from inside the module.",
            "Write `not g4(y, a);` and then, on purpose, `not g5(y, a, a);`. Predict what breaks before you run it. A NOT takes exactly one input, so the second `a` is read as a second *output* — and the same ASSIGNIN error appears. This is output-first biting you in the opposite direction.",
            "Write a 3-input AND: `and g6(y, a, b, c);`. Check what it means — one gate whose output is a AND b AND c, not three gates. Primitives take as many inputs as you give them.",
            "Write the same 3-input AND as a chain of two 2-input gates, using a new wire: `wire t; and g7(t, a, b); and g8(y, t, c);`. Both versions compute a AND b AND c. Count the gates in each and note that the single primitive is the cheaper one.",
          ],
        },
        {
          kind: "trap",
          wrong: "`and g(a, b, y);` — writing the pins in the order you would say the sentence out loud.",
          right: "`and g(y, a, b);` — output first, then the inputs.",
          why: "Verilog has no way to mark which pin is the output, so it takes the first one. Put the output last and the gate becomes a driver on `a`, which is an input. Verilator stops the build with ASSIGNIN and points at the first pin. It is a loud error, which is a gift — but the fix is not obvious to a beginner, because the message is about inputs rather than about pin order.",
        },
        {
          kind: "trap",
          wrong: "`nand g1(y, a, b); nand g1(y2, a, b);` — the same instance name twice.",
          right: "Give every gate its own name: `g1`, `g2`, `g3`, and so on.",
          why: "The instance name identifies a particular gate. Two gates sharing one name means there is no way to say which one a waveform trace or an error message refers to. The language standard requires unique names within a module; the linter in this workspace happens not to complain, so this one is on you to police. Numbering in wiring order also makes the netlist readable.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You want a gate whose output is 1 when a, b and c are all 1. Write it as a primitive.",
              a: "`and g1(y, a, b, c);` — a single 3-input AND gate. Primitives take any number of inputs; the extra pins after the output are all treated as inputs, and the rule becomes a AND b AND c. The alternative, two chained 2-input gates with a wire between them, computes the same function with one more gate.",
            },
            {
              q: "In `xor g9(y, a, b);`, which pin is the output, and what happens if you swap it with `a`?",
              a: "`y` is the output because it is the first pin. If you write `xor g9(a, y, b);` the gate tries to drive `a`, which is an input, and Verilator reports ASSIGNIN on `a`. The rule is positional, not annotated: position is the only thing telling the tool which pin is the source.",
            },
          ],
        },
      ],
    },
    {
      slug: "dataflow-and-structural",
      title: "Two spellings of the same circuit",
      lede: "Dataflow writes the equation. Structural writes the gate list. Both produce identical hardware.",
      blocks: [
        {
          kind: "para",
          text: "Put the two styles side by side and the difference is obvious. Dataflow says what the output *is*. Structural says what the circuit *is*. `assign y = ~(a & b);` is a sentence. `nand g1(y, a, b);` is a parts list. Hand both to the tool and you get one NAND gate either way, wired to the same net. There is no third option that is more correct.",
        },
        {
          kind: "code",
          caption: "The same function, twice, in two separate modules. Compile either one and you have the same circuit.",
          code: `// Dataflow: the equation is the description.
module dataflow (
  input  wire a,
  input  wire b,
  output wire y
);
  assign y = ~(a & b);
endmodule

// Structural: the gate list is the description.
module structural (
  input  wire a,
  input  wire b,
  output wire y
);
  nand g1(y, a, b);
endmodule`,
          note: "Both modules have identical interfaces, so the same testbench drives both. The structural one names the gate (`g1`) and the dataflow one has nothing to name — it has no individual gate, just a rule.",
        },
        {
          kind: "table",
          head: ["", "Dataflow (`assign`)", "Structural (primitives)"],
          rows: [
            ["What you write", "The Boolean equation", "A list of gates and their wiring"],
            ["Describes", "The function", "The circuit"],
            ["Shows gate count", "No — the tool chooses", "Yes, one line per gate"],
            ["Shows intermediate wires", "No — intermediate terms are anonymous", "Yes — you name them"],
            ["Easier to change the function", "Much easier: edit one expression", "Harder: re-plan the network"],
            ["Easier to read as a schematic", "No", "Yes"],
            ["When to reach for it", "The logic is a simple formula", "The shape matters, or you are building from NANDs"],
          ],
          caption:
            "Neither style is better. They are two descriptions of one circuit, and the choice is about which one you would rather be reading in six months.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Mixing is normal, driving twice is not",
          text: "A real module routinely uses both: `assign` for the simple leaves, primitives for the part where gate count matters. The single rule is that a net gets exactly one driver. Two `assign`s on one wire, or an `assign` and a primitive on the same wire, means two things pushing against each other.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Write the dataflow version of \"1 when both inputs are 1\": `assign y = a & b;`. Write the structural version: `and g1(y, a, b);`. Put them next to each other and count the pieces each one has — one line, or one line. Now write the NAND of the same function each way and count again.",
            "Now write a three-gate function, `y = (a & b) | (c & d)`, in dataflow. It is one line. Write it structurally, allowing yourself any gate type. How many lines? How many extra wires do you have to invent names for?",
            "Count the gates in the two versions. If they differ, the tool chose a different implementation — note that, and remember it is allowed.",
            "Decide, for each of the two versions, which one you could debug faster if the circuit behaved wrongly. There is no right answer; the point is that the choice is a real one with real consequences.",
          ],
        },
        {
          kind: "trap",
          wrong: "Leaving both spellings in the module at once — `assign y = ~(a & b);` and `nand g1(y, a, b);` — and expecting one of them to win.",
          right: "Pick one. Comment the other out, or delete it.",
          why: "A net takes one driver. Two of them is a genuine design error, and it is a quiet one: Verilator does not warn here, it simply keeps one driver and gives you that one's answer, which can be the wrong one. This is why the textbook example always shows the second spelling commented out — the two lines are alternatives, never a pair.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You must build an XOR from exactly four NAND gates, and the reader should be able to count them. Which style do you use, and why?",
              a: "Structural, because the structural style shows one line per gate, so the four are visible and countable. A dataflow `assign y = a ^ b;` is a single line that is functionally identical, but it hides the gate count completely — the tool picks an implementation, and you have no way to show it came from four NANDs.",
            },
            {
              q: "A colleague says `assign` is \"just a shorthand for a primitive\". What is wrong with that?",
              a: "It is backwards. `assign` is not a shortcut for a primitive; the tool converts your `assign` into primitives and gates for you. Sometimes a 1-to-1 gate, sometimes something more elaborate — a three-input AND written as `assign y = a & b & c;` may become a small tree of 2-input gates, because that is cheaper to lay out. Writing the primitive yourself is how you pin the implementation down.",
            },
          ],
        },
      ],
    },
    {
      slug: "intermediate-nets",
      title: "The wires between the gates",
      lede: "Structural style needs names for its internal connections, and forgetting to declare one is exactly what IMPLICIT means.",
      blocks: [
        {
          kind: "para",
          text: "The moment you write more than one primitive, you need somewhere for the first gate's output to live before the second gate reads it. That somewhere is an internal net — a wire that exists only inside the module and is never a port. It needs a name, and the name needs a declaration, in a `wire` statement, before the primitives that use it.",
        },
        {
          kind: "code",
          caption: "Three NANDs building an OR, with the two internal nets declared first.",
          code: `module top (
  input  wire a,
  input  wire b,
  output wire y
);
  // Declare every internal net here, in one place.
  wire a_n, b_n;

  nand g1(a_n, a, a);
  nand g2(b_n, b, b);
  nand g3(y,   a_n, b_n);
endmodule`,
          note: "The `wire a_n, b_n;` line is the whole subject of this topic. Ports are declared in the port list; internal nets are declared in the body. Any net a primitive drives that is not a port must be a `wire` you wrote down first. As a bonus, this network is an OR: a NAND of two inverted inputs gives you a + b.",
        },
        {
          kind: "points",
          title: "What IMPLICIT literally says",
          items: [
            "The full message is: Signal definition not found, creating implicitly: 'a_n'.",
            "It means the tool found a name it had never seen before and guessed what it was, rather than stopping.",
            "The guess is always a 1-bit wire, because that is the default. A net you meant to be 4 bits silently becomes 1 bit, and the width of everything downstream changes with it.",
            "Treat it as an error. It is a missing `wire` declaration that you have not noticed yet.",
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why Verilog guesses at all",
          text: "For historical reasons, the language's default setting creates an undeclared name as a 1-bit wire instead of complaining. That is why IMPLICIT is a warning rather than an error, and why it appears at all in a tool this strict. The feature is occasionally convenient in a testbench and is essentially never what you want in a design. Declaring every net explicitly costs one line and removes a whole class of silent width bugs.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take the module above and delete the `wire a_n, b_n;` line. Predict the two Verilator messages that appear. They are IMPLICIT on `a_n` and IMPLICIT on `b_n`, one per name — the tool keeps working, it just warns each time it invents something. This module still computes OR correctly, because both nets really are 1 bit. That is the trap: an implicit net is very often harmless right up until the day it was supposed to be four bits wide.",
            "Now the destructive version: add a fifth gate, `nand g4(y2, a, n3);`, where `n3` is a name you never declared and never drive. The tool invents it, nothing pushes a value onto it, so it sits at `x` for the whole simulation and `y2` is meaningless. An undriven net is exactly what the UNDRIVEN warning names; here the tool invents the net before it gets the chance to say so.",
            "Count the nets in the module as written: two inputs, one output, two internal. Write the count down. The number of `wire` declarations you need is the number of internal connections, and nothing more.",
            "Try declaring an internal net in the port list by mistake, as a port that nothing outside connects to. Notice that this is legal and produces a different warning — the port is unused rather than implicitly created. Internal nets do not belong in the port list.",
          ],
        },
        {
          kind: "trap",
          wrong: "Using an internal net without declaring it, and letting the tool invent a 1-bit wire.",
          right: "Declare every internal net in a `wire` statement before the first primitive that mentions it.",
          why: "IMPLICIT tells you exactly what happened: the tool found a name it did not know and guessed. The guess is a 1-bit wire, and a guess is not a design decision. If you had meant a 4-bit net, the tool would have made it 1 bit and every downstream width would be wrong, with only an informational warning to tell you.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You write `nand g1(n1, a, b);` inside a module with no `wire n1;` anywhere. What happens, and is the design broken?",
              a: "Verilator warns IMPLICIT — signal definition not found, creating implicitly 'n1' — and creates a 1-bit wire for you. The design happens to still work in this case, because n1 is genuinely one bit. But the warning means you did not say what you meant, and the same mistake on a 4-bit net silently makes it 1 bit wide.",
            },
            {
              q: "Where do internal nets get declared, and how many do you need for a network of four gates?",
              a: "In the module body, in a `wire` statement, before the primitives that use them. The number you need is one per internal connection — that is, one per gate output that is not itself a module output. Four gates chained in a line have three internal connections, so three names.",
            },
          ],
        },
      ],
    },
    {
      slug: "not-from-nand",
      title: "A NOT out of a single NAND",
      lede: "Tie both inputs to the same wire and one gate inverts a signal. It is the first step towards NAND universality.",
      blocks: [
        {
          kind: "analogy",
          text: "A NAND answers \"are both these switches on?\" and then flips the answer. If you hand it the *same* switch twice, you have asked it a question with only one switch in it. \"Are both these on?\" becomes \"is this on?\", and flipping that gives you the opposite of the switch. Same box, one new behaviour, no new part.",
        },
        {
          kind: "code",
          caption: "Three ways to say NOT. The third one is a NAND doing the job by itself.",
          code: `module top (
  input  wire a,
  output wire y_op,
  output wire y_prim,
  output wire y_nand
);
  assign   y_op   = ~a;        // as an expression
  not      g1(y_prim, a);      // as a primitive
  nand     g2(y_nand, a, a);   // as a NAND with both inputs tied together
endmodule`,
          note: "Look closely at `g2`. Both input pins are the same net, `a`. That is not a mistake and not a trick that only works in simulation — it is a real wire, the same one feeding both pins. A silicon NAND with both inputs on the same net is a perfectly ordinary inverter.",
        },
        {
          kind: "steps",
          title: "Prove it on paper, one row at a time",
          items: [
            {
              head: "Write what a NAND computes",
              body: "NAND of two inputs is 1 except when both are 1. In symbols: `~(a & b)`.",
            },
            {
              head: "Now substitute b with a",
              body: "Replace the second input with the first, because that is what tying them together means. The expression becomes `~(a & a)`.",
            },
            {
              head: "Simplify the inside",
              body: "`a & a` is just `a`. A signal ANDed with itself is that signal: it is 1 when a is 1, and 0 when a is 0. Nothing changes.",
            },
            {
              head: "Invert it",
              body: "So `~(a & a)` is `~a`. One NAND, one input named twice, and the output is the inverse of that input. That is the whole proof — it is the same proof for a and for b, so it works for every input value.",
            },
          ],
        },
        {
          kind: "table",
          head: ["a", "a", "a & a", "NAND out"],
          rows: [
            ["0", "0", "0", "1"],
            ["1", "1", "1", "0"],
          ],
          caption:
            "Only two rows, because both input pins are the same signal. The output column is `~a` in both. Two gates in one: the AND inside the NAND, and the inversion on its output.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The general pattern",
          text: "Any gate with two identical inputs collapses to something simpler. AND with a tied pair is a buffer. OR with a tied pair is a buffer. XOR with a tied pair is always 0, because a signal never differs from itself. The NAND case is the one people remember, because it turns a gate you may not have into a gate you do have.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Confirm the table above. Then write the two-input truth table for `~(a & a)` pretending a and b are separate, and check that the b column does not change the answer in any row.",
            "Turn the NAND into an AND the same way. Take `nand g1(t, a, b); nand g2(y, t, t);` and work out what y is. First NAND gives t = `~(a & b)`; second NAND with t twice gives `~(t & t)` = `~t` = `a & b`. Two NANDs, one AND. Write out all four rows to confirm.",
            "Now do OR, and notice the shape is different. Take `nand g1(a_n, a, a); nand g2(b_n, b, b); nand g3(y, a_n, b_n);`. The first two are tied-input NOTs, so a_n is `~a` and b_n is `~b`. The third is a NAND of the two inversions, so y = `~(~a & ~b)`. Work all four rows and confirm the answer is 0, 1, 1, 1 — OR.",
            "Write down why OR needed a different shape from AND. AND came for free by inverting a NAND you already had. OR has no such shortcut, because a NAND hands you the AND of whatever you give it, not the OR — so you have to hand it the inputs already inverted. This is the one genuinely new idea in the whole universal-gate argument, and it is why the next topic needs four gates for an XOR.",
            "Predict what happens with `not g5(y, a, a);` — a NOT primitive given two inputs. Because a NOT has one input, the second `a` is read as a second output, and the tool reports ASSIGNIN on it. Run it if you want to see the error.",
          ],
        },
        {
          kind: "trap",
          wrong: "`nand g2(y, a, a);` written by accident when you meant two different signals.",
          right: "If you meant two signals, name two signals. If you meant one, the tied pair is deliberate — say so in a comment.",
          why: "Tying inputs is a technique, so it reads as a typo, and a typo here is silent. `nand g2(y, a, a);` lints clean, simulates clean, and computes NOT a — so a design meant to be `a OR b` becomes an inverter and every test that expected an OR fails somewhere far from the line that is wrong. Write the intent next to the trick.",
        },
        {
          kind: "check",
          items: [
            {
              q: "What does `nand g1(y, a, a);` compute, and how many gates did you save?",
              a: "It computes `~(a & a)`, and `a & a` is just `a`, so the output is `~a` — a NOT. You get an inverter out of a single gate, so if the NAND was the only gate type you had, you did not need to invent one. That is the opening move of NAND universality.",
            },
            {
              q: "You have only NANDs and need an AND. How many do you take, and what is the network?",
              a: "Two. `nand g1(t, a, b);` gives t = `~(a & b)`, then `nand g2(y, t, t);` with the input tied gives y = `~t` = `a & b`. Work it out on all four rows to confirm: t is 1,1,1,0 and y is 0,0,0,1, which is AND.",
            },
          ],
        },
      ],
    },
    {
      slug: "xor-from-nands",
      title: "Building an XOR from four NANDs",
      lede: "The rite of passage of this chapter: derive the network, then check all four rows — not two.",
      blocks: [
        {
          kind: "para",
          text: "XOR is the gate you want most often and the one that is hardest to reach with NANDs alone. AND is two gates, OR is three, NOT is one. XOR takes four. That is not an accident — XOR is genuinely the odd one out, and building it is the moment the NAND-only argument stops being a slogan and becomes something you have done yourself.",
        },
        {
          kind: "table",
          head: ["a", "b", "a ^ b"],
          rows: [
            ["0", "0", "0"],
            ["0", "1", "1"],
            ["1", "0", "1"],
            ["1", "1", "0"],
          ],
          caption:
            "The target. One of these rows is 1 whenever the two inputs disagree, and 0 whenever they agree. Any network you build has to match all four.",
        },
        {
          kind: "para",
          text: "The useful starting point is the OR of the two things you do not want: XOR is 1 when at least one input is 1, and *not* when both are 1. That is `(a | b) & ~(a & b)`. You already have a NAND, so `~(a & b)` is one gate. You do not have an OR, so that part is the work.",
        },
        {
          kind: "steps",
          title: "Deriving the four gates",
          items: [
            {
              head: "Gate 1 — the shared term",
              body: "`nand g1(n1, a, b);` gives `n1 = ~(a & b)`. This is the \"not both\" signal, and the next two gates both need it. Computing it once and sharing it is the whole trick: without sharing you would need six gates.",
            },
            {
              head: "Gate 2 — NAND of a with the shared term",
              body: "`nand g2(n2, a, n1);`. Expand what it means: `a & n1` is `a & ~(a & b)`, which simplifies to `a & ~b` (a signal ANDed with its own negation-with-partner collapses to just the part where a is on and b is off). So `n2 = ~(a & ~b)`, which reads \"1 unless a is on and b is off\".",
            },
            {
              head: "Gate 3 — the mirror image",
              body: "`nand g3(n3, b, n1);`. The same reasoning with the inputs the other way round gives `n3 = ~(b & ~a)`, which reads \"1 unless b is on and a is off\". n2 and n3 are the two halves of the XOR, and they disagree in exactly the rows where you need them to.",
            },
            {
              head: "Gate 4 — combine them",
              body: "`nand g4(y, n2, n3);`. Since n2 is high in every row *except* \"a only\", and n3 is high in every row *except* \"b only\", the AND of the two is high only in the two rows where they agree that something is set — and a NAND inverts it, dropping the last row. What is left is high exactly when the inputs differ.",
            },
            {
              head: "Check the algebra once, then check the rows",
              body: "n2 is low only in the a-only row and n3 is low only in the b-only row, so n2 & n3 is high exactly where a and b agree — the 00 and 11 rows. That is XNOR. The fourth gate is a NAND, and NANDing the two flips the table: the agree rows drop to 0, the differ rows rise to 1, leaving 0, 1, 1, 0. That is XOR. Now confirm it the slow way, in the table below, because a convincing derivation is still just an argument until four rows agree with it.",
            },
          ],
        },
        {
          kind: "code",
          caption: "XOR, four NANDs, no other gate. The intermediate nets are declared first.",
          code: `module top (
  input  wire a,
  input  wire b,
  output wire y
);
  wire n1, n2, n3;

  nand g1(n1, a, b);
  nand g2(n2, a, n1);
  nand g3(n3, b, n1);
  nand g4(y,  n2, n3);
endmodule`,
          note: "One wire, three gates, four NANDs, and the output comes straight out of the fourth gate with no extra inverter. Read the wiring top to bottom and you can draw the schematic from it without stopping.",
        },
        {
          kind: "table",
          head: ["a", "b", "n1 = ~(a&b)", "n2 = ~(a&n1)", "n3 = ~(b&n1)", "y = ~(n2&n3)", "a ^ b"],
          rows: [
            ["0", "0", "1", "1", "1", "0", "0"],
            ["0", "1", "1", "1", "0", "1", "1"],
            ["1", "0", "1", "0", "1", "1", "1"],
            ["1", "1", "0", "1", "1", "0", "0"],
          ],
          caption:
            "Every gate, every row, in one table. The n2 column is 0 only in the a=1 b=0 row and the n3 column is 0 only in the a=0 b=1 row — that is what makes the last gate pick the right answer. The last two columns match on all four rows, so the network is XOR.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Recompute the whole table yourself without looking at the one above. Work one row at a time, left to right, and only move to the next gate when you have n1. If you get stuck on a row, that row is the one that will fail in simulation too.",
            "Identify the row that is hardest — usually a=1, b=1, where n1 is 0 — and say out loud why the answer comes out 0. Following the numbers is the point: n1 drops, which forces both n2 and n3 back up, which makes the final NAND output 0.",
            "Now break it deliberately. Change gate 2 to `nand g2(n2, a, b);` (forget the shared term) and recompute all four rows. Which rows now disagree with XOR? Doing this on paper is far cheaper than doing it in the editor.",
            "Break it a second way: leave gate 2 correct and change gate 4 to `and g4(y, n2, n3);` instead of a NAND. The output is now XNOR — high in the two rows where the inputs agree, 00 and 11, so it disagrees with XOR on all four rows at once. Confirm on paper, then notice how total the failure is: one gate change, and every row is wrong.",
            "Finally, count the gates in each of the three versions of the same function: the four-NAND XOR, the one-line `assign y = a ^ b;`, and the five-gate version that builds XOR and then inverts it for XNOR. Write the counts down — 4, 1, 5 — and think about why the second number is not the one you would choose here.",
          ],
        },
        {
          kind: "trap",
          wrong: "Testing only the two mixed rows (a=0 b=1 and a=1 b=0) and declaring the XOR correct.",
          right: "Walk all four rows every time. The two mixed rows are the easy ones; both are 1 in every half-built network you will ever write.",
          why: "The mixed rows are the rows where a partial XOR network is most likely to be accidentally right, so they carry almost no information. The row a=1, b=1 is where the whole design lives: n1 drops to 0 and everything downstream depends on it. One row out of four is a quarter of the specification, and it is the quarter that fails.",
        },
        {
          kind: "trap",
          wrong: "Building XOR as three NANDs — the version without the shared n1 term — because it looks one gate shorter.",
          right: "Four NANDs with n1 computed once, or one line of `assign y = a ^ b;`.",
          why: "You can write a three-NAND expression that looks like XOR and is not, because you need the term a & ~b available twice unless you share the first NAND. Sharing is what makes four the honest count. If a network passes two rows and fails the other two, this is the mistake.",
        },
        {
          kind: "check",
          items: [
            {
              q: "In the four-NAND XOR, what is n1, and why does everything else need it?",
              a: "n1 = `~(a & b)`, the \"not both\" signal, produced by the first gate. Both n2 and n3 are NANDs that mix one input with n1, so without it you would have to compute `~(a & b)` twice and the network would need six gates instead of four.",
            },
            {
              q: "Your four-NAND XOR gives 0, 1, 0, 1 across the four rows. What has gone wrong?",
              a: "Y is high on rows 2 and 4 and low on rows 1 and 3, so the network is tracking b and ignoring a — the gate that mixes `a` in has been wired wrong. Look first at gate 2 or 3: a common version of this bug is `nand g2(n2, n1, n1);`, which inverts n1 instead of combining it with a, and quietly reduces the whole thing to something much simpler.",
            },
            {
              q: "Why is XNOR a fifth NAND rather than a fourth?",
              a: "Because the four-NAND network already uses the fourth NAND's inversion to reject the a=1, b=1 row. XNOR wants the opposite: it wants 1 exactly there. So you take the XOR output and invert it, and inversion is one more NAND with its input tied — `nand g5(y, xor_out, xor_out);`. Five in total.",
            },
          ],
        },
      ],
    },
    {
      slug: "nand-is-universal",
      title: "NAND is universal: build everything from it",
      lede: "If a factory shipped nothing but one gate type, you could still build every circuit in this chapter. Here is the recipe for each.",
      blocks: [
        {
          kind: "para",
          text: "A gate type is called *universal* if, using only that type, you can build any of the others. NAND is universal. NOR is too. AND and OR are not, and this is a good sanity check on the definition: with only AND gates you can never make a NOT, because every input path from a to the output passes through an AND, and an AND cannot turn a 1 into a 0 on its own. NAND can, because it has an inversion hiding inside.",
        },
        {
          kind: "para",
          text: "Universality is not a party trick. It is the reason real chips are built out of one gate type: a whole chip becomes rows of identical cells, which is cheap to lay out and cheap to make. The gates a library gives you as primitives may be a convenience, but underneath, everything reduces to the one type. For your work, the practical consequence is simple — a brief that says NAND-only is a design constraint, not a puzzle about cleverness.",
        },
        {
          kind: "table",
          head: ["You want", "NAND-only recipe", "Gates"],
          rows: [
            ["NOT a", "nand(y, a, a)", "1"],
            ["NAND", "It is the gate itself: nand(y, a, b)", "1"],
            ["AND", "nand(t, a, b); nand(y, t, t)", "2"],
            ["OR", "nand(a_n, a, a); nand(b_n, b, b); nand(y, a_n, b_n)", "3"],
            ["NOR", "the OR network, then nand(y, or_out, or_out)", "4"],
            ["XOR", "nand(t, a, b); nand(x1, a, t); nand(x2, b, t); nand(y, x1, x2)", "4"],
            ["XNOR", "the XOR network, then nand(y, xor_out, xor_out)", "5"],
          ],
          caption:
            "Every row uses nothing but the `nand` primitive. Read the counts as a cost: NOT and NAND are free, AND is cheap, OR costs an inverter per input, and XOR is the one that took real work. The last two rows are pure add-ons — one tied-input NAND each.",
        },
        {
          kind: "steps",
          title: "Why the OR recipe works, step by step",
          items: [
            {
              head: "Start from what a NAND gives you",
              body: "A NAND hands you the *inverted* AND of whatever you feed it. So from a and b directly, the only thing you get for free is `~(a & b)`. There is no version of this gate that gives you `a | b`, which is exactly why OR cannot be built the way AND was.",
            },
            {
              head: "Invert each input first",
              body: "`nand g1(a_n, a, a);` gives a_n = `~a`, and `nand g2(b_n, b, b);` gives b_n = `~b`. Two gates, and both use the tied-input trick. Now you hold both inputs inverted.",
            },
            {
              head: "Hand the inversions to a NAND",
              body: "`nand g3(y, a_n, b_n);` gives y = `~(~a & ~b)`. Negating both inputs and then negating the result cancels the inversions out and leaves a NAND of the two — which is the thing you wanted.",
            },
            {
              head: "Check the algebra, then the rows",
              body: "NAND the two *inverted* inputs: `~(~a & ~b)` is `a | b`, by De Morgan's law. Work the four rows to confirm: a_n and b_n are 1,1 then 1,0 then 0,1 then 0,0, and NANDing each pair gives 0, 1, 1, 1. That is OR.",
            },
          ],
        },
        {
          kind: "code",
          caption: "Five different gates, and every line of them says nand. This is what universality looks like in code.",
          code: `module all_from_nand (
  input  wire a,
  input  wire b,
  output wire y_not,
  output wire y_and,
  output wire y_or,
  output wire y_nor,
  output wire y_xor
);
  // Three shared ingredients, each one gate.
  wire a_n, b_n, ab_n;
  wire x1, x2;

  nand g1(a_n,  a, a);      // a_n  = ~a
  nand g2(b_n,  b, b);      // b_n  = ~b
  nand g3(ab_n, a, b);      // ab_n = ~(a & b)

  // NOT: one gate, inputs tied together.
  nand g4(y_not, a, a);

  // AND: two gates. Invert the shared NAND, because a NAND
  // hands you ~(a & b) and you want the a & b underneath it.
  nand g5(y_and, ab_n, ab_n);

  // OR: three gates. A NAND of the two inverted inputs.
  nand g6(y_or, a_n, b_n);

  // NOR: four gates. Invert the OR.
  nand g7(y_nor, y_or, y_or);

  // XOR: four gates. Mix each input with the shared NAND.
  nand g8(x1,    a, ab_n);
  nand g9(x2,    b, ab_n);
  nand g10(y_xor, x1, x2);
endmodule`,
          note: "Ten NANDs, five different functions, no other gate type anywhere. Three of them are one or two gates and exist only because of the tied-input trick. The other two share ingredients: the OR reuses the two input inversions, and the XOR reuses the shared `ab_n`. That sharing is why a five-function design still fits on one page.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why OR costs three gates and AND only two",
          text: "AND is cheap because a NAND is one inversion away from it — build the NAND, then undo the inversion. OR has no such neighbour. The NAND's natural output is an inverted AND, and there is no single gate in the NAND family that produces an OR directly, so you have to prepare the inputs first. That is the whole story: one inverter per input, then one gate. XOR is the expensive case, because no arrangement of the inputs makes a single NAND into an exclusive OR — the both-1 case has to be rejected, and rejecting it takes two extra gates to build the two halves of the answer.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Take the module above and write a full truth table for all five outputs across the four rows. You should get NOT 1,1,0,0; AND 0,0,0,1; OR 0,1,1,1; NOR 1,0,0,0; XOR 0,1,1,0. Every one of those five columns is the row of a gate from the big table earlier in this chapter. That is universality, demonstrated: five different columns, one gate type.",
            "Trace a single row all the way through the network, say a=1 and b=1. a_n=0, b_n=0, ab_n=0. Then y_not=0, y_and=1, y_or=1, y_nor=0, y_xor=0. Check each against the big table for that row, then do a=0 b=1 the same way.",
            "Add an XNOR output using one more NAND. Which signal do you feed it? The XOR output y_xor, with both input pins tied to it. Write the row it produces and check it is 1,0,0,1.",
            "Count the total gates now: eleven NANDs for six functions. Then count what the same six functions cost as one `assign` line each. Write both numbers down, and think about which description you would rather hand to the next person who reads it.",
            "Work out whether you can build a NOT from AND gates alone. Follow every path from an input to an output: they all pass through an AND, and an AND of a single 1-bit input is that input. What does that tell you about AND's universality?",
            "Finally, design a NAND-only network for `(a & b) | (c & d)` on paper before you look at the next topic. Two product terms, then one final gate. Count the gates — and notice that the answer is fewer than the six a general-purpose build would use.",
          ],
        },
        {
          kind: "trap",
          wrong: "Reading universality as a rule: rewriting every module in the track in NAND because NAND is universal.",
          right: "Write `assign` where the function is clear. Use NAND primitives where the brief says NAND, or where the gate count matters.",
          why: "Universality is a statement about what is *possible*, not about what is *best*. A NAND-only version of a design is usually longer and harder to read, and no cheaper once the tool is free to choose its own gates. The reason to build from NANDs is a constraint — a library that only has them, a requirement to count gates, or a problem set that asks for it. Outside those, the equation is the clearer description.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Define universal, and say which of the seven gates are universal.",
              a: "A gate type is universal if gates of that type alone can build any of the other gate types. NAND is universal: NOT is one NAND with tied inputs, AND is two, OR is three, XOR is four. NOR is also universal, by the same argument applied to its own form. AND and OR are not, because neither can invert, and there is no way to make a NOT out of gates that never invert.",
            },
            {
              q: "You need an OR from NANDs only. How many gates, and what is the first one?",
              a: "Three. The first is `nand g1(a_n, a, a);`, inverting a with the tied-input trick; the second does the same for b. The third, `nand g3(y, a_n, b_n);`, NANDs the two inversions, giving `~(~a & ~b)`, which is a | b. The rows come out 0, 1, 1, 1.",
            },
            {
              q: "You have a NAND-only network that computes OR, and you now need NOR. What do you add?",
              a: "One NAND with its input tied twice, feeding off the OR output: `nand g8(y_nor, or_part, or_part);`. The tied-input NOT inverts the whole result, turning 0,1,1,1 into 1,0,0,0. Four NANDs for a NOR.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-netlist-problem",
      title: "The problem set: (a & b) | (c & d), NANDs only",
      lede: "Everything on this page applied to one brief — four inputs in, one output out, no gate other than NAND.",
      blocks: [
        {
          kind: "para",
          text: "This is the design the problem set asks for, and it is not a trick: once you have the recipes above, the whole job is three gates. Build the two product terms as NANDs, then combine them with a third NAND. The value of doing it by hand first is that you will know why three NANDs is the right answer rather than the only one you tried.",
        },
        {
          kind: "steps",
          title: "Designing the network on paper",
          items: [
            {
              head: "Read the target out loud",
              body: "`y = (a & b) | (c & d)`. Read it as a circuit: two ANDs, then an OR of their results. It is a three-level circuit — inputs, then the two ANDs, then the OR — which in a NAND-only design means three gate stages.",
            },
            {
              head: "Invert each level with a NAND",
              body: "A NAND gives you the inverted version of whatever you feed it. So build the two ANDs as the inversions of the two products: n1 = `~(a & b)` and n2 = `~(c & d)`. Two gates, done.",
            },
            {
              head: "Use the final NAND to stand in for the OR",
              body: "The last stage wants an OR of the two products, but all you have on hand are their inversions. Feeding the inversions into one more NAND gives `~(n1 & n2)`, which is the OR of the products — because negating both inputs and then negating the result cancels out. In symbols: `~(~(a&b) & ~(c&d))`, which by De Morgan's law equals `(a&b) | (c&d)`. Exactly the target.",
            },
            {
              head: "Count and name",
              body: "Three NANDs and two internal wires. Name them n1 and n2 and declare them in a `wire` line before the primitives, so IMPLICIT never appears.",
            },
            {
              head: "Check all sixteen rows",
              body: "Four inputs means 16 combinations, not four. y is 1 whenever (a and b are both 1) or (c and d are both 1), and 0 in the other twelve. If you verify two or three rows and stop, you have verified almost nothing — this is where partial checking hides.",
            },
          ],
        },
        {
          kind: "code",
          caption: "The finished network. Three NANDs, two internal wires, and nothing else in the file.",
          code: `module top (
  input  wire a,
  input  wire b,
  input  wire c,
  input  wire d,
  output wire y
);
  // y = (a & b) | (c & d), built from 2-input NANDs only.
  wire n1, n2;

  nand g1(n1, a, b);   // n1 = ~(a & b)
  nand g2(n2, c, d);   // n2 = ~(c & d)
  nand g3(y,  n1, n2); // y  = ~(n1 & n2) = (a & b) | (c & d)
endmodule`,
          note: "Read the comments as the derivation: each one is the algebra step from the line above it. The final line is the interesting one, and notice what makes it cheap: a NAND hands you the inverse of whatever you feed it, so the two gates above produced the two products already inverted, and one more NAND un-inverts them and ORs them at the same time. Three gates, not four.",
        },
        {
          kind: "table",
          head: ["Row", "a", "b", "c", "d", "n1", "n2", "y", "Wanted"],
          rows: [
            ["3", "1", "1", "0", "0", "0", "1", "1", "1"],
            ["9", "1", "0", "0", "1", "1", "0", "1", "1"],
            ["11", "1", "1", "0", "1", "0", "0", "1", "1"],
            ["15", "1", "1", "1", "1", "0", "0", "1", "1"],
            ["0", "0", "0", "0", "0", "1", "1", "0", "0"],
            ["1", "0", "0", "0", "1", "1", "0", "0", "0"],
            ["6", "0", "1", "1", "0", "1", "0", "0", "0"],
          ],
          caption:
            "Seven of the sixteen rows. The four where a product term is set — rows 3, 9, 11, 15 — give y=1, and a sample of the rows where neither product is set gives 0. y is 0 exactly when both n1 and n2 are 1, which is what the final NAND guarantees.",
        },
        {
          kind: "doThis",
          title: "The general method, on paper (10 minutes)",
          items: [
            "Write down the method as three steps, so you can reuse it: (1) list the AND terms in the expression; (2) build each one as a NAND, which gives you its inverse for free; (3) feed all the inverses into one final NAND, which un-inverts them and ORs them together.",
            "Apply it to `y = (a & c) | (b & d)`. How many gates, and which wires? Same shape, different pin order on the first two gates — notice that AND does not care which input is which.",
            "Apply it to a three-term sum, `y = (a & b) | (c & d) | (e & f)`. One NAND per product, so three products. Now the last step is the interesting one: a single three-input `nand y(n1, n2, n3);` does the whole job, because negating all three inversions at once still cancels. So four gates — unless you are restricted to 2-input NANDs, as the problem set is. In that case the nested version fails, and you need an extra inversion: combine two terms, invert that result with a tied-input NAND, then combine the third. Count that: six gates, and write down which step cost the extra two.",
            "Now apply it to a mixed expression, `y = (a & b) & (c | d)`. This one is not a sum of products, so the flat pattern does not apply. Build the OR of c and d with the three-gate OR network from the previous topic, build the AND of a and b with two NANDs, then NAND the two together with its inputs inverted. Work out the total: six NANDs and four internal wires. Notice that the shape of the expression, not its size, decides the network.",
            "Finally, count the gates in `y = (a & b) | (c & d)` built as one `assign` line against your three-NAND version. Write both numbers next to each other — one and three — and note that only one of them tells a reader how many gates there are.",
          ],
        },
        {
          kind: "trap",
          wrong: "Reordering the ports in the module header, or renaming them, because the expression reads better in a different order.",
          right: "Keep the port order the brief gives you: `a, b, c, d, y`.",
          why: "The hidden testbench wires your module up by position — it writes `top dut (a, b, c, d, y);`, which means \"the first pin gets a, the second gets b\". Rename a port to `c` and the bench still compiles, then swaps your c and d wires and your design fails on a third of the rows for reasons that have nothing to do with the logic. Match the port list exactly and change nothing about the order.",
        },
        {
          kind: "trap",
          wrong: "Leaving the starter's `assign y = a & b;` in place and adding the three NANDs underneath it.",
          right: "Delete the `assign` when you add the primitives. One net, one driver.",
          why: "The starter line drives y, and your third NAND drives y as well. Two drivers on one net is a design error: Verilator will not warn you here, it just keeps one and gives you its answer, which is the incomplete first product term. This is the same trap as the two-spellings-one-net one, and here it is the most likely way to get a design that is half right and passes some rows.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Your three-NAND network for (a & b) | (c & d) gives y = 1 on rows 3, 9, 11 and 15, and 0 on the other twelve. Is it correct?",
              a: "Yes. The four rows where y is 1 are exactly the rows where a product term is set: row 3 is a=b=1, row 9 is c=d=1, row 11 is both, row 15 is both. Every other row has neither product set, so 0 is right. Sixteen rows, sixteen correct answers — that is the standard, and this is the only kind of verification that reaches it.",
            },
            {
              q: "You need a NAND-only network for (a & b) & (c | d). Can you reuse the three-stage pattern?",
              a: "Not directly. The pattern inverts a level and un-inverts it at the end, and it works for a sum of products. Here the outer operation is an AND of a product and a sum, so the shape is different: build n1 = `~(a & b)` and the OR of c and d from three more NANDs, then combine with one final NAND. Work it out on paper and count the gates — it comes to more than the flat case, which is the lesson: the shape of the expression, not its size, decides the network.",
            },
            {
              q: "Why does the final `nand g3(y, n1, n2);` produce an OR rather than a NAND of the two products?",
              a: "Because n1 and n2 are not the products, they are the products inverted. The final gate computes `~(~(a&b) & ~(c&d))`, and negating both inputs and then negating the result cancels both inversions out, leaving `(a&b) | (c&d)`. De Morgan's law in one line. If the final gate received the products directly, it would give you a NAND instead.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "What to do with the messages you will see",
          text: "IMPLICIT means a net was not declared — add it to the `wire` line. UNUSEDSIGNAL means something is written but never read, which is normal while a design is half built. UNDRIVEN means something is read that nobody drives, and on an internal net that is always a real bug. None of these are about the logic being wrong; they are about the netlist being unfinished.",
        },
      ],
    },
  ],
  glossary: [
    { term: "bubble", meaning: "The small circle on a gate's output in a schematic. It means the output is inverted." },
    { term: "combinational", meaning: "Logic whose output depends only on its current inputs, with no memory of the past." },
    { term: "dataflow modelling", meaning: "Describing a circuit with `assign` statements, so the code states the Boolean equation." },
    { term: "explicit net", meaning: "A wire you declared yourself with a `wire` statement, as opposed to one the tool invented." },
    { term: "gate primitive", meaning: "A Verilog statement that instantiates one gate by type, like `nand g1(y, a, b);`" },
    { term: "gate type", meaning: "One of the seven standard rules: AND, OR, NOT, NAND, NOR, XOR, XNOR." },
    { term: "implicit net", meaning: "A net the tool invented for a name it had not seen. Verilator warns IMPLICIT when this happens." },
    { term: "instance name", meaning: "The name you give one gate inside a primitive, like `g1` in `nand g1(y, a, b);`" },
    { term: "netlist", meaning: "A list of gates and the wires joining them — the circuit described part by part." },
    { term: "NAND universality", meaning: "The fact that NAND gates alone can build every other gate, so a whole circuit can be made from one type." },
    { term: "schematic", meaning: "A circuit drawn as a picture of gate shapes joined by lines, where the shape tells you the rule." },
    { term: "structural modelling", meaning: "Describing a circuit with gate primitives and named wires, so the code is a parts list." },
    { term: "tied inputs", meaning: "Connecting both input pins of one gate to the same wire. A NAND with tied inputs is a NOT." },
    { term: "universal gate", meaning: "A gate type from which every other gate can be built. NAND and NOR both qualify." },
  ],
  nextStep:
    "You now have the whole vocabulary: seven gates, two ways to write each one, the output-first rule for primitives, declared intermediate wires, and a NAND-only recipe for every function. The first lesson, Gate Primitives & assign, puts four of them side by side in the workspace — you will fix a NAND and build an XOR from four NAND primitives, checking all four input rows. Read it after this page, and keep the big truth table from the second topic open next to you while you work.",
};
