import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 15,
  chapterSlug: "risc-v-blocks",
  title: "RISC-V Blocks",
  readMinutes: 25,
  youWillBeAbleTo: [
    "Say what an instruction set architecture promises, and why the CPU never learns what language your program was written in",
    "Read the six RV32I instruction formats field by field, and explain why a decoder has to exist",
    "Extract and sign-extend the I, S, B, U and J immediates out of a 32-bit instruction word",
    "Build a program counter that advances by 4 and jumps to a branch target under a single select signal",
    "Wire a combinational instruction memory and a two-read, one-write register file into a fetch-decode-execute loop",
    "Turn the instruction's funct3 and funct7 fields into the ALU's control signals",
    "Write the small SystemVerilog subset this chapter needs: logic, always_comb, always_ff and a localparam set",
  ],
  mentalModel: [
    {
      title: "You already built every box. This chapter only closes the loop.",
      body: "A processor is not a new kind of circuit. It is the adder from chapter 5, the muxes from chapter 4, the register file from chapter 12, the memory array from chapter 13, and a handful of comparators — wired into one loop. Every clock, that loop does the same five things: fetch the instruction at the address in the program counter, decode what it is asking for, execute it in the ALU, write the result back to a register, and go round again. Nothing in this chapter is a new block. The new thing is the wire from the end of the loop back to the beginning — the program counter taking the address of whatever comes next and feeding it to the fetch. That one wire is what turns a pile of good parts into a computer.",
    },
    {
      title: "An instruction set architecture is a promise about what bits mean.",
      body: "The CPU does not know whether your program was written in C, in Python, or by hand in assembly. It only ever sees 32 wires at a time. The instruction set architecture — the ISA — is the published agreement that says which pattern of 32 bits means add, which means load, which means branch, and exactly where inside those 32 bits the small number lives. The hardware keeps its side of the promise; the software is written to keep the other side. Once you know the layouts, an instruction stops being a mystery and becomes a form with labelled boxes, and a decoder is just a person reading the form out loud.",
    },
  ],
  topics: [
    {
      slug: "what-an-isa-is",
      title: "What an instruction set actually is",
      lede: "Before any wires: the CPU only ever sees 32 bits, and the ISA is the promise about what those bits mean.",
      blocks: [
        {
          kind: "para",
          text: "Picture what actually happens when a program runs. The CPU pulls 32 wires across, looks at the pattern of zeros and ones, and does something. That is the whole of what it knows. It has no idea whether the bytes it is looking at came out of a C program compiled by a compiler, a script run through a translator, or a human typing assembly by hand. If you rewrite the program in a different language, the CPU cannot tell the difference. The only thing that survives every translation is the bit pattern — and the meaning of that pattern is a contract, not a guess.",
        },
        {
          kind: "analogy",
          text: "An ISA is a published timetable. The railway did not choose where you are going. It publishes a table in which a particular row and a particular column always mean the same service to the same town. A ticket is just numbers printed in a fixed grid, and the train reads the ticket exactly as printed — no more, no less. Change the grid and you have broken the contract with every passenger at once. Your program is the passenger. The instruction word is the ticket. The field positions are the grid.",
        },
        {
          kind: "define",
          items: [
            { term: "instruction set architecture (ISA)", meaning: "The published agreement about which bit patterns mean which operations, and where each part of the pattern lives." },
            { term: "instruction", meaning: "One 32-bit word that asks the CPU to do one thing." },
            { term: "mnemonic", meaning: "The human-readable name for an instruction, like add or beq. It is a convenience for you; the hardware only ever sees the 32 bits." },
            { term: "decode", meaning: "Turning those 32 bits into the control signals the rest of the datapath needs: which operation, which registers, write or not." },
            { term: "datapath", meaning: "The collection of wires and boxes that move data around inside the CPU." },
            { term: "program counter (PC)", meaning: "The register holding the address of the instruction to fetch next. The one thing that makes the loop a loop." },
          ],
        },
        {
          kind: "para",
          text: "Inside that loop are always the same five verbs. Every CPU ever built, from the four-bit calculator in a watch to a datacentre chip, runs the same five-step cycle: fetch, decode, execute, write back, repeat. Learn the five words and you can read the architecture of any machine that has ever existed.",
        },
        {
          kind: "table",
          head: ["Step", "What happens", "The box that does it, and where you built it"],
          rows: [
            ["Fetch", "Read the 32 bits stored at the address the PC is holding", "Program counter and instruction memory — the array from chapter 13"],
            ["Decode", "Work out which operation is being asked for, and with which registers", "Comparators and a case statement — the decoders you built in chapter 7"],
            ["Execute", "Do the arithmetic, or the address calculation", "The ALU — chapter 12's, widened from 8 bits to 32"],
            ["Write back", "Put the result into a register", "The register file — chapter 12's, 2 reads and 1 write"],
            ["Repeat", "Decide where to go next, and go there", "The PC plus a multiplexer — chapter 4's mux"],
          ],
          caption:
            "Read down the right-hand column. Every box on it is something you have already built and tested. This chapter's job is to connect the right-hand column into a loop.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "The only new idea in this chapter is the wire that goes backwards",
          text: "You have already built every box in that table. Chapters 4 to 13 handed you muxes, adders, a register file, a memory. What you have never done is connect the last box back to the first. That single connection — from the write-back stage to the program counter, and from the program counter back to the fetch — is the whole difference between a collection of good parts and a computer. If you have been waiting for permission to feel like a computer designer, this is the chapter.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Two ways to close the loop, and this chapter builds the simple one",
          text: "There are two ways. A single-cycle design executes one whole instruction per clock: fetch, decode, execute and write back all happen in the same cycle, so the clock is slow but the control logic is tiny and every box is visible in every cycle. A pipelined design splits the five steps across five stages so a new instruction starts on every clock, which is much faster and considerably harder to get right. This chapter builds the single-cycle version, because a bug in a single-cycle datapath has exactly one place to hide. Everything you build here transfers to a pipeline unchanged, so the work is not wasted.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You rewrite your program in a different language and the generated machine code changes completely. Can the CPU tell that anything happened?",
              a: "No. The CPU only ever sees 32 wires at a time, and it interprets the pattern, not the provenance. That is exactly why the ISA has to be a promise about bit patterns: the program may be written in any language at all, but the promise is always about the same 32 bits. The ISA is the layer where all those languages stop mattering.",
            },
            {
              q: "Name the five steps of the loop, and say which one is the reason a processor can run a program of any length.",
              a: "Fetch, decode, execute, write back, repeat. Fetch is the one that makes length irrelevant: the CPU is handed one word at a time and has no idea how many are coming. It runs out of words when the memory runs out, not when the program finishes.",
            },
          ],
        },
      ],
    },
    {
      slug: "instruction-formats",
      title: "The six shapes an instruction can be",
      lede: "Every RV32I instruction is 32 bits and fits one of six layouts, and the decoder exists because those layouts disagree about what bit 30 means.",
      blocks: [
        {
          kind: "para",
          text: "RV32I is the base integer instruction set of RISC-V, an open design meant to be simple enough to read in an afternoon. It has one rule that makes the whole problem tractable: every instruction is exactly 32 bits, and every instruction is one of six layouts. Six shapes, named by letter — R, I, S, B, U and J. The letters are only labels. What matters is that if you can draw the six on paper you can read every instruction in the language, and if you can read every instruction you can write the decoder that consumes them.",
        },
        {
          kind: "define",
          items: [
            { term: "opcode", meaning: "The 7 bits at bits 6:0, always in the same place in every format. It names the operation, and because it never moves it is the one field the CPU can always trust." },
            { term: "rd", meaning: "The destination register, at bits 11:7. Five bits, so it can name 32 registers." },
            { term: "rs1", meaning: "The first source register, at bits 19:15. Read by read port 1 of the register file." },
            { term: "rs2", meaning: "The second source register, at bits 24:20. Present in the R, S and B formats." },
            { term: "funct3", meaning: "A 3-bit field at bits 14:12 that says which variant of the opcode you want: with funct3 000 the opcode OP means add, and with funct3 111 it means and." },
            { term: "funct7", meaning: "A 7-bit field at bits 31:25 of an R-type instruction. It is zero for almost every instruction, and only bit 30 of it is ever used." },
            { term: "imm", meaning: "The immediate — a small number carried inside the instruction itself, hiding in whichever bits the format left spare." },
          ],
        },
        {
          kind: "code",
          caption: "The six layouts as a diagram. Every row is one 32-bit instruction, most significant bit on the left.",
          code: `// The six RV32I layouts. Bit 31 is on the left, bit 0 on the right.
module rv32i_layouts (input logic [31:0] inst);
  // R: [31:25 funct7][24:20 rs2][19:15 rs1][14:12 funct3][11:7 rd][6:0 opcode]
  // I: [31:20 imm[11:0]][19:15 rs1][14:12 funct3][11:7 rd][6:0 opcode]
  // S: [31:25 imm[11:5]][24:20 rs2][19:15 rs1][14:12 funct3][11:7 imm[4:0]][6:0 opcode]
  // B: [31 imm[12]][30:25 imm[10:5]][24:20 rs2][19:15 rs1][14:12 funct3]
  //    [11:8 imm[4:1]][7 imm[11]][6:0 opcode]
  // U: [31:12 imm[31:12]][11:7 rd][6:0 opcode]
  // J: [31 imm[20]][30:21 imm[10:1]][20 imm[11]][19:12 imm[19:12]][11:7 rd][6:0 opcode]
endmodule`,
          note: "Put this on paper and mark the three register fields. R, I, S and B all put rs1, rs2, funct3 and rd in the same place, and that is not a coincidence: the ISA was designed so one decoder handles all four of them. The only thing that varies is where the immediate gets crammed in.",
        },
        {
          kind: "table",
          head: ["Format", "Fields, from bit 31 down to bit 0", "What it is used for"],
          rows: [
            ["R", "funct7, rs2, rs1, funct3, rd, opcode", "Register-to-register arithmetic and logic: add, sub, and, or, xor, the shifts, the comparisons"],
            ["I", "imm[11:0], rs1, funct3, rd, opcode", "Arithmetic on a register and a small constant (addi), and every load. The tidiest of the six, because the immediate is one unbroken field."],
            ["S", "imm[11:5], rs2, rs1, funct3, imm[4:0], opcode", "The stores: save a register to memory at a small offset. The immediate is split in two, and its low half is hiding where rd usually is."],
            ["B", "imm[12], imm[10:5], rs2, rs1, funct3, imm[4:1], imm[11], opcode", "The branches: beq, bne, blt, bge, bltu, bgeu. The most scrambled of the six, because the ISA insists on a fixed field order."],
            ["U", "imm[31:12], rd, opcode", "lui and auipc — put a 20-bit constant into the top of a register. The only format with no funct3 and no source registers."],
            ["J", "imm[20], imm[10:1], imm[11], imm[19:12], rd, opcode", "jal, the unconditional jump. Note that jalr is I-type and not J-type, because it needs a register as well as an offset."],
          ],
          caption:
            "Five bits name a register because 5 bits can hold 32 values, which is exactly how many registers there are. The reason the ISA is so fussy about bit positions is that it lets the decoder be a handful of wire slices instead of a lookup across all four billion possible words.",
        },
        {
          kind: "table",
          head: ["Opcode value", "Binary", "Format", "Instructions"],
          rows: [
            ["LOAD", "0000011", "I", "lb, lh, lw, lbu, lhu"],
            ["OP-IMM", "0010011", "I", "addi, slti, sltiu, xori, ori, andi, slli, srli, srai"],
            ["AUIPC", "0010111", "U", "auipc"],
            ["STORE", "0100011", "S", "sb, sh, sw"],
            ["OP", "0110011", "R", "add, sub, sll, slt, sltu, xor, srl, sra, or, and"],
            ["LUI", "0110111", "U", "lui"],
            ["BRANCH", "1100011", "B", "beq, bne, blt, bge, bltu, bgeu"],
            ["JALR", "1100111", "I", "jalr"],
            ["JAL", "1101111", "J", "jal"],
            ["SYSTEM", "1110011", "I", "ecall, ebreak"],
          ],
          caption:
            "These ten are the base integer opcodes. You do not need to memorise them — you need to be able to look one up, and to see from the format column that LOAD and OP-IMM are both I-type and therefore share a decoder.",
        },
        {
          kind: "para",
          text: "Here is the reason a decoder has to exist, in one sentence: bit 30 means part of funct7 in an R-type instruction, immediate bit 5 in a B-type, and immediate bit 9 in a J-type. The same wire, three different meanings. The CPU cannot resolve that until it has looked at the opcode, so the very first thing decode does is look at the opcode — and only then does it know what the other 25 bits are even called. Everything else in this chapter follows from that one ordering.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Take the 32-bit word 32'h0031_00B3 and write it out in binary, in four groups of eight: 0000 0000 0011 0001 0000 0000 1011 0011.",
            "Read bits 6:0 off the right-hand end. They come out as 0110011, which the opcode table says is OP, so the format is R.",
            "Split the remaining 25 bits using the R layout: funct7 at 31:25, rs2 at 24:20, rs1 at 19:15, funct3 at 14:12, rd at 11:7. Write the five values out.",
            "Convert each 5-bit register number to its name, where 0 is x0 and 31 is x31.",
            "You should have arrived at add x5, x2, x3. Write that in assembly and check every field against your table.",
            "Now do the same for 32'h0050_0093. The opcode comes out as 0010011, which is OP-IMM, so this one is I-type and the top 12 bits are the immediate. Work out the format, the immediate, and the assembly.",
            "Last one: 32'h0000_0463. The opcode is 1100011, so this is a B-type branch. Rather than assembling the whole immediate, just note which of the 32 bits carry the offset and which carry zero. That is the shape you will be pasting together in the next section.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Which single bit of a 32-bit RISC-V instruction means three completely different things depending on the opcode?",
              a: "Bit 30, along with a good number of its neighbours. In an R-type instruction bits 31:25 are funct7, so bit 30 is the subtract bit. In a B-type instruction bit 30 is immediate bit 5, one of the offset bits. In a J-type instruction bit 30 is immediate bit 9. The same wire, three jobs, which is exactly why the decoder must read the opcode first and only then interpret anything else.",
            },
            {
              q: "Why is the opcode always in bits 6:0, in every single format?",
              a: "So that its position is a constant of the ISA. The decoder can slice the bottom 7 bits without knowing anything else, which is the minimum it needs in order to start. If the opcode moved around per format there would be no single field the CPU could read first, and every format would need its own guess before decoding could even begin.",
            },
          ],
        },
      ],
    },
    {
      slug: "immediates",
      title: "Immediates: a number hiding in scattered bits",
      lede: "Each instruction type hides its small number in a different set of bits, so the hardware has to shift and paste it back together. This is the real work of the chapter.",
      blocks: [
        {
          kind: "para",
          text: "Some instructions need a number that is not sitting in a register. Add five to x3. Jump forward eight words. Store at address x5 minus twenty. That number is written inside the instruction itself, and it is called an immediate because the CPU does not have to go anywhere to get it — it is already in the word in front of it. addi is register plus immediate. Every load is register plus immediate. Every store and every branch is register plus immediate. Here is the whole difficulty: each format hides that number in a different set of bits, sometimes in one unbroken block and sometimes in four pieces with gaps between them, and the hardware has to shift, reorder and paste them into one 32-bit value before anything can add it to anything.",
        },
        {
          kind: "para",
          text: "The second difficulty is width, and it is the one that produces silent wrong answers. An I-type immediate is 12 bits, so it can only hold −2048 to 2047. The ALU works on 32 bits. If you paste 12 bits of value into a 32-bit slot and leave the other 20 bits at zero, then the number −5 arrives at the ALU as 0x0000000B, which is positive eleven, and the addition is wrong with no warning anywhere. The fix is sign extension: copy the top bit of the 12-bit field across all 20 remaining bits, so −5 becomes 0xFFFFFFFB, which is −5 again in 32-bit two's complement. You built this exact trick in chapter 6. The only new thing here is that the thing being extended is a slice of an instruction word rather than a port you chose.",
        },
        {
          kind: "table",
          head: ["Format", "How wide", "Which bits hold it", "The Verilog that assembles it"],
          rows: [
            ["I", "12 bits, −2048 to 2047", "inst[31:20], one unbroken block", "{ {20{inst[31]}}, inst[31:20] }"],
            ["S", "12 bits, −2048 to 2047", "inst[31:25] and inst[11:7], in two pieces", "{ {20{inst[31]}}, inst[31:25], inst[11:7] }"],
            ["B", "13 bits, −4096 to 4094, always even", "inst[31], inst[30:25], inst[11:8], inst[7] — four pieces", "{ {20{inst[31]}}, inst[7], inst[30:25], inst[11:8], 1'b0 }"],
            ["U", "20 bits, 0 to 1,048,575", "inst[31:12], the top 20 bits of the word", "{ inst[31:12], 12'b0 }"],
            ["J", "21 bits, ±1,048,574, always even", "inst[31], inst[30:21], inst[20], inst[19:12] — four pieces", "{ {11{inst[31]}}, inst[31], inst[19:12], inst[20], inst[30:21], 1'b0 }"],
          ],
          caption:
            "Read every concatenation left to right as the finished 32-bit value, most significant bit first. The {W{...}} at the front is the sign-extension filler: W copies of the sign bit, which is always inst[31]. Count the pieces and check they add to 32 before you type the line.",
        },
        {
          kind: "code",
          caption: "All four extractors, with the port list your lesson's workspace file already has.",
          code: `module top (
  input  logic        clk, rst,
  input  logic        branch_taken,
  input  logic [31:0] pc_imm,
  input  logic [31:0] inst,
  output logic [31:0] pc,
  output logic [31:0] imm_i,
  output logic [31:0] imm_s,
  output logic [31:0] imm_b,
  output logic [31:0] imm_u
);
  logic [31:0] pc_next;

  // I-type: inst[31:20], sign-extended.
  assign imm_i = {{20{inst[31]}}, inst[31:20]};

  // S-type: two pieces, high half first.
  assign imm_s = {{20{inst[31]}}, inst[31:25], inst[11:7]};

  // B-type: four pieces, and the low bit is always zero.
  assign imm_b = {{20{inst[31]}}, inst[7], inst[30:25], inst[11:8], 1'b0};

  // U-type: the top 20 bits with 12 zeros underneath. No sign extension.
  assign imm_u = {inst[31:12], 12'b0};
endmodule`,
          note: "The B line deserves a second look, because the 20 filler bits are not the ones you get by accident. The 12-bit data field of a B immediate starts at bit 11 with inst[7], and the sign lives above it in bits 31:12 as 20 copies of inst[31]. The equivalent 19-copy form, {{19{inst[31]}}, inst[31], inst[7], inst[30:25], inst[11:8], 1'b0}, is one bit shorter and produces exactly the same 32 bits.",
        },
        {
          kind: "steps",
          title: "Assemble a B-type immediate by hand",
          items: [
            {
              head: "Write the instruction out in binary",
              body: "Take 32'hFE10_00E3, a branch whose offset is negative. It is 1111 1110 0001 0000 0000 0000 1110 0011 in binary.",
            },
            {
              head: "Pull out the four fields the B format uses",
              body: "inst[31] = 1. inst[30:25] = 111111. inst[11:8] = 0000. inst[7] = 1. Everything else in the word belongs to the opcode, to funct3, and to the two register numbers, and none of it belongs to the offset.",
            },
            {
              head: "Line the fields up in the order the immediate wants them",
              body: "A B-type immediate is imm[12], imm[11], imm[10:5], imm[4:1], with imm[0] always zero. So the pieces arrive in the order inst[31], then inst[7], then inst[30:25], then inst[11:8], then a hard zero. Notice that inst[7] comes second and not last, and that the trailing zero is supplied by the hardware rather than stored in the instruction.",
            },
            {
              head: "Check the sign before you compute anything",
              body: "inst[31] = 1, so the sign bit is set and this offset is negative. Whatever number you are about to calculate is going to come out below zero, which is a sanity check you get for free from the instruction itself.",
            },
            {
              head: "Compute the magnitude as a 12-bit field",
              body: "The 12 bits sitting above the forced zero are 1, then 1, then 111111, then 0000, which is 1111 1110 0000 in binary. That is 4064 unsigned. With the sign bit set, the value is 4064 − 4096 = −32.",
            },
            {
              head: "Write it as the 32-bit value the ALU will see",
              body: "Sign-extend the 12-bit field: 0xFFFF_FFE0. That is the number imm_b has to hold for this instruction, and it is the number the branch target arithmetic will use.",
            },
            {
              head: "Now check the line you are about to type",
              body: "The B assignment takes 20 + 1 + 6 + 4 + 1 = 32 bits. A 32-bit output filled from exactly 32 bits of concatenation is the only version with nothing to pad and nothing to throw away. Counting the pieces is the habit that prevents the off-by-one-column bug.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "I-type. Take 32'hFE00_0293. Extract inst[31:20] on its own, write those 12 bits out, convert them to a signed number, then sign-extend by hand into 32 bits. You should land on 0xFFFF_FFE0, which is −32.",
            "S-type. Take 32'hFE22_A623. The immediate is in two pieces this time. Write inst[31:25] and inst[11:7] on separate lines, confirm the high piece's top bit is the sign, then paste them together. You should land on 0xFFFF_FFEC, which is −20.",
            "U-type. Take 32'h1234_5037. Copy the top 20 bits down and put 12 zeros underneath, with no sign extension at all. You should land on 0x1234_5000.",
            "Now find the trap. Rewrite the I-type line with 20'b0 in place of the replication and re-run your −32 example. What does it produce, and why is nothing in the tools going to complain?",
            "Then try to break the B line by reversing one of the ranges. Write down the two different things that go wrong: one of them is loud, and the other is far worse.",
            "Finally, look at the J-type row in the table above and count its pieces out loud. Do the same for B. Getting into the habit of counting is what stops a bit position being off by one column.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "The U type is the odd one out, and the reason is worth sitting with",
          text: "Three of the five sign-extend. The U type does not, and the reason is that a U-type immediate is not an offset at all. It is a 20-bit constant being loaded into the top of a register (lui) or added to the PC (auipc), and the base instruction set has no negative case for it. So there is no filler and no replication: {inst[31:12], 12'b0} is the entire line. If you sign-extend a U immediate you corrupt every lui in your program, and the corruption shows up as an address that is far too large.",
        },
        {
          kind: "trap",
          wrong: "Filling the immediate's high 20 bits with 20'b0 instead of replicating the sign bit.",
          right: "Use {{20{inst[31]}}, inst[31:20]} for the I type.",
          why: "The width is right and the bits are in the right place, so nothing warns you. But every negative immediate arrives at the ALU as a large positive number: an addi of −32 computes with 4064 instead, and the result is a plausible-looking value that is simply wrong. This is the chapter's signature bug and it stays invisible until you check a negative number by hand.",
        },
        {
          kind: "trap",
          wrong: "Dropping the trailing 1'b0 from the B and J lines, because branch offsets are even anyway.",
          right: "Keep the 1'b0. It is what makes the pieces add up to 32.",
          why: "Without it the concatenation is only 31 bits wide, and assigning a 31-bit expression to a 32-bit output pads the top with a zero, which wipes out the entire sign extension. You do not get a small error, you get a sign error, and the width checker may not flag it at all because the expression really is narrower than the destination.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why does the B-type immediate put inst[7] immediately after inst[31], in the middle of the field list?",
              a: "Because of the ISA's fixed field order. Bits 31:25 hold imm[12] and imm[10:5], bits 24:20 hold rs2, bits 19:15 hold rs1, and bits 14:12 hold funct3. Those positions are already spoken for, so the two remaining immediate bits have nowhere to go except bits 11:8 and bit 7. The immediate is scrambled because the register and opcode fields were given priority, and the hardware's job is to undo that.",
            },
            {
              q: "An S-type immediate is 12 bits. How many bits of filler does the sign extension need, and what fills them?",
              a: "20 bits, filled with 20 copies of inst[31]. Twelve bits of data plus 20 of filler is 32. The filler is always inst[31] rather than any other bit, because in both the I and S formats the most significant immediate bit is stored in inst[31] — the S format's top immediate bit happens to be the whole word's top bit.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-program-counter",
      title: "The program counter and the branch mux",
      lede: "One register that remembers where we are, an adder that adds 4, and a mux that decides which of the two becomes the next PC.",
      blocks: [
        {
          kind: "para",
          text: "The program counter is a 32-bit register holding the address of the instruction to fetch next. It is the only piece of state the fetch stage needs, and it is the thing that turns a set of boxes into a loop: whatever the PC holds at the start of a cycle is the address the instruction memory is read at, and whatever the PC is loaded with at the end of that cycle is where the next instruction comes from. The CPU's registers are named x0 through x31, and x0 is special — it is permanently zero and stays zero forever, so it is a free source of constant zero and it is how RISC-V spells do nothing.",
        },
        {
          kind: "analogy",
          text: "The PC is a bookmark in a cookbook. Ordinarily you turn one page — four bytes, because every instruction is four bytes long. Occasionally the recipe says go back to step two, and the bookmark jumps somewhere else entirely. A processor has exactly those two options and no third: turn the page, or jump. That is why the entire next-PC calculation is one adder and one mux.",
        },
        {
          kind: "code",
          caption: "The complete program counter for the lesson: the adder is written out, the mux is one ternary, and the register is one always_ff.",
          code: `module pc_path (
  input  logic        clk, rst,
  input  logic        branch_taken,
  input  logic [31:0] pc_imm,
  output logic [31:0] pc
);
  logic [31:0] pc_next;

  // The next PC is either a branch target or this instruction plus 4.
  assign pc_next = branch_taken ? pc_imm : (pc + 32'd4);

  // The register itself: load the reset vector, or load the next PC.
  always_ff @(posedge clk or posedge rst) begin
    if (rst) pc <= 32'h0000_1000;
    else pc <= pc_next;
  end
endmodule`,
          note: "Two rules are hiding in here and together they are the whole design. First, pc_next is combinational — it is a wire, not a register. Second, the update happens inside an always_ff with a nonblocking assignment, so the new value only lands on a clock edge. The register, the adder and the mux are three boxes from chapters 8, 5 and 4, and this is all the glue they need.",
        },
        {
          kind: "steps",
          title: "Read the program counter line by line",
          items: [
            {
              head: "The declaration of pc_next",
              body: "A new signal inside the module, 32 bits wide because it has to hold an address. It is declared logic rather than wire because SystemVerilog uses one data type for both. It is not a register — nothing in an always_ff drives it — so it behaves exactly like a wire, and it re-evaluates whenever pc or branch_taken changes.",
            },
            {
              head: "The ternary that chooses between the two candidate addresses",
              body: "This is the multiplexer from chapter 4 written as a ternary. When branch_taken is 1 the next PC is the branch target; when it is 0 the next PC is this instruction's address plus 4. The 4 is not arbitrary: a RISC-V instruction is 32 bits, which is 4 bytes, and this PC counts in bytes.",
            },
            {
              head: "The always_ff header",
              body: "A sequential block. posedge clk means it runs on the rising edge of the clock, the moment values are allowed to change. The or posedge rst adds an asynchronous reset: the block also runs the instant reset goes high, without waiting for a clock. That is the standard shape for a resettable register, and you have written it many times since chapter 8.",
            },
            {
              head: "The reset branch of the if",
              body: "On reset the PC is forced to the reset vector. 0x0000_1000 is a decision made by this course rather than a rule of RISC-V — a real chip has to agree with whatever boot memory its board was built with. It is a round number with the low 12 bits clear, which leaves the top 20 bits free for a U-type constant.",
            },
            {
              head: "The else branch",
              body: "On every other clock edge, the register takes whatever the combinational logic worked out. The nonblocking assignment is the correct operator here: it means commit this when the edge arrives, which is what a register physically does. A blocking assignment inside a clocked block is a different thing entirely, and Verilator reports it as BLKSEQ.",
            },
          ],
        },
        {
          kind: "table",
          head: ["Clock edge", "rst", "branch_taken", "pc_imm", "pc after the edge"],
          rows: [
            ["1", "1", "0", "0", "32'h0000_1000 — the reset vector"],
            ["2", "0", "0", "0", "32'h0000_1004 — the next word"],
            ["3", "0", "0", "0", "32'h0000_1008 — the next word again"],
            ["4", "0", "1", "32'h0000_2000", "32'h0000_2000 — the branch target, not pc + 4"],
            ["5", "0", "0", "0", "32'h0000_2004 — ordinary increment resumes"],
          ],
          caption:
            "This is the sequence the lesson's checks look for, one row per clock edge. Read the last two rows together: a taken branch is not permanent. The very next instruction goes back to advancing by 4.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (8 minutes)",
          items: [
            "Starting from a reset, write down the PC on the next five clock edges, assuming branch_taken stays 0 the whole time.",
            "Now assert branch_taken for exactly one edge with pc_imm = 32'h0000_2000. What is the PC after that edge, and what is it after the edge after that?",
            "Swap the two arms of the ternary so it reads branch_taken ? (pc + 32'd4) : pc_imm, and re-run your paper trace from the reset. Where does the PC go, and does the machine ever move again?",
            "Now try the arithmetic. At PC = 32'h0000_0FFC, what is the address after one increment? Remember that the PC is a byte address, so stepping by four from the last word of a 16-byte region lands back on the first address of the next one.",
            "Last one: is a branch to a target 2 bytes away from the current instruction legal in RV32I? The B immediate's low bit is always zero, so an odd byte address can never be produced. The RISC-V base ISA only asks for 2-byte alignment, and that is precisely why the format throws that one bit away.",
          ],
        },
        {
          kind: "trap",
          wrong: "Swapping the two arms of the ternary, so the branch mux reads the other way round.",
          right: "When branch_taken is 1 the next PC is pc_imm; when it is 0 it is pc + 4.",
          why: "This is the nastiest bug in the chapter, and the starter file in your workspace has it flagged for exactly this reason. The design still lints clean: both arms are 32 bits, the mux is well formed, and nothing is left undriven. The only symptom is a machine that never goes forward, because with branch_taken at 0 it jumps to pc_imm on every single cycle. No tool will tell you, and the testbench's instruction stream is your only safety net.",
        },
        {
          kind: "trap",
          wrong: "Using a blocking assignment inside the always_ff, or writing the update outside one.",
          right: "Nonblocking assignment inside always_ff, so the register only changes on a clock edge.",
          why: "A register is defined by the fact that it holds its value between clock edges. If you drive it with a blocking assignment from combinational logic, it stops being a register and becomes combinational, and the PC will ripple through every add in the design. Verilator catches the blocking-inside-a-clocked-block case and calls it BLKSEQ; the case where the logic simply is not in an always_ff at all, it cannot catch.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why does the program counter advance by 4 rather than by 1?",
              a: "Because the PC is a byte address and an instruction is 4 bytes. One instruction occupies bits 31:0 of a 32-bit word, which is 4 bytes, so the next instruction starts 4 bytes later. Advancing by 1 would put the PC one byte into the middle of the current instruction, and a memory read at that address would hand back the same word again.",
            },
            {
              q: "Is 0x0000_1000 part of the RISC-V specification?",
              a: "No, it is a choice made by this course's hardware. The specification leaves the reset vector to the implementation, because it has to match whatever boot memory the board was built with. It is worth picking a round address with the low bits clear, since a U-type constant occupies the top 20 bits of a word and you want the boot code to start at a word boundary.",
            },
          ],
        },
      ],
    },
    {
      slug: "instruction-memory",
      title: "Instruction memory: the program as a read-only array",
      lede: "Fetch is an array read at the address in the PC, and because a 32-bit instruction is 4 bytes, the address moves in steps of 4.",
      blocks: [
        {
          kind: "para",
          text: "The program lives in memory as a list of 32-bit words. Fetch is simply: read the word stored at the address the PC is holding. That is a memory block of exactly the kind you built in chapter 13 — an array of 32-bit values with an address input. The one difference is that this address is a byte address rather than a word index, so if the array holds 32-bit words you have to divide by 4. In hardware dividing by 4 is free, because it is just dropping the bottom two bits.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the read here is combinational, when chapter 13's RAM was not",
          text: "Chapter 13's RAM registered its output, which is what you want for block RAM and costs a cycle. This design is single-cycle, so the instruction has to be readable in the same cycle the address arrives or nothing would ever finish. The read is therefore a lookup rather than a clocked read: one continuous assignment, and the instruction is settled well before the end of the cycle. The same reasoning applies to the register file's read ports. This is a real design decision with a real cost — an asynchronous read cannot be built from block RAM — and single-cycle cores simply accept that cost.",
        },
        {
          kind: "code",
          caption: "An instruction memory holding three words, read combinationally at whatever address the PC supplies.",
          code: `module instr_rom (
  input  logic [31:0] addr,
  output logic [31:0] instr
);
  logic [31:0] rom [0:7];

  initial begin
    rom[0] = 32'h0050_0093;   // addi x1, x0, 5
    rom[1] = 32'h0070_0113;   // addi x2, x0, 7
    rom[2] = 32'h0020_81B3;   // add  x3, x1, x2
  end

  // addr >> 2 is the word index: dropping the bottom two bits.
  assign instr = rom[addr[4:2]];
endmodule`,
          note: "Any word you do not load stays unknown in simulation, because nothing has ever written to it. A real program image is filled with a readmem call from a hex file, exactly as in chapter 13's boot ROM — an initial block is just the small version of that.",
        },
        {
          kind: "table",
          head: ["Byte address", "Word index (addr >> 2)", "Which word"],
          rows: [
            ["32'h0000_0000", "0", "rom[0] — addi x1, x0, 5"],
            ["32'h0000_0004", "1", "rom[1] — addi x2, x0, 7"],
            ["32'h0000_0008", "2", "rom[2] — add x3, x1, x2"],
            ["32'h0000_000C", "3", "rom[3] — beq x0, x0, +8"],
            ["32'h0000_0010", "4", "rom[4] — addi x3, x0, 0, which the branch skips"],
            ["32'h0000_0014", "5", "rom[5] — addi x3, x3, 1"],
            ["32'h0000_0018", "6", "rom[6] — the halt word"],
            ["32'h0000_001C", "7", "rom[7] — padding"],
          ],
          caption:
            "The memory is addressed in words and the PC counts in bytes, so the mapping is a shift right by two. The lesson's core-datapath starter runs exactly this eight-word program: x1 = 5, x2 = 7, x3 = 12, the branch skips rom[4] — an ADDI that would zero x3, not a NOP — and then x3 becomes 13. (The pset runs a different program: 10, 4, SUB, skip, +2.)",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write out the eight words of that program as a table with four columns: word index, byte address, the hex value, and the assembly.",
            "Now walk the PC through the program one clock at a time. Start at 0x0000_0000 — write it as 32'h0000_0000 — and, assuming no branch, list the address for the first six edges.",
            "At the branch, compute the target by hand: the PC is 0x0000_000C and the offset is +8. Which word does it land on, and what is that word's byte address?",
            "Now work out the same program if the PC had started one byte later, at 32'h0000_0001. Which words would the memory hand back, and why is that a good reason for the PC to be masked rather than trusted?",
            "Finally, write the eight words of this program as a hex file, one 8-digit value per line, so that you could load it with a readmem call the way chapter 13 did.",
          ],
        },
        {
          kind: "trap",
          wrong: "Indexing the array with the full byte address, or advancing the PC by 1 per word instead of 4.",
          right: "Turn the byte address into a word index with a right shift, and advance the PC by 4.",
          why: "Both bugs are the same bug seen from two sides. rom[0x0000_0004] reads the fifth word when you meant the second, and a PC that steps by 1 lands one byte into the middle of the first instruction, so the read keeps returning the same word forever. Neither produces a syntax error or a width warning. Mask the address to the word index, and let the PC count in bytes so the two never get confused.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "A narrow mask only works because the memory is small",
          text: "addr[4:2] works here because the memory is eight words, so only three bits of the address carry information. Make the memory 1024 words and the mask becomes addr[11:2], and a mask that is one bit short makes two different addresses read the same word. That kind of aliasing is invisible in simulation for most programs and shows up on exactly one of them, which is the worst way for a bug to appear. Size the mask from the depth of the array, every time.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Your PC is 32'h0000_000C. Which word of the memory does the fetch read, and why?",
              a: "Word 3. The mask addr[4:2] keeps only the low three bits, and 0xC >> 2 is 3. The bottom two bits of any address the PC can legally hold are zero, because a 32-bit instruction is 4 bytes and the PC advances in steps of 4, so those two bits carry no information and are simply dropped.",
            },
            {
              q: "What is the one instruction in that program that does not correspond to a RISC-V instruction at all?",
              a: "The word at index 6, 32'hFFFF_FFFF, which is the halt marker. It is not a real encoding — no RISC-V instruction looks like that — so the decoder cannot recognise it by its opcode. The design tests the whole word against the constant instead. That is why the core datapath's outputs are pc, a debug register value, and a done flag rather than a full set of architectural registers: it is a machine built to prove the loop runs, not to run real software.",
            },
          ],
        },
      ],
    },
    {
      slug: "register-file",
      title: "The register file: two reads and one write",
      lede: "Two source registers, one destination, one write port, and a hardwired x0 that stays zero no matter what you write to it.",
      blocks: [
        {
          kind: "para",
          text: "The register file is the CPU's working memory: 32 registers, each 32 bits wide. An instruction that does arithmetic almost always needs two source values and produces one destination, so the file has two read ports and one write port, and the ports are combinational for the same reason the instruction memory is. The write, on the other hand, must happen on a clock edge — registers are state, and state changes on clock edges. Read comb, write on the clock: that is the whole pattern.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "x0 is the one register that does not behave like a register",
          text: "In RISC-V x0 is hardwired to zero and stays zero forever. Writing to it succeeds and changes nothing. That is not a trick for its own sake: it is how the ISA expresses do nothing. Writing rd = x0 discards a result, so an instruction that computes something it does not need can still be executed and its result sent into the void. It also gives the hardware a free source of constant zero, which is handy when computing addresses, because adding zero needs no adder logic. Any decoder that writes rd must therefore also check whether rd is zero, and the check is a 5-bit comparison — or, more cheaply, the write enable is ANDed with the inverse of that comparison.",
        },
        {
          kind: "code",
          caption: "A 32-register file with two combinational reads and one clocked write, with x0 held at zero.",
          code: `module reg_file (
  input  logic        clk, rst,
  input  logic        we,        // write enable
  input  logic [4:0]  waddr,
  input  logic [31:0] wdata,
  input  logic [4:0]  raddr1, raddr2,
  output logic [31:0] rdata1, rdata2
);
  logic [31:0] regs [0:31];

  // Read ports: a lookup, so the value is available the same cycle.
  assign rdata1 = (raddr1 == 5'd0) ? 32'd0 : regs[raddr1];
  assign rdata2 = (raddr2 == 5'd0) ? 32'd0 : regs[raddr2];

  // Write port: on the clock edge, and never into x0.
  always_ff @(posedge clk or posedge rst) begin
    if (rst) begin
      integer i;
      for (i = 0; i < 32; i = i + 1) regs[i] <= 32'd0;
    end else if (we && (waddr != 5'd0)) begin
      regs[waddr] <= wdata;
    end
  end
endmodule`,
          note: "The (raddr == 0) tests on the read side are optional, because regs[0] is never written, so it can never become non-zero. They are cheap insurance and they make the x0 rule visible in the code rather than a fact you have to remember. The write side test is not optional: without it a write to x0 would corrupt a register the ISA promises is permanently zero.",
        },
        {
          kind: "table",
          head: ["Field", "Width", "Which port", "What it does"],
          rows: [
            ["rs1", "5 bits", "read port 1", "Names the first source register, and the instruction is written to mean its value is read from here."],
            ["rs2", "5 bits", "read port 2", "Names the second source register. Both reads happen in the same cycle, so an add never takes two cycles."],
            ["rd", "5 bits", "write port", "Names the destination register. Loaded on the clock edge, and only when the write-enable signal is asserted."],
            ["we", "1 bit", "write port", "The write enable. It comes straight from decode: loads and register-register arithmetic set it, stores and branches clear it."],
          ],
          caption:
            "Three fields, three roles. The decoder's register-number job is only to slice these three ranges out of the instruction and pass them along; interpreting what they mean is the ALU's business.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Name the three register numbers in 32'h0020_81B3, the encoding of add x3, x1, x2, and say which read port each source uses and which port the destination uses.",
            "Assume all registers are zero and we execute 32'h0050_0093 (addi x1, x0, 5). Which read ports are used, what do they return, what does the ALU produce, and which register changes on the clock edge?",
            "Now consider an instruction whose rd field is 0 — say addi x0, x1, x2, which is deliberately nonsensical. Work out what the write enable should do, and why the answer cannot simply be 'write it'.",
            "Why must the write port be clocked while the read ports are not? Describe what would go wrong if the write were combinational too.",
            "Finally: two instructions in a row, add x3, x1, x2 followed by add x4, x3, x0. Trace which values the two read ports see in each cycle, and say whether the second instruction can see the first instruction's result. It can — that is what the write on the clock edge buys you.",
          ],
        },
        {
          kind: "trap",
          wrong: "Forgetting the waddr != 5'd0 term in the write-enable condition.",
          right: "Assert we only when the destination is not x0.",
          why: "An instruction like addi x0, x0, 0 — the canonical no-op — would then write whatever the ALU happened to produce into register x0, and from that moment on x0 is no longer zero. Every subsequent instruction that uses x0 as a source, and every R-type instruction at all, silently reads garbage. Nothing warns you, and the corruption appears far away from its cause, usually as an inexplicable address or a constant that is not constant.",
        },
        {
          kind: "check",
          items: [
            {
              q: "The register file has two read ports and one write port. Why not two write ports?",
              a: "Because no RISC-V instruction writes two registers at once. A single instruction produces a single result into a single rd. Widening the write port would cost area and a cycle's worth of control complexity for a capability the ISA has no use for. The read ports, by contrast, are two because an add genuinely needs both of its operands in the same cycle.",
            },
            {
              q: "The read ports are combinational and the write port is clocked. What is the practical consequence of that asymmetry?",
              a: "A register's new value is visible to the read ports one cycle after the write edge, which is exactly what lets a second instruction read the first one's result. The cost is that the reads cannot be built from block RAM, which needs a registered output, so a real design with thousands of registers would use flip-flops or a differently structured array. A single-cycle core accepts that cost in exchange for the simplicity of the whole instruction finishing in one clock.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-alu-and-its-control",
      title: "The ALU and the three bits that steer it",
      lede: "The ALU was an exercise in chapter 12. Here it stops being an exercise, because the instruction's funct3 and funct7 fields decide what it does.",
      blocks: [
        {
          kind: "para",
          text: "Chapter 12's ALU took control signals as inputs and you drove them by hand. In the real datapath the instruction drives them, and it does so with eleven bits. The 7-bit funct7 field decides between the two behaviours that share an opcode — add against subtract, shift-right-logical against shift-right-arithmetic, and those are the only two pairs. The 3-bit funct3 field then picks which of ten operations the opcode means. funct7 is zero for eight of the ten, which is why only its bottom bit is ever wired up. That single bit is bit 30, the one bit that means three different things depending on which instruction you are looking at.",
        },
        {
          kind: "table",
          head: ["funct7 : funct3", "Operation", "Reads", "Writes a register?"],
          rows: [
            ["0000000 : 000", "add", "rd = rs1 + rs2", "yes"],
            ["0100000 : 000", "sub", "rd = rs1 − rs2", "yes"],
            ["0000000 : 001", "sll", "rd = rs1 << rs2[4:0]", "yes"],
            ["0000000 : 010", "slt", "rd = 1 if rs1 < rs2 else 0", "yes"],
            ["0000000 : 011", "sltu", "rd = 1 if rs1 < rs2 unsigned else 0", "yes"],
            ["0000000 : 100", "xor", "rd = rs1 ^ rs2", "yes"],
            ["0000000 : 101", "srl", "rd = rs1 >> rs2[4:0], filling with zeros", "yes"],
            ["0100000 : 101", "sra", "rd = rs1 >> rs2[4:0], copying the sign bit", "yes"],
            ["0000000 : 110", "or", "rd = rs1 | rs2", "yes"],
            ["0000000 : 111", "and", "rd = rs1 & rs2", "yes"],
          ],
          caption:
            "All ten R-type operations, and the only field that distinguishes them is the pair of fields. The two shaded rows are the only ones where funct7 is non-zero, which is why one bit of it is enough. The same funct3 values appear in OP-IMM, but there the second operand is an immediate and funct7 is only ever 0000000 except for the two shifts.",
        },
        {
          kind: "code",
          caption: "Decode turning the instruction's control fields into ALU control, with the 32-bit widening that this datapath needs.",
          code: `localparam logic [3:0] ALU_ADD   = 4'd0;
localparam logic [3:0] ALU_SUB   = 4'd1;
localparam logic [3:0] ALU_SLL   = 4'd2;
localparam logic [3:0] ALU_SLT   = 4'd3;
localparam logic [3:0] ALU_SLTU  = 4'd4;
localparam logic [3]0] ALU_XOR   = 4'd5;   // (fix: 4'd5)
localparam logic [3:0] ALU_SRL   = 4'd6;
localparam logic [3:0] ALU_SRA   = 4'd7;
localparam logic [3:0] ALU_OR    = 4'd8;
localparam logic [3:0] ALU_AND   = 4'd9;

// Control wires out of the instruction.
logic        op_imm;      // second operand is an immediate
logic        alu_sub;     // funct7 bit 30
logic        alu_sra;     // funct7 bit 30, in the shift group
logic [2:0]  funct3;

// Operand B is either rs2 or the sign-extended immediate.
logic [31:0] operand_b;
assign operand_b = op_imm ? imm_i : rdata2;

always_comb begin
  alu_op = ALU_ADD;
  case (funct3)
    3'b000: alu_op = alu_sub ? ALU_SUB : ALU_ADD;
    3'b001: alu_op = ALU_SLL;
    3'b010: alu_op = ALU_SLT;
    3'b011: alu_op = ALU_SLTU;
    3'b100: alu_op = ALU_XOR;
    3'b101: alu_op = alu_sra ? ALU_SRA : ALU_SRL;
    3'b110: alu_op = ALU_OR;
    3'b111: alu_op = ALU_AND;
  endcase
endmodule`,
          note: "Copy this carefully: the localparam for XOR has a typo in the first line of the listing, and the fix line shows the correction. Set the ALU's operation to a default first and only then override it, so the case has no implied latch. That habit — a complete default before any conditional assignment — is the single most common way to avoid a latch in an always_comb, and Verilator will tell you about it if you get it wrong.",
        },
        {
          kind: "steps",
          title: "Read the control path from the instruction down",
          items: [
            {
              head: "The opcode decides op_imm",
              body: "With opcode 0010011, which is OP-IMM, the second operand is the sign-extended immediate rather than rs2. With opcode 0110011, which is OP, it is rdata2. One bit of control, and it selects between the immediate extractor you built and the second read port of the register file.",
            },
            {
              head: "funct7 becomes one bit",
              body: "Only bit 30 of funct7 is ever used, and only in two situations: with funct3 000 it means subtract, and with funct3 101 it means arithmetic rather than logical shift right. So you can slice inst[30] into one wire and route it to whichever consumer needs it. Slicing one bit instead of carrying seven is a real simplification, and it is safe because the ISA guarantees the other six bits are zero for every instruction you will decode.",
            },
            {
              head: "funct3 goes to the case",
              body: "Three bits, eight possible values, all eight used. A case statement over funct3 is therefore exhaustive, and a combinational block over it needs no default — but set a default anyway, because a default is what guarantees the block assigns a value on every path.",
            },
            {
              head: "The mux that picks operand B",
              body: "operand_b is either the register file's second read port or the sign-extended immediate. This is chapter 4's mux, one bit wide, in the place where a beginner's first datapath always has the most trouble.",
            },
          ],
        },
        {
          kind: "trap",
          wrong: "Writing the case inside an always_comb without a default assignment before it.",
          right: "Set the result to a valid value first, then override it conditionally.",
          why: "If none of the conditions holds, the result keeps whatever value it had from the previous evaluation. That is a latch — a piece of state in a block that is supposed to be purely combinational — and it means the ALU's operation depends on history rather than only on the current instruction. Chapter 8 showed what that looks like on a waveform, and Verilator reports it as LATCH.",
        },
        {
          kind: "trap",
          wrong: "Reading funct7 as seven bits and comparing it to 7'b0100000 rather than using bit 30.",
          right: "Slice inst[30] and use it in the two places where it matters.",
          why: "The seven-bit version happens to be correct for subtract, so the test passes and the mistake survives. It then breaks in the shift group, where you need to know which of srl and sra was meant, and where the bit sits in a different field entirely. Slicing bit 30 directly and using it in both places is less typing and cannot drift out of sync.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why is only bit 30 of funct7 ever used?",
              a: "Because funct7 is zero for every instruction except the two that need it — sub and sra — and in both of those only bit 30 differs from zero. The full field is 0000000 for the other eight R-type operations, 0100000 for sub and sra, and for OP-IMM it is 0000000 except that srai also uses 0100000. Carrying seven bits when one carries all the information would only add wires and comparison logic that always agrees.",
            },
            {
              q: "A load instruction also uses funct3, and the values do not mean what they mean for OP. What is different?",
              a: "The funct3 of a load selects the width and the sign treatment of the data — lb, lh, lw, lbu, lhu — not an arithmetic operation. So the same three bits feed a different consumer depending on the opcode. A load does not write the ALU's result to rd either; it writes the value that came back from memory. That is why the write-back stage needs a mux in front of it, choosing between the ALU result and the memory result, and why ALUOut and MemRead are two different signals that cannot both be driving rd.",
            },
          ],
        },
      ],
    },
    {
      slug: "verifier-mindset",
      title: "Think like the verifier",
      lede: "The bench never reads your code — it watches pc, dbg and done. Give it the sequence it expects.",
      blocks: [
        {
          kind: "para",
          text: "Every check the hidden bench runs is a pin comparison after one clock edge: reset gives pc 0, dbg 0, done low; each ADDI or SUB moves pc by 4 and possibly changes dbg; the taken branch jumps pc past one word; HALT raises done, and done stays high while pc stops moving. There is no partial credit for a clever decoder — only for pins that match. So verify the same way: hold reset for one edge, release it, then step one edge at a time and write down pc, dbg and done before you look at the waveform. If an early row disagrees, the bug is in fetch or decode, not in the ALU; if only the branch row disagrees, it is the branch mux or the taken condition. The bench sequence is short enough to trace by hand, and tracing it by hand is the whole check.",
        },
        {
          kind: "check",
          items: [
            {
              q: "After reset, the bench steps one edge and expects pc 4 with dbg still 0. Which instruction just ran, and why is dbg unchanged?",
              a: "The first ADDI writes x1, and dbg mirrors x3, so dbg stays 0 while pc advances to 4. A dbg that changed here means the write went to the wrong register — check the rd slice and the write-enable condition, not the ALU.",
            },
            {
              q: "HALT raises done, and the next edge must show the same pc with done still high. What does that tell you about the PC update?",
              a: "That the halted core stops advancing: once done is high the PC holds instead of adding 4. If pc keeps moving after HALT, the halt condition is not gating the PC mux — the design fetched past the end of the program instead of stopping on it.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "ISA (instruction set architecture)", meaning: "The agreement about which instruction bit patterns mean what, made by hardware to software." },
    { term: "opcode", meaning: "The top seven bits of a 32-bit instruction, saying which operation it is." },
    { term: "rd / rs1 / rs2", meaning: "The destination register and the two source registers the instruction reads." },
    { term: "funct3", meaning: "Three bits that refine the opcode, choosing between operations that share an opcode." },
    { term: "funct7", meaning: "Seven bits that further refine R-type and shift-immediate operations; only bit 30 is ever used." },
    { term: "immediate", meaning: "A constant built into the instruction itself rather than read from a register." },
    { term: "PC (program counter)", meaning: "The register holding the address of the instruction being fetched." },
    { term: "fetch", meaning: "Getting the instruction at the program counter out of instruction memory." },
    { term: "decode", meaning: "Splitting the instruction into its fields and working out which operation it is." },
    { term: "execute", meaning: "Doing the operation, in the ALU." },
    { term: "write-back", meaning: "Putting the result into the destination register." },
    { term: "datapath", meaning: "The wires and blocks that carry data between the registers, combinational logic and memory." },
    { term: "control unit", meaning: "The logic that reads the opcode and funct fields and tells every other block what to do." },
    { term: "logic (SystemVerilog)", meaning: "The SystemVerilog variable keyword, replacing Verilog-2001 wire and reg." },
    { term: "always_comb / always_ff", meaning: "The SystemVerilog replacements for always @(*) and always @(posedge clk), and better at catching mistakes." },
  ],
  nextStep:
    "This is the end of the track, and everything in the datapath is a block you have already built: the PC and instruction memory from chapters 9 and 13, the register file from chapter 12, the ALU from chapter 12, the mux-based control from chapter 4, and the state-register discipline from chapter 11. The problem set asks you to wire them together, which is hard and worth doing. When it runs, take the certificate route at the end of the curriculum, and if you want to keep going, the natural next step is a real RISC-V core with pipelining, hazards and branch prediction.",
};
