#!/bin/bash

# Development server starter with automatic port management
# This script checks the port registry and handles conflicts before starting Next.js

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="novique.ai"

# Run port check
"$SCRIPT_DIR/check-port.sh" "$PROJECT_NAME"

# If we get here, the port is available
# Start the dev server
cd "$SCRIPT_DIR/.."
exec npm run dev
