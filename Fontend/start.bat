@echo off
echo.
echo ========================================
echo   TenderAI Frontend - Quick Start
echo ========================================
echo.

cd /d %~dp0

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Installing dependencies...
echo This may take 2-3 minutes...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Installation failed!
    echo Try: npm cache clean --force
    pause
    exit /b 1
)

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo   Dashboard will open at:
echo   http://localhost:3000
echo.
echo   Press Ctrl+C to stop server
echo ========================================
echo.
call npm run dev
pause