# Architecture Overview

This document provides a comprehensive overview of the Enterprise Portal micro-frontend architecture, including system design, component interactions, and deployment structure.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Monorepo Structure](#monorepo-structure)
3. [Module Federation Architecture](#module-federation-architecture)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [Routing Strategy](#routing-strategy)
7. [Deployment Architecture](#deployment-architecture)
8. [Communication Patterns](#communication-patterns)
9. [Error Handling](#error-handling)
10. [Performance Considerations](#performance-considerations)
11. [Security Architecture](#security-architecture)
12. [Scalability](#scalability)

## System Architecture

The Enterprise Portal uses a **micro-frontend architecture** with **Module Federation** to enable independently deployable sub-applications.

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        Portal[Portal Shell]
        TP[Trade Plans Module]
        CV[Client Verification Module]
        AS[Annuity Sales Module]
    end
    
    subgraph "CDN/Infrastructure"
        CF[CloudFront CDN]
        S3[S3 Buckets]
        Manifest[Manifest Service]
    end
    
    subgraph "Backend Services"
        Okta[Okta Auth]
        API[Backend APIs]
    end
    
    Portal --> CF
    TP --> CF
    CV --> CF
    AS --> CF
    
    CF --> S3
    Portal --> Manifest
    Portal --> Okta
    TP --> API
    CV --> API
    AS --> API
    
    Portal -.loads.-> TP
    Portal -.loads.-> CV
    Portal -.loads.-> AS
```

### Component Overview

```mermaid
graph LR
    subgraph "Portal Shell"
        Auth[Authentication]
        Router[Routing]
        Loader[Module Loader]
        Layout[Layout Components]
    end
    
    subgraph "Remote Modules"
        TP[Trade Plans]
        CV[Client Verification]
        AS[Annuity Sales]
    end
    
    subgraph "Shared"
        Types[Shared Types]
        Utils[Shared Utils]
    end
    
    Auth --> Router
    Router --> Loader
    Loader --> TP
    Loader --> CV
    Loader --> AS
    Layout --> Router
    
    TP --> Types
    CV --> Types
    AS --> Types
```

## Monorepo Structure

All packages live in a single **pnpm workspace**, enabling:
- Shared tooling and dependencies
- Instant cross-package linking
- Coordinated builds
- Independent deployment

### Workspace Structure

```
packages/
├── portal/                    # Host shell application
│   ├── Authentication (Okta)
│   ├── Layout & Navigation
│   ├── Module Loader
│   └── Shared State Management
│
├── trade-plans/              # Remote module 1
│   ├── Trade Management
│   ├── Strategy Builder
│   └── Analytics
│
├── client-verification/      # Remote module 2
│   ├── Verification Queue
│   ├── Document Management
│   └── Compliance Checks
│
├── annuity-sales/            # Remote module 3
│   ├── Product Catalog
│   ├── Quote Calculator
│   └── Sales Pipeline
│
└── shared/                   # Shared code
    ├── types/                # TypeScript types
    └── utils/                # Utility functions
```

### Package Dependencies

```mermaid
graph TD
    Portal --> Shared
    TradePlans --> Shared
    ClientVerification --> Shared
    AnnuitySales --> Shared
    
    Portal -.federation.-> TradePlans
    Portal -.federation.-> ClientVerification
    Portal -.federation.-> AnnuitySales
    
    style Portal fill:#e1f5ff
    style Shared fill:#fff4e1
```

## Module Federation Architecture

### How Module Federation Works

Module Federation enables runtime module loading and sharing:

```mermaid
sequenceDiagram
    participant Browser
    participant Portal
    participant SharedScope
    participant Manifest
    participant Remote
    participant CDN
    
    Browser->>Portal: Load Portal
    Portal->>SharedScope: Initialize __federation_shared__<br/>with React/ReactDOM
    SharedScope-->>Portal: Shared scope ready
    
    alt Development Mode
        Portal->>Remote: import() remoteEntry.js<br/>(ES module)
        Remote-->>Portal: Export get() and init()
        Portal->>SharedScope: Call remoteModule.init(sharedScope)
        Portal->>Remote: Call remoteModule.get('./App')
        Remote-->>Portal: Return component factory
        Portal->>Browser: Render component
    else Production Mode
        Portal->>Manifest: Fetch manifest.json
        Manifest-->>Portal: Return remote URLs
        Portal->>CDN: Request remoteEntry.js<br/>(script tag)
        CDN-->>Portal: Return remote entry
        Portal->>Remote: Wait for container on window
        Remote-->>Portal: Container exposed
        Portal->>SharedScope: Call container.init(sharedScope)
        Portal->>Remote: Call container.get('./App')
        Remote-->>Portal: Return component factory
        Portal->>Browser: Render component
    end
```

### Shared Dependencies

All modules share these dependencies (loaded once):

- `react` (^18.2.0)
- `react-dom` (^18.2.0)
- `mobx` (^6.12.0)
- `mobx-react-lite` (^4.0.0)
- `react-router-dom` (^6.20.0)

**Benefits:**
- ✅ Single instance of React across all modules
- ✅ Consistent state management
- ✅ Shared routing context
- ✅ Smaller bundle sizes

**Critical Implementation Detail:**

Shared dependencies must be initialized in `__federation_shared__` **before** any remote modules load. This is done in `main.tsx`:

```typescript
// Portal main.tsx - Initialize BEFORE ReactDOM.render()
function initializeFederationSharedScope() {
  const sharedScope = (window as any).__federation_shared__ || {}
  sharedScope.default = sharedScope.default || {}
  
  // React structure: get() returns Promise<() => Promise<React>>
  sharedScope.default.react = {
    '18.2.0': {
      get: () => Promise.resolve(() => Promise.resolve(React)),
      loaded: true,
      from: 'portal'
    }
  }
  // Same for react-dom...
}

initializeFederationSharedScope() // Call immediately
```

**Why?** Remote modules access React via the shared scope. If React isn't initialized before the remote loads, you'll get "React is null" errors.

### Module Loading Flow

```mermaid
flowchart TD
    Start[User Navigates to Route] --> CheckAuth{User Authenticated?}
    CheckAuth -->|No| Login[Redirect to Login]
    CheckAuth -->|Yes| CheckRoles{Has Required Roles?}
    CheckRoles -->|No| Unauthorized[Show Unauthorized]
    CheckRoles -->|Yes| InitSharedScope[Initialize Shared Scope]
    InitSharedScope[Initialize __federation_shared__ with React/ReactDOM] --> CheckEnv{Environment?}
    
    CheckEnv -->|Development| LoadDev[Load remoteEntry.js via import]
    CheckEnv -->|Production| FetchManifest[Fetch Manifest from CDN]
    
    FetchManifest --> GetURL[Get Remote URL]
    GetURL --> LoadScript[Load remoteEntry.js script]
    LoadScript --> WaitContainer[Wait for Container]
    
    LoadDev --> ImportModule[Import remoteEntry.js as ES module]
    ImportModule --> GetRemoteModule[Get remoteModule with get/init]
    
    WaitContainer --> InitContainer[Initialize Container with Shared Scope]
    GetRemoteModule --> InitRemote[Call remoteModule.init sharedScope]
    
    InitContainer --> GetFactory[Get Module Factory]
    InitRemote --> GetFactory[Call remoteModule.get modulePath]
    
    GetFactory --> CallFactory[Call factory to get component]
    CallFactory --> WrapComponent[Wrap in default: component]
    WrapComponent --> Render[Render Component via React.lazy]
    Render --> End[Module Loaded]
    
    LoadScript -->|Error| Retry{Retry Available?}
    Retry -->|Yes| LoadScript
    Retry -->|No| Error[Show Error UI]
    
    ImportModule -->|Error| Error
    GetRemoteModule -->|Error| Error
```

## Authentication Flow

### Authentication Sequence

```mermaid
sequenceDiagram
    participant User
    participant Portal
    participant Okta
    participant Backend
    
    User->>Portal: Access Portal
    Portal->>Portal: Check Auth Status
    Portal->>User: Redirect to Login
    User->>Okta: Enter Credentials
    Okta->>Okta: Authenticate User
    Okta->>Portal: Callback with Code
    Portal->>Okta: Exchange Code for Tokens
    Okta-->>Portal: Return JWT Tokens
    Portal->>Portal: Parse JWT Claims
    Portal->>Portal: Extract Groups/Roles
    Portal->>User: Show Authorized Modules
    User->>Portal: Navigate to Module
    Portal->>Backend: API Call with Token
    Backend-->>Portal: Return Data
```

### Token Management

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Authenticating: Login Request
    Authenticating --> Authenticated: Token Received
    Authenticated --> TokenExpiring: Token Near Expiry
    TokenExpiring --> Refreshing: Refresh Token
    Refreshing --> Authenticated: New Token
    Refreshing --> Unauthenticated: Refresh Failed
    Authenticated --> Unauthenticated: Logout
    Authenticated --> Unauthenticated: Token Invalid
```

## State Management

### State Architecture

```mermaid
graph TB
    subgraph "Portal State"
        AuthStore[AuthStore]
        UserStore[UserStore]
        RootStore[RootStore]
    end
    
    subgraph "Remote Module State"
        TPStore[Trade Plans Store]
        CVStore[Client Verification Store]
        ASStore[Annuity Sales Store]
    end
    
    RootStore --> AuthStore
    RootStore --> UserStore
    
    AuthStore -.props.-> TPStore
    AuthStore -.props.-> CVStore
    AuthStore -.props.-> ASStore
```

### State Sharing Strategy

**Props Injection** (Recommended - See [ADR-0002](./adr/0002-token-sharing-props-injection.md))

The portal injects authentication state into remotes via props:

```typescript
// Portal passes auth state
<ModuleLoader 
  remoteName="tradePlans"
  module="./App"
  props={{
    auth: {
      user: authStore.claims,
      token: authStore.accessToken,
      groups: authStore.groups,
      isAuthenticated: authStore.isAuthenticated,
      hasGroup: (group: string) => authStore.hasGroup(group),
    },
    onLogout: () => authStore.logout(),
  }}
/>
```

**Benefits:**
- ✅ Type-safe interface
- ✅ Explicit dependencies
- ✅ Works in standalone mode
- ✅ No global state pollution

## Routing Strategy

### Portal Routes

```
/                          → Dashboard (if exists)
/login                     → Login page
/login/callback            → Okta callback handler
/unauthorized              → Access denied page
/trade-plans/*             → Trade Plans module (lazy loaded)
/client-verification/*     → Client Verification module (lazy loaded)
/annuity-sales/*           → Annuity Sales module (lazy loaded)
```

### Remote Module Routes

Each remote module manages its own internal routing:

- **Trade Plans**: `/trade-plans/`, `/trade-plans/strategies`, `/trade-plans/analytics`
- **Client Verification**: `/client-verification/`, `/client-verification/queue`, `/client-verification/profile/:id`
- **Annuity Sales**: `/annuity-sales/`, `/annuity-sales/products`, `/annuity-sales/quotes`

### Routing Flow

```mermaid
flowchart LR
    PortalRoute[Portal Route] --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Login Page]
    CheckAuth -->|Yes| CheckModule{Module Route?}
    CheckModule -->|No| Dashboard[Dashboard]
    CheckModule -->|Yes| LoadModule[Load Module]
    LoadModule --> ModuleRoute[Module Internal Routes]
```

## Deployment Architecture

### S3/CDN Structure

```
s3://bucket/
├── portal/
│   ├── v1.0.0/              # Versioned deployment
│   ├── v1.1.0/
│   └── current/ → v1.1.0/   # Latest version symlink
│
├── trade-plans/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
│
├── client-verification/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
│
├── annuity-sales/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
│
└── manifest.json            # Remote module registry
```

### Deployment Flow

```mermaid
sequenceDiagram
    participant Dev
    participant CI
    participant S3
    participant CloudFront
    participant Manifest
    
    Dev->>CI: Push to Main
    CI->>CI: Build Package
    CI->>S3: Upload Versioned Bundle
    CI->>S3: Update Current Symlink
    CI->>Manifest: Update manifest.json
    CI->>CloudFront: Invalidate Cache
    CloudFront-->>Users: Serve New Version
```

### Version Management

- Each module versions independently
- `current` symlink points to latest version
- Portal fetches `manifest.json` to discover available versions
- Supports A/B testing and gradual rollouts

## Communication Patterns

### Portal → Remote

1. **Props Injection** - Pass auth state, user info, callbacks
2. **Events** - Custom events for cross-module communication
3. **Shared State** - Via shared MobX stores (if using shared package)

### Remote → Portal

1. **Callbacks** - Functions passed as props
2. **Events** - Custom events dispatched to window
3. **Navigation** - Use React Router's `useNavigate` (shared context)

### Communication Diagram

```mermaid
graph LR
    Portal -->|Props| Remote
    Portal -->|Events| Remote
    Remote -->|Callbacks| Portal
    Remote -->|Events| Portal
    Remote -->|Navigation| Portal
```

## Error Handling

### Error Handling Strategy

```mermaid
flowchart TD
    Error[Error Occurs] --> Type{Error Type?}
    Type -->|Module Load| ModuleError[Module Error Boundary]
    Type -->|Auth| AuthError[Auth Error Handler]
    Type -->|Network| NetworkError[Network Error Handler]
    Type -->|Runtime| RuntimeError[Runtime Error Boundary]
    
    ModuleError --> Retry{Retry?}
    Retry -->|Yes| LoadModule[Reload Module]
    Retry -->|No| FallbackUI[Show Fallback UI]
    
    AuthError --> Refresh{Refresh Token?}
    Refresh -->|Yes| RefreshToken[Refresh Token]
    Refresh -->|No| RedirectLogin[Redirect to Login]
    
    NetworkError --> RetryNetwork{Retry?}
    RetryNetwork -->|Yes| RetryRequest[Retry Request]
    RetryNetwork -->|No| ShowError[Show Error Message]
```

### Error Boundaries

- **Module Loading Errors** - Error boundaries catch remote loading failures
- **Authentication Errors** - Token expiration → Auto-refresh or redirect to login
- **Network Errors** - Show retry option with exponential backoff

## Performance Considerations

### Performance Optimizations

```mermaid
graph TB
    subgraph "Code Splitting"
        LazyLoad[Lazy Load Modules]
        CodeSplit[Code Split Within Modules]
    end
    
    subgraph "Caching"
        ManifestCache[Cache Manifest]
        RemoteCache[Cache Remote Entries]
        CDNCache[CDN Caching]
    end
    
    subgraph "Bundle Optimization"
        SharedDeps[Shared Dependencies]
        TreeShake[Tree Shaking]
        Minify[Minification]
    end
    
    LazyLoad --> Performance
    CodeSplit --> Performance
    ManifestCache --> Performance
    RemoteCache --> Performance
    CDNCache --> Performance
    SharedDeps --> Performance
    TreeShake --> Performance
    Minify --> Performance
```

### Performance Metrics

- **Module Load Times** - Target: < 2s for initial load
- **Time to Interactive** - Target: < 3s
- **Bundle Sizes** - Portal: < 500KB, Remotes: < 300KB each
- **Cache Hit Rate** - Target: > 80% for static assets

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Client Security"
        HTTPS[HTTPS Only]
        CSP[Content Security Policy]
        TokenSec[Token Security]
    end
    
    subgraph "Authentication"
        OktaAuth[Okta OAuth 2.0]
        JWT[JWT Tokens]
        Refresh[Token Refresh]
    end
    
    subgraph "Authorization"
        GroupCheck[Group Validation]
        RoleCheck[Role Validation]
        ServerVal[Server-Side Validation]
    end
    
    HTTPS --> Security
    CSP --> Security
    TokenSec --> Security
    OktaAuth --> Security
    JWT --> Security
    Refresh --> Security
    GroupCheck --> Security
    RoleCheck --> Security
    ServerVal --> Security
```

### Security Considerations

1. **CORS** - Proper CORS configuration for remote modules
2. **Content Security Policy** - CSP headers for XSS protection
3. **Token Security** - Tokens stored securely, not exposed unnecessarily
4. **HTTPS** - All communication over HTTPS
5. **Group Validation** - Server-side validation of group membership

## Scalability

### Adding New Modules

```mermaid
flowchart TD
    Start[Add New Module] --> Scaffold[Scaffold Package]
    Scaffold --> Config[Configure Module Federation]
    Config --> Workspace[Add to Workspace]
    Workspace --> DevURL[Register Dev URL]
    DevURL --> Build[Build & Deploy]
    Build --> Manifest[Update Manifest]
    Manifest --> Route[Add Routing]
    Route --> End[Module Available]
```

### Module Updates

- Deploy new version
- Update manifest.json
- Portal loads new version on next navigation
- Old version remains available for rollback

### Horizontal Scaling

- Each module can scale independently
- CDN provides global distribution
- No shared server infrastructure required
- Stateless architecture enables easy scaling

## Technology Stack

### Core Technologies

- **React 18.2+** - UI framework with concurrent features
- **TypeScript** - Type safety across all modules
- **Vite 5+** - Fast build tool and dev server
- **MobX 6+** - Reactive state management
- **Module Federation** - Micro-frontend architecture via `@originjs/vite-plugin-federation`
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### Authentication & Security

- **Okta React SDK** - OAuth 2.0 authentication
- **JWT Tokens** - Access token management
- **Role-Based Access Control (RBAC)** - Group and role-based permissions

## Monitoring & Observability

### Recommended Metrics

- Module load times
- Authentication success/failure rates
- Module error rates
- User navigation patterns
- API response times

### Logging

- Client-side error logging
- Authentication events
- Module load events
- User actions (for audit trail)

## Related Documentation

- [Module Federation Guide](./module-federation-guide.md) - Technical deep dive
- [Development Guide](./development-guide.md) - Development workflow
- [Deployment Guide](./deployment-guide.md) - Production deployment
- [Architecture Decision Records](./adr/README.md) - Key decisions
- [Security Guide](./security-authentication-guide.md) - Security details

---

**Last Updated:** 2024  
**Maintained by:** Architecture Team
