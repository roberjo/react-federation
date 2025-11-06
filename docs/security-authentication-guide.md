# Security & Authentication Guide

## Overview

This guide covers security best practices and Okta OAuth 2.0 authentication implementation for the enterprise portal.

## Authentication Architecture

### Okta OAuth 2.0 Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Browser │         │ Portal  │         │  Okta   │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │ 1. Access Portal  │                   │
     ├──────────────────►│                   │
     │                   │                   │
     │ 2. Not Auth'd     │                   │
     │◄──────────────────┤                   │
     │                   │                   │
     │ 3. Redirect Login │                   │
     ├──────────────────►│                   │
     │                   │ 4. Redirect       │
     │                   ├──────────────────►│
     │                   │                   │
     │                   │ 5. User Login     │
     │                   │◄──────────────────┤
     │                   │                   │
     │ 6. Callback       │                   │
     │◄──────────────────┤                   │
     │                   │ 7. Exchange Code │
     │                   ├──────────────────►│
     │                   │                   │
     │                   │ 8. Tokens         │
     │                   │◄──────────────────┤
     │                   │                   │
     │ 9. Store Tokens   │                   │
     │◄──────────────────┤                   │
     │                   │                   │
```

## Okta Configuration

### Okta Application Setup

1. **Create Application**
   - Application type: Single-Page App (SPA)
   - Grant types: Authorization Code, Refresh Token
   - Sign-in redirect URIs: `https://your-domain.com/login/callback`
   - Sign-out redirect URIs: `https://your-domain.com`
   - Initiate login URI: `https://your-domain.com`

2. **Configure Groups**
   Create these groups in Okta:
   - `trade-planners`
   - `traders`
   - `compliance-officers`
   - `kyc-specialists`
   - `sales-agents`
   - `sales-managers`
   - `admins`

3. **Assign Users to Groups**
   - Assign users to appropriate groups
   - Groups are included in JWT token claims

4. **Configure Token Claims**
   - Add `groups` claim to access token
   - Add `roles` claim (if using roles)
   - Configure token lifetime (default: 1 hour)

### Portal Configuration

```typescript
// portal-repo/src/config/oktaConfig.ts
export const oktaConfig = {
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  issuer: import.meta.env.VITE_OKTA_ISSUER,
  redirectUri: `${window.location.origin}/login/callback`,
  scopes: ['openid', 'profile', 'email', 'groups'],
  pkce: true, // Recommended for security
  tokenManager: {
    storage: 'localStorage', // or 'sessionStorage'
    autoRenew: true,
    autoRemove: true,
    secure: true // HTTPS only
  },
  responseType: ['token', 'id_token']
}
```

## Token Management

### Access Token

- **Purpose**: Authenticate API requests
- **Lifetime**: 1 hour (configurable)
- **Storage**: localStorage or sessionStorage
- **Refresh**: Automatically refreshed before expiration

### ID Token

- **Purpose**: User identity information
- **Lifetime**: 1 hour
- **Storage**: localStorage or sessionStorage
- **Contains**: User claims (email, name, groups)

### Token Storage

```typescript
// portal-repo/src/stores/AuthStore.ts
class AuthStore {
  accessToken: string | null = null
  idToken: string | null = null

  async loadUserData() {
    const accessToken = await this.oktaAuth.getAccessToken()
    const idToken = await this.oktaAuth.getIdToken()
    
    if (accessToken) {
      this.accessToken = accessToken
      this.claims = jwtDecode<JwtClaims>(accessToken)
      this.groups = this.claims.groups || []
    }
  }
}
```

### Token Refresh

```typescript
// portal-repo/src/stores/AuthStore.ts
class AuthStore {
  constructor(private oktaAuth: OktaAuth) {
    makeAutoObservable(this)
    
    // Listen for token expiration
    this.oktaAuth.tokenManager.on('expired', () => {
      this.handleTokenExpiration()
    })
    
    // Listen for token renewal
    this.oktaAuth.tokenManager.on('renewed', (key, token) => {
      this.loadUserData()
    })
  }

  private async handleTokenExpiration() {
    try {
      // Attempt to refresh token
      await this.oktaAuth.tokenManager.renew('accessToken')
      await this.loadUserData()
    } catch (error) {
      // Refresh failed, logout user
      await this.logout()
    }
  }
}
```

