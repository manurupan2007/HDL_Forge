import type * as Monaco from "monaco-editor";

const SV_KEYWORDS = [
  "accept_on","alias","always","always_comb","always_ff","always_latch",
  "and","assert","assume","automatic","before","begin","bind","bins",
  "binsof","bit","break","buf","bufif0","bufif1","byte","case","casex",
  "casez","cell","checker","class","class_keyword","clocking","cmos",
  "config","const","constraint","context","continue","cover","covergroup",
  "coverpoint","cross","cvp","cycle","default","defparam","design","disable",
  "dist","do","edge","else","end","endcase","endchecker","endclass",
  "endclocking","endconfig","endfunction","endgenerate","endinterface",
  "endpackage","endprimitive","endprogram","endproperty","endspecify",
  "endsequence","endtable","endtask","enum","event","export","extends",
  "extern","final","first_match","for","force","foreach","forever","fork",
  "forkjoin","function","generate","genvar","global","highz0","highz1",
  "if","iff","ifnone","ignore_bins","illegal_bins","implies","implies",
  "import","incdir","include","initial","inout","input","inside","instance",
  "int","integer","interconnect","interface","intersect","join","join_any",
  "join_none","large","let","liblist","library","local","localparam",
  "logic","longint","macromodule","mailbox","matches","medium","modport",
  "module","nand","negedge","nettype","new","nexttime","nor","noshowcancelled",
  "not","notif0","notif1","null","or","output","packed","parameter","pmos",
  "posedge","primitive","priority","program","property","protected","pull0",
  "pull1","pulldown","pullup","pulsestyle_onevent","pulsestyle_ondetect",
  "pure","rand","randc","randcase","randsequence","rcmos","real","realtime",
  "ref","register","reject_on","release","repeat","return","rnmos","rpmos",
  "rtran","rtranif0","rtranif1","sample","scalared","sequence","shortint",
  "shortreal","showcancelled","signed","small","solve","specify","specparam",
  "static","string","strong","strong0","strong1","struct","super","supply0",
  "supply1","sync_accept_on","sync_reject_on","tagged","task","ternary",
  "this","through","time","timeprecision","timeunit","tran","tranif0",
  "tranif1","tri","tri0","tri1","triand","trior","trireg","type","typedef",
  "union","unique","unique0","unsigned","until","until_with","untyped",
  "use","var","vectored","virtual","void","wait","wait_order","wand",
  "weak","weak0","weak1","while","wildcard","wire","with","within","wor",
  "xnor","xor",
];

const SV_TYPES = [
  "logic","bit","byte","shortint","int","longint","integer","time","real",
  "shortreal","string","event","wire","wand","wor","tri","tri0","tri1",
  "supply0","supply1","reg","uwire","signed","unsigned",
];

const SV_BUILTINS = [
  "$accept_on","$acos","$acosh","$assert","$assume","$asinh","$atan",
  "$atan2","$atanh","$bits","$bitstoreal","$bitstoshortreal","$cast",
  "$ceil","$clog2","$cos","$cosh","$countones","$dimensions","$display",
  "$displayb","$displayh","$displayo","$dist_chi_square","$dist_erlang",
  "$dist_normal","$dist_poisson","$dist_t","$dist_uniform","$dumpall",
  "$dumpfile","$dumpoff","$dumpon","$dumpports","$dumpportsall",
  "$dumpportsoff","$dumpportson","$dumpvars","$exit","$exp","$fell",
  "$fclose","$fdisplay","$fdisplayb","$fdisplayh","$fdisplayo","$feof",
  "$ferror","$fflush","$fgets","$finish","$fmonitor","$fopen","$fprintf",
  "$frewind","$fwrite","$fwriteb","$fwriteh","$fwriteo","$get_coverage",
  "$get_sample_coverage","$getfunction","$height","$hypot","$increment",
  "$info","$init","$itor","$left","$ln","$ln10","$load_coverage_db",
  "$log10","$monitor","$monitorb","$monitorh","$monitoro","$onehot",
  "$onehot0","$past","$patterned","$posedge","$pow","$printtimescale",
  "$printf","$priority","$random","$readmemb","$readmemh","$readmemx",
  "$realtime","$realtobits","$restore","$rtoi","$sample","$set_coverage_param",
  "$sin","$sinh","$size","$sqrt","$stable","$stop","$store_coverage_db",
  "$store_coverage_per_file","$store_coverage_per_instance",
  "$store_coverage_per_type","$store_coverage_per_assert","$store_coverage_per_assume",
  "$store_coverage_per_cover","$store_coverage_per_option","$store_coverage_per_toggle",
  "$store_coverage_per_fsm","$store_coverage_per_expression","$store_coverage_per_statement",
  "$store_coverage_per_branch","$store_coverage_per_condition",
  "$store_coverage_per_glitch","$store_coverage_per_transition",
  "$store_coverage_per_statement","$store_coverage_per_assertion",
  "$store_coverage_per_cover","$store_coverage_per_assume",
  "$store_coverage_per_expression","$store_coverage_per_option",
  "$swrite","$system","$tan","$tanh","$test_plusargs","$time",
  "$timeformat","$typename","$unpacked_dimensions","$upper","$value$plusargs",
  "$warning","$write","$writeb","$writeh","$writeo",
];

