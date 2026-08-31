## Project

Freelance client site: headless frontend for AMLA (ml-archi), built with FaustWP + Next.js against a separate headless WordPress backend (`amla-backend-staging.saguin.com`). Scaffolded from the same cs-front-derived starter as the sibling `rectangulo.com.mx` repo. Durable notes (architecture, decisions, status) live in the `wolf-claude-memory` KB — see `wiki/projects/amla.md` and `wiki/concepts/faust-headless-wordpress-stack.md`. Target: ship during September 2026.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
