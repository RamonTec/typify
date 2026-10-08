# SPEC-7 — Función `parseJson` para JSON

## Descripción
Generar funciones TypeScript `parseJson(input)` y `safeParseJson(input)` que validan un string JSON contra un esquema Zod.

## Como / Quiero / Para
- **Como** usuario con un JSON
- **Quiero** obtener una función lista para deserializar ese JSON en mi código
- **Para** evitar reescribir el schema Zod manualmente

## Alcance
- Aplica cuando `inputMode === 'json' && outputMode === 'deserialize'`

## Criterios de aceptación

### Servicio
- [ ] Nuevo archivo `src/services/jsonDeserializer.ts`
- [ ] Función: `generateJsonDeserializer(jsonString: string, { rootName: 'Root' }): string`
- [ ] Salida contiene (en orden):
  1. `import { z } from "zod";`
  2. `RootSchema` (zod object) — reusando `jsonToZod`
  3. `export type Root = z.infer<typeof RootSchema>;`
  4. `export function parseJson(input: string): Root { return RootSchema.parse(JSON.parse(input)); }`
  5. `export function safeParseJson(input: string) { return RootSchema.safeParse(JSON.parse(input)); }`

### UI
- [ ] Misma opción Output `'deserialize'` que SPEC-6 (sin duplicar código de opciones)
- [ ] `useEffect`: si `inputMode === 'json' && outputMode === 'deserialize'`, llama a `generateJsonDeserializer(jsonInput)`

### Export
- [ ] Mismo comportamiento que SPEC-6 (`deserialize-YYYYMMDD.ts`)

## Ejemplo de salida generada
```ts
import { z } from "zod";

export const RootSchema = z.object({
  name: z.string(),
  age: z.number(),
});

export type Root = z.infer<typeof RootSchema>;

export function parseJson(input: string): Root {
  return RootSchema.parse(JSON.parse(input));
}

export function safeParseJson(input: string) {
  return RootSchema.safeParse(JSON.parse(input));
}
```

## Archivos afectados
- `src/services/jsonDeserializer.ts` (nuevo)
- `src/App.tsx` (useEffect)
- `src/components/molecules/ExportMenu.tsx` (compartido con SPEC-6)

## Tests asociados
- `src/__tests__/jsonDeserializer.test.ts`
  - contiene `parseJson`
  - contiene `safeParseJson`
  - contiene `RootSchema`
  - contiene `z.object`
  - contiene `import { z } from "zod"`