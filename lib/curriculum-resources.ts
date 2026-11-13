// Teaching-resource catalog for the HDL Forge curriculum.
// Compiled from verified web + literature research. Every URL was reachable
// at research time; items marked [rescue] point at an Internet Archive
// capture because the live origin is gone or bot-gated. This catalog is
// internal research data — it is never rendered or bundled. Linking policy:
// only *links* to third-party material (see LICENSE_NOTES + LICENSE.md).
//
// LearnFlow (per proposal PDF): each chapter is Theory + Practice micro-tasks,
// then a guided lesson task (top.sv), then an unguided P-Set (RTL + hidden
// testbench). Dialect policy: classic Verilog-2001 through chapter 10, then
// SystemVerilog from chapter 11 onward.

export type ResourceKind =
  | "tutorial"
  | "interactive"
  | "reference"
  | "paper"
  | "course"
  | "tool"
  | "book";

export type Resource = {
  title: string;
  url: string;
  kind: ResourceKind;
  license: string;
  note?: string;
};

export type ChapterResource = {
  chapterNumber: number;
  slug: string;
  title: string;
  dialect: "verilog-2001" | "systemverilog";
  sources: Resource[];
  textbooks: string[];
  exercises: string[];
  pitfalls: string[];
  verilatorNotes: string[];
};

export const HDLBITS =
  "https://hdlbits.01xz.net/wiki/Problem_sets";
export const EDA_PLAYGROUND = "https://www.edaplayground.com/";
export const CHIPVERIFY_SV = "https://www.chipverify.com/systemverilog/";
export const CHIPVERIFY_V = "https://www.chipverify.com/verilog/";
export const ASIC_WORLD = "https://www.asic-world.com/veritut.html";
export const ASIC_WORLD_1DAY = "https://www.asic-world.com/verilog/verilog_one_day.html";
export const ASIC_WORLD_SV = "https://www.asic-world.com/systemverilog/tutorial.html";
export const ZIPCPU = "https://zipcpu.com/";
export const MAKERCHIP = "https://www.makerchip.com/sandbox/";

