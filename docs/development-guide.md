# Development Guide

## Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Git** for version control
- **Okta Developer Account** (for authentication)
- **Code Editor** (VS Code recommended)

## Repository Setup

### 1. Clone All Repositories

```bash
# Clone portal repository
git clone <portal-repo-url>
cd portal-repo

# Clone remote module repositories
git clone <trade-plans-repo-url> ../trade-plans-repo
git clone <client-verification-repo-url> ../client-verification-repo
git clone <annuity-sales-repo-url> ../annuity-sales-repo

# Optional: Clone shared types repository
git clone <shared-types-repo-url> ../shared-types-repo
```

### 2. Install Dependencies

Install dependencies in each repository:

```bash
# Portal
cd portal-repo
npm install

# Trade Plans
cd ../trade-plans-repo
npm install

# Client Verification
cd ../client-verification-repo
npm install

# Annuity Sales
cd ../annuity-sales-repo
npm install

# Shared Types (if using npm package)
cd ../shared-types-repo
npm install
npm run build
npm link  # Link locally for development
```

### 3. Link Shared Types (If Using Local Development)

If using shared types as a local package:

```bash
# In shared-types-repo
npm link

# In each consuming repository
npm link @your-org/shared-types
```

## Environment Configuration

### Portal Repository

Create `.env` file in `portal-repo/`:

```env
VITE_OKTA_CLIENT_ID=your_client_id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MANIFEST_URL=http://localhost:8080/manifest.json
VITE_APP_NAME=Financial Services Portal
```

### Remote Module Repositories

Create `.env` file in each remote repository:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Local Development Setup

### Option 1: Run All Services Manually

#### Terminal 1: Portal
```bash
cd portal-repo
npm run dev
# Portal runs on http://localhost:5173
```

#### Terminal 2: Trade Plans
```bash
cd trade-plans-repo
npm run dev
# Trade Plans runs on http://localhost:5001
```

#### Terminal 3: Client Verification
```bash
cd client-verification-repo
npm run dev
# Client Verification runs on http://localhost:5002
```

#### Terminal 4: Annuity Sales
```bash
cd annuity-sales-repo
npm run dev
# Annuity Sales runs on http://localhost:5003
```

### Option 2: Use Concurrently (Recommended)

Create a root `package.json` in a parent directory:

```json
{
  "name": "portal-workspace",
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:portal": "cd portal-repo && npm run dev",
    "dev:trade-plans": "cd trade-plans-repo && npm run dev",
    "dev:client-verification": "cd client-verification-repo && npm run dev",
    "dev:annuity-sales": "cd annuity-sales-repo && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

Then run:
```bash
npm install
npm run dev
```

### Option 3: Use Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  portal:
    build: ./portal-repo
    ports:
      - "5173:5173"
    volumes:
      - ./portal-repo:/app
    environment:
      - VITE_OKTA_CLIENT_ID=${OKTA_CLIENT_ID}
      - VITE_OKTA_ISSUER=${OKTA_ISSUER}

  trade-plans:
    build: ./trade-plans-repo
    ports:
      - "5001:5001"
    volumes:
      - ./trade-plans-repo:/app

  client-verification:
    build: ./client-verification-repo
    ports:
      - "5002:5002"
    volumes:
      - ./client-verification-repo:/app

  annuity-sales:
    build: ./annuity-sales-repo
    ports:
      - "5003:5003"
    volumes:
      - ./annuity-sales-repo:/app
```

## Development Workflow

### 1. Starting Development

1. Start all remote modules first (they need to be running for portal to load them)
2. Start portal application
3. Open browser to `http://localhost:5173`
4. Login with Okta credentials

### 2. Making Changes

#### Portal Changes
- Edit files in `portal-repo/src/`
- Changes hot-reload automatically
- Test authentication and module loading

#### Remote Module Changes
- Edit files in respective remote repository
- Changes hot-reload in standalone mode
- Changes also hot-reload when loaded in portal (if HMR configured)

### 3. Testing Module Federation

1. **Standalone Mode**: Each remote can run independently
   - Access directly: `http://localhost:5001`
   - Test module in isolation

2. **Federated Mode**: Load module through portal
   - Access via portal: `http://localhost:5173/trade-plans`
   - Test integration with portal

### 4. Debugging

#### Browser DevTools
- **Network Tab**: Check remoteEntry.js loading
- **Console**: Check for module federation errors
- **Application Tab**: Check localStorage for tokens

