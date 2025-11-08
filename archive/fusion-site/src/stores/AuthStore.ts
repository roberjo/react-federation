import { makeAutoObservable } from 'mobx';
import { OktaAuth } from '@okta/okta-auth-js';
import { jwtDecode } from 'jwt-decode';

interface JwtClaims {
  sub: string;
  email?: string;
  name?: string;
  groups?: string[];
  roles?: string[];
  [key: string]: any;
}

class AuthStore {
  isAuthenticated = false;
  accessToken: string | null = null;
  claims: JwtClaims | null = null;
  groups: string[] = [];
  isLoading = true;
  user: any = null;

  // Mock mode for demo without actual Okta setup
  isMockMode = !import.meta.env.VITE_OKTA_CLIENT_ID || import.meta.env.VITE_OKTA_CLIENT_ID === 'demo-client-id';

  constructor(private oktaAuth: OktaAuth) {
    makeAutoObservable(this);
  }

  async initialize() {
    this.isLoading = true;
    try {
      if (this.isMockMode) {
        // Mock authentication for demo
        await this.loadMockUserData();
      } else {
        const isAuthenticated = await this.oktaAuth.isAuthenticated();
        if (isAuthenticated) {
          await this.loadUserData();
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  async loadMockUserData() {
    // Simulate loading user data
    this.isAuthenticated = true;
    this.claims = {
      sub: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      groups: ['traders', 'compliance-officers', 'admins'],
    };
    this.groups = this.claims.groups || [];
    this.user = {
      email: this.claims.email,
      name: this.claims.name,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${this.claims.name}`,
    };
  }

  async loadUserData() {
    try {
      const accessToken = await this.oktaAuth.getAccessToken();
      const user = await this.oktaAuth.getUser();
      
      if (accessToken && user) {
        this.accessToken = accessToken;
        this.claims = jwtDecode<JwtClaims>(accessToken);
        this.groups = this.claims.groups || [];
        this.user = user;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.isAuthenticated = false;
    }
  }

  hasGroup(groupName: string): boolean {
    return this.groups.includes(groupName);
  }

  hasAnyGroup(groupNames: string[]): boolean {
    return groupNames.some(group => this.hasGroup(group));
  }

  hasRole(role: string): boolean {
    return this.claims?.roles?.includes(role) || false;
  }

  async login() {
    if (this.isMockMode) {
      await this.loadMockUserData();
    } else {
      await this.oktaAuth.signInWithRedirect();
    }
  }

  async logout() {
    if (this.isMockMode) {
      this.isAuthenticated = false;
      this.accessToken = null;
      this.claims = null;
      this.groups = [];
      this.user = null;
    } else {
      await this.oktaAuth.signOut();
      this.isAuthenticated = false;
      this.accessToken = null;
      this.claims = null;
      this.groups = [];
      this.user = null;
    }
  }

  get userName(): string {
    return this.user?.name || this.claims?.name || 'User';
  }

  get userEmail(): string {
    return this.user?.email || this.claims?.email || '';
  }

  get userInitials(): string {
    const name = this.userName;
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

export default AuthStore;
