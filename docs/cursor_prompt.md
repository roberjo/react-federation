# Cursor AI Prompt: Enterprise Portal with Micro-Frontend Architecture

## Project Overview
Create a production-ready enterprise Portal application using React 18, Vite, MobX, and Module Federation that supports independently deployable sub-applications (TradePlans, ClientVerification, and AnnuitySales) with Okta OAuth 2.0 authentication and role-based access control.

**Architecture Note**: This project uses a **multi-repository architecture** where each module (portal, trade-plans, client-verification, annuity-sales) exists in its own separate repository. This enables independent versioning, deployment, and team ownership of each module.

## Tech Stack Requirements

### Core Technologies
- **React 18.3+** with TypeScript
- **Vite 5+** as build tool
- **MobX 6+** for state management
- **@originjs/vite-plugin-federation** for micro-frontend architecture
- **Okta React SDK** (@okta/okta-react, @okta/okta-auth-js) for authentication
- **React Router v6** for routing
- **Tailwind CSS** for styling with a professional, sleek design system

### Additional Libraries
- **axios** for API calls with interceptors
- **jwt-decode** for JWT token parsing
- **react-error-boundary** for error handling
- **lucide-react** for icons

## Repository Structure

Each module exists in its own separate repository for independent versioning and deployment:

### Repository 1: Portal (Main Shell Application)
```
portal-repo/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   ├── Auth/
│   │   │   ├── SecureRoute.tsx
│   │   │   ├── LoginCallback.tsx
│   │   │   └── UnauthorizedPage.tsx
│   │   └── ErrorBoundary.tsx
│   ├── stores/
│   │   ├── AuthStore.ts      # Okta auth + claims
│   │   ├── UserStore.ts       # User profile + groups
│   │   └── RootStore.ts       # Combine all stores
│   ├── services/
│   │   ├── oktaService.ts
│   │   ├── apiClient.ts
│   │   └── manifestService.ts # Fetches remote URLs from manifest
│   ├── utils/
│   │   ├── roleChecker.ts
│   │   └── claimsParser.ts
│   ├── config/
│   │   └── oktaConfig.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── .github/workflows/deploy.yml
```

### Repository 2: Trade Plans Remote
```
trade-plans-repo/
├── src/
│   ├── components/
│   │   ├── TradeList.tsx
│   │   ├── TradeForm.tsx
│   │   ├── TradeAnalytics.tsx
│   │   └── StrategyBuilder.tsx
│   ├── stores/
│   │   ├── TradeStore.ts
│   │   └── StrategyStore.ts
│   ├── App.tsx
│   ├── bootstrap.tsx
│   └── main.tsx
├── vite.config.ts
├── package.json
└── .github/workflows/deploy.yml
```

### Repository 3: Client Verification Remote
```
client-verification-repo/
├── src/
│   ├── components/
│   │   ├── VerificationQueue.tsx
│   │   ├── ClientProfile.tsx
│   │   ├── DocumentUpload.tsx
│   │   └── ComplianceChecklist.tsx
│   ├── stores/
│   │   ├── VerificationStore.ts
│   │   └── DocumentStore.ts
│   ├── App.tsx
│   ├── bootstrap.tsx
│   └── main.tsx
├── vite.config.ts
├── package.json
└── .github/workflows/deploy.yml
```

### Repository 4: Annuity Sales Remote
```
annuity-sales-repo/
├── src/
│   ├── components/
│   │   ├── ProductCatalog.tsx
│   │   ├── QuoteCalculator.tsx
│   │   ├── ApplicationForm.tsx
│   │   └── SalesReports.tsx
│   ├── stores/
│   │   ├── AnnuityStore.ts
│   │   ├── QuoteStore.ts
│   │   └── SalesStore.ts
│   ├── App.tsx
│   ├── bootstrap.tsx
│   └── main.tsx
├── vite.config.ts
├── package.json
└── .github/workflows/deploy.yml
```

