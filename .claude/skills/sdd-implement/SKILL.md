---
name: sdd-implement
description: Fase 4 del SDD de Typify. Implementa las tareas de un tasks.md aprobado en orden de dependencias, con el test antes que el código, respetando la constitución y marcando cada tarea al completarla. Acepta una tarea concreta (T003), una fase (fase 2) o todas las pendientes. Úsalo cuando el usuario quiera implementar, continuar o retomar el desarrollo de una feature planificada.
argument-hint: "[feature] [T001 | fase N | todo]"
---

# SDD fase 4 — Implementar

Entrada del usuario: `$ARGUMENTS` (si no se sustituyó, usa el mensaje que invocó este skill).

Lee primero `docs/sdd/constitution.md` y las reglas comunes del skill `sdd` (`.claude/skills/sdd/SKILL.md`).

## Precondición
`spec.md` y `plan.md` con `estado: aprobado`, y `tasks.md` con `estado: aprobado` o `en-progreso`.
Si no, detente y recomienda la fase que falta.

## Alcance de la ejecución
- `T00N` → solo esa tarea (comprueba que sus dependencias estén hechas).
- `fase N` → las tareas pendientes de esa fase.
- Sin indicar nada → la siguiente fase con tareas pendientes. Al terminarla, detente y resume antes de seguir.
- `todo` → todas las pendientes, deteniéndote solo ante bloqueos.

## Antes de empezar
- Lee `spec.md`, `plan.md` (sobre todo "Contratos", "Decisiones" y "Archivos afectados") y `tasks.md`.
- Para tareas de UI, React, Tailwind o Zod, lee el `SKILL.md` correspondiente en `.agents/skills/`
  (`react-best-practices`, `composition-patterns`, `tailwind-css-patterns`, `zod`, `accessibility`,
  `typescript-advanced-types`) y aplica sus reglas.
- Lee los archivos a modificar y su entorno para imitar el estilo existente.

## Bucle por tarea
1. Anuncia la tarea (`T00N — descripción`).
2. Implementa exactamente lo que dice la tarea, ajustándote a los contratos del plan.
   - Tarea de test: escribe el test en `src/__tests__/` y confirma que falla por la razón esperada
     (`npm test -- <archivo>`).
   - Tarea de implementación: escribe el código mínimo para que pase su test.
3. Ejecuta su verificación. Si falla, corrígelo; no marques la tarea como hecha con la verificación en rojo.
4. Marca la tarea en `tasks.md` (`- [x]`) y actualiza `actualizado:`. Pon `estado: en-progreso`
   en `tasks.md` tras la primera tarea completada.
5. Si tienes subagentes disponibles, puedes delegar en `sdd-implementer` las tareas `[P]` independientes de una misma fase,
   cada una con su contexto mínimo (tarea, AC, contratos, archivos).

## Desviaciones
- Si una tarea es imposible o incorrecta tal como está escrita, o la spec y el plan no cubren un caso,
  **detente**. Explica el problema y propón el cambio en spec, plan o tareas. No improvises alcance.
- Cambios pequeños necesarios y no previstos (un import, un tipo auxiliar) se hacen y se anotan
  como subpunto en la tarea correspondiente.
- No arregles errores de lint o tests ajenos a la feature: anótalos como hallazgo en `checklist.md` (sección F).

## Al terminar el alcance
- Ejecuta `npm test` y, si tocaste tipos o UI, `npm run build`.
- Resume: tareas completadas, pendientes, desviaciones y resultado de los comandos.
- Si no quedan tareas pendientes salvo T900 y T901, pon `estado: completado` en `tasks.md` cuando estén hechas,
  o recomienda `/sdd-verify` para cerrarlas.

## No hacer
- No hacer commits salvo que el usuario lo pida.
- No añadir dependencias que no estén en el plan.
- No dejar `any`, `console.log` de depuración ni código comentado.
