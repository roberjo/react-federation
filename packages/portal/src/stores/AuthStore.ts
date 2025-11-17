import { makeAutoObservable } from 'mobx'
import { OktaAuth } from '@okta/okta-auth-js'
import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from '@federation/shared/types'
import { deriveRolesFromGroups } from '../config/oktaConfig'

class AuthStore {
  isAuthenticated = false
  accessToken: string | null = null
  claims: JwtClaims | null = null
  groups: string[] = []
  roles: string[] = []
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
          // Extract groups from JWT claims
          this.groups = this.claims.groups || []
          // Derive roles from groups (groups have direct relationship to roles)
          this.roles = deriveRolesFromGroups(this.groups)
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
      this.roles = []
    }
  }

  hasGroup(groupName: string): boolean {
    return this.groups.includes(groupName)
  }

  hasAnyGroup(groupNames: ReadonlyArray<string>): boolean {
    return groupNames.some(group => this.hasGroup(group))
  }

  hasAllGroups(groupNames: ReadonlyArray<string>): boolean {
    return groupNames.every(group => this.hasGroup(group))
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role)
  }

  hasAnyRole(roles: ReadonlyArray<string>): boolean {
    return roles.some(role => this.hasRole(role))
  }

  hasAllRoles(roles: ReadonlyArray<string>): boolean {
    return roles.every(role => this.hasRole(role))
  }

  get userName(): string {
    return this.claims?.name || this.claims?.preferred_username || 'User'
  }

  get userEmail(): string {
    return this.claims?.email || ''
  }

  get userInitials(): string {
    const name = this.userName
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
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
      this.roles = []
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}

export default AuthStore

