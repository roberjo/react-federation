# Documentation Index

This directory contains comprehensive documentation for the Enterprise Portal with Micro-Frontend Architecture project.

## Documentation Structure

### Core Documentation

1. **[Architecture Overview](./architecture-overview.md)**
   - System architecture
   - Multi-repository structure
   - Module Federation architecture
   - Authentication flow
   - State management
   - Deployment architecture

2. **[Development Guide](./development-guide.md)**
   - Prerequisites and setup
   - Local development workflow
   - Code organization
   - Testing strategies
   - Common development tasks

3. **[Module Federation Guide](./module-federation-guide.md)**
   - Technical implementation details
   - Portal configuration
   - Remote module configuration
   - Shared dependencies
   - State sharing patterns
   - Error handling

4. **[Deployment Guide](./deployment-guide.md)**
   - AWS S3 and CloudFront setup
   - CI/CD pipelines
   - Version management
   - Manifest management
   - Rollback procedures
   - Monitoring

5. **[Security & Authentication Guide](./security-authentication-guide.md)**
   - Okta OAuth 2.0 setup
   - Token management
   - Authorization patterns
   - Security best practices
   - Session management
   - Compliance considerations

6. **[API Integration Guide](./api-integration-guide.md)**
   - API client setup
   - Service patterns
   - Error handling
   - Request/response logging
   - Retry logic
   - Testing

7. **[Design System](./design-system.md)**
   - Color palette
   - Typography
   - Components
   - Layout guidelines
   - Responsive design
   - Accessibility

8. **[Troubleshooting Guide](./troubleshooting-guide.md)**
   - Common issues and solutions
   - Module Federation issues
   - Authentication issues
   - Build and deployment issues
   - Runtime issues
   - Debugging tips

9. **[Gaps and Issues Analysis](./gaps-and-issues-analysis.md)**
   - Critical issues identified
   - Design gaps
   - Technical concerns
   - Security concerns
   - Recommendations
   - Questions for stakeholders

10. **[Architecture Decision Records (ADRs)](./adr/README.md)**
    - ADR-0001: Module Federation Implementation for Vite
    - ADR-0002: Token Sharing Strategy - Props Injection
    - ADR-0003: Manifest Management - S3/CDN Approach

11. **[Monorepo Setup Guide](./monorepo-setup.md)**
    - Monorepo structure
    - Package configuration
    - Workspace setup
    - Shared package setup

12. **[Mocking Guide](./mocking-guide.md)**
    - Mock Okta authentication
    - Mock data services APIs
    - MSW setup
    - Development workflow

13. **[Testing Strategy](./testing-strategy.md)**
    - Testing philosophy
    - Testing pyramid
    - Test structure
    - Coverage goals

14. **[Testing Guide](./testing-guide.md)**
    - Running tests
    - Writing tests
    - Test examples
    - Troubleshooting

15. **[Testing Summary](./TESTING_SUMMARY.md)**
    - Test results
    - Coverage status
    - Test infrastructure

16. **[Fusion-Site Migration Plan](./migration-plan-fusion-site.md)**
    - Migration strategy
    - Step-by-step migration guide
    - Component migration checklist
    - Dependencies and setup

17. **[Fusion-Site Comparison](./fusion-site-comparison.md)**
    - Side-by-side comparison
    - Design system differences
    - Component comparison
    - Migration impact analysis

18. **[Migration Summary](./MIGRATION_SUMMARY.md)**
    - Quick overview
    - Key findings
    - Migration phases
    - Success criteria

## Quick Start

### For Developers

1. Start with [Development Guide](./development-guide.md) for setup
2. Read [Architecture Overview](./architecture-overview.md) for system understanding
3. Review [Module Federation Guide](./module-federation-guide.md) for technical details
4. Check [Troubleshooting Guide](./troubleshooting-guide.md) when issues arise

### For DevOps

1. Start with [Deployment Guide](./deployment-guide.md)
2. Review [Architecture Overview](./architecture-overview.md) for deployment structure
3. Check [Troubleshooting Guide](./troubleshooting-guide.md) for deployment issues

### For Architects

1. Read [Architecture Overview](./architecture-overview.md)
2. Review [Gaps and Issues Analysis](./gaps-and-issues-analysis.md)
3. Check [Module Federation Guide](./module-federation-guide.md) for technical details

## Key Concepts

### Monorepo Workspace

All packages live in a single pnpm workspace:
- `packages/portal` – host shell
- `packages/trade-plans` – trade management remote
- `packages/client-verification` – KYC queue remote
- `packages/annuity-sales` – annuity pipeline remote
- `packages/shared` – shared types/utilities

This preserves independent builds while simplifying local development and cross-package refactors.

### Module Federation

Uses `@originjs/vite-plugin-federation` to enable:
- Dynamic module loading
- Shared dependencies
- Independent deployment
- Runtime module discovery

**See**: [ADR-0001](./adr/0001-module-federation-vite-implementation.md) for implementation details

### Authentication

Okta OAuth 2.0 with:
- JWT token management
- Group-based access control
- Role-based permissions
- Automatic token refresh

### State Management

MobX for reactive state:
- Portal state (AuthStore, UserStore)
- Remote module state (module-specific stores)
- **State sharing via props injection** (see [ADR-0002](./adr/0002-token-sharing-props-injection.md))

### Manifest Management

S3/CDN-stored manifest.json for dynamic remote discovery:
- Manifest stored in S3, served via CDN
- Each remote updates manifest on deployment
- Portal fetches manifest at runtime

**See**: [ADR-0003](./adr/0003-manifest-management-s3-cdn.md) for implementation details

## Important Notes

### Critical Issues

The latest architecture decisions and implementation details are captured in the ADRs and migration documents listed above. Historical issues tracked in [Gaps and Issues Analysis](./gaps-and-issues-analysis.md) have been resolved as part of the shadcn design system migration and remote integration work.

### Design Decisions

Key architectural decisions have been documented:

1. **Manifest Management** - ✅ **S3/CDN Approach** (see [ADR-0003](./adr/0003-manifest-management-s3-cdn.md))
2. **State Sharing** - ✅ **Props Injection** (see [ADR-0002](./adr/0002-token-sharing-props-injection.md))
3. **Module Federation** - ✅ **Vite Implementation** (see [ADR-0001](./adr/0001-module-federation-vite-implementation.md))

All decisions are documented in [Architecture Decision Records](./adr/README.md).

## Project Structure

```
react-federation/
├── docs/
│   ├── README.md (this file)
│   ├── architecture-overview.md
│   ├── development-guide.md
│   ├── module-federation-guide.md
│   ├── deployment-guide.md
│   ├── security-authentication-guide.md
│   ├── api-integration-guide.md
│   ├── design-system.md
│   ├── troubleshooting-guide.md
│   ├── gaps-and-issues-analysis.md
│   └── cursor_prompt.md (original prompt)
└── README.md
```

## Contributing

When updating documentation:

1. Keep documentation up to date with code changes
2. Update related documentation when making changes
3. Add examples and code snippets where helpful
4. Document any new patterns or approaches
5. Update troubleshooting guide with new issues

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Module Federation Guide](https://module-federation.github.io/)
- [MobX Documentation](https://mobx.js.org/)
- [Okta React SDK](https://github.com/okta/okta-react)
- [React Router v6](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For questions or issues:

1. Check [Troubleshooting Guide](./troubleshooting-guide.md)
2. Review [Gaps and Issues Analysis](./gaps-and-issues-analysis.md)
3. Check relevant documentation section
4. Review GitHub issues
5. Contact team members

---

**Last Updated:** 2025-11-08  
**Version:** 1.1.0

