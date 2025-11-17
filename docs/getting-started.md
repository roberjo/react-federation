# Quick Start Guide

Get up and running with the Enterprise Portal in 5 minutes.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ ([Install](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd react-federation
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all packages in the monorepo.

### 3. Set Up Environment Variables

Create `.env` files for each package:

```bash
# Portal
cp packages/portal/.env.example packages/portal/.env

# Or use the script
.\scripts\create-env-examples.ps1
```

### 4. Start Development Servers

```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:portal              # Portal: http://localhost:5173
pnpm dev:trade-plans         # Trade Plans: http://localhost:5001
pnpm dev:client-verification # Client Verification: http://localhost:5002
pnpm dev:annuity-sales       # Annuity Sales: http://localhost:5003
```

### 5. Access the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign In"
3. Enter a test email:
   - `admin@example.com` - Full access
   - `trader@example.com` - Trade Plans access
   - `compliance@example.com` - Client Verification access
   - `sales@example.com` - Annuity Sales access

## What's Next?

### For Developers

1. **Read the [Development Guide](./development-guide.md)** - Complete development workflow
2. **Review [Architecture Overview](./architecture-overview.md)** - Understand the system
3. **Check [Module Federation Guide](./module-federation-guide.md)** - Technical details

### For Quick Tasks

- **Run tests**: `pnpm test`
- **Lint code**: `pnpm lint`
- **Build**: `pnpm build`
- **View E2E tests**: `pnpm test:e2e:ui`

## Common Commands

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm dev:portal            # Start portal only

# Testing
pnpm test                  # Run all tests
pnpm test:portal          # Run portal tests
pnpm test:e2e            # Run E2E tests
pnpm test:coverage       # Generate coverage report

# Building
pnpm build                # Build all packages
pnpm build:portal         # Build portal only

# Code Quality
pnpm lint                 # Lint all packages
pnpm lint:fix            # Fix linting issues

# Cleanup
pnpm clean               # Remove build artifacts
```

## Project Structure

```
react-federation/
├── packages/
│   ├── portal/              # Main host application
│   ├── trade-plans/         # Trade Plans remote module
│   ├── client-verification/ # Client Verification remote module
│   ├── annuity-sales/      # Annuity Sales remote module
│   └── shared/             # Shared types and utilities
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── .github/                # CI/CD workflows
```

## Troubleshooting

### Port Already in Use

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Or change port in vite.config.ts
```

### Module Not Loading

1. Ensure remote dev server is running
2. Check browser console for errors
3. Verify CORS is enabled in remote vite.config.ts
4. Check Network tab for remoteEntry.js request

### Authentication Issues

1. Check browser console for errors
2. Verify localStorage has `mockAuth` entry
3. Check environment variables are set correctly

**Need more help?** Check the [Troubleshooting Guide](./troubleshooting-guide.md)

## Next Steps

- 📖 [Development Guide](./development-guide.md) - Complete development workflow
- 🏗️ [Architecture Overview](./architecture-overview.md) - System architecture
- 🔧 [Module Federation Guide](./module-federation-guide.md) - Technical details
- 🧪 [Testing Guide](./testing-guide.md) - Testing strategies
- 🚀 [Deployment Guide](./deployment-guide.md) - Production deployment

---

**Ready to start developing?** Head to the [Development Guide](./development-guide.md)!

