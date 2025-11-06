/**
 * Manifest service for fetching remote module configurations
 */

interface RemoteConfig {
  url: string
  version: string
  requiredGroups: string[]
  displayName: string
  icon: string
  description: string
}

interface Manifest {
  version: string
  remotes: {
    [key: string]: RemoteConfig
  }
}

let cachedManifest: Manifest | null = null
let manifestFetchPromise: Promise<Manifest> | null = null

/**
 * Fetches manifest.json from S3/CDN
 * Uses caching and request deduplication to prevent multiple simultaneous requests
 */
export async function fetchManifest(): Promise<Manifest> {
  // Return cached manifest if available
  if (cachedManifest) return cachedManifest
  
  // Return existing fetch promise if already in progress
  if (manifestFetchPromise) return manifestFetchPromise
  
  // Create new fetch promise
  manifestFetchPromise = (async () => {
    try {
      const manifestUrl = import.meta.env.VITE_MANIFEST_URL || '/manifest.json'
      const response = await fetch(manifestUrl, {
        cache: 'no-store', // Always fetch fresh manifest
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.statusText}`)
      }
      
      const manifest: Manifest = await response.json()
      
      // Validate manifest structure
      if (!manifest.remotes || typeof manifest.remotes !== 'object') {
        throw new Error('Invalid manifest structure')
      }
      
      cachedManifest = manifest
      return manifest
    } catch (error) {
      manifestFetchPromise = null // Reset on error to allow retry
      throw error
    } finally {
      manifestFetchPromise = null
    }
  })()
  
  return manifestFetchPromise
}

/**
 * Gets remote configuration for a specific remote module
 */
export async function loadRemoteConfig(remoteName: string): Promise<RemoteConfig | null> {
  const manifest = await fetchManifest()
  return manifest.remotes[remoteName] || null
}

/**
 * Gets all available remote configurations
 */
export async function getAllRemoteConfigs(): Promise<Record<string, RemoteConfig>> {
  const manifest = await fetchManifest()
  return manifest.remotes
}

/**
 * Clears cached manifest (useful for testing or forced refresh)
 */
export function clearManifestCache(): void {
  cachedManifest = null
  manifestFetchPromise = null
}

