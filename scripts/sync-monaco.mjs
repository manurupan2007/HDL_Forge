import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const src = resolve("node_modules/monaco-editor/min/vs");
const dest = resolve("public/monaco/vs");

if (!existsSync(src)) {
  console.error("monaco-editor min/vs not found — run `npm install` first.");
  process.exit(1);
}

cpSync(src, dest, { recursive: true, force: true });
console.log(`synced ${src} -> ${dest}`);