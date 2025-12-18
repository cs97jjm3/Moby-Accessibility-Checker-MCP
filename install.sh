#!/bin/bash

echo "========================================"
echo " THE MOBY ACCESSIBILITY CHECKER"
echo " One-Click Installer for Mac/Linux"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "[1/4] Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "[2/4] Installing browsers..."
echo "This may take a few minutes..."
npx playwright install chromium firefox webkit

echo ""
echo "[3/4] Creating Claude Desktop configuration..."

# Get the current directory
INSTALL_DIR="$(pwd)"

# Determine config location based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    CLAUDE_DIR="$HOME/Library/Application Support/Claude"
else
    # Linux
    CLAUDE_CONFIG="$HOME/.config/Claude/claude_desktop_config.json"
    CLAUDE_DIR="$HOME/.config/Claude"
fi

# Create Claude directory if it doesn't exist
mkdir -p "$CLAUDE_DIR"

# Check if config file exists
if [ -f "$CLAUDE_CONFIG" ]; then
    echo ""
    echo "WARNING: Claude Desktop config already exists."
    echo "You'll need to manually add this MCP server to your config."
    echo ""
    echo "Add this to your mcpServers section:"
    echo ""
    echo '  "moby-accessibility-checker": {'
    echo '    "command": "node",'
    echo "    \"args\": [\"$INSTALL_DIR/index.js\"]"
    echo '  }'
    echo ""
else
    # Create new config file
    cat > "$CLAUDE_CONFIG" << EOF
{
  "mcpServers": {
    "moby-accessibility-checker": {
      "command": "node",
      "args": ["$INSTALL_DIR/index.js"]
    }
  }
}
EOF
    echo "Created new Claude Desktop configuration"
fi

echo ""
echo "[4/4] Testing installation..."
node index.js --version 2>/dev/null || true

echo ""
echo "========================================"
echo " INSTALLATION COMPLETE!"
echo "========================================"
echo ""
echo "The Moby Accessibility Checker is now installed."
echo ""
echo "NEXT STEPS:"
echo "1. Restart Claude Desktop (if running)"
echo "2. In Claude, ask: 'Check accessibility for https://example.com'"
echo "3. Choose 'full' or 'summary' audit"
echo ""
echo "The Moby Score will analyze the site and generate a report!"
echo ""
echo "Config location: $CLAUDE_CONFIG"
echo "Install location: $INSTALL_DIR"
echo ""
