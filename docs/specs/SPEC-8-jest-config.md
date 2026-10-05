# SPEC-8 — Configuración de Jest

## Descripción
Hacer ejecutables los tests del proyecto (actualmente huérfanos: `tsconfig.app.json` excluye `__tests__` y no hay `test` script).

## Criterios de aceptación

### Archivos nuevos
- [ ] `tsconfig.test.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "esModuleInterop": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "verbatimModuleSyntax": true
    },
    "include": ["src"]
  }
  ```
- [ ] `jest.config.cjs` (CommonJS para evitar colisión con `"type": "module"` en package.json):
  ```js
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
    transform: { '^.+\\.ts$': ['ts-jest', { isolatedModules: true }] },
    moduleFileExtensions: ['ts', 'js', 'json'],
    tsconfig: '<rootDir>/tsconfig.test.json',
  };
  ```

### package.json
- [ ] Añadir script:
  ```json
  "test": "jest --config jest.config.cjs"
  ```

### Riesgos conocidos
- El repo tiene `ts-jest@29.4.9` con `jest@30.4.2`. Si `ts-jest` falla por peer-dep con jest 30:
  - [ ] Opción A: actualizar `ts-jest` a la versión compatible con jest 30
  - [ ] Opción B: usar `@swc/jest` como transform alternativo (requiere instalar)
  - [ ] Documentar la decisión en commit

### Verificación
- [ ] `npm test` ejecuta los tests existentes sin error
- [ ] `npm test` ejecuta los nuevos tests de SPEC-9