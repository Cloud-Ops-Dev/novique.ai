#!/bin/bash

# Port Management Script
# Checks port registry and handles conflicts before starting dev servers
# Usage: ./scripts/check-port.sh [project-name]

set -e

PROJECT_NAME="${1:-novique.ai}"
PORT_REGISTRY="/home/clay/IDE/PORT_REGISTRY.md"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to extract port from registry for a project
get_port_from_registry() {
    local project="$1"

    # Look for the project in the registry and extract the port
    # Format: | **3000** | Next.js Dev | novique.ai | ...
    local port=$(grep -i "$project" "$PORT_REGISTRY" | grep -o '\*\*[0-9]\{4,5\}\*\*' | head -1 | tr -d '*')

    if [ -z "$port" ]; then
        echo ""
        return 1
    fi

    echo "$port"
    return 0
}

# Function to check what's using a port
check_port_usage() {
    local port="$1"
    lsof -i ":$port" -t 2>/dev/null || echo ""
}

# Function to get process details
get_process_info() {
    local pid="$1"
    ps -p "$pid" -o pid=,comm=,args= 2>/dev/null || echo ""
}

# Main logic
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Port Management for $PROJECT_NAME${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Get the assigned port from registry
echo -e "${YELLOW}→ Checking port registry...${NC}"
ASSIGNED_PORT=$(get_port_from_registry "$PROJECT_NAME")

if [ -z "$ASSIGNED_PORT" ]; then
    echo -e "${RED}✗ Error: Project '$PROJECT_NAME' not found in port registry${NC}"
    echo -e "${YELLOW}  Registry location: $PORT_REGISTRY${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found assigned port: $ASSIGNED_PORT${NC}"
echo ""

# Step 2: Check if port is in use
echo -e "${YELLOW}→ Checking if port $ASSIGNED_PORT is available...${NC}"
PIDS=$(check_port_usage "$ASSIGNED_PORT")

if [ -z "$PIDS" ]; then
    echo -e "${GREEN}✓ Port $ASSIGNED_PORT is available${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Ready to start on port $ASSIGNED_PORT${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
fi

# Step 3: Port is in use - show what's using it
echo -e "${RED}✗ Port $ASSIGNED_PORT is currently in use${NC}"
echo ""
echo -e "${YELLOW}Processes using port $ASSIGNED_PORT:${NC}"
echo ""

for pid in $PIDS; do
    info=$(get_process_info "$pid")
    if [ -n "$info" ]; then
        echo -e "${YELLOW}  PID $info${NC}"
    fi
done

echo ""

# Step 4: Ask user for permission to kill
read -p "$(echo -e ${YELLOW}Do you want to kill these processes? [y/N]: ${NC})" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted. Please free port $ASSIGNED_PORT manually or use a different port.${NC}"
    exit 1
fi

# Step 5: Kill the processes
echo ""
echo -e "${YELLOW}→ Killing processes...${NC}"

for pid in $PIDS; do
    if kill -9 "$pid" 2>/dev/null; then
        echo -e "${GREEN}✓ Killed process $pid${NC}"
    else
        echo -e "${RED}✗ Failed to kill process $pid${NC}"
    fi
done

# Step 6: Verify port is now free
sleep 1
PIDS_AFTER=$(check_port_usage "$ASSIGNED_PORT")

if [ -z "$PIDS_AFTER" ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Port $ASSIGNED_PORT is now available${NC}"
    echo -e "${GREEN}Ready to start $PROJECT_NAME${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Error: Port $ASSIGNED_PORT is still in use${NC}"
    echo -e "${YELLOW}  You may need to check for zombie processes${NC}"
    exit 1
fi
