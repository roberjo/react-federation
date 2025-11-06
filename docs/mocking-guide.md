# Mocking Guide

## Overview

This guide covers mocking Okta authentication and data services APIs for local development and proof of concept. This allows development without external dependencies.

## Mocking Strategy

### 1. Okta Authentication Mock
- Mock Okta auth service
- Simulate login/logout flows
- Generate mock JWT tokens
- Simulate user groups and roles

### 2. Data Services API Mock
- Mock API endpoints
- Use MSW (Mock Service Worker) or similar
- Return mock data
- Simulate API delays and errors

## Okta Authentication Mock

### Mock Okta Service

```typescript
// packages/portal/src/services/mockOktaService.ts
import { OktaAuth } from '@okta/okta-auth-js'

/**
 * Mock Okta service for development
 * Simulates Okta authentication without actual Okta instance
 */
export class MockOktaService {
  private mockUsers = [
    {
      id: '1',
      email: 'trader@example.com',
      name: 'John Trader',
      groups: ['trade-planners', 'traders'],
      roles: ['user']
    },
    {
      id: '2',
      email: 'compliance@example.com',
      name: 'Jane Compliance',
      groups: ['compliance-officers', 'kyc-specialists'],
      roles: ['user']
    },
    {
      id: '3',
      email: 'sales@example.com',
      name: 'Bob Sales',
      groups: ['sales-agents', 'sales-managers'],
      roles: ['user']
    },
    {
      id: '4',
      email: 'admin@example.com',
      name: 'Admin User',
      groups: ['admins'],
      roles: ['admin', 'user']
    }
  ]

  private currentUser: typeof this.mockUsers[0] | null = null
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
      const auth = JSON.parse(stored)
      // Check if auth is still valid (24 hour expiry)
      if (Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
        this.currentUser = auth.user
        this.isAuthenticated = auth.isAuthenticated
        return this.isAuthenticated
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
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      sub: this.currentUser.id,
      email: this.currentUser.email,
      name: this.currentUser.name,
      groups: this.currentUser.groups,
      roles: this.currentUser.roles,
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
  getCurrentUser() {
    return this.currentUser
  }
}

// Export singleton instance
export const mockOktaService = new MockOktaService()
```

### Mock Okta Auth Wrapper

```typescript
// packages/portal/src/services/mockOktaAuth.ts
import { OktaAuth } from '@okta/okta-auth-js'
import { mockOktaService } from './mockOktaService'

/**
 * Mock OktaAuth wrapper that mimics OktaAuth interface
 */
export class MockOktaAuth {
  tokenManager = {
    on: (event: string, callback: Function) => {
      // Mock event listeners
    },
    renew: async (key: string) => {
      return await mockOktaService.getAccessToken()
    },
    get: async (key: string) => {
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
    const email = prompt('Enter email (trader@example.com, compliance@example.com, sales@example.com, admin@example.com):')
    await mockOktaService.signInWithRedirect(email || undefined)
  }

  async signOut(): Promise<void> {
    await mockOktaService.signOut()
  }
}

// Export instance
export const mockOktaAuth = new MockOktaAuth()
```

### Use Mock in Development

```typescript
// packages/portal/src/config/oktaConfig.ts
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
```

## Data Services API Mock

### Using MSW (Mock Service Worker)

```bash
# Install MSW
pnpm add -D msw
```

### Setup MSW

