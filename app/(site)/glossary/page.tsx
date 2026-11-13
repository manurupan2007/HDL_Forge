import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Every term used in the HDL Forge Verilog track — bits, vectors, always blocks, FSMs, datapaths, UART, RISC-V — defined in one line each.",
};

type Term = { term: string; def: string; ch?: number };

/**
 * One-line definitions for every concept the track uses. Authored to stand
 * alone: a student at chapter 13 can look up a term from chapter 6 without
 * scrolling back. Ordered alphabetically, grouped by first letter.
 */
const TERMS: Term[] = [
  { term: "Active-low", def: "A control that does its job when it reads 0 (e.g. rst_n); the _n suffix is the convention.", ch: 8 },
  { term: "ALU", def: "Arithmetic Logic Unit — a combinational block that computes add/sub/logic/compare operations selected by an opcode.", ch: 12 },
  { term: "Always block", def: "Verilog's procedural container: always @(*) re-computes like a circuit, always @(posedge clk) acts once per clock edge.", ch: 3 },
  { term: "Assign", def: "A continuous assignment: the output re-computes whenever any input changes — hardware, not a one-time statement.", ch: 1 },
  { term: "Asynchronous reset", def: "A reset that acts immediately, without waiting for a clock edge.", ch: 8 },
  { term: "Baud", def: "The serial bit rate of a UART link; one baud tick is the time slot of one bit.", ch: 14 },
  { term: "Baud tick", def: "A one-cycle pulse of baud_en that advances the UART state machine by exactly one bit time.", ch: 14 },
  { term: "Bit", def: "One binary wire or value: it is either 0 or 1, forever.", ch: 1 },
  { term: "Blocking assignment", def: "The = of procedural code: statements run strictly in order. Wrong inside clocked blocks — use nonblocking there.", ch: 8 },
  { term: "Boot image", def: "The fixed memory contents a ROM starts with, often loaded from a text file with $readmemh.", ch: 13 },
  { term: "Bypass", def: "A mux that shortcuts freshly-written data to a reader in the same cycle (the write-first read-during-write trick).", ch: 12 },
  { term: "Carry-out", def: "A adder's over-bit: the bit that no longer fits the result width.", ch: 5 },
  { term: "Case", def: "A procedural multi-way branch; it must cover every possible value (or have a default) or it silently builds a latch.", ch: 4 },
  { term: "Casez", def: "A case variant that treats ? items as don't-care — the idiom for priority matching.", ch: 7 },
  { term: "Clock", def: "The periodic signal that paces all sequential logic; registers only change on its edge.", ch: 8 },
  { term: "Combinational", def: "Logic whose output is a pure function of its current inputs — no memory, no clock.", ch: 3 },
  { term: "Concatenation", def: "{a, b} — joining signals bit-wise into one wider value.", ch: 3 },
  { term: "Counter", def: "A register that increments (usually with wraparound) on every enabled clock edge.", ch: 9 },
  { term: "Decoder", def: "A block that turns an n-bit code into more explicit form — one-hot lines, or an instruction into control signals.", ch: 7 },
  { term: "Default", def: "A case's catch-all branch; also the latch-prevention tool.", ch: 4 },
  { term: "Don't-care", def: "A bit whose value doesn't affect the outcome, written ? inside casez patterns.", ch: 7 },
  { term: "Done", def: "This track's 'machine finished' flag — raised when the microcore reaches HALT.", ch: 15 },
  { term: "Duty cycle", def: "The fraction of a period a clock is high; 50% means equal low and high halves.", ch: 9 },
  { term: "Enable", def: "A gate that lets the clock/state update only when en = 1.", ch: 8 },
  { term: "Flip-flop", def: "The 1-bit memory that samples its input on a clock edge and holds it until the next one.", ch: 8 },
  { term: "FSM", def: "Finite State Machine — a state register plus next-state logic plus output logic; 'two tables and one register'.", ch: 11 },
  { term: "Full adder", def: "Adds three bits (a, b, carry-in) and produces sum and carry-out.", ch: 5 },
  { term: "HALT", def: "In this track's microcore, the all-ones word 32'hFFFF_FFFF; it is matched as a whole word and stops the PC while raising done.", ch: 15 },
  { term: "Immediate", def: "A constant embedded inside an instruction — the I, S, B, U and J formats in RV32I.", ch: 15 },
  { term: "ISA", def: "Instruction Set Architecture: the full contract of encodings and effects a CPU promises its software.", ch: 15 },
  { term: "Latch", def: "Unwanted storage created when a procedural block fails to assign an output on every path — the #1 silent-bug source for beginners.", ch: 4 },
  { term: "LSB / MSB", def: "Least / most significant bit of a vector; UART frames send LSB first.", ch: 14 },
  { term: "Localparam", def: "A local named constant — the right way to name FSM states instead of raw numbers.", ch: 11 },
  { term: "Mealy / Moore", def: "The two FSM output styles: Mealy reads the inputs directly, Moore depends only on the state.", ch: 11 },
  { term: "Metastability", def: "The undefined state of a flip-flop sampled too close to its edge — the reason external signals go through synchronizers.", ch: 8 },
  { term: "Module", def: "Verilog's unit of design: a named block with ports, describing one circuit.", ch: 1 },
  { term: "Mux", def: "Multiplexer — selects one of N inputs onto the output according to a select signal.", ch: 4 },
  { term: "Netlist", def: "The gate-level circuit a synthesizer produces from your RTL.", ch: 1 },
  { term: "Nonblocking", def: "The <= of clocked blocks: right-hand sides are all sampled first, then committed together. The correct style for registers.", ch: 8 },
  { term: "One-hot", def: "An encoding with exactly one bit set per state — costs flip-flops, saves decode logic.", ch: 11 },
  { term: "Opcode", def: "The instruction field that selects which operation the datapath performs.", ch: 12 },
  { term: "Part-select", def: "Slicing a range out of a vector: fixed (x[7:4]) or variable (x[base +: 4]).", ch: 3 },
  { term: "PC", def: "Program counter — the register holding the address of the instruction being executed.", ch: 15 },
  { term: "Port", def: "A module's declared input or output; the module's whole interface to the outside.", ch: 1 },
  { term: "Priority encoder", def: "Encodes the highest-priority active request line into its index, with a valid flag for 'any line active'.", ch: 7 },
  { term: "Registered", def: "Sampled on a clock edge — one cycle of latency compared with combinational logic.", ch: 13 },
  { term: "Register file", def: "The CPU's small multiported memory of architectural registers; 2R1W means two read ports and one write port.", ch: 12 },
  { term: "Reset", def: "The signal that forces a design into a known state; it can be synchronous (waits for the clock) or asynchronous (does not), and active-high or active-low.", ch: 8 },
  { term: "Rotate", def: "A shift whose fallen-off bits wrap around to the opposite end instead of disappearing.", ch: 10 },
  { term: "Reduction operator", def: "A one-operand &, |, or ^ that folds a whole vector into a single bit (e.g. ^x gives parity).", ch: 3 },
  { term: "Ripple-carry", def: "Adder structure where each stage's carry-out feeds the next stage's carry-in.", ch: 5 },
  { term: "Sensitivity list", def: "The always block's event trigger; @(*) means 'recompute whenever anything I read changes'.", ch: 3 },
  { term: "Sequential", def: "Logic clocked on an edge that remembers its state between edges.", ch: 8 },
  { term: "Shift register", def: "A chain of flip-flops moving data one position per enabled clock.", ch: 10 },
  { term: "Sign-extension", def: "Widening a signed value by copying its sign bit into the new high positions: {{4{x[3]}}, x}.", ch: 6 },
  { term: "Start / stop bit", def: "UART framing: 0 before the 8 data bits, 1 after — anything else is a framing error.", ch: 14 },
  { term: "Strobe", def: "A one-cycle pulse on an input signal.", ch: 9 },
  { term: "Synchronizer", def: "Two flip-flops in series that contain metastability risk on signals coming from outside the clock domain.", ch: 8 },
  { term: "Synthesis", def: "The conversion of your written rules into a real netlist of gates — the idea the whole track hangs off.", ch: 1 },
  { term: "Testbench", def: "The harness that drives inputs and checks outputs; the hidden benches grade every problem set.", ch: 5 },
  { term: "Truth table", def: "The complete input → output map of a combinational block.", ch: 1 },
  { term: "Two's complement", def: "Signed binary where negation is ~x + 1 and the MSB is the sign.", ch: 6 },
  { term: "Vector", def: "A named bundle of wires, e.g. wire [7:0] a — eight bits treated as one value.", ch: 1 },
  { term: "Waveform", def: "The time-plot of signal values (a VCD file) the simulator produces; the workspace shows it live.", ch: 1 },
  { term: "Width", def: "How many bits a vector holds; mismatches cause silent truncation — the most common beginner bug in the track.", ch: 1 },
  { term: "Write-first", def: "The read-during-write policy where the reader sees the NEW data (not the old).", ch: 12 },
  { term: "x / z", def: "Verilog's unknown and high-impedance values; x almost always means 'you forgot to drive or reset something'.", ch: 1 },
];

