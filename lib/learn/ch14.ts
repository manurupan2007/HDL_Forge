import type { ChapterLearn } from "./types";

export const chapterLearn: ChapterLearn = {
  chapterNumber: 14,
  chapterSlug: "interfaces",
  title: "Interfaces: UART",
  readMinutes: 25,
  youWillBeAbleTo: [
    "Compute how many clock cycles make up one bit time, and say how much baud error the rounding introduces",
    "Draw the 1-start / 8-data / 1-stop frame for a byte of your choosing, bit by bit, and name what the receiver does at each field",
    "Write a bit-time counter that reloads after N clocks and turns a fast clock into one pulse per bit",
    "Write a transmitter state machine that puts start, data and stop bits on the wire least-significant bit first",
    "Explain why the receiver samples the middle of a bit rather than its edge, and how a real design oversamples to get there",
    "Write a receiver that finds the middle of the start bit, samples each data bit, and raises a framing error when the stop bit is low",
    "Connect a transmitter to a receiver in loopback and check byte by byte that every byte survives the round trip",
  ],
  mentalModel: [
    {
      title: "This is the first box that has to agree with a wire leaving the board",
      body: "Everything you have built so far was boxes of gates talking to boxes of gates, all inside one chip, all sharing one clock. Nothing had to agree with anything outside. A UART is different: it is a box that has to agree with a wire going to another board, at a rate that board does not share with yours. That single change turns a set of clean, local, exact-timing problems into a protocol problem. The question is no longer \"what does this logic compute\" but \"how do two independent machines take turns speaking and understand each other\". Everything here — the frame, the agreed rate, the start bit, the mid-bit sample — exists to solve that one problem. UART is not a clever trick. It is the smallest agreement two strangers can make over one wire.",
    },
    {
      title: "A serial wire is a conversation read off a rulebook",
      body: "A UART wire is one pin that is either high or low, and a whole byte is spelled out over time on that one pin. The spelling is called a frame, and it is a fixed format: rest high, dip low once, then eight bits, then rest high again. The high rest state is the important part. Because the line is guaranteed high whenever nobody is talking, a sudden low can mean exactly one thing — a byte has started — and the other end knows to start counting from that moment. So the wire carries no data of its own; it carries timing, and the timing carries the data. Agree on the format and the rate, and two boards can share information over a single pin with no extra clock wire at all.",
    },
    {
      title: "A counter is the gearbox between your fast clock and the slow wire",
      body: "Your clock runs at 50 million ticks a second. The wire wants 115,200 bits a second. Nothing about a 50 MHz clock is 115,200 Hz. A counter that counts up and reloads is the gearbox: it swallows N clock ticks and emits one single-cycle pulse, so one pulse per bit. From that point on the rest of the design is easy — the transmitter waits for a pulse between bits, the receiver waits for a pulse between samples. That pulse is called a bit-time enable, and it is the heartbeat this chapter runs on.",
    },
  ],
  topics: [
    {
      slug: "from-a-bus-to-a-wire",
      title: "From a bus to a wire",
      lede: "Why a working design suddenly needs a single pin, a rulebook, and an agreement with someone else.",
      blocks: [
        {
          kind: "para",
          text: "In chapter 1 you declared `wire [7:0] data` and called it a byte. Eight wires, all changing at the same instant, all meaning the same thing to whoever is listening. That is a bus, and it is the natural shape of hardware inside one chip: eight physical traces running side by side between two blocks, all clocked together, no disagreement possible. A UART throws all of that away. There is one pin. The eight bits take turns on it, one after another, each staying put long enough to be read. That is a serial link, and it is how a chip talks to a keyboard, a screen, a sensor board, or a laptop.",
        },
        {
          kind: "analogy",
          text: "A bus is eight people shouting at once, one word each, and everybody hears all eight words together. A serial link is one person at a time, saying eight words slowly and clearly, with everyone listening to the same person. Both convey the same byte. The serial version needs one wire instead of eight, and it works across a metre of loose cable where eight wires would never survive. What it costs is timing: the listener has to know when each word starts, and that is the entire subject of this chapter.",
        },
        {
          kind: "define",
          items: [
            { term: "serial", meaning: "Sending one bit at a time down one wire, in time order." },
            { term: "parallel (bus)", meaning: "Sending several bits at once down several wires, all changing together." },
            { term: "framing", meaning: "Wrapping the payload in fixed marker bits so the receiver knows where the payload begins and ends." },
            { term: "protocol", meaning: "The agreed rules both ends follow: what the values mean, in what order, at what rate." },
          ],
        },
        {
          kind: "para",
          text: "Three things must be true before a single byte can cross the wire, and each one becomes a block of logic. First, both ends must agree on the rate — how many bit times go by per second. Second, both ends must agree on the format — how many bits, in what order, with what markers. Third, the sender must announce that a byte is starting, in a way that cannot be confused with the resting state. Take those three away and the receiver is looking at a pin that changes for no reason it can name. That is why the next topic is the rate, and the one after that is the format.",
        },
        {
          kind: "points",
          title: "The two questions a serial link has to answer",
          items: [
            "\"How fast is this bit going?\" — answered by the baud rate, agreed once and never negotiated.",
            "\"Where does this byte begin?\" — answered by the frame, which is the same on every message, forever.",
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "There is no clock wire, and that is the whole trick",
          text: "I2C and SPI both give you a clock line alongside the data, so the receiver is told exactly when to look. UART sends no clock. The rate is agreed out of band — both boards are simply configured to the same number — and the receiver has to recover the timing from the data itself. That single fact, no shared clock, is why a UART receiver is the harder half of this chapter.",
        },
      ],
    },
    {
      slug: "baud-rate",
      title: "Baud rate: the one number both ends agree on",
      lede: "How many bits per second go past, why both sides must know it, and the one division the whole chapter depends on.",
      blocks: [
        {
          kind: "analogy",
          text: "Two people reading out loud at the same speed. The sender says \"one, two, three\" and the listener writes down the numbers as they hear them. If the sender counts slowly and the listener writes at the speed they expect, the listener writes down nonsense while looking at a perfectly good list. Nothing was dropped and nothing was corrupted — the two sides simply used different clocks for the same conversation. A baud rate is the agreed speed of that conversation.",
        },
        {
          kind: "define",
          items: [
            { term: "baud", meaning: "One bit per second-period. At 9600 baud the line changes value 9,600 times a second." },
            { term: "bit time", meaning: "How long one bit lasts on the wire. At 9600 baud, 1 ÷ 9600 seconds, about 104 microseconds." },
            { term: "baud rate", meaning: "The agreed number of bit times per second. Both ends of the wire are configured with the same number." },
            { term: "CLKS_PER_BIT", meaning: "The parameter name this chapter uses for how many of your clock cycles make up one bit time." },
          ],
        },
        {
          kind: "para",
          text: "Note what a baud is not: it is not a bit rate. In plain UART, one bit time carries exactly one bit, so the number of bits per second and the number of baud are the same number. The distinction only matters for schemes that squeeze more than one bit into a symbol, and you will not meet one in this track. For now, baud rate is bits per second.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "What actually goes wrong when the two rates disagree",
          text: "The receiver counts bit times using its own idea of the rate. If it thinks the line is faster than it really is, it finishes a byte before the sender has, and it samples the next byte's bits instead of the end of this one. The result is not a garbled byte. It is a plausible-looking byte that is simply the wrong number, with the last two or three bits being the start of the following frame. Wrong rate, wrong data, no error reported. Both ends must agree.",
        },
        {
          kind: "steps",
          title: "The one calculation this chapter depends on",
          items: [
            {
              head: "You know two numbers: your clock and the agreed baud",
              body: "Say your design's clock is 12 MHz, so a second contains 12,000,000 clock cycles. The other end is configured for 115,200 baud, so a second contains 115,200 bit times.",
            },
            {
              head: "Divide one by the other",
              body: "12,000,000 ÷ 115,200 = 104.17. So one bit time is about 104 of your clock cycles. This is CLKS_PER_BIT, and every counter, every enable and every state in this chapter is sized from it.",
            },
            {
              head: "Hardware cannot count 104.17, so round",
              body: "Counters count whole numbers. Round to 104. That choice has a price tag, and you should know the price before you commit to it.",
            },
            {
              head: "Work out what the rounding actually cost",
              body: "With CLKS_PER_BIT = 104 you really produce 12,000,000 ÷ 104 = 115,384 baud. The error is (115,384 − 115,200) ÷ 115,200 = +0.16%. Across a ten-bit frame that is about 1.6% of a bit time of drift, comfortably inside what a receiver can absorb.",
            },
            {
              head: "Check the error, do not just hope",
              body: "A UART receiver tolerates a couple of percent of baud mismatch. A few tenths of a percent is safe. Several percent is a design that works on your bench and fails on a cold board, because it is sitting right at the edge. Computing the error is not bookkeeping — it is the difference between a link and a coin toss.",
            },
          ],
        },
        {
          kind: "code",
          caption: "The division, written down as it will appear in your source.",
          code: `// The number you will put in a parameter, worked out by hand.
parameter CLKS_PER_BIT = 104;   // 12,000,000 / 115,200, rounded

// and the check that says the rounding was acceptable
// actual baud   = 12,000,000 / 104            = 115,384
// percent error = (115,384 - 115,200)/115,200 = +0.16%`,
          note: "Write the error calculation next to the parameter in your own code. It costs two lines of comment and it is the only thing standing between you and a design that is 1% off without telling anybody.",
        },
        {
          kind: "table",
          head: ["Your clock", "Baud", "CLKS_PER_BIT", "Actual baud", "Error"],
          rows: [
            ["12 MHz", "115,200", "104", "115,385", "+0.16%"],
            ["12 MHz", "9,600", "1250", "9,600", "0% — exact"],
            ["1.8432 MHz", "115,200", "16", "115,200", "0% — exact"],
            ["1 MHz", "9,600", "104", "9,615", "+0.16%"],
            ["50 MHz", "115,200", "434", "115,207", "+0.006%"],
            ["1 MHz", "115,200", "9", "111,111", "−3.5% — too coarse"],
          ],
          caption:
            "The last row is the one to learn from. A 1 MHz clock cannot divide cleanly into 115,200, so the closest it can get is already 3.5% off — past what a receiver will forgive. When you see a large error in this table, the answer is not to round differently. The answer is that this clock and this baud rate are a bad pairing.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why 1.8432 MHz shows up in the table",
          text: "1,843,200 ÷ 115,200 = exactly 16. That is not a coincidence: 1.8432 MHz is sixteen times the old 115,200 baud standard, and it is why so many serial parts of the last forty years are clocked at 1.8432 MHz or 3.6864 MHz. It is also the cheapest possible oversampling — sixteen ticks per bit — which is exactly what the receiver topic will need.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Your design runs at 50 MHz and must talk at 115,200 baud. Compute CLKS_PER_BIT = 50,000,000 ÷ 115,200. You should get 434.02, so use 434.",
            "Now check it: 50,000,000 ÷ 434 = 115,207 baud. Work out the percentage error and confirm it is under 0.01%.",
            "Do the same for 9600 baud at 50 MHz: 50,000,000 ÷ 9,600 = 5208.33, so 5208. Check the actual rate and the error.",
            "Do 115,200 baud at 1.8432 MHz and confirm you land on exactly 16, with zero error.",
            "Try to design a pairing that fails: 10 MHz at 115,200 gives 86.8, so 87. Work out the real baud and the error, and decide whether it is inside the couple of percent a receiver can absorb.",
            "Finally, for each CLKS_PER_BIT you computed, work out how wide a counter has to be to hold it. A counter of width w holds 0 to 2ʷ − 1, so find the smallest w that is at least as big as CLKS_PER_BIT. For 104 that is 7 bits, because 2⁶ = 64 is too small and 2⁷ = 128 is enough.",
          ],
        },
        {
          kind: "trap",
          wrong: "Treating the baud rate itself as the counter value, so the design counts 115,200 of its own clocks per bit on a 115,200 Hz clock.",
          right: "Always work in your own clock cycles. CLKS_PER_BIT = f_clk ÷ baud, and every count in the design uses that number.",
          why: "The counter and the wire live in different timebases. A counter that reaches 115,200 has counted 115,200 of your clocks, not 115,200 bit times, so the frame ends up wrong by however long your clock happens to be. The division is not bookkeeping you can do later — it is the link between your clock domain and the wire.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Your clock is 12 MHz and the agreed rate is 9,600 baud. How many clock cycles is one bit time?",
              a: "12,000,000 ÷ 9,600 = 1250, and it divides exactly, so the error is zero. A 12 MHz crystal with 9600 baud is one of the free pairings — the numbers were chosen together. 1250 also needs 11 bits of counter, since 2¹⁰ = 1024 is too small and 2¹¹ = 2048 is enough.",
            },
            {
              q: "You are at 115,200 baud on a 12 MHz clock and set CLKS_PER_BIT to 104 rather than 105. What goes wrong?",
              a: "Nothing obvious, and that is the trap. 104 gives an actual rate of 115,384 baud, a 0.16% error, which is inside tolerance and will work. 105 gives 114,285 baud, a −0.79% error, which is also usually fine. Both are defensible. What is not fine is picking 87 on a 10 MHz clock and getting −2.5%, because then you are relying on the receiver being kind. The lesson is to compute the error and know your margin, not to agonise over the last digit.",
            },
          ],
        },
      ],
    },
    {
      slug: "the-uart-frame",
      title: "The UART frame, field by field",
      lede: "The format in one picture, and then one byte written out bit by bit — which is the whole transmitter in your head.",
      blocks: [
        {
          kind: "para",
          text: "The frame is the same on every message, forever, and that is what makes a receiver possible. It has five fields, and each one earns its place.",
        },
        {
          kind: "code",
          caption:
            "A timing sketch, not Verilog. The line is a single pin; it is high or low, and the value changes only at the field boundaries.",
          code: `  tx line, sending 0x55 at 115200 baud, 8 data bits, no parity, 1 stop bit:

  ‾‾‾‾____‾‾‾‾____‾‾‾‾____‾‾‾‾____‾‾‾‾____‾‾‾‾
  idl str d0  d1  d2  d3  d4  d5  d6  d7  stop
      (1) 0   1   0   1   0   1   0   1   0    1

  one field = one bit time = CLKS_PER_BIT of your clock
  the whole frame is 10 bit times: 86.8 microseconds at 115200 baud`,
          note: "The high run at the far left is idle — the line at rest, not part of any frame, and it can last as long as you like. Then the line drops for exactly one bit time: the start bit. Then the eight data bits, least significant first. Then one bit time high: the stop bit, after which the line returns to idle.",
        },
        {
          kind: "table",
          head: ["Field", "Level", "How many bit times", "What it is for"],
          rows: [
            ["idle", "1 (high)", "as long as you like", "The resting state. A falling edge out of idle is the one thing a receiver can be certain means \"a byte is starting\"."],
            ["start", "0 (low)", "exactly 1", "The announcement. Its only job is to move the line away from its rest value so the other end notices a change at all."],
            ["data d0…d7", "your byte", "8", "The payload. Sent least significant bit first, so d0 is bit 0 of your byte, not bit 7."],
            ["parity (optional)", "0 or 1", "1, or none", "One extra bit that lets the receiver notice a single bit that flipped in transit."],
            ["stop", "1 (high)", "1 or 2", "The guaranteed-high gap that closes the frame and re-arms the receiver for the next one."],
          ],
          caption:
            "8N1 — the name on every serial terminal — is short for 8 data bits, No parity, 1 stop bit. Ten bit times per byte, always, whatever the payload is.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the line rests high, and why the start bit is low",
          text: "Two reasons, and both are about making a change visible. First, the rest value has to be a defined value, and in digital logic the defined idle of an open wire is high — a low means somebody is actively pulling the line down. Second, the start bit must be the opposite of the rest value, because a receiver cannot detect a level it is already sitting at; it can only detect a change. High to low is that change. That is the entire reason the start bit exists, and it is why every frame begins with a bit that contradicts the idle.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "The stop bit is not decoration",
          text: "It does two jobs. It ends the frame, which is obvious. It also guarantees a high period between bytes, which is what lets a receiver recover its phase for the next frame — and it is how a receiver learns it was out of step. A stop bit that comes back low is not a small problem: it means the receiver sampled the wrong part of the frame, and the receiver reports that as a framing error. Two stop bits give the line a longer high gap, which is useful on slow or noisy links where the sender and receiver have different ideas of the rate.",
        },
        {
          kind: "steps",
          title: "Write 0x55 on the wire, bit by bit",
          items: [
            {
              head: "Start with the byte in binary",
              body: "0x55 is 0101_0101. Confirm the decimal: 0 + 32 + 0 + 8 + 0 + 4 + 0 + 1 = 85, and 0x55 is 85. (0x means the number is written in hex, and 5 × 16 + 5 = 85.)",
            },
            {
              head: "Know which end goes first",
              body: "UART sends the least significant bit first. Bit 0 is the rightmost bit in 0101_0101, and it is a 1. So the first data bit on the wire is a 1, taken from the bottom of the byte, not the top.",
            },
            {
              head: "Read the byte bottom to top and write the bits in that order",
              body: "0101_0101 read from bit 0 upward is 1, 0, 1, 0, 1, 0, 1, 0. That is the data field in transmission order. Written left to right it looks like 1010_1010, which is the same bit sequence you would send for 0xAA most-significant-first — the confusion that trips up almost everyone, and which your loopback test will catch.",
            },
            {
              head: "Put the start bit in front",
              body: "The start bit is a 0. The stream so far is 0, 1, 0, 1, 0, 1, 0, 1, 0.",
            },
            {
              head: "Put the stop bit on the end",
              body: "The stop bit is a 1. The full frame, in time order, is ten bit times: 0, 1, 0, 1, 0, 1, 0, 1, 0, 1.",
            },
            {
              head: "Look at what you just wrote",
              body: "Because 0x55 is an alternating pattern, and the start and stop bits continue the alternation, the whole frame is a perfect 0101…01 with no gap anywhere. That is not a coincidence. 0x55 and 0xAA are the standard alternating test patterns, chosen precisely because a continuous waveform is the hardest case: a single bit lost in the middle of an alternating frame shows up immediately as a double-wide or zero-wide run, which is easy to spot on a scope. Quiet bytes like 0x00 make transitions rare, so timing bugs hide inside them.",
            },
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Write 0x55 as binary and confirm it is 85 in decimal by adding the place values.",
            "Write the data field for 0x55 in transmission order. Answer: 1, 0, 1, 0, 1, 0, 1, 0.",
            "Do the same for 0xA5 (1010_0101, which is 165). Read it from bit 0 up and write the ten-bit frame including start and stop. Your answer should be 0, then 1, 0, 1, 0, 0, 1, 0, 1, then 1.",
            "Do 0x00. The data field is eight zeros, so the frame is a 0 followed by eight more 0s and then a 1 — nine bit times of low. Ask yourself how a receiver could tell that run is nine long rather than eight. That question is the whole reason the stop bit and the framing error exist.",
            "Now the one that catches people: 0x55 sent least-significant-first gives 1, 0, 1, 0, 1, 0, 1, 0. Write that same sequence most-significant-first and convert it to hex. It is 0xAA. So if your transmitter shifts the wrong way, the receiver faithfully returns 0xAA every time, and the link looks alive while every byte is wrong.",
            "Count the bits. 8N1 is ten bit times per byte, so at 115,200 baud that is 10 ÷ 115,200 = 86.8 microseconds, about 11,500 bytes a second. At 9,600 baud it is 1,041.7 microseconds, so 960 bytes a second. Serial is slow next to a bus, and the framing overhead is part of why.",
          ],
        },
        {
          kind: "trap",
          wrong: "Sending the most significant bit first, because that is how you write the byte on paper.",
          right: "Send bit 0 first. The transmitter's job is `tx = shreg[0]; shreg = shreg >> 1;` — take the bottom bit, then shift the whole byte one place toward zero.",
          why: "The receiver does the mirror image: it shifts the incoming bit into the top of its register and slides everything down, which reverses the order. If the transmitter also reverses it, the two reversals cancel and the bytes come back reversed — 0x55 arrives as 0xAA. Nothing errors, the loopback test still sees traffic, and the bug ships. This is the single most common UART transmitter bug, and writing the ten bits on paper before you type anything is the cure.",
        },
        {
          kind: "check",
          items: [
            {
              q: "You are sending 0x3C with 8 data bits, no parity, one stop bit. List the ten bit values in time order.",
              a: "0x3C is 0011_1100. Reading from bit 0 upward: 0, 0, 1, 1, 1, 1, 0, 0. Add the start bit 0 in front and the stop bit 1 at the end: 0, 0, 0, 1, 1, 1, 1, 0, 0, 1. Ten values, and the first three are all 0 — which is fine, because once started the receiver counts bit times, it does not sit waiting for edges.",
            },
            {
              q: "Why is the start bit exactly one bit time and not two?",
              a: "Because its only job is to be a change from the idle level that lasts long enough to notice. One bit time is the agreed unit of time on this wire, so one bit time is the shortest interval both ends are guaranteed to agree about. Two start bits would work on a real link but would make every receiver wait twice as long for no gain, and the format is fixed for compatibility — the whole point is that both ends already know the answer without asking.",
            },
          ],
        },
      ],
    },
    {
      slug: "parity-bit",
      title: "The parity bit, and why designs skip it",
      lede: "One optional bit that catches some errors, and the honest reason almost nobody turns it on.",
      blocks: [
        {
          kind: "analogy",
          text: "You count the people in a room and say the number out loud, but you round it to say only whether it is even or odd. Later you count again. If the parity you computed from the number of heads you now count does not match, you know at least one head was missed or counted twice. You have not found the mistake and you cannot correct it, but you know to distrust the count. Parity is exactly that: a redundant bit whose only job is to disagree loudly.",
        },
        {
          kind: "define",
          items: [
            { term: "even parity", meaning: "The parity bit is chosen so the total number of 1s in the data plus the parity bit is even." },
            { term: "odd parity", meaning: "The parity bit is chosen so the total number of 1s is odd." },
            { term: "XOR reduction (`^`)", meaning: "XOR every bit together: 1 if an odd number of the bits are 1, 0 if an even number are." },
          ],
        },
        {
          kind: "para",
          text: "In Verilog the whole thing is one line, because XOR-reducing the byte already answers the only question you have. `^d` is 1 when the byte has an odd number of 1s in it, and that is precisely the bit you append to make the total even.",
        },
        {
          kind: "code",
          caption: "Parity in one line each, for 8-bit data.",
          code: `wire [7:0] d = 8'h55;   // 0101_0101 — four 1s, an even number

wire p_even = ^d;        // 0: four 1s is already even, so add a 0
wire p_odd  = ~^d;       // 1: four 1s is even, so odd parity adds a 1

// The receiver does the same thing and compares:
//   if (p_received !== (^dout)) error = 1;`,
          note: "No loop, no case statement, no counting. Reduction XOR is exactly the \"is the number of ones odd\" test, which is exactly the parity question. If you have not met the reduction operator it is worth two minutes in chapter 3 — it is the same `^` you already know, applied to a whole vector instead of a single bit.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "What parity catches, and the thing it cannot catch",
          text: "Parity detects any odd number of flipped bits: one, three, five. It cannot detect an even number. Two bits that flip leave the total count of 1s unchanged, so the parity check passes straight through. On a link where the most likely error is two bits flipping together, parity buys you almost nothing. And it detects but never corrects — the receiver knows the byte is wrong and throws it away, so the sender must resend. On a slow link that costs more than the error did.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Why every terminal program says 8N1",
          text: "Every serial terminal you have ever opened defaults to 8 data bits, no parity, 1 stop bit. Parity is a relic of the era of long unshielded RS-232 cable runs, where single-bit errors were common and a byte was cheap to resend. On a short modern link, CRC-checked layers above already do error detection far better, so parity is pure overhead. Know what it is, know it is one line of code, and leave it off. If a device you must talk to insists on it, 8E1 or 8O1 is how its datasheet will say so.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (5 minutes)",
          items: [
            "0x55 is 0101_0101. Count the 1s: four, which is even. So even parity is 0 and odd parity is 1.",
            "0x01 is 0000_0001. Count the 1s: one, which is odd. So even parity is 1 (making it two) and odd parity is 0.",
            "Now find the blind spot. 0x55 is 0101_0101 with four 1s, so its even parity bit is 0. Flip two of its data bits — bit 0 and bit 2, say — and you get 0101_0000, which still has two 1s, still even. The receiver computes an expected parity of 0, the bit that arrives is 0, and the check passes. Two bits went wrong and nothing reported it. That is the limitation, shown in three lines.",
            "Now the case parity does catch. Flip only bit 0 of 0101_0101 and you get 0101_0100, which has three 1s — an odd number. The receiver therefore expects an even parity bit of 1, but the 0 that was sent is still on the wire. The check fails and the single-bit error is caught. Odd numbers of errors are caught; even numbers are not.",
            "Last one: a receiver has detected a parity failure. It cannot correct it. Write down what it must do — raise an error, drop the byte — and then what that costs the link: a resend and a stall while the sender waits. That is the argument for leaving parity off.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Compute the even parity bit for 0xA5.",
              a: "0xA5 is 1010_0101. Count the 1s: four, which is even. So the even parity bit is 0, because adding a 0 keeps the total even. In Verilog that is `^8'hA5`, and it is 0. Note that 0xA5 and 0x55 both have four 1s and therefore share a parity bit, even though they are different bytes — parity is a weak check, and that is one visible reason why.",
            },
            {
              q: "A link needs odd parity and sends 0x00. What parity bit goes on the wire?",
              a: "0x00 is 0000_0000, which has zero 1s, and zero is even. Odd parity means the total must be odd, so the parity bit is 1 — which is what `~^d` gives you for a zero byte. A receiver checking that byte computes `^dout` (0 for all zeros) and compares it against the received bit (1), sees a mismatch, and reports a parity error. That is the correct outcome: an all-zeros byte arriving with a zero parity bit is a byte that went through a parity scheme that disagrees with yours.",
            },
          ],
        },
      ],
    },
    {
      slug: "bit-time-counter",
      title: "The bit-time counter",
      lede: "How a fast clock becomes one pulse per bit, and the parameter that sizes the whole design.",
      blocks: [
        {
          kind: "analogy",
          text: "A metronome clicking far too fast for the music. You do not throw the metronome away; you adjust it so it clicks once per bar, and then everybody in the room can rely on one click per bar. The bit-time counter is that adjustment. Your clock is a metronome clicking 50 million times a second. The counter makes it click 115,200 times a second, once per bit, and that click is the heartbeat the rest of the design follows.",
        },
        {
          kind: "para",
          text: "The mechanism is the reload counter you met in chapter 9, with one change: instead of wrapping at 255, it wraps at a number you choose. Count up from 0. When you reach CLKS_PER_BIT − 1, go back to 0 and emit a one-cycle pulse. Counting 0, 1, 2, … CLKS_PER_BIT − 1 is exactly CLKS_PER_BIT clock cycles, which is exactly one bit time, so the pulse rate is CLKS_PER_BIT times slower than the clock. That is the gearbox, and it is three lines of code.",
        },
        {
          kind: "code",
          caption:
            "The baud generator. One clock-wide pulse per bit time, sized from a parameter you set from CLKS_PER_BIT.",
          code: `module baud_gen #(
  parameter CW = 7,              // counter width: must hold CLKS_PER_BIT-1
  parameter CLKS_PER_BIT = 104    // clocks in one bit time, from the division
) (
  input  wire clk,
  input  wire rst,
  output reg  baud_en            // 1 for exactly one clock, once per bit time
);
  localparam CWm1 = CLKS_PER_BIT - 1;   // count 0 .. CLKS_PER_BIT-1 inclusive

  reg [CW-1:0] cnt;

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      cnt     <= {CW{1'b0}};
      baud_en <= 1'b0;
    end else begin
      // The pulse is one clock wide: high only on the wrap cycle.
      baud_en <= (cnt == CWm1);
      // The reload: at the top, go back to zero instead of counting on.
      cnt     <= (cnt == CWm1) ? {CW{1'b0}} : (cnt + 1'b1);
    end
  end
endmodule`,
          note: "Two things to notice. `baud_en` is high for exactly one clock cycle, not one bit — deliberately, because everything downstream is clocked on `clk` and cannot see a wide pulse. And the counter reloads at CLKS_PER_BIT − 1, not CLKS_PER_BIT: counting 0 through N inclusive is N + 1 cycles, so the − 1 is what makes the total exactly CLKS_PER_BIT.",
        },
        {
          kind: "points",
          title: "The three numbers that define the whole design",
          items: [
            "CLKS_PER_BIT — how many of your clocks make one bit time. One division, done on paper before any code is written.",
            "CW — how many bits wide the counter has to be. It must hold CLKS_PER_BIT − 1, so 2ʷ must be at least as big as CLKS_PER_BIT.",
            "baud_en — the output. Everything else in this chapter is a counter waiting on this pulse.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "The width parameter, in Verilog-2001 and in SystemVerilog",
          text: "In this chapter's dialect you choose CW by hand: for CLKS_PER_BIT = 104 you need CW = 7, because 2⁶ = 64 is too small and 2⁷ = 128 is enough. From chapter 15 the language gives you a function for exactly this — `parameter CW = $clog2(CLKS_PER_BIT);` — which computes the smallest width that holds the value. If you have been wondering why this chapter is in Verilog-2001 rather than SystemVerilog, this is one of the reasons: the older dialect makes you do the arithmetic yourself, and the arithmetic is the point.",
        },
        {
          kind: "trap",
          wrong: "Setting CW too small for the value — for example CW = 6 with CLKS_PER_BIT = 104.",
          right: "CW must be large enough to hold CLKS_PER_BIT − 1. For 104 that means 7 bits. Check it with the 2ʷ rule before you simulate anything.",
          why: "A 6-bit counter tops out at 63, so `cnt == CWm1` compares against 103 and is never true. The counter counts 0 to 63, wraps, and counts again — perfectly healthy, and completely wrong. baud_en never pulses, so the frame never advances and the wire sits at idle forever. There is no error message, because the code is perfectly valid and only the arithmetic is wrong. This is the width problem from chapter 1 in a new costume, and the reason every parameter in this track carries its width next to it.",
        },
        {
          kind: "trap",
          wrong: "Reloading at CLKS_PER_BIT instead of CLKS_PER_BIT − 1.",
          right: "Compare against `CLKS_PER_BIT - 1`, so that counting 0 through the top value is exactly CLKS_PER_BIT cycles.",
          why: "Counting 0, 1, … CLKS_PER_BIT is CLKS_PER_BIT + 1 cycles, so every bit time is one clock too long. At CLKS_PER_BIT = 104 that is a 1% baud error — inside tolerance, and therefore the worst kind of bug. Your loopback passes, your bench test passes, and the link is quietly 1% off forever. This one you get right on paper, where you can see the count.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Your clock is 50 MHz and you are running at 9,600 baud. What are CLKS_PER_BIT and CW?",
              a: "50,000,000 ÷ 9,600 = 5208.33, so CLKS_PER_BIT = 5208 and the actual rate is 9,601.5 baud, an error of +0.016%. For the width, 2¹² = 4096 is too small and 2¹³ = 8192 is enough, so CW = 13. Check the counter can reach its compare value: it must hold 5207, and 8191 is the most a 13-bit counter can hold, so it can.",
            },
            {
              q: "baud_en is one clock wide. Why can it not be one bit time wide?",
              a: "Because everything after it is clocked on clk — the transmitter's shift register, the receiver's sample counter. Logic driven by clk can only react to a signal that changed within a clock period. A signal that stays high for a whole bit time looks to a flip-flop like a signal that stopped changing, so a level test on it would catch the transition once and then miss the falling edge. A one-clock pulse is unambiguous: the receiver sees low, high, low again, and cannot miss it.",
            },
          ],
        },
      ],
    },
    {
      slug: "uart-transmitter",
      title: "The transmitter: a frame built one tick at a time",
      lede: "A state machine, two states, and the same FSM discipline you learned in chapter 11.",
      blocks: [
        {
          kind: "para",
          text: "The transmitter has one job: hold the line high until asked to send, then walk the frame out one bit per pulse from baud_en. That is a two-state machine — IDLE and SEND — and this is where chapter 11 pays off. Chapter 11's rule was that a state machine needs three things: named states, a case that covers every one of them, and a default branch so a bad state lands somewhere safe instead of turning into an x. All three apply here, word for word. What is new is only that one of the inputs decides when time passes.",
        },
        {
          kind: "table",
          head: ["State", "What it means", "What it does", "How it leaves"],
          rows: [
            ["IDLE", "The wire is at rest and no frame is in flight.", "Drives the line high. busy is low.", "Leaves on a tx_en pulse: load the byte, pull the line low for the start bit, go to SEND."],
            ["SEND", "A frame is on the wire.", "On each baud_en, shifts the next data bit out, or raises the stop bit at the end.", "Leaves to IDLE after putting the stop bit out."],
          ],
          caption:
            "Two states is a small machine, and small machines are easy to reason about. Before you write it, say these two sentences in your own words. If you cannot, the code will not work.",
        },
        {
          kind: "code",
          caption:
            "The transmitter, in Verilog-2001. Compare it with the state table above, line by line.",
          code: `module uart_tx (
  input  wire       clk,
  input  wire       rst,
  input  wire       baud_en,   // one pulse per bit time, from baud_gen
  input  wire       tx_en,     // caller says "send this byte now"
  input  wire [7:0] d,         // the byte to send
  output reg        tx,        // the serial wire itself
  output reg        busy       // high while a frame is on the wire
);
  localparam IDLE = 1'b0;
  localparam SEND = 1'b1;

  reg       st;         // the state
  reg [7:0] shreg;      // the byte, being shifted out
  reg [3:0] bitcnt;     // which data bit we are on, 0 to 8

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      st     <= IDLE;
      tx     <= 1'b1;      // idle HIGH — this is the contract with the receiver
      busy   <= 1'b0;
      shreg  <= 8'h00;
      bitcnt <= 4'd0;
    end else begin
      case (st)
        IDLE: begin
          tx   <= 1'b1;
          busy <= 1'b0;
          if (tx_en) begin
            st     <= SEND;
            busy   <= 1'b1;
            shreg  <= d;      // copy the byte in; d may change afterwards
            bitcnt <= 4'd0;
            tx     <= 1'b0;   // start bit begins on this very edge
          end
        end

        // Time only passes when baud_en says a bit time has gone by.
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1;        // stop bit
            st <= IDLE;        // frame over, back to rest
          end else begin
            tx     <= shreg[0];    // LSb first: take the bottom bit
            shreg  <= shreg >> 1;  // then shift it out of the way
            bitcnt <= bitcnt + 1'b1;
          end
        end

        default: st <= IDLE;   // a bad state lands somewhere safe
      endcase
    end
  end
endmodule`,
          note: "Four details carry the whole design. tx resets to 1, not 0, because the idle value is high — a transmitter that came out of reset driving low would look like a permanent start bit to every receiver on the wire. The start bit is asserted in the same cycle the byte is loaded, so the frame is ten bit times and not eleven. The shift happens on baud_en, not on every clock, which is the gearbox showing through. And the default branch is chapter 11's rule, kept.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Reset to high, not low",
          text: "This is the mistake that produces a mystery. If tx resets to 0, then from power-on until the first frame the line sits low, which looks exactly like a start bit to any receiver. The receiver dutifully waits half a bit, samples, finds a stop bit that is also low, and raises a framing error on a wire nobody has spoken on. The rule is general for this chapter: anything on the wire resets to that wire's idle level, which is high.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Chapter 11's two paragraphs still apply",
          text: "Chapter 11 split a state machine into one combinational paragraph that answers \"where do I go and what do I emit\", and one clocked paragraph that answers \"save it\". The lesson's transmitter folds both into a single clocked case, which is fine and common for a two-state machine — and it has the pleasant side effect that every output change sits right next to the baud_en that caused it. The two-paragraph split works identically, and it is worth seeing once, because the default value you choose there is the same idea the default branch encodes here.",
        },
        {
          kind: "code",
          caption:
            "The same transmitter, written in chapter 11's two-paragraph form. Compare the two defaults at the top of the combinational block with the default branch in the single-block version.",
          code: `  // Paragraph 1: combinational. Where do I go, and what does the wire do?
  reg next_st;
  reg next_tx;
  always @(*) begin
    next_st = IDLE;    // safe default: always land somewhere legal
    next_tx = tx;      // safe default: the wire HOLDS unless told otherwise
    case (st)
      IDLE: begin
        next_tx = 1'b1;
        if (tx_en) begin next_st = SEND; next_tx = 1'b0; end
      end
      SEND: if (baud_en) begin
        if (bitcnt == 4'd8) begin next_st = IDLE; next_tx = 1'b1; end
        else                 next_tx = shreg[0];
      end
      default: begin next_st = IDLE; next_tx = tx; end
    endcase
  end

  // Paragraph 2: clocked. Save it, on the edge.
  always @(posedge clk or posedge rst) begin
    if (rst) begin st <= IDLE; tx <= 1'b1; end
    else begin st <= next_st; tx <= next_tx; end
  end`,
          note: "Blocking = in the combinational paragraph, nonblocking <= in the clocked one — the rule from chapter 11, unchanged. And note the two defaults: `next_st = IDLE` is the default branch written once at the top, and `next_tx = tx` is the \"assign it in every branch\" rule from chapter 1. Had you written `next_tx = 1'b0` as the default, Verilator would report a LATCH and the hardware would be wrong — because on a data bit that is a 0, the wire must hold low, not jump to 1.",
        },
        {
          kind: "para",
          text: "The last piece is the handshake, and it is what makes the transmitter usable by something else. A tx_en pulse is a request. If you pulse it while the transmitter is mid-frame, the byte is silently dropped, because in the SEND state nothing is looking at tx_en. So the module publishes busy, and the rule for the caller is one sentence: do not assert tx_en while busy is high. That is a handshake — an output that tells the world when this module is ready to be spoken to. The read ports you built in chapter 13 worked the same way.",
        },
        {
          kind: "table",
          head: ["Signal", "Direction", "Meaning"],
          rows: [
            ["tx_en", "in", "One-cycle pulse. Means \"send the byte in d on the next clock edge\"."],
            ["d", "in", "The byte to send. Only read on the edge where tx_en is high, so it may change freely after that."],
            ["busy", "out", "High from the moment a frame starts until the stop bit is out. The caller must not send again while it is high."],
            ["tx", "out", "The wire. High when idle, a valid frame in progress otherwise."],
          ],
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Draw the state diagram for this transmitter: two boxes, IDLE and SEND, one arrow each way, labelled with what causes the transition. Do this before you type anything.",
            "Trace the byte 0x55 through it. Write the value of tx after each baud_en, and confirm you get ten bit times: 0 for the start, then 1, 0, 1, 0, 1, 0, 1, 0, then 1 for the stop.",
            "Work out how many baud_en pulses one frame consumes and confirm it is ten. Then, with CLKS_PER_BIT = 104 on a 12 MHz clock, the frame takes 10 × 104 = 1040 clocks, which is 86.7 microseconds. Compare that with the ideal 10 ÷ 115,200 = 86.8 microseconds: the two agree to 0.16%, which is your rounding error showing up as a number you can measure on a scope.",
            "Now count the bug that matters: how many cycles is busy high? It rises on the edge that loads the byte and falls on the edge after the stop bit. Compare that against the ten baud_en pulses and confirm the caller's \"do not send\" window covers the whole frame.",
            "Finally, write the one line you would put in a caller module to send a byte safely: `if (!busy) tx_en <= 1'b1;`. Ask yourself why it must be a nonblocking assignment inside a clocked block, and what would go wrong if you wrote a bare `tx_en = 1'b1;` in module scope instead.",
          ],
        },
        {
          kind: "trap",
          wrong: "Calling the data input tx_en and also using tx_en as the handshake that says \"go\".",
          right: "One name, one meaning. Name the data tx_data (or d) and the handshake tx_en (or tx_valid), so that every line mentioning tx_en is unambiguously about permission to send.",
          why: "Two meanings behind one identifier means the next reader — and you, an hour later — cannot tell which is which from the code. No tool will catch this; it is a bug that costs an afternoon. The habit to build is that a name says what the signal is. The port list of this module is a fair model: tx is the wire, tx_en is permission, d is the payload.",
        },
        {
          kind: "check",
          items: [
            {
              q: "Why does the transmitter start the frame on a clock edge rather than waiting for the next baud_en?",
              a: "Because the caller's request does not wait for a bit boundary. If the transmitter waited for the next baud_en, the start bit could begin almost a full bit time after tx_en went high. Starting immediately on the clock edge means the frame is exactly ten bit times long and starts the instant the caller asked, and it means the caller's data does not have to be held for an unknown extra wait. The one cost is that the first bit time is a partial one from the caller's point of view, which is harmless because nobody is timing the sender.",
            },
            {
              q: "A tester says \"the line goes low for about a microsecond after reset, then everything works fine\". What is wrong?",
              a: "tx is resetting to 0 instead of 1. The low period after reset is the transmitter wrongly holding the idle line at the start-bit level, and any receiver would read it as a start bit with a low stop bit — a framing error, on a wire that should be silent. The fix is in the reset branch: `tx <= 1'b1;`. The general rule for this chapter is that everything connected to a wire resets to that wire's idle level.",
            },
          ],
        },
      ],
    },
    {
      slug: "uart-receiver",
      title: "The receiver: finding the middle of every bit",
      lede: "Why the sample point is the middle, how to get there, and why this half of the design is the harder half.",
      blocks: [
        {
          kind: "para",
          text: "The receiver is the mirror of the transmitter, and it is meaningfully harder, for one reason: it has no idea when a byte starts. The transmitter decides that. The receiver only has a pin that is high, then suddenly low, and has to work out from that alone when to look. Everything in this topic answers one question — when exactly should I trust this wire? — and getting the answer wrong produces wrong bytes rather than an error.",
        },
        {
          kind: "analogy",
          text: "Someone reads a clock face out loud to you. Reading it at the instant the hand clicks from one number to the next is hopeless: at that instant the hand is between two numbers, and a moment of noise flips your answer. Reading it in the middle of each number's dwell, when the hand is parked and clearly pointing, is easy. That is the whole idea — sample in the middle, not on the edge. A UART receiver samples the middle of the start bit, then one bit time later the middle of the first data bit, and so on to the end of the frame.",
        },
        {
          kind: "points",
          title: "Why the middle, and not the edge",
          items: [
            "Right at a transition the line is genuinely changing. It has to pass through voltages that are neither a clean 0 nor a clean 1, and a moment of noise during that pass is enough to be read as the new value instead of the old one.",
            "Timing is never exact. The two boards have different crystals, so the sender's bit time and the receiver's bit time differ slightly. Over a ten-bit frame that difference accumulates, and the last data bit gets sampled tens of microseconds away from where it was meant to be.",
            "The middle gives the largest margin. Sampling at the centre of a bit gives you half a bit time of slack in each direction before a sample could land near an edge. That slack is what absorbs the baud mismatch, the propagation delay through the cable, and the skew between the two clocks.",
          ],
        },
        {
          kind: "steps",
          title: "Getting to the middle: the half-bit wait and the re-zero",
          items: [
            {
              head: "Wait for the line to go low",
              body: "While the line is high, nothing is happening. The instant it drops is the start of the start bit. But do not sample yet — that is the transition moment, the worst possible instant.",
            },
            {
              head: "Load a counter with half a bit time and count it down",
              body: "Half a bit time is CLKS_PER_BIT ÷ 2 clock cycles. Loading the counter with HALF − 1 and counting down brings you to the middle of the start bit. This is the re-zero step, and it is why the receiver has its own counter rather than sharing the transmitter's pulse: the transmitter's bit times have no relationship to when this particular frame started.",
            },
            {
              head: "Now sample once per bit time, eight times",
              body: "Reload with FULL − 1 and count down again. Each expiry is the middle of the next bit. The first expiry after the start bit's middle is the middle of d0, the next is d1, and after eight you have all eight bits.",
            },
            {
              head: "Shift each sampled bit in from the top",
              body: "`shreg <= {rx, shreg[7:1]}` puts the newest bit at bit 7 and slides everything down. Because the newest bit arrived first but sits at the top, the last bit to arrive ends up at the bottom — which is where bit 0 belongs. The reversal the transmitter performed is undone for free. This is the same trick in reverse, and it is why the transmitter must send LSb first.",
            },
            {
              head: "Check the stop bit, then hand the byte over",
              body: "One more bit time puts you in the middle of the stop bit. It must be high. If it is low, the receiver was out of step, so raise a framing error. Either way, publish the byte on rdy and go back to IDLE to look for the next frame.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "why",
          title: "The − 1 and the + 1 that real designs get right",
          text: "Look at the reload values in the code below: HALF - 1 and FULL - 1. The reason is that a counter which counts 0, 1, … N inclusive takes N + 1 cycles, not N, so loading N − 1 makes the total exactly N cycles. Miss this and every bit time is one clock too long — a 1% baud error at CLKS_PER_BIT = 104, which is inside tolerance and therefore invisible, and which leaves your link subtly wrong forever. The companion subtlety is on the far side of the start bit: the first data sample must be one full bit time after the start sample, not zero, so the counter is reloaded with FULL − 1 at the moment the half-bit wait ends. Write both numbers on paper before you type either one.",
        },
        {
          kind: "code",
          caption:
            "The receiver, in Verilog-2001. It re-zeroes its own counter on the detected start bit, and that is the whole trick.",
          code: `module uart_rx #(
  parameter CW   = 8,     // counter width; must hold FULL-1
  parameter HALF = 52,    // clocks in HALF a bit time  (CLKS_PER_BIT / 2)
  parameter FULL = 104    // clocks in one bit time      (CLKS_PER_BIT)
) (
  input  wire       clk,
  input  wire       rst,
  input  wire       rx,    // already through the synchroniser
  output reg  [7:0] dout, // the recovered byte
  output reg        rdy,   // 1-cycle pulse: dout is fresh
  output reg        ferr   // 1-cycle pulse: stop bit was not high
);
  localparam [1:0] IDLE  = 2'd0;
  localparam [1:0] START = 2'd1;
  localparam [1:0] BITS  = 2'd2;
  localparam [1:0] STOP  = 2'd3;

  reg [1:0] st;
  reg [7:0] shreg;
  reg [2:0] nbits;
  reg [CW-1:0] cnt;

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      st    <= IDLE;
      rdy   <= 1'b0;
      ferr  <= 1'b0;
      dout  <= 8'h00;
      shreg <= 8'h00;
      nbits <= 3'd0;
      cnt   <= {CW{1'b0}};
    end else begin
      rdy  <= 1'b0;    // both flags are one-cycle pulses: default is off
      ferr <= 1'b0;
      case (st)
        IDLE: begin
          if (rx == 1'b0) begin
            st  <= START;
            cnt <= HALF - 1;   // re-zero: half a bit time to mid-start
          end
        end

        START: if (cnt == 0) begin
          st    <= BITS;        // we are now in the MIDDLE of the start bit
          nbits <= 3'd0;
          cnt   <= FULL - 1;    // one full bit time between samples
        end else cnt <= cnt - 1'b1;

        BITS: if (cnt == 0) begin
          shreg <= {rx, shreg[7:1]};   // MSb in at the top reverses the order
          cnt   <= FULL - 1;
          if (nbits == 3'd7) st <= STOP;
          else               nbits <= nbits + 1'b1;
        end else cnt <= cnt - 1'b1;

        STOP: if (cnt == 0) begin
          ferr <= ~rx;          // the stop bit must be HIGH
          dout <= shreg;        // all eight bits have landed by now
          rdy  <= 1'b1;
          st   <= IDLE;         // ready for the next frame
        end else cnt <= cnt - 1'b1;

        default: st <= IDLE;    // chapter 11's safe landing
      endcase
    end
  end
endmodule`,
          note: "Four states, because there are four jobs: watch for a start, centre on the start bit, collect eight data bits, then check the stop bit. The `cnt == 0` tests are the mid-bit points. The `nbits == 3'd7` test is what sends the machine to STOP after the eighth bit — get that off-by-one wrong and you either drop a bit or shift the stop bit into the data, and both show up as a value that is one bit off.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "One baud_en for both halves — because they share a clock",
          text: "The pset bench drives a single `baud_en` input, and inside the design it fans out to the transmitter and the receiver together. That sharing is sound here, and only here: both halves sit on the same clock, so a pulse that is one bit time for the transmitter is one bit time for the receiver too — and the receiver still aligns every frame to the start edge it detected, because the first pulse after the edge only moves START to BITS and sampling starts one pulse later. Do not carry this habit across a wire: two boards share no pulse, so there the receiver must re-zero its own counter from the edge, which is the HALF/FULL design above. Shared enable on one timebase; self-timed counting across two.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Oversampling: what a real UART part does",
          text: "A 1 MHz clock cannot cleanly count halves, so real receivers run a much faster tick — 8 ticks per bit, or classically 16 — and count ticks rather than clocks. Sixteen ticks per bit is exactly the 1.8432 MHz case from the baud table, which is why that number is on every old serial part. Three things improve. A glitch shorter than half a bit no longer looks like a start bit, because the receiver only commits once the low level has been confirmed at the midpoint. The sample point can be nudged into the second half of each bit, buying a few more percent of margin against the last bit drifting late. And sixteen samples per bit is enough to take a majority vote instead of trusting one instant. None of that is needed to pass the pset, and all of it is why a real UART receiver is a bigger design than a real UART transmitter.",
        },
        {
          kind: "code",
          caption:
            "The synchroniser from chapter 8, applied to the incoming line. Six lines, and it was already in your toolkit.",
          code: `module sync2 (
  input  wire clk,
  input  wire rst,
  input  wire async_in,   // the raw wire, from outside the chip
  output wire sync_out    // safe to read inside this clock domain
);
  reg meta;    // first flop: may still be settling
  reg sync;    // second flop: by now the value has settled

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      // Reset to IDLE, not to zero. A UART line rests high, and a
      // receiver that comes out of reset reading 0 sees a start bit
      // that nobody sent.
      meta <= 1'b1;
      sync <= 1'b1;
    end else begin
      meta <= async_in;   // follow, decide nothing yet
      sync <= meta;       // this one is safe to trust
    end
  end

  assign sync_out = sync;
endmodule`,
          note: "You built this in chapter 8 and it has not changed. The serial line is an asynchronous input like any other — it changes at times that have nothing to do with your clock — so it goes through two flops before any logic reads it. Metastability, the one exception where a flip-flop can briefly hold a value between 0 and 1, is real, and it is what the first flop is there to absorb; the second gets a full clock period to become a clean 0 or 1. Two flops do not prevent metastability, they make the chance of reading a bad value small enough to ignore. The one thing that is new here is the reset value, and the reasoning for it is the comment inside.",
        },
        {
          kind: "callout",
          tone: "why",
          title: "Why the receiver is the harder half, in one paragraph",
          text: "The transmitter owns its own timing: it decides when a bit starts and holds the line steady for the whole bit time. The receiver owns none of that. It has to notice an event it was not told about, recover the phase of a clock it does not share, refuse to be fooled by a glitch that happens to look like a start bit, land its samples in the middle of every bit, recover from being out of step instead of silently returning wrong bytes, and do all of it on a pin that arrives from outside the chip and needs a synchroniser first. Four states, a down-counter, and a synchroniser — each of those is doing one of those jobs.",
        },
        {
          kind: "doThis",
          title: "Do this on paper (10 minutes)",
          items: [
            "Draw a timeline. Put the start bit from t = 0 to t = 1 bit time and mark where you sample. Confirm the sample lands at t = 0.5 bit times, the middle of the start bit.",
            "Continue the timeline for the whole frame. With HALF = 52 and FULL = 104, the samples land at 52, 156, 260, 364, 468, 572, 676, 780 and 884 clocks after the edge. Divide each by 104 and confirm they sit at 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5 and 8.5 bit times — the middles of start, d0 through d7, and stop.",
            "Now write down the value of shreg after each of the eight samples while receiving 0x55. After d0 = 1: 1000_0000. After d1 = 0: 0100_0000. After d2 = 1: 1010_0000. After d3 = 0: 0101_0000. After d4 = 1: 1010_1000. After d5 = 0: 0101_0100. After d6 = 1: 1010_1010. After d7 = 0: 0101_0101. The last one is 0x55 back again, and the reversal worked.",
            "Count the state transitions. IDLE to START on the low level, START to BITS after half a bit, eight expiries inside BITS, BITS to STOP, then one expiry in STOP. Ask which expiry publishes the byte — it is the STOP one, and it is a full bit time after the eighth data sample, which is exactly why `dout <= shreg` has all eight bits available by then.",
            "Find the failure case. Suppose the line glitches low for 20 clocks while the receiver sits in IDLE. Trace it: the receiver leaves IDLE and starts a half-bit count; by the time the count expires the line is high again, so it samples a 1 as though it were d0 and carries on in step — producing garbage with a valid-looking stop bit and no error at all. Write down the fix. A real design confirms the line is still low at the midpoint before committing, and that is the first thing oversampling buys you.",
          ],
        },
        {
          kind: "trap",
          wrong: "Sampling the data bits on the same free-running baud_en pulses you gave the transmitter, or sampling at the instant the line changes.",
          right: "Re-zero a counter on the detected start bit, wait half a bit time, then sample once per full bit time — from the middle of each bit.",
          why: "A free-running enable has no relationship to this frame's start, so the sample can land anywhere from just after the edge to just before the next one. And sampling at a transition is sampling the one instant the value is not settled. Both bugs produce bytes that are nearly right, which is the worst possible symptom: no framing error, no lint message, and a link that fails intermittently on a long cable. If loopback passes and real hardware is unreliable, this is the first thing to check.",
        },
        {
          kind: "check",
          items: [
            {
              q: "A receiver samples the stop bit and it is low. What has happened, and what should the module do?",
              a: "The stop bit is defined to be high, so a low means the receiver lost its place. The usual causes are that it started counting from a glitch that looked like a start bit, or that the two ends disagree about the rate badly enough that the last sample drifted off the end of the frame. The receiver raises its framing-error flag, publishes whatever it has, and returns to IDLE so it can look for the next frame. It must not sit in a bad state, and it must not report a valid byte quietly — a framing error the caller can see is worth far more than a plausible wrong answer.",
            },
            {
              q: "Why does rdy pulse for one cycle instead of staying high?",
              a: "Because dout holds the byte until the next frame arrives, so a level-high rdy would tell the caller the same byte was fresh forever. A one-cycle pulse is the standard handshake for \"something changed, go and look\" — the same pattern as ferr and the same idea as the transmitter's busy. The rule for every flag in this chapter: either it is a pulse, or it is a level that stays true while the condition holds, and you must be deliberate about which one you mean.",
            },
            {
              q: "With CLKS_PER_BIT = 104, HALF comes out as 52. Why can the receiver not simply use `FULL >> 1`?",
              a: "It can, and for an even CLKS_PER_BIT the two are identical — 104 >> 1 is 52. The question only bites for an odd one: 105 >> 1 is 52, which is 51.97 rounded down, so the sample lands a fraction of a clock early. That is harmless in practice, but real designs define HALF as its own parameter so the choice is explicit rather than an accident of a shift operator. Writing the two numbers down separately, as in the parameter list above, is the habit worth keeping.",
            },
          ],
        },
      ],
    },
    {
      slug: "loopback",
      title: "Loopback: wiring the two halves together",
      lede: "The pset. Connect the transmitter's pin to the receiver's pin and prove every byte survives the round trip.",
      blocks: [
        {
          kind: "para",
          text: "Loopback is the simplest possible end-to-end test, and it is the right first move for anything with a protocol. Take the transmitter's output pin and connect it to the receiver's input pin. There is no wire to another board, no clock mismatch and no noise — and yet the byte has to survive being serialised, shifted out least significant bit first, counted, sampled in the middle of each bit, shifted back in, and read out. If the byte that comes out the far end is not the byte that went in, something in that chain is wrong, and the round trip has narrowed the search from six blocks to one.",
        },
        {
          kind: "code",
          caption:
            "The loopback, complete: the fixed transmitter, the fixed receiver, and one shared baud_en.",
          code: `module uart_tx (
  input  wire       clk,
  input  wire       rst,
  input  wire       baud_en,   // one pulse per bit time, shared with the receiver
  input  wire       tx_en,
  input  wire [7:0] d,         // the byte to send
  output reg        tx,        // the serial wire itself
  output reg        busy       // high while a frame is on the wire
);
  localparam IDLE = 1'b0;
  localparam SEND = 1'b1;

  reg       st;
  reg [7:0] shreg;
  reg [3:0] bitcnt;

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      st     <= IDLE;
      tx     <= 1'b1;      // idle HIGH — this is the contract with the receiver
      busy   <= 1'b0;
      shreg  <= 8'h00;
      bitcnt <= 4'd0;
    end else begin
      case (st)
        IDLE: begin
          tx   <= 1'b1;
          busy <= 1'b0;
          if (tx_en) begin
            st     <= SEND;
            busy   <= 1'b1;
            shreg  <= d;
            bitcnt <= 4'd0;
            tx     <= 1'b0;   // start bit begins on this very edge
          end
        end
        SEND: if (baud_en) begin
          if (bitcnt == 4'd8) begin
            tx <= 1'b1;        // stop bit
            st <= IDLE;
          end else begin
            tx     <= shreg[0];    // LSb first: take the bottom bit
            shreg  <= shreg >> 1;
            bitcnt <= bitcnt + 1'b1;
          end
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule

module uart_rx (
  input  wire       clk,
  input  wire       rst,
  input  wire       baud_en,   // the SAME pulse the transmitter steps on
  input  wire       rx,
  output reg  [7:0] dout,
  output reg        ferr,
  output reg        rdy
);
  localparam [1:0] IDLE  = 2'd0,
                   START = 2'd1,
                   BITS  = 2'd2,
                   STOP  = 2'd3;

  reg [1:0] st;
  reg [3:0] bitcnt;
  reg [7:0] shreg;

  always @(posedge clk or posedge rst) begin
    if (rst) begin
      st     <= IDLE;
      rdy    <= 1'b0;
      ferr   <= 1'b0;
      dout   <= 8'h00;
      shreg  <= 8'h00;
      bitcnt <= 4'd0;
    end else begin
      rdy <= 1'b0;
      case (st)
        IDLE: begin
          ferr <= 1'b0;
          if (!rx) st <= START;
        end
        START: if (baud_en) begin
          st <= BITS;
          bitcnt <= 4'd0;
        end
        BITS: if (baud_en) begin
          shreg  <= {rx, shreg[7:1]};   // newest bit enters at the top
          bitcnt <= bitcnt + 4'd1;
          if (bitcnt == 4'd7) st <= STOP;
        end
        STOP: if (baud_en) begin
          ferr <= ~rx;
          rdy  <= 1'b1;
          dout <= shreg;
          st   <= IDLE;
        end
        default: st <= IDLE;
      endcase
    end
  end
endmodule

module top (
  input  wire       clk,
  input  wire       rst,
  input  wire       baud_en,   // single bit-time pulse, fanned out to TX and RX
  input  wire       tx_en,
  input  wire [7:0] d_in,
  output wire       tx,
  output wire       busy,
  output wire [7:0] d_out,
  output wire       rdy,
  output wire       ferr
);
  wire tx_line;   // the whole serial link: the TX pin wired straight to the RX pin

  uart_tx tx_inst (clk, rst, baud_en, tx_en, d_in, tx_line, busy);
  uart_rx rx_inst (clk, rst, baud_en, tx_line, d_out, ferr, rdy);

  assign tx = tx_line;   // the wire, brought out so a scope can see it
endmodule`,
          note: "One `baud_en` in, two consumers: the port fans out to `tx_inst` and `rx_inst` together, which is exactly how the pset bench drives it. The submodules are the lesson's `uart_tx`/`uart_rx` — same names, same ports as the lesson benches — with the two one-line fixes applied: `tx <= shreg[0]` with `shreg >> 1` on the way out, `shreg <= {rx, shreg[7:1]}` on the way in. The synchroniser is deliberately absent: in a loopback there is no external wire, so the signal is already in this clock domain. The moment you connect a real pin to another board, sync2 goes between that pin and the receiver.",
        },
        {
          kind: "callout",
          tone: "warn",
          title: "One timing source, or the loopback lies to you",
          text: "Drive both halves from the same timing. If the transmitter's bit-time counter and the receiver's sample counter are configured differently — HALF and FULL out of step, or the transmitter running off a free-running baud_en while the receiver re-zeroes itself — the loopback still produces something on the wire, and a test that only checks \"did a byte come back\" will pass while the timing is wrong. The loopback's job is byte integrity: send a known value, get the same value back, and check it every single time.",
        },
        {
          kind: "doThis",
          title: "The byte-integrity self-test, worked out before you type it",
          items: [
            "Choose the test bytes. Send 0x00, 0xFF, 0x55, 0xAA, 0x01, 0x80, then a run of counting values from 0x00 to 0xFF. Ask yourself which of these would fail if your transmitter had the bit order reversed: 0x00 and 0xFF would come back correct, because they are symmetric. A test that only uses 0x00 and 0xFF is worse than no test at all.",
            "Work out the wire contents of 0xAA by hand. 0xAA is 1010_1010, so least-significant-first it is 0, 1, 0, 1, 0, 1, 0, 1, and the frame is 0, 0, 1, 0, 1, 0, 1, 0, 1, 1. Note the two low bits at the start — the start bit and d0 are both 0, so the line shows a two-bit-time low run at the beginning. That is exactly the run your scope should show.",
            "Count how long the whole test takes. 258 bytes × 10 bit times × 104 clocks = 268,320 clocks, which at 12 MHz is about 22.4 milliseconds of simulated time. If your testbench seems to take forever, check you have not made the clock period 1 ns while the bit-time counter still assumes an 83 ns (12 MHz) clock.",
            "Decide what counts as a pass. Not \"a byte came back\" — the same value, for every byte, with ferr never asserted. Print one line per byte with $display so that when it does fail you can see which byte and which direction went wrong.",
            "Then break it on purpose, because a test that has never failed is not known to work. Send the bits most significant first and confirm the test catches it: it should report 0xAA for every 0x55 and 0x55 for every 0xAA. Change FULL to FULL − 1 and confirm it still passes, and change FULL by 3% and confirm it starts failing. A test suite that cannot detect a bug you can describe is not a test suite.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "Your loopback returns every byte correctly except that 0x55 comes back as 0xAA. What is the bug?",
              a: "One bit, in one of two places. Either the transmitter shifted most significant bit first instead of least (`tx <= shreg[7]` with the shift going the other way), or the receiver shifted the incoming bit into the bottom of its register instead of the top. Both produce exactly this symptom and both are cured by changing one index. Everything else — the baud rate, the frame length, the start and stop bits — must be correct, because those would break every byte rather than only the asymmetric ones. The lesson generalises: an error that only affects some values points at bit ordering, not at timing.",
            },
            {
              q: "You connect the real board and the first byte arrives corrupted, but loopback was perfect. What changes between the two situations?",
              a: "Three things, and check them in this order. First the wire: on real hardware the pin is asynchronous, so it needs the two-flop synchroniser from chapter 8 before anything reads it — a missing synchroniser shows up exactly like a corrupted first byte after reset. Second the far end's clock: the two crystals differ, so compute your baud error and make sure it is inside a couple of percent. Third the signal itself: confirm the idle level is high on the real board, since some transceivers invert the line. Loopback proves your logic; it cannot prove your wiring.",
            },
          ],
        },
      ],
    },
    {
      slug: "where-uart-goes-wrong",
      title: "Five ways a UART goes wrong",
      lede: "The mistakes that survive a loopback test, and a last look at the whole design.",
      blocks: [
        {
          kind: "para",
          text: "Every one of these has been covered above, and they are collected here because they share a property: none of them produces an error message. A design with all five of them wrong still compiles clean, still lints clean, and can still pass a loopback test if the loopback happens to agree with it. These are the bugs that survive to the bench.",
        },
        {
          kind: "trap",
          wrong: "Sending the most significant bit first, so 0x55 comes back as 0xAA.",
          right: "LSb first on transmit: `tx <= shreg[0]; shreg <= shreg >> 1;`",
          why: "The receiver reverses the order as it shifts in, so a transmitter that also reverses produces a double reversal and every byte arrives with its bits flipped end to end. Only asymmetric bytes such as 0x55, 0xAA, 0x01 and 0x80 expose it, which is exactly why those are the bytes a test must send.",
        },
        {
          kind: "trap",
          wrong: "Resetting the transmitter's tx output to 0 instead of 1.",
          right: "`tx <= 1'b1;` in the reset branch. Anything on the wire resets to that wire's idle level.",
          why: "A line that comes out of reset low looks like a start bit that never ends. Every receiver on the wire will wait half a bit, sample, and find the stop bit low too — a framing error on a silent wire. The first symptom is always \"a framing error appears at power-on\", and the cause is one character in the reset branch.",
        },
        {
          kind: "trap",
          wrong: "Reloading the bit-time counter at CLKS_PER_BIT, or sizing the counter to width w when CLKS_PER_BIT needs w + 1 bits.",
          right: "Compare against CLKS_PER_BIT − 1, and check with the 2ʷ rule that the counter can actually reach that value.",
          why: "The first mistake is a silent 1% baud error that every test tolerates and no test reports. The second is fatal and equally silent: the counter never reaches its compare value, so baud_en never pulses and the frame never advances. Both are one-line arithmetic errors that no tool can see, which is why the width and the − 1 belong in the parameter list where a reader will check them.",
        },
        {
          kind: "trap",
          wrong: "Sampling on a free-running baud_en, or at the instant the line changes.",
          right: "Re-zero a counter on the detected start bit, wait half a bit time, then sample every full bit time.",
          why: "A free-running enable is out of phase with this frame, so samples land anywhere in the bit, including on transitions where the value is genuinely in between. The bytes come back nearly right, with no framing error, so the link fails intermittently and only on a long cable. The re-zero costs one counter and removes the whole class of problem.",
        },
        {
          kind: "trap",
          wrong: "Reading the incoming serial pin directly, with no synchroniser between it and the receiver.",
          right: "Two flip-flops from chapter 8 between the pin and the logic: `meta` then `sync`, reset to 1.",
          why: "The pin is asynchronous, so it can change a hair either side of your clock edge, and a flip-flop that catches it there may briefly hold a value between 0 and 1. The first flop absorbs that; the second is clean a full clock period later. Loopback will not catch this omission, because in a loopback the signal is already inside your clock domain — which is exactly why the failure only appears when you connect a real board.",
        },
        {
          kind: "points",
          title: "The whole design, on one line each",
          items: [
            "CLKS_PER_BIT = f_clk ÷ baud, rounded, with the error computed and checked.",
            "A counter that reloads at CLKS_PER_BIT − 1 and pulses once per bit time.",
            "A transmitter: IDLE holds the line high, SEND shifts the byte out LSb first on each pulse, then raises the stop bit.",
            "A receiver: detect the low line, count half a bit, then sample once per bit, shifting in from the top, then check the stop bit.",
            "A synchroniser: two flip-flops between the wire and the receiver, reset to the idle level.",
            "A handshake: busy from the transmitter, rdy and ferr from the receiver, all one-cycle pulses.",
            "A loopback: one wire from tx to rx, and a test that checks every byte comes back unchanged.",
          ],
        },
        {
          kind: "check",
          items: [
            {
              q: "In one sentence, what is the difference between a UART transmitter and a UART receiver?",
              a: "The transmitter decides when a bit starts and holds the line steady for the whole bit time, so its only real problem is shifting the byte out in the right order. The receiver is told nothing — it has to notice an event it was not warned about, recover the phase of a clock it does not share, and land every sample in the middle of a bit. Same frame, same rate, opposite jobs: one produces, the other listens.",
            },
            {
              q: "You have a working transmitter and a working receiver, and they work separately. Loopback gives you 0x00 every time. What are the three most likely causes?",
              a: "One: the bit-time counters are not both running, so the receiver never sees baud pulses — check that HALF and FULL are the same on both sides and that the transmitter's tick is actually pulsing. Two: the synchroniser is missing or reset to 0, so the receiver's first sample reads a start bit at power-on. Three: the receiver's counter reloads are off by one, so every sample drifts a whole bit time and lands on the wrong bit. Test them in that order, cheapest and most likely first.",
            },
            {
              q: "Why is a parity bit, which exists to catch transmission errors, off in almost every modern link?",
              a: "Because it only catches an odd number of flipped bits, and on a modern short link the errors that do happen are more likely to be bursts of several bits — which parity cannot see at all. On top of that it detects without correcting, so every detection costs a resend and a stall. Layers above already do this properly with a checksum, so parity is overhead with no benefit. Know it is one line, `^d`, and leave it off unless something you must talk to insists on 8E1 or 8O1.",
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    { term: "UART", meaning: "A serial protocol that sends a byte one bit at a time over one wire, wrapped in start and stop bits." },
    { term: "serial", meaning: "One bit at a time down one wire, in time order, as opposed to a bus that sends several at once." },
    { term: "framing", meaning: "Wrapping the payload in fixed marker bits so the receiver knows where the payload begins and ends." },
    { term: "frame", meaning: "One complete serial message on the wire: start bit, data bits, optional parity, stop bit." },
    { term: "baud", meaning: "One bit per second-period. At 9600 baud the line changes value 9,600 times a second." },
    { term: "bit time", meaning: "How long one bit lasts on the wire, which is 1 ÷ baud seconds." },
    { term: "CLKS_PER_BIT", meaning: "How many of your clock cycles make one bit time, found by dividing your clock frequency by the baud rate." },
    { term: "bit-time enable", meaning: "A one-clock-wide pulse the baud generator emits once per bit time, the heartbeat the rest of a UART runs on." },
    { term: "start bit", meaning: "One bit time of low that opens a frame, and the only change from idle a receiver can be certain about." },
    { term: "stop bit", meaning: "One or two bit times of high that close a frame and re-arm the receiver for the next one." },
    { term: "8N1", meaning: "The most common format: 8 data bits, No parity, 1 stop bit — ten bit times per byte." },
    { term: "parity bit", meaning: "One optional bit chosen so the number of 1s is even or odd, letting a receiver notice an odd number of flipped bits." },
    { term: "mid-bit sampling", meaning: "Reading the line in the middle of each bit rather than at its transition, which is what gives a receiver its margin." },
    { term: "oversampling", meaning: "Running a much faster tick — 8 or 16 per bit — so the receiver can confirm a start bit and take a majority vote." },
    { term: "framing error", meaning: "The receiver found the stop bit low, which means it was out of step and the byte cannot be trusted." },
    { term: "synchronizer", meaning: "Two flip-flops that make an asynchronous signal safe to read inside your clock domain, as in chapter 8." },
    { term: "handshake", meaning: "A signal such as busy or rdy that tells the other side when a module is ready to be spoken to." },
    { term: "loopback", meaning: "Connecting a transmitter's output pin straight to a receiver's input pin to test that a byte survives the round trip." },
  ],
  nextStep:
    "You now have the whole protocol: the agreed rate, the frame, the bit-time counter, the transmitter and the receiver. The first lesson, UART Transmitter, puts the first half of that into the workspace — you will build the baud generator, serialise a byte least significant bit first, put the start and stop bits around it, and add the busy and tx_en handshake. Go and write the frame out on paper for the byte it asks you to send before you type anything; the lesson gets much easier once you know which ten bits belong on the wire.",
};
