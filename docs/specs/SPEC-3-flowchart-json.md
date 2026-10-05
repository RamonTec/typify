# SPEC-3 — Mermaid flowchart desde JSON

## Descripción
Generar un diagrama Mermaid `flowchart TD` (top-down) a partir de un JSON.

## Como / Quiero / Para
- **Como** usuario
- **Quiero** un `flowchart` que muestre la jerarquía del JSON
- **Para** visualizar el árbol de navegación / dependencia entre nodos

## Alcance
- Nodos hoja con solo primitivos se omiten (no aportan valor al flowchart)
- Un nodo por objeto JSON
- Edges del padre a cada hijo (objeto o array de objetos)
- Arrays de primitivos se omiten (solo los arrays de objetos generan nodos)

## Criterios de aceptación
- [ ] Primera línea del output es `flowchart TD`
- [ ] Un nodo Mermaid por cada objeto del árbol
- [ ] Nodos hoja sin estructura interna se omiten
- [ ] Arrays de primitivos se omiten
- [ ] Edges `A --> B` para objeto hijo
- [ ] Edges `A --> B` para array de objetos (se nombra el nodo con singular estimado del campo o índice)

## Ejemplo de salida
Input:
```json
{
  "root": {
    "child": { "value": "x" },
    "items": [{ "name": "a" }, { "name": "b" }]
  }
}
```

Output:
```
flowchart TD
    Root["Root"]
    Child["Child"]
    Item["Item"]
    Root --> Child
    Root --> Item
```

## Tests asociados
- `src/__tests__/mermaidGenerator.test.ts` → describe "flowchart"