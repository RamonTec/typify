---
feature: 002
doc: tasks
estado: en-progreso
actualizado: 2026-10-08
---

# Tareas 002 — Registro de herramientas

Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md)

Formato: `- [ ] TNNN [P] [USn] Descripción — archivo(s)`
- `[P]` = paralelizable (no comparte archivos con otras tareas pendientes de la misma fase)
- `[USn]` = historia de usuario que implementa
- Cada tarea indica los AC que cubre y cómo se verifica

Regla de build: al terminar cada fase, `npm run build` compila. `'compare'` no sale de `OutputMode` ni cambian las props de `MainLayout`
hasta que `App.tsx` se reescribe (fase 4), para no dejar el árbol roto entre fases.

## Fase 1 — Red de seguridad
- [x] T001 [P] Test de caracterización de `compareJson`: ejemplo de la spec, objetos idénticos, JSON inválido en cada lado, anidamiento — `src/__tests__/comparator.test.ts`
  - AC: AC-3.2
  - Verificación: `npm test -- comparator` en verde (fija el comportamiento actual) → 8/8
- [x] T002 [P] [US2] Test de paridad de `generate()`: matriz de 20 combinaciones × 5 fixtures con oráculo copiado de `App.tsx:142-183`; `SUPPORTED_OUTPUTS`; `resolveOutputMode`; entradas vacías e inválidas (JSON, Java, JWT); `isLargeInput` en el umbral de 100 KB — `src/__tests__/generate.test.ts`
  - AC: AC-2.1, AC-2.2, AC-2.4, AC-2.5, AC-2.6, AC-6.2, AC-6.3
  - Verificación: `npm test -- generate` en rojo (el módulo no existe) → rojo por "Cannot find module"
  - Fixtures JWT: los 5 JSON firmados como token; fixtures Java: plano, anidado, colecciones, anotaciones y herencia. El test exige que el oráculo no devuelva cadena vacía para ninguna combinación.
- [x] T003 [US2] Implementar `generate`, `resolveOutputMode`, `SUPPORTED_OUTPUTS`, `isLargeInput` y `LARGE_INPUT_BYTES` — `src/services/generate.ts`
  - AC: AC-2.1, AC-2.2, AC-2.4, AC-2.5, AC-2.6
  - Verificación: `npm test -- generate` en verde; `npm run build` OK → 114/114, build OK
  - Desviación menor: la constante se llama `LARGE_INPUT_CHARS`, porque el umbral se mide en caracteres (`text.length`) y no en bytes. Para JSON ASCII coincide; así se evita codificar la entrada en cada pulsación.

## Fase 2 — Infraestructura
- [x] T004 [P] Test del catálogo: 4 herramientas en orden (`generate`, `compare`, `jwt`, `mermaid`), ids únicos, nombre y descripción no vacíos, `DEFAULT_TOOL_ID === 'generate'` — `src/__tests__/toolCatalog.test.ts`
  - AC: AC-1.1
  - Verificación: `npm test -- toolCatalog` en rojo
- [x] T005 Implementar `TOOL_CATALOG`, `ToolId`, `ToolMeta` y `DEFAULT_TOOL_ID` — `src/tools/catalog.ts`
  - AC: AC-1.1
  - Verificación: `npm test -- toolCatalog` en verde
- [x] T006 [P] [US6] Hook `useDebouncedValue` (150 ms por defecto, limpia el timer y emite solo el último valor) — `src/hooks/useDebouncedValue.ts`
  - AC: AC-6.1, AC-6.4
  - Verificación: `npm run build` y `npm run lint` sin errores nuevos; comprobación manual en T901
- [x] T007 [P] Template de dos paneles con cabecera de panel (título + controles), mismo estilo que los paneles actuales — `src/components/templates/ToolWorkspace.tsx`
  - Verificación: `npm run build`
  - El archivo exporta `ToolWorkspace` (contenedor), `ToolPanel` (panel con título, controles y acciones; variantes `input` y `output`) y `ToolWorkspaceSkeleton` (fallback de `Suspense`).
- [x] T008 [P] [US1] Navegación: lista con `aria-current="page"` desde `md:` y `<select>` nativo en móvil, con `aria-label="Herramientas"` — `src/components/organisms/ToolNav.tsx`
  - AC: AC-1.2, AC-1.3, AC-1.5
  - Verificación: `npm run build`; comprobación manual en T901
  - En escritorio la descripción de cada herramienta se ve bajo su nombre (AC-1.1); en móvil se ve la de la activa bajo el `<select>`.
- [x] T009 [P] [US1] `ToolHost`: monta de forma perezosa las herramientas visitadas, oculta las inactivas con `hidden` y envuelve cada una en `Suspense` con un esqueleto de paneles — `src/components/organisms/ToolHost.tsx`
  - AC: AC-1.4
  - Verificación: `npm run build`
  - Desviación menor: `ToolHost` recibe `mountedIds` por prop y `App` (T020) amplía la lista en el handler de selección. Así se evita un `setState` durante el render, que marcaría el lint de React Compiler. Las inactivas se ocultan con la clase `hidden` en vez del atributo, para que no compita con `flex`.
