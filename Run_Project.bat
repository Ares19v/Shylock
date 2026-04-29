@echo off
chcp 65001 >nul
color 0F
cls

echo.
echo     [97m███████╗██╗  ██╗██╗   ██╗██╗      ██████╗  ██████╗██╗  ██╗[0m
echo     [97m██╔════╝██║  ██║╚██╗ ██╔╝██║     ██╔═══██╗██╔════╝██║ ██╔╝[0m
echo     [97m███████╗███████║ ╚████╔╝ ██║     ██║   ██║██║     █████╔╝ [0m
echo     [97m╚════██║██╔══██║  ╚██╔╝  ██║     ██║   ██║██║     ██╔═██╗ [0m
echo     [97m███████║██║  ██║   ██║   ███████╗╚██████╔╝╚██████╗██║  ██╗[0m
echo     [97m╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝[0m
echo.
echo     [90m  Market Sentiment Intelligence Platform[0m
echo.
echo  ══════════════════════════════════════════════════════════════
echo.

:: ─── Check backend venv ────────────────────────────────────────────────────
if not exist "backend\venv\Scripts\activate.bat" (
    color 0C
    echo  [ERROR] Backend virtual environment not found.
    echo  Run INSTALL.bat first.
    echo.
    pause
    exit /b 1
)

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

echo  [1/2] Launching Backend  ^(FastAPI — Port 8001^)...
start cmd /k "title Shylock ^| Backend & color 0A & cd backend & call venv\Scripts\activate.bat & python -m uvicorn main:app --reload --port 8001"

echo  [2/2] Launching Frontend ^(React   — Port 5173^)...
start cmd /k "title Shylock ^| Frontend & color 0B & cd frontend & npm run dev"

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
