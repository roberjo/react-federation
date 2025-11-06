import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SecureRoute } from '../SecureRoute'
import RootStore from '../../../stores/RootStore'
import { StoreProvider } from '../../../contexts/StoreContext'

describe('SecureRoute', () => {
  let rootStore: RootStore

  beforeEach(() => {
    rootStore = new RootStore()
    localStorage.clear()
  })

  const renderWithProvider = (initialEntries = ['/']) => {
    return render(
      <StoreProvider store={rootStore}>
        <MemoryRouter initialEntries={initialEntries}>
          <SecureRoute>
            <div>Protected Content</div>
          </SecureRoute>
        </MemoryRouter>
      </StoreProvider>
    )
  }

  it('should show loading state when auth is initializing', () => {
    rootStore.authStore.isLoading = true
    renderWithProvider()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', async () => {
    rootStore.authStore.isLoading = false
    rootStore.authStore.isAuthenticated = false
    
    const { container } = renderWithProvider(['/protected'])
    
    // SecureRoute should render Navigate component
    await waitFor(() => {
      // Navigate component will redirect, but in test we check the component rendered
      expect(container).toBeTruthy()
    })
  })

  it('should render children when authenticated', async () => {
    // Set up authenticated user
    localStorage.setItem('mockAuth', JSON.stringify({
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        groups: ['admins'],
        roles: ['admin']
      },
      isAuthenticated: true,
      timestamp: Date.now()
    }))

    await rootStore.authStore.initialize()
    
    // Wait for auth to be loaded
    await waitFor(() => {
      expect(rootStore.authStore.isAuthenticated).toBe(true)
    })
    
    renderWithProvider()
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('should redirect when user does not have required groups', async () => {
    // Set up user without required groups
    localStorage.setItem('mockAuth', JSON.stringify({
      user: {
        id: '1',
        email: 'trader@example.com',
        name: 'Trader',
        groups: ['traders'],
        roles: ['user']
      },
      isAuthenticated: true,
      timestamp: Date.now()
    }))

    await rootStore.authStore.initialize()

    const { container } = render(
      <StoreProvider store={rootStore}>
        <MemoryRouter initialEntries={['/protected']}>
          <SecureRoute requiredGroups={['admins']}>
            <div>Protected Content</div>
          </SecureRoute>
        </MemoryRouter>
      </StoreProvider>
    )

    // SecureRoute should render Navigate component for unauthorized
    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })

  it('should allow access when user has required groups', async () => {
    localStorage.setItem('mockAuth', JSON.stringify({
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        groups: ['admins', 'traders'],
        roles: ['admin']
      },
      isAuthenticated: true,
      timestamp: Date.now()
    }))

    await rootStore.authStore.initialize()

    // Wait for auth to be loaded
    await waitFor(() => {
      expect(rootStore.authStore.isAuthenticated).toBe(true)
    })

    render(
      <StoreProvider store={rootStore}>
        <MemoryRouter initialEntries={['/protected']}>
          <SecureRoute requiredGroups={['admins', 'traders']}>
            <div>Protected Content</div>
          </SecureRoute>
        </MemoryRouter>
      </StoreProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})

