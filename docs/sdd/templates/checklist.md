---
feature: {{ID}}
doc: checklist
estado: pendiente
actualizado: {{DATE}}
---

# Checklist {{ID}} — {{TITLE}}

## A. Calidad de la spec (antes de aprobar spec.md)
- [ ] Cada historia tiene prioridad y al menos un AC verificable
- [ ] Los AC describen resultados observables, no implementación
- [ ] Casos límite y errores cubiertos
- [ ] Fuera de alcance explícito
- [ ] Sin `[NECESITA ACLARACIÓN]` pendientes

## B. Calidad del plan (antes de aprobar plan.md)
- [ ] Check de constitución completo, excepciones justificadas
- [ ] Baseline medida
- [ ] Impacto analizado con CodeGraph para cada símbolo modificado
- [ ] Cada AC tiene estrategia de test

## C. Trazabilidad (rellenada en /sdd-tasks, verificada en /sdd-verify)
| AC | Tareas | Test / verificación | Estado |
|----|--------|---------------------|--------|

## D. Quality gates (rellenado en /sdd-verify)
| Gate | Baseline | Resultado | OK |
|------|----------|-----------|----|
| Build | | | |
| Lint (errores) | | | |
| Tests (fallidos) | | | |

## E. Verificación manual
<!-- - [ ] AC-x.y — pasos realizados → resultado observado -->

## F. Hallazgos de revisión
<!-- Problemas detectados por /sdd-verify y su resolución. -->
