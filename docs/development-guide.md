# Development Guide

## Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Git** for version control
- **Okta Developer Account** (for authentication)
- **Code Editor** (VS Code recommended)

## Repository Setup

### 1. Clone the Monorepo

```bash
git clone <git@github.com:your-org/react-federation.git>
cd react-federation
```

### 2. Install Dependencies Once

```bash
pnpm install
```

pnpm will bootstrap every workspace package (`portal`, `trade-plans`, `client-verification`, `annuity-sales`, `shared`) in a single pass.

## Environment Configuration

### Portal (packages/portal)

```env
VITE_OKTA_CLIENT_ID=your_client_id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MANIFEST_URL=http://localhost:8080/manifest.json
VITE_APP_NAME=Financial Services Portal
```

### Remote Modules (packages/*)

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Local Development Setup

### Build Remote Modules (First Time)

**Important**: Remote modules must be built before they can be loaded by the portal:

```bash
# Build all remotes
pnpm --filter trade-plans build
pnpm --filter client-verification build
pnpm --filter annuity-sales build

# Or build all at once
pnpm --recursive --filter "./packages/*" build
```

**Why?** Remote modules use `vite preview` to serve their built `dist` folders (where `remoteEntry.js` is generated). `vite dev` doesn't serve the `dist` folder.

### Run All Packages

```bash
# From repo root
pnpm dev
```

This spawns the portal and all remotes in parallel:
- **Portal**: Runs via `vite dev` (http://localhost:5173)
- **Remotes**: Run via `vite preview` (serves built `dist` folders)

### Run Individual Packages

```bash
pnpm dev:portal               # http://localhost:5173 (vite dev)
pnpm dev:trade-plans          # http://localhost:5001 (vite preview)
pnpm dev:client-verification  # http://localhost:5002 (vite preview)
pnpm dev:annuity-sales        # http://localhost:5003 (vite preview)
```

**Note**: After making changes to remote modules, rebuild them:
```bash
pnpm --filter <remote-name> build
# The preview server will automatically serve the updated build
```

Each remote can run standalone (great for focused development) or alongside the portal for integration testing.

## Development Workflow

### 1. Starting Development

1. Start the dev servers (`pnpm dev` or the individual commands above)
2. Open the portal at `http://localhost:5173`
3. Sign in with a mock user (`admin@example.com`, `trader@example.com`, etc.)
4. Navigate between `/trade-plans`, `/client-verification`, and `/annuity-sales`

### 2. Making Changes

**Portal Changes**: Hot module replacement works automatically - changes reflect immediately.

**Remote Changes**: 
- After editing a remote module, rebuild it: `pnpm --filter <remote-name> build`
- The `vite preview` server will automatically serve the updated build
- Refresh the portal to see changes

**Note**: Remote modules use `vite preview` (not `vite dev`) because they need to serve the built `dist` folder where `remoteEntry.js` is located.

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

1. Create a new folder under `packages/`
2. Scaffold with `pnpm create vite` (React + TS template) and install shadcn/Tailwind if needed
3. Configure Module Federation in the new package's `vite.config.ts`
4. Add the package name to `pnpm-workspace.yaml`
5. Register dev URLs in `packages/portal/vite.config.ts`
6. Publish the remote bundle and update the CDN `manifest.json`
7. Add routing + navigation in the portal (Layout sidebar, `App.tsx`)

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

