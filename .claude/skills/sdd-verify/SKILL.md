---
name: sdd-verify
description: Fase 5 del SDD de Typify. Verifica una feature implementada contra su spec y la constitución. Ejecuta los quality gates (build, lint y tests) comparándolos con la baseline del plan, comprueba cada criterio de aceptación en el código y los tests, rellena checklist.md y reporta los hallazgos. Úsalo cuando el usuario quiera verificar, revisar, validar o cerrar una feature.
argument-hint: "[feature]"
---

# SDD fase 5 — Verificar

Entrada del usuario: `$ARGUMENTS` (si no se sustituyó, usa el mensaje que invocó este skill).

Lee primero `docs/sdd/constitution.md` y las reglas comunes del skill `sdd` (`.claude/skills/sdd/SKILL.md`).

## Objetivo
Producir evidencia, no opiniones: cada afirmación del checklist debe apoyarse en una salida de comando,
un test concreto o una línea de código (`archivo:línea`).

Si tienes subagentes disponibles, delega los pasos 1 a 4 en `sdd-reviewer` para tener una revisión
independiente de quien implementó, y luego aplica el paso 5 con su informe.

## Pasos

### 1. Quality gates
Ejecuta `npm run build`, `npm run lint` y `npm test`. Compara con la tabla "Baseline" de `plan.md`
y rellena "D. Quality gates" de `checklist.md`:
- Build: debe compilar.
- Lint: nº de errores ≤ baseline. Si hay errores nuevos, identifica cuáles son de archivos tocados por la feature.
- Tests: los fallidos deben ser ≤ baseline y ninguno de los tests nuevos puede fallar.

### 2. Trazabilidad de AC
Para cada AC de `spec.md`:
- Localiza el test que lo cubre y comprueba que **realmente** verifica el resultado del AC, no solo que existe.
- Si es un AC de UI, comprueba que el código lo implementa (`archivo:línea`) y deja la verificación manual
  pendiente para el usuario con pasos concretos.
- Actualiza la columna "Estado" de "C. Trazabilidad": `ok`, `parcial` o `falta`.

### 3. Revisión contra la constitución y el plan
Revisa el diff de la feature (`git diff` y `git status` frente al punto de partida):
- Contratos implementados tal como se definieron en el plan.
- P2: la lógica no vive en componentes. P4: sin `any` injustificados. P5: ubicación de componentes.
  P7: sin dependencias nuevas no planificadas. P8: mensajes en español y sin comentarios superfluos.
- Casos límite de la spec manejados.
- Código muerto, `console.log` o TODOs olvidados.

### 4. Hallazgos
Anota en "F. Hallazgos de revisión" cada problema con severidad (`bloqueante`, `importante`, `menor`),
ubicación y propuesta de solución.

### 5. Cierre
- Presenta al usuario un resumen: gates, AC cubiertos, AC pendientes de verificación manual, hallazgos.
- Si hay hallazgos bloqueantes, propón tareas nuevas en `tasks.md` (siguiente número libre) y recomienda `/sdd-implement`.
- Si todo está OK, marca T900 en `tasks.md` y pide al usuario la verificación manual (T901), con pasos concretos
  para `npm run dev`.
- Cuando el usuario confirme la verificación manual: marca la sección E y T901, pon `estado: completado` en
  `tasks.md` y `checklist.md`, y actualiza fechas.

## No hacer
- No corregir el código durante la verificación: se reporta y se planifica.
- No marcar como verificado algo que no se ha comprobado.
