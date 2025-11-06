# Monorepo Setup Guide

## Overview

This guide covers setting up the enterprise portal as a **monorepo** for initial development and proof of concept. This approach allows:
- Easier local development
- Shared code and types
- Simplified dependency management
- Faster iteration
- Easier testing

**Note**: The monorepo can be split into separate repositories later for production deployment.

## Monorepo Structure

```
react-federation/
├── packages/
│   ├── portal/              # Main shell application
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── trade-plans/         # Trade Plans remote module
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── client-verification/ # Client Verification remote module
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── annuity-sales/       # Annuity Sales remote module
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── shared/              # Shared code and types
│       ├── types/           # TypeScript types
│       ├── utils/           # Shared utilities
│       └── package.json
│
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # or npm/yarn workspaces
├── tsconfig.json            # Root TypeScript config
└── README.md
```

## Package Manager Setup

### Option 1: pnpm (Recommended)

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### Option 2: npm workspaces

```json
// package.json
{
  "name": "react-federation",
  "workspaces": [
    "packages/*"
  ]
}
```

### Option 3: yarn workspaces

```json
// package.json
{
  "name": "react-federation",
  "workspaces": [
    "packages/*"
  ]
}
```

## Root Package.json

```json
{
  "name": "react-federation-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter './packages/*' dev",
    "dev:portal": "pnpm --filter portal dev",
    "dev:trade-plans": "pnpm --filter trade-plans dev",
    "dev:client-verification": "pnpm --filter client-verification dev",
    "dev:annuity-sales": "pnpm --filter annuity-sales dev",
    "build": "pnpm --recursive build",
    "build:portal": "pnpm --filter portal build",
    "build:trade-plans": "pnpm --filter trade-plans build",
    "build:client-verification": "pnpm --filter client-verification build",
    "build:annuity-sales": "pnpm --filter annuity-sales build",
    "lint": "pnpm --recursive lint",
    "test": "pnpm --recursive test",
    "clean": "pnpm --recursive clean"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

## Shared Package Setup

```json
// packages/shared/package.json
{
  "name": "@federation/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    "./types": "./src/types/index.ts",
    "./utils": "./src/utils/index.ts"
  }
}
```

### Shared Types

```typescript
// packages/shared/src/types/auth.types.ts
export interface JwtClaims {
  sub: string
  email: string
  name: string
  groups: string[]
  roles?: string[]
  [key: string]: any
}

export interface AuthState {
  user?: JwtClaims
  token?: string | null
  groups?: string[]
  isAuthenticated?: boolean
  hasGroup?: (group: string) => boolean
  hasAnyGroup?: (groups: string[]) => boolean
  hasRole?: (role: string) => boolean
}

export interface AppProps {
  auth?: AuthState
  onLogout?: () => void
  [key: string]: any
}
```

```typescript
// packages/shared/src/types/index.ts
export * from './auth.types'
export * from './trade.types'
export * from './client.types'
export * from './annuity.types'
```

## Portal Package Setup

```json
// packages/portal/package.json
{
  "name": "portal",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.20.0",
    "mobx": "^6.10.0",
    "mobx-react-lite": "^4.0.0",
    "@okta/okta-react": "^6.0.0",
    "@okta/okta-auth-js": "^7.0.0",
    "@federation/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@originjs/vite-plugin-federation": "^1.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## Remote Package Setup

```json
// packages/trade-plans/package.json
{
  "name": "trade-plans",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5001",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.3",
    "react-router-dom": "^6.20.0",
    "mobx": "^6.10.0",
    "mobx-react-lite": "^4.0.0",
    "@federation/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@originjs/vite-plugin-federation": "^1.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## Vite Configuration

### Portal Vite Config

```typescript
// packages/portal/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portal',
      remotes: isDev
        ? {
            tradePlans: 'http://localhost:5001/assets/remoteEntry.js',
            clientVerification: 'http://localhost:5002/assets/remoteEntry.js',
            annuitySales: 'http://localhost:5003/assets/remoteEntry.js',
          }
        : {},
      shared: {
        'react': { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        'mobx': { singleton: true },
        'mobx-react-lite': { singleton: true },
        'react-router-dom': { singleton: true }
      }
    })
  ],
  resolve: {
    alias: {
      '@federation/shared': path.resolve(__dirname, '../shared/src'),
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
```

### Remote Vite Config

```typescript
// packages/trade-plans/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

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
        'react': { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        'mobx': { singleton: true },
        'mobx-react-lite': { singleton: true },
        'react-router-dom': { singleton: true }
      }
    })
  ],
  resolve: {
    alias: {
      '@federation/shared': path.resolve(__dirname, '../shared/src'),
    }
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5001,
    cors: true
  }
})
```

## TypeScript Configuration

### Root tsconfig.json

```json
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

## Development Workflow

### Install Dependencies

```bash
# Install all dependencies
pnpm install

# Install dependencies for specific package
pnpm --filter portal install
```

### Run Development Servers

```bash
# Run all dev servers in parallel
pnpm dev

# Run specific dev server
pnpm dev:portal
pnpm dev:trade-plans
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:portal
```

## Benefits of Monorepo

1. **Shared Code**: Easy to share types and utilities
2. **Consistent Versions**: All packages use same dependency versions
3. **Faster Development**: No need to publish packages
4. **Easier Testing**: Test integration between packages locally
5. **Simpler Setup**: One repository to clone and set up

## Migration to Multi-Repo

When ready to split into separate repositories:

1. Extract each package to its own repository
2. Publish shared package to npm or private registry
3. Update imports to use published package
4. Update CI/CD pipelines
5. Update documentation

## Next Steps

1. Set up monorepo structure
2. Create shared package
3. Set up portal package
4. Set up remote packages
5. Configure mocking (see [Mocking Guide](./mocking-guide.md))

