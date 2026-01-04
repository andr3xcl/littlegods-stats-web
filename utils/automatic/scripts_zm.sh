#!/bin/bash
echo "Copying ZM scripts..."
# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SOURCE="$SCRIPT_DIR/../../zm"

# Define destination path
# Attempt to detect if running in a typical Linux environment or if user wants to set it manually
# Defaulting to standard Wine path structure or Native Linux Plutonium path if it exists
# Users can override this by setting PLUTONIUM_ZM_PATH env var

if [ -z "$PLUTONIUM_ZM_PATH" ]; then
    # Default path for Linux Plutonium (using Wine/Proton structure often found or native fit)
    # Common path: ~/.local/share/Plutonium/storage/t6/raw/scripts/zm
    # Or path relative to Wine prefix if we can guess it.
    
    # Let's try to guess a reasonable default or use the one from the user request context if applicable,
    # but since this is a generic script, we'll try standard locations.
    
    # User's specific path seen in context: /home/andresito/Games/dosdevices/c:/users/andresito/AppData/Local/Plutonium/storage/t6/raw/scriptdata
    # The .bat targets: %localappdata%\Plutonium\storage\t6\raw\scripts\zm
    
    # We will try to find the "Games" folder structure if it exists, otherwise default to a local share
    
    if [ -d "$HOME/Games/dosdevices/c:/users/$USER/AppData/Local/Plutonium/storage/t6/raw" ]; then
         DEST="$HOME/Games/dosdevices/c:/users/$USER/AppData/Local/Plutonium/storage/t6/raw/scripts/zm"
    elif [ -d "$HOME/.wine/drive_c/users/$USER/AppData/Local/Plutonium/storage/t6/raw" ]; then
         DEST="$HOME/.wine/drive_c/users/$USER/AppData/Local/Plutonium/storage/t6/raw/scripts/zm"
    else
         # Fallback to a placeholder or local dir if not found, prompting user to edit might be better but let's try to be safe
         echo "Could not auto-detect Plutonium storage directory."
         echo "Please set PLUTONIUM_ZM_PATH environment variable or edit this script."
         exit 1
    fi
else
    DEST="$PLUTONIUM_ZM_PATH"
fi

echo "Source: $SOURCE"
echo "Destination: $DEST"

if [ ! -d "$DEST" ]; then
    echo "Creating destination directory..."
    mkdir -p "$DEST"
fi

echo "Copying .gsc files..."
cp -v "$SOURCE"/*.gsc "$DEST"/

echo "Done!"
read -p "Press Enter to continue..."
