@echo off
echo ========================================
echo  THE MOBY ACCESSIBILITY CHECKER
echo  One-Click Installer for Windows
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing browsers...
echo This may take a few minutes...
call npx playwright install chromium firefox webkit

echo.
echo [3/4] Creating Claude Desktop configuration...

REM Get the current directory
set "INSTALL_DIR=%CD%"

REM Get user's AppData directory
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

REM Create Claude directory if it doesn't exist
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

REM Check if config file exists
if exist "%CLAUDE_CONFIG%" (
    echo.
    echo WARNING: Claude Desktop config already exists.
    echo You'll need to manually add this MCP server to your config.
    echo.
    echo Add this to your mcpServers section:
    echo.
    echo   "moby-accessibility-checker": {
    echo     "command": "node",
    echo     "args": ["%INSTALL_DIR:\=\\%\\index.js"]
    echo   }
    echo.
) else (
    REM Create new config file
    (
        echo {
        echo   "mcpServers": {
        echo     "moby-accessibility-checker": {
        echo       "command": "node",
        echo       "args": ["%INSTALL_DIR:\=\\%\\index.js"]
        echo     }
        echo   }
        echo }
    ) > "%CLAUDE_CONFIG%"
    echo Created new Claude Desktop configuration
)

echo.
echo [4/4] Testing installation...
call node index.js --version 2>nul

echo.
echo ========================================
echo  INSTALLATION COMPLETE!
echo ========================================
echo.
echo The Moby Accessibility Checker is now installed.
echo.
echo NEXT STEPS:
echo 1. Restart Claude Desktop (if running)
echo 2. In Claude, ask: "Check accessibility for https://example.com"
echo 3. Choose "full" or "summary" audit
echo.
echo The Moby Score will analyze the site and generate a report!
echo.
echo Config location: %CLAUDE_CONFIG%
echo Install location: %INSTALL_DIR%
echo.
pause
