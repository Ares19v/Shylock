@echo off
title Shylock — AI Financial Forensic Intelligence
color 09

echo.
echo  ███████╗██╗  ██╗██╗   ██╗██╗      ██████╗  ██████╗██╗  ██╗
echo  ██╔════╝██║  ██║╚██╗ ██╔╝██║     ██╔═══██╗██╔════╝██║ ██╔╝
echo  ███████╗███████║ ╚████╔╝ ██║     ██║   ██║██║     █████╔╝ 
echo  ╚════██║██╔══██║  ╚██╔╝  ██║     ██║   ██║██║     ██╔═██╗ 
echo  ███████║██║  ██║   ██║   ███████╗╚██████╔╝╚██████╗██║  ██╗
echo  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝
echo.
echo  AI Financial Forensic Intelligence Platform
echo  ══════════════════════════════════════════════════════════════
echo.

:: ─── Check node_modules ────────────────────────────────────────────────────
if not exist "frontend\node_modules" (
    color 0C
    echo  [ERROR] Frontend node_modules not found.
    echo  Run INSTALL.bat first.
    echo.
    pause
    exit /b 1
)

:: ─── Check .env ────────────────────────────────────────────────────────────
if not exist "backend\.env" (
    color 0E
    echo  [WARN] backend\.env not found. Copying from .env.example...
    copy "backend\.env.example" "backend\.env" >nul
    echo  Edit backend\.env to add your API keys for full functionality.
    echo.
)

set "VENV_ACT="
if exist "backend\venv\Scripts\activate.bat" set "VENV_ACT=call venv\Scripts\activate.bat & "

echo  [1/2] Launching Backend  ^(FastAPI — Port 8001^)...
start "Shylock | Backend" cmd /k "color 0A & cd backend & %VENV_ACT%python -m uvicorn main:app --reload --port 8001"

echo  [2/2] Launching Frontend ^(React   — Port 5173^)...
start "Shylock | Frontend" cmd /k "color 0B & cd frontend & npm run dev"

echo.
echo  Waiting for servers to initialize...
timeout /t 6 /nobreak >nul

echo  Opening dashboard in browser...
start http://localhost:5173

echo.
echo  ══════════════════════════════════════════════════════════════
echo   SHYLOCK is running. Close the server windows to stop.
echo  ══════════════════════════════════════════════════════════════
echo.
pause
