#!/bin/bash
echo "Starting Project..."
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Navigate to the project root (2 levels up)
cd "$SCRIPT_DIR/../.." || exit

# Function to run in a new terminal window
run_in_terminal() {
    local title="$1"
    local command="$2"
    
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="$title" -- bash -c "$command; read -p 'Press Enter to close...'"
    elif command -v konsole &> /dev/null; then
        konsole --noclose -e bash -c "echo -ne '\033]30;${title}\007'; $command"
    elif command -v xterm &> /dev/null; then
        xterm -title "$title" -e bash -c "$command; read -p 'Press Enter to close...'"
    else
        echo "No supported terminal emulator found (gnome-terminal, konsole, xterm). Running '$title' in background..."
        $command &
    fi
}

# Start Web Server
run_in_terminal "Web Server" "npm run dev"

# Start Watchdog
run_in_terminal "Watchdog" "node utils/watchdog.js"

echo "Services started."
