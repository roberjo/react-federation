# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ESLint configuration for code quality
- CI/CD workflows for automated testing and building
- CONTRIBUTING.md with contribution guidelines
- CHANGELOG.md for version history
- .env.example files for environment configuration
- Clean scripts for all packages
- Lint scripts for all packages

### Changed
- Production build configuration: enabled minification and CSS code splitting
- Windows compatibility: updated clean script for PowerShell
- Standardized linting across all packages

### Fixed
- Missing ESLint configuration causing lint script failures
- Production build not minifying code
- Windows compatibility issues in clean script

## [1.0.0] - 2024-XX-XX

### Added
- Initial monorepo setup with pnpm workspaces
- Portal host application with authentication
- Trade Plans remote module
- Client Verification remote module
- Annuity Sales remote module
- Shared types and utilities package
- Module Federation integration
- Mock authentication and API services
- Unit tests (35 total)
- E2E tests with Playwright
- Comprehensive documentation

[Unreleased]: https://github.com/your-org/react-federation/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/react-federation/releases/tag/v1.0.0

