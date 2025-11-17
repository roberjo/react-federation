# ADR-0001: Module Federation Implementation for Vite

## Status
Accepted

## Context
The enterprise portal uses a micro-frontend architecture with Module Federation to enable independently deployable sub-applications. The project uses Vite as the build tool with `@originjs/vite-plugin-federation` for Module Federation support.

The initial implementation in the design document showed webpack-specific code (`window[scope]`, `__webpack_share_scopes__`) which is incompatible with Vite's Module Federation plugin. This needed to be corrected to use the proper Vite Module Federation APIs.

## Decision
We will implement dynamic remote module loading using Vite Module Federation with the following approach:

1. **Development Mode**: Use hardcoded localhost URLs configured in `vite.config.ts`
2. **Production Mode**: Dynamically load remote URLs from `manifest.json` fetched from S3/CDN
3. **Module Loading**: Use dynamic script loading and Vite's federation container APIs
4. **Error Handling**: Implement error boundaries and retry logic for failed module loads

## Implementation Details

### Shared Scope Initialization (Critical)
- **Must initialize before loading remotes**: React and ReactDOM must be exposed in `__federation_shared__` before any remote modules load
- Initialize in `main.tsx` immediately when the app starts
- Structure: `get()` returns a promise that resolves to a function that returns the module
- Pattern: `get: () => Promise.resolve(() => Promise.resolve(React))`

### Development Mode Loading
- Use `import()` to load `remoteEntry.js` as an ES module (not script tag)
- Remotes must be **built** and served via `vite preview` (not `vite dev`)
- `remoteEntry.js` is located at `/assets/remoteEntry.js` in the built dist folder
- Remote module exports `get()` and `init()` functions directly

### Production Mode Loading
- Load `remoteEntry.js` via script tag with `type="module"`
- Fetch remote URLs from manifest.json (S3/CDN)
- Wait for container to be exposed on `window[remoteName]`
- Initialize container with shared scope

### Component Wrapping
- Wrap components in `{ default: component }` for React.lazy() compatibility
- Factory function returns the component directly

### Error Handling
- Wrap module loading in React Error Boundary
- Provide user-friendly error messages
- Implement retry functionality for container initialization
- Handle network failures and missing modules

## Code Example

```typescript
// main.tsx - Initialize shared scope FIRST
function initializeFederationSharedScope() {
  if (!(window as any).__federation_shared__) {
    (window as any).__federation_shared__ = {}
  }
  const sharedScope = (window as any).__federation_shared__
  if (!sharedScope.default) {
    sharedScope.default = {}
  }
  // Expose React
  sharedScope.default.react = {
    '18.2.0': {
      get: () => Promise.resolve(() => Promise.resolve(React)),
      loaded: true,
      from: 'portal'
    }
  }
}
initializeFederationSharedScope() // Call immediately

// ModuleLoader.tsx - Load remote module
const loadRemoteModule = (remoteName: string, module: string) => {
  return lazy(async () => {
    if (import.meta.env.DEV) {
      // Dev: Use import() for ES module
      const remoteModule = await import(/* @vite-ignore */ remoteUrl)
      const sharedScope = initializeSharedScope()
      await remoteModule.init(sharedScope)
      const factory = await remoteModule.get(`./${module}`)
      const component = factory()
      return { default: component } // Wrap for React.lazy()
    } else {
      // Prod: Load script, wait for container
      await loadScript(remoteUrl)
      const container = (window as any)[remoteName]
      await container.init(sharedScope)
      const factory = await container.get(module)
      return { default: factory() }
    }
  })
}
```

## Consequences

### Positive
- ✅ Works correctly with Vite Module Federation
- ✅ Supports both development and production modes
- ✅ Enables dynamic remote discovery via manifest
- ✅ Proper error handling and user feedback
- ✅ Type-safe implementation

### Negative
- ⚠️ Requires understanding of Vite Module Federation internals
- ⚠️ Slightly more complex than webpack implementation
- ⚠️ Need to handle script loading manually

### Risks
- **Script Loading Failures**: Network issues could prevent module loading
  - *Mitigation*: Error boundaries and retry logic
- **Version Mismatches**: Shared dependencies must match versions
  - *Mitigation*: Strict version requirements in shared config
- **CORS Issues**: Remote modules must have proper CORS headers
  - *Mitigation*: Configure CORS in remote module servers/CDN

## Alternatives Considered

### Alternative 1: Use Webpack Module Federation
- **Pros**: More mature, better documentation
- **Cons**: Would require switching from Vite to Webpack, losing Vite's fast dev experience
- **Decision**: Rejected - Vite provides better developer experience

### Alternative 2: Use Static Remote Configuration
- **Pros**: Simpler implementation, no dynamic loading
- **Cons**: Requires portal rebuild for every remote update
- **Decision**: Rejected - Defeats purpose of independent deployment

### Alternative 3: Use Module Federation Runtime Utilities
- **Pros**: Could use plugin's built-in utilities if available
- **Cons**: Plugin may not provide runtime utilities for dynamic loading
- **Decision**: Rejected - Manual implementation provides more control

## References
- [@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Documentation](https://module-federation.github.io/)
- [Vite Documentation](https://vitejs.dev/)

## Date
2024

## Authors
Architecture Team

