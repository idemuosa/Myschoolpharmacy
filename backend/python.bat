@echo off
set LOCAL_VENV="%~dp0venv\Scripts\python.exe"
if exist %LOCAL_VENV% (
    %LOCAL_VENV% %*
) else (
    echo Error: Virtual environment not found in 'backend\venv'
    pause
)
