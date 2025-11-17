# Enterprise Portal with Micro-Frontend Architecture

A production-ready enterprise portal application using React 18, Vite, MobX, and Module Federation with independently deployable sub-applications.

## 🏗️ Architecture

This project uses a **pnpm monorepo** for the portal shell and all remotes:

- **Portal** – Main host application with authentication, layout, and Module Federation integration
- **Trade Plans** – Remote module for trade strategy management
- **Client Verification** – Remote module for KYC queue and escalation workflows
- **Annuity Sales** – Remote module for annuity pipeline tracking
- **Shared** – Shared TypeScript types and utilities consumed by the host and remotes

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
- Client Verification: http://localhost:5002
- Annuity Sales: http://localhost:5003

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
│   ├── portal/              # Host shell application
│   ├── trade-plans/         # Remote module: trade management
│   ├── client-verification/ # Remote module: KYC queue
│   ├── annuity-sales/       # Remote module: annuity pipeline
│   └── shared/              # Shared types and utilities
├── docs/                    # Documentation
└── package.json             # Root package.json
```

## 🛠️ Development

- **Mock Services**  
  - Mock Okta auth (`packages/portal/src/services/mockOktaService.ts`)  
  - MSW handlers for data APIs (`packages/portal/src/mocks/handlers.ts`)

- **Testing Commands**  
  - `pnpm test:portal` – Portal unit tests (Vitest + RTL)  
  - `pnpm --filter trade-plans test` – Trade Plans unit tests  
  - `pnpm --filter client-verification test` – Client Verification tests  
  - `pnpm --filter annuity-sales test` – Annuity Sales tests  
  - `pnpm test:e2e` – Playwright E2E smoke tests  
  - `pnpm build` – Type-check + production build for host and remotes

See [Testing Guide](./docs/testing-guide.md) for details.

### Environment Variables

Create `.env` files in each package. Example files can be created using:

```powershell
# Run the script to create .env.example files
.\scripts\create-env-examples.ps1

# Then copy to .env in each package
cp packages/portal/.env.example packages/portal/.env
```

Or manually create `.env` files with:

```env
VITE_USE_MOCK_AUTH=true
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### 🚀 Getting Started
- **[Quick Start Guide](./docs/getting-started.md)** - Get up and running in 5 minutes
- **[Documentation Index](./docs/README.md)** - Complete documentation navigation

### 🏗️ Core Guides
- **[Architecture Overview](./docs/architecture-overview.md)** - System architecture with diagrams
- **[Development Guide](./docs/development-guide.md)** - Complete development workflow
- **[Module Federation Guide](./docs/module-federation-guide.md)** - Technical deep dive
- **[Testing Guide](./docs/testing-guide.md)** - Testing strategies and examples

### 📖 Reference
- **[Configuration Reference](./docs/configuration-reference.md)** - All configuration options
- **[Glossary](./docs/glossary.md)** - Terms and concepts
- **[Architecture Decision Records](./docs/adr/README.md)** - Key architectural decisions

### 🔧 Additional Guides
- [Monorepo Setup](./docs/monorepo-setup.md)
- [Mocking Guide](./docs/mocking-guide.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Security & Authentication](./docs/security-authentication-guide.md)
- [Troubleshooting Guide](./docs/troubleshooting-guide.md)

## 🎯 Current Status

### ✅ Completed

- [x] pnpm workspace and shared build pipeline
- [x] Shared types package (auth, trade, verification, annuity)
- [x] Portal host with authentication, layout Shell, and ModuleLoader
- [x] Mock Okta + MSW service layer
- [x] Shadcn/Tailwind design system migration
- [x] Trade Plans remote (strategy dashboard)
- [x] Client Verification remote (KYC queue)
- [x] Annuity Sales remote (pipeline dashboard)
- [x] Sample CDN manifest and runtime manifest service
- [x] Unit tests across host and all remotes (35 total)
- [x] Production build validated for host/remotes

### 📋 Next

- [ ] Expand client verification flows (document intake, audit trail)
- [ ] Extend annuity workflows (quote creation, revenue forecast charts)
- [ ] Add portal E2E coverage for multi-remote navigation
- [ ] Wire CI/CD to publish manifest and remote bundles

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [Development Guide](./docs/development-guide.md) for contribution guidelines.

## 📄 License

See [LICENSE](./LICENSE) file.
