# Deployment Guide

## Overview

This guide covers deploying the multi-repository micro-frontend architecture. Each module is deployed independently to AWS S3 with CloudFront CDN.

## Prerequisites

- AWS Account with S3 and CloudFront access
- AWS CLI configured with appropriate credentials
- GitHub Actions (or similar CI/CD) access
- Okta application configured
- Domain name configured (optional)

## Deployment Architecture

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       │ CI/CD Pipeline
       │
       ▼
┌─────────────┐
│   Build     │
│  Artifacts  │
└──────┬──────┘
       │
       │ Deploy
       │
       ▼
┌─────────────┐
│  S3 Bucket  │
│  (Versioned)│
└──────┬──────┘
       │
       │ Serve
       │
       ▼
┌─────────────┐
│ CloudFront  │
│    CDN      │
└──────┬──────┘
       │
       │
       ▼
    Users
```

## S3 Bucket Structure

```
s3://your-bucket/
├── portal/
│   ├── v1.0.0/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── index-[hash].js
│   │       └── index-[hash].css
│   ├── v1.1.0/
│   │   └── ...
│   └── current/ → v1.1.0/ (symlink or copy)
│
├── trade-plans/
│   ├── v1.0.0/
│   │   └── assets/
│   │       └── remoteEntry.js
│   ├── v1.0.1/
│   │   └── ...
│   └── current/ → v1.0.1/
│
├── client-verification/
│   ├── v1.0.0/
│   │   └── assets/
│   │       └── remoteEntry.js
│   └── current/ → v1.0.0/
│
├── annuity-sales/
│   ├── v1.0.0/
│   │   └── assets/
│   │       └── remoteEntry.js
│   └── current/ → v1.0.0/
│
└── manifest.json
```

## Environment Setup

### AWS Configuration

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-portal-bucket
   ```

2. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-portal-bucket/*"
       }
     ]
   }
   ```

3. **Enable Static Website Hosting** (if not using CloudFront)
   ```bash
   aws s3 website s3://your-portal-bucket \
     --index-document index.html \
     --error-document index.html
   ```

4. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: `portal/current/index.html`
   - Cache behaviors: Configure for each module path

### GitHub Secrets

Configure these secrets in each repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`
- `CF_DISTRIBUTION_ID`
- `OKTA_CLIENT_ID` (for portal)
- `OKTA_ISSUER` (for portal)
- `API_BASE_URL`
- `MANIFEST_SERVICE_URL` (if using manifest service)

## Portal Deployment

### Build Configuration

```typescript
// portal-repo/vite.config.ts
export default defineConfig({
  // ... other config
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

### Environment Variables

Create `.env.production`:

```env
VITE_OKTA_CLIENT_ID=your_production_client_id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default
VITE_API_BASE_URL=https://api.example.com
VITE_MANIFEST_URL=https://cdn.example.com/manifest.json
VITE_APP_NAME=Financial Services Portal
```

### CI/CD Pipeline

```yaml
# portal-repo/.github/workflows/deploy.yml
name: Deploy Portal

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  AWS_REGION: us-east-1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_OKTA_CLIENT_ID: ${{ secrets.OKTA_CLIENT_ID }}
          VITE_OKTA_ISSUER: ${{ secrets.OKTA_ISSUER }}
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_MANIFEST_URL: ${{ secrets.MANIFEST_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Get version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      - name: Deploy to S3 (versioned)
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/portal/${{ steps.version.outputs.VERSION }}/ \
            --delete \
            --cache-control "public, max-age=31536000, immutable"

      - name: Deploy to S3 (current)
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/portal/current/ \
            --delete \
            --cache-control "public, max-age=0, must-revalidate"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
            --paths "/portal/*"
```

## Remote Module Deployment

### Trade Plans Deployment

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
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Get version
        id: version
        run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      - name: Deploy to S3 (versioned)
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/trade-plans/${{ steps.version.outputs.VERSION }}/ \
            --delete \
            --cache-control "public, max-age=31536000, immutable"

      - name: Deploy to S3 (current)
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}/trade-plans/current/ \
            --delete \
            --cache-control "public, max-age=0, must-revalidate"

      - name: Update Manifest
        run: |
          VERSION=${{ steps.version.outputs.VERSION }}
          REMOTE_URL="https://cdn.example.com/trade-plans/$VERSION/assets/remoteEntry.js"
          # Call manifest service API to update
          curl -X POST ${{ secrets.MANIFEST_SERVICE_URL }}/update \
            -H "Content-Type: application/json" \
            -d "{\"module\":\"tradePlans\",\"version\":\"$VERSION\",\"url\":\"$REMOTE_URL\"}"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
            --paths "/trade-plans/*" "/manifest.json"
```

## Manifest Management

### Option 1: Manifest Service API

Create a separate service that manages manifest.json:

```typescript
// manifest-service API endpoint
POST /api/manifest/update
{
  "module": "tradePlans",
  "version": "1.0.0",
  "url": "https://cdn.example.com/trade-plans/1.0.0/assets/remoteEntry.js",
  "requiredGroups": ["trade-planners", "traders", "admins"],
  "displayName": "Trade Plans",
  "icon": "trendingUp",
  "description": "Create and manage trading strategies"
}
```

### Option 2: Direct S3 Update

```bash
# Fetch current manifest
aws s3 cp s3://bucket/manifest.json manifest.json

# Update manifest (using jq)
jq '.remotes.tradePlans.version = "1.0.0"' manifest.json > manifest-new.json
jq '.remotes.tradePlans.url = "https://cdn.example.com/trade-plans/1.0.0/assets/remoteEntry.js"' manifest-new.json > manifest.json

# Upload updated manifest
aws s3 cp manifest.json s3://bucket/manifest.json
```

### Option 3: Manifest Repository

Create a separate repository for manifest.json:

```yaml
# manifest-repo/.github/workflows/update.yml
# Remote modules create PRs to update manifest
```

## Version Management

### Semantic Versioning

Each repository uses semantic versioning independently:

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Versioning Strategy

1. **Portal**: Version independently
2. **Remotes**: Version independently
3. **Compatibility**: Document compatible versions
4. **Rollback**: Keep old versions in S3 for rollback

### Updating Versions

```bash
# Update version in package.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# Commit and push
git add package.json
git commit -m "Bump version to 1.0.1"
git push
```

## CloudFront Configuration

### Cache Behaviors

Configure different cache behaviors for different paths:

1. **Portal** (`/portal/*`):
   - Cache policy: CachingOptimized
   - TTL: 0 (no cache for current)

2. **Remotes** (`/trade-plans/*`, etc.):
   - Cache policy: CachingOptimized
   - TTL: 31536000 (1 year) for versioned paths
   - TTL: 0 for current paths

3. **Manifest** (`/manifest.json`):
   - Cache policy: CachingDisabled
   - TTL: 0

### Custom Error Pages

Configure CloudFront to serve `index.html` for 404 errors (for SPA routing):

- Error code: 403, 404
- Response page path: `/portal/current/index.html`
- HTTP response code: 200

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Version updated in package.json
- [ ] Environment variables configured
- [ ] Build succeeds locally
- [ ] Manifest updated (if needed)

### Deployment

- [ ] CI/CD pipeline runs successfully
- [ ] Files uploaded to S3
- [ ] CloudFront invalidation completed
- [ ] Manifest updated (for remotes)

### Post-Deployment

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Modules load correctly
- [ ] No console errors
- [ ] Performance metrics acceptable

## Rollback Procedure

### Portal Rollback

```bash
# Get previous version
PREVIOUS_VERSION="1.0.0"

# Copy previous version to current
aws s3 sync s3://bucket/portal/$PREVIOUS_VERSION/ \
  s3://bucket/portal/current/ \
  --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/portal/*"
```

### Remote Module Rollback

```bash
# Update manifest to point to previous version
# Then invalidate CloudFront
```

## Monitoring

### Health Checks

Create health check endpoints:

```typescript
// portal-repo/src/routes/health.ts
export function healthCheck() {
  return {
    status: 'ok',
    version: process.env.VITE_APP_VERSION,
    timestamp: new Date().toISOString()
  }
}
```

### Deployment Metrics

Monitor:
- Deployment success rate
- Build time
- Deployment time
- Error rates post-deployment

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check CloudFront and S3 CORS configuration
2. **Module Not Found**: Verify manifest.json is updated
3. **Version Mismatch**: Check shared dependency versions
4. **Cache Issues**: Invalidate CloudFront cache

See [Troubleshooting Guide](./troubleshooting-guide.md) for more details.

## Best Practices

1. **Version Everything**: Always deploy to versioned paths
2. **Test Before Deploy**: Run tests in CI/CD
3. **Gradual Rollout**: Consider canary deployments
4. **Monitor Post-Deploy**: Watch metrics after deployment
5. **Document Changes**: Keep changelog for each module
6. **Coordinate Deployments**: Communicate when deploying breaking changes

