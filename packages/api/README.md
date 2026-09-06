# Ecommerce MFE API Client

This package is the browser-side REST client used by the micro frontends. It is not the backend
service layer and it must not import backend repositories, DB clients, or Express code.

## MFE Pattern

- Each app keeps TanStack Query usage near its screens and workflows.
- This package owns shared HTTP details: `VITE_API_BASE_URL`, JSON parsing, credentials, CSRF header
  attachment, and consistent API errors.
- Shared domain types live in `@ecommerce-mf/types`.
- The backend remains a separate REST server under `services/api`.

In Conductor, `VITE_API_BASE_URL` is injected as:

```sh
http://localhost:$API_PORT/api/v1
```

When `VITE_API_BASE_URL` is not set, the client keeps the local demo fallback so each MFE can still
run standalone during UI work.
