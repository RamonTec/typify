# SPEC-2 — Mermaid erDiagram desde JSON

## Descripción
Generar un diagrama Mermaid `erDiagram` (entity-relationship) a partir de un JSON.

## Como / Quiero / Para
- **Como** usuario de Typify
- **Quiero** un `erDiagram` para entender relaciones entre entidades del modelo
- **Para** documentar o diseñar esquemas de base de datos

## Alcance
- Cada objeto JSON → entidad Mermaid
- Atributos de la entidad con tipos Mermaid válidos (`string`, `int`, `boolean`)
- Relaciones:
  - Array `N` hijo → `||--o{` (1:N)
  - Objeto hijo → `||--||` (1:1)

## Criterios de aceptación
- [ ] Primera línea del output es `erDiagram`
- [ ] Cada objeto JSON genera una entidad (nombre en MAYÚSCULAS por convención ER)
- [ ] Atributos primitivos con tipo Mermaid válido:
  - `string` → `string`
  - `number` → `int` (v1; se puede refinar con `float` si tiene decimales)
  - `boolean` → `boolean`
  - `null` → `string` (fallback)
- [ ] Arrays generan relación `||--o{`
- [ ] Objetos anidados generan relación `||--||`
- [ ] Nombres de entidades sanitizados (snake_case o MAYÚSCULAS según convenga)

## Ejemplo de salida
Input:
```json
{
  "order": {
    "id": 1,
    "items": [{ "sku": "A1", "qty": 2 }]
  }
}
```

Output:
```
erDiagram
    ORDER {
        int id
    }
    ITEM {
        string sku
        int qty
    }
    ORDER ||--o{ ITEM : has
```

## Tests asociados
- `src/__tests__/mermaidGenerator.test.ts` → describe "erDiagram"