#### VS Code Debugging
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Portal",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/portal-repo"
    }
  ]
}
```

## Code Organization

### Portal Repository Structure

```
portal-repo/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Layout/       # Layout components (Sidebar, Header)
│   │   ├── Auth/         # Auth components (SecureRoute, LoginCallback)
│   │   └── ErrorBoundary.tsx
│   ├── stores/           # MobX stores
│   │   ├── AuthStore.ts
│   │   ├── UserStore.ts
│   │   └── RootStore.ts
│   ├── services/         # API and external services
│   │   ├── oktaService.ts
│   │   ├── apiClient.ts
│   │   └── manifestService.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useStores.ts
│   ├── utils/            # Utility functions
│   │   ├── roleChecker.ts
│   │   └── claimsParser.ts
│   ├── config/           # Configuration files
│   │   └── oktaConfig.ts
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── vite.config.ts        # Vite configuration
```

### Remote Module Structure

```
remote-repo/
├── src/
│   ├── components/       # Module-specific components
│   ├── stores/          # Module-specific stores
│   ├── services/        # Module-specific API calls
│   ├── App.tsx          # Main module component (exposed)
│   ├── bootstrap.tsx    # Bootstrap for standalone mode
│   └── main.tsx         # Entry point
└── vite.config.ts
```

## TypeScript Configuration

### Shared Types Usage

If using shared types package:

```typescript
// In remote module
import { User, Trade, VerificationStatus } from '@your-org/shared-types'

// Use types
const user: User = { ... }
```

### Type Definitions

Each repository should have:
- `tsconfig.json` - TypeScript configuration
- `vite-env.d.ts` - Vite type definitions

## Testing

### Unit Tests

```bash
# Run tests in each repository
npm test
```

### Integration Tests

Test module federation integration:

```typescript
// portal-repo/src/__tests__/ModuleLoader.test.tsx
import { render, waitFor } from '@testing-library/react'
import { ModuleLoader } from '../components/ModuleLoader'

test('loads remote module', async () => {
  const { getByText } = render(
    <ModuleLoader scope="tradePlans" module="./App" />
  )
  await waitFor(() => {
    expect(getByText('Trade Plans')).toBeInTheDocument()
  })
})
```

### E2E Tests

Use Playwright or Cypress to test full user flows:

```typescript
// e2e/login.spec.ts
test('user can login and access modules', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('text=Login')
  // ... Okta login flow
  await page.waitForURL('**/trade-plans')
  expect(await page.textContent('h1')).toBe('Trade Plans')
})
```

## Common Development Tasks

### Adding a New Remote Module

1. Create new repository
2. Set up Vite + React + TypeScript
3. Configure Module Federation:
   ```typescript
   federation({
     name: 'newModule',
     filename: 'remoteEntry.js',
     exposes: {
       './App': './src/App.tsx',
     },
     shared: ['react', 'react-dom', 'mobx', 'mobx-react-lite', 'react-router-dom']
   })
   ```
4. Add to portal's vite.config.ts (dev mode)
5. Add to manifest.json (production)
6. Add route in portal
7. Add navigation item in sidebar

### Updating Shared Dependencies

When updating shared dependencies (React, MobX, etc.):

1. **Coordinate across repositories** - All must use same versions
2. Update in portal first
3. Update in all remote modules
4. Test integration thoroughly
5. Document version requirements

### Debugging Module Loading Issues

1. Check browser console for errors
2. Verify remote is running and accessible
3. Check Network tab for remoteEntry.js request
4. Verify CORS headers
5. Check manifest.json format
6. Verify user has required groups

## Best Practices

### Code Quality
- Use TypeScript strict mode
- Follow ESLint rules
- Format code with Prettier
- Write unit tests for stores and utilities
- Write integration tests for components

### Module Federation
- Keep shared dependencies in sync
- Test module loading in both dev and prod
- Handle loading errors gracefully
- Implement retry logic for failed loads

### State Management
- Keep portal state separate from remote state
- Pass necessary state as props
- Avoid global state pollution
- Use MobX observables for reactive updates

### Performance
- Lazy load modules
- Code split within modules
- Optimize bundle sizes
- Use React.memo for expensive components

## Troubleshooting

See [Troubleshooting Guide](./troubleshooting-guide.md) for common issues and solutions.

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Module Federation Guide](https://module-federation.github.io/)
- [MobX Documentation](https://mobx.js.org/)
- [Okta React SDK](https://github.com/okta/okta-react)

