/**
 * Mock OktaAuth wrapper that mimics OktaAuth interface
 */
import { mockOktaService } from './mockOktaService'

export class MockOktaAuth {
  tokenManager = {
    on: (event: string, callback: Function) => {
      // Mock event listeners
      if (event === 'expired') {
        // Check token expiry periodically
        setInterval(async () => {
          const token = await mockOktaService.getAccessToken()
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                callback('accessToken', null)
              }
            } catch (e) {
              // Invalid token
            }
          }
        }, 60000) // Check every minute
      }
    },
    renew: async (_key: string) => {
      return await mockOktaService.getAccessToken()
    },
    get: async (_key: string) => {
      return await mockOktaService.getAccessToken()
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return await mockOktaService.isAuthenticatedCheck()
  }

  async getAccessToken(): Promise<string | null> {
    return await mockOktaService.getAccessToken()
  }

  async getIdToken(): Promise<string | null> {
    return await mockOktaService.getIdToken()
  }

  async signInWithRedirect(): Promise<void> {
    // Show mock login dialog
    const email = prompt(
      'Enter email:\n' +
      '- trader@example.com (Trade Plans - trader role)\n' +
      '- compliance@example.com (Client Verification - compliance-officer role)\n' +
      '- sales@example.com (Annuity Sales - sales-agent role)\n' +
      '- admin@example.com (All modules - admin role)\n' +
      '- multi-role@example.com (Trade Plans + Client Verification)'
    )
    await mockOktaService.signInWithRedirect(email || undefined)
  }

  async signOut(): Promise<void> {
    await mockOktaService.signOut()
  }
}

// Export instance
export const mockOktaAuth = new MockOktaAuth()

