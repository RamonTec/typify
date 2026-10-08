---
name: sdd-tasks
description: Fase 3 del SDD de Typify. Desglosa un plan aprobado en tasks.md, con tareas atómicas numeradas, ordenadas por dependencias, marcadas como paralelizables y trazadas a criterios de aceptación, y prepara la matriz de trazabilidad de checklist.md. Úsalo cuando el usuario quiera generar, revisar o aprobar las tareas de una feature.
argument-hint: "[feature] [aprobar]"
---

# SDD fase 3 — Tareas

Entrada del usuario: `$ARGUMENTS` (si no se sustituyó, usa el mensaje que invocó este skill).

Lee primero `docs/sdd/constitution.md` y las reglas comunes del skill `sdd` (`.claude/skills/sdd/SKILL.md`).

## Precondición
`spec.md` y `plan.md` con `estado: aprobado`. Si no, detente y recomienda la fase que falta.
Si la entrada es "aprobar" (o el usuario aprueba en el chat), salta al paso 5.

## Pasos

### 1. Leer spec y plan
Lista todos los AC de la spec y todos los archivos de "Archivos afectados" del plan.

### 2. Generar tareas
Escribe `tasks.md` siguiendo el formato de la plantilla:

```
- [ ] T001 [P] [US1] Definir tipos `FooOptions` y `FooResult` — `src/services/foo.ts`
  - AC: AC-1.1, AC-1.2
  - Verificación: `npm test -- foo`
```

Reglas:
- **Atómicas**: una tarea toca idealmente un archivo y se completa en una sesión corta.
  Si una tarea necesita la palabra "y", probablemente sean dos.
- **Numeración** `T001`, `T002`... continua entre fases. Las tareas de verificación final usan `T900+`.
- **Orden por dependencias**: tipos → servicios → tests → integración UI → verificación.
- **Test primero (P3)**: para lógica pura, la tarea del test va antes que la de implementación
  y su verificación es que falle (rojo); la de implementación la pone en verde.
- **`[P]`** solo si la tarea no comparte archivos ni depende de otra pendiente de su misma fase.
- **`[USn]`** en las tareas que implementan una historia; las de infraestructura no lo llevan.
- Cada tarea indica los AC que cubre (si cubre alguno) y un comando o paso de verificación concreto.
- Mantén las tareas T900 y T901 de la plantilla.

### 3. Trazabilidad
- Comprueba que **cada AC** aparece en al menos una tarea y en una verificación. Si alguno queda huérfano,
  añade tareas o avisa al usuario.
- Rellena la tabla "C. Trazabilidad" de `checklist.md` (AC → tareas → test / verificación, estado vacío).
- Copia los AC de UI a la sección "E. Verificación manual" como casillas pendientes.

### 4. Presentar
Pon `estado: borrador` en `tasks.md` y presenta: nº de tareas por fase, ruta crítica, tareas paralelizables
y cualquier AC difícil de verificar. Pide aprobación explícita.

### 5. Aprobación
Solo con aprobación explícita: pon `estado: aprobado` en `tasks.md`, actualiza la fecha y recomienda `/sdd-implement`.

## No hacer
- No modificar `src/`.
- No introducir trabajo que no esté en el plan; si falta algo en el plan, propón actualizarlo.
