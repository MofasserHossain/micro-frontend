# AGENTS.md

This file provides guidance to coding agents when working with this repository.

## Development Commands

```bash
pnpm install          # Install workspace dependencies
pnpm build            # Build all apps and services
pnpm lint             # Run oxlint across the repository
pnpm lint:fix         # Auto-fix lint issues when safe
pnpm format           # Format files with oxfmt
pnpm format:check     # Check formatting
pnpm typecheck        # Run TypeScript checks
pnpm deadcode         # Run knip
pnpm verify           # format:check, lint, typecheck, build, deadcode
```

Use `pnpm` for all package work. The root package is pinned to `pnpm@10.14.0`, with Node `>=20`.

## Important

- Prefer targeted checks while iterating, then run `pnpm verify` when a change can affect shared behavior, builds, imports, or package boundaries.
- There are no test suites in the repository at the time this file was added. If you add meaningful business logic, add focused tests or call out the gap clearly.
- Do not run long-lived dev servers in routine agent workflows unless the task requires browser/manual verification.
- Treat the root `CLAUDE.md` as a symlink to this file. Update `AGENTS.md` only so Codex, Claude Code, and other agents stay aligned.
- Keep guidance in this file concise and project-specific. Add durable gotchas here when a change creates a new maintenance rule.

## Architecture Overview

This is a Vite module federation ecommerce micro-frontend workspace.

- `apps/shell` is the host app. It owns top-level navigation, shared layout, auth-gated routes, and lazy-loaded remotes.
- `apps/home`, `apps/product`, `apps/cart`, `apps/checkout`, `apps/account`, and `apps/admin` expose `./App` through module federation.
- `packages/config` owns app names, origins, preview settings, and remote manifest URLs.
- `packages/api` is the browser-side REST client. It owns `VITE_API_BASE_URL`, JSON parsing, credentials, CSRF headers, and API error normalization.
- `packages/types` owns shared domain types used by apps, stores, the API client, and the backend.
- `packages/ui` owns shared React UI components and `styles.css`.
- `packages/cart-store` and `packages/auth-store` own shared Zustand state.
- `services/api` is the Express REST backend with Drizzle/Postgres, security middleware, auth, catalog, orders, account, and admin routes.

## Package Boundaries

- Apps may import from `@ecommerce-mf/api`, `@ecommerce-mf/auth-store`, `@ecommerce-mf/cart-store`, `@ecommerce-mf/config`, `@ecommerce-mf/types`, and `@ecommerce-mf/ui`.
- Browser packages and apps must not import from `services/api`, Drizzle clients, repositories, Express middleware, or Node-only backend modules.
- Keep shared domain shapes in `packages/types`; avoid redefining API payload types inside individual apps.
- Keep HTTP details in `packages/api`; individual apps should call exported client functions instead of hand-building backend URLs.
- Keep reusable visual primitives in `packages/ui`; avoid duplicating Button, Card, Badge, Table, EmptyState, product card, or currency formatting behavior.
- Module federation singletons are intentional. When adding shared runtime dependencies, review every relevant `module-federation.config.ts` and keep React, router, stores, query client, API client, and UI packages singleton-safe.

## Frontend Guidelines

- Use React, TypeScript, React Router, TanStack Query, Zustand, lucide-react, and the shared UI package already present in the repo.
- Keep route-level data fetching close to the screens that consume it, using TanStack Query for server reads.
- Use `useAuthStore` for auth/session state and permissions. Do not bypass shell route guards for protected account or admin surfaces.
- Use `useCartStore` for cart changes. Preserve the product, size, and color line-item identity behavior from `packages/cart-store`.
- Favor small, direct components and early returns. Add abstractions only when they remove real duplication across apps or packages.
- Follow the existing CSS-variable design system in `packages/ui/src/styles.css`. Prefer shared classes and components before creating app-only styling.
- Use lucide icons where icons are needed and keep accessible labels on icon-only controls.
- Keep text and controls responsive across mobile and desktop. Check compact headers, filter panels, dialogs, cards, and tables for overflow when changing UI.

## Backend Guidelines

- API routes live under `/api/v1` and should be added through `services/api/src/routes`.
- Validate request bodies, params, and query strings with Zod through `validateRequest`.
- Wrap async handlers with `asyncHandler`; report expected failures with `HttpError`.
- Keep response envelopes consistent: successful responses return `{ data: ... }`; failures return `{ error: ... }` through the shared error handler.
- Use `requireAuth`, `attachOptionalAuth`, `requireCsrf`, and `requirePermission` instead of open-coding auth checks.
- Every authenticated mutation must include CSRF protection. Every admin or account-specific route must enforce the appropriate permission or ownership check.
- Keep request-size, content-type, origin, CORS, cookie, and security-header behavior centralized in existing middleware.
- Drizzle schema changes belong in `services/api/src/db/schema.ts`; generate or push database changes through the service scripts, not ad hoc SQL.
- Production settings must not depend on local defaults for `DATABASE_URL`, `SESSION_SECRET`, or non-`__Host-` session cookies.

## Adding Or Changing Micro-Frontends

When adding or renaming an app:

- Update `packages/config/src/index.ts` with the app name and runtime config.
- Add or update the app `vite.config.ts` and `module-federation.config.ts`.
- Update `apps/shell/module-federation.config.ts` remotes and `apps/shell/src/remote-modules.d.ts`.
- Add shell routes and navigation only where the route belongs in the user workflow.
- Update root `package.json` scripts, `pnpm-workspace.yaml`, `tsconfig.base.json` path aliases, and `knip.json` if the package should be included in checks.

## Code Quality

- Keep TypeScript strict and avoid `any` unless there is a narrow, documented reason.
- Prefer explicit named exports from shared packages.
- Preserve backwards-compatible API/client changes when possible. Add new fields before removing or renaming existing ones.
- Do not add production dependencies casually. Reuse existing libraries and patterns unless the new dependency materially simplifies the work.
- Remove dead code when removing a feature. Do not leave unused flags, routes, components, stores, package exports, or config entries behind.
- Run `pnpm deadcode` after changing package exports, module federation entries, dependencies, or app boundaries.
- Use clear, user-facing copy that matches the ecommerce domain. Keep formatting ASCII unless a file already uses another character set for a specific reason.

## Review Checklist

Before handing off a non-trivial change, check:

- Formatting, linting, typechecking, build, and dead-code checks appropriate to the files touched.
- Browser/API boundary has not been crossed accidentally.
- Module federation remote names, manifests, shared singletons, and runtime config still line up.
- Auth, CSRF, permissions, and ownership checks are present for protected backend routes.
- API client types and shared domain types match backend response shapes.
- UI changes work in both standalone remote mode and inside `apps/shell` when the route is shell-mounted.
