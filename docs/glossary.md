# Glossary

Definitions of terms and concepts used throughout the documentation.

## A

**ADR (Architecture Decision Record)**
A document that captures an important architectural decision, including context, decision, and consequences.

**Authentication**
The process of verifying a user's identity, typically through Okta OAuth 2.0 in this project.

**Authorization**
The process of determining what resources a user can access based on their groups and roles.

## C

**CDN (Content Delivery Network)**
A distributed network of servers that deliver content to users based on geographic location. CloudFront is used in this project.

**CORS (Cross-Origin Resource Sharing)**
A security mechanism that allows web pages to make requests to a different domain than the one serving the web page.

**Container**
In Module Federation, a container is the runtime representation of a remote module that exposes modules to other applications.

## D

**Dev Server**
A local development server (Vite) that provides hot module replacement and fast builds during development.

## E

**Error Boundary**
A React component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.

**Expose**
In Module Federation, to expose a module means to make it available for consumption by other applications.

## F

**Federation**
See Module Federation.

## H

**Host**
In Module Federation, the host (or shell) is the main application that loads and orchestrates remote modules. The Portal is the host in this project.

**HMR (Hot Module Replacement)**
A development feature that updates modules in the browser without a full page reload.

## J

**JWT (JSON Web Token)**
A compact, URL-safe token format used for authentication. Contains claims about the user and their permissions.

## M

**Manifest**
A JSON file (`manifest.json`) that contains metadata about available remote modules, including their URLs and versions.

**Micro-Frontend**
An architectural pattern where a frontend application is composed of smaller, independently deployable applications.

**Module Federation**
A webpack/Vite feature that enables runtime code sharing between separate applications, allowing them to work together as a single application.

**MobX**
A reactive state management library used in this project for managing application state.

**Monorepo**
A repository structure where multiple related packages are stored in a single repository.

## O

**Okta**
An identity and access management service used for authentication in this project.

**Origin**
In web security, the origin is the combination of protocol, domain, and port. CORS policies are based on origins.

## P

**Portal**
The main host application that orchestrates authentication, routing, and module loading.

**Props Injection**
A pattern where the portal passes data (like authentication state) to remote modules via React props.

## R

**Remote**
In Module Federation, a remote is an application that exposes modules for consumption by other applications.

**Remote Entry**
The entry point file (`remoteEntry.js`) that exposes modules from a remote application.

**RBAC (Role-Based Access Control)**
An authorization mechanism that restricts access based on user roles and groups.

## S

**Shared Dependencies**
Dependencies (like React) that are loaded once and shared across multiple modules to reduce bundle size.

**Singleton**
A dependency configuration that ensures only one instance of a library is loaded across all modules.

**State Management**
The process of managing application state. This project uses MobX for state management.

## T

**Token**
A credential used for authentication. This project uses JWT tokens from Okta.

**TypeScript**
A typed superset of JavaScript that compiles to plain JavaScript, providing type safety.

## V

**Vite**
A fast build tool and development server used in this project.

**Versioning**
The process of assigning version numbers to releases. Each module in this project is versioned independently.

## W

**Workspace**
In pnpm, a workspace is a collection of packages that can be managed together. This project uses pnpm workspaces for the monorepo.

---

**Last Updated:** 2024

