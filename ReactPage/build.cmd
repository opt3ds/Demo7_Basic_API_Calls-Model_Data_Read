@echo off
rem Sandbox-safe build: vite dev cannot run here (esbuild service spawn is
rem blocked by the sandbox with EPERM). esbuild CLI is a native process with
rem no child spawning, so it works. Output is served by static-server.js.
setlocal
cd /d "%~dp0"
set "ESB=%~dp0node_modules\@esbuild\win32-x64\esbuild.exe"
"%ESB%" src/main.tsx --bundle --format=iife --outfile=dist/main.bundle.js --jsx=automatic --target=es2020 --define:process.env.NODE_ENV='"development"' --define:import.meta.env.DEV=true --loader:.png=dataurl --log-level=warning
exit /b %errorlevel%
