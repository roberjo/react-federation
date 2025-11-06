# Architecture Overview

## System Architecture

This enterprise portal uses a **micro-frontend architecture** with **Module Federation** to enable independently deployable sub-applications. The system consists of:

1. **Portal (Shell Application)** - Main application that orchestrates authentication, routing, and module loading
2. **Remote Modules** - Independently deployable applications:
   - Trade Plans
   - Client Verification
   - Annuity Sales
3. **Shared Types Package** (Optional) - Common TypeScript types shared across modules

## Multi-Repository Architecture

Each module exists in its own separate repository, enabling:
- **Independent Versioning** - Each module follows semantic versioning independently
- **Independent Deployment** - Modules can be deployed without affecting others
- **Team Autonomy** - Different teams can own and maintain different modules
- **Technology Flexibility** - Future modules can use different tech stacks if needed

## Repository Structure

```
portal-repo/              # Main shell application
├── Authentication (Okta)
├── Layout & Navigation
├── Module Loader
└── Shared State Management

trade-plans-repo/         # Remote module 1
├── Trade Management
├── Strategy Builder
└── Analytics

client-verification-repo/ # Remote module 2
├── Verification Queue
├── Document Management
└── Compliance Checks

annuity-sales-repo/       # Remote module 3
├── Product Catalog
├── Quote Calculator
└── Sales Pipeline
```

## Technology Stack

### Core Technologies
- **React 18.3+** - UI framework with concurrent features
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

## Module Federation Architecture

### How It Works

1. **Portal (Host)** loads and orchestrates remote modules
2. **Remotes** expose their components via `remoteEntry.js`
3. **Shared Dependencies** are loaded once and shared across modules
4. **Dynamic Loading** - Remotes are loaded on-demand based on user permissions

### Shared Dependencies

All modules share these dependencies (loaded once):
- `react`
- `react-dom`
- `mobx`
- `mobx-react-lite`
- `react-router-dom`

This ensures:
- Single instance of React across all modules
- Consistent state management
- Shared routing context

## Authentication Flow

```
1. User accesses Portal
2. Portal checks authentication status
3. If not authenticated → Redirect to Okta login
4. Okta authenticates user
5. Callback returns to Portal with tokens
6. Portal parses JWT claims and groups
7. Portal shows only accessible modules based on groups
8. User clicks module → Module loads dynamically
```

## Module Loading Flow

```
1. User navigates to module route
2. Portal checks user groups against module requirements
3. If authorized:
   a. Fetch manifest.json (if not cached)
   b. Get remote URL from manifest
   c. Load remoteEntry.js dynamically
   d. Initialize module federation container
   e. Get exposed component
   f. Render component
4. If not authorized → Show unauthorized page
```

## State Management

### Portal State
- **AuthStore** - Authentication state, tokens, claims, groups
- **UserStore** - User profile information
- **RootStore** - Combines all stores

### Remote Module State
Each remote module has its own local stores:
- Trade Plans: `TradeStore`, `StrategyStore`
- Client Verification: `VerificationStore`, `DocumentStore`
- Annuity Sales: `AnnuityStore`, `QuoteStore`, `SalesStore`

### State Sharing Strategy

**Option 1: Props Injection** (Recommended)
- Portal passes auth state as props to remote modules
- Remotes receive user info, tokens, and permissions

**Option 2: Global Window Object**
- Portal exposes auth state on `window.portalAuth`
- Remotes access via `window.portalAuth`

**Option 3: Shared Store Package**
- Create shared MobX store package
- Both portal and remotes import and use

## Routing Strategy

### Portal Routes
```
/ - Dashboard (if exists)
/login - Login page
/login/callback - Okta callback handler
/unauthorized - Access denied page
/trade-plans/* - Trade Plans module (lazy loaded)
/client-verification/* - Client Verification module (lazy loaded)
/annuity-sales/* - Annuity Sales module (lazy loaded)
```

### Remote Module Routes
Each remote module manages its own internal routing:
- Trade Plans: `/trade-plans/`, `/trade-plans/strategies`, `/trade-plans/analytics`
- Client Verification: `/client-verification/`, `/client-verification/queue`, `/client-verification/profile/:id`
- Annuity Sales: `/annuity-sales/`, `/annuity-sales/products`, `/annuity-sales/quotes`

## Deployment Architecture

### S3/CDN Structure
```
s3://bucket/
├── portal/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
├── trade-plans/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
├── client-verification/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
├── annuity-sales/
│   ├── v1.0.0/
│   └── current/ → v1.0.0/
└── manifest.json
```

### Version Management
- Each module versions independently
- `current` symlink points to latest version
- Portal fetches `manifest.json` to discover available versions
- Can support A/B testing and gradual rollouts

## Communication Patterns

### Portal → Remote
1. **Props** - Pass auth state, user info, callbacks
2. **Events** - Custom events for cross-module communication
3. **Shared State** - Via shared MobX stores (if using shared package)

### Remote → Portal
1. **Callbacks** - Functions passed as props
2. **Events** - Custom events dispatched to window
3. **Navigation** - Use React Router's `useNavigate` (shared context)

## Error Handling

### Module Loading Errors
- Error boundaries catch remote loading failures
- Fallback UI shows user-friendly error message
- Retry mechanism for transient failures

### Authentication Errors
- Token expiration → Auto-refresh or redirect to login
- Invalid token → Clear state and redirect to login
- Network errors → Show retry option

## Performance Considerations

1. **Code Splitting** - Each module is a separate bundle
2. **Lazy Loading** - Modules load only when needed
3. **Shared Dependencies** - Loaded once, shared across modules
4. **Caching** - Manifest and remote entries cached
5. **CDN** - All assets served from CDN for fast global access

## Security Considerations

1. **CORS** - Proper CORS configuration for remote modules
2. **Content Security Policy** - CSP headers for XSS protection
3. **Token Security** - Tokens stored securely, not exposed unnecessarily
4. **HTTPS** - All communication over HTTPS
5. **Group Validation** - Server-side validation of group membership

## Scalability

### Adding New Modules
1. Create new repository
2. Configure Module Federation
3. Deploy to CDN
4. Update manifest.json
5. Portal automatically discovers new module

### Module Updates
- Deploy new version
- Update manifest.json
- Portal loads new version on next navigation
- Old version remains available for rollback

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