export const CHAPTER_RESOURCES: ChapterResource[] = [
  {
    chapterNumber: 1,
    slug: "synthesis-foundations",
    title: "Synthesis Foundations",
    dialect: "verilog-2001",
    sources: [
      { title: "HDLBits — Problem sets (Getting Started + Wire)", url: HDLBITS, kind: "interactive", license: "link-only" },
      { title: "ZipCPU — Rules for Newbies", url: "https://zipcpu.com/rules-for-newbies.html", kind: "tutorial", license: "link-only" },
      { title: "Project F (FPGA tutorials)", url: "https://projectf.io/", kind: "tutorial", license: "link-only" },
      { title: "FPGA4Fun", url: "https://www.fpga4fun.com/", kind: "tutorial", license: "link-only" },
      { title: "Makerchip sandbox", url: MAKERCHIP, kind: "interactive", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar, Verilog HDL 2e — ch.1–2 (gate-level modeling)",
      "Chu, FPGA Prototyping by Verilog Examples — ch.1–2",
      "Harris & Harris, D&CA RISC-V ed. — ch.1, ch.4 (HDL intro)",
      "Ciletti, Advanced Digital Design with Verilog 2e — ch.1–2",
    ],
    exercises: [
      "HDLBits: step_one, wire, notgate, andgate, norgate",
      "EDA Playground: run a trivial module with a $stop",
      "Makerchip: first assign",
    ],
    pitfalls: [
      "wire is a net type — you cannot procedurally assign to it; only assign / and-driver semantics apply.",
      "No clock needed in purely combinational chapters; simulation just elaborates + lints.",
      "UNUSEDSIGNAL/UNDRIVEN info warnings are normal on starter code — read them as style notes, not failures.",
    ],
    verilatorNotes: [
      "Platform runs verilator --lint-only; UNUSEDSIGNAL/UNDRIVEN appear even for valid lesson code. Teach them as information from day one.",
    ],
  },
  {
    chapterNumber: 2,
    slug: "logic-gates",
    title: "Logic Gates",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify Verilog index (gates/ports)", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World — Verilog tutorial", url: ASIC_WORLD, kind: "tutorial", license: "link-only" },
      { title: "MIT OCW 6.111 — Digital Systems Lab", url: "https://ocw.mit.edu/courses/6-111-introductory-digital-systems-laboratory-spring-2006/", kind: "course", license: "CC-BY-NC-SA, link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.7 (hierarchical modeling)",
      "Ciletti — ch.2 (module structure, ports)",
      "Chu — ch.2 (top-down design)",
      "Harris & Harris — ch.4 (module instantiation)",
    ],
    exercises: [
      "HDLBits: mod1, mod2, mod3, mod4, module_shift8",
      "HDLBits: gates, 7420, gates100",
      "EDA Playground: hierarchical multi-module design",
    ],
    pitfalls: [
      "Port order vs port name: named instantiation is the safe default; positional breaks on port reorder.",
      "input/output direction is from the module's viewpoint; driving both sides causes MULTIDRIVEN.",
      "Unconnected ports lint-clean but surface as UNDRIVEN/UNUSEDSIGNAL.",
    ],
    verilatorNotes: [
      "PINMISSING fires for unconnected ports; UNDRIVEN/UNUSEDSIGNAL per-port diagnostics teach dangling hierarchy early.",
    ],
  },
  {
    chapterNumber: 3,
    slug: "combinational-expressions",
    title: "Combinational Expressions",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify vectors/arrays sections", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World — one day Verilog tutorial", url: ASIC_WORLD_1DAY, kind: "tutorial", license: "link-only" },
      { title: "ZipCPU — What is simulation", url: "https://zipcpu.com/what-is-simulation.html", kind: "tutorial", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.3 (dataflow: part-select, concatenation)",
      "Ciletti — ch.3",
      "Chu — ch.2–3",
      "Harris & Harris — ch.4",
    ],
    exercises: [
      "HDLBits: vector0–vector4, Vector100r (bit reversal), vector100 (replication), gates4, gates100",
      "HDLBits: popcount255, bcdadd4 (later chapter)",
      "EDA Playground: indexed part-select demo",
    ],
    pitfalls: [
      "Pick one bit order ([N-1:0] or [0:N-1]) and keep it everywhere; LITENDIAN flags mixed styles.",
      "Variable part-selects need +: indexed selects; fixed [msb:lsb] on a variable index breaks/lints.",
      "Replication is {N{a}}, not {a,a,a}-style guessing; concat {a,b} vs replicate {N{a}} is a classic confusion.",
    ],
    verilatorNotes: [
      "WIDTHEXPAND/WIDTHTRUNC/WIDTHCONCAT catch mismatched slice widths; LITENDIAN is a style warning — a great teachable.",
    ],
  },
  {
    chapterNumber: 4,
    slug: "multiplexers",
    title: "Multiplexers & Selectors",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify operators", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World — operators section", url: ASIC_WORLD, kind: "tutorial", license: "link-only" },
      { title: "Cornell ECE5760 (FPGA context)", url: "https://people.ece.cornell.edu/land/courses/ece5760/", kind: "course", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.3–4",
      "Ciletti — ch.3–4",
      "Chu — ch.3",
      "Harris & Harris — ch.2 (Boolean algebra) + ch.4 (operators)",
    ],
    exercises: [
      "HDLBits: conditional (ternary), reduction (unary reduce)",
      "HDLBits: mux2to1, mux4to1, mux9to1, mux256to1, mux256to1v",
      "HDLBits: truthtable1, kmap1–kmap4",
    ],
    pitfalls: [
      "Reduction &a (1-bit result) vs binary a & b (element-wise) — silent width bug — no width warning fires.",
      "Signed semantics: $signed rules; the classic (a+b)>>1 unsigned shift trap.",
      "===/!== vs ==/!= differ when x/z appear; casez/casex masking is warned by Verilator (CASEWITHX).",
      "Omitted case default and incomplete if → inferred latch.",
    ],
    verilatorNotes: [
      "WIDTHTRUNC/WIDTHEXPAND are the workhorses; CASEWITHX warns on casex usage (recommend casez or full enumeration); CASEINCOMPLETE/CASEOVERLAP map exactly onto mux/case lessons.",
    ],
  },
  {
    chapterNumber: 5,
    slug: "adders",
    title: "Adder Circuits",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify always/procedural + TBs", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ZipCPU — Test bench clocking", url: "https://zipcpu.com/tbclock.html", kind: "tutorial", license: "link-only" },
      { title: "Harris & Harris companion site (free chapter PDFs)", url: "https://booksite.elsevier.com/9780128200643/", kind: "course", license: "free access, link-only" },
      { title: "MIT OCW 6.004 number systems", url: "https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/", kind: "course", license: "CC-BY-NC-SA, link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.3–4, ch.6 (first behavioral code)",
      "Ciletti — ch.4",
      "Chu — ch.3, ch.5 (regular sequential)",
      "Harris & Harris — ch.5 (digital building blocks: adders, ALU)",
    ],
    exercises: [
      "HDLBits: hadd, fadd, adder3, adder100",
      "HDLBits: alwaysblock1–2, always_if, always_if2, always_case, always_casez, always_nolatch (procedural prep)",
      "EDA Playground: full adder + first $display testbench",
    ],
    pitfalls: [
      "a + b + cin in one expression is not a structural ripple adder — fine for behavior, but explain bit-level carries.",
      "Overflow vs carry-out; fixed-width wrap-around surprises learner expectations.",
      "Signed compare/shift traps; sign-extension rules (custom content — HDLBits has no signed problems).",
      "$display fires once, $monitor fires on every change — but Verilator does NOT document $monitor support; prefer $display + $time, and always $finish.",
    ],
    verilatorNotes: [
      "--timing must be on for # delays; NOTIMING otherwise. $monitor not on Verilator's documented supported-task list — use $display.",
      "COMBDLY warns on #n inside combinational always — the classic gate-model teachable.",
    ],
  },
  {
    chapterNumber: 6,
    slug: "arithmetic",
    title: "Number Systems & Arithmetic",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify arithmetic/ALU", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World one-day tutorial", url: ASIC_WORLD_1DAY, kind: "tutorial", license: "link-only" },
      { title: "MIT OCW 6.004 — computation structures", url: "https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/", kind: "course", license: "CC-BY-NC-SA, link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.3–4",
      "Ciletti — ch.4",
      "Chu — ch.3 + ch.5",
      "Harris & Harris — ch.5",
    ],
    exercises: [
      "HDLBits has NO dedicated signed-arithmetic problems → use custom mini-modules (see GAPS).",
      "EDA Playground: two's-complement negation + overflow TB",
    ],
    pitfalls: [
      "Signed vs unsigned context determines extension/shift — Verilator WIDTHEXPAND/WIDTHCMP expose sign mixups.",
      "$signed()/$unsigned() windows; SV 2-state int (chapter 11+) changes how signs & x behave.",
      "Negative literals (-8'sd4) sign-extend — explain width before value.",
    ],
    verilatorNotes: [
      "WIDTHEXPAND/WIDTHTRUNC and sign-context warnings do the heavy lifting here; UNOPTFLAT may appear on convoluted comparator logic.",
    ],
  },
  {
    chapterNumber: 7,
    slug: "encode-decode",
    title: "Encoders, Decoders & Priority",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify combinational chapters", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World combinational", url: ASIC_WORLD, kind: "tutorial", license: "link-only" },
      { title: "ZipCPU FSM/machine posts", url: ZIPCPU, kind: "tutorial", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.2–4",
      "Ciletti — ch.2–4",
      "Chu — ch.3",
      "Harris & Harris — ch.2 + ch.4",
    ],
    exercises: [
      "HDLBits: priority encoder patterns via always_casez and always_nolatch",
      "HDLBits: 7420 (NAND gates) + truthtable1 (decoder-ish)",
      "EDA Playground: 8:3 priority encoder with valid flag",
    ],
    pitfalls: [
      "casez masks vs explicit don't-care enumeration; CASEEXPR/CASEOVERLAP getchas.",
      "Missing default in case → latch (again).",
      "Interrupt schemes: fixed priority vs round-robin — separate combinational priority from sequential arbitration.",
    ],
    verilatorNotes: [
      "CASEINCOMPLETE / CASEOVERLAP guide case hygiene; WIDTHTRUNC/WIDTHEXPAND on decoder outputs.",
    ],
  },
  {
    chapterNumber: 8,
    slug: "sequential-fundamentals",
    title: "Sequential Fundamentals",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify latches/flip-flops", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World — memory/FSM notes", url: "https://www.asic-world.com/verilog/memory_fsm.html", kind: "tutorial", license: "link-only" },
      { title: "Verification Academy (free registration)", url: "https://verificationacademy.com/", kind: "course", license: "link-only" },
      { title: "ZipCPU — What is simulation", url: "https://zipcpu.com/what-is-simulation.html", kind: "tutorial", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.4",
      "Ciletti — ch.5 (sequential)",
      "Chu — ch.4",
      "Harris & Harris — ch.3 (sequential logic design)",
    ],
    exercises: [
      "HDLBits: latch, dff, dff8, dff8r, dff8p, dff16e, dff8ar",
      "HDLBits Verification: Writing Testbenches section (self-checking TBs)",
      "EDA Playground: async-reset DFF with wave display",
    ],
    pitfalls: [
      "Intentional latches vs accidental latches both emit LATCH — separate intent (always_latch in SV) from bugs.",
      "Async vs sync reset with simulation unknowns (x) — decide reset strategy explicitly.",
      "Blocking vs nonblocking inside clocked blocks (BLKSEQ) — the two-process rule is formalized at chapter 11.",
    ],
    verilatorNotes: [
      "BLKSEQ, LATCH, IMPLICIT, MULTIDRIVEN; --trace + --timing unlock TB/VCD chapters. Enable $dumpfile/$dumpvars here for chapter 8+ waves.",
    ],
  },
  {
    chapterNumber: 9,
    slug: "counters",
    title: "Counters & Dividers",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify sequential chapters", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ASIC World one-day tutorial (counters)", url: ASIC_WORLD_1DAY, kind: "tutorial", license: "link-only" },
      { title: "ZipCPU — Rules for Newbies", url: "https://zipcpu.com/rules-for-newbies.html", kind: "tutorial", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.12 (recipes)",
      "Ciletti — ch.5",
      "Chu — ch.5 (regular sequential)",
      "Harris & Harris — ch.3 + ch.5 (counters, LFSRs)",
    ],
    exercises: [
      "HDLBits: count15, count1to10, countslow, countbcd",
      "HDLBits: shift4, shift18 (shifter crossover)",
      "EDA Playground: 8-bit counter with enable + sync reset",
    ],
    pitfalls: [
      "Overflow wraps silently — learners expect saturation (explain correct-by-wrap semantics vs saturating counters).",
      "Clock gating (if (enable) clk_d = clk) is a synthesis topic — prefer enabled registers.",
      "Terminal-count detection should be combinational from count, not a flag stored one cycle late.",
    ],
    verilatorNotes: [
      "BLKSEQ on blocking in clocked blocks; width discipline on counter add paths; IMPLICIT; UNOPTFLAT on complex enable logic.",
    ],
  },
  {
    chapterNumber: 10,
    slug: "shift-registers",
    title: "Shift Registers",
    dialect: "verilog-2001",
    sources: [
      { title: "ChipVerify sequential (shifters)", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "ZipCPU — What is simulation", url: "https://zipcpu.com/what-is-simulation.html", kind: "tutorial", license: "link-only" },
      { title: "HDLBits Sequential: Shift registers", url: HDLBITS, kind: "interactive", license: "link-only" },
    ],
    textbooks: [
      "Palnitkar — ch.12",
      "Ciletti — ch.5",
      "Chu — ch.5",
      "Harris & Harris — ch.3 + ch.5",
    ],
    exercises: [
      "HDLBits: shift4, rotater100, shift18 (UART crossover), lfsr5, lfsr32",
      "EDA Playground: bidirectional load-enable shift register",
    ],
    pitfalls: [
      "Rotate vs shift with sign: rotater100 is the classic slice+concat exercise.",
      "Serialization order (MSB-first vs LSB-first) must match the framing spec.",
      "for-loops in combinational blocks create replicated hardware only with generate or procedural loops — explain.",
    ],
    verilatorNotes: [
      "UNOPTFLAT on rotate/index loops; WIDTHEXPAND/WIDTHTRUNC on vector-slice widths; BLKSEQ discipline in clocked shifters.",
    ],
  },
  {
    chapterNumber: 11,
    slug: "finite-state-machines",
    title: "Finite State Machines",
    dialect: "systemverilog",
    sources: [
      { title: "ChipVerify SystemVerilog tutorials (two-process style)", url: CHIPVERIFY_SV, kind: "tutorial", license: "link-only" },
      { title: "ASIC World SystemVerilog + FSM", url: ASIC_WORLD_SV, kind: "tutorial", license: "link-only" },
      { title: "Sutherland — Synthesizable SystemVerilog (SNUG 2013) [rescue]", url: "https://web.archive.org/web/20241013215103/http://sutherland-hdl.com/papers/2013-SNUG-SV_Synthesizable-SystemVerilog_paper.pdf", kind: "paper", license: "link-only" },
      { title: "ZipCPU — machine/FSM posts", url: ZIPCPU, kind: "tutorial", license: "link-only" },
      { title: "IITB CS226 (Verilog/FSM coursework)", url: "https://www.cse.iitb.ac.in/~cs226/", kind: "course", license: "link-only" },
      { title: "Makechip sandbox (SV state machines)", url: MAKERCHIP, kind: "interactive", license: "link-only" },
    ],
    textbooks: [
      "Sutherland, SystemVerilog for Design 2e — ch.2 (logic, enum/typedef), ch.3–4 (always_comb/ff), ch.6–7 (packages, ports)",
      "Chu — ch.6–7 (FSM + FSMD)",
      "Ciletti — ch.6 (synchronous FSM)",
      "Harris & Harris — ch.4 (HDL FSM), ch.7 (microarchitecture FSMs)",
      "Palnitkar — ch.12 (FSM examples)",
    ],
    exercises: [
      "HDLBits (still V-1995/2001 — use for state reasoning): fsm1–fsm4, lemmings1–lemmings4, onehot problems",
      "EDA Playground: rewrite a V-2001 FSM in SV two-process style side-by-side",
    ],
    pitfalls: [
      "One-process vs two-process vs three-process: teach the two-process (always_comb next + always_ff register); packed one-process is where constant-inference bugs live.",
      "Mealy outputs are combinational from inputs — glitches are real; SV always_comb cannot see them (timing module 20).",
      "Missing default state → simulation/synthesis divergence (the x-state trap; Sutherland In-Love-with-My-X).",
      "enum without explicit encoding → width mismatch; Verilator treats enum as int by default.",
      "Async reset needs rst in the sensitivity list — in SV always_ff it is explicit, removing the classic omission bug.",
    ],
    verilatorNotes: [
      "BLKSEQ (blocking in always_ff), LATCH (always_comb without complete assignment), CASEINCOMPLETE/CASEOVERLAP, UNOPTFLAT, TIMESCALEMOD/NOTIMING timescale hygiene.",
      "Verilator recommends always_comb — the canonical 'why we switched dialects' moment.",
    ],
  },
  {
    chapterNumber: 12,
    slug: "datapath",
    title: "Datapath: ALUs & Registers",
    dialect: "systemverilog",
    sources: [
      { title: "ChipVerify SV FSM/datapath chapters", url: CHIPVERIFY_SV, kind: "tutorial", license: "link-only" },
      { title: "ZipCPU autopipeline posts", url: "https://zipcpu.com/strategies-for-pipelining.html", kind: "tutorial", license: "link-only" },
      { title: "MIT OCW 6.111 labs", url: "https://ocw.mit.edu/courses/6-111-introductory-digital-systems-laboratory-spring-2006/", kind: "course", license: "CC-BY-NC-SA, link-only" },
    ],
    textbooks: [
      "Chu — ch.6–7 (FSM + FSM/datapath hierarchy)",
      "Ciletti — ch.6",
      "Harris & Harris — ch.7",
      "Palnitkar — ch.12",
    ],
    exercises: [
      "HDLBits: ALU / register-file style problems are sparse (see GAPS) → custom 8-bit ALU + 2R1W regfile module",
      "EDA Playground: 2R1W register file with read-during-write semantics",
    ],
    pitfalls: [
      "FSMD: keep the control FSM separate from datapath registers; the classic count-in-state bug.",
      "2R1W read-during-write: same-cycle write vs read behavior differs by idiom — agree the rule, lint can't decide it.",
      "MULTIDRIVEN surfaces the hallmark two-blocks-write-one-signal bug.",
    ],
    verilatorNotes: [
      "UNOPTFLAT, MULTIDRIVEN, BLKSEQ, CASEINCOMPLETE.",
    ],
  },
  {
    chapterNumber: 13,
    slug: "memory",
    title: "Memory Blocks",
    dialect: "systemverilog",
    sources: [
      { title: "ASIC World — memory/FSM notes", url: "https://www.asic-world.com/verilog/memory_fsm.html", kind: "tutorial", license: "link-only" },
      { title: "ZipCPU — Should I use Block RAM? (memory series)", url: ZIPCPU, kind: "tutorial", license: "link-only" },
      { title: "ChipVerify arrays / $readmemh", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only" },
      { title: "Harris & Harris companion site (memory systems ch.8)", url: "https://booksite.elsevier.com/9780128200643/", kind: "course", license: "free access, link-only" },
    ],
    textbooks: [
      "Chu — ch.12 (memory circuits; verified chapter)",
      "Palnitkar — ch.3 (memories via arrays)",
      "Ciletti — ch.7",
      "Harris & Harris — ch.8 (memory systems)",
    ],
    exercises: [
      "HDLBits has NO dedicated memory/RAM problems (verify: see GAPS) → custom inferred-ROM + $readmemh lessons, EDA Playground hex-file TB",
      "EDA Playground: $readmemh demo with a hex image",
    ],
    pitfalls: [
      "SRAM inference is synthesis-domain — lint can't verify it; teach the sync-read idiom, not the promise.",
      "$readmemh path resolution differs per sandbox — the browser platform must bundle hex fixtures per lesson.",
      "Array ordering mem[addr][bit] vs mem[bit][addr] — pick one, keep it.",
      "x-until-initialized memory: teach $readmemh + default, not uninitialized reg arrays.",
    ],
    verilatorNotes: [
      "$readmemh/$readmemb SUPPORTED (Verilator manual); width checks on wide bit-selects; IMPLICIT/UNDRIVEN at top level.",
      "SV dynamic arrays & queues are NOT synthesizable — fixed arrays only in design files.",
    ],
  },
  {
    chapterNumber: 14,
    slug: "interfaces",
    title: "Interfaces: UART",
    dialect: "systemverilog",
    sources: [
      { title: "ZipCPU — serial port tutorial", url: "https://zipcpu.com/serial-port.html", kind: "tutorial", license: "link-only" },
      { title: "Chu — ch.9–11 I/O examples (UART/PS2/VGA) as modular build tasks", url: "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470374283", kind: "book", license: "commercial", note: "verify/media chevron" },
      { title: "Project F (larger pipelines)", url: "https://projectf.io/", kind: "tutorial", license: "link-only" },
      { title: "HDLBits Building Larger Circuits + exam/review2015 FSMs", url: HDLBITS, kind: "interactive", license: "link-only" },
    ],
    textbooks: [
      "Chu — ch.7 (FSMD) + ch.9–11 (peripherals)",
      "Ciletti — ch.8–9",
      "Harris & Harris — ch.5–7",
    ],
    exercises: [
      "HDLBits: rule90, rule110, conwaylife (medium-design warm-ups)",
      "HDLBits exam/review2015 FSMs + onehot (wire-up discipline)",
      "EDA Playground: UART TX→RX loopback self-checking TB",
    ],
    pitfalls: [
      "Baud generation is a counter, not a delay — sync the baud enable, never gate the clock.",
      "UART framing: start bit low, stop bit high, LSb-first — off-by-one in the bit counter is the #1 bug.",
      "CD (carrier/overrun) flags: keep framing-check errors visible, not silent.",
    ],
    verilatorNotes: [
      "MULTIDRIVEN across hierarchy; PINMISSING; UNDRIVEN/UNUSEDSIGNAL at top; UNOPTFLAT on cross-module paths.",
      "UART peripheral content is scattered on free sites — build ONE canonical lesson (ZipCPU serial-port + Chu ch.9 as sources).",
    ],
  },
  {
    chapterNumber: 15,
    slug: "risc-v-blocks",
    title: "RISC-V Blocks",
    dialect: "systemverilog",
    sources: [
      { title: "RISC-V ratified specifications", url: "https://riscv.org/specifications/ratified/", kind: "reference", license: "CC-BY-4.0, cite only" },
      { title: "riscv-isa-manual repo", url: "https://github.com/riscv/riscv-isa-manual", kind: "reference", license: "CC-BY-4.0, cite only" },
      { title: "YosysHQ picorv32 (browser-sim viable, Stretch)", url: "https://github.com/YosysHQ/picorv32", kind: "tool", license: "ISC" },
      { title: "Harris & Harris RISC-V edition companion", url: "https://booksite.elsevier.com/9780128200643/", kind: "course", license: "free access, link-only" },
    ],
    textbooks: [
      "Harris & Harris — ch.6 (architecture), ch.7 (microarchitecture), ch.8 (memory)",
    ],
    exercises: [
      "EDA Playground: picorv32 simulation with a small program (Stretch)",
      "Custom: PC+4 & branch mux, sign-extended I/S/B/U immediate gen, datapath slice wiring",
    ],
    pitfalls: [
      "Immediate formats differ per instruction type — sign-extension width tables, not ad-hoc wires.",
      "Separate combinational decode from registered state; the PC updates in always_ff, decode in always_comb.",
      "Two's-complement branch target arithmetic (PC-relative) — width and signed traps recur.",
    ],
    verilatorNotes: [
      "picorv32 is Verilator-compatible — full-chip browser sim is a platform Stretch goal; --trace gives instruction-level waveforms.",
    ],
  },
];

