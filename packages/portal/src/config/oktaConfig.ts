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

/**
 * Group-to-Role Mapping
 * Maps Okta groups from JWT claims to roles for RBAC authorization
 * Groups have a direct relationship to roles in the portal and remote packages
 */
export const GROUP_TO_ROLE_MAP: Record<string, string[]> = {
  // Trade Plans roles
  'trade-planners': ['trader'],
  'traders': ['trader'],
  'trade-managers': ['trade-manager'],
  
  // Client Verification roles
  'compliance-officers': ['compliance-officer'],
  'kyc-specialists': ['kyc-specialist'],
  
  // Annuity Sales roles
  'sales-agents': ['sales-agent'],
  'sales-managers': ['sales-manager'],
  
  // Admin role (maps to all module access)
  'admins': ['admin'],
} as const

/**
 * Module access control based on roles derived from groups
 * Each module requires specific roles, which are derived from JWT group claims
 */
export const MODULE_ACCESS = {
  tradePlans: ['trader', 'trade-manager', 'admin'],
  clientVerification: ['compliance-officer', 'kyc-specialist', 'admin'],
  annuitySales: ['sales-agent', 'sales-manager', 'admin'],
} as const

/**
 * Module access control using groups directly (alternative approach)
 * Groups from JWT claims map directly to module access
 */
export const MODULE_ACCESS_GROUPS = {
  tradePlans: ['trade-planners', 'traders', 'trade-managers', 'admins'],
  clientVerification: ['compliance-officers', 'kyc-specialists', 'admins'],
  annuitySales: ['sales-agents', 'sales-managers', 'admins'],
} as const

/**
 * Derives roles from groups based on GROUP_TO_ROLE_MAP
 * @param groups Array of group names from JWT claims
 * @returns Array of roles derived from groups
 */
export function deriveRolesFromGroups(groups: string[]): string[] {
  const roles = new Set<string>()
  
  groups.forEach(group => {
    const mappedRoles = GROUP_TO_ROLE_MAP[group]
    if (mappedRoles) {
      mappedRoles.forEach(role => roles.add(role))
    }
  })
  
  return Array.from(roles)
}

