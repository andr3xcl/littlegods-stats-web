#!/bin/bash
echo "Starting Web Server..."
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Navigate to the project root (2 levels up)
cd "$SCRIPT_DIR/../.." || exit
npm run dev
read -p "Press Enter to continue..."
