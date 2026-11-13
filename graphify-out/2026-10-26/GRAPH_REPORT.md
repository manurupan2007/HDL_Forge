# Graph Report - HDL Forge  (2026-10-26)

## Corpus Check
- 279 files · ~1,003,482 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 77 file(s) not represented in the graph (top: .log 68, .ttf 3, (none) 2)

## Summary
- 17288 nodes · 67006 edges · 538 communities (172 shown, 366 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 7816 edges (avg confidence: 0.85)
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
- auth.ts
- tsWorker.js
- certs.ts
- compilerOptions
- package.json
- s
- r
- "src/compiler/parser.ts"
- next
- d2
- _
- Rn
- vb
- cssWorker.js
- generate-og.py
- aoe
- a
- Jn
- w4
- t
- vcd.ts
- Yn
- get
- licenses/page.tsx
- I
- e
- h_
- finish
- verilator-wasm.d.mts
- postcss.config.mjs
- Next.js version-corrected agent rules (docs in node_modules)
- Third-party OSS licensing notices
- $h
- m
- _e
- ct
- Ee
- E
- k
- Vce
- ga
- a
- d
- n
- g
- p
- .constructor
- a
- s
- H
- x
- y
- y3e
- c
- fo
- b
- r
- o
- Ci
- Cr
- mk
- fae
- t
- _
- o
- w
- jsonMode.js
- Da
- l
- push
- A
- f
- .isEmpty
- Re
- e
- l
- pe
- jsonWorker.js
- .get
- uae
- p
- d
- cssMode.js
- pn
- htmlMode.js
- q
- f
- i
- Pi
- htmlWorker.js
- ge
- jt
- add
- getUriComparisonKey
- .getLineCount
- u
- ue
- getCompletionsForSelector
- r
- tsMode.js
- Se
- Dr
- .show
- Ls
- m
- .render
- ._register
- s
- v
- .move
- _trigger
- _update
- ie
- .contains
- .constructor
- .getLineContent
- z
- h
- on
- .toString
- tre
- .getLineMaxColumn
- w
- _onModelChange
- _hookListeners
- .stop
- H
- .sort
- .focus
- .renderText
- doComplete
- u
- scanNext
- layout
- n
- zoe
- .constructor
- w
- lH
- _updateState
- t
- setNode
- c
- c
- .substring
- .forceTokenization
- .getStartLineNumber
- getValue
- V
- o
- .dispose
- .containsPosition
- pushStackElement
- .constructor
- A
- ._scheduleRender
- .render
- .isIPosition
- doHover
- .getLineMinColumn
- j
- .splice
- p
- create
- setScrollPosition
- .constructor
- o
- W
- Ce
- .constructor
- n
- p
- .load
- .append
- .getId
- m
- i
- .update
- .set
- Ee
- y
- ._getModel
- q
- join
- he
- .constructor
- getMetadata
- doProvideWithEditorSymbols
- ._doDispatch
- doComplete
- .isVisible
- V
- _setDocumentSemanticTokens
- ._addZone
- [pset]/page.tsx
- .isUri
- .unshift
- g
- d
- de
- x
- ._create
- ._beginSessionIfNeeded
- positionAt
- deltaDecorations
- .register
- .set
- .collapseToStart
- _start
- ye
- showHover
- T
- .error
- .setEndPosition
- _doTriggerQuickSuggest
- getOrCreate
- .pop
- getLanguageId
- .fire
- ._updateBlinking
- computeCompletions
- .linesVisibleRangesForRange
- getDecorationRange
- .onMouseEnter
- getMatchingSchemas
- fnt
- m
- ._backgroundTokenizeForAtLeast1ms
- addAction
- .reduce
- _recomputeOptions
- ._getForeignProxy
- .isBasicASCII
- ._showImpl
- .alloc
- ._enter
- getFocusedCodeEditor
- readResources
- _setHasFocus
- .compute
- .intersects
- .getVerticalOffsetForLineNumber
- _createCoordinatedRendering
- FT
- h
- .computeStickyModel
- getContainerDomNode
- .compute
- .getDecorationsInRange
- we
- .create
- License
- .delta
- for
- LT
- .regex
- getCandidateStickyLinesIntersectingFromStickyModel
- _resolveCodeLensesInViewport
- _toNormalizedKeybindingItems
- _configureFont
- getEdit
- getEditorType
- .forceRenderingAbove
- getMarker
- .stopForceRenderingAbove

## God Nodes (most connected - your core abstractions)
1. `_` - 1803 edges
2. `aoe()` - 1161 edges
3. `d2()` - 774 edges
4. `t()` - 529 edges
5. `r()` - 506 edges
6. `I()` - 505 edges
7. `p()` - 485 edges
8. `b()` - 469 edges
9. `m()` - 467 edges
10. `E()` - 442 edges

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

## Communities (538 total, 366 thin omitted)

### Community 0 - "curriculum.ts"
Cohesion: 0.06
Nodes (38): BUG_NOTICE, COMPARISON, FAQ, LESSON_COUNT, metadata, PIPELINE, STACK, metadata (+30 more)

### Community 1 - "lib/progress.ts"
Cohesion: 0.10
Nodes (40): metadata, AuthMenu(), CertificateClaim(), claim(), ClaimItem, ClaimResult, VerifyResult, DeleteAccountButton() (+32 more)

### Community 2 - "learn/index.ts"
Cohesion: 0.09
Nodes (27): CALLOUT_LABEL, CALLOUT_STYLE, LearnBlocks(), LearnTopicSection(), renderBlock(), chapterLearn, chapterLearn, chapterLearn (+19 more)

### Community 3 - "grade/route.ts"
Cohesion: 0.09
Nodes (32): dynamic, POST(), dynamic, grade(), maxDuration, POST(), dynamic, maxDuration (+24 more)

### Community 4 - "Workspace.tsx"
Cohesion: 0.09
Nodes (33): Cursor, EditorPanel(), EditorPanelProps, ctx, ensureCompiler(), runCompile(), WaveformPanel(), WaveformPanelProps (+25 more)

### Community 5 - "tests-content/types.ts"
Cohesion: 0.05
Nodes (56): PSETS_CH10, PSETS_CH11, PSETS_CH12, PSETS_CH13, PSETS_CH14, PSETS_CH15, PSETS_CH1, PSETS_CH2 (+48 more)

### Community 6 - "curriculum-resources.ts"
Cohesion: 0.06
Nodes (32): Browser-native Wasm accessibility as core motivation, Comparative analysis: HDLBits, EDA Playground, NPTEL/Coursera, HDL learning tooling gap vs software ecosystems, HDL Forge academic project proposal (SRMIST), Certified problem-submission model as end goal, ADVANCED_TRACK, ASIC_WORLD, ASIC_WORLD_1DAY (+24 more)

### Community 7 - "pset-solutions/index.ts"
Cohesion: 0.06
Nodes (18): PSET_SOLUTIONS_CH10, PSET_SOLUTIONS_CH11, PSET_SOLUTIONS_CH12, PSET_SOLUTIONS_CH13, PSET_SOLUTIONS_CH14, PSET_SOLUTIONS_CH15, PSET_SOLUTIONS_CH1, PSET_SOLUTIONS_CH2 (+10 more)

### Community 8 - "solutions/index.ts"
Cohesion: 0.09
Nodes (16): SOLUTIONS_CH10, SOLUTIONS_CH11, SOLUTIONS_CH12, SOLUTIONS_CH13, SOLUTIONS_CH14, SOLUTIONS_CH15, SOLUTIONS_CH1, SOLUTIONS_CH2 (+8 more)

### Community 9 - "auth.ts"
Cohesion: 0.11
Nodes (22): GET, POST, POST(), GET(), POST(), auth, Session, SESSION_EXPIRES_IN_SECONDS (+14 more)

### Community 10 - "tsWorker.js"
Cohesion: 0.00
Nodes (444): RFC-5646, _3(), _3e(), _9e(), a0e(), a1e(), a4e(), A9() (+436 more)

### Community 11 - "certs.ts"
Cohesion: 0.14
Nodes (20): dynamic, maxDuration, POST(), dynamic, GET(), maxDuration, VerifyPage(), VerifyPageProps (+12 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "package.json"
Cohesion: 0.04
Nodes (54): eslintConfig, dependencies, better-auth, drizzle-orm, monaco-editor, @monaco-editor/react, @neondatabase/serverless, next (+46 more)

### Community 14 - "s"
Cohesion: 0.01
Nodes (472): _ae(), A(), C(), E(), G(), K(), L(), m() (+464 more)

### Community 15 - "r"
Cohesion: 0.02
Nodes (381): Os(), $4e(), a3e(), a4(), A8(), AA(), ad(), aGe() (+373 more)

### Community 16 - ""src/compiler/parser.ts""
Cohesion: 0.02
Nodes (360): Ea(), J(), VT(), Xl(), ye(), j(), mg(), S7() (+352 more)

### Community 17 - "next"
Cohesion: 0.05
Nodes (30): app_globals, inter, jetbrains, metadata, FEATURES, metadata, SECTIONS, friendlyError() (+22 more)

### Community 18 - "d2"
Cohesion: 0.01
Nodes (362): Be(), D(), Gy(), ir(), p1(), Sa(), Un(), Uy() (+354 more)

### Community 19 - "_"
Cohesion: 0.01
Nodes (96): _, acceptSelectedSuggestion(), accessibleDiffViewerNext(), addDynamicKeybinding(), addDynamicKeybindings(), _alertCompletionItem(), beginCompute(), _beginRenderDecorations() (+88 more)

### Community 20 - "Rn"
Cohesion: 0.01
Nodes (306): _0(), $1(), _4(), $5(), $8(), A2(), a$e(), d() (+298 more)

### Community 21 - "vb"
Cohesion: 0.03
Nodes (286): g(), c1(), fp(), Ft(), hpt(), Iv(), JR(), m_() (+278 more)

### Community 22 - "cssWorker.js"
Cohesion: 0.02
Nodes (249): acceptUnicodeRange(), acceptVisitor(), add(), addAttr(), addChildren(), addCSSVariable(), addData(), addEntry() (+241 more)

### Community 23 - "generate-og.py"
Cohesion: 0.25
Nodes (8): FreeTypeFont, Path, pathlib, pil, font(), main(), Generate public/og.png (1200x630) for HDL Forge — branded Open Graph card.…, sys

### Community 24 - "aoe"
Cohesion: 0.02
Nodes (233): aoe(), _2e(), a2e(), a5(), aat(), qt(), af(), age() (+225 more)

### Community 25 - "a"
Cohesion: 0.02
Nodes (216): _1(), a8e(), In(), Kt(), me(), ue(), ht(), ah() (+208 more)

### Community 26 - "Jn"
Cohesion: 0.02
Nodes (223): aKe(), ao(), Sn(), ant(), aot(), aQ(), art(), b_e() (+215 more)

### Community 27 - "w4"
Cohesion: 0.02
Nodes (218): aB(), hd(), eD(), bI(), Ay(), Cn(), di(), Dl() (+210 more)

### Community 28 - "t"
Cohesion: 0.02
Nodes (198): _6e(), a7e(), qi(), ape(), aV(), ave(), b3e(), bae() (+190 more)

### Community 29 - "vcd.ts"
Cohesion: 0.40
Nodes (5): consumeChange(), parseVcd(), UNIT_NS, VcdData, WaveSignal

### Community 30 - "Yn"
Cohesion: 0.02
Nodes (198): $0(), _8e(), a1(), aE(), aLe(), am(), AT(), c() (+190 more)

### Community 31 - "get"
Cohesion: 0.01
Nodes (170): Li(), _9(), aae(), abe(), U(), bA(), bj(), d() (+162 more)

### Community 32 - "licenses/page.tsx"
Cohesion: 0.22
Nodes (8): dynamic, LicensesPage(), loadNotices(), metadata, ref_node_fs, ref_node_path, dest, src

### Community 34 - "e"
Cohesion: 0.03
Nodes (162): Ae(), Dt(), _e(), fe(), ft(), he(), Ki(), ot() (+154 more)

### Community 35 - "h_"
Cohesion: 0.04
Nodes (160): A6(), ab(), at(), au(), Bi(), Bn(), ci(), co() (+152 more)

### Community 36 - "finish"
Cohesion: 0.08
Nodes (164): accept(), acceptDelim(), acceptIdent(), _acceptInterpolatedIdent(), acceptOneKeyword(), acceptRegexp(), acceptUnquotedString(), addChild() (+156 more)

### Community 37 - "verilator-wasm.d.mts"
Cohesion: 0.50
Nodes (3): VerilatorWasm, VerilatorWasmRunOptions, VerilatorWasmRunResult

### Community 43 - "$h"
Cohesion: 0.04
Nodes (141): H(), Wt(), zt(), Wt(), jy(), lD(), p_(), gi() (+133 more)

### Community 45 - "_e"
Cohesion: 0.03
Nodes (146): _6(), A3(), ee(), gi(), jt(), qr(), aI(), Bh() (+138 more)

### Community 46 - "ct"
Cohesion: 0.04
Nodes (146): aie(), _5(), ve(), vn(), ait(), bhe(), bQ(), bw() (+138 more)

### Community 47 - "Ee"
Cohesion: 0.02
Nodes (121): le(), pe(), D8(), F1(), _e(), H3e(), hb(), Ee() (+113 more)

### Community 50 - "Vce"
Cohesion: 0.02
Nodes (106): Je(), Ke(), ln(), nt(), re(), tt(), Ue(), yt() (+98 more)

### Community 51 - "ga"
Cohesion: 0.03
Nodes (129): $7(), A_(), aA(), ahe(), apt(), B$(), bke(), blt() (+121 more)

### Community 52 - "a"
Cohesion: 0.03
Nodes (34): acceptNextWord(), _addLoadingMessage(), applyFontInfo(), T(), W(), computeSync(), computeWithModel(), A() (+26 more)

### Community 57 - ".constructor"
Cohesion: 0.02
Nodes (90): _adjustOptionsForLeftHandSide(), _adjustOptionsForRightHandSide(), _adjustOptionsForSubEditor(), _checkStopEmptyWorker(), _checkStopIdleWorker(), cleanUpActiveLinkDecoration(), _computeAugmentation(), computeLinksNow() (+82 more)

### Community 60 - "H"
Cohesion: 0.03
Nodes (86): ag(), Ah(), be(), ce(), F(), Ge(), Jo(), K() (+78 more)

### Community 61 - "x"
Cohesion: 0.03
Nodes (3): f(), n, x

### Community 63 - "y3e"
Cohesion: 0.03
Nodes (86): ce(), he(), be(), De(), Vt(), be(), Je(), Ke() (+78 more)

### Community 65 - "fo"
Cohesion: 0.03
Nodes (94): _0e(), a7(), aF(), ap(), b0e(), s(), C_(), c0e() (+86 more)

### Community 66 - "b"
Cohesion: 0.02
Nodes (3): b(), warnInvalidLengthSemanticTokens(), warnOverlappingSemanticTokens()

### Community 68 - "o"
Cohesion: 0.03
Nodes (85): a0(), a5e(), aqe(), aW(), b5e(), h(), bxe(), l() (+77 more)

### Community 69 - "Ci"
Cohesion: 0.04
Nodes (92): act(), c(), u(), adt(), aS(), T(), cdt(), cpt() (+84 more)

### Community 70 - "Cr"
Cohesion: 0.03
Nodes (89): cae(), Ae(), be(), C(), de(), E(), F(), fe() (+81 more)

### Community 71 - "mk"
Cohesion: 0.03
Nodes (78): ee(), st(), mE(), Dt(), ot(), st(), F8(), ft() (+70 more)

### Community 72 - "fae"
Cohesion: 0.04
Nodes (80): dn(), _i(), il(), Js(), fae(), ae(), An(), Ar() (+72 more)

### Community 73 - "t"
Cohesion: 0.02
Nodes (4): t(), H(), M(), triggerSuggest()

### Community 74 - "_"
Cohesion: 0.05
Nodes (22): _, s(), basename(), cwd(), S(), dirname(), extname(), isAbsolute() (+14 more)

### Community 76 - "w"
Cohesion: 0.03
Nodes (7): Ct, findPreviousMatch(), restoreSerializedState(), restoreState(), restoreViewState(), _syncRanges(), w()

### Community 77 - "jsonMode.js"
Cohesion: 0.05
Nodes (73): Ae(), at(), _checkIfIdle(), clone(), constructor(), ct(), dispose(), Dn() (+65 more)

### Community 78 - "Da"
Cohesion: 0.03
Nodes (70): $a(), Am(), ate(), AY(), b0(), b9(), bte(), o() (+62 more)

### Community 80 - "push"
Cohesion: 0.04
Nodes (14): _appendImplicitItems(), getLanguageIdAtPosition(), getMenuItems(), goToLine(), _handleMarkerChange(), isSelectionWithinPlaceholders(), _onModelRemoved(), push() (+6 more)

### Community 83 - ".isEmpty"
Cohesion: 0.05
Nodes (17): cancelSelectionAnchor(), computeAsync(), createColorHover(), getColorData(), _getMarkdownHovers(), _getSelection(), _getTriggerCharacterInfo(), _initIdx() (+9 more)

### Community 84 - "Re"
Cohesion: 0.05
Nodes (74): $1e(), a_e(), aD(), ast(), bi(), Bm(), bpt(), brt() (+66 more)

### Community 86 - "l"
Cohesion: 0.05
Nodes (23): accept(), _acceptNext(), acceptNextLine(), acceptSelected(), adjustWhitespace(), basename(), dirname(), _ensureDisposedModelsHeapSize() (+15 more)

### Community 88 - "jsonWorker.js"
Cohesion: 0.05
Nodes (53): addChildProperty(), clearExternalSchemas(), clearSchema(), configure(), cr(), de(), dr(), er() (+45 more)

### Community 89 - ".get"
Cohesion: 0.10
Nodes (23): computeStagedValue(), createEditsAndSnippetsFromEdits(), createEditsAndSnippetsFromSelections(), _createState(), executeCommands(), executeEdits(), getConfiguredWordAtPosition(), getModel() (+15 more)

### Community 90 - "uae"
Cohesion: 0.03
Nodes (44): h4(), TS(), uae(), Ae(), An(), Ar(), At(), ce() (+36 more)

### Community 93 - "cssMode.js"
Cohesion: 0.06
Nodes (53): At(), _checkIfIdle(), constructor(), dispose(), _doValidate(), Ft(), _getClient(), getLanguageServiceWorker() (+45 more)

### Community 94 - "pn"
Cohesion: 0.05
Nodes (57): ia(), a6e(), cr(), gn(), mn(), Rt(), D_(), joe() (+49 more)

### Community 95 - "htmlMode.js"
Cohesion: 0.06
Nodes (49): At(), Bt(), _checkIfIdle(), constructor(), dispose(), _doValidate(), _getClient(), getLanguageServiceWorker() (+41 more)

### Community 96 - "q"
Cohesion: 0.04
Nodes (13): b(), Ce(), fe(), g(), ge(), j, K, q() (+5 more)

### Community 99 - "Pi"
Cohesion: 0.08
Nodes (59): A7(), ai(), Ame(), C$(), cD(), Cg(), cQ(), Dg() (+51 more)

### Community 100 - "htmlWorker.js"
Cohesion: 0.06
Nodes (45): RFC-2616, RFC-4281, advanceWhileChar(), bn(), bt(), constructor(), dn(), doRename() (+37 more)

### Community 102 - "jt"
Cohesion: 0.05
Nodes (55): en(), On(), Qt(), Tn(), ni(), ua(), dd(), Dpe() (+47 more)

### Community 103 - "add"
Cohesion: 0.06
Nodes (13): add(), addItemWithSeparator(), _createActionBar(), extract(), registerKeyModsListeners(), _renderWidget(), _setState(), showSuggestions() (+5 more)

### Community 104 - "getUriComparisonKey"
Cohesion: 0.07
Nodes (40): _acquireLocks(), canRedo(), canUndo(), changeDropType(), changePasteType(), _checkWorkspaceRedo(), _checkWorkspaceUndo(), clearWidgets() (+32 more)

### Community 105 - ".getLineCount"
Cohesion: 0.06
Nodes (36): _assertNotDisposed(), computeDiff(), _createContentChanged2(), detectIndentation(), _doApplyEdits(), _emitContentChangedEvent(), findMatches(), findMatchesLineByLine() (+28 more)

### Community 107 - "ue"
Cohesion: 0.07
Nodes (3): beforeRender(), ue(), _updateButtonTitle()

### Community 108 - "getCompletionsForSelector"
Cohesion: 0.08
Nodes (51): ar(), ba(), Ca(), Ce(), computeCompletions(), convertContents(), doComplete2(), doesSupportMarkdown() (+43 more)

### Community 110 - "tsMode.js"
Cohesion: 0.08
Nodes (45): ce(), constructor(), _containsLibFile(), _convertDiagnostics(), _convertHintKind(), convertKind(), _convertOptions(), _convertRelatedInformation() (+37 more)

### Community 111 - "Se"
Cohesion: 0.10
Nodes (44): a(), Ae(), c(), a(), ht(), Ie(), k(), l() (+36 more)

### Community 112 - "Dr"
Cohesion: 0.05
Nodes (45): _2(), aee(), aet(), aFe(), i(), p(), o(), s() (+37 more)

### Community 113 - ".show"
Cohesion: 0.06
Nodes (27): adjustValueSelection(), createInputBox(), createParameterHintDOMNodes(), doShowOrPick(), focusOnReferenceTree(), getActiveDescendant(), getBannerMessage(), getContainer() (+19 more)

### Community 114 - "Ls"
Cohesion: 0.06
Nodes (44): _5e(), aye(), b2(), Ca(), cje(), e3(), eB(), o() (+36 more)

### Community 115 - "m"
Cohesion: 0.08
Nodes (3): h(), m(), setParent()

### Community 116 - ".render"
Cohesion: 0.06
Nodes (15): addFocusTrap(), createHTML(), _createRow(), _doRender(), findLastFocusableChild(), getParameterLabelOffsets(), hasDocs(), isMouseGettingCloser() (+7 more)

### Community 117 - "._register"
Cohesion: 0.07
Nodes (22): _allVisibleChecked(), controller(), createController(), dt, getWindow(), me(), onDidHideHover(), quickAccess() (+14 more)

### Community 118 - "s"
Cohesion: 0.06
Nodes (6): Ke(), Ne(), _onModelAdded(), C(), te(), s()

### Community 121 - "_trigger"
Cohesion: 0.07
Nodes (32): _attachModel(), _beginUpdate(), _cancelModelPromise(), _cleanUp(), close(), _compositionType(), createSuggestFilter(), _createView() (+24 more)

### Community 122 - "_update"
Cohesion: 0.06
Nodes (34): _applyCodeAction(), _cacheHintsForFastRestore(), _comparator(), _copyInlayHintsWithCurrentAnchor(), createStickyModel(), find(), _findSumOfRangesOfGroup(), _getActionBarActions() (+26 more)

### Community 124 - ".contains"
Cohesion: 0.06
Nodes (21): applyDefaultPasteHandler(), bestKeybindingForCodeAction(), containsNode(), doPasteInline(), ensureModifiedLineIsVisible(), ensureOriginalLineIsVisible(), fetchCopyMetadata(), getFoldingRangeProviders() (+13 more)

### Community 126 - ".getLineContent"
Cohesion: 0.08
Nodes (13): _addEditOperation(), buildIndentConverter(), _getAndroidWordAtPosition(), _getCharacterBeforePosition(), getIndentEditsOfMovingBlock(), getOptions(), getVisibleColumnFromPosition(), _getWordBeforePosition() (+5 more)

### Community 127 - "z"
Cohesion: 0.06
Nodes (5): setSelection(), _setSelectionImpl(), setSelections(), setTooltip(), z()

### Community 129 - "on"
Cohesion: 0.09
Nodes (39): Ct(), it(), t(), ze(), Gh(), Ne(), Qt(), Qu() (+31 more)

### Community 131 - ".toString"
Cohesion: 0.07
Nodes (14): addExtraLib(), be(), _doOpenExternal(), _fireOnDidExtraLibsChangeSoon(), getModelProperty(), _getOrCreateModelManager(), handleItemDidShow(), items() (+6 more)

### Community 132 - "tre"
Cohesion: 0.07
Nodes (36): bx(), bye(), h(), dFe(), e9(), EHe(), s(), jf() (+28 more)

### Community 135 - "w"
Cohesion: 0.07
Nodes (6): pe, M(), w(), w(), y, ye()

### Community 136 - "_onModelChange"
Cohesion: 0.07
Nodes (28): _addGutterDecoration(), applyEdits(), _applyRedo(), _applyUndo(), _applyUndoRedoEdits(), _disposeAllLenses(), findDefinition(), getCommands() (+20 more)

### Community 137 - "_hookListeners"
Cohesion: 0.07
Nodes (30): acceptInput(), _cancelScheduler(), _computeLabelFontSize(), focusedHoverPartIndex(), _getOrCreateContentWidget(), _getOrCreateGlyphWidget(), _hideWidgets(), _hookListeners() (+22 more)

### Community 140 - "H"
Cohesion: 0.08
Nodes (5): z(), getLineIndentColumn(), H(), me, pushEditOperations()

### Community 142 - ".sort"
Cohesion: 0.08
Nodes (9): _computeGlyphMarginLanes(), q(), _findHoverAnchorCandidates(), getBreadcrumbItems(), getDocumentSymbols(), _getHintsRanges(), renderHoverParts(), shouldShowHoverAt() (+1 more)

### Community 143 - ".focus"
Cohesion: 0.12
Nodes (6): clearContents(), _createPointerHandlerHelper(), getInput(), _onListMouseDownOrTap(), renderItem(), _renderMarkerHover()

### Community 146 - "doComplete"
Cohesion: 0.15
Nodes (33): add(), addBooleanValueCompletion(), addDefaultValueCompletions(), addDollarSchemaCompletions(), addEnumValueCompletions(), addFillerValueCompletions(), addNullValueCompletion(), addSchemaValueCompletions() (+25 more)

### Community 147 - "u"
Cohesion: 0.07
Nodes (10): createActionGroups(), _ensureClipboardGetsEditorSelection(), getLanguageConfiguration(), r(), setData(), u(), setTextData(), showOrFocus() (+2 more)

### Community 149 - "scanNext"
Cohesion: 0.08
Nodes (31): advanceWhileChar(), co(), comment(), _escape(), escapedJavaScript(), findInScope(), findScope(), finishToken() (+23 more)

### Community 150 - "layout"
Cohesion: 0.08
Nodes (28): adjustHorizontalHoverPosition(), adjustHoverMaxHeight(), adjustVerticalHoverPosition(), afterRender(), _applyMaxDimensions(), cancelInput(), cancelSuggestWidget(), computeXCordinate() (+20 more)

### Community 153 - "zoe"
Cohesion: 0.08
Nodes (25): ce(), so(), _t(), rI(), Je(), K(), Mr(), zoe() (+17 more)

### Community 154 - ".constructor"
Cohesion: 0.16
Nodes (3): _findLanguageBoundaries(), registerSelector(), _updateDecorations()

### Community 155 - "w"
Cohesion: 0.09
Nodes (18): a(), an(), d(), Ea(), Ei(), Fi(), fr(), gi() (+10 more)

### Community 156 - "lH"
Cohesion: 0.08
Nodes (23): _7e(), ck(), f7e(), lH(), be(), De(), _e(), ee() (+15 more)

### Community 157 - "_updateState"
Cohesion: 0.08
Nodes (27): acceptPrevSuggestion(), accessibleDiffViewerPrev(), _createModelData(), _deltaSelectedInlineCompletionIndex(), _doInsert(), findScrollWidgetState(), getAlternativeVersionId(), getCreationOptions() (+19 more)

### Community 158 - "t"
Cohesion: 0.09
Nodes (4): activeService(), t(), removeItemWithSeparator(), selected()

### Community 159 - "setNode"
Cohesion: 0.08
Nodes (28): acceptKeyword(), adoptChild(), attachTo(), _internalParseIfStatement(), _parseIfStatement(), _parseTerm(), setContent(), setDeclarations() (+20 more)

### Community 161 - "c"
Cohesion: 0.10
Nodes (3): c(), markAsDisposed(), g()

### Community 165 - "getValue"
Cohesion: 0.09
Nodes (23): applyEditAndShowIfNeeded(), at(), bt(), createScriptURL(), di(), getLanguage(), getLinesContent(), getValue() (+15 more)

### Community 166 - "V"
Cohesion: 0.16
Nodes (26): advanceIfRegExp(), an(), cn(), b(), doQuoteComplete(), doTagComplete(), En(), findDocumentLinks() (+18 more)

### Community 167 - "o"
Cohesion: 0.11
Nodes (25): bt(), a(), c(), m(), p(), l(), o(), u() (+17 more)

### Community 168 - ".dispose"
Cohesion: 0.08
Nodes (5): addExclusiveWidget(), getLoadStatus(), hasContent(), _onDidRemoveEditor(), _scheduleRender()

### Community 169 - ".containsPosition"
Cohesion: 0.09
Nodes (21): _applyTheme(), checkCursorPosition(), clearRanges(), closeMessage(), computeRequiredHeight(), computeStyles(), _getSortedHighlights(), _getWord() (+13 more)

### Community 173 - "A"
Cohesion: 0.13
Nodes (13): bi(), F(), L(), A(), N(), F(), l(), hn() (+5 more)

### Community 174 - "._scheduleRender"
Cohesion: 0.10
Nodes (19): addContentWidget(), addGlyphMarginWidget(), addOverlayWidget(), _applyDimensions(), change(), _findAvailableSpaceVertically(), handleEvents(), _layoutContentWidget() (+11 more)

### Community 175 - ".render"
Cohesion: 0.13
Nodes (3): _getVerticalOffsetAfterPosition(), setPosition(), setWidth()

### Community 176 - ".isIPosition"
Cohesion: 0.09
Nodes (21): _disposeFocusStickyScrollStore(), goToFocused(), _needsUpdate(), _onDidResize(), _onTokensChange(), readConfiguration(), _readConfigurationChange(), _registerMouseListeners() (+13 more)

### Community 178 - "doHover"
Cohesion: 0.16
Nodes (23): f(), a(), c(), D(), C(), T(), doHover(), D() (+15 more)

### Community 179 - ".getLineMinColumn"
Cohesion: 0.11
Nodes (3): handleInitialized(), saveViewState(), serializeState()

### Community 182 - "p"
Cohesion: 0.14
Nodes (10): ar(), constructor(), l(), d(), g(), ii(), lr(), p (+2 more)

### Community 184 - "create"
Cohesion: 0.11
Nodes (6): create(), getInitialState(), _myTokenize(), _nestedTokenize(), _safeRuleName(), tokenize()

### Community 185 - "setScrollPosition"
Cohesion: 0.13
Nodes (17): goToBottom(), goToTop(), pageDown(), pageUp(), scrollDown(), scrollLeft(), scrollRight(), scrollTop() (+9 more)

### Community 187 - "o"
Cohesion: 0.10
Nodes (5): createDiffProvider(), insertColor(), o(), register(), showWhile()

### Community 191 - ".constructor"
Cohesion: 0.11
Nodes (8): _applyLayout(), _createTextAreaHandlerHelper(), _flushAccumulatedAndRenderNow(), getOffsetForColumn(), getScrolledVisiblePosition(), getScrollLeft(), getScrollTop(), installWebKitWriteTextWorkaround()

### Community 193 - "n"
Cohesion: 0.16
Nodes (21): an(), o(), Br(), doHover(), doResolve(), fr(), i(), n() (+13 more)

### Community 196 - ".append"
Cohesion: 0.13
Nodes (8): append(), _fillBody(), _fillContainer(), _fillHead(), _fillTitleIcon(), _getActionBarOptions(), _getFocusedReference(), _onTitleClick()

### Community 197 - ".getId"
Cohesion: 0.13
Nodes (3): addCodeEditor(), addDiffEditor(), removeCodeEditor()

### Community 199 - "i"
Cohesion: 0.10
Nodes (3): getMarkerList(), i(), relative()

### Community 201 - ".update"
Cohesion: 0.12
Nodes (7): clearFocus(), domFocus(), getCheckedElements(), onDidChangeSelection(), setCheckedElements(), setFocusedElements(), setSelectedElements()

### Community 202 - ".set"
Cohesion: 0.15
Nodes (3): getContribution(), _moveIndex(), _updateLensStyle()

### Community 203 - "Ee"
Cohesion: 0.13
Nodes (3): Ee, getKeyboardNavigationLabel(), de()

### Community 207 - "._getModel"
Cohesion: 0.13
Nodes (7): computeDefaultDocumentColors(), computedUnicodeHighlights(), computeMoreMinimalEdits(), computeWordRanges(), findSectionHeaders(), navigateValueSet(), _workerWithResources()

### Community 208 - "q"
Cohesion: 0.12
Nodes (4): executeCommand(), q(), registerCommand(), registerCommandAlias()

### Community 210 - "he"
Cohesion: 0.11
Nodes (3): _createUniqueUri(), he(), onDidChangeFocus()

### Community 211 - ".constructor"
Cohesion: 0.15
Nodes (5): getEOL(), getOffsetAt(), handler(), isFrozen(), pushEOL()

### Community 213 - "doProvideWithEditorSymbols"
Cohesion: 0.18
Nodes (6): doProvideWithEditorSymbols(), doProvideWithoutEditorSymbols(), provideLabelPick(), provideWithoutTextEditor(), provideWithTextEditor(), revealRangeInCenter()

### Community 217 - "doComplete"
Cohesion: 0.15
Nodes (18): ci(), convertCompletionList(), convertContents(), de(), di(), doComplete(), g(), N() (+10 more)

### Community 220 - "V"
Cohesion: 0.13
Nodes (6): P(), createSnapshot(), getActiveCodeEditor(), getLineChanges(), runDOMCommand(), V()

### Community 221 - "_setDocumentSemanticTokens"
Cohesion: 0.14
Nodes (17): _copy(), createGrammarTokens(), createPreferredTokenProvider(), createTokens(), createTreeSitterTokens(), _emitModelTokensChangedEvent(), _fetchDocumentSemanticTokensNow(), hasCompleteSemanticTokens() (+9 more)

### Community 225 - "[pset]/page.tsx"
Cohesion: 0.24
Nodes (13): generateMetadata(), LessonPage(), LessonPageProps, generateMetadata(), PSetPage(), PSetPageProps, getLesson(), getPSet() (+5 more)

### Community 227 - ".unshift"
Cohesion: 0.12
Nodes (11): getActions(), getAdditionalCommandPicks(), getCommandPicks(), _getPicks(), getSupportedActions(), getTfIdfChunk(), hasAdditionalCommandPicks(), setAdditionalSecondaryActions() (+3 more)

### Community 239 - "positionAt"
Cohesion: 0.15
Nodes (15): doValidation(), ei(), Kn(), Kr(), mt(), nn(), nr(), nt() (+7 more)

### Community 240 - "deltaDecorations"
Cohesion: 0.20
Nodes (9): _changeDecorationImpl(), _changeDecorationOptionsImpl(), changeDecorations(), deltaDecorations(), _deltaDecorationsImpl(), removeDecorations(), removeDecorationsByType(), _setTrackedRange() (+1 more)

### Community 241 - ".register"
Cohesion: 0.16
Nodes (4): ae(), gutterState(), qe(), _updateGutterLightBulbTitleAndIcon()

### Community 245 - ".collapseToStart"
Cohesion: 0.18
Nodes (10): closeWidget(), compareByKindAndScore(), compareByScore(), doGetSymbolPicks(), goToNextOrPreviousReference(), _gotoReference(), openCodeEditor(), openReference() (+2 more)

### Community 246 - "_start"
Cohesion: 0.15
Nodes (13): _createFindWidget(), disposeModel(), getGlobalBufferTerm(), highlightFindOptions(), isTooLargeForSyncing(), _onStateChanged(), saveQueryState(), setGlobalBufferTerm() (+5 more)

### Community 248 - "showHover"
Cohesion: 0.18
Nodes (11): delay(), doHideHover(), _getHoverContext(), hideHover(), _intersectionChange(), isInstantlyHovering(), _keyDown(), _keyUp() (+3 more)

### Community 250 - "T"
Cohesion: 0.20
Nodes (14): advance(), advanceIfChar(), advanceIfChars(), advanceUntilChar(), advanceUntilChars(), advanceUntilRegExp(), eos(), getSource() (+6 more)

### Community 252 - ".setEndPosition"
Cohesion: 0.18
Nodes (3): adjustSelection(), _getTrackedRange(), toggleSearchScope()

### Community 253 - "_doTriggerQuickSuggest"
Cohesion: 0.19
Nodes (5): _doTriggerQuickSuggest(), isInSnippet(), provideInlineCompletions(), tokenizeIfCheap(), _updateTriggerCharacters()

### Community 258 - "getLanguageId"
Cohesion: 0.19
Nodes (4): createOptions(), getLanguageId(), getWordUntilPosition(), isEnabled()

### Community 263 - "computeCompletions"
Cohesion: 0.18
Nodes (13): ai(), computeCompletions(), doComplete2(), D(), O(), li(), oi(), providePathSuggestions() (+5 more)

### Community 277 - "getMatchingSchemas"
Cohesion: 0.35
Nodes (11): addFilePatternAssociation(), addSchemaHandle(), createCombinedSchema(), getMatchingSchemas(), getOrAddSchemaHandle(), getResolvedSchema(), getSchemaForResource(), getUnresolvedSchema() (+3 more)

### Community 278 - "fnt"
Cohesion: 0.31
Nodes (11): c2e(), F7(), fnt(), gnt(), int(), l2e(), Mg(), mnt() (+3 more)

### Community 282 - "addAction"
Cohesion: 0.22
Nodes (8): addAction(), addCommand(), appendMenuItem(), appendMenuItems(), createContextKey(), getCodeActions(), getModifiedEditor(), renderMarkerStatusbar()

### Community 286 - "_recomputeOptions"
Cohesion: 0.20
Nodes (9): _computeOptions(), _readEnvConfiguration(), _readFontInfo(), _recomputeOptions(), setGlyphMarginDecorationLaneCount(), setIsDominatedByLongLines(), setModelLineCount(), setReservedHeight() (+1 more)

### Community 287 - "._getForeignProxy"
Cohesion: 0.24
Nodes (4): _createEditorWorkerHost(), _createFallbackLocalWorker(), _getOrCreateWorker(), _getProxy()

### Community 294 - ".isBasicASCII"
Cohesion: 0.28
Nodes (3): _getLineHtml(), mightContainNonBasicASCII(), mightContainRTL()

### Community 306 - "getFocusedCodeEditor"
Cohesion: 0.25
Nodes (7): _checkContextKey(), getFocusedCodeEditor(), hasTextFocus(), hasWidgetFocus(), isFocused(), listCodeEditors(), removeDecorationType()

### Community 307 - "readResources"
Cohesion: 0.25
Nodes (7): clearInternalState(), clearResourcesState(), computeResourcesStateHash(), fallbackWriteText(), readResources(), readText(), writeText()

### Community 309 - "_setHasFocus"
Cohesion: 0.29
Nodes (6): focusTextArea(), _installSelectionChangeListener(), refreshFocusState(), _setAndWriteTextAreaState(), _setHasFocus(), writeNativeTextAreaContent()

### Community 331 - "FT"
Cohesion: 0.33
Nodes (6): Oa(), nV(), dr(), FT(), rD(), z()

### Community 334 - "getContainerDomNode"
Cohesion: 0.33
Nodes (6): activeContainer(), containers(), getContainerDomNode(), hideContextView(), mainContainer(), showContextView()

### Community 348 - "License"
Cohesion: 0.40
Nodes (4): Curriculum content — CC BY-NC-SA 4.0, License, Platform code — MIT License, Third-party assets

### Community 373 - "LT"
Cohesion: 0.40
Nodes (5): u(), Qc(), tV(), LT(), Po()

### Community 384 - "getCandidateStickyLinesIntersectingFromStickyModel"
Cohesion: 0.50
Nodes (3): getCandidateStickyLinesIntersecting(), getCandidateStickyLinesIntersectingFromStickyModel(), updateIndex()

## Knowledge Gaps
- **197 isolated node(s):** `LESSON_COUNT`, `COMPARISON`, `STACK`, `PIPELINE`, `FAQ` (+192 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 3266 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **366 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_` connect `_` to `.getIcon`, `Yn`, `get`, `I`, `m`, `E`, `k`, `a`, `d`, `n`, `g`, `p`, `.constructor`, `a`, `s`, `y`, `c`, `b`, `r`, `t`, `o`, `w`, `l`, `push`, `.isEmpty`, `l`, `pe`, `.get`, `f`, `ge`, `add`, `getUriComparisonKey`, `.getLineCount`, `u`, `ue`, `.show`, `.render`, `._register`, `s`, `v`, `.move`, `_trigger`, `_update`, `ie`, `.contains`, `.constructor`, `.getLineContent`, `z`, `h`, `.update`, `.toString`, `.getLineMaxColumn`, `.convertViewPositionToModelPosition`, `_onModelChange`, `_hookListeners`, `._executeEdit`, `.stop`, `H`, `._primary`, `.sort`, `.focus`, `.renderText`, `.constructor`, `u`, `.handleEvents`, `layout`, `n`, `.constructor`, `_updateState`, `t`, `.substring`, `.forceTokenization`, `.getStartLineNumber`, `getValue`, `.dispose`, `.containsPosition`, `pushStackElement`, `.constructor`, `._scheduleRender`, `.render`, `.isIPosition`, `.getContext`, `.getLineMinColumn`, `j`, `.splice`, `create`, `setScrollPosition`, `.constructor`, `o`, `W`, `Ce`, `.constructor`, `.append`, `.getId`, `m`, `i`, `.clear`, `.update`, `.set`, `Ee`, `.PrettifyChanges`, `.equals`, `._getModel`, `q`, `join`, `he`, `.constructor`, `getMetadata`, `doProvideWithEditorSymbols`, `._doDispatch`, `._move`, `.isVisible`, `V`, `_setDocumentSemanticTokens`, `._addZone`, `._createAndCacheServiceInstance`, `.isUri`, `.unshift`, `g`, `d`, `de`, `.doRegisterDefaultConfigurations`, `x`, `.push`, `._create`, `._beginSessionIfNeeded`, `deltaDecorations`, `.register`, `.set`, `.warn`, `.collapseToStart`, `_start`, `ye`, `showHover`, `.error`, `.setEndPosition`, `_doTriggerQuickSuggest`, `getOrCreate`, `.pop`, `.merge`, `getLanguageId`, `.fire`, `._updateBlinking`, `.appendChild`, `.getInstance`, `.with`, `.getStorage`, `.linesVisibleRangesForRange`, `getDecorationRange`, `.getChild`, `.constructor`, `._doFindNextWordOnLine`, `.onMouseEnter`, `._backgroundTokenizeForAtLeast1ms`, `addAction`, `.handleChildrenChanged`, `.reduce`, `_recomputeOptions`, `._getForeignProxy`, `.doHitTest`, `.isBasicASCII`, `._showImpl`, `.alloc`, `._enter`, `getFocusedCodeEditor`, `readResources`, `.getWordAtPosition`, `_setHasFocus`, `.match`, `.compute`, `.leftPosition`, `.getVerticalOffsetForLineNumber`, `_createCoordinatedRendering`, `._prepareRender`, `.computeStickyModel`, `getContainerDomNode`, `.compute`, `.getDecorationsInRange`, `we`, `.create`, `.empty`, `.clone`, `.delta`, `.dispose`, `.containsRTL`, `.getIndentMetadata`, `for`, `.as`, `.regex`, `.handleBeginTransaction`, `.emitMatchIndex`, `getCandidateStickyLinesIntersectingFromStickyModel`, `.getTooltip`, `.moveToBeginningOfLine`, `_resolveCodeLensesInViewport`, `.peek`, `_toNormalizedKeybindingItems`, `._viewOverlaysRender`, `_configureFont`, `getEdit`, `getEditorType`, `.getInlineClassNameOfLevel`, `.renderForScreenReader`, `.computeMinIndentation`, `.forceRenderingAbove`, `getMarker`, `.stopForceRenderingAbove`?**
  _High betweenness centrality (0.451) - this node is a cross-community bridge._
- **Why does `Li()` connect `get` to `getValue`, `Ci`, `jt`, `Cr`, `r`, `Vce`, `_`, `Rn`, `aoe`, `Jn`, `w4`, `Yn`?**
  _High betweenness centrality (0.313) - this node is a cross-community bridge._
- **Why does `aoe()` connect `aoe` to `tsWorker.js`, `s`, `r`, `"src/compiler/parser.ts"`, `d2`, `Rn`, `vb`, `fnt`, `a`, `Jn`, `w4`, `Yn`, `get`, `e`, `h_`, `$h`, `_e`, `ct`, `ga`, `Ci`, `Cr`, `Da`, `Re`, `Pi`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `_` (e.g. with `S()` and `qe()`) actually correct?**
  _`_` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `aoe()` (e.g. with `Li()` and `ao()`) actually correct?**
  _`aoe()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 389 inferred relationships involving `d2()` (e.g. with `Se()` and `aD()`) actually correct?**
  _`d2()` has 389 INFERRED edges - model-reasoned connections that need verification._
- **Are the 385 inferred relationships involving `t()` (e.g. with `_5e()` and `$a()`) actually correct?**
  _`t()` has 385 INFERRED edges - model-reasoned connections that need verification._