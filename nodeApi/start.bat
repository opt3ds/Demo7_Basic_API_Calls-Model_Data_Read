@echo off
chcp 65001 >nul
echo Starting SQLite API server...
echo.
echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
  echo Error: Node.js not found. Please install Node.js first.
  pause
  exit /b 1
)

echo.
echo Checking if dependencies are installed...
if not exist node_modules (
  echo Installing dependencies...
  npm install
  if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo.
echo Starting server (default port 18084)...
node server.js

pause
