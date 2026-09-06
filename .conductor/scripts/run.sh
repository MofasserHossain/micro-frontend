#!/usr/bin/env bash
set -euo pipefail

export CONDUCTOR_PERSIST_PORT_BASE="${CONDUCTOR_PERSIST_PORT_BASE:-1}"
# shellcheck disable=SC1091
source "$(dirname "$0")/env.sh"

"$(dirname "$0")/env.sh" print

compose_file="$(dirname "$0")/../docker-compose.yml"

if ! command -v docker >/dev/null 2>&1; then
  printf "Docker is required to run the workspace Postgres database.\n" >&2
  exit 1
fi

docker compose -f "$compose_file" up -d postgres

for attempt in {1..30}; do
  if docker compose -f "$compose_file" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    printf "Postgres did not become ready on port %s.\n" "$DB_PORT" >&2
    exit 1
  fi

  sleep 1
done

pnpm --filter @ecommerce-mf/api-server db:push

exec pnpm dev
