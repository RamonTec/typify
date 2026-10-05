# Tasks — Mermaid + JWT/JSON Deserialize

Tareas organizadas por fase, con referencia a la spec que implementan.

## Fase A — Servicios puros

### A1 — `src/services/mermaidGenerator.ts`
SPEC: SPEC-1, SPEC-2, SPEC-3
- [ ] Definir tipos: `MermaidDiagram`, `FieldDef`, `NodeDef`
- [ ] Implementar `jsonToMermaid(jsonString, { diagram, rootName? })`
- [ ] Traversal con `WeakSet` para ciclos
- [ ] Helper `toPascalCase` + dedupe de nombres con sufijo numérico
- [ ] Helper de escape de identificadores Mermaid
- [ ] Renderer classDiagram
- [ ] Renderer erDiagram
- [ ] Renderer flowchart
- [ ] Lanzar `Error("JSON Inválido")` en JSON inválido

### A2 — `src/services/javaToMermaid.ts`
SPEC: SPEC-4
- [ ] Reusar `parseJavaClass` de `javaParser.ts`
- [ ] Mapear `JavaClass[]` → `NodeDef[]` (arrays, primitivos, refs)
- [ ] Renderizar herencia (`extends`) en classDiagram: `Parent <|-- Child`
- [ ] Renderizar `nestedClasses` como nodos separados
- [ ] Exportar `javaToMermaid(source, { diagram })`

### A3 — `src/services/jsonDeserializer.ts`
SPEC: SPEC-7
- [ ] Reusar `jsonToZod`
- [ ] Generar `parseJson` y `safeParseJson`
- [ ] Exportar `generateJsonDeserializer(json, { rootName })`

### A4 — `src/services/jwtDeserializer.ts`
SPEC: SPEC-6
- [ ] Reusar `jsonToZod` con `rootName: 'JwtPayload'`
- [ ] Helper local `base64UrlDecode`
- [ ] Generar `deserializeJwt(token)`
- [ ] Validar `parts.length === 3`

## Fase B — Tipos y componentes

### B1 — Extender `OutputMode`
SPEC: SPEC-5
- [ ] `src/services/converter.ts`: añadir `'mermaid'` y `'deserialize'` al union

### B2 — Extender `language` en CodeEditor
SPEC: SPEC-5
- [ ] `src/components/organisms/CodeEditor.tsx`: aceptar `"plaintext"`

### B3 — Actualizar ExportMenu
SPEC: SPEC-5, SPEC-6, SPEC-7
- [ ] `mermaid` → `diagram-YYYYMMDD.mmd`
- [ ] `deserialize` → `deserialize-YYYYMMDD.ts`
- [ ] Mantener comportamiento actual para `zod` y resto

## Fase C — Integración UI

### C1 — Estado mermaidType
SPEC: SPEC-5
- [ ] `src/App.tsx`: `useState<'class' | 'er' | 'flow'>('class')`

### C2 — Opciones dinámicas de Output
SPEC: SPEC-5, SPEC-6, SPEC-7
- [ ] Añadir `Mermaid` (icon `Workflow`)
- [ ] Añadir `Deserialize` (icon `Braces`) solo si `inputMode !== 'java'`

### C3 — Sub-selector Mermaid
SPEC: SPEC-5
- [ ] Renderizar `SegmentedControl` Class/ER/Flow cuando `outputMode === 'mermaid'`

### C4 — useEffect
SPEC: SPEC-5, SPEC-6, SPEC-7
- [ ] Rama `outputMode === 'mermaid'` para json/java/jwt
- [ ] Rama `outputMode === 'deserialize'` para json/jwt
- [ ] Añadir `mermaidType` a dependencias

### C5 — CodeEditor language
SPEC: SPEC-5, SPEC-6, SPEC-7
- [ ] mermaid → `plaintext`
- [ ] deserialize → `typescript`

### C6 — Empty states
SPEC: SPEC-5
- [ ] Mensajes en español por modo (mermaid, deserialize)

## Fase D — Tests

### D1 — `tsconfig.test.json`
SPEC: SPEC-8
- [ ] `resolveJsonModule: true`, `noEmit: true`, `include: ["src"]`

### D2 — `jest.config.cjs`
SPEC: SPEC-8
- [ ] Preset `ts-jest`, testEnvironment `node`
- [ ] testMatch `src/__tests__/**/*.test.ts`
- [ ] moduleFileExtensions `['ts','js','json']`

### D3 — script `test` en `package.json`
SPEC: SPEC-8
- [ ] `"test": "jest --config jest.config.cjs"`

### D4 — `src/__tests__/mermaidGenerator.test.ts`
SPEC: SPEC-9
- [ ] describe classDiagram, erDiagram, flowchart
- [ ] edge cases (ciclos, JSON inválido, rootName)

### D5 — `src/__tests__/javaToMermaid.test.ts`
SPEC: SPEC-9
- [ ] classDiagram con herencia y nestedClasses

### D6 — `src/__tests__/jsonDeserializer.test.ts`
SPEC: SPEC-9
- [ ] Validar contenido del output

### D7 — `src/__tests__/jwtDeserializer.test.ts`
SPEC: SPEC-9
- [ ] Validar contenido y validación de parts.length

## Fase E — Verificación

### E1 — Build
- [ ] `npm run build` sin errores

### E2 — Lint
- [ ] `npm run lint` sin errores

### E3 — Tests
- [ ] `npm test` pasa todos los tests

### E4 — Pruebas manuales
- [ ] JSON → Mermaid (Class, ER, Flow)
- [ ] Java → Mermaid (Class, ER, Flow)
- [ ] JWT → Deserialize
- [ ] JSON → Deserialize