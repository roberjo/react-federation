# API Integration Guide

## Overview

This guide covers API integration patterns for the portal and remote modules, including authentication, error handling, and best practices.

## API Client Setup

### Portal API Client

```typescript
// portal-repo/src/services/apiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios'
import { oktaAuth } from '../config/oktaConfig'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add authentication token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await oktaAuth.getAccessToken()
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    } catch (error) {
      console.error('Failed to get access token:', error)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh token
        await oktaAuth.tokenManager.renew('accessToken')
        const accessToken = await oktaAuth.getAccessToken()
        
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        await oktaAuth.signOut()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default apiClient
```

### Remote Module API Client

```typescript
// remote-repo/src/services/apiClient.ts
import axios, { AxiosInstance } from 'axios'

// Get token from portal (via props or window)
function getToken(): string | null {
  // Option 1: From props (if passed)
  // Option 2: From window object
  const portalAuth = (window as any).portalAuth
  return portalAuth?.getToken() || null
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, notify portal
      const portalAuth = (window as any).portalAuth
      if (portalAuth?.onTokenExpired) {
        portalAuth.onTokenExpired()
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

## API Service Patterns

### Type-Safe API Services

```typescript
// portal-repo/src/services/tradeService.ts
import apiClient from './apiClient'

export interface Trade {
  id: string
  symbol: string
  quantity: number
  price: number
  timestamp: string
}

export interface TradeListResponse {
  trades: Trade[]
  total: number
  page: number
  pageSize: number
}

export interface CreateTradeRequest {
  symbol: string
  quantity: number
  price: number
}

class TradeService {
  async getTrades(page = 1, pageSize = 20): Promise<TradeListResponse> {
    const response = await apiClient.get<TradeListResponse>('/trades', {
      params: { page, pageSize },
    })
    return response.data
  }

  async getTrade(id: string): Promise<Trade> {
    const response = await apiClient.get<Trade>(`/trades/${id}`)
    return response.data
  }

  async createTrade(data: CreateTradeRequest): Promise<Trade> {
    const response = await apiClient.post<Trade>('/trades', data)
    return response.data
  }

  async updateTrade(id: string, data: Partial<Trade>): Promise<Trade> {
    const response = await apiClient.put<Trade>(`/trades/${id}`, data)
    return response.data
  }

  async deleteTrade(id: string): Promise<void> {
    await apiClient.delete(`/trades/${id}`)
  }
}

export const tradeService = new TradeService()
```

### Using API Services in Components

```typescript
// portal-repo/src/components/TradeList.tsx
import { useEffect, useState } from 'react'
import { tradeService, Trade } from '../services/tradeService'

export function TradeList() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrades() {
      try {
        setLoading(true)
        const response = await tradeService.getTrades()
        setTrades(response.trades)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trades')
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {trades.map((trade) => (
        <div key={trade.id}>{trade.symbol}</div>
      ))}
    </div>
  )
}
```

### Using API Services with MobX

```typescript
// portal-repo/src/stores/TradeStore.ts
import { makeAutoObservable, runInAction } from 'mobx'
import { tradeService, Trade } from '../services/tradeService'

class TradeStore {
  trades: Trade[] = []
  loading = false
  error: string | null = null
  currentTrade: Trade | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async fetchTrades() {
    this.loading = true
    this.error = null

    try {
      const response = await tradeService.getTrades()
      runInAction(() => {
        this.trades = response.trades
        this.loading = false
      })
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || 'Failed to fetch trades'
        this.loading = false
      })
    }
  }

  async fetchTrade(id: string) {
    this.loading = true
    this.error = null

    try {
      const trade = await tradeService.getTrade(id)
      runInAction(() => {
        this.currentTrade = trade
        this.loading = false
      })
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || 'Failed to fetch trade'
        this.loading = false
      })
    }
  }

  async createTrade(data: CreateTradeRequest) {
    this.loading = true
    this.error = null

    try {
      const trade = await tradeService.createTrade(data)
      runInAction(() => {
        this.trades.push(trade)
        this.loading = false
      })
      return trade
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || 'Failed to create trade'
        this.loading = false
      })
      throw err
    }
  }
}

export default TradeStore
```

## Error Handling

### Error Types

```typescript
// portal-repo/src/types/api.ts
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export class ApiException extends Error {
  constructor(
    public message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiException'
  }
}
```

### Error Handler Utility

```typescript
// portal-repo/src/utils/errorHandler.ts
import { AxiosError } from 'axios'
import { ApiException } from '../types/api'

