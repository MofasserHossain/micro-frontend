#!/usr/bin/env bash
set -euo pipefail

workspace_name="${CONDUCTOR_WORKSPACE_NAME:-$(basename "$PWD")}"
workspace_slug="$(printf "%s" "$workspace_name" \
  | tr "[:upper:]" "[:lower:]" \
  | sed -E "s/[^a-z0-9_-]+/-/g; s/^-+//; s/-+$//")"

if [ -z "$workspace_slug" ]; then
  workspace_slug="workspace"
fi

runtime_env=".conductor/.runtime.env"

if [ -z "${PORT_BASE:-}" ] && [ -f "$runtime_env" ]; then
  # shellcheck disable=SC1090
  source "$runtime_env"
fi

if [ -z "${PORT_BASE:-}" ] && [ -n "${CONDUCTOR_PORT:-}" ]; then
  port_base="$CONDUCTOR_PORT"
else
  port_base="${PORT_BASE:-55000}"
fi

export PORT_BASE="$port_base"
export SHELL_PORT="${SHELL_PORT:-$port_base}"
export HOME_PORT="${HOME_PORT:-$((port_base + 1))}"
export PRODUCT_PORT="${PRODUCT_PORT:-$((port_base + 2))}"
export CART_PORT="${CART_PORT:-$((port_base + 3))}"
export CHECKOUT_PORT="${CHECKOUT_PORT:-$((port_base + 4))}"
export ACCOUNT_PORT="${ACCOUNT_PORT:-$((port_base + 5))}"
export ADMIN_PORT="${ADMIN_PORT:-$((port_base + 6))}"
export API_PORT="${API_PORT:-$((port_base + 7))}"
export DB_PORT="${DB_PORT:-$((port_base + 8))}"
export POSTGRES_DB="${POSTGRES_DB:-ecommerce}"
export POSTGRES_USER="${POSTGRES_USER:-postgres}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
export PORT="${PORT:-$API_PORT}"
export CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:$SHELL_PORT}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:$API_PORT/api/v1}"
export DATABASE_URL="${DATABASE_URL:-postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$DB_PORT/$POSTGRES_DB}"
export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ecommerce_mf_${workspace_slug}}"

if [ "${CONDUCTOR_PERSIST_PORT_BASE:-0}" = "1" ]; then
  mkdir -p .conductor
  printf "PORT_BASE=%s\n" "$port_base" > "$runtime_env"
fi

if [ "${1:-}" = "print" ]; then
  printf "PORT_BASE=%s\n" "$PORT_BASE"
  printf "SHELL_PORT=%s\n" "$SHELL_PORT"
  printf "HOME_PORT=%s\n" "$HOME_PORT"
  printf "PRODUCT_PORT=%s\n" "$PRODUCT_PORT"
  printf "CART_PORT=%s\n" "$CART_PORT"
  printf "CHECKOUT_PORT=%s\n" "$CHECKOUT_PORT"
  printf "ACCOUNT_PORT=%s\n" "$ACCOUNT_PORT"
  printf "ADMIN_PORT=%s\n" "$ADMIN_PORT"
  printf "API_PORT=%s\n" "$API_PORT"
  printf "DB_PORT=%s\n" "$DB_PORT"
  printf "VITE_API_BASE_URL=%s\n" "$VITE_API_BASE_URL"
fi
