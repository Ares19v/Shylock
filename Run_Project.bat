@echo off
color 0A
echo ==================================================
echo         STARTING SHYLOCK DASHBOARD
echo ==================================================
echo.

echo Starting FastAPI Backend (Port 8001)...
cd backend
start cmd /k "title Shylock Backend & call venv\Scripts\activate.bat & python -m uvicorn main:app --reload --port 8001"
cd ..

echo Starting React Frontend (Port 5173)...
cd frontend
start cmd /k "title Shylock Frontend & npm run dev"
cd ..

echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:5173

echo.
echo ==================================================
echo Both servers are now running in separate windows.
echo Close those windows to stop the servers.
echo ==================================================
pause