export function handleApiError(error: unknown): ApiException {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data

    // Handle different error statuses
    switch (status) {
      case 400:
        return new ApiException(
          data?.message || 'Bad Request',
          'BAD_REQUEST',
          400,
          data
        )
      case 401:
        return new ApiException(
          'Unauthorized. Please login again.',
          'UNAUTHORIZED',
          401
        )
      case 403:
        return new ApiException(
          'You do not have permission to perform this action.',
          'FORBIDDEN',
          403
        )
      case 404:
        return new ApiException(
          'Resource not found.',
          'NOT_FOUND',
          404
        )
      case 500:
        return new ApiException(
          'Server error. Please try again later.',
          'SERVER_ERROR',
          500
        )
      default:
        return new ApiException(
          error.message || 'An unexpected error occurred',
          'UNKNOWN_ERROR',
          status
        )
    }
  }

  if (error instanceof Error) {
    return new ApiException(error.message, 'UNKNOWN_ERROR')
  }

  return new ApiException('An unexpected error occurred', 'UNKNOWN_ERROR')
}
```

### Using Error Handler

```typescript
// portal-repo/src/services/tradeService.ts
import { handleApiError } from '../utils/errorHandler'

class TradeService {
  async getTrades(): Promise<TradeListResponse> {
    try {
      const response = await apiClient.get<TradeListResponse>('/trades')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}
```

## Request/Response Logging

### Logging Interceptor

```typescript
// portal-repo/src/services/apiClient.ts
import axios from 'axios'

// Request logging
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      })
    }
    return config
  }
)

// Response logging
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
      })
    }
    return Promise.reject(error)
  }
)
```

## Request Cancellation

### Canceling Requests

```typescript
// portal-repo/src/services/tradeService.ts
import axios, { CancelTokenSource } from 'axios'

class TradeService {
  private cancelTokenSource: CancelTokenSource | null = null

  async getTrades(): Promise<TradeListResponse> {
    // Cancel previous request if exists
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('New request initiated')
    }

    // Create new cancel token
    this.cancelTokenSource = axios.CancelToken.source()

    try {
      const response = await apiClient.get<TradeListResponse>('/trades', {
        cancelToken: this.cancelTokenSource.token,
      })
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message)
        throw new Error('Request was canceled')
      }
      throw handleApiError(error)
    }
  }

  cancelRequests() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel('Requests canceled')
    }
  }
}
```

## Retry Logic

### Retry Interceptor

```typescript
// portal-repo/src/utils/retryHandler.ts
import axios, { AxiosError } from 'axios'

export async function retryRequest(
  requestFn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      // Don't retry on 4xx errors (except 401)
      if (error instanceof AxiosError) {
        const status = error.response?.status
        if (status && status >= 400 && status < 500 && status !== 401) {
          throw error
        }
      }

      // Wait before retry
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}
```

### Using Retry

```typescript
// portal-repo/src/services/tradeService.ts
import { retryRequest } from '../utils/retryHandler'

class TradeService {
  async getTrades(): Promise<TradeListResponse> {
    return retryRequest(async () => {
      const response = await apiClient.get<TradeListResponse>('/trades')
      return response.data
    })
  }
}
```

## Best Practices

### 1. Type Safety

- Always define TypeScript interfaces for API requests/responses
- Use generic types with axios
- Validate responses at runtime if needed

### 2. Error Handling

- Always handle errors in try-catch blocks
- Provide user-friendly error messages
- Log errors for debugging

### 3. Loading States

- Show loading indicators during API calls
- Use MobX observables for loading state
- Handle race conditions

### 4. Caching

- Consider caching frequently accessed data
- Use React Query or SWR for caching
- Implement cache invalidation

### 5. Request Optimization

- Cancel unnecessary requests
- Debounce search requests
- Batch multiple requests when possible

### 6. Security

- Never expose API keys in client code
- Use environment variables for API URLs
- Validate and sanitize user input
- Use HTTPS for all API calls

## Testing API Integration

### Mock API Client

```typescript
// portal-repo/src/__tests__/mocks/apiClient.ts
import axios from 'axios'

export const mockApiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// Mock responses
export const mockTrades = [
  { id: '1', symbol: 'AAPL', quantity: 100, price: 150.0 },
  { id: '2', symbol: 'GOOGL', quantity: 50, price: 2500.0 },
]
```

### Testing API Services

```typescript
// portal-repo/src/services/__tests__/tradeService.test.ts
import { tradeService } from '../tradeService'
import { mockApiClient } from '../../__tests__/mocks/apiClient'

jest.mock('../apiClient', () => ({
  default: mockApiClient,
}))

describe('TradeService', () => {
  it('should fetch trades', async () => {
    const trades = await tradeService.getTrades()
    expect(trades).toBeDefined()
    expect(Array.isArray(trades.trades)).toBe(true)
  })
})
```

## Environment Configuration

### Development

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Production

```env
VITE_API_BASE_URL=https://api.example.com
```

## Resources

- [Axios Documentation](https://axios-http.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MobX Documentation](https://mobx.js.org/)

