import { describe, it, expect, beforeEach, vi } from 'vitest'
import AuthStore from '../AuthStore'
import { mockOktaAuth } from '../../services/mockOktaAuth'

describe('AuthStore', () => {
  let store: AuthStore

  beforeEach(() => {
    store = new AuthStore(mockOktaAuth as any)
    localStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(store.isAuthenticated).toBe(false)
      expect(store.accessToken).toBe(null)
      expect(store.claims).toBe(null)
      expect(store.groups).toEqual([])
      expect(store.isLoading).toBe(true)
    })

    it('should load user data when authenticated', async () => {
      // Set up mock auth
      localStorage.setItem('mockAuth', JSON.stringify({
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          groups: ['admins'],
          roles: ['admin']
        },
        isAuthenticated: true,
        timestamp: Date.now()
      }))

      await store.initialize()

      expect(store.isAuthenticated).toBe(true)
      expect(store.accessToken).not.toBe(null)
      expect(store.claims).not.toBe(null)
      expect(store.groups).toContain('admins')
    })
  })

  describe('group checking', () => {
    beforeEach(async () => {
      // Set up authenticated user with groups
      localStorage.setItem('mockAuth', JSON.stringify({
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          groups: ['admins', 'traders'],
          roles: ['admin']
        },
        isAuthenticated: true,
        timestamp: Date.now()
      }))
      await store.initialize()
    })

    it('should check if user has a specific group', () => {
      expect(store.hasGroup('admins')).toBe(true)
      expect(store.hasGroup('traders')).toBe(true)
      expect(store.hasGroup('sales-agents')).toBe(false)
    })

    it('should check if user has any of the groups', () => {
      expect(store.hasAnyGroup(['admins', 'sales-agents'])).toBe(true)
      expect(store.hasAnyGroup(['compliance-officers', 'sales-agents'])).toBe(false)
    })

    it('should check if user has all groups', () => {
      expect(store.hasAllGroups(['admins', 'traders'])).toBe(true)
      expect(store.hasAllGroups(['admins', 'sales-agents'])).toBe(false)
    })
  })

  describe('role checking', () => {
    beforeEach(async () => {
      localStorage.setItem('mockAuth', JSON.stringify({
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          groups: ['admins'],
          roles: ['admin', 'user']
        },
        isAuthenticated: true,
        timestamp: Date.now()
      }))
      await store.initialize()
    })

    it('should check if user has a specific role', () => {
      expect(store.hasRole('admin')).toBe(true)
      expect(store.hasRole('user')).toBe(true)
      expect(store.hasRole('manager')).toBe(false)
    })
  })

  describe('login', () => {
    it('should initiate login flow', async () => {
      // Mock window.prompt to avoid jsdom error
      const originalPrompt = window.prompt
      window.prompt = vi.fn(() => 'admin@example.com')
      
      // Mock window.location.href to avoid navigation error
      const originalHref = Object.getOwnPropertyDescriptor(window, 'location')?.value?.href
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, href: 'http://localhost:5173/login/callback' }
      })

      const signInSpy = vi.spyOn(mockOktaAuth, 'signInWithRedirect')
      await store.login()
      expect(signInSpy).toHaveBeenCalled()
      
      // Restore
      window.prompt = originalPrompt
      if (originalHref) {
        Object.defineProperty(window, 'location', {
          writable: true,
          value: { ...window.location, href: originalHref }
        })
      }
    })
  })

  describe('logout', () => {
    beforeEach(async () => {
      localStorage.setItem('mockAuth', JSON.stringify({
        user: { id: '1', email: 'admin@example.com', name: 'Admin', groups: ['admins'], roles: ['admin'] },
        isAuthenticated: true,
        timestamp: Date.now()
      }))
      await store.initialize()
    })

    it('should clear authentication state on logout', async () => {
      expect(store.isAuthenticated).toBe(true)
      await store.logout()
      expect(store.isAuthenticated).toBe(false)
      expect(store.accessToken).toBe(null)
      expect(store.claims).toBe(null)
      expect(store.groups).toEqual([])
    })
  })
})

