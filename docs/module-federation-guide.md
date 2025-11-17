# Module Federation Technical Guide

## Overview

This project uses **Module Federation** via `@originjs/vite-plugin-federation` to enable micro-frontend architecture. This guide covers the technical implementation details.

## How Module Federation Works

### Core Concepts

1. **Host (Portal)**: The main application that loads remote modules
2. **Remotes**: Independent applications that expose components
3. **Shared Dependencies**: Libraries loaded once and shared across modules
4. **Remote Entry**: The entry point file (`remoteEntry.js`) that exposes modules

### Architecture Flow

```
┌─────────────┐
│   Portal    │ (Host)
│  (React)    │
└──────┬──────┘
       │
       ├─── Loads ───► tradePlans/remoteEntry.js
       │
       ├─── Loads ───► clientVerification/remoteEntry.js
       │
       └─── Loads ───► annuitySales/remoteEntry.js
```

## Portal Configuration

### Vite Config (Development)

```typescript
// portal-repo/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

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
        : {}, // Production remotes loaded dynamically
      shared: {
        'react': { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        'mobx': { singleton: true },
        'mobx-react-lite': { singleton: true },
        'react-router-dom': { singleton: true }
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
```

### Dynamic Remote Loading Implementation

**✅ WORKING IMPLEMENTATION**: This is the correct implementation that works with `@originjs/vite-plugin-federation`.

#### Key Requirements

1. **Shared Scope Initialization**: React and ReactDOM must be initialized in `__federation_shared__` before loading remotes
2. **ES Module Loading**: Use `import()` to load `remoteEntry.js` as an ES module
3. **Component Wrapping**: Wrap components in `{ default: component }` for React.lazy() compatibility

#### Portal Main Entry (main.tsx)

```typescript
// packages/portal/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'

/**
 * Initialize federation shared scope with React/ReactDOM
 * This must be done before any remote modules are loaded
 */
function initializeFederationSharedScope() {
  if (!(window as any).__federation_shared__) {
    (window as any).__federation_shared__ = {}
  }
  
  const sharedScope = (window as any).__federation_shared__
  
  // Initialize default scope
  if (!sharedScope.default) {
    sharedScope.default = {}
  }
  
  // Expose React in shared scope for remote modules
  // The federation plugin calls: await (await versionValue.get())()
  // So get() must return a promise that resolves to a function that returns the module
  if (!sharedScope.default.react) {
    sharedScope.default.react = {
      '18.2.0': {
        get: () => Promise.resolve(() => Promise.resolve(React)),
        loaded: true,
        from: 'portal'
      }
    }
  }
  
  // Expose ReactDOM in shared scope for remote modules
  if (!sharedScope.default['react-dom']) {
    sharedScope.default['react-dom'] = {
      '18.2.0': {
        get: () => Promise.resolve(() => Promise.resolve(ReactDOM)),
        loaded: true,
        from: 'portal'
      }
    }
  }
}

// Initialize federation shared scope immediately
initializeFederationSharedScope()
```

#### ModuleLoader Component

