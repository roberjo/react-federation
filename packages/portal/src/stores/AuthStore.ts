import { makeAutoObservable } from 'mobx'
import { OktaAuth } from '@okta/okta-auth-js'
import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from '@federation/shared/types'

class AuthStore {
  isAuthenticated = false
  accessToken: string | null = null
  claims: JwtClaims | null = null
  groups: string[] = []
  isLoading = true

  constructor(private oktaAuth: OktaAuth) {
    makeAutoObservable(this)
  }

  async initialize() {
    this.isLoading = true
    try {
      const isAuthenticated = await this.oktaAuth.isAuthenticated()
      if (isAuthenticated) {
        await this.loadUserData()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      this.isLoading = false
    }
  }

  async loadUserData() {
    try {
      const accessToken = await this.oktaAuth.getAccessToken()
      if (accessToken) {
        this.accessToken = accessToken
        try {
          this.claims = jwtDecode<JwtClaims>(accessToken)
          this.groups = this.claims.groups || []
          this.isAuthenticated = true
        } catch (error) {
          console.error('Error decoding token:', error)
          this.isAuthenticated = false
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      this.isAuthenticated = false
      this.accessToken = null
      this.claims = null
      this.groups = []
    }
  }

  hasGroup(groupName: string): boolean {
    return this.groups.includes(groupName)
  }

  hasAnyGroup(groupNames: string[]): boolean {
    return groupNames.some(group => this.hasGroup(group))
  }

  hasAllGroups(groupNames: string[]): boolean {
    return groupNames.every(group => this.hasGroup(group))
  }

  hasRole(role: string): boolean {
    return this.claims?.roles?.includes(role) || false
  }

  async login() {
    try {
      await this.oktaAuth.signInWithRedirect()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  async logout() {
    try {
      await this.oktaAuth.signOut()
      this.isAuthenticated = false
      this.accessToken = null
      this.claims = null
      this.groups = []
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}

export default AuthStore

