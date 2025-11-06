import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../LoginPage'
import RootStore from '../../../stores/RootStore'
import { StoreProvider } from '../../../contexts/StoreContext'

describe('LoginPage', () => {
  let rootStore: RootStore

  beforeEach(() => {
    rootStore = new RootStore()
    localStorage.clear()
  })

  const renderWithProvider = () => {
    return render(
      <StoreProvider store={rootStore}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </StoreProvider>
    )
  }

  it('should render login page', () => {
    renderWithProvider()
    expect(screen.getByText('Financial Services Portal')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('should display sign in button', () => {
    renderWithProvider()
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    expect(signInButton).toBeInTheDocument()
  })

  it('should call login when sign in button is clicked', async () => {
    // Mock window.prompt to avoid jsdom error
    const originalPrompt = window.prompt
    window.prompt = vi.fn(() => 'admin@example.com')
    
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: 'http://localhost:5173/login/callback' }
    })

    const user = userEvent.setup()
    renderWithProvider()
    
    const loginSpy = vi.spyOn(rootStore.authStore, 'login')
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.click(signInButton)
    
    expect(loginSpy).toHaveBeenCalled()
    
    // Restore
    window.prompt = originalPrompt
  })

  it('should display test email instructions', () => {
    renderWithProvider()
    expect(screen.getByText(/trader@example.com/i)).toBeInTheDocument()
  })
})

