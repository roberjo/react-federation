import { lazy, Suspense } from 'react'
import { observer } from 'mobx-react-lite'
import { Navigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { useStores } from '../contexts/StoreContext'
import { loadRemoteConfig } from '../services/manifestService'

/**
 * Loads a remote module dynamically using Vite Module Federation
 * Supports both development (hardcoded URLs) and production (manifest-based)
 */
const loadRemoteModule = (remoteName: string, module: string) => {
  return lazy(async () => {
    let remoteUrl: string

    if (import.meta.env.DEV) {
      // Development: Use hardcoded localhost URLs from vite.config.ts
      const devUrls: Record<string, string> = {
        tradePlans: 'http://localhost:5001/assets/remoteEntry.js',
        clientVerification: 'http://localhost:5002/assets/remoteEntry.js',
        annuitySales: 'http://localhost:5003/assets/remoteEntry.js',
      }
      remoteUrl = devUrls[remoteName]
      
      if (!remoteUrl) {
        throw new Error(`Remote module ${remoteName} not configured for development`)
      }
    } else {
      // Production: Fetch remote URL from manifest
      const config = await loadRemoteConfig(remoteName)
      if (!config) {
        throw new Error(`Remote module ${remoteName} not found in manifest`)
      }
      remoteUrl = config.url
    }

    // Load the remote entry script
    await loadScript(remoteUrl)

    // Get the remote container from window
    const container = (window as any)[remoteName]
    if (!container) {
      throw new Error(`Remote container ${remoteName} not found after loading script`)
    }

    // Initialize the container with shared scope
    // Note: @originjs/vite-plugin-federation exposes __federation_shared__
    const sharedScope = (window as any).__federation_shared__ || {}
    await container.init(sharedScope)

    // Get the module factory
    const factory = await container.get(module)
    if (!factory) {
      throw new Error(`Module ${module} not found in remote ${remoteName}`)
    }

    // Return the module
    return factory()
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
    script.type = 'text/javascript'
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
  requiredGroups?: string[]
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

  // Check group authorization
  if (requiredGroups.length > 0 && !authStore.hasAnyGroup(requiredGroups)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Load the remote module
  const RemoteComponent = loadRemoteModule(remoteName, module)

  // Prepare props to inject into remote module
  // This includes authentication state for the remote to use
  const injectedProps = {
    ...props,
    // Inject authentication state
    auth: {
      user: authStore.claims,
      token: authStore.accessToken,
      groups: authStore.groups,
      isAuthenticated: authStore.isAuthenticated,
      hasGroup: (group: string) => authStore.hasGroup(group),
      hasAnyGroup: (groups: string[]) => authStore.hasAnyGroup(groups),
      hasRole: (role: string) => authStore.hasRole(role),
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

