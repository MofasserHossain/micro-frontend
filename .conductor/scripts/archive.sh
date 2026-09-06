#!/usr/bin/env bash
set -euo pipefail

if command -v docker >/dev/null 2>&1; then
  # shellcheck disable=SC1091
  source "$(dirname "$0")/env.sh"
  docker compose -f "$(dirname "$0")/../docker-compose.yml" down --remove-orphans
fi

rm -f .conductor/.runtime.env
