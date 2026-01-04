#!/bin/bash
echo "Starting Watchdog..."
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Navigate to the project root (2 levels up)
cd "$SCRIPT_DIR/../.." || exit
node utils/watchdog.js
read -p "Press Enter to continue..."
