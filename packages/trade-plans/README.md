# Trade Plans Module

A remote microfrontend module for managing Dollar Cost Averaging (DCA) trade plans for clients.

## Overview

The Trade Plans module enables financial advisors and traders to create, manage, and track automated investment plans using Dollar Cost Averaging (DCA) strategies. This module supports multiple securities, flexible allocation percentages, and various trade frequencies.

## Features

### Core Functionality

- **Trade Plan Management**
  - Create new DCA trade plans
  - View all trade plans in a comprehensive list
  - View detailed information for individual plans
  - Edit existing trade plans
  - Delete trade plans
  - Pause/resume active plans
  - Cancel plans

- **Dollar Cost Averaging (DCA)**
  - Set trade frequency (daily, weekly, bi-weekly, monthly, quarterly)
  - Configure trade amounts per execution
  - Set start and end dates (or open-ended plans)
  - Track total amount invested
  - Monitor trade execution history

- **Multi-Security Support**
  - Select multiple securities per plan
  - Configure allocation percentages per security
  - Visual allocation indicators
  - Support for stocks, ETFs, mutual funds, and bonds

- **Status Management**
  - Active plans (executing trades)
  - Paused plans (temporarily halted)
  - Completed plans (reached end date or total amount)
  - Cancelled plans

### Role-Based Access Control

- **Trader Role**: Can create, view, edit, pause, resume, and cancel trade plans
- **Admin Role**: Full access to all trade plan operations
- **View-Only**: Other authenticated users can view trade plans but cannot modify them

## Architecture

### Module Federation

This module is exposed as a remote module using Vite Module Federation:

```typescript
// vite.config.ts
federation({
  name: 'tradePlans',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true },
    mobx: { singleton: true },
  },
})
```

### State Management

Uses MobX for reactive state management:

- **TradePlanStore**: Manages trade plan data, API calls, and business logic
- Manual reactivity using MobX `reaction` (instead of `observer` wrapper) for Module Federation compatibility

### Routing

Internal routing handled by React Router v6:

- `/trade-plans` - List view (index route)
- `/trade-plans/create` - Create new trade plan
- `/trade-plans/:id` - View trade plan details
- `/trade-plans/:id/edit` - Edit existing trade plan

**Note**: Routes are relative to the portal's `/trade-plans/*` base path.

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build the module
pnpm build

# Run preview server (serves built dist folder)
pnpm dev
```

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Rebuild** the module: `pnpm build`
3. **Preview server** automatically serves the updated build
4. **Refresh** the portal to see changes

**Important**: This module uses `vite preview` (not `vite dev`) because it needs to serve the built `dist` folder where `remoteEntry.js` is generated.

### Project Structure

```
trade-plans/
├── src/
│   ├── components/
│   │   ├── TradePlanList.tsx      # List view with summary cards
│   │   ├── TradePlanDetail.tsx    # Detailed view of a single plan
│   │   └── TradePlanForm.tsx      # Create/edit form
│   ├── stores/
│   │   └── TradePlanStore.ts      # MobX store for state management
│   ├── App.tsx                     # Main component (exposed via federation)
│   └── main.tsx                    # Entry point (standalone mode)
├── dist/                           # Build output (contains remoteEntry.js)
├── vite.config.ts                  # Vite + Module Federation config
└── package.json
```

## API Integration

### Endpoints

The module expects the following API endpoints:

- `GET /api/trade-plans` - List all trade plans
- `GET /api/trade-plans/:id` - Get trade plan by ID
- `POST /api/trade-plans` - Create new trade plan
- `PUT /api/trade-plans/:id` - Update trade plan
- `DELETE /api/trade-plans/:id` - Delete trade plan

### Mock API

In development, the portal provides mock API handlers via MSW (Mock Service Worker). The module uses relative URLs (`/api/trade-plans`) so MSW can intercept requests.

### Authentication

The module receives authentication state via props injection from the portal:

```typescript
interface AppProps {
  auth?: {
    user?: { name: string; email: string }
    token?: string
    roles?: string[]
    hasRole?: (role: string) => boolean
    // ... other auth properties
  }
}
```

The auth token is automatically included in API requests via axios interceptors.

## Types

### TradePlan

```typescript
interface TradePlan {
  id: string
  clientId: string
  clientName: string
  name: string
  description?: string
  startDate: string // ISO date string
  endDate?: string // ISO date string (optional)
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
  tradeAmount: number // Dollar amount per trade
  totalAmount?: number // Total planned amount
  securities: Security[] // Multiple securities
  allocations: Record<string, number> // Symbol -> percentage (must sum to 100)
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  createdBy: string
  lastTradeDate?: string
  nextTradeDate?: string
  totalTradesExecuted?: number
  totalAmountInvested?: number
  autoExecute?: boolean
  minTradeAmount?: number
  maxTradeAmount?: number
}
```

See `packages/shared/src/types/trade.types.ts` for complete type definitions.

## Standalone Mode

The module can run standalone for development/testing:

```bash
# Build first
pnpm build

# Run preview server
pnpm dev

# Access at http://localhost:5001
```

In standalone mode, authentication props are optional. The module will work without auth, but API calls may fail without a valid token.

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Building for Production

```bash
# Build
pnpm build

# Output is in dist/
# - dist/assets/remoteEntry.js (federation entry point)
# - dist/assets/*.js (bundled code)
# - dist/index.html (standalone entry)
```

## Deployment

This module is deployed independently to a CDN:

1. **Build** the module: `pnpm build`
2. **Upload** `dist/` folder to CDN (e.g., S3)
3. **Update** manifest.json with new version and URL
4. Portal will automatically load the new version

See [Independent Deployment Guide](../../docs/independent-deployment-guide.md) for details.

## Dependencies

### Runtime Dependencies

- `react` - UI framework
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `mobx` - State management
- `axios` - HTTP client
- `lucide-react` - Icons
- `@federation/shared` - Shared types

### Shared Dependencies (via Federation)

- `react` - Shared singleton
- `react-dom` - Shared singleton
- `react-router-dom` - Shared singleton
- `mobx` - Shared singleton

**Note**: `mobx-react-lite` is NOT shared (each remote bundles its own copy) to avoid React null errors in Module Federation.

## Troubleshooting

### Module Not Loading

1. **Ensure module is built**: `pnpm build`
2. **Check preview server is running**: `pnpm dev`
3. **Verify remoteEntry.js is accessible**: `http://localhost:5001/assets/remoteEntry.js`
4. **Check browser console** for errors

### React Null Errors

If you see "Cannot read properties of null (reading 'useSyncExternalStore')":

- This module uses manual MobX reactivity (not `observer` wrapper)
- Components use `useState` + `reaction` for reactivity
- This avoids React null issues in Module Federation

### API Calls Failing

1. **Check auth token** is being passed via props
2. **Verify API base URL** is correct (uses relative `/api` for MSW)
3. **Check MSW is running** in portal (development mode)
4. **Verify CORS** settings if calling external API

## Related Documentation

- [Architecture Overview](../../docs/architecture-overview.md)
- [Module Federation Guide](../../docs/module-federation-guide.md)
- [Development Guide](../../docs/development-guide.md)
- [State Management Guide](../../docs/state-management-guide.md)
- [RBAC Guide](../../docs/rbac-jwt-roles-guide.md)

---

**Last Updated**: 2024