- [x] T010 [P] Molécula `InputActions`: deshacer, rehacer, formatear, minificar y limpiar, cada acción opcional, con `aria-label` en español — `src/components/molecules/InputActions.tsx`
  - AC: AC-2.8, AC-3.4
  - Verificación: `npm run build`
- [x] T011 [P] Molécula `PasteButton`: lee el portapapeles y, si falla, muestra un aviso en español en línea — `src/components/molecules/PasteButton.tsx`
  - Verificación: `npm run build`; permiso denegado en T901

## Fase 3 — Herramientas
- [x] T012 [US2] [US6] `GenerateTool`: selector de entrada JSON/Java/JWT, salidas derivadas de `SUPPORTED_OUTPUTS` con `resolveOutputMode`, tipo de diagrama, `useHistory`, `useDebouncedValue` + `useMemo(generate)`, esqueleto solo si `isLargeInput` y hay cálculo pendiente, badges de JSON y JWT (sin `JwtInfo`), `ImportMenu`, `ExportMenu`, `PasteButton` — `src/tools/generate/GenerateTool.tsx`
  - AC: AC-2.1, AC-2.2, AC-2.3, AC-2.5, AC-2.6, AC-2.7, AC-2.8, AC-4.3, AC-6.1, AC-6.2, AC-6.3, AC-6.4
  - Verificación: `npm run build`; comprobación manual en T901
  - Piezas auxiliares no previstas, compartidas por varias herramientas:
    - `ToolOutputSkeleton` en `templates/ToolWorkspace.tsx`.
    - Molécula `EditorEmptyOverlay` (estado vacío + `PasteButton` sobre el editor). Ahora deja pasar los clics al editor (`pointer-events-none`), así que se puede enfocar y pegar con Ctrl+V, que es lo que propone el aviso de portapapeles denegado.
    - `utils/fetchJsonText.ts` para importar por URL (antes en `App.tsx`).
  - Al cambiar de entrada, el handler aplica `resolveOutputMode` al modo guardado (AC-2.5): volver a JSON no recupera "Deserializador".
- [x] T013 [P] [US3] Test de `compareEmptyMessage` con las 4 combinaciones vacío/no vacío (un texto solo con espacios cuenta como vacío) — `src/__tests__/compareMessages.test.ts`
  - AC: AC-3.3
  - Verificación: `npm test -- compareMessages` en rojo
- [x] T014 [US3] Implementar `compareEmptyMessage` — `src/tools/compare/compareMessages.ts`
  - AC: AC-3.3
  - Verificación: `npm test -- compareMessages` en verde
- [x] T015 [US3] [US6] `CompareTool`: editores "Esperado" y "Actual" con historial propio, lado a lado desde `md:` y con pestañas en móvil, `ImportMenu`/`PasteButton`/`InputActions` por editor, `useDebouncedValue` + `useMemo(compareJson)`, `CompareReport` y estado vacío con `compareEmptyMessage` — `src/tools/compare/CompareTool.tsx`
  - AC: AC-3.1, AC-3.1b, AC-3.2, AC-3.3, AC-3.4, AC-6.1, AC-6.2, AC-6.3, AC-6.4
  - Verificación: `npm run build`; comprobación manual en T901
- [x] T016 [P] [US4] `JwtTool`: entrada del token, `decodeJwtPayload` sobre el valor retrasado, `JwtInfo` y payload formateado en editor de solo lectura, error en español — `src/tools/jwt/JwtTool.tsx`
  - AC: AC-4.1, AC-4.2
  - Verificación: `npm run build`; comprobación manual en T901
- [x] T017 [P] [US5] `MermaidTool`: entrada de texto y `MermaidPreview` sobre el valor retrasado — `src/tools/mermaid/MermaidTool.tsx`
  - AC: AC-5.1, AC-5.2
  - Verificación: `npm run build`; comprobación manual en T901

## Fase 4 — Integración
- [x] T018 Registro: `TOOLS` une `TOOL_CATALOG` con icono y `React.lazy` de cada herramienta — `src/tools/registry.ts`
  - AC: AC-1.1 · NFR-001
  - Verificación: `npm run build`; la herramienta aparece en su propio chunk en `dist/assets` → `GenerateTool` 6,7 kB, `CompareTool` 12,1 kB, `JwtTool` 5,2 kB, `MermaidTool` 6,8 kB
  - `BINDINGS: Record<ToolId, …>` obliga a que cada id del catálogo tenga icono y componente.
- [x] T019 `MainLayout` pasa a `header` + `nav` + `children` — `src/components/templates/MainLayout.tsx`
  - Verificación: se compila junto con T020
