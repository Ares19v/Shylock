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
echo  ══════════════════════════════════════════════════════════════
echo   SHYLOCK INSTALLATION
echo  ══════════════════════════════════════════════════════════════
echo.

:: ─── Python check ─────────────────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Python not found. Install Python 3.10+ from https://python.org
    pause & exit /b 1
)

:: ─── Node check ────────────────────────────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Node.js not found. Install Node 20+ from https://nodejs.org
    pause & exit /b 1
)

echo  [1/3] Creating Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo  [2/3] Installing backend dependencies...
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
cd ..

:: ─── Copy .env if not present ─────────────────────────────────────────────
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo.
    echo  [NOTICE] backend\.env created from .env.example
    echo  Add your API keys to backend\.env before running the project.
)

echo.
echo  [3/3] Installing frontend dependencies...
cd frontend
call npm install --silent
cd ..

echo.
echo  ══════════════════════════════════════════════════════════════
echo   INSTALLATION COMPLETE
echo   Run Run_Project.bat to start Shylock.
echo  ══════════════════════════════════════════════════════════════
echo.
pause
