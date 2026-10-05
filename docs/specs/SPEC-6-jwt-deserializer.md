# SPEC-6 — Función deserializadora para JWT

## Descripción
Generar una función TypeScript `deserializeJwt(token)` que parsea un JWT y devuelve un objeto tipado validado con Zod.

## Como / Quiero / Para
- **Como** usuario con un JWT
- **Quiero** que se genere una función TS lista para usar
- **Para** deserializar tokens en mi código sin reescribir la lógica de base64 + validación

## Alcance
- Aplica cuando `inputMode === 'jwt' && outputMode === 'deserialize'`

## Criterios de aceptación

### Servicio
- [ ] Nuevo archivo `src/services/jwtDeserializer.ts`
- [ ] Función: `generateJwtDeserializer(payloadJson: string, { rootName: 'JwtPayload' }): string`
- [ ] Salida contiene (en orden):
  1. `import { z } from "zod";`
  2. `JwtPayloadSchema` (zod object) — generado reusando `jsonToZod`
  3. `export type JwtPayload = z.infer<typeof JwtPayloadSchema>;`
  4. Helper local `base64UrlDecode` (no exportado)
  5. `export function deserializeJwt(token: string): JwtPayload { ... }`:
     - Divide el token por `.`
     - Valida `parts.length === 3` (lanzar `Error("Invalid JWT")` si no)
     - Decodifica `parts[1]` (payload) con `base64UrlDecode`
     - `JSON.parse` del payload
     - `JwtPayloadSchema.parse(...)` para validar

### UI
- [ ] Añadir `{ label: 'Deserialize', value: 'deserialize', icon: Braces }` al Output (visible solo cuando `inputMode !== 'java'`)
- [ ] `useEffect`: si `inputMode === 'jwt' && outputMode === 'deserialize'`, llama a `generateJwtDeserializer(decoded.payload)`
- [ ] `CodeEditor` de salida: `language="typescript"`

### Export
- [ ] `ExportMenu` detecta `outputMode === 'deserialize'`:
  - [ ] Nombre: `deserialize-YYYYMMDD.ts`
  - [ ] Extensión `.ts`

## Ejemplo de salida generada
```ts
import { z } from "zod";

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  name: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return atob(base64 + padding);
};

export function deserializeJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  return JwtPayloadSchema.parse(JSON.parse(base64UrlDecode(parts[1])));
}
```

## Archivos afectados
- `src/services/jwtDeserializer.ts` (nuevo)
- `src/App.tsx` (opción Output, useEffect)
- `src/components/molecules/ExportMenu.tsx` (extensión)

## Tests asociados
- `src/__tests__/jwtDeserializer.test.ts`
  - contiene `deserializeJwt`
  - contiene `JwtPayloadSchema`
  - contiene `z.object`
  - contiene `base64UrlDecode`
  - contiene `import { z } from "zod"`