export default function GlossaryPage() {
  // Group alphabetically by first letter for scannability.
  const groups = new Map<string, Term[]>();
  for (const t of TERMS) {
    const letter = t.term[0].toUpperCase();
    const list = groups.get(letter) ?? [];
    list.push(t);
    groups.set(letter, list);
  }
  const letters = [...groups.keys()].sort();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="eyebrow">Reference</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Glossary</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
        Every term the full track uses, defined in one line each. Each entry
        names the chapter where the concept is taught in full — so a word you
        met in chapter 6 is always one page away in chapter 13.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {letters.map((letter) => (
          <section key={letter}>
            <h2 className="font-mono text-sm font-semibold text-fg-subtle">
              {letter}
            </h2>
            <dl className="mt-2 flex flex-col divide-y divide-border-subtle">
              {groups.get(letter)!.map((t) => (
                <div
                  key={t.term}
                  className="flex items-baseline gap-3 py-2 first:pt-0"
                >
                  <dt className="w-44 shrink-0 text-[13px] font-medium text-fg">
                    {t.term}
                  </dt>
                  <dd className="min-w-0 flex-1 text-[13px] leading-relaxed text-fg-muted">
                    {t.def}
                  </dd>
                  {t.ch && (
                    <dd className="shrink-0 font-mono text-[11px] text-fg-subtle">
                      ch {t.ch}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-fg-subtle">
        Ready to use one? Jump back to the{" "}
        <Link href="/learn" className="underline">
          curriculum
        </Link>
        .
      </p>
    </div>
  );
}
