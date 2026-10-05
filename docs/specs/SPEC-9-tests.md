# SPEC-9 — Tests (Mermaid + Deserializadores)

## Descripción
Suite de tests que valida los contratos definidos en SPEC-1 a SPEC-7.

## Criterios de aceptación

### Archivos nuevos

#### `src/__tests__/mermaidGenerator.test.ts`
- [ ] describe "jsonToMermaid"
  - [ ] classDiagram
    - [ ] contiene `classDiagram` en primera línea
    - [ ] contiene `class User` cuando hay un campo `user` objeto
    - [ ] contiene `class Root` por defecto
    - [ ] contiene `+name : string` para un campo string
    - [ ] contiene `+age : int` para un campo number
    - [ ] arrays generan `"1" --> "0..*" TIPO`
    - [ ] nombres colisionados se desambiguan (`User`, `User1`)
  - [ ] erDiagram
    - [ ] contiene `erDiagram` en primera línea
    - [ ] objetos generan entidades en MAYÚSCULAS
    - [ ] tipos primitivos mapean a Mermaid (`int`, `string`, `boolean`)
    - [ ] arrays generan `||--o{`
    - [ ] objetos anidados generan `||--||`
  - [ ] flowchart
    - [ ] contiene `flowchart TD` en primera línea
    - [ ] objetos generan nodos
    - [ ] hojas primitivas se omiten
    - [ ] arrays de primitivos se omiten
  - [ ] edge cases
    - [ ] referencia circular no lanza
    - [ ] JSON inválido lanza Error
    - [ ] `rootName` configurable

#### `src/__tests__/javaToMermaid.test.ts`
- [ ] describe "javaToMermaid"
  - [ ] classDiagram con herencia: contiene `<|--`
  - [ ] classDiagram con nestedClasses
  - [ ] campos `List<Foo>` se mapean a `Foo[]`
  - [ ] campos `Optional<Foo>` se mapean a `Foo?`
  - [ ] erDiagram funciona
  - [ ] flowchart funciona

#### `src/__tests__/jsonDeserializer.test.ts`
- [ ] contiene `import { z } from "zod"`
- [ ] contiene `parseJson(input: string): Root`
- [ ] contiene `safeParseJson`
- [ ] contiene `RootSchema = z.object`
- [ ] `rootName` configurable cambia el nombre

#### `src/__tests__/jwtDeserializer.test.ts`
- [ ] contiene `import { z } from "zod"`
- [ ] contiene `export type JwtPayload`
- [ ] contiene `export function deserializeJwt(token: string): JwtPayload`
- [ ] contiene `JwtPayloadSchema = z.object`
- [ ] contiene helper `base64UrlDecode`
- [ ] valida `parts.length !== 3` lanza Error

### Verificación
- [ ] `npm test` pasa todos los tests en verde
- [ ] Cobertura razonable: cada spec tiene al menos 1 test que cubre el comportamiento crítico