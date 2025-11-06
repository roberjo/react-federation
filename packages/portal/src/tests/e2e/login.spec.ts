import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    await expect(page.getByText('Financial Services Portal')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should login with admin account', async ({ page }) => {
    // Mock the prompt for email
    await page.addInitScript(() => {
      window.prompt = () => 'admin@example.com'
    })

    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Wait for redirect to callback
    await page.waitForURL('/login/callback', { timeout: 5000 })
    
    // Wait for redirect to dashboard
    await page.waitForURL('/', { timeout: 5000 })
    
    // Verify user is logged in
    await expect(page.getByText(/welcome/i)).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/trade-plans')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
})

