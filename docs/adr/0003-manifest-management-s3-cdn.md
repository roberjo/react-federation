# ADR-0003: Manifest Management - S3/CDN Approach

## Status
Accepted

## Context
The portal application needs to discover and load remote modules dynamically in production. Each remote module is deployed independently to S3/CDN with versioned paths. The portal needs a mechanism to:
1. Discover available remote modules
2. Get the correct URL for each remote module's `remoteEntry.js`
3. Handle version updates without portal redeployment
4. Support multiple environments (dev, staging, production)

We need a manifest management strategy that enables dynamic remote discovery.

## Decision
We will use an **S3/CDN-stored manifest.json** approach where:
1. `manifest.json` is stored in the same S3 bucket as the portal
2. Each remote module updates the manifest on deployment
3. Portal fetches manifest at runtime from CDN
4. Manifest is cached client-side to reduce requests
5. Manifest updates are atomic (fetch-modify-upload pattern)

## Implementation Details

### Manifest Structure
```json
{
  "version": "1.0.0",
  "remotes": {
    "tradePlans": {
      "url": "https://cdn.example.com/trade-plans/v1.0.0/assets/remoteEntry.js",
      "version": "1.0.0",
      "requiredGroups": ["trade-planners", "traders", "admins"],
      "displayName": "Trade Plans",
      "icon": "trendingUp",
      "description": "Create and manage trading strategies"
    },
    "clientVerification": { ... },
    "annuitySales": { ... }
  }
}
```

### Manifest Service (Portal)
- Fetch manifest from `VITE_MANIFEST_URL` (defaults to `/manifest.json`)
- Cache manifest in memory to prevent duplicate requests
- Request deduplication for concurrent requests
- Validation of manifest structure
- Error handling for fetch failures

### Manifest Updates (CI/CD)
- Each remote module deployment:
  1. Fetches current manifest from S3
  2. Updates its entry with new version and URL
  3. Uploads updated manifest back to S3
  4. Invalidates CloudFront cache for manifest

### Deployment Process
```bash
# 1. Fetch current manifest
aws s3 cp s3://bucket/manifest.json manifest-current.json

# 2. Update manifest using jq
jq --arg module "tradePlans" \
   --arg version "$VERSION" \
   --arg url "$REMOTE_URL" \
   '.remotes[$module].version = $version | .remotes[$module].url = $url' \
   manifest-current.json > manifest-new.json

# 3. Upload updated manifest
aws s3 cp manifest-new.json s3://bucket/manifest.json \
  --content-type "application/json" \
  --cache-control "no-cache, no-store, must-revalidate"

# 4. Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID \
  --paths "/manifest.json"
```

## Consequences

### Positive
- ✅ **No Portal Redeployment**: Portal discovers remotes without rebuild
- ✅ **Independent Deployment**: Remotes deploy independently
- ✅ **Version Management**: Each remote manages its own version
- ✅ **Simple Implementation**: Standard S3 operations, no custom service
- ✅ **CDN Caching**: CloudFront can cache manifest (with no-cache headers)
- ✅ **Cost Effective**: No additional infrastructure needed
- ✅ **Atomic Updates**: Fetch-modify-upload pattern ensures consistency

### Negative
- ⚠️ **Race Conditions**: Concurrent deployments could overwrite each other
  - *Mitigation*: Use S3 versioning, implement retry logic, coordinate deployments
- ⚠️ **No Validation**: No server-side validation of manifest structure
  - *Mitigation*: Client-side validation, CI/CD validation scripts
- ⚠️ **Manual Conflict Resolution**: Conflicts require manual intervention
  - *Mitigation*: Deployment coordination, version control of manifest

### Risks
- **Concurrent Updates**: Two modules deploying simultaneously could conflict
  - *Mitigation*: 
    - Use S3 versioning to detect conflicts
    - Implement retry with exponential backoff
    - Coordinate deployments via CI/CD scheduling
- **Manifest Corruption**: Invalid JSON could break portal
  - *Mitigation*: 
    - Validate manifest structure client-side
    - Keep backup of previous manifest
    - Use S3 versioning for rollback
- **CDN Caching**: Stale manifest could be served
  - *Mitigation*: 
    - Set `no-cache` headers on manifest
    - Invalidate CloudFront on updates
    - Client-side cache with TTL

## Alternatives Considered

### Alternative 1: Central Manifest Service API
- **Pros**: 
  - Server-side validation
  - Better conflict resolution
  - Audit trail
  - Version history
- **Cons**: 
  - Additional infrastructure to maintain
  - Additional cost
  - More complex deployment
  - Single point of failure
- **Decision**: Rejected - Too much overhead for current needs

### Alternative 2: Manifest Repository (Git)
- **Pros**: 
  - Version control
  - Pull request reviews
  - Change history
  - Easy rollback
- **Cons**: 
  - Requires PR workflow (slower deployments)
  - Git dependency in CI/CD
  - More complex automation
- **Decision**: Rejected - Slows down independent deployment goal

### Alternative 3: Database-Stored Manifest
- **Pros**: 
  - ACID transactions
  - Better conflict handling
  - Query capabilities
- **Cons**: 
  - Database infrastructure needed
  - Additional cost
  - More complex setup
  - Database becomes dependency
- **Decision**: Rejected - Overkill for simple key-value store

### Alternative 4: Environment Variables
- **Pros**: 
  - Simple
  - No external dependency
- **Cons**: 
  - Requires portal rebuild for changes
  - Defeats purpose of independent deployment
- **Decision**: Rejected - Defeats micro-frontend architecture goals

## Implementation Guidelines

### Manifest Location
- Store at root of S3 bucket: `s3://bucket/manifest.json`
- Accessible via CDN: `https://cdn.example.com/manifest.json`
- Environment variable: `VITE_MANIFEST_URL`

### Caching Strategy
- **Client-side**: Cache manifest in memory (single request per session)
- **CDN**: Set `no-cache` headers to prevent stale caching
- **Invalidation**: Invalidate CloudFront on every manifest update

### Conflict Resolution
1. **Retry Logic**: On conflict, retry with exponential backoff
2. **S3 Versioning**: Enable S3 versioning to detect conflicts
3. **Last Write Wins**: Simple strategy for now (can improve later)
4. **Coordination**: Schedule deployments to avoid conflicts

### Validation
- **Client-side**: Validate manifest structure on fetch
- **CI/CD**: Validate manifest before upload
- **Schema**: Define JSON schema for manifest structure

### Monitoring
- Monitor manifest fetch failures
- Alert on manifest structure errors
- Track manifest update frequency
- Monitor deployment conflicts

## Migration Path

1. **Initial Setup**:
   - Create initial `manifest.json` in S3
   - Configure CDN to serve manifest
   - Update portal to fetch from CDN

2. **Update CI/CD**:
   - Add manifest update step to each remote's deployment
   - Test manifest updates in staging
   - Monitor for conflicts

3. **Production Rollout**:
   - Deploy portal with manifest fetching
   - Deploy remotes with manifest updates
   - Monitor for issues

## Future Improvements

1. **Conflict Detection**: Use S3 versioning to detect and handle conflicts
2. **Manifest Versioning**: Track manifest versions for rollback
3. **Validation Service**: Optional service for server-side validation
4. **Audit Trail**: Log all manifest updates
5. **Multi-Environment**: Support different manifests per environment

## References
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Caching](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html)
- [S3 Versioning](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html)

## Date
2024

## Authors
Architecture Team

