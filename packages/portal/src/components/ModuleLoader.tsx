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
  // Remote modules will use this React instance instead of bundling their own
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
 * Supports both development (Vite handles module resolution) and production (manifest-based)
 */
const loadRemoteModule = (remoteName: string, module: string) => {
  return lazy(async () => {
    if (import.meta.env.DEV) {
      // Development: Load remoteEntry.js from built dist folders
      // Note: Remotes must be built first (pnpm --filter <remote> build)
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
      
      // Ensure React is available in shared scope before loading remote
      // mobx-react-lite needs React to be available immediately
      if (!sharedScope.default?.react?.['18.2.0']) {
        sharedScope.default = sharedScope.default || {}
        sharedScope.default.react = {
          '18.2.0': {
            get: () => Promise.resolve(() => Promise.resolve(React)),
            loaded: true,
            from: 'portal'
          }
        }
      }
      if (!sharedScope.default?.['react-dom']?.['18.2.0']) {
        sharedScope.default['react-dom'] = {
          '18.2.0': {
            get: () => Promise.resolve(() => Promise.resolve(ReactDOM)),
            loaded: true,
            from: 'portal'
          }
        }
      }
      
      // CRITICAL: Pre-resolve React synchronously BEFORE loading remote module
      // mobx-react-lite needs React to be available immediately when it initializes
      // The federation plugin resolves shared dependencies asynchronously, but
      // mobx-react-lite tries to access React synchronously during module initialization
      const reactVersion = sharedScope.default.react['18.2.0']
      if (reactVersion) {
        // Pre-resolve React so it's available synchronously
        // The federation runtime checks for _resolved property for synchronous access
        reactVersion._resolved = React
        // Also ensure the get() function returns the resolved React immediately
        reactVersion.get = () => Promise.resolve(() => Promise.resolve(React))
      }
      const reactDomVersion = sharedScope.default['react-dom']['18.2.0']
      if (reactDomVersion) {
        reactDomVersion._resolved = ReactDOM
        reactDomVersion.get = () => Promise.resolve(() => Promise.resolve(ReactDOM))
      }
      
      // CRITICAL: Expose React globally as a fallback for synchronous access
      // Some libraries like mobx-react-lite need React to be available synchronously
      // before the federation runtime resolves it asynchronously
      if (!(window as any).__REACT_FEDERATION__) {
        (window as any).__REACT_FEDERATION__ = React
      }
      if (!(window as any).__REACT_DOM_FEDERATION__) {
        (window as any).__REACT_DOM_FEDERATION__ = ReactDOM
      }
      
      // Load remoteEntry.js as an ES module
      // @originjs/vite-plugin-federation exports get() and init() functions directly
      const remoteModule = await import(/* @vite-ignore */ remoteUrl)
      
      if (!remoteModule || typeof remoteModule.get !== 'function') {
        throw new Error(`Remote module ${remoteName} does not export get() function. Make sure the remote is built (pnpm --filter ${remoteName} build)`)
      }

      // Initialize the remote module with the shared scope
      // This allows the remote to access shared dependencies like React
      // CRITICAL: React must be resolved BEFORE init() is called
      if (typeof remoteModule.init === 'function') {
        await remoteModule.init(sharedScope)
      }
      
      // CRITICAL: Wait a tick to ensure React is fully resolved before getting the module
      // This gives the federation runtime time to resolve React synchronously
      await new Promise(resolve => setTimeout(resolve, 0))

      // Get the module factory using the exported get() function
      const modulePath = module.startsWith('./') ? module : `./${module}`
      const factory = await remoteModule.get(modulePath)
      
      if (!factory) {
        // Try with ./ prefix if not already present
        const altPath = module.startsWith('./') ? module.slice(2) : `./${module}`
        const altFactory = await remoteModule.get(altPath)
        if (altFactory) {
          const component = altFactory()
          // lazy() expects a promise that resolves to { default: Component }
          return { default: component }
        }
        throw new Error(`Module ${modulePath} not found in remote ${remoteName}`)
      }

      // Factory is a function that returns the module
      const component = factory()
      
      // lazy() expects a promise that resolves to { default: Component }
      // Return an object with default property to match React.lazy() expectations
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
 * Helper function to dynamically load a script
 */
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
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

/**
 * Error fallback component for module loading failures
 */
function ModuleErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold text-danger-700 mb-2">
          Failed to Load Module
        </h2>
        <p className="text-danger-600 mb-4">
          {error.message || 'An error occurred while loading the module'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

interface ModuleLoaderProps {
  remoteName: string
  module: string
  requiredGroups?: ReadonlyArray<string>
  requiredRoles?: ReadonlyArray<string>
  fallback?: React.ReactNode
  props?: Record<string, any>
}

/**
 * ModuleLoader component that dynamically loads remote modules
 * Uses props injection to pass authentication state to remote modules
 */
export const ModuleLoader = observer(({ 
  remoteName, 
  module, 
  requiredGroups = [],
  requiredRoles = [],
  fallback = <div className="flex items-center justify-center min-h-[400px]">Loading module...</div>,
  props = {}
}: ModuleLoaderProps) => {
  const { authStore } = useStores()

  // Check authentication
  if (authStore.isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Initializing...</div>
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based authorization (primary RBAC mechanism)
  if (requiredRoles.length > 0 && !authStore.hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check group authorization (fallback/legacy support)
  if (requiredGroups.length > 0 && requiredRoles.length === 0 && !authStore.hasAnyGroup(requiredGroups)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Load the remote module
  const RemoteComponent = loadRemoteModule(remoteName, module)

  // Prepare props to inject into remote module
  // This includes authentication state and RBAC roles derived from groups
  const injectedProps = {
    ...props,
    // Inject authentication state with JWT claims (groups) and derived roles
    auth: {
      user: authStore.claims, // Full JWT claims (includes groups)
      token: authStore.accessToken,
      groups: authStore.groups, // Groups from JWT claims
      roles: authStore.roles, // Roles derived from groups (primary RBAC)
      isAuthenticated: authStore.isAuthenticated,
      // Group-based authorization helpers
      hasGroup: (group: string) => authStore.hasGroup(group),
      hasAnyGroup: (groups: ReadonlyArray<string>) => authStore.hasAnyGroup(groups),
      // Role-based authorization helpers (roles derived from groups)
      hasRole: (role: string) => authStore.hasRole(role),
      hasAnyRole: (roles: ReadonlyArray<string>) => authStore.hasAnyRole(roles),
      hasAllRoles: (roles: ReadonlyArray<string>) => authStore.hasAllRoles(roles),
    },
    // Inject logout callback
    onLogout: () => authStore.logout(),
  }

  return (
    <ErrorBoundary FallbackComponent={ModuleErrorFallback}>
      <Suspense fallback={fallback}>
        <RemoteComponent {...injectedProps} />
      </Suspense>
    </ErrorBoundary>
  )
})

