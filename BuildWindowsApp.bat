@echo off
title Josiah Pharmacy POS - Windows Build Tool
echo ========================================
echo   Josiah Pharmacy POS Build Utility
echo ========================================
echo.

cd /d "%~dp0\pharmacy"

echo [1/3] Installing frontend dependencies...
call npm install --legacy-peer-deps

echo.
echo [2/3] Building frontend assets...
call npm run build

echo.
echo [3/3] Packaging Windows Application...
echo This will create a setup installer and a portable version.
call npx electron-builder --win

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo Check the 'pharmacy\dist_electron' folder for your .exe files.
echo.
pause
