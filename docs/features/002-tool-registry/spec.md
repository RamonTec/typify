---
feature: 002
doc: spec
estado: aprobado
actualizado: 2026-10-08
---

# Spec 002 — Registro de herramientas

## Contexto y problema

Typify ofrece hoy cuatro capacidades distintas (generar tipos, comparar payloads, decodificar JWT y previsualizar Mermaid),
pero las presenta como una única pantalla con dos selectores: uno de **entrada** (JSON / Java / JWT / Mermaid) y otro de
**salida** (Interface / Type / Zod Schema / Compare / Mermaid / Deserialize). Esto provoca:

- **Matriz confusa (D1).** "Compare" aparece como modo de salida pero cambia por completo el panel de entrada;
  "Mermaid" existe como entrada y como salida con significados distintos; "Deserialize" desaparece al elegir Java
  sin explicación y, si estaba seleccionado, la salida pasa a ser silenciosamente una Interface.
- **Pantalla monolítica (D2).** Todo el estado y los textos dependen de combinaciones de modos, de modo que añadir una
  herramienta nueva (roadmap fases 2–5) obliga a tocar el núcleo de la app y arriesga regresiones.
- **Latencia artificial (D7).** Cada pulsación espera 500 ms y muestra un esqueleto de carga, aunque la conversión es
  prácticamente instantánea.
- **Idioma mezclado (D8).** Conviven textos en inglés ("Waiting for inputs...", "Export", "Copy to Clipboard",
  "Expected DTO", "Expired"...) con textos en español, en contra de P8.

Es la primera feature del roadmap porque bloquea a 003 (sistema visual), 004 (persistencia) y al resto de herramientas.

## Objetivos

- Que el usuario elija primero **qué quiere hacer** (herramienta) y después, dentro de ella, solo las opciones que tienen sentido.
- Que añadir una herramienta nueva consista en declararla, sin modificar la lógica de las existentes.
- Mantener **paridad de comportamiento**: todo lo que se puede generar hoy se sigue generando con la misma salida.
- Respuesta inmediata al escribir y una UI íntegramente en español.

## Fuera de alcance

- Cambios en la salida de los generadores (TS, Zod, Mermaid, deserializadores) o en el algoritmo del comparador (eso es 005/006).
- Tokens de color, dark mode completo y revisión de contraste (003).
- Persistencia del estado entre recargas, incluida la herramienta activa (004).
- Rutas o URLs por herramienta y compartir por URL (010).
- Command palette y atajos de teclado globales (011).
- Opciones de generación configurables, como el nombre raíz (008).
- Autodetección del tipo de entrada y errores de parseo como markers del editor (009).
- Renderizar como diagrama la salida Mermaid generada en "Generar tipos" (sigue mostrándose como código).
- Herramientas nuevas que no existan hoy.

## Historias de usuario

### US1 — Elegir una herramienta (P1)
- **Como** desarrollador que usa Typify
- **Quiero** ver las herramientas disponibles y cambiar entre ellas
- **Para** encontrar rápidamente la función que necesito sin descifrar combinaciones de modos

**Criterios de aceptación**
- **AC-1.1** — Dado que abro la app, cuando carga, entonces veo la lista de herramientas: "Generar tipos", "Comparar", "JWT" y "Vista previa Mermaid", cada una con icono, nombre y una descripción breve accesible (visible o como tooltip/`aria-description`), y "Generar tipos" está activa.
- **AC-1.2** — Dado un viewport de escritorio (≥ 768 px de ancho), cuando miro la pantalla, entonces la navegación entre herramientas es una barra lateral permanente y la herramienta activa está marcada visualmente y con `aria-current`.
- **AC-1.3** — Dado un viewport móvil (< 768 px), cuando miro la pantalla, entonces la navegación es un selector compacto que muestra la herramienta activa y no provoca scroll horizontal.
- **AC-1.4** — Dado que he escrito contenido en una herramienta, cuando cambio a otra y vuelvo, entonces el contenido, el modo de salida y las opciones de la primera siguen como los dejé (dentro de la misma sesión, sin recargar).
- **AC-1.5** — Dado el teclado como único dispositivo, cuando navego con Tab y Enter/Espacio, entonces puedo llegar a cualquier herramienta y activarla, con foco visible.

### US2 — Generar tipos con paridad (P1)
- **Como** desarrollador
- **Quiero** generar Interface, Type, Zod, Mermaid o deserializador desde JSON, Java o JWT
- **Para** seguir obteniendo exactamente lo mismo que hoy, con una interfaz más clara