```typescript
// packages/portal/src/components/ModuleLoader.tsx
import { lazy, Suspense } from 'react'
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react-lite'
import { Navigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { useStores } from '../contexts/StoreContext'
import { loadRemoteConfig } from '../services/manifestService'

/**
 * Initialize the federation shared scope with React and ReactDOM
 * This ensures remote modules can access the host's React instance
 */
function initializeSharedScope() {
  if (!(window as any).__federation_shared__) {
    (window as any).__federation_shared__ = {}
  }
  
  const sharedScope = (window as any).__federation_shared__
  
  // Initialize default scope
  if (!sharedScope.default) {
    sharedScope.default = {}
  }
  
  // Expose React in shared scope
  // The federation plugin calls: await (await versionValue.get())()
  // So get() must return a promise that resolves to a function that returns the module
  if (!sharedScope.default.react) {
    sharedScope.default.react = {
      '18.2.0': {
        get: () => Promise.resolve(() => Promise.resolve(React)),
        loaded: true,
        from: 'portal'
      }
    }
  }
  
  // Expose ReactDOM in shared scope
  if (!sharedScope.default['react-dom']) {
    sharedScope.default['react-dom'] = {
      '18.2.0': {
        get: () => Promise.resolve(() => Promise.resolve(ReactDOM)),
        loaded: true,
        from: 'portal'
      }
    }
  }
  
  return sharedScope
}

/**
 * Loads a remote module dynamically using Vite Module Federation
 * Supports both development (built remotes via vite preview) and production (manifest-based)
 */
const loadRemoteModule = (remoteName: string, module: string) => {
  return lazy(async () => {
    if (import.meta.env.DEV) {
      // Development: Load remoteEntry.js from built dist folders
      // Note: Remotes must be built first (pnpm --filter <remote> build)
      // Remotes are served via vite preview (pnpm --filter <remote> dev)
      // The remoteEntry.js files are in dist/assets/remoteEntry.js
      const devUrls: Record<string, string> = {
        tradePlans: 'http://localhost:5001/assets/remoteEntry.js',
        clientVerification: 'http://localhost:5002/assets/remoteEntry.js',
        annuitySales: 'http://localhost:5003/assets/remoteEntry.js',
      }
      
      const remoteUrl = devUrls[remoteName]
      if (!remoteUrl) {
        throw new Error(`Remote module ${remoteName} not configured for development`)
      }

      // Initialize shared scope with React/ReactDOM BEFORE loading remote
      // This ensures remote modules can access the host's React instance
      const sharedScope = initializeSharedScope()
      
      // Load remoteEntry.js as an ES module
      // @originjs/vite-plugin-federation exports get() and init() functions directly
      const remoteModule = await import(/* @vite-ignore */ remoteUrl)
      
      if (!remoteModule || typeof remoteModule.get !== 'function') {
        throw new Error(`Remote module ${remoteName} does not export get() function. Make sure the remote is built (pnpm --filter ${remoteName} build)`)
      }

      // Initialize the remote module with the shared scope
      // This allows the remote to access shared dependencies like React
      if (typeof remoteModule.init === 'function') {
        await remoteModule.init(sharedScope)
      }

      // Get the module factory using the exported get() function
      const modulePath = module.startsWith('./') ? module : `./${module}`
      const factory = await remoteModule.get(modulePath)
      
      if (!factory) {
        throw new Error(`Module ${modulePath} not found in remote ${remoteName}`)
      }

      // Factory is a function that returns the module
      const component = factory()
      
      // lazy() expects a promise that resolves to { default: Component }
      return { default: component }
    } else {
      // Production: Load remoteEntry.js from manifest
      const config = await loadRemoteConfig(remoteName)
      if (!config) {
        throw new Error(`Remote module ${remoteName} not found in manifest`)
      }

      const remoteUrl = config.url

      // Load the remote entry script
      await loadScript(remoteUrl)

      // Wait for the container to be exposed on window
      let container = (window as any)[remoteName]
      let retries = 10
      while (!container && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
        container = (window as any)[remoteName]
        retries--
      }

      if (!container) {
        throw new Error(`Remote container ${remoteName} not found after loading script`)
      }

      // Initialize the container with shared scope
      const sharedScope = (window as any).__federation_shared__ || {}
      await container.init(sharedScope)

      // Get the module factory
      const factory = await container.get(module)
      if (!factory) {
        throw new Error(`Module ${module} not found in remote ${remoteName}`)
      }

      // Factory is a function that returns the module
      const component = factory()
      
      // lazy() expects a promise that resolves to { default: Component }
      return { default: component }
    }
  })
}

/**
 * Helper function to dynamically load a script (production only)
 */
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${url}"]`)
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = url
    script.type = 'module' // remoteEntry.js contains ES modules with import.meta
    script.async = true
    script.crossOrigin = 'anonymous'

    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))

    document.head.appendChild(script)
  })
}

