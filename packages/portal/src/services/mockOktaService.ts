/**
 * Mock Okta service for development
 * Simulates Okta authentication without actual Okta instance
 */

export interface MockUser {
  id: string
  email: string
  name: string
  groups: string[] // Groups from JWT claims - roles will be derived from these
}

export class MockOktaService {
  private mockUsers: MockUser[] = [
    {
      id: '1',
      email: 'trader@example.com',
      name: 'John Trader',
      groups: ['trade-planners'], // Maps to ['trader'] role
    },
    {
      id: '2',
      email: 'compliance@example.com',
      name: 'Jane Compliance',
      groups: ['compliance-officers'], // Maps to ['compliance-officer'] role
    },
    {
      id: '3',
      email: 'sales@example.com',
      name: 'Bob Sales',
      groups: ['sales-agents'], // Maps to ['sales-agent'] role
    },
    {
      id: '4',
      email: 'admin@example.com',
      name: 'Admin User',
      groups: ['admins'], // Maps to ['admin'] role - grants access to all modules
    },
    {
      id: '5',
      email: 'multi-role@example.com',
      name: 'Multi Role User',
      groups: ['trade-planners', 'compliance-officers'], // Maps to ['trader', 'compliance-officer'] roles
    }
  ]

  private currentUser: MockUser | null = null
  private isAuthenticated = false

  /**
   * Simulate login - returns mock user based on email
   */
  async signInWithRedirect(email?: string): Promise<void> {
    // Simulate redirect delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Use provided email or default to admin
    const userEmail = email || 'admin@example.com'
    const user = this.mockUsers.find(u => u.email === userEmail) || this.mockUsers[3]

    this.currentUser = user
    this.isAuthenticated = true

    // Store in localStorage for persistence
    localStorage.setItem('mockAuth', JSON.stringify({
      user,
      isAuthenticated: true,
      timestamp: Date.now()
    }))

    // Simulate redirect callback
    window.location.href = '/login/callback'
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticatedCheck(): Promise<boolean> {
    // Check localStorage for persistence
    const stored = localStorage.getItem('mockAuth')
    if (stored) {
      try {
        const auth = JSON.parse(stored)
        // Check if auth is still valid (24 hour expiry)
        if (Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
          this.currentUser = auth.user
          this.isAuthenticated = auth.isAuthenticated
          return this.isAuthenticated
        }
      } catch (e) {
        // Invalid stored auth
        localStorage.removeItem('mockAuth')
      }
    }
    return this.isAuthenticated
  }

  /**
   * Get access token (mock JWT)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.isAuthenticated || !this.currentUser) {
      return null
    }

    // Generate mock JWT token
    // Note: JWT only contains groups, not roles. Roles are derived from groups.
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      sub: this.currentUser.id,
      email: this.currentUser.email,
      name: this.currentUser.name,
      groups: this.currentUser.groups, // Groups only - roles will be derived from these
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      iat: Math.floor(Date.now() / 1000)
    }))
    const signature = btoa('mock-signature')

    return `${header}.${payload}.${signature}`
  }

  /**
   * Get ID token (same as access token for mock)
   */
  async getIdToken(): Promise<string | null> {
    return this.getAccessToken()
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    this.currentUser = null
    this.isAuthenticated = false
    localStorage.removeItem('mockAuth')
  }

  /**
   * Get current user
   */
  getCurrentUser(): MockUser | null {
    return this.currentUser
  }
}

// Export singleton instance
export const mockOktaService = new MockOktaService()

