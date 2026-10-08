# Typify

Conversor JSON / Java / JWT → TypeScript, Zod, Mermaid y deserializadores. React 19 + TypeScript + Vite + Tailwind 4 + Zod 4.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — type-check + build
- `npm run lint` — ESLint
- `npm test` — Jest (`src/__tests__/**/*.test.ts`)
- `npm run sdd -- status` — estado de las features SDD

## Flujo de trabajo: Spec-Driven Development

Las features nuevas siguen SDD. Guía: `docs/sdd/README.md`. Principios no negociables: `docs/sdd/constitution.md`.

`/sdd` (estado) → `/sdd-spec` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement` → `/sdd-verify`

- Cada feature vive en `docs/features/NNN-slug/` con `spec.md`, `plan.md`, `tasks.md` y `checklist.md`.
- No se escribe código de producción sin `spec.md` y `plan.md` aprobados (salvo cambios triviales).
- Entre fases, pide aprobación explícita al usuario. Nunca marques un artefacto como `aprobado` por tu cuenta.
- La lógica de cada fase está en `.claude/skills/sdd*/SKILL.md` (Claude Code y OpenCode leen esa carpeta).
  Los subagentes `sdd-analyst`, `sdd-architect`, `sdd-implementer` y `sdd-reviewer` existen en `.claude/agents/` y `.opencode/agents/`.
- Skills de dominio (React, Zod, Tailwind, accesibilidad...) en `.agents/skills/`. Consúltalos al planificar o implementar en esas áreas.

<!-- CODEGRAPH_START -->
## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond and return structural information grep cannot.

### When to prefer codegraph over native search

Use codegraph for **structural** questions — what calls what, what would break, where is X defined, what is X's signature. Use native grep/read only for **literal text** queries (string contents, comments, log messages) or after you already have a specific file open.

| Question | Tool |
|---|---|
| "Where is X defined?" / "Find symbol named X" | `codegraph_search` |
| "What calls function Y?" | `codegraph_callers` |
| "What does Y call?" | `codegraph_callees` |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's signature / source / docstring" | `codegraph_node` |
| "Give me focused context for a task/area" | `codegraph_context` |
| "Survey an unfamiliar module/topic" | `codegraph_explore` |
| "What files exist under path/" | `codegraph_files` |
| "Is the index healthy?" | `codegraph_status` |

### Rules of thumb

- **Trust codegraph results.** They come from a full AST parse. Do NOT re-verify them with grep — that's slower, less accurate, and wastes context.
- **Don't grep first** when looking up a symbol by name. `codegraph_search` is faster and returns kind + location + signature in one call.
- **Don't chain `codegraph_search` + `codegraph_node`** when you just want context — `codegraph_context` is one call.
- **`codegraph_explore` is the heavy hitter** for unfamiliar areas — it returns full source from all relevant files in one call, but is token-heavy. If your harness supports parallel subagents (e.g., Claude Code's Task tool), spawn one for explore-class questions to keep main session context clean.
- **Index lag**: the file watcher debounces ~500ms behind writes; don't re-query immediately after editing a file in the same turn.

### If `.codegraph/` doesn't exist

The MCP server returns "not initialized." Ask the user: *"I notice this project doesn't have CodeGraph initialized. Want me to run `codegraph init -i` to build the index?"*
<!-- CODEGRAPH_END -->