## JWT Claims Parsing

### Claims Structure

```typescript
interface JwtClaims {
  sub: string              // User ID
  email: string            // User email
  name: string            // User full name
  groups: string[]        // Okta groups
  roles?: string[]        // Custom roles (if configured)
  exp: number             // Expiration timestamp
  iat: number             // Issued at timestamp
  [key: string]: any      // Additional claims
}
```

### Parsing Claims

```typescript
// portal-repo/src/utils/claimsParser.ts
import jwtDecode from 'jwt-decode'

export function parseClaims(token: string): JwtClaims {
  try {
    return jwtDecode<JwtClaims>(token)
  } catch (error) {
    throw new Error('Invalid token format')
  }
}

export function getGroups(token: string): string[] {
  const claims = parseClaims(token)
  return claims.groups || []
}

export function hasGroup(token: string, groupName: string): boolean {
  const groups = getGroups(token)
  return groups.includes(groupName)
}
```

## Authorization

### Group-Based Access Control

```typescript
// portal-repo/src/utils/roleChecker.ts
export function hasGroup(groups: string[], groupName: string): boolean {
  return groups.includes(groupName)
}

export function hasAnyGroup(groups: string[], groupNames: string[]): boolean {
  return groupNames.some(group => groups.includes(group))
}

export function hasAllGroups(groups: string[], groupNames: string[]): boolean {
  return groupNames.every(group => groups.includes(group))
}
```

### Secure Route Component

```typescript
// portal-repo/src/components/Auth/SecureRoute.tsx
export const SecureRoute = observer(({ 
  children, 
  requiredGroups = [], 
  requiredRoles = [],
  requireAll = false 
}: SecureRouteProps) => {
  const { authStore } = useStores()

  if (authStore.isLoading) {
    return <LoadingSpinner />
  }

  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check group access
  const hasGroupAccess = requiredGroups.length === 0 || 
    (requireAll 
      ? requiredGroups.every(g => authStore.hasGroup(g))
      : authStore.hasAnyGroup(requiredGroups)
    )

  // Check role access
  const hasRoleAccess = requiredRoles.length === 0 ||
    (requireAll
      ? requiredRoles.every(r => authStore.hasRole(r))
      : requiredRoles.some(r => authStore.hasRole(r))
    )

  if (!hasGroupAccess || !hasRoleAccess) {
    return <Navigate to="/unauthorized" />
  }

  return <>{children}</>
})
```

### Usage in Routes

```typescript
// portal-repo/src/App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/login/callback" element={<LoginCallback />} />
  
  <Route element={<Layout />}>
    <Route path="/" element={<Dashboard />} />
    
    <Route path="/trade-plans/*" element={
      <SecureRoute requiredGroups={['trade-planners', 'traders', 'admins']}>
        <ModuleLoader remoteName="tradePlans" module="./App" />
      </SecureRoute>
    } />
    
    <Route path="/client-verification/*" element={
      <SecureRoute requiredGroups={['compliance-officers', 'kyc-specialists', 'admins']}>
        <ModuleLoader remoteName="clientVerification" module="./App" />
      </SecureRoute>
    } />
  </Route>
</Routes>
```

## Token Sharing with Remotes

### Option 1: Props Injection (Recommended)

```typescript
// Portal passes token to remote
<ModuleLoader 
  remoteName="tradePlans"
  module="./App"
  props={{
    token: authStore.accessToken,
    user: authStore.claims,
    groups: authStore.groups
  }}
/>
```

### Option 2: Global Window Object

```typescript
// Portal exposes auth on window
window.portalAuth = {
  getToken: () => authStore.accessToken,
  getUser: () => authStore.claims,
  hasGroup: (group: string) => authStore.hasGroup(group)
}
```

### Option 3: Shared Store Package

```typescript
// Both portal and remotes import shared store
import { useAuthStore } from '@your-org/shared-stores'

// Remote uses shared store
const authStore = useAuthStore()
const token = authStore.accessToken
```