```typescript
// packages/portal/src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

// Mock data
const mockTrades = [
  { id: '1', symbol: 'AAPL', quantity: 100, price: 150.0, timestamp: new Date().toISOString() },
  { id: '2', symbol: 'GOOGL', quantity: 50, price: 2500.0, timestamp: new Date().toISOString() },
  { id: '3', symbol: 'MSFT', quantity: 75, price: 350.0, timestamp: new Date().toISOString() },
]

const mockVerifications = [
  { id: '1', clientName: 'John Doe', status: 'pending', submittedAt: new Date().toISOString() },
  { id: '2', clientName: 'Jane Smith', status: 'approved', submittedAt: new Date().toISOString() },
]

const mockProducts = [
  { id: '1', name: 'Fixed Annuity', rate: 3.5, minAmount: 10000 },
  { id: '2', name: 'Variable Annuity', rate: 4.2, minAmount: 25000 },
]

export const handlers = [
  // Trade Plans API
  http.get('/api/trades', () => {
    return HttpResponse.json({
      trades: mockTrades,
      total: mockTrades.length,
      page: 1,
      pageSize: 20
    })
  }),

  http.get('/api/trades/:id', ({ params }) => {
    const trade = mockTrades.find(t => t.id === params.id)
    return trade 
      ? HttpResponse.json(trade)
      : HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
  }),

  http.post('/api/trades', async ({ request }) => {
    const body = await request.json() as any
    const newTrade = {
      id: String(mockTrades.length + 1),
      ...body,
      timestamp: new Date().toISOString()
    }
    mockTrades.push(newTrade)
    return HttpResponse.json(newTrade, { status: 201 })
  }),

  http.put('/api/trades/:id', async ({ params, request }) => {
    const body = await request.json() as any
    const index = mockTrades.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    mockTrades[index] = { ...mockTrades[index], ...body }
    return HttpResponse.json(mockTrades[index])
  }),

  http.delete('/api/trades/:id', ({ params }) => {
    const index = mockTrades.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    mockTrades.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Client Verification API
  http.get('/api/verifications', () => {
    return HttpResponse.json({
      verifications: mockVerifications,
      total: mockVerifications.length
    })
  }),

  http.get('/api/verifications/:id', ({ params }) => {
    const verification = mockVerifications.find(v => v.id === params.id)
    return verification
      ? HttpResponse.json(verification)
      : HttpResponse.json({ error: 'Verification not found' }, { status: 404 })
  }),

  http.post('/api/verifications/:id/approve', ({ params }) => {
    const verification = mockVerifications.find(v => v.id === params.id)
    if (verification) {
      verification.status = 'approved'
    }
    return HttpResponse.json(verification)
  }),

  // Annuity Sales API
  http.get('/api/products', () => {
    return HttpResponse.json({
      products: mockProducts
    })
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = mockProducts.find(p => p.id === params.id)
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json({ error: 'Product not found' }, { status: 404 })
  }),

  http.post('/api/quotes', async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: '1',
      ...body,
      quoteAmount: body.amount * 1.05,
      createdAt: new Date().toISOString()
    }, { status: 201 })
  }),

  // Simulate delay
  http.get('/api/*', async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),
]
```

### Setup MSW in Browser

```typescript
// packages/portal/src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### Initialize MSW

```typescript
// packages/portal/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize MSW in development
async function enableMocking() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false') {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
```

## Environment Variables

```env
# packages/portal/.env
# Use mock authentication in development
VITE_USE_MOCK_AUTH=true

# Use mock API in development
VITE_USE_MOCK_API=true

# API base URL (used when not mocking)
VITE_API_BASE_URL=http://localhost:3000/api

# Okta config (used when not mocking)
VITE_OKTA_CLIENT_ID=your_client_id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
```

## Mock User Accounts

For testing different user roles:

| Email | Groups | Roles | Access |
|-------|--------|-------|--------|
| trader@example.com | trade-planners, traders | user | Trade Plans |
| compliance@example.com | compliance-officers, kyc-specialists | user | Client Verification |
| sales@example.com | sales-agents, sales-managers | user | Annuity Sales |
| admin@example.com | admins | admin, user | All modules |

## Usage

### Development with Mocks

```bash
# Start development with mocks enabled
pnpm dev:portal
```

### Switch to Real Services

```env
# .env
VITE_USE_MOCK_AUTH=false
VITE_USE_MOCK_API=false
```

## Benefits

1. **No External Dependencies**: Develop without Okta or backend APIs
2. **Faster Development**: No network delays
3. **Consistent Data**: Predictable mock data
4. **Easy Testing**: Test different scenarios easily
5. **Offline Development**: Work without internet

## Next Steps

1. Set up MSW handlers
2. Create mock Okta service
3. Configure environment variables
4. Test with mock data
5. Switch to real services when ready

