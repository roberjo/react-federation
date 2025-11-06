import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TradeList from '../TradeList'
import type { AuthState } from '@federation/shared/types'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('TradeList', () => {
  const mockAuth: AuthState = {
    user: {
      sub: '1',
      email: 'trader@example.com',
      name: 'Trader',
      groups: ['traders']
    },
    token: 'mock-token',
    groups: ['traders'],
    isAuthenticated: true,
    hasGroup: (group: string) => group === 'traders',
    hasAnyGroup: (groups: string[]) => groups.includes('traders'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    mockedAxios.create.mockReturnValue({
      get: vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
    })

    render(<TradeList auth={mockAuth} />)
    expect(screen.getByText('Loading trades...')).toBeInTheDocument()
  })

  it('should render trades after loading', async () => {
    const mockTrades = {
      trades: [
        { id: '1', symbol: 'AAPL', quantity: 100, price: 150.0, timestamp: new Date().toISOString(), status: 'executed' },
        { id: '2', symbol: 'GOOGL', quantity: 50, price: 2500.0, timestamp: new Date().toISOString(), status: 'pending' },
      ]
    }

    const mockApiClient = {
      get: vi.fn().mockResolvedValue({ data: mockTrades })
    }

    mockedAxios.create.mockReturnValue(mockApiClient)

    render(<TradeList auth={mockAuth} />)

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('GOOGL')).toBeInTheDocument()
    })
  })

  it('should display error message on API failure', async () => {
    const mockApiClient = {
      get: vi.fn().mockRejectedValue(new Error('API Error'))
    }

    mockedAxios.create.mockReturnValue(mockApiClient)

    render(<TradeList auth={mockAuth} />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should show create button for traders', async () => {
    const mockTrades = { trades: [] }
    const mockApiClient = {
      get: vi.fn().mockResolvedValue({ data: mockTrades })
    }

    mockedAxios.create.mockReturnValue(mockApiClient)

    render(<TradeList auth={mockAuth} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading trades...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Create Trade')).toBeInTheDocument()
  })

  it('should not show create button for non-traders', async () => {
    const nonTraderAuth: AuthState = {
      ...mockAuth,
      groups: ['compliance-officers'],
      hasGroup: () => false,
      hasAnyGroup: () => false,
    }

    const mockTrades = { trades: [] }
    const mockApiClient = {
      get: vi.fn().mockResolvedValue({ data: mockTrades })
    }

    mockedAxios.create.mockReturnValue(mockApiClient)

    render(<TradeList auth={nonTraderAuth} />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading trades...')).not.toBeInTheDocument()
    })

    expect(screen.queryByText('Create Trade')).not.toBeInTheDocument()
  })
})

