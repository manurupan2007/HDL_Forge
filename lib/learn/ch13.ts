import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 13,
  chapterSlug: "memory",
  title: "Memory Blocks",
  readMinutes: 24,
  youWillBeAbleTo: [
    "Declare a memory array and annotate every word of the declaration line",
    "Work out the address width a given depth needs, and say where the rule 2 to the power of n comes from",
    "Explain in one sentence what an address actually is",
    "Write a single-port RAM with a synchronous read and decide what it returns on a read-during-write cycle",
    "Tell an asynchronous read from a synchronous read, and say which one maps to block RAM",
    "Load a ROM image with an initial block and with $readmemh, and state honestly what each one does in real hardware",
    "Read a WIDTHTRUNC, LATCH or MULTIDRIVEN warning on a memory and name the mistake that produced it",
  ],
  mentalModel: [
    {
      title: "A memory is an array plus a number that picks a row",
      body: "That is the whole idea. `logic [7:0] mem [0:1023]` is 1024 rows of 8 bits, and the only other thing the hardware needs is a way to say which row you mean. That way is an *address*: an ordinary number, carried on ordinary wires, in the same width arithmetic you have used since chapter 1. `mem[addr]` reads row number `addr`. `mem[addr] <= din` writes row number `addr`. Nothing about a memory is mysterious — it is a numbered bookshelf, and the address is the number on the spine of the book you want. Every question people ask about memories (how big, how fast, can I read and write at once, what happens on a collision) reduces to asking how the address is produced and when the row it names gets read.",
    },
    {
      title: "Everything else is about who drives the address, and when",
      body: "Once the array exists, the only remaining design decisions are: how many addresses can be presented at the same time, and on which clock edge the data comes back. One address shared by the reader and the writer is a single-port memory. Two independent addresses is dual-port. Data appearing the moment the address changes is an asynchronous read; data appearing on the next clock edge is a synchronous read. Those two words — single/dual port, async/sync read — are the entire vocabulary of memory design, and this chapter is about learning to use them deliberately instead of by accident.",
    },
    {
      title: "You describe memory; the tool decides what to build",
      body: "You never write 'make me a block RAM' in this track. You write the array declaration and the always block that touches it, and the toolchain looks at the *shape* of what you wrote and decides whether to build it out of flip-flops, a lookup table, or a dedicated memory block. Shape is the operative word. Change the read from combinational to registered and you may get a completely different physical result from the same array declaration. That is why this chapter spends so much time on read discipline: the read discipline is the shape, and the shape is the hardware.",
    },
  ],
  topics: [
    {
      slug: "what-a-memory-is",
      title: "What a memory actually is",
      lede: "A numbered set of rows, and a number that picks one of them. That is the entire mental model.",
      blocks: [
        {
          kind: "analogy",
          text: "Imagine a wall of 1024 numbered pigeonholes in a post office. Each hole holds one folded letter — 8 bits, if you like. To get a letter out you do not reach into the wall and grab something; you read the number on the ticket and go to that hole. The number on the ticket is the *address*. The row it selects is the data. Now imagine what happens when the postman is also updating a hole at the same moment you are reading one: the wall does not have an opinion about who wins. You have to tell it. That situation — read and write colliding in the same cycle — is the single most important thing to decide about any memory, and this chapter gives it a whole section.",
        },
        {
          kind: "para",
          text: "In Verilog you write the wall as one line: a name, a width, and a range. `logic [7:0] mem [0:1023];` says: one thousand and twenty-four rows, eight bits in each row, and the rows are numbered 0 through 1023. Total capacity is 8 × 1024 = 8192 bits, which is 1024 bytes, which is 1 KiB. That is the entire declaration. There is no second line saying 'how many of these', no constructor, no allocation call. The number of rows is part of the type.",
        },
        {
          kind: "para",
          text: "Two dimensions, and it helps to name them. The *data width* is how wide each row is — the `[7:0]` part. The *depth* is how many rows there are — the `[0:1023]` part. Depth is also called the number of *addresses* or the number of *words*. A memory is described by depth × width, and so is its cost: 1024 × 8 is a small memory, 65536 × 32 is a big one.",
        },
        {
          kind: "table",
          head: ["What people call it", "What it is", "Where it appears in the declaration"],
          rows: [
            ["depth", "how many rows the memory has", "the count in `[0:1023]` — here 1024"],
            ["data width", "how many bits one row holds", "the `[7:0]` — here 8 bits, one byte"],
            ["address width", "how many bits it takes to name any row", "not in the array at all — it is the `addr` port"],
            ["capacity", "depth × width, in bits", "8 × 1024 = 8192 bits = 1 KiB"],
          ],
          caption:
            "Depth and width live in the array declaration. Address width does not — it lives on a port, because it belongs to whatever drives the memory, not to the memory itself. Keeping those three straight saves most beginner confusion.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the address is just a number",
          text: "The address has no special status. It is an 8-bit or 10-bit vector, computed by an adder from a program counter or a bus, exactly like any other value in the design. `mem[addr]` does not call a function or dereference a pointer. The synthesizer reads it as: 'a decoder turns these N wires into one row-select line out of 2 to the power of N options.' That decoder is the entire addressing hardware. Once you see that, memory stops being a special object and becomes an array plus a big demultiplexer.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You write `logic [31:0] mem [0:4095];`. What is the depth, the data width, and the total capacity?",
              a: "Depth 4096, data width 32 bits, capacity 4096 × 32 = 131,072 bits = 16 KiB. Read it straight off the declaration: the second bracket `[0:4095]` counts rows (4095 down to 0 inclusive is 4096), the first bracket `[31:0]` is bits per row, and the byte count is capacity divided by 8: 131072 / 8 = 16384 bytes.",
            },
            {
              q: "Why does an array need a *range* like `[0:1023]` rather than just a size?",
              a: "Because the memory is addressed by number, not by position in a queue. Naming the range tells you two things: the first valid address, and the last valid address. Verilog lets you pick any range you like — `[0:1023]` and `[1023:0]` both give 1024 rows — but they are not interchangeable, because the index you type must be a legal member of the range. Picking `[0:N-1]` means row 0 is the first row, which is what `$readmemh` assumes when it fills a file in order.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-declaration-line",
      title: "The declaration line, word by word",
      lede: "One line carries the width, the name and the depth. Read all three, then pick the address width that fits.",
      blocks: [
        {
          kind: "para",
          text: "Memories are the one place in Verilog where a declaration is genuinely hard to read, because it packs three separate facts into one line. So we will take it apart slowly and put it back together. Here is a full module with a 1 KiB memory in it, and then we will annotate every word of the declaration.",
        },
        {
          kind: "code",
          caption:
            "A complete 1024-byte single-port RAM. One address in, one byte out, all updated on the clock edge.",
          code: `module big_ram (
  input  logic         clk,
  input  logic         we,
  input  logic [9:0]   addr,
  input  logic [7:0]   din,
  output logic [7:0]   dout
);
  logic [7:0] mem [0:1023];

  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;   // write one byte into one row
    dout <= mem[addr];          // read one byte out of one row
  end
endmodule`,
          note: "`we` is short for write-enable: when it is 0 nothing is written and the memory keeps its contents. `din` is the data going in, `dout` is the data coming out, `addr` is the row number. Five pins, and they are the same five pins on every RAM in this chapter.",
        },
        {
          kind: "steps",
          title: "Read `logic [7:0] mem [0:1023];` word by word",
          items: [
            {
              head: "`logic` — the variable type",
              body: "This word says the array is something a procedural block is allowed to *assign to*, so `mem[addr] <= din` is legal inside an `always_ff`. In SystemVerilog the word is `logic`. In the older Verilog-2001 language the same job is done by `reg`, which is why you will see `reg [7:0] mem [0:255];` in a lot of other people's code — it means exactly the same thing here. Neither word has anything to do with flip-flops. `reg` is a terrible name: it does not mean the memory is a register, it means 'this is a variable, and unlike a wire, code may put values into it'. A 1024-byte memory declared `reg` is still 1024 rows of storage, not one register.",
            },
            {
              head: "`[7:0]` — the data width",
              body: "Eight wires per row, each holding one bit, so one row is one byte. This is the *data width*, and it is the same idea as `wire [7:0]` from chapter 1: a bundle of eight named bits treated as one number, with bit 7 as the heaviest.",
            },
            {
              head: "`mem` — the name",
              body: "Just a name, and `mem` is the convention used throughout this track for a writable memory. You will see `rom` for read-only ones. Nothing about the name affects the hardware.",
            },
            {
              head: "`[0:1023]` — the depth, written as an address range",
              body: "This is the part that trips people up. It is not a size, it is a *range of legal addresses*. Counting inclusively from 0 to 1023 gives 1024 legal rows. Note it runs upwards, 0 at the bottom — that is the convention in this track and it is the one `$readmemh` assumes when it loads a file top to bottom. Total capacity is 8 bits × 1024 rows = 8192 bits = 1024 bytes = 1 KiB.",
            },
            {
              head: "The address port that matches it",
              body: "The memory needs a number to index itself with, and that number lives on a port: `input logic [9:0] addr;`. Ten bits, because 2¹⁰ = 1024, which is exactly enough rows. The rule is not a convention, it is arithmetic: address width = the smallest n where 2ⁿ ≥ depth. 10 bits address 1024 rows, 8 bits address 256, 4 bits address 16.",
            },
            {
              head: "Read the two brackets in the right order",
              body: "The first bracket after the name is bits *per row*. The second bracket is how many *rows*. Students swap these constantly and get a memory 256 bytes wide and 1024 rows deep instead of 8 bits wide and 1024 rows deep — a 256 KiB monster. Say it out loud as you write it: 'eight bits per row, one thousand and twenty-three down to zero rows.'",
            },
          ],
        },
        {
          kind: "table",
          head: ["Depth (rows)", "Smallest n where 2ⁿ ≥ depth", "Address width", "Declaration"],
          rows: [
            ["16", "n = 4, because 2⁴ = 16", "4 bits", "`logic [7:0] mem [0:15];`"],
            ["256", "n = 8, because 2⁸ = 256", "8 bits", "`logic [7:0] mem [0:255];`"],
            ["512", "n = 9, because 2⁹ = 512", "9 bits", "`logic [7:0] mem [0:511];`"],
            ["1024", "n = 10, because 2¹⁰ = 1024", "10 bits", "`logic [7:0] mem [0:1023];`"],
            ["4096", "n = 12, because 2¹² = 4096", "12 bits", "`logic [31:0] mem [0:4095];`"],
          ],
          caption:
            "Note that depth is only *approximately* a power of two. A depth of 1000 needs 10 bits, because 2⁹ = 512 is too few and 2¹⁰ = 1024 is enough — and addresses 1000 through 1023 simply never get used. Wasting a few address values is free; wasting address *bits* is not.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Too many address bits is a real warning",
          text: "Declare a 256-row memory and hand it a 16-bit address port. `mem[addr]` is now indexing 65,536 possible positions into an array with 256 legal ones, and Verilator says so: `WIDTHTRUNC`, because the index expression is wider than the address range needs. On top of that, an out-of-range index is *not* bounds-checked. Reading `mem[400]` from a 256-row memory does not stop the build and does not raise an error — it quietly returns `x`, the unknown value. In hardware the decoder simply has no wire there to connect to. Fix the warning by sizing the address to the depth, not by ignoring it.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Write the declaration for a memory holding 4096 bytes. Answer: `logic [7:0] mem [0:4095];`, and the address port is `input logic [11:0] addr;` because 2¹² = 4096.",
            "A memory needs to hold 1000 bytes. How wide is the address? 2⁹ = 512 is too few, 2¹⁰ = 1024 is enough, so 10 bits. Write the declaration as `logic [7:0] mem [0:999];` and then work out how many legal addresses go unused: 1024 − 1000 = 24.",
            "Now double that memory to 32 bits per row. Write the full declaration, the address port, and the total capacity in bytes: `logic [31:0] mem [0:999];` with `input logic [9:0] addr;`, giving 1000 × 4 = 4000 bytes.",
            "Take the 1024-row memory. List the binary patterns of the address 5. Ten bits, so pad it: 0000000101. Confirm 2¹⁰ = 1024 distinct patterns exist and 5 is one of them.",
            "Write down the rule for the address width in one sentence you could repeat in an exam: the address is n bits wide because a depth of 2ⁿ rows needs exactly n wires to name them all.",
          ],
        },
        {
          kind: "trap",
          wrong: "`logic [7:0] mem [0:255];` with a 16-bit address port, `input logic [15:0] addr;`.",
          right: "`input logic [7:0] addr;` — size the address to the depth.",
          why: "Eight address bits can name 256 rows exactly, so every value of `addr` is legal. Sixteen bits name 65,536 positions, 65,280 of which do not exist. Verilator flags the mismatch with a WIDTHTRUNC warning on the index, and if you suppress it, any address above 255 reads back as x with no other complaint. The simulator is not protecting you here; there is no runtime bounds check.",
        },
      ],
    },
    {
      slug: "reading-and-writing",
      title: "Reading and writing one memory",
      lede: "One always block, one address, one clock edge. Write on the edge, read on the edge, and know what lands where.",
      blocks: [
        {
          kind: "para",
          text: "A memory needs only two operations. Write: put the value on `din` into row `addr`. Read: take whatever is in row `addr` and put it on `dout`. Both operations name a row with the same number, and both happen on a clock edge — that is what makes the memory *synchronous*, and we will look at what changes when it is not.",
        },
        {
          kind: "define",
          items: [
            { term: "write port", meaning: "The group of pins a write needs: the address to write, the data to write, and a write-enable that says whether to do it at all." },
            { term: "read port", meaning: "The group of pins a read needs: the address to read, and the data coming back out." },
            { term: "write-enable", meaning: "The one-bit signal that arms the write. When it is 0 the memory is untouched and keeps everything it already held." },
            { term: "port", meaning: "A named pin on the module, with a direction and a width." },
          ],
        },
        {
          kind: "code",
          caption:
            "Single-port RAM, synchronous write and synchronous read. This is the shape of the lesson's module.",
          code: `module sram (
  input  logic        clk,
  input  logic        we,
  input  logic [7:0]  addr,
  input  logic [7:0]  din,
  output logic [7:0]  dout
);
  logic [7:0] mem [0:255];

  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;   // write: one byte into one row
    dout <= mem[addr];          // read:  one byte out of the addressed row
  end
endmodule`,
          note: "Read the two lines as sentences. First: 'if the write-enable is high, copy din into row addr.' Second: 'whatever row addr holds, put it on dout.' Note that the write is guarded by `if (we)` and the read is not — the read happens every cycle, because a register has to be given a value every cycle and `dout` is a register.",
        },
        {
          kind: "steps",
          title: "Why the write is guarded and the read is not",
          items: [
            {
              head: "`if (we) mem[addr] <= din;` — the write",
              body: "The `if` is the guard. When `we` is 0 the statement does not execute and row `addr` keeps its old contents. That is the only thing `we` does. There is no separate 'erase' operation; a memory that is not written is a memory that remembers.",
            },
            {
              head: "`dout <= mem[addr];` — the read",
              body: "`dout` is a register (an `output logic` assigned in a clocked block), so it must be given a fresh value on every single clock edge. You cannot leave it alone. That is why there is no `if` on the read line — the address input is always pointing at *some* row, valid or not, and `dout` gets that row's contents either way.",
            },
            {
              head: "The consequence you must design around",
              body: "The address you see on the `addr` pin at one edge is not the address whose data comes out. The data for address A presented at edge N appears on `dout` *after* edge N. So to read row 5 you hold `addr = 5` across a clock edge and then wait one more edge before `dout` is trustworthy. Everything downstream has to be pipelined around that one cycle of delay.",
            },
            {
              head: "Both lines use `<=`, not `=`",
              body: "The non-blocking assignment. All right-hand sides are evaluated using the values as they were *before* this clock edge, and every update lands together at the end. This is what makes the read-during-write question well defined at all, and it is covered in detail a few sections down. Using a blocking `=` here instead would introduce a race between the two lines and make simulation disagree with the real hardware.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "One block, always",
          text: "Every statement that writes to a memory must live in exactly one procedural block. Two `always_ff` blocks both assigning into `mem` means two things driving the same storage, and Verilator reports MULTIDRIVEN — which is a real error, not a style note, because the resulting value is genuinely undefined. The fix is never 'pick one and delete the other'. The fix is to merge the writes into a single block, or to give each block its own memory.",
        },
        {
          kind: "doThis",
          title: "Trace the first four clock edges on paper (8 minutes)",
          items: [
            "Draw a table with four columns: edge number, `we`, `addr`, `din`, and then a separate column for the value on `dout` *after* that edge. Add a row above the table: before the first edge, every row of `mem` is x and `dout` is x.",
            "Edge 1: we=1, addr=5, din=`8'hAB`. What goes into mem[5]? `8'hAB`. What comes out on dout? Still x, because `mem[5]` was x at the moment the right-hand side was evaluated. Write that down — it is the single most common surprise in this chapter.",
            "Edge 2: we=0, addr=5. Nothing is written. `dout` becomes `8'hAB`. Confirm the read is one edge behind the write.",
            "Edge 3: we=0, addr=6. `dout` becomes x, because row 6 was never written. This is why a RAM needs an initialisation story if you ever read it before writing it.",
            "Edge 4: we=1, addr=5, din=`8'h77`. Now decide what `dout` is, and be ready for the answer to depend on which of the two read-during-write styles you wrote.",
          ],
        },
        {
          kind: "trap",
          wrong: "`wire [7:0] mem [0:255];` followed by `mem[addr] <= din;` inside an `always_ff`.",
          right: "`logic [7:0] mem [0:255];` (or `reg` in Verilog-2001) for anything a procedural block assigns to.",
          why: "A net — `wire` — is a connection, not a storage element. You cannot perform a procedural assignment to one, so this is a syntax error at the assignment, not at the declaration. The underlying rule is simple: if code is going to put values into it with `=` or `<=`, it must be declared as a variable. The keyword `reg` does not make it a register; it just makes it assignable.",
        },
      ],
    },
    {
      slug: "single-port-vs-dual-port",
      title: "Single-port and dual-port",
      lede: "How many addresses can be in flight at once. That single number decides what kind of hardware you get.",
      blocks: [
        {
          kind: "para",
          text: "A *port* on a memory is one complete address path. If the reader and the writer share one address, the memory has one port: **single-port**. Give the reader its own address and give the writer its own, and it has two: **dual-port**. The words count address paths, not pins — a single-port memory still has five pins, it just cannot point two of them at two different rows at once.",
        },
        {
          kind: "analogy",
          text: "A single-port memory is a library desk with one librarian. Whether you are fetching a book or returning one, you go to the same window and give them the same shelf number. You cannot hand them two different shelf numbers at once, so if you want to return a book to shelf 12 and fetch one from shelf 300 simultaneously, you queue up and do it in two turns. A dual-port memory is a desk with two windows: a returns clerk at one and a lends clerk at the other, each with their own slip of paper. Same wall of shelves behind both windows — which is exactly the interesting part, because they can still collide.",
        },
        {
          kind: "code",
          caption:
            "Single-port RAM. One address, used by both the write and the read. Five pins.",
          code: `module sram (
  input  logic        clk,
  input  logic        we,
  input  logic [7:0]  addr,
  input  logic [7:0]  din,
  output logic [7:0]  dout
);
  logic [7:0] mem [0:255];

  always_ff @(posedge clk) begin
    if (we) mem[addr] <= din;
    dout <= mem[addr];
  end
endmodule`,
          note: "One `addr` port means you cannot read row 7 and write row 200 on the same edge. The single address pins both operations to the same row.",
        },
        {
          kind: "code",
          caption:
            "Dual-port RAM. Two independent address paths, still one array, still one always block.",
          code: `module dual_port_ram (
  input  logic        clk,
  input  logic        we_a,
  input  logic [7:0]  addr_a,
  input  logic [7:0]  din_a,
  output logic [7:0]  dout_a,
  input  logic        we_b,
  input  logic [7:0]  addr_b,
  input  logic [7:0]  din_b,
  output logic [7:0]  dout_b
);
  logic [7:0] mem [0:255];

  always_ff @(posedge clk) begin
    if (we_a) mem[addr_a] <= din_a;   // port A writes
    dout_a <= mem[addr_a];            // port A reads
    if (we_b) mem[addr_b] <= din_b;   // port B writes, independently
    dout_b <= mem[addr_b];
  end
endmodule`,
          note: "Both ports write to the same `mem`, and that is legal — because there is still exactly one block driving the array. What is not legal is two blocks. What is also undefined is both ports writing the *same* address on the same edge; the hardware has no rule for that, and neither does the language. Avoid it.",
        },
        {
          kind: "table",
          head: ["", "Single-port", "Dual-port"],
          rows: [
            ["Address inputs", "one `addr`", "two: `addr_a` and `addr_b`"],
            ["Write data inputs", "one `din`", "two: `din_a` and `din_b`"],
            ["Read data outputs", "one `dout`", "two: `dout_a` and `dout_b`"],
            ["Typical use", "a CPU fetching and storing through one bus", "a pipeline stage reading while the next stage writes"],
            ["Reads two different rows per cycle", "no", "yes"],
            ["Typical hardware cost", "cheapest — one decoder", "roughly doubles the memory, or splits it into two halves"],
          ],
          caption:
            "Dual-port buys you simultaneous access at roughly double the cost. Reach for single-port unless something genuinely needs two rows in the same cycle.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The consequence in one sentence",
          text: "A single-port memory has one address, so on any given clock edge the read and the write are pointing at the same row — you cannot read one location while writing a different one in the same cycle, and if you need that, you need dual-port or a bank of memories.",
        },
        {
          kind: "trap",
          wrong: "Adding a second read path by duplicating the always block, so you end up with two blocks both touching `mem`.",
          right: "One block containing both ports' logic, as in the dual-port example above.",
          why: "Two procedural blocks driving one array is MULTIDRIVEN, and unlike a duplicate `assign` on a wire the error is not cosmetic — the value of every row becomes genuinely unpredictable. Dual-port is a property of the *port list*, not a licence to add a second writer.",
        },
      ],
    },
    {
      slug: "sync-vs-async-read",
      title: "Synchronous and asynchronous reads",
      lede: "The most important timing decision in the chapter: does the data come back now, or one clock later?",
      blocks: [
        {
          kind: "para",
          text: "An **asynchronous read** (also called a combinational read, or a transparent read) means the data appears the instant the address changes. Change `addr` and `dout` is already correct, with no clock involved. A **synchronous read** means the address is captured on a clock edge and the data arrives one clock later. The word 'synchronous' just means 'in step with the clock'.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why synchronous is the one you want for real memory",
          text: "An asynchronous read of a large memory is a multiplexer as wide as the entire memory. To pick row 5 out of 1024, the hardware must build a 1024-to-1 mux in front of the output — every row's byte-width worth of wire, all selected by the address. On a small ROM that is fine and is what you want for a lookup table. On a large RAM it is thousands of gates of combinational logic in front of the output pin, with a long delay from address to data, and it burns area for nothing. Registering the address (a synchronous read) turns that mux into a memory block that does the selection internally, where it is cheap. That is why a synchronous read is the shape that maps to block RAM and an asynchronous read is the shape that maps to logic.",
        },
        {
          kind: "code",
          caption:
            "Asynchronous read. Two equivalent spellings. Change `addr` and `dout` follows immediately.",
          code: `module async_rom (
  input  logic [3:0] addr,
  output logic [7:0] dout
);
  logic [7:0] rom [0:15];

  assign dout = rom[addr];   // data is out as soon as the address moves
endmodule`,
          note: "A continuous `assign` is the simplest way to write it. The `always_comb` form below is the same circuit and is what you write when the read needs a condition attached.",
        },
        {
          kind: "code",
          caption:
            "Synchronous read. The address is sampled on the edge; the data comes out one clock later.",
          code: `module sync_rom (
  input  logic        clk,
  input  logic [3:0]  addr,
  output logic [7:0]  dout
);
  logic [7:0] rom [0:15];

  always_ff @(posedge clk) begin
    dout <= rom[addr];   // addr is captured here; data arrives after the edge
  end
endmodule`,
          note: "Notice there is no write path at all — a ROM only reads. This is the smallest synchronous-read memory there is.",
        },
        {
          kind: "table",
          head: ["", "Asynchronous read", "Synchronous read"],
          rows: [
            ["Written in", "`assign` or `always_comb`", "`always_ff @(posedge clk)`"],
            ["When data appears", "immediately, as the address changes", "one clock edge after the address is presented"],
            ["Output is", "pure combinational logic", "a register, always one cycle behind"],
            ["Typical cost", "a mux as wide as the whole memory", "cheap; the selection happens inside the block"],
            ["Suits", "small ROMs, lookup tables, small register files", "large RAM, block RAM, anything mapped to a memory primitive"],
            ["Data before the first edge", "already valid after time 0", "x until the first clock edge"],
          ],
          caption:
            "Both are correct. They are answers to different questions about how much area you have and how much delay you can afford.",
        },
        {
          kind: "code",
          caption: "Broken. Note what is missing on the second line.",
          code: `always_comb begin
  if (use_ram) dout = ram[addr];   // no else — what happens when use_ram is 0?
end`,
        },
        {
          kind: "trap",
          wrong: "Reading the array inside `always_comb` but only assigning the output on some paths, with no `else` and no default.",
          right: "Give the output a value on every path — a top-of-block default, or an `else` on every `if`.",
          why: "When no branch assigns `dout`, the only consistent thing for real hardware to do is keep the previous value — which means building a latch, a piece of storage that is invisible in your source. Verilator says LATCH, and in this track a LATCH warning is always a real bug. A latch on a memory's output also reintroduces exactly the combinational delay you were trying to avoid. The fix is one line: add `else dout = 8'h00;`, or a default `dout = 8'h00;` as the first statement inside the block.",
        },
        {
          kind: "doThis",
          title: "Compare the two by hand (5 minutes)",
          items: [
            "Take the 16-entry Fibonacci ROM from the pset: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 121, 98. With the asynchronous version, `addr = 4'd5` and `dout` is `8'h05` immediately. Write that down.",
            "With the synchronous version, `dout` is x until the first clock edge with `addr = 5` presented. At that edge `dout` becomes `8'h05`. One edge of delay. Confirm that on your diagram.",
            "Now drive the synchronous version with `addr` changing every cycle: 0, 1, 2, 3. Write the value of `dout` on each of the four edges. You get 0, 0, 1, 1 — it lags by one, because the data for address N is only known at edge N and arrives after it. This is the pipeline behaviour you have to account for everywhere downstream.",
            "Decide which one you would pick for a 64 KiB boot ROM and give one sentence of reasoning. (Synchronous: the alternative is a 65,536-to-1 mux in front of the output.)",
          ],
        },
      ],
    },
    {
      slug: "read-during-write",
      title: "Read-during-write: you must choose",
      lede: "When the read and the write land on the same address in the same cycle, the answer is a decision, not a default.",
      blocks: [
        {
          kind: "para",
          text: "Read-during-write is the situation where `we` is high and the read address is the same address being written. What should `dout` show — the value that was there before this edge, or the value being written now? Hardware has no opinion. It is genuinely undefined, and the language will not stop you from writing code that relies on the wrong answer. So you decide, you write it down, and you keep it consistent.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "One rule tells you the answer: non-blocking means 'before the edge'",
          text: "With `<=`, every right-hand side is evaluated using the values as they stood *before* the clock edge, and all the updates land together afterwards. So `dout <= mem[addr]` always reads the row as it was before this edge — which gives you the OLD value, no matter where the line sits relative to the write. Swapping the order of the two lines changes nothing. If you want the NEW value you have to say so explicitly, by forwarding `din` straight to the output on a write cycle. Read this rule once and read-during-write stops being something to memorise.",
        },
        {
          kind: "code",
          caption:
            "Read-first (old data). The plain form, with no extra work: `mem[addr]` already holds the pre-edge value.",
          code: `always_ff @(posedge clk) begin
  if (we) mem[addr] <= din;
  dout <= mem[addr];   // always the value from BEFORE this edge
end`,
          note: "This is the two-line form you get for free. Most real hardware, and most vendor memory primitives, behave this way unless you ask otherwise.",
        },
        {
          kind: "code",
          caption:
            "Write-first (new data). The write is forwarded straight to the output on a write cycle.",
          code: `always_ff @(posedge clk) begin
  if (we) mem[addr] <= din;
  dout <= we ? din : mem[addr];   // on a write, show din; otherwise read
end`,
          note: "The ternary reads as 'if we is high, the new value; otherwise the old row'. This is the behaviour the lesson's read-during-write check is asking for, and it costs one multiplexer in front of the output register.",
        },
        {
          kind: "table",
          head: ["Style", "What dout shows on a write cycle", "How you write it", "Typical use"],
          rows: [
            ["read-first (old data)", "the value before the write", "`dout <= mem[addr];`", "most silicon; the safe default"],
            ["write-first (new data)", "the value being written", "`dout <= we ? din : mem[addr];`", "write-to-read pipelines, register files"],
            ["no-change / unmapped", "unchanged, or x", "guard the read with `if (!we)`, else hold", "handshake protocols that need a dead cycle"],
          ],
          caption:
            "Pick one per design and note it in a comment. If your testbench checks one and your code does the other, the failure looks like a data bug somewhere else entirely.",
        },
        {
          kind: "trap",
          wrong: "Assuming that moving `dout <= mem[addr];` above the write line changes read-during-write behaviour.",
          right: "Keep the read-first line as it is, and add an explicit forward if you want write-first.",
          why: "This is a very natural assumption and it is wrong. Both statements use `<=`, so both right-hand sides are evaluated against the pre-edge contents of `mem`. The write has not landed yet at either point in the code. Statement order matters for blocking `=` and not for non-blocking `<=`. The only way to get the new value onto the output during a write cycle is to reference `din` on that cycle, which is what `we ? din : mem[addr]` does.",
        },
        {
          kind: "doThis",
          title: "Work out all three styles at edge 4 (5 minutes)",
          items: [
            "Set up from the earlier trace: mem[5] currently holds `8'hAB`. At edge 4 you drive we=1, addr=5, din=`8'h77`.",
            "Read-first: what is `dout` after edge 4? `8'hAB` — the pre-edge value of mem[5].",
            "Write-first: what is `dout` after edge 4? `8'h77`, because the ternary selects `din` when `we` is high.",
            "Now run edge 5 with we=0, addr=5 for both designs. Both give `8'h77`. Write that conclusion in one sentence: the two designs differ for exactly one cycle, the write cycle, and agree on every read afterwards. That is why a single mismatched test case is so easy to misdiagnose.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "In `if (we) mem[addr] <= din; dout <= mem[addr];`, what is `dout` on a write cycle, and why does moving the second line up not change it?",
              a: "It is the OLD value. Non-blocking assignment evaluates every right-hand side using the state just before the clock edge, and the update to `mem[addr]` has not happened yet at either point in the block. Reordering statements only changes things when they use blocking `=`, where the first assignment takes effect immediately and the second would read the new value. With `<=`, both see the same pre-edge snapshot.",
            },
            {
              q: "You need write-first behaviour and the memory must map to block RAM. What is the smallest change to the two-line form?",
              a: "Change the read line to `dout <= we ? din : mem[addr];`. The write line is untouched. The array declaration, the address width and the synchronous-read shape are all unchanged, so the memory still infers the same way — you have only added a multiplexer on the output path. The array itself is untouched, so nothing about the inferred storage changes.",
            },
          ],
        },
      ],
    },
    {
      slug: "loading-a-rom",
      title: "Filling a memory with something",
      lede: "A RAM fills itself by being written. A ROM has to be given its contents — and where those contents really come from.",
      blocks: [
        {
          kind: "para",
          text: "RAM has no startup problem: every row is just a variable, and it starts unknown until someone writes it. ROM is different — its whole purpose is to already contain something when the circuit wakes up. That raises an honest question, and it is worth being blunt about the answer: nothing in an `initial` block is hardware.",
        },
        {
          kind: "code",
          caption:
            "An initial block filling 16 rows one at a time. This is what the pset's starter does.",
          code: `module boot_rom (
  input  logic [3:0] addr,
  output logic [7:0] dout
);
  logic [7:0] rom [0:15];

  initial begin
    rom[0]  = 8'h00;
    rom[1]  = 8'h01;
    rom[2]  = 8'h01;
    rom[3]  = 8'h02;
    rom[4]  = 8'h03;
    rom[5]  = 8'h05;
    rom[6]  = 8'h08;
    rom[7]  = 8'h0D;
    rom[8]  = 8'h15;
    rom[9]  = 8'h22;
    rom[10] = 8'h37;
    rom[11] = 8'h59;
    rom[12] = 8'h90;
    rom[13] = 8'hE9;
    rom[14] = 8'h79;
    rom[15] = 8'h62;
  end

  assign dout = rom[addr];
endmodule`,
          note: "Sixteen lines of hand-written data is fine at 16 rows and hopeless at 4096. That is exactly why the industry has a file format for this.",
        },
        {
          kind: "code",
          caption:
            "The same ROM loaded from a file. One line instead of sixteen.",
          code: `module boot_rom (
  input  logic [3:0] addr,
  output logic [7:0] dout
);
  logic [7:0] rom [0:15];

  initial begin
    $readmemh("boot.hex", rom);
  end

  assign dout = rom[addr];
endmodule`,
          note: "`$readmemh` reads a text file of hex bytes and pours them into the array, starting at the lowest address and walking upward, one value per line. `$readmemb` is the same thing for binary digits instead of hex — `boot.hex` is just the readable one. Both fill only the rows named in the file; any row not mentioned stays x.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "Be honest about what `initial` and `$readmemh` actually are",
          text: "Both exist only in simulation. On a real chip there is no `initial` block — the array starts as physical memory cells that hold whatever the manufacturing process left in them, which is noise. Real ROM contents come from a file that is given to the device programmer, which burns the bits into the memory permanently before the chip ever leaves the factory. So `$readmemh` is the industry method because it is the industry *model* of that step: it is the simulation stand-in for a file you hand to the programmer. This is why real designs also carry a synthesizable path to the same contents — an `initial` block that the synthesis tool recognises and converts into a memory initialisation file. In this platform, the simulator runs in a sandbox with no filesystem next to your source, which is exactly why the pset hands you the inline `initial` version instead.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Should you reset a memory? No.",
          text: "A reset on a 1 KiB RAM means 8192 flops of reset logic and a reset fan-out tree to drive them, to bring every row to a value you are about to overwrite anyway. Real designs do not reset RAM and neither should you. A ROM does not need one either — its contents are static, not a state that changes. If you find yourself adding a reset branch to a memory `always` block, that is a strong signal you should delete it.",
        },
        {
          kind: "trap",
          wrong: "`$readmemh(\"boot.hex\", rom);` with a path the tool cannot reach.",
          right: "Check the exact filename, including the extension and any subdirectory, and remember where the tool was run from.",
          why: "This is the single most common runtime surprise with memories, and it is not a compile error at all — the design builds fine. It fails when the simulation reaches the initial block, with a file-not-found message. Paths are resolved relative to the working directory, not to the source file, so a file that exists can still be unreachable. If you are in this platform, know that the sandbox has no `boot.hex` sitting next to your source, which is the reason the pset uses inline assignments.",
        },
        {
          kind: "doThis",
          title: "Two small paper exercises (5 minutes)",
          items: [
            "A ROM has 16 rows and the file `boot.hex` contains 20 lines. What happens to rows 16 through 19, and what does `rom[16]` read as? They are never mentioned, so the array keeps its initial value, which is x. This is a real bug in real designs: a short file gives you an x in your data path that only shows up at runtime.",
            "Decide, in one sentence each: (a) should you reset a RAM? No — it costs 8192 flops of reset logic to produce a value nobody keeps. (b) should a ROM have a reset? No — its contents never change, so there is no state to reset. Write both sentences down; 'reset everything' is a habit worth breaking precisely here.",
          ],
        },
      ],
    },
    {
      slug: "boot-rom-end-to-end",
      title: "The boot ROM, end to end",
      lede: "The pset as a whole: a Fibonacci image, loaded inline, read out on the clock with a valid flag.",
      blocks: [
        {
          kind: "para",
          text: "The pset gives you 16 rows and a boot image that is the Fibonacci sequence taken modulo 256: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, then 233 + 144 = 377 which wraps to 121, then 121 + 233 = 354 which wraps to 98. The port list is `top(clk, rst, addr, dout, valid)` with an active-high asynchronous reset: `addr` selects the row, `dout` is the row registered on the clock edge, and `valid` rises with the first read after reset and stays high until the next reset. Everything about chapter 13 is in there: an array, an address width, a load step, and a synchronous read port.",
        },
        {
          kind: "code",
          caption:
            "The whole design: a 16-entry ROM, loaded inline, read on the clock with a sticky valid flag.",
          code: `module top (
  input  logic       clk,
  input  logic       rst,    // active-high async reset
  input  logic [3:0] addr,
  output logic [7:0] dout,
  output logic       valid
);
  // Fibonacci boot image (mod 256): 0,1,1,2,3,5,8,13,21,34,55,89,144,233,121,98
  logic [7:0] rom [0:15];

  initial begin
    rom[0]  = 8'h00;
    rom[1]  = 8'h01;
    rom[2]  = 8'h01;
    rom[3]  = 8'h02;
    rom[4]  = 8'h03;
    rom[5]  = 8'h05;
    rom[6]  = 8'h08;
    rom[7]  = 8'h0D;
    rom[8]  = 8'h15;
    rom[9]  = 8'h22;
    rom[10] = 8'h37;
    rom[11] = 8'h59;
    rom[12] = 8'h90;
    rom[13] = 8'hE9;
    rom[14] = 8'h79;
    rom[15] = 8'h62;
  end

  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      dout  <= 8'h00;
      valid <= 1'b0;
    end else begin
      dout  <= rom[addr];   // synchronous read: data arrives one edge after the address
      valid <= 1'b1;        // sticky: rises with the first post-reset read, cleared only by reset
    end
  end
endmodule`,
          note: "`addr` is 4 bits because 2⁴ = 16 rows. `dout` is registered, so it shows the row addressed on the previous edge — one cycle of latency, the synchronous-read shape that maps to block RAM. `valid` is not per-address: it goes high on the first read after reset and stays high until the next reset. The two classic off-by-one hex digits live at rows 8 (`8'h15`, 21) and 13 (`8'hE9`, 233) — the bench reads both, so convert those two rows by hand before you trust the rest.",
        },
        {
          kind: "steps",
          title: "Walk the bench sequence by hand",
          items: [
            {
              head: "Reset",
              body: "Hold `rst` high across one clock edge: `dout` becomes `8'h00` and `valid` becomes 0. Release `rst`; before the next edge the outputs still read 00 and 0 — that is the bench's \"valid low after reset\" row, and it passes because nothing has been read yet.",
            },
            {
              head: "First read",
              body: "Drive `addr = 0` across one edge. `dout` captures `rom[0]` = `8'h00` and `valid` rises to 1 — \"valid rises with data\". Note the latency: the data you see after the edge is the row you addressed before it.",
            },
            {
              head: "Spot reads",
              body: "Drive `addr = 5` across an edge and `dout` reads `05`; `addr = 8` gives `15`; `addr = 13` gives `E9`; `addr = 15` gives `62`. Each value arrives one edge after its address. If row 8 reads `14` or row 13 reads `E8`, your hex conversion — not the read logic — is off by one in the low digit.",
            },
            {
              head: "Valid stays high",
              body: "Drive `addr = 0` across one more edge: `dout` is `00` again and `valid` is still 1. Nothing in the design ever clears `valid` except `rst`, so every read after the first passes that row. If your `valid` flickers with the address, you gated it on something other than reset.",
            },
          ],
        },
        {
          kind: "code",
          caption:
            "Sticky valid, registered data — the two output rules side by side.",
          code: `// dout: synchronous read. It captures rom[addr] on every edge,
// so it always shows the row addressed on the PREVIOUS edge.
// Change addr and dout follows one edge later.
//
// valid: sticky until reset. The first edge after reset sets it,
// and only rst clears it — so it rises with the first read
// and stays high across every read after. Do not gate dout
// on valid, and do not clear valid when the address changes:
// either turns a passing design into one that flickers.`,
          note: "There is no write port on this ROM, so there is no read-during-write decision to make — the only timing rule is the one cycle of read latency. Present the address, wait one edge, then trust `dout`. A combinational `assign dout = rom[addr]` would answer in the same cycle but cannot be built from block RAM; this pset pays the cycle because the shape is the lesson.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The testbench for a ROM is a sweep, not a poke",
          text: "There is nothing to write into a ROM, so the testbench only has to walk every address and compare. Keep yours short: an `initial` block with a `for` loop, one display or comparison per address, then `$finish`. The `i[3:0]` bit-slice takes the low four bits of the loop counter and drops the rest, so the counter can stay a plain `integer`.",
        },
        {
          kind: "code",
          caption: "A whole ROM testbench, which is less code than the module.",
          code: `integer i;
integer errors = 0;

initial begin
  rst = 1'b1; addr = 4'd0;
  @(posedge clk); #1;   // reset edge: dout 00, valid 0
  rst = 1'b0;
  for (i = 0; i < 16; i = i + 1) begin
    addr = i[3:0];      // integer bit-slice: take the low 4 bits
    @(posedge clk); #1; // wait the one-edge read latency out
    if (dout !== expected(i))
      errors = errors + 1;
  end
  $display("SUMMARY %0d errors", errors);
  $finish;
end`,
        },
        {
          kind: "check",
          items: [
            {
              q: "The ROM is 16 entries of 8 bits. What width must `addr` be, and what happens if you declare it 5 bits instead?",
              a: "4 bits, because 2⁴ = 16 exactly. With a 5-bit address, only 16 of the 32 possible values are legal: `mem[addr]` now indexes 32 positions into a 16-row array, so Verilator reports WIDTHTRUNC, and any address from 16 to 31 reads back as x rather than erroring. Because this ROM reads synchronously, the x appears on `dout` one edge after you drive the bad address — the registered output lags the address by a cycle.",
            },
            {
              q: "What does reset clear here, and why is there still an `initial` block for the ROM contents?",
              a: "Reset clears the two output registers — `dout` back to `8'h00` and `valid` back to 0 — because those are state that evolves. It does not touch `rom` itself: the contents are static, and loading them belongs in an `initial` block (simulation only) or, in real silicon, in the file handed to the device programmer. A reset on the array would cost 128 flops here, and thousands on a real one, to reproduce values that never change.",
            },
            {
              q: "You type `8'h14` at row 8 instead of `8'h15` and the build still succeeds. Why is that dangerous?",
              a: "Because the language has nothing to say about whether your constants match your intent. `8'h14` is a perfectly good 8-bit value; the array is happily stored and the address is happily read. The only thing that catches it is a testbench comparing against what the design is supposed to contain — which is why the sweep exists, and why 'the build is green' is never the same claim as 'the design is right'.",
            },
          ],
        },
      ],
    },
    {
      slug: "mistakes-that-bite-here",
      title: "The mistakes that actually bite",
      lede: "Five errors a newcomer makes with memories, each with the fix and the reason the wrong version fails.",
      blocks: [
        {
          kind: "para",
          text: "Memories are unforgiving because every one of these compiles. Nothing stops at build time; the failure shows up as x in a waveform, or as a data value that is subtly wrong three modules downstream. Read these once and you will recognise them.",
        },
        {
          kind: "trap",
          wrong: "Two `always_ff` blocks both assigning into `mem` — say one for the write path and one for an initial load.",
          right: "One block for everything that writes the array. Put the `initial` load in its own `initial` block (which is a different thing entirely and does not count), and merge the two clocked writes into one.",
          why: "MULTIDRIVEN. Two procedural blocks driving one array means every row has two possible values each cycle, and when they disagree the result is genuinely undefined, not merely 'the last one wins'. It is the same class of error as two `assign`s on a wire, but with storage attached it is much harder to see in a waveform.",
        },
        {
          kind: "trap",
          wrong: "A combinational read of a large memory written as `always_comb`, with the output assigned on only some paths.",
          right: "Assign `dout` on every path — a default at the top of the block, or an `else` on each `if`.",
          why: "LATCH. When a path leaves `dout` unassigned, the only physically consistent behaviour is to remember the old value, which builds a latch. It is invisible in the source, it is usually slower than the logic you meant to write, and it reintroduces the long combinational path that a synchronous read exists to avoid.",
        },
        {
          kind: "trap",
          wrong: "`reg [7:0] mem [0:255];` with `input logic [15:0] addr;` — depth and address width chosen independently.",
          right: "Derive the address width from the depth every time: smallest n with 2ⁿ ≥ depth. For 256 rows that is 8 bits.",
          why: "WIDTHTRUNC on the index, plus silent x for every address above 255. Indexing is not bounds-checked, so the failure mode is an unknown value propagating into your logic rather than a compile error. This is the same width discipline from chapter 1 — a value that does not fit gets truncated or goes unknown — applied to the one place where it is easy to forget.",
        },
        {
          kind: "trap",
          wrong: "Writing `mem[addr] = din;` with a blocking `=`, or relying on statement order to change read-during-write.",
          right: "Use `<=` for the memory update, and express the read-during-write choice explicitly as `we ? din : mem[addr]` if you want write-first.",
          why: "Blocking assignment takes effect immediately, so the read line sees the value the write line just produced — which makes read-during-write depend on the order you happened to type, and on whether the tool evaluates lines the way you expect. Real hardware has no such order. `<=` makes the pre-edge snapshot well defined and makes the behaviour identical in simulation and silicon.",
        },
        {
          kind: "trap",
          wrong: "Assuming a memory has an initial value, or resetting one on every clock cycle's worth of state.",
          right: "Treat unwritten rows as x and plan for it. Reset only the small control registers around the memory, never the memory.",
          why: "There is no reset on a RAM in real hardware and no meaningful initial value — every row is unknown until written. Building reset logic for 8192 rows of storage costs 8192 flops and a fan-out tree, and the moment you use the memory the reset is irrelevant. The instinct to reset everything is right for registers and wrong for memories, which is exactly the distinction this chapter is for.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "A last word on 'inferred' versus 'instantiated'",
          text: "Everything in this chapter has been *inferred* memory: you write an array and a clocked read, and the toolchain decides whether to build flip-flops, a lookup table, or a dedicated memory block. That is portable and it is what you should use first. On a real FPGA you can also *instantiate* the vendor's memory primitive directly when you need a feature inference will not give you — a specific dual-port mode, an unusual width, or simply a guarantee. This platform simulates in software, so there is no memory block to instantiate and inference is the whole story; the vendor primitives you may have heard of (`BRAM18E1` and its relatives) are what you would reach for on actual silicon. Either way, the read discipline you have learned is the same: it is what makes the shape inferable in the first place.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You get `WIDTHTRUNC` on `mem[addr]` in a memory with depth 1024. The address port is 12 bits. What is wrong and what is the fix?",
              a: "12 bits address 4096 rows, so two bits are more than the memory has. Fix the port to `input logic [9:0] addr;` — 2¹⁰ = 1024, exactly right. Leaving it at 12 bits is not just untidy: addresses 1024 through 4095 are out of range, indexing is not bounds-checked, and those reads quietly return x.",
            },
            {
              q: "You add a second always block to a working RAM so that address 0 is preset to 8'hFF at startup, and Verilator reports MULTIDRIVEN. Why?",
              a: "Because MULTIDRIVEN is being reported on the array, not on address 0. Any second block that assigns into `mem` — even one that only ever writes row 0 — is a second driver for every row. The fix is to do the preset inside the existing block, or in an `initial` block, which is a different construct and does not create a clocked second driver.",
            },
            {
              q: "In one sentence: what is the difference between a single-port and a dual-port memory?",
              a: "A single-port memory has one address, shared by the read and the write, so it can only touch one row per cycle; a dual-port memory has two independent address paths, so it can read one row while writing a different one in the same cycle.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "address", meaning: "A number that names one row of a memory, like `mem[5]` selecting the sixth row." },
    { term: "address width", meaning: "How many bits the address needs — the smallest n where 2ⁿ covers the depth. 1024 rows needs 10 bits." },
    { term: "asynchronous read", meaning: "A read where the data appears the instant the address changes, with no clock involved." },
    { term: "block RAM", meaning: "A dedicated on-chip memory block the toolchain builds for you, instead of ordinary flip-flops, because you wrote a synchronous-read shape." },
    { term: "data width", meaning: "How many bits one row of a memory holds — the `[7:0]` in the declaration." },
    { term: "depth", meaning: "How many rows a memory has — the count in `[0:1023]`, which is 1024." },
    { term: "dual-port RAM", meaning: "A memory with two independent address paths, so it can read one row and write another in the same cycle." },
    { term: "non-blocking assignment", meaning: "The `<=` operator: every right-hand side is read as it was before the clock edge, and all updates land together." },
    { term: "read-during-write", meaning: "The case where the read and the write hit the same address on the same cycle. You must choose whether the output shows the old value or the new one." },
    { term: "read port", meaning: "One complete address path for reading: an address in, data out. Ports are counted, not pins — a single-port RAM still has five pins." },
    { term: "ROM", meaning: "Read-only memory — an array with no write path, whose contents are fixed at load time." },
    { term: "single-port RAM", meaning: "A memory with one address shared by the read and the write, so it touches only one row per cycle." },
    { term: "synchronous read", meaning: "A read where the address is captured on a clock edge and the data arrives one clock later." },
    { term: "$readmemh", meaning: "A simulation task that loads hex values from a file into an array, filling from the lowest address upward." },
  ],
  nextStep:
    "The first lesson, Single-Port RAM, turns this into something you build and test. You will declare a 256-byte array, write a synchronous-read RAM with the five pins you have just met, decide its read-during-write behaviour on purpose, and check it against a testbench that walks the addresses. After that, the pset — Boot ROM with Image — loads the Fibonacci image into a 16-entry ROM behind a clocked read port with a sticky valid flag. Come back here when a WIDTHTRUNC, LATCH or MULTIDRIVEN warning shows up and the chapter explains it in one sentence.",
};
