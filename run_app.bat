@echo off
title Pharmacy POS - ALL SERVICES
echo --------------------------------------------------
echo FIXING 'PYTHON' ERROR AND STARTING APP...
echo --------------------------------------------------

:: Set the path to our virtual environment python
SET VENV_PYTHON="%~dp0backend\venv\Scripts\python.exe"

:: Kill existing processes to avoid port conflicts
echo Stopping existing services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul

echo Starting Django Backend...
start "Django API" /min cmd /c "cd backend && %VENV_PYTHON% manage.py runserver 0.0.0.0:8000"

echo Starting Node Backend...
start "Node WebSocket" /min cmd /c "cd node_backend && npm start"

echo Starting React Frontend...
start "Vite Frontend" /min cmd /c "cd pharmacy && npm run dev -- --port 3000 --host"

echo --------------------------------------------------
echo ALL SERVICES ARE STARTING
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo --------------------------------------------------
echo Please use 'py' or '.\venv\Scripts\python.exe' for manual commands.
timeout /t 5
start http://localhost:3000
pause
