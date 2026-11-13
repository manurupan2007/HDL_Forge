import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 8,
  chapterSlug: "sequential-fundamentals",
  title: "Sequential Fundamentals",
  readMinutes: 27,
  youWillBeAbleTo: [
    "Explain what changes when hardware starts remembering, and say what a register is",
    "Write a D flip-flop in Verilog-2001 and say which line makes it a flip-flop",
    "Tell the difference between `posedge clk` and a level-sensitive `clk` in the sensitivity list",
    "Use non-blocking `<=` in a clocked block and explain in one sentence why blocking `=` is a bug",
    "Recognise an accidental latch from an incomplete `case` and fix it with a `default`",
    "Write both a synchronous and an asynchronous reset, and say which one is the safer default",
    "Explain why this track's reset is active low and write it as `if (!rst_n)`",
    "Drive the clock from a testbench with `always #5 clk = ~clk;` and check results with `===`",
    "Explain metastability in plain words and say why a synchronizer is exactly two flip-flops",
  ],
  mentalModel: [
    {
      title: "From this chapter on, the circuit remembers",
      body: "Everything you have built so far was forgetful. A wire carries a value right now and has no idea what it held a moment ago. That is what makes combinational logic a pure function of its inputs: same inputs, same outputs, every time, forever. This chapter breaks that. A *register* is a cell that remembers one bit. It has an input it can look at, and it keeps the last value it saw until you deliberately make it look again. From here to the end of the track you are building machines with state, and every new problem comes from one question: when does it look?",
    },
    {
      title: "The clock is a metronome, and flip-flops only listen on the beat",
      body: "Some wire has to decide *when* a register is allowed to look at its input, otherwise the answer would depend on how fast the data arrived and the circuit would be unpredictable. That wire is the *clock*. It is a square wave that swings between 0 and 1 forever, at a fixed rate, like a metronome. A *flip-flop* is a cell that samples its input on one instant of that wave and ignores it the rest of the time. Because every flip-flop in a design shares the same clock, they all sample at the same instant — and that is the fact that makes the rest of this chapter's rules make sense.",
    },
    {
      title: "All the flip-flops in a block move together",
      body: "If every flip-flop samples on the same edge, then on that edge they must all act as if nothing has changed yet. Register A must not see the new value of register B, because B is being updated at that same instant. In Verilog you say this with the non-blocking assignment `<=`, and the symbol is chosen to match the idea: the update is *deferred*, like a note pinned to the end of the bar rather than played the moment you write it. The blocking `=` evaluates and updates instantly, which is exactly right inside combinational logic and exactly wrong inside a clocked block.",
    },
  ],
  topics: [
    {
      slug: "memory-arrives",
      title: "The wire stops being the whole story",
      lede: "What actually changes when a circuit can remember, and what one bit of memory is.",
      blocks: [
        {
          kind: "analogy",
          text: "A light switch with a latch on it. A plain switch forgets: let go and it springs back. A latched switch stays exactly where you put it. You flip it, it goes. It sits there for a week, doing nothing, still in the position you chose. Only when you deliberately move it again does anything change. That is a register. A register is a cell that holds one bit in a position you set, and it stays in that position until you move it again.",
        },
        {
          kind: "para",
          text: "Now put a second latched switch next to the first and you have 2 bits of memory, holding one of four values. Stack eight and you have a byte. Stack thirty-two and you have a number wide enough to hold an address. The count is the same 2ⁿ rule you used in chapter 1 — nothing about memory is new mathematics. What is new is that the value can now depend on time.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "The single sentence this chapter is about",
          text: "Until now a signal's value was a function of the inputs alone — same inputs, same outputs. From here on a signal's value is a function of the inputs *and of what the signal held before*. That single change is what \"sequential\" means. It is why you need a clock, why the order of your statements suddenly matters, and why there are new classes of bug that cannot happen in combinational logic.",
        },
        {
          kind: "define",
          items: [
            { term: "register", meaning: "A cell that holds one bit in whatever position you last put it, until you move it again." },
            { term: "flip-flop", meaning: "A register that only looks at its input on one instant of a clock, and holds everything else." },
            { term: "latch", meaning: "A register that looks at its input the whole time, and keeps its value whenever the input stops mattering." },
            { term: "clock", meaning: "A single wire that swings between 0 and 1 at a steady rate. It tells the whole circuit when to look." },
            { term: "clock edge", meaning: "The one instant the clock crosses from 0 to 1. This is the moment everything in the design samples." },
            { term: "sequential logic", meaning: "Logic whose output depends on the inputs and on the previous state, not the inputs alone." },
          ],
        },
        {
          kind: "table",
          head: ["", "Combinational logic (chapters 1–7)", "Sequential logic (this chapter on)"],
          rows: [
            ["Output depends on", "the inputs, right now", "the inputs, plus what was there before"],
            ["Has memory", "no", "yes"],
            ["What tells it when to update", "nothing — it just follows", "a clock edge"],
            ["How you write it", "assign y = a & b;", "always @(posedge clk) q <= d;"],
            ["Can it be in a loop?", "no — a feedback loop oscillates", "yes, and that loop is the point"],
          ],
          caption:
            "Nothing in the left column becomes wrong. It is just no longer the whole story. Most real designs are combinational blocks sitting between registers.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw a latched switch and label it: input on the left, output on the right, a latch symbol in the middle.",
            "Now trace it. Set the input to 0, move the switch. Set the input to 1, move the switch. Now leave the input at 1 and do nothing for a while. What is the output? (It is still whatever you last moved it to — the input is being ignored.)",
            "Repeat for a plain wire: set the input to 0, then 1, then leave it at 1. The output follows the input every single time. That is the difference between a wire and a register, in one tracing exercise.",
            "Write down the smallest question that separates them: \"does the output care about the input at this moment?\" A wire always does. A register only does when you tell it to.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why a memory element needs a clock at all",
          text: "You could build a register that looks at its input continuously. But then whether it takes the new value would depend on how long the input happened to sit there, and two identical copies of the same circuit could end up in different states from the same inputs. A clock removes that dependence: one instant, everyone looks, nobody argues. That predictability is the whole reason a clocked design beats an asynchronous one almost every time.",
        },
        {
          kind: "check",
          items: [
            {
              q: "In one sentence, what is the difference between `wire a` and `reg a`?",
              a: "`wire a` is a plain connection that always shows whatever is driving it, with no memory. `reg a` is a signal that something procedural — an `always` block — is allowed to assign, and which may therefore become a storage element. The `reg` keyword does not mean it *is* a register; whether a register gets built depends on where the assignment happens and how.",
            },
            {
              q: "A circuit has an output that depends on an input and on an input from 20 milliseconds ago. Is it combinational or sequential?",
              a: "Sequential. Combinational logic is a function of the inputs at this instant only. If the output can be influenced by a past value, the circuit has state, and state requires registers, a clock, and discipline about when things update.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-d-flip-flop",
      title: "The D flip-flop, the one cell everything is built from",
      lede: "A four-line module that is the whole building block of every sequential circuit in the track.",
      blocks: [
        {
          kind: "para",
          text: "The D flip-flop — people call it a DFF, short for D flip-flop — is the simplest thing that remembers. It has two inputs and one output. `d` is the data in, the thing it *might* look at. `clk` is the clock, the moment it is allowed to look. `q` is the data out, the value it is holding right now. The rule in one sentence: **on every rising clock edge, q takes the value that was on d at that instant.** At every other moment, q ignores d completely.",
        },
        {
          kind: "code",
          caption: "The whole cell. Four meaningful lines.",
          code: `module dff (
  input  wire clk,
  input  wire d,
  output reg  q
);

  always @(posedge clk) q <= d;

endmodule`,
          note: "Read it as a sentence: *when the clock rises, q copies d.* Nothing else. Every register, counter, and state machine in the rest of the track is assembled from this cell plus some combinational logic in front of it.",
        },
        {
          kind: "steps",
          title: "Read the flip-flop line by line",
          items: [
            {
              head: "`output reg q`",
              body: "The output has to be declared `reg`, not `wire`. That is not a style preference — it is required. A `wire` is a net: a passive connection something else must drive. `q` is driven from inside an `always` block, so it must be declared `reg`, which is Verilog's way of saying \"a procedural block assigns this\".",
            },
            {
              head: "`always @(posedge clk)`",
              body: "The sensitivity list. This block is *woken up* only when clk changes from 0 to 1. Not when d changes, not when q changes, not while clk sits high. Only on the rising edge. The keyword `always` does not mean \"loop forever\" — it means \"whenever the condition is true, do this\".",
            },
            {
              head: "`q <= d;`",
              body: "The non-blocking assignment. Read it as \"schedule q to become d\" rather than \"q becomes d right now\". The right-hand side is read first, using the values as they were when the block started, and the update is applied at the end. That one character — `<=` instead of `=` — is the subject of its own topic below.",
            },
            {
              head: "the missing reset",
              body: "This flip-flop has no reset, which means at power-up its q is `x` — unknown. It is not 0, it is not 1, it is \"nobody has ever told me\". That is fine in isolation and unacceptable in a real design, which is why every real register in this track has a reset. The next topic after this one builds it.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "`reg` does not mean a software register",
          text: "This trips up almost everyone arriving from programming. In Verilog, `reg` does not promise that a physical register exists, and it does not mean \"keep this in a variable\". It means one thing only: *this signal is assigned by a procedural block*. A `reg` assigned inside a combinational `always @(*)` block is not a register at all — it is just a wire that a process happens to drive, and no memory is built. The thing that actually creates a flip-flop in hardware is an assignment on the left-hand side of `<=` inside an `always` block whose sensitivity list mentions a clock edge.",
        },
        {
          kind: "table",
          head: ["Line", "Plain meaning"],
          rows: [
            ["always @(posedge clk)", "run this block only on the instant clk goes 0 to 1"],
            ["q <= d;", "q will hold whatever d is, starting now"],
            ["output reg q", "q is assigned by this block, so it is declared reg"],
            ["output reg [3:0] q", "four such cells, sharing a name and a clock"],
            ["q <= d;  (d is 1 bit)", "no width change, no warning"],
            ["q[3:0] <= d[7:0];", "silently keeps the low 4 bits — nothing warns, because you asked for it"],
          ],
          caption:
            "A flip-flop has exactly one job. Everything else in this chapter is about controlling *when* it does that job and *what* it does when something goes wrong.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw a timeline. Mark clk going up at t=10, 20, 30, 40, with d reading 1, 0, 0, 1 at those four instants.",
            "Write q at t=10, 20, 30, 40. You should get 1, 0, 0, 1 — q matches d, but only sampled at the edges.",
            "Now change d to 1 halfway between t=20 and t=30, with no clock edge anywhere near it. Write down what q does. (Nothing. That is the whole point of edge-triggering.)",
            "Start q at x instead of 0 and redo the first row. (q = 1 after the first edge, because the first edge is when d finally had a defined value to copy.)",
            "Write the one-line rule in your own words, then check it against every row you drew.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing `output wire q` and then assigning it inside an `always` block.",
          right: "Write `output reg q`.",
          why: "`wire` declares a net — a passive connection that something outside the module must drive. You cannot drive a net from inside an `always` block, and the compiler will say so. The keyword `reg` is not optional here; it is the declaration that says \"a process drives this\".",
        },
        {
          kind: "trap",
          wrong: "Writing `always @(posedge clk) q = d;` — the same circuit with `=` instead of `<=`.",
          right: "`always @(posedge clk) q <= d;`",
          why: "For a single flip-flop the two happen to agree in a simple testbench, so this slips through — and then breaks the first time you build anything with two of them. Verilator flags blocking assignments inside a clocked block as `BLKSEQ` precisely because it is almost always a bug. Get the habit now, with the simplest possible cell, and it will never cost you a debugging session later.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A flip-flop's `d` input is 0. A clock edge arrives. What is `q` immediately after the edge? What happens to `q` if `d` changes to 1 one nanosecond later?",
              a: "q becomes 0 at the edge. Then d changing to 1 one nanosecond later does nothing at all — q stays 0 until the next rising edge, at which point q becomes 1. The gap between edges is the whole design: that is where combinational logic is supposed to do its work.",
            },
            {
              q: "You see `reg [7:0] count;` in a module. Can you conclude that eight flip-flops exist?",
              a: "No. The `reg` keyword only says a procedural block assigns it. If the assignment is inside `always @(*)` with blocking `=`, no flip-flop is built at all — `count` is just combinational logic. Flip-flops appear from non-blocking `<=` inside a block sensitive to a clock edge. Read the always block, not the declaration.",
            },
          ],
        },
      ],
    },
    {
      slug: "clock-edges",
      title: "Rising, falling, and why edges at all",
      lede: "What `posedge` really means, and what a level-sensitive design would do wrong.",
      blocks: [
        {
          kind: "para",
          text: "A clock is a square wave: it sits at 0, jumps to 1, sits at 1, drops to 0, sits at 0, and repeats forever. There are two interesting instants in each cycle. The *rising edge* (written `posedge`, positive edge) is where it jumps 0 to 1. The *falling edge* (`negedge`) is where it drops 1 to 0. Verilog lets you write either one, and every flip-flop in this track is triggered on `posedge` because the convention across the industry is to use the rising edge.",
        },
        {
          kind: "code",
          caption: "One character of difference in the sensitivity list changes the circuit completely.",
          code: `// Edge-triggered: q copies d at one instant per cycle. This is a flip-flop.
always @(posedge clk) q <= d;

// Level-sensitive: q copies d on EVERY change of clk, including falling edges.
// q gets loaded twice per cycle, and any glitch on d in between is captured.
always @(clk) q <= d;`,
          note: "This is not a subtle preference. The bottom version is a different and wrong circuit, and it is the mistake this topic exists to prevent.",
        },
        {
          kind: "analogy",
          text: "A level-sensitive block is a person who writes down whatever the radio is saying, continuously, and stops only during the silences. A flip-flop is a person who writes down exactly one thing, at the instant the announcer says the top of the hour. The second person gets one clean sample per hour. The first person gets a smeared, partial, overlapping mess — and if the announcer coughs during a pause, the first person writes down a cough.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why a level-sensitive design keeps re-triggering",
          text: "Write `always @(clk)` and ask what the simulator does while clk is sitting at 1. The block is sensitive to *changes* of clk, so the block does not run continuously — but the moment clk goes 0 to 1, it runs. If the clock stays high, the block only ran once for that high period, which is still not what you want: the same logic is now also firing on the falling edge, so your register is loaded twice per cycle. Any small disturbance on `d` while the clock is in the wrong phase is captured as though it were real data. Edge-triggering removes both problems by naming exactly one instant per cycle as the only time that matters.",
        },
        {
          kind: "steps",
          title: "Follow one clock cycle through a flip-flop",
          items: [
            {
              head: "t = 0, clk = 0, d = 1",
              body: "Nothing happens. The block is not sensitive to d, and there is no edge. q holds whatever it held — say x, because this flip-flop has no reset.",
            },
            {
              head: "t = 5, d flips to 0",
              body: "Nothing happens. d is not in the sensitivity list. This is the entire reason a flip-flop is useful: combinational noise on d has time to settle before the edge arrives.",
            },
            {
              head: "t = 10, clk goes 0 to 1",
              body: "The block runs. d is 0 at this instant, so q is scheduled to become 0. From this moment q is 0.",
            },
            {
              head: "t = 12, d flips to 1",
              body: "Nothing happens. q stays 0. The value 1 sits on d, waiting, ignored, until the next edge at t = 20.",
            },
            {
              head: "t = 20, clk goes 0 to 1 again",
              body: "The block runs. d is 1, so q becomes 1. The value that arrived at t = 12 has now been sitting stable for 8 nanoseconds, which is exactly the margin a real chip needs.",
            },
            {
              head: "The rule you can write on a card",
              body: "The time between one edge and the next is the design window. Everything combinational must settle inside it. Everything sequential happens on its boundary.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw a clock waveform for three cycles: label clk going high at t=10, 20, 30 and low at t=15, 25, 35. Mark the rising and falling edges with two different colours.",
            "Now draw d with a short pulse that is high only from t=22 to t=24 — a glitch that never touches a clock edge.",
            "Trace a `posedge`-triggered flip-flop. What is q? (Unchanged. The pulse vanished into the gap.)",
            "Trace a level-sensitive one. What is q? (It picks the glitch up, because the block is sensitive to clk changing and runs again on the falling edge, and d happened to be high then.)",
            "Decide which one you want in a chip, and say why in one sentence: a real data path produces pulses like that all the time, and a design that records them is a design that produces wrong answers.",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing `always @(clk)` and calling it \"the same thing\".",
          right: "Write `always @(posedge clk)`. If you want the falling edge, write `negedge` — but be deliberate.",
          why: "Level sensitivity means the block fires on every transition, so the register is loaded twice per cycle and captures whatever happened to be on d at a moment you did not choose. Verilator will not stop you. The design simply does not do what you meant, and the symptom shows up far away as data that is one cycle out of place.",
        },
        {
          kind: "trap",
          wrong: "Writing `always @(posedge clk, rst_n)` — a bare `rst_n` in the sensitivity list where `negedge rst_n` belongs.",
          right: "Write `always @(posedge clk or negedge rst_n)` and name the edge on every event.",
          why: "A bare `rst_n` is level-sensitive, so the block wakes on *any* change of rst_n — including the moment reset is released and rst_n rises. On that rising edge `if (!rst_n)` is false, so the register quietly loads `d` at a moment that has nothing to do with a clock edge. Both `,` and `or` legally join events in Verilog-2001 and every tool accepts either without a word, so this mistake produces no warning at all. The only thing standing between you and it is deciding, deliberately, which of the two words you meant to write.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Your flip-flop uses `always @(posedge clk)`. Over one full clock cycle, how many times does q get a chance to change?",
              a: "Once, on the rising edge. The falling edge does nothing, and the flat high and low periods do nothing. That is what edge-triggering buys you: exactly one update point per cycle, at a time you chose.",
            },
            {
              q: "Why must combinational logic between two flip-flops settle before the next clock edge, rather than during the edge?",
              a: "Because a real flip-flop needs a *setup time* before the edge and a *hold time* after it. Both are physical facts about transistors needing a moment to switch. If the input is still slewing when the edge arrives, the flip-flop can latch onto a value that was never really there — a violation of setup or hold. Edge-triggering gives you a whole clock period of settling room, which is the margin a chip at speed requires.",
            },
          ],
        },
      ],
    },
    {
      slug: "blocking-and-nonblocking",
      title: "The two assignment symbols, and why the wrong one breaks registers",
      lede: "`<=` and `=` look similar and mean completely different things inside a clocked block.",
      blocks: [
        {
          kind: "table",
          head: ["", "Blocking `=`", "Non-blocking `<=`"],
          rows: [
            ["When it updates", "immediately, on that line", "at the end of the time step"],
            ["What a later line sees", "the new value", "the value from before the block started"],
            ["Means", "\"do this now\"", "\"queue this for the end\""],
            ["Use it in `always @(*)`", "yes — always", "no — produces wrong results"],
            ["Use it in a clocked block", "no — almost always a bug", "yes — always"],
          ],
          caption:
            "Same symbol, two jobs, and the job is decided by which kind of `always` block you are in. In combinational logic you want everything to settle immediately. In a clocked block you want everything to move at once.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why every flip-flop must move at the same instant",
          text: "Every flip-flop in a design shares one clock, so they all sample on the same edge. If register A's update were visible to register B during that same edge, then B would be reacting to a value that does not physically exist — no such value ever sat on the wire. That is a race, and the result depends on the order the tool happened to execute your lines, which is exactly the kind of thing that works on your machine and fails in someone else's. The non-blocking assignment makes the right thing the easy thing: the right-hand side of every line is evaluated against the world as it was when the block started, and every update lands together afterwards.",
        },
        {
          kind: "analogy",
          text: "Blocking `=` is a row of people copying a whiteboard in sequence. The first person updates the board, and the second person — standing behind them — copies the *new* board, not the one that was there when they lined up. Non-blocking `<=` is the same row of people, but everyone writes down what is on the board *right now* and then swaps their notes in at the same moment on a count of three. Nobody sees anybody else's answer early. That is the entire difference, and it is what makes a shift register work.",
        },
        {
          kind: "code",
          caption:
            "A two-stage shift register. With `<=` the data moves forward one stage per clock. With `=` it jumps forward two.",
          code: `module pipeline2 (
  input  wire clk,
  input  wire d,
  output reg  a,
  output reg  b
);

  // Correct: a two-stage shift register. Each stage holds last cycle's value.
  always @(posedge clk) begin
    a <= d;   // a takes d's old value
    b <= a;   // b takes a's OLD value, not the new one
  end

endmodule

// The same module, written with =, is a different and broken circuit.
// This is a comment block showing the wrong version, kept commented on purpose.
// Linting it would report BLKSEQ: Blocking assignment '=' in sequential logic process.
//
//  always @(posedge clk) begin
//    a = d;    // a changes HERE
//    b = a;    // b reads the NEW a — one cycle too early
//  end`,
          note: "This is the bug that survives review, because the code reads fine. It is also the reason the order of your two lines matters when you have made the mistake, which makes it look like an order-dependence bug rather than what it is.",
        },
        {
          kind: "table",
          head: ["Clock edge", "d", "a (before)", "b (before)", "a (after, `<=`)", "b (after, `<=`)", "a (after, `=`)", "b (after, `=`)"],
          rows: [
            ["1", "1", "0", "0", "1", "0", "1", "1"],
            ["2", "0", "1", "0", "0", "1", "0", "0"],
            ["3", "1", "0", "1", "1", "0", "1", "1"],
          ],
          caption:
            "With `<=`, the 1 walks a → b one stage per edge, exactly like data travelling down a pipe. With `=`, it appears in a and b simultaneously, then vanishes entirely on the next edge. Read the third column pair across: the `=` version loses the data, not just delays it.",
        },
        {
          kind: "steps",
          title: "Watch the blocking version destroy one value",
          items: [
            {
              head: "Before edge 1: a = 0, b = 0, d = 1",
              body: "Two stages of the pipeline are empty and a fresh 1 has arrived on d.",
            },
            {
              head: "Edge 1, with `<=`",
              body: "`a <= d` schedules a to become 1. `b <= a` schedules b to become *the a that existed before the block started*, which is 0. Result: a = 1, b = 0. The 1 has moved into the first stage and nowhere else. Correct.",
            },
            {
              head: "Edge 1, with `=`",
              body: "`a = d` sets a to 1 immediately. `b = a` then reads a — and a is now 1, not 0. Result: a = 1, b = 1. The 1 is in both stages. The second stage was bypassed.",
            },
            {
              head: "Edge 2, with `<=`",
              body: "d goes to 0. a becomes 0, b becomes the old a, which is 1. Result: a = 0, b = 1. The 1 advanced one stage, as a shift register must.",
            },
            {
              head: "Edge 2, with `=`",
              body: "a becomes 0 immediately, then b = a = 0. Result: a = 0, b = 0. The 1 that should be sitting in stage b is *gone*. Data was silently dropped.",
            },
            {
              head: "What this looks like in a real design",
              body: "A pipeline stage that is off by one. Data is duplicated one cycle and missing the next. Nothing crashes, nothing warns beyond BLKSEQ, and the bug surfaces hundreds of lines away as an arithmetic result that is wrong in a pattern nobody can explain.",
            },
          ],
        },
        {
          kind: "trap",
          wrong: "Using `=` anywhere inside `always @(posedge clk)` because it \"looks like assignment\".",
          right: "Use `<=` for every left-hand side inside a clocked block. Always. Even for a single flip-flop, where the two happen to agree.",
          why: "Verilator flags this as `BLKSEQ` (Blocking assignment '=' in sequential logic process) and the message is not decorative — it is nearly always a real bug. The one-flip-flop case agrees by luck, which is what makes it dangerous: you ship it, someone later adds a second register, and the design changes behaviour with no visible edit near the change.",
        },
        {
          kind: "trap",
          wrong: "Using `<=` inside `always @(*)`, for symmetry with the clocked blocks.",
          right: "Use `=` inside a combinational block. Non-blocking there is undefined behaviour — simulators and synthesis tools are free to disagree about the result.",
          why: "The non-blocking assignment has no defined meaning outside an event-driven process triggered by a clock. The tools will not warn you clearly, but simulation and synthesis can legitimately differ, which means the netlist and the testbench describe two different circuits. The rule is short enough to memorise: `<=` in a clocked block, `=` in a combinational block.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write a timeline with clk edges at t=10, 20, 30 and d = 1, 1, 0 at those three edges. Start a and b at 0.",
            "Run the `<=` version by hand. Write a and b after each edge. You should get (1,0), (1,1), (0,1).",
            "Run the `=` version by hand. You should get (1,1), (0,0), (0,0). Count how many times the value 1 appears in b. It appears when it should not and is missing when it should be there.",
            "Swap the two lines in the `=` version so `b = a` comes first, and re-run. It now behaves correctly. This is the trap: the bug looks like a statement-ordering problem, so you spend an afternoon moving lines instead of changing `=` to `<=`.",
            "Write down the one-line rule in your own words and put it where you will see it every time you open a Verilog file.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Inside `always @(posedge clk) begin q <= d; r <= q; end`, with q = 1 and d = 0 before the edge, what are q and r after it?",
              a: "q = 0 and r = 1. Each line reads the value that existed when the block started: q takes d, which is 0; r takes the old q, which was 1. Then both updates land together. If the code had used `=`, r would have read the new q and both would be 0 — the r = q line would have been dead.",
            },
            {
              q: "Your combinational block is `always @(*) begin a = b & c; d = a | e; end`. Does `<= a = b & c` behave the same way here?",
              a: "Do not write that. Non-blocking assignment in a combinational block is undefined behaviour, not a slower version of blocking. The reason the rule is `=` for combinational logic is that each line is supposed to be true immediately, so later lines can use the value the earlier line just produced. Nothing in a combinational block is waiting for a common instant.",
            },
          ],
        },
      ],
    },
    {
      slug: "latches-appear-when-coverage-is-missing",
      title: "Latches: the memory you did not ask for",
      lede: "Incomplete coverage in a combinational block silently builds a register, and the tool tells you with a LATCH warning.",
      blocks: [
        {
          kind: "para",
          text: "A *latch* is a register that has no clock. It looks at its input whenever the input changes, and it holds its value whenever the input stops mattering. That second half is the problem. If you intended pure combinational logic and a latch appears, you have built memory you did not design, in a block that was supposed to be a pure function of its inputs — and the bug only shows up for a specific input combination, which is the hardest kind of bug to find.",
        },
        {
          kind: "analogy",
          text: "A combinational block is a function: you ask a question, it gives an answer immediately and forgets the question. A latch is an assistant who writes the answer down and only overwrites it when a *new kind* of question arrives. If you ask it a question of a kind it was not warned about, it does not say \"I don't know\" — it hands you the answer to the previous question. That is the failure, in one image.",
        },
        {
          kind: "code",
          caption: "A 4-to-1 multiplexer written with an incomplete case. This builds a latch on sel[1].",
          code: `module mux4_bad (
  input  wire       [1:0] sel,
  input  wire       [3:0] d0,
  input  wire       [3:0] d1,
  input  wire       [3:0] d2,
  input  wire       [3:0] d3,
  output reg  [3:0] y
);

  always @(*) begin
    case (sel)
      2'b00:   y = d0;
      2'b01:   y = d1;
      2'b10:   y = d2;
      // 2'b11 is missing — nothing assigns y here
    endcase
  end

endmodule`,
          note: "Verilator reports this as `LATCH` (and separately as `CASEINCOMPLETE`). It is a warning, not an error, so the build passes and the wrong circuit ships.",
        },
        {
          kind: "table",
          head: ["sel", "y becomes", "Why"],
          rows: [
            ["2'b00", "d0", "covered by the first branch"],
            ["2'b01", "d1", "covered by the second branch"],
            ["2'b10", "d2", "covered by the third branch"],
            ["2'b11", "whatever y held before", "no branch runs, so y is not assigned — it remembers"],
          ],
          caption:
            "Three of the four inputs work perfectly. The fourth gives stale data, and the staleness depends on what happened earlier, which is why it is so hard to test for.",
        },
        {
          kind: "code",
          caption: "The same multiplexer, with a default. No latch is built.",
          code: `module mux4 (
  input  wire       [1:0] sel,
  input  wire       [3:0] d0,
  input  wire       [3:0] d1,
  input  wire       [3:0] d2,
  input  wire       [3:0] d3,
  output reg  [3:0] y
);

  always @(*) begin
    case (sel)
      2'b00:   y = d0;
      2'b01:   y = d1;
      2'b10:   y = d2;
      default: y = d3;   // every input combination now assigns y
    endcase
  end

endmodule`,
          note: "One line, and the LATCH warning disappears. This is the single highest-value habit in the chapter: if you see LATCH, look for the input combination nobody handled.",
        },
        {
          kind: "para",
          text: "The same failure happens with `if` and no `else`. `if (en) q = d;` assigns q on one input combination and leaves it alone on the other, so the complement of `en` is a latch. And a `default` does not fix a case if it is in the wrong place — put `default` above the specific branches and the first matching arm always wins, so the specific ones are dead code. Coverage is about *actually assigning* on every path, not about the shape of the code, and the linter works out the coverage for you by counting values rather than reading intent.",
        },
        {
          kind: "table",
          head: ["What you wrote", "Is every input covered?", "Verilator says"],
          rows: [
            ["case with all 4 branches, no default", "yes — a 2-bit sel is fully covered", "clean; no warning at all"],
            ["case with 3 of 4 branches, no default", "no", "CASEINCOMPLETE and LATCH"],
            ["case with 3 branches + default", "yes", "clean"],
            ["if (en) q = d;  with no else", "no — the else path leaves q", "LATCH"],
            ["if (en) q = d; else q = 0;", "yes", "clean"],
            ["always @(*) q = d;", "yes — unconditional", "clean"],
          ],
          caption:
            "Verilator works out whether your branches actually cover every value of the signal, so it stays quiet on a case it can prove is complete and speaks up on one it cannot. LATCH is the message that means real hardware got built that you did not want. CASEINCOMPLETE is the companion message pointing at the gap — and when you see it, that gap is a live latch.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take `mux4_bad` above. For each of the four values of sel, write down which branch runs, and therefore what y ends up holding.",
            "Now trace it as hardware, not as code. Start with sel = 2'b11 and y = x. Nothing has ever assigned y, so what is it? (x. The latch has never been written.)",
            "Change sel to 2'b00 for a moment and back to 2'b11. What is y at the end? (d0, not x. The latch remembered.)",
            "Write one line saying what a *testbench* must do to expose this bug, and check your answer against the table above. (Drive the missing combination with two different previous values of sel and see that y disagrees.)",
          ],
        },
        {
          kind: "trap",
          wrong: "Leaving a `default` out of a `case` because \"I covered all the real cases\".",
          right: "Always add `default`, and give it a sensible value — usually zero, or an explicit don't-care branch if the case really is exhaustive.",
          why: "\"All the real cases\" is a statement about the specification, not about the width of the signal. Any time the case arms are not a complete, non-overlapping partition of the signal's value space, one combination falls through and y holds its old value. A `default` makes the partition total, which is what stops the latch being built.",
        },
        {
          kind: "trap",
          wrong: "Fixing a LATCH by ignoring the warning, or by wrapping the case in `if (1)`.",
          right: "Find the input combination that leaves the output unassigned and handle it.",
          why: "The warning is not about style — a latch really is in the netlist. Adding a condition that is always true makes the tool stop complaining without changing the hardware at all, which is the worst outcome: a silenced warning and a still-wrong circuit.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Which of these builds a latch: `always @(*) if (sel) y = a;` or `always @(*) if (sel) y = a; else y = b;`?",
              a: "The first one. When sel is 0, no branch runs, y is not assigned, and it holds its previous value — a latch. The second assigns y on both paths, so it is pure combinational logic with no storage.",
            },
            {
              q: "You need a 2-to-1 multiplexer with a 1-bit select, and you write both branches with no `default`. Does Verilator warn?",
              a: "No — and understanding why is the point. Your two branches assign `y` on every possible value of a 1-bit select, and Verilator can work that out for itself, so the case is provably exhaustive and it has nothing to say. Coverage, not syntax, is what the linter is checking. Widen the select to two bits without adding the missing branch, and now it has plenty to say: CASEINCOMPLETE, plus the LATCH that comes with it.",
            },
          ],
        },
      ],
    },
    {
      slug: "resets",
      title: "Getting the machine into a known state: synchronous and asynchronous",
      lede: "Two ways to force every register to a known value, differing only in when they listen.",
      blocks: [
        {
          kind: "para",
          text: "At power-up every register in a real chip holds `x`, because nothing has ever told it what to be. A *reset* fixes that. It is a way of saying \"whatever state you are in, put it here\" — and because you cannot write a sensible design that starts in an unknown state, a reset is not an optimisation, it is a requirement. The whole design comes out of reset in the same known configuration, runs, and can be returned to that configuration at any time. In this track the reset is *active low* and named `rst_n`: the `n` suffix says the reset is asserted while the signal is 0, and released when it returns to 1. You saw the same `rst_n` on the chapter 7 capstone.",
        },
        {
          kind: "code",
          caption: "The same register, two ways of resetting it. The only difference is the sensitivity list.",
          code: `// Synchronous reset: the block only ever runs on a clock edge,
// so the reset is only acted on at an edge.
always @(posedge clk) begin
  if (!rst_n)    q <= 1'b0;
  else if (en)   q <= d;
end

// Asynchronous reset: rst_n is added to the sensitivity list with 'or',
// so the block also runs the instant rst_n itself falls.
always @(posedge clk or negedge rst_n) begin
  if (!rst_n)    q <= 1'b0;
  else if (en)   q <= d;
end`,
          note: "The bodies are character-for-character identical. The entire difference — immediate versus edge-triggered — is carried by the sensitivity list, and both use the active-low convention: reset is asserted while `rst_n` is 0. That is why getting the list (and the polarity) right is the whole skill.",
        },
        {
          kind: "table",
          head: ["", "Synchronous reset", "Asynchronous reset"],
          rows: [
            ["Sensitivity list", "always @(posedge clk)", "always @(posedge clk or negedge rst_n)"],
            ["Acts", "on the next rising clock edge", "the instant rst_n goes 1 to 0, no edge needed"],
            ["Response to rst_n at t=20, edge at t=25", "q clears at t=25", "q clears at t=20"],
            ["Recovery time", "must be held long enough to be sampled", "only needs to be a pulse wide enough to propagate"],
            ["Typical use", "resets that belong to the design's own timing", "global reset, power-on reset, recovery from an illegal state"],
          ],
          caption:
            "One sentence for each: an async reset responds immediately, with no clock edge involved. A sync reset waits for the next clock edge like everything else. That is the entire difference — and remember that 'asserted' means `rst_n` is 0, because this track's reset is active low.",
        },
        {
          kind: "code",
          caption: "A four-bit counter, synchronous reset, with a reset value written for every output.",
          code: `module counter4 (
  input  wire       clk,
  input  wire       rst_n,
  input  wire       en,
  output reg  [3:0] q
);

  always @(posedge clk) begin
    if (!rst_n)   q <= 4'b0000;   // every bit gets a value
    else if (en)  q <= q + 4'd1;  // a register counts itself
  end

endmodule`,
          note: "Two habits in six lines: the reset is listed first, so it wins over everything; and the reset value is written bit by bit as `4'b0000`, not as a bare `0`, so the width is explicit and no bit is left behind.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the reset value must be written for every output",
          text: "A reset branch is not a partial update. It is a complete statement of what the register holds while reset is asserted. If you reset only `q[0]` and leave `q[3:1]` untouched, those bits hold whatever they happened to hold — which after power-up is `x`. Your counter comes out of reset with three bits of garbage in it and one bit of zero, and it will never be right. If nothing else drives those bits, the linter catches it as UNDRIVEN; if another path does assign them, there is no warning at all, which is worse. When you write the reset branch, write the full value for the full width of the signal, every time.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Which one is the safer default",
          text: "Synchronous reset is the safer default, and the reason is the sensitivity list. An asynchronous reset is a second asynchronous input into a clocked design, which is the same class of problem as any other asynchronous input: it can arrive close enough to a clock edge to violate setup and hold. A synchronous reset only ever changes state on a clock edge, so it can never do that. Use asynchronous reset where the requirement genuinely demands it — a global power-on reset that must force the chip into a known state without a running clock — and synchronous reset everywhere else. Never mix the two styles on the same clock domain, because the two kinds of reset will then release at different times.",
        },
        {
          kind: "steps",
          title: "Watch the same reset event in both designs",
          items: [
            {
              head: "Set up: clk low, rst_n high (reset released), d = x",
              body: "Time zero. The register has never been written, so q is x. This is the state reset exists to eliminate.",
            },
            {
              head: "t = 20: rst_n goes 1 to 0 (reset asserted)",
              body: "rst_n itself changed. Neither the clock nor d did anything.",
            },
            {
              head: "The asynchronous design, at t = 20",
              body: "The block runs immediately, because `negedge rst_n` is in the sensitivity list. q becomes 0 at t = 20. No clock edge was involved anywhere.",
            },
            {
              head: "The synchronous design, at t = 20",
              body: "Nothing. The sensitivity list only contains `posedge clk`, and no edge has happened. q is still x.",
            },
            {
              head: "t = 25: the next rising clock edge",
              body: "Now the synchronous block runs, sees rst_n low, and q becomes 0. Five nanoseconds later than the asynchronous version.",
            },
            {
              head: "Why that five nanoseconds can matter",
              body: "A block of logic downstream that is itself clocked on the same edge reads the old q at t = 25 — x in the synchronous case, 0 in the asynchronous case. Identical reset logic, identical testbench, and the two designs disagree about whether downstream logic saw a valid value. This is why the choice has to be made deliberately and applied consistently.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw a timeline: clk edges at t=10, 20, 30. Put reset asserted (rst_n falling) at t=22 and released (rst_n rising) at t=32. Put d = x throughout.",
            "For the async design, write q at t=20, t=25, t=30, t=31. (0 from t=20 onward — it does not care that no edge has happened.)",
            "For the sync design, write q at the same instants. (x until t=25, then 0 — but then look at what happens at t=30, with rst_n still low. It stays 0. Then when rst_n rises at t=32, the *next* edge at t=40 is where it would start loading d again.)",
            "Now make the mistake on purpose: change the async version to `always @(posedge clk or negedge rst_n)` but write `if (!rst_n) q <= 0; else q <= d;` and delete the enable. Confirm the `else` branch is the enable — an enable is nothing more than an `else if` that does nothing.",
          ],
        },
        {
          kind: "trap",
          wrong: "Resetting a register with the async sensitivity list but no test of `rst_n` in the body.",
          right: "If `negedge rst_n` is in the sensitivity list, the body must handle it: `if (!rst_n) q <= 1'b0;` first.",
          why: "The sensitivity list decides *when* the block runs. The body decides *what happens*. A block that wakes on a reset edge and then does not test the reset will simply clock the register in, which means asserting reset does nothing at all — the exact opposite of the intent. Reset goes in both places, and the test goes first so it wins.",
        },
        {
          kind: "trap",
          wrong: "Resetting a 4-bit register with a bare `0`: `if (!rst_n) q <= 0;`",
          right: "Write the full-width value: `if (!rst_n) q <= 4'b0000;`",
          why: "A bare `0` is a 32-bit decimal literal, and Verilog will quietly truncate it to your 4-bit signal — usually doing the right thing, but relying on that hides a real habit. Worse, the same habit applied to a reset of a wide signal, or to an expression, is where silent truncation actually bites. Write the value at the signal's own width and the intent is on the page.",
        },
        {
          kind: "check",
          items: [
            {
              q: "In `always @(posedge clk or negedge rst_n)`, what does the `or` do, and what would change if you deleted it?",
              a: "It means the block also wakes when rst_n falls, independent of the clock — that is what makes the reset asynchronous. Delete it and the block wakes only on the rising edge of clk, so you have silently converted an asynchronous reset into a synchronous one. The body stays the same either way — which is exactly why you have to read the sensitivity list to know which kind of reset you have written.",
            },
            {
              q: "Your testbench holds rst_n low for two clock cycles and expects q to clear. It does. Is your design necessarily synchronous?",
              a: "No — and this is a real trap. An asynchronous reset also clears q, and clears it sooner. The only way to tell the two apart is to look for an edge that changes the answer, and your reset is held across so many edges that both designs agree. To tell them apart you must pulse rst_n between two clock edges and watch whether q reacts before the next edge. This is why the lesson asks you to compare them with a testbench that loads x onto d.",
            },
          ],
        },
      ],
    },
    {
      slug: "enables",
      title: "Enabling a register without touching the clock",
      lede: "Holding a register steady when you do not want it to load, and why you gate the data rather than the clock.",
      blocks: [
        {
          kind: "para",
          text: "Sometimes a register should hold its value — nothing is loading it. The way to say that is an *enable*: when `en` is high the register loads, and when `en` is low it keeps what it has. In code it is one line. There is no `else` branch, and that omission is the whole trick: a register that is not assigned keeps its value, which is exactly the behaviour you want.",
        },
        {
          kind: "code",
          caption: "A D flip-flop with an active-low asynchronous reset, an enable, and the inverted output the bench checks. This is the exact cell the first lesson asks for — the lesson bench instantiates `top dut (clk, rst_n, en, d, q, qn)`.",
          code: `module dff (
  input  wire clk,
  input  wire rst_n,
  input  wire en,
  input  wire d,
  output reg  q,
  output wire qn
);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)  q <= 1'b0;   // async reset: wins immediately, ignores en
    else if (en) q <= d;      // enable: load only while en is high
  end
  // no else. while en is low, q is not assigned, so q holds.
  assign qn = ~q;             // the lesson bench checks the inverse too

endmodule`,
          note: "Four things in eleven lines: the active-low reset (`!rst_n`), the enable, the deliberate absence of a final `else`, and the `qn` wire the bench expects. Note also the ordering — reset is tested first, so holding the design in reset always wins over any enable.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Gate the data, never the clock",
          text: "You will be tempted to gate the clock instead: `always @(posedge clk and en)`. Do not. Gating a clock produces a second clock edge at a moment that is not synchronised to anything, and clock edges that are not on a common grid are the origin of every hard class of bug in chip design — glitched clocks, hold violations in the receiving flip-flop, and analysis tools that cannot reason about the result. The enable is a control signal for the *data path*, and it is evaluated inside the block that would have run anyway. Every flip-flop in a design should see every clock edge, always; only what it does with it should change.",
        },
        {
          kind: "table",
          head: ["rst_n", "en", "What happens to q at the next edge", "What happens to q right now"],
          rows: [
            ["0", "x", "0 — reset wins", "0 immediately, with no edge (async)"],
            ["1", "1", "takes d", "nothing, it is not an edge"],
            ["1", "0", "holds its value", "nothing, it is not an edge"],
          ],
          caption:
            "The reset row is the only one that can change q between clock edges, and because the reset is active low it is `rst_n = 0` that clears. Everything else waits for the beat.",
        },
        {
          kind: "para",
          text: "The same idea scales to a whole bus. If a 4-bit register has an enable, the `if (en)` goes around all four assignments at once, so either all four bits load or none do. What you must not do is put the enable *inside* the value, like `q <= d + (en ? 0 : 1)`, which loads a corrupted value instead of holding. The enable belongs on the `if`, not on the data.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Take `dff` above. Assume q = 0 at t=0, and write d and en at each clock edge: d = 1,1,0,0 and en = 1,0,0,1 at t=10,20,30,40.",
            "Write q after each edge. You should get 1, 1, 0, 0 — the 1 loaded at the first edge and simply stayed put for the two edges where en was low.",
            "Now pull rst_n low between edges, at t=25, with no clock edge anywhere near. Write q. (0, immediately. That is the async reset doing its one trick — remember it is active low, so 0 means reset.)",
            "With rst_n still low (reset asserted), change en to 1 and wait two edges. Does q become d? (No. Reset is tested first, so it wins. A design held in reset stays in reset however it is enabled.)",
          ],
        },
        {
          kind: "trap",
          wrong: "Writing `always @(posedge clk and en)` — gating the clock with the enable.",
          right: "`always @(posedge clk)` with `if (en)` inside.",
          why: "A gated clock is a second clock whose edges arrive at an arbitrary moment relative to the real clock. Any flip-flop fed by it can see a hold violation, because the second clock's edge can arrive a fraction of a nanosecond after the first one. This is a genuine, documented hardware hazard rather than a style rule, and it is why every clock-gating scheme you will ever read about uses a latch in front of the gate.",
        },
        {
          kind: "trap",
          wrong: "Writing `else q <= q;` to \"be explicit\" about holding.",
          right: "Leave the `else` off entirely.",
          why: "`q <= q` is a real assignment: it schedules an update, which a real tool may build as logic that feeds q back to itself. It is functionally harmless in a simple case but it is noise, and it makes the intent — *this register is not being loaded* — disappear. A missing `else` is the idiomatic way to say \"hold\", and it is also the reason an unassigned signal in a clocked block is a feature rather than a bug.",
        },
        {
          kind: "check",
          items: [
            {
              q: "With `en` low for many clock cycles, is q a register or combinational logic?",
              a: "A register. It is holding a value across time, which is the definition of state. That q is holding is not changing during those cycles does not make it combinational — combinational logic would follow d as d changed, and this does not look at d at all.",
            },
            {
              q: "Why is the reset tested with `if (!rst_n)` before the enable with `else if`?",
              a: "Because the first true condition wins. If the order were reversed — `if (en)` first — then during a reset with en high, the enable branch would run and the register would load d instead of clearing, and the design would come out of reset in a state nobody chose. Reset must dominate: it is the state you are trying to force the whole design into, so nothing should be able to talk its way out of it.",
            },
          ],
        },
      ],
    },
    {
      slug: "clocked-testbenches",
      title: "Driving the clock: a testbench for sequential logic",
      lede: "A clocked design waits for edges, so the testbench has to generate the clock and drive inputs in step with it.",
      blocks: [
        {
          kind: "para",
          text: "Everything in this chapter is a design: it has a `clk` input and it acts on edges. To see one work you need a second file, a *testbench*, whose job is to be the world the design sits in — generate the clock, drive the inputs, wait for edges, and check the outputs. A testbench is simulation-only scaffolding: it is never synthesized and never becomes hardware. The design never generates its own clock; the testbench does, and it changes inputs between edges so the design always samples stable values.",
        },
        {
          kind: "code",
          caption: "A complete clocked testbench for the reset-and-enable flip-flop above. `always #5 clk = ~clk;` runs forever and makes a clock with a 10-unit period.",
          code: `\`timescale 1ps/1ps
module dff_tb;
  logic clk = 1'b0;          // start low so the first edge is a rising one
  logic rst_n, en, d;
  logic q, qn;
  integer errors = 0;

  dff dut (clk, rst_n, en, d, q, qn);

  always #5 clk = ~clk;      // a clock edge every 5 time units, forever

  task check(input string name, input logic exp_q);
    begin
      #1;                    // let the edge settle before sampling
      if (q === exp_q) $display("[PASS] %s", name);
      else begin
        errors = errors + 1;
        $display("[FAIL] %s: q=%b expected %b", name, q, exp_q);
      end
    end
  endtask

  initial begin
    $dumpfile("wave.vcd");   // write a waveform you can open
    $dumpvars(0, dff_tb);
    rst_n = 1'b1; en = 1'b0; d = 1'b0;
    rst_n = 1'b0;
    check("async reset clears q", 1'b0);
    rst_n = 1'b1;
    @(negedge clk);          // drive inputs while the clock is low
    en = 1'b1; d = 1'b1;
    @(posedge clk);          // <-- wait for the edge the design acts on
    check("q loads 1 on an enabled edge", 1'b1);
    $display("SUMMARY %0d errors", errors);
    $finish;
  end
endmodule`,
          note: "Read the timing discipline: inputs change just after a `negedge`, and the check happens just after the following `posedge`. That drive-while-low, check-after-the-edge rhythm is the same one every lesson's hidden bench uses, and it exists so the testbench never changes an input at the instant the design samples it.",
        },
        {
          kind: "table",
          head: ["Piece", "What it does"],
          rows: [
            ["always #5 clk = ~clk;", "runs forever, flipping clk every 5 time units — a free-running clock. Half a period is 5, so the full period is 10."],
            ["@(posedge clk)", "pauses the block until the next rising edge. This is how a testbench synchronizes itself to the design."],
            ["===", "the 4-state equality: x === x is true, while x == x is unknown. A testbench check must use ===, never ==."],
            ["$display(...)", "prints one line, usually [PASS] or [FAIL] plus the values. The lesson benches print these and count the failures."],
            ["$finish", "ends the simulation. Without it, `always #5` keeps the clock running forever."],
          ],
          caption:
            "Five pieces, and every lesson testbench in this track is built from them. The `always` clock and the `initial` stimulus block run in parallel — the clock does not stop while inputs change.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why does the testbench use `===` instead of `==` to compare q against the expected value?",
              a: "Because `==` can return x. Comparing a signal that is x against an expected value with `==` gives x, not 0, and an `if` on x takes the else branch — so a real mismatch can masquerade as a different failure, or a genuine pass can look wrong. `===` is the 4-state comparison: x === x is true and 1 === 0 is false, so the check gives a definite answer even before the first reset.",
            },
            {
              q: "Why is `clk` initialized to 0 in its declaration, and why does it matter?",
              a: "`always #5 clk = ~clk;` needs a defined starting value. An uninitialized clk is x, and `~x` is x, so the clock would never arrive and every `@(posedge clk)` would block forever — the simulation would hang instead of failing. Starting at 0 also makes the first transition a rising edge, which is what the design is listening for.",
            },
          ],
        },
      ],
    },
    {
      slug: "metastability-and-the-synchronizer",
      title: "Metastability, and why the answer is always two flip-flops",
      lede: "The one problem you cannot design away, and the two-cell structure that bounds it.",
      blocks: [
        {
          kind: "para",
          text: "Every flip-flop in a design so far has been fed by another flip-flop on the same clock. Those are safe: both cells see the same clock edge, so a data value has had a whole cycle to settle. But real designs have signals that come from outside — a button, a chip on another board, a clock from a different oscillator. Those signals change at moments that have nothing to do with your clock, and sometimes that moment is almost exactly an edge.",
        },
        {
          kind: "define",
          items: [
            { term: "setup time", meaning: "How long an input must be stable *before* a clock edge for the flip-flop to read it correctly." },
            { term: "hold time", meaning: "How long an input must stay stable *after* a clock edge for the flip-flop to read it correctly." },
            { term: "setup/hold violation", meaning: "The input changed inside the forbidden window around the edge, so the flip-flop may read the wrong value." },
            { term: "metastability", meaning: "A flip-flop whose output is temporarily neither a clean 0 nor a clean 1, because the input changed during the forbidden window." },
            { term: "clock domain", meaning: "Everything fed by one clock. A signal crossing between two different clock domains is the dangerous case." },
            { term: "synchronizer", meaning: "A small structure whose only job is to make a crossing signal safe to use in the receiving domain." },
          ],
        },
        {
          kind: "analogy",
          text: "Imagine a snapshot of a person who is mid-step, taken at exactly the moment they are moving. A careful photographer waits for the person to be still. A trigger-happy one clicks at the instant of movement, and the picture comes out with the foot smeared across two positions — not a wrong position, but no position at all. That smeared frame is exactly what a metastable flip-flop produces. A *synchronizer* is a photographer who knows the picture will be bad, so takes a second one a moment later when the subject has certainly stopped. The second frame is the good one, and you use it.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "What metastability actually is",
          text: "A flip-flop has positive feedback holding its output at 0 or 1. If its input changes inside the setup/hold window, the internal decision is genuinely undecided — the output can sit at an intermediate voltage, somewhere between the supply rails, for longer than a normal cycle before the feedback resolves it. That is metastability. The critical part: **a flip-flop can never remove metastability, only resolve it.** You cannot design it away, you cannot make it fast enough, and no amount of care at the source prevents it. The only honest response is to bound how far it is allowed to travel — which is what a synchronizer does.",
        },
        {
          kind: "code",
          caption: "The chapter's exercise. Two flip-flops in a chain, nothing else.",
          code: `module synchronizer_2ff (
  input  wire clk,
  input  wire rst_n,
  input  wire d_async,   // arrives from another clock domain
  output reg  q_sync     // safe to use in this domain
);

  reg stage1;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      stage1 <= 1'b0;
      q_sync <= 1'b0;
    end else begin
      stage1 <= d_async;   // may be metastable. That is allowed.
      q_sync <= stage1;    // by now stage1 has had a whole cycle to settle.
    end
  end

endmodule`,
          note: "The comment on the first assignment is the entire lesson. We are not pretending stage1 will be clean. We are budgeting for it: one full clock cycle of settling time before anything downstream reads the value.",
        },
        {
          kind: "steps",
          title: "Why two, and what each one is for",
          items: [
            {
              head: "The input changes at an arbitrary time",
              body: "`d_async` belongs to another clock domain. It changes whenever that domain's design decides it should, which has no relationship to when your `clk` rises.",
            },
            {
              head: "Edge 1: stage1 samples it",
              body: "stage1 is the first flip-flop. If d_async happened to be changing right at this edge, stage1 goes metastable — its output voltage sits between 0 and 1 and starts drifting toward whichever value it was heading for. We accept this. stage1's output is not allowed to be used.",
            },
            {
              head: "A whole clock period passes",
              body: "Metastability resolves in a fraction of a nanosecond in a good cell, or in a few hundred nanoseconds in a badly-loaded one. The synchronizer assumes the worst: it waits an entire period. This is the only timing assumption the structure makes, and it is why a synchronizer is a deliberate cost.",
            },
            {
              head: "Edge 2: q_sync samples stage1",
              body: "By now stage1 has long since resolved to a clean 0 or 1. q_sync reads that settled value. **q_sync is the only output anyone downstream is allowed to use.**",
            },
            {
              head: "The probability, not the guarantee",
              body: "You have not eliminated the failure — you have made it astronomically unlikely. The standard figure for a two-flop synchronizer on ordinary silicon is a mean time between failures measured in decades or centuries. Design reviews say \"two flops\" because that is the point where the number stops mattering against every other failure rate in the system.",
            },
            {
              head: "Why not three, or one?",
              body: "One flop gives the metastable value straight to your logic, where it can be sampled a second time by an unrelated register and become a permanent wrong answer. Three flops add another cycle of latency for a probability that was already negligible. Two is where the reliability is essentially free and the latency is one clock — which is why this chapter's exercise is exactly this module.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warn",
          title: "The rule that makes it a synchronizer and not just two registers",
          text: "The two flip-flops must be the *only* consumers of the crossing signal. The moment anything else reads `d_async` directly, or reads `stage1` for anything except the second flop, the whole structure is defeated and you have a metastable signal in your logic with no settling time. This is a structural rule about wiring, not a rule about the code, and it is why the module above keeps `stage1` private — declare it as a plain `reg` inside the module and give it no name on the port list. Nothing outside can reach it, so nothing outside can misuse it.",
        },
        {
          kind: "table",
          head: ["Structure", "Latency", "What downstream logic sees"],
          rows: [
            ["d_async used directly", "0 cycles", "possibly a metastable voltage, sampled by anything"],
            ["one flip-flop", "1 cycle", "a value that may still be settling — not safe"],
            ["two flip-flops", "2 cycles", "a settled value; safe to use"],
            ["two flops, plus something else reading stage1", "—", "unsound, and no tool can warn you"],
          ],
          caption:
            "Latency is the price: your crossing signal arrives two cycles late. Every synchronizer trades latency for certainty, and two cycles is the smallest trade that actually buys certainty.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "Draw a timeline: clk edges at t=10, 20, 30. `d_async` settles to 1 at t=20.5 — deliberately just after an edge, to model the bad case.",
            "Write stage1 and q_sync at each edge, using the metastable model: stage1 goes metastable at t=20, resolves to 1 sometime before t=30, and q_sync reads 1 at t=30.",
            "Now settle `d_async` to 1 at t=19 instead — comfortably before the edge. Write stage1 and q_sync. (Both 1 at t=30, and stage1 was already correct at t=20. The synchronizer works either way; that is what makes it usable.)",
            "Count the cycles of delay in each case. Two, in both. A synchronizer's latency is constant even though its reliability is not — which is what lets you write a design around it.",
          ],
        },
        {
          kind: "trap",
          wrong: "Feeding an asynchronous signal into a clocked block directly, with one flip-flop in between.",
          right: "Two flip-flops, with the first one private to the synchronizer module.",
          why: "One flip-flop does not remove metastability — it only gives the metastable value a place to sit, and it hands that value straight to whatever comes next. The second flip-flop is the part that does the work, and it is skipped by every version of this mistake that looks reasonable in review.",
        },
        {
          kind: "trap",
          wrong: "Using a synchronizer in the belief that it makes the two clocks agree, or that it fixes timing.",
          right: "A synchronizer makes the *data* safe to sample. It does not reconcile the two clock frequencies, and it will not stop signals from arriving too often for the receiving domain to keep up.",
          why: "The synchronizer's guarantee is about metastability only. If the source domain toggles its signal faster than the destination clock can sample, the destination will see a mixture of old and new values — which is a design problem about handshake or a FIFO, not a metastability problem, and needs a different structure entirely.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A button on a different board is wired into your chip, and its wire is toggled by a testbench at exactly the same simulation time as a clock edge. What should you do, and what is the minimum?",
              a: "Treat it as an asynchronous input and put it through a two-flop synchronizer before using it. Minimum is two flip-flops, chained, with the first one private to the synchronizer. If the wire can be held metastable, you also need a third flip-flop — because a metastable output that settles back to the *original* value is a real, observed failure mode of two-flop synchronizers on very slow signals.",
            },
            {
              q: "Someone says the synchronizer adds a cycle of latency, and asks whether you could remove it by making the first flip-flop's output visible directly. Should you?",
              a: "No. The latency is the cost; the metastability is the thing being bought against. Making stage1 visible does not remove latency — downstream logic reading stage1 would still be sampling a possibly-metastable value at the same moment it would have sampled the first flop — and it destroys the settling time that is the entire point of the second stage. Two stages, one cycle of latency, and nothing read before the second stage.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-complete-machine",
      title: "Putting it together, and checking yourself",
      lede: "A counter that uses a register, a reset, and an enable — then the self-check.",
      blocks: [
        {
          kind: "para",
          text: "Here is a complete module that uses everything in this chapter. A 4-bit counter with a synchronous reset and an enable. Read it as a whole first, then work through it line by line. There is nothing in it that has not been explained above, and no new syntax.",
        },
        {
          kind: "code",
          caption: "A 4-bit counter. Resets to zero, holds while disabled, wraps around at 15.",
          code: `module counter4 (
  input  wire       clk,
  input  wire       rst_n,
  input  wire       en,
  output reg  [3:0] q
);

  always @(posedge clk) begin
    if (!rst_n)   q <= 4'b0000;
    else if (en)  q <= q + 4'd1;
  end

endmodule`,
          note: "Every line is a pattern you have now met: a clocked block, a reset that is tested first, an enable that is not, and a non-blocking assignment to a whole 4-bit value. The counter counts itself, because `q` appears on both sides — the register reads its own current value and adds one.",
        },
        {
          kind: "steps",
          title: "Predict the counter before you run it",
          items: [
            {
              head: "Start: q = x, rst_n = 1 (reset released), en = 0",
              body: "q is unknown because nothing has been written and reset has not been asserted. This is the state a reset exists to fix, and it is not a corner case — it is what every register in a real chip is at power-up.",
            },
            {
              head: "Edge 1, rst_n = 0 (reset asserted)",
              body: "Reset is tested first and wins. q becomes `4'b0000` = 0. The enable is not consulted, so it does not matter what en is.",
            },
            {
              head: "Edge 2, rst_n = 1, en = 0",
              body: "Neither branch runs. q holds 0. This is the enable doing its job — the counter is parked.",
            },
            {
              head: "Edges 3, 4, 5 with en = 1",
              body: "Each edge loads q the value it held plus one. Write them down: 1, 2, 3.",
            },
            {
              head: "Keep going to the end",
              body: "From 0, the counter reaches `4'b1111` = 15 after fifteen enabled edges, and the sixteenth gives `4'b0000` again. It wraps around, because 4 bits cannot hold 16.",
            },
            {
              head: "The check that catches the width trap",
              body: "Notice `q + 4'd1` and not `q + 1`. Both give the same hardware here, and neither produces a warning — when you assign to `q`, the width of the whole right-hand expression is set by the width of `q`, so the 32-bit literal is already understood as 4 bits. Writing `4'd1` anyway is the habit from chapter 1: the width is on the page, and the next person to widen this signal finds the answer waiting. The warning that *does* fire is `WIDTHTRUNC`, and it fires on continuous assignments, where the right-hand side decides its own width: `assign y = a & b;` with 8-bit `a` and `b` into a 4-bit `y` reports that the AND generates 8 bits where 4 were expected.",
            },
          ],
        },
        {
          kind: "table",
          head: ["Edge", "rst_n", "en", "q before", "q after", "Which branch ran"],
          rows: [
            ["1", "0", "0", "x", "0", "reset — first, and it wins"],
            ["2", "1", "0", "0", "0", "neither — the enable holds it"],
            ["3", "1", "1", "0", "1", "enable — loads q + 1"],
            ["4", "1", "1", "1", "2", "enable"],
            ["5", "1", "1", "2", "3", "enable"],
            ["—", "1", "1", "15", "0", "enable — wraps, because 4 bits hold 0 to 15"],
          ],
          caption:
            "Six rows is enough to predict the behaviour entirely. If your simulation disagrees with this table, one of you is wrong, and finding out which is the skill being built.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The habit worth building in this chapter",
          text: "Predict, then check. For a sequential design this is even more valuable than for a combinational one, because the answer is a *sequence* over time, and a sequence is much easier to get wrong in your head than a single value. Draw the clock, mark the edges, and write down what you expect at each one before you press run. When it matches, you have learned something; when it does not, you have a specific row to investigate rather than a vague sense that something is off.",
        },
        {
          kind: "points",
          title: "The four rules from this chapter, to keep",
          items: [
            "Use `<=` for every left-hand side inside a clocked block. Verilator's `BLKSEQ` means it.",
            "Use `=` inside `always @(*)`. Non-blocking there is undefined behaviour.",
            "If Verilator reports `LATCH`, an input combination does not assign the output. Find it and handle it, usually with `default`.",
            "Two flip-flops for anything crossing a clock domain, and nothing outside the synchronizer may read the first one.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "You have `always @(posedge clk) begin if (en) q <= d; end`. What is `q` when `en` is 0 at a clock edge?",
              a: "It holds its previous value. There is no `else`, so nothing is assigned, and a register that is not assigned keeps what it had. This is the enable idiom, and it depends on the fact that an unassigned left-hand side in a clocked block means \"do not touch\" — not \"become x\".",
            },
            {
              q: "Your testbench resets a 4-bit register, and afterwards it reads `4'b00x1`. Bit 2 is still unknown. What did the reset branch actually say?",
              a: "It almost certainly assigned part of the signal — `if (!rst_n) q[0] <= 1'b1;` — so only bit 0 was given a value and bits 3 to 1 were left holding whatever they had, which at power-up is x. Verilator reports this as UNDRIVEN on `q[3:1]`, so the linter will point at it. Writing the whole width, `q <= 4'b0001;`, fixes it. Note that a narrow *value* would not: `q <= 4'd1;` is already 4 bits and gives you `4'b0001` with no warning, because assigning to `q` sets the width of the whole right-hand side to `q`'s width.",
            },
            {
              q: "You change `always @(posedge clk) q <= d;` to `always @(clk) q <= d;`. Describe the resulting circuit in one sentence, and name the warning that will not save you.",
              a: "A level-sensitive element that loads on every clock transition — twice per cycle — capturing whatever d happened to hold at each one, so glitches in the data path become real stored values. No warning: Verilator accepts it silently, and the failure shows up later as data that is one cycle out of place.",
            },
            {
              q: "Why must the first flip-flop of a synchronizer be invisible to the rest of the design?",
              a: "Because its output is allowed to be metastable. If any other logic reads it, that logic is sampling a value that may not be a real 0 or 1, and no settling time has passed. Keeping `stage1` private to the synchronizer module makes the rule structural — the port list is the proof — instead of a convention that a well-meaning edit can quietly break.",
            },
            {
              q: "You write an asynchronous reset and it works in the testbench. Is it automatically the right choice?",
              a: "No, and the two questions are different. It works because the testbench asserted reset across many clock edges, so a synchronous reset would have looked identical. The better default is synchronous, because it avoids putting a second asynchronous input into a clocked design. Choose asynchronous only when the requirement genuinely needs the response without a running clock.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "asynchronous reset", meaning: "A reset that acts the instant its signal is asserted, with no clock edge involved — written as `negedge rst_n` in the sensitivity list, because this track's reset is active low." },
    { term: "blocking assignment", meaning: "`=`, which updates the signal immediately so the next line in the block sees the new value. Correct in combinational blocks, wrong in clocked ones." },
    { term: "clock", meaning: "A single wire swinging between 0 and 1 at a steady rate, which tells every register in the design when to sample." },
    { term: "clock domain", meaning: "Everything fed by one clock. Signals moving between two different domains are the ones that need a synchronizer." },
    { term: "D flip-flop (DFF)", meaning: "The basic memory cell: on every rising clock edge it takes the value on `d` and ignores it at all other times." },
    { term: "edge-triggered", meaning: "Reacting only at the instant a signal changes, not for as long as it sits at the new value." },
    { term: "enable", meaning: "A control signal that decides whether a register loads on a given edge. Written as `if (en)`, with no `else`." },
    { term: "hold time", meaning: "How long an input must stay stable after a clock edge for a flip-flop to read it correctly." },
    { term: "latch", meaning: "A register with no clock, which appears by accident when a combinational block fails to assign its output on every input path." },
    { term: "metastability", meaning: "A flip-flop output that is temporarily neither a clean 0 nor a clean 1, because its input changed during the forbidden window around the edge." },
    { term: "non-blocking assignment", meaning: "`<=`, which evaluates the right-hand side using pre-block values and applies every update together at the end. The only correct choice in a clocked block." },
    { term: "register", meaning: "A cell that holds one bit in whatever position you last put it, until you move it again." },
    { term: "setup time", meaning: "How long an input must be stable before a clock edge for a flip-flop to read it correctly." },
    { term: "synchronizer", meaning: "Two chained flip-flops whose only job is to make a signal crossing between clock domains safe to use in the receiving domain." },
  ],
  nextStep:
    "The first lesson, Flip-Flops & Resets, puts `dff` on the board and walks through the three things that decide how a real register behaves: the clock edge, the reset style, and the enable. You will build the cell with an active-low asynchronous reset (`negedge rst_n`, `if (!rst_n)`), the enable, and the `qn` output the bench checks, then reason about what happens at power-up before reset has ever been asserted — which is the case the reset exists to solve. Write a small clocked testbench for it, the way the testbench topic above shows. The practice for this chapter is the two-flip-flop synchronizer, with the interface `top (clk, rst_n, d, q)`, so come back to the metastability topic above when you start it.",
};
