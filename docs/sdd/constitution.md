# Constitución del proyecto — Typify

Principios no negociables que toda spec, plan e implementación deben respetar.
Los agentes (Claude Code, OpenCode) la leen antes de planificar o implementar.
Solo el usuario puede modificarla; cualquier excepción se justifica en el `plan.md` de la feature.

## Stack
- React 19 + TypeScript 5.9 (strict) + Vite 7
- Tailwind CSS 4, `clsx` + `tailwind-merge` vía `src/utils/cn.ts`
- Zod 4 para validación y generación de esquemas
- Monaco Editor (`@monaco-editor/react`), Mermaid, `lucide-react`
- Jest 30 + ts-jest, entorno `node`, tests en `src/__tests__/**/*.test.ts`

## Principios

### P1 — Spec primero
No se escribe código de producción sin `spec.md` y `plan.md` aprobados por el usuario.
Excepción: cambios triviales (typos, ajustes de estilo de una línea, bumps de versión sin cambio de API).

### P2 — Lógica en servicios puros
La lógica de conversión, parseo y generación vive en `src/services/` como funciones puras,
sin dependencias de React, testeables de forma aislada. Los componentes solo orquestan.

### P3 — Tests como contrato
Cada criterio de aceptación con lógica pura tiene al menos un test automatizado.
Los criterios de UI se verifican manualmente y la verificación queda registrada en `checklist.md`.
Siempre que sea viable, el test se escribe antes que la implementación (rojo → verde).

### P4 — Tipado estricto
Nada de `any` salvo justificación explícita en el plan. Preferir `unknown` + narrowing,
uniones discriminadas y tipos inferidos de Zod (`z.infer`).

### P5 — Atomic design
Componentes en `src/components/{atoms,molecules,organisms,templates}`. Un componente nuevo
se ubica en el nivel más bajo que le corresponda. Hooks reutilizables en `src/hooks/`.

### P6 — Sin regresiones
Una feature no puede empeorar la baseline registrada en su `plan.md`
(errores de build, errores de lint, tests fallidos).

### P7 — Dependencias mínimas
No se añaden dependencias sin justificarlas en el plan (alternativas evaluadas, peso, mantenimiento).

### P8 — Estilo
- Mensajes de error visibles al usuario en español.
- Tipos generados en PascalCase.
- Sin comentarios que solo repitan el código. Sin emojis en código.
- Seguir el estilo del código circundante.

### P9 — Análisis de impacto
Antes de modificar un símbolo existente, consultar CodeGraph (`codegraph_impact`, `codegraph_callers`)
y listar los consumidores afectados en el plan.

## Quality gates

| Gate | Comando | Criterio |
|------|---------|----------|
| Build | `npm run build` | Sin errores |
| Lint | `npm run lint` | Nº de errores ≤ baseline |
| Tests | `npm test` | Tests fallidos ≤ baseline; los tests nuevos pasan |
| Trazabilidad | `checklist.md` | Cada AC enlazado a una tarea y a un test o verificación manual |

## Gobernanza
- La spec define el **qué** y el **por qué**; el plan, el **cómo**; las tareas, el **orden**.
- Si durante la implementación la spec resulta incorrecta o incompleta, se detiene, se actualiza la spec
  y se pide aprobación de nuevo antes de continuar.
- Las decisiones técnicas relevantes se registran en la sección "Decisiones" del plan.
