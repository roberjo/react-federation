# Independent Deployment Guide

**Yes, you can build, version, package, and deploy each microfrontend package separately!** This is one of the key benefits of the Module Federation architecture.

## Overview

Each package in the monorepo can be:
- ✅ **Built independently** - Each package has its own build script
- ✅ **Versioned independently** - Each package has its own version in `package.json`
- ✅ **Packaged independently** - Each package produces its own bundle
- ✅ **Deployed independently** - Each package deploys to its own S3 path

## Current Setup

### Monorepo Structure

Currently, all packages are in a **single monorepo** but can still be deployed independently:

```
react-federation/
├── packages/
│   ├── portal/              # v1.0.0 - Deploys independently
│   ├── trade-plans/         # v1.0.0 - Deploys independently
│   ├── client-verification/ # v1.0.0 - Deploys independently
│   └── annuity-sales/       # v1.0.0 - Deploys independently
```

### Independent Versioning

Each package maintains its own version:

```json
// packages/portal/package.json
{
  "name": "portal",
  "version": "1.0.0"  // ← Independent version
}

// packages/trade-plans/package.json
{
  "name": "trade-plans",
  "version": "1.0.1"  // ← Different version, deployed independently
}
```

## Independent Deployment Workflow

### 1. Build Individual Package

```bash
# Build only portal
pnpm build:portal

# Build only trade-plans
pnpm build:trade-plans

# Build only client-verification
pnpm build:client-verification

# Build only annuity-sales
pnpm build:annuity-sales
```

### 2. Version Individual Package

```bash
# Navigate to package directory
cd packages/trade-plans

# Update version (patch, minor, or major)
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# Or manually edit package.json
```

### 3. Deploy Individual Package

Each package deploys to its own S3 path:

```bash
# Deploy trade-plans (example)
VERSION=$(node -p "require('./packages/trade-plans/package.json').version")
aws s3 sync packages/trade-plans/dist/ \
  s3://your-bucket/trade-plans/v${VERSION}/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Update current symlink
aws s3 sync packages/trade-plans/dist/ \
  s3://your-bucket/trade-plans/current/ \
  --delete \
  --cache-control "public, max-age=0, must-revalidate"
```

### 4. Update Manifest

After deploying, update the manifest so the portal knows about the new version:

```bash
# Fetch current manifest
aws s3 cp s3://your-bucket/manifest.json manifest-current.json

# Update manifest with new version
jq --arg module "tradePlans" \
   --arg version "$VERSION" \
   --arg url "https://cdn.example.com/trade-plans/$VERSION/assets/remoteEntry.js" \
   '.remotes[$module].version = $version | .remotes[$module].url = $url' \
   manifest-current.json > manifest-new.json

# Upload updated manifest
aws s3 cp manifest-new.json s3://your-bucket/manifest.json \
  --content-type "application/json" \
  --cache-control "no-cache, no-store, must-revalidate"

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/manifest.json" "/trade-plans/*"
```

## CI/CD for Independent Deployment

### Option 1: Monorepo with Path-Based Triggers

Deploy only when specific packages change:

```yaml
# .github/workflows/deploy-trade-plans.yml
name: Deploy Trade Plans

on:
  push:
    branches: [main]
    paths:
      - 'packages/trade-plans/**'
      - '.github/workflows/deploy-trade-plans.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build Trade Plans
        run: pnpm build:trade-plans
      
      - name: Get version
        id: version
        run: |
          VERSION=$(node -p "require('./packages/trade-plans/package.json').version")
          echo "VERSION=$VERSION" >> $GITHUB_OUTPUT
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3 (versioned)
        run: |
          aws s3 sync packages/trade-plans/dist/ \
            s3://${{ secrets.S3_BUCKET }}/trade-plans/${{ steps.version.outputs.VERSION }}/ \
            --delete \
            --cache-control "public, max-age=31536000, immutable"
      
      - name: Deploy to S3 (current)
        run: |
          aws s3 sync packages/trade-plans/dist/ \
            s3://${{ secrets.S3_BUCKET }}/trade-plans/current/ \
            --delete \
            --cache-control "public, max-age=0, must-revalidate"
      
      - name: Update Manifest
        run: |
          VERSION=${{ steps.version.outputs.VERSION }}
          REMOTE_URL="https://cdn.example.com/trade-plans/$VERSION/assets/remoteEntry.js"
          
          # Fetch current manifest
          aws s3 cp s3://${{ secrets.S3_BUCKET }}/manifest.json manifest-current.json || echo '{}' > manifest-current.json
          
          # Update manifest
          jq --arg module "tradePlans" \
             --arg version "$VERSION" \
             --arg url "$REMOTE_URL" \
             '.remotes[$module].version = $version | .remotes[$module].url = $url' \
             manifest-current.json > manifest-new.json
          
          # Upload updated manifest
          aws s3 cp manifest-new.json s3://${{ secrets.S3_BUCKET }}/manifest.json \
            --content-type "application/json" \
            --cache-control "no-cache, no-store, must-revalidate"
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
            --paths "/trade-plans/*" "/manifest.json"
```

### Option 2: Separate Repositories (Future)

If you split into separate repositories, each repo would have its own CI/CD:

```yaml
# trade-plans-repo/.github/workflows/deploy.yml
name: Deploy Trade Plans

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Get version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
      
      # ... rest of deployment steps
```

## Deployment Scenarios

### Scenario 1: Deploy Only Trade Plans

