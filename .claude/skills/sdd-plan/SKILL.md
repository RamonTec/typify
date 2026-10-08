---
name: sdd-plan
description: Fase 2 del SDD de Typify. A partir de una spec aprobada, redacta plan.md con el diseño técnico, contratos, archivos afectados, análisis de impacto con CodeGraph, baseline de build, lint y tests, estrategia de tests, riesgos y decisiones. Úsalo cuando el usuario quiera planificar, diseñar o decidir cómo implementar una feature especificada, o aprobar un plan.
argument-hint: "[feature] [aprobar]"
---

# SDD fase 2 — Planificar

Entrada del usuario: `$ARGUMENTS` (si no se sustituyó, usa el mensaje que invocó este skill).

Lee primero `docs/sdd/constitution.md` y las reglas comunes del skill `sdd` (`.claude/skills/sdd/SKILL.md`).

## Precondición
`spec.md` de la feature con `estado: aprobado`. Si no lo está, detente y recomienda `/sdd-spec`.
Si la entrada es "aprobar" (o el usuario aprueba en el chat), salta al paso 6.

## Pasos

### 1. Entender la spec
Lee `spec.md` completo. Cada AC debe quedar cubierto por el diseño.

### 2. Analizar el código
- Localiza los puntos de extensión con `codegraph_context` y `codegraph_search`.
- Para cada símbolo existente que vayas a modificar, ejecuta `codegraph_impact` o `codegraph_callers`
  y anota los consumidores en "Archivos afectados".
- Busca servicios, hooks y componentes reutilizables antes de proponer código nuevo (P2, P5).
- Si el diseño toca áreas de UI, React o Zod, consulta los skills de `.agents/skills/` que apliquen
  (`react-best-practices`, `composition-patterns`, `zod`, `tailwind-css-patterns`, `accessibility`)
  leyendo su `SKILL.md`.
- Si tienes subagentes disponibles, puedes delegar el análisis y la redacción en `sdd-architect`.

### 3. Medir la baseline
Ejecuta y anota en la tabla "Baseline":
- `npm run build`: ¿compila?
- `npm run lint`: nº de errores (línea `✖ N problems`).
- `npm test`: tests que pasan y que fallan, con los nombres de los que fallan.

### 4. Redactar el plan
Rellena `plan.md`:
- **Resumen técnico** y **Decisiones** (`D1`, `D2`...) con las alternativas descartadas.
- **Check de constitución**: un principio por fila. Toda excepción se justifica.
- **Contratos**: firmas TypeScript de las funciones y tipos públicos nuevos o modificados.
- **Archivos afectados** con tipo de cambio y consumidores.
- **Estrategia de tests**: cada AC con su test unitario (`src/__tests__/<servicio>.test.ts`) o su verificación manual.
- **Riesgos** con mitigación.
- **Fases** de alto nivel que guiarán `tasks.md`.
- Si aparece una dependencia nueva, justifícala (P7).

### 5. Presentar
- Marca la sección "B. Calidad del plan" de `checklist.md`.
- Pon `estado: borrador` y presenta: enfoque, archivos afectados, riesgos principales y decisiones
  que el usuario debería revisar. Pide aprobación explícita.
- Si al planificar descubres que la spec es incompleta o contradictoria, no lo resuelvas en el plan:
  propón el cambio de spec y vuelve a `/sdd-spec`.

### 6. Aprobación
Solo con aprobación explícita: pon `estado: aprobado`, actualiza la fecha y recomienda `/sdd-tasks`.

## No hacer
- No modificar `src/`.
- No cambiar el alcance definido en la spec.
