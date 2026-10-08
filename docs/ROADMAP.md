# Roadmap — Typify

Plan por fases para mejorar la UI/UX y añadir funcionalidades nuevas.
Cada ítem es una **feature candidata**: antes de implementarla pasa por el flujo SDD
(`/sdd-spec` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement` → `/sdd-verify`), ver `docs/sdd/README.md`.
Este documento define el *qué* y el *orden*; el *cómo* detallado vive en el `plan.md` de cada feature.

Tamaños orientativos: **S** (≤ 1 día) · **M** (2–3 días) · **L** (≥ 4 días).

## Diagnóstico de partida

| # | Problema | Dónde |
|---|----------|-------|
| D1 | La matriz entrada × salida es confusa: `compare` es una herramienta disfrazada de modo de salida, `mermaid` existe como entrada y como salida, `deserialize` desaparece con Java | `src/App.tsx`, `OutputMode` en `src/services/converter.ts` |
| D2 | `App.tsx` (~500 líneas) concentra todo el estado, un `useEffect` monolítico y ternarios anidados para textos y empty states | `src/App.tsx` |
| D3 | Dark mode incompleto: el toggle aplica `.dark`, pero layout y paneles usan `bg-white` / `text-slate-*` fijos | `MainLayout.tsx`, `App.tsx` |
| D4 | El comparador recorre arrays índice a índice: un DTO con 1 elemento de ejemplo contra una respuesta de 50 genera 49 diffs `extra`. Solo compara tipos, no valores | `src/services/comparator.ts` |
| D5 | Cada generador infiere la estructura por su cuenta (TS, Zod, Mermaid, deserializers, Java) → duplicación e inconsistencias | `src/services/*` |
| D6 | Sin persistencia: recargar pierde input y modo | — |
| D7 | Debounce fijo de 500 ms + skeleton en cada tecla aunque la conversión es instantánea | `App.tsx` |
| D8 | Mezcla de idiomas en la UI (la constitución P8 exige español en mensajes visibles) | varios |
| D9 | Opciones de generación fijas (`rootName: "Root"`, sin opcionales/readonly) | `converter.ts`, `zodGenerator.ts` |

## Mapa de dependencias

```
Fase 1  002 Registro de herramientas ──┬──▶ 003 Sistema visual
                                       └──▶ 004 Persistencia
                                                │
Fase 2  005 Comparador por forma ──▶ 006 Comparador de valores ──▶ 007 Vista diff + reporte
                                                │
Fase 3  008 Opciones de generación   009 Autodetección + errores   010 Compartir por URL   011 Command palette
                                                │
Fase 4  012 Modelo intermedio (IR) ──┬──▶ 013 JSON Schema / OpenAPI
                                     ├──▶ 014 Más lenguajes de salida
                                     ├──▶ 015 Mock data
                                     └──▶ 016 cURL → cliente tipado
                                                │
Fase 5  017 Explorador JSON   018 Conversores   019 JWT avanzado
```

La Fase 1 bloquea al resto. Fuera de eso, las fases 2 y 3 pueden avanzar en paralelo,
y la Fase 4 depende solo de 012.

---

## Fase 1 — Fundaciones de UI

Objetivo: que añadir una herramienta nueva sea crear un módulo, no tocar `App.tsx`.
Sin funcionalidades nuevas visibles; **paridad de comportamiento** como criterio principal.

### 002 — Registro de herramientas (L) · [`docs/features/002-tool-registry`](features/002-tool-registry/)
Resuelve D1, D2, D7, D8.

- Introducir un contrato `Tool` (`id`, `label`, `icon`, `description`, componente de entrada, componente de salida, opciones) y un registro en `src/tools/`.
- Herramientas iniciales, extraídas de la lógica actual:
  - **Generar tipos**: entrada JSON / Java / JWT → Interface, Type, Zod, Mermaid, Deserialize.
  - **Comparar**: Expected vs Actual, con sus dos editores visibles a la vez (lado a lado o en pestañas).
  - **JWT**: decodificación + `JwtInfo` (hoy acoplado a "Generar tipos").
  - **Mermaid preview**.
- Sacar `'compare'` de `OutputMode`. Cada herramienta declara qué salidas soporta, en lugar de condicionales en la UI.
- Navegación entre herramientas: barra lateral (desktop) / selector (móvil).
- Hook `useDebouncedValue` con un debounce corto (~150 ms). Mostrar el skeleton solo si el cálculo tarda más de un umbral.
- Unificar los textos visibles en español.

**Impacto (P9)**: `OutputMode` lo consumen `converter.ts`, `ExportMenu.tsx` y `App.tsx`; `CompareReport`, `JwtInfo` y `MermaidPreview` se mueven bajo su herramienta.
**Aceptación**: todas las combinaciones actuales producen la misma salida; `App.tsx` queda como shell (< 100 líneas); los tests existentes pasan sin cambios.

### 003 — Sistema visual y dark mode (M)
Resuelve D3.

- Tokens de color en `index.css` (`@theme` de Tailwind 4) para superficie, borde, texto y acento, con su variante dark.
- Reemplazar los colores fijos en `MainLayout`, los paneles y las barras de herramientas.
- Revisar contraste (WCAG AA) y foco visible; usar la skill `.agents/skills/accessibility`.
- Estados vacíos, de error y de carga coherentes entre herramientas.

**Aceptación**: ningún panel blanco en dark mode; contraste AA en texto; navegable con teclado.

### 004 — Persistencia de sesión (S)
Resuelve D6.

- Guardar en `localStorage`, por herramienta: inputs, modo de salida y opciones. El esquema lleva versión (regla `client-localstorage-schema`).
- Guardar la herramienta activa.
- Acción "Restablecer" por herramienta.

**Aceptación**: al recargar se restaura el estado; un esquema corrupto o antiguo no rompe la app.

---

## Fase 2 — Comparador avanzado

Objetivo: que comparar un DTO con una respuesta real sea útil para depurar APIs.

### 005 — Comparación por forma (M)
Resuelve D4.

- Modo **contrato** (por defecto): el primer elemento de un array del expected actúa como plantilla y cada elemento del actual se compara contra ella. Así no aparecen diffs `extra` por longitud.
- Agrupar los diffs repetidos: `items[*].price — type_mismatch (12 de 50)`.
- Tratar `null` en el expected como "nullable" (configurable), no como el tipo `null` estricto.
- Rutas normalizadas tipo JSONPath (`$.items[*].price`).

**Aceptación**: tests en `comparator.test.ts` para arrays de distinta longitud, arrays heterogéneos, `null` y anidamiento profundo.

### 006 — Comparación de valores y reglas (M)
- Modo **igualdad**: también detecta `value_changed`, para comparar dos respuestas (por ejemplo, staging vs prod).
- Reglas: ignorar rutas con comodines (`*.id`, `meta.timestamp`), ignorar el orden de arrays, tolerancia numérica, comparar strings sin mayúsculas.
- Filtros en `CompareReport`: por tipo de diff y por texto en la ruta.

**Aceptación**: cada regla tiene tests; las reglas se persisten (004).

### 007 — Vista diff y reporte exportable (M)
- Vista lado a lado con el `DiffEditor` de Monaco (ya incluido en `@monaco-editor/react`, sin dependencias nuevas).
- Clic en un diff → resaltar la línea en ambos editores.
- Exportar el reporte en Markdown (para PRs y tickets) y en JSON.

**Aceptación**: el reporte en Markdown es reproducible (mismo input → mismo texto).

---

## Fase 3 — Productividad y UX

Ítems independientes entre sí; se pueden ordenar según prioridad.

### 008 — Opciones de generación (M)
Resuelve D9.

- Panel de opciones por herramienta: nombre raíz, campos opcionales (todos / ninguno / inferidos de `null`), `readonly`, estrategia para `null` (`| null`, `?`, `.nullable()`, `.nullish()`), convención de nombres (camelCase / tal cual), exportar `z.infer`.
- Las opciones viven en los servicios (P2) como un `config` tipado; la UI solo las edita.

**Impacto**: firmas de `jsonToTypeScript`, `jsonToZod`, `javaToTypeScript`, `javaToZod`.

### 009 — Autodetección de entrada y errores en el editor (S)
- Detectar el tipo de entrada: JWT (`eyJ…` con 3 segmentos), Java (`class` / `record` / anotaciones), JSON. Mostrar "Detectado: X" con opción de cambiarlo.
- Errores de parseo de JSON como markers de Monaco, con línea y columna, en lugar de solo un badge.
- Botón "Corregir JSON" para errores comunes: comillas simples, comas finales, claves sin comillas.

### 010 — Compartir por URL (S)
- Comprimir el estado de la herramienta en el hash (`#s=…`) con `CompressionStream('deflate-raw')` nativo + base64url. **Sin dependencias**, y los datos nunca pasan por un servidor.
- Avisar si el contenido parece tener secretos (JWT, `password`, `token`) antes de generar el link.

### 011 — Command palette y atajos (S)
- `Ctrl/Cmd+K`: cambiar de herramienta, formatear, minificar, copiar la salida, descargar, cambiar el tema.
- Atajos globales documentados en un modal `?`.
- Historial reciente de inputs (los últimos N, por herramienta), sobre la persistencia de 004.

---

## Fase 4 — Nuevas herramientas de generación

### 012 — Modelo intermedio (IR) (L)
Resuelve D5. Es la base técnica de la fase.

- Un único paso de inferencia: JSON / Java / JWT / JSON Schema → `SchemaNode` (unión discriminada: `object`, `array`, `primitive`, `union`, `nullable`, `ref`).
- Fusión de muestras: unir varios elementos de un array o varios JSON para inferir campos opcionales y uniones.
- Migrar los generadores existentes (TS, Zod, Mermaid, deserializers) para que consuman el IR. Los tests actuales actúan como red de seguridad.

**Aceptación**: sin cambios en la salida de los tests existentes (o cambios justificados en el plan).

### 013 — JSON Schema y OpenAPI (M)
- Entrada: JSON Schema / OpenAPI 3 (componentes) → TS / Zod.
- Salida: JSON / Java → JSON Schema (draft 2020-12).
- Entrada en YAML para OpenAPI → requiere un parser YAML (evaluar `yaml` vs `js-yaml`, P7).

### 014 — Más lenguajes de salida (M por lenguaje)
Desde el IR: Kotlin `data class`, Java `record` / Lombok, C# `record`, Go `struct` con tags json, Python (pydantic / dataclass), Rust (serde).
Empezar por los dos más útiles para el equipo; el resto queda como incremental.

### 015 — Generador de mocks (M)
- Desde el IR: generar N objetos de ejemplo con valores plausibles según el nombre del campo (`email`, `id`, `createdAt`…) y el formato (`uuid`, ISO date).
- Exportar como JSON, fixture TS o handler de MSW.
- Semilla configurable para obtener mocks reproducibles. Sin `faker` en la primera versión (P7): diccionario propio pequeño.

### 016 — cURL → cliente tipado (M)
- Parsear un comando `curl` (método, headers, body, query).
- Generar `fetch` / `axios` tipado. Si se pega también la respuesta, generar su interfaz y su schema Zod.
- Ocultar los headers sensibles (`Authorization`, cookies) por defecto.

---

## Fase 5 — Utilidades para devs

### 017 — Explorador JSON (M)
- Vista de árbol que se puede colapsar, con búsqueda y "copiar ruta" / "copiar valor".
- Consultas JSONPath (implementación propia de un subconjunto o una dependencia ligera, P7).
- Estadísticas: profundidad, nº de claves y tamaño.

### 018 — Conversores rápidos (S cada uno)
JSON ↔ YAML / CSV / query string, Base64 encode/decode, escapar/desescapar strings, epoch ↔ fecha ISO, URL encode/decode.
Una herramienta "Conversores" con sub-selector, que reutiliza el layout de dos paneles.

### 019 — JWT avanzado (S)
- Estado de `exp` / `nbf` / `iat`: válido, expirado, tiempo restante, fechas legibles.
- Verificar la firma HS256/384/512 con un secreto (WebCrypto, local). RS/ES con clave pública PEM o JWK.
- Editar el payload y regenerar el token (solo HS, para pruebas locales).

---

## Transversal (en cada feature)

- Tests de los servicios nuevos en `src/__tests__/` (P3); los criterios de UI van al `checklist.md`.
- Quality gates de la constitución: `npm run build`, `npm run lint`, `npm test`, sin empeorar la baseline.
- Accesibilidad: foco, `aria-label` en botones de icono, contraste.
- Rendimiento: lazy-load por herramienta (`React.lazy`) para que Mermaid y Monaco no penalicen la carga inicial. Mover a un Web Worker los cálculos sobre JSON grandes (> 1 MB).

## Cómo arrancar

```bash
npm run sdd -- new tool-registry --title "Registro de herramientas"
```

Después, `/sdd-spec` sobre la feature 002 y seguir el flujo. Cuando una feature se cree,
añade su ruta al lado de su número en este documento.
