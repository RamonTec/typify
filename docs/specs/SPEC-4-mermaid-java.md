# SPEC-4 — Mermaid desde Java (3 diagramas)

## Descripción
Generar diagramas Mermaid (`classDiagram`, `erDiagram`, `flowchart`) a partir de una clase DTO Java.

## Como / Quiero / Para
- **Como** usuario con un DTO Java
- **Quiero** generar diagramas Mermaid desde mi clase Java
- **Para** documentar modelos sin reescribirlos en JSON

## Alcance
- Reutiliza `parseJavaClass` (existente en `javaParser.ts`)
- Mapea `JavaClass[]` → representación intermedia `NodeDef[]`
- Los 3 diagramas se generan desde la misma representación intermedia

## Criterios de aceptación

### classDiagram
- [ ] Clases con campos y tipos mapeados:
  - `String` → `string`
  - `int`/`Integer`/`long`/`double`/`float`/`BigDecimal` → `number`
  - `boolean`/`Boolean` → `boolean`
  - `List<Foo>` / `Set<Foo>` / `Foo[]` → `Foo[]`
  - `Map<K,V>` → `Record<K, V>`
  - `Optional<Foo>` → `Foo | undefined` (opcional con `?`)
- [ ] Herencia: `extends Parent` → `Parent <|-- Child` (solo en classDiagram)
- [ ] `nestedClasses` se renderizan como nodos separados
- [ ] Campos con `| null` / `| undefined` se renderizan con tipo base + marca opcional

### erDiagram
- [ ] Mismas reglas que SPEC-2 pero desde AST Java

### flowchart
- [ ] Mismas reglas que SPEC-3 pero desde AST Java

## API propuesta
```ts
export const javaToMermaid = (
  javaSource: string,
  config: { diagram: MermaidDiagram }
): string;
```

## Tests asociados
- `src/__tests__/javaToMermaid.test.ts`
  - describe "classDiagram with inheritance"
  - describe "classDiagram with nested classes"
  - describe "erDiagram"
  - describe "flowchart"