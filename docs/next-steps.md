# Next Steps - Implementation Roadmap

## Overview

Now that the architecture is documented and key decisions are made, here's a prioritized roadmap for implementation.

## Phase 1: Project Setup & Foundation (Week 1-2)

### 1.1 Create Monorepo Structure
- [ ] Set up monorepo with pnpm/npm/yarn workspaces
- [ ] Create package structure:
  - [ ] `packages/portal/` - Main shell application
  - [ ] `packages/trade-plans/` - Trade Plans remote module
  - [ ] `packages/client-verification/` - Client Verification remote module
  - [ ] `packages/annuity-sales/` - Annuity Sales remote module
  - [ ] `packages/shared/` - Shared TypeScript types and utilities
- [ ] Configure root package.json with workspace scripts
- [ ] Set up TypeScript path aliases for shared package

**See**: [Monorepo Setup Guide](./monorepo-setup.md) for detailed instructions

### 1.2 Initialize Portal Repository
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install core dependencies:
  - [ ] React 18.3+
  - [ ] TypeScript
  - [ ] Vite 5+
  - [ ] @originjs/vite-plugin-federation
  - [ ] MobX 6+
  - [ ] React Router v6
  - [ ] Tailwind CSS
  - [ ] @okta/okta-react, @okta/okta-auth-js
- [ ] Configure ESLint, Prettier, TypeScript strict mode
- [ ] Set up Tailwind CSS with design system
- [ ] Create basic project structure

### 1.3 Set Up Development Environment
- [ ] Create `.env.example` files for each package
- [ ] Set up workspace scripts for running all dev servers
- [ ] Configure mocking for Okta authentication
- [ ] Set up MSW (Mock Service Worker) for API mocking
- [ ] Create mock data and handlers
- [ ] Document local setup process

**See**: [Mocking Guide](./mocking-guide.md) for detailed instructions

## Phase 2: Portal Core Implementation (Week 2-3)

### 2.1 Authentication Setup
- [ ] Create mock Okta service for development
- [ ] Create `oktaConfig.ts` with mock/real switch
- [ ] Implement `AuthStore` with MobX:
  - [ ] Token management
  - [ ] Claims parsing
  - [ ] Group membership checking
  - [ ] Role-based access methods
- [ ] Create `UserStore` for user profile
- [ ] Create `RootStore` combining all stores
- [ ] Set up React Context for store access
- [ ] Create `useStores` hook

### 2.2 Authentication Components
- [ ] Create `SecureRoute` component
- [ ] Create `LoginCallback` component
- [ ] Create `UnauthorizedPage` component
- [ ] Create `LoginPage` component
- [ ] Implement login/logout flows
- [ ] Add token refresh logic

### 2.3 Layout Components
- [ ] Create `Sidebar` component:
  - [ ] Logo area
  - [ ] Collapsible menu
  - [ ] Module navigation items
  - [ ] Active state indicators
  - [ ] User profile section
- [ ] Create `Header` component:
  - [ ] Breadcrumb navigation
  - [ ] User avatar/profile dropdown
  - [ ] Notifications bell
  - [ ] Search functionality
  - [ ] Settings icon
- [ ] Create `Layout` component combining Sidebar and Header
- [ ] Implement responsive design

### 2.4 Module Federation Setup
- [ ] Configure `vite.config.ts` with Module Federation plugin
- [ ] Implement `manifestService.ts`:
  - [ ] Fetch manifest from S3/CDN
  - [ ] Caching and request deduplication
  - [ ] Error handling
- [ ] Implement `ModuleLoader` component:
  - [ ] Dynamic remote loading
  - [ ] Props injection for auth state
  - [ ] Error boundaries
  - [ ] Loading states
- [ ] Test module loading in development mode

### 2.5 Routing Setup
- [ ] Configure React Router
- [ ] Set up routes:
  - [ ] `/login` - Login page
  - [ ] `/login/callback` - Okta callback
  - [ ] `/unauthorized` - Access denied
  - [ ] `/trade-plans/*` - Trade Plans module
  - [ ] `/client-verification/*` - Client Verification module
  - [ ] `/annuity-sales/*` - Annuity Sales module
- [ ] Integrate `SecureRoute` with routing
- [ ] Test routing and navigation

## Phase 3: Remote Module Implementation (Week 3-5)

### 3.1 Trade Plans Module
- [ ] Initialize repository with Vite + React + TypeScript
- [ ] Configure Module Federation
- [ ] Create `App.tsx` accepting props from portal
- [ ] Implement basic components:
  - [ ] `TradeList` component
  - [ ] `TradeForm` component
  - [ ] `TradeAnalytics` component
