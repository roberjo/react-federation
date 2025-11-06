/**
 * Authentication-related types shared across portal and remote modules
 */

export interface JwtClaims {
  sub: string
  email: string
  name: string
  groups: string[]
  roles?: string[]
  exp?: number
  iat?: number
  [key: string]: any
}

export interface AuthState {
  user?: JwtClaims
  token?: string | null
  groups?: string[]
  isAuthenticated?: boolean
  hasGroup?: (group: string) => boolean
  hasAnyGroup?: (groups: string[]) => boolean
  hasRole?: (role: string) => boolean
}

export interface AppProps {
  auth?: AuthState
  onLogout?: () => void
  [key: string]: any
}

