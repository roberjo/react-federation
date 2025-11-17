# Contributing to React Federation Monorepo

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `pnpm install`
3. **Create a branch** for your changes: `git checkout -b feature/your-feature-name`
4. **Make your changes** following our coding standards
5. **Test your changes**: `pnpm test`
6. **Lint your code**: `pnpm lint`
7. **Submit a pull request**

## Development Setup

See [Development Guide](./docs/development-guide.md) for detailed setup instructions.

### Quick Start

```bash
# Install dependencies
pnpm install

# Run all development servers
pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use strict TypeScript settings
- Avoid `any` types - use proper types or `unknown`

### Code Style

- Use ESLint for linting: `pnpm lint`
- Use Prettier for formatting (if configured)
- Follow React best practices
- Use functional components with hooks
- Use MobX for state management

### Testing

- Write tests for new features
- Maintain or improve test coverage
- Run tests before submitting: `pnpm test`

### Commit Messages

Use conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(portal): add user profile page
fix(trade-plans): resolve module loading issue
docs: update setup instructions
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**: `pnpm test`
4. **Ensure linting passes**: `pnpm lint`
5. **Update CHANGELOG.md** with your changes
6. **Create a pull request** with a clear description

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
- [ ] CHANGELOG.md updated

## Project Structure

```
react-federation/
├── packages/
│   ├── portal/              # Host shell application
│   ├── trade-plans/         # Remote module
│   ├── client-verification/ # Remote module
│   ├── annuity-sales/       # Remote module
│   └── shared/              # Shared types and utilities
├── docs/                    # Documentation
└── .github/                 # GitHub workflows
```

## Module Federation Guidelines

When working with remote modules:

1. **Shared Dependencies**: Use the shared package for common types
2. **Props Injection**: Pass auth state via props (see ModuleLoader)
3. **Version Compatibility**: Ensure compatibility with portal version
4. **Testing**: Test modules both standalone and integrated

See [Module Federation Guide](./docs/module-federation-guide.md) for details.

## Questions?

- Check existing [documentation](./docs/)
- Open an issue for questions or discussions
- Review [Architecture Overview](./docs/architecture-overview.md)

## Code of Conduct

Please be respectful and professional in all interactions. We're all here to build something great together.

Thank you for contributing! 🎉