**Criterios de aceptación**
- **AC-2.1** — Dada la herramienta "Generar tipos", cuando elijo la entrada, entonces solo puedo elegir JSON, Java o JWT (Mermaid ya no es una entrada de esta herramienta).
- **AC-2.2** — Dada una entrada, cuando miro las salidas disponibles, entonces solo aparecen las que esa entrada soporta: JSON → Interface, Type, Zod, Mermaid, Deserializador; Java → Interface, Type, Zod, Mermaid; JWT → Interface, Type, Zod, Mermaid, Deserializador. "Comparar" no aparece como salida.
- **AC-2.3** — Dada la salida Mermaid, cuando la selecciono, entonces puedo elegir el tipo de diagrama (Clase, ER, Flujo).
- **AC-2.4** — Para **cada** combinación (entrada, salida, tipo de diagrama) de la tabla de "Ejemplos › Matriz de paridad", dado el mismo texto de entrada, la salida generada es idéntica carácter a carácter a la que produce la versión anterior a esta feature. Esta paridad está cubierta por tests automatizados que se escriben **antes** de reorganizar la UI.
- **AC-2.5** — Dada la salida "Deserializador" seleccionada con entrada JSON, cuando cambio la entrada a Java, entonces la salida seleccionada pasa a la primera disponible (Interface) y el selector lo refleja visiblemente; nunca se muestra una salida distinta de la que aparece seleccionada.
- **AC-2.6** — Dada una entrada que no se puede convertir (JSON inválido, Java sin clase reconocible, JWT mal formado), cuando escribo, entonces el panel de salida muestra el estado vacío/de error en lugar de una salida obsoleta, y el indicador de error de la entrada se mantiene como hoy (badge "Error" en JSON; badge con el motivo en JWT).
- **AC-2.7** — Dada una salida generada, cuando abro el menú de exportar, entonces puedo copiarla o descargarla con el mismo nombre y extensión que hoy (`types-AAAAMMDD.ts`, `schema-AAAAMMDD.ts`, `deserialize-AAAAMMDD.ts`, `diagram-AAAAMMDD.mmd`).
- **AC-2.8** — Dada la entrada JSON válida, cuando pulso Formatear o Minificar, entonces el editor muestra el resultado y Deshacer/Rehacer funcionan como hoy.

### US3 — Comparar dos payloads (P1)
- **Como** desarrollador que depura una API
- **Quiero** una herramienta "Comparar" con el payload esperado y el real
- **Para** detectar diferencias de estructura sin pasar por un "modo de salida"

**Criterios de aceptación**
- **AC-3.1** — Dada la herramienta "Comparar" en escritorio (≥ 768 px), cuando la abro, entonces veo a la vez dos editores etiquetados "Esperado" y "Actual" en el panel de entrada, además del informe en el panel de resultado.
- **AC-3.1b** — Dada la herramienta "Comparar" en móvil (< 768 px), cuando la abro, entonces veo una entrada cada vez y puedo cambiar entre ellas mediante pestañas "Esperado" / "Actual".
- **AC-3.2** — Dados ambos JSON válidos, cuando escribo en cualquiera de ellos, entonces el informe de diferencias se actualiza y su contenido es idéntico al que produce hoy el comparador para esas mismas entradas.
- **AC-3.3** — Dada una o ambas entradas vacías, cuando miro el panel de resultado, entonces veo un estado vacío en español que indica cuál falta ("Pega el JSON esperado y el actual…", "Falta el JSON esperado", "Falta el JSON actual").
- **AC-3.4** — Dada cualquiera de las dos entradas, cuando pulso "Limpiar", entonces solo se vacía esa entrada.

### US4 — Decodificar un JWT (P2)
- **Como** desarrollador
- **Quiero** una herramienta "JWT" que decodifique el token y muestre su información
- **Para** inspeccionar un token sin tener que generar tipos

**Criterios de aceptación**
- **AC-4.1** — Dado un JWT válido en la herramienta "JWT", cuando lo pego, entonces veo la información del token (algoritmo, cabecera, claims de tiempo con su estado) y el payload decodificado como JSON formateado.
- **AC-4.2** — Dado un JWT inválido, cuando lo pego, entonces veo el motivo del error en español y ningún payload obsoleto.
- **AC-4.3** — Dada la herramienta "Generar tipos" con entrada JWT, cuando pego un token válido, entonces se generan los tipos del payload (AC-2.4) y se muestra el badge con el algoritmo, pero el panel de información del token **no** aparece: ese panel es exclusivo de la herramienta "JWT".