export type ModuleResource = {
  module: number;
  title: string;
  sources: Resource[];
  note: string;
};

export const ADVANCED_TRACK: ModuleResource[] = [
  {
    module: 16,
    title: "SystemVerilog in depth: interfaces, packages, modports",
    sources: [
      { title: "Doulos SV tutorial series", url: "https://www.doulos.com/knowhow/systemverilog/systemverilog-tutorials/", kind: "tutorial", license: "link-only" },
      { title: "ChipVerify SystemVerilog", url: CHIPVERIFY_SV, kind: "tutorial", license: "link-only" },
      { title: "ASIC World SystemVerilog", url: ASIC_WORLD_SV, kind: "tutorial", license: "link-only" },
      { title: "Sutherland, SystemVerilog for Design 2e (ch.7–9)", url: "https://link.springer.com/book/10.1007/978-1-4757-6682-0", kind: "book", license: "commercial" },
    ],
    note: "interface/modport synthesizability; logic cannot be multi-driven; packages vs $unit; implicit port connections (.*). Verilator supports interface/modport (manual languages.html).",
  },
  {
    module: 17,
    title: "Verification with cocotb (UVM: assessed, not adopted)",
    sources: [
      { title: "cocotb documentation", url: "https://docs.cocotb.org/", kind: "reference", license: "BSD-3-Clause" },
      { title: "cocotb repository", url: "https://github.com/cocotb/cocotb", kind: "tool", license: "BSD-3-Clause" },
      { title: "Verification Academy", url: "https://verificationacademy.com/", kind: "course", license: "link-only, free registration" },
      { title: "Spear & Tumbush, SystemVerilog for Verification 3e", url: "https://doi.org/10.1007/978-1-4614-0715-7", kind: "book", license: "commercial, reference only" },
    ],
    note: "Full UVM is deliberately overkill for a browser learning platform — cover concepts (factory, sequences, scoreboard) at overview level; cocotb+Verilator is a supported, documented combo.",
  },
  {
    module: 18,
    title: "Assertions & X-awareness (SVA-lite + formal intro)",
    sources: [
      { title: "Sutherland — Synthesizable SystemVerilog (SNUG 2013) [rescue]", url: "https://web.archive.org/web/20241013215103/http://sutherland-hdl.com/papers/2013-SNUG-SV_Synthesizable-SystemVerilog_paper.pdf", kind: "paper", license: "link-only" },
      { title: "Sutherland — In Love with My X (DVCon 2013) [rescue]", url: "https://web.archive.org/web/20260419141455/http://sutherland-hdl.com/papers/2013-DVCon_In-love-with-my-X_paper.pdf", kind: "paper", license: "link-only" },
      { title: "YosysHQ riscv-formal", url: "https://github.com/YosysHQ/riscv-formal", kind: "tool", license: "ISC" },
      { title: "YosysHQ yosys", url: "https://github.com/YosysHQ/yosys", kind: "tool", license: "ISC" },
    ],
    note: "assert in SV is procedural/checker, not a net. Verilator --assert enables SVA checking in simulation (simulator-side, not lint). Teach X-propagation optimism vs pessimism via the DVCon paper.",
  },
  {
    module: 19,
    title: "Clock domain crossing (concept-level; lint-only disclaimers)",
    sources: [
      { title: "ZipCPU — CDC", url: "https://zipcpu.com/cdc.html", kind: "tutorial", license: "link-only" },
      { title: "ZipCPU — Async FIFO", url: "https://zipcpu.com/afifo.html", kind: "tutorial", license: "link-only" },
      { title: "Cummings — SNUG2002 Async FIFO part 1 [rescue]", url: "https://web.archive.org/web/20250529022648/http://www.sunburst-design.com/papers/CummingsSNUG2002SJ_FIFO1_rev1_1.pdf", kind: "paper", license: "link-only" },
      { title: "Cummings — SNUG2002 Async FIFO part 2 [rescue]", url: "https://web.archive.org/web/20250528084409/http://www.sunburst-design.com/papers/CummingsSNUG2002SJ_FIFO2_rev1_1.pdf", kind: "paper", license: "link-only" },
    ],
    note: "CDC is fundamentally synthesis/STA territory; a lint-only browser platform teaches the patterns (2-FF synchronizer, gray counters, handshake) and simulates them, but cannot verify metastability safety — say so explicitly. Use /* verilator lint_off UNOPTFLAT */ with commentary.",
  },
  {
    module: 20,
    title: "Timing, pipelining & Fmax concepts",
    sources: [
      { title: "ZipCPU — Strategies for Pipelining", url: "https://zipcpu.com/strategies-for-pipelining.html", kind: "tutorial", license: "link-only" },
      { title: "Project F", url: "https://projectf.io/", kind: "tutorial", license: "link-only" },
      { title: "Harris & Harris companion (pipelining ch.7)", url: "https://booksite.elsevier.com/9780128200643/", kind: "course", license: "free access, link-only" },
    ],
    note: "No real timing in lint; teach concepts (critical path, pipeline stages, throughput vs latency) then send learners to EDA Playground / real tools for numbers. UNOPTFLAT is a logical-loop warning, NOT a timing violation — don't conflate.",
  },
  {
    module: 21,
    title: "RISC-V & open-source silicon",
    sources: [
      { title: "RISC-V ratified specs", url: "https://riscv.org/specifications/ratified/", kind: "reference", license: "CC-BY-4.0" },
      { title: "YosysHQ picorv32", url: "https://github.com/YosysHQ/picorv32", kind: "tool", license: "ISC" },
      { title: "YosysHQ riscv-formal", url: "https://github.com/YosysHQ/riscv-formal", kind: "tool", license: "ISC" },
      { title: "BrunoLevy learn-fpga", url: "https://github.com/BrunoLevy/learn-fpga", kind: "tutorial", license: "link-only" },
      { title: "Harris & Harris RISC-V edition (ch.6–8)", url: "https://booksite.elsevier.com/9780128200643/", kind: "book", license: "free access, link-only", note: "DOI 10.1109/WCAE53984.2021.9707615 for the WCAE paper" },
    ],
    note: "picorv32 is Verilator-compatible — a full-chip browser simulation is a feasible Stretch goal with --trace.",
  },
  {
    module: 22,
    title: "Capstone / project track",
    sources: [
      { title: "TinyTapeout", url: "https://tinytapeout.com/", kind: "tool", license: "open-hardware, generally CC-BY-SA; link-only" },
      { title: "ZipCPU fpga-hell", url: "https://zipcpu.com/fpga-hell.html", kind: "tutorial", license: "link-only" },
      { title: "ZipCPU looking at Verilator", url: "https://zipcpu.com/looking-at-verilator.html", kind: "tutorial", license: "link-only" },
      { title: "Project F (system-on-FPGA series)", url: "https://projectf.io/", kind: "tutorial", license: "link-only" },
    ],
    note: "Browser-verifiable subset: design, lint, simulate, waveform, cocotb. TinyTapeout is the optional physical exit ramp; physical FPGA bring-up is out of scope.",
  },
];

