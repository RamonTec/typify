---
feature: 002
doc: checklist
estado: pendiente
actualizado: 2026-10-08
---

# Checklist 002 — Registro de herramientas

## A. Calidad de la spec (antes de aprobar spec.md)
- [x] Cada historia tiene prioridad y al menos un AC verificable
- [x] Los AC describen resultados observables, no implementación
- [x] Casos límite y errores cubiertos
- [x] Fuera de alcance explícito
- [x] Sin `[NECESITA ACLARACIÓN]` pendientes

## B. Calidad del plan (antes de aprobar plan.md)
- [x] Check de constitución completo, excepciones justificadas (P5 → D2)
- [x] Baseline medida
- [x] Impacto analizado para cada símbolo modificado (CodeGraph no disponible en la sesión; análisis textual, ver P9 en el plan)
- [x] Cada AC tiene estrategia de test

## C. Trazabilidad (rellenada en /sdd-tasks, verificada en /sdd-verify)
| AC | Tareas | Test / verificación | Estado |
|----|--------|---------------------|--------|
| AC-1.1 | T004, T005, T018, T020 | `toolCatalog.test.ts` + manual (iconos) | |
| AC-1.2 | T008 | manual | |
| AC-1.3 | T008 | manual | |
| AC-1.4 | T009, T020 | manual | |
| AC-1.5 | T008 | manual | |
| AC-2.1 | T002, T003, T012 | `generate.test.ts` + manual | |
| AC-2.2 | T002, T003, T012 | `generate.test.ts` + manual | |
| AC-2.3 | T012 | manual | |
| AC-2.4 | T002, T003 | `generate.test.ts` (matriz de paridad) | |
| AC-2.5 | T002, T003, T012 | `generate.test.ts` (`resolveOutputMode`) + manual | |
| AC-2.6 | T002, T003, T012 | `generate.test.ts` + manual (badges) | |
| AC-2.7 | T012, T022 | manual | |
| AC-2.8 | T010, T012 | manual | |
| AC-3.1 | T015 | manual | |
| AC-3.1b | T015 | manual | |
| AC-3.2 | T001, T015 | `comparator.test.ts` | |
| AC-3.3 | T013, T014, T015 | `compareMessages.test.ts` | |
| AC-3.4 | T010, T015 | manual | |
| AC-4.1 | T016 | manual | |
| AC-4.2 | T016 | manual | |
| AC-4.3 | T012 | manual | |
| AC-5.1 | T017 | manual | |
| AC-5.2 | T017 | manual | |
| AC-6.1 | T006, T012, T015 | manual | |
| AC-6.2 | T002, T012, T015 | `generate.test.ts` (`isLargeInput`) + manual | |
| AC-6.3 | T002, T012, T015 | `generate.test.ts` (`isLargeInput`) + manual | |
| AC-6.4 | T006, T012, T015 | manual | |
| AC-7.1 | T023–T030 | `uiStrings.test.ts` + manual | |
| AC-7.2 | T023, T025–T028 | `uiStrings.test.ts` | |
| NFR-001 | T018 | revisión: añadir herramienta = entrada en catálogo + registro | |
| NFR-002 | T020, T023 | `uiStrings.test.ts` (líneas de `App.tsx`) | |
| NFR-003 | T900 | gates | |
| NFR-005 | T902 | tamaño de `index-*.js` | |

## D. Quality gates (rellenado en /sdd-verify)
| Gate | Baseline | Resultado | OK |
|------|----------|-----------|----|
| Build | | | |
| Lint (errores) | | | |
| Tests (fallidos) | | | |

## E. Verificación manual
<!-- - [ ] AC-x.y — pasos realizados → resultado observado -->
- [ ] AC-1.1 — 4 herramientas con icono, nombre y descripción; "Generar tipos" activa al cargar
- [ ] AC-1.2 — Barra lateral en ≥ 768 px con `aria-current` en la activa
- [ ] AC-1.3 — Selector compacto en 375 px sin scroll horizontal
- [ ] AC-1.4 — Estado conservado al ir y volver entre herramientas
- [ ] AC-1.5 — Navegación por teclado con foco visible
- [ ] AC-2.1 / AC-2.2 — Entradas y salidas correctas por tipo de entrada
- [ ] AC-2.3 — Selector Clase/ER/Flujo solo con salida Mermaid
- [ ] AC-2.5 — Deserializador + cambio a Java → el selector pasa a Interface
- [ ] AC-2.6 — Entradas inválidas: salida vacía y badges como hoy
- [ ] AC-2.7 — Exportar: copiar y descargar con los 4 nombres de archivo
- [ ] AC-2.8 — Formatear, minificar, deshacer y rehacer
- [ ] AC-3.1 — Comparar en escritorio: dos editores a la vez
- [ ] AC-3.1b — Comparar en móvil: pestañas Esperado/Actual
- [ ] AC-3.3 — Estados vacíos de Comparar en español
- [ ] AC-3.4 — Limpiar vacía solo su editor
- [ ] AC-4.1 / AC-4.2 — JWT válido, de 2 partes y JWE
- [ ] AC-4.3 — Generar tipos con JWT: badge sí, `JwtInfo` no
- [ ] AC-5.1 / AC-5.2 — Mermaid válido, inválido, zoom y ajuste
- [ ] AC-6.1 / AC-6.4 — Salida ≈ 150 ms tras la última tecla, sin valores intermedios
- [ ] AC-6.2 / AC-6.3 — Sin esqueleto con JSON pequeño; esqueleto con JSON > 100 KB
- [ ] AC-7.1 — Revisión visual de textos en todos los estados y menús
- [ ] Caso límite — Portapapeles denegado: aviso en español

## F. Hallazgos de revisión
<!-- Problemas detectados por /sdd-verify y su resolución. -->
- **F1** (detectado en T020, ajeno a la feature) — `body` no tiene color de fondo, solo gradientes. Con un navegador que pinta el lienzo oscuro (`prefers-color-scheme: dark`), el texto que queda fuera de los paneles (descripción bajo el selector móvil) pierde contraste, y `CompareReport` se ve desvaído. Se resuelve en la 003 (tokens y dark mode).
- **F2** (entorno) — En el navegador integrado, las capturas a veces muestran el estado anterior a un clic mientras el DOM ya está actualizado. Para T901, verificar el estado activo con DevTools o en un navegador normal.
