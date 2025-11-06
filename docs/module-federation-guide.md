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

### Dynamic Remote Loading (Production)

**⚠️ IMPORTANT**: The current implementation in `cursor_prompt.md` shows webpack-specific code (`window[scope]`, `__webpack_share_scopes__`). For Vite with `@originjs/vite-plugin-federation`, the implementation differs.

#### Correct Implementation for Vite

```typescript
// portal-repo/src/services/moduleLoader.ts
import { loadRemote } from '@originjs/vite-plugin-federation/runtime'

export async function loadRemoteModule(scope: string, module: string) {
  try {
    // Load the remote module
    const component = await loadRemote(`${scope}/${module}`)
    return component
  } catch (error) {
    console.error(`Failed to load remote module ${scope}/${module}:`, error)
    throw error
  }
}
```

#### Alternative: Using Dynamic Import

```typescript
// portal-repo/src/components/ModuleLoader.tsx
import { lazy, Suspense } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'
import { loadRemoteConfig } from '../services/manifestService'

interface ModuleLoaderProps {
  remoteName: string
  module: string
  requiredGroups?: string[]
  fallback?: React.ReactNode
}

export const ModuleLoader = observer(({ 
  remoteName, 
  module, 
  requiredGroups = [],
  fallback = <div>Loading...</div>
}: ModuleLoaderProps) => {
  const { authStore } = useStores()

  // Check authorization
  if (requiredGroups.length > 0 && !authStore.hasAnyGroup(requiredGroups)) {
    return <Navigate to="/unauthorized" />
  }

  // Dynamically load the remote module
  const RemoteComponent = lazy(async () => {
    // In production, fetch remote URL from manifest
    let remoteUrl: string
    
    if (import.meta.env.DEV) {
      // Development: use hardcoded localhost URLs
      const devUrls: Record<string, string> = {
        tradePlans: 'http://localhost:5001/assets/remoteEntry.js',
        clientVerification: 'http://localhost:5002/assets/remoteEntry.js',
        annuitySales: 'http://localhost:5003/assets/remoteEntry.js',
      }
      remoteUrl = devUrls[remoteName]
    } else {
      // Production: fetch from manifest
      const config = await loadRemoteConfig(remoteName)
      if (!config) {
        throw new Error(`Remote module ${remoteName} not found in manifest`)
      }
      remoteUrl = config.url
    }

    // Load the remote entry
    await loadScript(remoteUrl)
    
    // Get the module from the remote
    const container = (window as any)[remoteName]
    if (!container) {
      throw new Error(`Remote container ${remoteName} not found`)
    }

    // Initialize the container
    await container.init(__webpack_share_scopes__.default)
    
    // Get the factory
    const factory = await container.get(module)
    return factory()
  })

  return (
    <Suspense fallback={fallback}>
      <RemoteComponent />
    </Suspense>
  )
})

// Helper to load script dynamically
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
    document.head.appendChild(script)
  })
}
```

**⚠️ NOTE**: The above code still uses webpack-specific APIs. For Vite, you may need to use the plugin's runtime utilities differently. Check `@originjs/vite-plugin-federation` documentation for the correct approach.

## Remote Module Configuration

### Vite Config for Remote

```typescript
// trade-plans-repo/vite.config.ts
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
        './TradeList': './src/components/TradeList.tsx', // Optional: expose multiple components
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
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
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

### Remote Build

```
trade-plans-repo/dist/
├── assets/
│   ├── remoteEntry.js  ← This is what portal loads
│   ├── App-[hash].js
│   └── App-[hash].css
```

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

1. **CORS Errors**: Configure CORS headers
2. **Version Mismatch**: Ensure shared dependencies match
3. **Module Not Found**: Check remote name and module path
4. **Initialization Error**: Check container initialization

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