export const VERILOG_THEME: Parameters<typeof Monaco.editor.defineTheme>[1] = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "e7edf3" },
    { token: "comment", foreground: "6b7280", fontStyle: "italic" },
    { token: "comment.doc", foreground: "6b7280", fontStyle: "italic" },
    { token: "keyword", foreground: "60a5fa" },
    { token: "keyword.flow", foreground: "60a5fa" },
    { token: "keyword.flow.control", foreground: "60a5fa" },
    { token: "type", foreground: "5eead4" },
    { token: "predefined", foreground: "e879f9" },
    { token: "number", foreground: "d29922" },
    { token: "number.hex", foreground: "d29922" },
    { token: "number.float", foreground: "d29922" },
    { token: "number.binary", foreground: "d29922" },
    { token: "string", foreground: "3fb950" },
    { token: "string.escape", foreground: "3fb950" },
    { token: "operator", foreground: "9aa4b2" },
    { token: "delimiter", foreground: "9aa4b2" },
    { token: "variable", foreground: "e7edf3" },
    { token: "identifier", foreground: "e7edf3" },
  ],
  colors: {
    "editor.background": "#0c1118",
    "editor.foreground": "#e7edf3",
    "editorLineNumber.foreground": "#3f4b5a",
    "editorLineNumber.activeForeground": "#9aa4b2",
    "editorCursor.foreground": "#3b82f6",
    "editor.selectionBackground": "#1e3a5f44",
    "editor.lineHighlightBackground": "#1e3a5f22",
    "editorIndentGuide.background1": "#1b232d",
    "editorIndentGuide.activeBackground1": "#2f3a49",
    "editorIndentGuide.background": "#1b232d",
    "editorIndentGuide.activeBackground": "#2f3a49",
    "editorWhitespace.foreground": "#1b232d",
    "editorBracketMatch.background": "#1e3a5f33",
    "editorBracketMatch.border": "#3b82f644",
    "editorGutter.background": "#0c1118",
    "minimap.background": "#0c1118",
    "scrollbarSlider.background": "#2f3a4988",
    "scrollbarSlider.hoverBackground": "#3b82f666",
    "scrollbarSlider.activeBackground": "#3b82f6aa",
  },
};

const MONARCH_TOKENIZER: Monaco.languages.IMonarchLanguage = {
  defaultToken: "",
  tokenPostfix: ".sv",
  ignoreCase: true,

  keywords: SV_KEYWORDS,
  typeKeywords: SV_TYPES,
  builtin: SV_BUILTINS,

  operators: [
    "<=",">=","==","!=", "===","!==","==?","!==?",
    "<<",">>",">>>","<<<",
    "&&","||","&","|","^","~","!","~&","~|","~^",
    "+","-","*","/","%","**",
    "++","--",
    "?",":",
  ],

  symbols: /[=><!~?:&|+\-*\/\^%#@]+/,
  digits: /\d+(_+\d+)*/,
  numberOct: /[0-7]+(_+[0-7]+)*/,
  numberBin: /[01xXzZ_?]+(_+[01xXzZ_?]+)*/,
  numberHex: /[0-9a-fA-FxXzZ_?]+(_+[0-9a-fA-FxXzZ_?]+)*/,

  tokenizer: {
    root: [
      [/(?:\/\/|%%).*/, "comment"],
      [/\/\*/, "comment", "@comment"],
      [/"/, { token: "string.quote", next: "@string" }],

      [/`[a-zA-Z_]\w*/, "keyword"],
      [/\$[a-zA-Z_]\w*/, "predefined"],

      [/\d+'[bB][01xXzZ_?]+/, "number"],
      [/\d+'[oO][0-7xXzZ_?]+/, "number"],
      [/\d+'[dD][0-9xXzZ_?]+/, "number"],
      [/\d+'[hH][0-9a-fA-FxXzZ_?]+/, "number"],
      [/\d+'[sS][bBoOdDhH][0-9a-fA-FxXzZ_?]+/, "number"],
      [/0[xX][0-9a-fA-F_?]+/, "number.hex"],
      [/\d+\.?\d*([eE][+-]?\d+)?/, "number"],

      [/[a-zA-Z_]\w*/, {
        cases: {
          "@typeKeywords": "type",
          "@keywords": "keyword",
          "@builtin": "predefined",
          "@default": "identifier",
        },
      }],

      [/\(/, { token: "delimiter.parenthesis" }],
      [/\)/, { token: "delimiter.parenthesis" }],
      [/\[/, { token: "delimiter.square" }],
      [/\]/, { token: "delimiter.square" }],
      [/{/, { token: "delimiter.curly" }],
      [/\}/, { token: "delimiter.curly" }],
      [/;/, { token: "delimiter.semicolon" }],
      [/,/, { token: "delimiter.comma" }],
      [/\./, { token: "delimiter.period" }],

      [/@|::|->|=>|#|\||::/, "operator"],
      [/[=><!~?:&|+\-*\/\^%#@]+/, "operator"],
    ],

    comment: [
      [/[^/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[/*]/, "comment"],
    ],

    string: [
      [/[^"\\]+/, "string"],
      [/\\./, "string.escape"],
      [/"/, { token: "string.quote", next: "@pop" }],
    ],
  },
};

let languageRegistered = false;
let themeDefined = false;

export function ensureVerilogLanguage(monaco: typeof Monaco) {
  if (languageRegistered) return;
  languageRegistered = true;

  monaco.languages.register({
    id: "verilog",
    extensions: [".sv", ".svh", ".v"],
    aliases: ["Verilog", "SystemVerilog", "Verilog/SystemVerilog"],
  });
  monaco.languages.setMonarchTokensProvider("verilog", MONARCH_TOKENIZER);

  if (!themeDefined) {
    themeDefined = true;
    monaco.editor.defineTheme("hdlforge", VERILOG_THEME);
  }
}