# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Set Up Environment Variables

Create `.env` file in `packages/portal/`:

```bash
cd packages/portal
cp .env.example .env
```

The `.env` file should contain:
```env
VITE_USE_MOCK_AUTH=true
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Run Development Servers

From the root directory:

```bash
# Run all dev servers in parallel
pnpm dev

# Or run individually
pnpm dev:portal        # Portal on http://localhost:5173
pnpm dev:trade-plans   # Trade Plans on http://localhost:5001
```

### 4. Access the Application

1. Open http://localhost:5173 in your browser
2. Click "Sign In"
3. Enter one of these test emails:
   - `admin@example.com` - Full access to all modules
   - `trader@example.com` - Access to Trade Plans
   - `compliance@example.com` - Access to Client Verification (when implemented)
   - `sales@example.com` - Access to Annuity Sales (when implemented)

### 5. Test Module Federation

1. After logging in, navigate to `/trade-plans`
2. The Trade Plans module should load from `http://localhost:5001`
3. Verify that the module receives auth props and displays user information

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Kill process on port 5173 (portal)
lsof -ti:5173 | xargs kill -9

# Kill process on port 5001 (trade-plans)
lsof -ti:5001 | xargs kill -9
```

### Module Not Loading

1. Ensure Trade Plans dev server is running: `pnpm dev:trade-plans`
2. Check browser console for errors
3. Verify CORS is enabled in Trade Plans vite.config.ts
4. Check that `remoteEntry.js` is accessible at http://localhost:5001/assets/remoteEntry.js

### Authentication Not Working

1. Check browser console for errors
2. Verify localStorage has `mockAuth` entry
3. Try clearing localStorage and logging in again
4. Check that MSW is initialized (should see MSW message in console)

## Next Steps

After setup is complete:

1. Review [Progress](./progress.md) to see what's implemented
2. Check [Next Steps](./next-steps.md) for what to build next
3. Read [Development Guide](./development-guide.md) for development workflow

## Development Workflow

1. Make changes to portal: `packages/portal/src/`
2. Make changes to Trade Plans: `packages/trade-plans/src/`
3. Changes hot-reload automatically
4. Test in both standalone and federated modes

## Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:portal
pnpm build:trade-plans
```

---

**Need Help?** Check the [Troubleshooting Guide](./troubleshooting-guide.md)