- [x] T020 [US1] Reescribir `App.tsx` como carcasa: `ThemeProvider`, `MainLayout`, cabecera ("Invítame a un café"), `ToolNav`, `ToolHost` y el estado `activeToolId` — `src/App.tsx`
  - AC: AC-1.1, AC-1.4 · NFR-002
  - Verificación: `npm run build` OK; `wc -l src/App.tsx` < 100 → 46 líneas; chunk inicial 233,19 kB (baseline 296,39 kB)
  - Prueba rápida en el navegador: la salida del ejemplo de la spec es idéntica; AC-2.5 (Deserializador → Java marca Interface), AC-1.4 (el estado se conserva al ir a Comparar y volver), Comparar produce el informe de AC-3.2, móvil sin scroll horizontal y sin errores en consola. La verificación formal queda para T901.
  - Ajuste: la barra lateral de `ToolNav` tiene fondo de tarjeta (como los paneles), porque es lo único que queda directamente sobre el fondo de la página y no se leía si el lienzo es oscuro (D3, ver hallazgo F1).
- [x] T021 Quitar `'compare'` de `OutputMode` — `src/services/converter.ts`
  - Verificación: `npm run build`; `npm test` sin fallos nuevos
- [x] T022 [P] Tipar la prop `outputMode` de `ExportMenu` como `OutputMode` — `src/components/molecules/ExportMenu.tsx`
  - AC: AC-2.7
  - Verificación: `npm run build`

## Fase 5 — Español
- [x] T023 [US7] Test de textos: recorre `src/**/*.tsx` y falla si aparece alguna frase en inglés de AC-7.2; comprueba también que `App.tsx` tiene menos de 100 líneas — `src/__tests__/uiStrings.test.ts`
  - AC: AC-7.1, AC-7.2 · NFR-002
  - Verificación: `npm test -- uiStrings` en rojo → 7 archivos con textos en inglés, más `DIFF_LABELS`
  - El test extrae literales de cadena (sin las interpolaciones `${…}`) y texto JSX. "missing" y "extra" solo se buscan en texto JSX, porque como literales son claves de `DiffType`. La lista incluye los textos en inglés detectados al implementar, además de los de AC-7.2.
- [x] T024 [P] [US7] `DIFF_LABELS` en español — `src/services/comparator.ts`
  - AC: AC-7.1
  - Verificación: `npm test -- comparator` sigue en verde
  - Desviación (aplicando D10): también se traducen los `message` de cada diferencia, que `CompareReport` muestra tal cual ("Se esperaba number y se obtuvo string", "Falta el campo …"). Se actualizaron esas expectativas en `comparator.test.ts`; ruta, tipo, esperado y actual no cambian (AC-3.2). Los mensajes de error nativos de `JSON.parse` siguen en inglés porque los genera el motor JS.
- [x] T025 [P] [US7] Textos de `ImportMenu` (botón, título, "Elegir archivo JSON", errores) — `src/components/molecules/ImportMenu.tsx`
  - AC: AC-7.2
- [x] T026 [P] [US7] Textos de `ExportMenu` ("Exportar", "Copiar al portapapeles", "Descargar como") — `src/components/molecules/ExportMenu.tsx`
  - AC: AC-7.2
- [x] T027 [P] [US7] Textos de `JwtInfo` ("Expirado", "Válido", "Cabecera vacía", etiquetas de fechas) — `src/components/molecules/JwtInfo.tsx`
  - AC: AC-7.2
  - Además: "JWT decodificado", "Cabecera", "Fechas". Prop nueva `showClaims` (por defecto `true`): `JwtTool` pasa `false` porque ya muestra el payload en su editor y así no se duplica.
- [x] T028 [P] [US7] Textos de `CompareReport` ("Referencia", "Tipos generados", "N diferencias") — `src/components/molecules/CompareReport.tsx`
  - AC: AC-7.2
- [x] T029 [P] [US7] Textos de `ThemeToggle` (`aria-label` y `title`) — `src/components/atoms/ThemeToggle.tsx`
  - AC: AC-7.1
- [x] T030 [P] [US7] Texto de carga de `CodeEditor` ("Iniciando editor...") — `src/components/organisms/CodeEditor.tsx`
  - AC: AC-7.1
  - Verificación de T024–T030: `npm test -- uiStrings` en verde → 31/31. Comprobado en el navegador: informe de Comparar y JWT en español.

## Fase 6 — Verificación
- [ ] T900 Ejecutar quality gates y comparar con la baseline — `npm run build`, `npm run lint`, `npm test`
  - Criterio: build OK; lint ≤ 19 errores; 1 fallo conocido (`converterEnhancement › union types`), todos los tests nuevos en verde
- [ ] T901 Verificación manual de los AC de UI en `npm run dev` y registro en checklist.md
- [ ] T902 Comparar el chunk inicial `index-*.js` con la baseline (≤ 296,39 kB) — `npm run build`
  - NFR-005
