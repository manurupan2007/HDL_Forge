import type { ChapterLearn } from "./types";
import { chapterLearn as ch01 } from "./ch01";
import { chapterLearn as ch02 } from "./ch02";
import { chapterLearn as ch03 } from "./ch03";
import { chapterLearn as ch04 } from "./ch04";
import { chapterLearn as ch05 } from "./ch05";
import { chapterLearn as ch06 } from "./ch06";
import { chapterLearn as ch07 } from "./ch07";
import { chapterLearn as ch08 } from "./ch08";
import { chapterLearn as ch09 } from "./ch09";
import { chapterLearn as ch10 } from "./ch10";
import { chapterLearn as ch11 } from "./ch11";
import { chapterLearn as ch12 } from "./ch12";
import { chapterLearn as ch13 } from "./ch13";
import { chapterLearn as ch14 } from "./ch14";
import { chapterLearn as ch15 } from "./ch15";

export type { ChapterLearn, LearnBlock, LearnTopic, CalloutTone } from "./types";

export const chapterGuides: ChapterLearn[] = [
  ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13, ch14, ch15,
];

export function getGuide(slug: string): ChapterLearn | undefined {
  return chapterGuides.find((g) => g.chapterSlug === slug);
}

/** Flat, stable ids for in-page anchor links. */
export function topicId(chapterSlug: string, topicSlug: string) {
  return `topic-${chapterSlug}-${topicSlug}`;
}

/**
 * Which guide topic the Learn tab should open for each lesson — the topic
 * that best supports that lesson, rather than always topic zero.
 */
const TOPIC_PICK: Record<string, string> = {
  "synthesis-foundations:bits-and-truth-tables": "vectors",
  "logic-gates:gate-primitives": "gate-primitives",
  "combinational-expressions:operators-and-precedence": "precedence-and-grouping",
  "combinational-expressions:vector-slices": "one-bit-and-slices",
  "multiplexers:mux-circuits": "mux-from-gates",
  "adders:half-and-full-adder": "the-half-adder",
  "adders:ripple-carry": "chaining-columns",
  "arithmetic:twos-complement": "twos-complement",
  "encode-decode:priority-encoder": "priority-encoders",
  "sequential-fundamentals:flip-flops": "the-d-flip-flop",
  "counters:mod-n-counter": "modulo-n",
  "shift-registers:shifter-family": "siso-sipo-piso-pipo",
  "finite-state-machines:mealy-vs-moore": "mealy-vs-moore",
  "finite-state-machines:fsm-2-step": "two-paragraph-style",
  "datapath:alu-build": "the-operation-table",
  "memory:single-port-ram": "reading-and-writing",
  "interfaces:uart-tx": "uart-transmitter",
  "interfaces:uart-rx": "uart-receiver",
  "risc-v-blocks:pc-datapath": "the-program-counter",
};

export function topicForLesson(
  chapterSlug: string,
  lessonSlug: string,
): string | undefined {
  return TOPIC_PICK[`${chapterSlug}:${lessonSlug}`];
}