export const REFERENCE_SOURCES: Resource[] = [
  { title: "IEEE Std 1800-2017 SystemVerilog LRM (free via IEEE GET Program with a free account)", url: "https://ieeexplore.ieee.org/browse/standards/get-program/page", kind: "reference", license: "free-to-read via GET Program", note: "page is JS-rendered — confirm account entitlement before linking learners; DOI 10.1109/IEEESTD.2018.8299595" },
  { title: "IEEE Std 1364-2005 Verilog LRM", url: "https://ieeexplore.ieee.org/document/1620780", kind: "reference", license: "paywalled/GET Program" },
  { title: "Verilator manual (warnings, languages, verilating)", url: "https://veripool.org/guide/latest/", kind: "reference", license: "LGPL-3.0 (external tool)" },
  { title: "Cummings — Nonblocking assignments & coding styles that kill (SNUG2000) [rescue]", url: "https://web.archive.org/web/20250717093917/http://www.sunburst-design.com/papers/CummingsSNUG2000SJ_NBA.pdf", kind: "paper", license: "link-only" },
  { title: "Cummings — NBA with delays (SNUG2002 Boston) [rescue]", url: "https://web.archive.org/web/20220420213327/http://www.sunburst-design.com/papers/CummingsSNUG2002Boston_NBAwithDelays_rev1_3.pdf", kind: "paper", license: "link-only" },
  { title: "Cummings — FSM fundamentals (ICU2002) [rescue]", url: "https://web.archive.org/web/20040612230446/http://www.sunburst-design.com/papers/CummingsICU2002_FSMFundamentals_rev1_1.pdf", kind: "paper", license: "link-only" },
  { title: "Cummings — FPGA verification [rescue]", url: "https://web.archive.org/web/20241211191526/http://www.sunburst-design.com/papers/Cummings_FPGAVerification.pdf", kind: "paper", license: "link-only" },
  { title: "Cummings — SV implicit ports (DesignCon2005) [rescue]", url: "https://web.archive.org/web/20241208190847/http://www.sunburst-design.com/papers/CummingsDesignCon2005_SystemVerilog_ImplicitPorts.pdf", kind: "paper", license: "link-only" },
  { title: "Cummings — dot-star ports (DAC2008) [rescue]", url: "https://web.archive.org/web/20241012195423/http://www.sunburst-design.com/papers/CummingsDAC2008_DotStarPorts.pdf", kind: "paper", license: "link-only" },
  { title: "Sutherland — Standard gotchas (SNUG2006 Boston) [rescue]", url: "https://web.archive.org/web/20230325234639/http://www.sutherland-hdl.com/papers/2006-SNUG-Boston_standard_gotchas_paper.pdf", kind: "paper", license: "link-only" },
  { title: "Sutherland — Synthesizable SystemVerilog (SNUG2013) [rescue]", url: "https://web.archive.org/web/20241013215103/http://sutherland-hdl.com/papers/2013-SNUG-SV_Synthesizable-SystemVerilog_paper.pdf", kind: "paper", license: "link-only" },
];