- [ ] Create MobX stores:
  - [ ] `TradeStore`
  - [ ] `StrategyStore`
- [ ] Implement routing within module
- [ ] Add role-based features:
  - [ ] View trades (trade-planners, traders, admins)
  - [ ] Create/edit trades (traders, admins)
  - [ ] Delete trades (admins only)
  - [ ] Advanced analytics (admins only)
- [ ] Test standalone mode
- [ ] Test federated mode with portal

### 3.2 Client Verification Module
- [ ] Initialize repository
- [ ] Configure Module Federation
- [ ] Create `App.tsx` accepting props
- [ ] Implement components:
  - [ ] `VerificationQueue` component
  - [ ] `ClientProfile` component
  - [ ] `DocumentUpload` component
  - [ ] `ComplianceChecklist` component
- [ ] Create MobX stores:
  - [ ] `VerificationStore`
  - [ ] `DocumentStore`
- [ ] Implement routing
- [ ] Add role-based features:
  - [ ] View queue (compliance-officers, kyc-specialists, admins)
  - [ ] Process verification (compliance-officers, kyc-specialists, admins)
  - [ ] Override decisions (admins only)
  - [ ] Bulk actions (admins only)
- [ ] Test standalone and federated modes

### 3.3 Annuity Sales Module
- [ ] Initialize repository
- [ ] Configure Module Federation
- [ ] Create `App.tsx` accepting props
- [ ] Implement components:
  - [ ] `ProductCatalog` component
  - [ ] `QuoteCalculator` component
  - [ ] `ApplicationForm` component
  - [ ] `SalesReports` component
- [ ] Create MobX stores:
  - [ ] `AnnuityStore`
  - [ ] `QuoteStore`
  - [ ] `SalesStore`
- [ ] Implement routing
- [ ] Add role-based features:
  - [ ] View products (sales-agents, sales-managers, admins)
  - [ ] Create quotes (sales-agents, sales-managers, admins)
  - [ ] Submit applications (sales-agents, sales-managers, admins)
  - [ ] View all sales (sales-managers, admins)
  - [ ] Commission reports (sales-managers, admins)
- [ ] Test standalone and federated modes

## Phase 4: API Integration (Week 5-6)

### 4.1 API Client Setup
- [ ] Create `apiClient.ts` with axios
- [ ] Implement request interceptor for token injection
- [ ] Implement response interceptor for error handling
- [ ] Add token refresh logic on 401
- [ ] Add request/response logging (dev mode)
- [ ] Implement retry logic for transient failures

### 4.2 API Services
- [ ] Create API service layer for each module
- [ ] Implement type-safe API calls
- [ ] Add error handling
- [ ] Integrate with MobX stores
- [ ] Test API integration

## Phase 5: Testing & Quality (Week 6-7)

### 5.1 Unit Testing
- [ ] Set up React Testing Library
- [ ] Write tests for stores
- [ ] Write tests for utilities
- [ ] Write tests for components
- [ ] Set up test coverage reporting

### 5.2 Integration Testing
- [ ] Test authentication flow
- [ ] Test module loading
- [ ] Test routing
- [ ] Test props injection
- [ ] Test error handling

### 5.3 E2E Testing
- [ ] Set up Playwright or Cypress
- [ ] Create E2E test structure
- [ ] Write E2E tests for critical flows
- [ ] Set up CI/CD for E2E tests

## Phase 6: Deployment Setup (Week 7-8)

### 6.1 AWS Infrastructure
- [ ] Create S3 bucket
- [ ] Configure bucket policy
- [ ] Set up CloudFront distribution
- [ ] Configure CORS
- [ ] Set up initial `manifest.json` in S3

### 6.2 CI/CD Pipelines
- [ ] Set up GitHub Actions for portal
- [ ] Set up GitHub Actions for each remote module
- [ ] Configure AWS credentials
- [ ] Implement deployment scripts
- [ ] Add manifest update steps
- [ ] Configure CloudFront invalidation
- [ ] Test deployment pipelines

### 6.3 Environment Configuration
- [ ] Set up environment variables
- [ ] Configure Okta for production
- [ ] Set up API endpoints
- [ ] Configure CDN URLs
- [ ] Document environment setup

## Phase 7: Polish & Documentation (Week 8-9)

### 7.1 UI/UX Polish
- [ ] Apply design system consistently
- [ ] Add loading states
- [ ] Add skeleton screens
- [ ] Improve error messages
- [ ] Add animations and transitions
- [ ] Test responsive design
- [ ] Accessibility audit

