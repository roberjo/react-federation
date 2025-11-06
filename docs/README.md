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

### Multi-Repository Architecture

Each module (portal, trade-plans, client-verification, annuity-sales) exists in its own repository, enabling:
- Independent versioning
- Independent deployment
- Team autonomy
- Technology flexibility

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

⚠️ **IMPORTANT**: Before implementation, review [Gaps and Issues Analysis](./gaps-and-issues-analysis.md) for critical issues that need to be addressed:

1. **Module Federation Implementation Mismatch** - Webpack-specific code needs to be updated for Vite
2. **Dynamic Remote Loading** - Production remote loading needs proper implementation
3. **Token Sharing Strategy** - Needs decision on approach

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

**Last Updated:** 2024
**Version:** 1.0.0