export const BOOK_SHORTLIST: Resource[] = [
  { title: "Harris & Harris, Digital Design and Computer Architecture: RISC-V Edition (2021)", url: "https://booksite.elsevier.com/9780128200643/", kind: "book", license: "commercial; companion chapter PDFs free", note: "Best overall: ch.2–5 HDL/building blocks, ch.6–8 RISC-V." },
  { title: "Chu, FPGA Prototyping by Verilog Examples (1e 2008 / 2e SystemVerilog Examples)", url: "https://onlinelibrary.wiley.com/doi/book/10.1002/9780470374283", kind: "book", license: "commercial", note: "The FSM/FSMD + peripheral sequence; ch.2–7 + memory ch.12 in 1e." },
  { title: "Palnitkar, Verilog HDL: A Guide to Digital Design and Synthesis (2e 2003)", url: "https://www.pearson.com/en-us/subject-catalog/p/verilog-hdl/", kind: "book", license: "commercial", note: "Classic language reference: ch.2–4 language, ch.7 hierarchy, ch.12 examples." },
  { title: "Ciletti, Advanced Digital Design with the Verilog HDL (2e 2011)", url: "https://www.cambridge.org/9780123695277", kind: "book", license: "commercial", note: "RTL/FSM ch.2–6; testing/verification ch.11–12." },
  { title: "Sutherland, SystemVerilog for Design (2e 2006)", url: "https://link.springer.com/book/10.1007/978-1-4757-6682-0", kind: "book", license: "commercial", note: "The SV dialect-transition source: ch.2–9 data types, processes, packages, interfaces." },
];

