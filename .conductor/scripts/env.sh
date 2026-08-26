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
fi