## API Authentication

### Axios Interceptor

```typescript
// portal-repo/src/services/apiClient.ts
import axios from 'axios'
import { oktaAuth } from '../config/oktaConfig'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add token
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = await oktaAuth.getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        await oktaAuth.tokenManager.renew('accessToken')
        const accessToken = await oktaAuth.getAccessToken()
        error.config.headers.Authorization = `Bearer ${accessToken}`
        return apiClient.request(error.config)
      } catch (refreshError) {
        // Refresh failed, logout
        await oktaAuth.signOut()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

## Security Best Practices

### 1. Token Storage

- **Use HTTPS**: Always use HTTPS in production
- **Secure Flag**: Set secure flag for cookies (if using)
- **HttpOnly**: Use HttpOnly for cookies (if using)
- **SameSite**: Set SameSite attribute

### 2. Token Exposure

- **Don't Log Tokens**: Never log tokens in console
- **Don't Store in URL**: Never put tokens in URL parameters
- **Minimize Exposure**: Only expose tokens to remotes that need them

### 3. CORS Configuration

```typescript
// Remote vite.config.ts (development)
server: {
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true'
  }
}
```

### 4. Content Security Policy

```html
<!-- portal-repo/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://*.okta.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.okta.com https://api.example.com;">
```

### 5. XSS Protection

- **Sanitize Input**: Sanitize all user input
- **Use React**: React automatically escapes content
- **Avoid innerHTML**: Don't use `dangerouslySetInnerHTML` unless necessary

### 6. CSRF Protection

- **SameSite Cookies**: Use SameSite attribute
- **State Parameter**: Use state parameter in OAuth flow
- **PKCE**: Use PKCE for OAuth (already configured)

## Session Management

### Session Timeout

```typescript
// portal-repo/src/stores/AuthStore.ts
class AuthStore {
  private sessionTimeout: number = 30 * 60 * 1000 // 30 minutes
  private sessionTimer: NodeJS.Timeout | null = null

  startSessionTimer() {
    this.clearSessionTimer()
    this.sessionTimer = setTimeout(() => {
      this.warnSessionExpiration()
    }, this.sessionTimeout - 5 * 60 * 1000) // Warn 5 minutes before
  }

  private warnSessionExpiration() {
    // Show warning modal
    // User can extend session or logout
  }

  clearSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }
  }
}
```

### Logout

```typescript
// portal-repo/src/stores/AuthStore.ts
async logout() {
  this.clearSessionTimer()
  await this.oktaAuth.signOut()
  this.isAuthenticated = false
  this.accessToken = null
  this.claims = null
  this.groups = []
  // Clear any local state
  localStorage.clear()
  sessionStorage.clear()
}
```

## Audit Logging

### Log Authentication Events

```typescript
// portal-repo/src/services/auditService.ts
export function logAuthEvent(event: string, details?: any) {
  // Send to audit service
  fetch('/api/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      userId: getUserId(),
      details
    })
  })
}

// Usage
logAuthEvent('LOGIN_SUCCESS')
logAuthEvent('MODULE_ACCESS', { module: 'tradePlans' })
logAuthEvent('UNAUTHORIZED_ACCESS', { path: '/trade-plans' })
```

## Compliance

### GDPR Considerations

- **Data Minimization**: Only request necessary scopes
- **User Consent**: Get consent for data processing
- **Right to Access**: Provide user data export
- **Right to Deletion**: Support account deletion

### HIPAA Considerations (if applicable)

- **Encryption**: Encrypt data in transit and at rest
- **Access Controls**: Strict access controls
- **Audit Trails**: Comprehensive audit logging
- **Business Associate Agreement**: With Okta if handling PHI

## Troubleshooting

### Common Issues

1. **Token Expired**: Implement automatic refresh
2. **CORS Errors**: Check CORS configuration
3. **Invalid Token**: Verify token format and claims
4. **Group Not Found**: Check Okta group configuration

See [Troubleshooting Guide](./troubleshooting-guide.md) for more details.

