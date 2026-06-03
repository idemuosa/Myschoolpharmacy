@echo off
echo ===================================================
echo   Josiah Pharmacy POS - Windows Build Tool
echo   Engine Mismatch ^& Space Recovery Mode
echo ===================================================
echo.
cd pharmacy

echo Step 0: Cleaning environment...
powershell -Command "if (Test-Path 'node_modules') { Remove-Item -Recurse -Force 'node_modules' -ErrorAction SilentlyContinue }"
powershell -Command "if (Test-Path 'package-lock.json') { Remove-Item -Force 'package-lock.json' -ErrorAction SilentlyContinue }"

echo.
echo Step 1: Clearing NPM cache to free space...
call npm cache clean --force

echo.
echo Step 2: Setting build flags (Ignoring Engine Checks)...
call npm config set engine-strict false

echo.
echo Step 3: Installing dependencies (Forced Mode)...
call npm install --engine-strict=false --legacy-peer-deps || goto :error

echo.
echo Step 4: Building Production Bundle...
call npm run build || goto :error

echo.
echo Step 5: Packaging Windows App (.exe)...
call npm run windows:build || goto :error

echo.
echo ===================================================
echo   SUCCESS: BUILD COMPLETE!
echo   Installer is in: pharmacy\dist_electron
echo ===================================================
pause
exit /b

:error
echo.
echo ===================================================
echo   ERROR: BUILD FAILED!
echo   1. Try updating to Node.js v22 (LTS)
echo   2. Check your disk space (min 2GB required).
echo ===================================================
pause
exit /b