```bash
# 1. Make changes to trade-plans
# 2. Update version
cd packages/trade-plans
npm version patch

# 3. Build
pnpm build:trade-plans

# 4. Deploy (using script or CI/CD)
# Only trade-plans is deployed, portal and other remotes unchanged
```

### Scenario 2: Deploy Portal and One Remote

```bash
# 1. Update versions
cd packages/portal && npm version patch
cd ../trade-plans && npm version patch

# 2. Build both
pnpm build:portal
pnpm build:trade-plans

# 3. Deploy both independently
# Each goes to its own S3 path
```

### Scenario 3: Hotfix Deployment

```bash
# 1. Fix bug in client-verification
# 2. Bump patch version
cd packages/client-verification
npm version patch  # 1.0.0 → 1.0.1

# 3. Build and deploy only client-verification
pnpm build:client-verification
# Deploy to S3...

# 4. Update manifest
# Portal automatically picks up new version on next load
```

## Benefits of Independent Deployment

### ✅ Faster Releases

- Deploy only what changed
- No need to rebuild everything
- Faster CI/CD pipelines

### ✅ Independent Versioning

- Each package follows its own release cycle
- Bug fixes don't require full system deployment
- Features can be released independently

### ✅ Reduced Risk

- Smaller deployment scope = lower risk
- Can rollback individual packages
- Test changes in isolation

### ✅ Team Autonomy

- Teams can deploy their own modules
- No coordination needed for unrelated changes
- Faster iteration cycles

## S3 Deployment Structure

Each package deploys to its own versioned path:

```
s3://your-bucket/
├── portal/
│   ├── v1.0.0/          # Portal version 1.0.0
│   ├── v1.1.0/          # Portal version 1.1.0 (independent)
│   └── current/ → v1.1.0/
│
├── trade-plans/
│   ├── v1.0.0/          # Trade Plans version 1.0.0
│   ├── v1.0.1/          # Trade Plans version 1.0.1 (independent)
│   └── current/ → v1.0.1/
│
├── client-verification/
│   ├── v1.0.0/          # Client Verification version 1.0.0
│   └── current/ → v1.0.0/
│
└── manifest.json        # Registry of all versions
```

## Version Compatibility

### Shared Dependencies

While packages deploy independently, they share dependencies:

```typescript
// All packages must use compatible versions
shared: {
  'react': { singleton: true, requiredVersion: '^18.2.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
  'mobx': { singleton: true },
  'mobx-react-lite': { singleton: true },
  'react-router-dom': { singleton: true }
}
```

**Important:** Keep shared dependency versions compatible across all packages.

### Breaking Changes

If you make breaking changes to shared dependencies:

1. **Coordinate deployment** - Update all packages together
2. **Version compatibility** - Document compatible versions
3. **Gradual migration** - Support multiple versions during transition

## Portal Discovery

The portal discovers remote versions via `manifest.json`:

```json
{
  "remotes": {
    "tradePlans": {
      "url": "https://cdn.example.com/trade-plans/v1.0.1/assets/remoteEntry.js",
      "version": "1.0.1"
    }
  }
}
```

**Key Points:**
- Portal fetches manifest at runtime
- No portal rebuild needed when remotes update
- Portal automatically loads new versions
- Old versions remain available for rollback

## Rollback Strategy

### Rollback Individual Package

```bash
# 1. Update manifest to point to previous version
jq '.remotes.tradePlans.version = "1.0.0"' manifest.json > manifest-new.json
jq '.remotes.tradePlans.url = "https://cdn.example.com/trade-plans/v1.0.0/assets/remoteEntry.js"' manifest-new.json > manifest.json

# 2. Upload updated manifest
aws s3 cp manifest.json s3://your-bucket/manifest.json

# 3. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/manifest.json"
```

### Rollback Portal

```bash
# 1. Update CloudFront origin to point to previous version
# Or update S3 current symlink
aws s3 sync s3://your-bucket/portal/v1.0.0/ s3://your-bucket/portal/current/ --delete
```

## Best Practices

### 1. Semantic Versioning

Follow semantic versioning for each package:
- **Major** (2.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes

### 2. Version Coordination

- Document compatible versions
- Test integration before deploying
- Coordinate breaking changes

### 3. Deployment Order

- Deploy remotes first
- Update manifest
- Deploy portal last (if needed)

### 4. Testing

- Test packages independently
- Test integration after deployment
- Use staging environment first

### 5. Monitoring

- Monitor each package independently
- Track version deployments
- Alert on manifest fetch failures

## Migration to Separate Repositories

If you want to split into separate repositories:

### Step 1: Extract Package

```bash
# Create new repository
git clone <new-repo-url>
cd new-repo

# Copy package
cp -r react-federation/packages/trade-plans/* .

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Update Dependencies

- Update imports to use published shared package
- Configure CI/CD for new repository
- Update manifest service URLs

### Step 3: Update Portal

- Update portal to fetch from new repository URLs
- Update CI/CD to handle separate repos

## Summary

✅ **Yes, you can deploy independently!**

- Each package has its own version
- Each package builds independently
- Each package deploys to its own S3 path
- Portal discovers versions via manifest.json
- No coordination needed for unrelated changes

**Current Setup:** Monorepo with independent deployment  
**Future Option:** Separate repositories (if desired)

## Related Documentation

- [Deployment Guide](./deployment-guide.md) - Complete deployment instructions
- [Architecture Overview](./architecture-overview.md#deployment-architecture) - Deployment architecture
- [ADR-0003: Manifest Management](./adr/0003-manifest-management-s3-cdn.md) - Manifest strategy
- [CI/CD Guide](./cicd-guide.md) - CI/CD setup

---

**Last Updated:** 2024

