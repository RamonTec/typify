# Spec-Driven Development (SDD)

Flujo de trabajo para desarrollar features en Typify con Claude Code u OpenCode.
Cada feature pasa por cuatro artefactos versionados en `docs/features/NNN-slug/`.

```
idea ──/sdd-spec──▶ spec.md ──/sdd-plan──▶ plan.md ──/sdd-tasks──▶ tasks.md ──/sdd-implement──▶ código ──/sdd-verify──▶ checklist.md
         (qué/por qué)        (cómo)                 (orden)                     (+ tests)                 (evidencia)
              ▲ aprobación          ▲ aprobación            ▲ aprobación
```

Entre fases el agente se detiene y pide aprobación. Nada avanza sin que el usuario lo apruebe.

## Comandos

Los mismos nombres funcionan en Claude Code (como skills) y en OpenCode (como comandos).

| Comando | Qué hace | Artefacto |
|---------|----------|-----------|
| `/sdd` | Muestra el estado de las features y el siguiente paso | — |
| `/sdd-spec <descripción>` | Crea la feature y redacta la spec. Resuelve ambigüedades preguntando | `spec.md` |
| `/sdd-plan [feature]` | Diseño técnico, impacto, baseline, riesgos | `plan.md` |
| `/sdd-tasks [feature]` | Desglosa el plan en tareas trazables y prepara el checklist | `tasks.md`, `checklist.md` |
| `/sdd-implement [feature] [T001\|fase]` | Implementa tareas en orden, test primero, marcando progreso | código, `tasks.md` |
| `/sdd-verify [feature]` | Ejecuta los gates, revisa cada AC contra el código, rellena el checklist | `checklist.md` |

Si no se indica la feature, se usa la **feature activa** (la más reciente sin completar).

## Agentes

| Agente | Rol | Lo usan |
|--------|-----|---------|
| `sdd-analyst` | Investiga el código y redacta/refina specs. No toca `src/` | `/sdd-spec` |
| `sdd-architect` | Diseña el plan y desglosa tareas. No toca `src/` | `/sdd-plan`, `/sdd-tasks` |
| `sdd-implementer` | Implementa tareas de `tasks.md` respetando la constitución | `/sdd-implement` |
| `sdd-reviewer` | Revisión independiente contra spec y gates. Solo lectura + comandos de verificación | `/sdd-verify` |

## Script de soporte

```bash
npm run sdd -- new mi-feature --title "Mi feature"   # crea docs/features/NNN-mi-feature desde plantillas
npm run sdd -- status                                # estado de todas las features
npm run sdd -- active                                # ruta de la feature activa
```

## Estados de los artefactos

Cada artefacto lleva un frontmatter `estado`:

- `pendiente` — plantilla sin rellenar
- `borrador` — redactado por el agente, esperando revisión
- `aprobado` — el usuario lo aprobó; la siguiente fase puede empezar
- `en-progreso` — solo `tasks.md`: implementación en curso
- `completado` — solo `tasks.md` y `checklist.md`: todo hecho y verificado

## Estructura

```
docs/
├── sdd/
│   ├── README.md          ← esta guía
│   ├── constitution.md    ← principios y quality gates
│   └── templates/         ← plantillas de spec, plan, tasks, checklist
└── features/
    ├── 001-mermaid-deserialize/   ← legado (formato previo, completada)
    └── NNN-slug/
        ├── spec.md
        ├── plan.md
        ├── tasks.md
        └── checklist.md

.claude/skills/sdd*/       ← lógica de cada fase (compartida: OpenCode también lee .claude/skills)
.claude/agents/sdd-*.md    ← subagentes para Claude Code
.opencode/agents/sdd-*.md  ← subagentes para OpenCode
.opencode/commands/sdd*.md ← comandos para OpenCode (envuelven los skills)
scripts/sdd.mjs            ← scaffolding y estado
```

Para cambiar cómo funciona una fase, edita solo su `SKILL.md`: los agentes y comandos de ambas herramientas lo leen de ahí.