### US5 — Vista previa Mermaid (P2)
- **Como** desarrollador
- **Quiero** una herramienta "Vista previa Mermaid"
- **Para** renderizar un diagrama pegado, como hoy con la entrada Mermaid

**Criterios de aceptación**
- **AC-5.1** — Dado código Mermaid válido, cuando lo pego en "Vista previa Mermaid", entonces se renderiza el diagrama con los mismos controles de zoom y ajuste que hoy.
- **AC-5.2** — Dado código Mermaid inválido, cuando lo pego, entonces veo el mensaje de error del render como hoy y no se cuelga la app.

### US6 — Respuesta inmediata (P2)
- **Como** usuario que escribe o pega contenido
- **Quiero** ver la salida actualizada casi al instante
- **Para** no tener la sensación de que la app está "pensando"

**Criterios de aceptación**
- **AC-6.1** — Dada cualquier herramienta, cuando dejo de escribir, entonces la salida se actualiza en ≤ 150 ms (± 50 ms) más el tiempo de cálculo.
- **AC-6.2** — Dada una entrada de 100 KB o menos, cuando se actualiza la salida, entonces no aparece ningún esqueleto de carga (sin parpadeo).
- **AC-6.3** — Dada una entrada de más de 100 KB, cuando se recalcula, entonces se pinta el esqueleto de carga antes de iniciar el cálculo y se mantiene hasta que aparece la salida.
- **AC-6.4** — Dadas varias pulsaciones seguidas, cuando escribo, entonces solo se calcula con el último valor (no se muestran resultados de valores intermedios ya superados).

### US7 — Interfaz en español (P2)
- **Como** usuario hispanohablante
- **Quiero** que todos los textos visibles estén en español
- **Para** una experiencia coherente (P8)

**Criterios de aceptación**
- **AC-7.1** — Dada cualquier herramienta y estado (vacío, error, con resultado, menús de importar/exportar abiertos), cuando reviso los textos visibles, `title` y `aria-label`, entonces están en español, salvo nombres propios y términos técnicos de la lista de "Supuestos".
- **AC-7.2** — Los textos en inglés detectados hoy se sustituyen al menos por: "Input" → "Entrada", "Output" → "Salida", "Preview" → "Vista previa", "Undo/Redo" → "Deshacer/Rehacer", "Export" → "Exportar", "Copy to Clipboard" → "Copiar al portapapeles", "Download as" → "Descargar como", "Import"/"Import JSON" → "Importar"/"Importar JSON", "Choose JSON file" → "Elegir archivo JSON", "Expected DTO"/"Actual Payload" → "Esperado"/"Actual", "Waiting for inputs..." → "Esperando datos...", "Expired"/"Valid" → "Expirado"/"Válido", "Empty header" → "Cabecera vacía", "Reference" → "Referencia", "Deserialize" → "Deserializador", "Class/ER/Flow" → "Clase/ER/Flujo".

## Requisitos funcionales

- **FR-001** — Cada herramienta declara su identificador, nombre, icono, descripción, las entradas que acepta y las salidas que soporta por entrada. La UI deriva selectores, estados vacíos y textos de esa declaración, no de comparaciones entre modos.
- **FR-002** — La importación (archivo o URL) y el pegado desde el portapapeles escriben en la entrada en cuya barra o estado vacío se pulsaron. En "Comparar", cada editor tiene los suyos.
- **FR-004** — Las entradas de cada herramienta son independientes: escribir en una herramienta no modifica las entradas de otra.
- **FR-003** — El cambio de tema (claro/oscuro) y la cabecera de la app son comunes a todas las herramientas.

## Requisitos no funcionales

- **NFR-001** — Mantenibilidad: añadir una herramienta nueva no requiere modificar el código de ninguna herramienta existente ni el de la carcasa de la app más allá de registrarla en un único punto.
- **NFR-002** — La carcasa de la app (cabecera, navegación y contenedor de la herramienta activa) es pequeña: < 100 líneas en su componente raíz.
- **NFR-003** — Sin regresiones: los tests existentes pasan sin modificarse; build y lint no empeoran la baseline del plan (P6).
- **NFR-004** — Accesibilidad: todos los botones de solo icono tienen `aria-label` en español; la navegación entre herramientas es operable por teclado.
- **NFR-005** — Rendimiento: la carga inicial no empeora respecto a la baseline (el plan mide el tamaño del bundle inicial).