### 7.2 Documentation
- [ ] Create README for each repository
- [ ] Document Okta group setup
- [ ] Create deployment runbook
- [ ] Document troubleshooting steps
- [ ] Create developer onboarding guide
- [ ] Document API endpoints

### 7.3 Performance Optimization
- [ ] Optimize bundle sizes
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Add caching strategies
- [ ] Performance testing
- [ ] Lighthouse audits

## Phase 8: Security & Compliance (Week 9-10)

### 8.1 Security Review
- [ ] Security audit
- [ ] Review token storage
- [ ] Review CORS configuration
- [ ] Review CSP headers
- [ ] Penetration testing (if required)

### 8.2 Compliance
- [ ] Audit logging implementation
- [ ] Data export functionality
- [ ] Session timeout handling
- [ ] Privacy policy compliance
- [ ] GDPR compliance (if applicable)

## Immediate Next Steps (This Week)

### Priority 1: Set Up Portal Repository
1. Create `portal-repo` repository
2. Initialize with Vite + React + TypeScript
3. Install core dependencies
4. Set up basic project structure
5. Configure Tailwind CSS

### Priority 2: Implement Authentication
1. Set up Okta application
2. Create `AuthStore` with MobX
3. Implement `SecureRoute` component
4. Test authentication flow

### Priority 3: Create First Remote Module
1. Create `trade-plans-repo` repository
2. Set up Module Federation
3. Create basic `App.tsx` component
4. Test module loading from portal

## Recommended Order

1. **Start with Portal** - Get authentication and layout working first
2. **Create One Remote** - Build Trade Plans module as proof of concept
3. **Test Integration** - Ensure portal and remote work together
4. **Build Remaining Remotes** - Use Trade Plans as template
5. **Add API Integration** - Connect to backend services
6. **Deploy to Staging** - Test deployment process
7. **Polish & Optimize** - Refine UI and performance
8. **Deploy to Production** - Final deployment

## Quick Start Commands

### Monorepo Setup
```bash
# Initialize monorepo
mkdir react-federation && cd react-federation
pnpm init

# Create workspace config
echo "packages:\n  - 'packages/*'" > pnpm-workspace.yaml

# Create package structure
mkdir -p packages/{portal,trade-plans,client-verification,annuity-sales,shared}

# Initialize each package
cd packages/portal && pnpm create vite . -- --template react-ts
cd ../trade-plans && pnpm create vite . -- --template react-ts
cd ../client-verification && pnpm create vite . -- --template react-ts
cd ../annuity-sales && pnpm create vite . -- --template react-ts

# Install dependencies from root
cd ../..
pnpm install

# Install shared dependencies
pnpm add -w -D typescript @types/node
pnpm --filter portal add mobx mobx-react-lite react-router-dom @okta/okta-react @okta/okta-auth-js @originjs/vite-plugin-federation
pnpm --filter portal add -D tailwindcss postcss autoprefixer
pnpm --filter trade-plans add mobx mobx-react-lite react-router-dom @originjs/vite-plugin-federation
pnpm --filter trade-plans add -D tailwindcss postcss autoprefixer

# Install MSW for mocking
pnpm --filter portal add -D msw

# Run all dev servers
pnpm dev
```

**See**: [Monorepo Setup Guide](./monorepo-setup.md) and [Mocking Guide](./mocking-guide.md) for detailed instructions

## Resources

- [Development Guide](./development-guide.md)
- [Architecture Overview](./architecture-overview.md)
- [Module Federation Guide](./module-federation-guide.md)
- [ADRs](./adr/README.md)

## Questions to Answer Before Starting

1. **Package Manager**: Which package manager do you prefer? (pnpm recommended)
2. **Mocking**: Will you use mocks initially? (Recommended for POC)
3. **Team Structure**: How many developers will work on this? (affects monorepo vs multi-repo)
4. **Timeline**: What's the target launch date? (affects prioritization)
5. **Infrastructure**: Do you have AWS access and permissions set up? (needed for deployment)

## Success Criteria

You're ready to move to the next phase when:
- ✅ Monorepo is set up and running locally
- ✅ Portal package is set up and running
- ✅ Authentication works (can login with mock Okta)
- ✅ At least one remote module loads successfully
- ✅ Props injection works (remote receives auth state)
- ✅ Basic routing works
- ✅ Mock API is working (MSW handlers responding)
- ✅ Development environment is documented

---

**Last Updated**: 2024

