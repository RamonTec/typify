---
name: sdd-spec
description: Fase 1 del SDD de Typify. Crea una feature nueva (o retoma una existente) y redacta su spec.md con historias de usuario, criterios de aceptación verificables, casos límite y preguntas abiertas, aclarando ambigüedades con el usuario. Úsalo cuando el usuario quiera especificar, definir o empezar una feature nueva, o refinar o aprobar una spec.
argument-hint: "<descripción de la feature> | <feature> [aprobar]"
---

# SDD fase 1 — Especificar

Entrada del usuario: `$ARGUMENTS` (si no se sustituyó, usa el mensaje que invocó este skill).

Lee primero `docs/sdd/constitution.md` y las reglas comunes del skill `sdd` (`.claude/skills/sdd/SKILL.md`).

## Objetivo

Producir un `spec.md` que describa **qué** debe hacer la feature y **por qué**, sin decidir el **cómo**.
Una buena spec permite escribir los tests sin haber visto el código.

## Pasos

### 1. Determinar la feature
- Si la entrada es una descripción nueva, propón un slug corto en kebab-case y un título, y ejecuta
  `node scripts/sdd.mjs new <slug> --title "<título>"`. El comando imprime la carpeta creada.
- Si la entrada nombra una feature existente, trabaja sobre su `spec.md`.
- Si la entrada es "aprobar" (o el usuario aprueba en el chat), salta al paso 6.

### 2. Investigar el contexto
- Entiende cómo encaja la feature en la app: modos de entrada y salida (`src/App.tsx`, `src/services/converter.ts`),
  servicios existentes reutilizables y componentes relacionados. Usa `codegraph_context` o `codegraph_explore`.
- Si la investigación es amplia y tienes subagentes disponibles, delégala en `sdd-analyst`.
- Revisa features previas en `docs/features/` para mantener coherencia.

### 3. Redactar la spec
Rellena todas las secciones de `spec.md`:
- **Historias de usuario** con prioridad (P1/P2/P3). Cada una debe poder entregarse y probarse por separado.
- **Criterios de aceptación** con formato Dado / Cuando / Entonces e IDs estables `AC-<historia>.<n>`.
  Deben ser observables y comprobables. Nada de "debe ser rápido": di cuánto.
- **Requisitos** `FR-NNN` y `NFR-NNN` solo si aportan algo que los AC no cubren.
- **Casos límite**: entrada vacía, inválida, enorme, caracteres especiales, interacción con otros modos.
- **Ejemplos** concretos de entrada y salida: serán la base de los tests.
- **Fuera de alcance**: explícito, para evitar que la feature crezca.
- No incluyas nombres de archivos, librerías ni diseño técnico: eso va en el plan.

### 4. Aclarar
- Marca cada duda real con `- [NECESITA ACLARACIÓN] ...` en "Preguntas abiertas".
- Pregunta al usuario como máximo 5 cosas a la vez, priorizando las que cambian el alcance o los AC.
  Ofrece opciones concretas con una recomendada.
- Con las respuestas, actualiza la spec y cambia la marca a `- [RESUELTO] pregunta → respuesta`.
- Lo que sea razonable deducir no se pregunta: va a "Supuestos".

### 5. Autoevaluación
- Recorre la sección "A. Calidad de la spec" de `checklist.md` y marca lo que se cumple.
- Pon `estado: borrador` en `spec.md` y presenta al usuario un resumen: historias, nº de AC, supuestos clave
  y preguntas pendientes. Pide aprobación explícita.

### 6. Aprobación
- Solo con aprobación explícita del usuario: verifica que no quedan `[NECESITA ACLARACIÓN]`,
  pon `estado: aprobado` y actualiza la fecha.
- Indica que el siguiente paso es `/sdd-plan`.

## No hacer
- No crear ni modificar archivos en `src/`.
- No aprobar la spec por iniciativa propia.
