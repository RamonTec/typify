---
feature: {{ID}}
doc: tasks
estado: pendiente
actualizado: {{DATE}}
---

# Tareas {{ID}} — {{TITLE}}

Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md)

Formato: `- [ ] TNNN [P] [USn] Descripción — archivo(s)`
- `[P]` = paralelizable (no comparte archivos con otras tareas pendientes de la misma fase)
- `[USn]` = historia de usuario que implementa
- Cada tarea indica los AC que cubre y cómo se verifica

## Fase 1 — Fundamentos

## Fase 2 — Tests

## Fase 3 — Implementación

## Fase 4 — Integración UI

## Fase 5 — Verificación
- [ ] T900 Ejecutar quality gates y comparar con la baseline — `npm run build`, `npm run lint`, `npm test`
- [ ] T901 Verificación manual de los AC de UI en `npm run dev` y registro en checklist.md
