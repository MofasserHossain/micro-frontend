# Ecommerce Micro Frontend

Clothlane is a pnpm monorepo that demonstrates an ecommerce storefront built from Vite module federation micro-frontends. The shell app composes independent remotes for home, catalog, cart, checkout, account, and admin workflows, while a separate Express API service provides the full-stack backend path.

## What Is Inside

| Area | Purpose |
| --- | --- |
| `apps/shell` | Host application, top-level navigation, shared layout, auth-gated routes, and remote loading. |
| `apps/home` | Storefront landing experience with categories, featured products, and new arrivals. |
| `apps/product` | Catalog filters, product listing, and product detail pages. |
| `apps/cart` | Cart review and quantity management. |
| `apps/checkout` | Cash-on-delivery checkout, saved address reuse, and order success flow. |
| `apps/account` | Login, registration, profile, saved addresses, and customer orders. |
| `apps/admin` | Product, customer, order, and dashboard management for admin users. |
| `packages/api` | Browser REST client, API envelopes, CSRF header handling, local demo fallback, and shared API constants. |
| `packages/auth-store` | Shared Zustand auth/session store. |
| `packages/cart-store` | Shared Zustand cart store. |
| `packages/config` | App names, origins, preview settings, and remote manifest helpers. |
| `packages/types` | Shared domain types for frontend, stores, API client, and backend. |
| `packages/ui` | Shared React UI primitives, currency formatting, and global CSS. |
| `services/api` | Express 5 REST API with Drizzle, Postgres, auth, catalog, order, account, and admin routes. |

## Tech Stack

- TypeScript with strict compiler settings
- React 19 and React Router
- Vite 8 with `@module-federation/vite`
- TanStack Query for remote data loading
- Zustand for shared auth and cart state
- Express 5 REST API
- Drizzle ORM with PostgreSQL
- Zod validation
- oxlint, oxfmt, and knip

## Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer
- A PostgreSQL database, when using the real backend service

The repository is pinned to `pnpm@10.14.0`. If pnpm is not available, enable it through Corepack:

```bash
corepack enable pnpm
```

## Quick Start

Install dependencies:

```bash
pnpm install
```

For UI-only work, each micro-frontend can run against the browser API client's local demo-data fallback when `VITE_API_BASE_URL` is not set:

```bash
pnpm dev:home
```

For full-stack work, point `DATABASE_URL` at a PostgreSQL database, apply the schema, then start the workspace:

```bash
pnpm --filter @ecommerce-mf/api-server db:push
pnpm dev
```

Use `Ctrl-C` to stop running dev processes.

## Demo Accounts

The backend seeds these users on demand when auth is used:

| Role | Email | Password |
| --- | --- | --- |
| Admin and customer | `admin@clothlane.com` | `password123` |
| Customer | `customer@clothlane.com` | `password123` |

The browser API client also has a local demo-data fallback when `VITE_API_BASE_URL` is not set, which lets individual micro-frontends run during UI work without the backend.

## Development Scripts

Run scripts from the repository root unless noted.

```bash
pnpm dev             # Start all apps and the API service
pnpm dev:shell       # Start only the shell app
pnpm dev:home        # Start only the home remote
pnpm dev:product     # Start only the product remote
pnpm dev:cart        # Start only the cart remote
pnpm dev:checkout    # Start only the checkout remote
pnpm dev:account     # Start only the account remote
pnpm dev:admin       # Start only the admin remote
pnpm dev:server      # Start only the Express API service
pnpm build           # Build all apps and services
pnpm typecheck       # Typecheck apps/packages plus service projects
pnpm lint            # Run oxlint
pnpm lint:fix        # Run oxlint with fixes
pnpm format          # Format with oxfmt
pnpm format:check    # Check formatting
pnpm deadcode        # Run knip
pnpm verify          # format:check, lint, typecheck, build, deadcode
```

For backend-specific database work:

```bash
pnpm --filter @ecommerce-mf/api-server db:generate
pnpm --filter @ecommerce-mf/api-server db:push
pnpm --filter @ecommerce-mf/api-server db:studio
```

## Module Federation

Each remote exposes its application at `./App` through `module-federation.config.ts`. The shell imports those remotes by name:

- `home/App`
- `product/App`
- `cart/App`
- `checkout/App`
- `account/App`
- `admin/App`

`packages/config` computes local origins and remote manifests for the active runtime. The shell route map mounts the remotes at the user-facing routes:

| Route | Remote |
| --- | --- |
| `/` | Home |
| `/categories/*`, `/products/*` | Product |
| `/cart/*` | Cart |
| `/checkout/*` | Checkout |
| `/login/*`, `/register/*`, `/signup/*`, `/account/*`, `/profile/*`, `/orders/*` | Account |
| `/admin/*` | Admin |

When adding or renaming a micro-frontend, update:

- `packages/config/src/index.ts`
- the app `vite.config.ts`
- the app `module-federation.config.ts`
- `apps/shell/module-federation.config.ts`
- `apps/shell/src/remote-modules.d.ts`
- root scripts and workspace config if a new package is added

## API Service

The backend is mounted under `/api/v1`.

Common route groups:

- `/health`
- `/auth`
- `/catalog`
- `/orders`
- `/account`
- `/admin`

Backend conventions:

- Validate requests with Zod through `validateRequest`.
- Wrap async route handlers with `asyncHandler`.
- Return successful responses as `{ data: ... }`.
- Return errors through `HttpError` and the shared error handler.
- Use `requireAuth`, `attachOptionalAuth`, `requireCsrf`, and `requirePermission` for protected routes.
- Keep request size, content type, origin, CORS, cookie, and security header behavior in middleware.

## Environment Variables

The API service and browser client use these common variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Browser API client base URL. |
| `DATABASE_URL` | Drizzle/Postgres connection string. |
| `DIRECT_URL` | Direct database URL, defaults to `DATABASE_URL`. |
| `CORS_ORIGIN` | Allowed frontend origin for the API service. |
| `SESSION_SECRET` | API session secret. Must be set to a strong value in production. |
| `SESSION_COOKIE_NAME` | Session cookie name. Production should use a `__Host-` cookie name. |

Local defaults are for development only. Production must set real `DATABASE_URL`, `SESSION_SECRET`, and cookie settings.

## Development Guidelines

- Use shared packages rather than duplicating client, store, type, or UI logic inside apps.
- Keep browser code out of `services/api`, and keep backend-only modules out of browser packages.
- Add shared domain types to `packages/types`.
- Add shared HTTP behavior to `packages/api`.
- Add reusable visual primitives to `packages/ui`.
- Keep module federation shared dependencies singleton-safe.
- Preserve auth, CSRF, permission, and ownership checks when changing protected flows.
- Run `pnpm deadcode` after changing package exports, federation entries, dependencies, or app boundaries.

## Agent Guidance

Repository-level agent instructions live in `AGENTS.md`. `CLAUDE.md` is intentionally a symlink to `AGENTS.md`, matching the pattern used in sibling projects so all coding agents share one source of project guidance.
