# Ecommerce API Server

Basic Express API service for the ecommerce micro-frontend workspace.

## Scripts

```sh
pnpm dev:server
pnpm --filter @ecommerce-mf/api-server build
pnpm --filter @ecommerce-mf/api-server typecheck
pnpm --filter @ecommerce-mf/api-server db:push
```

When started through Conductor, the repository run script assigns the API to
`CONDUCTOR_PORT + 7`. For example, a workspace with `CONDUCTOR_PORT=55010`
serves the shell on `55010`, this API on `55017`, and Postgres on `55018`.

## Current Scope

- Express 5 with TypeScript
- Zod request validation
- cookie-based auth scaffold with `HttpOnly`, `SameSite=Lax`, `Secure` in production
- CSRF header check for authenticated mutations
- health, auth, catalog, order, and admin route skeletons
- Drizzle schema backed by workspace-local Docker Postgres

For production, the same Drizzle repositories can point at Supabase Postgres by setting `DATABASE_URL`.