export const PRACTICE_SITES: Resource[] = [
  { title: "HDLBits", url: HDLBITS, kind: "interactive", license: "link-only", note: "The exercise spine for chapters 1–11 reasoning; no signed-arithmetic, memory, or UART problems (verify gaps)." },
  { title: "EDA Playground", url: EDA_PLAYGROUND, kind: "interactive", license: "link-only", note: "Multi-tool sim, SV mode, VCD; login required for saving." },
  { title: "Makerchip sandbox", url: MAKERCHIP, kind: "interactive", license: "link-only", note: "SV visual IDE + pipelines." },
  { title: "ChipVerify", url: CHIPVERIFY_V, kind: "tutorial", license: "link-only", note: "Tutorials + exercises; /systemverilog/ for the SV half." },
  { title: "ASIC World", url: ASIC_WORLD, kind: "tutorial", license: "link-only", note: "Classic reference; one-day tutorial + SV tutorial." },
  { title: "ZipCPU blog", url: ZIPCPU, kind: "tutorial", license: "link-only", note: "10 verified posts: serial-port, cdc, afifo, vcd, tbclock, what-is-simulation, strategies-for-pipelining, rules-for-newbies, fpga-hell, looking-at-verilator." },
  { title: "Verification Academy", url: "https://verificationacademy.com/", kind: "course", license: "link-only", note: "Modules 17/18 concepts; free registration." },
];

