# Phases — Roadmap de implementación

Roadmap secuencial para las features Mermaid + JWT/JSON Deserialize.

## Phase 0 — Specs (✅ hecho)
Documentación completa de las features sin tocar código.
- [x] SPEC-1 a SPEC-9
- [x] TASKS.md
- [x] CHECKLIST.md

## Phase A — Servicios puros (sin UI)
Servicios testeables aislados. Se implementan primero para poder testear sin React.

| Tarea | Spec | Salida |
|-------|------|--------|
| A1 | SPEC-1,2,3 | `mermaidGenerator.ts` |
| A2 | SPEC-4 | `javaToMermaid.ts` |
| A3 | SPEC-7 | `jsonDeserializer.ts` |
| A4 | SPEC-6 | `jwtDeserializer.ts` |

**Definition of Done**:
- Funciones puras exportadas
- Sin dependencias de React
- Tipos estrictos (no `any` salvo justificación)
- Errores lanzados con mensajes en español (consistente con la app)

## Phase B — Tipos y adaptadores de UI
Pequeños ajustes en tipos y componentes que no requieren lógica nueva.

| Tarea | Spec | Salida |
|-------|------|--------|
| B1 | SPEC-5 | `OutputMode` extendido |
| B2 | SPEC-5 | `CodeEditor` con `plaintext` |
| B3 | SPEC-5,6,7 | `ExportMenu` con extensiones |

**Definition of Done**:
- Sin regresiones en features existentes
- Mantiene atomic design existente
- Sin nuevas dependencias

## Phase C — Integración en `App.tsx`
Cableado de los servicios a la UI existente.

| Tarea | Spec | Salida |
|-------|------|--------|
| C1 | SPEC-5 | Estado `mermaidType` |
| C2 | SPEC-5,6,7 | Opciones dinámicas de Output |
| C3 | SPEC-5 | Sub-selector Mermaid |
| C4 | SPEC-5,6,7 | useEffect extendido |
| C5 | SPEC-5,6,7 | language del CodeEditor |
| C6 | SPEC-5 | Empty states |

**Definition of Done**:
- `npm run dev` funciona
- Cambio entre modos se refleja en debounce de 500ms
- Sin fugas de estado entre modos

## Phase D — Tests
Configuración del runner + tests de las features.

| Tarea | Spec | Salida |
|-------|------|--------|
| D1 | SPEC-8 | `tsconfig.test.json` |
| D2 | SPEC-8 | `jest.config.cjs` |
| D3 | SPEC-8 | script `test` |
| D4 | SPEC-9 | `mermaidGenerator.test.ts` |
| D5 | SPEC-9 | `javaToMermaid.test.ts` |
| D6 | SPEC-9 | `jsonDeserializer.test.ts` |
| D7 | SPEC-9 | `jwtDeserializer.test.ts` |

**Definition of Done**:
- `npm test` en verde
- Cada spec cubierta con al menos 1 test

## Phase E — Verificación final
Compilación, lint, tests y pruebas manuales.

| Tarea | Comando |
|-------|---------|
| E1 | `npm run build` |
| E2 | `npm run lint` |
| E3 | `npm test` |
| E4 | `npm run dev` + pruebas manuales |

## Riesgos por fase
- **Phase A**: ninguno significativo (sin tocar UI)
- **Phase B**: B1 cambia tipo `OutputMode` — afecta `App.tsx`, `ExportMenu.tsx`, `converter.ts`. Verificar consumidores.
- **Phase C**: C4 (useEffect) es el punto más delicado — manejar bien los modos edge (json vacío, jwt inválido)
- **Phase D**: D2/D3 pueden fallar si `ts-jest@29` no es compatible con `jest@30`. Mitigación documentada en SPEC-8.

## Convenciones
- Atomic design (atoms/molecules/organisms/templates)
- Tipos estrictos, sin `any` salvo justificación
- Sin comentarios innecesarios
- Sin emojis
- Mensajes de error en español
- Nombres PascalCase para tipos generados
- Nombres snake_case solo donde lo requiera Mermaid (ER)