### Optional: Shared Types Package (Separate Repository or NPM Package)
```
shared-types-repo/  # OR published as @your-org/shared-types npm package
├── src/
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── trade.types.ts
│   ├── client.types.ts
│   ├── annuity.types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Note**: The shared types can be:
- A separate repository published as an npm package
- A git submodule (less recommended)
- Copied/shared via a shared package registry

## Implementation Requirements

### 1. Portal Application (Main Shell)

#### Vite Configuration
```typescript
// portal/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// In development, use localhost URLs
// In production, remotes are loaded dynamically from manifest.json
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portal',
      remotes: isDev
        ? {
            tradePlans: 'http://localhost:5001/assets/remoteEntry.js',
            clientVerification: 'http://localhost:5002/assets/remoteEntry.js',
            annuitySales: 'http://localhost:5003/assets/remoteEntry.js',
          }
        : {}, // Production remotes loaded dynamically from manifest
      shared: ['react', 'react-dom', 'mobx', 'mobx-react-lite', 'react-router-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
```

#### Manifest Service (Dynamic Remote Loading)
```typescript
// portal-repo/src/services/manifestService.ts
interface RemoteConfig {
  url: string
  version: string
  requiredGroups: string[]
  displayName: string
  icon: string
  description: string
}

interface Manifest {
  version: string
  remotes: {
    [key: string]: RemoteConfig
  }
}

let cachedManifest: Manifest | null = null

export async function fetchManifest(): Promise<Manifest> {
  if (cachedManifest) return cachedManifest
  
  const manifestUrl = import.meta.env.VITE_MANIFEST_URL || '/manifest.json'
  const response = await fetch(manifestUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.statusText}`)
  }
  
  cachedManifest = await response.json()
  return cachedManifest
}

export async function loadRemoteConfig(remoteName: string): Promise<RemoteConfig | null> {
  const manifest = await fetchManifest()
  return manifest.remotes[remoteName] || null
}

// Dynamically register remotes at runtime
export async function registerRemotes() {
  if (import.meta.env.DEV) {
    // In development, remotes are already configured in vite.config.ts
    return
  }
  
  const manifest = await fetchManifest()
  const remotes: Record<string, string> = {}
  
  for (const [name, config] of Object.entries(manifest.remotes)) {
    remotes[name] = config.url
  }
  
  // Register remotes with module federation
  // This would be called during app initialization
  return remotes
}
```

#### Okta Configuration
```typescript
// portal-repo/src/config/oktaConfig.ts
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

#### Auth Store (MobX)
```typescript
// portal-repo/src/stores/AuthStore.ts
import { makeAutoObservable } from 'mobx'
import { OktaAuth } from '@okta/okta-auth-js'
import jwtDecode from 'jwt-decode'

interface JwtClaims {
  sub: string
  email: string
  name: string
  groups: string[]
  [key: string]: any
}

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
    } finally {
      this.isLoading = false
    }
  }

  async loadUserData() {
    const accessToken = await this.oktaAuth.getAccessToken()
    if (accessToken) {
      this.accessToken = accessToken
      this.claims = jwtDecode<JwtClaims>(accessToken)
      this.groups = this.claims.groups || []
      this.isAuthenticated = true
    }
  }

  hasGroup(groupName: string): boolean {
    return this.groups.includes(groupName)
  }

  hasAnyGroup(groupNames: string[]): boolean {
    return groupNames.some(group => this.hasGroup(group))
  }

  hasRole(role: string): boolean {
    return this.claims?.roles?.includes(role) || false
  }

  async login() {
    await this.oktaAuth.signInWithRedirect()
  }

  async logout() {
    await this.oktaAuth.signOut()
    this.isAuthenticated = false
    this.accessToken = null
    this.claims = null
    this.groups = []
  }
}

export default AuthStore
```

#### Secure Route Component
```typescript
// portal-repo/src/components/Auth/SecureRoute.tsx
import { observer } from 'mobx-react-lite'
import { Navigate } from 'react-router-dom'
import { useStores } from '../../hooks/useStores'

interface SecureRouteProps {
  children: React.ReactNode
  requiredGroups?: string[]
  requiredRoles?: string[]
  requireAll?: boolean
}

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

  const hasGroupAccess = requiredGroups.length === 0 || 
    (requireAll 
      ? requiredGroups.every(g => authStore.hasGroup(g))
      : authStore.hasAnyGroup(requiredGroups)
    )

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

#### Dynamic Module Loading
```typescript
// portal-repo/src/components/ModuleLoader.tsx
import { lazy, Suspense } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../hooks/useStores'

const loadModule = (scope: string, module: string) => {
  return lazy(async () => {
    // @ts-ignore
    const container = window[scope]
    await container.init(__webpack_share_scopes__.default)
    const factory = await container.get(module)
    return factory()
  })
}

interface ModuleLoaderProps {
  scope: string
  module: string
  requiredGroups?: string[]
  fallback?: React.ReactNode
}

export const ModuleLoader = observer(({ 
  scope, 
  module, 
  requiredGroups = [],
  fallback = <div>Loading...</div>
}: ModuleLoaderProps) => {
  const { authStore } = useStores()

  if (!authStore.hasAnyGroup(requiredGroups)) {
    return <Navigate to="/unauthorized" />
  }

  const Component = loadModule(scope, module)

  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
})
```

