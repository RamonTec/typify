---
feature: {{ID}}
doc: plan
estado: pendiente
actualizado: {{DATE}}
---

# Plan {{ID}} — {{TITLE}}

Spec: [spec.md](./spec.md)

## Resumen técnico
<!-- 3-5 líneas: enfoque elegido y por qué. -->

## Check de constitución
| Principio | Cumple | Nota |
|-----------|--------|------|
| P1 Spec primero | | |
| P2 Servicios puros | | |
| P3 Tests como contrato | | |
| P4 Tipado estricto | | |
| P5 Atomic design | | |
| P6 Sin regresiones | | |
| P7 Dependencias mínimas | | |
| P8 Estilo | | |
| P9 Análisis de impacto | | |

## Baseline
<!-- Medida antes de tocar código. La verificación final se compara contra esto. -->
| Gate | Resultado |
|------|-----------|
| `npm run build` | |
| `npm run lint` | N errores |
| `npm test` | X pasan / Y fallan (cuáles) |

## Diseño

### Módulos y responsabilidades
<!-- Servicios, hooks, componentes nuevos o modificados y qué hace cada uno. -->

### Contratos
```ts
// Firmas públicas, tipos y esquemas que se exponen.
```

### Flujo de datos
<!-- Del input del usuario al output. Un diagrama mermaid si ayuda. -->

## Archivos afectados
| Archivo | Cambio | Consumidores afectados (CodeGraph) |
|---------|--------|-----------------------------------|
| | nuevo / modificado | |

## Estrategia de tests
| AC | Tipo | Archivo de test / verificación |
|----|------|--------------------------------|
| AC-1.1 | unitario | `src/__tests__/...test.ts` |

## Riesgos y mitigaciones
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|

## Decisiones
<!-- - **D1** — Decisión. Alternativas: A, B. Motivo: ... -->

## Fases
<!-- Agrupación de alto nivel que seguirá tasks.md. -->
1. Fundamentos (tipos, servicios puros)
2. Tests
3. Integración UI
4. Verificación
