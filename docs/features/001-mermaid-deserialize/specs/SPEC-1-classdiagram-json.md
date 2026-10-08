# SPEC-1 — Mermaid classDiagram desde JSON

## Descripción
Generar un diagrama Mermaid `classDiagram` a partir de un JSON arbitrario.

## Como / Quiero / Para
- **Como** usuario que pega JSON en Typify
- **Quiero** ver un `classDiagram` Mermaid generado automáticamente
- **Para** visualizar la jerarquía de tipos sin escribirla a mano

## Alcance
Incluye:
- Objetos → clases con campos y tipos primitivos o referencias a otras clases
- Arrays → relaciones con cardinalidad `"1" --> "0..*" Items`
- Ciclos de referencia → no lanza excepción; corta la recursión
- Nombres colisionados → desambiguar con sufijo numérico (`User`, `User1`)

No incluye (v1):
- Resaltado de sintaxis Mermaid en el CodeEditor (Monaco no tiene; usamos `plaintext`)
- Renderizado visual del diagrama (solo se genera el código)

## API propuesta
```ts
type MermaidDiagram = 'class' | 'er' | 'flow';

interface MermaidConfig {
  diagram: MermaidDiagram;
  rootName?: string;
}

export const jsonToMermaid = (
  jsonString: string,
  config: MermaidConfig
): string;
```

## Criterios de aceptación
- [ ] `jsonToMermaid('{"user":{"name":"x"}}', { diagram: 'class' })` retorna string que:
  - [ ] Contiene `classDiagram` en la primera línea
  - [ ] Contiene `class User` y `class Root` (o el `rootName` configurable)
  - [ ] El campo `user` aparece como propiedad con tipo `User`
  - [ ] El campo `name` aparece como propiedad con tipo `string`
- [ ] Arrays se representan con `"1" --> "0..*" Items`
- [ ] Ciclos de referencia no lanzan excepción (`WeakSet`)
- [ ] Nombres colisionados se desambiguan con sufijo numérico
- [ ] JSON inválido lanza `Error("JSON Inválido")`

## Ejemplo de salida
Input:
```json
{
  "user": {
    "name": "John",
    "age": 30,
    "roles": ["admin", "user"],
    "address": { "city": "NY" }
  }
}
```

Output:
```
classDiagram
    class Root {
        +user : User
    }
    class User {
        +name : string
        +age : int
        +roles : string[]
        +address : Address
    }
    class Address {
        +city : string
    }
    Root "1" --> "1" User : user
    User "1" --> "0..*" string : roles
    User "1" --> "1" Address : address
```

## Tests asociados
- `src/__tests__/mermaidGenerator.test.ts` → describe "classDiagram"