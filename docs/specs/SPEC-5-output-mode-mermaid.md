# SPEC-5 — Modo de salida "Mermaid" en la UI

## Descripción
Exponer la generación de Mermaid como nuevo modo de salida en Typify, con sub-selector de tipo de diagrama.

## Como / Quiero / Para
- **Como** usuario
- **Quiero** seleccionar "Mermaid" en el Output y elegir entre Class/ER/Flow
- **Para** previsualizar o exportar diagramas sin herramientas externas

## Criterios de aceptación

### Estado y tipos
- [ ] Extender `OutputMode` en `src/services/converter.ts`:
  ```ts
  export type OutputMode =
    | 'interface'
    | 'type'
    | 'zod'
    | 'compare'
    | 'mermaid'
    | 'deserialize';
  ```
- [ ] Nuevo estado en `App.tsx`: `mermaidType: 'class' | 'er' | 'flow'` (default `'class'`)

### UI
- [ ] Añadir `{ label: 'Mermaid', value: 'mermaid', icon: Workflow }` al `SegmentedControl` de Output
- [ ] Cuando `outputMode === 'mermaid'`:
  - [ ] Mostrar sub-`SegmentedControl` Class / ER / Flow junto al selector de Output
  - [ ] El sub-selector actualiza `mermaidType`
- [ ] CodeEditor de salida con `language="plaintext"`
- [ ] Empty state explica cómo usar el modo Mermaid (mensaje en español)

### Lógica de conversión (useEffect)
- [ ] Cuando `outputMode === 'mermaid'`:
  - `inputMode === 'json'` → `jsonToMermaid(jsonInput, { diagram: mermaidType })`
  - `inputMode === 'java'` → `javaToMermaid(jsonInput, { diagram: mermaidType })`
  - `inputMode === 'jwt'` → decode payload + `jsonToMermaid(payload, { diagram: mermaidType })`
- [ ] `mermaidType` agregado al array de dependencias del `useEffect`
- [ ] Debounce de 500ms mantenido

### Export
- [ ] `ExportMenu` detecta `outputMode === 'mermaid'`:
  - [ ] Nombre de archivo: `diagram-YYYYMMDD.mmd`
  - [ ] Descarga con extensión `.mmd`
  - [ ] Copia al portapapeles funciona

## Archivos afectados
- `src/services/converter.ts` (OutputMode)
- `src/components/organisms/CodeEditor.tsx` (language `plaintext`)
- `src/components/molecules/ExportMenu.tsx` (nombre/extensión)
- `src/App.tsx` (estado, opciones, useEffect, sub-selector, empty states)

## Tests asociados
- Manual en `npm run dev` con JSON, Java y JWT