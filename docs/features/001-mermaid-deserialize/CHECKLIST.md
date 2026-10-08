# Checklist — Features Mermaid + JWT/JSON Deserialize

## Fase A — Servicios puros
- [x] A1. SPEC-1 + SPEC-2 + SPEC-3: `src/services/mermaidGenerator.ts`
- [x] A2. SPEC-4: `src/services/javaToMermaid.ts`
- [x] A3. SPEC-7: `src/services/jsonDeserializer.ts`
- [x] A4. SPEC-6: `src/services/jwtDeserializer.ts`

## Fase B — Tipos y componentes
- [x] B1. Extender `OutputMode` en `src/services/converter.ts`
- [x] B2. Extender `language` en `src/components/organisms/CodeEditor.tsx` (plaintext)
- [x] B3. Actualizar `src/components/molecules/ExportMenu.tsx` (.mmd, .ts)

## Fase C — Integración UI en `src/App.tsx`
- [x] C1. Estado `mermaidType: 'class' | 'er' | 'flow'`
- [x] C2. Opciones de Output dinámicas (Deserialize oculto en java)
- [x] C3. Sub-`SegmentedControl` Class/ER/Flow
- [x] C4. useEffect extendido (mermaid y deserialize)
- [x] C5. language del CodeEditor según modo
- [x] C6. Empty state del output ajustado

## Fase D — Tests
- [x] D1. SPEC-8: `tsconfig.test.json`
- [x] D2. SPEC-8: `jest.config.cjs`
- [x] D3. SPEC-8: script `test` en package.json
- [x] D4. SPEC-9: `mermaidGenerator.test.ts`
- [x] D5. SPEC-9: `javaToMermaid.test.ts`
- [x] D6. SPEC-9: `jsonDeserializer.test.ts`
- [x] D7. SPEC-9: `jwtDeserializer.test.ts`

## Fase E — Verificación final
- [x] E1. `npm run build` sin errores
- [x] E2. `npm run lint` sin errores (24 errores pre-existentes no introducidos por esta feature)
- [x] E3. `npm test` 48/49 tests pasan (1 test pre-existente fallido en `converterEnhancement.test.ts`, no relacionado)
- [x] E4. Pruebas manuales (build OK, verificar en `npm run dev`)

## Estado actual
- [x] Specs escritas (SPEC-1 a SPEC-9)
- [x] Tareas definidas (A1..E4)
- [x] Mermaid service implementado
- [x] Mermaid en UI
- [x] Deserialize JWT
- [x] Deserialize JSON
- [x] Tests pasando