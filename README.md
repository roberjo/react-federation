# Enterprise Portal with Micro-Frontend Architecture

A production-ready enterprise portal application using React 18, Vite, MobX, and Module Federation with independently deployable sub-applications.

## 🏗️ Architecture

This project uses a **monorepo architecture** for initial development and proof of concept. The monorepo contains:

- **Portal** - Main shell application with authentication and module loading
- **Trade Plans** - Remote module for trade management
- **Client Verification** - Remote module for client verification (coming soon)
- **Annuity Sales** - Remote module for annuity sales (coming soon)
- **Shared** - Shared TypeScript types and utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+ (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Run all development servers
pnpm dev

# Or run specific packages
pnpm dev:portal
pnpm dev:trade-plans
```

### Development URLs

- Portal: http://localhost:5173
- Trade Plans: http://localhost:5001
- Client Verification: http://localhost:5002 (coming soon)
- Annuity Sales: http://localhost:5003 (coming soon)

## 🔐 Authentication

The portal uses **mock Okta authentication** for development. You can login with these test accounts:

- `trader@example.com` - Access to Trade Plans
- `compliance@example.com` - Access to Client Verification
- `sales@example.com` - Access to Annuity Sales
- `admin@example.com` - Access to all modules

When you click "Sign In", a prompt will appear asking for an email address.

## 📦 Project Structure

```
react-federation/
├── packages/
│   ├── portal/              # Main shell application
│   ├── trade-plans/         # Trade Plans remote module
│   ├── client-verification/  # Client Verification remote module (coming soon)
│   ├── annuity-sales/       # Annuity Sales remote module (coming soon)
│   └── shared/              # Shared types and utilities
├── docs/                    # Documentation
└── package.json             # Root package.json
```

## 🛠️ Development

### Mock Services

- **Okta Auth**: Mocked for development (see `packages/portal/src/services/mockOktaService.ts`)
- **API Services**: Mocked using MSW (Mock Service Worker) (see `packages/portal/src/mocks/handlers.ts`)

### Testing

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Test Coverage**: 29 tests passing
- **Run Tests**: `pnpm test`
- **Test Coverage**: `pnpm test:coverage`
- **E2E Tests**: `pnpm test:e2e`

See [Testing Guide](./docs/testing-guide.md) for details.

### Environment Variables

Create `.env` files in each package (see `.env.example`):

```env
VITE_USE_MOCK_AUTH=true
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Architecture Overview](./docs/architecture-overview.md)
- [Development Guide](./docs/development-guide.md)
- [Monorepo Setup](./docs/monorepo-setup.md)
- [Mocking Guide](./docs/mocking-guide.md)
- [Module Federation Guide](./docs/module-federation-guide.md)
- [ADRs](./docs/adr/README.md)

## 🎯 Current Status

### ✅ Completed

- [x] Monorepo structure setup
- [x] Shared package with types
- [x] Portal package with authentication
- [x] Mock Okta service
- [x] MSW API mocking
- [x] AuthStore with MobX
- [x] ModuleLoader component
- [x] Trade Plans remote module
- [x] Props injection for auth state
- [x] Testing infrastructure (Vitest, React Testing Library, Playwright)
- [x] Unit tests (29 tests passing)
- [x] E2E test setup

### 🚧 In Progress

- [ ] Client Verification module
- [ ] Annuity Sales module
- [ ] Layout components (Sidebar, Header)
- [ ] Enhanced UI components
- [ ] Additional test coverage

### 📋 Planned

- [ ] Additional remote modules
- [ ] Production deployment setup
- [ ] Testing infrastructure
- [ ] CI/CD pipelines

## 🤝 Contributing

See [Development Guide](./docs/development-guide.md) for contribution guidelines.

## 📄 License

See [LICENSE](./LICENSE) file.
