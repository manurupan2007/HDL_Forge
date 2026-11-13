# Authoring spec — `lib/learn/chNN.ts`

Every chapter gets a beginner teaching guide. You are writing for someone who has
**never written Verilog and has never studied digital logic**. They may not know
what a bit is, what a module is, or what a truth table is. Assume nothing.

## Files

- `lib/learn/types.ts` — the schema. Read it first. Do not modify it.
- `lib/learn/ch01.ts` … `ch15.ts` — one file per chapter, `export const chapterLearn: ChapterLearn = {...}`.
- `lib/learn/index.ts` — aggregates. Do not edit; it is generated from your exports.

## Hard rules

1. **TypeScript must compile under the repo's strict settings.** `as const` is not
   needed. Table `head`/`rows` must be typed `[string, string]` tuples — write
   them as arrays of two strings, e.g. `rows: [["a", "b"]]`. If TS complains
   about tuple inference, annotate the whole `blocks` array as `LearnBlock[]`.
2. **Every code sample must be valid, runnable Verilog-2001 or SystemVerilog**
   matching the chapter's dialect. Include the `module` port list when the sample
   is meant to be a whole module. Indent with 2 spaces. Use backtick template
   literals and escape any backtick or `${` inside the code.
3. **No MathWorks.** Never mention MATLAB or Simulink, not even to say "we don't
   use it".
4. **Never invent facts.** If a claim is about hardware behaviour, be accurate.
   Verilator message names must be real (`UNUSED`, `UNDRIVEN`, `WIDTH`,
   `LATCH`, `MULTIDRIVEN`, `CASEINCOMPLETE`, `IMPLICIT`).
5. **No placeholders.** Never write "TODO", "similar to above", "etc.", or
   "...as above". Every block must contain real teaching text.

## Voice

- Second person, present tense: "you declare", "you read".
- Short sentences. One idea per sentence.
- Define a term the moment it appears, in plain words, then optionally give the
  technical name in parentheses. Example: "a *net* (the wire itself)".
- No unglossed jargon. If you cannot avoid a word, gloss it inline.
- No hype, no "it's crucial to understand", no "delve". Plain and warm.
- Prefer concrete numbers. Say "4 bits can hold 16 different values (0 to 15)",
  not "a small number of values".

## What "beginner friendly" concretely means

Required moves — include all of them:

- **Start from something physical.** A bit is a switch; a wire is a wire; a
  module is a box with pins. Use the `analogy` block for this.
- **Show the tiny complete example early**, then take it apart line by line with
  `steps`. Beginners need a whole thing before they can accept parts.
- **Work numbers out on paper.** Use `doThis` for anything a learner can do with
  pencil and paper: convert 10 to binary, fill in a truth table row, add two
  numbers by hand. This is the single most valuable block type — use it in
  every topic that admits it.
- **Preview the answer, then hide it.** Use `check` for self-test questions. The
  answer must include the reasoning, not just the result.
- **Name the mistakes.** `trap` blocks for the three-to-five errors a beginner
  will actually make here, each with the fix and the *why* the wrong version
  fails. Do not invent fake mistakes; think about what a real newcomer gets wrong.

## Structure

```ts
export const chapterLearn: ChapterLearn = {
  chapterNumber: <n>,
  chapterSlug: "<slug, must match lib/curriculum.ts>",
  title: "<chapter title>",
  readMinutes: <12-25, be honest, it is length-driven>,
  youWillBeAbleTo: [4-7 strings, each starting with a verb in the infinitive],
  mentalModel: [1-3 cards, the core mental model the whole chapter hangs off],
  topics: [ 6-9 topics ],
  glossary: [8-14 terms, alphabetical, one-sentence plain meanings],
  nextStep: "<one short paragraph pointing at the chapter's first lesson>",
};
```

Each topic:

```ts
{
  slug: "kebab-case",
  title: "Plain-language title, not jargon",
  lede: "One sentence telling the reader what they will understand after this.",
  blocks: [ /* 4-9 blocks, mixing kinds */ ],
}
```

Required topic ordering across a chapter: intuition first, then notation, then
mechanics, then worked example, then pitfalls, then self-check.

## Coverage

The guide must cover everything in the chapter's `concepts`, both lesson titles,
and enough to make the lesson's `task` feel obvious. Read the chapter's source
material first:

- `lib/curriculum.ts` — search for the chapter slug, read its whole block
  (lessons' `objective`, `task`, `practice`, `theory`) plus the pset.
- Or the extracted digest `/tmp/opencode/chapter-digests/chNN-<slug>.json`, which
  contains exactly that material in JSON. Prefer this; it is smaller.

You may read the rest of `lib/curriculum.ts` only if you need neighbouring
context (a concept first used in an earlier chapter, for example).

## Verifying your work

```bash
cd "/home/manurupanm/Projects/HDL Forge" && npx tsc --noEmit -p tsconfig.json
```

Fix any error your file causes. If you see errors in files you did not write
(another agent working in parallel), ignore them — do not edit other files.

## Reference example

`lib/learn/ch01.ts` is the reference for depth, tone and formatting. Read it
before you write, and match it. Note the shape: the `mentalModel` cards, the
progression from "a bit is a switch" to real syntax, the `doThis` hand-work, the
`trap` blocks, and the closing `check` with explained answers.
