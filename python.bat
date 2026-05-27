@echo off
set VENV_PATH="%~dp0backend\venv\Scripts\python.exe"
if exist %VENV_PATH% (
    %VENV_PATH% %*
) else (
    echo Error: Virtual environment not found at %VENV_PATH%
    echo Please ensure the 'backend\venv' folder exists.
    pause
)
