# Graph Report - HDL Forge  (2026-10-27)

## Corpus Check
- 182 files · ~244,507 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .ico 1, .css 1)

## Summary
- 710 nodes · 1317 edges · 32 communities (26 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- curriculum.ts
- lib/progress.ts
- learn/index.ts
- grade/route.ts
- Workspace.tsx
- tests-content/types.ts
- curriculum-resources.ts
- pset-solutions/index.ts
- solutions/index.ts
- lessons/index.ts
- certs.ts
- compilerOptions
- package.json
- dependencies
- verify-lesson.mjs
- next
- generate-og.py
- lessons/ch3.ts
- lessons/ch5.ts
- lessons/ch10.ts
- lessons/ch6.ts
- lessons/ch8.ts
- vcd.ts
- licenses/page.tsx
- verilator-wasm.d.mts
- postcss.config.mjs
- Next.js version-corrected agent rules (docs in node_modules)
- Third-party OSS licensing notices
- [pset]/page.tsx
- License

## God Nodes (most connected - your core abstractions)
1. `next` - 36 edges
2. `ChapterLearn` - 19 edges
3. `LessonTestSpec` - 18 edges
4. `PSetTestSpec` - 18 edges
5. `react` - 17 edges
6. `compilerOptions` - 16 edges
7. `Workspace()` - 13 edges
8. `isBrowser()` - 11 edges
9. `getProgressSnapshot()` - 11 edges
10. `getGuide()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --implements--> `Hidden testbenches, server-only (anti-cheat)`  [INFERRED]
  app/api/grade/route.ts → README.md
- `Progress store: localStorage + Postgres merge on sign-in` --conceptually_related_to--> `POST()`  [INFERRED]
  README.md → app/api/grade/route.ts
- `POST()` --implements--> `Two simulation engines: Verilator WASM (client lint) + Icarus WASM (server sim)`  [INFERRED]
  app/api/sim/route.ts → README.md
- `Certified problem-submission model as end goal` --semantically_similar_to--> `Cryptographic certificate + public verification`  [EXTRACTED] [semantically similar]
  HDL Forge Project Proposal - SRMIST.pdf → README.md
- `Comparative analysis: HDLBits, EDA Playground, NPTEL/Coursera` --references--> `HDLBITS`  [INFERRED]
  HDL Forge Project Proposal - SRMIST.pdf → lib/curriculum-resources.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Chapter authoring pipeline** — lib_learn_authoring_md_authoring_spec, lib_learn_authoring_md_chapter_learn_schema, lib_curriculum, lib_curriculum_chapter [INFERRED 0.85]
- **End-to-end learning/grading pipeline** — app_api_sim_route_post, app_api_grade_route_post, openhdlforge_readme_hidden_benches, openhdlforge_readme_autograding, openhdlforge_readme_progress_sync [INFERRED 0.85]

## Communities (32 total, 6 thin omitted)

### Community 0 - "curriculum.ts"
Cohesion: 0.08
Nodes (39): metadata, POINTS, generateMetadata(), LearnPage(), LearnPageProps, ChapterPage(), ChapterPageProps, generateMetadata() (+31 more)

### Community 1 - "lib/progress.ts"
Cohesion: 0.08
Nodes (31): friendlyError(), metadata, SignInPage(), SignInPageProps, AuthMenu(), DeleteAccountButton(), deleteAccount(), ProgressSync() (+23 more)

### Community 2 - "learn/index.ts"
Cohesion: 0.07
Nodes (36): CALLOUT_LABEL, CALLOUT_STYLE, LearnBlocks(), renderBlock(), DEBUG_LOOP, HintPanel(), DIALECT_LABEL, LearnTab() (+28 more)

### Community 3 - "grade/route.ts"
Cohesion: 0.05
Nodes (53): dynamic, POST(), GET, POST, dynamic, grade(), maxDuration, POST() (+45 more)

### Community 4 - "Workspace.tsx"
Cohesion: 0.07
Nodes (46): Cursor, EditorPanel(), EditorPanelProps, PaneHeader(), TaskPanel(), ctx, ensureCompiler(), runCompile() (+38 more)

### Community 5 - "tests-content/types.ts"
Cohesion: 0.13
Nodes (18): PSETS_CH10, PSETS_CH11, PSETS_CH12, PSETS_CH13, PSETS_CH14, PSETS_CH15, PSETS_CH1, PSETS_CH2 (+10 more)

### Community 6 - "curriculum-resources.ts"
Cohesion: 0.06
Nodes (32): Browser-native Wasm accessibility as core motivation, Comparative analysis: HDLBits, EDA Playground, NPTEL/Coursera, HDL learning tooling gap vs software ecosystems, HDL Forge academic project proposal (SRMIST), Certified problem-submission model as end goal, ADVANCED_TRACK, ASIC_WORLD, ASIC_WORLD_1DAY (+24 more)

### Community 7 - "pset-solutions/index.ts"
Cohesion: 0.09
Nodes (16): PSET_SOLUTIONS_CH10, PSET_SOLUTIONS_CH11, PSET_SOLUTIONS_CH12, PSET_SOLUTIONS_CH13, PSET_SOLUTIONS_CH14, PSET_SOLUTIONS_CH15, PSET_SOLUTIONS_CH1, PSET_SOLUTIONS_CH2 (+8 more)

### Community 8 - "solutions/index.ts"
Cohesion: 0.09
Nodes (16): SOLUTIONS_CH10, SOLUTIONS_CH11, SOLUTIONS_CH12, SOLUTIONS_CH13, SOLUTIONS_CH14, SOLUTIONS_CH15, SOLUTIONS_CH1, SOLUTIONS_CH2 (+8 more)

### Community 10 - "lessons/index.ts"
Cohesion: 0.10
Nodes (21): LESSONS_CH11, LESSONS_CH12, LESSONS_CH13, LESSONS_CH14, LESSONS_CH15, LESSONS_CH1, TODO: complete the truth table — y is 4'b0001 only when, TODO: complete the function — y is 4'b0001 only when (+13 more)

### Community 11 - "certs.ts"
Cohesion: 0.14
Nodes (20): dynamic, maxDuration, POST(), dynamic, GET(), maxDuration, VerifyPage(), VerifyPageProps (+12 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "package.json"
Cohesion: 0.05
Nodes (40): eslintConfig, devDependencies, @better-auth/cli, drizzle-kit, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss (+32 more)

### Community 15 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, better-auth, drizzle-orm, monaco-editor, @monaco-editor/react, @neondatabase/serverless, next, react (+6 more)

### Community 17 - "next"
Cohesion: 0.05
Nodes (32): app_globals, inter, jetbrains, metadata, BUG_NOTICE, COMPARISON, FAQ, LESSON_COUNT (+24 more)

### Community 23 - "generate-og.py"
Cohesion: 0.25
Nodes (8): FreeTypeFont, Path, pathlib, pil, font(), main(), Generate public/og.png (1200x630) for HDL Forge — branded Open Graph card.…, sys

### Community 24 - "lessons/ch3.ts"
Cohesion: 0.40
Nodes (4): LESSONS_CH3, TODO: fix the slice directions and the replication., TODO: y = (a & b) | ((c & d) ^ (a | d)), TODO: fix the mis-grouped and partial expressions.

### Community 25 - "lessons/ch5.ts"
Cohesion: 0.40
Nodes (4): LESSONS_CH5, TODO: chain N full adders so carries ripple from column to, TODO: chain four full adders so every carry path works., TODO: this is only a half adder — it ignores cin.

### Community 26 - "lessons/ch10.ts"
Cohesion: 0.50
Nodes (3): LESSONS_CH10, TODO: when rot=1 the bits that leave one end must re-enter the other., TODO: add the parallel load (highest priority) and honor dir.

### Community 27 - "lessons/ch6.ts"
Cohesion: 0.50
Nodes (3): LESSONS_CH6, TODO: reinterpret a and b with $signed() for cmp_s — the bits are the, TODO: negate with ~x + 1, sign-extend with the sign bit, and flag

### Community 28 - "lessons/ch8.ts"
Cohesion: 0.50
Nodes (3): LESSONS_CH8, TODO: two flip-flops in series (meta then sync) — one stage is not, TODO: make the reset asynchronous (add negedge rst_n to the sensitivity

### Community 29 - "vcd.ts"
Cohesion: 0.40
Nodes (5): consumeChange(), parseVcd(), UNIT_NS, VcdData, WaveSignal

### Community 32 - "licenses/page.tsx"
Cohesion: 0.22
Nodes (8): dynamic, LicensesPage(), loadNotices(), metadata, ref_node_fs, ref_node_path, dest, src

### Community 37 - "verilator-wasm.d.mts"
Cohesion: 0.50
Nodes (3): VerilatorWasm, VerilatorWasmRunOptions, VerilatorWasmRunResult

### Community 225 - "[pset]/page.tsx"
Cohesion: 0.24
Nodes (13): generateMetadata(), LessonPage(), LessonPageProps, generateMetadata(), PSetPage(), PSetPageProps, getLesson(), getPSet() (+5 more)

### Community 348 - "License"
Cohesion: 0.40
Nodes (4): Curriculum content — CC BY-NC-SA 4.0, License, Platform code — MIT License, Third-party assets

## Knowledge Gaps
- **201 isolated node(s):** `LESSON_COUNT`, `COMPARISON`, `STACK`, `PIPELINE`, `FAQ` (+196 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 281 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `licenses/page.tsx`, `lib/progress.ts`, `curriculum.ts`, `grade/route.ts`, `[pset]/page.tsx`, `certs.ts`, `package.json`?**
  _High betweenness centrality (0.265) - this node is a cross-community bridge._
- **Why does `react` connect `lib/progress.ts` to `curriculum.ts`, `learn/index.ts`, `Workspace.tsx`, `certs.ts`, `package.json`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `LESSON_COUNT`, `COMPARISON`, `STACK` to the rest of the system?**
  _201 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `curriculum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08078431372549019 - nodes in this community are weakly interconnected._
- **Should `lib/progress.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08078231292517007 - nodes in this community are weakly interconnected._
- **Should `learn/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06502816180235535 - nodes in this community are weakly interconnected._
- **Should `grade/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05093167701863354 - nodes in this community are weakly interconnected._