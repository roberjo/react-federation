# Local Development Guide

This guide explains how to run the project locally without an actual Okta OAuth 2.0 setup.

## Quick Start

### 1. Install Dependencies

```powershell
pnpm install
```

### 2. Run Development Servers

```powershell
# Run all packages (portal + remotes) in parallel
pnpm dev

# Or run individually
pnpm dev:portal          # Portal on http://localhost:5173
pnpm dev:trade-plans      # Trade Plans on http://localhost:5001
pnpm dev:client-verification  # Client Verification on http://localhost:5002
pnpm dev:annuity-sales    # Annuity Sales on http://localhost:5003
```

### 3. Access the Portal

Open your browser to: **http://localhost:5173**

## Mock Authentication

The project uses **mock Okta authentication** by default in development mode. No actual Okta setup is required!

### How It Works

- Mock authentication is **automatically enabled** in development (`import.meta.env.DEV`)
- You can also explicitly enable it by setting `VITE_USE_MOCK_AUTH=true` in `.env`
- When you click "Sign In", a prompt will appear asking for an email address

### Test Users

The following test users are available:

| Email | Groups | Derived Roles | Access |
|-------|--------|---------------|--------|
| `trader@example.com` | `trade-planners` | `trader` | Trade Plans module only |
| `compliance@example.com` | `compliance-officers` | `compliance-officer` | Client Verification module only |
| `sales@example.com` | `sales-agents` | `sales-agent` | Annuity Sales module only |
| `admin@example.com` | `admins` | `admin` | All modules |
| `multi-role@example.com` | `trade-planners`, `compliance-officers` | `trader`, `compliance-officer` | Trade Plans + Client Verification |

### Login Flow

1. Navigate to http://localhost:5173
2. Click "Continue to Demo" (or "Sign in with Okta" in mock mode)
3. A prompt will appear asking for an email address
4. Enter one of the test emails above
5. You'll be redirected to the dashboard with appropriate module access

## Environment Variables

### Optional: Create `.env` File

You can create a `.env` file in `packages/portal/` to configure mock mode explicitly:

```env
# Enable mock authentication (already enabled by default in dev mode)
VITE_USE_MOCK_AUTH=true

# Enable mock API (optional)
VITE_USE_MOCK_API=true
```

**Note:** Mock authentication is enabled automatically in development mode, so you don't need to create this file unless you want to explicitly control it.

## Understanding Mock Authentication

### Mock JWT Token

The mock service generates JWT tokens with:
- **Groups** from the test user (e.g., `['trade-planners']`)
- **No roles** - roles are derived from groups using `GROUP_TO_ROLE_MAP`

Example JWT payload:
```json
{
  "sub": "1",
  "email": "trader@example.com",
  "name": "John Trader",
  "groups": ["trade-planners"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Role Derivation

Groups are mapped to roles using `GROUP_TO_ROLE_MAP`:

```typescript
// packages/portal/src/config/oktaConfig.ts
export const GROUP_TO_ROLE_MAP = {
  'trade-planners': ['trader'],
  'compliance-officers': ['compliance-officer'],
  'sales-agents': ['sales-agent'],
  'admins': ['admin'],
}
```

### Example: Trader User

1. **JWT contains:** `groups: ['trade-planners']`
2. **Derived roles:** `['trader']`
3. **Module access:** Trade Plans only (has `trader` role)

## Testing Different User Scenarios

### Test Single Module Access

1. Login as `trader@example.com`
2. You should see:
   - ✅ Dashboard
   - ✅ Trade Plans (in sidebar and dashboard)
   - ❌ Client Verification (hidden)
   - ❌ Annuity Sales (hidden)

### Test Admin Access

1. Login as `admin@example.com`
2. You should see:
   - ✅ Dashboard
   - ✅ Trade Plans
   - ✅ Client Verification
   - ✅ Annuity Sales

### Test Multi-Role Access

1. Login as `multi-role@example.com`
2. You should see:
   - ✅ Dashboard
   - ✅ Trade Plans (has `trader` role)
   - ✅ Client Verification (has `compliance-officer` role)
   - ❌ Annuity Sales (no `sales-agent` role)

## Module Federation

### How Remotes Load

1. Portal loads at http://localhost:5173
2. When you navigate to a module (e.g., Trade Plans):
   - Portal fetches the remote module from its dev server
   - Remote module receives auth props (groups + derived roles) from portal
   - Remote module uses roles for internal authorization

### Development URLs

- **Portal:** http://localhost:5173 (host)
- **Trade Plans:** http://localhost:5001 (remote)
- **Client Verification:** http://localhost:5002 (remote)
- **Annuity Sales:** http://localhost:5003 (remote)

### Remote Module Access

When you access a remote module:
- Portal checks if you have required roles
- If authorized, portal loads the remote module
- Remote receives auth props with groups and derived roles
- Remote can use roles for internal feature authorization

## Troubleshooting

### Mock Auth Not Working

1. **Check if you're in dev mode:**
   ```powershell
   # Make sure you're running dev mode
   pnpm dev:portal
   ```

2. **Check browser console** for errors

3. **Clear localStorage:**
   ```javascript
   // In browser console
   localStorage.removeItem('mockAuth')
   ```

4. **Verify mock service is loaded:**
   - Check `packages/portal/src/config/oktaConfig.ts`
   - Should use `mockOktaAuth` when `useMock` is true

### Remotes Not Loading

1. **Check all dev servers are running:**
   ```powershell
   # Run all in parallel
   pnpm dev
   ```

2. **Check remote URLs** in browser network tab

3. **Verify manifest.json** is accessible:
   - http://localhost:5173/manifest.json

### Roles Not Showing Correctly

1. **Check groups in JWT:**
   ```javascript
   // In browser console after login
   const token = localStorage.getItem('okta-token-storage')
   // Decode JWT to see groups
   ```

2. **Verify GROUP_TO_ROLE_MAP** matches your groups

3. **Check role derivation:**
   - Groups should map to roles in `GROUP_TO_ROLE_MAP`
   - Roles are derived in `AuthStore.loadUserData()`

## Switching to Real Okta

When you're ready to use real Okta:

1. **Create `.env` file** in `packages/portal/`:
   ```env
   VITE_USE_MOCK_AUTH=false
   VITE_OKTA_CLIENT_ID=your-client-id
   VITE_OKTA_ISSUER=https://your-okta-domain.okta.com/oauth2/default
   ```

2. **Configure Okta:**
   - Create groups: `trade-planners`, `compliance-officers`, `sales-agents`, `admins`
   - Assign users to groups
   - Configure Authorization Server to include groups in JWT claims

3. **Restart dev server:**
   ```powershell
   pnpm dev:portal
   ```

## Summary

✅ **Mock auth is enabled by default** in development  
✅ **No Okta setup required** for local development  
✅ **Test users available** with different role combinations  
✅ **Groups map to roles** automatically using `GROUP_TO_ROLE_MAP`  
✅ **Remotes receive roles** via props injection  

## Related Documentation

- [RBAC with JWT Roles Guide](./rbac-jwt-roles-guide.md) - How roles work
- [State Management Guide](./state-management-guide.md) - How auth flows to remotes
- [Getting Started Guide](./getting-started.md) - General project setup

---

**Last Updated:** 2024

