# Typify - JSON to TypeScript/Zod Schema Converter

This tool converts JSON data into TypeScript interfaces/types and Zod validation schemas.

## Features

- Convert JSON to TypeScript interfaces or types
- Generate Zod schemas for runtime validation
- Real-time conversion as you type
- Format and minify JSON
- Copy to clipboard functionality

## Enhanced Logic Features

This version includes several logic enhancements:

### 1. Union Type Detection
Automatically detects mixed types in arrays and generates appropriate TypeScript unions and Zod unions:
```typescript
// Input: ["string", 42, true, null]
// Output: (string | number | boolean | null)[]
```

### 2. Circular Reference Protection
Prevents infinite loops when processing self-referencing objects.

### 3. Improved Null Type Handling
Null values are properly typed as `null` instead of `any`.

### 4. Enhanced Array Processing
Better handling of both homogeneous and heterogeneous arrays.

## Development

To run the development server:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## Implementation Details

See [LOGIC_ENHANCEMENTS.md](LOGIC_ENHANCEMENTS.md) for detailed documentation of the logic enhancements implemented.

## Dependencies

- React + TypeScript + Vite (base template)
- Monaco Editor for code editing
- Zod for schema validation
- Tailwind CSS for styling

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
