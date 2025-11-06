import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchManifest, loadRemoteConfig, clearManifestCache } from '../manifestService'

describe('manifestService', () => {
  beforeEach(() => {
    clearManifestCache()
    vi.clearAllMocks()
  })

  describe('fetchManifest', () => {
    it('should fetch manifest from URL', async () => {
      const mockManifest = {
        version: '1.0.0',
        remotes: {
          tradePlans: {
            url: 'https://cdn.example.com/trade-plans/remoteEntry.js',
            version: '1.0.0',
            requiredGroups: ['traders'],
            displayName: 'Trade Plans',
            icon: 'trendingUp',
            description: 'Trade management'
          }
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response)

      const manifest = await fetchManifest()

      expect(manifest).toEqual(mockManifest)
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should cache manifest after first fetch', async () => {
      const mockManifest = {
        version: '1.0.0',
        remotes: {}
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response)

      await fetchManifest()
      const fetchCount1 = (global.fetch as any).mock.calls.length

      await fetchManifest()
      const fetchCount2 = (global.fetch as any).mock.calls.length

      // Should only fetch once due to caching
      expect(fetchCount2).toBe(fetchCount1)
    })

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      } as Response)

      await expect(fetchManifest()).rejects.toThrow('Failed to fetch manifest')
    })

    it('should throw error for invalid manifest structure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'structure' }),
      } as Response)

      await expect(fetchManifest()).rejects.toThrow('Invalid manifest structure')
    })
  })

  describe('loadRemoteConfig', () => {
    it('should return remote config for existing remote', async () => {
      const mockManifest = {
        version: '1.0.0',
        remotes: {
          tradePlans: {
            url: 'https://cdn.example.com/trade-plans/remoteEntry.js',
            version: '1.0.0',
            requiredGroups: ['traders'],
            displayName: 'Trade Plans',
            icon: 'trendingUp',
            description: 'Trade management'
          }
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response)

      const config = await loadRemoteConfig('tradePlans')

      expect(config).toEqual(mockManifest.remotes.tradePlans)
    })

    it('should return null for non-existent remote', async () => {
      const mockManifest = {
        version: '1.0.0',
        remotes: {}
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response)

      const config = await loadRemoteConfig('nonExistent')

      expect(config).toBeNull()
    })
  })

  describe('clearManifestCache', () => {
    it('should clear cached manifest', async () => {
      const mockManifest = {
        version: '1.0.0',
        remotes: {}
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      } as Response)

      await fetchManifest()
      clearManifestCache()
      
      const fetchCount1 = (global.fetch as any).mock.calls.length
      await fetchManifest()
      const fetchCount2 = (global.fetch as any).mock.calls.length

      // Should fetch again after clearing cache
      expect(fetchCount2).toBeGreaterThan(fetchCount1)
    })
  })
})

