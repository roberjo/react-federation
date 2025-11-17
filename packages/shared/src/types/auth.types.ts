/**
 * Authentication-related types shared across portal and remote modules
 */

export interface JwtClaims {
  sub: string
  email: string
  name: string
  groups: string[] // Groups from JWT claims - used to derive roles
  exp?: number
  iat?: number
  [key: string]: any
}

export interface AuthState {
  user?: JwtClaims // Full JWT claims (includes groups)
  token?: string | null
  groups?: string[] // Groups from JWT claims
  roles?: string[] // Roles derived from groups (primary RBAC mechanism)
  isAuthenticated?: boolean
  // Group-based authorization helpers
  hasGroup?: (group: string) => boolean
  hasAnyGroup?: (groups: string[]) => boolean
  // Role-based authorization helpers (roles derived from groups)
  hasRole?: (role: string) => boolean
  hasAnyRole?: (roles: string[]) => boolean
  hasAllRoles?: (roles: string[]) => boolean
}

export interface AppProps {
  auth?: AuthState
  onLogout?: () => void
  [key: string]: any
}