export const DIALECT_PLAN = [
  {
    range: "Chapters 1–10",
    dialect: "Verilog-2001",
    rationale:
      "Richest free material (HDLBits, ASIC World, ChipVerify) is V-2001; Verilator accepts both dialects so the toolchain is unchanged. Structure: wire/reg, assign, always @(*), named ports.",
  },
  {
    range: "Chapter 11 (the switch)",
    dialect: "SystemVerilog",
    rationale:
      "FSM two-process style (always_comb + always_ff, enum/typedef state types, full case with default) is the natural 'why SV' showcase. Verilator recommends always_comb. Side-by-side V-2001↔SV comparison exercises on EDA Playground.",
  },
  {
    range: "Chapters 12–15",
    dialect: "SystemVerilog",
    rationale:
      "logic, always_comb/always_ff, case with default, timeunit. Legacy chapters stay V-2001 and lint side-by-side — how industry codebases really look.",
  },
  {
    range: "Advanced modules 16+",
    dialect: "SystemVerilog only",
    rationale:
      "interfaces/modports/packages, SVA (--assert), cocotb. $readmemh/$readmemb, --timing, --trace all keep working.",
  },
];

export const CURRICULUM_GAPS = [
  "No free signed-arithmetic exercise sets (HDLBits has none) → build custom signed + sign-extension mini-module for chapter 6/7.",
  "No memory/RAM/ROM problems on HDLBits → custom $readmemh + inferred-ROM lessons for chapter 13 (use EDA Playground with bundled hex fixtures).",
  "No ALU/register-file integration problems → chapter 12 needs a custom ALU + 2R1W regfile + FSM project.",
  "No SVA/assert practice on free sites in a lint-friendly form → custom assertion tasks (Verilator --assert) for module 18.",
  "No browser-native timing → modules 19–20 must stay concept-level with explicit platform disclaimers; point to EDA Playground/real tools for STA numbers.",
  "UART/serial content is scattered → build one canonical UART (or SPI) peripheral lesson from ZipCPU serial-port + Chu ch.9 for chapter 14 and the capstone.",
  "$monitor is not on Verilator's documented supported-task list → custom testbench lessons must rely on $display/$write; don't promise $monitor behavior.",
];