// ModuleLoader component implementation...
export const ModuleLoader = observer(({ remoteName, module, ...props }) => {
  const RemoteComponent = loadRemoteModule(remoteName, module)
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  )
})
```

**✅ KEY POINTS**:
- Shared scope must be initialized **before** loading remotes
- Use `import()` for ES module loading in dev mode
- `get()` function structure: `() => Promise.resolve(() => Promise.resolve(React))`
- Components must be wrapped in `{ default: component }` for React.lazy()

## Remote Module Configuration

### Vite Config for Remote

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
        'react': { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
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
    cors: true,
    strictPort: true
  },
  preview: {
    port: 5001,
    cors: true,
    strictPort: true
  }
})
```

### Development Setup for Remotes

**Important**: In development mode, remotes must be **built** and served via `vite preview`:

```json
// packages/trade-plans/package.json
{
  "scripts": {
    "dev": "vite preview --port 5001",
    "build": "tsc --build && vite build",
    "preview": "vite preview"
  }
}
```

**Why?** `vite dev` doesn't serve the `dist` folder where `remoteEntry.js` is generated. `vite preview` serves the built `dist` folder, making `remoteEntry.js` available at `/assets/remoteEntry.js`.

**Workflow**:
1. Build the remote: `pnpm --filter trade-plans build`
2. Start preview server: `pnpm --filter trade-plans dev` (runs `vite preview`)
3. Portal can now load the remote from `http://localhost:5001/assets/remoteEntry.js`

### Remote Bootstrap Pattern

```typescript
// trade-plans-repo/src/bootstrap.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Export for module federation
export default App

// Standalone mode for development
if (import.meta.env.DEV) {
  const rootElement = document.getElementById('root')
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
}
```

```typescript
// trade-plans-repo/src/main.tsx
import('./bootstrap')
```

## Shared Dependencies

### Why Share Dependencies?

- **Single Instance**: React, MobX, etc. are loaded once
- **Consistent State**: Shared state management works across modules
- **Smaller Bundles**: Avoid duplicate dependencies
- **Version Consistency**: All modules use same library versions

### Shared Dependency Configuration

```typescript
shared: {
  'react': { 
    singleton: true,           // Only one instance
    requiredVersion: '^18.3.0', // Version requirement
    eager: false                // Load on demand
  },
  'react-dom': { 
    singleton: true, 
    requiredVersion: '^18.3.0' 
  },
  'mobx': { 
    singleton: true 
  },
  'mobx-react-lite': { 
    singleton: true 
  },
  'react-router-dom': { 
    singleton: true 
  }
}
```

### Version Mismatch Handling

If versions don't match:
- Module Federation will warn in console
- May cause runtime errors
- **Solution**: Keep versions in sync across all repositories

## State Sharing Between Portal and Remotes

### Option 1: Props Injection (Recommended)

```typescript
// Portal passes auth state to remote
<ModuleLoader 
  remoteName="tradePlans"
  module="./App"
  props={{
    user: authStore.claims,
    token: authStore.accessToken,
    groups: authStore.groups,
    onLogout: () => authStore.logout()
  }}
/>
```

```typescript
// Remote receives props
// trade-plans-repo/src/App.tsx
interface AppProps {
  user?: any
  token?: string
  groups?: string[]
  onLogout?: () => void
}

export default function App(props: AppProps) {
  // Use props
  return <div>Trade Plans for {props.user?.name}</div>
}
```

### Option 2: Global Window Object

```typescript
// Portal exposes auth on window
// portal-repo/src/main.tsx
window.portalAuth = {
  user: authStore.claims,
  token: authStore.accessToken,
  groups: authStore.groups,
  hasGroup: (group: string) => authStore.hasGroup(group)
}
```

```typescript
// Remote accesses from window
// trade-plans-repo/src/App.tsx
const auth = (window as any).portalAuth
if (auth?.hasGroup('traders')) {
  // Show trader features
}
```