### 2. Remote Applications (Sub-Apps)

#### Remote Vite Configuration

Each remote application has its own repository and Vite configuration:

```typescript
// trade-plans-repo/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tradePlans',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'mobx', 'mobx-react-lite', 'react-router-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5001,
    cors: true
  }
})
```

```typescript
// client-verification-repo/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'clientVerification',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'mobx', 'mobx-react-lite', 'react-router-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5002,
    cors: true
  }
})
```

```typescript
// annuity-sales-repo/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'annuitySales',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'mobx', 'mobx-react-lite', 'react-router-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5003,
    cors: true
  }
})
```

#### Remote Bootstrap Pattern
```typescript
// trade-plans-repo/src/bootstrap.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Export for module federation
export default App

// Standalone mode for development
if (import.meta.env.DEV) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
```

```typescript
// trade-plans-repo/src/main.tsx
import('./bootstrap')
```

*Note: Use the same bootstrap pattern for client-verification-repo and annuity-sales-repo. Each remote application in its own repository can be developed and tested independently.*

### 3. Professional Design System

#### Tailwind Configuration
```javascript
// portal-repo/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
```

#### Layout Components
```typescript
// portal-repo/src/components/Layout/Layout.tsx
import { observer } from 'mobx-react-lite'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export const Layout = observer(() => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
})
```

### 4. Deployment Structure

#### S3 Folder Structure
```
s3://your-bucket/
├── portal/
│   ├── v1.0.0/
│   │   ├── index.html
│   │   ├── assets/
│   │   └── remoteEntry.js
│   └── current -> v1.0.0/
│
├── trade-plans/
│   ├── v1.0.0/
│   │   ├── assets/
│   │   └── remoteEntry.js
│   └── current -> v1.0.0/
│
├── client-verification/
│   ├── v1.0.0/
│   │   ├── assets/
│   │   └── remoteEntry.js
│   └── current -> v1.0.0/
│
├── annuity-sales/
│   ├── v1.0.0/
│   │   ├── assets/
│   │   └── remoteEntry.js
│   └── current -> v1.0.0/
│
└── manifest.json
```

#### Manifest Configuration
```json
{
  "version": "1.0.0",
  "remotes": {
    "tradePlans": {
      "url": "https://cdn.example.com/trade-plans/current/remoteEntry.js",
      "version": "1.0.0",
      "requiredGroups": ["trade-planners", "traders", "admins"],
      "displayName": "Trade Plans",
      "icon": "trendingUp",
      "description": "Create and manage trading strategies and plans"
    },
    "clientVerification": {
      "url": "https://cdn.example.com/client-verification/current/remoteEntry.js",
      "version": "1.0.0",
      "requiredGroups": ["compliance-officers", "kyc-specialists", "admins"],
      "displayName": "Client Verification",
      "icon": "userCheck",
      "description": "Verify client identities and compliance documentation"
    },
    "annuitySales": {
      "url": "https://cdn.example.com/annuity-sales/current/remoteEntry.js",
      "version": "1.0.0",
      "requiredGroups": ["sales-agents", "sales-managers", "admins"],
      "displayName": "Annuity Sales",
      "icon": "dollarSign",
      "description": "Manage annuity products, quotes, and sales pipeline"
    }
  }
}
```

### 5. CI/CD Pipeline Requirements

Each repository has its own independent CI/CD pipeline. When a module is deployed, it updates the manifest.json file (hosted separately or in a dedicated manifest service) with its new version and URL.

#### Portal Repository CI/CD
```yaml
# portal-repo/.github/workflows/deploy.yml
name: Deploy Portal Application
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to S3
        run: |
          VERSION=$(node -p "require('./package.json').version")
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/portal/$VERSION/
          # Update current symlink
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/portal/current/ --delete
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/portal/*"
```

#### Trade Plans Repository CI/CD
```yaml
# trade-plans-repo/.github/workflows/deploy.yml
name: Deploy Trade Plans
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to S3
        run: |
          VERSION=$(node -p "require('./package.json').version")
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/trade-plans/$VERSION/
          # Update current symlink
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/trade-plans/current/ --delete
      - name: Update Manifest
        run: |
          # Update manifest.json with new version
          # This could be done via API call to manifest service or direct S3 update
          VERSION=$(node -p "require('./package.json').version")
          REMOTE_URL="https://cdn.example.com/trade-plans/$VERSION/remoteEntry.js"
          # Update manifest.json (implementation depends on manifest storage)
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/trade-plans/*" "/manifest.json"
```

