# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Enterprise Portal with Micro-Frontend Architecture project.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made during the project. They document:
- **Context**: Why the decision was needed
- **Decision**: What was decided
- **Consequences**: Impact of the decision (positive and negative)
- **Alternatives**: Other options considered and why they were rejected

## ADR Index

### [ADR-0001: Module Federation Implementation for Vite](./0001-module-federation-vite-implementation.md)
**Status**: Accepted  
**Date**: 2024

Decision to implement dynamic remote module loading using Vite Module Federation with proper APIs instead of webpack-specific code.

**Key Points**:
- Dynamic script loading for `remoteEntry.js`
- Container initialization with shared scope
- Error handling and retry logic
- Support for both development and production modes

---

### [ADR-0002: Token Sharing Strategy - Props Injection](./0002-token-sharing-props-injection.md)
**Status**: Accepted  
**Date**: 2024

Decision to use props injection as the primary mechanism for sharing authentication state from portal to remote modules.

**Key Points**:
- Type-safe interface for auth props
- Explicit dependencies between portal and remotes
- Support for standalone development mode
- No global state pollution

---

### [ADR-0003: Manifest Management - S3/CDN Approach](./0003-manifest-management-s3-cdn.md)
**Status**: Accepted  
**Date**: 2024

Decision to use S3/CDN-stored manifest.json for dynamic remote module discovery.

**Key Points**:
- Manifest stored in S3, served via CDN
- Each remote updates manifest on deployment
- Portal fetches manifest at runtime
- Client-side caching with request deduplication

---

## ADR Format

Each ADR follows this structure:

1. **Status**: Accepted, Proposed, Deprecated, Superseded
2. **Context**: Why this decision is needed
3. **Decision**: What was decided
4. **Implementation Details**: How it's implemented
5. **Consequences**: Positive and negative impacts
6. **Alternatives Considered**: Other options and why they were rejected
7. **References**: Links to relevant documentation

## Creating New ADRs

When making a significant architectural decision:

1. Create a new ADR file: `000X-decision-title.md`
2. Use the template below
3. Number sequentially
4. Update this README with the new ADR
5. Get team review and approval

### ADR Template

```markdown
# ADR-000X: Decision Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
[Describe the context and problem statement]

## Decision
[State the decision]

## Implementation Details
[Describe how it's implemented]

## Consequences

### Positive
- ✅ Benefit 1
- ✅ Benefit 2

### Negative
- ⚠️ Drawback 1
- ⚠️ Drawback 2

### Risks
- Risk 1 with mitigation
- Risk 2 with mitigation

## Alternatives Considered

### Alternative 1: [Name]
- **Pros**: ...
- **Cons**: ...
- **Decision**: Rejected - Reason

## References
- [Link 1](url)
- [Link 2](url)

## Date
YYYY-MM-DD

## Authors
Team/Person Name
```

## ADR Status Definitions

- **Proposed**: Decision is being considered, not yet finalized
- **Accepted**: Decision has been made and approved
- **Deprecated**: Decision is no longer in use but kept for historical reference
- **Superseded**: Decision has been replaced by a newer ADR

## Related Documentation

- [Architecture Overview](../architecture-overview.md)
- [Module Federation Guide](../module-federation-guide.md)
- [Development Guide](../development-guide.md)
- [Gaps and Issues Analysis](../gaps-and-issues-analysis.md)

---

**Last Updated**: 2024

