---
name: sdd
description: Punto de entrada del flujo Spec-Driven Development de Typify. Muestra el estado de las features (spec, plan, tareas, checklist) y recomienda el siguiente paso. Úsalo cuando el usuario pregunte por el estado del SDD, qué sigue, o quiera empezar una feature nueva sin saber el comando.
argument-hint: "[feature]"
---

# SDD — estado y siguiente paso

Typify sigue Spec-Driven Development. La guía completa está en `docs/sdd/README.md` y los principios en `docs/sdd/constitution.md`.

## Pasos

1. Ejecuta `node scripts/sdd.mjs status $ARGUMENTS` (si el usuario indicó una feature, pásala como argumento).
2. Resume al usuario, en pocas líneas:
   - Features en curso y en qué fase está cada una.
   - La feature activa y su siguiente comando recomendado.
3. Si no hay features en curso, explica que se empieza con `/sdd-spec <descripción de la feature>`.

## Reglas comunes a todas las fases del SDD

Estas reglas aplican a `sdd-spec`, `sdd-plan`, `sdd-tasks`, `sdd-implement` y `sdd-verify`:

- **Resolución de feature**: si el usuario no indica la feature, usa `node scripts/sdd.mjs active`. Se acepta el número (`002`), el slug o el nombre completo.
- **Puertas de aprobación**: una fase solo empieza si el artefacto anterior tiene `estado: aprobado`. Si no, dilo y propón el comando correcto. Nunca cambies `estado` a `aprobado` sin una aprobación explícita del usuario en el chat.
- **Frontmatter**: al editar un artefacto, actualiza `actualizado:` con la fecha de hoy y `estado:` según corresponda.
- **Idioma**: los artefactos se escriben en español; los identificadores de código, en inglés como el resto del repo.
- **CodeGraph**: para preguntas estructurales del código (dónde se define, quién llama, impacto) usa las herramientas `codegraph_*` antes que grep.
- **Fuente de verdad**: si el código y la spec divergen, gana la spec aprobada; si la spec está mal, se corrige la spec primero y se vuelve a pedir aprobación.
