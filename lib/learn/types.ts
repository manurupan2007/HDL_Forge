// Beginner-facing teaching content. Deliberately separate from
// lib/curriculum.ts: curriculum holds the graded practice items, this holds
// the explanation. Nothing in here is tested or graded — it exists so a
// complete beginner can go from "what is a bit" to "I can write this" without
// ever meeting a hidden testbench first.

export type CalloutTone = "tip" | "note" | "warn" | "why";

export type LearnBlock =
  /** Plain prose. Use for explanation, not for lists. */
  | { kind: "para"; text: string }
  /** Everyday analogy that grounds the idea in something non-technical. */
  | { kind: "analogy"; text: string }
  /** A numbered list of things a beginner can do by hand, e.g. "do this on paper". */
  | { kind: "doThis"; title: string; items: string[] }
  /** Bulleted takeaway list. */
  | { kind: "points"; title?: string; items: string[] }
  /** Short definition list, for terms introduced right there. */
  | { kind: "define"; items: { term: string; meaning: string }[] }
  /** A code sample with a caption explaining what to notice in it. */
  | { kind: "code"; code: string; caption?: string; note?: string }
  /** Comparison table. `head` and every row must have the same length. */
  | {
      kind: "table";
      head: string[];
      rows: string[][];
      caption?: string;
    }
  /** Step-by-step worked derivation, prose between steps. */
  | {
      kind: "steps";
      title: string;
      items: { head: string; body: string; code?: string }[];
    }
  /** Coloured aside. */
  | { kind: "callout"; tone: CalloutTone; title?: string; text: string }
  /** A mistake beginners reliably make, with the fix. */
  | { kind: "trap"; wrong: string; right: string; why: string }
  /** Question, answer collapsed behind a <details>. Self-check, never graded. */
  | { kind: "check"; items: { q: string; a: string }[] };

export type LearnTopic = {
  slug: string;
  title: string;
  /** One line: what the reader is about to understand. */
  lede: string;
  blocks: LearnBlock[];
};

export type ChapterLearn = {
  chapterNumber: number;
  chapterSlug: string;
  title: string;
  readMinutes: number;
  /** "By the end of this page you can…" — concrete, verifiable, beginner-shaped. */
  youWillBeAbleTo: string[];
  /** The mental model that everything else hangs off. 1-3 cards. */
  mentalModel: { title: string; body: string }[];
  topics: LearnTopic[];
  /** Chapter-wide terms, for the reader to come back to. */
  glossary: { term: string; meaning: string }[];
  /** How the next lesson/practice connects to this page. */
  nextStep: string;
};
