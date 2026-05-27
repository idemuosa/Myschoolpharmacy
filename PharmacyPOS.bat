@echo off
title Josiah Pharmacy POS Launcher
echo Starting Josiah Pharmacy POS Desktop Environment...
cd /d "%~dp0"

:: Check for Docker to use the updated Postgres architecture
where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Docker detected. Starting Database and Backends (PostgreSQL Mode)...
    docker-compose up -d
) else (
    echo Docker not detected. Attempting to start local services...
    echo WARNING: PostgreSQL must be running locally if DATABASE_URL is not set.
    start /b cmd /c "cd backend && venv\Scripts\python.exe manage.py runserver 8000 --noreload"
    start /b cmd /c "cd node_backend && npm start"
)

:: Start the Electron app
cd pharmacy
npx electron .

echo.
echo Application closed.
exit
