import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 11,
  chapterSlug: "finite-state-machines",
  title: "Finite State Machines",
  readMinutes: 24,
  youWillBeAbleTo: [
    "Describe any small machine in words by naming its states, its transitions and its outputs",
    "Draw a state transition diagram and read one that somebody else drew",
    "Turn a state transition table into a Verilog `case` statement",
    "Name states with `localparam` and explain why you never write a raw number as a state",
    "Say the difference between binary and one-hot encoding, and count the flip-flops each one needs",
    "Tell a Mealy machine from a Moore machine and say when the output can change in each",
    "Write a complete FSM in the two-paragraph style: one combinational block and one clocked block",
    "Give an FSM a reset state and a `default` branch so it can never be dead",
  ],
  mentalModel: [
    {
      title: "A state machine is a lookup table with a memory",
      body: "Every state machine is two tables and one register. The register holds a single number — call it the state. Table one takes that number plus the current inputs and says which number comes next. Table two takes the number and says what the outputs are. That is the whole machine. The register is the memory; the tables are combinational logic, so they recompute the instant anything changes. Circles, arrows and boxes on a piece of paper are not a different thing from this — they are the two tables drawn so a human can read them. Once you can say \"the state is 2, so look up row 2 of both tables\", you understand every notation the rest of the chapter uses.",
    },
    {
      title: "Split every machine into what is true now, and what happens at a tick",
      body: "The other idea the whole chapter hangs off is a split. A register is sequential: it only changes on a clock edge, and it remembers. Everything else is combinational: it is a rule that is true at every instant between edges, with no memory at all. The next-state table is combinational because the answer to \"where do I go\" depends only on where I am and what the inputs are doing right now. The state register is sequential because the answer to \"where am I\" is a fact about the past. Write them in separate blocks, and an FSM is finished. Merge them and the two kinds of behaviour fight each other, and the failures are silent.",
    },
  ],
  topics: [
    {
      slug: "systemverilog-at-a-glance",
      title: "SystemVerilog at a glance",
      lede: "This chapter's dialect in one page: `logic`, `always_comb`, `always_ff`. Same hardware, stricter names.",
      blocks: [
        {
          kind: "para",
          text: "Everything so far was Verilog-2001: `wire` for connections, `reg` for anything assigned inside a block, `always @(*)` for combinational logic, `always @(posedge clk)` for registers. From here the starters use SystemVerilog, which builds the exact same hardware and renames the containers so the tool can check you put the right logic in the right block. Three swaps and you are fluent — and every sample in this chapter already uses them, so read this topic first and the rest reads itself.",
        },
        {
          kind: "table",
          head: ["You wrote", "You write now", "The rule the tool enforces"],
          rows: [
            ["`wire` or `reg`", "`logic`", "One type for both. A `logic` driven by an `assign` or an `always_comb` is a wire; driven by an `always_ff`, it is a register."],
            ["`always @(*)`", "`always_comb`", "Must be combinational. If some path leaves an output unassigned, the tool errors instead of quietly inferring a latch."],
            ["`always @(posedge clk ...)`", "`always_ff @(posedge clk ...)`", "Must be registers. Use nonblocking `<=` inside, exactly as before — `=` in here is still the BLKSEQ bug from chapter 8."],
          ],
          caption:
            "Three renames, zero new hardware. `localparam`, `case`, `if`, blocking `=` in combinational code and nonblocking `<=` in clocked code all work exactly as before.",
        },
        {
          kind: "code",
          caption: "The whole dialect in nine lines: one flop with an active-high async reset, this chapter's convention.",
          code: `module dff_arst (
  input  logic clk,
  input  logic rst,   // active-high: the lesson and pset benches assert 1
  input  logic d,
  output logic q
);
  always_ff @(posedge clk or posedge rst) begin
    if (rst) q <= 1'b0;
    else     q <= d;
  end
endmodule`,
          note: "Read the header as the contract: `always_ff` promises registers, so `q` is a flop, and `rst` in the sensitivity list makes the reset asynchronous. The pset for this chapter is `top(clk, rst, ped, main_light, side_light)` with the same active-high `rst` — one more input, same discipline.",
        },
      ],
    },
    {
      slug: "what-is-a-state-machine",
      title: "What a state machine actually is",
      lede: "A small machine with a memory that holds exactly one thing: which situation it is in right now.",
      blocks: [
        {
          kind: "analogy",
          text: "Think of the instructions taped inside a lift. The card says: \"if you are on floor 3 and someone presses 5, move to 5. If you are on floor 5 and someone presses 2, move to 2. If the pressed floor is the floor you are already on, stay put.\" That card, plus the lift's current floor, is a complete state machine. The lift is not keeping a diary. Its entire memory is one number — which floor it is on — and everything else about how it behaves follows from that number and the button that was just pressed.",
        },
        {
          kind: "para",
          text: "A *finite state machine* (FSM) is that idea made precise. *Finite* means the number of situations is fixed and countable in advance. A machine with five states can be in five places, never a sixth. Each of those five places is a *state*, and in any real machine each state has a name that means something: `IDLE`, `RUN`, `GREEN`, `UNLOCKED`. The machine is in exactly one state at any instant, and it moves from one state to another one step at a time.",
        },
        {
          kind: "para",
          text: "Any state machine, however complicated, is fully described by three lists. First, the states: the names. Second, the transitions: for each state, what makes it leave, and which state it arrives in. Third, the outputs: what the outside world sees while it is in each state. If you can write those three lists for a problem, you have designed the machine. Everything after that — the diagram, the table, the code — is a way of writing down those same three lists so that a tool, or another person, can read them.",
        },
        {
          kind: "define",
          items: [
            { term: "state", meaning: "One named situation the machine can be in. It is a number in a register." },
            { term: "transition", meaning: "A rule saying \"from this state, go to that state\"." },
            { term: "output", meaning: "A value the machine drives so the outside world can see it." },
            { term: "input", meaning: "A value coming in from outside that can cause a transition." },
          ],
        },
        {
          kind: "para",
          text: "Here is a small one, worked out in words before any code. A door lock has a keypad. It has two states, `LOCKED` and `UNLOCKED`. Two inputs come in: `digit_ok` means the digit just entered was the next correct digit of the code, and `digit_bad` means the wrong digit was entered. One output goes out: `unlocked`, which releases the door handle. The transitions: from `LOCKED`, a correct digit goes to `UNLOCKED` and a wrong digit stays in `LOCKED`. From `UNLOCKED`, a wrong digit goes back to `LOCKED` and a correct digit stays in `UNLOCKED`. The outputs: `unlocked` is 0 in `LOCKED` and 1 in `UNLOCKED`.",
        },
        {
          kind: "code",
          caption:
            "The complete door lock. Two states, two inputs, one output, and the whole machine on screen before we take it apart.",
          code: `module door_lock (
  input  logic clk,
  input  logic rst,        // reset: forces the machine back to LOCKED
  input  logic digit_ok,   // the digit just entered was correct
  input  logic digit_bad,  // the digit just entered was wrong
  output logic  unlocked
);
  //  Diagram (Moore flavour: outputs written inside the state boxes)
  //
  //            digit_ok
  //   +--------+ ---------> +-----------+
  //   | LOCKED |            | UNLOCKED  |
  //   |        |            |           |
  //   | unl = 0|            | unl = 1   |
  //   +--------+ <--------- +-----------+
  //      ^        digit_bad
  //      |
  //   reset lands here
  localparam LOCKED   = 1'b0,
             UNLOCKED = 1'b1;

  logic state;              // the machine's memory
  logic next;               // where it is about to go

  // Paragraph one: the two lookup tables, true at every instant.
  always_comb begin
    next     = LOCKED;
    unlocked = 1'b0;
    case (state)
      LOCKED: begin
        next     = digit_ok ? UNLOCKED : LOCKED;
        unlocked = 1'b0;
      end
      UNLOCKED: begin
        next     = digit_bad ? LOCKED : UNLOCKED;
        unlocked = 1'b1;
      end
      default: begin
        next     = LOCKED;
        unlocked = 1'b0;
      end
    endcase
  end

  // Paragraph two: the memory. It only moves on a clock edge.
  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= LOCKED;
    else     state <= next;
  end
endmodule`,
          note: "Read it as a sentence first: \"while I am LOCKED, the next state is UNLOCKED if the digit was good, and the output is 0. While I am UNLOCKED, the next state is LOCKED if the digit was bad, and the output is 1. On every clock edge, remember the next state.\" Every line after that is just spelling.",
        },
        {
          kind: "steps",
          title: "Take the door lock apart, line by line",
          items: [
            {
              head: "`localparam LOCKED = 1'b0, UNLOCKED = 1'b1;`",
              body: "Two named constants. `LOCKED` is not a magic number typed in three different places — it is a name. We will come back to why this matters in the next topic, but notice already that the word `LOCKED` appears in five lines and the number 0 appears nowhere.",
            },
            {
              head: "`logic state;` and `logic next;`",
              body: "`state` is the memory: one bit that holds which situation we are in. `next` is a plain signal holding the answer to \"where do I go\", computed continuously. It is not a second memory — it is the output of the lookup table, recomputed every time `state` or an input changes.",
            },
            {
              head: "`always_comb`",
              body: "The name is the promise: this block is combinational, so it re-runs whenever `state`, `digit_ok` or `digit_bad` changes, and the tool errors if any path leaves an output unassigned. This is where the two lookup tables live.",
            },
            {
              head: "`next = LOCKED;` and `unlocked = 1'b0;` before the `case`",
              body: "Defaults. If some path through the `case` forgets to set one of them, it keeps this sensible value instead of holding whatever it had. Two lines of insurance that cost nothing.",
            },
            {
              head: "`case (state)` with one branch per state",
              body: "The `case` statement is the Verilog spelling of a lookup table. `case (state)` says \"look at which state we are in\", and each branch says what that row of the table says. The trailing `:` and the comma are punctuation, not operators.",
            },
            {
              head: "`default:`",
              body: "The row for \"we are in a state nobody expected\". It sends the machine somewhere legal. It is the difference between a machine that recovers and a machine that is permanently dead, and it is covered properly later in the chapter.",
            },
            {
              head: "`always_ff @(posedge clk or posedge rst)`",
              body: "The clocked block. `posedge clk` means the rising edge of the clock — the instant the clock wire goes from 0 to 1. `@(posedge clk or posedge rst)` means \"run on a rising clock edge, or on a rising reset edge\". `posedge rst` in the list is what makes the reset *asynchronous*: it takes effect immediately, not on the next clock edge.",
            },
            {
              head: "`if (rst) state <= LOCKED; else state <= next;`",
              body: "On a clock edge: if reset is high, put the machine back to `LOCKED`. Otherwise adopt whatever the combinational block decided. The `<=` is the nonblocking assignment, and in a clocked block it is the only correct choice — chapter 8 covers exactly why.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (6 minutes)",
          items: [
            "Write down the door lock's two states, its two inputs, its one output, and the four transitions, as three separate lists. No Verilog, no jargon.",
            "Decide what `unlocked` should be in each state, and check your answer against the story: is the handle released when the door is locked?",
            "Using the rule from chapter 1 — n bits hold 2ⁿ values — work out the narrowest register width for two states. Then for a machine with three states, and one with five.",
            "Count the `case` branches you would need for those three widths, and think about how many of the values a 3-bit register can hold are actually named states.",
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the state is a number and not a name",
          text: "You will write `state` in your code, not `LOCKED`. The register can only hold bits, so somewhere the names must become numbers. That step is called *encoding*, and it is a choice you make rather than something the language forces on you. Chapter 1's rule of thumb still applies exactly: two states fit in 1 bit, three and four states fit in 2 bits, five through eight need 3 bits. Everything after this point is about picking the encoding and naming the numbers so the rest of the code never has to think about them.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A machine has 7 states. How wide must the state register be, and how many values does it leave unused?",
              a: "3 bits, because 2² = 4 is too few and 2³ = 8 is enough. A 3-bit register can hold 8 values, 7 of which are named states, so exactly one value is unused — and that unused value is an illegal state your machine can still land in. That is not a hypothetical; it is covered in the reset topic.",
            },
            {
              q: "Why does the door lock have a signal called `next` when it also has a signal called `state`?",
              a: "`state` is the memory — where the machine is now, held in a register and only changed on a clock edge. `next` is the combinational output of the transition table — the answer to \"where would I go from here, given the inputs right now\". If you collapsed them into one signal you would have a combinational loop, because the next state would depend on the state that depends on the next state. Two signals is not redundancy, it is the two halves of the lookup.",
            },
          ],
        },
      ],
    },
    {
      slug: "states-and-transitions",
      title: "Drawing the machine: diagrams and tables",
      lede: "The same three lists, written two ways — as a picture and as a grid of rows.",
      blocks: [
        {
          kind: "para",
          text: "Engineers draw state machines on paper before writing code, and the picture has a tiny vocabulary. A *state* is a circle (or a rounded box). A *transition* is an arrow leaving one circle and arriving at another. The label on the arrow says what causes the move. Usually it reads `input / output`: the thing that must happen on the left, and what the machine emits on the right. When the output depends only on the state, the label is left off the arrow and written inside the circle instead — why is a separate topic, and the next one after this.",
        },
        {
          kind: "para",
          text: "The door lock as a picture, which is the form most people meet first. In a real source file this sits at the top of the module as a block of comments, so the diagram lives next to the code it describes:",
        },
        {
          kind: "para",
          text: "            digit_ok\n//   +--------+ ---------> +-----------+\n//   | LOCKED |            | UNLOCKED  |\n//   |        |            |           |\n//   | unl = 0|            | unl = 1   |\n//   +--------+ <--------- +-----------+\n//      ^        digit_bad\n//      |\n//   reset lands here",
        },
        {
          kind: "para",
          text: "Two things to notice. The reset arrow points at `LOCKED`, which is the reset state. And there is no arrow leaving `UNLOCKED` for `digit_ok` — that input changes nothing, so the machine stays where it is, and you leave the self-loop off the diagram because a self-loop with no label carries no information.",
        },
        {
          kind: "para",
          text: "The problem with a picture is that it is awkward to test. So the same information also gets written as a *state transition table*: a grid with one row per state and one column per input condition, where each cell holds the state you go to. Reading the table tells you the whole machine, and reading it is easy to get wrong in a way that a diagram is not — you can check a table row by row against the code.",
        },
        {
          kind: "table",
          head: ["Current state", "digit_ok", "digit_bad", "Go to", "unlocked"],
          rows: [
            ["LOCKED", "1", "0", "UNLOCKED", "0"],
            ["LOCKED", "0", "1", "LOCKED", "0"],
            ["LOCKED", "0", "0", "LOCKED", "0"],
            ["UNLOCKED", "1", "0", "UNLOCKED", "1"],
            ["UNLOCKED", "0", "1", "LOCKED", "1"],
            ["UNLOCKED", "0", "0", "UNLOCKED", "1"],
          ],
          caption:
            "One row per state per input combination. Every row is checkable: read the first two columns as the situation, then confirm the last two columns are what the story says. The row \"LOCKED, digit_ok is 0, digit_bad is 0\" is not interesting — the machine is idle and both inputs agree it has nothing to do — but you write it anyway, because a row you left out is a row nobody checked.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The `-` in a transition table",
          text: "As the machine grows you stop writing every input combination and start using a dash for \"this input is irrelevant in this state\". From `LOCKED`, `digit_bad` is irrelevant, because you are already locked and a wrong digit does not make you more locked. Write `-` in the table. Do *not* write `x` — chapter 1 explains why: in hardware `x` means genuinely unknown, and in a design document it means something quite different. In the code, a dash simply becomes an input the `case` branch does not look at.",
        },
        {
          kind: "para",
          text: "Now the important consequence, and it is the one that catches everyone. A state with no way out is a trap. A machine that can enter a state with no way out is a machine that can hang. Before writing code, look at your diagram and ask two questions about every state: can I leave it, and is there always a row in the table that tells me where I go? A state you cannot leave is legal — a one-shot circuit may want one — but it must be a state you get into on purpose, not one that a stray input can drop you into.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (12 minutes)",
          items: [
            "Read the story: a small motor controller has three states — `IDLE` (motor stopped), `RUN` (motor spinning) and `DONE` (the job finished, waiting to be started again). It has two inputs, `go` (someone pressed start) and `stop` (someone pressed stop), and one output, `busy`, which is 1 only while the motor spins.",
            "Name the three states, then write a transition-table row for each one. For each state, decide what `go` does and what `stop` does, and write a dash where an input does not matter. Six rows is enough.",
            "Fill in the output column. Decide `busy` from the *state alone* — do not consult `go` or `stop`. If you find yourself wanting an input to decide the output, stop: that would make it a Mealy machine, and this exercise is building a Moore one. The next topic is entirely about why that distinction exists.",
            "Count the states and work out the narrowest register width with the rule from chapter 1.",
            "Check for traps. Can any state be entered and never left? If `DONE` is a trap, decide what the user should be able to do to escape it, and write that transition into your table now.",
            "Now convert the table to code. Write an `always_comb` block with `next = IDLE;` and `busy = 1'b0;` above the `case`, one branch per state, and a `default` branch whose two lines are spelled out exactly: `default: begin next = IDLE; busy = 1'b0; end`.",
            "Finally write the clocked block: `always_ff @(posedge clk or posedge rst)`, with `if (rst) state <= IDLE;` and `else state <= next;`. That is the whole module.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "In your three-state table, one row says `RUN`, `go` is a dash, `stop` is 0, go to `RUN`, `busy` is 1. What is that row telling you in plain words?",
              a: "That the machine can sit in `RUN` indefinitely, doing nothing but keep running, as long as nobody presses stop. The dash on `go` says pressing start again changes nothing — the machine is already running, so start is a no-op. The dashes are what let the table have six rows instead of twelve: three states times four input combinations is twelve, and six of those are the same answer.",
            },
            {
              q: "You drew four states and no arrow leaves the last one. What are your two options?",
              a: "Decide whether it is meant to be a trap. If the machine should never get there, the arrow is missing and you need one — most often an arrow back to a reset or idle state on an error input. If the machine really is meant to stop permanently there, then that state must be impossible to enter by accident: no transition in the table may point to it except the one place where reaching it is the goal. The dangerous version is an unreachable-looking state that a bad input can still select.",
            },
          ],
        },
      ],
    },
    {
      slug: "state-encoding",
      title: "Turning state names into numbers",
      lede: "Which number means `GREEN`? That choice is the encoding, and it is yours to make.",
      blocks: [
        {
          kind: "para",
          text: "The register holds bits, so the names have to become numbers before they can be stored. The mapping from name to number is the *encoding*. There are two encodings you need to know, and every practical FSM uses one of them.",
        },
        {
          kind: "define",
          items: [
            { term: "binary encoding", meaning: "States are numbered 0, 1, 2, 3… and stored in the fewest possible bits. With 5 states you need 3 bits, because 2² = 4 is not enough." },
            { term: "one-hot encoding", meaning: "Each state gets its own bit, and only that bit is high. 5 states means 5 bits, one lit at a time." },
          ],
        },
        {
          kind: "table",
          head: ["States in the machine", "Bits for binary", "Bits for one-hot", "Binary values left unused"],
          rows: [
            ["2", "1", "2", "0"],
            ["3", "2", "3", "1"],
            ["4", "2", "4", "0"],
            ["5", "3", "5", "3"],
            ["8", "3", "8", "0"],
            ["12", "4", "12", "4"],
          ],
          caption:
            "Binary always rounds up to the next power of two: for n states you need ceil(log₂ n) bits. One-hot always needs exactly n bits, one per state. Binary wins on flip-flops. One-hot wins on everything else.",
        },
        {
          kind: "para",
          text: "The trade-off is area against reliability. Binary encoding uses the fewest flip-flops, so it builds smaller — a 20-state machine is 5 bits wide instead of 20. But in binary encoding a state change from 3 to 4 flips three bits at once, and from 7 to 8 flips four. A bit that flips at the same instant as its neighbours has a brief, real chance of reading the wrong value. One-hot encoding always changes exactly one bit per transition, because a state is a single lit wire. That makes the design far easier for a tool to check, and it makes an illegal state stand out instead of hiding.",
        },
        {
          kind: "table",
          head: ["State", "Binary, 3 bits", "One-hot, 5 bits"],
          rows: [
            ["GREEN", "3'd0 = 000", "5'b00001"],
            ["YELLOW", "3'd1 = 001", "5'b00010"],
            ["RED", "3'd2 = 010", "5'b00100"],
            ["WALK", "3'd3 = 011", "5'b01000"],
            ["FLASH", "3'd4 = 100", "5'b10000"],
            ["not a state", "101, 110, 111", "00000"],
          ],
          caption:
            "The same five traffic-light states under both encodings. The last row is the point: a 3-bit register can hold 8 values and only 5 of them mean anything. Those 3 spare values are illegal states — values the register can physically hold that the design never intends to use.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Which one this chapter's code uses",
          text: "The skeletons in this chapter and in the two lessons use binary encoding, because 3'd2 is easy to check on paper against the diagram and easy to read in a testbench. One-hot is the industry default for control logic on FPGAs and in most professional RTL, and most tools will offer to convert a design. The good news is that the choice barely touches the structure of the code: the `localparam` values change, the `case` branches do not. That is the whole reason to name your states — and the next block is what `localparam` is.",
        },
        {
          kind: "code",
          caption:
            "Naming the states. Five `localparam`s in binary and the same five in one-hot, so the encoder can flip between them by changing one line.",
          code: `  // Binary encoding: 3 bits, because 5 states need 2^3 = 8 values.
  localparam [2:0] GREEN  = 3'd0,
                   YELLOW = 3'd1,
                   RED    = 3'd2,
                   WALK   = 3'd3,
                   FLASH  = 3'd4;

  // One-hot encoding of the same five states: 5 bits, one lit at a time.
  localparam [4:0] GREEN_O  = 5'b00001,
                   YELLOW_O = 5'b00010,
                   RED_O    = 5'b00100,
                   WALK_O   = 5'b01000,
                   FLASH_O   = 5'b10000;`,
          note: "`localparam` is a *named constant*. It is fixed when the design is prepared and cannot be changed at run time — there is no hardware for it, it is just a label the tool substitutes. The list syntax is legal Verilog-2001: one `localparam` keyword, one width, then several names separated by commas, and a single semicolon at the end. Expect Verilator to report the second group as UNUSEDSIGNAL, which is exactly right — only one encoding is live in any given build.",
        },
        {
          kind: "para",
          text: "The rule that follows from this is short and absolute: never write a raw number where a state belongs. Write `state == RED`, not `state == 3'd2`. Three reasons, and the last one is the killer. It reads as the specification rather than the encoding, so a reader does not have to hold the encoding table in their head. It is checked by the compiler — if you rename a state or change the encoding, every use updates, and a typo becomes a compile error instead of a state that silently matches nothing. And it means the encoding is one line you can change. Switch these five lines to one-hot and the rest of the module is untouched; change the numbers behind them one at a time by hand and nothing tells you what you broke.",
        },
        {
          kind: "trap",
          wrong: "`if (state == 2'd2) state <= 2'd0;` — raw numbers instead of state names.",
          right: "`if (state == RED) state <= GREEN;`",
          why: "It compiles, it works, and it is wrong the moment you add a fourth state in the middle of the list or switch to one-hot. Every bare number is a place you have to remember to update by hand, and there is no compiler message when you miss one — the branch just stops matching, and the machine walks into the `default` and resets itself, over and over, for a reason nothing in the output will tell you.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (6 minutes)",
          items: [
            "Encode the five traffic-light states in binary on 3 bits: 0, 1, 2, 3, 4. Then write each one as a 3-character string of 0s and 1s and check the count matches the value.",
            "Encode the same five in one-hot on 5 bits. Notice that the binary version is 000, 001, 010, 011, 100 while the one-hot version is 00001, 00010, 00100, 01000, 10000.",
            "Look at consecutive pairs and count the bits that change on a transition. Binary from 011 to 100 flips all three. One-hot from 01000 to 00100 flips exactly one. Write down why that matters in one sentence.",
            "List the values a 3-bit register can hold that are not one of your five states. There should be 3 of them, and each one is an illegal state your `default` branch has to be ready for.",
            "Now do the same for a 3-state machine: how many bits for binary, how many for one-hot, and how many illegal values in the binary version?",
          ],
        },
      ],
    },
    {
      slug: "mealy-vs-moore",
      title: "Mealy and Moore: where the output comes from",
      lede: "One question separates the two: does the output look at the inputs, or only at the state?",
      blocks: [
        {
          kind: "para",
          text: "Everything so far has assumed the output is a function of the state alone. That is a *Moore machine*. A *Mealy machine* is the other kind: the output may depend on the state **and** the current input. That is the entire difference. Everything downstream of it — how fast the machine responds, how many states you need, how carefully you have to think about timing — falls out of this one choice.",
        },
        {
          kind: "para",
          text: "The consequence is about *when* the output can change. In a Moore machine the output is decoded from the register, and the register only moves on a clock edge, so the output can only change on a clock edge. Ever. In a Mealy machine the output is decoded from the state register *and* from a live input wire, so the output can change at any instant — including halfway between two clock edges, the moment an input moves. That is the whole practical difference, and it is worth being precise about it, because \"the output changed and nobody clocked anything\" is otherwise an alarming thing to see in a waveform.",
        },
        {
          kind: "table",
          head: ["", "Moore", "Mealy"],
          rows: [
            ["Output depends on", "the current state only", "the current state and the inputs"],
            ["When the output can change", "only on a clock edge", "any time, including between edges"],
            ["Clock cycles to react to an input", "one — the edge that takes you to the next state", "the same cycle, before the edge"],
            ["States needed for a given behaviour", "often more — you may need a state per output value", "often fewer"],
            ["Glitch risk", "low, because outputs only move on an edge", "higher, because combinational paths between inputs can glitch"],
            ["Easier to reason about", "yes, strongly", "no — you must track input and state together"],
          ],
          caption:
            "The same machine, drawn two ways. Both are correct. The choice is a timing trade: Moore is predictable, Mealy is fast.",
        },
        {
          kind: "code",
          caption:
            "The Mealy flavour of the door lock. Compare it with the Moore version earlier: the difference is one line, and the behaviour difference is one clock edge.",
          code: `module door_lock_mealy (
  input  logic clk,
  input  logic rst,
  input  logic digit_ok,
  input  logic digit_bad,
  output logic  unlocked
);
  localparam LOCKED   = 1'b0,
             UNLOCKED = 1'b1;

  logic state;
  logic next;

  always_comb begin
    next     = LOCKED;
    unlocked = 1'b0;
    case (state)
      LOCKED: begin
        next     = digit_ok ? UNLOCKED : LOCKED;
        unlocked = 1'b0;
      end
      UNLOCKED: begin
        next     = digit_bad ? LOCKED : UNLOCKED;
        // The only line that differs from the Moore version.
        // The output now also looks at digit_bad.
        unlocked = digit_bad ? 1'b0 : 1'b1;
      end
      default: begin
        next     = LOCKED;
        unlocked = 1'b0;
      end
    endcase
  end

  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= LOCKED;
    else     state <= next;
  end
endmodule`,
          note: "Read the two versions' behaviour side by side. Suppose the door is UNLOCKED and somebody enters a wrong digit. In the Moore version, `unlocked` stays 1 for the whole of that cycle and falls one clock edge later, when the state catches up. In the Mealy version, `unlocked` falls the instant `digit_bad` goes high — before any clock edge, while the state register still says UNLOCKED. The Mealy version reacts sooner. It also means the output depends on a wire that is changing asynchronously, which is where the glitch risk comes from.",
        },
        {
          kind: "analogy",
          text: "A shop's opening sign. A Moore shop hangs the sign in the window when the shop opens, so the sign changes at the moment of opening and never wobbles. A Mealy shop wires the sign to the door switch, so the sign lights the instant a customer pushes the door — faster, and it flickers every time somebody leans on the door. Both shops are open at the same times. The difference is only where the sign is wired.",
        },
        {
          kind: "para",
          text: "So which do you pick? Ask what the output is connected to. If it feeds a flip-flop or a register on the far side — a data bus, a counter, a state bit in a neighbouring module — then its value only matters at a clock edge, and a Moore machine gives you exactly that with no timing analysis. If it drives something combinational downstream, or something that needs the freshest possible answer, Mealy's early response is worth the care. The default advice for a beginner writing a traffic light, a keypress decoder or a vending machine: Moore. It is the easier one to reason about, it is the easier one to time, and the speed you give up is at most one clock cycle.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "The distinction is about the output, never about the next state",
          text: "Both Moore and Mealy machines decide their next state from the state and the inputs. That is not optional — a machine whose next state ignored the inputs could not react to anything. So a Mealy machine is never \"faster to change state\". The state always moves on the clock edge. What Mealy does is let the *output* move early, and the price is that the output is now a function of a wire that is not synchronised to anything.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Take the traffic light you are about to build: states MG, MY, SG and SY, with a pedestrian request that stretches the next side green. Decide whether the light outputs should depend on anything but the state. Write one sentence justifying your answer from output timing, as the first practice item in the lesson asks.",
            "Now invent a case where Mealy is the right answer. Good candidates are a circuit that must react in the same cycle, or a machine where adding a state per output value would double its size. Write down which you chose and why, in terms of when the output has to be valid.",
            "Count the states each flavour needs for the behaviour \"hold the output for exactly one cycle after an event\". The Moore answer needs a state whose output is 1 and a state whose output is 0. Write down what the Mealy answer would look like, and then check: can a Moore machine ever produce the Mealy timing? Explain why not in one sentence.",
            "Go back to the Mealy door lock and trace one cycle by hand. Start in UNLOCKED with `digit_bad` going high mid-cycle. Write down the value of `unlocked` before, at, and after the next clock edge.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "A Moore machine's `alarm` output goes high for one cycle when a fault is detected. In which cycle is `alarm` high, relative to the input that caused the fault?",
              a: "The cycle *after* the fault input is seen. The input changes the next-state table, the next state is committed on the following clock edge, and only then does the output decode see the new state. One full cycle of latency, and the output is guaranteed to be a clean, settled value at every clock edge. A Mealy version would go high in the same cycle, the instant the fault input moved — one cycle earlier, and noisier.",
            },
            {
              q: "Someone writes an FSM and says \"it's Mealy, because the output depends on the input\". What did they get wrong?",
              a: "Mealy and Moore both use the inputs to decide the next state. What distinguishes them is only the output. If the output line is written as a function of the state alone, it is Moore, no matter how much the transition table reads the inputs. To be Mealy, the output assignment itself must reference an input — which is exactly the one line that changed in the door lock above.",
            },
          ],
        },
      ],
    },
    {
      slug: "three-blocks",
      title: "The three blocks every FSM is made of",
      lede: "State register, next-state logic, output logic — and only one of them is allowed to remember.",
      blocks: [
        {
          kind: "para",
          text: "Strip away the notation and every finite state machine is made of three parts. They are not three options, and you do not get to leave one out. Every FSM in this chapter and every FSM you will ever read contains all three.",
        },
        {
          kind: "define",
          items: [
            { term: "state register", meaning: "The memory. Sequential logic — it holds the current state and only changes on a clock edge." },
            { term: "next-state logic", meaning: "The transition table. Combinational logic — from the state and the inputs, it computes the state to move to." },
            { term: "output logic", meaning: "The output table. Combinational logic — from the state (Moore) or the state and inputs (Mealy), it computes the outputs." },
          ],
        },
        {
          kind: "para",
          text: "Why does exactly one of these have to be sequential? Because a machine needs memory, and the *only* place memory is allowed to live is a register. A combinational block is pure: the same inputs always give the same outputs, instantly, with no history. That is what makes it analysable and it is what lets the tool turn it into gates. So the current state must be a register, because it is the one thing that has to survive from one cycle to the next. The other two are functions of that register and of the input wires, so they are recomputed from scratch whenever anything moves. You can draw the whole machine in one breath: a register, and a pile of gates beside it.",
        },
        {
          kind: "code",
          caption:
            "The anatomy, with all three blocks visible. This is correct but not the style you should write — the last topic shows the two-paragraph form you will actually use.",
          code: `module fsm_anatomy (
  input  logic clk,
  input  logic rst,
  input  logic go,
  output logic  done
);
  localparam S0 = 1'b0,
             S1 = 1'b1;

  logic state;   // block 1: the state register
  logic next;    // block 2: the answer of the next-state logic

  // Block 1 — state register. Sequential. This is the memory.
  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= S0;
    else     state <= next;
  end

  // Block 2 — next-state logic. Combinational.
  always_comb begin
    next = S0;
    case (state)
      S0: if (go) next = S1;
      S1: next = S0;
      default: next = S0;
    endcase
  end

  // Block 3 — output logic. Combinational. Moore, so state only.
  always_comb begin
    done = 1'b0;
    case (state)
      S0: done = 1'b0;
      S1: done = 1'b1;
      default: done = 1'b0;
    endcase
  end
endmodule`,
          note: "Read it as three answers. The register answers \"where am I\". The next-state block answers \"where do I go\". The output block answers \"what does the world see\". Blocks 2 and 3 are both `always_comb`, both use blocking `=`, and neither may look at the clock.",
        },
        {
          kind: "para",
          text: "Two of the three blocks are a `case` statement on the same signal, and that is not a coincidence — they are two lookup tables on one key. The `case (state)` form is not a convenient shorthand. It *is* a lookup table, with the state as the key and the branch bodies as the rows. Once you see it that way, writing an FSM stops being writing code and becomes filling in a table you already drew on paper.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the next-state block must not be in the clocked block",
          text: "It is tempting to write the `case` inside `always @(posedge clk)`, so the state updates once per cycle. It compiles, and it produces a machine that is subtly wrong: the new state then depends on the value of `state` after it was just updated, which is a race between two statements reading and writing the same variable. Chapter 8 calls this out as BLKSEQ — blocking assignment inside a clocked block. Moving the `case` out into its own `always_comb` removes the race entirely, because the combinational block only ever reads `state`, and the clocked block only ever writes it. One reader, one writer, no ordering problem.",
        },
        {
          kind: "trap",
          wrong: "`always_ff @(posedge clk or posedge rst) begin state <= ...; case (state) ... endcase end` — the case inside the clocked block.",
          right: "The clocked block does one thing: `if (rst) state <= RESET; else state <= next;`. The `case` lives in an `always_comb`. `next` is the signal between them.",
          why: "With the `case` inside the clocked block, whether the new branch is chosen depends on the old or the new value of `state`, depending on whether you used `=` or `<=`. With blocking `=` it takes the new value; with nonblocking `<=` it takes the old one. Neither is what the transition table says. Splitting the blocks makes the question disappear, because the combinational block can only ever see a settled value.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (6 minutes)",
          items: [
            "Take the three-state motor controller you designed earlier. Label the three blocks: which of them is a register, and which two are combinational?",
            "Write down every signal each block reads and every signal it writes. Then check for a single reader per signal: `state` should be read by the combinational blocks and written only by the clocked block. If any signal has two writers, you have found a bug.",
            "Trace the `fsm_anatomy` module above by hand. Start at S0 with `go` low. Write down the value of `state`, `next` and `done` right now. Then set `go` high and write the three values again, before any clock edge. Then put in one clock edge and write them once more.",
            "On that last step, notice that `done` only became 1 *after* the edge, even though `go` was high well before it. Write one sentence saying why. That sentence is the whole of Moore output timing.",
          ],
        },
      ],
    },
    {
      slug: "two-paragraph-style",
      title: "Writing an FSM in two paragraphs",
      lede: "One combinational block that decides, one clocked block that remembers. Write them in that order and the file reads top to bottom like a protocol.",
      blocks: [
        {
          kind: "para",
          text: "\"Two paragraphs\" is the name for the style this chapter teaches, and the second lesson is named after it. The rule is that an FSM is written as exactly two `always` blocks: one `always_comb` that answers \"where do I go, and what do I emit\", and one `always_ff @(posedge clk or posedge rst)` that answers \"save it\". The blocks are short, the order is fixed, and nothing else in the file needs to know how the machine works.",
        },
        {
          kind: "code",
          caption:
            "The full two-paragraph skeleton, as a working three-state Moore machine: idle, doing a job, then reporting it finished. Copy this shape for every FSM you write for the rest of the track.",
          code: `module fsm_skeleton (
  input  logic clk,
  input  logic rst,
  input  logic go,        // a job has been handed over
  input  logic finish,    // the job is done
  output logic  busy,
  output logic  done
);
  // Names for the states. Never a raw number in the code below.
  // 3 states need 2 bits, because 2^2 = 4 values.
  localparam [1:0] IDLE = 2'd0,
                   WORK = 2'd1,
                   DONE = 2'd2;

  logic [1:0] state;       // the memory
  logic [1:0] next;        // the next-state table's answer

  // ---- paragraph one: decide ----
  always_comb begin
    next  = IDLE;        // default next state
    busy  = 1'b0;        // default outputs
    done  = 1'b0;
    case (state)
      IDLE: begin
        next = go ? WORK : IDLE;
        busy = 1'b0;
        done = 1'b0;
      end
      WORK: begin
        next = finish ? DONE : WORK;
        busy = 1'b1;
        done = 1'b0;
      end
      DONE: begin
        next = IDLE;
        busy = 1'b0;
        done = 1'b1;
      end
      default: begin
        next = IDLE;
        busy = 1'b0;
        done = 1'b0;
      end
    endcase
  end

  // ---- paragraph two: remember ----
  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= IDLE;
    else     state <= next;
  end
endmodule`,
          note: "The two paragraphs are the part that never changes. Everything else — how many states, what they are called, what the branches say — is your design, written into the slots the shape provides. Notice also that the clocked block is three lines of logic and nothing else: reset wins, otherwise adopt what paragraph one decided. If your clocked block grows an `if` or a `case` of its own, the structure has gone wrong.",
        },
        {
          kind: "steps",
          title: "Why the order is what it is",
          items: [
            {
              head: "Paragraph one comes first",
              body: "It reads as the specification: given where I am and what the inputs are doing, here is where I go and here is what I emit. Everything in it is a statement about the present instant.",
            },
            {
              head: "It is `always_comb`",
              body: "The name says it all: the block re-runs whenever the state or any input changes, so `next` and the outputs are never stale. It is combinational, so inside it you use the ordinary blocking assignment `=`.",
            },
            {
              head: "The defaults go above the `case`",
              body: "`next = ST_RESET;` and the outputs set to something defined, before any branch. Two reasons. A branch you forget to fill in then produces a sensible value rather than an unpredictable one. And it means the `default` branch is not the only thing standing between you and undefined behaviour — belt and braces, and it costs two lines.",
            },
            {
              head: "The `case` is the transition table",
              body: "One branch per state, written in the order you drew them. If the state needs an internal `if` to pick a destination, that `if` tests an input and the whole thing reads `if (go) next = ST_RUN;` — no `begin`/`end` needed, because it is one statement.",
            },
            {
              head: "The `default` branch returns to the reset state",
              body: "Not to a random state, and not left empty. The reset state is by definition the one the machine is meant to be in when something has gone wrong, so sending illegal states there gives you a machine that heals itself. This is covered properly two topics down.",
            },
            {
              head: "Paragraph two is three lines and never grows",
              body: "`always_ff @(posedge clk or posedge rst)`, reset wins, otherwise adopt `next`. If your clocked block has anything else in it — arithmetic, a `case`, a comparison — that is the signal you have got the structure wrong.",
            },
            {
              head: "`<=` in paragraph two, `=` in paragraph one",
              body: "The nonblocking assignment belongs in the clocked block, where every register on the edge samples the value the wires had *before* the edge. The blocking assignment belongs in the combinational block, where there is no edge and no past. Getting these the wrong way round is not a style preference; it is the difference between a machine that works and one that quietly produces a different circuit than the one you read.",
            },
          ],
        },
        {
          kind: "trap",
          wrong: "Using blocking `=` in the clocked block: `always_ff @(posedge clk) state = next;`",
          right: "`always_ff @(posedge clk or posedge rst) begin if (rst) state <= ST_RESET; else state <= next; end`",
          why: "In a block with several registers, nonblocking `<=` updates all of them from the same set of old values, in one step. Blocking `=` updates them one at a time, so a later line can read a value the earlier line just changed. With one register you will not see the difference, which is why this survives small examples and then breaks a larger machine in a way that looks like a logic bug. Verilator's BLKSEQ warning is aimed squarely at this mistake.",
        },
        {
          kind: "trap",
          wrong: "Assigning the outputs inside only some `case` branches: the `ST_RUN` branch sets `done` and the others say nothing.",
          right: "Assign every output in every branch, or — more often — set the defaults once above the `case` and only override them where they change.",
          why: "A combinational block that does not assign a signal on every path is a latch, and Verilator will say LATCH. A latch is a register with no clock: it holds its value until the next time that particular path is taken. For a state machine that is always wrong, because the whole design rests on every output being a function of the current state and nothing else.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Take the transition table you drew for the three-state motor controller. Copy it out in full before you write any code.",
            "Write the `localparam` line for three states on 2 bits, with a name for each. Work out the width first with the 2ⁿ rule, then fill in the values.",
            "Write paragraph one. Start with `next = IDLE;` and `busy = 1'b0;`, then one `case` branch per state, then the `default` branch reading `default: begin next = IDLE; busy = 1'b0; end`.",
            "Write paragraph two. It should be three lines of logic and nothing else.",
            "Now count the blocks in your file. There should be exactly two `always` blocks. If there are three, find out why — and the usual reason, a separate counter for the phase timing, is a perfectly good reason.",
            "Trace it: start reset, then step through four clock edges with `go` high and `stop` low, then two more with `stop` high. Write `state` and `busy` at every edge. If your table and your trace disagree, the table is right and the code is wrong — that is the whole point of drawing it first.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Why does the skeleton put `next = ST_RESET;` above the `case` when there is also a `default` branch that sets the same thing?",
              a: "Because the two cover different failure modes. The `default` catches an *illegal state* — a value in `state` that is not one of your states. The assignment above the `case` catches a *missing assignment* — a legal state whose branch you forgot to finish. With both in place, neither mistake can produce undefined behaviour. With only the `default`, a half-written branch falls through and the outputs latch.",
            },
            {
              q: "You have written the two blocks and Verilator reports LATCH on one of the outputs. What did you almost certainly do?",
              a: "Set the output in some branches of the `case` and not others, so there is a path through the block that leaves it alone. Fix it by setting every output once above the `case` and overriding only where it changes — or by assigning it in every branch, even with the trivial value. The `LATCH` message is the tool telling you a combinational block has acquired memory, and a state machine is never allowed to do that.",
            },
          ],
        },
      ],
    },
    {
      slug: "reset-and-illegal-states",
      title: "Reset, illegal states, and the machine that comes back to life",
      lede: "A state machine whose memory starts as x is dead on the first clock edge, and the fix is two lines.",
      blocks: [
        {
          kind: "para",
          text: "Everything so far assumed the machine starts in a real state. Real hardware does not. At power-up a flip-flop holds `x` — the unknown value from chapter 1 — and it holds it until something puts a known value in it. If your `case (state)` has no branch for `x`, no branch matches, and the machine does something undefined. With the two-line fix above, it walks straight back to the reset state on the next clock edge and carries on. Without them, it is dead.",
        },
        {
          kind: "para",
          text: "This is why `always_ff @(posedge clk or posedge rst)` appears in the skeleton. The `posedge rst` in the sensitivity list is what makes the reset *asynchronous*: the moment reset goes high, every state register is forced to the reset state, without waiting for a clock edge. That matters for the first few microseconds after power-up, when there is no clock to wait for. The rule for where reset should put the machine is simple: the reset state must be a state you actually designed — usually the one the machine is meant to idle in, like `IDLE` or `GREEN`. Resetting to a state that exists only for reset is a bug, because the `case` has no branch that behaves sensibly there.",
        },
        {
          kind: "code",
          caption:
            "The same three-state machine, with and without a reset. The only difference is three words in the clocked block — and the behaviour difference is total.",
          code: `// With reset. The machine has a defined starting point, and it is
// the same point it returns to from an illegal state.
module fsm_with_reset (
  input  logic clk,
  input  logic rst,
  input  logic go,
  output logic  done
);
  localparam IDLE = 1'b0,
             WORK = 1'b1;

  logic state;
  logic next;

  always_comb begin
    next = IDLE;
    done = 1'b0;
    case (state)
      IDLE: next = go ? WORK : IDLE;
      WORK: begin next = IDLE; done = 1'b1; end
      default: begin next = IDLE; done = 1'b0; end
    endcase
  end

  always_ff @(posedge clk or posedge rst) begin
    if (rst) state <= IDLE;
    else     state <= next;
  end
endmodule

// Without reset. Legal, compiles, and a bad idea.
module fsm_no_reset (
  input  logic clk,
  input  logic go,
  output logic  done
);
  localparam IDLE = 1'b0,
             WORK = 1'b1;

  logic state;
  logic next;

  always_comb begin
    next = IDLE;
    done = 1'b0;
    case (state)
      IDLE: next = go ? WORK : IDLE;
      WORK: begin next = IDLE; done = 1'b1; end
      default: begin next = IDLE; done = 1'b0; end
    endcase
  end

  always_ff @(posedge clk) begin
    state <= next;
  end
endmodule`,
          note: "In simulation the second version starts with `state` as x, and `case (x)` matches no branch, so `next` keeps whatever the default set it to. If the default is missing too, `next` latches at x and you have a machine that outputs x forever. A synchronous reset — `always_ff @(posedge clk)` with `if (rst) state <= IDLE;` inside it — also works, and waits for the next edge. Chapter 8 covers the difference; for an FSM either is fine as long as one of them is there.",
        },
        {
          kind: "para",
          text: "The `default` branch is the other half. It is not a formality. Consider a 5-state machine on a 3-bit register: eight values are representable and only five of them mean something. Something — an uninitialised register, a corrupted bit, a single upset from radiation or a nearby switching event — can leave the register holding 101, and now the machine is in a state it has no name for. The `default` branch decides what happens next, and the only sensible answer is: go back to the reset state and try again.",
        },
        {
          kind: "table",
          head: ["What you see", "What is actually happening"],
          rows: [
            ["state is x, all outputs x, forever", "No reset, and no default branch. The x never gets replaced."],
            ["machine resets itself over and over", "A legal state is being reached whose branch you never wrote, so `default` fires every cycle. Check for a state value your encoding does not define."],
            ["CASEINCOMPLETE warning", "The `case` covers only part of the value range and has no `default`. Verilator is telling you the machine can be in a situation you did not plan for."],
            ["LATCH warning on an output", "A combinational block does not assign that output on every path, so it has acquired memory."],
            ["outputs correct, one cycle late", "That is not a bug. It is what a Moore machine does."],
          ],
          caption:
            "Every one of these is a real message you will see in this track. The first two are silent — no warning, just wrong behaviour — which is why the fix is structural rather than diagnostic.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make the default branch and the reset agree",
          text: "Write `if (rst) state <= ST_RESET;` in the clocked block and `default: next = ST_RESET;` in the combinational block, and you get a self-starting machine for free. Illegal state? It returns to `ST_RESET` on the next edge. Still illegal after that? You have a real hardware fault, but the machine is sitting in a defined state driving defined outputs instead of x's. That is the whole recovery story, and it costs one line.",
        },
        {
          kind: "trap",
          wrong: "`if (rst) state <= 2'd3;` when you only defined states 0, 1 and 2.",
          right: "Reset to a state that has a `case` branch: `if (rst) state <= IDLE;`",
          why: "You have just built a machine whose documented starting point is one of its own illegal states. At power-up it resets to 3, the `case` matches no branch, the `default` sends it to whatever `default` says, and if that disagrees with the reset value you get a machine that bounces between two states forever, or a machine that sits in a state nobody drew. Always check that your reset value appears in your `case`.",
        },
        {
          kind: "trap",
          wrong: "Writing `default:` and setting only `next`, leaving the outputs alone.",
          right: "`default: begin next = ST_RESET; done = 1'b0; end` — every output the block drives, in the default branch too.",
          why: "The outputs are assigned by this block, so if the `default` branch does not set them they keep whatever value they had, which for a `reg` means they latch. The machine recovers its state and still drives garbage. It is a subtle one because the state recovery works, so the machine looks half-alive.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (6 minutes)",
          items: [
            "Take the five-state traffic light on a 3-bit register. List all eight values the register can hold, and mark which five are states and which three are illegal.",
            "Pick one of the illegal values, 3'b111, and trace what your machine does with it, assuming you wrote `default: next = GREEN;` and the reset state is `GREEN`.",
            "Now trace 3'b101 after a single clock edge, and after two. What is `state` at each step, and what are the outputs?",
            "Write the one line that guarantees a machine can never be left with an undefined output, and say which block it goes in.",
            "Finally: check that your reset value is one of the five states, and that the `default` branch returns to the same one. If those two disagree, the machine has a start state and a recovery state, which is a confusing place to be.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Your 4-state machine runs on 2 bits, and Verilator reports CASEINCOMPLETE. Which state is unreachable, and is that a problem?",
              a: "With 2 bits you can hold 4 values, and 4 states use all of them, so no state is unreachable by design — but the `case` has no `default` branch, so Verilator flags that there is a value it cannot check. It is worth fixing: add `default: begin next = IDLE; done = 1'b0; end`. The case is that a synthesised flip-flop can in principle be upset into a state outside your plan, and the `default` is where you decide what happens then. For a 4-state machine on 2 bits the risk is small; for a 12-state machine on 4 bits, 4 of the 16 values are genuinely unrepresented.",
            },
            {
              q: "Why is a synchronous reset — `if (rst) state <= IDLE;` inside a plain `always_ff @(posedge clk)` — acceptable for an FSM, when chapter 8 treats resets as a careful choice?",
              a: "Because the FSM's own register only ever matters at a clock edge, so waiting for the next edge before resetting costs nothing in steady state. The one thing that changes is power-up: without `posedge rst` in the sensitivity list, the register holds x for every cycle until the first clock edge. If the clock is running from power-up, that is one cycle of x and then correct. If the design has a reset held low for a long time before the clock starts, you want the asynchronous form so the machine is defined immediately.",
            },
          ],
        },
      ],
    },
    {
      slug: "worked-example",
      title: "Worked example: the traffic light controller",
      lede: "The practice problem, start to finish: four states, a counter, and a pedestrian button.",
      blocks: [
        {
          kind: "para",
          text: "The traffic light is the practice problem for this chapter, and it is worth building carefully because it uses everything: four states, a Moore output decode, a counter, a default branch, and a reset. The lesson version below is `top(clk, rst, main_light, side_light)` with an active-high `rst` — the exact ports the lesson bench instantiates — and it passes that bench with zero errors. The pset version is `top(clk, rst, ped, main_light, side_light)`, the same four states plus a `ped` input: a request during main green or yellow latches and stretches the next side green to five cycles, while a request during side green or yellow is ignored. Here is the design in the three lists, before any code.",
        },
        {
          kind: "points",
          title: "The design, in three lists",
          items: [
            "States: `MG` (main road green), `MY` (main road yellow), `SG` (side road green), `SY` (side road yellow). Two bits hold 2² = 4 values and all four are used, so there are no unused encodings — the `default` still stays, because the register can hold `x`.",
            "Transitions: `MG` to `MY` after three green cycles. `MY` to `SG` after one yellow cycle. `SG` to `SY` after three green cycles — five when a pedestrian asked. `SY` to `MG` after one yellow cycle.",
            "Outputs, Moore: `main_light` is `2'b10` only in `MG` and `2'b01` only in `MY`; `side_light` is `2'b10` only in `SG` and `2'b01` only in `SY`; both are `2'b00` everywhere else. `00` means red, `01` yellow, `10` green — the same codes the starter file uses.",
            "Why the counter and not a timer input: the greens last a fixed three cycles, so the count lives in a 2-bit register next to the state. A stretchable side green needs one more bit, and the pset version below shows exactly that.",
          ],
        },
        {
          kind: "table",
          head: ["State", "Leave when", "Go to", "main_light", "side_light"],
          rows: [
            ["MG", "cnt == 2, the third green cycle", "MY", "10", "00"],
            ["MY", "always, after one cycle", "SG", "01", "00"],
            ["SG", "cnt == 2, the third green cycle", "SY", "00", "10"],
            ["SY", "always, after one cycle", "MG", "00", "01"],
            ["not a state", "anything", "MG", "00", "00"],
          ],
          caption:
            "One row per state, plus the `default` row. A green lasts three samples because the counter runs 0, 1, 2 and leaves on 2; a yellow lasts one because it leaves unconditionally.",
        },
        {
          kind: "code",
          caption:
            "The lesson version: four states, a counter, the lesson bench's ports. Paste it in and all seven lesson checks pass.",
          code: `module top (
  input  logic clk,
  input  logic rst,          // active-high async reset, like the bench
  output logic [1:0] main_light,
  output logic [1:0] side_light
);
  // Light codes: 2'b00 RED, 2'b01 YELLOW, 2'b10 GREEN.
  localparam [1:0] MG = 2'd0,
                   MY = 2'd1,
                   SG = 2'd2,
                   SY = 2'd3;
  logic [1:0] state, next;
  logic [1:0] cnt, cnt_next;

  // ---- paragraph one: decide ----
  always_comb begin
    next = state;
    cnt_next = cnt;
    main_light = 2'b00;
    side_light = 2'b00;
    case (state)
      MG: begin
        main_light = 2'b10;
        if (cnt == 2'd2) begin next = MY; cnt_next = 2'd0; end
        else cnt_next = cnt + 2'd1;
      end
      MY: begin
        main_light = 2'b01;
        next = SG; cnt_next = 2'd0;
      end
      SG: begin
        side_light = 2'b10;
        if (cnt == 2'd2) begin next = SY; cnt_next = 2'd0; end
        else cnt_next = cnt + 2'd1;
      end
      SY: begin
        side_light = 2'b01;
        next = MG; cnt_next = 2'd0;
      end
      default: begin
        next = MG; cnt_next = 2'd0;
      end
    endcase
  end

  // ---- paragraph two: remember (state and counter are both registers) ----
  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      state <= MG;
      cnt   <= 2'd0;
    end else begin
      state <= next;
      cnt   <= cnt_next;
    end
  end
endmodule`,
          note: "Three details worth pausing on. `cnt == 2'd2` leaves on the third cycle, because the counter runs 0, 1, 2 — that is why a green holds three bench samples while a yellow, which leaves unconditionally, holds one. The output defaults above the `case` are the safety net, and the `default` branch returns to the same state the reset uses. And the module is named `top` with the lesson bench's ports because this listing is the submission shape.",
        },
        {
          kind: "para",
          text: "The pset keeps these four states and adds one input, `ped`, so the ports become `top(clk, rst, ped, main_light, side_light)` with the same active-high `rst`. A request that arrives while the main road has the green — in `MG` or `MY` — is latched into a one-bit register `ped_req`; a request that arrives during `SG` or `SY` is ignored, because the latch only updates in `MG` and `MY` and is cleared on the way out of `SY`. The only other change is the side-green exit: it waits for `cnt == 3'd4` when `ped_req` is set instead of `cnt == 3'd2`, which is why the counter grows to 3 bits. Here is that version in full — it passes the pset's thirteen checks, including the five-cycle extended green and both ignored-request rows.",
        },
        {
          kind: "code",
          caption:
            "The pset version: the same four states, plus the pedestrian latch. Only the counter width, the latch, and one exit condition differ.",
          code: `module top (
  input  logic clk,
  input  logic rst,          // active-high async reset, like the bench
  input  logic ped,          // pedestrian request
  output logic [1:0] main_light,
  output logic [1:0] side_light
);
  // Light codes: 2'b00 RED, 2'b01 YELLOW, 2'b10 GREEN.
  localparam [1:0] MG = 2'd0,
                   MY = 2'd1,
                   SG = 2'd2,
                   SY = 2'd3;
  logic [1:0] state, next;
  logic [2:0] cnt, cnt_next;
  logic ped_req;   // latched while the main road has the green

  // ---- paragraph two: remember (state, counter and latch are registers) ----
  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      state   <= MG;
      cnt     <= 3'd0;
      ped_req <= 1'b0;
    end else begin
      state <= next;
      cnt   <= cnt_next;
      if (state == SY) ped_req <= 1'b0;                          // served: clear on the way home
      else if (state == MG || state == MY) ped_req <= ped_req | ped;  // latch while main has the road
    end
  end

  // ---- paragraph one: decide ----
  always_comb begin
    next = state;
    cnt_next = cnt;
    main_light = 2'b00;
    side_light = 2'b00;
    case (state)
      MG: begin
        main_light = 2'b10;
        if (cnt == 3'd2) begin next = MY; cnt_next = 3'd0; end
        else cnt_next = cnt + 3'd1;
      end
      MY: begin
        main_light = 2'b01;
        next = SG; cnt_next = 3'd0;
      end
      SG: begin
        side_light = 2'b10;
        if (cnt == (ped_req ? 3'd4 : 3'd2)) begin next = SY; cnt_next = 3'd0; end
        else cnt_next = cnt + 3'd1;
      end
      SY: begin
        side_light = 2'b01;
        next = MG; cnt_next = 3'd0;
      end
      default: begin
        next = MG; cnt_next = 3'd0;
      end
    endcase
  end
endmodule`,
          note: "`ped_req` is the whole extension: one flop, set in two states, cleared in one, read in one. Everything else — the state names, the output decode, the yellow timing — matches the lesson version. If the extended green lasts four cycles instead of five, the limit constant is wrong; if a side-green request extends anything, the latch condition is.",
        },
        {
          kind: "para",
          text: "You will notice the clocked block registers two things: the state and the counter. That does not break the two-paragraph rule — the rule is about *kinds* of logic, not the number of signals. Both registers live in the sequential paragraph because both are memory. The counter is not a separate module here; it is a value the state machine carries with it, and the next chapter, on datapaths, is entirely about the pattern where that value gets its own module and the FSM becomes a controller that points at it.",
        },
        {
          kind: "steps",
          title: "Trace it by hand before you compile",
          items: [
            {
              head: "Start reset",
              body: "Hold `rst` high across an edge. `state` is `MG` and `cnt` is 0, and the outputs are already correct: `main_light` reads `2'b10`, `side_light` reads `2'b00`. The combinational block decodes `state`, not `rst`, so the lights are right while reset is still held, rather than waiting for it to drop.",
            },
            {
              head: "Release reset, watch MG",
              body: "`ped` is 0. The next two edges take `cnt` 0 → 1 → 2 with `state` staying `MG`: three samples of main green. On the edge where `cnt` already holds 2, paragraph one computes `next = MY` with `cnt_next = 0` — the counter runs 0, 1, 2 and leaves on 2, which is why a constant of 2 gives three cycles, not two.",
            },
            {
              head: "MY and into SG",
              body: "One sample of main yellow (`2'b01`), because `MY` leaves unconditionally. On the very next edge the registers take `next = SG` with the counter at 0, and `side_light` becomes `2'b10` while `main_light` falls to `2'b00`. Both lights change on the same edge, which is the point of a Moore machine.",
            },
            {
              head: "SG, SY, and round again",
              body: "`cnt` climbs 0 → 1 → 2 for three samples of side green, then `next = SY` with the counter back to 0. One sample of side yellow, then `next = MG`, and the loop settles into MG, MY, SG, SY forever: 3 + 1 + 3 + 1 = 8 cycles per round trip.",
            },
            {
              head: "Now press the button (pset version)",
              body: "With `ped` at 1 during `MG`, paragraph one latches `ped_req` — combinationally, so it is true straight away, before any edge. But `state` is still `MG` and the outputs do not move until the next clock edge, because the outputs come from the state and not from `next`. That one-cycle delay is Moore timing, and in a design this small you can watch it happen. The latched request rides through `MY` into `SG`, where the exit waits for `cnt == 3'd4`: five samples of side green, then `SY`, which clears the latch on the way home.",
            },
            {
              head: "Press it at the wrong time",
              body: "With `ped` at 1 during `SG`, nothing latches — the latch only updates in `MG` and `MY` — so the exit still fires at `cnt == 3'd2` and the green lasts three. Same during `SY`, where the clear dominates. A request the controller was never meant to honour changes nothing, which is exactly what the two ignored-request bench rows check.",
            },
            {
              head: "Check the illegal state",
              body: "Force `state` to `x` in a testbench. The `case` finds no branch, the `default` fires, and on the next edge the machine is in `MG` with the counter at 0 and both lights at their defaults. It heals within one clock cycle. That is the `default` branch earning its lines — even though all four 2-bit values are used, `x` is always reachable in simulation.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (15 minutes)",
          items: [
            "Write the four states, the counter limits, the four transitions and the two light outputs as three lists, without looking at the code. This is the design, and the code is a transcription of it.",
            "Produce the full transition table on paper, including the `default` row that catches `x`.",
            "Add the pedestrian latch to your table: which states set `ped_req`, which state clears it, and which exit condition reads it. Confirm a request during `SG` or `SY` touches nothing.",
            "Now write the code, using the two-paragraph structure. Do not copy the file: transcribe your table, one `case` branch at a time, in SystemVerilog (`logic`, `always_comb`, `always_ff`).",
            "Trace one full round trip on paper: from reset, through `MG` × 3, `MY`, `SG` × 3, `SY`. Write `state`, `cnt` and both lights at every clock edge.",
            "Break it on purpose: change the `MG` exit to `cnt == 2'd1` and re-run your trace. How many green samples now, and which lesson-bench row fails first?",
            "Finally, work out how many bits the state register needs and confirm the `default` branch covers the only value your encoding leaves reachable in simulation.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "How you know the machine is correct",
          text: "There is no cleverness to the check. Take your transition table, pick any starting state and any input values, and walk the table one row at a time. Every row tells you the next state and the outputs. If the code agrees with the table on every step of the walk, the code is correct — and if it does not, the table is right and the code is wrong, because the table is the thing you designed. This is why the whole chapter insists on drawing the table first: the table is checkable by hand, and the code is not.",
        },
      ],
    },
    {
      slug: "what-to-check",
      title: "Checking your own FSM",
      lede: "A short list you can run against any machine you have written, before you compile.",
      blocks: [
        {
          kind: "para",
          text: "You now have the whole chapter. Before you compile anything, walk down this list. Every item is a question with a yes or no answer, and every one of them catches a bug that compiles cleanly and fails silently.",
        },
        {
          kind: "points",
          title: "Eight questions to ask of any FSM",
          items: [
            "Have I drawn the states, the transitions and the outputs as lists, before writing any code?",
            "Is every state name a `localparam`? Is there not one raw number being compared against `state` anywhere in the file?",
            "Is the state register the only signal with a clock edge in its sensitivity list?",
            "Do I have exactly two `always` blocks — or three, when a counter is genuinely needed — and is the clocked block doing nothing but `if (rst) ... else ...`?",
            "Does the combinational block assign `next` and every output before the `case`, and does the `default` branch set them all again?",
            "Is the reset value a state that has a `case` branch, and is it the same state the `default` branch returns to?",
            "Do I use `=` in the combinational block and `<=` in the clocked block, with no exceptions?",
            "Have I traced the table by hand for at least one full cycle, and does the code agree with every step?",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "A 6-state machine needs 3 bits, and three of the eight possible values are not states. What single line of code deals with that, and which block does it go in?",
              a: "`default: next = ST_RESET;` in the combinational block, along with the outputs. The 3 bits can hold 8 values and the design names 6, so 3 of them have no `case` branch. The `default` catches them and returns the machine to the reset state, so an uninitialised or corrupted register heals within one clock cycle instead of driving undefined outputs forever.",
            },
            {
              q: "Why does a Moore machine's output never change between clock edges, while a Mealy machine's can?",
              a: "A Moore output is decoded from the state register, and the state register only changes on a clock edge, so the output cannot change at any other time. A Mealy output is decoded from the state register *and* from the input wires, and input wires change whenever the outside world changes them. So the Mealy output follows the input immediately, mid-cycle, which is the faster behaviour and also the reason it needs more care.",
            },
            {
              q: "You have written the two blocks and the machine works, but a colleague says the output decode should be in the clocked block so that it is synchronous. Who is right?",
              a: "It depends entirely on what the output is connected to, and the honest answer is that it changes the machine. Moving the output decode into `always_ff @(posedge clk)` adds a register to the output path: the output then becomes the *previous* state's decode, one cycle behind, which is a Moore output with an extra cycle of delay rather than a fix. There is nothing to synchronise *to* — the state register is already clocked. The correct response is to look at what consumes the output: if it feeds a register downstream, Moore is already clean and the output is settled well before the edge.",
            },
            {
              q: "What is the one habit in this chapter that prevents the most bugs?",
              a: "Drawing the three lists — states, transitions, outputs — before writing any Verilog. Every FSM bug in this chapter is a disagreement between the code and a design that was never written down. A table can be checked row by row with a pencil; a 40-line `always` block cannot, and the compiler will not check either for you. The code is a transcription. If the transcription is faithful the machine works.",
            },
            {
              q: "Your 4-bit timer is compared against `4'd20`. What happens, and is the compiler going to tell you?",
              a: "Nothing useful, and no. A 4-bit value can only hold 0 to 15, so the constant 20 does not fit — it is truncated to 4, and `timer == 4'd4` is what actually gets compared. Depending on your time constants that means the comparison is either never true, so the machine hangs in that state forever, or it is true far too early, so the phase is far too short. Either way the failure is a wrong circuit rather than an error message. Check that every constant fits its signal.",
            },
          ],
        },
        {
          kind: "points",
          title: "What to take away",
          items: [
            "A state machine is a register holding a number, plus two lookup tables keyed on that number. The diagram and the table are the same thing drawn for people.",
            "Exactly one part has memory. The state register is sequential; the next-state and output logic are combinational and recompute continuously.",
            "Moore outputs come from the state alone and can only move on a clock edge. Mealy outputs may also read the inputs, so they can move in between. Moore is the safer default.",
            "States are numbers, and the mapping is your choice. Name every number with `localparam` and the rest of the code never has to care which encoding you picked.",
            "Reset to a real state, and give the `default` branch the same destination. Then an illegal state is a one-cycle inconvenience instead of a dead machine.",
            "Two paragraphs, always: one `always_comb` that decides, one `always_ff @(posedge clk or posedge rst)` that remembers. Blocking in the first, nonblocking in the second.",
            "Draw the table first. It is the only part of an FSM you can check with a pencil, and the code is supposed to be a transcription of it.",
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "binary encoding", meaning: "Numbering the states 0, 1, 2, 3… in the fewest bits that fit — 5 states need 3 bits, since 2² is too few and 2³ is 8." },
    { term: "combinational logic", meaning: "Logic with no memory: the same inputs always give the same outputs, immediately. Written as `always_comb` in this chapter." },
    { term: "default branch", meaning: "The `default:` line of a `case`, which handles every value the case did not name — usually by returning the machine to its reset state." },
    { term: "finite state machine (FSM)", meaning: "A machine with a fixed, countable set of named states that moves between them one step at a time." },
    { term: "illegal state", meaning: "A value the state register can physically hold that the design never meant to use, such as 3'b111 in a 5-state machine on 3 bits." },
    { term: "localparam", meaning: "A named constant local to one module, fixed when the design is prepared. Used here to give every state a name." },
    { term: "Mealy machine", meaning: "A state machine whose output may depend on the current input as well as the state, so the output can change between clock edges." },
    { term: "Moore machine", meaning: "A state machine whose output depends on the state alone, so the output can only ever change on a clock edge." },
    { term: "next-state logic", meaning: "The combinational part that turns the current state plus the inputs into the state to move to. A lookup table written as a `case`." },
    { term: "one-hot encoding", meaning: "Giving each state its own bit, with exactly one bit high. 5 states need 5 bits. The industry default for control logic." },
    { term: "reset state", meaning: "The state the machine is forced into by reset, and the state the `default` branch returns to. Must be a state that has a `case` branch." },
    { term: "state register", meaning: "The register that holds the current state. The only place an FSM is allowed to have memory." },
    { term: "state transition diagram", meaning: "The picture form: a circle per state, an arrow per transition, and a label naming what causes the move." },
    { term: "state transition table", meaning: "The row form of the same information: one row per state, one column per input condition, each cell naming the state to move to." },
    { term: "two-paragraph FSM", meaning: "The style this chapter teaches: one `always_comb` block that decides, one `always_ff @(posedge clk or posedge rst)` block that remembers." },
  ],
  nextStep:
    "The first lesson, Mealy vs. Moore, takes the distinction from the fourth topic above and turns it into code. You will describe both flavours in words, then write the Moore version of a small edge detector with its output decode in its own combinational block, and add the `default` branch that makes the machine recover instead of hanging. Read it with the traffic light's transition table on paper beside you, because the exercise and the practice problem are the same shape.",
};
