#!/usr/bin/env bash
set -euo pipefail

export CONDUCTOR_PERSIST_PORT_BASE="${CONDUCTOR_PERSIST_PORT_BASE:-1}"
# shellcheck disable=SC1091
source "$(dirname "$0")/env.sh"

"$(dirname "$0")/env.sh" print

exec pnpm dev