#### Client Verification Repository CI/CD
```yaml
# client-verification-repo/.github/workflows/deploy.yml
name: Deploy Client Verification
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to S3
        run: |
          VERSION=$(node -p "require('./package.json').version")
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/client-verification/$VERSION/
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/client-verification/current/ --delete
      - name: Update Manifest
        run: |
          VERSION=$(node -p "require('./package.json').version")
          REMOTE_URL="https://cdn.example.com/client-verification/$VERSION/remoteEntry.js"
          # Update manifest.json
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/client-verification/*" "/manifest.json"
```

#### Annuity Sales Repository CI/CD
```yaml
# annuity-sales-repo/.github/workflows/deploy.yml
name: Deploy Annuity Sales
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to S3
        run: |
          VERSION=$(node -p "require('./package.json').version")
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/annuity-sales/$VERSION/
          aws s3 sync dist s3://${{ secrets.S3_BUCKET }}/annuity-sales/current/ --delete
      - name: Update Manifest
        run: |
          VERSION=$(node -p "require('./package.json').version")
          REMOTE_URL="https://cdn.example.com/annuity-sales/$VERSION/remoteEntry.js"
          # Update manifest.json
      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/annuity-sales/*" "/manifest.json"
```

**Note**: Each repository deploys independently. When a remote module is deployed, it should update the manifest.json file (hosted at a central location) with its new version and URL. The portal application fetches this manifest at runtime to discover available remote modules and their versions.

## Specific Instructions for Cursor AI

### Phase 1: Project Setup
1. Create separate repositories for each module:
   - `portal-repo` - Main shell application
   - `trade-plans-repo` - Trade Plans remote module
   - `client-verification-repo` - Client Verification remote module
   - `annuity-sales-repo` - Annuity Sales remote module
   - `shared-types-repo` (optional) - Shared TypeScript types as npm package
2. Initialize each repository with Vite + React + TypeScript
3. Configure Tailwind CSS in portal repository with the professional financial services theme
4. Set up ESLint, Prettier, and TypeScript strict mode in each repository
5. Install required dependencies in each repository independently
6. Set up shared types package (if using separate npm package approach)

### Phase 2: Authentication & Authorization
1. Implement Okta integration in portal application
2. Create AuthStore with MobX including:
   - JWT token management
   - Claims parsing
   - Group membership checking (trade-planners, traders, compliance-officers, kyc-specialists, sales-agents, sales-managers, admins)
   - Role-based access methods
3. Create SecureRoute component with group/role validation
4. Implement login, logout, and callback handling
5. Add token refresh logic

### Phase 3: Layout & Design
1. Create professional sidebar navigation with:
   - Logo area for company branding
   - Collapsible menu
   - Module icons (TradePlans: TrendingUp, ClientVerification: UserCheck, AnnuitySales: DollarSign)
   - Active state indicators with blue highlight
   - Smooth animations
   - User profile section at bottom
2. Build header component with:
   - Breadcrumb navigation
   - User avatar/profile dropdown
   - Notifications bell icon
   - Search functionality
   - Settings icon
3. Implement responsive design (mobile, tablet, desktop)
4. Add loading states and skeleton screens
5. Create error boundary components with professional error messages

### Phase 4: Module Federation Setup
1. Configure @originjs/vite-plugin-federation in portal repository
2. Set up three separate remote application repositories:
   - **TradePlans** repository (groups: ["trade-planners", "traders", "admins"])
   - **ClientVerification** repository (groups: ["compliance-officers", "kyc-specialists", "admins"])
   - **AnnuitySales** repository (groups: ["sales-agents", "sales-managers", "admins"])
3. Implement dynamic module loading with manifest-based remote discovery
4. Set up shared dependencies configuration in each repository
5. Create ModuleLoader component with access control in portal
6. Implement manifest service to fetch remote URLs at runtime

### Phase 5: Remote Applications