## Casos límite y errores

- **Entrada vacía**: cada herramienta muestra su estado vacío propio con acción "Pegar del portapapeles"; sin salida ni esqueleto.
- **Entrada inválida**: ver AC-2.6, AC-3.3, AC-4.2 y AC-5.2. Nunca se muestra la salida del valor válido anterior.
- **Entrada enorme (≈ 1 MB de JSON)**: la app sigue respondiendo; se ve el esqueleto mientras se calcula (AC-6.3). Mover el cálculo a un Web Worker queda fuera de alcance.
- **Caracteres especiales**: claves con espacios, guiones o Unicode producen la misma salida que hoy (cubierto por la matriz de paridad).
- **Salida no soportada tras cambiar de entrada**: AC-2.5.
- **Cambio rápido de herramienta mientras se calcula**: el resultado de una herramienta nunca aparece en otra.
- **Portapapeles denegado**: no se rompe la app; se muestra un aviso en español (hoy solo se registra en consola).
- **Importación por URL que falla**: el mensaje de error del menú de importar está en español.

## Ejemplos

### Matriz de paridad (base de AC-2.4)

Combinaciones que deben producir salida idéntica a la actual, con al menos estos fixtures por entrada:
un objeto plano, un objeto anidado con array de objetos, un array raíz, claves con caracteres no válidos como identificador
y valores `null`.

| Entrada | Salidas | Nombre raíz actual |
|---------|---------|--------------------|
| JSON | Interface, Type, Zod, Mermaid (Clase, ER, Flujo), Deserializador | `Root` |
| Java | Interface, Type, Zod, Mermaid (Clase, ER, Flujo) | el de la clase |
| JWT | Interface, Type, Zod, Mermaid (Clase, ER, Flujo), Deserializador | `JwtPayload` |

Total: 7 + 6 + 7 = 20 combinaciones por fixture.

### Ejemplo concreto

Entrada JSON:
```json
{ "id": 1, "user-name": "ana", "tags": ["a"], "meta": null }
```
Salida Interface (igual que hoy):
```ts
export interface Root {
  id: number;
  "user-name": string;
  tags: string[];
  meta: null;
}
```

### Comparar
Esperado `{ "id": 1, "name": "x" }`, Actual `{ "id": "1" }` → el informe es el mismo que hoy: `id` con tipo distinto
(`number` vs `string`) y `name` ausente.

## Supuestos

- Los términos técnicos y nombres propios se mantienen sin traducir: JSON, Java, JWT, Mermaid, TypeScript, Interface, Type, Zod, DTO, ER, Typify, Beta.
- El botón "Buy me a Coffee" se traduce a "Invítame a un café" (es un enlace externo, no cambia de destino).
- El estado de cada herramienta vive en memoria durante la sesión; recargar lo pierde (persistencia en 004).
- El historial de Deshacer/Rehacer es por entrada (como hoy existe para la entrada principal). En "Comparar" se añade también para la entrada "Actual".
- La entrada Java sigue resaltándose como hoy; corregir el lenguaje del editor no es objetivo de esta feature.
- El punto de corte escritorio/móvil (768 px) es el que ya usa el layout actual.

## Preguntas abiertas

- [RESUELTO] **Q1** — JWT: ¿se queda en "Generar tipos" además de la nueva herramienta? → Ambas. "Generar tipos" mantiene la entrada JWT con el badge de algoritmo o error; el panel de información del token pasa a ser exclusivo de la herramienta "JWT" (AC-4.3).
- [RESUELTO] **Q2** — Comparar: ¿lado a lado o pestañas? → Lado a lado en escritorio y pestañas en móvil (AC-3.1, AC-3.1b).
- [RESUELTO] **Q3** — Alcance: ¿una feature o dos? → Una sola 002; las tareas se ordenan para entregar primero las historias P1.
- [RESUELTO] **Q5** — (surgida en /sdd-plan) El esqueleto por duración no puede pintarse con cálculo síncrono → umbral por tamaño de entrada, 100 KB (AC-6.2, AC-6.3). Importar y pegar, por entrada (FR-002). Aprobado por el usuario el 2026-10-08.
- [RESUELTO] **Q4** — ¿Entradas compartidas? → Independientes por herramienta (FR-004). Cambio deliberado respecto a hoy, donde el "Esperado" de Comparar reutiliza la entrada de generar tipos.
