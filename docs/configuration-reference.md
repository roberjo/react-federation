# Configuration Reference

Complete reference for all configuration files and options in the project.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Vite Configuration](#vite-configuration)
3. [TypeScript Configuration](#typescript-configuration)
4. [Package.json Scripts](#packagejson-scripts)
5. [ESLint Configuration](#eslint-configuration)
6. [Prettier Configuration](#prettier-configuration)
7. [Tailwind Configuration](#tailwind-configuration)

## Environment Variables

### Portal (`packages/portal/.env`)

```env
# Authentication
VITE_USE_MOCK_AUTH=true              # Use mock authentication in development
VITE_OKTA_CLIENT_ID=your_client_id   # Okta client ID (production)
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default

# API Configuration
VITE_USE_MOCK_API=true               # Use mock API in development
VITE_API_BASE_URL=http://localhost:3000/api

# Manifest Configuration
VITE_MANIFEST_URL=http://localhost:8080/manifest.json

# Application
VITE_APP_NAME=Financial Services Portal
```

### Remote Modules (`packages/*/.env`)

```env
# API Configuration
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000/api
```

## Vite Configuration

### Portal Configuration

```typescript
// packages/portal/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portal',
      remotes: {
        // Development remotes
        tradePlans: 'http://localhost:5001/assets/remoteEntry.js',
        clientVerification: 'http://localhost:5002/assets/remoteEntry.js',
        annuitySales: 'http://localhost:5003/assets/remoteEntry.js',
      },
      shared: {
        'react': { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'mobx': { singleton: true },
        'mobx-react-lite': { singleton: true },
        'react-router-dom': { singleton: true }
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
  },
  server: {
    port: 5173,
    strictPort: true
  }
})
```

### Remote Module Configuration

```typescript
// packages/trade-plans/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tradePlans',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        'react': { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'mobx': { singleton: true },
        'mobx-react-lite': { singleton: true },
        'react-router-dom': { singleton: true }
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    cssCodeSplit: true,
  },
  server: {
    port: 5001,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
})
```

### Federation Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | `string` | Unique name for the module federation instance |
| `filename` | `string` | Name of the remote entry file (default: `remoteEntry.js`) |
| `remotes` | `object` | Map of remote names to URLs (host only) |
| `exposes` | `object` | Map of exposed module paths (remote only) |
| `shared` | `object` | Shared dependencies configuration |

### Shared Dependency Options

| Option | Type | Description |
|--------|------|-------------|
| `singleton` | `boolean` | Ensure only one instance is loaded |
| `requiredVersion` | `string` | Required version (semver range) |
| `eager` | `boolean` | Load immediately instead of on-demand |

## TypeScript Configuration

### Root Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@federation/shared/*": ["./packages/shared/src/*"]
    }
  },
  "include": ["packages/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Package.json Scripts

### Root Scripts

```json
{
  "scripts": {
    "dev": "pnpm --parallel --filter './packages/*' dev",
    "dev:portal": "pnpm --filter portal dev",
    "dev:trade-plans": "pnpm --filter trade-plans dev",
    "dev:client-verification": "pnpm --filter client-verification dev",
    "dev:annuity-sales": "pnpm --filter annuity-sales dev",
    "build": "pnpm --recursive build",
    "build:portal": "pnpm --filter portal build",
    "lint": "pnpm --recursive lint",
    "test": "pnpm --recursive test",
    "test:coverage": "pnpm --recursive test:coverage",
    "test:e2e": "pnpm --filter portal test:e2e",
    "clean": "pnpm --recursive clean && Remove-Item -Recurse -Force node_modules"
  }
}
```

### Package Scripts

Each package includes:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --build && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "clean": "rm -rf dist node_modules/.vite",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## ESLint Configuration

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", "build", "*.config.js"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
```

## Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

## pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

## Port Assignments

| Service | Port | Description |
|---------|------|-------------|
| Portal | 5173 | Main host application |
| Trade Plans | 5001 | Trade Plans remote module |
| Client Verification | 5002 | Client Verification remote module |
| Annuity Sales | 5003 | Annuity Sales remote module |

## Build Output Structure

### Portal Build

```
packages/portal/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── manifest.json
```

### Remote Build

```
packages/trade-plans/dist/
├── assets/
│   ├── remoteEntry.js      # Module Federation entry point
│   ├── App-[hash].js
│   └── App-[hash].css
└── index.html              # For standalone mode
```

## Environment-Specific Configuration

### Development

- Mock authentication enabled
- Mock API enabled
- Source maps enabled
- Hot module replacement enabled
- CORS enabled for remotes

### Production

- Real Okta authentication
- Real API endpoints
- Minified bundles
- Source maps disabled
- CDN deployment
- Manifest-based remote loading

---

**Last Updated:** 2024

