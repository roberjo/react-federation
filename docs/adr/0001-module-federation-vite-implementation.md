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

### Dynamic Script Loading
- Load `remoteEntry.js` scripts dynamically using `document.createElement('script')`
- Check for existing scripts to prevent duplicate loads
- Handle script load errors gracefully

### Container Initialization
- Access remote container from `window[remoteName]` after script loads
- Initialize container with shared scope from `window.__federation_shared__`
- Get module factory using `container.get(module)`
- Return factory result as React component

### Error Handling
- Wrap module loading in React Error Boundary
- Provide user-friendly error messages
- Implement retry functionality
- Handle network failures and missing modules

## Code Example

```typescript
const loadRemoteModule = (remoteName: string, module: string) => {
  return lazy(async () => {
    // Get remote URL (dev or production)
    const remoteUrl = getRemoteUrl(remoteName)
    
    // Load script dynamically
    await loadScript(remoteUrl)
    
    // Get container and initialize
    const container = (window as any)[remoteName]
    const sharedScope = (window as any).__federation_shared__ || {}
    await container.init(sharedScope)
    
    // Get and return module
    const factory = await container.get(module)
    return factory()
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

