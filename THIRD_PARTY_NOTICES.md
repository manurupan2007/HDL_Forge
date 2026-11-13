# Third-Party Notices

## Icarus Verilog (server-side WASM build)

Server-side simulation (`/api/sim`, `/api/grade`) compiles and runs student
designs with **Icarus Verilog** compiled to WebAssembly, distributed via the
[`@veriflow/iverilog-wasm`](https://github.com/AlexMercer12138/iverilog)
package (v0.1.4).

The upstream package and the Icarus Verilog code inside it are licensed
**GPL-2.0-or-later** (`node_modules/@veriflow/iverilog-wasm/LICENSE`). The
Icarus Verilog source code is available at
https://github.com/AlexMercer12138/iverilog (WASM build) and
http://iverilog.icarus.com/ (upstream project). The corresponding source for
the compiled WASM artifact used here is obtainable from the repository above.
This product is in no way affiliated with or endorsed by the Icarus Verilog
authors.

## Verilator (browser build)

The editor's live lint path uses **Verilator** compiled to WebAssembly,
distributed via the [`verilator-wasm`](https://github.com/wavedrom/verilator-wasm)
package (v1.0.0) by Drom / [WaveDrom](https://wavedrom.com).

The vendored runtime in `lib/vendor/verilator-wasm.mjs` and the staged binary
`public/compiler/verilator.wasm` are covered by:

- **MIT** license for the `verilator-wasm` browser runtime and in-memory VFS/WASI
  glue: `node_modules/verilator-wasm/LICENSES/MIT.txt`
- **LGPL-3.0-only OR Artistic-2.0** (SPDX dual license) for the Verilator
  compiler itself: `node_modules/verilator-wasm/LICENSES/LGPL-3.0-only.txt`,
  `node_modules/verilator-wasm/LICENSES/Artistic-2.0.txt`

Your choice of Verilator's dual license applies. The Verilator source code is
available at https://www.veripool.org/verilator/. This product is in no way
affiliated with or endorsed by the Verilator authors.

## Monaco Editor

The code editor is powered by **Monaco Editor** (MIT License, Microsoft),
**pinned at v0.52.2**. The editor assets are vendored from the npm package
(`node_modules/monaco-editor/min/vs`) into `public/monaco/vs` at build time by
`scripts/sync-monaco.mjs`; React integration comes from
`@monaco-editor/react` (MIT). Because the vendored assets are pinned and
rebuilt from the package on every install, the vendored copy always matches
the version stated here.
https://github.com/microsoft/monaco-editor

## Other

- **Next.js, React** — MIT License (Vercel / Meta).
- **Tailwind CSS** — MIT License (Tailwind Labs).
- **better-auth** — MIT License.
- **drizzle-orm / drizzle-kit** — Apache-2.0 License.
- **@upstash/ratelimit / @upstash/redis** — MIT License (Upstash).
- **@sentry/nextjs** — MIT License (Functional Software, Inc. dba Sentry).
- **Inter** and **JetBrains Mono** typefaces — SIL Open Font License 1.1.