#### TradePlans Remote
1. Build TradePlans application with:
   - Trade list view with filtering and sorting
   - Trade strategy builder with drag-and-drop
   - Performance analytics dashboard
   - Risk assessment charts
   - Independent routing (/trade-plans/*)
   - Local MobX stores (TradeStore, StrategyStore)
   - Example features with role checks:
     - View trades: trade-planners, traders, admins
     - Create/edit trades: traders, admins
     - Delete trades: admins only
     - Advanced analytics: admins only

#### ClientVerification Remote
2. Build ClientVerification application with:
   - Verification queue dashboard
   - Client profile viewer
   - Document upload and review interface
   - Compliance checklist
   - Independent routing (/client-verification/*)
   - Local MobX stores (VerificationStore, DocumentStore)
   - Example features with role checks:
     - View queue: compliance-officers, kyc-specialists, admins
     - Process verification: compliance-officers, kyc-specialists, admins
     - Override decisions: admins only
     - Bulk actions: admins only

#### AnnuitySales Remote
3. Build AnnuitySales application with:
   - Product catalog with filters
   - Quote calculator with real-time pricing
   - Application form wizard
   - Sales pipeline dashboard
   - Commission reports
   - Independent routing (/annuity-sales/*)
   - Local MobX stores (AnnuityStore, QuoteStore, SalesStore)
   - Example features with role checks:
     - View products: sales-agents, sales-managers, admins
     - Create quotes: sales-agents, sales-managers, admins
     - Submit applications: sales-agents, sales-managers, admins
     - View all sales: sales-managers, admins
     - Commission reports: sales-managers, admins

4. Implement standalone development mode for each remote
5. Add proper TypeScript types for federation
6. Create comprehensive example components for each module

### Phase 6: State Management
1. Create RootStore combining all stores
2. Implement React Context for store access
3. Add useStores hook
4. Set up store persistence (if needed)
5. Create store hydration logic

### Phase 7: API Integration
1. Create axios instance with interceptors
2. Add automatic token injection
3. Implement token refresh on 401
4. Add request/response logging
5. Create type-safe API client

### Phase 8: Build & Deployment
1. Create build scripts for each repository independently
2. Set up environment variable management in each repository
3. Create manifest.json management system:
   - Option A: Central manifest service/API that modules update on deployment
   - Option B: Manifest stored in S3/CDN that modules update directly
   - Option C: Separate manifest repository that modules update via PR
4. Add independent version management using semantic versioning in each repository's package.json
5. Set up CI/CD pipelines for each repository (GitHub Actions, GitLab CI, etc.)
6. Create deployment documentation for each repository
7. Document how to coordinate deployments across repositories

### Phase 9: Testing & Quality
1. Add React Testing Library setup
2. Create example unit tests for stores
3. Add integration tests for SecureRoute
4. Implement E2E test structure
5. Add test coverage reporting

### Phase 10: Documentation
1. Create comprehensive README for each repository:
   - Portal repository README
   - Trade Plans repository README
   - Client Verification repository README
   - Annuity Sales repository README
   - Shared Types repository README (if applicable)
2. Document Okta group setup requirements
3. Add deployment runbook for each repository
4. Create developer onboarding guide for multi-repo development
5. Document troubleshooting steps for cross-repo issues
6. Document manifest.json management and version coordination

## Design Guidelines

### Color Scheme
- Primary: Blue (trust, professionalism)
- Secondary: Purple (creativity, innovation)
- Neutral: Slate gray backgrounds
- Success: Green
- Warning: Amber
- Error: Red

### Typography
- Font: Inter (clean, modern, readable)
- Headings: Bold, adequate spacing
- Body: Regular weight, 1.5 line height

### Components Style
- Rounded corners (rounded-lg)
- Subtle shadows for depth
- Smooth transitions (duration-200)
- Hover states on interactive elements
- Focus states for accessibility

### Navigation
- Left sidebar: 64px collapsed, 240px expanded
- Top header: 64px height
- Z-index management for overlays
- Smooth slide animations

## Environment Variables

### Portal Application (.env)
```
VITE_OKTA_CLIENT_ID=your_client_id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_API_BASE_URL=https://api.example.com
VITE_MANIFEST_URL=https://cdn.example.com/manifest.json
VITE_APP_NAME=Financial Services Portal
```

### Remote Applications (.env)
```
VITE_API_BASE_URL=https://api.example.com
```

## Manifest Management

Since each module is in a separate repository, a manifest.json file is used to coordinate remote module URLs and versions. The manifest can be managed in several ways:

### Option 1: Central Manifest Service
- Deploy a separate service/API that manages manifest.json
- Remote modules call this service on deployment to update their entry
- Portal fetches manifest from this service at runtime

### Option 2: S3/CDN-Stored Manifest
- Store manifest.json in S3/CDN
- Each remote module updates the manifest directly on deployment
- Portal fetches manifest.json from CDN at runtime
- Use versioning or atomic updates to prevent conflicts

### Option 3: Manifest Repository
- Create a separate repository for manifest.json
- Remote modules create PRs to update manifest on deployment
- Portal fetches manifest from this repository or its CDN

### Manifest Structure
The manifest.json should include:
- Module name and version
- CDN URL for remoteEntry.js
- Required Okta groups for access
- Display metadata (name, icon, description)
- Compatibility information (if needed)

## Versioning Strategy

Each repository uses semantic versioning independently:
- **Portal**: Versioned independently (e.g., 1.0.0, 1.1.0, 2.0.0)
- **Trade Plans**: Versioned independently (e.g., 1.0.0, 1.2.0, 2.0.0)
- **Client Verification**: Versioned independently (e.g., 1.0.0, 1.1.5, 2.0.0)
- **Annuity Sales**: Versioned independently (e.g., 1.0.0, 1.3.0, 2.0.0)

When a remote module is deployed:
1. Build artifacts are deployed to `{module-name}/{version}/` in S3
2. A `current` symlink/folder is updated to point to the latest version
3. The manifest.json is updated with the new version and URL
4. CloudFront cache is invalidated for the module and manifest

## Success Criteria

The implementation is complete when:
1. ✅ User can log in with Okta
2. ✅ JWT claims and groups are parsed correctly
3. ✅ Portal navigation shows only accessible modules based on Okta groups
4. ✅ Each remote app (TradePlans, ClientVerification, AnnuitySales) exists in its own repository and can be built and deployed independently
5. ✅ Portal loads remotes dynamically from manifest.json without rebuilding
6. ✅ Each repository has its own CI/CD pipeline that deploys independently
7. ✅ Professional financial services UI with smooth animations and responsive design
8. ✅ Role-based features work within each sub-app (traders can trade, compliance can verify, sales can sell)
9. ✅ Error boundaries handle remote loading failures gracefully with user-friendly messages
10. ✅ All TypeScript types are properly defined (via shared types package or copied types)
11. ✅ Build artifacts are production-ready and optimized
12. ✅ Sidebar shows: TradePlans (TrendingUp icon), ClientVerification (UserCheck icon), AnnuitySales (DollarSign icon)
13. ✅ Each module has comprehensive example features demonstrating real-world financial workflows
14. ✅ Manifest.json is properly managed and updated when modules are deployed
15. ✅ Each repository can be versioned and released independently

## Additional Notes

### Multi-Repository Considerations
- Each repository should have its own `.gitignore`, `package.json`, and build configuration
- Use consistent naming conventions across repositories for easier management
- Consider using a shared CI/CD template or GitHub Actions reusable workflows
- Document cross-repository dependencies and compatibility requirements
- Set up repository templates for faster creation of new remote modules

### Development Workflow
- For local development, run all repositories simultaneously (portal + all remotes)
- Use environment variables to point portal to localhost remotes during development
- Consider using a tool like `concurrently` or `npm-run-all` to run multiple dev servers
- Document how to set up local development environment across repositories

### Technical Considerations
- Use React 18 concurrent features where appropriate (Suspense, startTransition)
- Implement proper error boundaries at module boundaries with retry functionality
- Add telemetry/analytics hooks for monitoring module performance
- Consider adding a feature flag system for gradual rollouts of new features
- Implement proper CORS handling for remote modules in production
- Add health check endpoints for each remote application
- Consider implementing a service worker for offline support (view cached data)
- Add proper meta tags and Open Graph tags for the portal
- Implement audit logging for compliance-sensitive actions
- Add data export functionality (CSV, PDF) for reports
- Include print-friendly styles for client-facing documents
- Implement real-time notifications for time-sensitive events (trade executions, verification deadlines)
- Add keyboard shortcuts for power users (Cmd+K for search, etc.)
- Create a comprehensive style guide document for consistency across remotes
- Implement proper session timeout handling with warnings before expiration
- Add breadcrumb navigation that reflects the current module and page

### Shared Code Management
- If using shared types package, publish it to npm or private registry
- Keep shared dependencies in sync across repositories (React, MobX versions, etc.)
- Document breaking changes in shared types and coordinate updates
- Consider using a dependency management tool to keep versions aligned

---

**Start by creating the portal repository with authentication, then create each remote application repository independently (TradePlans first, then ClientVerification, then AnnuitySales). Each repository should be fully functional and deployable on its own. Polish the UI with financial services best practices.**