### Option 3: Shared Store Package

Create a shared MobX store package:

```typescript
// shared-stores-repo/src/AuthStore.ts
export class AuthStore {
  // ... store implementation
}

// Both portal and remotes import
import { AuthStore } from '@your-org/shared-stores'
```

## Error Handling

### Module Load Errors

```typescript
// portal-repo/src/components/ModuleLoader.tsx
import { ErrorBoundary } from 'react-error-boundary'

function ModuleErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="error-container">
      <h2>Failed to load module</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  )
}

export const ModuleLoader = ({ ... }) => {
  return (
    <ErrorBoundary FallbackComponent={ModuleErrorFallback}>
      <Suspense fallback={fallback}>
        <RemoteComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

### Network Errors

```typescript
async function loadRemoteModule(scope: string, module: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await loadRemote(`${scope}/${module}`)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

## CORS Configuration

### Development

```typescript
// Remote vite.config.ts
server: {
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}
```

### Production

Configure CORS on CDN/server:
- Allow origin: Portal domain
- Allow methods: GET, OPTIONS
- Allow headers: Content-Type

## Build Output

### Portal Build

```
portal-repo/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── remoteEntry.js (if portal also exposes modules)
```

**Note**: Portal runs via `vite dev` in development (doesn't need to be built for dev mode).

### Remote Build

```
trade-plans-repo/dist/
├── assets/
│   ├── remoteEntry.js  ← This is what portal loads (at /assets/remoteEntry.js)
│   ├── App-[hash].js
│   └── App-[hash].css
└── index.html
```

**Important**: Remotes must be **built** before they can be loaded. In development:
1. Build: `pnpm --filter trade-plans build`
2. Serve: `pnpm --filter trade-plans dev` (runs `vite preview`)
3. Portal loads from: `http://localhost:5001/assets/remoteEntry.js`

**Why `vite preview`?** `vite dev` doesn't serve the `dist` folder where `remoteEntry.js` is generated. `vite preview` serves the built `dist` folder.

## Debugging Module Federation

### Check Remote Entry

```bash
# Check if remote entry is accessible
curl http://localhost:5001/assets/remoteEntry.js

# Should return JavaScript code
```

### Browser DevTools

1. **Network Tab**: Check if `remoteEntry.js` loads
2. **Console**: Check for module federation errors
3. **Application Tab**: Check for loaded modules

### Common Issues

1. **CORS Errors**: Configure CORS headers in `preview` config
2. **Version Mismatch**: Ensure shared dependencies match versions
3. **Module Not Found**: Check remote name and module path match expose config
4. **Initialization Error**: Check container initialization and shared scope
5. **React is Null**: Shared scope not initialized before remote loads
   - **Solution**: Ensure `initializeFederationSharedScope()` is called in `main.tsx` before `ReactDOM.render()`
   - **Check**: `console.log(window.__federation_shared__)` should show React structure
6. **Remote Container Not Found**: Remote not built or preview server not running
   - **Solution**: Build remote (`pnpm --filter <remote> build`) and start preview server (`pnpm --filter <remote> dev`)
7. **Component Not Rendering**: Component not wrapped in `{ default: component }`
   - **Solution**: Ensure `loadRemoteModule` returns `{ default: factory() }` for React.lazy() compatibility
8. **"(intermediate value) is not a function"**: Incorrect `get()` function structure
   - **Solution**: Use `get: () => Promise.resolve(() => Promise.resolve(React))` pattern

## Best Practices

1. **Version Alignment**: Keep shared dependencies in sync
2. **Error Handling**: Always wrap remote loading in error boundaries
3. **Loading States**: Show loading indicators while modules load
4. **Retry Logic**: Implement retry for transient failures
5. **Type Safety**: Use TypeScript for type safety across modules
6. **Testing**: Test module loading in both dev and prod environments

## Resources

- [@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Documentation](https://module-federation.github.io/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)

