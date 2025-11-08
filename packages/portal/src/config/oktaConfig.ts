import { OktaAuth } from '@okta/okta-auth-js'
import { mockOktaAuth } from '../services/mockOktaAuth'

const isDev = import.meta.env.DEV
const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || isDev

// Use mock in development, real Okta in production
export const oktaAuth = useMock 
  ? (mockOktaAuth as any as OktaAuth)
  : new OktaAuth({
      clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
      issuer: import.meta.env.VITE_OKTA_ISSUER,
      redirectUri: `${window.location.origin}/login/callback`,
      scopes: ['openid', 'profile', 'email', 'groups'],
      pkce: true,
      tokenManager: {
        storage: 'localStorage'
      }
    })

export const oktaConfig = {
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  issuer: import.meta.env.VITE_OKTA_ISSUER,
  redirectUri: `${window.location.origin}/login/callback`,
  scopes: ['openid', 'profile', 'email', 'groups'],
  pkce: true,
  tokenManager: {
    storage: 'localStorage'
  }
}

export const MODULE_ACCESS = {
  tradePlans: ['trade-planners', 'traders', 'admins'],
  clientVerification: ['compliance-officers', 'kyc-specialists', 'admins'],
  annuitySales: ['sales-agents', 'sales-managers', 'admins'],
} as const