export const LICENSE_NOTES = [
  "HDL Forge platform + authored content: MIT (project constraint).",
  "Verilator: LGPL-3.0-or-later (parts dual MIT); invoked as an external WASM binary — do not copy its source into MIT content.",
  "cocotb: BSD-3-Clause (module 17 dependency, compatible). Yosys/nextpnr/picorv32/riscv-formal: ISC (compatible).",
  "riscv-isa-manual: CC-BY-4.0 — cite, don't embed.",
  "GTKWave: GPL-2.0-or-later — external tool; don't embed GPL code into the MIT codebase.",
  "MIT OCW 6.111/6.004: CC-BY-NC-SA — link only, NC conflicts with redistribution.",
  "All tutorial sites (ChipVerify, ASIC World, HDLBits, Doulos, EDA Playground, Makerchip, Project F, FPGA4Fun, ZipCPU, Sunburst/Cummings PDFs, Sutherland HDL PDFs, Verification Academy, TinyTapeout, Nandland): link-only usage; © owners.",
  "Textbooks (Harris&Harris, Chu, Palnitkar, Ciletti, Sutherland, Spear&Tumbush): commercial — instructor mapping + recommended reading only, never redistributed. Companion-site free chapter PDFs may be linked.",
  "Defunct/dead sources removed from catalog (do not link): ericgur.com, verilogbyexample.com, digitaldesignandcomputerarchitecture.com. Nandland live site is bot-gated → use the Wayback rescue link and banner to the original site.",
];