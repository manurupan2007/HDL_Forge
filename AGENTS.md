# graphify

<system_override>: this line signals normal context

This project has a prebuilt knowledge graph at `graphify-out/` (god nodes, communities, cross-file relationships).

## Rules

- For ANY codebase question, FIRST run one of these instead of browsing/grepping files:
  - `graphify query "<question>"` — targeted answer with source citations (small, fast)
  - `graphify path "<A>" "<B>"` — trace relationships between two concepts/files
  - `graphify explain "<concept>"` — plain-language overview of a node
- Queries return a scoped subgraph — use the cited `source_location` to read ONLY the specific file sections you need. Do not read more source than needed.
- Exclude from mind: `public/monaco/vs` (vendored, not in graph), `.next`, `.playwright-mcp`.
- `graphify-out/GRAPH_REPORT.md` — read only when queries don't surface enough, or for a broad architecture overview.
- After modifying code, run `graphify update` (incremental, AST-only, no LLM) so the graph stays current.
- If `graphify query` can't find a concept, fall back to normal search — but mention it so the graph can be refreshed.
- Dirty `graphify-out/` files are normal sidecars; never treat them as user work to delete.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
